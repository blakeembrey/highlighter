var hljs = require('highlight.js')

var SEPARATOR = '\n'

var CHUNK_REGEXP = /^\-{3} [^\-]+ \-{4}$|^\*{3} [^\*]+ \*{4}$|^@@ [^@]+ @@$/
var HEADER_REGEXP = /^Index: |^[\+\-\*]{3}|^[\*=]{5,}$/
var DIFF_REGEXP = /\.(?:diff|patch)$/i

var PATCH_TYPES = {
  '+': 'addition',
  '-': 'deletion',
  '!': 'change'
}

/**
 * Export the module.
 */
module.exports = highlighter

/**
 * Create a highlighter function instance.
 *
 * @param  {Object}   [opts]
 * @return {Function}
 */
function highlighter (opts) {
  return function (code, lang) {
    return highlight(code, lang, opts)
  }
}

/**
 * Check whether language is supported.
 *
 * @param  {String}  lang
 * @return {Boolean}
 */
function supported (lang) {
  return !!hljs.getLanguage(lang)
}

/**
 * Syntax highlighting in the format Marked supports.
 *
 * @param  {String} code
 * @param  {String} lang
 * @return {String}
 */
function highlight (code, lang) {
  if (!lang) {
    return code
  }

  var isDiff = DIFF_REGEXP.test(lang)

  // Remove the diff suffix. E.g. "javascript.diff".
  lang = lang.replace(DIFF_REGEXP, '')

  // Ignore unknown languages.
  if (!isDiff && !supported(lang)) {
    return code
  }

  return isDiff ? diff(code, lang) : hljs.highlight(lang, code).value
}

/**
 * Add diff syntax highlighting to code.
 *
 * @param  {String} code
 * @param  {String} lang
 * @return {String}
 */
function diff (code, lang) {
  var sections = []

  code.split(/\r?\n/g).forEach(function (line) {
    var type

    if (CHUNK_REGEXP.test(line)) {
      type = 'chunk'
    } else if (HEADER_REGEXP.test(line)) {
      type = 'header'
    } else {
      type = PATCH_TYPES[line[0]] || 'null'
      line = line.replace(/^[\+\-! ]/, '')
    }

    // Merge data with the previous section where possible.
    var previous = sections[sections.length - 1]

    if (!previous || previous.type !== type) {
      sections.push({
        type: type,
        lines: [line]
      })

      return
    }

    previous.lines.push(line)
  })

  return highlightSections(sections, lang)
    .map(function (section) {
      var type = section.type
      var value = section.lines.join(SEPARATOR)

      return '<span class="diff-' + type + '">' + value + '</span>'
    })
    .join(SEPARATOR)
}

/**
 * Add syntax highlighting to all sections.
 *
 * @param  {Array}  sections
 * @param  {String} lang
 * @return {Array}
 */
function highlightSections (sections, lang) {
  if (!supported(lang)) {
    return sections
  }

  // Keep track of the most recent stacks.
  var additionStack
  var deletionStack

  sections
    .forEach(function (section) {
      var type = section.type

      // Reset the stacks for metadata types.
      if (type === 'header' || type === 'chunk') {
        additionStack = deletionStack = null

        return
      }

      var value = section.lines.join(SEPARATOR)
      var stack = type === 'deletion' ? deletionStack : additionStack
      var highlight = hljs.highlight(lang, value, false, stack)

      // Set the top of each stack, depending on context.
      if (type === 'addition') {
        additionStack = highlight.top
      } else if (type === 'deletion') {
        deletionStack = highlight.top
      } else {
        additionStack = deletionStack = highlight.top
      }

      section.lines = highlight.value.split(SEPARATOR)
    })

  return sections
}
