/* global it describe */
'use strict';

var cheerio = require('cheerio');
var hexoUtil = require('hexo-util');
require('chai').should();

describe('Hexo Flickr Tag Plugin Util', function() {
  var tagUtil = require('../flickrTagUtil');

  describe('tagUtil.convertAttr', function() {
    it('should return object with id', function() {
      tagUtil.convertAttr('class1 class2 class3 4140209251 m'.split(' ')).should.be.an('object').have.property('id').match(/\d{5,}/);
      tagUtil.convertAttr('4140209251 m'.split(' ')).should.be.an('object').have.property('id').match(/\d{5,}/);
      tagUtil.convertAttr(['4140209251']).should.be.an('object').have.property('id').match(/\d{5,}/);
      tagUtil.convertAttr('class1 4140209251 m'.split(' ')).should.be.an('object').have.property('id').match(/\d{5,}/);
    });
  });

  describe('tagUtil.imgFormat', function() {
    var jsonData = JSON.parse('{"photo":{"id": "9528576237", "secret": "b87fc8f98b", "server": "5445", "farm": 6, "dateuploaded": "1376748177", "isfavorite": 0, "license": 0, "safety_level": 0, "rotation": 0, "originalsecret": "2bf761518c", "originalformat": "jpg", "owner": { "nsid": "8891490@N04", "username": "visioncan", "realname": "", "location": "", "iconserver": "2891", "iconfarm": 3, "path_alias": "visioncan" }, "title": { "_content": "九份-阿妹茶樓" }}}');

    it('should return image attr object', function() {
      var tag = tagUtil.convertAttr('class1 class2 9528576237 m'.split(' '));
      tagUtil.imgFormat(tag, jsonData).should.be.an('object').have.property('src');
      tagUtil.imgFormat(tag, jsonData).should.be.an('object').have.property('class');
      tagUtil.imgFormat(tag, jsonData).should.be.an('object').have.property('width');
    });

    it('return correct image size', function() {
      var tag = tagUtil.convertAttr('class1 class2 9528576237 m'.split(' '));
      tagUtil.imgFormat(tag, jsonData).should.be.an('object').have.property('src').equal('https://farm6.staticflickr.com/5445/9528576237_b87fc8f98b_m.jpg');
      tagUtil.imgFormat(tag, jsonData).should.be.an('object').have.property('class').equal('class1 class2');
      tagUtil.imgFormat(tag, jsonData).should.be.an('object').have.property('width').equal(240);
    });

    it('return original image with html tag', function() {
      var tag = tagUtil.convertAttr('9528576237 o'.split(' '));
      var $ = cheerio.load(hexoUtil.htmlTag('img', tagUtil.imgFormat(tag, jsonData)));
      $('img').attr('src').should.eql('https://farm6.staticflickr.com/5445/9528576237_2bf761518c_o.jpg');
    });
  });
});
