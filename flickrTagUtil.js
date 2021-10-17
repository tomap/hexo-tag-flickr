/* eslint-disable linebreak-style */
'use strict';

const rPhotoId = /\d{5,}/;
const rPhotoSize = /^([sqtmnwzcbhkfo-]|3k|4k|5k|6k)$/;

const cleanProtocol = function(src) {
  return src.replace('https:', '');
};

const flickrTagUtil = {
  convertAttr: function(args, defaultSize, useSrcset) {
    const attrs = {
      classes: [],
      id: '',
      size: defaultSize,
      useSrcset: useSrcset
    };

    let i = 0;

    for (i = 0; i < args.length; i++) {
      const item = args[i];

      if (rPhotoId.test(item)) {
        attrs.id = item;
        break;
      } else {
        attrs.classes.push(item);
      }
    }

    args = args.slice(i + 1);

    if (args.length) {
      if (rPhotoSize.test(args[0])) {
        attrs.size = args.shift();
      }
      // TODO: with link
    }
    return attrs;
  },

  imgFormat: function(tag, jsonData) {

    const imgAttr = {};
    imgAttr.photoId = tag.id;
    imgAttr.src = cleanProtocol(jsonData.selectedSize.source);
    imgAttr.width = jsonData.selectedSize.width;
    if (tag.useSrcset) {
      imgAttr.srcset = jsonData.sizeList.map(e => cleanProtocol(e.source) + ' ' + e.width + 'w').join(', ');
    }
    imgAttr.class = tag.classes.join(' ');

    return imgAttr;
  },

  // get image size
  getImage: function(flickrJson, photo_size) {

    const sizeTable = {
      's': 'Square',
      'q': 'Large Square',
      't': 'Thumbnail',
      'm': 'Small',
      'n': 'Small 320',
      'w': 'Small 400',
      '-': 'Medium',
      'z': 'Medium 640',
      'c': 'Medium 800',
      'b': 'Large',
      'h': 'Large 1600',
      'k': 'Large 2048',
      '3k': 'Extra Large 3072',
      '4k': 'Extra Large 4096',
      'f': 'VR 4K',
      '5k': 'Extra Large 5120',
      '6k': 'Extra Large 6144',
      'o': 'Original'
    };
    const returnValue = {};
    returnValue.sizeList = [];
    if (flickrJson && flickrJson.sizes.size) {
      // this code assumes that the sizes provided by flickr API are in ascending order
      for (let i = 0; i < flickrJson.sizes.size.length; i++) {
        returnValue.sizeList.push(flickrJson.sizes.size[i]);
        returnValue.selectedSize = flickrJson.sizes.size[i];
        if (flickrJson.sizes.size[i].label === sizeTable[photo_size]) {
          break;
        }
      }
    }

    return returnValue;
  },
  toBase58: function(num) {
    if (typeof num !== 'number') num = parseInt(num, 10);
    let enc = '';
    const alpha = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    let div = num;
    let mod;
    while (num >= 58) {
      div = num / 58;
      mod = num - (58 * Math.floor(div));
      enc = '' + alpha.substr(mod, 1) + enc;
      num = Math.floor(div);
    }
    return div ? '' + alpha.substr(div, 1) + enc : enc;
  }
};

module.exports = flickrTagUtil;
