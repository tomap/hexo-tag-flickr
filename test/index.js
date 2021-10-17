/* global it describe */
'use strict';

const cheerio = require('cheerio');
const hexoUtil = require('hexo-util');
require('chai').should();

describe('Hexo Flickr Tag Plugin Util', () => {
  const tagUtil = require('../flickrTagUtil');

  describe('tagUtil.convertAttr', () => {
    it('should return object with id', () => {
      tagUtil.convertAttr('class1 class2 class3 4140209251 m'.split(' ')).should.be.an('object').have.property('id').match(/\d{5,}/);
      tagUtil.convertAttr('4140209251 m'.split(' ')).should.be.an('object').have.property('id').match(/\d{5,}/);
      tagUtil.convertAttr(['4140209251']).should.be.an('object').have.property('id').match(/\d{5,}/);
      tagUtil.convertAttr('class1 4140209251 m'.split(' ')).should.be.an('object').have.property('id').match(/\d{5,}/);
    });
  });

  describe('tagUtil.imgFormat', () => {
    const jsonData = JSON.parse('{"selectedSize":{"label":"Square","width":75,"height":75,"source":"https://live.staticflickr.com/65535/50435880733_3b6d5f6a4b_s.jpg","url":"https://www.flickr.com/photos/tomapp/50435880733/sizes/sq/","media":"photo"}}');

    it('should return image attr object', () => {
      const tag = tagUtil.convertAttr('class1 class2 50435880733 m'.split(' '), 's');
      tagUtil.imgFormat(tag, jsonData).should.be.an('object').have.property('src');
      tagUtil.imgFormat(tag, jsonData).should.be.an('object').have.property('class');
      tagUtil.imgFormat(tag, jsonData).should.be.an('object').have.property('width');
    });

    it('return correct image size', () => {
      const tag = tagUtil.convertAttr('class1 class2 50435880733 m'.split(' '), 's');
      tagUtil.imgFormat(tag, jsonData).should.be.an('object').have.property('src').equal('//live.staticflickr.com/65535/50435880733_3b6d5f6a4b_s.jpg');
      tagUtil.imgFormat(tag, jsonData).should.be.an('object').have.property('class').equal('class1 class2');
      tagUtil.imgFormat(tag, jsonData).should.be.an('object').have.property('width').equal(75);
    });

    it('return original image with html tag', () => {
      const tag = tagUtil.convertAttr('9528576237 s'.split(' '));
      const $ = cheerio.load(hexoUtil.htmlTag('img', tagUtil.imgFormat(tag, jsonData)));
      $('img').attr('src').should.eql('//live.staticflickr.com/65535/50435880733_3b6d5f6a4b_s.jpg');
    });
  });
});
