## Introduction

This is a [Hexo](https://hexo.io) tag plugin which allows you to embed [Flickr](https://flickr.com) photo on your blog posts.

## Features

* Embed your pictures in all available sizes, from 75px to 6144px
* Support **srcset** HTML attribute. See https://flaviocopes.com/html-responsive-images-srcset/
* Link to your image on flickr
* Reference images using **live.staticflicrk.com** domain
* Support caching calls to flickr API

## Installation

Run the following command in the root directory of hexo:

```
npm i hexo-tag-flickr --save
```

**Note: this is a fork from the original hexo-tag-flickr. Not published yet. PR not done either**
**To use it, you must include it in your package.json like this:**

```
  "hexo-tag-flickr": "github:tomap/hexo-tag-flickr",
```

Then add this plugin and Flickr API key in your `_config.yml`.

```
flickr:
  # Flickr API key
  api_key: <Your API key>

  # default size (if none specified in the tag)
  default_size: -
  # see below for the list of supported sizes

  # Use srcset attribute to allow browser to download only the most relevant image size
  use_srcset: true

  # insert the image inside a link to the source image on flickr to comply with flickr TOS
  linkto_source: true

  # Enable Cache file (default is empty. Specify a file name to enable caching)
  cache_file_path: 
  # defaults to 24h to comply with flickr TOS
  cache_expires: 86400000
```
Get your [Flickr API Key here.](https://www.flickr.com/services/api/keys/)

## Usage

```
{% flickr [class1,class2,classN] photo_id [size] %}
```

Example:

```
{% flickr 32865582372 %}
```

Will output the HTML:

```
<a href="https://flic.kr/p/S5dGBW/sizes/l" target="_blank" rel="noopener noreferrer">
  <img src="https://live.staticflickr.com/505/32865582372_504939cc58_b.jpg" width="1024"
  srcset="https://live.staticflickr.com/505/32865582372_504939cc58_s.jpg 75w,
    https://live.staticflickr.com/505/32865582372_504939cc58_q.jpg 150w,
    https://live.staticflickr.com/505/32865582372_504939cc58_t.jpg 100w,
    https://live.staticflickr.com/505/32865582372_504939cc58_m.jpg 240w,
    https://live.staticflickr.com/505/32865582372_504939cc58_n.jpg 320w,
    https://live.staticflickr.com/505/32865582372_504939cc58_w.jpg 400w,
    https://live.staticflickr.com/505/32865582372_504939cc58.jpg 500w,
    https://live.staticflickr.com/505/32865582372_504939cc58_z.jpg 640w,
    https://live.staticflickr.com/505/32865582372_504939cc58_c.jpg 800w,
    https://live.staticflickr.com/505/32865582372_504939cc58_b.jpg 1024w">
</a>
```

If you disable srcset (**use_srcset: false**) and links (**linkto_source: false**)

```
{% flickr photo 9528576237 z %}

```

Will output the HTML:

```
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

## Available sizes:

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
* `h` large, 1600 on longest side ; photo owner can restrict
* `k` large, 2048 on longest side ; photo owner can restrict
* `3` extra large, 3072 on longest side ; photo owner can restrict ; might only be available to PRO accounts
* `4k` extra large, 4096 on longest side ; photo owner can restrict ; might only be available to PRO accounts
* `f` extra large, 4096 on longest side ; photo owner can restrict ; only exists for 2:1 aspect ratio photos
* `5k` extra large, 5120 on longest side ; photo owner can restrict ; might only be available to PRO accounts
* `6k` extra large, 6144 on longest side ; photo owner can restrict ; might only be available to PRO accounts
* `o` original image, either a jpg, gif or png, depending on source format

Learn more about [size suffixes](https://www.flickr.com/services/api/misc.urls.html) defined by Flickr.

## Contribution

Run ```npm i && npm test``` to install dependencies & test the plugin (with Mocha tests)
