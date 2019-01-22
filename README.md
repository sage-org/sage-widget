# sage-widget
[![Build Status](https://travis-ci.org/sage-org/sage-widget.svg?branch=master)](https://travis-ci.org/sage-org/sage-widget)
[![npm version](https://badge.fury.io/js/sage-widget.svg)](https://badge.fury.io/js/sage-widget)

A simple Mithril widget to evaluate SPARQL queries using a Sage server

# Requirements

All following library must be loaded into the DOM beforehand.
* [Bootstrap v4](https://getbootstrap.com/ and all its dependencies
* [Font Awesome](https://fontawesome.com/how-to-use/on-the-web/setup/using-package-managers)

# Installation

```
npm install sage-widget --save
```

# Usage

First, add the following `<div>` tag where you want to add the widget.
You can set the `url` attribute to initialize the widget using an online Sage server.

```html
<div id="sage-widget" url="http://my-sage-server.com"></div>
```

Next, import `sage-widget` files in your website

**CSS import**
```html
<link rel="stylesheet" href="node_modules/sage-widget/dist/main.css">
```

**Javascript import**
```html
<script src="node_modules/sage-client/dist/sage-client.bundle.js"></script>
<script src="node_modules/sage-widget/dist/sage-widget.bundle.js"></script>
```
