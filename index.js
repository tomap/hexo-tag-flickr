/* eslint-disable linebreak-style */
/* global hexo */
/* eslint prefer-promise-reject-errors: 0*/
'use strict';

const https = require('https');
const Promise = require('bluebird');
const hexoUtil = require('hexo-util');
const tagUtil = require('./flickrTagUtil');

const APIKey = hexo.config.flickr.api_key || false;
const DefaultSize = hexo.config.flickr.default_size || '-'; // default size is medium
// use hexo-fs
const fs = require('hexo-fs');

let cacheJson = [];

// option
const cacheFilePath = hexo.config.flickr.cache_file_path || false;
let cachePeriod = hexo.config.flickr.cache_expires || false;
const enabledCache = !(!cacheFilePath && !cachePeriod);
if (!cachePeriod) cachePeriod = Number(cachePeriod);

// load cache file
if (enabledCache && fs.existsSync(cacheFilePath)) {
  cacheJson = fs.readFileSync(cacheFilePath);
  cacheJson = JSON.parse(cacheJson);
}

// get cache flickr photos json
function getFlickrCacheJson(photoId) {
  if (!enabledCache) return null;
  const d = new Date();
  for (let i = 0; i < cacheJson.length; i++) {
    if (cacheJson[i].fl.id === photoId) {
      if (cacheJson[i].expires > d.getTime()) {
        return cacheJson[i].fl;
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
    if (cacheJson[i].fl.id === photo_id) {
      cacheJson[i].fl.img = image;
      cacheJson[i].expires = expiresTime;
      isMatch = true;
    }
  }
  if (!isMatch)cacheJson.push({'fl': {'id': photo_id, 'img': image}, 'expires': expiresTime });
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

  const tag = tagUtil.convertAttr(tagArgs, DefaultSize);

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
    return hexoUtil.htmlTag('img', imgAttr_internal);
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
