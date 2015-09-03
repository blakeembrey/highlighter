/* global describe, it */
var expect = require('chai').expect
var highlighter = require('./')

describe('highlighter', function () {
  describe('no options', function () {
    var highlight = highlighter()

    describe('highlight', function () {
      var snippet = 'var foo = "bar";'

      it('should return code when no language is set', function () {
        expect(highlight(snippet)).to.equal(snippet)
      })

      it('should catch invalid highlight.js languages', function () {
        expect(highlight(snippet, 'fakelang')).to.equal(snippet)
      })

      it('should do syntax highlighting', function () {
        expect(highlight(snippet, 'javascript')).to.equal(
          '<span class="hljs-keyword">var</span> ' +
          'foo = <span class="hljs-string">"bar"</span>;'
        )
      })
    })

    describe('diff', function () {
      it('should support diff file suffixes', function () {
        var str = [
          ' var str = "test";',
          '-var foo = "bar";',
          '+var foo = 42;'
        ].join('\n')

        expect(highlight(str, 'js.diff')).to.equal([
          '<span class="diff-null"><span class="hljs-keyword">var</span> ' +
            'str = <span class="hljs-string">"test"</span>;',
          '</span><span class="diff-deletion"><span class="hljs-keyword">var</span> ' +
            'foo = <span class="hljs-string">"bar"</span>;',
          '</span><span class="diff-addition"><span class="hljs-keyword">var</span> ' +
            'foo = <span class="hljs-number">42</span>;</span>'
        ].join('\n'))
      })

      it('should support syntax highlighting over splits', function () {
        var str = [
          ' {',
          '   "name": "example-blog",',
          '   "scripts": {',
          '+    "build": "node build.js"',
          '   }',
          ' }'
        ].join('\n')

        expect(highlight(str, 'json.diff')).to.equal([
          '<span class="diff-null">{',
          '  "<span class="hljs-attribute">name</span>": ' +
            '<span class="hljs-value"><span class="hljs-string">' +
            '"example-blog"</span></span>,',
          '  "<span class="hljs-attribute">scripts</span>": ' +
            '<span class="hljs-value">{',
          '</span></span><span class="diff-addition"><span class="hljs-value">    ' +
            '"<span class="hljs-attribute">build</span>": ' +
            '<span class="hljs-value"><span class="hljs-string">' +
            '"node build.js"</span>',
          '</span></span></span><span class="diff-null"><span class="hljs-value">' +
            '<span class="hljs-value">  </span>}',
          '</span>}</span>'
        ].join('\n'))
      })

      it('should match diff headers', function () {
        var str = [
          'Index: example.js',
          '===================================================================',
          '--- example.js    (revision 199)',
          '+++ example.js    (revision 200)'
        ].join('\n')

        expect(highlight(str, '.diff')).to.equal([
          '<span class="diff-header">Index: example.js',
          '===================================================================',
          '--- example.js    (revision 199)',
          '+++ example.js    (revision 200)</span>'
        ].join('\n'))
      })

      it('should match diff chunks', function () {
        var str = '@@ -1,8 +1,7 @@'

        expect(highlight(str, '.diff')).to.equal(
          '<span class="diff-chunk">@@ -1,8 +1,7 @@</span>'
        )
      })

      it('should match between over chunks', function () {
        var str = [
          'var foo = "bar";',
          '@@ -1,8 +1,7 @@',
          'var str = "test";'
        ].join('\n')

        expect(highlight(str, 'js.diff')).to.equal([
          '<span class="diff-null"><span class="hljs-keyword">var</span> ' +
            'foo = <span class="hljs-string">"bar"</span>;',
          '</span><span class="diff-chunk">@@ -1,8 +1,7 @@</span><span class="diff-null">',
          '<span class="hljs-keyword">var</span> ' +
            'str = <span class="hljs-string">"test"</span>;</span>'
        ].join('\n'))
      })

      it('should match between chunks on the same line', function () {
        var str = [
          'var foo = "bar";',
          '@@ -1,8 +1,7 @@ var str = "test";'
        ].join('\n')

        expect(highlight(str, 'js.diff')).to.equal([
          '<span class="diff-null"><span class="hljs-keyword">var</span> ' +
            'foo = <span class="hljs-string">"bar"</span>;',
          '</span><span class="diff-chunk">@@ -1,8 +1,7 @@ var str = "test";</span>'
        ].join('\n'))
      })
    })
  })
})
