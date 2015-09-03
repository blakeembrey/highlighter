var hljs = require('highlight.js')

// [chunk, header, start, other]
var DIFF_REGEXP = /(^\-{3} [^\-]+ \-{4}$|^\*{3} [^\*]+ \*{4}$|^@@ [^@]+ @@.*$)|(^Index\: |^[\+\-\*]{3}|^[\*\=]{5,}$)|(^[\+\-\! ])|([\s\S])/mgi

var IS_DIFF_REGEXP = /\.(?:diff|patch)$/i

var PATCH_TYPES = {
  '+': 'addition',
  '-': 'deletion',
  '!': 'change',
  ' ': 'null'
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

  var isDiff = IS_DIFF_REGEXP.test(lang)

  // Remove the diff suffix. E.g. "javascript.diff".
  lang = lang.replace(IS_DIFF_REGEXP, '')

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
  var result

  while ((result = DIFF_REGEXP.exec(code))) {
    var value = result[0]
    var type

    // Merge data with the previous section where possible.
    var previous = sections[sections.length - 1]

    if (result[1]) {
      type = 'chunk'
    } else if (result[2]) {
      type = 'header'
    } else if (result[3]) {
      type = PATCH_TYPES[result[3]]
      value = ''
    } else {
      type = previous ? previous.type : 'null'

      // Chunks do not repeat after finished.
      if (type === 'chunk') {
        type = 'null'
      }
    }

    if (!previous || previous.type !== type) {
      sections.push({
        type: type,
        value: value
      })

      continue
    }

    previous.value += value
  }

  return highlightSections(sections, lang)
    .map(function (section) {
      var type = section.type
      var value = section.value

      return '<span class="diff-' + type + '">' + value + '</span>'
    })
    .join('')
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

      var value = section.value
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

      section.value = highlight.value
    })

  return sections
}
