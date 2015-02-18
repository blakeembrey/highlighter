# Highlighter

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

**Highlighter** provides a simple way to add syntax highlighting to all files by using [highlight.js](https://github.com/isagalaev/highlight.js). Comes with built-in syntax highlighting for diffs and patches.

## Installation

```sh
npm install highlighter --save
```

## Usage

```js
var highlight = require('highlighter')();
```

### Basic Usage

**Highlighter** can be used programmatically, by passing in the source string and the source language.

```js
highlight('var foo = "bar";', 'javascript'); //=> '<span class="hljs-keyword">var</span> foo = <span class="hljs-string">"bar"</span>'
```

### Markdown Parser

**Highlighter** returns a function that supports most markdown parsers already.

```js
var marked = require('marked');

marked.setOptions({
  highlight: highlight
});
```

### Diff Support

**Highlighter** comes with complete diff support by appending `.diff` or `.patch` to the language name. This will wrap each section in a span with the section type class (`diff-addition`, `diff-deletion`, `diff-header`, `diff-chunk` or `diff-null`).

```js
highlight('+var foo = "bar";', 'js.diff'); //=> '<span class="diff-addition"><span class="hljs-keyword">var</span> foo = <span class="hljs-string">"bar"</span>;</span>'
```

This also works within Markdown files. The primary drawback of this approach causes the parent `<code>` element to have the class appended with `.diff` or `.patch`, which may cause your specific CSS rules to fail. For example, `<code class="lang-javascript.diff">`.

~~~markdown
```javascript.diff
+var foo = "bar";
```
~~~

## License

MIT

[npm-image]: https://img.shields.io/npm/v/highlighter.svg?style=flat
[npm-url]: https://npmjs.org/package/highlighter
[downloads-image]: https://img.shields.io/npm/dm/highlighter.svg?style=flat
[downloads-url]: https://npmjs.org/package/highlighter
[travis-image]: https://img.shields.io/travis/blakeembrey/highlighter.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/highlighter
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/highlighter.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/highlighter?branch=master
