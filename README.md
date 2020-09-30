## Introduction

This is a [Hexo](https://hexo.io) tag plugin which allows you to embed [Flickr](https://flickr.com) photo on your blog posts.


## Installation

Run the following command in the root directory of hexo:

```
npm i hexo-tag-flickr --save
```

Then add this plugin and Flickr API key in your `_config.yml`.

```
flickr:
  # Flickr API key
  api_key: <Your API key>

  # default size (if not specified)
  default_size: -

  # Enable Cache file
  cache_file_path: hexo-tag-flickr-cache.json
  cache_expires: 2592000000
```
Get your [Flickr API Key here.](https://www.flickr.com/services/api/keys/)

## Usage

```
{% flickr [class1,class2,classN] photo_id [size] %}
```

Example:

```
{% flickr 11909477254 %}
{% flickr photo 9528576237 z %}
```

Will output the HTML:

```
<img src="https://live.staticflickr.com/3731/11909477254_1992af78e4.jpg" width="500">
<img src="https://live.staticflickr.com/5445/9528576237_b87fc8f98b_z.jpg" width="640" class="photo">
```

### Gallery post

in Front-matter:

```
photos: 
- flickr 9528576237 m
- flickr 15905712665 z
---
```

Will convert to image url for gallery post:

```
photos: [ 
  'https://live.staticflickr.com/5445/9528576237_b87fc8f98b_m.jpg',
  'https://live.staticflickr.com/7498/15905712665_73705e7986_z.jpg'
]
```

## Available size:

* `s` small square 75x75
* `q` large square 150x150
* `t` thumbnail, 100 on longest side
* `m` small, 240 on longest side
* `n` small, 320 on longest side
* `w` small, 400 on longest side
* `-` medium, 500 on longest side
* `z` medium 640, 640 on longest side
* `c` medium 800, 800 on longest side
* `b` large, 1024 on longest side
* `h` large, 1600 on longest side
* `k` large, 2048 on longest side
* `o` original image, either a jpg, gif or png, depending on source format

Learn more about [size suffixes](https://www.flickr.com/services/api/misc.urls.html) defined by Flickr.

## Note:
This plugin is without Flickr authentication, it show only your public photos.

## Contribution

Run ```npm i && npm test``` to install dependencies & test the plugin (with Mocha tests)
