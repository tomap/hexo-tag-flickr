/* global hexo */
/* eslint prefer-promise-reject-errors: 0*/
'use strict';

const https = require('https');
const Promise = require('bluebird');
const hexoUtil = require('hexo-util');
const tagUtil = require('./flickrTagUtil');
const APIKey = hexo.config.flickr_api_key || false;

// use hexo-fs
const fs = require('hexo-fs');
let cacheJson = [];

// option
const cacheFilePath = hexo.config.flickr_cache_file_path || false;
let cachePeriod = hexo.config.flickr_cache_expires || false;
const enabledCache = !(!cacheFilePath && !cachePeriod);
if (!cachePeriod)cachePeriod = Number(cachePeriod);

// load cache file
if (enabledCache && fs.existsSync(cacheFilePath)) {
  cacheJson = fs.readFileSync(cacheFilePath);
  cacheJson = JSON.parse(cacheJson);
}

// return used element
function filterElement(flJson) {
  const returnJson = {'photo': {}};

  returnJson.photo.title = flJson.photo.title;
  returnJson.photo.description = flJson.photo.description;
  returnJson.photo.farm = flJson.photo.farm;
  returnJson.photo.id = flJson.photo.id;
  returnJson.photo.media = flJson.photo.media;
  returnJson.photo.secret = flJson.photo.secret;
  returnJson.photo.server = flJson.photo.server;
  returnJson.photo.urls = flJson.photo.urls;

  return returnJson;
}

// push flickr photos
function pushFlickrJson(flickrJson) {
  if (!enabledCache) return;
  let isMatch = false;
  const filterJson = filterElement(flickrJson);

  for (let i = 0; i < cacheJson.length; i++) {
    if (cacheJson[i].fl.photo.id === flickrJson.photo.id) {
      cacheJson[i].fl = filterJson;
      isMatch = true;
    }
  }
  if (!isMatch)cacheJson.push({'fl': filterJson, 'expires': 0 });
}

// get cache flickr photos json
function getFlickrCacheJson(photoId) {
  if (!enabledCache) return null;
  const d = new Date();
  for (let i = 0; i < cacheJson.length; i++) {
    if (cacheJson[i].fl.photo.id === photoId) {
      if (cacheJson[i].expires > d.getTime()) {
        return cacheJson[i].fl;
      }
      break;
    }
  }
  return null;
}

// get image size
function getImageSize(flickrJson, photo_size) {
  const sizeInfo = {'width': 0, 'height': 0};

  const sizeTable = {
    's': 'Square',
    'q': 'Large Square',
    't': 'Thumbnail',
    'm': 'Small',
    'n': 'Small 320',
    '-': 'Medium',
    'z': 'Medium 640',
    'c': 'Medium 800',
    'b': 'Large',
    'o': 'Original'
  };

  if (flickrJson && flickrJson.sizes.size) {
    for (let i = 0; i < flickrJson.sizes.size.length; i++) {
      if (flickrJson.sizes.size[i].label === sizeTable[photo_size]) {
        sizeInfo.width = flickrJson.sizes.size[i].width;
        sizeInfo.height = flickrJson.sizes.size[i].height;
      }
    }
  }

  return sizeInfo;
}

// push flickr photos
function pushImageSizeAndExpress_flickrJson(imageSize, photo_id) {
  if (!enabledCache) return null;
  const d = new Date();
  const expiresTime = d.getTime() + cachePeriod;

  for (let i = 0; i < cacheJson.length; i++) {
    if (cacheJson[i].fl.photo.id === photo_id) {
      cacheJson[i].fl.photo.imgSize = imageSize;
      cacheJson[i].expires = expiresTime;
    }
  }
}

//
function addTagHeight(imgAttr, imgSize) {
  const returnImgAttr = imgAttr;
  returnImgAttr.width = imgSize.width;
  // returnImgAttr['data-height'] = imgSize.height;
  return returnImgAttr;
}

/**
 * promise Flickr API request
 * @param  {Array} tagArgs Tag args ex: ['15905712665', 'z']
 * @resolve {Object} image attrs
 */
const promiseRequest = function(tagArgs) {
  if (!APIKey) {
    throw new Error('flickr_api_key configuration is required');
  }

  const tag = tagUtil.convertAttr(tagArgs);

  return new Promise((resolve, reject) => {

    const flJson = getFlickrCacheJson(tag.id);

    if (!flJson) {
      // console.log("[api access getInfo]photoId= " + tag.id);
      const url = 'https://api.flickr.com/services/rest/?method=flickr.photos.getInfo'
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

            pushFlickrJson(json);
            resolve(tagUtil.imgFormat(tag, json));

          } else {
            return reject('Flickr Tag Error: ' + tag.id + ' ' + json.message);
          }
        });

      }).on('error', e => {
        return reject('Fetch Flickr API error: ' + e);
      });

    } else {
      // console.log("[cache getInfo]photoId= " + tag.id);
      return resolve(tagUtil.imgFormat(tag, flJson));
    }

  });

};

/**
 * promise Flickr API request
 * @param  {Array} tagArgs Tag args ex: ['15905712665', 'z']
 * @resolve {Object} image attrs
 */
const promiseRequest_imageSize = function(tagArgs, returnImgAttr) {
  if (!APIKey) {
    throw new Error('flickr_api_key configuration is required');
  }

  const tag = tagUtil.convertAttr(tagArgs);

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

            const imgSize = getImageSize(json, tag.size);
            pushImageSizeAndExpress_flickrJson(imgSize, tag.id);

            resolve(addTagHeight(returnImgAttr, imgSize));

          } else {
            return reject('Flickr Tag Error: ' + tag.id + ' ' + json.message);
          }
        });

      }).on('error', e => {
        return reject('Fetch Flickr API error: ' + e);
      });

    } else {
      return resolve(addTagHeight(tagUtil.imgFormat(tag, flJson), flJson.photo.imgSize));
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
hexo.extend.tag.register('flickr', (args, content) => {
  return promiseRequest(args).then(imgAttr => {
    return promiseRequest_imageSize(args, imgAttr).then(imgAttr_internal => {

      return hexoUtil.htmlTag('img', imgAttr_internal);
    }, err => {
      hexo.log.error(err);
    });
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
