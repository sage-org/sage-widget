# sage-widget
[![Build Status](https://travis-ci.org/sage-org/sage-widget.svg?branch=master)](https://travis-ci.org/sage-org/sage-widget)
[![npm version](https://badge.fury.io/js/sage-widget.svg)](https://badge.fury.io/js/sage-widget)

A simple React widget to evaluate SPARQL queries using a Sage server

# Installation

```
npm install sage-widget --save
```

# Usage

First, add the following `<div>` tag where you want to add the widget
```html
<div id="sage-widget"></div>
```

Next, import `sage-widget` files in your website

**CSS import**
```html
<link rel="stylesheet" href="node_modules/sage-widget/dist/main.css">
```

**Javascript import**
```html
<script src="node_modules/sage-widget/dist/sage-widget.bundle.js"></script>
```
