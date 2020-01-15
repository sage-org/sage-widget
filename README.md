# sage-widget
[![Build Status](https://travis-ci.org/sage-org/sage-widget.svg?branch=master)](https://travis-ci.org/sage-org/sage-widget)
[![npm version](https://badge.fury.io/js/sage-widget.svg)](https://badge.fury.io/js/sage-widget)

A simple Mithril widget to evaluate SPARQL queries using a [SaGe server](http://sage.univ-nantes.fr/).

# Installation

```
npm install sage-widget --save
```

# Requirements

All following library must be loaded into the DOM beforehand.
* [Bootstrap](https://getbootstrap.com/) v4.4.1 or higher
* [JQuery](https://jquery.com/) v3.4.1 or higher
* [FontAwesome](https://fontawesome.com/) v5.12.0 or higher
* [popper.js](https://popper.js.org/) v1.16.0 or higher
* [sage-client](https://github.com/sage-org/sage-client) v2.0.1 or higher

The [`package.json`](https://github.com/sage-org/sage-widget/tree/master/example/package.json) file in the [`example`](https://github.com/sage-org/sage-widget/tree/master/example) folder contains the appropriate dependencies declaration.

# Getting started

The [`example`](https://github.com/sage-org/sage-widget/tree/master/example) folder contains a full example of the `sage-widget` used in a website.
To use the widget, you simply need to declare the widget with the `<sage-widget>` HTML tag.
It **requires* the *urls* attribute, which is a comma-separated list of all SaGe server that the widget will be able to query. At startup, the widget will automatically fetch the VoIDs descriptors of the servers and configure itself based on these descriptors.

```html
<div id="sage-widget" urls="http://sage.univ-nantes.fr/"></div>
```
