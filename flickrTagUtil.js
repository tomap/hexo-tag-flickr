/* eslint-disable linebreak-style */
'use strict';

const rPhotoId = /\d{5,}/;
const rPhotoSize = /^[sqtmnwzcbhko-]$/;

const flickrTagUtil = {
  convertAttr: function(args, defaultSize) {
    const attrs = {
      classes: [],
      id: '',
      size: defaultSize,
      isWithLink: false
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

    imgAttr.src = jsonData.source;
    imgAttr.width = jsonData.width;

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
      'o': 'Original'
    };
    let returnValue = {};
    if (flickrJson && flickrJson.sizes.size) {
      for (let i = 0; i < flickrJson.sizes.size.length; i++) {
        returnValue = flickrJson.sizes.size[i];
        if (flickrJson.sizes.size[i].label === sizeTable[photo_size]) {
          break;
        }
      }
    }
    return returnValue;
  }
};

module.exports = flickrTagUtil;
