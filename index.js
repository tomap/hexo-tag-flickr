/* global hexo */
/* eslint prefer-promise-reject-errors: 0*/
'use strict';

const https = require('https');
const Promise = require('bluebird');
const hexoUtil = require('hexo-util');
const tagUtil = require('./flickrTagUtil');

const APIKey = hexo.config.flickr.api_key || false;
const DefaultSize = hexo.config.flickr.default_size || '-'; // default size is medium
const LinkToSource = hexo.config.flickr.linkto_source || true;

// Enable srcset
const UseSrcset = hexo.config.flickr.use_srcset || true;

// use hexo-fs
const fs = require('hexo-fs');

let cacheJson = [];

// option
const cacheFilePath = hexo.config.flickr.cache_file_path || false;

// default cache period is 24h, to comply with flickr TOS
let cachePeriod = hexo.config.flickr.cache_expires || '86400000';
if (cachePeriod) cachePeriod = Number(cachePeriod);

const enabledCache = cacheFilePath && cachePeriod;

// load cache file
if (cacheFilePath && fs.existsSync(cacheFilePath)) {
  cacheJson = fs.readFileSync(cacheFilePath);
  cacheJson = JSON.parse(cacheJson);
}

// get cache flickr photos json
function getFlickrCacheJson(photoId) {
  if (!enabledCache) return null;
  const d = new Date();
  for (let i = 0; i < cacheJson.length; i++) {
    if (cacheJson[i].fl2.id === photoId) {
      if (cacheJson[i].expires > d.getTime()) {
        return cacheJson[i].fl2;
      }
      break;
    }
  }
  return null;
}

// push flickr photos
function pushImageSizeAndExpress_flickrJson(image, photo_id) {
  if (!enabledCache) return null;
  const d = new Date();
  const expiresTime = d.getTime() + cachePeriod;
  let isMatch = false;

  for (let i = 0; i < cacheJson.length; i++) {
    if (cacheJson[i].fl2.id === photo_id) {
      cacheJson[i].fl2.img = image;
      cacheJson[i].expires = expiresTime;
      isMatch = true;
    }
  }
  if (!isMatch)cacheJson.push({'fl2': {'id': photo_id, 'img': image}, 'expires': expiresTime });
}

/**
 * promise Flickr API request
 * @param  {Array} tagArgs Tag args ex: ['15905712665', 'z']
 * @resolve {Object} image attrs
 */
const promiseRequest = function(tagArgs) {
  if (!APIKey) {
    throw new Error('flickr.api_key configuration is required');
  }

  const tag = tagUtil.convertAttr(tagArgs, DefaultSize, UseSrcset);

  return new Promise((resolve, reject) => {

    const flJson = getFlickrCacheJson(tag.id);

    if (!flJson || !flJson.photo.imgSize) {
      const url = 'https://api.flickr.com/services/rest/?method=flickr.photos.getSizes'
          + '&api_key=' + APIKey
          + '&photo_id=' + tag.id
          + '&format=json'
          + '&nojsoncallback=1';

      https.get(url, res => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          const json = JSON.parse(data);

          if (json.stat === 'ok') {

            const img = tagUtil.getImage(json, tag.size);

            pushImageSizeAndExpress_flickrJson(img, tag.id);

            resolve(tagUtil.imgFormat(tag, img));
          } else {
            return reject('Flickr Tag Error: ' + tag.id + ' ' + json.message);
          }
        });

      }).on('error', e => {
        return reject('Fetch Flickr API error: ' + e);
      });

    } else {
      return resolve(tagUtil.imgFormat(tag, flJson));
    }
  });
};

/**
 * Flickr tag
 *
 * Syntax:
 * ```
 * {% flickr [class1,class2,classN] photo_id [size] %}
 * ```
 */
hexo.extend.tag.register('flickr', (args, _) => {
  return promiseRequest(args).then(imgAttr_internal => {
    const photoId = imgAttr_internal.photoId;
    delete imgAttr_internal.photoId;
    const img = hexoUtil.htmlTag('img', imgAttr_internal);
    if (LinkToSource) {
      return '<a href=\'//flic.kr/p/' + tagUtil.toBase58(photoId) + '/sizes/l\' target=\'_blank\' rel=\'noopener noreferrer\'>' + img + '</a>';
    }
    return img;
  }, err => {
    hexo.log.error(err);
  });
}, {async: true});

// write cache file
hexo.extend.filter.register('after_generate', () => {
  if (enabledCache) {
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheJson));
  }
});

hexo.extend.filter.register('after_clean', () => {
  if (enabledCache) {
    return fs.exists(cacheFilePath).then(exist => {
      if (!exist) return;

      return fs.unlink(cacheFilePath).then(() => {
        hexo.log.debug('Deleted flickr cache.');
      });
    });
  }
});

/**
 * For gallery post
 *
 * Syntax:
 * ```
 * photos:
 * - flickr photo_id [size]
 * - flickr photo_id [size]
 * ```
 */
hexo.extend.filter.register('pre', data => {
  if (!data.photos) return data;

  return Promise.map(data.photos, photo => {
    const photoTag = photo.split(' ');
    if (photoTag[0] !== 'flickr') {
      return photo;
    }

    const tagArgs = photoTag.slice(1);

    return promiseRequest(tagArgs).then(imgAttr => {
      return imgAttr.src;
    }, err => {
      hexo.log.error(err);
    });
  }).then(results => {
    data.photos = results;
    return data;
  });
});
