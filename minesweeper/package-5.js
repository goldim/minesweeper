(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2008-2010 Sebastian Werner, http://sebastian-werner.net
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
       * Andreas Ecker (ecker)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Sizzle CSS Selector Engine - v2.3.0
  
       Homepage:
         http://sizzlejs.com/
  
       Documentation:
         https://github.com/jquery/sizzle/wiki/Sizzle-Documentation
  
       Discussion:
         https://groups.google.com/forum/#!forum/sizzlejs
  
       Code:
         https://github.com/jquery/sizzle
  
       Copyright:
         (c) 2009, 2013 jQuery Foundation and other contributors
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
     ----------------------------------------------------------------------
  
      Copyright 2013 jQuery Foundation and other contributors
      http://jquery.com/
  
      Permission is hereby granted, free of charge, to any person obtaining
      a copy of this software and associated documentation files (the
      "Software"), to deal in the Software without restriction, including
      without limitation the rights to use, copy, modify, merge, publish,
      distribute, sublicense, and/or sell copies of the Software, and to
      permit persons to whom the Software is furnished to do so, subject to
      the following conditions:
  
      The above copyright notice and this permission notice shall be
      included in all copies or substantial portions of the Software.
  
      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
      EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
      NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
      LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
      OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
      WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  
  
     ----------------------------------------------------------------------
  
      Version:
         v2.3.0
         commit  8d56cba3212f6722a0b47330143d329d7297277e
  
  ************************************************************************ */

  /**
   * The selector engine supports virtually all CSS 3 Selectors  – this even
   * includes some parts that are infrequently implemented such as escaped
   * selectors (<code>.foo\\+bar</code>), Unicode selectors, and results returned
   * in document order. There are a few notable exceptions to the CSS 3 selector
   * support:
   *
   * * <code>:root</code>
   * * <code>:target</code>
   * * <code>:nth-last-child</code>
   * * <code>:nth-of-type</code>
   * * <code>:nth-last-of-type</code>
   * * <code>:first-of-type</code>
   * * <code>:last-of-type</code>
   * * <code>:only-of-type</code>
   * * <code>:lang()</code>
   *
   * In addition to the CSS 3 Selectors the engine supports the following
   * additional selectors or conventions.
   *
   * *Changes*
   *
   * * <code>:not(a.b)</code>: Supports non-simple selectors in <code>:not()</code> (most browsers only support <code>:not(a)</code>, for example).
   * * <code>:not(div > p)</code>: Supports full selectors in <code>:not()</code>.
   * * <code>:not(div, p)</code>: Supports multiple selectors in <code>:not()</code>.
   * * <code>[NAME=VALUE]</code>: Doesn't require quotes around the specified value in an attribute selector.
   *
   * *Additions*
   *
   * * <code>[NAME!=VALUE]</code>: Finds all elements whose <code>NAME</code> attribute doesn't match the specified value. Is equivalent to doing <code>:not([NAME=VALUE])</code>.
   * * <code>:contains(TEXT)</code>: Finds all elements whose textual context contains the word <code>TEXT</code> (case sensitive).
   * * <code>:header</code>: Finds all elements that are a header element (h1, h2, h3, h4, h5, h6).
   * * <code>:parent</code>: Finds all elements that contains another element.
   *
   * *Positional Selector Additions*
   *
   * * <code>:first</code>/</code>:last</code>: Finds the first or last matching element on the page. (e.g. <code>div:first</code> would find the first div on the page, in document order)
   * * <code>:even</code>/<code>:odd</code>: Finds every other element on the page (counting begins at 0, so <code>:even</code> would match the first element).
   * * <code>:eq</code>/<code>:nth</code>: Finds the Nth element on the page (e.g. <code>:eq(5)</code> finds the 6th element on the page).
   * * <code>:lt</code>/<code>:gt</code>: Finds all elements at positions less than or greater than the specified positions.
   *
   * *Form Selector Additions*
   *
   * * <code>:input</code>: Finds all input elements (includes textareas, selects, and buttons).
   * * <code>:text</code>, <code>:checkbox</code>, <code>:file</code>, <code>:password</code>, <code>:submit</code>, <code>:image</code>, <code>:reset</code>, <code>:button</code>: Finds the input element with the specified input type (<code>:button</code> also finds button elements).
   *
   * Based on Sizzle by John Resig, see:
   *
   * * http://sizzlejs.com/
   *
   * For further usage details also have a look at the wiki page at:
   *
   * * https://github.com/jquery/sizzle/wiki/Sizzle-Home
   */
  qx.Bootstrap.define("qx.bom.Selector", {
    statics: {
      /**
       * Queries the document for the given selector. Supports all CSS3 selectors
       * plus some extensions as mentioned in the class description.
       *
       * @signature function(selector, context)
       * @param selector {String} Valid selector (CSS3 + extensions)
       * @param context {Element} Context element (result elements must be children of this element)
       * @return {Array} Matching elements
       */
      query: null,

      /**
       * Returns an reduced array which only contains the elements from the given
       * array which matches the given selector
       *
       * @signature function(selector, set)
       * @param selector {String} Selector to filter given set
       * @param set {Array} List to filter according to given selector
       * @return {Array} New array containing matching elements
       */
      matches: null
    }
  });
  /**
   * Below is the original Sizzle code. Snapshot date is mentioned in the head of
   * this file.
   * @lint ignoreUnused(j, rnot, rendsWithNot)
   */

  /*!
   * Sizzle CSS Selector Engine v2.3.0
   * https://sizzlejs.com/
   *
   * Copyright jQuery Foundation and other contributors
   * Released under the MIT license
   * http://jquery.org/license
   *
   * Date: 2016-01-04
   */

  (function (window) {
    var i,
        support,
        Expr,
        getText,
        isXML,
        tokenize,
        compile,
        select,
        outermostContext,
        sortInput,
        hasDuplicate,
        // Local document vars
    setDocument,
        document,
        docElem,
        documentIsHTML,
        rbuggyQSA,
        rbuggyMatches,
        matches,
        contains,
        // Instance-specific data
    expando = "sizzle" + 1 * new Date(),
        preferredDoc = window.document,
        dirruns = 0,
        done = 0,
        classCache = createCache(),
        tokenCache = createCache(),
        compilerCache = createCache(),
        sortOrder = function sortOrder(a, b) {
      if (a === b) {
        hasDuplicate = true;
      }

      return 0;
    },
        // Instance methods
    hasOwn = {}.hasOwnProperty,
        arr = [],
        pop = arr.pop,
        push_native = arr.push,
        push = arr.push,
        slice = arr.slice,
        // Use a stripped-down indexOf as it's faster than native
    // https://jsperf.com/thor-indexof-vs-for/5
    indexOf = function indexOf(list, elem) {
      var i = 0,
          len = list.length;

      for (; i < len; i++) {
        if (list[i] === elem) {
          return i;
        }
      }

      return -1;
    },
        booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
        // Regular expressions
    // http://www.w3.org/TR/css3-selectors/#whitespace
    whitespace = "[\\x20\\t\\r\\n\\f]",
        // http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
    identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",
        // Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
    attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace + // Operator (capture 2)
    "*([*^$|!~]?=)" + whitespace + // "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
    "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace + "*\\]",
        pseudos = ":(" + identifier + ")(?:\\((" + // To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
    // 1. quoted (capture 3; capture 4 or capture 5)
    "('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" + // 2. simple (capture 6)
    "((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" + // 3. anything else (capture 2)
    ".*" + ")\\)|)",
        // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
    rwhitespace = new RegExp(whitespace + "+", "g"),
        rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),
        rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
        rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),
        rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g"),
        rpseudo = new RegExp(pseudos),
        ridentifier = new RegExp("^" + identifier + "$"),
        matchExpr = {
      ID: new RegExp("^#(" + identifier + ")"),
      CLASS: new RegExp("^\\.(" + identifier + ")"),
      TAG: new RegExp("^(" + identifier + "|[*])"),
      ATTR: new RegExp("^" + attributes),
      PSEUDO: new RegExp("^" + pseudos),
      CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
      bool: new RegExp("^(?:" + booleans + ")$", "i"),
      // For use in libraries implementing .is()
      // We use this for POS matching in `select`
      needsContext: new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
    },
        rinputs = /^(?:input|select|textarea|button)$/i,
        rheader = /^h\d$/i,
        rnative = /^[^{]+\{\s*\[native \w/,
        // Easily-parseable/retrievable ID or TAG or CLASS selectors
    rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
        rsibling = /[+~]/,
        // CSS escapes
    // http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
    runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),
        funescape = function funescape(_, escaped, escapedWhitespace) {
      var high = "0x" + escaped - 0x10000; // NaN means non-codepoint
      // Support: Firefox<24
      // Workaround erroneous numeric interpretation of +"0x"

      /* eslint-disable-next-line no-self-compare */

      return high !== high || escapedWhitespace ? escaped : high < 0 ? // BMP codepoint
      String.fromCharCode(high + 0x10000) : // Supplemental Plane codepoint (surrogate pair)
      String.fromCharCode(high >> 10 | 0xd800, high & 0x3ff | 0xdc00);
    },
        // CSS string/identifier serialization
    // https://drafts.csswg.org/cssom/#common-serializing-idioms

    /* eslint-disable-next-line no-control-regex */
    rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g,
        fcssescape = function fcssescape(ch, asCodePoint) {
      if (asCodePoint) {
        // U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
        if (ch === "\0") {
          return "\uFFFD";
        } // Control characters and (dependent upon position) numbers get escaped as code points


        return ch.slice(0, -1) + "\\" + ch.charCodeAt(ch.length - 1).toString(16) + " ";
      } // Other potentially-special ASCII characters get backslash-escaped


      return "\\" + ch;
    },
        // Used for iframes
    // See setDocument()
    // Removing the function wrapper causes a "Permission Denied"
    // error in IE
    unloadHandler = function unloadHandler() {
      setDocument();
    },
        disabledAncestor = addCombinator(function (elem) {
      return elem.disabled === true;
    }, {
      dir: "parentNode",
      next: "legend"
    }); // Optimize for push.apply( _, NodeList )


    try {
      push.apply(arr = slice.call(preferredDoc.childNodes), preferredDoc.childNodes); // Support: Android<4.0
      // Detect silently failing push.apply

      arr[preferredDoc.childNodes.length].nodeType;
    } catch (e) {
      push = {
        apply: arr.length ? // Leverage slice if possible
        function (target, els) {
          push_native.apply(target, slice.call(els));
        } : // Support: IE<9
        // Otherwise append directly
        function (target, els) {
          var j = target.length,
              i = 0; // Can't trust NodeList.length

          while (target[j++] = els[i++]) {}

          target.length = j - 1;
        }
      };
    }

    function Sizzle(selector, context, results, seed) {
      var m,
          i,
          elem,
          nid,
          match,
          groups,
          newSelector,
          newContext = context && context.ownerDocument,
          // nodeType defaults to 9, since context defaults to document
      nodeType = context ? context.nodeType : 9;
      results = results || []; // Return early from calls with invalid selector or context

      if (typeof selector !== "string" || !selector || nodeType !== 1 && nodeType !== 9 && nodeType !== 11) {
        return results;
      } // Try to shortcut find operations (as opposed to filters) in HTML documents


      if (!seed) {
        if ((context ? context.ownerDocument || context : preferredDoc) !== document) {
          setDocument(context);
        }

        context = context || document;

        if (documentIsHTML) {
          // If the selector is sufficiently simple, try using a "get*By*" DOM method
          // (excepting DocumentFragment context, where the methods don't exist)
          if (nodeType !== 11 && (match = rquickExpr.exec(selector))) {
            // ID selector
            if (m = match[1]) {
              // Document context
              if (nodeType === 9) {
                if (elem = context.getElementById(m)) {
                  // Support: IE, Opera, Webkit
                  // TODO: identify versions
                  // getElementById can match elements by name instead of ID
                  if (elem.id === m) {
                    results.push(elem);
                    return results;
                  }
                } else {
                  return results;
                } // Element context

              } else {
                // Support: IE, Opera, Webkit
                // TODO: identify versions
                // getElementById can match elements by name instead of ID
                if (newContext && (elem = newContext.getElementById(m)) && contains(context, elem) && elem.id === m) {
                  results.push(elem);
                  return results;
                }
              } // Type selector

            } else if (match[2]) {
              push.apply(results, context.getElementsByTagName(selector));
              return results; // Class selector
            } else if ((m = match[3]) && support.getElementsByClassName && context.getElementsByClassName) {
              push.apply(results, context.getElementsByClassName(m));
              return results;
            }
          } // Take advantage of querySelectorAll


          if (support.qsa && !compilerCache[selector + " "] && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
            if (nodeType !== 1) {
              newContext = context;
              newSelector = selector; // qSA looks outside Element context, which is not what we want
              // Thanks to Andrew Dupont for this workaround technique
              // Support: IE <=8
              // Exclude object elements
            } else if (context.nodeName.toLowerCase() !== "object") {
              // Capture the context ID, setting it first if necessary
              if (nid = context.getAttribute("id")) {
                nid = nid.replace(rcssescape, fcssescape);
              } else {
                context.setAttribute("id", nid = expando);
              } // Prefix every selector in the list


              groups = tokenize(selector);
              i = groups.length;

              while (i--) {
                groups[i] = "#" + nid + " " + toSelector(groups[i]);
              }

              newSelector = groups.join(","); // Expand context for sibling selectors

              newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
            }

            if (newSelector) {
              try {
                push.apply(results, newContext.querySelectorAll(newSelector));
                return results;
              } catch (qsaError) {} finally {
                if (nid === expando) {
                  context.removeAttribute("id");
                }
              }
            }
          }
        }
      } // All others


      return select(selector.replace(rtrim, "$1"), context, results, seed);
    }
    /**
     * Create key-value caches of limited size
     * @return {function} Returns the Object data after storing it on itself with
     *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
     *	deleting the oldest entry
     */


    function createCache() {
      var keys = [];

      function cache(key, value) {
        // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
        if (keys.push(key + " ") > Expr.cacheLength) {
          // Only keep the most recent entries
          delete cache[keys.shift()];
        }

        return cache[key + " "] = value;
      }

      return cache;
    }
    /**
     * Mark a function for special use by Sizzle
     * @param fn {Function} The function to mark
     */


    function markFunction(fn) {
      fn[expando] = true;
      return fn;
    }
    /**
     * Support testing using an element
     * @param fn {Function} Passed the created element and returns a boolean result
     */


    function assert(fn) {
      var el = document.createElement("fieldset");

      try {
        return !!fn(el);
      } catch (e) {
        return false;
      } finally {
        // Remove from its parent by default
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        } // release memory in IE


        el = null;
      }
    }
    /**
     * Adds the same handler for all of the specified attrs
     * @param attrs {String} Pipe-separated list of attributes
     * @param handler {Function} The method that will be applied
     */


    function addHandle(attrs, handler) {
      var arr = attrs.split("|"),
          i = arr.length;

      while (i--) {
        Expr.attrHandle[arr[i]] = handler;
      }
    }
    /**
     * Checks document order of two siblings
     * @param a {Element}
     * @param b {Element}
     * @return {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
     */


    function siblingCheck(a, b) {
      var cur = b && a,
          diff = cur && a.nodeType === 1 && b.nodeType === 1 && a.sourceIndex - b.sourceIndex; // Use IE sourceIndex if available on both nodes

      if (diff) {
        return diff;
      } // Check if b follows a


      if (cur) {
        while (cur = cur.nextSibling) {
          if (cur === b) {
            return -1;
          }
        }
      }

      return a ? 1 : -1;
    }
    /**
     * Returns a function to use in pseudos for input types
     * @param type {String}
     */


    function createInputPseudo(type) {
      return function (elem) {
        var name = elem.nodeName.toLowerCase();
        return name === "input" && elem.type === type;
      };
    }
    /**
     * Returns a function to use in pseudos for buttons
     * @param type {String}
     */


    function createButtonPseudo(type) {
      return function (elem) {
        var name = elem.nodeName.toLowerCase();
        return (name === "input" || name === "button") && elem.type === type;
      };
    }
    /**
     * Returns a function to use in pseudos for :enabled/:disabled
     * @param disabled {Boolean} true for :disabled; false for :enabled
     */


    function createDisabledPseudo(disabled) {
      // Known :disabled false positives:
      // IE: *[disabled]:not(button, input, select, textarea, optgroup, option, menuitem, fieldset)
      // not IE: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
      return function (elem) {
        // Check form elements and option elements for explicit disabling
        return "label" in elem && elem.disabled === disabled || "form" in elem && elem.disabled === disabled || // Check non-disabled form elements for fieldset[disabled] ancestors
        "form" in elem && elem.disabled === false && ( // Support: IE6-11+
        // Ancestry is covered for us
        elem.isDisabled === disabled || // Otherwise, assume any non-<option> under fieldset[disabled] is disabled

        /* jshint -W018 */
        elem.isDisabled !== !disabled && ("label" in elem || !disabledAncestor(elem)) !== disabled);
      };
    }
    /**
     * Returns a function to use in pseudos for positionals
     * @param fn {Function}
     */


    function createPositionalPseudo(fn) {
      return markFunction(function (argument) {
        argument = +argument;
        return markFunction(function (seed, matches) {
          var j,
              matchIndexes = fn([], seed.length, argument),
              i = matchIndexes.length; // Match elements found at the specified indexes

          while (i--) {
            if (seed[j = matchIndexes[i]]) {
              seed[j] = !(matches[j] = seed[j]);
            }
          }
        });
      });
    }
    /**
     * Checks a node for validity as a Sizzle context
     * @param context {Element|Object}
     * @return {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
     */


    function testContext(context) {
      return context && typeof context.getElementsByTagName !== "undefined" && context;
    } // Expose support vars for convenience


    support = Sizzle.support = {};
    /**
     * Detects XML nodes
     * @param elem {Element|Object} An element or a document
     * @return {Boolean} True iff elem is a non-HTML XML node
     */

    isXML = Sizzle.isXML = function (elem) {
      // documentElement is verified for cases where it doesn't yet exist
      // (such as loading iframes in IE - #4833)
      var documentElement = elem && (elem.ownerDocument || elem).documentElement;
      return documentElement ? documentElement.nodeName !== "HTML" : false;
    };
    /**
     * Sets document-related variables once based on the current document
     * @param doc {Element|Object} An element or document object to use to set the document
     * @return {Object} Returns the current document
     */


    setDocument = Sizzle.setDocument = function (node) {
      var hasCompare,
          subWindow,
          doc = node ? node.ownerDocument || node : preferredDoc; // Return early if doc is invalid or already selected

      if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
        return document;
      } // Update global variables


      document = doc;
      docElem = document.documentElement;
      documentIsHTML = !isXML(document); // Support: IE 9-11, Edge
      // Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)

      if (preferredDoc !== document && (subWindow = document.defaultView) && subWindow.top !== subWindow) {
        // Support: IE 11, Edge
        if (subWindow.addEventListener) {
          subWindow.addEventListener("unload", unloadHandler, false); // Support: IE 9 - 10 only
        } else if (subWindow.attachEvent) {
          subWindow.attachEvent("onunload", unloadHandler);
        }
      }
      /* Attributes
      ---------------------------------------------------------------------- */
      // Support: IE<8
      // Verify that getAttribute really returns attributes and not properties
      // (excepting IE8 booleans)


      support.attributes = assert(function (el) {
        el.className = "i";
        return !el.getAttribute("className");
      });
      /* getElement(s)By*
      ---------------------------------------------------------------------- */
      // Check if getElementsByTagName("*") returns only elements

      support.getElementsByTagName = assert(function (el) {
        el.appendChild(document.createComment(""));
        return !el.getElementsByTagName("*").length;
      }); // Support: IE<9

      support.getElementsByClassName = rnative.test(document.getElementsByClassName); // Support: IE<10
      // Check if getElementById returns elements by name
      // The broken getElementById methods don't pick up programmatically-set names,
      // so use a roundabout getElementsByName test

      support.getById = assert(function (el) {
        docElem.appendChild(el).id = expando;
        return !document.getElementsByName || !document.getElementsByName(expando).length;
      }); // ID find and filter

      if (support.getById) {
        Expr.find["ID"] = function (id, context) {
          if (typeof context.getElementById !== "undefined" && documentIsHTML) {
            var m = context.getElementById(id);
            return m ? [m] : [];
          }
        };

        Expr.filter["ID"] = function (id) {
          var attrId = id.replace(runescape, funescape);
          return function (elem) {
            return elem.getAttribute("id") === attrId;
          };
        };
      } else {
        // Support: IE6/7
        // getElementById is not reliable as a find shortcut
        delete Expr.find["ID"];

        Expr.filter["ID"] = function (id) {
          var attrId = id.replace(runescape, funescape);
          return function (elem) {
            var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
            return node && node.value === attrId;
          };
        };
      } // Tag


      Expr.find["TAG"] = support.getElementsByTagName ? function (tag, context) {
        if (typeof context.getElementsByTagName !== "undefined") {
          return context.getElementsByTagName(tag); // DocumentFragment nodes don't have gEBTN
        } else if (support.qsa) {
          return context.querySelectorAll(tag);
        }
      } : function (tag, context) {
        var elem,
            tmp = [],
            i = 0,
            // By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
        results = context.getElementsByTagName(tag); // Filter out possible comments

        if (tag === "*") {
          while (elem = results[i++]) {
            if (elem.nodeType === 1) {
              tmp.push(elem);
            }
          }

          return tmp;
        }

        return results;
      }; // Class

      Expr.find["CLASS"] = support.getElementsByClassName && function (className, context) {
        if (typeof context.getElementsByClassName !== "undefined" && documentIsHTML) {
          return context.getElementsByClassName(className);
        }
      };
      /* QSA/matchesSelector
      ---------------------------------------------------------------------- */
      // QSA and matchesSelector support
      // matchesSelector(:active) reports false when true (IE9/Opera 11.5)


      rbuggyMatches = []; // qSa(:focus) reports false when true (Chrome 21)
      // We allow this because of a bug in IE8/9 that throws an error
      // whenever `document.activeElement` is accessed on an iframe
      // So, we allow :focus to pass through QSA all the time to avoid the IE error
      // See https://bugs.jquery.com/ticket/13378

      rbuggyQSA = [];

      if (support.qsa = rnative.test(document.querySelectorAll)) {
        // Build QSA regex
        // Regex strategy adopted from Diego Perini
        assert(function (el) {
          // Select is set to empty string on purpose
          // This is to test IE's treatment of not explicitly
          // setting a boolean content attribute,
          // since its presence should be enough
          // https://bugs.jquery.com/ticket/12359
          docElem.appendChild(el).innerHTML = "<a id='" + expando + "'></a>" + "<select id='" + expando + "-\r\\' msallowcapture=''>" + "<option selected=''></option></select>"; // Support: IE8, Opera 11-12.16
          // Nothing should be selected when empty strings follow ^= or $= or *=
          // The test attribute must be unknown in Opera but "safe" for WinRT
          // https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section

          if (el.querySelectorAll("[msallowcapture^='']").length) {
            rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
          } // Support: IE8
          // Boolean attributes and "value" are not treated correctly


          if (!el.querySelectorAll("[selected]").length) {
            rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
          } // Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+


          if (!el.querySelectorAll("[id~=" + expando + "-]").length) {
            rbuggyQSA.push("~=");
          } // Webkit/Opera - :checked should return selected option elements
          // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
          // IE8 throws error here and will not see later tests


          if (!el.querySelectorAll(":checked").length) {
            rbuggyQSA.push(":checked");
          } // Support: Safari 8+, iOS 8+
          // https://bugs.webkit.org/show_bug.cgi?id=136851
          // In-page `selector#id sibling-combinator selector` fails


          if (!el.querySelectorAll("a#" + expando + "+*").length) {
            rbuggyQSA.push(".#.+[+~]");
          }
        });
        assert(function (el) {
          el.innerHTML = "<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>"; // Support: Windows 8 Native Apps
          // The type and name attributes are restricted during .innerHTML assignment

          var input = document.createElement("input");
          input.setAttribute("type", "hidden");
          el.appendChild(input).setAttribute("name", "D"); // Support: IE8
          // Enforce case-sensitivity of name attribute

          if (el.querySelectorAll("[name=d]").length) {
            rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
          } // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
          // IE8 throws error here and will not see later tests


          if (el.querySelectorAll(":enabled").length !== 2) {
            rbuggyQSA.push(":enabled", ":disabled");
          } // Support: IE9-11+
          // IE's :disabled selector does not pick up the children of disabled fieldsets


          docElem.appendChild(el).disabled = true;

          if (el.querySelectorAll(":disabled").length !== 2) {
            rbuggyQSA.push(":enabled", ":disabled");
          } // Opera 10-11 does not throw on post-comma invalid pseudos


          el.querySelectorAll("*,:x");
          rbuggyQSA.push(",.*:");
        });
      }

      if (support.matchesSelector = rnative.test(matches = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)) {
        assert(function (el) {
          // Check to see if it's possible to do matchesSelector
          // on a disconnected node (IE 9)
          support.disconnectedMatch = matches.call(el, "*"); // This should fail with an exception
          // Gecko does not error, returns false instead

          matches.call(el, "[s!='']:x");
          rbuggyMatches.push("!=", pseudos);
        });
      }

      rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
      rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));
      /* Contains
      ---------------------------------------------------------------------- */

      hasCompare = rnative.test(docElem.compareDocumentPosition); // Element contains another
      // Purposefully self-exclusive
      // As in, an element does not contain itself

      contains = hasCompare || rnative.test(docElem.contains) ? function (a, b) {
        var adown = a.nodeType === 9 ? a.documentElement : a,
            bup = b && b.parentNode;
        return a === bup || !!(bup && bup.nodeType === 1 && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
      } : function (a, b) {
        if (b) {
          while (b = b.parentNode) {
            if (b === a) {
              return true;
            }
          }
        }

        return false;
      };
      /* Sorting
      ---------------------------------------------------------------------- */
      // Document order sorting

      sortOrder = hasCompare ? function (a, b) {
        // Flag for duplicate removal
        if (a === b) {
          hasDuplicate = true;
          return 0;
        } // Sort on method existence if only one input has compareDocumentPosition


        var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;

        if (compare) {
          return compare;
        } // Calculate position if both inputs belong to the same document


        compare = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : // Otherwise we know they are disconnected
        1; // Disconnected nodes

        if (compare & 1 || !support.sortDetached && b.compareDocumentPosition(a) === compare) {
          // Choose the first element that is related to our preferred document
          if (a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
            return -1;
          }

          if (b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
            return 1;
          } // Maintain original order


          return sortInput ? indexOf(sortInput, a) - indexOf(sortInput, b) : 0;
        }

        return compare & 4 ? -1 : 1;
      } : function (a, b) {
        // Exit early if the nodes are identical
        if (a === b) {
          hasDuplicate = true;
          return 0;
        }

        var cur,
            i = 0,
            aup = a.parentNode,
            bup = b.parentNode,
            ap = [a],
            bp = [b]; // Parentless nodes are either documents or disconnected

        if (!aup || !bup) {
          return a === document ? -1 : b === document ? 1 : aup ? -1 : bup ? 1 : sortInput ? indexOf(sortInput, a) - indexOf(sortInput, b) : 0; // If the nodes are siblings, we can do a quick check
        } else if (aup === bup) {
          return siblingCheck(a, b);
        } // Otherwise we need full lists of their ancestors for comparison


        cur = a;

        while (cur = cur.parentNode) {
          ap.unshift(cur);
        }

        cur = b;

        while (cur = cur.parentNode) {
          bp.unshift(cur);
        } // Walk down the tree looking for a discrepancy


        while (ap[i] === bp[i]) {
          i++;
        }

        return i ? // Do a sibling check if the nodes have a common ancestor
        siblingCheck(ap[i], bp[i]) : // Otherwise nodes in our document sort first
        ap[i] === preferredDoc ? -1 : bp[i] === preferredDoc ? 1 : 0;
      };
      return document;
    };

    Sizzle.matches = function (expr, elements) {
      return Sizzle(expr, null, null, elements);
    };

    Sizzle.matchesSelector = function (elem, expr) {
      // Set document vars if needed
      if ((elem.ownerDocument || elem) !== document) {
        setDocument(elem);
      } // Make sure that attribute selectors are quoted


      expr = expr.replace(rattributeQuotes, "='$1']");

      if (support.matchesSelector && documentIsHTML && !compilerCache[expr + " "] && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
        try {
          var ret = matches.call(elem, expr); // IE 9's matchesSelector returns false on disconnected nodes

          if (ret || support.disconnectedMatch || // As well, disconnected nodes are said to be in a document
          // fragment in IE 9
          elem.document && elem.document.nodeType !== 11) {
            return ret;
          }
        } catch (e) {}
      }

      return Sizzle(expr, document, null, [elem]).length > 0;
    };

    Sizzle.contains = function (context, elem) {
      // Set document vars if needed
      if ((context.ownerDocument || context) !== document) {
        setDocument(context);
      }

      return contains(context, elem);
    };

    Sizzle.attr = function (elem, name) {
      // Set document vars if needed
      if ((elem.ownerDocument || elem) !== document) {
        setDocument(elem);
      }

      var fn = Expr.attrHandle[name.toLowerCase()],
          // Don't get fooled by Object.prototype properties (jQuery #13807)
      val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : undefined;
      return val !== undefined ? val : support.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
    };

    Sizzle.escape = function (sel) {
      return (sel + "").replace(rcssescape, fcssescape);
    };

    Sizzle.error = function (msg) {
      throw new Error("Syntax error, unrecognized expression: " + msg);
    };
    /**
     * Document sorting and removing duplicates
     * @param results {ArrayLike}
     */


    Sizzle.uniqueSort = function (results) {
      var elem,
          duplicates = [],
          j = 0,
          i = 0; // Unless we *know* we can detect duplicates, assume their presence

      hasDuplicate = !support.detectDuplicates;
      sortInput = !support.sortStable && results.slice(0);
      results.sort(sortOrder);

      if (hasDuplicate) {
        while (elem = results[i++]) {
          if (elem === results[i]) {
            j = duplicates.push(i);
          }
        }

        while (j--) {
          results.splice(duplicates[j], 1);
        }
      } // Clear input after sorting to release objects
      // See https://github.com/jquery/sizzle/pull/225


      sortInput = null;
      return results;
    };
    /**
     * Utility function for retrieving the text value of an array of DOM nodes
     * @param elem {Array|Element}
     */


    getText = Sizzle.getText = function (elem) {
      var node,
          ret = "",
          i = 0,
          nodeType = elem.nodeType;

      if (!nodeType) {
        // If no nodeType, this is expected to be an array
        while (node = elem[i++]) {
          // Do not traverse comment nodes
          ret += getText(node);
        }
      } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
        // Use textContent for elements
        // innerText usage removed for consistency of new lines (jQuery #11153)
        if (typeof elem.textContent === "string") {
          return elem.textContent;
        } else {
          // Traverse its children
          for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
            ret += getText(elem);
          }
        }
      } else if (nodeType === 3 || nodeType === 4) {
        return elem.nodeValue;
      } // Do not include comment or processing instruction nodes


      return ret;
    };

    Expr = Sizzle.selectors = {
      // Can be adjusted by the user
      cacheLength: 50,
      createPseudo: markFunction,
      match: matchExpr,
      attrHandle: {},
      find: {},
      relative: {
        ">": {
          dir: "parentNode",
          first: true
        },
        " ": {
          dir: "parentNode"
        },
        "+": {
          dir: "previousSibling",
          first: true
        },
        "~": {
          dir: "previousSibling"
        }
      },
      preFilter: {
        ATTR: function ATTR(match) {
          match[1] = match[1].replace(runescape, funescape); // Move the given value to match[3] whether quoted or unquoted

          match[3] = (match[3] || match[4] || match[5] || "").replace(runescape, funescape);

          if (match[2] === "~=") {
            match[3] = " " + match[3] + " ";
          }

          return match.slice(0, 4);
        },
        CHILD: function CHILD(match) {
          /* matches from matchExpr["CHILD"]
          	1 type (only|nth|...)
          	2 what (child|of-type)
          	3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
          	4 xn-component of xn+y argument ([+-]?\d*n|)
          	5 sign of xn-component
          	6 x of xn-component
          	7 sign of y-component
          	8 y of y-component
          */
          match[1] = match[1].toLowerCase();

          if (match[1].slice(0, 3) === "nth") {
            // nth-* requires argument
            if (!match[3]) {
              Sizzle.error(match[0]);
            } // numeric x and y parameters for Expr.filter.CHILD
            // remember that false/true cast respectively to 0/1


            match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
            match[5] = +(match[7] + match[8] || match[3] === "odd"); // other types prohibit arguments
          } else if (match[3]) {
            Sizzle.error(match[0]);
          }

          return match;
        },
        PSEUDO: function PSEUDO(match) {
          var excess,
              unquoted = !match[6] && match[2];

          if (matchExpr["CHILD"].test(match[0])) {
            return null;
          } // Accept quoted arguments as-is


          if (match[3]) {
            match[2] = match[4] || match[5] || ""; // Strip excess characters from unquoted arguments
          } else if (unquoted && rpseudo.test(unquoted) && ( // Get excess from tokenize (recursively)
          excess = tokenize(unquoted, true)) && ( // advance to the next closing parenthesis
          excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {
            // excess is a negative index
            match[0] = match[0].slice(0, excess);
            match[2] = unquoted.slice(0, excess);
          } // Return only captures needed by the pseudo filter method (type and argument)


          return match.slice(0, 3);
        }
      },
      filter: {
        TAG: function TAG(nodeNameSelector) {
          var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
          return nodeNameSelector === "*" ? function () {
            return true;
          } : function (elem) {
            return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
          };
        },
        CLASS: function CLASS(className) {
          var pattern = classCache[className + " "];
          return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function (elem) {
            return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "");
          });
        },
        ATTR: function ATTR(name, operator, check) {
          return function (elem) {
            var result = Sizzle.attr(elem, name);

            if (result == null) {
              return operator === "!=";
            }

            if (!operator) {
              return true;
            }

            result += "";
            return operator === "=" ? result === check : operator === "!=" ? result !== check : operator === "^=" ? check && result.indexOf(check) === 0 : operator === "*=" ? check && result.indexOf(check) > -1 : operator === "$=" ? check && result.slice(-check.length) === check : operator === "~=" ? (" " + result.replace(rwhitespace, " ") + " ").indexOf(check) > -1 : operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" : false;
          };
        },
        CHILD: function CHILD(type, what, argument, first, last) {
          var simple = type.slice(0, 3) !== "nth",
              forward = type.slice(-4) !== "last",
              ofType = what === "of-type";
          return first === 1 && last === 0 ? // Shortcut for :nth-*(n)
          function (elem) {
            return !!elem.parentNode;
          } : function (elem, context, xml) {
            var cache,
                uniqueCache,
                outerCache,
                node,
                nodeIndex,
                start,
                dir = simple !== forward ? "nextSibling" : "previousSibling",
                parent = elem.parentNode,
                name = ofType && elem.nodeName.toLowerCase(),
                useCache = !xml && !ofType,
                diff = false;

            if (parent) {
              // :(first|last|only)-(child|of-type)
              if (simple) {
                while (dir) {
                  node = elem;

                  while (node = node[dir]) {
                    if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
                      return false;
                    }
                  } // Reverse direction for :only-* (if we haven't yet done so)


                  start = dir = type === "only" && !start && "nextSibling";
                }

                return true;
              }

              start = [forward ? parent.firstChild : parent.lastChild]; // non-xml :nth-child(...) stores cache data on `parent`

              if (forward && useCache) {
                // Seek `elem` from a previously-cached index
                // ...in a gzip-friendly way
                node = parent;
                outerCache = node[expando] || (node[expando] = {}); // Support: IE <9 only
                // Defend against cloned attroperties (jQuery gh-1709)

                uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});
                cache = uniqueCache[type] || [];
                nodeIndex = cache[0] === dirruns && cache[1];
                diff = nodeIndex && cache[2];
                node = nodeIndex && parent.childNodes[nodeIndex];

                while (node = ++nodeIndex && node && node[dir] || ( // Fallback to seeking `elem` from the start
                diff = nodeIndex = 0) || start.pop()) {
                  // When found, cache indexes on `parent` and break
                  if (node.nodeType === 1 && ++diff && node === elem) {
                    uniqueCache[type] = [dirruns, nodeIndex, diff];
                    break;
                  }
                }
              } else {
                // Use previously-cached element index if available
                if (useCache) {
                  // ...in a gzip-friendly way
                  node = elem;
                  outerCache = node[expando] || (node[expando] = {}); // Support: IE <9 only
                  // Defend against cloned attroperties (jQuery gh-1709)

                  uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});
                  cache = uniqueCache[type] || [];
                  nodeIndex = cache[0] === dirruns && cache[1];
                  diff = nodeIndex;
                } // xml :nth-child(...)
                // or :nth-last-child(...) or :nth(-last)?-of-type(...)


                if (diff === false) {
                  // Use the same loop as above to seek `elem` from the start
                  while (node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) {
                    if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
                      // Cache the index of each encountered element
                      if (useCache) {
                        outerCache = node[expando] || (node[expando] = {}); // Support: IE <9 only
                        // Defend against cloned attroperties (jQuery gh-1709)

                        uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});
                        uniqueCache[type] = [dirruns, diff];
                      }

                      if (node === elem) {
                        break;
                      }
                    }
                  }
                }
              } // Incorporate the offset, then check against cycle size


              diff -= last;
              return diff === first || diff % first === 0 && diff / first >= 0;
            }
          };
        },
        PSEUDO: function PSEUDO(pseudo, argument) {
          // pseudo-class names are case-insensitive
          // http://www.w3.org/TR/selectors/#pseudo-classes
          // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
          // Remember that setFilters inherits from pseudos
          var args,
              fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error("unsupported pseudo: " + pseudo); // The user may use createPseudo to indicate that
          // arguments are needed to create the filter function
          // just as Sizzle does

          if (fn[expando]) {
            return fn(argument);
          } // But maintain support for old signatures


          if (fn.length > 1) {
            args = [pseudo, pseudo, "", argument];
            return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function (seed, matches) {
              var idx,
                  matched = fn(seed, argument),
                  i = matched.length;

              while (i--) {
                idx = indexOf(seed, matched[i]);
                seed[idx] = !(matches[idx] = matched[i]);
              }
            }) : function (elem) {
              return fn(elem, 0, args);
            };
          }

          return fn;
        }
      },
      pseudos: {
        // Potentially complex pseudos
        not: markFunction(function (selector) {
          // Trim the selector passed to compile
          // to avoid treating leading and trailing
          // spaces as combinators
          var input = [],
              results = [],
              matcher = compile(selector.replace(rtrim, "$1"));
          return matcher[expando] ? markFunction(function (seed, matches, context, xml) {
            var elem,
                unmatched = matcher(seed, null, xml, []),
                i = seed.length; // Match elements unmatched by `matcher`

            while (i--) {
              if (elem = unmatched[i]) {
                seed[i] = !(matches[i] = elem);
              }
            }
          }) : function (elem, context, xml) {
            input[0] = elem;
            matcher(input, null, xml, results); // Don't keep the element (issue #299)

            input[0] = null;
            return !results.pop();
          };
        }),
        has: markFunction(function (selector) {
          return function (elem) {
            return Sizzle(selector, elem).length > 0;
          };
        }),
        contains: markFunction(function (text) {
          text = text.replace(runescape, funescape);
          return function (elem) {
            return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
          };
        }),
        // "Whether an element is represented by a :lang() selector
        // is based solely on the element's language value
        // being equal to the identifier C,
        // or beginning with the identifier C immediately followed by "-".
        // The matching of C against the element's language value is performed case-insensitively.
        // The identifier C does not have to be a valid language name."
        // http://www.w3.org/TR/selectors/#lang-pseudo
        lang: markFunction(function (lang) {
          // lang value must be a valid identifier
          if (!ridentifier.test(lang || "")) {
            Sizzle.error("unsupported lang: " + lang);
          }

          lang = lang.replace(runescape, funescape).toLowerCase();
          return function (elem) {
            var elemLang;

            do {
              if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang")) {
                elemLang = elemLang.toLowerCase();
                return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
              }
            } while ((elem = elem.parentNode) && elem.nodeType === 1);

            return false;
          };
        }),
        // Miscellaneous
        target: function target(elem) {
          var hash = window.location && window.location.hash;
          return hash && hash.slice(1) === elem.id;
        },
        root: function root(elem) {
          return elem === docElem;
        },
        focus: function focus(elem) {
          return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
        },
        // Boolean properties
        enabled: createDisabledPseudo(false),
        disabled: createDisabledPseudo(true),
        checked: function checked(elem) {
          // In CSS3, :checked should return both checked and selected elements
          // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
          var nodeName = elem.nodeName.toLowerCase();
          return nodeName === "input" && !!elem.checked || nodeName === "option" && !!elem.selected;
        },
        selected: function selected(elem) {
          // Accessing this property makes selected-by-default
          // options in Safari work properly
          if (elem.parentNode) {
            elem.parentNode.selectedIndex;
          }

          return elem.selected === true;
        },
        // Contents
        empty: function empty(elem) {
          // http://www.w3.org/TR/selectors/#empty-pseudo
          // :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
          //   but not by others (comment: 8; processing instruction: 7; etc.)
          // nodeType < 6 works because attributes (2) do not appear as children
          for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
            if (elem.nodeType < 6) {
              return false;
            }
          }

          return true;
        },
        parent: function parent(elem) {
          return !Expr.pseudos["empty"](elem);
        },
        // Element/input types
        header: function header(elem) {
          return rheader.test(elem.nodeName);
        },
        input: function input(elem) {
          return rinputs.test(elem.nodeName);
        },
        button: function button(elem) {
          var name = elem.nodeName.toLowerCase();
          return name === "input" && elem.type === "button" || name === "button";
        },
        text: function text(elem) {
          var attr;
          return elem.nodeName.toLowerCase() === "input" && elem.type === "text" && ( // Support: IE<8
          // New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
          (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");
        },
        // Position-in-collection
        first: createPositionalPseudo(function () {
          return [0];
        }),
        last: createPositionalPseudo(function (matchIndexes, length) {
          return [length - 1];
        }),
        eq: createPositionalPseudo(function (matchIndexes, length, argument) {
          return [argument < 0 ? argument + length : argument];
        }),
        even: createPositionalPseudo(function (matchIndexes, length) {
          var i = 0;

          for (; i < length; i += 2) {
            matchIndexes.push(i);
          }

          return matchIndexes;
        }),
        odd: createPositionalPseudo(function (matchIndexes, length) {
          var i = 1;

          for (; i < length; i += 2) {
            matchIndexes.push(i);
          }

          return matchIndexes;
        }),
        lt: createPositionalPseudo(function (matchIndexes, length, argument) {
          var i = argument < 0 ? argument + length : argument;

          for (; --i >= 0;) {
            matchIndexes.push(i);
          }

          return matchIndexes;
        }),
        gt: createPositionalPseudo(function (matchIndexes, length, argument) {
          var i = argument < 0 ? argument + length : argument;

          for (; ++i < length;) {
            matchIndexes.push(i);
          }

          return matchIndexes;
        })
      }
    };
    Expr.pseudos["nth"] = Expr.pseudos["eq"]; // Add button/input type pseudos

    for (i in {
      radio: true,
      checkbox: true,
      file: true,
      password: true,
      image: true
    }) {
      Expr.pseudos[i] = createInputPseudo(i);
    }

    for (i in {
      submit: true,
      reset: true
    }) {
      Expr.pseudos[i] = createButtonPseudo(i);
    } // Easy API for creating new setFilters


    function setFilters() {}

    setFilters.prototype = Expr.filters = Expr.pseudos;
    Expr.setFilters = new setFilters();

    tokenize = Sizzle.tokenize = function (selector, parseOnly) {
      var matched,
          match,
          tokens,
          type,
          soFar,
          groups,
          preFilters,
          cached = tokenCache[selector + " "];

      if (cached) {
        return parseOnly ? 0 : cached.slice(0);
      }

      soFar = selector;
      groups = [];
      preFilters = Expr.preFilter;

      while (soFar) {
        // Comma and first run
        if (!matched || (match = rcomma.exec(soFar))) {
          if (match) {
            // Don't consume trailing commas as valid
            soFar = soFar.slice(match[0].length) || soFar;
          }

          groups.push(tokens = []);
        }

        matched = false; // Combinators

        if (match = rcombinators.exec(soFar)) {
          matched = match.shift();
          tokens.push({
            value: matched,
            // Cast descendant combinators to space
            type: match[0].replace(rtrim, " ")
          });
          soFar = soFar.slice(matched.length);
        } // Filters


        for (type in Expr.filter) {
          if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
            matched = match.shift();
            tokens.push({
              value: matched,
              type: type,
              matches: match
            });
            soFar = soFar.slice(matched.length);
          }
        }

        if (!matched) {
          break;
        }
      } // Return the length of the invalid excess
      // if we're just parsing
      // Otherwise, throw an error or return tokens


      return parseOnly ? soFar.length : soFar ? Sizzle.error(selector) : // Cache the tokens
      tokenCache(selector, groups).slice(0);
    };

    function toSelector(tokens) {
      var i = 0,
          len = tokens.length,
          selector = "";

      for (; i < len; i++) {
        selector += tokens[i].value;
      }

      return selector;
    }

    function addCombinator(matcher, combinator, base) {
      var dir = combinator.dir,
          skip = combinator.next,
          key = skip || dir,
          checkNonElements = base && key === "parentNode",
          doneName = done++;
      return combinator.first ? // Check against closest ancestor/preceding element
      function (elem, context, xml) {
        while (elem = elem[dir]) {
          if (elem.nodeType === 1 || checkNonElements) {
            return matcher(elem, context, xml);
          }
        }
      } : // Check against all ancestor/preceding elements
      function (elem, context, xml) {
        var oldCache,
            uniqueCache,
            outerCache,
            newCache = [dirruns, doneName]; // We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching

        if (xml) {
          while (elem = elem[dir]) {
            if (elem.nodeType === 1 || checkNonElements) {
              if (matcher(elem, context, xml)) {
                return true;
              }
            }
          }
        } else {
          while (elem = elem[dir]) {
            if (elem.nodeType === 1 || checkNonElements) {
              outerCache = elem[expando] || (elem[expando] = {}); // Support: IE <9 only
              // Defend against cloned attroperties (jQuery gh-1709)

              uniqueCache = outerCache[elem.uniqueID] || (outerCache[elem.uniqueID] = {});

              if (skip && skip === elem.nodeName.toLowerCase()) {
                elem = elem[dir] || elem;
              } else if ((oldCache = uniqueCache[key]) && oldCache[0] === dirruns && oldCache[1] === doneName) {
                // Assign to newCache so results back-propagate to previous elements
                return newCache[2] = oldCache[2];
              } else {
                // Reuse newcache so results back-propagate to previous elements
                uniqueCache[key] = newCache; // A match means we're done; a fail means we have to keep checking

                if (newCache[2] = matcher(elem, context, xml)) {
                  return true;
                }
              }
            }
          }
        }
      };
    }

    function elementMatcher(matchers) {
      return matchers.length > 1 ? function (elem, context, xml) {
        var i = matchers.length;

        while (i--) {
          if (!matchers[i](elem, context, xml)) {
            return false;
          }
        }

        return true;
      } : matchers[0];
    }

    function multipleContexts(selector, contexts, results) {
      var i = 0,
          len = contexts.length;

      for (; i < len; i++) {
        Sizzle(selector, contexts[i], results);
      }

      return results;
    }

    function condense(unmatched, map, filter, context, xml) {
      var elem,
          newUnmatched = [],
          i = 0,
          len = unmatched.length,
          mapped = map != null;

      for (; i < len; i++) {
        if (elem = unmatched[i]) {
          if (!filter || filter(elem, context, xml)) {
            newUnmatched.push(elem);

            if (mapped) {
              map.push(i);
            }
          }
        }
      }

      return newUnmatched;
    }

    function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
      if (postFilter && !postFilter[expando]) {
        postFilter = setMatcher(postFilter);
      }

      if (postFinder && !postFinder[expando]) {
        postFinder = setMatcher(postFinder, postSelector);
      }

      return markFunction(function (seed, results, context, xml) {
        var temp,
            i,
            elem,
            preMap = [],
            postMap = [],
            preexisting = results.length,
            // Get initial elements from seed or context
        elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []),
            // Prefilter to get matcher input, preserving a map for seed-results synchronization
        matcherIn = preFilter && (seed || !selector) ? condense(elems, preMap, preFilter, context, xml) : elems,
            matcherOut = matcher ? // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
        postFinder || (seed ? preFilter : preexisting || postFilter) ? // ...intermediate processing is necessary
        [] : // ...otherwise use results directly
        results : matcherIn; // Find primary matches

        if (matcher) {
          matcher(matcherIn, matcherOut, context, xml);
        } // Apply postFilter


        if (postFilter) {
          temp = condense(matcherOut, postMap);
          postFilter(temp, [], context, xml); // Un-match failing elements by moving them back to matcherIn

          i = temp.length;

          while (i--) {
            if (elem = temp[i]) {
              matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
            }
          }
        }

        if (seed) {
          if (postFinder || preFilter) {
            if (postFinder) {
              // Get the final matcherOut by condensing this intermediate into postFinder contexts
              temp = [];
              i = matcherOut.length;

              while (i--) {
                if (elem = matcherOut[i]) {
                  // Restore matcherIn since elem is not yet a final match
                  temp.push(matcherIn[i] = elem);
                }
              }

              postFinder(null, matcherOut = [], temp, xml);
            } // Move matched elements from seed to results to keep them synchronized


            i = matcherOut.length;

            while (i--) {
              if ((elem = matcherOut[i]) && (temp = postFinder ? indexOf(seed, elem) : preMap[i]) > -1) {
                seed[temp] = !(results[temp] = elem);
              }
            }
          } // Add elements to results, through postFinder if defined

        } else {
          matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut);

          if (postFinder) {
            postFinder(null, results, matcherOut, xml);
          } else {
            push.apply(results, matcherOut);
          }
        }
      });
    }

    function matcherFromTokens(tokens) {
      var checkContext,
          matcher,
          j,
          len = tokens.length,
          leadingRelative = Expr.relative[tokens[0].type],
          implicitRelative = leadingRelative || Expr.relative[" "],
          i = leadingRelative ? 1 : 0,
          // The foundational matcher ensures that elements are reachable from top-level context(s)
      matchContext = addCombinator(function (elem) {
        return elem === checkContext;
      }, implicitRelative, true),
          matchAnyContext = addCombinator(function (elem) {
        return indexOf(checkContext, elem) > -1;
      }, implicitRelative, true),
          matchers = [function (elem, context, xml) {
        var ret = !leadingRelative && (xml || context !== outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml)); // Avoid hanging onto element (issue #299)

        checkContext = null;
        return ret;
      }];

      for (; i < len; i++) {
        if (matcher = Expr.relative[tokens[i].type]) {
          matchers = [addCombinator(elementMatcher(matchers), matcher)];
        } else {
          matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches); // Return special upon seeing a positional matcher

          if (matcher[expando]) {
            // Find the next relative operator (if any) for proper handling
            j = ++i;

            for (; j < len; j++) {
              if (Expr.relative[tokens[j].type]) {
                break;
              }
            }

            return setMatcher(i > 1 && elementMatcher(matchers), i > 1 && toSelector( // If the preceding token was a descendant combinator, insert an implicit any-element `*`
            tokens.slice(0, i - 1).concat({
              value: tokens[i - 2].type === " " ? "*" : ""
            })).replace(rtrim, "$1"), matcher, i < j && matcherFromTokens(tokens.slice(i, j)), j < len && matcherFromTokens(tokens = tokens.slice(j)), j < len && toSelector(tokens));
          }

          matchers.push(matcher);
        }
      }

      return elementMatcher(matchers);
    }

    function matcherFromGroupMatchers(elementMatchers, setMatchers) {
      var bySet = setMatchers.length > 0,
          byElement = elementMatchers.length > 0,
          superMatcher = function superMatcher(seed, context, xml, results, outermost) {
        var elem,
            j,
            matcher,
            matchedCount = 0,
            i = "0",
            unmatched = seed && [],
            setMatched = [],
            contextBackup = outermostContext,
            // We must always have either seed elements or outermost context
        elems = seed || byElement && Expr.find["TAG"]("*", outermost),
            // Use integer dirruns iff this is the outermost matcher
        dirrunsUnique = dirruns += contextBackup == null ? 1 : Math.random() || 0.1,
            len = elems.length;

        if (outermost) {
          outermostContext = context === document || context || outermost;
        } // Add elements passing elementMatchers directly to results
        // Support: IE<9, Safari
        // Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id


        for (; i !== len && (elem = elems[i]) != null; i++) {
          if (byElement && elem) {
            j = 0;

            if (!context && elem.ownerDocument !== document) {
              setDocument(elem);
              xml = !documentIsHTML;
            }

            while (matcher = elementMatchers[j++]) {
              if (matcher(elem, context || document, xml)) {
                results.push(elem);
                break;
              }
            }

            if (outermost) {
              dirruns = dirrunsUnique;
            }
          } // Track unmatched elements for set filters


          if (bySet) {
            // They will have gone through all possible matchers
            if (elem = !matcher && elem) {
              matchedCount--;
            } // Lengthen the array for every element, matched or not


            if (seed) {
              unmatched.push(elem);
            }
          }
        } // `i` is now the count of elements visited above, and adding it to `matchedCount`
        // makes the latter nonnegative.


        matchedCount += i; // Apply set filters to unmatched elements
        // NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
        // equals `i`), unless we didn't visit _any_ elements in the above loop because we have
        // no element matchers and no seed.
        // Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
        // case, which will result in a "00" `matchedCount` that differs from `i` but is also
        // numerically zero.

        if (bySet && i !== matchedCount) {
          j = 0;

          while (matcher = setMatchers[j++]) {
            matcher(unmatched, setMatched, context, xml);
          }

          if (seed) {
            // Reintegrate element matches to eliminate the need for sorting
            if (matchedCount > 0) {
              while (i--) {
                if (!(unmatched[i] || setMatched[i])) {
                  setMatched[i] = pop.call(results);
                }
              }
            } // Discard index placeholder values to get only actual matches


            setMatched = condense(setMatched);
          } // Add matches to results


          push.apply(results, setMatched); // Seedless set matches succeeding multiple successful matchers stipulate sorting

          if (outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1) {
            Sizzle.uniqueSort(results);
          }
        } // Override manipulation of globals by nested matchers


        if (outermost) {
          dirruns = dirrunsUnique;
          outermostContext = contextBackup;
        }

        return unmatched;
      };

      return bySet ? markFunction(superMatcher) : superMatcher;
    }

    compile = Sizzle.compile = function (selector, match
    /* Internal Use Only */
    ) {
      var i,
          setMatchers = [],
          elementMatchers = [],
          cached = compilerCache[selector + " "];

      if (!cached) {
        // Generate a function of recursive functions that can be used to check each element
        if (!match) {
          match = tokenize(selector);
        }

        i = match.length;

        while (i--) {
          cached = matcherFromTokens(match[i]);

          if (cached[expando]) {
            setMatchers.push(cached);
          } else {
            elementMatchers.push(cached);
          }
        } // Cache the compiled function


        cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers)); // Save selector and tokenization

        cached.selector = selector;
      }

      return cached;
    };
    /**
     * A low-level selection function that works with Sizzle's compiled
     *  selector functions
     * @param selector {String|Function} A selector or a pre-compiled
     *  selector function built with Sizzle.compile
     * @param context {Element}
     * @param results {Array}
     * @param seed {Array} A set of elements to match against
     */


    select = Sizzle.select = function (selector, context, results, seed) {
      var i,
          tokens,
          token,
          type,
          find,
          compiled = typeof selector === "function" && selector,
          match = !seed && tokenize(selector = compiled.selector || selector);
      results = results || []; // Try to minimize operations if there is only one selector in the list and no seed
      // (the latter of which guarantees us context)

      if (match.length === 1) {
        // Reduce context if the leading compound selector is an ID
        tokens = match[0] = match[0].slice(0);

        if (tokens.length > 2 && (token = tokens[0]).type === "ID" && support.getById && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {
          context = (Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [])[0];

          if (!context) {
            return results; // Precompiled matchers will still verify ancestry, so step up a level
          } else if (compiled) {
            context = context.parentNode;
          }

          selector = selector.slice(tokens.shift().value.length);
        } // Fetch a seed set for right-to-left matching


        i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;

        while (i--) {
          token = tokens[i]; // Abort if we hit a combinator

          if (Expr.relative[type = token.type]) {
            break;
          }

          if (find = Expr.find[type]) {
            // Search, expanding context for leading sibling combinators
            if (seed = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(context.parentNode) || context)) {
              // If seed is empty or no tokens remain, we can return early
              tokens.splice(i, 1);
              selector = seed.length && toSelector(tokens);

              if (!selector) {
                push.apply(results, seed);
                return results;
              }

              break;
            }
          }
        }
      } // Compile and execute a filtering function if one is not provided
      // Provide `match` to avoid retokenization if we modified the selector above


      (compiled || compile(selector, match))(seed, context, !documentIsHTML, results, !context || rsibling.test(selector) && testContext(context.parentNode) || context);
      return results;
    }; // One-time assignments
    // Sort stability


    support.sortStable = expando.split("").sort(sortOrder).join("") === expando; // Support: Chrome 14-35+
    // Always assume duplicates if they aren't passed to the comparison function

    support.detectDuplicates = !!hasDuplicate; // Initialize against the default document

    setDocument(); // Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
    // Detached nodes confoundingly follow *each other*

    support.sortDetached = assert(function (el) {
      // Should return 1, but returns 4 (following)
      return el.compareDocumentPosition(document.createElement("fieldset")) & 1;
    }); // Support: IE<8
    // Prevent attribute/property "interpolation"
    // https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx

    if (!assert(function (el) {
      el.innerHTML = "<a href='#'></a>";
      return el.firstChild.getAttribute("href") === "#";
    })) {
      addHandle("type|href|height|width", function (elem, name, isXML) {
        if (!isXML) {
          return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
        }
      });
    } // Support: IE<9
    // Use defaultValue in place of getAttribute("value")


    if (!support.attributes || !assert(function (el) {
      el.innerHTML = "<input/>";
      el.firstChild.setAttribute("value", "");
      return el.firstChild.getAttribute("value") === "";
    })) {
      addHandle("value", function (elem, name, isXML) {
        if (!isXML && elem.nodeName.toLowerCase() === "input") {
          return elem.defaultValue;
        }
      });
    } // Support: IE<9
    // Use getAttributeNode to fetch booleans when getAttribute lies


    if (!assert(function (el) {
      return el.getAttribute("disabled") == null;
    })) {
      addHandle(booleans, function (elem, name, isXML) {
        var val;

        if (!isXML) {
          return elem[name] === true ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
        }
      });
    } // EXPOSE qooxdoo variant


    qx.bom.Selector.query = function (selector, context) {
      return Sizzle(selector, context);
    };

    qx.bom.Selector.matches = function (selector, set) {
      return Sizzle(selector, null, null, set);
    }; // EXPOSE qooxdoo variant

  })(window);

  qx.bom.Selector.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.lang.normalize.Function": {
        "require": true
      },
      "qx.lang.normalize.String": {
        "require": true
      },
      "qx.lang.normalize.Date": {
        "require": true
      },
      "qx.lang.normalize.Array": {
        "require": true
      },
      "qx.lang.normalize.Error": {
        "require": true
      },
      "qx.lang.normalize.Object": {
        "require": true
      },
      "qx.lang.normalize.Number": {
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Adds JavaScript features that may not be supported by all clients.
   *
   * @require(qx.lang.normalize.Function)
   * @require(qx.lang.normalize.String)
   * @require(qx.lang.normalize.Date)
   * @require(qx.lang.normalize.Array)
   * @require(qx.lang.normalize.Error)
   * @require(qx.lang.normalize.Object)
   * @require(qx.lang.normalize.Number)
   *
   * @group (Polyfill)
   */
  qx.Bootstrap.define("qx.module.Polyfill", {});
  qx.module.Polyfill.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["device.name", "device.touch", "device.type", "device.pixelRatio"],
      "required": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * The class is responsible for device detection. This is specially useful
   * if you are on a mobile device.
   *
   * This class is used by {@link qx.core.Environment} and should not be used
   * directly. Please check its class comment for details how to use it.
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Device", {
    statics: {
      /** Maps user agent names to device IDs */
      __ids__P_114_0: {
        "Windows Phone": "iemobile",
        iPod: "ipod",
        iPad: "ipad",
        iPhone: "iphone",
        PSP: "psp",
        "PLAYSTATION 3": "ps3",
        "Nintendo Wii": "wii",
        "Nintendo DS": "ds",
        XBOX: "xbox",
        Xbox: "xbox"
      },

      /**
       * Returns the name of the current device if detectable. It falls back to
       * <code>pc</code> if the detection for other devices fails.
       *
       * @internal
       * @return {String} The string of the device found.
       */
      getName: function getName() {
        var str = [];

        for (var key in qx.bom.client.Device.__ids__P_114_0) {
          str.push(key);
        }

        var reg = new RegExp("(" + str.join("|").replace(/\./g, ".") + ")", "g");
        var match = reg.exec(navigator.userAgent);

        if (match && match[1]) {
          return qx.bom.client.Device.__ids__P_114_0[match[1]];
        }

        return "pc";
      },

      /**
       * Determines on what type of device the application is running.
       * Valid values are: "mobile", "tablet" or "desktop".
       * @return {String} The device type name of determined device.
       */
      getType: function getType() {
        return qx.bom.client.Device.detectDeviceType(navigator.userAgent);
      },

      /**
       * Detects the device type, based on given userAgentString.
       *
       * @param userAgentString {String} userAgent parameter, needed for decision.
       * @return {String} The device type name of determined device: "mobile","desktop","tablet"
       */
      detectDeviceType: function detectDeviceType(userAgentString) {
        if (qx.bom.client.Device.detectTabletDevice(userAgentString)) {
          return "tablet";
        } else if (qx.bom.client.Device.detectMobileDevice(userAgentString)) {
          return "mobile";
        }

        return "desktop";
      },

      /**
       * Detects if a device is a mobile phone. (Tablets excluded.)
       * @param userAgentString {String} userAgent parameter, needed for decision.
       * @return {Boolean} Flag which indicates whether it is a mobile device.
       */
      detectMobileDevice: function detectMobileDevice(userAgentString) {
        return /android.+mobile|ip(hone|od)|bada\/|blackberry|BB10|maemo|opera m(ob|in)i|fennec|NetFront|phone|psp|symbian|IEMobile|windows (ce|phone)|xda/i.test(userAgentString);
      },

      /**
       * Detects if a device is a tablet device.
       * @param userAgentString {String} userAgent parameter, needed for decision.
       * @return {Boolean} Flag which indicates whether it is a tablet device.
       */
      detectTabletDevice: function detectTabletDevice(userAgentString) {
        var iPadOS13Up = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
        var isIE10Tablet = /MSIE 10/i.test(userAgentString) && /ARM/i.test(userAgentString) && !/windows phone/i.test(userAgentString);
        var isCommonTablet = !/android.+mobile|Tablet PC/i.test(userAgentString) && /Android|ipad|tablet|playbook|silk|kindle|psp/i.test(userAgentString);
        return isIE10Tablet || isCommonTablet || iPadOS13Up;
      },

      /**
       * Detects the device's pixel ratio. Returns 1 if detection is not possible.
       *
       * @return {Number} The device's pixel ratio
       */
      getDevicePixelRatio: function getDevicePixelRatio() {
        if (typeof window.devicePixelRatio !== "undefined") {
          return window.devicePixelRatio;
        }

        return 1;
      },

      /**
       * Detects if either touch events or pointer events are supported.
       * Additionally it checks if touch is enabled for pointer events.
       *
       * @return {Boolean} <code>true</code>, if the device supports touch
       */
      getTouch: function getTouch() {
        return "ontouchstart" in window || window.navigator.maxTouchPoints > 0 || window.navigator.msMaxTouchPoints > 0;
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("device.name", statics.getName);
      qx.core.Environment.add("device.touch", statics.getTouch);
      qx.core.Environment.add("device.type", statics.getType);
      qx.core.Environment.add("device.pixelRatio", statics.getDevicePixelRatio);
    }
  });
  qx.bom.client.Device.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Browser": {
        "defer": "load",
        "require": true
      },
      "qx.bom.client.Engine": {
        "defer": "load",
        "require": true
      },
      "qx.bom.client.Device": {
        "defer": "load",
        "require": true
      },
      "qx.bom.client.Event": {
        "defer": "load",
        "require": true
      },
      "qxWeb": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "browser.name": {
          "defer": true,
          "className": "qx.bom.client.Browser"
        },
        "browser.version": {
          "defer": true,
          "className": "qx.bom.client.Browser"
        },
        "browser.quirksmode": {
          "defer": true,
          "className": "qx.bom.client.Browser"
        },
        "browser.documentmode": {
          "defer": true,
          "className": "qx.bom.client.Browser"
        },
        "engine.name": {
          "defer": true,
          "className": "qx.bom.client.Engine"
        },
        "engine.version": {
          "defer": true,
          "className": "qx.bom.client.Engine"
        },
        "device.name": {
          "defer": true,
          "className": "qx.bom.client.Device"
        },
        "device.type": {
          "defer": true,
          "className": "qx.bom.client.Device"
        },
        "event.touch": {
          "defer": true,
          "className": "qx.bom.client.Event"
        },
        "event.mspointer": {
          "defer": true,
          "className": "qx.bom.client.Event"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * Module for querying information about the environment / runtime.
   * It adds a static key <code>env</code> to qxWeb and offers the given methods.
   *
   * The following values are predefined:
   *
   * * <code>browser.name</code> : The name of the browser
   * * <code>browser.version</code> : The version of the browser
   * * <code>browser.quirksmode</code>  : <code>true</code> if the browser is in quirksmode
   * * <code>browser.documentmode</code> : The document mode of the browser
   *
   * * <code>device.name</code> : The name of the device e.g. <code>iPad</code>.
   * * <code>device.type</code> : Either <code>desktop</code>, <code>tablet</code> or <code>mobile</code>.
   *
   * * <code>engine.name</code> : The name of the browser engine
   * * <code>engine.version</code> : The version of the browser engine
   *
   * * <code>event.touch</code> : Checks if touch events are supported
   * * <code>event.mspointer</code> : Checks if MSPointer events are available
   * @group (Core)
   */
  qx.Bootstrap.define("qx.module.Environment", {
    statics: {
      /**
       * Get the value stored for the given key.
       *
       * @attachStatic {qxWeb, env.get}
       * @param key {String} The key to check for.
       * @return {var} The value stored for the given key.
       * @lint environmentNonLiteralKey(key)
       */
      get: function get(key) {
        return qx.core.Environment.get(key);
      },

      /**
       * Adds a new environment setting which can be queried via {@link #get}.
       * @param key {String} The key to store the value for.
       *
       * @attachStatic {qxWeb, env.add}
       * @param value {var} The value to store.
       * @return {qxWeb} The collection for chaining.
       */
      add: function add(key, value) {
        qx.core.Environment.add(key, value);
        return this;
      }
    },
    defer: function defer(statics) {
      // make sure the desired keys are available (browser.* and engine.*)
      qx.core.Environment.get("browser.name");
      qx.core.Environment.get("browser.version");
      qx.core.Environment.get("browser.quirksmode");
      qx.core.Environment.get("browser.documentmode");
      qx.core.Environment.get("engine.name");
      qx.core.Environment.get("engine.version");
      qx.core.Environment.get("device.name");
      qx.core.Environment.get("device.type");
      qx.core.Environment.get("event.touch");
      qx.core.Environment.get("event.mspointer");
      qxWeb.$attachAll(this, "env");
    }
  });
  qx.module.Environment.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.module.event.PointerHandler": {
        "defer": "runtime"
      },
      "qx.module.Polyfill": {
        "require": true,
        "defer": "runtime"
      },
      "qx.module.Environment": {
        "require": true,
        "defer": "runtime"
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qxWeb": {
        "defer": "runtime"
      },
      "qx.bom.Event": {},
      "qx.lang.Type": {},
      "qx.lang.Array": {},
      "qx.event.Emitter": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2011-2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Support for native and custom events.
   *
   * @require(qx.module.Polyfill)
   * @require(qx.module.Environment)
   * @use(qx.module.event.PointerHandler)
   * @group (Core)
   */
  qx.Bootstrap.define("qx.module.Event", {
    statics: {
      /**
       * Event normalization registry
       *
       * @internal
       */
      __normalizations__P_166_0: {},

      /**
       * Registry of event hooks
       * @internal
       */
      __hooks__P_166_1: {
        on: {},
        off: {}
      },
      __isReady__P_166_2: false,

      /**
       * Executes the given function once the document is ready.
       *
       * @attachStatic {qxWeb}
       * @param callback {Function} callback function
       */
      ready: function ready(callback) {
        // DOM is already ready
        if (document.readyState === "complete") {
          window.setTimeout(callback, 1);
          return;
        } // listen for the load event so the callback is executed no matter what


        var onWindowLoad = function onWindowLoad() {
          qx.module.Event.__isReady__P_166_2 = true;
          callback();
        };

        qxWeb(window).on("load", onWindowLoad);

        var wrappedCallback = function wrappedCallback() {
          qxWeb(window).off("load", onWindowLoad);
          callback();
        }; // Listen for DOMContentLoaded event if available (no way to reliably detect
        // support)


        if (qxWeb.env.get("engine.name") !== "mshtml" || qxWeb.env.get("browser.documentmode") > 8) {
          qx.bom.Event.addNativeListener(document, "DOMContentLoaded", wrappedCallback);
        } else {
          // Continually check to see if the document is ready
          var timer = function timer() {
            // onWindowLoad already executed
            if (qx.module.Event.__isReady__P_166_2) {
              return;
            }

            try {
              // If DOMContentLoaded is unavailable, use the trick by Diego Perini
              // http://javascript.nwbox.com/IEContentLoaded/
              document.documentElement.doScroll("left");

              if (document.body) {
                wrappedCallback();
              }
            } catch (error) {
              window.setTimeout(timer, 100);
            }
          };

          timer();
        }
      },

      /**
       * Registers a normalization function for the given event types. Listener
       * callbacks for these types will be called with the return value of the
       * normalization function instead of the regular event object.
       *
       * The normalizer will be called with two arguments: The original event
       * object and the element on which the event was triggered
       *
       * @attachStatic {qxWeb, $registerEventNormalization}
       * @param types {String[]} List of event types to be normalized. Use an
       * asterisk (<code>*</code>) to normalize all event types
       * @param normalizer {Function} Normalizer function
       */
      $registerEventNormalization: function $registerEventNormalization(types, normalizer) {
        if (!qx.lang.Type.isArray(types)) {
          types = [types];
        }

        var registry = qx.module.Event.__normalizations__P_166_0;

        for (var i = 0, l = types.length; i < l; i++) {
          var type = types[i];

          if (qx.lang.Type.isFunction(normalizer)) {
            if (!registry[type]) {
              registry[type] = [];
            }

            registry[type].push(normalizer);
          }
        }
      },

      /**
       * Unregisters a normalization function from the given event types.
       *
       * @attachStatic {qxWeb, $unregisterEventNormalization}
       * @param types {String[]} List of event types
       * @param normalizer {Function} Normalizer function
       */
      $unregisterEventNormalization: function $unregisterEventNormalization(types, normalizer) {
        if (!qx.lang.Type.isArray(types)) {
          types = [types];
        }

        var registry = qx.module.Event.__normalizations__P_166_0;

        for (var i = 0, l = types.length; i < l; i++) {
          var type = types[i];

          if (registry[type]) {
            qx.lang.Array.remove(registry[type], normalizer);
          }
        }
      },

      /**
       * Returns all registered event normalizers
       *
       * @attachStatic {qxWeb, $getEventNormalizationRegistry}
       * @return {Map} Map of event types/normalizer functions
       */
      $getEventNormalizationRegistry: function $getEventNormalizationRegistry() {
        return qx.module.Event.__normalizations__P_166_0;
      },

      /**
       * Registers an event hook for the given event types.
       *
       * @attachStatic {qxWeb, $registerEventHook}
       * @param types {String[]} List of event types
       * @param registerHook {Function} Hook function to be called on event registration
       * @param unregisterHook {Function?} Hook function to be called on event deregistration
       * @internal
       */
      $registerEventHook: function $registerEventHook(types, registerHook, unregisterHook) {
        if (!qx.lang.Type.isArray(types)) {
          types = [types];
        }

        var onHooks = qx.module.Event.__hooks__P_166_1.on;

        for (var i = 0, l = types.length; i < l; i++) {
          var type = types[i];

          if (qx.lang.Type.isFunction(registerHook)) {
            if (!onHooks[type]) {
              onHooks[type] = [];
            }

            onHooks[type].push(registerHook);
          }
        }

        if (!unregisterHook) {
          return;
        }

        var offHooks = qx.module.Event.__hooks__P_166_1.off;

        for (var i = 0, l = types.length; i < l; i++) {
          var type = types[i];

          if (qx.lang.Type.isFunction(unregisterHook)) {
            if (!offHooks[type]) {
              offHooks[type] = [];
            }

            offHooks[type].push(unregisterHook);
          }
        }
      },

      /**
       * Unregisters a hook from the given event types.
       *
       * @attachStatic {qxWeb, $unregisterEventHooks}
       * @param types {String[]} List of event types
       * @param registerHook {Function} Hook function to be called on event registration
       * @param unregisterHook {Function?} Hook function to be called on event deregistration
       * @internal
       */
      $unregisterEventHook: function $unregisterEventHook(types, registerHook, unregisterHook) {
        if (!qx.lang.Type.isArray(types)) {
          types = [types];
        }

        var onHooks = qx.module.Event.__hooks__P_166_1.on;

        for (var i = 0, l = types.length; i < l; i++) {
          var type = types[i];

          if (onHooks[type]) {
            qx.lang.Array.remove(onHooks[type], registerHook);
          }
        }

        if (!unregisterHook) {
          return;
        }

        var offHooks = qx.module.Event.__hooks__P_166_1.off;

        for (var i = 0, l = types.length; i < l; i++) {
          var type = types[i];

          if (offHooks[type]) {
            qx.lang.Array.remove(offHooks[type], unregisterHook);
          }
        }
      },

      /**
       * Returns all registered event hooks
       *
       * @attachStatic {qxWeb, $getEventHookRegistry}
       * @return {Map} Map of event types/registration hook functions
       * @internal
       */
      $getEventHookRegistry: function $getEventHookRegistry() {
        return qx.module.Event.__hooks__P_166_1;
      }
    },
    members: {
      /**
       * Registers a listener for the given event type on each item in the
       * collection. This can be either native or custom events.
       *
       * @attach {qxWeb}
       * @param type {String} Type of the event to listen for
       * @param listener {Function} Listener callback
       * @param context {Object?} Context the callback function will be executed in.
       * Default: The element on which the listener was registered
       * @param useCapture {Boolean?} Attach the listener to the capturing
       * phase if true
       * @return {qxWeb} The collection for chaining
       */
      on: function on(type, listener, context, useCapture) {
        for (var i = 0; i < this.length; i++) {
          var el = this[i];
          var ctx = context || qxWeb(el); // call hooks

          var hooks = qx.module.Event.__hooks__P_166_1.on; // generic

          var typeHooks = hooks["*"] || []; // type specific

          if (hooks[type]) {
            typeHooks = typeHooks.concat(hooks[type]);
          }

          for (var j = 0, m = typeHooks.length; j < m; j++) {
            typeHooks[j](el, type, listener, context);
          }

          var bound = function (el, event) {
            // apply normalizations
            var registry = qx.module.Event.__normalizations__P_166_0; // generic

            var normalizations = registry["*"] || []; // type specific

            if (registry[type]) {
              normalizations = normalizations.concat(registry[type]);
            }

            for (var x = 0, y = normalizations.length; x < y; x++) {
              event = normalizations[x](event, el, type);
            } // call original listener with normalized event


            listener.apply(this, [event]);
          }.bind(ctx, el);

          bound.original = listener; // add native listener

          qx.bom.Event.addNativeListener(el, type, bound, useCapture); // create an emitter if necessary

          if (!el.$$emitter) {
            el.$$emitter = new qx.event.Emitter();
          }

          el.$$lastlistenerId = el.$$emitter.on(type, bound, ctx); // save the useCapture for removing

          el.$$emitter.getEntryById(el.$$lastlistenerId).useCapture = !!useCapture;

          if (!el.__listener__P_166_3) {
            el.__listener__P_166_3 = {};
          }

          if (!el.__listener__P_166_3[type]) {
            el.__listener__P_166_3[type] = {};
          }

          el.__listener__P_166_3[type][el.$$lastlistenerId] = bound;

          if (!context) {
            // store a reference to the dynamically created context so we know
            // what to check for when removing the listener
            if (!el.__ctx__P_166_4) {
              el.__ctx__P_166_4 = {};
            }

            el.__ctx__P_166_4[el.$$lastlistenerId] = ctx;
          }
        }

        return this;
      },

      /**
       * Unregisters event listeners for the given type from each element in the
       * collection.
       *
       * @attach {qxWeb}
       * @param type {String} Type of the event
       * @param listener {Function} Listener callback
       * @param context {Object?} Listener callback context
       * @param useCapture {Boolean?} Attach the listener to the capturing
       * phase if true
       * @return {qxWeb} The collection for chaining
       */
      off: function off(type, listener, context, useCapture) {
        var removeAll = listener === null && context === null;

        for (var j = 0; j < this.length; j++) {
          var el = this[j]; // continue if no listeners are available

          if (!el.__listener__P_166_3) {
            continue;
          }

          var types = [];

          if (type !== null) {
            types.push(type);
          } else {
            // no type specified, remove all listeners
            for (var listenerType in el.__listener__P_166_3) {
              types.push(listenerType);
            }
          }

          for (var i = 0, l = types.length; i < l; i++) {
            for (var id in el.__listener__P_166_3[types[i]]) {
              var storedListener = el.__listener__P_166_3[types[i]][id];

              if (removeAll || storedListener == listener || storedListener.original == listener) {
                // get the stored context
                var hasStoredContext = typeof el.__ctx__P_166_4 !== "undefined" && el.__ctx__P_166_4[id];
                var storedContext;

                if (!context && hasStoredContext) {
                  storedContext = el.__ctx__P_166_4[id];
                } // remove the listener from the emitter


                var result = el.$$emitter.off(types[i], storedListener, storedContext || context); // check if it's a bound listener which means it was a native event

                if (removeAll || storedListener.original == listener) {
                  // remove the native listener
                  qx.bom.Event.removeNativeListener(el, types[i], storedListener, useCapture);
                } // BUG #9184
                // only if the emitter was successfully removed also delete the key in the data structure


                if (result !== null) {
                  delete el.__listener__P_166_3[types[i]][id];
                }

                if (hasStoredContext) {
                  delete el.__ctx__P_166_4[id];
                }
              }
            } // call hooks


            var hooks = qx.module.Event.__hooks__P_166_1.off; // generic

            var typeHooks = hooks["*"] || []; // type specific

            if (hooks[type]) {
              typeHooks = typeHooks.concat(hooks[type]);
            }

            for (var k = 0, m = typeHooks.length; k < m; k++) {
              typeHooks[k](el, type, listener, context);
            }
          }
        }

        return this;
      },

      /**
       * Removes all event listeners (or all listeners for a given type) from the
       * collection.
       *
       * @attach {qxWeb}
       * @param type {String?} Event type. All listeners will be removed if this is undefined.
       * @return {qxWeb} The collection for chaining
       */
      allOff: function allOff(type) {
        return this.off(type || null, null, null);
      },

      /**
       * Removes the listener with the given id.
       * @param id {Number} The id of the listener to remove
       * @return {qxWeb} The collection for chaining.
       */
      offById: function offById(id) {
        var entry = this[0].$$emitter.getEntryById(id);
        return this.off(entry.name, entry.listener.original, entry.ctx, entry.useCapture);
      },

      /**
       * Fire an event of the given type.
       *
       * @attach {qxWeb}
       * @param type {String} Event type
       * @param data {var?} Optional data that will be passed to the listener
       * callback function.
       * @return {qxWeb} The collection for chaining
       */
      emit: function emit(type, data) {
        for (var j = 0; j < this.length; j++) {
          var el = this[j];

          if (el.$$emitter) {
            el.$$emitter.emit(type, data);
          }
        }

        return this;
      },

      /**
       * Attaches a listener for the given event that will be executed only once.
       *
       * @attach {qxWeb}
       * @param type {String} Type of the event to listen for
       * @param listener {Function} Listener callback
       * @param context {Object?} Context the callback function will be executed in.
       * Default: The element on which the listener was registered
       * @return {qxWeb} The collection for chaining
       */
      once: function once(type, listener, context) {
        var self = this;

        var wrappedListener = function wrappedListener(data) {
          self.off(type, wrappedListener, context);
          listener.call(this, data);
        };

        this.on(type, wrappedListener, context);
        return this;
      },

      /**
       * Checks if one or more listeners for the given event type are attached to
       * the first element in the collection.
       *
       * *Important:* Make sure you are handing in the *identical* context object to get
       * the correct result. Especially when using a collection instance this is a common pitfall.
       *
       * @attach {qxWeb}
       * @param type {String} Event type, e.g. <code>mousedown</code>
       * @param listener {Function?} Event listener to check for.
       * @param context {Object?} Context object listener to check for.
       * @return {Boolean} <code>true</code> if one or more listeners are attached
       */
      hasListener: function hasListener(type, listener, context) {
        if (!this[0] || !this[0].$$emitter || !this[0].$$emitter.getListeners()[type]) {
          return false;
        }

        if (listener) {
          var attachedListeners = this[0].$$emitter.getListeners()[type];

          for (var i = 0; i < attachedListeners.length; i++) {
            var hasListener = false;

            if (attachedListeners[i].listener == listener) {
              hasListener = true;
            }

            if (attachedListeners[i].listener.original && attachedListeners[i].listener.original == listener) {
              hasListener = true;
            }

            if (hasListener) {
              if (context !== undefined) {
                if (attachedListeners[i].ctx === context) {
                  return true;
                }
              } else {
                return true;
              }
            }
          }

          return false;
        }

        return this[0].$$emitter.getListeners()[type].length > 0;
      },

      /**
       * Copies any event listeners that are attached to the elements in the
       * collection to the provided target element
       *
       * @internal
       * @param target {Element} Element to attach the copied listeners to
       */
      copyEventsTo: function copyEventsTo(target) {
        // Copy both arrays to make sure the original collections are not manipulated.
        // If e.g. the 'target' array contains a DOM node with child nodes we run into
        // problems because the 'target' array is flattened within this method.
        var source = this.concat();
        var targetCopy = target.concat(); // get all children of source and target

        for (var i = source.length - 1; i >= 0; i--) {
          var descendants = source[i].getElementsByTagName("*");

          for (var j = 0; j < descendants.length; j++) {
            source.push(descendants[j]);
          }
        }

        for (var i = targetCopy.length - 1; i >= 0; i--) {
          var descendants = targetCopy[i].getElementsByTagName("*");

          for (var j = 0; j < descendants.length; j++) {
            targetCopy.push(descendants[j]);
          }
        } // make sure no emitter object has been copied


        targetCopy.forEach(function (el) {
          el.$$emitter = null;
        });

        for (var i = 0; i < source.length; i++) {
          var el = source[i];

          if (!el.$$emitter) {
            continue;
          }

          var storage = el.$$emitter.getListeners();

          for (var name in storage) {
            for (var j = storage[name].length - 1; j >= 0; j--) {
              var listener = storage[name][j].listener;

              if (listener.original) {
                listener = listener.original;
              }

              qxWeb(targetCopy[i]).on(name, listener, storage[name][j].ctx);
            }
          }
        }
      },

      /**
       * Bind one or two callbacks to the collection.
       * If only the first callback is defined the collection
       * does react on 'pointerover' only.
       *
       * @attach {qxWeb}
       *
       * @param callbackIn {Function} callback when hovering over
       * @param callbackOut {Function?} callback when hovering out
       * @return {qxWeb} The collection for chaining
       */
      hover: function hover(callbackIn, callbackOut) {
        this.on("pointerover", callbackIn, this);

        if (qx.lang.Type.isFunction(callbackOut)) {
          this.on("pointerout", callbackOut, this);
        }

        return this;
      },

      /**
       * Adds a listener for the given type and checks if the target fulfills the selector check.
       * If the check is successful the callback is executed with the target and event as arguments.
       *
       * @attach{qxWeb}
       *
       * @param eventType {String} name of the event to watch out for (attached to the document object)
       * @param target {String|Element|Element[]|qxWeb} Selector expression, DOM element,
       * Array of DOM elements or collection
       * @param callback {Function} function to call if the selector matches.
       * The callback will get the target as qxWeb collection and the event as arguments
       * @param context {Object?} optional context object to call the callback
       * @return {qxWeb} The collection for chaining
       */
      onMatchTarget: function onMatchTarget(eventType, target, callback, context) {
        context = context !== undefined ? context : this;

        var listener = function listener(e) {
          var eventTarget = qxWeb(e.getTarget());

          if (eventTarget.is(target)) {
            callback.call(context, eventTarget, qxWeb.object.clone(e));
          } else {
            var targetToMatch = typeof target == "string" ? this.find(target) : qxWeb(target);

            for (var i = 0, l = targetToMatch.length; i < l; i++) {
              if (eventTarget.isChildOf(qxWeb(targetToMatch[i]))) {
                callback.call(context, eventTarget, qxWeb.object.clone(e));
                break;
              }
            }
          }
        }; // make sure to store the infos for 'offMatchTarget' at each element of the collection
        // to be able to remove the listener separately


        this.forEach(function (el) {
          var matchTarget = {
            type: eventType,
            listener: listener,
            callback: callback,
            context: context
          };

          if (!el.$$matchTargetInfo) {
            el.$$matchTargetInfo = [];
          }

          el.$$matchTargetInfo.push(matchTarget);
        });
        this.on(eventType, listener);
        return this;
      },

      /**
       * Removes a listener for the given type and selector check.
       *
       * @attach{qxWeb}
       *
       * @param eventType {String} name of the event to remove for
       * @param target {String|Element|Element[]|qxWeb} Selector expression, DOM element,
       * Array of DOM elements or collection
       * @param callback {Function} function to remove
       * @param context {Object?} optional context object to remove
       * @return {qxWeb} The collection for chaining
       */
      offMatchTarget: function offMatchTarget(eventType, target, callback, context) {
        context = context !== undefined ? context : this;
        this.forEach(function (el) {
          if (el.$$matchTargetInfo && qxWeb.type.get(el.$$matchTargetInfo) == "Array") {
            var infos = el.$$matchTargetInfo;

            for (var i = infos.length - 1; i >= 0; i--) {
              var entry = infos[i];

              if (entry.type == eventType && entry.callback == callback && entry.context == context) {
                this.off(eventType, entry.listener);
                infos.splice(i, 1);
              }
            }

            if (infos.length === 0) {
              el.$$matchTargetInfo = null;
            }
          }
        }, this);
        return this;
      }
    },
    defer: function defer(statics) {
      qxWeb.$attachAll(this); // manually attach internal $-methods as they are ignored by the previous method-call

      qxWeb.$attachStatic({
        $registerEventNormalization: statics.$registerEventNormalization,
        $unregisterEventNormalization: statics.$unregisterEventNormalization,
        $getEventNormalizationRegistry: statics.$getEventNormalizationRegistry,
        $registerEventHook: statics.$registerEventHook,
        $unregisterEventHook: statics.$unregisterEventHook,
        $getEventHookRegistry: statics.$getEventHookRegistry
      });
    }
  });
  qx.module.Event.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.module.Event": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Event": {
        "require": true
      },
      "qx.event.Emitter": {},
      "qx.event.handler.PointerCore": {},
      "qxWeb": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "event.dispatchevent": {
          "className": "qx.bom.client.Event"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * TODOC
   *
   * @require(qx.module.Event)
   *
   * @group (Event_Normalization)
   */
  qx.Bootstrap.define("qx.module.event.PointerHandler", {
    statics: {
      /**
       * List of events that require a pointer handler
       */
      TYPES: ["pointermove", "pointerover", "pointerout", "pointerdown", "pointerup", "pointercancel", "gesturebegin", "gesturemove", "gesturefinish", "gesturecancel"],

      /**
       * Creates a pointer handler for the given element when a pointer event listener
       * is attached to it
       *
       * @param element {Element} DOM element
       * @param type {String} event type
       */
      register: function register(element, type) {
        if (!element.$$pointerHandler) {
          if (!qx.core.Environment.get("event.dispatchevent")) {
            if (!element.$$emitter) {
              element.$$emitter = new qx.event.Emitter();
            }
          }

          element.$$pointerHandler = new qx.event.handler.PointerCore(element, element.$$emitter);
        }
      },

      /**
       * Removes the pointer event handler from the element if there are no more
       * pointer event listeners attached to it
       * @param element {Element} DOM element
       */
      unregister: function unregister(element) {
        // check if there are any registered listeners left
        if (element.$$pointerHandler) {
          // in a standalone or in-line application the pointer handler of
          // document will be qx.event.handler.Pointer, do not dispose that handler.
          // see constructor of qx.event.handler.Pointer
          if (element.$$pointerHandler.classname === "qx.event.handler.Pointer") {
            return;
          }

          var listeners = element.$$emitter.getListeners();

          for (var type in listeners) {
            if (qx.module.event.PointerHandler.TYPES.indexOf(type) !== -1) {
              if (listeners[type].length > 0) {
                return;
              }
            }
          } // no more listeners, get rid of the handler


          element.$$pointerHandler.dispose();
          element.$$pointerHandler = undefined;
        }
      }
    },
    defer: function defer(statics) {
      qxWeb.$registerEventHook(statics.TYPES, statics.register, statics.unregister);
    }
  });
  qx.module.event.PointerHandler.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.module.Css": {
        "require": true,
        "defer": "runtime"
      },
      "qx.module.Event": {
        "require": true,
        "defer": "runtime"
      },
      "qx.module.Environment": {
        "require": true,
        "defer": "runtime"
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.element.Animation": {},
      "qxWeb": {
        "defer": "runtime"
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * Cross browser animation layer. It uses feature detection to check if CSS
   * animations are available and ready to use. If not, a JavaScript-based
   * fallback will be used.
   *
   * @require(qx.module.Css)
   * @require(qx.module.Event)
   * @require(qx.module.Environment)
   */
  qx.Bootstrap.define("qx.module.Animation", {
    events: {
      /** Fired when an animation starts. */
      animationStart: undefined,

      /** Fired when an animation has ended one iteration. */
      animationIteration: undefined,

      /** Fired when an animation has ended. */
      animationEnd: undefined
    },
    statics: {
      /**
       * Animation description used in {@link #fadeOut}.
       */
      _fadeOut: {
        duration: 700,
        timing: "ease-out",
        keep: 100,
        keyFrames: {
          0: {
            opacity: 1
          },
          100: {
            opacity: 0,
            display: "none"
          }
        }
      },

      /**
       * Animation description used in {@link #fadeIn}.
       */
      _fadeIn: {
        duration: 700,
        timing: "ease-in",
        keep: 100,
        keyFrames: {
          0: {
            opacity: 0
          },
          100: {
            opacity: 1
          }
        }
      },

      /**
       * Animation execute either regular or reversed direction.
       * @param desc {Map} The animation"s description.
       * @param duration {Number?} The duration in milliseconds of the animation,
       *   which will override the duration given in the description.
       * @param reverse {Boolean} <code>true</code>, if the animation should be reversed
       */
      _animate: function _animate(desc, duration, reverse) {
        this._forEachElement(function (el, i) {
          // stop all running animations
          if (el.$$animation) {
            el.$$animation.stop();
          }

          var handle;

          if (reverse) {
            handle = qx.bom.element.Animation.animateReverse(el, desc, duration);
          } else {
            handle = qx.bom.element.Animation.animate(el, desc, duration);
          }

          var self = this; // only register for the first element

          if (i == 0) {
            handle.on("start", function () {
              self.emit("animationStart");
            }, handle);
            handle.on("iteration", function () {
              self.emit("animationIteration");
            }, handle);
          }

          handle.on("end", function () {
            for (var i = 0; i < self.length; i++) {
              if (self[i].$$animation) {
                return;
              }
            }

            self.emit("animationEnd");
          }, el);
        });
      }
    },
    members: {
      /**
       * Returns the stored animation handles. The handles are only
       * available while an animation is running.
       *
       * @internal
       * @return {Array} An array of animation handles.
       */
      getAnimationHandles: function getAnimationHandles() {
        var animationHandles = [];

        for (var i = 0; i < this.length; i++) {
          animationHandles[i] = this[i].$$animation;
        }

        return animationHandles;
      },

      /**
       * Starts the animation with the given description.
       *
       * *duration* is the time in milliseconds one animation cycle should take.
       *
       * *keep* is the key frame to apply at the end of the animation. (optional)
       *
       * *keyFrames* is a map of separate frames. Each frame is defined by a
       *   number which is the percentage value of time in the animation. The value
       *   is a map itself which holds css properties or transforms
       *   (Transforms only for CSS Animations).
       *
       * *origin* maps to the <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin">transform origin</a>
       * (Only for CSS animations).
       *
       * *repeat* is the amount of time the animation should be run in
       *   sequence. You can also use "infinite".
       *
       * *timing* takes one of these predefined values:
       *   <code>ease</code> | <code>linear</code> | <code>ease-in</code>
       *   | <code>ease-out</code> | <code>ease-in-out</code> |
       *   <code>cubic-bezier(&lt;number&gt;, &lt;number&gt;, &lt;number&gt;, &lt;number&gt;)</code>
       *   (cubic-bezier only available for CSS animations)
       *
       * *alternate* defines if every other animation should be run in reverse order.
       *
       * *delay* is the time in milliseconds the animation should wait before start.
       *
       * @attach {qxWeb}
       * @param desc {Map} The animation"s description.
       * @param duration {Number?} The duration in milliseconds of the animation,
       *   which will override the duration given in the description.
       * @return {qxWeb} The collection for chaining.
       */
      animate: function animate(desc, duration) {
        qx.module.Animation._animate.bind(this)(desc, duration, false);

        return this;
      },

      /**
       * Starts an animation in reversed order. For further details, take a look at
       * the {@link #animate} method.
       * @attach {qxWeb}
       * @param desc {Map} The animation"s description.
       * @param duration {Number?} The duration in milliseconds of the animation,
       *   which will override the duration given in the description.
       * @return {qxWeb} The collection for chaining.
       */
      animateReverse: function animateReverse(desc, duration) {
        qx.module.Animation._animate.bind(this)(desc, duration, true);

        return this;
      },

      /**
       * Manipulates the play state of the animation.
       * This can be used to continue an animation when paused.
       * @attach {qxWeb}
       * @return {qxWeb} The collection for chaining.
       */
      play: function play() {
        for (var i = 0; i < this.length; i++) {
          var handle = this[i].$$animation;

          if (handle) {
            handle.play();
          }
        }

        return this;
      },

      /**
       * Manipulates the play state of the animation.
       * This can be used to pause an animation when running.
       * @attach {qxWeb}
       * @return {qxWeb} The collection for chaining.
       */
      pause: function pause() {
        for (var i = 0; i < this.length; i++) {
          var handle = this[i].$$animation;

          if (handle) {
            handle.pause();
          }
        }

        return this;
      },

      /**
       * Stops a running animation.
       * @attach {qxWeb}
       * @return {qxWeb} The collection for chaining.
       */
      stop: function stop() {
        for (var i = 0; i < this.length; i++) {
          var handle = this[i].$$animation;

          if (handle) {
            handle.stop();
          }
        }

        return this;
      },

      /**
       * Returns whether an animation is running or not.
       * @attach {qxWeb}
       * @return {Boolean} <code>true</code>, if an animation is running.
       */
      isPlaying: function isPlaying() {
        for (var i = 0; i < this.length; i++) {
          var handle = this[i].$$animation;

          if (handle && handle.isPlaying()) {
            return true;
          }
        }

        return false;
      },

      /**
       * Returns whether an animation has ended or not.
       * @attach {qxWeb}
       * @return {Boolean} <code>true</code>, if an animation has ended.
       */
      isEnded: function isEnded() {
        for (var i = 0; i < this.length; i++) {
          var handle = this[i].$$animation;

          if (handle && !handle.isEnded()) {
            return false;
          }
        }

        return true;
      },

      /**
       * Fades in all elements in the collection.
       * @attach {qxWeb}
       * @param duration {Number?} The duration in milliseconds.
       * @return {qxWeb} The collection for chaining.
       */
      fadeIn: function fadeIn(duration) {
        // remove "display: none" style
        this.setStyle("display", "");
        return this.animate(qx.module.Animation._fadeIn, duration);
      },

      /**
       * Fades out all elements in the collection.
       * @attach {qxWeb}
       * @param duration {Number?} The duration in milliseconds.
       * @return {qxWeb} The collection for chaining.
       */
      fadeOut: function fadeOut(duration) {
        return this.animate(qx.module.Animation._fadeOut, duration);
      }
    },
    defer: function defer(statics) {
      qxWeb.$attachAll(this);
      /**
       * End value for opacity style. This value is modified for all browsers which are
       * 'optimizing' this style value by not setting it (like IE9). This leads to a wrong
       * end state for the 'fadeIn' animation if a opacity value is set by CSS.
       */

      if (qxWeb.env.get("browser.name") === "ie" && qxWeb.env.get("browser.version") <= 9) {
        // has to be fixed using direct access since we cannot store the value as static member.
        // The 'fadeIn' description is evaluated during class definition
        statics._fadeIn.keyFrames[100].opacity = 0.99;
      }
    }
  });
  qx.module.Animation.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.module.Animation": {
        "require": true
      },
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.core.Assert": {},
      "qx.html.Factory": {},
      "qx.core.Id": {},
      "qx.lang.Array": {},
      "qx.html.Element": {},
      "qx.event.Registration": {},
      "qx.data.Array": {},
      "qx.lang.Type": {},
      "qx.lang.Function": {},
      "qx.log.Logger": {},
      "qx.event.Manager": {},
      "qx.core.ObjectRegistry": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "module.objectid": {}
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * John Spackman (https://github.com/johnspackman)
  
  ************************************************************************ */

  /**
   * High-performance, high-level DOM element creation and management.
   *
   * Mirrors the DOM structure of Node (see also Element and Text) so to provide
   * DOM insertion and modification with advanced logic to reduce the real transactions.
   *
   * Each child itself also has got some powerful methods to control its
   * position:
   * {@link #getParent}, {@link #free},
   * {@link #insertInto}, {@link #insertBefore}, {@link #insertAfter},
   * {@link #moveTo}, {@link #moveBefore}, {@link #moveAfter},
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @require(qx.module.Animation)
   */
  qx.Class.define("qx.html.Node", {
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],

    /**
     * Creates a new Element
     *
     * @param nodeName {String} name of the node; will be a tag name for Elements, otherwise it's a reserved
     * name eg "#text"
     */
    construct: function construct(nodeName) {
      qx.core.Object.constructor.call(this);
      this._nodeName = nodeName;
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Finds the Widget for a given DOM element
       *
       * @param domElement {DOM} the DOM element
       * @return {qx.ui.core.Widget} the Widget that created the DOM element
       */
      fromDomNode: function fromDomNode(domNode) {
        {
          qx.core.Assert.assertTrue(!domNode.$$element && !domNode.$$elementObject || domNode.$$element === domNode.$$elementObject.toHashCode());
        }
        return domNode.$$elementObject;
      },

      /**
       * Converts a DOM node into a qx.html.Node, providing the existing instance if
       * there is one
       *
       * @param {Node} domNode
       * @returns {qx.html.Node}
       */
      toVirtualNode: function toVirtualNode(domNode) {
        if (domNode.$$elementObject) {
          return domNode.$$elementObject;
        }

        var html = qx.html.Factory.getInstance().createElement(domNode.nodeName, domNode.attributes);
        html.useNode(domNode);
        return html;
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Controls whether the element is visible which means that a previously applied
       * CSS style of display=none gets removed and the element will inserted into the DOM,
       * when this had not already happened before.
       *
       * If the element already exists in the DOM then it will kept in DOM, but configured
       * hidden using a CSS style of display=none.
       *
       * Please note: This does not control the visibility or parent inclusion recursively.
       *
       * @type {Boolean} Whether the element should be visible in the render result
       */
      visible: {
        init: true,
        nullable: true,
        check: "Boolean",
        apply: "_applyVisible",
        event: "changeVisible"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        PROTECTED HELPERS/DATA
      ---------------------------------------------------------------------------
      */

      /** @type {String} the name of the node */
      _nodeName: null,

      /** @type {Node} DOM node of this object */
      _domNode: null,

      /** @type {qx.html.Element} parent element */
      _parent: null,

      /** @type {qx.core.Object} the Qooxdoo object this node is attached to */
      _qxObject: null,

      /** @type {Boolean} Whether the element should be included in the render result */
      _included: true,
      _children: null,
      _modifiedChildren: null,
      _propertyJobs: null,
      _properties: null,

      /** @type {Map} map of event handlers */
      __eventValues__P_142_0: null,

      /**
       * Connects a widget to this element, and to the DOM element in this Element.  They
       * remain associated until disposed or disconnectObject is called
       *
       * @param qxObject {qx.core.Object} the object to associate
       */
      connectObject: function connectObject(qxObject) {
        {
          qx.core.Assert.assertTrue(!this._qxObject || this._qxObject === qxObject);
        }
        this._qxObject = qxObject;

        if (this._domNode) {
          {
            qx.core.Assert.assertTrue(!this._domNode.$$qxObjectHash && !this._domNode.$$qxObject || this._domNode.$$qxObject === qxObject && this._domNode.$$qxObjectHash === qxObject.toHashCode());
          }
          this._domNode.$$qxObjectHash = qxObject.toHashCode();
          this._domNode.$$qxObject = qxObject;
        }

        if (qx.core.Environment.get("module.objectid")) {
          this.updateObjectId();
        }
      },

      /**
       * Disconnects a widget from this element and the DOM element.  The DOM element remains
       * untouched, except that it can no longer be used to find the Widget.
       *
       * @param qxObject {qx.core.Object} the Widget
       */
      disconnectObject: function disconnectObject(qxObject) {
        {
          qx.core.Assert.assertTrue(this._qxObject === qxObject);
        }
        delete this._qxObject;

        if (this._domNode) {
          {
            qx.core.Assert.assertTrue(!this._domNode.$$qxObjectHash && !this._domNode.$$qxObject || this._domNode.$$qxObject === qxObject && this._domNode.$$qxObjectHash === qxObject.toHashCode());
          }
          this._domNode.$$qxObjectHash = "";
          delete this._domNode.$$qxObject;
        }

        if (qx.core.Environment.get("module.objectid")) {
          this.updateObjectId();
        }
      },

      /**
       * Internal helper to generate the DOM element
       *
       * @return {Element} DOM element
       */
      _createDomElement: function _createDomElement() {
        throw new Error("No implementation for " + this.classname + "._createDomElement");
      },

      /**
       * Serializes the virtual DOM element to a writer; the `writer` function accepts
       *  an varargs, which can be joined with an empty string or streamed.
       *
       * If writer is null, the element will be serialised to a string which is returned;
       * note that if writer is not null, the return value will be null
       *
       * @param writer {Function?} the writer
       * @return {String?} the serialised version if writer is null
       */
      serialize: function serialize(writer) {
        var temporaryQxObjectId = !this.getQxObjectId();

        if (temporaryQxObjectId) {
          this.setQxObjectId(this.classname);
        }

        var id = qx.core.Id.getAbsoluteIdOf(this, true);
        var isIdRoot = !id;

        if (isIdRoot) {
          qx.core.Id.getInstance().register(this);
        }

        var result = undefined;

        if (writer) {
          this._serializeImpl(writer);
        } else {
          var buffer = [];

          this._serializeImpl(function () {
            var args = qx.lang.Array.fromArguments(arguments);
            qx.lang.Array.append(buffer, args);
          });

          result = buffer.join("");
        }

        if (isIdRoot) {
          qx.core.Id.getInstance().unregister(this);
        }

        if (temporaryQxObjectId) {
          this.setQxObjectId(null);
        }

        return result;
      },

      /**
       * Serializes the virtual DOM element to a writer; the `writer` function accepts
       *  an varargs, which can be joined with an empty string or streamed.
       *
       * @param writer {Function} the writer
       */
      _serializeImpl: function _serializeImpl(writer) {
        throw new Error("No implementation for " + this.classname + ".serializeImpl");
      },

      /**
       * Uses an existing element instead of creating one. This may be interesting
       * when the DOM element is directly needed to add content etc.
       *
       * @param domNode {Node} DOM Node to reuse
       */
      useNode: function useNode(domNode) {
        var id = domNode.getAttribute("data-qx-object-id");

        if (id) {
          this.setQxObjectId(id);
        }

        var temporaryQxObjectId = !this.getQxObjectId();

        if (temporaryQxObjectId) {
          this.setQxObjectId(this.classname);
        }

        var id = qx.core.Id.getAbsoluteIdOf(this, true);
        var isIdRoot = !id;

        if (isIdRoot) {
          qx.core.Id.getInstance().register(this);
        }
        /*
         * When merging children, we want to keep the original DOM nodes in
         * domNode no matter what - however, where the DOM nodes have a qxObjectId
         * we must reuse the original instances.
         *
         * The crucial thing is that the qxObjectId hierarchy and the DOM hierarchy
         * are not the same (although they are often similar, the DOM will often have
         * extra Nodes).
         *
         * However, because the objects in the qxObjectId space will typically already
         * exist (eg accessed via the constructor) we do not want to discard the original
         * instance of qx.html.Element because there are probably references to them in
         * code.
         *
         * In the code below, we map the DOM heirarchy into a temporary Javascript
         * hierarchy, where we can either use existing qx.html.Element instances (found
         * by looking up the qxObjectId) or fabricate new ones.
         *
         * Once the temporary hierarchy is ready, we go back and synchronise each
         * qx.html.Element with the DOM node and our new array of children.
         *
         * The only rule to this is that if you are going to call this `useNode`, then
         * you must not keep references to objects *unless* you also access them via
         * the qxObjectId mechanism.
         */


        var self = this;

        function convert(domNode) {
          var children = qx.lang.Array.fromCollection(domNode.childNodes);
          children = children.map(function (domChild) {
            var child = null;

            if (domChild.nodeType == window.Node.ELEMENT_NODE) {
              var id = domChild.getAttribute("data-qx-object-id");

              if (id) {
                var owningQxObjectId = null;
                var qxObjectId = null;
                var owningQxObject = null;
                var pos = id.lastIndexOf("/");

                if (pos > -1) {
                  owningQxObjectId = id.substring(0, pos);
                  qxObjectId = id.substring(pos + 1);
                  owningQxObject = qx.core.Id.getQxObject(owningQxObjectId);
                  child = owningQxObject.getQxObject(qxObjectId);
                } else {
                  qxObjectId = id;
                  owningQxObject = self;
                  child = self.getQxObject(id);
                }
              }
            }

            if (!child) {
              child = qx.html.Factory.getInstance().createElement(domChild.nodeName, domChild.attributes);
            }

            return {
              htmlNode: child,
              domNode: domChild,
              children: convert(domChild)
            };
          });
          return children;
        }

        function install(map) {
          var htmlChildren = map.children.map(function (mapEntry) {
            install(mapEntry);
            return mapEntry.htmlNode;
          });

          map.htmlNode._useNodeImpl(map.domNode, htmlChildren);
        }

        var rootMap = {
          htmlNode: this,
          domNode: domNode,
          children: convert(domNode)
        };
        install(rootMap);
        this.flush();

        this._insertChildren();

        if (isIdRoot) {
          qx.core.Id.getInstance().unregister(this);
        }

        if (temporaryQxObjectId) {
          this.setQxObjectId(null);
        }
      },

      /**
       * Called internally to complete the connection to an existing DOM node
       *
       * @param domNode {DOMNode} the node we're syncing to
       * @param newChildren {qx.html.Node[]} the new children
       */
      _useNodeImpl: function _useNodeImpl(domNode, newChildren) {
        if (this._domNode) {
          throw new Error("Could not overwrite existing element!");
        } // Use incoming element


        this._connectDomNode(domNode); // Copy currently existing data over to element


        this._copyData(true, true); // Add children


        var lookup = {};
        var oldChildren = this._children ? qx.lang.Array.clone(this._children) : null;
        newChildren.forEach(function (child) {
          lookup[child.toHashCode()] = child;
        });
        this._children = newChildren; // Make sure that unused children are disconnected

        if (oldChildren) {
          oldChildren.forEach(function (child) {
            if (!lookup[child.toHashCode()]) {
              if (child._domNode && child._domNode.parentElement) {
                child._domNode.parentElement.removeChild(child._domNode);
              }

              child._parent = null;
            }
          });
        }

        var self = this;

        this._children.forEach(function (child) {
          child._parent = self;

          if (child._domNode && child._domNode.parentElement !== self._domNode) {
            child._domNode.parentElement.removeChild(child._domNode);

            if (this._domNode) {
              this._domNode.appendChild(child._domNode);
            }
          }
        });

        if (this._domNode) {
          this._scheduleChildrenUpdate();
        }
      },

      /**
       * Connects a DOM element to this Node; if this Node is already connected to a Widget
       * then the Widget is also connected.
       *
       * @param domNode {DOM} the DOM Node to associate
       */
      _connectDomNode: function _connectDomNode(domNode) {
        {
          qx.core.Assert.assertTrue(!this._domNode || this._domNode === domNode);
          qx.core.Assert.assertTrue(domNode.$$elementObject === this && domNode.$$element === this.toHashCode() || !domNode.$$elementObject && !domNode.$$element);
        }
        this._domNode = domNode;
        domNode.$$elementObject = this;
        domNode.$$element = this.toHashCode();

        if (this._qxObject) {
          domNode.$$qxObjectHash = this._qxObject.toHashCode();
          domNode.$$qxObject = this._qxObject;
        }
      },

      /**
       * Detects whether the DOM node has been created and is in the document
       *
       * @return {Boolean}
       */
      isInDocument: function isInDocument() {
        if (document.body) {
          for (var domNode = this._domNode; domNode != null; domNode = domNode.parentElement) {
            if (domNode === document.body) {
              return true;
            }
          }
        }

        return false;
      },

      /**
       * Updates the Object ID on the element to match the QxObjectId
       */
      updateObjectId: function updateObjectId() {
        // Copy Object Id
        if (qx.core.Environment.get("module.objectid")) {
          var id = this.getQxObjectId();

          if (!id && this._qxObject) {
            id = this._qxObject.getQxObjectId();
          }

          this.setAttribute("data-qx-object-id", id, true);
        }
      },
      _cascadeQxObjectIdChanges: function _cascadeQxObjectIdChanges() {
        if (qx.core.Environment.get("module.objectid")) {
          this.updateObjectId();
        }

        qx.html.Node.superclass.prototype._cascadeQxObjectIdChanges.call(this);
      },

      /*
      ---------------------------------------------------------------------------
        FLUSH OBJECT
      ---------------------------------------------------------------------------
      */

      /**
       * Add the element to the global modification list.
       *
       */
      _scheduleChildrenUpdate: function _scheduleChildrenUpdate() {
        if (this._modifiedChildren) {
          return;
        }

        if (this._domNode) {
          this._modifiedChildren = true;
          qx.html.Element._modified[this.toHashCode()] = this;

          qx.html.Element._scheduleFlush("element");
        }
      },

      /**
       * Syncs data of an HtmlElement object to the DOM.
       *
       * This is just a public wrapper around `flush`, because the scope has changed
       *
       * @deprecated {6.0} Please use `.flush()` instead
       */
      _flush: function _flush() {
        this.flush();
      },

      /**
       * Syncs data of an HtmlElement object to the DOM.
       *
       */
      flush: function flush() {
        {
          if (this.DEBUG) {
            this.debug("Flush: " + this.getAttribute("id"));
          }
        }
        var length;
        var children = this._children;

        if (children) {
          length = children.length;
          var child;

          for (var i = 0; i < length; i++) {
            child = children[i];

            if (child.isVisible() && child._included && !child._domNode) {
              child.flush();
            }
          }
        }

        if (!this._domNode) {
          this._connectDomNode(this._createDomElement());

          this._copyData(false, false);

          if (children && length > 0) {
            this._insertChildren();
          }
        } else {
          this._syncData();

          if (this._modifiedChildren) {
            this._syncChildren();
          }
        }

        delete this._modifiedChildren;
      },

      /**
       * Returns this element's root flag
       *
       * @return {Boolean}
       */
      isRoot: function isRoot() {
        throw new Error("No implementation for " + this.classname + ".isRoot");
      },

      /**
       * Detects whether this element is inside a root element
       *
       * @return {Boolean}
       */
      isInRoot: function isInRoot() {
        var tmp = this;

        while (tmp) {
          if (tmp.isRoot()) {
            return true;
          }

          tmp = tmp._parent;
        }

        return false;
      },

      /**
       * Walk up the internal children hierarchy and
       * look if one of the children is marked as root.
       *
       * This method is quite performance hungry as it
       * really walks up recursively.
       * @return {Boolean} <code>true</code> if the element will be seeable
       */
      _willBeSeeable: function _willBeSeeable() {
        if (!qx.html.Element._hasRoots) {
          return false;
        }

        var pa = this; // Any chance to cache this information in the parents?

        while (pa) {
          if (pa.isRoot()) {
            return true;
          }

          if (!pa._included || !pa.isVisible()) {
            return false;
          }

          pa = pa._parent;
        }

        return false;
      },

      /*
      ---------------------------------------------------------------------------
        SUPPORT FOR CHILDREN FLUSH
      ---------------------------------------------------------------------------
      */

      /**
       * Append all child nodes to the DOM
       * element. This function is used when the element is initially
       * created. After this initial apply {@link #_syncChildren} is used
       * instead.
       *
       */
      _insertChildren: function _insertChildren() {
        var children = this._children;

        if (!children) {
          return;
        }

        var length = children.length;
        var child;

        if (length > 2) {
          var domElement = document.createDocumentFragment();

          for (var i = 0; i < length; i++) {
            child = children[i];

            if (child._domNode && child._included) {
              domElement.appendChild(child._domNode);
            }
          }

          this._domNode.appendChild(domElement);
        } else {
          var domElement = this._domNode;

          for (var i = 0; i < length; i++) {
            child = children[i];

            if (child._domNode && child._included) {
              domElement.appendChild(child._domNode);
            }
          }
        }
      },

      /**
       * Synchronize internal children hierarchy to the DOM. This is used
       * for further runtime updates after the element has been created
       * initially.
       *
       */
      _syncChildren: function _syncChildren() {
        var dataChildren = this._children || [];
        var dataLength = dataChildren.length;
        var dataChild;
        var dataEl;
        var domParent = this._domNode;
        var domChildren = domParent.childNodes;
        var domPos = 0;
        var domEl;
        {
          var domOperations = 0;
        } // Remove children from DOM which are excluded or remove first

        for (var i = domChildren.length - 1; i >= 0; i--) {
          domEl = domChildren[i];
          dataEl = qx.html.Node.fromDomNode(domEl);

          if (!dataEl || !dataEl._included || dataEl._parent !== this) {
            domParent.removeChild(domEl);
            {
              domOperations++;
            }
          }
        } // Start from beginning and bring DOM in sync
        // with the data structure


        for (var i = 0; i < dataLength; i++) {
          dataChild = dataChildren[i]; // Only process visible childs

          if (dataChild._included) {
            dataEl = dataChild._domNode;
            domEl = domChildren[domPos];

            if (!dataEl) {
              continue;
            } // Only do something when out of sync
            // If the data element is not there it may mean that it is still
            // marked as visible=false


            if (dataEl != domEl) {
              if (domEl) {
                domParent.insertBefore(dataEl, domEl);
              } else {
                domParent.appendChild(dataEl);
              }

              {
                domOperations++;
              }
            } // Increase counter


            domPos++;
          }
        } // User feedback


        {
          if (qx.html.Element.DEBUG) {
            this.debug("Synced DOM with " + domOperations + " operations");
          }
        }
      },

      /**
       * Copies data between the internal representation and the DOM. This
       * simply copies all the data and only works well directly after
       * element creation. After this the data must be synced using {@link #_syncData}
       *
       * @param fromMarkup {Boolean} Whether the copy should respect styles
       *   given from markup
       * @param propertiesFromDom {Boolean} whether the copy should respect the property
       *  values in the dom
       */
      _copyData: function _copyData(fromMarkup, propertiesFromDom) {
        var elem = this._domNode; // Attach events

        var data = this.__eventValues__P_142_0;

        if (data) {
          // Import listeners
          var domEvents = {};
          var manager = qx.event.Registration.getManager(elem);

          for (var id in data) {
            if (manager.findHandler(elem, data[id].type)) {
              domEvents[id] = data[id];
            }
          }

          qx.event.Registration.getManager(elem).importListeners(elem, domEvents); // Cleanup event map
          // Events are directly attached through event manager
          // after initial creation. This differs from the
          // handling of styles and attributes where queuing happens
          // through the complete runtime of the application.

          delete this.__eventValues__P_142_0;
        } // Copy properties


        if (this._properties) {
          for (var key in this._properties) {
            var prop = this._properties[key];

            if (propertiesFromDom) {
              if (prop.get) {
                prop.value = prop.get.call(this, key);
              }
            } else if (prop.value !== undefined) {
              prop.set.call(this, prop.value, key);
            }
          }
        }
      },

      /**
       * Synchronizes data between the internal representation and the DOM. This
       * is the counterpart of {@link #_copyData} and is used for further updates
       * after the element has been created.
       *
       */
      _syncData: function _syncData() {
        // Sync misc
        var jobs = this._propertyJobs;

        if (jobs && this._properties) {
          for (var key in jobs) {
            var prop = this._properties[key];

            if (prop.value !== undefined) {
              prop.set.call(this, prop.value, key);
            }
          }

          this._propertyJobs = null;
        }
      },

      /*
      ---------------------------------------------------------------------------
        PRIVATE HELPERS/DATA
      ---------------------------------------------------------------------------
      */

      /**
       * Internal helper for all children addition needs
       *
       * @param child {var} the element to add
       * @throws {Error} if the given element is already a child
       *     of this element
       */
      _addChildImpl: function _addChildImpl(child) {
        if (child._parent === this) {
          throw new Error("Child is already in: " + child);
        }

        if (child.__root__P_142_1) {
          throw new Error("Root elements could not be inserted into other ones.");
        } // Remove from previous parent


        if (child._parent) {
          child._parent.remove(child);
        } // Convert to child of this object


        child._parent = this; // Prepare array

        if (!this._children) {
          this._children = [];
        } // Schedule children update


        if (this._domNode) {
          this._scheduleChildrenUpdate();
        }
      },

      /**
       * Internal helper for all children removal needs
       *
       * @param child {qx.html.Element} the removed element
       * @throws {Error} if the given element is not a child
       *     of this element
       */
      _removeChildImpl: function _removeChildImpl(child) {
        if (child._parent !== this) {
          throw new Error("Has no child: " + child);
        } // Schedule children update


        if (this._domNode) {
          this._scheduleChildrenUpdate();
        } // Remove reference to old parent


        delete child._parent;
      },

      /**
       * Internal helper for all children move needs
       *
       * @param child {qx.html.Element} the moved element
       * @throws {Error} if the given element is not a child
       *     of this element
       */
      _moveChildImpl: function _moveChildImpl(child) {
        if (child._parent !== this) {
          throw new Error("Has no child: " + child);
        } // Schedule children update


        if (this._domNode) {
          this._scheduleChildrenUpdate();
        }
      },

      /*
      ---------------------------------------------------------------------------
        CHILDREN MANAGEMENT (EXECUTED ON THE PARENT)
      ---------------------------------------------------------------------------
      */

      /**
       * Returns a copy of the internal children structure.
       *
       * Please do not modify the array in place. If you need
       * to work with the data in such a way make yourself
       * a copy of the data first.
       *
       * @return {Array} the children list
       */
      getChildren: function getChildren() {
        return this._children || null;
      },

      /**
       * Get a child element at the given index
       *
       * @param index {Integer} child index
       * @return {qx.html.Element|null} The child element or <code>null</code> if
       *     no child is found at that index.
       */
      getChild: function getChild(index) {
        var children = this._children;
        return children && children[index] || null;
      },

      /**
       * Returns whether the element has any child nodes
       *
       * @return {Boolean} Whether the element has any child nodes
       */
      hasChildren: function hasChildren() {
        var children = this._children;
        return children && children[0] !== undefined;
      },

      /**
       * Find the position of the given child
       *
       * @param child {qx.html.Element} the child
       * @return {Integer} returns the position. If the element
       *     is not a child <code>-1</code> will be returned.
       */
      indexOf: function indexOf(child) {
        var children = this._children;
        return children ? children.indexOf(child) : -1;
      },

      /**
       * Whether the given element is a child of this element.
       *
       * @param child {qx.html.Element} the child
       * @return {Boolean} Returns <code>true</code> when the given
       *    element is a child of this element.
       */
      hasChild: function hasChild(child) {
        var children = this._children;
        return children && children.indexOf(child) !== -1;
      },

      /**
       * Append all given children at the end of this element.
       *
       * @param varargs {qx.html.Element} elements to insert
       * @return {qx.html.Element} this object (for chaining support)
       */
      add: function add(varargs) {
        var self = this;

        function addImpl(arr) {
          arr.forEach(function (child) {
            if (child instanceof qx.data.Array || qx.lang.Type.isArray(child)) {
              addImpl(child);
            } else {
              self._addChildImpl(child);

              self._children.push(child);
            }
          });
        }

        addImpl(qx.lang.Array.fromArguments(arguments)); // Chaining support

        return this;
      },

      /**
       * Inserts a new element into this element at the given position.
       *
       * @param child {qx.html.Element} the element to insert
       * @param index {Integer} the index (starts at 0 for the
       *     first child) to insert (the index of the following
       *     children will be increased by one)
       * @return {qx.html.Element} this object (for chaining support)
       */
      addAt: function addAt(child, index) {
        this._addChildImpl(child);

        qx.lang.Array.insertAt(this._children, child, index); // Chaining support

        return this;
      },

      /**
       * Removes all given children
       *
       * @param childs {qx.html.Element} children to remove
       * @return {qx.html.Element} this object (for chaining support)
       */
      remove: function remove(childs) {
        var children = this._children;

        if (!children) {
          return this;
        }

        var self = this;

        function removeImpl(arr) {
          arr.forEach(function (child) {
            if (child instanceof qx.data.Array || qx.lang.Type.isArray(child)) {
              removeImpl(child);
            } else {
              self._removeChildImpl(child);

              qx.lang.Array.remove(children, child);
            }
          });
        }

        removeImpl(qx.lang.Array.fromArguments(arguments)); // Chaining support

        return this;
      },

      /**
       * Removes the child at the given index
       *
       * @param index {Integer} the position of the
       *     child (starts at 0 for the first child)
       * @return {qx.html.Element} this object (for chaining support)
       */
      removeAt: function removeAt(index) {
        var children = this._children;

        if (!children) {
          throw new Error("Has no children!");
        }

        var child = children[index];

        if (!child) {
          throw new Error("Has no child at this position!");
        }

        this._removeChildImpl(child);

        qx.lang.Array.removeAt(this._children, index); // Chaining support

        return this;
      },

      /**
       * Remove all children from this element.
       *
       * @return {qx.html.Element} A reference to this.
       */
      removeAll: function removeAll() {
        var children = this._children;

        if (children) {
          for (var i = 0, l = children.length; i < l; i++) {
            this._removeChildImpl(children[i]);
          } // Clear array


          children.length = 0;
        } // Chaining support


        return this;
      },

      /*
      ---------------------------------------------------------------------------
        CHILDREN MANAGEMENT (EXECUTED ON THE CHILD)
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the parent of this element.
       *
       * @return {qx.html.Element|null} The parent of this element
       */
      getParent: function getParent() {
        return this._parent || null;
      },

      /**
       * Insert self into the given parent. Normally appends self to the end,
       * but optionally a position can be defined. With index <code>0</code> it
       * will be inserted at the begin.
       *
       * @param parent {qx.html.Element} The new parent of this element
       * @param index {Integer?null} Optional position
       * @return {qx.html.Element} this object (for chaining support)
       */
      insertInto: function insertInto(parent, index) {
        parent._addChildImpl(this);

        if (index == null) {
          parent._children.push(this);
        } else {
          qx.lang.Array.insertAt(this._children, this, index);
        }

        return this;
      },

      /**
       * Insert self before the given (related) element
       *
       * @param rel {qx.html.Element} the related element
       * @return {qx.html.Element} this object (for chaining support)
       */
      insertBefore: function insertBefore(rel) {
        var parent = rel._parent;

        parent._addChildImpl(this);

        qx.lang.Array.insertBefore(parent._children, this, rel);
        return this;
      },

      /**
       * Insert self after the given (related) element
       *
       * @param rel {qx.html.Element} the related element
       * @return {qx.html.Element} this object (for chaining support)
       */
      insertAfter: function insertAfter(rel) {
        var parent = rel._parent;

        parent._addChildImpl(this);

        qx.lang.Array.insertAfter(parent._children, this, rel);
        return this;
      },

      /**
       * Move self to the given index in the current parent.
       *
       * @param index {Integer} the index (starts at 0 for the first child)
       * @return {qx.html.Element} this object (for chaining support)
       * @throws {Error} when the given element is not child
       *      of this element.
       */
      moveTo: function moveTo(index) {
        var parent = this._parent;

        parent._moveChildImpl(this);

        var oldIndex = parent._children.indexOf(this);

        if (oldIndex === index) {
          throw new Error("Could not move to same index!");
        } else if (oldIndex < index) {
          index--;
        }

        qx.lang.Array.removeAt(parent._children, oldIndex);
        qx.lang.Array.insertAt(parent._children, this, index);
        return this;
      },

      /**
       * Move self before the given (related) child.
       *
       * @param rel {qx.html.Element} the related child
       * @return {qx.html.Element} this object (for chaining support)
       */
      moveBefore: function moveBefore(rel) {
        var parent = this._parent;
        return this.moveTo(parent._children.indexOf(rel));
      },

      /**
       * Move self after the given (related) child.
       *
       * @param rel {qx.html.Element} the related child
       * @return {qx.html.Element} this object (for chaining support)
       */
      moveAfter: function moveAfter(rel) {
        var parent = this._parent;
        return this.moveTo(parent._children.indexOf(rel) + 1);
      },

      /**
       * Remove self from the current parent.
       *
       * @return {qx.html.Element} this object (for chaining support)
       */
      free: function free() {
        var parent = this._parent;

        if (!parent) {
          throw new Error("Has no parent to remove from.");
        }

        if (!parent._children) {
          return this;
        }

        parent._removeChildImpl(this);

        qx.lang.Array.remove(parent._children, this);
        return this;
      },

      /*
      ---------------------------------------------------------------------------
        DOM ELEMENT ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the DOM element (if created). Please use this with caution.
       * It is better to make all changes to the object itself using the public
       * API rather than to the underlying DOM element.
       *
       * @param create {Boolean?} if true, the DOM node will be created if it does
       * not exist
       * @return {Element|null} The DOM element node, if available.
       */
      getDomElement: function getDomElement(create) {
        if (create && !this._domNode) {
          this.flush();
        }

        return this._domNode || null;
      },

      /**
       * Returns the nodeName of the DOM element.
       *
       * @return {String} The node name
       */
      getNodeName: function getNodeName() {
        return this._nodeName;
      },

      /**
       * Sets the nodeName of the DOM element.
       *
       * @param name {String} The node name
       */
      setNodeName: function setNodeName(name) {
        if (this._domNode && name.toLowerCase() !== this._nodeName.toLowerCase()) {
          throw new Error("Cannot change the name of the node after the DOM node has been created");
        }

        this._nodeName = name;
      },

      /*
      ---------------------------------------------------------------------------
        EXCLUDE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Marks the element as included which means it will be moved into
       * the DOM again and synced with the internal data representation.
       *
       * @return {Node} this object (for chaining support)
       */
      include: function include() {
        if (this._included) {
          return this;
        }

        delete this._included;

        if (this._parent) {
          this._parent._scheduleChildrenUpdate();
        }

        return this;
      },

      /**
       * Marks the element as excluded which means it will be removed
       * from the DOM and ignored for updates until it gets included again.
       *
       * @return {qx.html.Element} this object (for chaining support)
       */
      exclude: function exclude() {
        if (!this._included) {
          return this;
        }

        this._included = false;

        if (this._parent) {
          this._parent._scheduleChildrenUpdate();
        }

        return this;
      },

      /**
       * Whether the element is part of the DOM
       *
       * @return {Boolean} Whether the element is part of the DOM.
       */
      isIncluded: function isIncluded() {
        return this._included === true;
      },

      /**
       * Apply method for visible property
       */
      _applyVisible: function _applyVisible(value) {// Nothing - to be overridden
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Registers a property and the implementations used to read the property value
       * from the DOM and to set the property value onto the DOM.  This allows the element
       * to have a simple `setProperty` method that knows how to read and write the value.
       *
       * You do not have to specify a getter or a setter - by default the setter will use
       * `_applyProperty` for backwards compatibility, and there is no getter implementation.
       *
       * The functions are called with `this` set to this Element.  The getter takes
       * the property name as a parameter and is expected to return a value, the setter takes
       * the property name and value as parameters, and returns nothing.
       *
       * @param key {String} the property name
       * @param getter {Function?} function to read from the DOM
       * @param setter {Function?} function to copy to the DOM
       * @param serialize {Function?} function to serialize the value to HTML
       */
      registerProperty: function registerProperty(key, get, set, serialize) {
        if (!this._properties) {
          this._properties = {};
        }

        if (this._properties[key]) {
          this.debug("Overridding property " + key + " in " + this + "[" + this.classname + "]");
        }

        if (!set) {
          set = qx.lang.Function.bind(function (value, key) {
            this._applyProperty(key, value);
          }, this);
          qx.log.Logger.deprecatedMethodWarning(this._applyProperty, "The method '_applyProperty' is deprecated.  Please use `registerProperty` instead (property '" + key + "' in " + this.classname + ")");
        }

        this._properties[key] = {
          get: get,
          set: set,
          serialize: serialize,
          value: undefined
        };
      },

      /**
       * Applies a special property with the given value.
       *
       * This property apply routine can be easily overwritten and
       * extended by sub classes to add new low level features which
       * are not easily possible using styles and attributes.
       *
       * Note that this implementation is for backwards compatibility and
       * implementations
       *
       * @param name {String} Unique property identifier
       * @param value {var} Any valid value (depends on the property)
       * @return {qx.html.Element} this object (for chaining support)
       * @abstract
       * @deprecated {6.0} please use `registerProperty` instead
       */
      _applyProperty: function _applyProperty(name, value) {// empty implementation
      },

      /**
       * Set up the given property.
       *
       * @param key {String} the name of the property
       * @param value {var} the value
       * @param direct {Boolean?false} Whether the value should be applied
       *    directly (without queuing)
       * @return {qx.html.Element} this object (for chaining support)
       */
      _setProperty: function _setProperty(key, value, direct) {
        if (!this._properties || !this._properties[key]) {
          this.registerProperty(key, null, null);
        }

        if (this._properties[key].value == value) {
          return this;
        }

        this._properties[key].value = value; // Uncreated elements simply copy all data
        // on creation. We don't need to remember any
        // jobs. It is a simple full list copy.

        if (this._domNode) {
          // Omit queuing in direct mode
          if (direct) {
            this._properties[key].set.call(this, value, key);

            return this;
          } // Dynamically create if needed


          if (!this._propertyJobs) {
            this._propertyJobs = {};
          } // Store job info


          this._propertyJobs[key] = true; // Register modification

          qx.html.Element._modified[this.toHashCode()] = this;

          qx.html.Element._scheduleFlush("element");
        }

        return this;
      },

      /**
       * Removes the given misc
       *
       * @param key {String} the name of the misc
       * @param direct {Boolean?false} Whether the value should be removed
       *    directly (without queuing)
       * @return {qx.html.Element} this object (for chaining support)
       */
      _removeProperty: function _removeProperty(key, direct) {
        return this._setProperty(key, null, direct);
      },

      /**
       * Get the value of the given misc.
       *
       * @param key {String} name of the misc
       * @param direct {Boolean?false} Whether the value should be obtained directly (without queuing)
       * @return {var} the value of the misc
       */
      _getProperty: function _getProperty(key, direct) {
        if (!this._properties || !this._properties[key]) {
          return null;
        }

        var value = this._properties[key].value;

        if (this._domNode) {
          if (direct || value === undefined) {
            var fn = this._properties[key].get;

            if (fn) {
              this._properties[key].value = value = fn.call(this, key);
            }
          }
        }

        return value === undefined || value == null ? null : value;
      },

      /*
      ---------------------------------------------------------------------------
        EVENT SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Adds an event listener to the element.
       *
       * @param type {String} Name of the event
       * @param listener {Function} Function to execute on event
       * @param self {Object ? null} Reference to the 'this' variable inside
       *         the event listener. When not given, the corresponding dispatcher
       *         usually falls back to a default, which is the target
       *         by convention. Note this is not a strict requirement, i.e.
       *         custom dispatchers can follow a different strategy.
       * @param capture {Boolean ? false} Whether capturing should be enabled
       * @return {var} An opaque id, which can be used to remove the event listener
       *         using the {@link #removeListenerById} method.
       */
      addListener: function addListener(type, listener, self, capture) {
        var _this = this;

        if (this.$$disposed) {
          return null;
        }

        {
          var msg = "Failed to add event listener for type '" + type + "'" + " to the target '" + this + "': ";
          this.assertString(type, msg + "Invalid event type.");
          this.assertFunction(listener, msg + "Invalid callback function");

          if (self !== undefined) {
            this.assertObject(self, "Invalid context for callback.");
          }

          if (capture !== undefined) {
            this.assertBoolean(capture, "Invalid capture flag.");
          }
        }

        var registerDomEvent = function registerDomEvent() {
          if (_this._domNode) {
            return qx.event.Registration.addListener(_this._domNode, type, listener, self, capture);
          }

          if (!_this.__eventValues__P_142_0) {
            _this.__eventValues__P_142_0 = {};
          }

          if (capture == null) {
            capture = false;
          }

          var unique = qx.event.Manager.getNextUniqueId();
          var id = type + (capture ? "|capture|" : "|bubble|") + unique;
          _this.__eventValues__P_142_0[id] = {
            type: type,
            listener: listener,
            self: self,
            capture: capture,
            unique: unique
          };
          return id;
        };

        if (qx.Class.supportsEvent(this, type)) {
          var id = qx.html.Node.superclass.prototype.addListener.call(this, type, listener, self, capture);
          id.domEventId = registerDomEvent();
          return id;
        }

        return registerDomEvent();
      },

      /**
       * Removes an event listener from the element.
       *
       * @param type {String} Name of the event
       * @param listener {Function} Function to execute on event
       * @param self {Object} Execution context of given function
       * @param capture {Boolean ? false} Whether capturing should be enabled
       * @return {qx.html.Element} this object (for chaining support)
       */
      removeListener: function removeListener(type, listener, self, capture) {
        if (this.$$disposed) {
          return null;
        }

        {
          var msg = "Failed to remove event listener for type '" + type + "'" + " from the target '" + this + "': ";
          this.assertString(type, msg + "Invalid event type.");
          this.assertFunction(listener, msg + "Invalid callback function");

          if (self !== undefined) {
            this.assertObject(self, "Invalid context for callback.");
          }

          if (capture !== undefined) {
            this.assertBoolean(capture, "Invalid capture flag.");
          }
        }

        if (qx.Class.supportsEvent(this, type)) {
          qx.html.Node.superclass.prototype.removeListener.call(this, type, listener, self, capture);
        }

        if (this._domNode) {
          if (listener.$$wrapped_callback && listener.$$wrapped_callback[type + this.toHashCode()]) {
            var callback = listener.$$wrapped_callback[type + this.toHashCode()];
            delete listener.$$wrapped_callback[type + this.toHashCode()];
            listener = callback;
          }

          qx.event.Registration.removeListener(this._domNode, type, listener, self, capture);
        } else {
          var values = this.__eventValues__P_142_0;
          var entry;

          if (capture == null) {
            capture = false;
          }

          for (var key in values) {
            entry = values[key]; // Optimized for performance: Testing references first

            if (entry.listener === listener && entry.self === self && entry.capture === capture && entry.type === type) {
              delete values[key];
              break;
            }
          }
        }

        return this;
      },

      /**
       * Removes an event listener from an event target by an id returned by
       * {@link #addListener}
       *
       * @param id {var} The id returned by {@link #addListener}
       * @return {qx.html.Element} this object (for chaining support)
       */
      removeListenerById: function removeListenerById(id) {
        if (this.$$disposed) {
          return null;
        }

        if (id.domEventId) {
          if (this._domNode) {
            qx.event.Registration.removeListenerById(this._domNode, id.domEventId);
          }

          delete id.domEventId;
          qx.html.Node.superclass.prototype.removeListenerById.call(this, id);
        } else {
          if (this._domNode) {
            qx.event.Registration.removeListenerById(this._domNode, id);
          } else {
            delete this.__eventValues__P_142_0[id];
          }
        }

        return this;
      },

      /**
       * Check if there are one or more listeners for an event type.
       *
       * @param type {String} name of the event type
       * @param capture {Boolean ? false} Whether to check for listeners of
       *         the bubbling or of the capturing phase.
       * @return {Boolean} Whether the object has a listener of the given type.
       */
      hasListener: function hasListener(type, capture) {
        if (this.$$disposed) {
          return false;
        }

        if (qx.Class.supportsEvent(this, type)) {
          var has = qx.html.Node.superclass.prototype.hasListener.call(this, type, capture);

          if (has) {
            return true;
          }
        }

        if (this._domNode) {
          if (qx.event.Registration.hasListener(this._domNode, type, capture)) {
            return true;
          }
        } else {
          var values = this.__eventValues__P_142_0;
          var entry;

          if (capture == null) {
            capture = false;
          }

          for (var key in values) {
            entry = values[key]; // Optimized for performance: Testing fast types first

            if (entry.capture === capture && entry.type === type) {
              return true;
            }
          }
        }

        return false;
      },

      /**
       * Serializes and returns all event listeners attached to this element
       * @return {Map[]} an Array containing a map for each listener. The maps
       * have the following keys:
       * <ul>
       *   <li><code>type</code> (String): Event name</li>
       *   <li><code>handler</code> (Function): Callback function</li>
       *   <li><code>self</code> (Object): The callback's context</li>
       *   <li><code>capture</code> (Boolean): If <code>true</code>, the listener is
       * attached to the capturing phase</li>
       * </ul>
       */
      getListeners: function getListeners() {
        if (this.$$disposed) {
          return null;
        }

        var listeners = [];
        qx.lang.Array.append(listeners, qx.event.Registration.serializeListeners(this) || []);

        if (this._domNode) {
          qx.lang.Array.append(listeners, qx.event.Registration.serializeListeners(this._domNode) || []);
        }

        for (var id in this.__eventValues__P_142_0) {
          var listenerData = this.__eventValues__P_142_0[id];
          listeners.push({
            type: listenerData.type,
            handler: listenerData.listener,
            self: listenerData.self,
            capture: listenerData.capture
          });
        }

        return listeners;
      }
    },

    /*
    *****************************************************************************
       DESTRUCT
    *****************************************************************************
    */
    destruct: function destruct() {
      var el = this._domNode;

      if (el) {
        qx.event.Registration.getManager(el).removeAllListeners(el);
        el.$$element = "";
        delete el.$$elementObject;
        el.$$qxObjectHash = "";
        delete el.$$qxObject;
      }

      if (!qx.core.ObjectRegistry.inShutDown) {
        var parent = this._parent;

        if (parent && !parent.$$disposed) {
          parent.remove(this);
        }
      }

      this._disposeArray("_children");

      this._properties = this._propertyJobs = this._domNode = this._parent = this.__eventValues__P_142_0 = null;
    }
  });
  qx.html.Node.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.bom.Style": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Browser": {}
    },
    "environment": {
      "provided": ["css.textoverflow", "css.placeholder", "css.borderradius", "css.boxshadow", "css.gradient.linear", "css.gradient.radial", "css.gradient.legacywebkit", "css.boxmodel", "css.rgba", "css.borderimage", "css.borderimage.standardsyntax", "css.usermodify", "css.userselect", "css.userselect.none", "css.appearance", "css.float", "css.boxsizing", "css.inlineblock", "css.opacity", "css.textShadow", "css.alphaimageloaderneeded", "css.pointerevents", "css.flexboxSyntax"],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * The purpose of this class is to contain all checks about css.
   *
   * This class is used by {@link qx.core.Environment} and should not be used
   * directly. Please check its class comment for details how to use it.
   *
   * @internal
   * @ignore(WebKitCSSMatrix)
   * @require(qx.bom.Style)
   */
  qx.Bootstrap.define("qx.bom.client.Css", {
    statics: {
      __WEBKIT_LEGACY_GRADIENT__P_88_0: null,

      /**
       * Checks what box model is used in the current environment.
       * @return {String} It either returns "content" or "border".
       * @internal
       */
      getBoxModel: function getBoxModel() {
        var content = qx.bom.client.Engine.getName() !== "mshtml" || !qx.bom.client.Browser.getQuirksMode();
        return content ? "content" : "border";
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>textOverflow</code> style property.
       *
       * @return {String|null} textOverflow property name or <code>null</code> if
       * textOverflow is not supported.
       * @internal
       */
      getTextOverflow: function getTextOverflow() {
        return qx.bom.Style.getPropertyName("textOverflow");
      },

      /**
       * Checks if a placeholder could be used.
       * @return {Boolean} <code>true</code>, if it could be used.
       * @internal
       */
      getPlaceholder: function getPlaceholder() {
        if (qx.core.Environment.get("engine.name") === "mshtml") {
          return false;
        }

        var i = document.createElement("input");
        return "placeholder" in i;
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>appearance</code> style property.
       *
       * @return {String|null} appearance property name or <code>null</code> if
       * appearance is not supported.
       * @internal
       */
      getAppearance: function getAppearance() {
        return qx.bom.Style.getPropertyName("appearance");
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>borderRadius</code> style property.
       *
       * @return {String|null} borderRadius property name or <code>null</code> if
       * borderRadius is not supported.
       * @internal
       */
      getBorderRadius: function getBorderRadius() {
        return qx.bom.Style.getPropertyName("borderRadius");
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>boxShadow</code> style property.
       *
       * @return {String|null} boxShadow property name or <code>null</code> if
       * boxShadow is not supported.
       * @internal
       */
      getBoxShadow: function getBoxShadow() {
        return qx.bom.Style.getPropertyName("boxShadow");
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>borderImage</code> style property.
       *
       * @return {String|null} borderImage property name or <code>null</code> if
       * borderImage is not supported.
       * @internal
       */
      getBorderImage: function getBorderImage() {
        return qx.bom.Style.getPropertyName("borderImage");
      },

      /**
       * Returns the type of syntax this client supports for its CSS border-image
       * implementation. Some browsers do not support the "fill" keyword defined
       * in the W3C draft (http://www.w3.org/TR/css3-background/) and will not
       * show the border image if it's set. Others follow the standard closely and
       * will omit the center image if "fill" is not set.
       *
       * @return {Boolean|null} <code>true</code> if the standard syntax is supported.
       * <code>null</code> if the supported syntax could not be detected.
       * @internal
       */
      getBorderImageSyntax: function getBorderImageSyntax() {
        var styleName = qx.bom.client.Css.getBorderImage();

        if (!styleName) {
          return null;
        }

        var el = document.createElement("div");

        if (styleName === "borderImage") {
          // unprefixed implementation: check individual properties
          el.style[styleName] = 'url("foo.png") 4 4 4 4 fill stretch';

          if (el.style.borderImageSource.indexOf("foo.png") >= 0 && el.style.borderImageSlice.indexOf("4 fill") >= 0 && el.style.borderImageRepeat.indexOf("stretch") >= 0) {
            return true;
          }
        } else {
          // prefixed implementation, assume no support for "fill"
          el.style[styleName] = 'url("foo.png") 4 4 4 4 stretch'; // serialized value is unreliable, so just a simple check

          if (el.style[styleName].indexOf("foo.png") >= 0) {
            return false;
          }
        } // unable to determine syntax


        return null;
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>userSelect</code> style property.
       *
       * @return {String|null} userSelect property name or <code>null</code> if
       * userSelect is not supported.
       * @internal
       */
      getUserSelect: function getUserSelect() {
        return qx.bom.Style.getPropertyName("userSelect");
      },

      /**
       * Returns the (possibly vendor-prefixed) value for the
       * <code>userSelect</code> style property that disables selection. For Gecko,
       * "-moz-none" is returned since "none" only makes the target element appear
       * as if its text could not be selected
       *
       * @internal
       * @return {String|null} the userSelect property value that disables
       * selection or <code>null</code> if userSelect is not supported
       */
      getUserSelectNone: function getUserSelectNone() {
        var styleProperty = qx.bom.client.Css.getUserSelect();

        if (styleProperty) {
          var el = document.createElement("span");
          el.style[styleProperty] = "-moz-none";
          return el.style[styleProperty] === "-moz-none" ? "-moz-none" : "none";
        }

        return null;
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>userModify</code> style property.
       *
       * @return {String|null} userModify property name or <code>null</code> if
       * userModify is not supported.
       * @internal
       */
      getUserModify: function getUserModify() {
        return qx.bom.Style.getPropertyName("userModify");
      },

      /**
       * Returns the vendor-specific name of the <code>float</code> style property
       *
       * @return {String|null} <code>cssFloat</code> for standards-compliant
       * browsers, <code>styleFloat</code> for legacy IEs, <code>null</code> if
       * the client supports neither property.
       * @internal
       */
      getFloat: function getFloat() {
        var style = document.documentElement.style;
        return style.cssFloat !== undefined ? "cssFloat" : style.styleFloat !== undefined ? "styleFloat" : null;
      },

      /**
       * Returns the (possibly vendor-prefixed) name this client uses for
       * <code>linear-gradient</code>.
       * http://dev.w3.org/csswg/css3-images/#linear-gradients
       *
       * @return {String|null} Prefixed linear-gradient name or <code>null</code>
       * if linear gradients are not supported
       * @internal
       */
      getLinearGradient: function getLinearGradient() {
        qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT__P_88_0 = false;
        var value = "linear-gradient(0deg, #fff, #000)";
        var el = document.createElement("div");
        var style = qx.bom.Style.getAppliedStyle(el, "backgroundImage", value);

        if (!style) {
          //try old WebKit syntax (versions 528 - 534.16)
          value = "-webkit-gradient(linear,0% 0%,100% 100%,from(white), to(red))";
          var style = qx.bom.Style.getAppliedStyle(el, "backgroundImage", value, false);

          if (style) {
            qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT__P_88_0 = true;
          }
        } // not supported


        if (!style) {
          return null;
        }

        var match = /(.*?)\(/.exec(style);
        return match ? match[1] : null;
      },

      /**
       * Returns the (possibly vendor-prefixed) name this client uses for
       * <code>radial-gradient</code>.
       *
       * @return {String|null} Prefixed radial-gradient name or <code>null</code>
       * if radial gradients are not supported
       * @internal
       */
      getRadialGradient: function getRadialGradient() {
        var value = "radial-gradient(0px 0px, cover, red 50%, blue 100%)";
        var el = document.createElement("div");
        var style = qx.bom.Style.getAppliedStyle(el, "backgroundImage", value);

        if (!style) {
          return null;
        }

        var match = /(.*?)\(/.exec(style);
        return match ? match[1] : null;
      },

      /**
       * Checks if **only** the old WebKit (version < 534.16) syntax for
       * linear gradients is supported, e.g.
       * <code>linear-gradient(0deg, #fff, #000)</code>
       *
       * @return {Boolean} <code>true</code> if the legacy syntax must be used
       * @internal
       */
      getLegacyWebkitGradient: function getLegacyWebkitGradient() {
        if (qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT__P_88_0 === null) {
          qx.bom.client.Css.getLinearGradient();
        }

        return qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT__P_88_0;
      },

      /**
       * Checks if rgba colors can be used:
       * http://www.w3.org/TR/2010/PR-css3-color-20101028/#rgba-color
       *
       * @return {Boolean} <code>true</code>, if rgba colors are supported.
       * @internal
       */
      getRgba: function getRgba() {
        var el;

        try {
          el = document.createElement("div");
        } catch (ex) {
          el = document.createElement();
        } // try catch for IE


        try {
          el.style["color"] = "rgba(1, 2, 3, 0.5)";

          if (el.style["color"].indexOf("rgba") != -1) {
            return true;
          }
        } catch (ex) {}

        return false;
      },

      /**
       * Returns the (possibly vendor-prefixed) name the browser uses for the
       * <code>boxSizing</code> style property.
       *
       * @return {String|null} boxSizing property name or <code>null</code> if
       * boxSizing is not supported.
       * @internal
       */
      getBoxSizing: function getBoxSizing() {
        return qx.bom.Style.getPropertyName("boxSizing");
      },

      /**
       * Returns the browser-specific name used for the <code>display</code> style
       * property's <code>inline-block</code> value.
       *
       * @internal
       * @return {String|null}
       */
      getInlineBlock: function getInlineBlock() {
        var el = document.createElement("span");
        el.style.display = "inline-block";

        if (el.style.display == "inline-block") {
          return "inline-block";
        }

        el.style.display = "-moz-inline-box";

        if (el.style.display !== "-moz-inline-box") {
          return "-moz-inline-box";
        }

        return null;
      },

      /**
       * Checks if CSS opacity is supported
       *
       * @internal
       * @return {Boolean} <code>true</code> if opacity is supported
       */
      getOpacity: function getOpacity() {
        return typeof document.documentElement.style.opacity == "string";
      },

      /**
       * Checks if CSS texShadow is supported
       *
       * @internal
       * @return {Boolean} <code>true</code> if textShadow is supported
       */
      getTextShadow: function getTextShadow() {
        return !!qx.bom.Style.getPropertyName("textShadow");
      },

      /**
       * Checks if the Alpha Image Loader must be used to display transparent PNGs.
       *
       * @return {Boolean} <code>true</code> if the Alpha Image Loader is required
       */
      getAlphaImageLoaderNeeded: function getAlphaImageLoaderNeeded() {
        return qx.bom.client.Engine.getName() == "mshtml" && qx.bom.client.Browser.getDocumentMode() < 9;
      },

      /**
       * Checks if pointer events are available.
       *
       * @internal
       * @return {Boolean} <code>true</code> if pointer events are supported.
       */
      getPointerEvents: function getPointerEvents() {
        var el = document.documentElement; // Check if browser reports that pointerEvents is a known style property

        if ("pointerEvents" in el.style) {
          // The property is defined in Opera and IE9 but setting it has no effect
          var initial = el.style.pointerEvents;
          el.style.pointerEvents = "auto"; // don't assume support if a nonsensical value isn't ignored

          el.style.pointerEvents = "foo";
          var supported = el.style.pointerEvents == "auto";
          el.style.pointerEvents = initial;
          return supported;
        }

        return false;
      },

      /**
       * Returns which Flexbox syntax is supported by the browser.
       * <code>display: box;</code> old 2009 version of Flexbox.
       * <code>display: flexbox;</code> tweener phase in 2011.
       * <code>display: flex;</code> current specification.
       * @internal
       * @return {String} <code>flex</code>,<code>flexbox</code>,<code>box</code> or <code>null</code>
       */
      getFlexboxSyntax: function getFlexboxSyntax() {
        var detectedSyntax = null;
        var detector = document.createElement("detect");
        var flexSyntax = [{
          value: "flex",
          syntax: "flex"
        }, {
          value: "-ms-flexbox",
          syntax: "flexbox"
        }, {
          value: "-webkit-flex",
          syntax: "flex"
        }];

        for (var i = 0; i < flexSyntax.length; i++) {
          // old IEs will throw an "Invalid argument" exception here
          try {
            detector.style.display = flexSyntax[i].value;
          } catch (ex) {
            return null;
          }

          if (detector.style.display === flexSyntax[i].value) {
            detectedSyntax = flexSyntax[i].syntax;
            break;
          }
        }

        detector = null;
        return detectedSyntax;
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("css.textoverflow", statics.getTextOverflow);
      qx.core.Environment.add("css.placeholder", statics.getPlaceholder);
      qx.core.Environment.add("css.borderradius", statics.getBorderRadius);
      qx.core.Environment.add("css.boxshadow", statics.getBoxShadow);
      qx.core.Environment.add("css.gradient.linear", statics.getLinearGradient);
      qx.core.Environment.add("css.gradient.radial", statics.getRadialGradient);
      qx.core.Environment.add("css.gradient.legacywebkit", statics.getLegacyWebkitGradient);
      qx.core.Environment.add("css.boxmodel", statics.getBoxModel);
      qx.core.Environment.add("css.rgba", statics.getRgba);
      qx.core.Environment.add("css.borderimage", statics.getBorderImage);
      qx.core.Environment.add("css.borderimage.standardsyntax", statics.getBorderImageSyntax);
      qx.core.Environment.add("css.usermodify", statics.getUserModify);
      qx.core.Environment.add("css.userselect", statics.getUserSelect);
      qx.core.Environment.add("css.userselect.none", statics.getUserSelectNone);
      qx.core.Environment.add("css.appearance", statics.getAppearance);
      qx.core.Environment.add("css.float", statics.getFloat);
      qx.core.Environment.add("css.boxsizing", statics.getBoxSizing);
      qx.core.Environment.add("css.inlineblock", statics.getInlineBlock);
      qx.core.Environment.add("css.opacity", statics.getOpacity);
      qx.core.Environment.add("css.textShadow", statics.getTextShadow);
      qx.core.Environment.add("css.alphaimageloaderneeded", statics.getAlphaImageLoaderNeeded);
      qx.core.Environment.add("css.pointerevents", statics.getPointerEvents);
      qx.core.Environment.add("css.flexboxSyntax", statics.getFlexboxSyntax);
    }
  });
  qx.bom.client.Css.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.module.Animation": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.html.Node": {
        "construct": true,
        "require": true
      },
      "qx.log.Logger": {},
      "qx.bom.Element": {},
      "qx.dom.Hierarchy": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.element.Scroll": {},
      "qx.bom.Selection": {},
      "qx.event.handler.Appear": {},
      "qx.event.Registration": {},
      "qx.event.handler.Focus": {},
      "qx.event.dispatch.MouseCapture": {},
      "qx.dom.Element": {},
      "qx.bom.element.Attribute": {},
      "qx.lang.Object": {},
      "qx.bom.element.Style": {},
      "qx.lang.Array": {},
      "qx.core.Id": {},
      "qx.bom.client.Css": {
        "require": true
      },
      "qx.html.Text": {},
      "qx.bom.element.Location": {},
      "qx.bom.element.Dimension": {},
      "qx.util.DeferredCall": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "css.userselect": {
          "className": "qx.bom.client.Css"
        },
        "css.userselect.none": {
          "className": "qx.bom.client.Css"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * High-performance, high-level DOM element creation and management.
   *
   * Includes support for HTML and style attributes. Elements also have
   * got a powerful children and visibility management.
   *
   * Processes DOM insertion and modification with advanced logic
   * to reduce the real transactions.
   *
   * From the view of the parent you can use the following children management
   * methods:
   * {@link #getChildren}, {@link #indexOf}, {@link #hasChild}, {@link #add},
   * {@link #addAt}, {@link #remove}, {@link #removeAt}, {@link #removeAll}
   *
   * Each child itself also has got some powerful methods to control its
   * position:
   * {@link #getParent}, {@link #free},
   * {@link #insertInto}, {@link #insertBefore}, {@link #insertAfter},
   * {@link #moveTo}, {@link #moveBefore}, {@link #moveAfter},
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @require(qx.module.Animation)
   */
  qx.Class.define("qx.html.Element", {
    extend: qx.html.Node,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Creates a new Element
     *
     * @param tagName {String?"div"} Tag name of the element to create
     * @param styles {Map?null} optional map of CSS styles, where the key is the name
     *    of the style and the value is the value to use.
     * @param attributes {Map?null} optional map of element attributes, where the
     *    key is the name of the attribute and the value is the value to use.
     */
    construct: function construct(tagName, styles, attributes) {
      qx.html.Node.constructor.call(this, tagName || "div");
      this.__styleValues__P_98_0 = styles || null;
      this.__attribValues__P_98_1 = attributes || null;

      if (attributes) {
        for (var key in attributes) {
          if (!key) {
            throw new Error("Invalid unnamed attribute in " + this.classname);
          }
        }
      }

      this.initCssClass();
      this.registerProperty("innerHtml", null, function (value) {
        if (this._domNode) {
          this._domNode.innerHTML = value;
        }
      }, function (writer, property, name) {
        if (property.value) {
          writer(property.value);
        }
      });
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /*
      ---------------------------------------------------------------------------
        STATIC DATA
      ---------------------------------------------------------------------------
      */

      /** @type {Boolean} If debugging should be enabled */
      DEBUG: false,

      /** @type {Integer} number of roots */
      _hasRoots: 0,

      /** @type {Element} the default root to use */
      _defaultRoot: null,

      /** @type {Map} Contains the modified {@link qx.html.Element}s. The key is the hash code. */
      _modified: {},

      /** @type {Map} Contains the {@link qx.html.Element}s which should get hidden or visible at the next flush. The key is the hash code. */
      _visibility: {},

      /** @type {Map} Contains the {@link qx.html.Element}s which should scrolled at the next flush */
      _scroll: {},

      /** @type {Array} List of post actions for elements. The key is the action name. The value the {@link qx.html.Element}. */
      _actions: [],

      /**  @type {Map} List of all selections. */
      __selection__P_98_2: {},
      __focusHandler__P_98_3: null,
      __mouseCapture__P_98_4: null,
      __SELF_CLOSING_TAGS__P_98_5: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC ELEMENT FLUSH
      ---------------------------------------------------------------------------
      */

      /**
       * Schedule a deferred element queue flush. If the widget subsystem is used
       * this method gets overwritten by {@link qx.ui.core.queue.Manager}.
       *
       * @param job {String} The job descriptor. Should always be <code>"element"</code>.
       */
      _scheduleFlush: function _scheduleFlush(job) {
        qx.html.Element.__deferredCall__P_98_6.schedule();
      },

      /**
       * Flush the global modified list
       */
      flush: function flush() {
        var obj;
        {
          if (this.DEBUG) {
            qx.log.Logger.debug(this, "Flushing elements...");
          }
        }
        {
          // blur elements, which will be removed
          var focusHandler = this.__getFocusHandler__P_98_7();

          var focusedDomElement = focusHandler.getFocus();

          if (focusedDomElement && this.__willBecomeInvisible__P_98_8(focusedDomElement)) {
            focusHandler.blur(focusedDomElement);
          } // deactivate elements, which will be removed


          var activeDomElement = focusHandler.getActive();

          if (activeDomElement && this.__willBecomeInvisible__P_98_8(activeDomElement)) {
            qx.bom.Element.deactivate(activeDomElement);
          } // release capture for elements, which will be removed


          var captureDomElement = this.__getCaptureElement__P_98_9();

          if (captureDomElement && this.__willBecomeInvisible__P_98_8(captureDomElement)) {
            qx.bom.Element.releaseCapture(captureDomElement);
          }
        }
        var later = [];
        var modified = qx.html.Element._modified;

        for (var hc in modified) {
          obj = modified[hc]; // Ignore all hidden elements except iframes
          // but keep them until they get visible (again)

          if (obj._willBeSeeable() || obj.classname == "qx.html.Iframe") {
            // Separately queue rendered elements
            if (obj._domNode && qx.dom.Hierarchy.isRendered(obj._domNode)) {
              later.push(obj);
            } // Flush invisible elements first
            else {
              {
                if (this.DEBUG) {
                  obj.debug("Flush invisible element");
                }
              }
              obj.flush();
            } // Cleanup modification list


            delete modified[hc];
          }
        }

        for (var i = 0, l = later.length; i < l; i++) {
          obj = later[i];
          {
            if (this.DEBUG) {
              obj.debug("Flush rendered element");
            }
          }
          obj.flush();
        } // Process visibility list


        var visibility = this._visibility;

        for (var hc in visibility) {
          obj = visibility[hc];
          var element = obj._domNode;

          if (!element) {
            delete visibility[hc];
            continue;
          }

          {
            if (this.DEBUG) {
              qx.log.Logger.debug(this, "Switching visibility to: " + obj.isVisible());
            }
          } // hiding or showing an object and deleting it right after that may
          // cause an disposed object in the visibility queue [BUG #3607]

          if (!obj.$$disposed) {
            element.style.display = obj.isVisible() ? "" : "none"; // also hide the element (fixed some rendering problem in IE<8 & IE8 quirks)

            if (qx.core.Environment.get("engine.name") == "mshtml") {
              if (!(document.documentMode >= 8)) {
                element.style.visibility = obj.isVisible() ? "visible" : "hidden";
              }
            }
          }

          delete visibility[hc];
        }

        {
          // Process scroll list
          var scroll = this._scroll;

          for (var hc in scroll) {
            obj = scroll[hc];
            var elem = obj._domNode;

            if (elem && elem.offsetWidth) {
              var done = true; // ScrollToX

              if (obj.__lazyScrollX__P_98_10 != null) {
                obj._domNode.scrollLeft = obj.__lazyScrollX__P_98_10;
                delete obj.__lazyScrollX__P_98_10;
              } // ScrollToY


              if (obj.__lazyScrollY__P_98_11 != null) {
                obj._domNode.scrollTop = obj.__lazyScrollY__P_98_11;
                delete obj.__lazyScrollY__P_98_11;
              } // ScrollIntoViewX


              var intoViewX = obj.__lazyScrollIntoViewX__P_98_12;

              if (intoViewX != null) {
                var child = intoViewX.element.getDomElement();

                if (child && child.offsetWidth) {
                  qx.bom.element.Scroll.intoViewX(child, elem, intoViewX.align);
                  delete obj.__lazyScrollIntoViewX__P_98_12;
                } else {
                  done = false;
                }
              } // ScrollIntoViewY


              var intoViewY = obj.__lazyScrollIntoViewY__P_98_13;

              if (intoViewY != null) {
                var child = intoViewY.element.getDomElement();

                if (child && child.offsetWidth) {
                  qx.bom.element.Scroll.intoViewY(child, elem, intoViewY.align);
                  delete obj.__lazyScrollIntoViewY__P_98_13;
                } else {
                  done = false;
                }
              } // Clear flag if all things are done
              // Otherwise wait for the next flush


              if (done) {
                delete scroll[hc];
              }
            }
          }

          var activityEndActions = {
            releaseCapture: 1,
            blur: 1,
            deactivate: 1
          }; // Process action list

          for (var i = 0; i < this._actions.length; i++) {
            var action = this._actions[i];
            var element = action.element._domNode;

            if (!element || !activityEndActions[action.type] && !action.element._willBeSeeable()) {
              continue;
            }

            var args = action.args;
            args.unshift(element);
            qx.bom.Element[action.type].apply(qx.bom.Element, args);
          }

          this._actions = [];
        } // Process selection

        for (var hc in this.__selection__P_98_2) {
          var selection = this.__selection__P_98_2[hc];
          var elem = selection.element._domNode;

          if (elem) {
            qx.bom.Selection.set(elem, selection.start, selection.end);
            delete this.__selection__P_98_2[hc];
          }
        } // Fire appear/disappear events


        qx.event.handler.Appear.refresh();
      },

      /**
       * Get the focus handler
       *
       * @return {qx.event.handler.Focus} The focus handler
       */
      __getFocusHandler__P_98_7: function __getFocusHandler__P_98_7() {
        {
          if (!this.__focusHandler__P_98_3) {
            var eventManager = qx.event.Registration.getManager(window);
            this.__focusHandler__P_98_3 = eventManager.getHandler(qx.event.handler.Focus);
          }

          return this.__focusHandler__P_98_3;
        }
      },

      /**
       * Get the mouse capture element
       *
       * @return {Element} The mouse capture DOM element
       */
      __getCaptureElement__P_98_9: function __getCaptureElement__P_98_9() {
        {
          if (!this.__mouseCapture__P_98_4) {
            var eventManager = qx.event.Registration.getManager(window);
            this.__mouseCapture__P_98_4 = eventManager.getDispatcher(qx.event.dispatch.MouseCapture);
          }

          return this.__mouseCapture__P_98_4.getCaptureElement();
        }
      },

      /**
       * Whether the given DOM element will become invisible after the flush
       *
       * @param domElement {Element} The DOM element to check
       * @return {Boolean} Whether the element will become invisible
       */
      __willBecomeInvisible__P_98_8: function __willBecomeInvisible__P_98_8(domElement) {
        var element = this.fromDomElement(domElement);
        return element && !element._willBeSeeable();
      },

      /**
       * Finds the Widget for a given DOM element
       *
       * @param domElement {DOM} the DOM element
       * @return {qx.ui.core.Widget} the Widget that created the DOM element
       * @deprecated {6.1} see qx.html.Node.fromDomNode
       */
      fromDomElement: function fromDomElement(domElement) {
        return qx.html.Node.fromDomNode(domElement);
      },

      /**
       * Sets the default Root element
       *
       * @param root {Element} the new default root
       */
      setDefaultRoot: function setDefaultRoot(root) {
        {
          if (this._defaultRoot && root) {
            qx.log.Logger.warn(qx.html.Element, "Changing default root, from " + this._defaultRoot + " to " + root);
          }
        }
        this._defaultRoot = root;
      },

      /**
       * Returns the default root
       *
       * @return {Element} the default root
       */
      getDefaultRoot: function getDefaultRoot() {
        return this._defaultRoot;
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * @type{String} The primary CSS class for this element
       *
       * The implementation will add and remove this class from the list of classes,
       * this property is provided as a means to easily set the primary class.  Because
       * SCSS supports inheritance, it's more useful to be able to allow the SCSS
       * definition to control the inheritance hierarchy of classes.
       *
       * For example, a dialog could be implemented in code as a Dialog class derived from
       * a Window class, but the presentation may be so different that the theme author
       * would choose to not use inheritance at all.
       */
      cssClass: {
        init: null,
        nullable: true,
        check: "String",
        apply: "_applyCssClass"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        PROTECTED HELPERS/DATA
      ---------------------------------------------------------------------------
      */

      /** @type {Boolean} Marker for always visible root nodes (often the body node) */
      __root__P_98_14: false,
      __lazyScrollIntoViewX__P_98_12: null,
      __lazyScrollIntoViewY__P_98_13: null,
      __lazyScrollX__P_98_10: null,
      __lazyScrollY__P_98_11: null,
      __styleJobs__P_98_15: null,
      __attribJobs__P_98_16: null,
      __styleValues__P_98_0: null,
      __attribValues__P_98_1: null,

      /*
       * @Override
       */
      _createDomElement: function _createDomElement() {
        return qx.dom.Element.create(this._nodeName);
      },

      /*
       * @Override
       */
      serialize: function serialize(writer) {
        if (this.__childrenHaveChanged__P_98_17) {
          this.importQxObjectIds();
          this.__childrenHaveChanged__P_98_17 = false;
        }

        return qx.html.Element.superclass.prototype.serialize.call(this, writer);
      },

      /*
       * @Override
       */
      _serializeImpl: function _serializeImpl(writer) {
        writer("<", this._nodeName); // Copy attributes

        var data = this.__attribValues__P_98_1;

        if (data) {
          var Attribute = qx.bom.element.Attribute;

          for (var key in data) {
            writer(" ");
            Attribute.serialize(writer, key, data[key]);
          }
        } // Copy styles


        var data = this.__styleValues__P_98_0 || {};

        if (!this.isVisible()) {
          data = qx.lang.Object.clone(data);
          data.display = "none";
        }

        if (Object.keys(data).length) {
          var Style = qx.bom.element.Style;
          var css = Style.compile(data);

          if (css) {
            writer(' style="', css, '"');
          }
        } // Copy properties


        var data = this._properties;

        if (data) {
          for (var key in this._properties) {
            var property = this._properties[key];

            if (property.serialize) {
              writer(" ");
              property.serialize.call(this, writer, key, property);
            } else if (property.value !== undefined && property.value !== null) {
              writer(" ");
              var value = JSON.stringify(property.value);
              writer(key, "=", value);
            }
          }
        } // Children


        if (!this._children || !this._children.length) {
          if (qx.html.Element.__SELF_CLOSING_TAGS__P_98_5[this._nodeName]) {
            writer(">");
          } else {
            writer("></", this._nodeName, ">");
          }
        } else {
          writer(">");

          for (var i = 0; i < this._children.length; i++) {
            this._children[i]._serializeImpl(writer);
          }

          writer("</", this._nodeName, ">");
        }
      },

      /**
       * Connects a widget to this element, and to the DOM element in this Element.  They
       * remain associated until disposed or disconnectWidget is called
       *
       * @param widget {qx.ui.core.Widget} the widget to associate
       * @deprecated {6.1} see connectObject
       */
      connectWidget: function connectWidget(widget) {
        return this.connectObject(widget);
      },

      /**
       * Disconnects a widget from this element and the DOM element.  The DOM element remains
       * untouched, except that it can no longer be used to find the Widget.
       *
       * @param qxObject {qx.core.Object} the Widget
       * @deprecated {6.1} see disconnectObject
       */
      disconnectWidget: function disconnectWidget(widget) {
        return this.disconnectObject(widget);
      },

      /*
       * @Override
       */
      _addChildImpl: function _addChildImpl(child) {
        qx.html.Element.superclass.prototype._addChildImpl.call(this, child);

        this.__childrenHaveChanged__P_98_17 = true;
      },

      /*
       * @Override
       */
      _removeChildImpl: function _removeChildImpl(child) {
        qx.html.Element.superclass.prototype._removeChildImpl.call(this, child);

        this.__childrenHaveChanged__P_98_17 = true;
      },

      /*
       * @Override
       */
      getQxObject: function getQxObject(id) {
        if (this.__childrenHaveChanged__P_98_17) {
          this.importQxObjectIds();
          this.__childrenHaveChanged__P_98_17 = false;
        }

        return qx.html.Element.superclass.prototype.getQxObject.call(this, id);
      },

      /**
       * When a tree of virtual dom is loaded via JSX code, the paths in the `data-qx-object-id`
       * attribute are relative to the JSX, and these attribuite values need to be loaded into the
       * `qxObjectId` property - while resolving the parent parts of the path.
       *
       * EG
       *  <div data-qx-object-id="root">
       *    <div>
       *      <div data-qx-object-id="root/child">
       *
       * The root DIV has to take on the qxObjectId of "root", and the third DIV has to have the
       * ID "child" and be owned by the first DIV.
       *
       * This function imports and resolves those IDs
       */
      importQxObjectIds: function importQxObjectIds() {
        var _this = this;

        var thisId = this.getQxObjectId();
        var thisAttributeId = this.getAttribute("data-qx-object-id");

        if (thisId) {
          this.setAttribute("data-qx-object-id", thisId, true);
        } else if (thisAttributeId) {
          this.setQxObjectId(thisAttributeId);
        }

        var resolveImpl = function resolveImpl(node) {
          if (!(node instanceof qx.html.Element)) {
            return;
          }

          var id = node.getQxObjectId();
          var attributeId = node.getAttribute("data-qx-object-id");

          if (id) {
            if (attributeId && !attributeId.endsWith(id)) {
              _this.warn("Attribute ID ".concat(attributeId, " is not compatible with the qxObjectId ").concat(id, "; the qxObjectId will take prescedence"));
            }

            node.setAttribute("data-qx-object-id", id, true);
          } else if (attributeId) {
            var segs = attributeId ? attributeId.split("/") : []; // Only one segment is easy, add directly to the parent

            if (segs.length == 1) {
              var parentNode = _this;
              parentNode.addOwnedQxObject(node, attributeId); // Lots of segments
            } else if (segs.length > 1) {
              var _parentNode = null; // If the first segment is the outer parent

              if (segs[0] == thisAttributeId || segs[0] == thisId) {
                // Only two segments, means that the parent is the outer and the last segment
                //  is the ID of the node being examined
                if (segs.length == 2) {
                  _parentNode = _this; // Otherwise resolve it further
                } else {
                  // Extract the segments, exclude the first and last, and that leaves us with a relative ID path
                  var subId = qx.lang.Array.clone(segs);
                  subId.shift();
                  subId.pop();
                  subId = subId.join("/");
                  _parentNode = _this.getQxObject(subId);
                } // Not the outer node, then resolve as a global.

              } else {
                _parentNode = qx.core.Id.getQxObject(attributeId);
              }

              if (!_parentNode) {
                throw new Error("Cannot resolve object id ancestors, id=".concat(attributeId));
              }

              _parentNode.addOwnedQxObject(node, segs[segs.length - 1]);
            }
          }

          var children = node.getChildren();

          if (children) {
            children.forEach(resolveImpl);
          }
        };

        var children = this.getChildren();

        if (children) {
          children.forEach(resolveImpl);
        }
      },

      /*
      ---------------------------------------------------------------------------
        SUPPORT FOR ATTRIBUTE/STYLE/EVENT FLUSH
      ---------------------------------------------------------------------------
      */

      /**
       * Copies data between the internal representation and the DOM. This
       * simply copies all the data and only works well directly after
       * element creation. After this the data must be synced using {@link #_syncData}
       *
       * @param fromMarkup {Boolean} Whether the copy should respect styles
       *   given from markup
       */
      _copyData: function _copyData(fromMarkup, propertiesFromDom) {
        qx.html.Element.superclass.prototype._copyData.call(this, fromMarkup, propertiesFromDom);

        var elem = this._domNode; // Copy attributes

        var data = this.__attribValues__P_98_1;

        if (data) {
          var Attribute = qx.bom.element.Attribute;

          if (fromMarkup) {
            var str;
            var classes = {};
            str = this.getAttribute("class");
            (str ? str.split(" ") : []).forEach(function (name) {
              if (name.startsWith("qx-")) {
                classes[name] = true;
              }
            });
            str = Attribute.get(elem, "class");
            {
              if (str instanceof window.SVGAnimatedString) {
                str = str.baseVal;
              }
            }
            (str ? str.split(" ") : []).forEach(function (name) {
              return classes[name] = true;
            });
            classes = Object.keys(classes);
            var segs = classes;

            if (segs.length) {
              this.setCssClass(segs[0]);
              this.setAttribute("class", classes.join(" "));
            } else {
              this.setCssClass(null);
              this.setAttribute("class", null);
            }
          }

          for (var key in data) {
            Attribute.set(elem, key, data[key]);
          }
        } // Copy styles


        var data = this.__styleValues__P_98_0;

        if (data) {
          var Style = qx.bom.element.Style;

          if (fromMarkup) {
            Style.setStyles(elem, data);
          } else {
            // Set styles at once which is a lot faster in most browsers
            // compared to separate modifications of many single style properties.
            Style.setCss(elem, Style.compile(data));
          }
        } // Copy visibility


        if (!fromMarkup) {
          var display = elem.style.display || "";

          if (display == "" && !this.isVisible()) {
            elem.style.display = "none";
          } else if (display == "none" && this.isVisible()) {
            elem.style.display = "";
          }
        } else {
          var display = elem.style.display || "";
          this.setVisible(display != "none");
        }
      },

      /**
       * Synchronizes data between the internal representation and the DOM. This
       * is the counterpart of {@link #_copyData} and is used for further updates
       * after the element has been created.
       *
       */
      _syncData: function _syncData() {
        qx.html.Element.superclass.prototype._syncData.call(this);

        var elem = this._domNode;
        var Attribute = qx.bom.element.Attribute;
        var Style = qx.bom.element.Style; // Sync attributes

        var jobs = this.__attribJobs__P_98_16;

        if (jobs) {
          var data = this.__attribValues__P_98_1;

          if (data) {
            var value;

            for (var key in jobs) {
              value = data[key];

              if (value !== undefined) {
                Attribute.set(elem, key, value);
              } else {
                Attribute.reset(elem, key);
              }
            }
          }

          this.__attribJobs__P_98_16 = null;
        } // Sync styles


        var jobs = this.__styleJobs__P_98_15;

        if (jobs) {
          var data = this.__styleValues__P_98_0;

          if (data) {
            var styles = {};

            for (var key in jobs) {
              styles[key] = data[key];
            }

            Style.setStyles(elem, styles);
          }

          this.__styleJobs__P_98_15 = null;
        }
      },

      /*
      ---------------------------------------------------------------------------
        DOM ELEMENT ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the element's root flag, which indicates
       * whether the element should be a root element or not.
       * @param root {Boolean} The root flag.
       */
      setRoot: function setRoot(root) {
        if (root && !this.__root__P_98_14) {
          qx.html.Element._hasRoots++;
        } else if (!root && this.__root__P_98_14) {
          qx.html.Element._hasRoots--;
        }

        this.__root__P_98_14 = root;
      },

      /*
       * @Override
       */
      isRoot: function isRoot() {
        return this.__root__P_98_14;
      },

      /**
       * Uses existing markup for this element. This is mainly used
       * to insert pre-built markup blocks into the element hierarchy.
       *
       * @param html {String} HTML markup with one root element
       *   which is used as the main element for this instance.
       * @return {Element} The created DOM element
       */
      useMarkup: function useMarkup(html) {
        if (this._domNode) {
          throw new Error("Could not overwrite existing element!");
        } // Prepare extraction
        // We have a IE specific issue with "Unknown error" messages
        // when we try to use the same DOM node again. I am not sure
        // why this happens. Would be a good performance improvement,
        // but does not seem to work.


        if (qx.core.Environment.get("engine.name") == "mshtml") {
          var helper = document.createElement("div");
        } else {
          var helper = qx.dom.Element.getHelperElement();
        } // Extract first element


        helper.innerHTML = html;
        this.useElement(helper.firstChild);
        return this._domNode;
      },

      /**
       * Uses an existing element instead of creating one. This may be interesting
       * when the DOM element is directly needed to add content etc.
       *
       * @param elem {Element} Element to reuse
       * @deprecated {6.1} see useNode
       */
      useElement: function useElement(elem) {
        this.useNode(elem);
      },

      /**
       * Whether the element is focusable (or will be when created)
       *
       * @return {Boolean} <code>true</code> when the element is focusable.
       */
      isFocusable: function isFocusable() {
        var tabIndex = this.getAttribute("tabIndex");

        if (tabIndex >= 1) {
          return true;
        }

        var focusable = qx.event.handler.Focus.FOCUSABLE_ELEMENTS;

        if (tabIndex >= 0 && focusable[this._nodeName]) {
          return true;
        }

        return false;
      },

      /**
       * Set whether the element is selectable. It uses the qooxdoo attribute
       * qxSelectable with the values 'on' or 'off'.
       * In webkit, a special css property will be used (-webkit-user-select).
       *
       * @param value {Boolean} True, if the element should be selectable.
       */
      setSelectable: function setSelectable(value) {
        this.setAttribute("qxSelectable", value ? "on" : "off");
        var userSelect = qx.core.Environment.get("css.userselect");

        if (userSelect) {
          this.setStyle(userSelect, value ? "text" : qx.core.Environment.get("css.userselect.none"));
        }
      },

      /**
       * Whether the element is natively focusable (or will be when created)
       *
       * This ignores the configured tabIndex.
       *
       * @return {Boolean} <code>true</code> when the element is focusable.
       */
      isNativelyFocusable: function isNativelyFocusable() {
        return !!qx.event.handler.Focus.FOCUSABLE_ELEMENTS[this._nodeName];
      },

      /*
      ---------------------------------------------------------------------------
        ANIMATION SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Fades in the element.
       * @param duration {Number} Time in ms.
       * @return {qx.bom.element.AnimationHandle} The animation handle to react for
       *   the fade animation.
       */
      fadeIn: function fadeIn(duration) {
        var col = qxWeb(this._domNode);

        if (col.isPlaying()) {
          col.stop();
        } // create the element right away


        if (!this._domNode) {
          this.flush();
          col.push(this._domNode);
        }

        if (this._domNode) {
          col.fadeIn(duration).once("animationEnd", function () {
            this.show();
            qx.html.Element.flush();
          }, this);
          return col.getAnimationHandles()[0];
        }
      },

      /**
       * Fades out the element.
       * @param duration {Number} Time in ms.
       * @return {qx.bom.element.AnimationHandle} The animation handle to react for
       *   the fade animation.
       */
      fadeOut: function fadeOut(duration) {
        var col = qxWeb(this._domNode);

        if (col.isPlaying()) {
          col.stop();
        }

        if (this._domNode) {
          col.fadeOut(duration).once("animationEnd", function () {
            this.hide();
            qx.html.Element.flush();
          }, this);
          return col.getAnimationHandles()[0];
        }
      },

      /*
      ---------------------------------------------------------------------------
        VISIBILITY SUPPORT
      ---------------------------------------------------------------------------
      */

      /*
       * @Override
       */
      _applyVisible: function _applyVisible(value, oldValue) {
        qx.html.Element.superclass.prototype._applyVisible.call(this, value, oldValue);

        if (value) {
          if (this._domNode) {
            qx.html.Element._visibility[this.toHashCode()] = this;

            qx.html.Element._scheduleFlush("element");
          } // Must be sure that the element gets included into the DOM.


          if (this._parent) {
            this._parent._scheduleChildrenUpdate();
          }
        } else {
          if (this._domNode) {
            qx.html.Element._visibility[this.toHashCode()] = this;

            qx.html.Element._scheduleFlush("element");
          }
        }
      },

      /**
       * Marks the element as visible which means that a previously applied
       * CSS style of display=none gets removed and the element will inserted
       * into the DOM, when this had not already happened before.
       *
       * @return {qx.html.Element} this object (for chaining support)
       */
      show: function show() {
        this.setVisible(true);
        return this;
      },

      /**
       * Marks the element as hidden which means it will kept in DOM (if it
       * is already there, but configured hidden using a CSS style of display=none).
       *
       * @return {qx.html.Element} this object (for chaining support)
       */
      hide: function hide() {
        this.setVisible(false);
        return this;
      },

      /*
      ---------------------------------------------------------------------------
        SCROLL SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Scrolls the given child element into view. Only scrolls children.
       * Do not influence elements on top of this element.
       *
       * If the element is currently invisible it gets scrolled automatically
       * at the next time it is visible again (queued).
       *
       * @param elem {qx.html.Element} The element to scroll into the viewport.
       * @param align {String?null} Alignment of the element. Allowed values:
       *   <code>left</code> or <code>right</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param direct {Boolean?true} Whether the execution should be made
       *   directly when possible
       */
      scrollChildIntoViewX: function scrollChildIntoViewX(elem, align, direct) {
        var thisEl = this._domNode;
        var childEl = elem.getDomElement();

        if (direct !== false && thisEl && thisEl.offsetWidth && childEl && childEl.offsetWidth) {
          qx.bom.element.Scroll.intoViewX(childEl, thisEl, align);
        } else {
          this.__lazyScrollIntoViewX__P_98_12 = {
            element: elem,
            align: align
          };
          qx.html.Element._scroll[this.toHashCode()] = this;

          qx.html.Element._scheduleFlush("element");
        }

        delete this.__lazyScrollX__P_98_10;
      },

      /**
       * Scrolls the given child element into view. Only scrolls children.
       * Do not influence elements on top of this element.
       *
       * If the element is currently invisible it gets scrolled automatically
       * at the next time it is visible again (queued).
       *
       * @param elem {qx.html.Element} The element to scroll into the viewport.
       * @param align {String?null} Alignment of the element. Allowed values:
       *   <code>top</code> or <code>bottom</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param direct {Boolean?true} Whether the execution should be made
       *   directly when possible
       */
      scrollChildIntoViewY: function scrollChildIntoViewY(elem, align, direct) {
        var thisEl = this._domNode;
        var childEl = elem.getDomElement();

        if (direct !== false && thisEl && thisEl.offsetWidth && childEl && childEl.offsetWidth) {
          qx.bom.element.Scroll.intoViewY(childEl, thisEl, align);
        } else {
          this.__lazyScrollIntoViewY__P_98_13 = {
            element: elem,
            align: align
          };
          qx.html.Element._scroll[this.toHashCode()] = this;

          qx.html.Element._scheduleFlush("element");
        }

        delete this.__lazyScrollY__P_98_11;
      },

      /**
       * Scrolls the element to the given left position.
       *
       * @param x {Integer} Horizontal scroll position
       * @param lazy {Boolean?false} Whether the scrolling should be performed
       *    during element flush.
       */
      scrollToX: function scrollToX(x, lazy) {
        var thisEl = this._domNode;

        if (lazy !== true && thisEl && thisEl.offsetWidth) {
          thisEl.scrollLeft = x;
          delete this.__lazyScrollX__P_98_10;
        } else {
          this.__lazyScrollX__P_98_10 = x;
          qx.html.Element._scroll[this.toHashCode()] = this;

          qx.html.Element._scheduleFlush("element");
        }

        delete this.__lazyScrollIntoViewX__P_98_12;
      },

      /**
       * Get the horizontal scroll position.
       *
       * @return {Integer} Horizontal scroll position
       */
      getScrollX: function getScrollX() {
        var thisEl = this._domNode;

        if (thisEl) {
          return thisEl.scrollLeft;
        }

        return this.__lazyScrollX__P_98_10 || 0;
      },

      /**
       * Scrolls the element to the given top position.
       *
       * @param y {Integer} Vertical scroll position
       * @param lazy {Boolean?false} Whether the scrolling should be performed
       *    during element flush.
       */
      scrollToY: function scrollToY(y, lazy) {
        var thisEl = this._domNode;

        if (lazy !== true && thisEl && thisEl.offsetWidth) {
          thisEl.scrollTop = y;
          delete this.__lazyScrollY__P_98_11;
        } else {
          this.__lazyScrollY__P_98_11 = y;
          qx.html.Element._scroll[this.toHashCode()] = this;

          qx.html.Element._scheduleFlush("element");
        }

        delete this.__lazyScrollIntoViewY__P_98_13;
      },

      /**
       * Get the vertical scroll position.
       *
       * @return {Integer} Vertical scroll position
       */
      getScrollY: function getScrollY() {
        var thisEl = this._domNode;

        if (thisEl) {
          return thisEl.scrollTop;
        }

        return this.__lazyScrollY__P_98_11 || 0;
      },

      /**
       * Disables browser-native scrolling
       */
      disableScrolling: function disableScrolling() {
        this.enableScrolling();
        this.scrollToX(0);
        this.scrollToY(0);
        this.addListener("scroll", this.__onScroll__P_98_18, this);
      },

      /**
       * Re-enables browser-native scrolling
       */
      enableScrolling: function enableScrolling() {
        this.removeListener("scroll", this.__onScroll__P_98_18, this);
      },
      __inScroll__P_98_19: null,

      /**
       * Handler for the scroll-event
       *
       * @param e {qx.event.type.Native} scroll-event
       */
      __onScroll__P_98_18: function __onScroll__P_98_18(e) {
        if (!this.__inScroll__P_98_19) {
          this.__inScroll__P_98_19 = true;
          this._domNode.scrollTop = 0;
          this._domNode.scrollLeft = 0;
          delete this.__inScroll__P_98_19;
        }
      },

      /*
      ---------------------------------------------------------------------------
        TEXT SUPPORT
      ---------------------------------------------------------------------------
      */

      /*
       * Sets the text value of this element; it will delete children first, except
       * for the first node which (if it is a Text node) will have it's value updated
       *
       * @param value {String} the text to set
       */
      setText: function setText(value) {
        var self = this;
        var children = this._children ? qx.lang.Array.clone(this._children) : [];

        if (children[0] instanceof qx.html.Text) {
          children[0].setText(value);
          children.shift();
          children.forEach(function (child) {
            self.remove(child);
          });
        } else {
          children.forEach(function (child) {
            self.remove(child);
          });
          this.add(new qx.html.Text(value));
        }
      },

      /**
       * Returns the text value, accumulated from all child nodes
       *
       * @return {String} the text value
       */
      getText: function getText() {
        var result = [];

        if (this._children) {
          this._children.forEach(function (child) {
            result.push(child.getText());
          });
        }

        return result.join("");
      },

      /**
       * Get the selection of the element.
       *
       * If the underlaying DOM element is not yet created, this methods returns
       * a null value.
       *
       * @return {String|null}
       */
      getTextSelection: function getTextSelection() {
        var el = this._domNode;

        if (el) {
          return qx.bom.Selection.get(el);
        }

        return null;
      },

      /**
       * Get the length of selection of the element.
       *
       * If the underlaying DOM element is not yet created, this methods returns
       * a null value.
       *
       * @return {Integer|null}
       */
      getTextSelectionLength: function getTextSelectionLength() {
        var el = this._domNode;

        if (el) {
          return qx.bom.Selection.getLength(el);
        }

        return null;
      },

      /**
       * Get the start of the selection of the element.
       *
       * If the underlaying DOM element is not yet created, this methods returns
       * a null value.
       *
       * @return {Integer|null}
       */
      getTextSelectionStart: function getTextSelectionStart() {
        var el = this._domNode;

        if (el) {
          return qx.bom.Selection.getStart(el);
        }

        return null;
      },

      /**
       * Get the end of the selection of the element.
       *
       * If the underlaying DOM element is not yet created, this methods returns
       * a null value.
       *
       * @return {Integer|null}
       */
      getTextSelectionEnd: function getTextSelectionEnd() {
        var el = this._domNode;

        if (el) {
          return qx.bom.Selection.getEnd(el);
        }

        return null;
      },

      /**
       * Set the selection of the element with the given start and end value.
       * If no end value is passed the selection will extend to the end.
       *
       * This method only works if the underlying DOM element is already created.
       *
       * @param start {Integer} start of the selection (zero based)
       * @param end {Integer} end of the selection
       */
      setTextSelection: function setTextSelection(start, end) {
        var el = this._domNode;

        if (el) {
          qx.bom.Selection.set(el, start, end);
          return;
        } // if element not created, save the selection for flushing


        qx.html.Element.__selection__P_98_2[this.toHashCode()] = {
          element: this,
          start: start,
          end: end
        };

        qx.html.Element._scheduleFlush("element");
      },

      /**
       * Clears the selection of the element.
       *
       * This method only works if the underlying DOM element is already created.
       *
       */
      clearTextSelection: function clearTextSelection() {
        var el = this._domNode;

        if (el) {
          qx.bom.Selection.clear(el);
        }

        delete qx.html.Element.__selection__P_98_2[this.toHashCode()];
      },

      /*
      ---------------------------------------------------------------------------
        FOCUS/ACTIVATE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Takes the action to process as argument and queues this action if the
       * underlying DOM element is not yet created.
       *
       * Note that "actions" are functions in `qx.bom.Element` and only apply to
       * environments with a user interface.  This will throw an error if the user
       * interface is headless
       *
       * @param action {String} action to queue
       * @param args {Array} optional list of arguments for the action
       */
      __performAction__P_98_20: function __performAction__P_98_20(action, args) {
        {
          var actions = qx.html.Element._actions;
          actions.push({
            type: action,
            element: this,
            args: args || []
          });

          qx.html.Element._scheduleFlush("element");
        }
      },

      /**
       * Focus this element.
       *
       * If the underlaying DOM element is not yet created, the
       * focus is queued for processing after the element creation.
       *
       * Silently does nothing when in a headless environment
       */
      focus: function focus() {
        {
          this.__performAction__P_98_20("focus");
        }
      },

      /**
       * Mark this element to get blurred on the next flush of the queue
       *
       * Silently does nothing when in a headless environment
       *
       */
      blur: function blur() {
        {
          this.__performAction__P_98_20("blur");
        }
      },

      /**
       * Mark this element to get activated on the next flush of the queue
       *
       * Silently does nothing when in a headless environment
       *
       */
      activate: function activate() {
        {
          this.__performAction__P_98_20("activate");
        }
      },

      /**
       * Mark this element to get deactivated on the next flush of the queue
       *
       * Silently does nothing when in a headless environment
       *
       */
      deactivate: function deactivate() {
        {
          this.__performAction__P_98_20("deactivate");
        }
      },

      /**
       * Captures all mouse events to this element
       *
       * Silently does nothing when in a headless environment
       *
       * @param containerCapture {Boolean?true} If true all events originating in
       *   the container are captured. If false events originating in the container
       *   are not captured.
       */
      capture: function capture(containerCapture) {
        {
          this.__performAction__P_98_20("capture", [containerCapture !== false]);
        }
      },

      /**
       * Releases this element from a previous {@link #capture} call
       *
       * Silently does nothing when in a headless environment
       */
      releaseCapture: function releaseCapture() {
        {
          this.__performAction__P_98_20("releaseCapture");
        }
      },

      /*
      ---------------------------------------------------------------------------
        STYLE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Set up the given style attribute
       *
       * @param key {String} the name of the style attribute
       * @param value {var} the value
       * @param direct {Boolean?false} Whether the value should be applied
       *    directly (without queuing)
       * @return {qx.html.Element} this object (for chaining support)
       */
      setStyle: function setStyle(key, value, direct) {
        if (!this.__styleValues__P_98_0) {
          this.__styleValues__P_98_0 = {};
        }

        if (this.__styleValues__P_98_0[key] == value) {
          return this;
        }

        this._applyStyle(key, value, this.__styleValues__P_98_0[key]);

        if (value == null) {
          delete this.__styleValues__P_98_0[key];
        } else {
          this.__styleValues__P_98_0[key] = value;
        } // Uncreated elements simply copy all data
        // on creation. We don't need to remember any
        // jobs. It is a simple full list copy.


        if (this._domNode) {
          // Omit queuing in direct mode
          if (direct) {
            qx.bom.element.Style.set(this._domNode, key, value);
            return this;
          } // Dynamically create if needed


          if (!this.__styleJobs__P_98_15) {
            this.__styleJobs__P_98_15 = {};
          } // Store job info


          this.__styleJobs__P_98_15[key] = true; // Register modification

          qx.html.Element._modified[this.toHashCode()] = this;

          qx.html.Element._scheduleFlush("element");
        }

        return this;
      },

      /**
       * Called by setStyle when a value of a style changes; this is intended to be
       * overridden to allow the element to update properties etc according to the
       * style
       *
       * @param key {String} the style value
       * @param value {String?} the value to set
       * @param oldValue {String?} The previous value (not from DOM)
       */
      _applyStyle: function _applyStyle(key, value, oldValue) {// Nothing
      },

      /**
       * Convenience method to modify a set of styles at once.
       *
       * @param map {Map} a map where the key is the name of the property
       *    and the value is the value to use.
       * @param direct {Boolean?false} Whether the values should be applied
       *    directly (without queuing)
       * @return {qx.html.Element} this object (for chaining support)
       */
      setStyles: function setStyles(map, direct) {
        // inline calls to "set" because this method is very
        // performance critical!
        var Style = qx.bom.element.Style;

        if (!this.__styleValues__P_98_0) {
          this.__styleValues__P_98_0 = {};
        }

        if (this._domNode) {
          // Dynamically create if needed
          if (!this.__styleJobs__P_98_15) {
            this.__styleJobs__P_98_15 = {};
          }

          for (var key in map) {
            var value = map[key];

            if (this.__styleValues__P_98_0[key] == value) {
              continue;
            }

            this._applyStyle(key, value, this.__styleValues__P_98_0[key]);

            if (value == null) {
              delete this.__styleValues__P_98_0[key];
            } else {
              this.__styleValues__P_98_0[key] = value;
            } // Omit queuing in direct mode


            if (direct) {
              Style.set(this._domNode, key, value);
              continue;
            } // Store job info


            this.__styleJobs__P_98_15[key] = true;
          } // Register modification


          qx.html.Element._modified[this.toHashCode()] = this;

          qx.html.Element._scheduleFlush("element");
        } else {
          for (var key in map) {
            var value = map[key];

            if (this.__styleValues__P_98_0[key] == value) {
              continue;
            }

            this._applyStyle(key, value, this.__styleValues__P_98_0[key]);

            if (value == null) {
              delete this.__styleValues__P_98_0[key];
            } else {
              this.__styleValues__P_98_0[key] = value;
            }
          }
        }

        return this;
      },

      /**
       * Removes the given style attribute
       *
       * @param key {String} the name of the style attribute
       * @param direct {Boolean?false} Whether the value should be removed
       *    directly (without queuing)
       * @return {qx.html.Element} this object (for chaining support)
       */
      removeStyle: function removeStyle(key, direct) {
        this.setStyle(key, null, direct);
        return this;
      },

      /**
       * Get the value of the given style attribute.
       *
       * @param key {String} name of the style attribute
       * @return {var} the value of the style attribute
       */
      getStyle: function getStyle(key) {
        return this.__styleValues__P_98_0 ? this.__styleValues__P_98_0[key] : null;
      },

      /**
       * Returns a map of all styles. Do not modify the result map!
       *
       * @return {Map} All styles or <code>null</code> when none are configured.
       */
      getAllStyles: function getAllStyles() {
        return this.__styleValues__P_98_0 || null;
      },

      /*
      ---------------------------------------------------------------------------
        CSS CLASS SUPPORT
      ---------------------------------------------------------------------------
      */
      __breakClasses__P_98_21: function __breakClasses__P_98_21() {
        var map = {};
        (this.getAttribute("class") || "").split(" ").forEach(function (name) {
          if (name) {
            map[name.toLowerCase()] = name;
          }
        });
        return map;
      },
      __combineClasses__P_98_22: function __combineClasses__P_98_22(map) {
        var primaryClass = this.getCssClass();
        var arr = [];

        if (primaryClass) {
          arr.push(primaryClass);
          delete map[primaryClass.toLowerCase()];
        }

        qx.lang.Array.append(arr, Object.values(map));
        return arr.length ? arr.join(" ") : null;
      },

      /**
       * Adds a css class to the element.
       *
       * @param name {String} Name of the CSS class.
       * @return {Element} this, for chaining
       */
      addClass: function addClass(name) {
        var _this2 = this;

        var classes = this.__breakClasses__P_98_21();

        var primaryClass = (this.getCssClass() || "").toLowerCase();
        name.split(" ").forEach(function (name) {
          var nameLower = name.toLowerCase();

          if (nameLower == primaryClass) {
            _this2.setCssClass(null);
          }

          classes[nameLower] = name;
        });
        this.setAttribute("class", this.__combineClasses__P_98_22(classes));
        return this;
      },

      /**
       * Removes a CSS class from the current element.
       *
       * @param name {String} Name of the CSS class.
       * @return {Element} this, for chaining
       */
      removeClass: function removeClass(name) {
        var _this3 = this;

        var classes = this.__breakClasses__P_98_21();

        var primaryClass = (this.getCssClass() || "").toLowerCase();
        name.split(" ").forEach(function (name) {
          var nameLower = name.toLowerCase();

          if (nameLower == primaryClass) {
            _this3.setCssClass(null);
          }

          delete classes[nameLower];
        });
        this.setAttribute("class", this.__combineClasses__P_98_22(classes));
        return this;
      },

      /**
       * Removes all CSS classed from the current element.
       */
      removeAllClasses: function removeAllClasses() {
        this.setCssClass(null);
        this.setAttribute("class", "");
      },

      /**
       * Apply method for cssClass
       */
      _applyCssClass: function _applyCssClass(value, oldValue) {
        var classes = this.__breakClasses__P_98_21();

        if (oldValue) {
          oldValue.split(" ").forEach(function (name) {
            return delete classes[name.toLowerCase()];
          });
        }

        if (value) {
          value.split(" ").forEach(function (name) {
            return classes[name.toLowerCase()] = name;
          });
        }

        this.setAttribute("class", this.__combineClasses__P_98_22(classes));
      },

      /*
      ---------------------------------------------------------------------------
        SIZE AND POSITION SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the size and position of this element; this is just a helper method that wraps
       * the calls to qx.bom.*
       *
       * Supported modes:
       *
       * * <code>margin</code>: Calculate from the margin box of the element (bigger than the visual appearance: including margins of given element)
       * * <code>box</code>: Calculates the offset box of the element (default, uses the same size as visible)
       * * <code>border</code>: Calculate the border box (useful to align to border edges of two elements).
       * * <code>scroll</code>: Calculate the scroll box (relevant for absolute positioned content).
       * * <code>padding</code>: Calculate the padding box (relevant for static/relative positioned content).
       *
       * @param mode {String} the type of size required, see above
       * @return {Object} a map, containing:
       *  left, right, top, bottom - document co-ords
       *  content - Object, containing:
       *    width, height: maximum permissible content size
       */
      getDimensions: function getDimensions(mode) {
        if (!this._domNode) {
          return {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            width: 0,
            height: 0,
            content: {
              width: 0,
              height: 0
            }
          };
        }

        var loc = qx.bom.element.Location.get(this._domNode, mode);
        loc.content = qx.bom.element.Dimension.getContentSize(this._domNode);
        loc.width = loc.right - loc.left;
        loc.height = loc.bottom - loc.top;
        return loc;
      },

      /**
       * Detects whether the DOM Node is visible
       */
      canBeSeen: function canBeSeen() {
        if (this._domNode && this.isVisible()) {
          var rect = this._domNode.getBoundingClientRect();

          if (rect.top > 0 || rect.left > 0 || rect.width > 0 || rect.height > 0) {
            return true;
          }
        }

        return false;
      },

      /*
      ---------------------------------------------------------------------------
        ATTRIBUTE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Set up the given attribute
       *
       * @param key {String} the name of the attribute
       * @param value {var} the value
       * @param direct {Boolean?false} Whether the value should be applied
       *    directly (without queuing)
       * @return {qx.html.Element} this object (for chaining support)
       */
      setAttribute: function setAttribute(key, value, direct) {
        if (!this.__attribValues__P_98_1) {
          this.__attribValues__P_98_1 = {};
        }

        if (this.__attribValues__P_98_1[key] == value) {
          return this;
        }

        if (value == null) {
          delete this.__attribValues__P_98_1[key];
        } else {
          this.__attribValues__P_98_1[key] = value;
        }

        if (key == "data-qx-object-id") {
          this.setQxObjectId(value);
        } // Uncreated elements simply copy all data
        // on creation. We don't need to remember any
        // jobs. It is a simple full list copy.


        if (this._domNode) {
          // Omit queuing in direct mode
          if (direct) {
            qx.bom.element.Attribute.set(this._domNode, key, value);
            return this;
          } // Dynamically create if needed


          if (!this.__attribJobs__P_98_16) {
            this.__attribJobs__P_98_16 = {};
          } // Store job info


          this.__attribJobs__P_98_16[key] = true; // Register modification

          qx.html.Element._modified[this.toHashCode()] = this;

          qx.html.Element._scheduleFlush("element");
        }

        return this;
      },

      /**
       * Convenience method to modify a set of attributes at once.
       *
       * @param map {Map} a map where the key is the name of the property
       *    and the value is the value to use.
       * @param direct {Boolean?false} Whether the values should be applied
       *    directly (without queuing)
       * @return {qx.html.Element} this object (for chaining support)
       */
      setAttributes: function setAttributes(map, direct) {
        for (var key in map) {
          this.setAttribute(key, map[key], direct);
        }

        return this;
      },

      /**
       * Removes the given attribute
       *
       * @param key {String} the name of the attribute
       * @param direct {Boolean?false} Whether the value should be removed
       *    directly (without queuing)
       * @return {qx.html.Element} this object (for chaining support)
       */
      removeAttribute: function removeAttribute(key, direct) {
        return this.setAttribute(key, null, direct);
      },

      /**
       * Get the value of the given attribute.
       *
       * @param key {String} name of the attribute
       * @return {var} the value of the attribute
       */
      getAttribute: function getAttribute(key) {
        return this.__attribValues__P_98_1 ? this.__attribValues__P_98_1[key] : null;
      }
    },

    /*
     *****************************************************************************
        DEFER
     *****************************************************************************
     */
    defer: function defer(statics) {
      statics.__deferredCall__P_98_6 = new qx.util.DeferredCall(statics.flush, statics);
      statics.__SELF_CLOSING_TAGS__P_98_5 = {};
      ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"].forEach(function (tagName) {
        statics.__SELF_CLOSING_TAGS__P_98_5[tagName] = true;
      });
    },

    /*
    *****************************************************************************
       DESTRUCT
    *****************************************************************************
    */
    destruct: function destruct() {
      var hash = this.toHashCode();

      if (hash) {
        delete qx.html.Element._modified[hash];
        delete qx.html.Element._scroll[hash];
      }

      this.setRoot(false);
      this.__attribValues__P_98_1 = this.__styleValues__P_98_0 = this.__attribJobs__P_98_16 = this.__styleJobs__P_98_15 = this.__lazyScrollIntoViewX__P_98_12 = this.__lazyScrollIntoViewY__P_98_13 = null;
    }
  });
  qx.html.Element.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.theme.manager.Meta": {
        "construct": true
      },
      "qx.util.PropertyUtil": {},
      "qx.ui.core.queue.Layout": {},
      "qx.core.Init": {},
      "qx.ui.core.queue.Visibility": {},
      "qx.lang.Object": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.dyntheme": {
          "load": true
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The base class of all items, which should be laid out using a layout manager
   * {@link qx.ui.layout.Abstract}.
   */
  qx.Class.define("qx.ui.core.LayoutItem", {
    type: "abstract",
    extend: qx.core.Object,
    construct: function construct() {
      qx.core.Object.constructor.call(this); // dynamic theme switch

      {
        qx.theme.manager.Meta.getInstance().addListener("changeTheme", this._onChangeTheme, this);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /*
      ---------------------------------------------------------------------------
        DIMENSION
      ---------------------------------------------------------------------------
      */

      /**
       * The user provided minimal width.
       *
       * Also take a look at the related properties {@link #width} and {@link #maxWidth}.
       */
      minWidth: {
        check: "Integer",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /**
       * The <code>LayoutItem</code>'s preferred width.
       *
       * The computed width may differ from the given width due to
       * stretching. Also take a look at the related properties
       * {@link #minWidth} and {@link #maxWidth}.
       */
      width: {
        check: "Integer",
        event: "changeWidth",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /**
       * The user provided maximal width.
       *
       * Also take a look at the related properties {@link #width} and {@link #minWidth}.
       */
      maxWidth: {
        check: "Integer",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /**
       * The user provided minimal height.
       *
       * Also take a look at the related properties {@link #height} and {@link #maxHeight}.
       */
      minHeight: {
        check: "Integer",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /**
       * The item's preferred height.
       *
       * The computed height may differ from the given height due to
       * stretching. Also take a look at the related properties
       * {@link #minHeight} and {@link #maxHeight}.
       */
      height: {
        check: "Integer",
        event: "changeHeight",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /**
       * The user provided maximum height.
       *
       * Also take a look at the related properties {@link #height} and {@link #minHeight}.
       */
      maxHeight: {
        check: "Integer",
        nullable: true,
        apply: "_applyDimension",
        init: null,
        themeable: true
      },

      /*
      ---------------------------------------------------------------------------
        STRETCHING
      ---------------------------------------------------------------------------
      */

      /** Whether the item can grow horizontally. */
      allowGrowX: {
        check: "Boolean",
        apply: "_applyStretching",
        init: true,
        themeable: true
      },

      /** Whether the item can shrink horizontally. */
      allowShrinkX: {
        check: "Boolean",
        apply: "_applyStretching",
        init: true,
        themeable: true
      },

      /** Whether the item can grow vertically. */
      allowGrowY: {
        check: "Boolean",
        apply: "_applyStretching",
        init: true,
        themeable: true
      },

      /** Whether the item can shrink vertically. */
      allowShrinkY: {
        check: "Boolean",
        apply: "_applyStretching",
        init: true,
        themeable: true
      },

      /** Growing and shrinking in the horizontal direction */
      allowStretchX: {
        group: ["allowGrowX", "allowShrinkX"],
        mode: "shorthand",
        themeable: true
      },

      /** Growing and shrinking in the vertical direction */
      allowStretchY: {
        group: ["allowGrowY", "allowShrinkY"],
        mode: "shorthand",
        themeable: true
      },

      /*
      ---------------------------------------------------------------------------
        MARGIN
      ---------------------------------------------------------------------------
      */

      /** Margin of the widget (top) */
      marginTop: {
        check: "Integer",
        init: 0,
        apply: "_applyMargin",
        themeable: true
      },

      /** Margin of the widget (right) */
      marginRight: {
        check: "Integer",
        init: 0,
        apply: "_applyMargin",
        themeable: true
      },

      /** Margin of the widget (bottom) */
      marginBottom: {
        check: "Integer",
        init: 0,
        apply: "_applyMargin",
        themeable: true
      },

      /** Margin of the widget (left) */
      marginLeft: {
        check: "Integer",
        init: 0,
        apply: "_applyMargin",
        themeable: true
      },

      /**
       * The 'margin' property is a shorthand property for setting 'marginTop',
       * 'marginRight', 'marginBottom' and 'marginLeft' at the same time.
       *
       * If four values are specified they apply to top, right, bottom and left respectively.
       * If there is only one value, it applies to all sides, if there are two or three,
       * the missing values are taken from the opposite side.
       */
      margin: {
        group: ["marginTop", "marginRight", "marginBottom", "marginLeft"],
        mode: "shorthand",
        themeable: true
      },

      /*
      ---------------------------------------------------------------------------
        ALIGN
      ---------------------------------------------------------------------------
      */

      /**
       * Horizontal alignment of the item in the parent layout.
       *
       * Note: Item alignment is only supported by {@link LayoutItem} layouts where
       * it would have a visual effect. Except for {@link Spacer}, which provides
       * blank space for layouts, all classes that inherit {@link LayoutItem} support alignment.
       */
      alignX: {
        check: ["left", "center", "right"],
        nullable: true,
        apply: "_applyAlign",
        themeable: true
      },

      /**
       * Vertical alignment of the item in the parent layout.
       *
       * Note: Item alignment is only supported by {@link LayoutItem} layouts where
       * it would have a visual effect. Except for {@link Spacer}, which provides
       * blank space for layouts, all classes that inherit {@link LayoutItem} support alignment.
       */
      alignY: {
        check: ["top", "middle", "bottom", "baseline"],
        nullable: true,
        apply: "_applyAlign",
        themeable: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */

    /* eslint-disable @qooxdoo/qx/no-refs-in-members */
    members: {
      /*
      ---------------------------------------------------------------------------
        DYNAMIC THEME SWITCH SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Handler for the dynamic theme change.
       * @signature function()
       */
      _onChangeTheme: qx.core.Environment.select("qx.dyntheme", {
        "true": function _true() {
          // reset all themeable properties
          var props = qx.util.PropertyUtil.getAllProperties(this.constructor);

          for (var name in props) {
            var desc = props[name]; // only themeable properties not having a user value

            if (desc.themeable) {
              var userValue = qx.util.PropertyUtil.getUserValue(this, name);

              if (userValue == null) {
                qx.util.PropertyUtil.resetThemed(this, name);
              }
            }
          }
        },
        "false": null
      }),

      /*
      ---------------------------------------------------------------------------
        LAYOUT PROCESS
      ---------------------------------------------------------------------------
      */

      /** @type {Integer} The computed height */
      __computedHeightForWidth__P_104_0: null,

      /** @type {Map} The computed size of the layout item */
      __computedLayout__P_104_1: null,

      /** @type {Boolean} Whether the current layout is valid */
      __hasInvalidLayout__P_104_2: null,

      /** @type {Map} Cached size hint */
      __sizeHint__P_104_3: null,

      /** @type {Boolean} Whether the margins have changed and must be updated */
      __updateMargin__P_104_4: null,

      /** @type {Map} user provided bounds of the widget, which override the layout manager */
      __userBounds__P_104_5: null,

      /** @type {Map} The item's layout properties */
      __layoutProperties__P_104_6: null,

      /**
       * Get the computed location and dimension as computed by
       * the layout manager.
       *
       * @return {Map|null} The location and dimensions in pixel
       *    (if the layout is valid). Contains the keys
       *    <code>width</code>, <code>height</code>, <code>left</code> and
       *    <code>top</code>.
       */
      getBounds: function getBounds() {
        return this.__userBounds__P_104_5 || this.__computedLayout__P_104_1 || null;
      },

      /**
       * Reconfigure number of separators
       */
      clearSeparators: function clearSeparators() {// empty template
      },

      /**
       * Renders a separator between two children
       *
       * @param separator {String|qx.ui.decoration.IDecorator} The separator to render
       * @param bounds {Map} Contains the left and top coordinate and the width and height
       *    of the separator to render.
       */
      renderSeparator: function renderSeparator(separator, bounds) {// empty template
      },

      /**
       * Used by the layout engine to apply coordinates and dimensions.
       *
       * @param left {Integer} Any integer value for the left position,
       *   always in pixels
       * @param top {Integer} Any integer value for the top position,
       *   always in pixels
       * @param width {Integer} Any positive integer value for the width,
       *   always in pixels
       * @param height {Integer} Any positive integer value for the height,
       *   always in pixels
       * @return {Map} A map of which layout sizes changed.
       */
      renderLayout: function renderLayout(left, top, width, height) {
        // do not render if the layout item is already disposed
        if (this.isDisposed()) {
          return null;
        }

        {
          var msg = "Something went wrong with the layout of " + this.toString() + "!";
          this.assertInteger(left, "Wrong 'left' argument. " + msg);
          this.assertInteger(top, "Wrong 'top' argument. " + msg);
          this.assertInteger(width, "Wrong 'width' argument. " + msg);
          this.assertInteger(height, "Wrong 'height' argument. " + msg); // this.assertInRange(width, this.getMinWidth() || -1, this.getMaxWidth() || 32000);
          // this.assertInRange(height, this.getMinHeight() || -1, this.getMaxHeight() || 32000);
        } // Detect size changes
        // Dynamically create data structure for computed layout

        var computed = this.__computedLayout__P_104_1;

        if (!computed) {
          computed = this.__computedLayout__P_104_1 = {};
        } // Detect changes


        var changes = {};

        if (left !== computed.left || top !== computed.top) {
          changes.position = true;
          computed.left = left;
          computed.top = top;
        }

        if (width !== computed.width || height !== computed.height) {
          changes.size = true;
          computed.width = width;
          computed.height = height;
        } // Clear invalidation marker


        if (this.__hasInvalidLayout__P_104_2) {
          changes.local = true;
          delete this.__hasInvalidLayout__P_104_2;
        }

        if (this.__updateMargin__P_104_4) {
          changes.margin = true;
          delete this.__updateMargin__P_104_4;
        }
        /*
         * Height for width support
         *
         * Results into a re-layout which means that width/height is applied in the next iteration.
         *
         * Note that it is important that this happens after the above first pass at calculating a
         * computed size because otherwise getBounds() will return null, and this will cause an
         * issue where the existing size is expected to have already been applied by the layout.
         * See https://github.com/qooxdoo/qooxdoo/issues/9553
         */


        if (this.getHeight() == null && this._hasHeightForWidth()) {
          var flowHeight = this._getHeightForWidth(width);

          if (flowHeight != null && flowHeight !== this.__computedHeightForWidth__P_104_0) {
            // This variable is used in the next computation of the size hint
            this.__computedHeightForWidth__P_104_0 = flowHeight; // Re-add to layout queue

            qx.ui.core.queue.Layout.add(this);
          }
        } // Returns changes, especially for deriving classes


        return changes;
      },

      /**
       * Whether the item should be excluded from the layout
       *
       * @return {Boolean} Should the item be excluded by the layout
       */
      isExcluded: function isExcluded() {
        return false;
      },

      /**
       * Whether the layout of this item (to layout the children)
       * is valid.
       *
       * @return {Boolean} Returns <code>true</code>
       */
      hasValidLayout: function hasValidLayout() {
        return !this.__hasInvalidLayout__P_104_2;
      },

      /**
       * Indicate that the item has layout changes and propagate this information
       * up the item hierarchy.
       *
       */
      scheduleLayoutUpdate: function scheduleLayoutUpdate() {
        qx.ui.core.queue.Layout.add(this);
      },

      /**
       * Called by the layout manager to mark this item's layout as invalid.
       * This function should clear all layout relevant caches.
       */
      invalidateLayoutCache: function invalidateLayoutCache() {
        // this.debug("Mark layout invalid!");
        this.__hasInvalidLayout__P_104_2 = true;
        this.__sizeHint__P_104_3 = null;
      },

      /**
       * A size hint computes the dimensions of a widget. It returns
       * the recommended dimensions as well as the min and max dimensions.
       * The min and max values already respect the stretching properties.
       *
       * <h3>Wording</h3>
       * <ul>
       * <li>User value: Value defined by the widget user, using the size properties</li>
       *
       * <li>Layout value: The value computed by {@link qx.ui.core.Widget#_getContentHint}</li>
       * </ul>
       *
       * <h3>Algorithm</h3>
       * <ul>
       * <li>minSize: If the user min size is not null, the user value is taken,
       *     otherwise the layout value is used.</li>
       *
       * <li>(preferred) size: If the user value is not null the user value is used,
       *     otherwise the layout value is used.</li>
       *
       * <li>max size: Same as the preferred size.</li>
       * </ul>
       *
       * @param compute {Boolean?true} Automatically compute size hint if currently not
       *   cached?
       * @return {Map} The map with the preferred width/height and the allowed
       *   minimum and maximum values in cases where shrinking or growing
       *   is required.
       */
      getSizeHint: function getSizeHint(compute) {
        var hint = this.__sizeHint__P_104_3;

        if (hint) {
          return hint;
        }

        if (compute === false) {
          return null;
        } // Compute as defined


        hint = this.__sizeHint__P_104_3 = this._computeSizeHint(); // Respect height for width

        if (this._hasHeightForWidth() && this.__computedHeightForWidth__P_104_0 && this.getHeight() == null) {
          hint.height = this.__computedHeightForWidth__P_104_0;
        } // normalize width


        if (hint.minWidth > hint.width) {
          hint.width = hint.minWidth;
        }

        if (hint.maxWidth < hint.width) {
          hint.width = hint.maxWidth;
        }

        if (!this.getAllowGrowX()) {
          hint.maxWidth = hint.width;
        }

        if (!this.getAllowShrinkX()) {
          hint.minWidth = hint.width;
        } // normalize height


        if (hint.minHeight > hint.height) {
          hint.height = hint.minHeight;
        }

        if (hint.maxHeight < hint.height) {
          hint.height = hint.maxHeight;
        }

        if (!this.getAllowGrowY()) {
          hint.maxHeight = hint.height;
        }

        if (!this.getAllowShrinkY()) {
          hint.minHeight = hint.height;
        } // Finally return


        return hint;
      },

      /**
       * Computes the size hint of the layout item.
       *
       * @return {Map} The map with the preferred width/height and the allowed
       *   minimum and maximum values.
       */
      _computeSizeHint: function _computeSizeHint() {
        var minWidth = this.getMinWidth() || 0;
        var minHeight = this.getMinHeight() || 0;
        var width = this.getWidth() || minWidth;
        var height = this.getHeight() || minHeight;
        var maxWidth = this.getMaxWidth() || Infinity;
        var maxHeight = this.getMaxHeight() || Infinity;
        return {
          minWidth: minWidth,
          width: width,
          maxWidth: maxWidth,
          minHeight: minHeight,
          height: height,
          maxHeight: maxHeight
        };
      },

      /**
       * Whether the item supports height for width.
       *
       * @return {Boolean} Whether the item supports height for width
       */
      _hasHeightForWidth: function _hasHeightForWidth() {
        var layout = this._getLayout();

        if (layout) {
          return layout.hasHeightForWidth();
        }

        return false;
      },

      /**
       * If an item wants to trade height for width it has to implement this
       * method and return the preferred height of the item if it is resized to
       * the given width. This function returns <code>null</code> if the item
       * do not support height for width.
       *
       * @param width {Integer} The computed width
       * @return {Integer} The desired height
       */
      _getHeightForWidth: function _getHeightForWidth(width) {
        var layout = this._getLayout();

        if (layout && layout.hasHeightForWidth()) {
          return layout.getHeightForWidth(width);
        }

        return null;
      },

      /**
       * Get the widget's layout manager.
       *
       * @return {qx.ui.layout.Abstract} The widget's layout manager
       */
      _getLayout: function _getLayout() {
        return null;
      },
      // property apply
      _applyMargin: function _applyMargin() {
        this.__updateMargin__P_104_4 = true;
        var parent = this.$$parent;

        if (parent) {
          parent.updateLayoutProperties();
        }
      },
      // property apply
      _applyAlign: function _applyAlign() {
        var parent = this.$$parent;

        if (parent) {
          parent.updateLayoutProperties();
        }
      },
      // property apply
      _applyDimension: function _applyDimension() {
        qx.ui.core.queue.Layout.add(this);
      },
      // property apply
      _applyStretching: function _applyStretching() {
        qx.ui.core.queue.Layout.add(this);
      },

      /*
      ---------------------------------------------------------------------------
        SUPPORT FOR USER BOUNDARIES
      ---------------------------------------------------------------------------
      */

      /**
       * Whether user bounds are set on this layout item
       *
       * @return {Boolean} Whether user bounds are set on this layout item
       */
      hasUserBounds: function hasUserBounds() {
        return !!this.__userBounds__P_104_5;
      },

      /**
       * Set user bounds of the widget. Widgets with user bounds are sized and
       * positioned manually and are ignored by any layout manager.
       *
       * @param left {Integer} left position (relative to the parent)
       * @param top {Integer} top position (relative to the parent)
       * @param width {Integer} width of the layout item
       * @param height {Integer} height of the layout item
       */
      setUserBounds: function setUserBounds(left, top, width, height) {
        if (!this.__userBounds__P_104_5) {
          var parent = this.$$parent;

          if (parent) {
            parent.updateLayoutProperties();
          }
        }

        this.__userBounds__P_104_5 = {
          left: left,
          top: top,
          width: width,
          height: height
        };
        qx.ui.core.queue.Layout.add(this);
      },

      /**
       * Clear the user bounds. After this call the layout item is laid out by
       * the layout manager again.
       *
       */
      resetUserBounds: function resetUserBounds() {
        if (this.__userBounds__P_104_5) {
          delete this.__userBounds__P_104_5;
          var parent = this.$$parent;

          if (parent) {
            parent.updateLayoutProperties();
          }

          qx.ui.core.queue.Layout.add(this);
        }
      },

      /*
      ---------------------------------------------------------------------------
        LAYOUT PROPERTIES
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Map} Empty storage pool
       *
       * @lint ignoreReferenceField(__emptyProperties)
       */
      __emptyProperties__P_104_7: {},

      /**
       * Stores the given layout properties
       *
       * @param props {Map} Incoming layout property data
       */
      setLayoutProperties: function setLayoutProperties(props) {
        if (props == null) {
          return;
        }

        var storage = this.__layoutProperties__P_104_6;

        if (!storage) {
          storage = this.__layoutProperties__P_104_6 = {};
        } // Check values through parent


        var parent = this.getLayoutParent();

        if (parent) {
          parent.updateLayoutProperties(props);
        } // Copy over values


        for (var key in props) {
          if (props[key] == null) {
            delete storage[key];
          } else {
            storage[key] = props[key];
          }
        }
      },

      /**
       * Returns currently stored layout properties
       *
       * @return {Map} Returns a map of layout properties
       */
      getLayoutProperties: function getLayoutProperties() {
        return this.__layoutProperties__P_104_6 || this.__emptyProperties__P_104_7;
      },

      /**
       * Removes all stored layout properties.
       *
       */
      clearLayoutProperties: function clearLayoutProperties() {
        delete this.__layoutProperties__P_104_6;
      },

      /**
       * Should be executed on every change of layout properties.
       *
       * This also includes "virtual" layout properties like margin or align
       * when they have an effect on the parent and not on the widget itself.
       *
       * This method is always executed on the parent not on the
       * modified widget itself.
       *
       * @param props {Map?null} Optional map of known layout properties
       */
      updateLayoutProperties: function updateLayoutProperties(props) {
        var layout = this._getLayout();

        if (layout) {
          // Verify values through underlying layout
          {
            if (props) {
              for (var key in props) {
                if (props[key] !== null) {
                  layout.verifyLayoutProperty(this, key, props[key]);
                }
              }
            }
          } // Precomputed and cached children data need to be
          // rebuild on upcoming (re-)layout.

          layout.invalidateChildrenCache();
        }

        qx.ui.core.queue.Layout.add(this);
      },

      /*
      ---------------------------------------------------------------------------
        HIERARCHY SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the application root
       *
       * @return {qx.ui.root.Abstract} The currently used root
       */
      getApplicationRoot: function getApplicationRoot() {
        return qx.core.Init.getApplication().getRoot();
      },

      /**
       * Get the items parent. Even if the item has been added to a
       * layout, the parent is always a child of the containing item. The parent
       * item may be <code>null</code>.
       *
       * @return {qx.ui.core.Widget|null} The parent.
       */
      getLayoutParent: function getLayoutParent() {
        return this.$$parent || null;
      },

      /**
       * Set the parent
       *
       * @param parent {qx.ui.core.Widget|null} The new parent.
       */
      setLayoutParent: function setLayoutParent(parent) {
        if (this.$$parent === parent) {
          return;
        }

        this.$$parent = parent || null;
        qx.ui.core.queue.Visibility.add(this);
      },

      /**
       * Whether the item is a root item and directly connected to
       * the DOM.
       *
       * @return {Boolean} Whether the item a root item
       */
      isRootWidget: function isRootWidget() {
        return false;
      },

      /**
       * Returns the root item. The root item is the item which
       * is directly inserted into an existing DOM node at HTML level.
       * This is often the BODY element of a typical web page.
       *
       * @return {qx.ui.core.Widget} The root item (if available)
       */
      _getRoot: function _getRoot() {
        var parent = this;

        while (parent) {
          if (parent.isRootWidget()) {
            return parent;
          }

          parent = parent.$$parent;
        }

        return null;
      },

      /*
      ---------------------------------------------------------------------------
        CLONE SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      clone: function clone() {
        var clone = qx.ui.core.LayoutItem.superclass.prototype.clone.call(this);
        var props = this.__layoutProperties__P_104_6;

        if (props) {
          clone.__layoutProperties__P_104_6 = qx.lang.Object.clone(props);
        }

        return clone;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      // remove dynamic theme listener
      {
        qx.theme.manager.Meta.getInstance().removeListener("changeTheme", this._onChangeTheme, this);
      }
      this.$$parent = this.$$subparent = this.__layoutProperties__P_104_6 = this.__computedLayout__P_104_1 = this.__userBounds__P_104_5 = this.__sizeHint__P_104_3 = null;
    }
  });
  qx.ui.core.LayoutItem.$$dbClassInfo = $$dbClassInfo;
})();

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.ui.core.EventHandler": {},
      "qx.event.handler.DragDrop": {},
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.LayoutItem": {
        "construct": true,
        "require": true
      },
      "qx.locale.MTranslation": {
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.ui.tooltip.ToolTip": {},
      "qx.ui.menu.Menu": {},
      "qx.core.Assert": {},
      "qx.util.ObjectPool": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.layout.Abstract": {},
      "qx.ui.core.queue.Layout": {},
      "qx.ui.core.queue.Visibility": {},
      "qx.lang.Object": {},
      "qx.theme.manager.Decoration": {},
      "qx.ui.core.queue.Manager": {},
      "qx.html.Element": {},
      "qx.lang.Array": {},
      "qx.event.Registration": {},
      "qx.event.dispatch.MouseCapture": {},
      "qx.Bootstrap": {},
      "qx.locale.Manager": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.theme.manager.Color": {},
      "qx.lang.Type": {},
      "qx.ui.core.queue.Appearance": {},
      "qx.theme.manager.Appearance": {},
      "qx.core.Property": {},
      "qx.ui.core.DragDropCursor": {},
      "qx.bom.element.Location": {},
      "qx.ui.core.queue.Dispose": {},
      "qx.core.ObjectRegistry": {},
      "qx.ui.core.queue.Widget": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /* ************************************************************************
  
  
  
  ************************************************************************ */

  /**
   * This is the base class for all widgets.
   *
   * *External Documentation*
   *
   * <a href='http://qooxdoo.org/docs/#core/' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @use(qx.ui.core.EventHandler)
   * @use(qx.event.handler.DragDrop)
   * @asset(qx/static/blank.gif)
   *
   * @ignore(qx.ui.root.Inline)
   */
  qx.Class.define("qx.ui.core.Widget", {
    extend: qx.ui.core.LayoutItem,
    include: [qx.locale.MTranslation],
    implement: [qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.LayoutItem.constructor.call(this); // Create basic element

      this.__contentElement__P_48_0 = this.__createContentElement__P_48_1(); // Initialize properties

      this.initFocusable();
      this.initSelectable();
      this.initNativeContextMenu();
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired after the widget appears on the screen.
       */
      appear: "qx.event.type.Event",

      /**
       * Fired after the widget disappears from the screen.
       */
      disappear: "qx.event.type.Event",

      /**
       * Fired after the creation of a child control. The passed data is the
       * newly created child widget.
       */
      createChildControl: "qx.event.type.Data",

      /**
       * Fired on resize (after layout) of the widget.
       * The data property of the event contains the widget's computed location
       * and dimension as returned by {@link qx.ui.core.LayoutItem#getBounds}
       */
      resize: "qx.event.type.Data",

      /**
       * Fired on move (after layout) of the widget.
       * The data property of the event contains the widget's computed location
       * and dimension as returned by {@link qx.ui.core.LayoutItem#getBounds}
       */
      move: "qx.event.type.Data",

      /**
       * Fired after the appearance has been applied. This happens before the
       * widget becomes visible, on state and appearance changes. The data field
       * contains the state map. This can be used to react on state changes or to
       * read properties set by the appearance.
       */
      syncAppearance: "qx.event.type.Data",

      /** Fired if the mouse cursor moves over the widget.
       *  The data property of the event contains the widget's computed location
       *  and dimension as returned by {@link qx.ui.core.LayoutItem#getBounds}
       */
      mousemove: "qx.event.type.Mouse",

      /**
       * Fired if the mouse cursor enters the widget.
       *
       * Note: This event is also dispatched if the widget is disabled!
       */
      mouseover: "qx.event.type.Mouse",

      /**
       * Fired if the mouse cursor leaves widget.
       *
       * Note: This event is also dispatched if the widget is disabled!
       */
      mouseout: "qx.event.type.Mouse",

      /** Mouse button is pressed on the widget. */
      mousedown: "qx.event.type.Mouse",

      /** Mouse button is released on the widget. */
      mouseup: "qx.event.type.Mouse",

      /** Widget is clicked using left or middle button.
          {@link qx.event.type.Mouse#getButton} for more details.*/
      click: "qx.event.type.Mouse",

      /** Widget is clicked using a non primary button.
          {@link qx.event.type.Mouse#getButton} for more details.*/
      auxclick: "qx.event.type.Mouse",

      /** Widget is double clicked using left or middle button.
          {@link qx.event.type.Mouse#getButton} for more details.*/
      dblclick: "qx.event.type.Mouse",

      /** Widget is clicked using the right mouse button. */
      contextmenu: "qx.event.type.Mouse",

      /** Fired before the context menu is opened. */
      beforeContextmenuOpen: "qx.event.type.Data",

      /** Fired if the mouse wheel is used over the widget. */
      mousewheel: "qx.event.type.MouseWheel",

      /** Fired if a touch at the screen is started. */
      touchstart: "qx.event.type.Touch",

      /** Fired if a touch at the screen has ended. */
      touchend: "qx.event.type.Touch",

      /** Fired during a touch at the screen. */
      touchmove: "qx.event.type.Touch",

      /** Fired if a touch at the screen is canceled. */
      touchcancel: "qx.event.type.Touch",

      /** Fired when a pointer taps on the screen. */
      tap: "qx.event.type.Tap",

      /** Fired when a pointer holds on the screen. */
      longtap: "qx.event.type.Tap",

      /** Fired when a pointer taps twice on the screen. */
      dbltap: "qx.event.type.Tap",

      /** Fired when a pointer swipes over the screen. */
      swipe: "qx.event.type.Touch",

      /** Fired when two pointers performing a rotate gesture on the screen. */
      rotate: "qx.event.type.Rotate",

      /** Fired when two pointers performing a pinch in/out gesture on the screen. */
      pinch: "qx.event.type.Pinch",

      /** Fired when an active pointer moves on the screen (after pointerdown till pointerup). */
      track: "qx.event.type.Track",

      /** Fired when an active pointer moves on the screen or the mouse wheel is used. */
      roll: "qx.event.type.Roll",

      /** Fired if a pointer (mouse/touch/pen) moves or changes any of it's values. */
      pointermove: "qx.event.type.Pointer",

      /** Fired if a pointer (mouse/touch/pen) hovers the widget. */
      pointerover: "qx.event.type.Pointer",

      /** Fired if a pointer (mouse/touch/pen) leaves this widget. */
      pointerout: "qx.event.type.Pointer",

      /**
       * Fired if a pointer (mouse/touch/pen) button is pressed or
       * a finger touches the widget.
       */
      pointerdown: "qx.event.type.Pointer",

      /**
       * Fired if all pointer (mouse/touch/pen) buttons are released or
       * the finger is lifted from the widget.
       */
      pointerup: "qx.event.type.Pointer",

      /** Fired if a pointer (mouse/touch/pen) action is canceled. */
      pointercancel: "qx.event.type.Pointer",

      /** This event if fired if a keyboard key is released. */
      keyup: "qx.event.type.KeySequence",

      /**
       * This event if fired if a keyboard key is pressed down. This event is
       * only fired once if the user keeps the key pressed for a while.
       */
      keydown: "qx.event.type.KeySequence",

      /**
       * This event is fired any time a key is pressed. It will be repeated if
       * the user keeps the key pressed. The pressed key can be determined using
       * {@link qx.event.type.KeySequence#getKeyIdentifier}.
       */
      keypress: "qx.event.type.KeySequence",

      /**
       * This event is fired if the pressed key or keys result in a printable
       * character. Since the character is not necessarily associated with a
       * single physical key press, the event does not have a key identifier
       * getter. This event gets repeated if the user keeps pressing the key(s).
       *
       * The unicode code of the pressed key can be read using
       * {@link qx.event.type.KeyInput#getCharCode}.
       */
      keyinput: "qx.event.type.KeyInput",

      /**
       * The event is fired when the widget gets focused. Only widgets which are
       * {@link #focusable} receive this event.
       */
      focus: "qx.event.type.Focus",

      /**
       * The event is fired when the widget gets blurred. Only widgets which are
       * {@link #focusable} receive this event.
       */
      blur: "qx.event.type.Focus",

      /**
       * When the widget itself or any child of the widget receive the focus.
       */
      focusin: "qx.event.type.Focus",

      /**
       * When the widget itself or any child of the widget lost the focus.
       */
      focusout: "qx.event.type.Focus",

      /**
       * When the widget gets active (receives keyboard events etc.)
       */
      activate: "qx.event.type.Focus",

      /**
       * When the widget gets inactive
       */
      deactivate: "qx.event.type.Focus",

      /**
       * Fired if the widget becomes the capturing widget by a call to {@link #capture}.
       */
      capture: "qx.event.type.Event",

      /**
       * Fired if the widget looses the capturing mode by a call to
       * {@link #releaseCapture} or a mouse click.
       */
      losecapture: "qx.event.type.Event",

      /**
       * Fired on the drop target when the drag&drop action is finished
       * successfully. This event is normally used to transfer the data
       * from the drag to the drop target.
       *
       * Modeled after the WHATWG specification of Drag&Drop:
       * http://www.whatwg.org/specs/web-apps/current-work/#dnd
       */
      drop: "qx.event.type.Drag",

      /**
       * Fired on a potential drop target when leaving it.
       *
       * Modeled after the WHATWG specification of Drag&Drop:
       * http://www.whatwg.org/specs/web-apps/current-work/#dnd
       */
      dragleave: "qx.event.type.Drag",

      /**
       * Fired on a potential drop target when reaching it via the pointer.
       * This event can be canceled if none of the incoming data types
       * are supported.
       *
       * Modeled after the WHATWG specification of Drag&Drop:
       * http://www.whatwg.org/specs/web-apps/current-work/#dnd
       */
      dragover: "qx.event.type.Drag",

      /**
       * Fired during the drag. Contains the current pointer coordinates
       * using {@link qx.event.type.Drag#getDocumentLeft} and
       * {@link qx.event.type.Drag#getDocumentTop}
       *
       * Modeled after the WHATWG specification of Drag&Drop:
       * http://www.whatwg.org/specs/web-apps/current-work/#dnd
       */
      drag: "qx.event.type.Drag",

      /**
       * Initiate the drag-and-drop operation. This event is cancelable
       * when the drag operation is currently not allowed/possible.
       *
       * Modeled after the WHATWG specification of Drag&Drop:
       * http://www.whatwg.org/specs/web-apps/current-work/#dnd
       */
      dragstart: "qx.event.type.Drag",

      /**
       * Fired on the source (drag) target every time a drag session was ended.
       */
      dragend: "qx.event.type.Drag",

      /**
       * Fired when the drag configuration has been modified e.g. the user
       * pressed a key which changed the selected action. This event will be
       * fired on the draggable and the droppable element. In case of the
       * droppable element, you can cancel the event and prevent a drop based on
       * e.g. the current action.
       */
      dragchange: "qx.event.type.Drag",

      /**
       * Fired when the drop was successfully done and the target widget
       * is now asking for data. The listener should transfer the data,
       * respecting the selected action, to the event. This can be done using
       * the event's {@link qx.event.type.Drag#addData} method.
       */
      droprequest: "qx.event.type.Drag"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /*
      ---------------------------------------------------------------------------
        PADDING
      ---------------------------------------------------------------------------
      */

      /** Padding of the widget (top) */
      paddingTop: {
        check: "Integer",
        init: 0,
        apply: "_applyPadding",
        themeable: true
      },

      /** Padding of the widget (right) */
      paddingRight: {
        check: "Integer",
        init: 0,
        apply: "_applyPadding",
        themeable: true
      },

      /** Padding of the widget (bottom) */
      paddingBottom: {
        check: "Integer",
        init: 0,
        apply: "_applyPadding",
        themeable: true
      },

      /** Padding of the widget (left) */
      paddingLeft: {
        check: "Integer",
        init: 0,
        apply: "_applyPadding",
        themeable: true
      },

      /**
       * The 'padding' property is a shorthand property for setting 'paddingTop',
       * 'paddingRight', 'paddingBottom' and 'paddingLeft' at the same time.
       *
       * If four values are specified they apply to top, right, bottom and left respectively.
       * If there is only one value, it applies to all sides, if there are two or three,
       * the missing values are taken from the opposite side.
       */
      padding: {
        group: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
        mode: "shorthand",
        themeable: true
      },

      /*
      ---------------------------------------------------------------------------
        STYLING PROPERTIES
      ---------------------------------------------------------------------------
      */

      /**
       * The z-index property sets the stack order of an element. An element with
       * greater stack order is always in front of another element with lower stack order.
       */
      zIndex: {
        nullable: true,
        init: 10,
        apply: "_applyZIndex",
        event: "changeZIndex",
        check: "Integer",
        themeable: true
      },

      /**
       * The decorator property points to an object, which is responsible
       * for drawing the widget's decoration, e.g. border, background or shadow.
       *
       * This can be a decorator object or a string pointing to a decorator
       * defined in the decoration theme.
       */
      decorator: {
        nullable: true,
        init: null,
        apply: "_applyDecorator",
        event: "changeDecorator",
        check: "Decorator",
        themeable: true
      },

      /**
       * The background color the rendered widget.
       */
      backgroundColor: {
        nullable: true,
        check: "Color",
        apply: "_applyBackgroundColor",
        event: "changeBackgroundColor",
        themeable: true
      },

      /**
       * The text color the rendered widget.
       */
      textColor: {
        nullable: true,
        check: "Color",
        apply: "_applyTextColor",
        event: "changeTextColor",
        themeable: true,
        inheritable: true
      },

      /**
       * The widget's font. The value is either a font name defined in the font
       * theme or an instance of {@link qx.bom.Font}.
       */
      font: {
        nullable: true,
        apply: "_applyFont",
        check: "Font",
        event: "changeFont",
        themeable: true,
        inheritable: true,
        dereference: true
      },

      /**
       * Mapping to native style property opacity.
       *
       * The uniform opacity setting to be applied across an entire object.
       * Behaves like the new CSS-3 Property.
       * Any values outside the range 0.0 (fully transparent) to 1.0
       * (fully opaque) will be clamped to this range.
       */
      opacity: {
        check: "Number",
        apply: "_applyOpacity",
        themeable: true,
        nullable: true,
        init: null
      },

      /**
       * Mapping to native style property cursor.
       *
       * The name of the cursor to show when the pointer is over the widget.
       * This is any valid CSS2 cursor name defined by W3C.
       *
       * The following values are possible crossbrowser:
       * <ul><li>default</li>
       * <li>crosshair</li>
       * <li>pointer</li>
       * <li>move</li>
       * <li>n-resize</li>
       * <li>ne-resize</li>
       * <li>e-resize</li>
       * <li>se-resize</li>
       * <li>s-resize</li>
       * <li>sw-resize</li>
       * <li>w-resize</li>
       * <li>nw-resize</li>
       * <li>nesw-resize</li>
       * <li>nwse-resize</li>
       * <li>text</li>
       * <li>wait</li>
       * <li>help </li>
       * </ul>
       */
      cursor: {
        check: "String",
        apply: "_applyCursor",
        themeable: true,
        inheritable: true,
        nullable: true,
        init: null
      },

      /**
       * Sets the tooltip instance to use for this widget. If only the tooltip
       * text and icon have to be set its better to use the {@link #toolTipText}
       * and {@link #toolTipIcon} properties since they use a shared tooltip
       * instance.
       *
       * If this property is set the {@link #toolTipText} and {@link #toolTipIcon}
       * properties are ignored.
       */
      toolTip: {
        check: "qx.ui.tooltip.ToolTip",
        nullable: true
      },

      /**
       * The text of the widget's tooltip. This text can contain HTML markup.
       * The text is displayed using a shared tooltip instance. If the tooltip
       * must be customized beyond the text and an icon {@link #toolTipIcon}, the
       * {@link #toolTip} property has to be used
       */
      toolTipText: {
        check: "String",
        nullable: true,
        event: "changeToolTipText",
        apply: "_applyToolTipText"
      },

      /**
       * The icon URI of the widget's tooltip. This icon is displayed using a shared
       * tooltip instance. If the tooltip must be customized beyond the tooltip text
       * {@link #toolTipText} and the icon, the {@link #toolTip} property has to be
       * used.
       */
      toolTipIcon: {
        check: "String",
        nullable: true,
        event: "changeToolTipText"
      },

      /**
       * Controls if a tooltip should shown or not.
       */
      blockToolTip: {
        check: "Boolean",
        init: false
      },

      /**
       * Forces to show tooltip when widget is disabled.
       */
      showToolTipWhenDisabled: {
        check: "Boolean",
        init: false
      },

      /*
      ---------------------------------------------------------------------------
        MANAGEMENT PROPERTIES
      ---------------------------------------------------------------------------
      */

      /**
       * Controls the visibility. Valid values are:
       *
       * <ul>
       *   <li><b>visible</b>: Render the widget</li>
       *   <li><b>hidden</b>: Hide the widget but don't relayout the widget's parent.</li>
       *   <li><b>excluded</b>: Hide the widget and relayout the parent as if the
       *     widget was not a child of its parent.</li>
       * </ul>
       */
      visibility: {
        check: ["visible", "hidden", "excluded"],
        init: "visible",
        apply: "_applyVisibility",
        event: "changeVisibility"
      },

      /**
       * Whether the widget is enabled. Disabled widgets are usually grayed out
       * and do not process user created events. While in the disabled state most
       * user input events are blocked. Only the {@link #pointerover} and
       * {@link #pointerout} events will be dispatched.
       */
      enabled: {
        init: true,
        check: "Boolean",
        inheritable: true,
        apply: "_applyEnabled",
        event: "changeEnabled"
      },

      /**
       * Whether the widget is anonymous.
       *
       * Anonymous widgets are ignored in the event hierarchy. This is useful
       * for combined widgets where the internal structure do not have a custom
       * appearance with a different styling from the element around. This is
       * especially true for widgets like checkboxes or buttons where the text
       * or icon are handled synchronously for state changes to the outer widget.
       */
      anonymous: {
        init: false,
        check: "Boolean",
        apply: "_applyAnonymous"
      },

      /**
       * Defines the tab index of an widget. If widgets with tab indexes are part
       * of the current focus root these elements are sorted in first priority. Afterwards
       * the sorting continues by rendered position, zIndex and other criteria.
       *
       * Please note: The value must be between 1 and 32000.
       */
      tabIndex: {
        check: "Integer",
        nullable: true,
        apply: "_applyTabIndex"
      },

      /**
       * Whether the widget is focusable e.g. rendering a focus border and visualize
       * as active element.
       *
       * See also {@link #isTabable} which allows runtime checks for
       * <code>isChecked</code> or other stuff to test whether the widget is
       * reachable via the TAB key.
       */
      focusable: {
        check: "Boolean",
        init: false,
        apply: "_applyFocusable"
      },

      /**
       * If this property is enabled, the widget and all of its child widgets
       * will never get focused. The focus keeps at the currently
       * focused widget.
       *
       * This only works for widgets which are not {@link #focusable}.
       *
       * This is mainly useful for widget authors. Please use with caution!
       */
      keepFocus: {
        check: "Boolean",
        init: false,
        apply: "_applyKeepFocus"
      },

      /**
       * If this property if enabled, the widget and all of its child widgets
       * will never get activated. The activation keeps at the currently
       * activated widget.
       *
       * This is mainly useful for widget authors. Please use with caution!
       */
      keepActive: {
        check: "Boolean",
        init: false,
        apply: "_applyKeepActive"
      },

      /** Whether the widget acts as a source for drag&drop operations */
      draggable: {
        check: "Boolean",
        init: false,
        apply: "_applyDraggable"
      },

      /** Whether the widget acts as a target for drag&drop operations */
      droppable: {
        check: "Boolean",
        init: false,
        apply: "_applyDroppable"
      },

      /**
       * Whether the widget contains content which may be selected by the user.
       *
       * If the value set to <code>true</code> the native browser selection can
       * be used for text selection. But it is normally useful for
       * forms fields, longer texts/documents, editors, etc.
       */
      selectable: {
        check: "Boolean",
        init: false,
        event: "changeSelectable",
        apply: "_applySelectable"
      },

      /**
       * Whether to show a context menu and which one
       */
      contextMenu: {
        check: "qx.ui.menu.Menu",
        apply: "_applyContextMenu",
        nullable: true,
        event: "changeContextMenu"
      },

      /**
       * Whether the native context menu should be enabled for this widget. To
       * globally enable the native context menu set the {@link #nativeContextMenu}
       * property of the root widget ({@link qx.ui.root.Abstract}) to
       * <code>true</code>.
       */
      nativeContextMenu: {
        check: "Boolean",
        init: false,
        themeable: true,
        event: "changeNativeContextMenu",
        apply: "_applyNativeContextMenu"
      },

      /**
       * The appearance ID. This ID is used to identify the appearance theme
       * entry to use for this widget. This controls the styling of the element.
       */
      appearance: {
        check: "String",
        init: "widget",
        apply: "_applyAppearance",
        event: "changeAppearance"
      }
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** Whether the widget should print out hints and debug messages */
      DEBUG: false,

      /** Whether to throw an error on focus/blur if the widget is unfocusable */
      UNFOCUSABLE_WIDGET_FOCUS_BLUR_ERROR: true,

      /**
       * Returns the widget, which contains the given DOM element.
       *
       * @param element {Element} The DOM element to search the widget for.
       * @param considerAnonymousState {Boolean?false} If true, anonymous widget
       *   will not be returned.
       * @return {qx.ui.core.Widget} The widget containing the element.
       */
      getWidgetByElement: function getWidgetByElement(element, considerAnonymousState) {
        while (element) {
          {
            qx.core.Assert.assertTrue(!element.$$qxObjectHash && !element.$$qxObject || element.$$qxObject && element.$$qxObjectHash && element.$$qxObject.toHashCode() === element.$$qxObjectHash);
          }
          var widget = element.$$qxObject; // check for anonymous widgets

          if (widget) {
            if (!considerAnonymousState || !widget.getAnonymous()) {
              return widget;
            }
          } // Fix for FF, which occasionally breaks (BUG#3525)


          try {
            element = element.parentNode;
          } catch (e) {
            return null;
          }
        }

        return null;
      },

      /**
       * Whether the "parent" widget contains the "child" widget.
       *
       * @param parent {qx.ui.core.Widget} The parent widget
       * @param child {qx.ui.core.Widget} The child widget
       * @return {Boolean} Whether one of the "child"'s parents is "parent"
       */
      contains: function contains(parent, child) {
        while (child) {
          child = child.getLayoutParent();

          if (parent == child) {
            return true;
          }
        }

        return false;
      },

      /** @type {Map} Contains all pooled separators for reuse */
      __separatorPool__P_48_2: new qx.util.ObjectPool()
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __contentElement__P_48_0: null,
      __initialAppearanceApplied__P_48_3: null,
      __toolTipTextListenerId__P_48_4: null,

      /*
      ---------------------------------------------------------------------------
        LAYOUT INTERFACE
      ---------------------------------------------------------------------------
      */

      /**
       * @type {qx.ui.layout.Abstract} The connected layout manager
       */
      __layoutManager__P_48_5: null,
      // overridden
      _getLayout: function _getLayout() {
        return this.__layoutManager__P_48_5;
      },

      /**
       * Set a layout manager for the widget. A a layout manager can only be connected
       * with one widget. Reset the connection with a previous widget first, if you
       * like to use it in another widget instead.
       *
       * @param layout {qx.ui.layout.Abstract} The new layout or
       *     <code>null</code> to reset the layout.
       */
      _setLayout: function _setLayout(layout) {
        {
          if (layout) {
            this.assertInstance(layout, qx.ui.layout.Abstract);
          }
        }

        if (this.__layoutManager__P_48_5) {
          this.__layoutManager__P_48_5.connectToWidget(null);
        }

        if (layout) {
          layout.connectToWidget(this);
        }

        this.__layoutManager__P_48_5 = layout;
        qx.ui.core.queue.Layout.add(this);
      },
      // overridden
      setLayoutParent: function setLayoutParent(parent) {
        if (this.$$parent === parent) {
          return;
        }

        var content = this.getContentElement();

        if (this.$$parent && !this.$$parent.$$disposed) {
          this.$$parent.getContentElement().remove(content);
        }

        this.$$parent = parent || null;

        if (parent && !parent.$$disposed) {
          this.$$parent.getContentElement().add(content);
        } // Update inheritable properties


        this.$$refreshInheritables(); // Update visibility cache

        qx.ui.core.queue.Visibility.add(this);
      },

      /** @type {Boolean} Whether insets have changed and must be updated */
      _updateInsets: null,
      // overridden
      renderLayout: function renderLayout(left, top, width, height) {
        var changes = qx.ui.core.Widget.superclass.prototype.renderLayout.call(this, left, top, width, height); // Directly return if superclass has detected that no
        // changes needs to be applied

        if (!changes) {
          return null;
        }

        if (qx.lang.Object.isEmpty(changes) && !this._updateInsets) {
          return null;
        }

        var content = this.getContentElement();
        var inner = changes.size || this._updateInsets;
        var pixel = "px";
        var contentStyles = {}; // Move content to new position

        if (changes.position) {
          contentStyles.left = left + pixel;
          contentStyles.top = top + pixel;
        }

        if (inner || changes.margin) {
          contentStyles.width = width + pixel;
          contentStyles.height = height + pixel;
        }

        if (Object.keys(contentStyles).length > 0) {
          content.setStyles(contentStyles);
        }

        if (inner || changes.local || changes.margin) {
          if (this.__layoutManager__P_48_5 && this.hasLayoutChildren()) {
            var inset = this.getInsets();
            var innerWidth = width - inset.left - inset.right;
            var innerHeight = height - inset.top - inset.bottom;
            var decorator = this.getDecorator();
            var decoratorPadding = {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            };

            if (decorator) {
              decorator = qx.theme.manager.Decoration.getInstance().resolve(decorator);
              decoratorPadding = decorator.getPadding();
            }

            var padding = {
              top: this.getPaddingTop() + decoratorPadding.top,
              right: this.getPaddingRight() + decoratorPadding.right,
              bottom: this.getPaddingBottom() + decoratorPadding.bottom,
              left: this.getPaddingLeft() + decoratorPadding.left
            };

            this.__layoutManager__P_48_5.renderLayout(innerWidth, innerHeight, padding);
          } else if (this.hasLayoutChildren()) {
            throw new Error("At least one child in control " + this._findTopControl() + " requires a layout, but no one was defined!");
          }
        } // Fire events


        if (changes.position && this.hasListener("move")) {
          this.fireDataEvent("move", this.getBounds());
        }

        if (changes.size && this.hasListener("resize")) {
          this.fireDataEvent("resize", this.getBounds());
        } // Cleanup flags


        delete this._updateInsets;
        return changes;
      },

      /*
      ---------------------------------------------------------------------------
        SEPARATOR SUPPORT
      ---------------------------------------------------------------------------
      */
      __separators__P_48_6: null,
      // overridden
      clearSeparators: function clearSeparators() {
        var reg = this.__separators__P_48_6;

        if (!reg) {
          return;
        }

        var pool = qx.ui.core.Widget.__separatorPool__P_48_2;
        var content = this.getContentElement();
        var widget;

        for (var i = 0, l = reg.length; i < l; i++) {
          widget = reg[i];
          pool.poolObject(widget);
          content.remove(widget.getContentElement());
        } // Clear registry


        reg.length = 0;
      },
      // overridden
      renderSeparator: function renderSeparator(separator, bounds) {
        // Insert
        var widget = qx.ui.core.Widget.__separatorPool__P_48_2.getObject(qx.ui.core.Widget);

        widget.set({
          decorator: separator
        });
        var elem = widget.getContentElement();
        this.getContentElement().add(elem); // Move

        var domEl = elem.getDomElement(); // use the DOM element because the cache of the qx.html.Element could be
        // wrong due to changes made by the decorators which work on the DOM element too

        if (domEl) {
          domEl.style.top = bounds.top + "px";
          domEl.style.left = bounds.left + "px";
          domEl.style.width = bounds.width + "px";
          domEl.style.height = bounds.height + "px";
        } else {
          elem.setStyles({
            left: bounds.left + "px",
            top: bounds.top + "px",
            width: bounds.width + "px",
            height: bounds.height + "px"
          });
        } // Remember element


        if (!this.__separators__P_48_6) {
          this.__separators__P_48_6 = [];
        }

        this.__separators__P_48_6.push(widget);
      },

      /*
      ---------------------------------------------------------------------------
        SIZE HINTS
      ---------------------------------------------------------------------------
      */
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        // Start with the user defined values
        var width = this.getWidth();
        var minWidth = this.getMinWidth();
        var maxWidth = this.getMaxWidth();
        var height = this.getHeight();
        var minHeight = this.getMinHeight();
        var maxHeight = this.getMaxHeight();
        {
          if (minWidth !== null && maxWidth !== null) {
            this.assert(minWidth <= maxWidth, "minWidth is larger than maxWidth!");
          }

          if (minHeight !== null && maxHeight !== null) {
            this.assert(minHeight <= maxHeight, "minHeight is larger than maxHeight!");
          }
        } // Ask content

        var contentHint = this._getContentHint();

        var insets = this.getInsets();
        var insetX = insets.left + insets.right;
        var insetY = insets.top + insets.bottom;

        if (width == null) {
          width = contentHint.width + insetX;
        }

        if (height == null) {
          height = contentHint.height + insetY;
        }

        if (minWidth == null) {
          minWidth = insetX;

          if (contentHint.minWidth != null) {
            minWidth += contentHint.minWidth; // do not apply bigger min width than max width [BUG #5008]

            if (minWidth > maxWidth && maxWidth != null) {
              minWidth = maxWidth;
            }
          }
        }

        if (minHeight == null) {
          minHeight = insetY;

          if (contentHint.minHeight != null) {
            minHeight += contentHint.minHeight; // do not apply bigger min height than max height [BUG #5008]

            if (minHeight > maxHeight && maxHeight != null) {
              minHeight = maxHeight;
            }
          }
        }

        if (maxWidth == null) {
          if (contentHint.maxWidth == null) {
            maxWidth = Infinity;
          } else {
            maxWidth = contentHint.maxWidth + insetX; // do not apply bigger min width than max width [BUG #5008]

            if (maxWidth < minWidth && minWidth != null) {
              maxWidth = minWidth;
            }
          }
        }

        if (maxHeight == null) {
          if (contentHint.maxHeight == null) {
            maxHeight = Infinity;
          } else {
            maxHeight = contentHint.maxHeight + insetY; // do not apply bigger min width than max width [BUG #5008]

            if (maxHeight < minHeight && minHeight != null) {
              maxHeight = minHeight;
            }
          }
        } // Build size hint and return


        return {
          width: width,
          minWidth: minWidth,
          maxWidth: maxWidth,
          height: height,
          minHeight: minHeight,
          maxHeight: maxHeight
        };
      },
      // overridden
      invalidateLayoutCache: function invalidateLayoutCache() {
        qx.ui.core.Widget.superclass.prototype.invalidateLayoutCache.call(this);

        if (this.__layoutManager__P_48_5) {
          this.__layoutManager__P_48_5.invalidateLayoutCache();
        }
      },

      /**
       * Returns the recommended/natural dimensions of the widget's content.
       *
       * For labels and images this may be their natural size when defined without
       * any dimensions. For containers this may be the recommended size of the
       * underlying layout manager.
       *
       * Developer note: This can be overwritten by the derived classes to allow
       * a custom handling here.
       *
       * @return {Map}
       */
      _getContentHint: function _getContentHint() {
        var layout = this.__layoutManager__P_48_5;

        if (layout) {
          if (this.hasLayoutChildren()) {
            var hint = layout.getSizeHint();
            {
              var msg = "The layout of the widget" + this.toString() + " returned an invalid size hint!";
              this.assertInteger(hint.width, "Wrong 'left' argument. " + msg);
              this.assertInteger(hint.height, "Wrong 'top' argument. " + msg);
            }
            return hint;
          } else {
            return {
              width: 0,
              height: 0
            };
          }
        } else {
          return {
            width: 100,
            height: 50
          };
        }
      },
      // overridden
      _getHeightForWidth: function _getHeightForWidth(width) {
        // Prepare insets
        var insets = this.getInsets();
        var insetX = insets.left + insets.right;
        var insetY = insets.top + insets.bottom; // Compute content width

        var contentWidth = width - insetX; // Compute height

        var contentHeight = 0;

        var layout = this._getLayout();

        if (layout && layout.hasHeightForWidth()) {
          contentHeight = layout.getHeightForWidth(contentWidth);
        } else {
          contentHeight = this._getContentHeightForWidth(contentWidth);
        } // Computed box height


        var height = contentHeight + insetY;
        return height;
      },

      /**
       * Returns the computed height for the given width.
       *
       * @abstract
       * @param width {Integer} Incoming width (as limitation)
       * @return {Integer} Computed height while respecting the given width.
       */
      _getContentHeightForWidth: function _getContentHeightForWidth(width) {
        throw new Error("Abstract method call: _getContentHeightForWidth()!");
      },

      /*
      ---------------------------------------------------------------------------
        INSET CALCULATION SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the sum of the widget's padding and border width.
       *
       * @return {Map} Contains the keys <code>top</code>, <code>right</code>,
       *   <code>bottom</code> and <code>left</code>. All values are integers.
       */
      getInsets: function getInsets() {
        var top = this.getPaddingTop();
        var right = this.getPaddingRight();
        var bottom = this.getPaddingBottom();
        var left = this.getPaddingLeft();

        if (this.getDecorator()) {
          var decorator = qx.theme.manager.Decoration.getInstance().resolve(this.getDecorator());
          var inset = decorator.getInsets();
          {
            this.assertNumber(inset.top, "Invalid top decorator inset detected: " + inset.top);
            this.assertNumber(inset.right, "Invalid right decorator inset detected: " + inset.right);
            this.assertNumber(inset.bottom, "Invalid bottom decorator inset detected: " + inset.bottom);
            this.assertNumber(inset.left, "Invalid left decorator inset detected: " + inset.left);
          }
          top += inset.top;
          right += inset.right;
          bottom += inset.bottom;
          left += inset.left;
        }

        return {
          top: top,
          right: right,
          bottom: bottom,
          left: left
        };
      },

      /*
      ---------------------------------------------------------------------------
        COMPUTED LAYOUT SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the widget's computed inner size as available
       * through the layout process.
       *
       * This function is guaranteed to return a correct value
       * during a {@link #resize} or {@link #move} event dispatch.
       *
       * @return {Map} The widget inner dimension in pixel (if the layout is
       *    valid). Contains the keys <code>width</code> and <code>height</code>.
       */
      getInnerSize: function getInnerSize() {
        var computed = this.getBounds();

        if (!computed) {
          return null;
        } // Return map data


        var insets = this.getInsets();
        return {
          width: computed.width - insets.left - insets.right,
          height: computed.height - insets.top - insets.bottom
        };
      },

      /*
      ---------------------------------------------------------------------------
        ANIMATION SUPPORT: USER API
      ---------------------------------------------------------------------------
      */

      /**
       * Fade out this widget.
       * @param duration {Number} Time in ms.
       * @return {qx.bom.element.AnimationHandle} The animation handle to react for
       *   the fade animation.
       */
      fadeOut: function fadeOut(duration) {
        return this.getContentElement().fadeOut(duration);
      },

      /**
       * Fade in the widget.
       * @param duration {Number} Time in ms.
       * @return {qx.bom.element.AnimationHandle} The animation handle to react for
       *   the fade animation.
       */
      fadeIn: function fadeIn(duration) {
        return this.getContentElement().fadeIn(duration);
      },

      /*
      ---------------------------------------------------------------------------
        VISIBILITY SUPPORT: USER API
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyAnonymous: function _applyAnonymous(value) {
        if (value) {
          this.getContentElement().setAttribute("qxanonymous", "true");
        } else {
          this.getContentElement().removeAttribute("qxanonymous");
        }
      },

      /**
       * Make this widget visible.
       *
       */
      show: function show() {
        this.setVisibility("visible");
      },

      /**
       * Hide this widget.
       *
       */
      hide: function hide() {
        this.setVisibility("hidden");
      },

      /**
       * Hide this widget and exclude it from the underlying layout.
       *
       */
      exclude: function exclude() {
        this.setVisibility("excluded");
      },

      /**
       * Whether the widget is locally visible.
       *
       * Note: This method does not respect the hierarchy.
       *
       * @return {Boolean} Returns <code>true</code> when the widget is visible
       */
      isVisible: function isVisible() {
        return this.getVisibility() === "visible";
      },

      /**
       * Whether the widget is locally hidden.
       *
       * Note: This method does not respect the hierarchy.
       *
       * @return {Boolean} Returns <code>true</code> when the widget is hidden
       */
      isHidden: function isHidden() {
        return this.getVisibility() !== "visible";
      },

      /**
       * Whether the widget is locally excluded.
       *
       * Note: This method does not respect the hierarchy.
       *
       * @return {Boolean} Returns <code>true</code> when the widget is excluded
       */
      isExcluded: function isExcluded() {
        return this.getVisibility() === "excluded";
      },

      /**
       * Detects if the widget and all its parents are visible.
       *
       * WARNING: Please use this method with caution because it flushes the
       * internal queues which might be an expensive operation.
       *
       * @return {Boolean} true, if the widget is currently on the screen
       */
      isSeeable: function isSeeable() {
        // Flush the queues because to detect if the widget ins visible, the
        // queues need to be flushed (see bug #5254)
        qx.ui.core.queue.Manager.flush(); // if the element is already rendered, a check for the offsetWidth is enough

        var element = this.getContentElement().getDomElement();

        if (element) {
          // will also be 0 if the parents are not visible
          return element.offsetWidth > 0;
        } // if no element is available, it can not be visible


        return false;
      },

      /*
      ---------------------------------------------------------------------------
        CREATION OF HTML ELEMENTS
      ---------------------------------------------------------------------------
      */

      /**
       * Create the widget's content HTML element.
       *
       * @return {qx.html.Element} The content HTML element
       */
      __createContentElement__P_48_1: function __createContentElement__P_48_1() {
        var el = this._createContentElement();

        el.connectObject(this); // make sure to allow all pointer events

        el.setStyles({
          "touch-action": "none",
          "-ms-touch-action": "none"
        });
        {
          el.setAttribute("qxClass", this.classname);
        }
        var styles = {
          zIndex: 10,
          boxSizing: "border-box"
        };

        if (!qx.ui.root.Inline || !(this instanceof qx.ui.root.Inline)) {
          styles.position = "absolute";
        }

        el.setStyles(styles);
        return el;
      },

      /**
       * Creates the content element. The style properties
       * position and zIndex are modified from the Widget
       * core.
       *
       * This function may be overridden to customize a class
       * content.
       *
       * @return {qx.html.Element} The widget's content element
       */
      _createContentElement: function _createContentElement() {
        return new qx.html.Element("div", {
          overflowX: "hidden",
          overflowY: "hidden"
        });
      },

      /**
       * Returns the element wrapper of the widget's content element.
       * This method exposes widget internal and must be used with caution!
       *
       * @return {qx.html.Element} The widget's content element
       */
      getContentElement: function getContentElement() {
        return this.__contentElement__P_48_0;
      },

      /*
      ---------------------------------------------------------------------------
        CHILDREN HANDLING
      ---------------------------------------------------------------------------
      */

      /** @type {qx.ui.core.LayoutItem[]} List of all child widgets */
      __widgetChildren__P_48_7: null,

      /**
       * Returns all children, which are layout relevant. This excludes all widgets,
       * which have a {@link qx.ui.core.Widget#visibility} value of <code>exclude</code>.
       *
       * @internal
       * @return {qx.ui.core.Widget[]} All layout relevant children.
       */
      getLayoutChildren: function getLayoutChildren() {
        var children = this.__widgetChildren__P_48_7;

        if (!children) {
          return this.__emptyChildren__P_48_8;
        }

        var layoutChildren;

        for (var i = 0, l = children.length; i < l; i++) {
          var child = children[i];

          if (child.hasUserBounds() || child.isExcluded()) {
            if (layoutChildren == null) {
              layoutChildren = children.concat();
            }

            qx.lang.Array.remove(layoutChildren, child);
          }
        }

        return layoutChildren || children;
      },

      /**
       * Marks the layout of this widget as invalid and triggers a layout update.
       * This is a shortcut for <code>qx.ui.core.queue.Layout.add(this);</code>.
       */
      scheduleLayoutUpdate: function scheduleLayoutUpdate() {
        qx.ui.core.queue.Layout.add(this);
      },

      /**
       * Resets the cache for children which should be laid out.
       */
      invalidateLayoutChildren: function invalidateLayoutChildren() {
        var layout = this.__layoutManager__P_48_5;

        if (layout) {
          layout.invalidateChildrenCache();
        }

        qx.ui.core.queue.Layout.add(this);
      },

      /**
       * Returns whether the layout has children, which are layout relevant. This
       * excludes all widgets, which have a {@link qx.ui.core.Widget#visibility}
       * value of <code>exclude</code>.
       *
       * @return {Boolean} Whether the layout has layout relevant children
       */
      hasLayoutChildren: function hasLayoutChildren() {
        var children = this.__widgetChildren__P_48_7;

        if (!children) {
          return false;
        }

        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];

          if (!child.hasUserBounds() && !child.isExcluded()) {
            return true;
          }
        }

        return false;
      },

      /**
       * Returns the widget which contains the children and
       * is relevant for laying them out. This is from the user point of
       * view and may not be identical to the technical structure.
       *
       * @return {qx.ui.core.Widget} Widget which contains the children.
       */
      getChildrenContainer: function getChildrenContainer() {
        return this;
      },

      /**
       * @type {Array} Placeholder for children list in empty widgets.
       *     Mainly to keep instance number low.
       *
       * @lint ignoreReferenceField(__emptyChildren)
       */
      __emptyChildren__P_48_8: [],

      /**
       * Returns the children list
       *
       * @return {qx.ui.core.LayoutItem[]} The children array (Arrays are
       *   reference types, so please do not modify it in-place).
       */
      _getChildren: function _getChildren() {
        return this.__widgetChildren__P_48_7 || this.__emptyChildren__P_48_8;
      },

      /**
       * Returns the index position of the given widget if it is
       * a child widget. Otherwise it returns <code>-1</code>.
       *
       * @param child {qx.ui.core.Widget} the widget to query for
       * @return {Integer} The index position or <code>-1</code> when
       *   the given widget is no child of this layout.
       */
      _indexOf: function _indexOf(child) {
        var children = this.__widgetChildren__P_48_7;

        if (!children) {
          return -1;
        }

        return children.indexOf(child);
      },

      /**
       * Whether the widget contains children.
       *
       * @return {Boolean} Returns <code>true</code> when the widget has children.
       */
      _hasChildren: function _hasChildren() {
        var children = this.__widgetChildren__P_48_7;
        return children != null && !!children[0];
      },

      /**
       * Recursively adds all children to the given queue
       *
       * @param queue {Array} The queue to add widgets to
       */
      addChildrenToQueue: function addChildrenToQueue(queue) {
        var children = this.__widgetChildren__P_48_7;

        if (!children) {
          return;
        }

        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          queue.push(child);
          child.addChildrenToQueue(queue);
        }
      },

      /**
       * Adds a new child widget.
       *
       * The supported keys of the layout options map depend on the layout manager
       * used to position the widget. The options are documented in the class
       * documentation of each layout manager {@link qx.ui.layout}.
       *
       * @param child {qx.ui.core.LayoutItem} the widget to add.
       * @param options {Map?null} Optional layout data for widget.
       */
      _add: function _add(child, options) {
        {
          this.assertInstance(child, qx.ui.core.LayoutItem.constructor, "'Child' must be an instance of qx.ui.core.LayoutItem!");
        } // When moving in the same widget, remove widget first

        if (child.getLayoutParent() == this) {
          qx.lang.Array.remove(this.__widgetChildren__P_48_7, child);
        }

        if (this.__widgetChildren__P_48_7) {
          this.__widgetChildren__P_48_7.push(child);
        } else {
          this.__widgetChildren__P_48_7 = [child];
        }

        this.__addHelper__P_48_9(child, options);
      },

      /**
       * Add a child widget at the specified index
       *
       * @param child {qx.ui.core.LayoutItem} widget to add
       * @param index {Integer} Index, at which the widget will be inserted. If no
       *   widget exists at the given index, the new widget gets appended to the
       *   current list of children.
       * @param options {Map?null} Optional layout data for widget.
       */
      _addAt: function _addAt(child, index, options) {
        if (!this.__widgetChildren__P_48_7) {
          this.__widgetChildren__P_48_7 = [];
        } // When moving in the same widget, remove widget first


        if (child.getLayoutParent() == this) {
          qx.lang.Array.remove(this.__widgetChildren__P_48_7, child);
        }

        var ref = this.__widgetChildren__P_48_7[index];

        if (ref === child) {
          child.setLayoutProperties(options);
        }

        if (ref) {
          qx.lang.Array.insertBefore(this.__widgetChildren__P_48_7, child, ref);
        } else {
          this.__widgetChildren__P_48_7.push(child);
        }

        this.__addHelper__P_48_9(child, options);
      },

      /**
       * Add a widget before another already inserted widget
       *
       * @param child {qx.ui.core.LayoutItem} widget to add
       * @param before {qx.ui.core.LayoutItem} widget before the new widget will be inserted.
       * @param options {Map?null} Optional layout data for widget.
       */
      _addBefore: function _addBefore(child, before, options) {
        {
          this.assertInArray(before, this._getChildren(), "The 'before' widget is not a child of this widget!");
        }

        if (child == before) {
          return;
        }

        if (!this.__widgetChildren__P_48_7) {
          this.__widgetChildren__P_48_7 = [];
        } // When moving in the same widget, remove widget first


        if (child.getLayoutParent() == this) {
          qx.lang.Array.remove(this.__widgetChildren__P_48_7, child);
        }

        qx.lang.Array.insertBefore(this.__widgetChildren__P_48_7, child, before);

        this.__addHelper__P_48_9(child, options);
      },

      /**
       * Add a widget after another already inserted widget
       *
       * @param child {qx.ui.core.LayoutItem} widget to add
       * @param after {qx.ui.core.LayoutItem} widget, after which the new widget will
       *   be inserted
       * @param options {Map?null} Optional layout data for widget.
       */
      _addAfter: function _addAfter(child, after, options) {
        {
          this.assertInArray(after, this._getChildren(), "The 'after' widget is not a child of this widget!");
        }

        if (child == after) {
          return;
        }

        if (!this.__widgetChildren__P_48_7) {
          this.__widgetChildren__P_48_7 = [];
        } // When moving in the same widget, remove widget first


        if (child.getLayoutParent() == this) {
          qx.lang.Array.remove(this.__widgetChildren__P_48_7, child);
        }

        qx.lang.Array.insertAfter(this.__widgetChildren__P_48_7, child, after);

        this.__addHelper__P_48_9(child, options);
      },

      /**
       * Remove the given child widget.
       *
       * @param child {qx.ui.core.LayoutItem} the widget to remove
       */
      _remove: function _remove(child) {
        if (!this.__widgetChildren__P_48_7) {
          throw new Error("This widget has no children!");
        }

        qx.lang.Array.remove(this.__widgetChildren__P_48_7, child);

        this.__removeHelper__P_48_10(child);
      },

      /**
       * Remove the widget at the specified index.
       *
       * @param index {Integer} Index of the widget to remove.
       * @return {qx.ui.core.LayoutItem} The removed item.
       */
      _removeAt: function _removeAt(index) {
        if (!this.__widgetChildren__P_48_7) {
          throw new Error("This widget has no children!");
        }

        var child = this.__widgetChildren__P_48_7[index];
        qx.lang.Array.removeAt(this.__widgetChildren__P_48_7, index);

        this.__removeHelper__P_48_10(child);

        return child;
      },

      /**
       * Remove all children.
       *
       * @return {Array} An array containing the removed children.
       */
      _removeAll: function _removeAll() {
        if (!this.__widgetChildren__P_48_7) {
          return [];
        } // Working on a copy to make it possible to clear the
        // internal array before calling setLayoutParent()


        var children = this.__widgetChildren__P_48_7.concat();

        this.__widgetChildren__P_48_7.length = 0;

        for (var i = children.length - 1; i >= 0; i--) {
          this.__removeHelper__P_48_10(children[i]);
        }

        qx.ui.core.queue.Layout.add(this);
        return children;
      },

      /*
      ---------------------------------------------------------------------------
        CHILDREN HANDLING - TEMPLATE METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * This method gets called each time after a child widget was added and can
       * be overridden to get notified about child adds.
       *
       * @signature function(child)
       * @param child {qx.ui.core.LayoutItem} The added child.
       */
      _afterAddChild: null,

      /**
       * This method gets called each time after a child widget was removed and
       * can be overridden to get notified about child removes.
       *
       * @signature function(child)
       * @param child {qx.ui.core.LayoutItem} The removed child.
       */
      _afterRemoveChild: null,

      /*
      ---------------------------------------------------------------------------
        CHILDREN HANDLING - IMPLEMENTATION
      ---------------------------------------------------------------------------
      */

      /**
       * Convenience function to add a child widget. It will insert the child to
       * the parent widget and schedule a layout update.
       *
       * @param child {qx.ui.core.LayoutItem} The child to add.
       * @param options {Map|null} Optional layout data for the widget.
       */
      __addHelper__P_48_9: function __addHelper__P_48_9(child, options) {
        {
          this.assertInstance(child, qx.ui.core.LayoutItem, "Invalid widget to add: " + child);
          this.assertNotIdentical(child, this, "Could not add widget to itself: " + child);

          if (options != null) {
            this.assertType(options, "object", "Invalid layout data: " + options);
          }
        } // Remove from old parent

        var parent = child.getLayoutParent();

        if (parent && parent != this) {
          parent._remove(child);
        } // Remember parent


        child.setLayoutParent(this); // Import options: This call will
        //  - clear the layout's children cache as well and
        //  - add its parent (this widget) to the layout queue

        if (options) {
          child.setLayoutProperties(options);
        } else {
          this.updateLayoutProperties();
        } // call the template method


        if (this._afterAddChild) {
          this._afterAddChild(child);
        }
      },

      /**
       * Convenience function to remove a child widget. It will remove it
       * from the parent widget and schedule a layout update.
       *
       * @param child {qx.ui.core.LayoutItem} The child to remove.
       */
      __removeHelper__P_48_10: function __removeHelper__P_48_10(child) {
        {
          this.assertNotUndefined(child);
        }

        if (child.getLayoutParent() !== this) {
          throw new Error("Remove Error: " + child + " is not a child of this widget!");
        } // Clear parent connection


        child.setLayoutParent(null); // clear the layout's children cache

        if (this.__layoutManager__P_48_5) {
          this.__layoutManager__P_48_5.invalidateChildrenCache();
        } // Add to layout queue


        qx.ui.core.queue.Layout.add(this); // call the template method

        if (this._afterRemoveChild) {
          this._afterRemoveChild(child);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENTS
      ---------------------------------------------------------------------------
      */

      /**
       * Enables pointer event capturing. All pointer events will dispatched on this
       * widget until capturing is disabled using {@link #releaseCapture} or a
       * pointer button is clicked. If the widgets becomes the capturing widget the
       * {@link #capture} event is fired. Once it loses capture mode the
       * {@link #losecapture} event is fired.
       *
       * @param capture {Boolean?true} If true all events originating in
       *   the container are captured. If false events originating in the container
       *   are not captured.
       */
      capture: function capture(_capture) {
        this.getContentElement().capture(_capture);
      },

      /**
       * Disables pointer capture mode enabled by {@link #capture}.
       */
      releaseCapture: function releaseCapture() {
        this.getContentElement().releaseCapture();
      },

      /**
       * Checks if pointer event capturing is enabled for this widget.
       *
       * @return {Boolean} <code>true</code> if capturing is active
       */
      isCapturing: function isCapturing() {
        var el = this.getContentElement().getDomElement();

        if (!el) {
          return false;
        }

        var manager = qx.event.Registration.getManager(el);
        var dispatcher = manager.getDispatcher(qx.event.dispatch.MouseCapture);
        return el == dispatcher.getCaptureElement();
      },

      /*
      ---------------------------------------------------------------------------
        PADDING SUPPORT
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyPadding: function _applyPadding(value, old, name) {
        this._updateInsets = true;
        qx.ui.core.queue.Layout.add(this);

        this.__updateContentPadding__P_48_11(name, value);
      },

      /**
       * Helper to updated the css padding of the content element considering the
       * padding of the decorator.
       * @param style {String} The name of the css padding property e.g. <code>paddingTop</code>
       * @param value {Number} The value to set.
       */
      __updateContentPadding__P_48_11: function __updateContentPadding__P_48_11(style, value) {
        var content = this.getContentElement();
        var decorator = this.getDecorator();
        decorator = qx.theme.manager.Decoration.getInstance().resolve(decorator);

        if (decorator) {
          var direction = qx.Bootstrap.firstLow(style.replace("padding", ""));
          value += decorator.getPadding()[direction] || 0;
        }

        content.setStyle(style, value + "px");
      },

      /*
      ---------------------------------------------------------------------------
        DECORATION SUPPORT
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyDecorator: function _applyDecorator(value, old) {
        var content = this.getContentElement();

        if (old) {
          old = qx.theme.manager.Decoration.getInstance().getCssClassName(old);
          content.removeClass(old);
        }

        if (value) {
          value = qx.theme.manager.Decoration.getInstance().addCssClass(value);
          content.addClass(value);
        }

        if (value || old) {
          qx.ui.core.queue.Layout.add(this);
        }
      },

      /*
      ---------------------------------------------------------------------------
        OTHER PROPERTIES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyToolTipText: function _applyToolTipText(value, old) {
        var _this = this;

        {
          if (this.__toolTipTextListenerId__P_48_4) {
            return;
          }

          var manager = qx.locale.Manager.getInstance();
          this.__toolTipTextListenerId__P_48_4 = manager.addListener("changeLocale", function () {
            var toolTipText = _this.getToolTipText();

            if (toolTipText && toolTipText.translate) {
              _this.setToolTipText(toolTipText.translate());
            }
          });
        }
      },
      // property apply
      _applyTextColor: function _applyTextColor(value, old) {// empty template
      },
      // property apply
      _applyZIndex: function _applyZIndex(value, old) {
        this.getContentElement().setStyle("zIndex", value == null ? 0 : value);
      },
      // property apply
      _applyVisibility: function _applyVisibility(value, old) {
        var content = this.getContentElement();

        if (value === "visible") {
          content.show();
        } else {
          content.hide();
        } // only force a layout update if visibility change from/to "exclude"


        var parent = this.$$parent;

        if (parent && (old == null || value == null || old === "excluded" || value === "excluded")) {
          parent.invalidateLayoutChildren();
        } // Update visibility cache


        qx.ui.core.queue.Visibility.add(this);
      },
      // property apply
      _applyOpacity: function _applyOpacity(value, old) {
        this.getContentElement().setStyle("opacity", value == 1 ? null : value);
      },
      // property apply
      _applyCursor: function _applyCursor(value, old) {
        if (value == null && !this.isSelectable()) {
          value = "default";
        } // In Opera the cursor must be set directly.
        // http://bugzilla.qooxdoo.org/show_bug.cgi?id=1729


        this.getContentElement().setStyle("cursor", value, qx.core.Environment.get("engine.name") == "opera");
      },
      // property apply
      _applyBackgroundColor: function _applyBackgroundColor(value, old) {
        var color = this.getBackgroundColor();
        var content = this.getContentElement();
        var resolved = qx.theme.manager.Color.getInstance().resolve(color);
        content.setStyle("backgroundColor", resolved);
      },
      // property apply
      _applyFont: function _applyFont(value, old) {// empty template
      },

      /*
      ---------------------------------------------------------------------------
        DYNAMIC THEME SWITCH SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      _onChangeTheme: function _onChangeTheme() {
        if (this.isDisposed()) {
          return;
        }

        qx.ui.core.Widget.superclass.prototype._onChangeTheme.call(this); // update the appearance


        this.updateAppearance(); // DECORATOR //

        var value = this.getDecorator();

        this._applyDecorator(null, value);

        this._applyDecorator(value); // FONT //


        value = this.getFont();

        if (qx.lang.Type.isString(value)) {
          this._applyFont(value, value);
        } // TEXT COLOR //


        value = this.getTextColor();

        if (qx.lang.Type.isString(value)) {
          this._applyTextColor(value, value);
        } // BACKGROUND COLOR //


        value = this.getBackgroundColor();

        if (qx.lang.Type.isString(value)) {
          this._applyBackgroundColor(value, value);
        }
      },

      /*
      ---------------------------------------------------------------------------
        STATE HANDLING
      ---------------------------------------------------------------------------
      */

      /** @type {Map} The current widget states */
      __states__P_48_12: null,

      /** @type {Boolean} Whether the widget has state changes which are not yet queued */
      $$stateChanges: null,

      /** @type {Map} Can be overridden to forward states to the child controls. */
      _forwardStates: null,

      /**
       * Returns whether a state is set.
       *
       * @param state {String} the state to check.
       * @return {Boolean} whether the state is set.
       */
      hasState: function hasState(state) {
        var states = this.__states__P_48_12;
        return !!states && !!states[state];
      },

      /**
       * Sets a state.
       *
       * @param state {String} The state to add
       */
      addState: function addState(state) {
        // Dynamically create state map
        var states = this.__states__P_48_12;

        if (!states) {
          states = this.__states__P_48_12 = {};
        }

        if (states[state]) {
          return;
        } // Add state and queue


        this.__states__P_48_12[state] = true; // Fast path for hovered state

        if (state === "hovered") {
          this.syncAppearance();
        } else if (!qx.ui.core.queue.Visibility.isVisible(this)) {
          this.$$stateChanges = true;
        } else {
          qx.ui.core.queue.Appearance.add(this);
        } // Forward state change to child controls


        var forward = this._forwardStates;
        var controls = this.__childControls__P_48_13;

        if (forward && forward[state] && controls) {
          var control;

          for (var id in controls) {
            control = controls[id];

            if (control instanceof qx.ui.core.Widget) {
              controls[id].addState(state);
            }
          }
        }
      },

      /**
       * Clears a state.
       *
       * @param state {String} the state to clear.
       */
      removeState: function removeState(state) {
        // Check for existing state
        var states = this.__states__P_48_12;

        if (!states || !states[state]) {
          return;
        } // Clear state and queue


        delete this.__states__P_48_12[state]; // Fast path for hovered state

        if (state === "hovered") {
          this.syncAppearance();
        } else if (!qx.ui.core.queue.Visibility.isVisible(this)) {
          this.$$stateChanges = true;
        } else {
          qx.ui.core.queue.Appearance.add(this);
        } // Forward state change to child controls


        var forward = this._forwardStates;
        var controls = this.__childControls__P_48_13;

        if (forward && forward[state] && controls) {
          for (var id in controls) {
            var control = controls[id];

            if (control instanceof qx.ui.core.Widget) {
              control.removeState(state);
            }
          }
        }
      },

      /**
       * Replaces the first state with the second one.
       *
       * This method is ideal for state transitions e.g. normal => selected.
       *
       * @param old {String} Previous state
       * @param value {String} New state
       */
      replaceState: function replaceState(old, value) {
        var states = this.__states__P_48_12;

        if (!states) {
          states = this.__states__P_48_12 = {};
        }

        if (!states[value]) {
          states[value] = true;
        }

        if (states[old]) {
          delete states[old];
        }

        if (!qx.ui.core.queue.Visibility.isVisible(this)) {
          this.$$stateChanges = true;
        } else {
          qx.ui.core.queue.Appearance.add(this);
        } // Forward state change to child controls


        var forward = this._forwardStates;
        var controls = this.__childControls__P_48_13;

        if (forward && forward[value] && controls) {
          for (var id in controls) {
            var control = controls[id];

            if (control instanceof qx.ui.core.Widget) {
              control.replaceState(old, value);
            }
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        APPEARANCE SUPPORT
      ---------------------------------------------------------------------------
      */

      /** @type {String} The currently compiled selector to lookup the matching appearance */
      __appearanceSelector__P_48_14: null,

      /** @type {Boolean} Whether the selectors needs to be recomputed before updating appearance */
      __updateSelector__P_48_15: null,

      /**
       * Renders the appearance using the current widget states.
       *
       * Used exclusively by {qx.ui.core.queue.Appearance}.
       */
      syncAppearance: function syncAppearance() {
        var states = this.__states__P_48_12;
        var selector = this.__appearanceSelector__P_48_14;
        var manager = qx.theme.manager.Appearance.getInstance(); // Cache deep accessor

        var styler = qx.core.Property.$$method.setThemed;
        var unstyler = qx.core.Property.$$method.resetThemed; // Check for requested selector update

        if (this.__updateSelector__P_48_15) {
          // Clear flag
          delete this.__updateSelector__P_48_15; // Check if the selector was created previously

          if (selector) {
            // Query old selector
            var oldData = manager.styleFrom(selector, states, null, this.getAppearance()); // Clear current selector (to force recompute)

            selector = null;
          }
        } // Build selector


        if (!selector) {
          var obj = this;
          var id = [];

          do {
            id.push(obj.$$subcontrol || obj.getAppearance());
          } while (obj = obj.$$subparent); // Combine parent control IDs, add top level appearance, filter result
          // to not include positioning information anymore (e.g. #3)


          selector = id.reverse().join("/").replace(/#[0-9]+/g, "");
          this.__appearanceSelector__P_48_14 = selector;
        } // Query current selector


        var newData = manager.styleFrom(selector, states, null, this.getAppearance());

        if (newData) {
          if (oldData) {
            for (var prop in oldData) {
              if (newData[prop] === undefined) {
                this[unstyler[prop]]();
              }
            }
          } // Check property availability of new data


          {
            for (var prop in newData) {
              if (!this[styler[prop]]) {
                throw new Error(this.classname + ' has no themeable property "' + prop + '" while styling ' + selector);
              }
            }
          } // Apply new data

          for (var prop in newData) {
            newData[prop] === undefined ? this[unstyler[prop]]() : this[styler[prop]](newData[prop]);
          }
        } else if (oldData) {
          // Clear old data
          for (var prop in oldData) {
            this[unstyler[prop]]();
          }
        }

        this.fireDataEvent("syncAppearance", this.__states__P_48_12);
      },
      // property apply
      _applyAppearance: function _applyAppearance(value, old) {
        this.updateAppearance();
      },

      /**
       * Helper method called from the visibility queue to detect outstanding changes
       * to the appearance.
       *
       * @internal
       */
      checkAppearanceNeeds: function checkAppearanceNeeds() {
        // CASE 1: Widget has never got an appearance already because it was never
        // visible before. Normally add it to the queue is the easiest way to update it.
        if (!this.__initialAppearanceApplied__P_48_3) {
          qx.ui.core.queue.Appearance.add(this);
          this.__initialAppearanceApplied__P_48_3 = true;
        } // CASE 2: Widget has got an appearance before, but was hidden for some time
        // which results into maybe omitted state changes have not been applied.
        // In this case the widget is already queued in the appearance. This is basically
        // what all addState/removeState do, but the queue itself may not have been registered
        // to be flushed
        else if (this.$$stateChanges) {
          qx.ui.core.queue.Appearance.add(this);
          delete this.$$stateChanges;
        }
      },

      /**
       * Refreshes the appearance of this widget and all
       * registered child controls.
       */
      updateAppearance: function updateAppearance() {
        // Clear selector
        this.__updateSelector__P_48_15 = true; // Add to appearance queue

        qx.ui.core.queue.Appearance.add(this); // Update child controls

        var controls = this.__childControls__P_48_13;

        if (controls) {
          var obj;

          for (var id in controls) {
            obj = controls[id];

            if (obj instanceof qx.ui.core.Widget) {
              obj.updateAppearance();
            }
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        WIDGET QUEUE
      ---------------------------------------------------------------------------
      */

      /**
       * This method is called during the flush of the
       * {@link qx.ui.core.queue.Widget widget queue}.
       *
       * @param jobs {Map} A map of jobs.
       */
      syncWidget: function syncWidget(jobs) {// empty implementation
      },

      /*
      ---------------------------------------------------------------------------
        EVENT SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the next event target in the parent chain. May
       * also return the widget itself if it is not anonymous.
       *
       * @return {qx.ui.core.Widget} A working event target of this widget.
       *    May be <code>null</code> as well.
       */
      getEventTarget: function getEventTarget() {
        var target = this;

        while (target.getAnonymous()) {
          target = target.getLayoutParent();

          if (!target) {
            return null;
          }
        }

        return target;
      },

      /**
       * Returns the next focus target in the parent chain. May
       * also return the widget itself if it is not anonymous and focusable.
       *
       * @return {qx.ui.core.Widget} A working focus target of this widget.
       *    May be <code>null</code> as well.
       */
      getFocusTarget: function getFocusTarget() {
        var target = this;

        if (!target.getEnabled()) {
          return null;
        }

        while (target.getAnonymous() || !target.getFocusable()) {
          target = target.getLayoutParent();

          if (!target || !target.getEnabled()) {
            return null;
          }
        }

        return target;
      },

      /**
       * Returns the element which should be focused.
       *
       * @return {qx.html.Element} The html element to focus.
       */
      getFocusElement: function getFocusElement() {
        return this.getContentElement();
      },

      /**
       * Whether the widget is reachable by pressing the TAB key.
       *
       * Normally tests for both, the focusable property and a positive or
       * undefined tabIndex property. The widget must have a DOM element
       * since only visible widgets are tabable.
       *
       * @return {Boolean} Whether the element is tabable.
       */
      isTabable: function isTabable() {
        return !!this.getContentElement().getDomElement() && this.isFocusable();
      },
      // property apply
      _applyFocusable: function _applyFocusable(value, old) {
        var target = this.getFocusElement(); // Apply native tabIndex attribute

        if (value) {
          var tabIndex = this.getTabIndex();

          if (tabIndex == null) {
            tabIndex = 1;
          }

          target.setAttribute("tabIndex", tabIndex); // Omit native dotted outline border

          target.setStyle("outline", "none");
        } else {
          if (target.isNativelyFocusable()) {
            target.setAttribute("tabIndex", -1);
          } else if (old) {
            target.setAttribute("tabIndex", null);
          }
        }
      },
      // property apply
      _applyKeepFocus: function _applyKeepFocus(value) {
        var target = this.getFocusElement();
        target.setAttribute("qxKeepFocus", value ? "on" : null);
      },
      // property apply
      _applyKeepActive: function _applyKeepActive(value) {
        var target = this.getContentElement();
        target.setAttribute("qxKeepActive", value ? "on" : null);
      },
      // property apply
      _applyTabIndex: function _applyTabIndex(value) {
        if (value == null) {
          value = 1;
        } else if (value < 1 || value > 32000) {
          throw new Error("TabIndex property must be between 1 and 32000");
        }

        if (this.getFocusable() && value != null) {
          this.getFocusElement().setAttribute("tabIndex", value);
        }
      },
      // property apply
      _applySelectable: function _applySelectable(value, old) {
        // Re-apply cursor if not in "initSelectable"
        if (old !== null) {
          this._applyCursor(this.getCursor());
        } // Apply qooxdoo attribute


        this.getContentElement().setSelectable(value);
      },
      // property apply
      _applyEnabled: function _applyEnabled(value, old) {
        if (value === false) {
          this.addState("disabled"); // hovered not configured in widget, but as this is a
          // standardized name in qooxdoo and we never want a hover
          // state for disabled widgets, remove this state every time

          this.removeState("hovered"); // Blur when focused

          if (this.isFocusable()) {
            // Remove focused state
            this.removeState("focused"); // Remove tabIndex

            this._applyFocusable(false, true);
          } // Remove draggable


          if (this.isDraggable()) {
            this._applyDraggable(false, true);
          } // Remove droppable


          if (this.isDroppable()) {
            this._applyDroppable(false, true);
          }
        } else {
          this.removeState("disabled"); // Re-add tabIndex

          if (this.isFocusable()) {
            this._applyFocusable(true, false);
          } // Re-add draggable


          if (this.isDraggable()) {
            this._applyDraggable(true, false);
          } // Re-add droppable


          if (this.isDroppable()) {
            this._applyDroppable(true, false);
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        CONTEXT MENU
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyNativeContextMenu: function _applyNativeContextMenu(value, old, name) {// empty body to allow overriding
      },
      // property apply
      _applyContextMenu: function _applyContextMenu(value, old) {
        if (old) {
          old.removeState("contextmenu");

          if (old.getOpener() == this) {
            old.resetOpener();
          }

          if (!value) {
            this.removeListener("contextmenu", this._onContextMenuOpen);
            this.removeListener("longtap", this._onContextMenuOpen);
            old.removeListener("changeVisibility", this._onBeforeContextMenuOpen, this);
          }
        }

        if (value) {
          value.setOpener(this);
          value.addState("contextmenu");

          if (!old) {
            this.addListener("contextmenu", this._onContextMenuOpen);
            this.addListener("longtap", this._onContextMenuOpen);
            value.addListener("changeVisibility", this._onBeforeContextMenuOpen, this);
          }
        }
      },

      /**
       * Event listener for <code>contextmenu</code> event
       *
       * @param e {qx.event.type.Pointer} The event object
       */
      _onContextMenuOpen: function _onContextMenuOpen(e) {
        // only allow long tap context menu on touch interactions
        if (e.getType() == "longtap") {
          if (e.getPointerType() !== "touch") {
            return;
          }
        }

        this.getContextMenu().openAtPointer(e); // Do not show native menu
        // don't open any other contextmenus

        e.stop();
      },

      /**
       * Event listener for <code>beforeContextmenuOpen</code> event
       *
       * @param e {qx.event.type.Data} The data event
       */
      _onBeforeContextMenuOpen: function _onBeforeContextMenuOpen(e) {
        if (e.getData() == "visible" && this.hasListener("beforeContextmenuOpen")) {
          this.fireDataEvent("beforeContextmenuOpen", e);
        }
      },

      /*
      ---------------------------------------------------------------------------
        USEFUL COMMON EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener which stops a bubbling event from
       * propagates further.
       *
       * @param e {qx.event.type.Event} Any bubbling event
       */
      _onStopEvent: function _onStopEvent(e) {
        e.stopPropagation();
      },

      /*
      ---------------------------------------------------------------------------
        DRAG & DROP SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Helper to return a instance of a {@link qx.ui.core.DragDropCursor}.
       * If you want to use your own DragDropCursor, override this method
       * and return your custom instance.
       * @return {qx.ui.core.DragDropCursor} A drag drop cursor implementation.
       */
      _getDragDropCursor: function _getDragDropCursor() {
        return qx.ui.core.DragDropCursor.getInstance();
      },
      // property apply
      _applyDraggable: function _applyDraggable(value, old) {
        if (!this.isEnabled() && value === true) {
          value = false;
        } // Force cursor creation


        this._getDragDropCursor(); // Process listeners


        if (value) {
          this.addListener("dragstart", this._onDragStart);
          this.addListener("drag", this._onDrag);
          this.addListener("dragend", this._onDragEnd);
          this.addListener("dragchange", this._onDragChange);
        } else {
          this.removeListener("dragstart", this._onDragStart);
          this.removeListener("drag", this._onDrag);
          this.removeListener("dragend", this._onDragEnd);
          this.removeListener("dragchange", this._onDragChange);
        } // Sync DOM attribute


        this.getContentElement().setAttribute("qxDraggable", value ? "on" : null);
      },
      // property apply
      _applyDroppable: function _applyDroppable(value, old) {
        if (!this.isEnabled() && value === true) {
          value = false;
        } // Sync DOM attribute


        this.getContentElement().setAttribute("qxDroppable", value ? "on" : null);
      },

      /**
       * Event listener for own <code>dragstart</code> event.
       *
       * @param e {qx.event.type.Drag} Drag event
       */
      _onDragStart: function _onDragStart(e) {
        this._getDragDropCursor().placeToPointer(e);

        this.getApplicationRoot().setGlobalCursor("default");
      },

      /**
       * Event listener for own <code>drag</code> event.
       *
       * @param e {qx.event.type.Drag} Drag event
       */
      _onDrag: function _onDrag(e) {
        this._getDragDropCursor().placeToPointer(e);
      },

      /**
       * Event listener for own <code>dragend</code> event.
       *
       * @param e {qx.event.type.Drag} Drag event
       */
      _onDragEnd: function _onDragEnd(e) {
        this._getDragDropCursor().moveTo(-1000, -1000);

        this.getApplicationRoot().resetGlobalCursor();
      },

      /**
       * Event listener for own <code>dragchange</code> event.
       *
       * @param e {qx.event.type.Drag} Drag event
       */
      _onDragChange: function _onDragChange(e) {
        var cursor = this._getDragDropCursor();

        var action = e.getCurrentAction();
        action ? cursor.setAction(action) : cursor.resetAction();
      },

      /*
      ---------------------------------------------------------------------------
        VISUALIZE FOCUS STATES
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler which is executed when the widget receives the focus.
       *
       * This method is used by the {@link qx.ui.core.FocusHandler} to
       * apply states etc. to a focused widget.
       *
       * @internal
       */
      visualizeFocus: function visualizeFocus() {
        this.addState("focused");
      },

      /**
       * Event handler which is executed when the widget lost the focus.
       *
       * This method is used by the {@link qx.ui.core.FocusHandler} to
       * remove states etc. from a previously focused widget.
       *
       * @internal
       */
      visualizeBlur: function visualizeBlur() {
        this.removeState("focused");
      },

      /*
      ---------------------------------------------------------------------------
        SCROLL CHILD INTO VIEW
      ---------------------------------------------------------------------------
      */

      /**
       * The method scrolls the given item into view.
       *
       * @param child {qx.ui.core.Widget} Child to scroll into view
       * @param alignX {String?null} Alignment of the item. Allowed values:
       *   <code>left</code> or <code>right</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param alignY {String?null} Alignment of the item. Allowed values:
       *   <code>top</code> or <code>bottom</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param direct {Boolean?true} Whether the execution should be made
       *   directly when possible
       */
      scrollChildIntoView: function scrollChildIntoView(child, alignX, alignY, direct) {
        // Scroll directly on default
        direct = typeof direct == "undefined" ? true : direct; // Always lazy scroll when either
        // - the child
        // - its layout parent
        // - its siblings
        // have layout changes scheduled.
        //
        // This is to make sure that the scroll position is computed
        // after layout changes have been applied to the DOM. Note that changes
        // scheduled for the grand parent (and up) are not tracked and need to
        // be signaled manually.

        var Layout = qx.ui.core.queue.Layout;
        var parent; // Child

        if (direct) {
          direct = !Layout.isScheduled(child);
          parent = child.getLayoutParent(); // Parent

          if (direct && parent) {
            direct = !Layout.isScheduled(parent); // Siblings

            if (direct) {
              parent.getChildren().forEach(function (sibling) {
                direct = direct && !Layout.isScheduled(sibling);
              });
            }
          }
        }

        this.scrollChildIntoViewX(child, alignX, direct);
        this.scrollChildIntoViewY(child, alignY, direct);
      },

      /**
       * The method scrolls the given item into view (x-axis only).
       *
       * @param child {qx.ui.core.Widget} Child to scroll into view
       * @param align {String?null} Alignment of the item. Allowed values:
       *   <code>left</code> or <code>right</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param direct {Boolean?true} Whether the execution should be made
       *   directly when possible
       */
      scrollChildIntoViewX: function scrollChildIntoViewX(child, align, direct) {
        this.getContentElement().scrollChildIntoViewX(child.getContentElement(), align, direct);
      },

      /**
       * The method scrolls the given item into view (y-axis only).
       *
       * @param child {qx.ui.core.Widget} Child to scroll into view
       * @param align {String?null} Alignment of the element. Allowed values:
       *   <code>top</code> or <code>bottom</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param direct {Boolean?true} Whether the execution should be made
       *   directly when possible
       */
      scrollChildIntoViewY: function scrollChildIntoViewY(child, align, direct) {
        this.getContentElement().scrollChildIntoViewY(child.getContentElement(), align, direct);
      },

      /*
      ---------------------------------------------------------------------------
        FOCUS SYSTEM USER ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Focus this widget.
       *
       */
      focus: function focus() {
        if (this.isFocusable()) {
          this.getFocusElement().focus();
        } else if (qx.ui.core.Widget.UNFOCUSABLE_WIDGET_FOCUS_BLUR_ERROR) {
          throw new Error("Widget is not focusable!");
        }
      },

      /**
       * Remove focus from this widget.
       *
       */
      blur: function blur() {
        if (this.isFocusable()) {
          this.getFocusElement().blur();
        } else if (qx.ui.core.Widget.UNFOCUSABLE_WIDGET_FOCUS_BLUR_ERROR) {
          throw new Error("Widget is not focusable!");
        }
      },

      /**
       * Activate this widget e.g. for keyboard events.
       *
       */
      activate: function activate() {
        this.getContentElement().activate();
      },

      /**
       * Deactivate this widget e.g. for keyboard events.
       *
       */
      deactivate: function deactivate() {
        this.getContentElement().deactivate();
      },

      /**
       * Focus this widget when using the keyboard. This is
       * mainly thought for the advanced qooxdoo keyboard handling
       * and should not be used by the application developer.
       *
       * @internal
       */
      tabFocus: function tabFocus() {
        this.getFocusElement().focus();
      },

      /*
      ---------------------------------------------------------------------------
        CHILD CONTROL SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Whether the given ID is assigned to a child control.
       *
       * @param id {String} ID of the child control
       * @return {Boolean} <code>true</code> when the child control is registered.
       */
      hasChildControl: function hasChildControl(id) {
        if (!this.__childControls__P_48_13) {
          return false;
        }

        return !!this.__childControls__P_48_13[id];
      },

      /** @type {Map} Map of instantiated child controls */
      __childControls__P_48_13: null,

      /**
       * Returns a map of all already created child controls
       *
       * @return {Map} mapping of child control id to the child widget.
       */
      _getCreatedChildControls: function _getCreatedChildControls() {
        return this.__childControls__P_48_13;
      },

      /**
       * Returns the child control from the given ID. Returns
       * <code>null</code> when the child control is unknown.
       *
       * It is designed for widget authors, who want to access child controls,
       * which are created by the widget itself.
       *
       * <b>Warning</b>: This method exposes widget internals and modifying the
       * returned sub widget may bring the widget into an inconsistent state.
       * Accessing child controls defined in a super class or in an foreign class
       * is not supported. Do not use it if the result can be achieved using public
       * API or theming.
       *
       * @param id {String} ID of the child control
       * @param notcreate {Boolean?false} Whether the child control
       *    should not be created dynamically if not yet available.
       * @return {qx.ui.core.Widget} Child control
       */
      getChildControl: function getChildControl(id, notcreate) {
        if (!this.__childControls__P_48_13) {
          if (notcreate) {
            return null;
          }

          this.__childControls__P_48_13 = {};
        }

        var control = this.__childControls__P_48_13[id];

        if (control) {
          return control;
        }

        if (notcreate === true) {
          return null;
        }

        return this._createChildControl(id);
      },

      /**
       * Shows the given child control by ID
       *
       * @param id {String} ID of the child control
       * @return {qx.ui.core.Widget} the child control
       */
      _showChildControl: function _showChildControl(id) {
        var control = this.getChildControl(id);
        control.show();
        return control;
      },

      /**
       * Excludes the given child control by ID
       *
       * @param id {String} ID of the child control
       */
      _excludeChildControl: function _excludeChildControl(id) {
        var control = this.getChildControl(id, true);

        if (control) {
          control.exclude();
        }
      },

      /**
       * Whether the given child control is visible.
       *
       * @param id {String} ID of the child control
       * @return {Boolean} <code>true</code> when the child control is visible.
       */
      _isChildControlVisible: function _isChildControlVisible(id) {
        var control = this.getChildControl(id, true);

        if (control) {
          return control.isVisible();
        }

        return false;
      },

      /**
       * Release the child control by ID and decouple the
       * child from the parent. This method does not dispose the child control.
       *
       * @param id {String} ID of the child control
       * @return {qx.ui.core.Widget} The released control
       */
      _releaseChildControl: function _releaseChildControl(id) {
        var control = this.getChildControl(id, false);

        if (!control) {
          throw new Error("Unsupported control: " + id);
        } // remove connection to parent


        delete control.$$subcontrol;
        delete control.$$subparent; // remove state forwarding

        var states = this.__states__P_48_12;
        var forward = this._forwardStates;

        if (states && forward && control instanceof qx.ui.core.Widget) {
          for (var state in states) {
            if (forward[state]) {
              control.removeState(state);
            }
          }
        }

        delete this.__childControls__P_48_13[id];
        return control;
      },

      /**
       * Force the creation of the given child control by ID.
       *
       * Do not override this method! Override {@link #_createChildControlImpl}
       * instead if you need to support new controls.
       *
       * @param id {String} ID of the child control
       * @return {qx.ui.core.Widget} The created control
       * @throws {Error} when the control was created before
       */
      _createChildControl: function _createChildControl(id) {
        if (!this.__childControls__P_48_13) {
          this.__childControls__P_48_13 = {};
        } else if (this.__childControls__P_48_13[id]) {
          throw new Error("Child control '" + id + "' already created!");
        }

        var pos = id.indexOf("#");

        try {
          if (pos == -1) {
            var control = this._createChildControlImpl(id);
          } else {
            var control = this._createChildControlImpl(id.substring(0, pos), id.substring(pos + 1, id.length));
          }
        } catch (exc) {
          exc.message = "Exception while creating child control '" + id + "' of widget " + this.toString() + ": " + exc.message;
          throw exc;
        }

        if (!control) {
          throw new Error("Unsupported control: " + id);
        } // Establish connection to parent


        control.$$subcontrol = id;
        control.$$subparent = this; // Support for state forwarding

        var states = this.__states__P_48_12;
        var forward = this._forwardStates;

        if (states && forward && control instanceof qx.ui.core.Widget) {
          for (var state in states) {
            if (forward[state]) {
              control.addState(state);
            }
          }
        } // If the appearance is already synced after the child control
        // we need to update the appearance now, because the selector
        // might be not correct in certain cases.


        if (control.$$resyncNeeded) {
          delete control.$$resyncNeeded;
          control.updateAppearance();
        }

        this.fireDataEvent("createChildControl", control); // Register control and return

        return this.__childControls__P_48_13[id] = control;
      },

      /**
       * Internal method to create child controls. This method
       * should be overwritten by classes which extends this one
       * to support new child control types.
       *
       * @param id {String} ID of the child control. If a # is used, the id is
       *   the part in front of the #.
       * @param hash {String?undefined} If a child control name contains a #,
       *   all text following the # will be the hash argument.
       * @return {qx.ui.core.Widget} The created control or <code>null</code>
       */
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        return null;
      },

      /**
       * Dispose all registered controls. This is automatically
       * executed by the widget.
       *
       */
      _disposeChildControls: function _disposeChildControls() {
        var controls = this.__childControls__P_48_13;

        if (!controls) {
          return;
        }

        var Widget = qx.ui.core.Widget;

        for (var id in controls) {
          var control = controls[id];

          if (!Widget.contains(this, control)) {
            control.destroy();
          } else {
            control.dispose();
          }
        }

        delete this.__childControls__P_48_13;
      },

      /**
       * Finds and returns the top level control. This is the first
       * widget which is not a child control of any other widget.
       *
       * @return {qx.ui.core.Widget} The top control
       */
      _findTopControl: function _findTopControl() {
        var obj = this;

        while (obj) {
          if (!obj.$$subparent) {
            return obj;
          }

          obj = obj.$$subparent;
        }

        return null;
      },

      /**
       * Return the ID (name) if this instance was a created as a child control of another widget.
       *
       * See the first parameter id in {@link qx.ui.core.Widget#_createChildControlImpl}
       *
       * @return {String|null} ID of the current widget or null if it was not created as a subcontrol
       */
      getSubcontrolId: function getSubcontrolId() {
        return this.$$subcontrol || null;
      },

      /*
      ---------------------------------------------------------------------------
        LOWER LEVEL ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Computes the location of the content element in context of the document
       * dimensions.
       *
       * Supported modes:
       *
       * * <code>margin</code>: Calculate from the margin box of the element
       *   (bigger than the visual appearance: including margins of given element)
       * * <code>box</code>: Calculates the offset box of the element (default,
       *   uses the same size as visible)
       * * <code>border</code>: Calculate the border box (useful to align to
       *   border edges of two elements).
       * * <code>scroll</code>: Calculate the scroll box (relevant for absolute
       *   positioned content).
       * * <code>padding</code>: Calculate the padding box (relevant for
       *   static/relative positioned content).
       *
       * @param mode {String?box} A supported option. See comment above.
       * @return {Map} Returns a map with <code>left</code>, <code>top</code>,
       *   <code>right</code> and <code>bottom</code> which contains the distance
       *   of the element relative to the document.
       */
      getContentLocation: function getContentLocation(mode) {
        var domEl = this.getContentElement().getDomElement();
        return domEl ? qx.bom.element.Location.get(domEl, mode) : null;
      },

      /**
       * Directly modifies the relative left position in relation
       * to the parent element.
       *
       * Use with caution! This may be used for animations, drag&drop
       * or other cases where high performance location manipulation
       * is important. Otherwise please use {@link qx.ui.core.LayoutItem#setUserBounds} instead.
       *
       * @param value {Integer} Left position
       */
      setDomLeft: function setDomLeft(value) {
        var domEl = this.getContentElement().getDomElement();

        if (domEl) {
          domEl.style.left = value + "px";
        } else {
          throw new Error("DOM element is not yet created!");
        }
      },

      /**
       * Directly modifies the relative top position in relation
       * to the parent element.
       *
       * Use with caution! This may be used for animations, drag&drop
       * or other cases where high performance location manipulation
       * is important. Otherwise please use {@link qx.ui.core.LayoutItem#setUserBounds} instead.
       *
       * @param value {Integer} Top position
       */
      setDomTop: function setDomTop(value) {
        var domEl = this.getContentElement().getDomElement();

        if (domEl) {
          domEl.style.top = value + "px";
        } else {
          throw new Error("DOM element is not yet created!");
        }
      },

      /**
       * Directly modifies the relative left and top position in relation
       * to the parent element.
       *
       * Use with caution! This may be used for animations, drag&drop
       * or other cases where high performance location manipulation
       * is important. Otherwise please use {@link qx.ui.core.LayoutItem#setUserBounds} instead.
       *
       * @param left {Integer} Left position
       * @param top {Integer} Top position
       */
      setDomPosition: function setDomPosition(left, top) {
        var domEl = this.getContentElement().getDomElement();

        if (domEl) {
          domEl.style.left = left + "px";
          domEl.style.top = top + "px";
        } else {
          throw new Error("DOM element is not yet created!");
        }
      },

      /*
      ---------------------------------------------------------------------------
        ARIA attrs support
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the string which labels this widget. This will be read out by screenreaders. Needed if there is no
       * readable text/label in this widget which would automatically act as aria-label.
       * @param label {String} Labelling Text
       */
      setAriaLabel: function setAriaLabel(label) {
        this.getContentElement().setAttribute("aria-label", label);
      },

      /**
       * Marks that this widget gets labelled by another widget. This will be read out by screenreaders as first
       * information.
       * Similiar to aria-label, difference being that the labelling widget is an different widget and multiple
       * widgets can be added.
       * @param labelWidgets {qx.ui.core.Widget[]} Indefinite Number of labelling Widgets
       */
      addAriaLabelledBy: function addAriaLabelledBy() {
        for (var _len = arguments.length, labelWidgets = new Array(_len), _key = 0; _key < _len; _key++) {
          labelWidgets[_key] = arguments[_key];
        }

        this.__addAriaXBy__P_48_16(labelWidgets, "aria-labelledby");
      },

      /**
       * Marks that this widget gets described by another widget. This will be read out by screenreaders as last
       * information. Multiple Widgets possible.
       * @param describingWidgets {qx.ui.core.Widget[]} Indefinite Number of describing Widgets
       */
      addAriaDescribedBy: function addAriaDescribedBy() {
        for (var _len2 = arguments.length, describingWidgets = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          describingWidgets[_key2] = arguments[_key2];
        }

        this.__addAriaXBy__P_48_16(describingWidgets, "aria-describedby");
      },

      /**
       * Sets either aria-labelledby or aria-describedby
       * @param widgets {qx.ui.core.Widget[]} Indefinite Number of widgets
       * @param ariaAttr {String} aria-labelledby | aria-describedby
       */
      __addAriaXBy__P_48_16: function __addAriaXBy__P_48_16(widgets, ariaAttr) {
        if (!["aria-labelledby", "aria-describedby"].includes(ariaAttr)) {
          throw new Error("Only aria-labelledby or aria-describedby allowed!");
        }

        var idArr = [];

        var _iterator = _createForOfIteratorHelper(widgets),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var widget = _step.value;

            if (!(widget instanceof qx.ui.core.Widget)) {
              throw new Error("Given widget " + widget + " is not an instance of qx.ui.core.Widget!");
            }

            var _contentEl = widget.getContentElement();

            var widgetId = _contentEl.getAttribute("id");

            if (!widgetId) {
              widgetId = "label-".concat(widget.toHashCode());

              _contentEl.setAttribute("id", widgetId);
            }

            if (!idArr.includes(widgetId)) {
              idArr.push(widgetId);
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        if (idArr.length === 0) {
          return;
        }

        var idStr = idArr.join(" ");
        var contentEl = this.getContentElement();
        var res = contentEl.getAttribute(ariaAttr);
        res = res ? "".concat(res, " ").concat(idStr) : idStr;
        contentEl.setAttribute(ariaAttr, res);
      },

      /*
      ---------------------------------------------------------------------------
        ENHANCED DISPOSE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Removes this widget from its parent and disposes it.
       *
       * Please note that the widget is not disposed synchronously. The
       * real dispose happens after the next queue flush.
       *
       */
      destroy: function destroy() {
        if (this.$$disposed) {
          return;
        } // We may be deferring disposing, but we can at least prevent
        // listener handlers from being called. We don't know exactly
        // what listeners have already been disposed at this point.


        qx.event.Registration.removeAllListeners(this);
        var parent = this.$$parent;

        if (parent) {
          parent._remove(this);
        }

        qx.ui.core.queue.Dispose.add(this);
      },

      /*
      ---------------------------------------------------------------------------
        CLONE SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      clone: function clone() {
        var clone = qx.ui.core.Widget.superclass.prototype.clone.call(this);

        if (this.getChildren) {
          var children = this.getChildren();

          for (var i = 0, l = children.length; i < l; i++) {
            clone.add(children[i].clone());
          }
        }

        return clone;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      // Some dispose stuff is not needed in global shutdown, otherwise
      // it just slows down things a bit, so do not do them.
      if (!qx.core.ObjectRegistry.inShutDown) {
        {
          if (this.__toolTipTextListenerId__P_48_4) {
            qx.locale.Manager.getInstance().removeListenerById(this.__toolTipTextListenerId__P_48_4);
          }
        } // Remove widget pointer from DOM

        var contentEl = this.getContentElement();

        if (contentEl) {
          contentEl.disconnectWidget(this);
        } // Clean up all child controls


        this._disposeChildControls(); // Remove from ui queues


        qx.ui.core.queue.Appearance.remove(this);
        qx.ui.core.queue.Layout.remove(this);
        qx.ui.core.queue.Visibility.remove(this);
        qx.ui.core.queue.Widget.remove(this);
      }

      if (this.getContextMenu()) {
        this.setContextMenu(null);
      } // pool decorators if not in global shutdown


      if (!qx.core.ObjectRegistry.inShutDown) {
        this.clearSeparators();
        this.__separators__P_48_6 = null;
      } else {
        this._disposeArray("__separators__P_48_6");
      } // Clear children array


      this._disposeArray("__widgetChildren__P_48_7"); // Cleanup map of appearance states


      this.__states__P_48_12 = this.__childControls__P_48_13 = null; // Dispose layout manager and HTML elements

      this._disposeObjects("__layoutManager__P_48_5", "__contentElement__P_48_0");
    }
  });
  qx.ui.core.Widget.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.log.Logger": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This mixin exposes all basic methods to manage widget children as public methods.
   * It can only be included into instances of {@link Widget}.
   *
   * To optimize the method calls the including widget should call the method
   * {@link #remap} in its defer function. This will map the protected
   * methods to the public ones and save one method call for each function.
   */
  qx.Mixin.define("qx.ui.core.MChildrenHandling", {
    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Returns the children list
       *
       * @return {qx.ui.core.LayoutItem[]} The children array (Arrays are
       *   reference types, please do not modify them in-place)
       */
      getChildren: function getChildren() {
        return this._getChildren();
      },

      /**
       * Whether the widget contains children.
       *
       * @return {Boolean} Returns <code>true</code> when the widget has children.
       */
      hasChildren: function hasChildren() {
        return this._hasChildren();
      },

      /**
       * Returns the index position of the given widget if it is
       * a child widget. Otherwise it returns <code>-1</code>.
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param child {qx.ui.core.Widget} the widget to query for
       * @return {Integer} The index position or <code>-1</code> when
       *   the given widget is no child of this layout.
       */
      indexOf: function indexOf(child) {
        return this._indexOf(child);
      },

      /**
       * Adds a new child widget.
       *
       * The supported keys of the layout options map depend on the layout manager
       * used to position the widget. The options are documented in the class
       * documentation of each layout manager {@link qx.ui.layout}.
       *
       * @param child {qx.ui.core.LayoutItem} the widget to add.
       * @param options {Map?null} Optional layout data for widget.
       */
      add: function add(child, options) {
        this._add(child, options);
      },

      /**
       * Add a child widget at the specified index
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param child {qx.ui.core.LayoutItem} Widget to add
       * @param index {Integer} Index, at which the widget will be inserted
       * @param options {Map?null} Optional layout data for widget.
       */
      addAt: function addAt(child, index, options) {
        this._addAt(child, index, options);
      },

      /**
       * Add a widget before another already inserted widget
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param child {qx.ui.core.LayoutItem} Widget to add
       * @param before {qx.ui.core.LayoutItem} Widget before the new widget will be inserted.
       * @param options {Map?null} Optional layout data for widget.
       */
      addBefore: function addBefore(child, before, options) {
        this._addBefore(child, before, options);
      },

      /**
       * Add a widget after another already inserted widget
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param child {qx.ui.core.LayoutItem} Widget to add
       * @param after {qx.ui.core.LayoutItem} Widget, after which the new widget will be inserted
       * @param options {Map?null} Optional layout data for widget.
       */
      addAfter: function addAfter(child, after, options) {
        this._addAfter(child, after, options);
      },

      /**
       * Remove the given child widget.
       *
       * @param child {qx.ui.core.LayoutItem} the widget to remove
       */
      remove: function remove(child) {
        this._remove(child);
      },

      /**
       * Remove the widget at the specified index.
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param index {Integer} Index of the widget to remove.
       * @return {qx.ui.core.LayoutItem} The child removed.
       */
      removeAt: function removeAt(index) {
        return this._removeAt(index);
      },

      /**
       * Remove all children.
       *
       * @return {Array} An array of the removed children.
       */
      removeAll: function removeAll() {
        return this._removeAll();
      }
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Mapping of protected methods to public.
       * This omits an additional function call when using these methods. Call
       * this methods in the defer block of the including class.
       *
       * @param members {Map} The including classes members map
       * @deprecated {7.0} this is not necessary in modern compilers and leads to unexpected behaviour
       */
      remap: function remap(members) {
        {
          qx.log.Logger.debug("Calling qx.ui.core.MChildrenHandling.remap is deprecated, please dont use it");
        }
        members.getChildren = members._getChildren;
        members.hasChildren = members._hasChildren;
        members.indexOf = members._indexOf;
        members.add = members._add;
        members.addAt = members._addAt;
        members.addBefore = members._addBefore;
        members.addAfter = members._addAfter;
        members.remove = members._remove;
        members.removeAt = members._removeAt;
        members.removeAll = members._removeAll;
      }
    }
  });
  qx.ui.core.MChildrenHandling.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Blocker": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This mixin blocks events and can be included into all widgets.
   *
   * The {@link #block} and {@link #unblock} methods provided by this mixin can be used
   * to block any event from the widget. When blocked,
   * the blocker widget overlays the widget to block, including the padding area.
   *
   * The ({@link #blockContent} method can be used to block child widgets with a
   * zIndex below a certain value.
   */
  qx.Mixin.define("qx.ui.core.MBlocker", {
    properties: {
      /**
       * Color of the blocker
       */
      blockerColor: {
        check: "Color",
        init: null,
        nullable: true,
        apply: "_applyBlockerColor",
        themeable: true
      },

      /**
       * Opacity of the blocker
       */
      blockerOpacity: {
        check: "Number",
        init: 1,
        apply: "_applyBlockerOpacity",
        themeable: true
      }
    },
    members: {
      __blocker__P_71_0: null,

      /**
       * Template method for creating the blocker item.
       * @return {qx.ui.core.Blocker} The blocker to use.
       */
      _createBlocker: function _createBlocker() {
        return new qx.ui.core.Blocker(this);
      },
      // property apply
      _applyBlockerColor: function _applyBlockerColor(value, old) {
        this.getBlocker().setColor(value);
      },
      // property apply
      _applyBlockerOpacity: function _applyBlockerOpacity(value, old) {
        this.getBlocker().setOpacity(value);
      },

      /**
       * Block all events from this widget by placing a transparent overlay widget,
       * which receives all events, exactly over the widget.
       */
      block: function block() {
        this.getBlocker().block();
      },

      /**
       * Returns whether the widget is blocked.
       *
       * @return {Boolean} Whether the widget is blocked.
       */
      isBlocked: function isBlocked() {
        return this.__blocker__P_71_0 && this.__blocker__P_71_0.isBlocked();
      },

      /**
       * Unblock the widget blocked by {@link #block}, but it takes care of
       * the amount of {@link #block} calls. The blocker is only removed if
       * the number of {@link #unblock} calls is identical to {@link #block} calls.
       */
      unblock: function unblock() {
        if (this.__blocker__P_71_0) {
          this.__blocker__P_71_0.unblock();
        }
      },

      /**
       * Unblock the widget blocked by {@link #block}, but it doesn't take care of
       * the amount of {@link #block} calls. The blocker is directly removed.
       */
      forceUnblock: function forceUnblock() {
        if (this.__blocker__P_71_0) {
          this.__blocker__P_71_0.forceUnblock();
        }
      },

      /**
       * Block direct child widgets with a zIndex below <code>zIndex</code>
       *
       * @param zIndex {Integer} All child widgets with a zIndex below this value
       *     will be blocked
       */
      blockContent: function blockContent(zIndex) {
        this.getBlocker().blockContent(zIndex);
      },

      /**
       * Get the blocker
       *
       * @return {qx.ui.core.Blocker} The blocker
       */
      getBlocker: function getBlocker() {
        if (!this.__blocker__P_71_0) {
          this.__blocker__P_71_0 = this._createBlocker();
        }

        return this.__blocker__P_71_0;
      }
    },
    destruct: function destruct() {
      this._disposeObjects("__blocker__P_71_0");
    }
  });
  qx.ui.core.MBlocker.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.Class": {},
      "qx.lang.Array": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This mixin implements the key methods of the {@link qx.ui.window.IDesktop}.
   *
   * @ignore(qx.ui.window.Window)
   * @ignore(qx.ui.window.Window.*)
   */
  qx.Mixin.define("qx.ui.window.MDesktop", {
    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The currently active window
       */
      activeWindow: {
        check: "qx.ui.window.Window",
        apply: "_applyActiveWindow",
        event: "changeActiveWindow",
        init: null,
        nullable: true
      }
    },
    events: {
      /**
       * Fired when a window was added.
       */
      windowAdded: "qx.event.type.Data",

      /**
       * Fired when a window was removed.
       */
      windowRemoved: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __windows__P_70_0: null,
      __manager__P_70_1: null,

      /**
       * Get the desktop's window manager. Each desktop must have a window manager.
       * If none is configured the default window manager {@link qx.ui.window.Window#DEFAULT_MANAGER_CLASS}
       * is used.
       *
       * @return {qx.ui.window.IWindowManager} The desktop's window manager
       */
      getWindowManager: function getWindowManager() {
        if (!this.__manager__P_70_1) {
          this.setWindowManager(new qx.ui.window.Window.DEFAULT_MANAGER_CLASS());
        }

        return this.__manager__P_70_1;
      },

      /**
       * Whether the configured layout supports a maximized window
       * e.g. is a Canvas.
       *
       * @return {Boolean} Whether the layout supports maximized windows
       */
      supportsMaximize: function supportsMaximize() {
        return true;
      },

      /**
       * Sets the desktop's window manager
       *
       * @param manager {qx.ui.window.IWindowManager} The window manager
       */
      setWindowManager: function setWindowManager(manager) {
        if (this.__manager__P_70_1) {
          this.__manager__P_70_1.setDesktop(null);
        }

        manager.setDesktop(this);
        this.__manager__P_70_1 = manager;
      },

      /**
       * Event handler. Called if one of the managed windows changes its active
       * state.
       *
       * @param e {qx.event.type.Event} the event object.
       */
      _onChangeActive: function _onChangeActive(e) {
        if (e.getData()) {
          this.setActiveWindow(e.getTarget());
        } else if (this.getActiveWindow() == e.getTarget()) {
          this.setActiveWindow(null);
        }
      },
      // property apply
      _applyActiveWindow: function _applyActiveWindow(value, old) {
        this.getWindowManager().changeActiveWindow(value, old);
        this.getWindowManager().updateStack();
      },

      /**
       * Event handler. Called if one of the managed windows changes its modality
       *
       * @param e {qx.event.type.Event} the event object.
       */
      _onChangeModal: function _onChangeModal(e) {
        this.getWindowManager().updateStack();
      },

      /**
       * Event handler. Called if one of the managed windows changes its visibility
       * state.
       */
      _onChangeVisibility: function _onChangeVisibility() {
        this.getWindowManager().updateStack();
      },

      /**
       * Overrides the method {@link qx.ui.core.Widget#_afterAddChild}
       *
       * @param win {qx.ui.core.Widget} added widget
       */
      _afterAddChild: function _afterAddChild(win) {
        if (qx.Class.isDefined("qx.ui.window.Window") && win instanceof qx.ui.window.Window) {
          this._addWindow(win);
        }
      },

      /**
       * Handles the case, when a window is added to the desktop.
       *
       * @param win {qx.ui.window.Window} Window, which has been added
       */
      _addWindow: function _addWindow(win) {
        if (!this.getWindows().includes(win)) {
          this.getWindows().push(win);
          this.fireDataEvent("windowAdded", win);
          win.addListener("changeActive", this._onChangeActive, this);
          win.addListener("changeModal", this._onChangeModal, this);
          win.addListener("changeVisibility", this._onChangeVisibility, this);
        }

        if (win.getActive()) {
          this.setActiveWindow(win);
        }

        this.getWindowManager().updateStack();
      },

      /**
       * Overrides the method {@link qx.ui.core.Widget#_afterRemoveChild}
       *
       * @param win {qx.ui.core.Widget} removed widget
       */
      _afterRemoveChild: function _afterRemoveChild(win) {
        if (qx.Class.isDefined("qx.ui.window.Window") && win instanceof qx.ui.window.Window) {
          this._removeWindow(win);
        }
      },

      /**
       * Handles the case, when a window is removed from the desktop.
       *
       * @param win {qx.ui.window.Window} Window, which has been removed
       */
      _removeWindow: function _removeWindow(win) {
        if (this.getWindows().includes(win)) {
          qx.lang.Array.remove(this.getWindows(), win);
          this.fireDataEvent("windowRemoved", win);
          win.removeListener("changeActive", this._onChangeActive, this);
          win.removeListener("changeModal", this._onChangeModal, this);
          win.removeListener("changeVisibility", this._onChangeVisibility, this);
          this.getWindowManager().updateStack();
        }
      },

      /**
       * Get a list of all windows added to the desktop (including hidden windows)
       *
       * @return {qx.ui.window.Window[]} Array of managed windows
       */
      getWindows: function getWindows() {
        if (!this.__windows__P_70_0) {
          this.__windows__P_70_0 = [];
        }

        return this.__windows__P_70_0;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeArray("__windows__P_70_0");

      this._disposeObjects("__manager__P_70_1");
    }
  });
  qx.ui.window.MDesktop.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.MChildrenHandling": {
        "defer": "runtime",
        "require": true
      },
      "qx.ui.core.MBlocker": {
        "require": true
      },
      "qx.ui.window.MDesktop": {
        "require": true
      },
      "qx.ui.core.FocusHandler": {
        "construct": true
      },
      "qx.ui.core.queue.Visibility": {
        "construct": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.Stylesheet": {},
      "qx.bom.element.Cursor": {},
      "qx.dom.Node": {},
      "qx.bom.client.Event": {
        "require": true
      },
      "qx.bom.Event": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "event.help": {
          "className": "qx.bom.client.Event"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Shared implementation for all root widgets.
   */
  qx.Class.define("qx.ui.root.Abstract", {
    type: "abstract",
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MChildrenHandling, qx.ui.core.MBlocker, qx.ui.window.MDesktop],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this); // Register as root for the focus handler

      qx.ui.core.FocusHandler.getInstance().addRoot(this); // Directly add to visibility queue

      qx.ui.core.queue.Visibility.add(this);
      this.initNativeHelp();
      this.addListener("keypress", this.__preventScrollWhenFocused__P_44_0, this);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "root"
      },
      // overridden
      enabled: {
        refine: true,
        init: true
      },
      // overridden
      focusable: {
        refine: true,
        init: true
      },

      /**
       *  Sets the global cursor style
       *
       *  The name of the cursor to show when the mouse pointer is over the widget.
       *  This is any valid CSS2 cursor name defined by W3C.
       *
       *  The following values are possible:
       *  <ul><li>default</li>
       *  <li>crosshair</li>
       *  <li>pointer (hand is the ie name and will mapped to pointer in non-ie).</li>
       *  <li>move</li>
       *  <li>n-resize</li>
       *  <li>ne-resize</li>
       *  <li>e-resize</li>
       *  <li>se-resize</li>
       *  <li>s-resize</li>
       *  <li>sw-resize</li>
       *  <li>w-resize</li>
       *  <li>nw-resize</li>
       *  <li>text</li>
       *  <li>wait</li>
       *  <li>help </li>
       *  <li>url([file]) = self defined cursor, file should be an ANI- or CUR-type</li>
       *  </ul>
       *
       * Please note that in the current implementation this has no effect in IE.
       */
      globalCursor: {
        check: "String",
        nullable: true,
        themeable: true,
        apply: "_applyGlobalCursor",
        event: "changeGlobalCursor"
      },

      /**
       * Whether the native context menu should be globally enabled. Setting this
       * property to <code>true</code> will allow native context menus in all
       * child widgets of this root.
       */
      nativeContextMenu: {
        refine: true,
        init: false
      },

      /**
       * If the user presses F1 in IE by default the onhelp event is fired and
       * IE’s help window is opened. Setting this property to <code>false</code>
       * prevents this behavior.
       */
      nativeHelp: {
        check: "Boolean",
        init: false,
        apply: "_applyNativeHelp"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __globalCursorStyleSheet__P_44_1: null,
      // overridden
      isRootWidget: function isRootWidget() {
        return true;
      },

      /**
       * Get the widget's layout manager.
       *
       * @return {qx.ui.layout.Abstract} The widget's layout manager
       */
      getLayout: function getLayout() {
        return this._getLayout();
      },
      // property apply
      _applyGlobalCursor: qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(value, old) {// empty implementation
        },
        // This would be the optimal solution.
        // For performance reasons this is impractical in IE
        "default": function _default(value, old) {
          var Stylesheet = qx.bom.Stylesheet;
          var sheet = this.__globalCursorStyleSheet__P_44_1;

          if (!sheet) {
            this.__globalCursorStyleSheet__P_44_1 = sheet = Stylesheet.createElement();
          }

          Stylesheet.removeAllRules(sheet);

          if (value) {
            Stylesheet.addRule(sheet, "*", qx.bom.element.Cursor.compile(value).replace(";", "") + " !important");
          }
        }
      }),
      // property apply
      _applyNativeContextMenu: function _applyNativeContextMenu(value, old) {
        if (value) {
          this.removeListener("contextmenu", this._onNativeContextMenu, this, true);
        } else {
          this.addListener("contextmenu", this._onNativeContextMenu, this, true);
        }
      },

      /**
       * Stops the <code>contextmenu</code> event from showing the native context menu
       *
       * @param e {qx.event.type.Mouse} The event object
       */
      _onNativeContextMenu: function _onNativeContextMenu(e) {
        if (e.getTarget().getNativeContextMenu()) {
          return;
        }

        e.preventDefault();
      },

      /**
       * Fix unexpected scrolling when pressing "Space" while a widget is focused.
       *
       * @param e {qx.event.type.KeySequence} The KeySequence event
       */
      __preventScrollWhenFocused__P_44_0: function __preventScrollWhenFocused__P_44_0(e) {
        // Require space pressed
        if (e.getKeyIdentifier() !== "Space") {
          return;
        }

        var target = e.getTarget(); // Require focused. Allow scroll when container or root widget.

        var focusHandler = qx.ui.core.FocusHandler.getInstance();

        if (!focusHandler.isFocused(target)) {
          return;
        } // Require that widget does not accept text input


        var el = target.getContentElement();
        var nodeName = el.getNodeName();
        var domEl = el.getDomElement();

        if (nodeName === "input" || nodeName === "textarea" || domEl && domEl.contentEditable === "true") {
          return;
        } // do not prevent "space" key for natively focusable elements


        nodeName = qx.dom.Node.getName(e.getOriginalTarget());

        if (nodeName && ["input", "textarea", "select", "a"].indexOf(nodeName) > -1) {
          return;
        } // Ultimately, prevent default


        e.preventDefault();
      },
      // property apply
      _applyNativeHelp: function _applyNativeHelp(value, old) {
        if (qx.core.Environment.get("event.help")) {
          if (old === false) {
            qx.bom.Event.removeNativeListener(document, "help", function () {
              return false;
            });
          }

          if (value === false) {
            qx.bom.Event.addNativeListener(document, "help", function () {
              return false;
            });
          }
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__globalCursorStyleSheet__P_44_1 = null;
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics, members) {
      qx.ui.core.MChildrenHandling.remap(members);
    }
  });
  qx.ui.root.Abstract.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.bom.element.Location": {},
      "qx.ui.core.Widget": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * Each focus root delegates the focus handling to instances of the FocusHandler.
   */
  qx.Class.define("qx.ui.core.FocusHandler", {
    extend: qx.core.Object,
    type: "singleton",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this); // Create data structure

      this.__roots__P_46_0 = {};
    },

    /*
    ***********************************************
      PROPERTIES
    ***********************************************
    */
    properties: {
      /**
       * Activate changing focus with the tab key (default: true)
       */
      useTabNavigation: {
        check: "Boolean",
        init: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __roots__P_46_0: null,
      __activeChild__P_46_1: null,
      __focusedChild__P_46_2: null,
      __currentRoot__P_46_3: null,

      /**
       * Connects to a top-level root element (which initially receives
       * all events of the root). This are normally all page and application
       * roots, but no inline roots (they are typically sitting inside
       * another root).
       *
       * @param root {qx.ui.root.Abstract} Any root
       */
      connectTo: function connectTo(root) {
        // this.debug("Connect to: " + root);
        root.addListener("keypress", this.__onKeyPress__P_46_4, this);
        root.addListener("focusin", this._onFocusIn, this, true);
        root.addListener("focusout", this._onFocusOut, this, true);
        root.addListener("activate", this._onActivate, this, true);
        root.addListener("deactivate", this._onDeactivate, this, true);
      },

      /**
       * Registers a widget as a focus root. A focus root comes
       * with an separate tab sequence handling.
       *
       * @param widget {qx.ui.core.Widget} The widget to register
       */
      addRoot: function addRoot(widget) {
        // this.debug("Add focusRoot: " + widget);
        this.__roots__P_46_0[widget.toHashCode()] = widget;
      },

      /**
       * Deregisters a previous added widget.
       *
       * @param widget {qx.ui.core.Widget} The widget to deregister
       */
      removeRoot: function removeRoot(widget) {
        // this.debug("Remove focusRoot: " + widget);
        delete this.__roots__P_46_0[widget.toHashCode()];
      },

      /**
       * Get the active widget
       *
       * @return {qx.ui.core.Widget|null} The active widget or <code>null</code>
       *    if no widget is active
       */
      getActiveWidget: function getActiveWidget() {
        return this.__activeChild__P_46_1;
      },

      /**
       * Whether the given widget is the active one
       *
       * @param widget {qx.ui.core.Widget} The widget to check
       * @return {Boolean} <code>true</code> if the given widget is active
       */
      isActive: function isActive(widget) {
        return this.__activeChild__P_46_1 == widget;
      },

      /**
       * Get the focused widget
       *
       * @return {qx.ui.core.Widget|null} The focused widget or <code>null</code>
       *    if no widget has the focus
       */
      getFocusedWidget: function getFocusedWidget() {
        return this.__focusedChild__P_46_2;
      },

      /**
       * Whether the given widget is the focused one.
       *
       * @param widget {qx.ui.core.Widget} The widget to check
       * @return {Boolean} <code>true</code> if the given widget is focused
       */
      isFocused: function isFocused(widget) {
        return this.__focusedChild__P_46_2 == widget;
      },

      /**
       * Whether the given widgets acts as a focus root.
       *
       * @param widget {qx.ui.core.Widget} The widget to check
       * @return {Boolean} <code>true</code> if the given widget is a focus root
       */
      isFocusRoot: function isFocusRoot(widget) {
        return !!this.__roots__P_46_0[widget.toHashCode()];
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Internal event handler for activate event.
       *
       * @param e {qx.event.type.Focus} Focus event
       */
      _onActivate: function _onActivate(e) {
        var target = e.getTarget();
        this.__activeChild__P_46_1 = target; //this.debug("active: " + target);

        var root = this.__findFocusRoot__P_46_5(target);

        if (root != this.__currentRoot__P_46_3) {
          this.__currentRoot__P_46_3 = root;
        }
      },

      /**
       * Internal event handler for deactivate event.
       *
       * @param e {qx.event.type.Focus} Focus event
       */
      _onDeactivate: function _onDeactivate(e) {
        var target = e.getTarget();

        if (this.__activeChild__P_46_1 == target) {
          this.__activeChild__P_46_1 = null;
        }
      },

      /**
       * Internal event handler for focusin event.
       *
       * @param e {qx.event.type.Focus} Focus event
       */
      _onFocusIn: function _onFocusIn(e) {
        var target = e.getTarget();

        if (target != this.__focusedChild__P_46_2) {
          this.__focusedChild__P_46_2 = target;
          target.visualizeFocus();
        }
      },

      /**
       * Internal event handler for focusout event.
       *
       * @param e {qx.event.type.Focus} Focus event
       */
      _onFocusOut: function _onFocusOut(e) {
        var target = e.getTarget();

        if (target == this.__focusedChild__P_46_2) {
          this.__focusedChild__P_46_2 = null;
          target.visualizeBlur();
        }
      },

      /**
       * Internal event handler for TAB key.
       *
       * @param e {qx.event.type.KeySequence} Key event
       */
      __onKeyPress__P_46_4: function __onKeyPress__P_46_4(e) {
        if (e.getKeyIdentifier() != "Tab" || !this.isUseTabNavigation()) {
          return;
        }

        if (!this.__currentRoot__P_46_3) {
          return;
        } // Stop all key-events with a TAB keycode


        e.stopPropagation();
        e.preventDefault(); // Support shift key to reverse widget detection order

        var current = this.__focusedChild__P_46_2;

        if (!e.isShiftPressed()) {
          var next = current ? this.__getWidgetAfter__P_46_6(current) : this.__getFirstWidget__P_46_7();
        } else {
          var next = current ? this.__getWidgetBefore__P_46_8(current) : this.__getLastWidget__P_46_9();
        } // If there was a widget found, focus it


        if (next) {
          next.tabFocus();
        }
      },

      /*
      ---------------------------------------------------------------------------
        UTILS
      ---------------------------------------------------------------------------
      */

      /**
       * Finds the next focus root, starting with the given widget.
       *
       * @param widget {qx.ui.core.Widget} The widget to find a focus root for.
       * @return {qx.ui.core.Widget|null} The focus root for the given widget or
       * <code>true</code> if no focus root could be found
       */
      __findFocusRoot__P_46_5: function __findFocusRoot__P_46_5(widget) {
        var roots = this.__roots__P_46_0;

        while (widget) {
          if (roots[widget.toHashCode()]) {
            return widget;
          }

          widget = widget.getLayoutParent();
        }

        return null;
      },

      /*
      ---------------------------------------------------------------------------
        TAB SUPPORT IMPLEMENTATION
      ---------------------------------------------------------------------------
      */

      /**
       * Compares the order of two widgets
       *
       * @param widget1 {qx.ui.core.Widget} Widget A
       * @param widget2 {qx.ui.core.Widget} Widget B
       * @return {Integer} A sort() compatible integer with values
       *   small than 0, exactly 0 or bigger than 0.
       */
      __compareTabOrder__P_46_10: function __compareTabOrder__P_46_10(widget1, widget2) {
        if (widget1 === widget2) {
          return 0;
        } // Sort-Check #1: Tab-Index


        var tab1 = widget1.getTabIndex() || 0;
        var tab2 = widget2.getTabIndex() || 0;

        if (tab1 != tab2) {
          return tab1 - tab2;
        } // Computing location


        var el1 = widget1.getContentElement().getDomElement();
        var el2 = widget2.getContentElement().getDomElement();
        var Location = qx.bom.element.Location;
        var loc1 = Location.get(el1);
        var loc2 = Location.get(el2); // Sort-Check #2: Top-Position

        if (loc1.top != loc2.top) {
          return loc1.top - loc2.top;
        } // Sort-Check #3: Left-Position


        if (loc1.left != loc2.left) {
          return loc1.left - loc2.left;
        } // Sort-Check #4: zIndex


        var z1 = widget1.getZIndex();
        var z2 = widget2.getZIndex();

        if (z1 != z2) {
          return z1 - z2;
        }

        return 0;
      },

      /**
       * Returns the first widget.
       *
       * @return {qx.ui.core.Widget} Returns the first (positioned) widget from
       *    the current root.
       */
      __getFirstWidget__P_46_7: function __getFirstWidget__P_46_7() {
        return this.__getFirst__P_46_11(this.__currentRoot__P_46_3, null);
      },

      /**
       * Returns the last widget.
       *
       * @return {qx.ui.core.Widget} Returns the last (positioned) widget from
       *    the current root.
       */
      __getLastWidget__P_46_9: function __getLastWidget__P_46_9() {
        return this.__getLast__P_46_12(this.__currentRoot__P_46_3, null);
      },

      /**
       * Returns the widget after the given one.
       *
       * @param widget {qx.ui.core.Widget} Widget to start with
       * @return {qx.ui.core.Widget} The found widget.
       */
      __getWidgetAfter__P_46_6: function __getWidgetAfter__P_46_6(widget) {
        var root = this.__currentRoot__P_46_3;

        if (root == widget) {
          return this.__getFirstWidget__P_46_7();
        }

        while (widget && widget.getAnonymous()) {
          widget = widget.getLayoutParent();
        }

        if (widget == null) {
          return [];
        }

        var result = [];

        this.__collectAllAfter__P_46_13(root, widget, result);

        result.sort(this.__compareTabOrder__P_46_10);
        var len = result.length;
        return len > 0 ? result[0] : this.__getFirstWidget__P_46_7();
      },

      /**
       * Returns the widget before the given one.
       *
       * @param widget {qx.ui.core.Widget} Widget to start with
       * @return {qx.ui.core.Widget} The found widget.
       */
      __getWidgetBefore__P_46_8: function __getWidgetBefore__P_46_8(widget) {
        var root = this.__currentRoot__P_46_3;

        if (root == widget) {
          return this.__getLastWidget__P_46_9();
        }

        while (widget && widget.getAnonymous()) {
          widget = widget.getLayoutParent();
        }

        if (widget == null) {
          return [];
        }

        var result = [];

        this.__collectAllBefore__P_46_14(root, widget, result);

        result.sort(this.__compareTabOrder__P_46_10);
        var len = result.length;
        return len > 0 ? result[len - 1] : this.__getLastWidget__P_46_9();
      },

      /*
      ---------------------------------------------------------------------------
        INTERNAL API USED BY METHODS ABOVE
      ---------------------------------------------------------------------------
      */

      /**
       * Collects all widgets which are after the given widget in
       * the given parent widget. Append all found children to the
       * <code>list</code>.
       *
       * @param parent {qx.ui.core.Widget} Parent widget
       * @param widget {qx.ui.core.Widget} Child widget to start with
       * @param result {Array} Result list
       */
      __collectAllAfter__P_46_13: function __collectAllAfter__P_46_13(parent, widget, result) {
        var children = parent.getLayoutChildren();
        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i]; // Filter spacers etc.

          if (!(child instanceof qx.ui.core.Widget)) {
            continue;
          }

          if (!this.isFocusRoot(child) && child.isEnabled() && child.isVisible()) {
            if (child.isTabable() && this.__compareTabOrder__P_46_10(widget, child) < 0) {
              result.push(child);
            }

            this.__collectAllAfter__P_46_13(child, widget, result);
          }
        }
      },

      /**
       * Collects all widgets which are before the given widget in
       * the given parent widget. Append all found children to the
       * <code>list</code>.
       *
       * @param parent {qx.ui.core.Widget} Parent widget
       * @param widget {qx.ui.core.Widget} Child widget to start with
       * @param result {Array} Result list
       */
      __collectAllBefore__P_46_14: function __collectAllBefore__P_46_14(parent, widget, result) {
        var children = parent.getLayoutChildren();
        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i]; // Filter spacers etc.

          if (!(child instanceof qx.ui.core.Widget)) {
            continue;
          }

          if (!this.isFocusRoot(child) && child.isEnabled() && child.isVisible()) {
            if (child.isTabable() && this.__compareTabOrder__P_46_10(widget, child) > 0) {
              result.push(child);
            }

            this.__collectAllBefore__P_46_14(child, widget, result);
          }
        }
      },

      /**
       * Find first (positioned) widget. (Sorted by coordinates, zIndex, etc.)
       *
       * @param parent {qx.ui.core.Widget} Parent widget
       * @param firstWidget {qx.ui.core.Widget?null} Current first widget
       * @return {qx.ui.core.Widget} The first (positioned) widget
       */
      __getFirst__P_46_11: function __getFirst__P_46_11(parent, firstWidget) {
        var children = parent.getLayoutChildren();
        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i]; // Filter spacers etc.

          if (!(child instanceof qx.ui.core.Widget)) {
            continue;
          } // Ignore focus roots completely


          if (!this.isFocusRoot(child) && child.isEnabled() && child.isVisible()) {
            if (child.isTabable()) {
              if (firstWidget == null || this.__compareTabOrder__P_46_10(child, firstWidget) < 0) {
                firstWidget = child;
              }
            } // Deep iteration into children hierarchy


            firstWidget = this.__getFirst__P_46_11(child, firstWidget);
          }
        }

        return firstWidget;
      },

      /**
       * Find last (positioned) widget. (Sorted by coordinates, zIndex, etc.)
       *
       * @param parent {qx.ui.core.Widget} Parent widget
       * @param lastWidget {qx.ui.core.Widget?null} Current last widget
       * @return {qx.ui.core.Widget} The last (positioned) widget
       */
      __getLast__P_46_12: function __getLast__P_46_12(parent, lastWidget) {
        var children = parent.getLayoutChildren();
        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i]; // Filter spacers etc.

          if (!(child instanceof qx.ui.core.Widget)) {
            continue;
          } // Ignore focus roots completely


          if (!this.isFocusRoot(child) && child.isEnabled() && child.isVisible()) {
            if (child.isTabable()) {
              if (lastWidget == null || this.__compareTabOrder__P_46_10(child, lastWidget) > 0) {
                lastWidget = child;
              }
            } // Deep iteration into children hierarchy


            lastWidget = this.__getLast__P_46_12(child, lastWidget);
          }
        }

        return lastWidget;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeMap("__roots__P_46_0");

      this.__focusedChild__P_46_2 = this.__activeChild__P_46_1 = this.__currentRoot__P_46_3 = null;
    }
  });
  qx.ui.core.FocusHandler.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Array": {},
      "qx.ui.core.queue.Manager": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * Keeps data about the visibility of all widgets. Updates the internal
   * tree when widgets are added, removed or modify their visibility.
   */
  qx.Class.define("qx.ui.core.queue.Visibility", {
    statics: {
      /** @type {Array} This contains all the queued widgets for the next flush. */
      __queue__P_96_0: [],

      /** @type {Map} map of widgets by hash code which are in the queue */
      __lookup__P_96_1: {},

      /** @type {Map} Maps hash codes to visibility */
      __data__P_96_2: {},

      /**
       * Clears the cached data of the given widget. Normally only used
       * during interims disposes of one or a few widgets.
       *
       * @param widget {qx.ui.core.Widget} The widget to clear
       */
      remove: function remove(widget) {
        if (this.__lookup__P_96_1[widget.toHashCode()]) {
          delete this.__lookup__P_96_1[widget.toHashCode()];
          qx.lang.Array.remove(this.__queue__P_96_0, widget);
        }

        delete this.__data__P_96_2[widget.toHashCode()];
      },

      /**
       * Whether the given widget is visible.
       *
       * Please note that the information given by this method is queued and may not be accurate
       * until the next queue flush happens.
       *
       * @param widget {qx.ui.core.Widget} The widget to query
       * @return {Boolean} Whether the widget is visible
       */
      isVisible: function isVisible(widget) {
        return this.__data__P_96_2[widget.toHashCode()] || false;
      },

      /**
       * Computes the visibility for the given widget
       *
       * @param widget {qx.ui.core.Widget} The widget to update
       * @return {Boolean} Whether the widget is visible
       */
      __computeVisible__P_96_3: function __computeVisible__P_96_3(widget) {
        var data = this.__data__P_96_2;
        var hash = widget.toHashCode();
        var visible; // Respect local value

        if (widget.isExcluded()) {
          visible = false;
        } else {
          // Parent hierarchy
          var parent = widget.$$parent;

          if (parent) {
            visible = this.__computeVisible__P_96_3(parent);
          } else {
            visible = widget.isRootWidget();
          }
        }

        return data[hash] = visible;
      },

      /**
       * Adds a widget to the queue.
       *
       * Should only be used by {@link qx.ui.core.Widget}.
       *
       * @param widget {qx.ui.core.Widget} The widget to add.
       */
      add: function add(widget) {
        if (this.__lookup__P_96_1[widget.toHashCode()]) {
          return;
        }

        this.__queue__P_96_0.unshift(widget);

        this.__lookup__P_96_1[widget.toHashCode()] = widget;
        qx.ui.core.queue.Manager.scheduleFlush("visibility");
      },

      /**
       * Flushes the visibility queue.
       *
       * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
       */
      flush: function flush() {
        // Dispose all registered objects
        var queue = this.__queue__P_96_0;
        var data = this.__data__P_96_2; // Dynamically add children to queue
        // Only respect already known widgets because otherwise the children
        // are also already in the queue (added on their own)

        for (var i = queue.length - 1; i >= 0; i--) {
          var hash = queue[i].toHashCode();

          if (data[hash] != null) {
            // recursive method call which adds widgets to the queue so be
            // careful with that one (performance critical)
            queue[i].addChildrenToQueue(queue);
          }
        } // Cache old data, clear current data
        // Do this before starting with recomputation because
        // new data may also be added by related widgets and not
        // only the widget itself.


        var oldData = {};

        for (var i = queue.length - 1; i >= 0; i--) {
          var hash = queue[i].toHashCode();
          oldData[hash] = data[hash];
          data[hash] = null;
        } // Finally recompute


        for (var i = queue.length - 1; i >= 0; i--) {
          var widget = queue[i];
          var hash = widget.toHashCode();
          queue.splice(i, 1); // Only update when not already updated by another widget

          if (data[hash] == null) {
            this.__computeVisible__P_96_3(widget);
          } // Check for updates required to the appearance.
          // Hint: Invisible widgets are ignored inside appearance flush


          if (data[hash] && data[hash] != oldData[hash]) {
            widget.checkAppearanceNeeds();
          }
        } // Recreate the array is cheaper compared to keep a sparse array over time


        this.__queue__P_96_0 = [];
        this.__lookup__P_96_1 = {};
      }
    }
  });
  qx.ui.core.queue.Visibility.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.Window": {
        "require": true
      },
      "qx.core.Environment": {
        "defer": "load",
        "construct": true,
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.root.Abstract": {
        "construct": true,
        "require": true
      },
      "qx.dom.Node": {
        "construct": true
      },
      "qx.event.Registration": {
        "construct": true
      },
      "qx.ui.layout.Canvas": {
        "construct": true
      },
      "qx.ui.core.queue.Layout": {
        "construct": true
      },
      "qx.ui.core.FocusHandler": {
        "construct": true
      },
      "qx.bom.client.OperatingSystem": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.Widget": {
        "construct": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.html.Root": {},
      "qx.bom.Viewport": {},
      "qx.bom.element.Style": {},
      "qx.dom.Element": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "construct": true,
          "className": "qx.bom.client.OperatingSystem"
        },
        "engine.name": {
          "className": "qx.bom.client.Engine"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This is the root widget for qooxdoo applications with an
   * "application" like behaviour. The widget will span the whole viewport
   * and the document body will have no scrollbars.
   *
   * The root widget does not support paddings and decorators with insets.
   *
   * If you want to enhance HTML pages with qooxdoo widgets please use
   * {@link qx.ui.root.Page} eventually in combination with
   * {@link qx.ui.root.Inline} widgets.
   *
   * This class uses a {@link qx.ui.layout.Canvas} as fixed layout. The layout
   * cannot be changed.
   *
   * @require(qx.event.handler.Window)
   * @ignore(qx.ui.popup)
   * @ignore(qx.ui.popup.Manager.*)
   * @ignore(qx.ui.menu)
   * @ignore(qx.ui.menu.Manager.*)
   * @ignore(qx.ui)
   */
  qx.Class.define("qx.ui.root.Application", {
    extend: qx.ui.root.Abstract,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param doc {Document} Document to use
     */
    construct: function construct(doc) {
      // Symbolic links
      this.__window__P_15_0 = qx.dom.Node.getWindow(doc);
      this.__doc__P_15_1 = doc; // Base call

      qx.ui.root.Abstract.constructor.call(this); // Resize handling

      qx.event.Registration.addListener(this.__window__P_15_0, "resize", this._onResize, this); // Use a hard-coded canvas layout

      this._setLayout(new qx.ui.layout.Canvas()); // Directly schedule layout for root element


      qx.ui.core.queue.Layout.add(this); // Register as root

      qx.ui.core.FocusHandler.getInstance().connectTo(this);
      this.getContentElement().disableScrolling(); // quick fix for [BUG #7680]

      this.getContentElement().setStyle("-webkit-backface-visibility", "hidden"); // prevent scrolling on touch devices

      this.addListener("touchmove", this.__stopScrolling__P_15_2, this); // handle focus for iOS which seems to deny any focus action

      if (qx.core.Environment.get("os.name") == "ios") {
        this.getContentElement().addListener("tap", function (e) {
          var widget = qx.ui.core.Widget.getWidgetByElement(e.getTarget());

          while (widget && !widget.isFocusable()) {
            widget = widget.getLayoutParent();
          }

          if (widget && widget.isFocusable()) {
            widget.getContentElement().focus();
          }
        }, this, true);
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __window__P_15_0: null,
      __doc__P_15_1: null,
      // overridden

      /**
       * Create the widget's container HTML element.
       *
       * @lint ignoreDeprecated(alert)
       * @return {qx.html.Element} The container HTML element
       */
      _createContentElement: function _createContentElement() {
        var doc = this.__doc__P_15_1;

        if (qx.core.Environment.get("engine.name") == "webkit") {
          // In the "DOMContentLoaded" event of WebKit (Safari, Chrome) no body
          // element seems to be available in the DOM, if the HTML file did not
          // contain a body tag explicitly. Unfortunately, it cannot be added
          // here dynamically.
          if (!doc.body) {
            /* eslint-disable-next-line no-alert */
            window.alert("The application could not be started due to a missing body tag in the HTML file!");
          }
        } // Apply application layout


        var hstyle = doc.documentElement.style;
        var bstyle = doc.body.style;
        hstyle.overflow = bstyle.overflow = "hidden";
        hstyle.padding = hstyle.margin = bstyle.padding = bstyle.margin = "0px";
        hstyle.width = hstyle.height = bstyle.width = bstyle.height = "100%";
        var elem = doc.createElement("div");
        doc.body.appendChild(elem);
        var root = new qx.html.Root(elem);
        root.setStyles({
          position: "absolute",
          overflowX: "hidden",
          overflowY: "hidden"
        }); // Store reference to the widget in the DOM element.

        root.connectObject(this);
        return root;
      },

      /**
       * Listener for window's resize event
       *
       * @param e {qx.event.type.Event} Event object
       */
      _onResize: function _onResize(e) {
        qx.ui.core.queue.Layout.add(this); // close all popups

        if (qx.ui.popup && qx.ui.popup.Manager) {
          qx.ui.popup.Manager.getInstance().hideAll();
        } // close all menus


        if (qx.ui.menu && qx.ui.menu.Manager) {
          qx.ui.menu.Manager.getInstance().hideAll();
        }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var width = qx.bom.Viewport.getWidth(this.__window__P_15_0);
        var height = qx.bom.Viewport.getHeight(this.__window__P_15_0);
        return {
          minWidth: width,
          width: width,
          maxWidth: width,
          minHeight: height,
          height: height,
          maxHeight: height
        };
      },
      // overridden
      _applyPadding: function _applyPadding(value, old, name) {
        if (value && (name == "paddingTop" || name == "paddingLeft")) {
          throw new Error("The root widget does not support 'left', or 'top' paddings!");
        }

        qx.ui.root.Application.superclass.prototype._applyPadding.call(this, value, old, name);
      },

      /**
       * Handler for the native 'touchstart' on the window which prevents
       * the native page scrolling.
       * @param e {qx.event.type.Touch} The qooxdoo touch event.
       */
      __stopScrolling__P_15_2: function __stopScrolling__P_15_2(e) {
        var node = e.getOriginalTarget();

        while (node && node.style) {
          var touchAction = qx.bom.element.Style.get(node, "touch-action") !== "none" && qx.bom.element.Style.get(node, "touch-action") !== "";
          var webkitOverflowScrolling = qx.bom.element.Style.get(node, "-webkit-overflow-scrolling") === "touch";
          var overflowX = qx.bom.element.Style.get(node, "overflowX") != "hidden";
          var overflowY = qx.bom.element.Style.get(node, "overflowY") != "hidden";

          if (touchAction || webkitOverflowScrolling || overflowY || overflowX) {
            return;
          }

          node = node.parentNode;
        }

        e.preventDefault();
      },
      // overridden
      destroy: function destroy() {
        if (this.$$disposed) {
          return;
        }

        qx.dom.Element.remove(this.getContentElement().getDomElement());
        qx.ui.root.Application.superclass.prototype.destroy.call(this);
      }
    },

    /*
    *****************************************************************************
       DESTRUCT
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__window__P_15_0 = this.__doc__P_15_1 = null;
    }
  });
  qx.ui.root.Application.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "require": true
      },
      "qx.util.format.DateFormat": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);
  qx.Class.define("qx.log.appender.Formatter", {
    extend: qx.core.Object,
    properties: {
      /** How to format time in an entry; offset since start (backwards compatible) or as actual date/time */
      formatTimeAs: {
        init: "offset",
        check: ["offset", "datetime"]
      }
    },
    members: {
      /**
       * Formats a numeric time offset to 6 characters.
       *
       * @param offset
       *          {Integer} Current offset value
       * @param length
       *          {Integer?6} Refine the length
       * @return {String} Padded string
       */
      formatOffset: function formatOffset(offset, length) {
        var str = offset.toString();
        var diff = (length || 6) - str.length;
        var pad = "";

        for (var i = 0; i < diff; i++) {
          pad += "0";
        }

        return pad + str;
      },

      /**
       * Formats the time part of an entry
       *
       * @param entry {Map} the entry to output
       * @return {String} formatted time, as an offset or date time depending on `formatTimeAs` property
       */
      formatEntryTime: function formatEntryTime(entry) {
        if (this.getFormatTimeAs() == "offset") {
          return this.formatOffset(entry.offset, 6);
        }

        if (!qx.log.appender.Formatter.__DATETIME_FORMAT__P_16_0) {
          qx.log.appender.Formatter.__DATETIME_FORMAT__P_16_0 = new qx.util.format.DateFormat("YYYY-MM-dd HH:mm:ss");
        }

        return qx.log.appender.Formatter.__DATETIME_FORMAT__P_16_0.format(entry.time);
      },

      /**
       * Normalises the entry into an object with clazz, object, hash.
       *
       * @param entry {Map} the entry to output
       * @return {Map} result, containing:
       *  clazz {Class?} the class of the object
       *  object {Object?} the object
       *  hash {String?} the hash code
       */
      normalizeEntryClass: function normalizeEntryClass(entry) {
        var result = {
          clazz: null,
          object: null,
          hash: null
        };

        if (entry.object) {
          result.hash = entry.object;

          if (entry.clazz) {
            result.clazz = entry.clazz;
          } else {
            var obj = entry.win.qx.core.ObjectRegistry.fromHashCode(entry.object, true);

            if (obj) {
              result.clazz = obj.constructor;
              result.object = obj;
            }
          }
        } else if (entry.clazz) {
          result.clazz = entry.clazz;
        }

        return result;
      },

      /**
       * Formats the object part of an entry
       *
       * @param entry {Map} the entry to output
       * @return {String} formatted object, with class and hash code if possible
       */
      formatEntryObjectAndClass: function formatEntryObjectAndClass(entry) {
        var breakdown = this.normalizeEntryClass(entry);
        var result = "";

        if (breakdown.clazz) {
          result += breakdown.clazz.classname;
        }

        if (breakdown.hash) {
          result += "[" + breakdown.hash + "]";
        }

        result += ":";
        return result;
      },

      /**
       * Formats the items part of an entry
       *
       * @param entry {Map} the entry to output
       * @return {String} formatted items
       */
      formatEntryItems: function formatEntryItems(entry) {
        var output = [];
        var items = entry.items;

        for (var i = 0, il = items.length; i < il; i++) {
          var item = items[i];
          var msg = item.text;

          if (item.trace && item.trace.length > 0) {
            msg += "\n" + item.trace;
          }

          if (msg instanceof Array) {
            var list = [];

            for (var j = 0, jl = msg.length; j < jl; j++) {
              list.push(msg[j].text);
            }

            if (item.type === "map") {
              output.push("{", list.join(", "), "}");
            } else {
              output.push("[", list.join(", "), "]");
            }
          } else {
            output.push(msg);
          }
        }

        return output.join(" ");
      },

      /**
       * Converts a single log entry to plain text
       *
       * @param entry {Map} The entry to process
       * @return {String} the formatted log entry
       */
      toText: function toText(entry) {
        var output = this.formatEntryTime(entry) + " " + this.formatEntryObjectAndClass(entry);
        var str = this.formatEntryItems(entry);

        if (str) {
          output += " " + str;
        }

        return output;
      },

      /**
       * Converts a single log entry to an array of plain text.
       *
       * This use of arrays is an outdated performance improvement, and as there is no
       * specification of what is in each of the elements of the array, there is no value
       * in preserving this.  This method is deprecated because it will be removed in 7.0
       * and only toText will remain.  Note that toTextArray is not used anywhere in Qooxdoo.
       *
       * @param entry {Map} The entry to process
       * @return {Array} Argument list ready message array.
       * @deprecated {6.0} See toText instead
       */
      toTextArray: function toTextArray(entry) {
        var output = [];
        output.push(this.formatEntryTime(entry));
        output.push(this.formatEntryObjectAndClass(entry));
        output.push(this.formatEntryItems(entry));
        return output;
      },

      /**
       * Converts a single log entry to HTML
       *
       * @signature function(entry)
       * @param entry {Map} The entry to process
       */
      toHtml: function toHtml(entry) {
        var output = [];
        var item, msg, sub, list;
        output.push("<span class='offset'>", this.formatEntryTime(entry), "</span> ");
        var breakdown = this.normalizeEntryClass(entry);
        var result = "";

        if (breakdown.clazz) {
          result += breakdown.clazz.classname;
        }

        if (breakdown.object) {
          output.push("<span class='object' title='Object instance with hash code: " + breakdown.object.toHashCode() + "'>", breakdown.classname, "[", breakdown.object, "]</span>: ");
        } else if (breakdown.hash) {
          output.push("<span class='object' title='Object instance with hash code: " + breakdown.hash + "'>", breakdown.classname, "[", breakdown.hash, "]</span>: ");
        } else if (breakdown.clazz) {
          output.push("<span class='object'>" + breakdown.clazz.classname, "</span>: ");
        }

        var items = entry.items;

        for (var i = 0, il = items.length; i < il; i++) {
          item = items[i];
          msg = item.text;

          if (msg instanceof Array) {
            var list = [];

            for (var j = 0, jl = msg.length; j < jl; j++) {
              sub = msg[j];

              if (typeof sub === "string") {
                list.push("<span>" + qx.log.appender.Formatter.escapeHTML(sub) + "</span>");
              } else if (sub.key) {
                list.push("<span class='type-key'>" + sub.key + "</span>:<span class='type-" + sub.type + "'>" + qx.log.appender.Formatter.escapeHTML(sub.text) + "</span>");
              } else {
                list.push("<span class='type-" + sub.type + "'>" + qx.log.appender.Formatter.escapeHTML(sub.text) + "</span>");
              }
            }

            output.push("<span class='type-" + item.type + "'>");

            if (item.type === "map") {
              output.push("{", list.join(", "), "}");
            } else {
              output.push("[", list.join(", "), "]");
            }

            output.push("</span>");
          } else {
            output.push("<span class='type-" + item.type + "'>" + qx.log.appender.Formatter.escapeHTML(msg) + "</span> ");
          }
        }

        var wrapper = document.createElement("DIV");
        wrapper.innerHTML = output.join("");
        wrapper.className = "level-" + entry.level;
        return wrapper;
      }
    },
    statics: {
      /** @type {qx.util.format.DateFormat} format for datetimes */
      __DATETIME_FORMAT__P_16_0: null,

      /** @type {qx.log.appender.Formatter} the default instance */
      __defaultFormatter__P_16_1: null,

      /**
       * Returns the default formatter
       *
       * @return {qx.log.appender.Formatter}
       */
      getFormatter: function getFormatter() {
        if (!qx.log.appender.Formatter.__defaultFormatter__P_16_1) {
          qx.log.appender.Formatter.__defaultFormatter__P_16_1 = new qx.log.appender.Formatter();
        }

        return qx.log.appender.Formatter.__defaultFormatter__P_16_1;
      },

      /**
       * Sets the default formatter
       *
       * @param instance {qx.log.appender.Formatter}
       */
      setFormatter: function setFormatter(instance) {
        qx.log.appender.Formatter.__defaultFormatter__P_16_1 = instance;
      },

      /**
       * Escapes the HTML in the given value
       *
       * @param value
       *          {String} value to escape
       * @return {String} escaped value
       */
      escapeHTML: function escapeHTML(value) {
        return String(value).replace(/[<>&"']/g, qx.log.appender.Formatter.__escapeHTMLReplace__P_16_2);
      },

      /**
       * Internal replacement helper for HTML escape.
       *
       * @param ch
       *          {String} Single item to replace.
       * @return {String} Replaced item
       */
      __escapeHTMLReplace__P_16_2: function __escapeHTMLReplace__P_16_2(ch) {
        var map = {
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          "'": "&#39;",
          '"': "&quot;"
        };
        return map[ch] || "?";
      }
    }
  });
  qx.log.appender.Formatter.$$dbClassInfo = $$dbClassInfo;
})();

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["html.webworker", "html.filereader", "html.geolocation", "html.audio", "html.audio.ogg", "html.audio.mp3", "html.audio.wav", "html.audio.au", "html.audio.aif", "html.video", "html.video.ogg", "html.video.h264", "html.video.webm", "html.storage.local", "html.storage.session", "html.storage.userdata", "html.classlist", "html.xpath", "html.xul", "html.canvas", "html.svg", "html.vml", "html.dataset", "html.element.contains", "html.element.compareDocumentPosition", "html.element.textcontent", "html.console", "html.image.naturaldimensions", "html.history.state", "html.selection", "html.node.isequalnode", "html.fullscreen"],
      "required": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Internal class which contains the checks used by {@link qx.core.Environment}.
   * All checks in here are marked as internal which means you should never use
   * them directly.
   *
   * This class should contain all checks about HTML.
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Html", {
    statics: {
      /**
       * Whether the client supports Web Workers.
       *
       * @internal
       * @return {Boolean} <code>true</code> if webworkers are supported
       */
      getWebWorker: function getWebWorker() {
        return window.Worker != null;
      },

      /**
       * Whether the client supports File Readers
       *
       * @internal
       * @return {Boolean} <code>true</code> if FileReaders are supported
       */
      getFileReader: function getFileReader() {
        return window.FileReader != null;
      },

      /**
       * Whether the client supports Geo Location.
       *
       * @internal
       * @return {Boolean} <code>true</code> if geolocation supported
       */
      getGeoLocation: function getGeoLocation() {
        return "geolocation" in navigator;
      },

      /**
       * Whether the client supports audio.
       *
       * @internal
       * @return {Boolean} <code>true</code> if audio is supported
       */
      getAudio: function getAudio() {
        return !!document.createElement("audio").canPlayType;
      },

      /**
       * Whether the client can play ogg audio format.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getAudioOgg: function getAudioOgg() {
        if (!qx.bom.client.Html.getAudio()) {
          return "";
        }

        var a = document.createElement("audio");
        return a.canPlayType("audio/ogg");
      },

      /**
       * Whether the client can play mp3 audio format.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getAudioMp3: function getAudioMp3() {
        if (!qx.bom.client.Html.getAudio()) {
          return "";
        }

        var a = document.createElement("audio");
        return a.canPlayType("audio/mpeg");
      },

      /**
       * Whether the client can play wave audio wave format.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getAudioWav: function getAudioWav() {
        if (!qx.bom.client.Html.getAudio()) {
          return "";
        }

        var a = document.createElement("audio");
        return a.canPlayType("audio/x-wav");
      },

      /**
       * Whether the client can play au audio format.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getAudioAu: function getAudioAu() {
        if (!qx.bom.client.Html.getAudio()) {
          return "";
        }

        var a = document.createElement("audio");
        return a.canPlayType("audio/basic");
      },

      /**
       * Whether the client can play aif audio format.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getAudioAif: function getAudioAif() {
        if (!qx.bom.client.Html.getAudio()) {
          return "";
        }

        var a = document.createElement("audio");
        return a.canPlayType("audio/x-aiff");
      },

      /**
       * Whether the client supports video.
       *
       * @internal
       * @return {Boolean} <code>true</code> if video is supported
       */
      getVideo: function getVideo() {
        return !!document.createElement("video").canPlayType;
      },

      /**
       * Whether the client supports ogg video.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getVideoOgg: function getVideoOgg() {
        if (!qx.bom.client.Html.getVideo()) {
          return "";
        }

        var v = document.createElement("video");
        return v.canPlayType('video/ogg; codecs="theora, vorbis"');
      },

      /**
       * Whether the client supports mp4 video.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getVideoH264: function getVideoH264() {
        if (!qx.bom.client.Html.getVideo()) {
          return "";
        }

        var v = document.createElement("video");
        return v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
      },

      /**
       * Whether the client supports webm video.
       *
       * @internal
       * @return {String} "" or "maybe" or "probably"
       */
      getVideoWebm: function getVideoWebm() {
        if (!qx.bom.client.Html.getVideo()) {
          return "";
        }

        var v = document.createElement("video");
        return v.canPlayType('video/webm; codecs="vp8, vorbis"');
      },

      /**
       * Whether the client supports local storage.
       *
       * @internal
       * @return {Boolean} <code>true</code> if local storage is supported
       */
      getLocalStorage: function getLocalStorage() {
        try {
          // write once to make sure to catch safari's private mode [BUG #7718]
          window.localStorage.setItem("$qx_check", "test");
          window.localStorage.removeItem("$qx_check");
          return true;
        } catch (exc) {
          // Firefox Bug: localStorage doesn't work in file:/// documents
          // see https://bugzilla.mozilla.org/show_bug.cgi?id=507361
          return false;
        }
      },

      /**
       * Whether the client supports session storage.
       *
       * @internal
       * @return {Boolean} <code>true</code> if session storage is supported
       */
      getSessionStorage: function getSessionStorage() {
        try {
          // write once to make sure to catch safari's private mode [BUG #7718]
          window.sessionStorage.setItem("$qx_check", "test");
          window.sessionStorage.removeItem("$qx_check");
          return true;
        } catch (exc) {
          // Firefox Bug: Local execution of window.sessionStorage throws error
          // see https://bugzilla.mozilla.org/show_bug.cgi?id=357323
          return false;
        }
      },

      /**
       * Whether the client supports user data to persist data. This is only
       * relevant for IE < 8.
       *
       * @internal
       * @return {Boolean} <code>true</code> if the user data is supported.
       */
      getUserDataStorage: function getUserDataStorage() {
        var el = document.createElement("div");
        el.style["display"] = "none";
        document.getElementsByTagName("head")[0].appendChild(el);
        var supported = false;

        try {
          el.addBehavior("#default#userdata");
          el.load("qxtest");
          supported = true;
        } catch (e) {}

        document.getElementsByTagName("head")[0].removeChild(el);
        return supported;
      },

      /**
       * Whether the browser supports CSS class lists.
       * https://developer.mozilla.org/en-US/docs/DOM/element.classList
       *
       * @internal
       * @return {Boolean} <code>true</code> if class list is supported.
       */
      getClassList: function getClassList() {
        return !!(document.documentElement.classList && qx.Bootstrap.getClass(document.documentElement.classList) === "DOMTokenList");
      },

      /**
       * Checks if XPath could be used.
       *
       * @internal
       * @return {Boolean} <code>true</code> if xpath is supported.
       */
      getXPath: function getXPath() {
        return !!document.evaluate;
      },

      /**
       * Checks if XUL could be used.
       *
       * @internal
       * @return {Boolean} <code>true</code> if XUL is supported.
       */
      getXul: function getXul() {
        try {
          document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label");
          return true;
        } catch (e) {
          return false;
        }
      },

      /**
       * Checks if SVG could be used
       *
       * @internal
       * @return {Boolean} <code>true</code> if SVG is supported.
       */
      getSvg: function getSvg() {
        return document.implementation && document.implementation.hasFeature && (document.implementation.hasFeature("org.w3c.dom.svg", "1.0") || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1"));
      },

      /**
       * Checks if VML is supported
       *
       * @internal
       * @return {Boolean} <code>true</code> if VML is supported.
       */
      getVml: function getVml() {
        var el = document.createElement("div");
        document.body.appendChild(el);
        el.innerHTML = '<v:shape id="vml_flag1" adj="1" />';
        el.firstChild.style.behavior = "url(#default#VML)";
        var hasVml = _typeof(el.firstChild.adj) == "object";
        document.body.removeChild(el);
        return hasVml;
      },

      /**
       * Checks if canvas could be used
       *
       * @internal
       * @return {Boolean} <code>true</code> if canvas is supported.
       */
      getCanvas: function getCanvas() {
        return !!window.CanvasRenderingContext2D;
      },

      /**
       * Asynchronous check for using data urls.
       *
       * @internal
       * @param callback {Function} The function which should be executed as
       *   soon as the check is done.
       *
       * @ignore(Image)
       */
      getDataUrl: function getDataUrl(callback) {
        var data = new Image();

        data.onload = data.onerror = function () {
          // wrap that into a timeout because IE might execute it synchronously
          window.setTimeout(function () {
            callback.call(null, data.width == 1 && data.height == 1);
          }, 0);
        };

        data.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      },

      /**
       * Checks if dataset could be used
       *
       * @internal
       * @return {Boolean} <code>true</code> if dataset is supported.
       */
      getDataset: function getDataset() {
        return !!document.documentElement.dataset;
      },

      /**
       * Check for element.contains
       *
       * @internal
       * @return {Boolean} <code>true</code> if element.contains is supported
       */
      getContains: function getContains() {
        // "object" in IE6/7/8, "function" in IE9
        return typeof document.documentElement.contains !== "undefined";
      },

      /**
       * Check for element.compareDocumentPosition
       *
       * @internal
       * @return {Boolean} <code>true</code> if element.compareDocumentPosition is supported
       */
      getCompareDocumentPosition: function getCompareDocumentPosition() {
        return typeof document.documentElement.compareDocumentPosition === "function";
      },

      /**
       * Check for element.textContent. Legacy IEs do not support this, use
       * innerText instead.
       *
       * @internal
       * @return {Boolean} <code>true</code> if textContent is supported
       */
      getTextContent: function getTextContent() {
        var el = document.createElement("span");
        return typeof el.textContent !== "undefined";
      },

      /**
       * Whether the client supports the fullscreen API.
       *
       * @internal
       * @return {Boolean} <code>true</code> if fullscreen is supported
       */
      getFullScreen: function getFullScreen() {
        return document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || false;
      },

      /**
       * Check for a console object.
       *
       * @internal
       * @return {Boolean} <code>true</code> if a console is available.
       */
      getConsole: function getConsole() {
        return typeof window.console !== "undefined";
      },

      /**
       * Check for the <code>naturalHeight</code> and <code>naturalWidth</code>
       * image element attributes.
       *
       * @internal
       * @return {Boolean} <code>true</code> if both attributes are supported
       */
      getNaturalDimensions: function getNaturalDimensions() {
        var img = document.createElement("img");
        return typeof img.naturalHeight === "number" && typeof img.naturalWidth === "number";
      },

      /**
       * Check for HTML5 history manipulation support.
       * @internal
       * @return {Boolean} <code>true</code> if the HTML5 history API is supported
       */
      getHistoryState: function getHistoryState() {
        return typeof window.onpopstate !== "undefined" && typeof window.history.replaceState !== "undefined" && typeof window.history.pushState !== "undefined";
      },

      /**
       * Returns the name of the native object/function used to access the
       * document's text selection.
       *
       * @return {String|null} <code>getSelection</code> if the standard window.getSelection
       * function is available; <code>selection</code> if the MS-proprietary
       * document.selection object is available; <code>null</code> if no known
       * text selection API is available.
       */
      getSelection: function getSelection() {
        if (typeof window.getSelection === "function") {
          return "getSelection";
        }

        if (_typeof(document.selection) === "object") {
          return "selection";
        }

        return null;
      },

      /**
       * Check for the isEqualNode DOM method.
       *
       * @return {Boolean} <code>true</code> if isEqualNode is supported by DOM nodes
       */
      getIsEqualNode: function getIsEqualNode() {
        return typeof document.documentElement.isEqualNode === "function";
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("html.webworker", statics.getWebWorker);
      qx.core.Environment.add("html.filereader", statics.getFileReader);
      qx.core.Environment.add("html.geolocation", statics.getGeoLocation);
      qx.core.Environment.add("html.audio", statics.getAudio);
      qx.core.Environment.add("html.audio.ogg", statics.getAudioOgg);
      qx.core.Environment.add("html.audio.mp3", statics.getAudioMp3);
      qx.core.Environment.add("html.audio.wav", statics.getAudioWav);
      qx.core.Environment.add("html.audio.au", statics.getAudioAu);
      qx.core.Environment.add("html.audio.aif", statics.getAudioAif);
      qx.core.Environment.add("html.video", statics.getVideo);
      qx.core.Environment.add("html.video.ogg", statics.getVideoOgg);
      qx.core.Environment.add("html.video.h264", statics.getVideoH264);
      qx.core.Environment.add("html.video.webm", statics.getVideoWebm);
      qx.core.Environment.add("html.storage.local", statics.getLocalStorage);
      qx.core.Environment.add("html.storage.session", statics.getSessionStorage);
      qx.core.Environment.add("html.storage.userdata", statics.getUserDataStorage);
      qx.core.Environment.add("html.classlist", statics.getClassList);
      qx.core.Environment.add("html.xpath", statics.getXPath);
      qx.core.Environment.add("html.xul", statics.getXul);
      qx.core.Environment.add("html.canvas", statics.getCanvas);
      qx.core.Environment.add("html.svg", statics.getSvg);
      qx.core.Environment.add("html.vml", statics.getVml);
      qx.core.Environment.add("html.dataset", statics.getDataset);
      qx.core.Environment.addAsync("html.dataurl", statics.getDataUrl);
      qx.core.Environment.add("html.element.contains", statics.getContains);
      qx.core.Environment.add("html.element.compareDocumentPosition", statics.getCompareDocumentPosition);
      qx.core.Environment.add("html.element.textcontent", statics.getTextContent);
      qx.core.Environment.add("html.console", statics.getConsole);
      qx.core.Environment.add("html.image.naturaldimensions", statics.getNaturalDimensions);
      qx.core.Environment.add("html.history.state", statics.getHistoryState);
      qx.core.Environment.add("html.selection", statics.getSelection);
      qx.core.Environment.add("html.node.isequalnode", statics.getIsEqualNode);
      qx.core.Environment.add("html.fullscreen", statics.getFullScreen);
    }
  });
  qx.bom.client.Html.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.log.appender.Formatter": {
        "require": true,
        "defer": "runtime"
      },
      "qx.bom.client.Html": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.log.Logger": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "html.console": {
          "className": "qx.bom.client.Html"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * Processes the incoming log entry and displays it by means of the native
   * logging capabilities of the client.
   *
   * Supported browsers:
   * * Firefox <4 using FireBug (if available).
   * * Firefox >=4 using the Web Console.
   * * WebKit browsers using the Web Inspector/Developer Tools.
   * * Internet Explorer 8+ using the F12 Developer Tools.
   * * Opera >=10.60 using either the Error Console or Dragonfly
   *
   * Currently unsupported browsers:
   * * Opera <10.60
   *
   * @require(qx.log.appender.Formatter)
   * @require(qx.bom.client.Html)
   */
  qx.Bootstrap.define("qx.log.appender.Native", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Processes a single log entry
       *
       * @param entry {Map} The entry to process
       */
      process: function process(entry) {
        if (qx.core.Environment.get("html.console")) {
          // Firefox 4's Web Console doesn't support "debug"
          var level = console[entry.level] ? entry.level : "log";

          if (console[level]) {
            var formatter = qx.log.appender.Formatter.getFormatter();
            var args = formatter.toText(entry);
            console[level](args);
          }
        }
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      qx.log.Logger.register(statics);
    }
  });
  qx.log.appender.Native.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.UserAction": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "construct": true,
        "usage": "dynamic",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.event.IEventHandler": {
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.bom.client.Engine": {
        "construct": true,
        "defer": "load",
        "require": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      },
      "qx.event.type.KeyInput": {},
      "qx.event.Utils": {},
      "qx.event.type.Data": {},
      "qx.event.type.KeySequence": {},
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.event.util.Keyboard": {},
      "qx.event.handler.Focus": {},
      "qx.lang.Function": {},
      "qx.bom.Event": {},
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.ObjectRegistry": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "construct": true,
          "className": "qx.bom.client.Engine",
          "load": true,
          "defer": true
        },
        "browser.version": {
          "className": "qx.bom.client.Browser",
          "load": true
        },
        "engine.version": {
          "className": "qx.bom.client.Engine"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This class provides unified key event handler for Internet Explorer,
   * Firefox, Opera and Safari.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @require(qx.event.handler.UserAction)
   */
  qx.Class.define("qx.event.handler.Keyboard", {
    extend: qx.core.Object,
    implement: [qx.event.IEventHandler, qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Create a new instance
     *
     * @param manager {qx.event.Manager} Event manager for the window to use
     */
    construct: function construct(manager) {
      qx.core.Object.constructor.call(this); // Define shorthands

      this.__manager__P_19_0 = manager;
      this.__window__P_19_1 = manager.getWindow(); // Gecko ignores key events when not explicitly clicked in the document.

      if (qx.core.Environment.get("engine.name") == "gecko") {
        this.__root__P_19_2 = this.__window__P_19_1;
      } else {
        this.__root__P_19_2 = this.__window__P_19_1.document.documentElement;
      } // Internal sequence cache


      this.__lastUpDownType__P_19_3 = {}; // Initialize observer

      this._initKeyObserver();
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Integer} Priority of this handler */
      PRIORITY: qx.event.Registration.PRIORITY_NORMAL,

      /** @type {Map} Supported event types */
      SUPPORTED_TYPES: {
        keyup: 1,
        keydown: 1,
        keypress: 1,
        keyinput: 1
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __onKeyUpDownWrapper__P_19_4: null,
      __manager__P_19_0: null,
      __window__P_19_1: null,
      __root__P_19_2: null,
      __lastUpDownType__P_19_3: null,
      __lastKeyCode__P_19_5: null,
      __inputListeners__P_19_6: null,
      __onKeyPressWrapper__P_19_7: null,

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER INTERFACE
      ---------------------------------------------------------------------------
      */
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {},
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {// Nothing needs to be done here
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {// Nothing needs to be done here
      },

      /*
      ---------------------------------------------------------------------------
        HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Fire a key input event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param charCode {Integer} character code
       * @return {qx.Promise?} a promise if the event handlers created one
       */
      _fireInputEvent: function _fireInputEvent(domEvent, charCode) {
        var target = this.__getEventTarget__P_19_8();

        var tracker = {};
        var self = this; // Only fire when target is defined and visible

        if (target && target.offsetWidth != 0) {
          var event = qx.event.Registration.createEvent("keyinput", qx.event.type.KeyInput, [domEvent, target, charCode]);
          qx.event.Utils.then(tracker, function () {
            self.__manager__P_19_0.dispatchEvent(target, event);
          });
        } // Fire user action event
        // Needs to check if still alive first


        if (this.__window__P_19_1) {
          var self = this;
          qx.event.Utils.then(tracker, function () {
            return qx.event.Registration.fireEvent(self.__window__P_19_1, "useraction", qx.event.type.Data, ["keyinput"]);
          });
        }

        return tracker.promise;
      },

      /**
       * Fire a key up/down/press event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param type {String} type og the event
       * @param keyIdentifier {String} key identifier
       * @return {qx.Promise?} a promise, if any of the event handlers returned a promise
       */
      _fireSequenceEvent: function _fireSequenceEvent(domEvent, type, keyIdentifier) {
        var target = this.__getEventTarget__P_19_8();

        var keyCode = domEvent.keyCode;
        var tracker = {};
        var self = this; // Fire key event

        var event = qx.event.Registration.createEvent(type, qx.event.type.KeySequence, [domEvent, target, keyIdentifier]);
        qx.event.Utils.then(tracker, function () {
          return self.__manager__P_19_0.dispatchEvent(target, event);
        }); // IE and Safari suppress a "keypress" event if the "keydown" event's
        // default action was prevented. In this case we emulate the "keypress"
        //
        // FireFox suppresses "keypress" when "keydown" default action is prevented.
        // from version 29: https://bugzilla.mozilla.org/show_bug.cgi?id=935876.

        if (event.getDefaultPrevented() && type == "keydown") {
          if (qx.core.Environment.get("engine.name") == "mshtml" || qx.core.Environment.get("engine.name") == "webkit" || qx.core.Environment.get("engine.name") == "gecko" && qx.core.Environment.get("browser.version") >= 29) {
            // some key press events are already emulated. Ignore these events.
            if (!qx.event.util.Keyboard.isNonPrintableKeyCode(keyCode) && !this._emulateKeyPress[keyCode]) {
              qx.event.Utils.then(tracker, function () {
                return self._fireSequenceEvent(domEvent, "keypress", keyIdentifier);
              });
            }
          }
        } // Fire user action event
        // Needs to check if still alive first


        if (this.__window__P_19_1) {
          qx.event.Utils.then(tracker, function () {
            return qx.event.Registration.fireEvent(self.__window__P_19_1, "useraction", qx.event.type.Data, [type]);
          });
        }

        return tracker.promise;
      },

      /**
       * Get the target element for key events
       *
       * @return {Element} the event target element
       */
      __getEventTarget__P_19_8: function __getEventTarget__P_19_8() {
        var focusHandler = this.__manager__P_19_0.getHandler(qx.event.handler.Focus);

        var target = focusHandler.getActive(); // Fallback to focused element when active is null or invisible

        if (!target || target.offsetWidth == 0) {
          target = focusHandler.getFocus();
        } // Fallback to body when focused is null or invisible


        if (!target || target.offsetWidth == 0) {
          target = this.__manager__P_19_0.getWindow().document.body;
        }

        return target;
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER INIT/STOP
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes the native key event listeners.
       *
       * @signature function()
       */
      _initKeyObserver: function _initKeyObserver() {
        this.__onKeyUpDownWrapper__P_19_4 = qx.lang.Function.listener(this.__onKeyUpDown__P_19_9, this);
        this.__onKeyPressWrapper__P_19_7 = qx.lang.Function.listener(this.__onKeyPress__P_19_10, this);
        var Event = qx.bom.Event;
        Event.addNativeListener(this.__root__P_19_2, "keyup", this.__onKeyUpDownWrapper__P_19_4);
        Event.addNativeListener(this.__root__P_19_2, "keydown", this.__onKeyUpDownWrapper__P_19_4);
        Event.addNativeListener(this.__root__P_19_2, "keypress", this.__onKeyPressWrapper__P_19_7);
      },

      /**
       * Stops the native key event listeners.
       *
       * @signature function()
       */
      _stopKeyObserver: function _stopKeyObserver() {
        var Event = qx.bom.Event;
        Event.removeNativeListener(this.__root__P_19_2, "keyup", this.__onKeyUpDownWrapper__P_19_4);
        Event.removeNativeListener(this.__root__P_19_2, "keydown", this.__onKeyUpDownWrapper__P_19_4);
        Event.removeNativeListener(this.__root__P_19_2, "keypress", this.__onKeyPressWrapper__P_19_7);

        for (var key in this.__inputListeners__P_19_6 || {}) {
          var listener = this.__inputListeners__P_19_6[key];
          Event.removeNativeListener(listener.target, "keypress", listener.callback);
        }

        delete this.__inputListeners__P_19_6;
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE EVENT OBSERVERS
      ---------------------------------------------------------------------------
      */

      /**
       * Low level handler for "keyup" and "keydown" events
       *
       * @internal
       * @signature function(domEvent)
       * @param domEvent {Event} DOM event object
       */
      __onKeyUpDown__P_19_9: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        "gecko|webkit|mshtml": function geckoWebkitMshtml(domEvent) {
          var keyCode = 0;
          var charCode = 0;
          var type = domEvent.type;
          keyCode = domEvent.keyCode;
          var tracker = {};
          var self = this;
          qx.event.Utils.track(tracker, this._idealKeyHandler(keyCode, charCode, type, domEvent)); // On non print-able character be sure to add a keypress event

          if (type == "keydown") {
            /*
             * We need an artificial keypress event for every keydown event.
             * Newer browsers do not fire keypress for a regular charachter key (e.g when typing 'a')
             * if it was typed with the CTRL, ALT or META Key pressed during typing, like
             * doing it when typing the combination CTRL+A
             */
            var isModifierDown = domEvent.ctrlKey || domEvent.altKey || domEvent.metaKey; // non-printable, backspace, tab or the modfier keys are down

            if (qx.event.util.Keyboard.isNonPrintableKeyCode(keyCode) || this._emulateKeyPress[keyCode] || isModifierDown) {
              qx.event.Utils.then(tracker, function () {
                return self._idealKeyHandler(keyCode, charCode, "keypress", domEvent);
              });
            }
          } // Store last type


          this.__lastUpDownType__P_19_3[keyCode] = type;
          return tracker.promise;
        },
        opera: function opera(domEvent) {
          this.__lastKeyCode__P_19_5 = domEvent.keyCode;
          return this._idealKeyHandler(domEvent.keyCode, 0, domEvent.type, domEvent);
        }
      })),

      /**
       * some keys like "up", "down", "pageup", "pagedown" do not bubble a
       * "keypress" event in Firefox. To work around this bug we attach keypress
       * listeners directly to the input events.
       *
       * https://bugzilla.mozilla.org/show_bug.cgi?id=467513
       *
       * @signature function(target, type, keyCode)
       * @param target {Element} The event target
       * @param type {String} The event type
       * @param keyCode {Integer} the key code
       */
      __firefoxInputFix__P_19_11: qx.core.Environment.select("engine.name", {
        gecko: function gecko(target, type, keyCode) {
          if (type === "keydown" && (keyCode == 33 || keyCode == 34 || keyCode == 38 || keyCode == 40) && target.type == "text" && target.tagName.toLowerCase() === "input" && target.getAttribute("autoComplete") !== "off") {
            if (!this.__inputListeners__P_19_6) {
              this.__inputListeners__P_19_6 = {};
            }

            var hash = qx.core.ObjectRegistry.toHashCode(target);

            if (this.__inputListeners__P_19_6[hash]) {
              return;
            }

            var self = this;
            this.__inputListeners__P_19_6[hash] = {
              target: target,
              callback: function callback(domEvent) {
                qx.bom.Event.stopPropagation(domEvent);

                self.__onKeyPress__P_19_10(domEvent);
              }
            };
            var listener = qx.event.GlobalError.observeMethod(this.__inputListeners__P_19_6[hash].callback);
            qx.bom.Event.addNativeListener(target, "keypress", listener);
          }
        },
        "default": null
      }),

      /**
       * Low level key press handler
       *
       * @signature function(domEvent)
       * @param domEvent {Event} DOM event object
       */
      __onKeyPress__P_19_10: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(domEvent) {
          domEvent = window.event || domEvent;

          if (this._charCode2KeyCode[domEvent.keyCode]) {
            return this._idealKeyHandler(this._charCode2KeyCode[domEvent.keyCode], 0, domEvent.type, domEvent);
          } else {
            return this._idealKeyHandler(0, domEvent.keyCode, domEvent.type, domEvent);
          }
        },
        gecko: function gecko(domEvent) {
          if (qx.core.Environment.get("engine.version") < 66) {
            var charCode = domEvent.charCode;
            var type = domEvent.type;
            return this._idealKeyHandler(domEvent.keyCode, charCode, type, domEvent);
          } else {
            if (this._charCode2KeyCode[domEvent.keyCode]) {
              return this._idealKeyHandler(this._charCode2KeyCode[domEvent.keyCode], 0, domEvent.type, domEvent);
            } else {
              return this._idealKeyHandler(0, domEvent.keyCode, domEvent.type, domEvent);
            }
          }
        },
        webkit: function webkit(domEvent) {
          if (this._charCode2KeyCode[domEvent.keyCode]) {
            return this._idealKeyHandler(this._charCode2KeyCode[domEvent.keyCode], 0, domEvent.type, domEvent);
          } else {
            return this._idealKeyHandler(0, domEvent.keyCode, domEvent.type, domEvent);
          }
        },
        opera: function opera(domEvent) {
          var keyCode = domEvent.keyCode;
          var type = domEvent.type; // Some keys are identified differently for key up/down and keypress
          // (e.g. "v" gets identified as "F7").
          // So we store the last key up/down keycode and compare it to the
          // current keycode.
          // See http://bugzilla.qooxdoo.org/show_bug.cgi?id=603

          if (keyCode != this.__lastKeyCode__P_19_5) {
            return this._idealKeyHandler(0, this.__lastKeyCode__P_19_5, type, domEvent);
          } else {
            if (qx.event.util.Keyboard.keyCodeToIdentifierMap[domEvent.keyCode]) {
              return this._idealKeyHandler(domEvent.keyCode, 0, domEvent.type, domEvent);
            } else {
              return this._idealKeyHandler(0, domEvent.keyCode, domEvent.type, domEvent);
            }
          }
        }
      })),

      /*
      ---------------------------------------------------------------------------
        IDEAL KEY HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Key handler for an idealized browser.
       * Runs after the browser specific key handlers have normalized the key events.
       *
       * @param keyCode {String} keyboard code
       * @param charCode {String} character code
       * @param eventType {String} type of the event (keydown, keypress, keyup)
       * @param domEvent {Element} DomEvent
       * @return {qx.Promise?} a promise, if an event handler created one
       */
      _idealKeyHandler: function _idealKeyHandler(keyCode, charCode, eventType, domEvent) {
        var keyIdentifier; // Use: keyCode

        if (keyCode || !keyCode && !charCode) {
          keyIdentifier = qx.event.util.Keyboard.keyCodeToIdentifier(keyCode);
          return this._fireSequenceEvent(domEvent, eventType, keyIdentifier);
        } // Use: charCode
        else {
          keyIdentifier = qx.event.util.Keyboard.charCodeToIdentifier(charCode);
          var tracker = {};
          var self = this;
          qx.event.Utils.track(tracker, this._fireSequenceEvent(domEvent, "keypress", keyIdentifier));
          return qx.event.Utils.then(tracker, function () {
            return self._fireInputEvent(domEvent, charCode);
          });
        }
      },

      /*
      ---------------------------------------------------------------------------
        KEY MAPS
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Map} maps the charcodes of special keys for key press emulation
       *
       * @lint ignoreReferenceField(_emulateKeyPress)
       */
      _emulateKeyPress: qx.core.Environment.select("engine.name", {
        mshtml: {
          8: true,
          9: true
        },
        webkit: {
          8: true,
          9: true,
          27: true
        },
        gecko: qx.core.Environment.get("browser.version") >= 65 ? {
          8: true,
          9: true,
          27: true
        } : {},
        "default": {}
      }),

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * converts a key identifier back to a keycode
       *
       * @param keyIdentifier {String} The key identifier to convert
       * @return {Integer} keyboard code
       */
      _identifierToKeyCode: function _identifierToKeyCode(keyIdentifier) {
        return qx.event.util.Keyboard.identifierToKeyCodeMap[keyIdentifier] || keyIdentifier.charCodeAt(0);
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._stopKeyObserver();

      this.__lastKeyCode__P_19_5 = this.__manager__P_19_0 = this.__window__P_19_1 = this.__root__P_19_2 = this.__lastUpDownType__P_19_3 = null;
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics, members) {
      // register at the event handler
      qx.event.Registration.addHandler(statics);

      if (qx.core.Environment.get("engine.name") !== "opera") {
        members._charCode2KeyCode = {
          13: 13,
          27: 27
        };
      }
    }
  });
  qx.event.handler.Keyboard.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "require": true
      },
      "qx.event.IEventDispatcher": {
        "require": true
      },
      "qx.event.Utils": {},
      "qx.event.type.Event": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * Event dispatcher for all bubbling events.
   */
  qx.Class.define("qx.event.dispatch.AbstractBubbling", {
    extend: qx.core.Object,
    implement: qx.event.IEventDispatcher,
    type: "abstract",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Create a new instance
     *
     * @param manager {qx.event.Manager} Event manager for the window to use
     */
    construct: function construct(manager) {
      this._manager = manager;
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        EVENT DISPATCHER HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the parent of the given target
       *
       * @abstract
       * @param target {var} The target which parent should be found
       * @return {var} The parent of the given target
       */
      _getParent: function _getParent(target) {
        throw new Error("Missing implementation");
      },

      /*
      ---------------------------------------------------------------------------
        EVENT DISPATCHER INTERFACE
      ---------------------------------------------------------------------------
      */
      // interface implementation
      canDispatchEvent: function canDispatchEvent(target, event, type) {
        return event.getBubbles();
      },
      // interface implementation
      dispatchEvent: function dispatchEvent(target, event, type) {
        var parent = target;
        var manager = this._manager;
        var captureListeners, bubbleListeners;
        var context; // Cache list for AT_TARGET

        var targetList = [];
        captureListeners = manager.getListeners(target, type, true);
        bubbleListeners = manager.getListeners(target, type, false);

        if (captureListeners) {
          targetList.push(captureListeners);
        }

        if (bubbleListeners) {
          targetList.push(bubbleListeners);
        } // Cache list for CAPTURING_PHASE and BUBBLING_PHASE


        var parent = this._getParent(target);

        var bubbleList = [];
        var bubbleTargets = [];
        var captureList = [];
        var captureTargets = []; // Walk up the tree and look for event listeners

        while (parent != null) {
          // Attention:
          // We do not follow the DOM2 events specifications here
          // http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html#Events-flow-capture
          // Opera is the only browser which conforms to the spec.
          // Safari and Mozilla do it the same way like qooxdoo does
          // and add the capture events of the target to the execution list.
          captureListeners = manager.getListeners(parent, type, true);

          if (captureListeners) {
            captureList.push(captureListeners);
            captureTargets.push(parent);
          }

          bubbleListeners = manager.getListeners(parent, type, false);

          if (bubbleListeners) {
            bubbleList.push(bubbleListeners);
            bubbleTargets.push(parent);
          }

          parent = this._getParent(parent);
        }

        var self = this;
        var tracker = {};
        var __TRACE_LOGGING__P_148_0 = false; //(event._type == "pointerup" && event._target.className === "qx-toolbar-button-checked");

        var __TRACE__P_148_1 = function __TRACE__P_148_1() {};

        if (__TRACE_LOGGING__P_148_0) {
          var serial = (this.SERIAL || 0) + 1;
          this.SERIAL = serial + 1;

          __TRACE__P_148_1 = function __TRACE__P_148_1() {
            var args = [].slice.apply(arguments);
            args.unshift("serial #" + serial + ": ");
            console.log.apply(this, args);
          };
        }

        qx.event.Utils["catch"](tracker, function () {
          // This function must exist to suppress "unhandled rejection" messages from promises
          __TRACE__P_148_1("Aborted serial=" + serial + ", type=" + event.getType());
        }); // capturing phase

        qx.event.Utils.then(tracker, function () {
          // loop through the hierarchy in reverted order (from root)
          event.setEventPhase(qx.event.type.Event.CAPTURING_PHASE);

          __TRACE__P_148_1("captureList=" + captureList.length);

          return qx.event.Utils.series(captureList, function (localList, i) {
            __TRACE__P_148_1("captureList[" + i + "]: localList.length=" + localList.length);

            var currentTarget = captureTargets[i];
            event.setCurrentTarget(currentTarget);
            var result = qx.event.Utils.series(localList, function (listener, listenerIndex) {
              context = listener.context || currentTarget;
              {
                // warn if the context is disposed
                if (context && context.isDisposed && context.isDisposed()) {
                  self.warn("The context object '" + context + "' for the event '" + type + "' of '" + currentTarget + "'is already disposed.");
                }
              }

              if (!self._manager.isBlacklisted(listener.unique)) {
                __TRACE__P_148_1("captureList[" + i + "] => localList[" + listenerIndex + "] callListener");

                return listener.handler.call(context, event);
              } else {
                __TRACE__P_148_1("captureList[" + i + "] => localList[" + listenerIndex + "] is blacklisted");
              }
            }, true);

            if (result === qx.event.Utils.ABORT) {
              return qx.event.Utils.reject(tracker);
            }

            if (event.getPropagationStopped()) {
              return qx.event.Utils.reject(tracker);
            }

            return result;
          });
        }); // at target

        qx.event.Utils.then(tracker, function () {
          event.setEventPhase(qx.event.type.Event.AT_TARGET);
          event.setCurrentTarget(target);

          __TRACE__P_148_1("targetList=" + targetList.length);

          return qx.event.Utils.series(targetList, function (localList, i) {
            __TRACE__P_148_1("targetList[" + i + "] localList.length=" + localList.length);

            var result = qx.event.Utils.series(localList, function (listener, listenerIndex) {
              __TRACE__P_148_1("targetList[" + i + "] -> localList[" + listenerIndex + "] callListener");

              context = listener.context || target;
              {
                // warn if the context is disposed
                if (context && context.isDisposed && context.isDisposed()) {
                  self.warn("The context object '" + context + "' for the event '" + type + "' of '" + target + "'is already disposed.");
                }
              }

              __TRACE__P_148_1("Calling target serial=" + serial + ", type=" + event.getType());

              return listener.handler.call(context, event);
            }, true);

            if (result === qx.event.Utils.ABORT) {
              return qx.event.Utils.reject(tracker);
            }

            if (event.getPropagationStopped()) {
              return qx.event.Utils.reject(tracker);
            }

            return result;
          });
        }); // bubbling phase
        // loop through the hierarchy in normal order (to root)

        qx.event.Utils.then(tracker, function () {
          event.setEventPhase(qx.event.type.Event.BUBBLING_PHASE);

          __TRACE__P_148_1("bubbleList=" + bubbleList.length);

          return qx.event.Utils.series(bubbleList, function (localList, i) {
            __TRACE__P_148_1("bubbleList[" + i + "] localList.length=" + localList.length);

            var currentTarget = bubbleTargets[i];
            event.setCurrentTarget(currentTarget);
            var result = qx.event.Utils.series(localList, function (listener, listenerIndex) {
              __TRACE__P_148_1("bubbleList[" + i + "] -> localList[" + listenerIndex + "] callListener");

              context = listener.context || currentTarget;
              {
                // warn if the context is disposed
                if (context && context.isDisposed && context.isDisposed()) {
                  self.warn("The context object '" + context + "' for the event '" + type + "' of '" + currentTarget + "'is already disposed.");
                }
              }
              return listener.handler.call(context, event);
            }, true);

            if (result === qx.event.Utils.ABORT) {
              return qx.event.Utils.reject(tracker);
            }

            if (event.getPropagationStopped()) {
              return qx.event.Utils.reject(tracker);
            }

            return result;
          });
        });

        if (__TRACE_LOGGING__P_148_0) {
          if (tracker.promise) {
            __TRACE__P_148_1("events promised");

            qx.event.Utils.then(tracker, function () {
              __TRACE__P_148_1("events promised done");
            });
          } else {
            __TRACE__P_148_1("events done");
          }
        }

        return tracker.promise;
      }
    }
  });
  qx.event.dispatch.AbstractBubbling.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.dispatch.AbstractBubbling": {
        "require": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * Event dispatcher for all bubbling events on DOM elements.
   */
  qx.Class.define("qx.event.dispatch.DomBubbling", {
    extend: qx.event.dispatch.AbstractBubbling,
    statics: {
      /** @type {Integer} Priority of this dispatcher */
      PRIORITY: qx.event.Registration.PRIORITY_NORMAL
    },
    members: {
      // overridden
      _getParent: function _getParent(target) {
        return target.parentNode;
      },
      // interface implementation
      canDispatchEvent: function canDispatchEvent(target, event, type) {
        return target.nodeType !== undefined && event.getBubbles();
      }
    },
    defer: function defer(statics) {
      qx.event.Registration.addDispatcher(statics);
    }
  });
  qx.event.dispatch.DomBubbling.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Native": {
        "require": true
      },
      "qx.bom.client.OperatingSystem": {
        "require": true
      },
      "qx.bom.client.Engine": {
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "className": "qx.bom.client.OperatingSystem"
        },
        "engine.name": {
          "className": "qx.bom.client.Engine"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Common base class for all DOM events.
   */
  qx.Class.define("qx.event.type.Dom", {
    extend: qx.event.type.Native,
    statics: {
      /** @type {Integer} The modifier mask for the shift key. */
      SHIFT_MASK: 1,

      /** @type {Integer} The modifier mask for the control key. */
      CTRL_MASK: 2,

      /** @type {Integer} The modifier mask for the alt key. */
      ALT_MASK: 4,

      /** @type {Integer} The modifier mask for the meta key (e.g. apple key on Macs). */
      META_MASK: 8,

      /** @type {Integer} The modifier mask for the CapsLock modifier. */
      CAPSLOCK_MASK: 16,

      /** @type {Integer} The modifier mask for the NumLock modifier. */
      NUMLOCK_MASK: 32,

      /** @type {Integer} The modifier mask for the ScrollLock modifier. */
      SCROLLLOCK_MASK: 64
    },
    members: {
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        var clone = qx.event.type.Dom.superclass.prototype._cloneNativeEvent.call(this, nativeEvent, clone);

        clone.shiftKey = nativeEvent.shiftKey;
        clone.ctrlKey = nativeEvent.ctrlKey;
        clone.altKey = nativeEvent.altKey;
        clone.metaKey = nativeEvent.metaKey;

        if (typeof nativeEvent.getModifierState === "function") {
          clone.numLock = nativeEvent.getModifierState("NumLock");
          clone.capsLock = nativeEvent.getModifierState("CapsLock");
          clone.scrollLock = nativeEvent.getModifierState("ScrollLock");
        } else {
          clone.numLock = false;
          clone.capsLock = false;
          clone.scrollLock = false;
        }

        return clone;
      },

      /**
       * Return in a bit map, which modifier keys are pressed. The constants
       * {@link #SHIFT_MASK}, {@link #CTRL_MASK}, {@link #ALT_MASK},
       * {@link #META_MASK} and {@link #CAPSLOCK_MASK} define the bit positions
       * of the corresponding keys.
       *
       * @return {Integer} A bit map with the pressed modifier keys.
       */
      getModifiers: function getModifiers() {
        var mask = 0;
        var evt = this._native;

        if (evt.shiftKey) {
          mask |= qx.event.type.Dom.SHIFT_MASK;
        }

        if (evt.ctrlKey) {
          mask |= qx.event.type.Dom.CTRL_MASK;
        }

        if (evt.altKey) {
          mask |= qx.event.type.Dom.ALT_MASK;
        }

        if (evt.metaKey) {
          mask |= qx.event.type.Dom.META_MASK;
        }

        return mask;
      },

      /**
       * Return in a bit map, which lock keys are pressed. The constants
       * {@link #CAPSLOCK_MASK}, {@link #NUMLOCK_MASK}, and {@link #SCROLLLOCK_MASK}
       * define the bit positions of the corresponding keys.
       *
       * @return {Integer} A bit map with the locked keys.
       */
      getKeyLockState: function getKeyLockState() {
        var mask = 0;
        var evt = this._native;

        if (evt.capsLock) {
          mask |= qx.event.type.Dom.CAPSLOCK_MASK;
        }

        if (evt.numLock) {
          mask |= qx.event.type.Dom.NUMLOCK_MASK;
        }

        if (evt.scrollLock) {
          mask |= qx.event.type.Dom.SCROLLLOCK_MASK;
        }

        return mask;
      },

      /**
       * Returns whether the ctrl key is pressed.
       *
       * @return {Boolean} whether the ctrl key is pressed.
       */
      isCtrlPressed: function isCtrlPressed() {
        return this._native.ctrlKey;
      },

      /**
       * Returns whether the shift key is pressed.
       *
       * @return {Boolean} whether the shift key is pressed.
       */
      isShiftPressed: function isShiftPressed() {
        return this._native.shiftKey;
      },

      /**
       * Returns whether the alt key is pressed.
       *
       * @return {Boolean} whether the alt key is pressed.
       */
      isAltPressed: function isAltPressed() {
        return this._native.altKey;
      },

      /**
       * Returns whether the meta key is pressed.
       *
       * @return {Boolean} whether the meta key is pressed.
       */
      isMetaPressed: function isMetaPressed() {
        return this._native.metaKey;
      },

      /**
       * Returns whether the caps-lock modifier is active
       *
       * @return {Boolean} whether the CapsLock key is pressed.
       */
      isCapsLocked: function isCapsLocked() {
        return this._native.capsLock;
      },

      /**
       * Returns whether the num-lock modifier is active
       *
       * @return {Boolean} whether the NumLock key is pressed.
       */
      isNumLocked: function isNumLocked() {
        return this._native.numLock;
      },

      /**
       * Returns whether the scroll-lock modifier is active
       *
       * @return {Boolean} whether the ScrollLock key is pressed.
       */
      isScrollLocked: function isScrollLocked() {
        return this._native.scrollLock;
      },

      /**
       * Returns whether the ctrl key or (on the Mac) the command key is pressed.
       *
       * @return {Boolean} <code>true</code> if the command key is pressed on the Mac
       *           or the ctrl key is pressed on another system.
       */
      isCtrlOrCommandPressed: function isCtrlOrCommandPressed() {
        // Opera seems to use ctrlKey for the cmd key so don't fix that for opera
        // on mac [BUG #5884]
        if (qx.core.Environment.get("os.name") == "osx" && qx.core.Environment.get("engine.name") != "opera") {
          return this._native.metaKey;
        } else {
          return this._native.ctrlKey;
        }
      }
    }
  });
  qx.event.type.Dom.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Dom": {
        "require": true
      },
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.dom.Node": {},
      "qx.bom.Viewport": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "browser.name": {
          "className": "qx.bom.client.Browser"
        },
        "browser.documentmode": {
          "className": "qx.bom.client.Browser"
        },
        "engine.name": {
          "className": "qx.bom.client.Engine"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Mouse event object.
   *
   * the interface of this class is based on the DOM Level 2 mouse event
   * interface: http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-eventgroupings-mouseevents
   */
  qx.Class.define("qx.event.type.Mouse", {
    extend: qx.event.type.Dom,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */

    /* eslint-disable @qooxdoo/qx/no-refs-in-members */
    members: {
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        var clone = qx.event.type.Mouse.superclass.prototype._cloneNativeEvent.call(this, nativeEvent, clone); // Fix for #9619 pointermove/mousemove events return wrong result in isLeftPressed()
        // button only valid in button events. Undefined otherwise.
        // see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button


        switch (nativeEvent.type) {
          case "mousemove":
          case "mouseenter":
          case "mouseleave":
          case "mouseover":
          case "mouseout":
            clone.button = -1;
            break;

          default:
            clone.button = nativeEvent.button;
            break;
        }

        clone.buttons = nativeEvent.buttons;
        clone.clientX = Math.round(nativeEvent.clientX);
        clone.clientY = Math.round(nativeEvent.clientY);
        clone.pageX = nativeEvent.pageX ? Math.round(nativeEvent.pageX) : undefined;
        clone.pageY = nativeEvent.pageY ? Math.round(nativeEvent.pageY) : undefined;
        clone.screenX = Math.round(nativeEvent.screenX);
        clone.screenY = Math.round(nativeEvent.screenY);
        clone.wheelDelta = nativeEvent.wheelDelta;
        clone.wheelDeltaX = nativeEvent.wheelDeltaX;
        clone.wheelDeltaY = nativeEvent.wheelDeltaY;
        clone.delta = nativeEvent.delta;
        clone.deltaX = nativeEvent.deltaX;
        clone.deltaY = nativeEvent.deltaY;
        clone.deltaZ = nativeEvent.deltaZ;
        clone.detail = nativeEvent.detail;
        clone.axis = nativeEvent.axis;
        clone.wheelX = nativeEvent.wheelX;
        clone.wheelY = nativeEvent.wheelY;
        clone.HORIZONTAL_AXIS = nativeEvent.HORIZONTAL_AXIS;
        clone.srcElement = nativeEvent.srcElement;
        clone.target = nativeEvent.target;
        return clone;
      },

      /**
       * @type {Map} Contains the button ID to identifier data.
       *
       * @lint ignoreReferenceField(__buttonsDom2EventModel)
       */
      __buttonsDom2EventModel__P_63_0: {
        0: "left",
        2: "right",
        1: "middle"
      },

      /**
       * @type {Map} Contains the button ID to identifier data.
       *
       * @lint ignoreReferenceField(__buttonsDom3EventModel)
       */
      __buttonsDom3EventModel__P_63_1: {
        0: "none",
        1: "left",
        2: "right",
        4: "middle"
      },

      /**
       * @type {Map} Contains the button ID to identifier data.
       *
       * @lint ignoreReferenceField(__buttonsMshtmlEventModel)
       */
      __buttonsMshtmlEventModel__P_63_2: {
        1: "left",
        2: "right",
        4: "middle"
      },
      // overridden
      stop: function stop() {
        this.stopPropagation();
      },

      /**
       * During mouse events caused by the depression or release of a mouse button,
       * this method can be used to check which mouse button changed state.
       *
       * Only internet explorer can compute the button during mouse move events. For
       * all other browsers the button only contains sensible data during
       * "click" events like "click", "dblclick", "mousedown", "mouseup" or "contextmenu".
       *
       * But still, browsers act different on click:
       * <pre>
       * <- = left mouse button
       * -> = right mouse button
       * ^  = middle mouse button
       *
       * Browser | click, dblclick | contextmenu
       * ---------------------------------------
       * Firefox | <- ^ ->         | ->
       * Chrome  | <- ^            | ->
       * Safari  | <- ^            | ->
       * IE      | <- (^ is <-)    | ->
       * Opera   | <-              | -> (twice)
       * </pre>
       *
       * @return {String} One of "left", "right", "middle" or "none"
       */
      getButton: function getButton() {
        switch (this._type) {
          case "contextmenu":
            return "right";

          case "click":
            // IE does not support buttons on click --> assume left button
            if (qx.core.Environment.get("browser.name") === "ie" && qx.core.Environment.get("browser.documentmode") < 9) {
              return "left";
            }

          default:
            if (!(qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") <= 8)) {
              // if the button value is -1, we should use the DOM level 3 .buttons attribute
              // the value -1 is only set for pointer events: http://msdn.microsoft.com/en-us/library/ie/ff974877(v=vs.85).aspx
              if (this._native.button === -1) {
                return this.__buttonsDom3EventModel__P_63_1[this._native.buttons] || "none";
              }

              return this.__buttonsDom2EventModel__P_63_0[this._native.button] || "none";
            } else {
              return this.__buttonsMshtmlEventModel__P_63_2[this._native.button] || "none";
            }

        }
      },

      /**
       * Whether the left button is pressed
       *
       * @return {Boolean} true when the left button is pressed
       */
      isLeftPressed: function isLeftPressed() {
        return this.getButton() === "left";
      },

      /**
       * Whether the middle button is pressed
       *
       * @return {Boolean} true when the middle button is pressed
       */
      isMiddlePressed: function isMiddlePressed() {
        return this.getButton() === "middle";
      },

      /**
       * Whether the right button is pressed
       *
       * @return {Boolean} true when the right button is pressed
       */
      isRightPressed: function isRightPressed() {
        return this.getButton() === "right";
      },

      /**
       * Get a secondary event target related to an UI event. This attribute is
       * used with the mouseover event to indicate the event target which the
       * pointing device exited and with the mouseout event to indicate the
       * event target which the pointing device entered.
       *
       * @return {Element} The secondary event target.
       * @signature function()
       */
      getRelatedTarget: function getRelatedTarget() {
        return this._relatedTarget;
      },

      /**
       * Get the he horizontal coordinate at which the event occurred relative
       * to the viewport.
       *
       * @return {Integer} The horizontal mouse position
       */
      getViewportLeft: function getViewportLeft() {
        return Math.round(this._native.clientX);
      },

      /**
       * Get the vertical coordinate at which the event occurred relative
       * to the viewport.
       *
       * @return {Integer} The vertical mouse position
       * @signature function()
       */
      getViewportTop: function getViewportTop() {
        return Math.round(this._native.clientY);
      },

      /**
       * Get the horizontal position at which the event occurred relative to the
       * left of the document. This property takes into account any scrolling of
       * the page.
       *
       * @return {Integer} The horizontal mouse position in the document.
       */
      getDocumentLeft: function getDocumentLeft() {
        if (this._native.pageX !== undefined) {
          return Math.round(this._native.pageX);
        } else if (this._native.srcElement) {
          var win = qx.dom.Node.getWindow(this._native.srcElement);
          return Math.round(this._native.clientX) + qx.bom.Viewport.getScrollLeft(win);
        } else {
          return Math.round(this._native.clientX) + qx.bom.Viewport.getScrollLeft(window);
        }
      },

      /**
       * Get the vertical position at which the event occurred relative to the
       * top of the document. This property takes into account any scrolling of
       * the page.
       *
       * @return {Integer} The vertical mouse position in the document.
       */
      getDocumentTop: function getDocumentTop() {
        if (this._native.pageY !== undefined) {
          return Math.round(this._native.pageY);
        } else if (this._native.srcElement) {
          var win = qx.dom.Node.getWindow(this._native.srcElement);
          return Math.round(this._native.clientY) + qx.bom.Viewport.getScrollTop(win);
        } else {
          return Math.round(this._native.clientY) + qx.bom.Viewport.getScrollTop(window);
        }
      },

      /**
       * Get the horizontal coordinate at which the event occurred relative to
       * the origin of the screen coordinate system.
       *
       * Note: This value is usually not very useful unless you want to
       * position a native popup window at this coordinate.
       *
       * @return {Integer} The horizontal mouse position on the screen.
       */
      getScreenLeft: function getScreenLeft() {
        return Math.round(this._native.screenX);
      },

      /**
       * Get the vertical coordinate at which the event occurred relative to
       * the origin of the screen coordinate system.
       *
       * Note: This value is usually not very useful unless you want to
       * position a native popup window at this coordinate.
       *
       * @return {Integer} The vertical mouse position on the screen.
       */
      getScreenTop: function getScreenTop() {
        return Math.round(this._native.screenY);
      }
    }
  });
  qx.event.type.Mouse.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Mouse": {
        "require": true
      },
      "qx.bom.Event": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * Pointer event object.
   *
   * the interface of this class is based on the pointer event interface:
   * http://www.w3.org/TR/pointerevents/
   */
  qx.Class.define("qx.event.type.Pointer", {
    extend: qx.event.type.Mouse,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        clone = qx.event.type.Pointer.superclass.prototype._cloneNativeEvent.call(this, nativeEvent, clone);
        clone.pointerId = nativeEvent.pointerId;
        clone.width = nativeEvent.width;
        clone.height = nativeEvent.height;
        clone.pressure = nativeEvent.pressure;
        clone.tiltX = nativeEvent.tiltX;
        clone.tiltY = nativeEvent.tiltY;
        clone.pointerType = nativeEvent.pointerType;
        clone.isPrimary = nativeEvent.isPrimary;
        clone._original = nativeEvent._original;
        clone.MSPOINTER_TYPE_MOUSE = nativeEvent.MSPOINTER_TYPE_MOUSE;
        clone.MSPOINTER_TYPE_PEN = nativeEvent.MSPOINTER_TYPE_PEN;
        clone.MSPOINTER_TYPE_TOUCH = nativeEvent.MSPOINTER_TYPE_TOUCH;
        return clone;
      },
      // overridden
      getDocumentLeft: function getDocumentLeft() {
        var x = qx.event.type.Pointer.superclass.prototype.getDocumentLeft.call(this); // iOS 6 does not copy pageX over to the fake pointer event

        if (x == 0 && this.getPointerType() == "touch" && this._native._original !== undefined) {
          x = Math.round(this._native._original.changedTouches[0].pageX) || 0;
        }

        return x;
      },
      // overridden
      getDocumentTop: function getDocumentTop() {
        var y = qx.event.type.Pointer.superclass.prototype.getDocumentTop.call(this); // iOS 6 does not copy pageY over to the fake pointer event

        if (y == 0 && this.getPointerType() == "touch" && this._native._original !== undefined) {
          y = Math.round(this._native._original.changedTouches[0].pageY) || 0;
        }

        return y;
      },

      /**
       * Returns a unique identified for the pointer. This id is
       * unique for all active pointers.
       *
       * @return {Number} The unique id.
       */
      getPointerId: function getPointerId() {
        return this._native.pointerId || 0;
      },

      /**
       * Returns the contact geometry in it's width.
       *
       * @return {Number} The number of pixels (width) of the contact geometry.
       */
      getWidth: function getWidth() {
        return this._native.width || 0;
      },

      /**
       * Returns the contact geometry in it's height.
       *
       * @return {Number} The number of pixels (height) of the contact geometry.
       */
      getHeight: function getHeight() {
        return this._native.height || 0;
      },

      /**
       * Returns the pressure of the pointer in a rage from 0 to 1.
       *
       * @return {Number} <code>1</code> for full pressure. The default is 0.
       */
      getPressure: function getPressure() {
        return this._native.pressure || 0;
      },

      /**
       * Returns the plane angle in degrees between the Y-Z plane and the
       * plane containing e.g. the stylus and the Y axis.
       *
       * @return {Number} A value between -90 and 90. The default is 0.
       */
      getTiltX: function getTiltX() {
        return this._native.tiltX || 0;
      },

      /**
       * Returns the plane angle in degrees between the X-Z plane and the
       * plane containing e.g. the stylus and the X axis.
       *
       * @return {Number} A value between -90 and 90. The default is 0.
       */
      getTiltY: function getTiltY() {
        return this._native.tiltY || 0;
      },
      // overridden
      getOriginalTarget: function getOriginalTarget() {
        if (this._native && this._native._original) {
          // fake pointer events
          var orig = this._native._original; // In IE8, the original event can be a DispCEventObj which throws an
          // exception when trying to access its properties.

          try {
            // touch events have a wrong target compared to mouse events
            if (orig.type.indexOf("touch") == 0) {
              if (orig.changedTouches[0]) {
                return document.elementFromPoint(orig.changedTouches[0].clientX, orig.changedTouches[0].clientY);
              }
            }
          } catch (ex) {
            return qx.bom.Event.getTarget(this._native);
          }

          return qx.bom.Event.getTarget(orig);
        } else if (this._native) {
          // native pointer events
          return qx.bom.Event.getTarget(this._native);
        }

        return qx.event.type.Pointer.superclass.prototype.getOriginalTarget.call(this);
      },

      /**
       * Returns the device type which the event triggered. This can be one
       * of the following strings: <code>mouse</code>, <code>wheel</code>,
       * <code>pen</code> or <code>touch</code>.
       *
       * @return {String} The type of the pointer.
       */
      getPointerType: function getPointerType() {
        if (typeof this._native.pointerType == "string") {
          return this._native.pointerType;
        }

        if (typeof this._native.pointerType == "number") {
          if (this._native.pointerType == this._native.MSPOINTER_TYPE_MOUSE) {
            return "mouse";
          }

          if (this._native.pointerType == this._native.MSPOINTER_TYPE_PEN) {
            return "pen";
          }

          if (this._native.pointerType == this._native.MSPOINTER_TYPE_TOUCH) {
            return "touch";
          }
        }

        return "";
      },

      /**
       * Returns whether the pointer is the primary pointer.
       *
       * @return {Boolean} <code>true</code>, if it's the primary pointer.
       */
      isPrimary: function isPrimary() {
        return !!this._native.isPrimary;
      }
    }
  });
  qx.event.type.Pointer.$$dbClassInfo = $$dbClassInfo;
})();

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Event": {
        "require": true
      },
      "qx.lang.Object": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "event.customevent": {
          "className": "qx.bom.client.Event"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christopher Zuendorf (czuendorf)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Cross-browser custom UI event
   */
  qx.Bootstrap.define("qx.event.type.dom.Custom", {
    extend: Object,
    statics: {
      PROPERTIES: {
        bubbles: false,
        cancelable: true
      }
    },

    /**
     * @param type {String} event type
     * @param domEvent {Event} Native event that will be used as a template for the new event
     * @param customProps {Map} Map of event properties (will override the domEvent's values)
     * @return {Event} event object
     */
    construct: function construct(type, domEvent, customProps) {
      this._type = type;
      this._event = this._createEvent();

      this._initEvent(domEvent, customProps);

      this._event._original = domEvent;

      this._event.preventDefault = function () {
        if (this._original.preventDefault) {
          this._original.preventDefault();
        } else {
          // In IE8, the original event can be a DispCEventObj which throws an
          // exception when trying to access its properties.
          try {
            this._original.returnValue = false;
          } catch (ex) {}
        }
      };

      if (this._event.stopPropagation) {
        this._event._nativeStopPropagation = this._event.stopPropagation;
      }

      this._event.stopPropagation = function () {
        this._stopped = true;

        if (this._nativeStopPropagation) {
          this._original.stopPropagation();

          this._nativeStopPropagation();
        } else {
          this._original.cancelBubble = true;
        }
      };

      return this._event;
    },
    members: {
      _type: null,
      _event: null,

      /**
       * Creates a custom event object
       * @return {Event} event object
       */
      _createEvent: function _createEvent() {
        var evt;

        if (qx.core.Environment.get("event.customevent")) {
          evt = new window.CustomEvent(this._type);
        } else if (typeof document.createEvent == "function") {
          evt = document.createEvent("UIEvents");
        } else if (_typeof(document.createEventObject) == "object") {
          // IE8 doesn't support custom event types
          evt = {};
          evt.type = this._type;
        }

        return evt;
      },

      /**
       * Initializes a custom event
       *
       * @param domEvent {Event} Native event that will be used as a template for the new event
       * @param customProps {Map?} Map of event properties (will override the domEvent's values)
       */
      _initEvent: function _initEvent(domEvent, customProps) {
        customProps = customProps || {};
        var properties = qx.lang.Object.clone(qx.event.type.dom.Custom.PROPERTIES);

        for (var prop in customProps) {
          properties[prop] = customProps[prop];
        }

        if (this._event.initEvent) {
          this._event.initEvent(this._type, properties.bubbles, properties.cancelable);
        }

        for (var prop in properties) {
          try {
            this._event[prop] = properties[prop];
          } catch (ex) {//Nothing - strict mode prevents writing to read only properties
          }
        }
      }
    }
  });
  qx.event.type.dom.Custom.$$dbClassInfo = $$dbClassInfo;
})();

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.dom.Custom": {
        "construct": true,
        "require": true
      },
      "qx.dom.Node": {},
      "qx.bom.Viewport": {},
      "qx.bom.client.Event": {
        "require": true
      },
      "qx.bom.client.Engine": {
        "defer": "load",
        "require": true
      },
      "qx.bom.client.OperatingSystem": {
        "defer": "load",
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "event.mouseevent": {
          "className": "qx.bom.client.Event"
        },
        "event.mousecreateevent": {
          "className": "qx.bom.client.Event"
        },
        "engine.name": {
          "defer": true,
          "className": "qx.bom.client.Engine"
        },
        "os.name": {
          "defer": true,
          "className": "qx.bom.client.OperatingSystem"
        },
        "os.version": {
          "defer": true,
          "className": "qx.bom.client.OperatingSystem"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christopher Zuendorf (czuendorf)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Synthetic pointer event
   */
  qx.Bootstrap.define("qx.event.type.dom.Pointer", {
    extend: qx.event.type.dom.Custom,
    statics: {
      MOUSE_PROPERTIES: ["bubbles", "cancelable", "view", "detail", "screenX", "screenY", "clientX", "clientY", "pageX", "pageY", "ctrlKey", "altKey", "shiftKey", "metaKey", "button", "which", "relatedTarget", // IE8 properties:
      "fromElement", "toElement"],
      POINTER_PROPERTIES: {
        pointerId: 1,
        width: 0,
        height: 0,
        pressure: 0.5,
        tiltX: 0,
        tiltY: 0,
        pointerType: "",
        isPrimary: false
      },
      READONLY_PROPERTIES: [],
      BIND_METHODS: ["getPointerType", "getViewportLeft", "getViewportTop", "getDocumentLeft", "getDocumentTop", "getScreenLeft", "getScreenTop"],

      /**
       * Returns the device type which the event triggered. This can be one
       * of the following strings: <code>mouse</code>, <code>pen</code>
       * or <code>touch</code>.
       *
       * @return {String} The type of the pointer.
       */
      getPointerType: function getPointerType() {
        if (typeof this.pointerType == "string") {
          return this.pointerType;
        }

        if (typeof this.pointerType == "number") {
          if (this.pointerType == this.MSPOINTER_TYPE_MOUSE) {
            return "mouse";
          }

          if (this.pointerType == this.MSPOINTER_TYPE_PEN) {
            return "pen";
          }

          if (this.pointerType == this.MSPOINTER_TYPE_TOUCH) {
            return "touch";
          }
        }

        return "";
      },

      /**
       * Get the horizontal coordinate at which the event occurred relative
       * to the viewport.
       *
       * @return {Number} The horizontal mouse position
       */
      getViewportLeft: function getViewportLeft() {
        return this.clientX;
      },

      /**
       * Get the vertical coordinate at which the event occurred relative
       * to the viewport.
       *
       * @return {Number} The vertical mouse position
       * @signature function()
       */
      getViewportTop: function getViewportTop() {
        return this.clientY;
      },

      /**
       * Get the horizontal position at which the event occurred relative to the
       * left of the document. This property takes into account any scrolling of
       * the page.
       *
       * @return {Number} The horizontal mouse position in the document.
       */
      getDocumentLeft: function getDocumentLeft() {
        if (this.pageX !== undefined) {
          return this.pageX;
        } else {
          var win = qx.dom.Node.getWindow(this.srcElement);
          return this.clientX + qx.bom.Viewport.getScrollLeft(win);
        }
      },

      /**
       * Get the vertical position at which the event occurred relative to the
       * top of the document. This property takes into account any scrolling of
       * the page.
       *
       * @return {Number} The vertical mouse position in the document.
       */
      getDocumentTop: function getDocumentTop() {
        if (this.pageY !== undefined) {
          return this.pageY;
        } else {
          var win = qx.dom.Node.getWindow(this.srcElement);
          return this.clientY + qx.bom.Viewport.getScrollTop(win);
        }
      },

      /**
       * Get the horizontal coordinate at which the event occurred relative to
       * the origin of the screen coordinate system.
       *
       * Note: This value is usually not very useful unless you want to
       * position a native popup window at this coordinate.
       *
       * @return {Number} The horizontal mouse position on the screen.
       */
      getScreenLeft: function getScreenLeft() {
        return this.screenX;
      },

      /**
       * Get the vertical coordinate at which the event occurred relative to
       * the origin of the screen coordinate system.
       *
       * Note: This value is usually not very useful unless you want to
       * position a native popup window at this coordinate.
       *
       * @return {Number} The vertical mouse position on the screen.
       */
      getScreenTop: function getScreenTop() {
        return this.screenY;
      },

      /**
       * Manipulates the event object, adding methods if they're not
       * already present
       *
       * @param event {Event} Native event object
       */
      normalize: function normalize(event) {
        var bindMethods = qx.event.type.dom.Pointer.BIND_METHODS;

        for (var i = 0, l = bindMethods.length; i < l; i++) {
          if (typeof event[bindMethods[i]] != "function") {
            event[bindMethods[i]] = qx.event.type.dom.Pointer[bindMethods[i]].bind(event);
          }
        }
      }
    },
    construct: function construct(type, domEvent, customProps) {
      return qx.event.type.dom.Custom.constructor.call(this, type, domEvent, customProps);
    },
    members: {
      _createEvent: function _createEvent() {
        var evt;

        if (qx.core.Environment.get("event.mouseevent")) {
          evt = new window.MouseEvent(this._type);
        } else if (typeof document.createEvent == "function") {
          /* In IE9, the pageX property of synthetic MouseEvents is always 0
          and cannot be overridden, so we create a plain UIEvent and add
          the mouse event properties ourselves. */
          evt = document.createEvent(qx.core.Environment.get("event.mousecreateevent"));
        } else if (_typeof(document.createEventObject) == "object") {
          // IE8 doesn't support custom event types
          evt = {};
          evt.type = this._type;
        }

        return evt;
      },
      _initEvent: function _initEvent(domEvent, customProps) {
        customProps = customProps || {};
        var evt = this._event;
        var properties = {};
        qx.event.type.dom.Pointer.normalize(domEvent);
        Object.keys(qx.event.type.dom.Pointer.POINTER_PROPERTIES).concat(qx.event.type.dom.Pointer.MOUSE_PROPERTIES).forEach(function (propName) {
          if (typeof customProps[propName] !== "undefined") {
            properties[propName] = customProps[propName];
          } else if (typeof domEvent[propName] !== "undefined") {
            properties[propName] = domEvent[propName];
          } else if (typeof qx.event.type.dom.Pointer.POINTER_PROPERTIES[propName] !== "undefined") {
            properties[propName] = qx.event.type.dom.Pointer.POINTER_PROPERTIES[propName];
          }
        });
        var buttons;

        switch (domEvent.which) {
          case 1:
            buttons = 1;
            break;

          case 2:
            buttons = 4;
            break;

          case 3:
            buttons = 2;
            break;

          default:
            buttons = 0;
        }

        if (buttons !== undefined) {
          properties.buttons = buttons;
          properties.pressure = buttons ? 0.5 : 0;
        }

        if (evt.initMouseEvent) {
          evt.initMouseEvent(this._type, properties.bubbles, properties.cancelable, properties.view, properties.detail, properties.screenX, properties.screenY, properties.clientX, properties.clientY, properties.ctrlKey, properties.altKey, properties.shiftKey, properties.metaKey, properties.button, properties.relatedTarget);
        } else if (evt.initUIEvent) {
          evt.initUIEvent(this._type, properties.bubbles, properties.cancelable, properties.view, properties.detail);
        }

        for (var prop in properties) {
          if (evt[prop] !== properties[prop] && qx.event.type.dom.Pointer.READONLY_PROPERTIES.indexOf(prop) === -1) {
            try {
              evt[prop] = properties[prop];
            } catch (ex) {// Nothing - cannot override properties in strict mode
            }
          }
        } // normalize Windows 8 pointer types


        switch (evt.pointerType) {
          case domEvent.MSPOINTER_TYPE_MOUSE:
            evt.pointerType = "mouse";
            break;

          case domEvent.MSPOINTER_TYPE_PEN:
            evt.pointerType = "pen";
            break;

          case domEvent.MSPOINTER_TYPE_TOUCH:
            evt.pointerType = "touch";
            break;
        }

        if (evt.pointerType == "mouse") {
          evt.isPrimary = true;
        }
      }
    },
    defer: function defer(statics) {
      if (qx.core.Environment.get("engine.name") == "gecko") {
        statics.READONLY_PROPERTIES.push("buttons");
      } else if (qx.core.Environment.get("os.name") == "ios" && parseFloat(qx.core.Environment.get("os.version")) >= 8) {
        statics.READONLY_PROPERTIES = statics.READONLY_PROPERTIES.concat(statics.MOUSE_PROPERTIES);
      }
    }
  });
  qx.event.type.dom.Pointer.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.bom.client.Event": {
        "require": true,
        "construct": true
      },
      "qx.bom.client.Device": {
        "require": true,
        "construct": true
      },
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
        "construct": true,
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.bom.client.Engine": {
        "construct": true,
        "require": true
      },
      "qx.bom.client.Browser": {
        "construct": true,
        "require": true
      },
      "qx.lang.Function": {},
      "qx.dom.Node": {},
      "qx.event.Emitter": {},
      "qx.bom.Event": {},
      "qx.event.type.dom.Pointer": {},
      "qx.bom.client.OperatingSystem": {
        "require": true
      },
      "qx.lang.Array": {},
      "qx.event.Utils": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine",
          "construct": true
        },
        "browser.documentmode": {
          "load": true,
          "className": "qx.bom.client.Browser",
          "construct": true
        },
        "event.mspointer": {
          "construct": true,
          "className": "qx.bom.client.Event"
        },
        "device.touch": {
          "construct": true,
          "className": "qx.bom.client.Device"
        },
        "os.name": {
          "className": "qx.bom.client.OperatingSystem"
        },
        "event.dispatchevent": {
          "className": "qx.bom.client.Event"
        },
        "browser.name": {
          "className": "qx.bom.client.Browser"
        },
        "browser.version": {
          "className": "qx.bom.client.Browser"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christopher Zuendorf (czuendorf)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Low-level pointer event handler.
   *
   * @require(qx.bom.client.Event)
   * @require(qx.bom.client.Device)
   */
  qx.Bootstrap.define("qx.event.handler.PointerCore", {
    extend: Object,
    implement: [qx.core.IDisposable],
    statics: {
      MOUSE_TO_POINTER_MAPPING: {
        mousedown: "pointerdown",
        mouseup: "pointerup",
        mousemove: "pointermove",
        mouseout: "pointerout",
        mouseover: "pointerover"
      },
      TOUCH_TO_POINTER_MAPPING: {
        touchstart: "pointerdown",
        touchend: "pointerup",
        touchmove: "pointermove",
        touchcancel: "pointercancel"
      },
      MSPOINTER_TO_POINTER_MAPPING: {
        MSPointerDown: "pointerdown",
        MSPointerMove: "pointermove",
        MSPointerUp: "pointerup",
        MSPointerCancel: "pointercancel",
        MSPointerLeave: "pointerleave",
        MSPointerEnter: "pointerenter",
        MSPointerOver: "pointerover",
        MSPointerOut: "pointerout"
      },
      POINTER_TO_GESTURE_MAPPING: {
        pointerdown: "gesturebegin",
        pointerup: "gesturefinish",
        pointercancel: "gesturecancel",
        pointermove: "gesturemove"
      },
      LEFT_BUTTON: qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") <= 8 ? 1 : 0,
      SIM_MOUSE_DISTANCE: 25,
      SIM_MOUSE_DELAY: 2500,

      /**
       * Coordinates of the last touch. This needs to be static because the target could
       * change between touch and simulated mouse events. Touch events will be detected
       * by one instance which moves the target. The simulated mouse events will be fired with
       * a delay which causes another target and with that, another instance of this handler.
       * last touch was.
       */
      __lastTouch__P_113_0: null
    },

    /**
     * Create a new instance
     *
     * @param target {Element} element on which to listen for native touch events
     * @param emitter {qx.event.Emitter?} Event emitter (used if dispatchEvent
     * is not supported, e.g. in IE8)
     */
    construct: function construct(target, emitter) {
      this.__defaultTarget__P_113_1 = target;
      this.__emitter__P_113_2 = emitter;
      this.__eventNames__P_113_3 = [];
      this.__buttonStates__P_113_4 = [];
      this.__activeTouches__P_113_5 = [];
      this._processedFlag = "$$qx" + this.classname.substr(this.classname.lastIndexOf(".") + 1) + "Processed";
      var engineName = qx.core.Environment.get("engine.name");
      var docMode = parseInt(qx.core.Environment.get("browser.documentmode"), 10);

      if (engineName == "mshtml" && docMode == 10) {
        // listen to native prefixed events and custom unprefixed (see bug #8921)
        this.__eventNames__P_113_3 = ["MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerCancel", "MSPointerOver", "MSPointerOut", "pointerdown", "pointermove", "pointerup", "pointercancel", "pointerover", "pointerout"];

        this._initPointerObserver();
      } else {
        if (qx.core.Environment.get("event.mspointer")) {
          this.__nativePointerEvents__P_113_6 = true;
        }

        this.__eventNames__P_113_3 = ["pointerdown", "pointermove", "pointerup", "pointercancel", "pointerover", "pointerout"];

        this._initPointerObserver();
      }

      if (!qx.core.Environment.get("event.mspointer")) {
        if (qx.core.Environment.get("device.touch")) {
          this.__eventNames__P_113_3 = ["touchstart", "touchend", "touchmove", "touchcancel"];

          this._initObserver(this._onTouchEvent);
        }

        this.__eventNames__P_113_3 = ["mousedown", "mouseup", "mousemove", "mouseover", "mouseout", "contextmenu"];

        this._initObserver(this._onMouseEvent);
      }
    },
    members: {
      __defaultTarget__P_113_1: null,
      __emitter__P_113_2: null,
      __eventNames__P_113_3: null,
      __nativePointerEvents__P_113_6: false,
      __wrappedListener__P_113_7: null,
      __lastButtonState__P_113_8: 0,
      __buttonStates__P_113_4: null,
      __primaryIdentifier__P_113_9: null,
      __activeTouches__P_113_5: null,
      _processedFlag: null,

      /**
       * Adds listeners to native pointer events if supported
       */
      _initPointerObserver: function _initPointerObserver() {
        this._initObserver(this._onPointerEvent);
      },

      /**
       * Register native event listeners
       * @param callback {Function} listener callback
       * @param useEmitter {Boolean} attach listener to Emitter instead of
       * native event
       */
      _initObserver: function _initObserver(callback, useEmitter) {
        this.__wrappedListener__P_113_7 = qx.lang.Function.listener(callback, this);

        this.__eventNames__P_113_3.forEach(function (type) {
          if (useEmitter && qx.dom.Node.isDocument(this.__defaultTarget__P_113_1)) {
            if (!this.__defaultTarget__P_113_1.$$emitter) {
              this.__defaultTarget__P_113_1.$$emitter = new qx.event.Emitter();
            }

            this.__defaultTarget__P_113_1.$$emitter.on(type, this.__wrappedListener__P_113_7);
          } else {
            qx.bom.Event.addNativeListener(this.__defaultTarget__P_113_1, type, this.__wrappedListener__P_113_7);
          }
        }.bind(this));
      },

      /**
       * Handler for native pointer events
       * @param domEvent {Event}  Native DOM event
       */
      _onPointerEvent: function _onPointerEvent(domEvent) {
        if (!qx.core.Environment.get("event.mspointer") || // workaround for bug #8533
        qx.core.Environment.get("browser.documentmode") === 10 && domEvent.type.toLowerCase().indexOf("ms") == -1) {
          return;
        }

        if (!this.__nativePointerEvents__P_113_6) {
          domEvent.stopPropagation();
        }

        var type = qx.event.handler.PointerCore.MSPOINTER_TO_POINTER_MAPPING[domEvent.type] || domEvent.type;
        var target = qx.bom.Event.getTarget(domEvent);
        var evt = new qx.event.type.dom.Pointer(type, domEvent);

        this._fireEvent(evt, type, target);
      },

      /**
       * Handler for touch events
       * @param domEvent {Event} Native DOM event
       */
      _onTouchEvent: function _onTouchEvent(domEvent) {
        if (domEvent[this._processedFlag]) {
          return;
        }

        domEvent[this._processedFlag] = true;
        var type = qx.event.handler.PointerCore.TOUCH_TO_POINTER_MAPPING[domEvent.type];
        var changedTouches = domEvent.changedTouches;

        this._determineActiveTouches(domEvent.type, changedTouches); // Detecting vacuum touches. (Touches which are not active anymore, but did not fire a touchcancel event)


        if (domEvent.touches.length < this.__activeTouches__P_113_5.length) {
          // Firing pointer cancel for previously active touches.
          for (var i = this.__activeTouches__P_113_5.length - 1; i >= 0; i--) {
            var cancelEvent = new qx.event.type.dom.Pointer("pointercancel", domEvent, {
              identifier: this.__activeTouches__P_113_5[i].identifier,
              target: domEvent.target,
              pointerType: "touch",
              pointerId: this.__activeTouches__P_113_5[i].identifier + 2
            });

            this._fireEvent(cancelEvent, "pointercancel", domEvent.target);
          } // Reset primary identifier


          this.__primaryIdentifier__P_113_9 = null; // cleanup of active touches array.

          this.__activeTouches__P_113_5 = []; // Do nothing after pointer cancel.

          return;
        }

        if (domEvent.type == "touchstart" && this.__primaryIdentifier__P_113_9 === null) {
          this.__primaryIdentifier__P_113_9 = changedTouches[0].identifier;
        }

        for (var i = 0, l = changedTouches.length; i < l; i++) {
          var touch = changedTouches[i];
          var touchTarget = domEvent.view.document.elementFromPoint(touch.clientX, touch.clientY) || domEvent.target;
          var touchProps = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            pageX: touch.pageX,
            pageY: touch.pageY,
            identifier: touch.identifier,
            screenX: touch.screenX,
            screenY: touch.screenY,
            target: touchTarget,
            pointerType: "touch",
            pointerId: touch.identifier + 2
          };

          if (domEvent.type == "touchstart") {
            // Fire pointerenter before pointerdown
            var overEvt = new qx.event.type.dom.Pointer("pointerover", domEvent, touchProps);

            this._fireEvent(overEvt, "pointerover", touchProps.target);
          }

          if (touch.identifier == this.__primaryIdentifier__P_113_9) {
            touchProps.isPrimary = true; // always simulate left click on touch interactions for primary pointer

            touchProps.button = 0;
            touchProps.buttons = 1;
            qx.event.handler.PointerCore.__lastTouch__P_113_0 = {
              x: touch.clientX,
              y: touch.clientY,
              time: new Date().getTime()
            };
          }

          var evt = new qx.event.type.dom.Pointer(type, domEvent, touchProps);

          this._fireEvent(evt, type, touchProps.target);

          if (domEvent.type == "touchend" || domEvent.type == "touchcancel") {
            // Fire pointerout after pointerup
            var outEvt = new qx.event.type.dom.Pointer("pointerout", domEvent, touchProps); // fire on the original target to make sure over / out event are on the same target

            this._fireEvent(outEvt, "pointerout", domEvent.target);

            if (this.__primaryIdentifier__P_113_9 == touch.identifier) {
              this.__primaryIdentifier__P_113_9 = null;
            }
          }
        }
      },

      /**
       * Handler for touch events
       * @param domEvent {Event} Native DOM event
       */
      _onMouseEvent: function _onMouseEvent(domEvent) {
        if (domEvent[this._processedFlag]) {
          return;
        }

        domEvent[this._processedFlag] = true;

        if (this._isSimulatedMouseEvent(domEvent.clientX, domEvent.clientY)) {
          /*
            Simulated MouseEvents are fired by browsers directly after TouchEvents
            for improving compatibility. They should not trigger PointerEvents.
          */
          return;
        }

        if (domEvent.type == "mousedown") {
          this.__buttonStates__P_113_4[domEvent.which] = 1;
        } else if (domEvent.type == "mouseup") {
          if (qx.core.Environment.get("os.name") == "osx" && qx.core.Environment.get("engine.name") == "gecko") {
            if (this.__buttonStates__P_113_4[domEvent.which] != 1 && domEvent.ctrlKey) {
              this.__buttonStates__P_113_4[1] = 0;
            }
          }

          this.__buttonStates__P_113_4[domEvent.which] = 0;
        }

        var type = qx.event.handler.PointerCore.MOUSE_TO_POINTER_MAPPING[domEvent.type];
        var target = qx.bom.Event.getTarget(domEvent);
        var buttonsPressed = qx.lang.Array.sum(this.__buttonStates__P_113_4);
        var mouseProps = {
          pointerType: "mouse",
          pointerId: 1
        }; // if the button state changes but not from or to zero

        if (this.__lastButtonState__P_113_8 != buttonsPressed && buttonsPressed !== 0 && this.__lastButtonState__P_113_8 !== 0) {
          var moveEvt = new qx.event.type.dom.Pointer("pointermove", domEvent, mouseProps);

          this._fireEvent(moveEvt, "pointermove", target);
        }

        this.__lastButtonState__P_113_8 = buttonsPressed; // pointerdown should only trigger form the first pressed button.

        if (domEvent.type == "mousedown" && buttonsPressed > 1) {
          return;
        } // pointerup should only trigger if user releases all buttons.


        if (domEvent.type == "mouseup" && buttonsPressed > 0) {
          return;
        }

        if (domEvent.type == "contextmenu") {
          this.__buttonStates__P_113_4[domEvent.which] = 0;
          return;
        }

        var evt = new qx.event.type.dom.Pointer(type, domEvent, mouseProps);

        this._fireEvent(evt, type, target);
      },

      /**
       * Determines the current active touches.
       * @param type {String} the DOM event type.
       * @param changedTouches {Array} the current changed touches.
       */
      _determineActiveTouches: function _determineActiveTouches(type, changedTouches) {
        if (type == "touchstart") {
          for (var i = 0; i < changedTouches.length; i++) {
            this.__activeTouches__P_113_5.push(changedTouches[i]);
          }
        } else if (type == "touchend" || type == "touchcancel") {
          var updatedActiveTouches = [];

          for (var i = 0; i < this.__activeTouches__P_113_5.length; i++) {
            var add = true;

            for (var j = 0; j < changedTouches.length; j++) {
              if (this.__activeTouches__P_113_5[i].identifier == changedTouches[j].identifier) {
                add = false;
                break;
              }
            }

            if (add) {
              updatedActiveTouches.push(this.__activeTouches__P_113_5[i]);
            }
          }

          this.__activeTouches__P_113_5 = updatedActiveTouches;
        }
      },

      /**
       * Detects whether the given MouseEvent position is identical to the previously fired TouchEvent position.
       * If <code>true</code> the corresponding event can be identified as simulated.
       * @param x {Integer} current mouse x
       * @param y {Integer} current mouse y
       * @return {Boolean} <code>true</code> if passed mouse position is a synthetic MouseEvent.
       */
      _isSimulatedMouseEvent: function _isSimulatedMouseEvent(x, y) {
        var touch = qx.event.handler.PointerCore.__lastTouch__P_113_0;

        if (touch) {
          var timeSinceTouch = new Date().getTime() - touch.time;
          var dist = qx.event.handler.PointerCore.SIM_MOUSE_DISTANCE;
          var distX = Math.abs(x - qx.event.handler.PointerCore.__lastTouch__P_113_0.x);
          var distY = Math.abs(y - qx.event.handler.PointerCore.__lastTouch__P_113_0.y);

          if (timeSinceTouch < qx.event.handler.PointerCore.SIM_MOUSE_DELAY) {
            if (distX < dist || distY < dist) {
              return true;
            }
          }
        }

        return false;
      },

      /**
       * Removes native pointer event listeners.
       */
      _stopObserver: function _stopObserver() {
        for (var i = 0; i < this.__eventNames__P_113_3.length; i++) {
          qx.bom.Event.removeNativeListener(this.__defaultTarget__P_113_1, this.__eventNames__P_113_3[i], this.__wrappedListener__P_113_7);
        }
      },

      /**
       * Fire a touch event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param type {String ? null} type of the event
       * @param target {Element ? null} event target
       * @return {qx.Promise?} a promise, if one was returned by event handlers
       */
      _fireEvent: function _fireEvent(domEvent, type, target) {
        target = target || domEvent.target;
        type = type || domEvent.type;
        var gestureEvent;

        if ((domEvent.pointerType !== "mouse" || domEvent.button <= qx.event.handler.PointerCore.LEFT_BUTTON) && (type == "pointerdown" || type == "pointerup" || type == "pointermove")) {
          gestureEvent = new qx.event.type.dom.Pointer(qx.event.handler.PointerCore.POINTER_TO_GESTURE_MAPPING[type], domEvent);
          qx.event.type.dom.Pointer.normalize(gestureEvent);

          try {
            gestureEvent.srcElement = target;
          } catch (ex) {// Nothing - strict mode prevents writing to read only properties
          }
        }

        if (qx.core.Environment.get("event.dispatchevent")) {
          var tracker = {};

          if (!this.__nativePointerEvents__P_113_6) {
            qx.event.Utils.then(tracker, function () {
              return target.dispatchEvent(domEvent);
            });
          }

          if (gestureEvent) {
            qx.event.Utils.then(tracker, function () {
              return target.dispatchEvent(gestureEvent);
            });
          }

          return tracker.promise;
        } else {
          if (qx.core.Environment.get("browser.name") === "msie" && qx.core.Environment.get("browser.version") < 9) {
            // ensure compatibility with native events for IE8
            try {
              domEvent.srcElement = target;
            } catch (ex) {// Nothing - strict mode prevents writing to read only properties
            }
          }

          while (target) {
            if (target.$$emitter) {
              domEvent.currentTarget = target;

              if (!domEvent._stopped) {
                target.$$emitter.emit(type, domEvent);
              }

              if (gestureEvent && !gestureEvent._stopped) {
                gestureEvent.currentTarget = target;
                target.$$emitter.emit(gestureEvent.type, gestureEvent);
              }
            }

            target = target.parentNode;
          }
        }
      },

      /**
       * Dispose this object
       */
      dispose: function dispose() {
        this._stopObserver();

        this.__defaultTarget__P_113_1 = this.__emitter__P_113_2 = null;
      }
    }
  });
  qx.event.handler.PointerCore.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.dispatch.DomBubbling": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.type.Pointer": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.type.dom.Pointer": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.handler.PointerCore": {
        "construct": true,
        "require": true
      },
      "qx.event.IEventHandler": {
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.bom.Event": {},
      "qx.event.Utils": {},
      "qx.event.type.Data": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "className": "qx.bom.client.Browser"
        },
        "browser.name": {
          "className": "qx.bom.client.Browser"
        },
        "browser.version": {
          "className": "qx.bom.client.Browser"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christopher Zuendorf (czuendorf)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Unified pointer event handler.
   * @require(qx.event.dispatch.DomBubbling)
   * @require(qx.event.type.Pointer) // load-time dependency for early native events
   * @require(qx.event.type.dom.Pointer)
   */
  qx.Class.define("qx.event.handler.Pointer", {
    extend: qx.event.handler.PointerCore,
    implement: [qx.event.IEventHandler, qx.core.IDisposable],
    statics: {
      /** @type {Integer} Priority of this handler */
      PRIORITY: qx.event.Registration.PRIORITY_NORMAL,

      /** @type {Map} Supported event types */
      SUPPORTED_TYPES: {
        pointermove: 1,
        pointerover: 1,
        pointerout: 1,
        pointerdown: 1,
        pointerup: 1,
        pointercancel: 1,
        gesturebegin: 1,
        gesturemove: 1,
        gesturefinish: 1,
        gesturecancel: 1
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE + qx.event.IEventHandler.TARGET_DOCUMENT,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true
    },

    /**
     * Create a new instance
     *
     * @param manager {qx.event.Manager} Event manager for the window to use
     */
    construct: function construct(manager) {
      // Define shorthands
      this.__manager__P_58_0 = manager;
      this.__window__P_58_1 = manager.getWindow();
      this.__root__P_58_2 = this.__window__P_58_1.document;
      qx.event.handler.PointerCore.apply(this, [this.__root__P_58_2]);
    },
    members: {
      __manager__P_58_0: null,
      __window__P_58_1: null,
      __root__P_58_2: null,
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {},
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {// Nothing needs to be done here
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {// Nothing needs to be done here
      },
      // overridden
      _initPointerObserver: function _initPointerObserver() {
        var useEmitter = false;

        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9) {
          // Workaround for bug #8293: Use an emitter to listen to the
          // pointer events fired by a pointer handler attached by qxWeb.
          useEmitter = true;
        }

        this._initObserver(this._onPointerEvent, useEmitter);
      },

      /**
       * Fire a pointer event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param type {String ? null} type of the event
       * @param target {Element ? null} event target
       */
      _fireEvent: function _fireEvent(domEvent, type, target) {
        if (!target) {
          target = qx.bom.Event.getTarget(domEvent);
        } // respect anonymous elements


        while (target && target.getAttribute && target.getAttribute("qxanonymous")) {
          target = target.parentNode;
        }

        if (!type) {
          type = domEvent.type;
        }

        type = qx.event.handler.PointerCore.MSPOINTER_TO_POINTER_MAPPING[type] || type;

        if (target && target.nodeType) {
          qx.event.type.dom.Pointer.normalize(domEvent);

          if (qx.core.Environment.get("browser.name") === "msie" && qx.core.Environment.get("browser.version") < 9) {
            // ensure compatibility with native events for IE8
            try {
              domEvent.srcElement = target;
            } catch (ex) {// Nothing - cannot change properties in strict mode
            }
          }

          var tracker = {};
          var self = this;
          qx.event.Utils.track(tracker, function () {
            return qx.event.Registration.fireEvent(target, type, qx.event.type.Pointer, [domEvent, target, null, true, true]);
          });
          qx.event.Utils.then(tracker, function () {
            if ((domEvent.getPointerType() !== "mouse" || domEvent.button <= qx.event.handler.PointerCore.LEFT_BUTTON) && (type == "pointerdown" || type == "pointerup" || type == "pointermove" || type == "pointercancel")) {
              return qx.event.Registration.fireEvent(self.__root__P_58_2, qx.event.handler.PointerCore.POINTER_TO_GESTURE_MAPPING[type], qx.event.type.Pointer, [domEvent, target, null, false, false]);
            }
          });
          qx.event.Utils.then(tracker, function () {
            // Fire user action event
            return qx.event.Registration.fireEvent(self.__window__P_58_1, "useraction", qx.event.type.Data, [type]);
          });
          return tracker.promise;
        }
      },
      // overridden
      _onPointerEvent: function _onPointerEvent(domEvent) {
        if (domEvent._original && domEvent._original[this._processedFlag]) {
          return;
        }

        var type = qx.event.handler.PointerCore.MSPOINTER_TO_POINTER_MAPPING[domEvent.type] || domEvent.type;
        return this._fireEvent(domEvent, type, qx.bom.Event.getTarget(domEvent));
      },

      /**
       * Dispose this object
       */
      dispose: function dispose() {
        this.__callBase__P_58_3("dispose");

        this.__manager__P_58_0 = this.__window__P_58_1 = this.__root__P_58_2 = null;
      },

      /**
       * Call overridden method.
       *
       * @param method {String} Name of the overridden method.
       * @param args {Array} Arguments.
       */
      __callBase__P_58_3: function __callBase__P_58_3(method, args) {
        qx.event.handler.PointerCore.prototype[method].apply(this, args || []);
      }
    },
    defer: function defer(statics) {
      qx.event.Registration.addHandler(statics);
      qx.event.Registration.getManager(document).getHandler(statics);
    }
  });
  qx.event.handler.Pointer.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.bom.client.Device": {
        "require": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.bom.client.Event": {
        "require": true
      },
      "qx.bom.Event": {},
      "qx.bom.AnimationFrame": {},
      "qx.lang.Function": {},
      "qx.event.type.dom.Custom": {},
      "qx.util.Wheel": {},
      "qx.bom.client.OperatingSystem": {
        "require": true
      },
      "qx.event.Timer": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "device.touch": {
          "load": true,
          "className": "qx.bom.client.Device"
        },
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "className": "qx.bom.client.Browser"
        },
        "event.mousewheel": {
          "className": "qx.bom.client.Event"
        },
        "event.dispatchevent": {
          "className": "qx.bom.client.Event"
        },
        "os.name": {
          "className": "qx.bom.client.OperatingSystem"
        },
        "os.version": {
          "className": "qx.bom.client.OperatingSystem"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christopher Zuendorf (czuendorf)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Listens for (native or synthetic) pointer events and fires events
   * for gestures like "tap" or "swipe"
   */
  qx.Bootstrap.define("qx.event.handler.GestureCore", {
    extend: Object,
    implement: [qx.core.IDisposable],
    statics: {
      TYPES: ["tap", "swipe", "longtap", "dbltap", "track", "trackstart", "trackend", "rotate", "pinch", "roll"],
      GESTURE_EVENTS: ["gesturebegin", "gesturefinish", "gesturemove", "gesturecancel"],

      /** @type {Map} Maximum distance between a pointer-down and pointer-up event, values are configurable */
      TAP_MAX_DISTANCE: {
        touch: 40,
        mouse: 5,
        pen: 20
      },
      // values are educated guesses

      /** @type {Map} Maximum distance between two subsequent taps, values are configurable */
      DOUBLETAP_MAX_DISTANCE: {
        touch: 10,
        mouse: 4,
        pen: 10
      },
      // values are educated guesses

      /** @type {Map} The direction of a swipe relative to the axis */
      SWIPE_DIRECTION: {
        x: ["left", "right"],
        y: ["up", "down"]
      },

      /**
       * @type {Integer} The time delta in milliseconds to fire a long tap event.
       */
      LONGTAP_TIME: qx.core.Environment.get("device.touch") ? 500 : 99999,

      /**
       * @type {Integer} Maximum time between two tap events that will still trigger a
       * dbltap event.
       */
      DOUBLETAP_TIME: 500,

      /**
       * @type {Integer} Factor which is used for adapting the delta of the mouse wheel
       * event to the roll events,
       */
      ROLL_FACTOR: 18,

      /**
       * @type {Integer} Factor which is used for adapting the delta of the touchpad gesture
       * event to the roll events,
       */
      TOUCHPAD_ROLL_FACTOR: 1,

      /**
       * @type {Integer} Minimum number of wheel events to receive during the
       * TOUCHPAD_WHEEL_EVENTS_PERIOD to detect a touchpad.
       */
      TOUCHPAD_WHEEL_EVENTS_THRESHOLD: 10,

      /**
       * @type {Integer} Period (in ms) during which the wheel events are counted in order
       * to detect a touchpad.
       */
      TOUCHPAD_WHEEL_EVENTS_PERIOD: 100,

      /**
       * @type {Integer} Timeout (in ms) after which the touchpad detection is reset if no wheel
       * events are received in the meantime.
       */
      TOUCHPAD_WHEEL_EVENTS_TIMEOUT: 5000
    },

    /**
     * @param target {Element} DOM Element that should fire gesture events
     * @param emitter {qx.event.Emitter?} Event emitter (used if dispatchEvent
     * is not supported, e.g. in IE8)
     */
    construct: function construct(target, emitter) {
      this.__defaultTarget__P_59_0 = target;
      this.__emitter__P_59_1 = emitter;
      this.__gesture__P_59_2 = {};
      this.__lastTap__P_59_3 = {};
      this.__stopMomentum__P_59_4 = {};
      this.__momentum__P_59_5 = {};
      this.__rollEvents__P_59_6 = [];

      this._initObserver();
    },
    members: {
      __defaultTarget__P_59_0: null,
      __emitter__P_59_1: null,
      __gesture__P_59_2: null,
      __eventName__P_59_7: null,
      __primaryTarget__P_59_8: null,
      __isMultiPointerGesture__P_59_9: null,
      __initialAngle__P_59_10: null,
      __lastTap__P_59_3: null,
      __rollImpulseId__P_59_11: null,
      __stopMomentum__P_59_4: null,
      __initialDistance__P_59_12: null,
      __momentum__P_59_5: null,
      __rollEvents__P_59_6: null,
      __rollEventsCountStart__P_59_13: 0,
      __rollEventsCount__P_59_14: 0,
      __touchPadDetectionPerformed__P_59_15: false,
      __lastRollEventTime__P_59_16: 0,

      /**
       * Register pointer event listeners
       */
      _initObserver: function _initObserver() {
        qx.event.handler.GestureCore.GESTURE_EVENTS.forEach(function (gestureType) {
          qxWeb(this.__defaultTarget__P_59_0).on(gestureType, this.checkAndFireGesture, this);
        }.bind(this));

        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9) {
          qxWeb(this.__defaultTarget__P_59_0).on("dblclick", this._onDblClick, this);
        } // list to wheel events


        var data = qx.core.Environment.get("event.mousewheel");
        qxWeb(data.target).on(data.type, this._fireRoll, this);
      },

      /**
       * Remove native pointer event listeners.
       */
      _stopObserver: function _stopObserver() {
        qx.event.handler.GestureCore.GESTURE_EVENTS.forEach(function (pointerType) {
          qxWeb(this.__defaultTarget__P_59_0).off(pointerType, this.checkAndFireGesture, this);
        }.bind(this));

        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9) {
          qxWeb(this.__defaultTarget__P_59_0).off("dblclick", this._onDblClick, this);
        }

        var data = qx.core.Environment.get("event.mousewheel");
        qxWeb(data.target).off(data.type, this._fireRoll, this);
      },

      /**
       * Checks if a gesture was made and fires the gesture event.
       *
       * @param domEvent {qx.event.type.Pointer} DOM event
       * @param type {String ? null} type of the event
       * @param target {Element ? null} event target
       */
      checkAndFireGesture: function checkAndFireGesture(domEvent, type, target) {
        if (!type) {
          type = domEvent.type;
        }

        if (!target) {
          target = qx.bom.Event.getTarget(domEvent);
        }

        if (type == "gesturebegin") {
          this.gestureBegin(domEvent, target);
        } else if (type == "gesturemove") {
          this.gestureMove(domEvent, target);
        } else if (type == "gesturefinish") {
          this.gestureFinish(domEvent, target);
        } else if (type == "gesturecancel") {
          this.gestureCancel(domEvent.pointerId);
        }
      },

      /**
       * Helper method for gesture start.
       *
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       */
      gestureBegin: function gestureBegin(domEvent, target) {
        if (this.__gesture__P_59_2[domEvent.pointerId]) {
          this.__stopLongTapTimer__P_59_17(this.__gesture__P_59_2[domEvent.pointerId]);

          delete this.__gesture__P_59_2[domEvent.pointerId];
        }
        /*
          If the dom event's target or one of its ancestors have
          a gesture handler, we don't need to fire the gesture again
          since it bubbles.
         */


        if (this._hasIntermediaryHandler(target)) {
          return;
        }

        this.__gesture__P_59_2[domEvent.pointerId] = {
          startTime: new Date().getTime(),
          lastEventTime: new Date().getTime(),
          startX: domEvent.clientX,
          startY: domEvent.clientY,
          clientX: domEvent.clientX,
          clientY: domEvent.clientY,
          velocityX: 0,
          velocityY: 0,
          target: target,
          isTap: true,
          isPrimary: domEvent.isPrimary,
          longTapTimer: window.setTimeout(this.__fireLongTap__P_59_18.bind(this, domEvent, target), qx.event.handler.GestureCore.LONGTAP_TIME)
        };

        if (domEvent.isPrimary) {
          this.__isMultiPointerGesture__P_59_9 = false;
          this.__primaryTarget__P_59_8 = target;

          this.__fireTrack__P_59_19("trackstart", domEvent, target);
        } else {
          this.__isMultiPointerGesture__P_59_9 = true;

          if (Object.keys(this.__gesture__P_59_2).length === 2) {
            this.__initialAngle__P_59_10 = this._calcAngle();
            this.__initialDistance__P_59_12 = this._calcDistance();
          }
        }
      },

      /**
       * Helper method for gesture move.
       *
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       */
      gestureMove: function gestureMove(domEvent, target) {
        var gesture = this.__gesture__P_59_2[domEvent.pointerId];

        if (gesture) {
          var oldClientX = gesture.clientX;
          var oldClientY = gesture.clientY;
          gesture.clientX = domEvent.clientX;
          gesture.clientY = domEvent.clientY;
          gesture.lastEventTime = new Date().getTime();

          if (oldClientX) {
            gesture.velocityX = gesture.clientX - oldClientX;
          }

          if (oldClientY) {
            gesture.velocityY = gesture.clientY - oldClientY;
          }

          if (Object.keys(this.__gesture__P_59_2).length === 2) {
            this.__fireRotate__P_59_20(domEvent, gesture.target);

            this.__firePinch__P_59_21(domEvent, gesture.target);
          }

          if (!this.__isMultiPointerGesture__P_59_9) {
            this.__fireTrack__P_59_19("track", domEvent, gesture.target);

            this._fireRoll(domEvent, "touch", gesture.target);
          } // abort long tap timer if the distance is too big


          if (gesture.isTap) {
            gesture.isTap = this._isBelowTapMaxDistance(domEvent);

            if (!gesture.isTap) {
              this.__stopLongTapTimer__P_59_17(gesture);
            }
          }
        }
      },

      /**
       * Checks if a DOM element located between the target of a gesture
       * event and the element this handler is attached to has a gesture
       * handler of its own.
       *
       * @param target {Element} The gesture event's target
       * @return {Boolean}
       */
      _hasIntermediaryHandler: function _hasIntermediaryHandler(target) {
        while (target && target !== this.__defaultTarget__P_59_0) {
          if (target.$$gestureHandler) {
            return true;
          }

          target = target.parentNode;
        }

        return false;
      },

      /**
       * Helper method for gesture end.
       *
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       */
      gestureFinish: function gestureFinish(domEvent, target) {
        // If no start position is available for this pointerup event, cancel gesture recognition.
        if (!this.__gesture__P_59_2[domEvent.pointerId]) {
          return;
        }

        var gesture = this.__gesture__P_59_2[domEvent.pointerId]; // delete the long tap

        this.__stopLongTapTimer__P_59_17(gesture);
        /*
          If the dom event's target or one of its ancestors have
          a gesture handler, we don't need to fire the gesture again
          since it bubbles.
         */


        if (this._hasIntermediaryHandler(target)) {
          return;
        } // always start the roll impulse on the original target


        this.__handleRollImpulse__P_59_22(gesture.velocityX, gesture.velocityY, domEvent, gesture.target);

        this.__fireTrack__P_59_19("trackend", domEvent, gesture.target);

        if (gesture.isTap) {
          if (target !== gesture.target) {
            delete this.__gesture__P_59_2[domEvent.pointerId];
            return;
          }

          this._fireEvent(domEvent, "tap", domEvent.target || target);

          var isDblTap = false;

          if (Object.keys(this.__lastTap__P_59_3).length > 0) {
            // delete old tap entries
            var limit = Date.now() - qx.event.handler.GestureCore.DOUBLETAP_TIME;

            for (var time in this.__lastTap__P_59_3) {
              if (time < limit) {
                delete this.__lastTap__P_59_3[time];
              } else {
                var lastTap = this.__lastTap__P_59_3[time];

                var isBelowDoubleTapDistance = this.__isBelowDoubleTapDistance__P_59_23(lastTap.x, lastTap.y, domEvent.clientX, domEvent.clientY, domEvent.getPointerType());

                var isSameTarget = lastTap.target === (domEvent.target || target);
                var isSameButton = lastTap.button === domEvent.button;

                if (isBelowDoubleTapDistance && isSameButton && isSameTarget) {
                  isDblTap = true;
                  delete this.__lastTap__P_59_3[time];

                  this._fireEvent(domEvent, "dbltap", domEvent.target || target);
                }
              }
            }
          }

          if (!isDblTap) {
            this.__lastTap__P_59_3[Date.now()] = {
              x: domEvent.clientX,
              y: domEvent.clientY,
              target: domEvent.target || target,
              button: domEvent.button
            };
          }
        } else if (!this._isBelowTapMaxDistance(domEvent)) {
          var swipe = this.__getSwipeGesture__P_59_24(domEvent, target);

          if (swipe) {
            domEvent.swipe = swipe;

            this._fireEvent(domEvent, "swipe", gesture.target || target);
          }
        }

        delete this.__gesture__P_59_2[domEvent.pointerId];
      },

      /**
       * Stops the momentum scrolling currently running.
       *
       * @param id {Integer} The timeoutId of a 'roll' event
       */
      stopMomentum: function stopMomentum(id) {
        this.__stopMomentum__P_59_4[id] = true;
      },

      /**
       * Cancels the gesture if running.
       * @param id {Number} The pointer Id.
       */
      gestureCancel: function gestureCancel(id) {
        if (this.__gesture__P_59_2[id]) {
          this.__stopLongTapTimer__P_59_17(this.__gesture__P_59_2[id]);

          delete this.__gesture__P_59_2[id];
        }

        if (this.__momentum__P_59_5[id]) {
          this.stopMomentum(this.__momentum__P_59_5[id]);
          delete this.__momentum__P_59_5[id];
        }
      },

      /**
       * Update the target of a running gesture. This is used in virtual widgets
       * when the DOM element changes.
       *
       * @param id {String} The pointer id.
       * @param target {Element} The new target element.
       * @internal
       */
      updateGestureTarget: function updateGestureTarget(id, target) {
        this.__gesture__P_59_2[id].target = target;
      },

      /**
       * Method which will be called recursively to provide a momentum scrolling.
       * @param deltaX {Number} The last offset in X direction
       * @param deltaY {Number} The last offset in Y direction
       * @param domEvent {Event} The original gesture event
       * @param target {Element} The target of the momentum roll events
       * @param time {Number ?} The time in ms between the last two calls
       */
      __handleRollImpulse__P_59_22: function __handleRollImpulse__P_59_22(deltaX, deltaY, domEvent, target, time) {
        var oldTimeoutId = domEvent.timeoutId;

        if (!time && this.__momentum__P_59_5[domEvent.pointerId]) {
          // new roll impulse started, stop the old one
          this.stopMomentum(this.__momentum__P_59_5[domEvent.pointerId]);
        } // do nothing if we don't need to scroll


        if (Math.abs(deltaY) < 1 && Math.abs(deltaX) < 1 || this.__stopMomentum__P_59_4[oldTimeoutId] || !this.getWindow()) {
          delete this.__stopMomentum__P_59_4[oldTimeoutId];
          delete this.__momentum__P_59_5[domEvent.pointerId];
          return;
        }

        if (!time) {
          time = 1;
          var startFactor = 2.8;
          deltaY = deltaY / startFactor;
          deltaX = deltaX / startFactor;
        }

        time += 0.0006;
        deltaY = deltaY / time;
        deltaX = deltaX / time; // set up a new timer with the new delta

        var timeoutId = qx.bom.AnimationFrame.request(qx.lang.Function.bind(function (deltaX, deltaY, domEvent, target, time) {
          this.__handleRollImpulse__P_59_22(deltaX, deltaY, domEvent, target, time);
        }, this, deltaX, deltaY, domEvent, target, time));
        deltaX = Math.round(deltaX * 100) / 100;
        deltaY = Math.round(deltaY * 100) / 100; // scroll the desired new delta

        domEvent.delta = {
          x: -deltaX,
          y: -deltaY
        };
        domEvent.momentum = true;
        domEvent.timeoutId = timeoutId;
        this.__momentum__P_59_5[domEvent.pointerId] = timeoutId;

        this._fireEvent(domEvent, "roll", domEvent.target || target);
      },

      /**
       * Calculates the angle of the primary and secondary pointer.
       * @return {Number} the rotation angle of the 2 pointers.
       */
      _calcAngle: function _calcAngle() {
        var pointerA = null;
        var pointerB = null;

        for (var pointerId in this.__gesture__P_59_2) {
          var gesture = this.__gesture__P_59_2[pointerId];

          if (pointerA === null) {
            pointerA = gesture;
          } else {
            pointerB = gesture;
          }
        }

        var x = pointerA.clientX - pointerB.clientX;
        var y = pointerA.clientY - pointerB.clientY;
        return (360 + Math.atan2(y, x) * (180 / Math.PI)) % 360;
      },

      /**
       * Calculates the scaling distance between two pointers.
       * @return {Number} the calculated distance.
       */
      _calcDistance: function _calcDistance() {
        var pointerA = null;
        var pointerB = null;

        for (var pointerId in this.__gesture__P_59_2) {
          var gesture = this.__gesture__P_59_2[pointerId];

          if (pointerA === null) {
            pointerA = gesture;
          } else {
            pointerB = gesture;
          }
        }

        var scale = Math.sqrt(Math.pow(pointerA.clientX - pointerB.clientX, 2) + Math.pow(pointerA.clientY - pointerB.clientY, 2));
        return scale;
      },

      /**
       * Checks if the distance between the x/y coordinates of DOM event
       * exceeds TAP_MAX_DISTANCE and returns the result.
       *
       * @param domEvent {Event} The DOM event from the browser.
       * @return {Boolean|null} true if distance is below TAP_MAX_DISTANCE.
       */
      _isBelowTapMaxDistance: function _isBelowTapMaxDistance(domEvent) {
        var delta = this._getDeltaCoordinates(domEvent);

        var maxDistance = qx.event.handler.GestureCore.TAP_MAX_DISTANCE[domEvent.getPointerType()];

        if (!delta) {
          return null;
        }

        return Math.abs(delta.x) <= maxDistance && Math.abs(delta.y) <= maxDistance;
      },

      /**
       * Checks if the distance between the x1/y1 and x2/y2 is
       * below the TAP_MAX_DISTANCE and returns the result.
       *
       * @param x1 {Number} The x position of point one.
       * @param y1 {Number} The y position of point one.
       * @param x2 {Number} The x position of point two.
       * @param y2 {Number} The y position of point two.
       * @param type {String} The pointer type e.g. "mouse"
       * @return {Boolean} <code>true</code>, if points are in range
       */
      __isBelowDoubleTapDistance__P_59_23: function __isBelowDoubleTapDistance__P_59_23(x1, y1, x2, y2, type) {
        var clazz = qx.event.handler.GestureCore;
        var inX = Math.abs(x1 - x2) < clazz.DOUBLETAP_MAX_DISTANCE[type];
        var inY = Math.abs(y1 - y2) < clazz.DOUBLETAP_MAX_DISTANCE[type];
        return inX && inY;
      },

      /**
       * Calculates the delta coordinates in relation to the position on <code>pointerstart</code> event.
       * @param domEvent {Event} The DOM event from the browser.
       * @return {Map} containing the deltaX as x, and deltaY as y.
       */
      _getDeltaCoordinates: function _getDeltaCoordinates(domEvent) {
        var gesture = this.__gesture__P_59_2[domEvent.pointerId];

        if (!gesture) {
          return null;
        }

        var deltaX = domEvent.clientX - gesture.startX;
        var deltaY = domEvent.clientY - gesture.startY;
        var axis = "x";

        if (Math.abs(deltaX / deltaY) < 1) {
          axis = "y";
        }

        return {
          x: deltaX,
          y: deltaY,
          axis: axis
        };
      },

      /**
       * Fire a gesture event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param type {String} type of the event
       * @param target {Element ? null} event target
       * @return {qx.Promise?} a promise, if one or more of the event handlers returned a promise
       */
      _fireEvent: function _fireEvent(domEvent, type, target) {
        // The target may have been removed, e.g. menu hide on tap
        if (!this.__defaultTarget__P_59_0) {
          return;
        }

        var evt;

        if (qx.core.Environment.get("event.dispatchevent")) {
          evt = new qx.event.type.dom.Custom(type, domEvent, {
            bubbles: true,
            swipe: domEvent.swipe,
            scale: domEvent.scale,
            angle: domEvent.angle,
            delta: domEvent.delta,
            pointerType: domEvent.pointerType,
            momentum: domEvent.momentum
          });
          return target.dispatchEvent(evt);
        } else if (this.__emitter__P_59_1) {
          evt = new qx.event.type.dom.Custom(type, domEvent, {
            target: this.__defaultTarget__P_59_0,
            currentTarget: this.__defaultTarget__P_59_0,
            srcElement: this.__defaultTarget__P_59_0,
            swipe: domEvent.swipe,
            scale: domEvent.scale,
            angle: domEvent.angle,
            delta: domEvent.delta,
            pointerType: domEvent.pointerType,
            momentum: domEvent.momentum
          });

          this.__emitter__P_59_1.emit(type, domEvent);
        }
      },

      /**
       * Fire "tap" and "dbltap" events after a native "dblclick"
       * event to fix IE 8's broken mouse event sequence.
       *
       * @param domEvent {Event} dblclick event
       */
      _onDblClick: function _onDblClick(domEvent) {
        var target = qx.bom.Event.getTarget(domEvent);

        this._fireEvent(domEvent, "tap", target);

        this._fireEvent(domEvent, "dbltap", target);
      },

      /**
       * Returns the swipe gesture when the user performed a swipe.
       *
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       * @return {Map|null} returns the swipe data when the user performed a swipe, null if the gesture was no swipe.
       */
      __getSwipeGesture__P_59_24: function __getSwipeGesture__P_59_24(domEvent, target) {
        var gesture = this.__gesture__P_59_2[domEvent.pointerId];

        if (!gesture) {
          return null;
        }

        var clazz = qx.event.handler.GestureCore;

        var deltaCoordinates = this._getDeltaCoordinates(domEvent);

        var duration = new Date().getTime() - gesture.startTime;
        var axis = Math.abs(deltaCoordinates.x) >= Math.abs(deltaCoordinates.y) ? "x" : "y";
        var distance = deltaCoordinates[axis];
        var direction = clazz.SWIPE_DIRECTION[axis][distance < 0 ? 0 : 1];
        var velocity = duration !== 0 ? distance / duration : 0;
        var swipe = {
          startTime: gesture.startTime,
          duration: duration,
          axis: axis,
          direction: direction,
          distance: distance,
          velocity: velocity
        };
        return swipe;
      },

      /**
       * Fires a track event.
       *
       * @param type {String} the track type
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       */
      __fireTrack__P_59_19: function __fireTrack__P_59_19(type, domEvent, target) {
        domEvent.delta = this._getDeltaCoordinates(domEvent);

        this._fireEvent(domEvent, type, domEvent.target || target);
      },

      /**
       * Fires a roll event.
       *
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       * @param rollFactor {Integer} the roll factor to apply
       */
      __fireRollEvent__P_59_25: function __fireRollEvent__P_59_25(domEvent, target, rollFactor) {
        domEvent.delta = {
          x: qx.util.Wheel.getDelta(domEvent, "x") * rollFactor,
          y: qx.util.Wheel.getDelta(domEvent, "y") * rollFactor
        };
        domEvent.delta.axis = Math.abs(domEvent.delta.x / domEvent.delta.y) < 1 ? "y" : "x";
        domEvent.pointerType = "wheel";

        this._fireEvent(domEvent, "roll", domEvent.target || target);
      },

      /**
       * Triggers the adaptative roll scrolling.
       *
       * @param target {Element} event target
       */
      __performAdaptativeRollScrolling__P_59_26: function __performAdaptativeRollScrolling__P_59_26(target) {
        var rollFactor = qx.event.handler.GestureCore.ROLL_FACTOR;

        if (qx.util.Wheel.IS_TOUCHPAD) {
          // The domEvent was generated by a touchpad
          rollFactor = qx.event.handler.GestureCore.TOUCHPAD_ROLL_FACTOR;
        }

        this.__lastRollEventTime__P_59_16 = new Date().getTime();
        var reLength = this.__rollEvents__P_59_6.length;

        for (var i = 0; i < reLength; i++) {
          var domEvent = this.__rollEvents__P_59_6[i];

          this.__fireRollEvent__P_59_25(domEvent, target, rollFactor);
        }

        this.__rollEvents__P_59_6 = [];
      },

      /**
       * Ends touch pad detection process.
       */
      __endTouchPadDetection__P_59_27: function __endTouchPadDetection__P_59_27() {
        if (this.__rollEvents__P_59_6.length > qx.event.handler.GestureCore.TOUCHPAD_WHEEL_EVENTS_THRESHOLD) {
          qx.util.Wheel.IS_TOUCHPAD = true;
        } else {
          qx.util.Wheel.IS_TOUCHPAD = false;
        }

        this.__touchPadDetectionPerformed__P_59_15 = true;
      },

      /**
       * Is touchpad detection enabled ? Default implementation activates it only for Mac OS after Sierra (>= 10.12).
       * @return {boolean} true if touchpad detection should occur.
       * @internal
       */
      _isTouchPadDetectionEnabled: function _isTouchPadDetectionEnabled() {
        return qx.core.Environment.get("os.name") == "osx" && qx.core.Environment.get("os.version") >= 10.12;
      },

      /**
       * Fires a roll event after determining the roll factor to apply. Mac OS Sierra (10.12+)
       * introduces a lot more wheel events fired from the trackpad, so the roll factor to be applied
       * has to be reduced in order to make the scrolling less sensitive.
       *
       * @param domEvent {Event} DOM event
       * @param type {String} The type of the dom event
       * @param target {Element} event target
       */
      _fireRoll: function _fireRoll(domEvent, type, target) {
        var now;
        var detectionTimeout;

        if (domEvent.type === qx.core.Environment.get("event.mousewheel").type) {
          if (this._isTouchPadDetectionEnabled()) {
            now = new Date().getTime();
            detectionTimeout = qx.event.handler.GestureCore.TOUCHPAD_WHEEL_EVENTS_TIMEOUT;

            if (this.__lastRollEventTime__P_59_16 > 0 && now - this.__lastRollEventTime__P_59_16 > detectionTimeout) {
              // The detection timeout was reached. A new detection step should occur.
              this.__touchPadDetectionPerformed__P_59_15 = false;
              this.__rollEvents__P_59_6 = [];
              this.__lastRollEventTime__P_59_16 = 0;
            }

            if (!this.__touchPadDetectionPerformed__P_59_15) {
              // We are into a detection session. We count the events so that we can decide if
              // they were fired by a real mouse wheel or a touchpad. Just swallow them until the
              // detection period is over.
              if (this.__rollEvents__P_59_6.length === 0) {
                // detection starts
                this.__rollEventsCountStart__P_59_13 = now;
                qx.event.Timer.once(function () {
                  if (!this.__touchPadDetectionPerformed__P_59_15) {
                    // There were not enough events during the TOUCHPAD_WHEEL_EVENTS_PERIOD to actually
                    // trigger a scrolling. Trigger it manually.
                    this.__endTouchPadDetection__P_59_27();

                    this.__performAdaptativeRollScrolling__P_59_26(target);
                  }
                }, this, qx.event.handler.GestureCore.TOUCHPAD_WHEEL_EVENTS_PERIOD + 50);
              }

              this.__rollEvents__P_59_6.push(domEvent);

              this.__rollEventsCount__P_59_14++;

              if (now - this.__rollEventsCountStart__P_59_13 > qx.event.handler.GestureCore.TOUCHPAD_WHEEL_EVENTS_PERIOD) {
                this.__endTouchPadDetection__P_59_27();
              }
            }

            if (this.__touchPadDetectionPerformed__P_59_15) {
              if (this.__rollEvents__P_59_6.length === 0) {
                this.__rollEvents__P_59_6.push(domEvent);
              } // Detection is done. We can now decide the roll factor to apply to the delta.
              // Default to a real mouse wheel event as opposed to a touchpad one.


              this.__performAdaptativeRollScrolling__P_59_26(target);
            }
          } else {
            this.__fireRollEvent__P_59_25(domEvent, target, qx.event.handler.GestureCore.ROLL_FACTOR);
          }
        } else {
          var gesture = this.__gesture__P_59_2[domEvent.pointerId];
          domEvent.delta = {
            x: -gesture.velocityX,
            y: -gesture.velocityY,
            axis: Math.abs(gesture.velocityX / gesture.velocityY) < 1 ? "y" : "x"
          };

          this._fireEvent(domEvent, "roll", domEvent.target || target);
        }
      },

      /**
       * Fires a rotate event.
       *
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       */
      __fireRotate__P_59_20: function __fireRotate__P_59_20(domEvent, target) {
        if (!domEvent.isPrimary) {
          var angle = this._calcAngle();

          domEvent.angle = Math.round((angle - this.__initialAngle__P_59_10) % 360);

          this._fireEvent(domEvent, "rotate", this.__primaryTarget__P_59_8);
        }
      },

      /**
       * Fires a pinch event.
       *
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       */
      __firePinch__P_59_21: function __firePinch__P_59_21(domEvent, target) {
        if (!domEvent.isPrimary) {
          var distance = this._calcDistance();

          var scale = distance / this.__initialDistance__P_59_12;
          domEvent.scale = Math.round(scale * 100) / 100;

          this._fireEvent(domEvent, "pinch", this.__primaryTarget__P_59_8);
        }
      },

      /**
       * Fires the long tap event.
       *
       * @param domEvent {Event} DOM event
       * @param target {Element} event target
       */
      __fireLongTap__P_59_18: function __fireLongTap__P_59_18(domEvent, target) {
        var gesture = this.__gesture__P_59_2[domEvent.pointerId];

        if (gesture) {
          this._fireEvent(domEvent, "longtap", domEvent.target || target);

          gesture.longTapTimer = null;
          gesture.isTap = false;
        }
      },

      /**
       * Stops the time for the long tap event.
       * @param gesture {Map} Data may representing the gesture.
       */
      __stopLongTapTimer__P_59_17: function __stopLongTapTimer__P_59_17(gesture) {
        if (gesture.longTapTimer) {
          window.clearTimeout(gesture.longTapTimer);
          gesture.longTapTimer = null;
        }
      },

      /**
       * Dispose the current instance
       */
      dispose: function dispose() {
        for (var gesture in this.__gesture__P_59_2) {
          this.__stopLongTapTimer__P_59_17(gesture);
        }

        this._stopObserver();

        this.__defaultTarget__P_59_0 = this.__emitter__P_59_1 = null;
      }
    }
  });
  qx.event.handler.GestureCore.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Pointer": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Tino Butz (tbtz)
  
  ************************************************************************ */

  /**
   * Tap is a single pointer gesture fired when one pointer goes down and up on
   * the same location.
   */
  qx.Class.define("qx.event.type.Tap", {
    extend: qx.event.type.Pointer
  });
  qx.event.type.Tap.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Pointer": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Tino Butz (tbtz)
  
  ************************************************************************ */

  /**
   * Swipe is a single pointer gesture fired when a pointer is moved in one direction.
   * It contains some additional data like the primary axis, the velocity and the distance.
   */
  qx.Class.define("qx.event.type.Swipe", {
    extend: qx.event.type.Pointer,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        var clone = qx.event.type.Swipe.superclass.prototype._cloneNativeEvent.call(this, nativeEvent, clone);

        clone.swipe = nativeEvent.swipe;
        return clone;
      },

      /**
       * Returns the start time of the performed swipe.
       *
       * @return {Integer} the start time
       */
      getStartTime: function getStartTime() {
        return this._native.swipe.startTime;
      },

      /**
       * Returns the duration the performed swipe took.
       *
       * @return {Integer} the duration
       */
      getDuration: function getDuration() {
        return this._native.swipe.duration;
      },

      /**
       * Returns whether the performed swipe was on the x or y axis.
       *
       * @return {String} "x"/"y" axis
       */
      getAxis: function getAxis() {
        return this._native.swipe.axis;
      },

      /**
       * Returns the direction of the performed swipe in reference to the axis.
       * y = up / down
       * x = left / right
       *
       * @return {String} the direction
       */
      getDirection: function getDirection() {
        return this._native.swipe.direction;
      },

      /**
       * Returns the velocity of the performed swipe.
       *
       * @return {Number} the velocity
       */
      getVelocity: function getVelocity() {
        return this._native.swipe.velocity;
      },

      /**
       * Returns the distance of the performed swipe.
       *
       * @return {Integer} the distance
       */
      getDistance: function getDistance() {
        return this._native.swipe.distance;
      }
    }
  });
  qx.event.type.Swipe.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Pointer": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christopher Zuendorf (czuendorf)
  
  ************************************************************************ */

  /**
   * Rotate is a multi pointer gesture fired when two finger moved around
   * a single point. It contains the angle of the rotation.
   */
  qx.Class.define("qx.event.type.Rotate", {
    extend: qx.event.type.Pointer,
    members: {
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        var clone = qx.event.type.Rotate.superclass.prototype._cloneNativeEvent.call(this, nativeEvent, clone);

        clone.angle = nativeEvent.angle;
        return clone;
      },

      /**
       * Returns a number with the current calculated angle between the primary and secondary active pointers.
       *
       * @return {Number} the angle of the two active pointers.
       */
      getAngle: function getAngle() {
        return this._native.angle;
      }
    }
  });
  qx.event.type.Rotate.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Pointer": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christopher Zuendorf (czuendorf)
  
  ************************************************************************ */

  /**
   * Pinch is a multi pointer gesture fired when two finger moved towards
   * or away from each other. It contains the scaling factor of the pinch.
   */
  qx.Class.define("qx.event.type.Pinch", {
    extend: qx.event.type.Pointer,
    members: {
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        var clone = qx.event.type.Pinch.superclass.prototype._cloneNativeEvent.call(this, nativeEvent, clone);

        clone.scale = nativeEvent.scale;
        return clone;
      },

      /**
       * Returns the calculated scale of this event.
       *
       * @return {Float} the scale value of this event.
       */
      getScale: function getScale() {
        return this._native.scale;
      }
    }
  });
  qx.event.type.Pinch.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Pointer": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christopher Zuendorf (czuendorf)
  
  ************************************************************************ */

  /**
   * Track is a single pointer gesture and contains of a three vent types:
   * <code>trackstart</code>, <code>track</code> and <code>trackend</code>. These
   * events will be fired when a pointer grabs an item and moves the pointer on it.
   */
  qx.Class.define("qx.event.type.Track", {
    extend: qx.event.type.Pointer,
    members: {
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        var clone = qx.event.type.Track.superclass.prototype._cloneNativeEvent.call(this, nativeEvent, clone);

        clone.delta = nativeEvent.delta;
        return clone;
      },

      /**
       * Returns a map with the calculated delta coordinates and axis,
       * relative to the position on <code>trackstart</code> event.
       *
       * @return {Map} a map with contains the delta as <code>x</code> and
       * <code>y</code> and the movement axis as <code>axis</code>.
       */
      getDelta: function getDelta() {
        return this._native.delta;
      }
    }
  });
  qx.event.type.Track.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Pointer": {
        "require": true
      },
      "qx.event.Registration": {},
      "qx.event.handler.Gesture": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * Roll event object.
   */
  qx.Class.define("qx.event.type.Roll", {
    extend: qx.event.type.Pointer,
    members: {
      // overridden
      stop: function stop() {
        this.stopPropagation();
        this.preventDefault();
      },
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        var clone = qx.event.type.Roll.superclass.prototype._cloneNativeEvent.call(this, nativeEvent, clone);

        clone.delta = nativeEvent.delta;
        clone.momentum = nativeEvent.momentum;
        clone.timeoutId = nativeEvent.timeoutId;
        return clone;
      },

      /**
       * Boolean flag to indicate if this event was triggered by a momentum.
       * @return {Boolean} <code>true</code>, if the event is momentum based
       */
      getMomentum: function getMomentum() {
        return this._native.momentum;
      },

      /**
       * Stops the momentum events.
       */
      stopMomentum: function stopMomentum() {
        if (this._native.timeoutId) {
          qx.event.Registration.getManager(this._originalTarget).getHandler(qx.event.handler.Gesture).stopMomentum(this._native.timeoutId);
        }
      },

      /**
       * Returns a map with the calculated delta coordinates and axis,
       * relative to the last <code>roll</code> event.
       *
       * @return {Map} a map with contains the delta as <code>x</code> and
       * <code>y</code>
       */
      getDelta: function getDelta() {
        return this._native.delta;
      }
    }
  });
  qx.event.type.Roll.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.Pointer": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.handler.GestureCore": {
        "construct": true,
        "require": true
      },
      "qx.event.IEventHandler": {
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      },
      "qx.event.type.Tap": {
        "require": true
      },
      "qx.event.type.Swipe": {
        "require": true
      },
      "qx.event.type.Rotate": {
        "require": true
      },
      "qx.event.type.Pinch": {
        "require": true
      },
      "qx.event.type.Track": {
        "require": true
      },
      "qx.event.type.Roll": {
        "require": true
      },
      "qx.lang.Function": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.bom.Event": {},
      "qx.bom.client.Event": {},
      "qx.event.type.Pointer": {},
      "qx.event.type.Data": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "className": "qx.bom.client.Browser"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Unified gesture event handler.
   *
   * @require(qx.event.handler.Pointer)
   */
  qx.Class.define("qx.event.handler.Gesture", {
    extend: qx.event.handler.GestureCore,
    implement: [qx.event.IEventHandler, qx.core.IDisposable],
    statics: {
      /** @type {Integer} Priority of this handler */
      PRIORITY: qx.event.Registration.PRIORITY_NORMAL,

      /** @type {Map} Supported event types */
      SUPPORTED_TYPES: {
        tap: 1,
        swipe: 1,
        longtap: 1,
        dbltap: 1,
        rotate: 1,
        pinch: 1,
        track: 1,
        trackstart: 1,
        trackend: 1,
        roll: 1
      },
      GESTURE_EVENTS: ["gesturebegin", "gesturefinish", "gesturemove", "gesturecancel"],

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE + qx.event.IEventHandler.TARGET_DOCUMENT,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true,
      EVENT_CLASSES: {
        tap: qx.event.type.Tap,
        longtap: qx.event.type.Tap,
        dbltap: qx.event.type.Tap,
        swipe: qx.event.type.Swipe,
        rotate: qx.event.type.Rotate,
        pinch: qx.event.type.Pinch,
        track: qx.event.type.Track,
        trackstart: qx.event.type.Track,
        trackend: qx.event.type.Track,
        roll: qx.event.type.Roll
      }
    },

    /**
     * Create a new instance
     *
     * @param manager {qx.event.Manager} Event manager for the window to use
     */
    construct: function construct(manager) {
      // Define shorthands
      this.__manager__P_20_0 = manager;
      this.__window__P_20_1 = manager.getWindow();
      this.__root__P_20_2 = this.__window__P_20_1.document;
      qx.event.handler.GestureCore.apply(this, [this.__root__P_20_2]);
    },
    members: {
      __manager__P_20_0: null,
      __window__P_20_1: null,
      __root__P_20_2: null,
      __listener__P_20_3: null,
      __onDblClickWrapped__P_20_4: null,
      __fireRollWrapped__P_20_5: null,

      /**
       * Getter for the internal __window object
       * @return {Window} DOM window instance
       */
      getWindow: function getWindow() {
        return this.__window__P_20_1;
      },
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {},
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {// Nothing needs to be done here
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {// Nothing needs to be done here
      },
      // overridden
      _initObserver: function _initObserver() {
        this.__listener__P_20_3 = qx.lang.Function.listener(this.checkAndFireGesture, this);
        qx.event.handler.Gesture.GESTURE_EVENTS.forEach(function (type) {
          qx.event.Registration.addListener(this.__root__P_20_2, type, this.__listener__P_20_3, this);
        }.bind(this));

        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9) {
          this.__onDblClickWrapped__P_20_4 = qx.lang.Function.listener(this._onDblClick, this);
          qx.bom.Event.addNativeListener(this.__root__P_20_2, "dblclick", this.__onDblClickWrapped__P_20_4);
        } // list to wheel events


        var data = qx.bom.client.Event.getMouseWheel(this.__window__P_20_1);
        this.__fireRollWrapped__P_20_5 = qx.lang.Function.listener(this._fireRoll, this); // replaced the useCapture (4th parameter) from this to true
        // see https://github.com/qooxdoo/qooxdoo/pull/9292

        qx.bom.Event.addNativeListener(data.target, data.type, this.__fireRollWrapped__P_20_5, true, false);
      },

      /**
       * Checks if a gesture was made and fires the gesture event.
       *
       * @param pointerEvent {qx.event.type.Pointer} Pointer event
       * @param type {String ? null} type of the event
       * @param target {Element ? null} event target
       */
      checkAndFireGesture: function checkAndFireGesture(pointerEvent, type, target) {
        this.__callBase__P_20_6("checkAndFireGesture", [pointerEvent.getNativeEvent(), pointerEvent.getType(), pointerEvent.getTarget()]);
      },
      // overridden
      _stopObserver: function _stopObserver() {
        qx.event.handler.Gesture.GESTURE_EVENTS.forEach(function (type) {
          qx.event.Registration.removeListener(this.__root__P_20_2, type, this.__listener__P_20_3);
        }.bind(this));

        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9) {
          qx.bom.Event.removeNativeListener(this.__root__P_20_2, "dblclick", this.__onDblClickWrapped__P_20_4);
        }

        var data = qx.bom.client.Event.getMouseWheel(this.__window__P_20_1);
        qx.bom.Event.removeNativeListener(data.target, data.type, this.__fireRollWrapped__P_20_5);
      },
      // overridden
      _hasIntermediaryHandler: function _hasIntermediaryHandler(target) {
        /* This check is irrelevant for qx.Desktop since there is only one
           gesture handler */
        return false;
      },

      /**
       * Fire a touch event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param type {String ? null} type of the event
       * @param target {Element ? null} event target
       */
      _fireEvent: function _fireEvent(domEvent, type, target) {
        if (!target) {
          target = qx.bom.Event.getTarget(domEvent);
        }

        if (!type) {
          type = domEvent.type;
        }

        var eventTypeClass = qx.event.handler.Gesture.EVENT_CLASSES[type] || qx.event.type.Pointer;

        if (target && target.nodeType) {
          qx.event.Registration.fireEvent(target, type, eventTypeClass, [domEvent, target, null, true, true]);
        } // Fire user action event


        qx.event.Registration.fireEvent(this.__window__P_20_1, "useraction", qx.event.type.Data, [type]);
      },

      /**
       * Dispose this object
       */
      dispose: function dispose() {
        this._stopObserver();

        this.__callBase__P_20_6("dispose");

        this.__manager__P_20_0 = this.__window__P_20_1 = this.__root__P_20_2 = this.__onDblClickWrapped__P_20_4 = null;
      },

      /**
       * Call overridden method.
       *
       * @param method {String} Name of the overridden method.
       * @param args {Array} Arguments.
       */
      __callBase__P_20_6: function __callBase__P_20_6(method, args) {
        qx.event.handler.GestureCore.prototype[method].apply(this, args || []);
      }
    },
    defer: function defer(statics) {
      qx.event.Registration.addHandler(statics);
      qx.event.Registration.addListener(window, "appinitialized", function () {
        qx.event.Registration.getManager(document).getHandler(statics);
      });
    }
  });
  qx.event.handler.Gesture.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.Window": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.handler.Keyboard": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.handler.Gesture": {
        "require": true,
        "defer": "runtime"
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.Stylesheet": {},
      "qx.log.Logger": {},
      "qx.core.ObjectRegistry": {},
      "qx.event.Registration": {
        "defer": "runtime"
      },
      "qx.log.appender.Formatter": {},
      "qx.event.type.Tap": {},
      "qx.event.type.Pointer": {},
      "qx.dom.Hierarchy": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * Feature-rich console appender for the qooxdoo logging system.
   *
   * Creates a small inline element which is placed in the top-right corner
   * of the window. Prints all messages with a nice color highlighting.
   *
   * * Allows user command inputs.
   * * Command history enabled by default (Keyboard up/down arrows).
   * * Lazy creation on first open.
   * * Clearing the console using a button.
   * * Display of offset (time after loading) of each message
   * * Supports keyboard shortcuts F7 or Ctrl+D to toggle the visibility
   *
   * Note this class must be disposed of after use
   *
   * @require(qx.event.handler.Window)
   * @require(qx.event.handler.Keyboard)
   * @require(qx.event.handler.Gesture)
   */
  qx.Class.define("qx.log.appender.Console", {
    statics: {
      /*
      ---------------------------------------------------------------------------
        INITIALIZATION AND SHUTDOWN
      ---------------------------------------------------------------------------
      */
      __main__P_3_0: null,
      __log__P_3_1: null,
      __cmd__P_3_2: null,
      __lastCommand__P_3_3: null,

      /**
       * Initializes the console, building HTML and pushing last
       * log messages to the output window.
       *
       */
      init: function init() {
        // Build style sheet content
        var style = [".qxconsole{z-index:10000;width:600px;height:300px;top:0px;right:0px;position:absolute;border-left:1px solid black;color:black;border-bottom:1px solid black;color:black;font-family:Consolas,Monaco,monospace;font-size:11px;line-height:1.2;}", ".qxconsole .control{background:#cdcdcd;border-bottom:1px solid black;padding:4px 8px;}", ".qxconsole .control a{text-decoration:none;color:black;}", ".qxconsole .messages{background:white;height:100%;width:100%;overflow:auto;}", ".qxconsole .messages div{padding:0px 4px;}", ".qxconsole .messages .user-command{color:blue}", ".qxconsole .messages .user-result{background:white}", ".qxconsole .messages .user-error{background:#FFE2D5}", ".qxconsole .messages .level-debug{background:white}", ".qxconsole .messages .level-info{background:#DEEDFA}", ".qxconsole .messages .level-warn{background:#FFF7D5}", ".qxconsole .messages .level-error{background:#FFE2D5}", ".qxconsole .messages .level-user{background:#E3EFE9}", ".qxconsole .messages .type-string{color:black;font-weight:normal;}", ".qxconsole .messages .type-number{color:#155791;font-weight:normal;}", ".qxconsole .messages .type-boolean{color:#15BC91;font-weight:normal;}", ".qxconsole .messages .type-array{color:#CC3E8A;font-weight:bold;}", ".qxconsole .messages .type-map{color:#CC3E8A;font-weight:bold;}", ".qxconsole .messages .type-key{color:#565656;font-style:italic}", ".qxconsole .messages .type-class{color:#5F3E8A;font-weight:bold}", ".qxconsole .messages .type-instance{color:#565656;font-weight:bold}", ".qxconsole .messages .type-stringify{color:#565656;font-weight:bold}", ".qxconsole .command{background:white;padding:2px 4px;border-top:1px solid black;}", ".qxconsole .command input{width:100%;border:0 none;font-family:Consolas,Monaco,monospace;font-size:11px;line-height:1.2;}", ".qxconsole .command input:focus{outline:none;}"]; // Include stylesheet

        qx.bom.Stylesheet.createElement(style.join("")); // Build markup

        var markup = ['<div class="qxconsole">', '<div class="control"><a href="javascript:qx.log.appender.Console.clear()">Clear</a> | <a href="javascript:qx.log.appender.Console.toggle()">Hide</a></div>', '<div class="messages">', "</div>", '<div class="command">', '<input type="text"/>', "</div>", "</div>"]; // Insert HTML to access DOM node

        var wrapper = document.createElement("DIV");
        wrapper.innerHTML = markup.join("");
        var main = wrapper.firstChild;
        document.body.appendChild(wrapper.firstChild); // Make important DOM nodes available

        this.__main__P_3_0 = main;
        this.__log__P_3_1 = main.childNodes[1];
        this.__cmd__P_3_2 = main.childNodes[2].firstChild; // Correct height of messages frame

        this.__onResize__P_3_4(); // Finally register to log engine


        qx.log.Logger.register(this); // Register to object manager

        qx.core.ObjectRegistry.register(this);
      },

      /**
       * Used by the object registry to dispose this instance e.g. remove listeners etc.
       *
       */
      dispose: function dispose() {
        qx.event.Registration.removeListener(document.documentElement, "keypress", this.__onKeyPress__P_3_5, this);
        qx.log.Logger.unregister(this);
      },

      /*
      ---------------------------------------------------------------------------
        INSERT & CLEAR
      ---------------------------------------------------------------------------
      */

      /**
       * Clears the current console output.
       *
       */
      clear: function clear() {
        // Remove all messages
        this.__log__P_3_1.innerHTML = "";
      },

      /**
       * Processes a single log entry
       *
       * @signature function(entry)
       * @param entry {Map} The entry to process
       */
      process: function process(entry) {
        // Append new content
        var formatter = qx.log.appender.Formatter.getFormatter();

        this.__log__P_3_1.appendChild(formatter.toHtml(entry)); // Scroll down


        this.__scrollDown__P_3_6();
      },

      /**
       * Automatically scroll down to the last line
       */
      __scrollDown__P_3_6: function __scrollDown__P_3_6() {
        this.__log__P_3_1.scrollTop = this.__log__P_3_1.scrollHeight;
      },

      /*
      ---------------------------------------------------------------------------
        VISIBILITY TOGGLING
      ---------------------------------------------------------------------------
      */

      /** @type {Boolean} Flag to store last visibility status */
      __visible__P_3_7: true,

      /**
       * Toggles the visibility of the console between visible and hidden.
       *
       */
      toggle: function toggle() {
        if (!this.__main__P_3_0) {
          this.init();
        } else if (this.__main__P_3_0.style.display == "none") {
          this.show();
        } else {
          this.__main__P_3_0.style.display = "none";
        }
      },

      /**
       * Shows the console.
       *
       */
      show: function show() {
        if (!this.__main__P_3_0) {
          this.init();
        } else {
          this.__main__P_3_0.style.display = "block";
          this.__log__P_3_1.scrollTop = this.__log__P_3_1.scrollHeight;
        }
      },

      /*
      ---------------------------------------------------------------------------
        COMMAND LINE SUPPORT
      ---------------------------------------------------------------------------
      */

      /** @type {Array} List of all previous commands. */
      __history__P_3_8: [],

      /**
       * Executes the currently given command
       *
       */
      execute: function execute() {
        var value = this.__cmd__P_3_2.value;

        if (value == "") {
          return;
        }

        if (value == "clear") {
          this.clear();
          return;
        }

        var command = document.createElement("div");
        var formatter = qx.log.appender.Formatter.getFormatter();
        command.innerHTML = formatter.escapeHTML(">>> " + value);
        command.className = "user-command";

        this.__history__P_3_8.push(value);

        this.__lastCommand__P_3_3 = this.__history__P_3_8.length;

        this.__log__P_3_1.appendChild(command);

        this.__scrollDown__P_3_6();

        try {
          var ret = window.eval(value);
        } catch (ex) {
          qx.log.Logger.error(ex);
        }

        if (ret !== undefined) {
          qx.log.Logger.debug(ret);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for resize listener
       *
       * @param e {Event} Event object
       */
      __onResize__P_3_4: function __onResize__P_3_4(e) {
        this.__log__P_3_1.style.height = this.__main__P_3_0.clientHeight - this.__main__P_3_0.firstChild.offsetHeight - this.__main__P_3_0.lastChild.offsetHeight + "px";
      },

      /**
       * Event handler for keydown listener
       *
       * @param e {Event} Event object
       */
      __onKeyPress__P_3_5: function __onKeyPress__P_3_5(e) {
        if (e instanceof qx.event.type.Tap || e instanceof qx.event.type.Pointer) {
          var target = e.getTarget();

          if (target && target.className && target.className.indexOf && target.className.indexOf("navigationbar") != -1) {
            this.toggle();
          }

          return;
        }

        var iden = e.getKeyIdentifier(); // Console toggling

        if (iden == "F7" || iden == "D" && e.isCtrlPressed()) {
          this.toggle();
          e.preventDefault();
        } // Not yet created


        if (!this.__main__P_3_0) {
          return;
        } // Active element not in console


        if (!qx.dom.Hierarchy.contains(this.__main__P_3_0, e.getTarget())) {
          return;
        } // Command execution


        if (iden == "Enter" && this.__cmd__P_3_2.value != "") {
          this.execute();
          this.__cmd__P_3_2.value = "";
        } // History management


        if (iden == "Up" || iden == "Down") {
          this.__lastCommand__P_3_3 += iden == "Up" ? -1 : 1;
          this.__lastCommand__P_3_3 = Math.min(Math.max(0, this.__lastCommand__P_3_3), this.__history__P_3_8.length);
          var entry = this.__history__P_3_8[this.__lastCommand__P_3_3];
          this.__cmd__P_3_2.value = entry || "";

          this.__cmd__P_3_2.select();
        }
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      qx.event.Registration.addListener(document.documentElement, "keypress", statics.__onKeyPress__P_3_5, statics);
      qx.event.Registration.addListener(document.documentElement, "longtap", statics.__onKeyPress__P_3_5, statics);
    }
  });
  qx.log.appender.Console.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2020 OETIKER+PARTNER AG
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Tobias Oetiker (oetiker)
  
  ************************************************************************ */

  /**
   * A dummy class to trigger the compiler to copy the MaterialIcons font files
   */

  /**
   * @asset(qx/iconfont/MaterialIcons/materialicons-v126.ttf)
   * @asset(qx/iconfont/MaterialIcons/materialicons-v126.woff2)
   * @asset(qx/iconfont/MaterialIcons/materialicons-v126.woff)
   * @asset(qx/iconfont/MaterialIcons/materialicons-v126.eot)
   */
  qx.Class.define("qx.theme.iconfont.LoadMaterialIcons", {});
  qx.theme.iconfont.LoadMaterialIcons.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.window.IDesktop": {},
      "qx.ui.window.Window": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Required interface for all window manager.
   *
   * Window manager handle the z-order and modality blocking of windows managed
   * by the connected desktop {@link qx.ui.window.IDesktop}.
   */
  qx.Interface.define("qx.ui.window.IWindowManager", {
    members: {
      /**
       * Connect the window manager to the window desktop
       *
       * @param desktop {qx.ui.window.IDesktop|null} The connected desktop or null
       */
      setDesktop: function setDesktop(desktop) {
        if (desktop !== null) {
          this.assertInterface(desktop, qx.ui.window.IDesktop);
        }
      },

      /**
       * Inform the window manager about a new active window
       *
       * @param active {qx.ui.window.Window} new active window
       * @param oldActive {qx.ui.window.Window} old active window
       */
      changeActiveWindow: function changeActiveWindow(active, oldActive) {},

      /**
       * Update the window order and modality blocker
       */
      updateStack: function updateStack() {},

      /**
       * Ask the manager to bring a window to the front.
       *
       * @param win {qx.ui.window.Window} window to bring to front
       */
      bringToFront: function bringToFront(win) {
        this.assertInstance(win, qx.ui.window.Window);
      },

      /**
       * Ask the manager to send a window to the back.
       *
       * @param win {qx.ui.window.Window} window to sent to back
       */
      sendToBack: function sendToBack(win) {
        this.assertInstance(win, qx.ui.window.Window);
      }
    }
  });
  qx.ui.window.IWindowManager.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "require": true
      },
      "qx.ui.window.IWindowManager": {
        "require": true
      },
      "qx.ui.core.queue.Widget": {},
      "qx.lang.Array": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The default window manager implementation
   */
  qx.Class.define("qx.ui.window.Manager", {
    extend: qx.core.Object,
    implement: qx.ui.window.IWindowManager,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __desktop__P_4_0: null,
      // interface implementation
      setDesktop: function setDesktop(desktop) {
        this.__desktop__P_4_0 = desktop;

        if (desktop) {
          this.updateStack();
        } else {
          // the window manager should be removed
          // from the widget queue if the desktop
          // was set to null
          qx.ui.core.queue.Widget.remove(this);
        }
      },

      /**
       * Returns the connected desktop
       *
       * @return {qx.ui.window.IDesktop} The desktop
       */
      getDesktop: function getDesktop() {
        return this.__desktop__P_4_0;
      },
      // interface implementation
      changeActiveWindow: function changeActiveWindow(active, oldActive) {
        if (active) {
          this.bringToFront(active);
          active.setActive(true);
        }

        if (oldActive) {
          oldActive.resetActive();
        }
      },

      /** @type {Integer} Minimum zIndex to start with for windows */
      _minZIndex: 1e5,
      // interface implementation
      updateStack: function updateStack() {
        // we use the widget queue to do the sorting one before the queues are
        // flushed. The queue will call "syncWidget"
        qx.ui.core.queue.Widget.add(this);
      },

      /**
       * This method is called during the flush of the
       * {@link qx.ui.core.queue.Widget widget queue}.
       */
      syncWidget: function syncWidget() {
        this.__desktop__P_4_0.forceUnblock();

        var windows = this.__desktop__P_4_0.getWindows(); // z-index for all three window kinds


        var zIndex = this._minZIndex;
        var zIndexOnTop = zIndex + windows.length * 2;
        var zIndexModal = zIndex + windows.length * 4; // marker if there is an active window

        var active = null;

        for (var i = 0, l = windows.length; i < l; i++) {
          var win = windows[i]; // ignore invisible windows

          if (!win.isVisible()) {
            continue;
          } // take the first window as active window


          active = active || win; // We use only every second z index to easily insert a blocker between
          // two windows
          // Modal Windows stays on top of AlwaysOnTop Windows, which stays on
          // top of Normal Windows.

          if (win.isModal()) {
            win.setZIndex(zIndexModal);

            this.__desktop__P_4_0.blockContent(zIndexModal - 1);

            zIndexModal += 2; //just activate it if it's modal

            active = win;
          } else if (win.isAlwaysOnTop()) {
            win.setZIndex(zIndexOnTop);
            zIndexOnTop += 2;
          } else {
            win.setZIndex(zIndex);
            zIndex += 2;
          } // store the active window


          if (!active.isModal() && win.isActive() || win.getZIndex() > active.getZIndex()) {
            active = win;
          }
        } //set active window or null otherwise


        this.__desktop__P_4_0.setActiveWindow(active);
      },
      // interface implementation
      bringToFront: function bringToFront(win) {
        var windows = this.__desktop__P_4_0.getWindows();

        var removed = qx.lang.Array.remove(windows, win);

        if (removed) {
          windows.push(win);
          this.updateStack();
        }
      },
      // interface implementation
      sendToBack: function sendToBack(win) {
        var windows = this.__desktop__P_4_0.getWindows();

        var removed = qx.lang.Array.remove(windows, win);

        if (removed) {
          windows.unshift(win);
          this.updateStack();
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeObjects("__desktop__P_4_0");
    }
  });
  qx.ui.window.Manager.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.window.IWindowManager": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * All parent widgets of windows must implement this interface.
   */
  qx.Interface.define("qx.ui.window.IDesktop", {
    members: {
      /**
       * Sets the desktop's window manager
       *
       * @param manager {qx.ui.window.IWindowManager} The window manager
       */
      setWindowManager: function setWindowManager(manager) {
        this.assertInterface(manager, qx.ui.window.IWindowManager);
      },

      /**
       * Get a list of all windows added to the desktop (including hidden windows)
       *
       * @return {qx.ui.window.Window[]} Array of managed windows
       */
      getWindows: function getWindows() {},

      /**
       * Whether the configured layout supports a maximized window
       * e.g. is a Canvas.
       *
       * @return {Boolean} Whether the layout supports maximized windows
       */
      supportsMaximize: function supportsMaximize() {},

      /**
       * Block direct child widgets with a zIndex below <code>zIndex</code>
       *
       * @param zIndex {Integer} All child widgets with a zIndex below this value
       *     will be blocked
       */
      blockContent: function blockContent(zIndex) {
        this.assertInteger(zIndex);
      },

      /**
       * Remove the blocker.
       */
      unblock: function unblock() {},

      /**
       * Whether the widget is currently blocked
       *
       * @return {Boolean} whether the widget is blocked.
       */
      isBlocked: function isBlocked() {}
    }
  });
  qx.ui.window.IDesktop.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.MChildrenHandling": {
        "require": true
      },
      "qx.ui.window.MDesktop": {
        "require": true
      },
      "qx.ui.core.MBlocker": {
        "require": true
      },
      "qx.ui.window.IDesktop": {
        "require": true
      },
      "qx.ui.window.Window": {
        "construct": true
      },
      "qx.ui.layout.Canvas": {
        "construct": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The desktop is a widget, which can act as container for windows. It can be
   * used to define a clipping region for internal windows e.g. to create
   * an MDI like application.
   */
  qx.Class.define("qx.ui.window.Desktop", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MChildrenHandling, qx.ui.window.MDesktop, qx.ui.core.MBlocker],
    implement: qx.ui.window.IDesktop,

    /**
     * @param windowManager {qx.ui.window.IWindowManager} The window manager to use for the desktop.
     *    If not provided, an instance of {@link qx.ui.window.Window#DEFAULT_MANAGER_CLASS} is used.
     */
    construct: function construct(windowManager) {
      qx.ui.core.Widget.constructor.call(this);
      windowManager = windowManager || new qx.ui.window.Window.DEFAULT_MANAGER_CLASS();
      this.getContentElement().disableScrolling();

      this._setLayout(new qx.ui.layout.Canvas().set({
        desktop: true
      }));

      this.setWindowManager(windowManager);
    }
  });
  qx.ui.window.Desktop.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This mixin redirects all children handling methods to a child widget of the
   * including class. This is e.g. used in {@link qx.ui.window.Window} to add
   * child widgets directly to the window pane.
   *
   * The including class must implement the method <code>getChildrenContainer</code>,
   * which has to return the widget, to which the child widgets should be added.
   */
  qx.Mixin.define("qx.ui.core.MRemoteChildrenHandling", {
    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Forward the call with the given function name to the children container
       *
       * @param functionName {String} name of the method to forward
       * @param a1 {var?} first argument of the method to call
       * @param a2 {var?} second argument of the method to call
       * @param a3 {var?} third argument of the method to call
       * @return {var} The return value of the forward method
       */
      __forward__P_72_0: function __forward__P_72_0(functionName, a1, a2, a3) {
        var container = this.getChildrenContainer();

        if (container === this) {
          functionName = "_" + functionName;
        }

        return container[functionName](a1, a2, a3);
      },

      /**
       * Returns the children list
       *
       * @return {qx.ui.core.LayoutItem[]} The children array (Arrays are
       *   reference types, please do not modify them in-place)
       */
      getChildren: function getChildren() {
        return this.__forward__P_72_0("getChildren");
      },

      /**
       * Whether the widget contains children.
       *
       * @return {Boolean} Returns <code>true</code> when the widget has children.
       */
      hasChildren: function hasChildren() {
        return this.__forward__P_72_0("hasChildren");
      },

      /**
       * Adds a new child widget.
       *
       * The supported keys of the layout options map depend on the layout manager
       * used to position the widget. The options are documented in the class
       * documentation of each layout manager {@link qx.ui.layout}.
       *
       * @param child {qx.ui.core.LayoutItem} the item to add.
       * @param options {Map?null} Optional layout data for item.
       * @return {qx.ui.core.Widget} This object (for chaining support)
       */
      add: function add(child, options) {
        return this.__forward__P_72_0("add", child, options);
      },

      /**
       * Remove the given child item.
       *
       * @param child {qx.ui.core.LayoutItem} the item to remove
       * @return {qx.ui.core.Widget} This object (for chaining support)
       */
      remove: function remove(child) {
        return this.__forward__P_72_0("remove", child);
      },

      /**
       * Remove all children.
       * @return {Array} An array containing the removed children.
       */
      removeAll: function removeAll() {
        return this.__forward__P_72_0("removeAll");
      },

      /**
       * Returns the index position of the given item if it is
       * a child item. Otherwise it returns <code>-1</code>.
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param child {qx.ui.core.LayoutItem} the item to query for
       * @return {Integer} The index position or <code>-1</code> when
       *   the given item is no child of this layout.
       */
      indexOf: function indexOf(child) {
        return this.__forward__P_72_0("indexOf", child);
      },

      /**
       * Add a child at the specified index
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param child {qx.ui.core.LayoutItem} item to add
       * @param index {Integer} Index, at which the item will be inserted
       * @param options {Map?null} Optional layout data for item.
       */
      addAt: function addAt(child, index, options) {
        this.__forward__P_72_0("addAt", child, index, options);
      },

      /**
       * Add an item before another already inserted item
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param child {qx.ui.core.LayoutItem} item to add
       * @param before {qx.ui.core.LayoutItem} item before the new item will be inserted.
       * @param options {Map?null} Optional layout data for item.
       */
      addBefore: function addBefore(child, before, options) {
        this.__forward__P_72_0("addBefore", child, before, options);
      },

      /**
       * Add an item after another already inserted item
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param child {qx.ui.core.LayoutItem} item to add
       * @param after {qx.ui.core.LayoutItem} item, after which the new item will be inserted
       * @param options {Map?null} Optional layout data for item.
       */
      addAfter: function addAfter(child, after, options) {
        this.__forward__P_72_0("addAfter", child, after, options);
      },

      /**
       * Remove the item at the specified index.
       *
       * This method works on the widget's children list. Some layout managers
       * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
       * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
       * ignore the children order for the layout process.
       *
       * @param index {Integer} Index of the item to remove.
       * @return {qx.ui.core.LayoutItem} The removed item
       */
      removeAt: function removeAt(index) {
        return this.__forward__P_72_0("removeAt", index);
      }
    }
  });
  qx.ui.core.MRemoteChildrenHandling.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This mixin redirects the layout manager to a child widget of the
   * including class. This is e.g. used in {@link qx.ui.window.Window} to configure
   * the layout manager of the window pane instead of the window directly.
   *
   * The including class must implement the method <code>getChildrenContainer</code>,
   * which has to return the widget, to which the layout should be set.
   */
  qx.Mixin.define("qx.ui.core.MRemoteLayoutHandling", {
    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Set a layout manager for the widget. A a layout manager can only be connected
       * with one widget. Reset the connection with a previous widget first, if you
       * like to use it in another widget instead.
       *
       * @param layout {qx.ui.layout.Abstract} The new layout or
       *     <code>null</code> to reset the layout.
       */
      setLayout: function setLayout(layout) {
        var container = this.getChildrenContainer();

        if (container === this) {
          container._setLayout(layout);
        } else {
          container.setLayout(layout);
        }
      },

      /**
       * Get the widget's layout manager.
       *
       * @return {qx.ui.layout.Abstract} The widget's layout manager
       */
      getLayout: function getLayout() {
        var container = this.getChildrenContainer();

        if (container === this) {
          return container._getLayout();
        }

        return container.getLayout();
      }
    }
  });
  qx.ui.core.MRemoteLayoutHandling.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.Registration": {
        "construct": true
      },
      "qx.event.handler.DragDrop": {
        "construct": true
      },
      "qx.ui.core.Widget": {},
      "qx.core.Init": {},
      "qx.lang.Object": {},
      "qx.core.ObjectRegistry": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007 David Pérez Carmona
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * David Perez Carmona (david-perez)
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Provides resizing behavior to any widget.
   */
  qx.Mixin.define("qx.ui.core.MResizable", {
    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      // Register listeners to the content
      var content = this.getContentElement();
      content.addListener("pointerdown", this.__onResizePointerDown__P_73_0, this, true);
      content.addListener("pointerup", this.__onResizePointerUp__P_73_1, this);
      content.addListener("pointermove", this.__onResizePointerMove__P_73_2, this);
      content.addListener("pointerout", this.__onResizePointerOut__P_73_3, this);
      content.addListener("losecapture", this.__onResizeLoseCapture__P_73_4, this); // Get a reference of the drag and drop handler

      var domElement = content.getDomElement();

      if (domElement == null) {
        domElement = window;
      }

      this.__dragDropHandler__P_73_5 = qx.event.Registration.getManager(domElement).getHandler(qx.event.handler.DragDrop);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Whether the top edge is resizable */
      resizableTop: {
        check: "Boolean",
        init: true
      },

      /** Whether the right edge is resizable */
      resizableRight: {
        check: "Boolean",
        init: true
      },

      /** Whether the bottom edge is resizable */
      resizableBottom: {
        check: "Boolean",
        init: true
      },

      /** Whether the left edge is resizable */
      resizableLeft: {
        check: "Boolean",
        init: true
      },

      /**
       * Property group to configure the resize behaviour for all edges at once
       */
      resizable: {
        group: ["resizableTop", "resizableRight", "resizableBottom", "resizableLeft"],
        mode: "shorthand"
      },

      /** The tolerance to activate resizing */
      resizeSensitivity: {
        check: "Integer",
        init: 5
      },

      /** Whether a frame replacement should be used during the resize sequence */
      useResizeFrame: {
        check: "Boolean",
        init: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */

    /* eslint-disable @qooxdoo/qx/no-refs-in-members */
    members: {
      __dragDropHandler__P_73_5: null,
      __resizeFrame__P_73_6: null,
      __resizeActive__P_73_7: null,
      __resizeLeft__P_73_8: null,
      __resizeTop__P_73_9: null,
      __resizeStart__P_73_10: null,
      __resizeRange__P_73_11: null,
      RESIZE_TOP: 1,
      RESIZE_BOTTOM: 2,
      RESIZE_LEFT: 4,
      RESIZE_RIGHT: 8,

      /*
      ---------------------------------------------------------------------------
        CORE FEATURES
      ---------------------------------------------------------------------------
      */

      /**
       * Get the widget, which draws the resize/move frame. The resize frame is
       * shared by all widgets and is added to the root widget.
       *
       * @return {qx.ui.core.Widget} The resize frame
       */
      _getResizeFrame: function _getResizeFrame() {
        var frame = this.__resizeFrame__P_73_6;

        if (!frame) {
          frame = this.__resizeFrame__P_73_6 = new qx.ui.core.Widget();
          frame.setAppearance("resize-frame");
          frame.exclude();
          qx.core.Init.getApplication().getRoot().add(frame);
        }

        return frame;
      },

      /**
       * Creates, shows and syncs the frame with the widget.
       */
      __showResizeFrame__P_73_12: function __showResizeFrame__P_73_12() {
        var location = this.getContentLocation();

        var frame = this._getResizeFrame();

        frame.setUserBounds(location.left, location.top, location.right - location.left, location.bottom - location.top);
        frame.show();
        frame.setZIndex(this.getZIndex() + 1);
      },

      /*
      ---------------------------------------------------------------------------
        RESIZE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Computes the new boundaries at each interval
       * of the resize sequence.
       *
       * @param e {qx.event.type.Pointer} Last pointer event
       * @return {Map} A map with the computed boundaries
       */
      __computeResizeResult__P_73_13: function __computeResizeResult__P_73_13(e) {
        // Detect mode
        var resizeActive = this.__resizeActive__P_73_7; // Read size hint

        var hint = this.getSizeHint();
        var range = this.__resizeRange__P_73_11; // Read original values

        var start = this.__resizeStart__P_73_10;
        var width = start.width;
        var height = start.height;
        var left = start.left;
        var top = start.top;
        var diff;

        if (resizeActive & this.RESIZE_TOP || resizeActive & this.RESIZE_BOTTOM) {
          diff = Math.max(range.top, Math.min(range.bottom, e.getDocumentTop())) - this.__resizeTop__P_73_9;

          if (resizeActive & this.RESIZE_TOP) {
            height -= diff;
          } else {
            height += diff;
          }

          if (height < hint.minHeight) {
            height = hint.minHeight;
          } else if (height > hint.maxHeight) {
            height = hint.maxHeight;
          }

          if (resizeActive & this.RESIZE_TOP) {
            top += start.height - height;
          }
        }

        if (resizeActive & this.RESIZE_LEFT || resizeActive & this.RESIZE_RIGHT) {
          diff = Math.max(range.left, Math.min(range.right, e.getDocumentLeft())) - this.__resizeLeft__P_73_8;

          if (resizeActive & this.RESIZE_LEFT) {
            width -= diff;
          } else {
            width += diff;
          }

          if (width < hint.minWidth) {
            width = hint.minWidth;
          } else if (width > hint.maxWidth) {
            width = hint.maxWidth;
          }

          if (resizeActive & this.RESIZE_LEFT) {
            left += start.width - width;
          }
        }

        return {
          // left and top of the visible widget
          viewportLeft: left,
          viewportTop: top,
          parentLeft: start.bounds.left + left - start.left,
          parentTop: start.bounds.top + top - start.top,
          // dimensions of the visible widget
          width: width,
          height: height
        };
      },

      /**
       * @type {Map} Maps internal states to cursor symbols to use
       *
       * @lint ignoreReferenceField(__resizeCursors)
       */
      __resizeCursors__P_73_14: {
        1: "n-resize",
        2: "s-resize",
        4: "w-resize",
        8: "e-resize",
        5: "nw-resize",
        6: "sw-resize",
        9: "ne-resize",
        10: "se-resize"
      },

      /**
       * Updates the internally stored resize mode
       *
       * @param e {qx.event.type.Pointer} Last pointer event
       */
      __computeResizeMode__P_73_15: function __computeResizeMode__P_73_15(e) {
        var location = this.getContentLocation();
        var pointerTolerance = this.getResizeSensitivity();
        var pointerLeft = e.getDocumentLeft();
        var pointerTop = e.getDocumentTop();

        var resizeActive = this.__computeResizeActive__P_73_16(location, pointerLeft, pointerTop, pointerTolerance); // check again in case we have a corner [BUG #1200]


        if (resizeActive > 0) {
          // this is really a | (or)!
          resizeActive = resizeActive | this.__computeResizeActive__P_73_16(location, pointerLeft, pointerTop, pointerTolerance * 2);
        }

        this.__resizeActive__P_73_7 = resizeActive;
      },

      /**
       * Internal helper for computing the proper resize action based on the
       * given parameters.
       *
       * @param location {Map} The current location of the widget.
       * @param pointerLeft {Integer} The left position of the pointer.
       * @param pointerTop {Integer} The top position of the pointer.
       * @param pointerTolerance {Integer} The desired distance to the edge.
       * @return {Integer} The resize active number.
       */
      __computeResizeActive__P_73_16: function __computeResizeActive__P_73_16(location, pointerLeft, pointerTop, pointerTolerance) {
        var resizeActive = 0; // TOP

        if (this.getResizableTop() && Math.abs(location.top - pointerTop) < pointerTolerance && pointerLeft > location.left - pointerTolerance && pointerLeft < location.right + pointerTolerance) {
          resizeActive += this.RESIZE_TOP; // BOTTOM
        } else if (this.getResizableBottom() && Math.abs(location.bottom - pointerTop) < pointerTolerance && pointerLeft > location.left - pointerTolerance && pointerLeft < location.right + pointerTolerance) {
          resizeActive += this.RESIZE_BOTTOM;
        } // LEFT


        if (this.getResizableLeft() && Math.abs(location.left - pointerLeft) < pointerTolerance && pointerTop > location.top - pointerTolerance && pointerTop < location.bottom + pointerTolerance) {
          resizeActive += this.RESIZE_LEFT; // RIGHT
        } else if (this.getResizableRight() && Math.abs(location.right - pointerLeft) < pointerTolerance && pointerTop > location.top - pointerTolerance && pointerTop < location.bottom + pointerTolerance) {
          resizeActive += this.RESIZE_RIGHT;
        }

        return resizeActive;
      },

      /*
      ---------------------------------------------------------------------------
        RESIZE EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for the pointer down event
       *
       * @param e {qx.event.type.Pointer} The pointer event instance
       */
      __onResizePointerDown__P_73_0: function __onResizePointerDown__P_73_0(e) {
        // Check for active resize
        if (!this.__resizeActive__P_73_7 || !this.getEnabled() || e.getPointerType() == "touch") {
          return;
        } // Add resize state


        this.addState("resize"); // Store pointer coordinates

        this.__resizeLeft__P_73_8 = e.getDocumentLeft();
        this.__resizeTop__P_73_9 = e.getDocumentTop(); // Cache bounds

        var location = this.getContentLocation();
        var bounds = this.getBounds();
        this.__resizeStart__P_73_10 = {
          top: location.top,
          left: location.left,
          width: location.right - location.left,
          height: location.bottom - location.top,
          bounds: qx.lang.Object.clone(bounds)
        }; // Compute range

        var parent = this.getLayoutParent();
        var parentLocation = parent.getContentLocation();
        var parentBounds = parent.getBounds();
        this.__resizeRange__P_73_11 = {
          left: parentLocation.left,
          top: parentLocation.top,
          right: parentLocation.left + parentBounds.width,
          bottom: parentLocation.top + parentBounds.height
        }; // Show frame if configured this way

        if (this.getUseResizeFrame()) {
          this.__showResizeFrame__P_73_12();
        } // Enable capturing


        this.capture(); // Stop event

        e.stop();
      },

      /**
       * Event handler for the pointer up event
       *
       * @param e {qx.event.type.Pointer} The pointer event instance
       */
      __onResizePointerUp__P_73_1: function __onResizePointerUp__P_73_1(e) {
        // Check for active resize
        if (!this.hasState("resize") || !this.getEnabled() || e.getPointerType() == "touch") {
          return;
        } // Hide frame afterwards


        if (this.getUseResizeFrame()) {
          this._getResizeFrame().exclude();
        } // Compute bounds


        var bounds = this.__computeResizeResult__P_73_13(e); // Sync with widget


        this.setWidth(bounds.width);
        this.setHeight(bounds.height); // Update coordinate in canvas

        if (this.getResizableLeft() || this.getResizableTop()) {
          this.setLayoutProperties({
            left: bounds.parentLeft,
            top: bounds.parentTop
          });
        } // Clear mode


        this.__resizeActive__P_73_7 = 0; // Remove resize state

        this.removeState("resize"); // Reset cursor

        this.resetCursor();
        this.getApplicationRoot().resetGlobalCursor(); // Disable capturing

        this.releaseCapture();
        e.stopPropagation();
      },

      /**
       * Event listener for <code>losecapture</code> event.
       *
       * @param e {qx.event.type.Event} Lose capture event
       */
      __onResizeLoseCapture__P_73_4: function __onResizeLoseCapture__P_73_4(e) {
        // Check for active resize
        if (!this.__resizeActive__P_73_7) {
          return;
        } // Reset cursor


        this.resetCursor();
        this.getApplicationRoot().resetGlobalCursor(); // Remove drag state

        this.removeState("move"); // Hide frame afterwards

        if (this.getUseResizeFrame()) {
          this._getResizeFrame().exclude();
        }
      },

      /**
       * Event handler for the pointer move event
       *
       * @param e {qx.event.type.Pointer} The pointer event instance
       */
      __onResizePointerMove__P_73_2: function __onResizePointerMove__P_73_2(e) {
        if (!this.getEnabled() || e.getPointerType() == "touch") {
          return;
        }

        if (this.hasState("resize")) {
          var bounds = this.__computeResizeResult__P_73_13(e); // Update widget


          if (this.getUseResizeFrame()) {
            // Sync new bounds to frame
            var frame = this._getResizeFrame();

            frame.setUserBounds(bounds.viewportLeft, bounds.viewportTop, bounds.width, bounds.height);
          } else {
            // Update size
            this.setWidth(bounds.width);
            this.setHeight(bounds.height); // Update coordinate in canvas

            if (this.getResizableLeft() || this.getResizableTop()) {
              this.setLayoutProperties({
                left: bounds.parentLeft,
                top: bounds.parentTop
              });
            }
          } // Full stop for event


          e.stopPropagation();
        } else if (!this.hasState("maximized") && !this.__dragDropHandler__P_73_5.isSessionActive()) {
          this.__computeResizeMode__P_73_15(e);

          var resizeActive = this.__resizeActive__P_73_7;
          var root = this.getApplicationRoot();

          if (resizeActive) {
            var cursor = this.__resizeCursors__P_73_14[resizeActive];
            this.setCursor(cursor);
            root.setGlobalCursor(cursor);
          } else if (this.getCursor()) {
            this.resetCursor();
            root.resetGlobalCursor();
          }
        }
      },

      /**
       * Event handler for the pointer out event
       *
       * @param e {qx.event.type.Pointer} The pointer event instance
       */
      __onResizePointerOut__P_73_3: function __onResizePointerOut__P_73_3(e) {
        if (e.getPointerType() == "touch") {
          return;
        } // When the pointer left the window and resizing is not yet
        // active we must be sure to (especially) reset the global
        // cursor.


        if (this.getCursor() && !this.hasState("resize")) {
          this.resetCursor();
          this.getApplicationRoot().resetGlobalCursor();
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (this.getCursor()) {
        this.getApplicationRoot().resetGlobalCursor();
      }

      if (this.__resizeFrame__P_73_6 != null && !qx.core.ObjectRegistry.inShutDown) {
        this.__resizeFrame__P_73_6.destroy();

        this.__resizeFrame__P_73_6 = null;
      }

      this.__dragDropHandler__P_73_5 = null;
    }
  });
  qx.ui.core.MResizable.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {},
      "qx.core.Init": {},
      "qx.Class": {},
      "qx.ui.window.IDesktop": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Provides move behavior to any widget.
   *
   * The widget using the mixin must register a widget as move handle so that
   * the pointer events needed for moving it are attached to this widget).
   * <pre class='javascript'>this._activateMoveHandle(widget);</pre>
   */
  qx.Mixin.define("qx.ui.core.MMovable", {
    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Whether the widget is movable */
      movable: {
        check: "Boolean",
        init: true
      },

      /** Whether to use a frame instead of the original widget during move sequences */
      useMoveFrame: {
        check: "Boolean",
        init: false
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __moveHandle__P_74_0: null,
      __moveFrame__P_74_1: null,
      __dragRange__P_74_2: null,
      __dragLeft__P_74_3: null,
      __dragTop__P_74_4: null,
      __parentLeft__P_74_5: null,
      __parentTop__P_74_6: null,
      __blockerAdded__P_74_7: false,
      __oldBlockerColor__P_74_8: null,
      __oldBlockerOpacity__P_74_9: 0,

      /*
      ---------------------------------------------------------------------------
        CORE FEATURES
      ---------------------------------------------------------------------------
      */

      /**
       * Configures the given widget as a move handle
       *
       * @param widget {qx.ui.core.Widget} Widget to activate as move handle
       */
      _activateMoveHandle: function _activateMoveHandle(widget) {
        if (this.__moveHandle__P_74_0) {
          throw new Error("The move handle could not be redefined!");
        }

        this.__moveHandle__P_74_0 = widget;
        widget.addListener("pointerdown", this._onMovePointerDown, this);
        widget.addListener("pointerup", this._onMovePointerUp, this);
        widget.addListener("pointermove", this._onMovePointerMove, this);
        widget.addListener("losecapture", this.__onMoveLoseCapture__P_74_10, this);
      },

      /**
       * Get the widget, which draws the resize/move frame.
       *
       * @return {qx.ui.core.Widget} The resize frame
       */
      __getMoveFrame__P_74_11: function __getMoveFrame__P_74_11() {
        var frame = this.__moveFrame__P_74_1;

        if (!frame) {
          frame = this.__moveFrame__P_74_1 = new qx.ui.core.Widget();
          frame.setAppearance("move-frame");
          frame.exclude();
          qx.core.Init.getApplication().getRoot().add(frame);
        }

        return frame;
      },

      /**
       * Creates, shows and syncs the frame with the widget.
       */
      __showMoveFrame__P_74_12: function __showMoveFrame__P_74_12() {
        var location = this.getContentLocation();
        var bounds = this.getBounds();

        var frame = this.__getMoveFrame__P_74_11();

        frame.setUserBounds(location.left, location.top, bounds.width, bounds.height);
        frame.show();
        frame.setZIndex(this.getZIndex() + 1);
      },

      /*
      ---------------------------------------------------------------------------
        MOVE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Computes the new drag coordinates
       *
       * @param e {qx.event.type.Pointer} Pointer event
       * @return {Map} A map with the computed drag coordinates
       */
      __computeMoveCoordinates__P_74_13: function __computeMoveCoordinates__P_74_13(e) {
        var range = this.__dragRange__P_74_2;
        var pointerLeft = Math.max(range.left, Math.min(range.right, e.getDocumentLeft()));
        var pointerTop = Math.max(range.top, Math.min(range.bottom, e.getDocumentTop()));
        var viewportLeft = this.__dragLeft__P_74_3 + pointerLeft;
        var viewportTop = this.__dragTop__P_74_4 + pointerTop;
        return {
          viewportLeft: parseInt(viewportLeft, 10),
          viewportTop: parseInt(viewportTop, 10),
          parentLeft: parseInt(viewportLeft - this.__parentLeft__P_74_5, 10),
          parentTop: parseInt(viewportTop - this.__parentTop__P_74_6, 10)
        };
      },

      /*
      ---------------------------------------------------------------------------
        MOVE EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Roll handler which prevents the scrolling via tap & move on parent widgets
       * during the move of the widget.
       * @param e {qx.event.type.Roll} The roll event
       */
      _onMoveRoll: function _onMoveRoll(e) {
        e.stop();
      },

      /**
       * Enables the capturing of the caption bar and prepares the drag session and the
       * appearance (translucent, frame or opaque) for the moving of the window.
       *
       * @param e {qx.event.type.Pointer} pointer down event
       */
      _onMovePointerDown: function _onMovePointerDown(e) {
        if (!this.getMovable() || this.hasState("maximized")) {
          return;
        }

        this.addListener("roll", this._onMoveRoll, this); // Compute drag range

        var parent = this.getLayoutParent();
        var parentLocation = parent.getContentLocation();
        var parentBounds = parent.getBounds(); // Added a blocker, this solves the issue described in [BUG #1462]

        if (qx.Class.implementsInterface(parent, qx.ui.window.IDesktop)) {
          if (!parent.isBlocked()) {
            this.__oldBlockerColor__P_74_8 = parent.getBlockerColor();
            this.__oldBlockerOpacity__P_74_9 = parent.getBlockerOpacity();
            parent.setBlockerColor(null);
            parent.setBlockerOpacity(1);
            parent.blockContent(this.getZIndex() - 1);
            this.__blockerAdded__P_74_7 = true;
          }
        }

        this.__dragRange__P_74_2 = {
          left: parentLocation.left,
          top: parentLocation.top,
          right: parentLocation.left + parentBounds.width,
          bottom: parentLocation.top + parentBounds.height
        }; // Compute drag positions

        var widgetLocation = this.getContentLocation();
        this.__parentLeft__P_74_5 = parentLocation.left;
        this.__parentTop__P_74_6 = parentLocation.top;
        this.__dragLeft__P_74_3 = widgetLocation.left - e.getDocumentLeft();
        this.__dragTop__P_74_4 = widgetLocation.top - e.getDocumentTop(); // Add state

        this.addState("move"); // Enable capturing

        this.__moveHandle__P_74_0.capture(); // Enable drag frame


        if (this.getUseMoveFrame()) {
          this.__showMoveFrame__P_74_12();
        } // Stop event


        e.stop();
      },

      /**
       * Does the moving of the window by rendering the position
       * of the window (or frame) at runtime using direct dom methods.
       *
       * @param e {qx.event.type.Pointer} pointer move event
       */
      _onMovePointerMove: function _onMovePointerMove(e) {
        // Only react when dragging is active
        if (!this.hasState("move")) {
          return;
        } // Apply new coordinates using DOM


        var coords = this.__computeMoveCoordinates__P_74_13(e);

        if (this.getUseMoveFrame()) {
          this.__getMoveFrame__P_74_11().setDomPosition(coords.viewportLeft, coords.viewportTop);
        } else {
          var insets = this.getLayoutParent().getInsets();
          this.setDomPosition(coords.parentLeft - (insets.left || 0), coords.parentTop - (insets.top || 0));
        }

        e.stopPropagation();
      },

      /**
       * Disables the capturing of the caption bar and moves the window
       * to the last position of the drag session. Also restores the appearance
       * of the window.
       *
       * @param e {qx.event.type.Pointer} pointer up event
       */
      _onMovePointerUp: function _onMovePointerUp(e) {
        if (this.hasListener("roll")) {
          this.removeListener("roll", this._onMoveRoll, this);
        } // Only react when dragging is active


        if (!this.hasState("move")) {
          return;
        } // Remove drag state


        this.removeState("move"); // Removed blocker, this solves the issue described in [BUG #1462]

        var parent = this.getLayoutParent();

        if (qx.Class.implementsInterface(parent, qx.ui.window.IDesktop)) {
          if (this.__blockerAdded__P_74_7) {
            parent.unblock();
            parent.setBlockerColor(this.__oldBlockerColor__P_74_8);
            parent.setBlockerOpacity(this.__oldBlockerOpacity__P_74_9);
            this.__oldBlockerColor__P_74_8 = null;
            this.__oldBlockerOpacity__P_74_9 = 0;
            this.__blockerAdded__P_74_7 = false;
          }
        } // Disable capturing


        this.__moveHandle__P_74_0.releaseCapture(); // Apply them to the layout


        var coords = this.__computeMoveCoordinates__P_74_13(e);

        var insets = this.getLayoutParent().getInsets();
        this.setLayoutProperties({
          left: coords.parentLeft - (insets.left || 0),
          top: coords.parentTop - (insets.top || 0)
        }); // Hide frame afterwards

        if (this.getUseMoveFrame()) {
          this.__getMoveFrame__P_74_11().exclude();
        }

        e.stopPropagation();
      },

      /**
       * Event listener for <code>losecapture</code> event.
       *
       * @param e {qx.event.type.Event} Lose capture event
       */
      __onMoveLoseCapture__P_74_10: function __onMoveLoseCapture__P_74_10(e) {
        // Check for active move
        if (!this.hasState("move")) {
          return;
        } // Remove drag state


        this.removeState("move"); // Hide frame afterwards

        if (this.getUseMoveFrame()) {
          this.__getMoveFrame__P_74_11().exclude();
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeObjects("__moveFrame__P_74_1", "__moveHandle__P_74_0");

      this.__dragRange__P_74_2 = null;
    }
  });
  qx.ui.core.MMovable.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This mixin defines the <code>contentPadding</code> property, which is used
   * by widgets like the window or group box, which must have a property, which
   * defines the padding of an inner pane.
   *
   * The including class must implement the method
   * <code>_getContentPaddingTarget</code>, which must return the widget on which
   * the padding should be applied.
   */
  qx.Mixin.define("qx.ui.core.MContentPadding", {
    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Top padding of the content pane */
      contentPaddingTop: {
        check: "Integer",
        init: 0,
        apply: "_applyContentPadding",
        themeable: true
      },

      /** Right padding of the content pane */
      contentPaddingRight: {
        check: "Integer",
        init: 0,
        apply: "_applyContentPadding",
        themeable: true
      },

      /** Bottom padding of the content pane */
      contentPaddingBottom: {
        check: "Integer",
        init: 0,
        apply: "_applyContentPadding",
        themeable: true
      },

      /** Left padding of the content pane */
      contentPaddingLeft: {
        check: "Integer",
        init: 0,
        apply: "_applyContentPadding",
        themeable: true
      },

      /**
       * The 'contentPadding' property is a shorthand property for setting 'contentPaddingTop',
       * 'contentPaddingRight', 'contentPaddingBottom' and 'contentPaddingLeft'
       * at the same time.
       *
       * If four values are specified they apply to top, right, bottom and left respectively.
       * If there is only one value, it applies to all sides, if there are two or three,
       * the missing values are taken from the opposite side.
       */
      contentPadding: {
        group: ["contentPaddingTop", "contentPaddingRight", "contentPaddingBottom", "contentPaddingLeft"],
        mode: "shorthand",
        themeable: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */

    /* eslint-disable @qooxdoo/qx/no-refs-in-members */
    members: {
      /**
       * @type {Map} Maps property names of content padding to the setter of the padding
       *
       * @lint ignoreReferenceField(__contentPaddingSetter)
       */
      __contentPaddingSetter__P_75_0: {
        contentPaddingTop: "setPaddingTop",
        contentPaddingRight: "setPaddingRight",
        contentPaddingBottom: "setPaddingBottom",
        contentPaddingLeft: "setPaddingLeft"
      },

      /**
       * @type {Map} Maps property names of content padding to the themed setter of the padding
       *
       * @lint ignoreReferenceField(__contentPaddingThemedSetter)
       */
      __contentPaddingThemedSetter__P_75_1: {
        contentPaddingTop: "setThemedPaddingTop",
        contentPaddingRight: "setThemedPaddingRight",
        contentPaddingBottom: "setThemedPaddingBottom",
        contentPaddingLeft: "setThemedPaddingLeft"
      },

      /**
       * @type {Map} Maps property names of content padding to the resetter of the padding
       *
       * @lint ignoreReferenceField(__contentPaddingResetter)
       */
      __contentPaddingResetter__P_75_2: {
        contentPaddingTop: "resetPaddingTop",
        contentPaddingRight: "resetPaddingRight",
        contentPaddingBottom: "resetPaddingBottom",
        contentPaddingLeft: "resetPaddingLeft"
      },
      // property apply
      _applyContentPadding: function _applyContentPadding(value, old, name, variant) {
        var target = this._getContentPaddingTarget();

        if (value == null) {
          var resetter = this.__contentPaddingResetter__P_75_2[name];
          target[resetter]();
        } else {
          // forward the themed sates if case the apply was invoked by a theme
          if (variant == "setThemed" || variant == "resetThemed") {
            var setter = this.__contentPaddingThemedSetter__P_75_1[name];
            target[setter](value);
          } else {
            var setter = this.__contentPaddingSetter__P_75_0[name];
            target[setter](value);
          }
        }
      }
    }
  });
  qx.ui.core.MContentPadding.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "require": true
      },
      "qx.event.IEventHandler": {
        "require": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * This class provides capture event support at DOM level.
   */
  qx.Class.define("qx.event.handler.Capture", {
    extend: qx.core.Object,
    implement: qx.event.IEventHandler,

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Integer} Priority of this handler */
      PRIORITY: qx.event.Registration.PRIORITY_NORMAL,

      /** @type {Map} Supported event types */
      SUPPORTED_TYPES: {
        capture: true,
        losecapture: true
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER INTERFACE
      ---------------------------------------------------------------------------
      */
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {},
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {// Nothing needs to be done here
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {// Nothing needs to be done here
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      qx.event.Registration.addHandler(statics);
    }
  });
  qx.event.handler.Capture.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.Gesture": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.handler.Keyboard": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.handler.Capture": {
        "require": true,
        "defer": "runtime"
      },
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.event.IEventHandler": {
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.event.Registration": {
        "construct": true,
        "defer": "runtime",
        "require": true
      },
      "qx.ui.core.Widget": {},
      "qx.event.Utils": {},
      "qx.Promise": {},
      "qx.event.type.Drag": {},
      "qx.ui.core.DragDropCursor": {},
      "qx.bom.element.Style": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.promise": {
          "load": true
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Event handler, which supports drag events on DOM elements.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @require(qx.event.handler.Gesture)
   * @require(qx.event.handler.Keyboard)
   * @require(qx.event.handler.Capture)
   */
  qx.Class.define("qx.event.handler.DragDrop", {
    extend: qx.core.Object,
    implement: [qx.event.IEventHandler, qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param manager {qx.event.Manager} Event manager for the window to use
     */
    construct: function construct(manager) {
      qx.core.Object.constructor.call(this); // Define shorthands

      this.__manager__P_103_0 = manager;
      this.__root__P_103_1 = manager.getWindow().document.documentElement; // Initialize listener

      this.__manager__P_103_0.addListener(this.__root__P_103_1, "longtap", this._onLongtap, this);

      this.__manager__P_103_0.addListener(this.__root__P_103_1, "pointerdown", this._onPointerdown, this, true);

      qx.event.Registration.addListener(window, "blur", this._onWindowBlur, this); // Initialize data structures

      this.__rebuildStructures__P_103_2();
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Integer} Priority of this handler */
      PRIORITY: qx.event.Registration.PRIORITY_NORMAL,

      /** @type {Map} Supported event types */
      SUPPORTED_TYPES: {
        dragstart: 1,
        dragend: 1,
        dragover: 1,
        dragleave: 1,
        drop: 1,
        drag: 1,
        dragchange: 1,
        droprequest: 1
      },

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true,

      /**
       * Array of strings holding the names of the allowed mouse buttons
       * for Drag & Drop. The default is "left" but could be extended with
       * "middle" or "right"
       */
      ALLOWED_BUTTONS: ["left"],

      /**
       * The distance needed to change the mouse position before a drag session start.
       */
      MIN_DRAG_DISTANCE: 5
    },
    properties: {
      /**
       * Widget instance of the drag & drop cursor. If non is given, the default
       * {@link qx.ui.core.DragDropCursor} will be used.
       */
      cursor: {
        check: "qx.ui.core.Widget",
        nullable: true,
        init: null
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __manager__P_103_0: null,
      __root__P_103_1: null,
      __dropTarget__P_103_3: null,
      __dragTarget__P_103_4: null,
      __types__P_103_5: null,
      __actions__P_103_6: null,
      __keys__P_103_7: null,
      __cache__P_103_8: null,
      __currentType__P_103_9: null,
      __currentAction__P_103_10: null,
      __sessionActive__P_103_11: false,
      __validDrop__P_103_12: false,
      __validAction__P_103_13: false,
      __dragTargetWidget__P_103_14: null,
      __startConfig__P_103_15: null,

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER INTERFACE
      ---------------------------------------------------------------------------
      */
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {},
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {// Nothing needs to be done here
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {// Nothing needs to be done here
      },

      /*
      ---------------------------------------------------------------------------
        PUBLIC METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Registers a supported type
       *
       * @param type {String} The type to add
       */
      addType: function addType(type) {
        this.__types__P_103_5[type] = true;
      },

      /**
       * Registers a supported action. One of <code>move</code>,
       * <code>copy</code> or <code>alias</code>.
       *
       * @param action {String} The action to add
       */
      addAction: function addAction(action) {
        this.__actions__P_103_6[action] = true;
      },

      /**
       * Whether the current drag target supports the given type
       *
       * @param type {String} Any type
       * @return {Boolean} Whether the type is supported
       */
      supportsType: function supportsType(type) {
        return !!this.__types__P_103_5[type];
      },

      /**
       * Whether the current drag target supports the given action
       *
       * @param type {String} Any type
       * @return {Boolean} Whether the action is supported
       */
      supportsAction: function supportsAction(type) {
        return !!this.__actions__P_103_6[type];
      },

      /**
       * Whether the current drop target allows the current drag target.
       *
       * @param isAllowed {Boolean} False if a drop should be disallowed
       */
      setDropAllowed: function setDropAllowed(isAllowed) {
        this.__validDrop__P_103_12 = isAllowed;

        this.__detectAction__P_103_16();
      },

      /**
       * Returns the data of the given type during the <code>drop</code> event
       * on the drop target. This method fires a <code>droprequest</code> at
       * the drag target which should be answered by calls to {@link #addData}.
       *
       * Note that this is a synchronous method and if any of the drag and drop
       * events handlers are implemented using Promises, this may fail; @see
       * `getDataAsync`.
       *
       * @param type {String} Any supported type
       * @return {var} The result data in a promise
       */
      getData: function getData(type) {
        if (!this.__validDrop__P_103_12 || !this.__dropTarget__P_103_3) {
          throw new Error("This method must not be used outside the drop event listener!");
        }

        if (!this.__types__P_103_5[type]) {
          throw new Error("Unsupported data type: " + type + "!");
        }

        if (!this.__cache__P_103_8[type]) {
          this.__currentType__P_103_9 = type;

          this.__fireEvent__P_103_17("droprequest", this.__dragTarget__P_103_4, this.__dropTarget__P_103_3, false, false);
        }

        if (!this.__cache__P_103_8[type]) {
          throw new Error("Please use a droprequest listener to the drag source to fill the manager with data!");
        }

        return this.__cache__P_103_8[type] || null;
      },

      /**
       * Returns the data of the given type during the <code>drop</code> event
       * on the drop target. This method fires a <code>droprequest</code> at
       * the drag target which should be answered by calls to {@link #addData}.
       *
       * @param type {String} Any supported type
       * @return {qx.Promise} The result data in a promise
       */
      getDataAsync: function getDataAsync(type) {
        if (!this.__validDrop__P_103_12 || !this.__dropTarget__P_103_3) {
          throw new Error("This method must not be used outside the drop event listener!");
        }

        if (!this.__types__P_103_5[type]) {
          throw new Error("Unsupported data type: " + type + "!");
        }

        var tracker = {};
        var self = this;

        if (!this.__cache__P_103_8[type]) {
          qx.event.Utils.then(tracker, function () {
            self.__currentType__P_103_9 = type;
            return self.__fireEvent__P_103_17("droprequest", self.__dragTarget__P_103_4, self.__dropTarget__P_103_3, false);
          });
        }

        return qx.event.Utils.then(tracker, function () {
          if (!this.__cache__P_103_8[type]) {
            throw new Error("Please use a droprequest listener to the drag source to fill the manager with data!");
          }

          return this.__cache__P_103_8[type] || null;
        });
      },

      /**
       * Returns the currently selected action (by user keyboard modifiers)
       *
       * @return {String} One of <code>move</code>, <code>copy</code> or
       *    <code>alias</code>
       */
      getCurrentAction: function getCurrentAction() {
        this.__detectAction__P_103_16();

        return this.__currentAction__P_103_10;
      },

      /**
       * Returns the currently selected action (by user keyboard modifiers)
       *
       * @return {qx.Promise|String} One of <code>move</code>, <code>copy</code> or
       *    <code>alias</code>
       */
      getCurrentActionAsync: qx.core.Environment.select("qx.promise", {
        "true": function _true() {
          var self = this;
          return qx.Promise.resolve(self.__detectAction__P_103_16()).then(function () {
            return self.__currentAction__P_103_10;
          });
        },
        "false": function _false() {
          throw new Error(this.classname + ".getCurrentActionAsync not supported because qx.promise==false");
        }
      }),

      /**
       * Returns the widget which has been the target of the drag start.
       * @return {qx.ui.core.Widget} The widget on which the drag started.
       */
      getDragTarget: function getDragTarget() {
        return this.__dragTargetWidget__P_103_14;
      },

      /**
       * Adds data of the given type to the internal storage. The data
       * is available until the <code>dragend</code> event is fired.
       *
       * @param type {String} Any valid type
       * @param data {var} Any data to store
       */
      addData: function addData(type, data) {
        this.__cache__P_103_8[type] = data;
      },

      /**
       * Returns the type which was requested last.
       *
       * @return {String} The last requested data type
       */
      getCurrentType: function getCurrentType() {
        return this.__currentType__P_103_9;
      },

      /**
       * Returns if a drag session is currently active
       *
       * @return {Boolean} active drag session
       */
      isSessionActive: function isSessionActive() {
        return this.__sessionActive__P_103_11;
      },

      /*
      ---------------------------------------------------------------------------
        INTERNAL UTILS
      ---------------------------------------------------------------------------
      */

      /**
       * Rebuilds the internal data storage used during a drag&drop session
       */
      __rebuildStructures__P_103_2: function __rebuildStructures__P_103_2() {
        this.__types__P_103_5 = {};
        this.__actions__P_103_6 = {};
        this.__keys__P_103_7 = {};
        this.__cache__P_103_8 = {};
      },

      /**
       * Detects the current action and stores it under the private
       * field <code>__currentAction</code>. Also fires the event
       * <code>dragchange</code> on every modification.
       *
       * @return {qx.Promise|null}
       */
      __detectAction__P_103_16: function __detectAction__P_103_16() {
        if (this.__dragTarget__P_103_4 == null) {
          {
            return qx.Promise.reject();
          }
        }

        var actions = this.__actions__P_103_6;
        var keys = this.__keys__P_103_7;
        var current = null;

        if (this.__validDrop__P_103_12) {
          if (keys.Shift && keys.Control && actions.alias) {
            current = "alias";
          } else if (keys.Shift && keys.Alt && actions.copy) {
            current = "copy";
          } else if (keys.Shift && actions.move) {
            current = "move";
          } else if (keys.Alt && actions.alias) {
            current = "alias";
          } else if (keys.Control && actions.copy) {
            current = "copy";
          } else if (actions.move) {
            current = "move";
          } else if (actions.copy) {
            current = "copy";
          } else if (actions.alias) {
            current = "alias";
          }
        }

        var self = this;
        var tracker = {};
        var old = this.__currentAction__P_103_10;

        if (current != old) {
          if (this.__dropTarget__P_103_3) {
            qx.event.Utils["catch"](function () {
              self.__validAction__P_103_13 = false;
              current = null;
            });
            qx.event.Utils.then(tracker, function () {
              self.__currentAction__P_103_10 = current;
              return self.__fireEvent__P_103_17("dragchange", self.__dropTarget__P_103_3, self.__dragTarget__P_103_4, true);
            });
            qx.event.Utils.then(tracker, function (validAction) {
              self.__validAction__P_103_13 = validAction;

              if (!validAction) {
                current = null;
              }
            });
          }
        }

        return qx.event.Utils.then(tracker, function () {
          if (current != old) {
            self.__currentAction__P_103_10 = current;
            return self.__fireEvent__P_103_17("dragchange", self.__dragTarget__P_103_4, self.__dropTarget__P_103_3, false);
          }
        });
      },

      /**
       * Wrapper for {@link qx.event.Registration#fireEvent} for drag&drop events
       * needed in this class.
       *
       * @param type {String} Event type
       * @param target {Object} Target to fire on
       * @param relatedTarget {Object} Related target, i.e. drag or drop target
       *    depending on the drag event
       * @param cancelable {Boolean} Whether the event is cancelable
       * @param original {qx.event.type.Pointer} Original pointer event
       * @return {qx.Promise|Boolean} <code>true</code> if the event's default behavior was
       * not prevented
       */
      __fireEvent__P_103_17: function __fireEvent__P_103_17(type, target, relatedTarget, cancelable, original, async) {
        var Registration = qx.event.Registration;
        var dragEvent = Registration.createEvent(type, qx.event.type.Drag, [cancelable, original]);

        if (target !== relatedTarget) {
          dragEvent.setRelatedTarget(relatedTarget);
        }

        var result = Registration.dispatchEvent(target, dragEvent);
        {
          if (async === undefined || async) {
            return qx.Promise.resolve(result).then(function () {
              return !dragEvent.getDefaultPrevented();
            });
          } else {
            {
              if (qx.Promise.isPromise(result)) {
                this.error('DragDrop event "' + type + '" returned a promise but a synchronous event was required, drag and drop may not work as expected (consider using getDataAsync)');
              }
            }
            return result;
          }
        }
      },

      /**
       * Finds next draggable parent of the given element. Maybe the element itself as well.
       *
       * Looks for the attribute <code>qxDraggable</code> with the value <code>on</code>.
       *
       * @param elem {Element} The element to query
       * @return {Element} The next parent element which is draggable. May also be <code>null</code>
       */
      __findDraggable__P_103_18: function __findDraggable__P_103_18(elem) {
        while (elem && elem.nodeType == 1) {
          if (elem.getAttribute("qxDraggable") == "on") {
            return elem;
          }

          elem = elem.parentNode;
        }

        return null;
      },

      /**
       * Finds next droppable parent of the given element. Maybe the element itself as well.
       *
       * Looks for the attribute <code>qxDroppable</code> with the value <code>on</code>.
       *
       * @param elem {Element} The element to query
       * @return {Element} The next parent element which is droppable. May also be <code>null</code>
       */
      __findDroppable__P_103_19: function __findDroppable__P_103_19(elem) {
        while (elem && elem.nodeType == 1) {
          if (elem.getAttribute("qxDroppable") == "on") {
            return elem;
          }

          elem = elem.parentNode;
        }

        return null;
      },

      /**
       * Cleans up a drag&drop session when <code>dragstart</code> was fired before.
       *
       * @return {qx.Promise?} promise, if one was created by event handlers
       */
      clearSession: function clearSession() {
        //this.debug("clearSession");
        // Deregister from root events
        this.__manager__P_103_0.removeListener(this.__root__P_103_1, "pointermove", this._onPointermove, this);

        this.__manager__P_103_0.removeListener(this.__root__P_103_1, "pointerup", this._onPointerup, this, true);

        this.__manager__P_103_0.removeListener(this.__root__P_103_1, "keydown", this._onKeyDown, this, true);

        this.__manager__P_103_0.removeListener(this.__root__P_103_1, "keyup", this._onKeyUp, this, true);

        this.__manager__P_103_0.removeListener(this.__root__P_103_1, "keypress", this._onKeyPress, this, true);

        this.__manager__P_103_0.removeListener(this.__root__P_103_1, "roll", this._onRoll, this, true);

        var tracker = {};
        var self = this; // Fire dragend event

        if (this.__dragTarget__P_103_4) {
          qx.event.Utils.then(tracker, function () {
            return self.__fireEvent__P_103_17("dragend", self.__dragTarget__P_103_4, self.__dropTarget__P_103_3, false);
          });
        }

        return qx.event.Utils.then(tracker, function () {
          // Cleanup
          self.__validDrop__P_103_12 = false;
          self.__dropTarget__P_103_3 = null;

          if (self.__dragTargetWidget__P_103_14) {
            self.__dragTargetWidget__P_103_14.removeState("drag");

            self.__dragTargetWidget__P_103_14 = null;
          } // Clear init
          //self.debug("Clearing drag target");


          self.__dragTarget__P_103_4 = null;
          self.__sessionActive__P_103_11 = false;
          self.__startConfig__P_103_15 = null;

          self.__rebuildStructures__P_103_2();
        });
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Handler for long tap which takes care of starting the drag & drop session for
       * touch interactions.
       * @param e {qx.event.type.Tap} The longtap event.
       */
      _onLongtap: function _onLongtap(e) {
        // only for touch
        if (e.getPointerType() != "touch") {
          return;
        } // prevent scrolling


        this.__manager__P_103_0.addListener(this.__root__P_103_1, "roll", this._onRoll, this, true);

        return this._start(e);
      },

      /**
       * Helper to start the drag & drop session. It is responsible for firing the
       * dragstart event and attaching the key listener.
       * @param e {qx.event.type.Pointer} Either a longtap or pointermove event.
       *
       * @return {Boolean} Returns <code>false</code> if drag session should be
       * canceled.
       */
      _start: function _start(e) {
        // only for primary pointer and allowed buttons
        var isButtonOk = qx.event.handler.DragDrop.ALLOWED_BUTTONS.indexOf(e.getButton()) !== -1;

        if (!e.isPrimary() || !isButtonOk) {
          return false;
        } // start target can be none as the drag & drop handler might
        // be created after the first start event


        var target = this.__startConfig__P_103_15 ? this.__startConfig__P_103_15.target : e.getTarget();

        var draggable = this.__findDraggable__P_103_18(target);

        if (draggable) {
          // This is the source target
          //this.debug("Setting dragtarget = " + draggable);
          this.__dragTarget__P_103_4 = draggable;
          var widgetOriginalTarget = qx.ui.core.Widget.getWidgetByElement(this.__startConfig__P_103_15.original);

          while (widgetOriginalTarget && widgetOriginalTarget.isAnonymous()) {
            widgetOriginalTarget = widgetOriginalTarget.getLayoutParent();
          }

          if (widgetOriginalTarget) {
            this.__dragTargetWidget__P_103_14 = widgetOriginalTarget;
            widgetOriginalTarget.addState("drag");
          } // fire cancelable dragstart


          var self = this;
          var tracker = {};
          qx.event.Utils["catch"](function () {
            //self.debug("dragstart FAILED, setting __sessionActive=false");
            self.__sessionActive__P_103_11 = false;
          });
          qx.event.Utils.then(tracker, function () {
            return self.__fireEvent__P_103_17("dragstart", self.__dragTarget__P_103_4, self.__dropTarget__P_103_3, true, e);
          });
          return qx.event.Utils.then(tracker, function (validAction) {
            if (!validAction) {
              return;
            } //self.debug("dragstart ok, setting __sessionActive=true")


            self.__manager__P_103_0.addListener(self.__root__P_103_1, "keydown", self._onKeyDown, self, true);

            self.__manager__P_103_0.addListener(self.__root__P_103_1, "keyup", self._onKeyUp, self, true);

            self.__manager__P_103_0.addListener(self.__root__P_103_1, "keypress", self._onKeyPress, self, true);

            self.__sessionActive__P_103_11 = true;
          });
        }
      },

      /**
       * Event handler for the pointerdown event which stores the initial targets and the coordinates.
       * @param e {qx.event.type.Pointer} The pointerdown event.
       */
      _onPointerdown: function _onPointerdown(e) {
        if (e.isPrimary()) {
          this.__startConfig__P_103_15 = {
            target: e.getTarget(),
            original: e.getOriginalTarget(),
            left: e.getDocumentLeft(),
            top: e.getDocumentTop()
          };

          this.__manager__P_103_0.addListener(this.__root__P_103_1, "pointermove", this._onPointermove, this);

          this.__manager__P_103_0.addListener(this.__root__P_103_1, "pointerup", this._onPointerup, this, true);
        }
      },

      /**
       * Event handler for the pointermove event which starts the drag session and
       * is responsible for firing the drag, dragover and dragleave event.
       * @param e {qx.event.type.Pointer} The pointermove event.
       */
      _onPointermove: function _onPointermove(e) {
        // only allow drag & drop for primary pointer
        if (!e.isPrimary()) {
          return;
        } //this.debug("_onPointermove: start");


        var self = this;
        var tracker = {};
        qx.event.Utils["catch"](function () {
          return self.clearSession();
        }); // start the drag session for mouse

        if (!self.__sessionActive__P_103_11 && e.getPointerType() == "mouse") {
          var delta = self._getDelta(e); // if the mouse moved a bit in any direction


          var distance = qx.event.handler.DragDrop.MIN_DRAG_DISTANCE;

          if (delta && (Math.abs(delta.x) > distance || Math.abs(delta.y) > distance)) {
            //self.debug("_onPointermove: outside min drag distance");
            qx.event.Utils.then(tracker, function () {
              return self._start(e);
            });
          }
        }

        return qx.event.Utils.then(tracker, function () {
          // check if the session has been activated
          if (!self.__sessionActive__P_103_11) {
            //self.debug("not active");
            return;
          }

          var tracker = {};
          qx.event.Utils.then(tracker, function () {
            //self.debug("active, firing drag");
            return self.__fireEvent__P_103_17("drag", self.__dragTarget__P_103_4, self.__dropTarget__P_103_3, true, e);
          });
          qx.event.Utils.then(tracker, function (validAction) {
            if (!validAction) {
              this.clearSession();
            } //self.debug("drag");
            // find current hovered droppable


            var el = e.getTarget();

            if (self.__startConfig__P_103_15.target === el) {
              // on touch devices the native events return wrong elements as target (its always the element where the dragging started)
              el = e.getNativeEvent().view.document.elementFromPoint(e.getDocumentLeft(), e.getDocumentTop());
            }

            var cursor = self.getCursor();

            if (!cursor) {
              cursor = qx.ui.core.DragDropCursor.getInstance();
            }

            var cursorEl = cursor.getContentElement().getDomElement();

            if (cursorEl && (el === cursorEl || cursorEl.contains(el))) {
              var display = qx.bom.element.Style.get(cursorEl, "display"); // get the cursor out of the way

              qx.bom.element.Style.set(cursorEl, "display", "none");
              el = e.getNativeEvent().view.document.elementFromPoint(e.getDocumentLeft(), e.getDocumentTop());
              qx.bom.element.Style.set(cursorEl, "display", display);
            }

            if (el !== cursorEl) {
              var droppable = self.__findDroppable__P_103_19(el); // new drop target detected


              if (droppable && droppable != self.__dropTarget__P_103_3) {
                var dropLeaveTarget = self.__dropTarget__P_103_3;
                self.__validDrop__P_103_12 = true; // initial value should be true

                self.__dropTarget__P_103_3 = droppable;
                var innerTracker = {};
                qx.event.Utils["catch"](innerTracker, function () {
                  self.__dropTarget__P_103_3 = null;
                  self.__validDrop__P_103_12 = false;
                }); // fire dragleave for previous drop target

                if (dropLeaveTarget) {
                  qx.event.Utils.then(innerTracker, function () {
                    return self.__fireEvent__P_103_17("dragleave", dropLeaveTarget, self.__dragTarget__P_103_4, false, e);
                  });
                }

                qx.event.Utils.then(innerTracker, function () {
                  return self.__fireEvent__P_103_17("dragover", droppable, self.__dragTarget__P_103_4, true, e);
                });
                return qx.event.Utils.then(innerTracker, function (validDrop) {
                  self.__validDrop__P_103_12 = validDrop;
                });
              } // only previous drop target
              else if (!droppable && self.__dropTarget__P_103_3) {
                var innerTracker = {};
                qx.event.Utils.then(innerTracker, function () {
                  return self.__fireEvent__P_103_17("dragleave", self.__dropTarget__P_103_3, self.__dragTarget__P_103_4, false, e);
                });
                return qx.event.Utils.then(innerTracker, function () {
                  self.__dropTarget__P_103_3 = null;
                  self.__validDrop__P_103_12 = false;
                  return self.__detectAction__P_103_16();
                });
              }
            }
          });
          return qx.event.Utils.then(tracker, function () {
            // Reevaluate current action
            var keys = self.__keys__P_103_7;
            keys.Control = e.isCtrlPressed();
            keys.Shift = e.isShiftPressed();
            keys.Alt = e.isAltPressed();
            return self.__detectAction__P_103_16();
          });
        });
      },

      /**
       * Helper function to compute the delta between current cursor position from given event
       * and the stored coordinates at {@link #_onPointerdown}.
       *
       * @param e {qx.event.type.Pointer} The pointer event
       *
       * @return {Map} containing the deltaX as x, and deltaY as y.
       */
      _getDelta: function _getDelta(e) {
        if (!this.__startConfig__P_103_15) {
          return null;
        }

        var deltaX = e.getDocumentLeft() - this.__startConfig__P_103_15.left;

        var deltaY = e.getDocumentTop() - this.__startConfig__P_103_15.top;

        return {
          x: deltaX,
          y: deltaY
        };
      },

      /**
       * Handler for the pointerup event which is responsible fore firing the drop event.
       * @param e {qx.event.type.Pointer} The pointerup event
       */
      _onPointerup: function _onPointerup(e) {
        if (!e.isPrimary()) {
          return;
        }

        var tracker = {};
        var self = this; // Fire drop event in success case

        if (this.__validDrop__P_103_12 && this.__validAction__P_103_13) {
          qx.event.Utils.then(tracker, function () {
            return self.__fireEvent__P_103_17("drop", self.__dropTarget__P_103_3, self.__dragTarget__P_103_4, false, e);
          });
        }

        return qx.event.Utils.then(tracker, function () {
          // Stop event
          if (e.getTarget() == self.__dragTarget__P_103_4) {
            e.stopPropagation();
          } // Clean up


          return self.clearSession();
        });
      },

      /**
       * Roll listener to stop scrolling on touch devices.
       * @param e {qx.event.type.Roll} The roll event.
       */
      _onRoll: function _onRoll(e) {
        e.stop();
      },

      /**
       * Event listener for window's <code>blur</code> event
       *
       * @param e {qx.event.type.Event} Event object
       */
      _onWindowBlur: function _onWindowBlur(e) {
        return this.clearSession();
      },

      /**
       * Event listener for root's <code>keydown</code> event
       *
       * @param e {qx.event.type.KeySequence} Event object
       */
      _onKeyDown: function _onKeyDown(e) {
        var iden = e.getKeyIdentifier();

        switch (iden) {
          case "Alt":
          case "Control":
          case "Shift":
            if (!this.__keys__P_103_7[iden]) {
              this.__keys__P_103_7[iden] = true;
              return this.__detectAction__P_103_16();
            }

        }
      },

      /**
       * Event listener for root's <code>keyup</code> event
       *
       * @param e {qx.event.type.KeySequence} Event object
       */
      _onKeyUp: function _onKeyUp(e) {
        var iden = e.getKeyIdentifier();

        switch (iden) {
          case "Alt":
          case "Control":
          case "Shift":
            if (this.__keys__P_103_7[iden]) {
              this.__keys__P_103_7[iden] = false;
              return this.__detectAction__P_103_16();
            }

        }
      },

      /**
       * Event listener for root's <code>keypress</code> event
       *
       * @param e {qx.event.type.KeySequence} Event object
       */
      _onKeyPress: function _onKeyPress(e) {
        var iden = e.getKeyIdentifier();

        switch (iden) {
          case "Escape":
            return this.clearSession();
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      qx.event.Registration.removeListener(window, "blur", this._onWindowBlur, this); // Clear fields

      this.__dragTarget__P_103_4 = this.__dropTarget__P_103_3 = this.__manager__P_103_0 = this.__root__P_103_1 = this.__types__P_103_5 = this.__actions__P_103_6 = this.__keys__P_103_7 = this.__cache__P_103_8 = null;
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      qx.event.Registration.addHandler(statics);
    }
  });
  qx.event.handler.DragDrop.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.MRemoteChildrenHandling": {
        "require": true
      },
      "qx.ui.core.MRemoteLayoutHandling": {
        "require": true
      },
      "qx.ui.core.MResizable": {
        "require": true
      },
      "qx.ui.core.MMovable": {
        "require": true
      },
      "qx.ui.core.MContentPadding": {
        "require": true
      },
      "qx.ui.layout.VBox": {
        "construct": true
      },
      "qx.core.Init": {
        "construct": true
      },
      "qx.ui.core.FocusHandler": {
        "construct": true
      },
      "qx.ui.window.Manager": {
        "require": true
      },
      "qx.ui.window.IDesktop": {},
      "qx.ui.container.Composite": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.basic.Label": {},
      "qx.ui.layout.Grid": {},
      "qx.ui.basic.Image": {},
      "qx.ui.form.Button": {},
      "qx.event.type.Event": {},
      "qx.bom.client.Engine": {
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * A window widget
   *
   * More information can be found in the package description {@link qx.ui.window}.
   *
   * @childControl statusbar {qx.ui.container.Composite} statusbar container which shows the statusbar text
   * @childControl statusbar-text {qx.ui.basic.Label} text of the statusbar
   * @childControl pane {qx.ui.container.Composite} window pane which holds the content
   * @childControl captionbar {qx.ui.container.Composite} Container for all widgets inside the captionbar
   * @childControl icon {qx.ui.basic.Image} icon at the left of the captionbar
   * @childControl title {qx.ui.basic.Label} caption of the window
   * @childControl minimize-button {qx.ui.form.Button} button to minimize the window
   * @childControl restore-button {qx.ui.form.Button} button to restore the window
   * @childControl maximize-button {qx.ui.form.Button} button to maximize the window
   * @childControl close-button {qx.ui.form.Button} button to close the window
   */
  qx.Class.define("qx.ui.window.Window", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MRemoteChildrenHandling, qx.ui.core.MRemoteLayoutHandling, qx.ui.core.MResizable, qx.ui.core.MMovable, qx.ui.core.MContentPadding],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param caption {String?} The caption text
     * @param icon {String?} The URL of the caption bar icon
     */
    construct: function construct(caption, icon) {
      qx.ui.core.Widget.constructor.call(this); // configure internal layout

      this._setLayout(new qx.ui.layout.VBox()); // force creation of captionbar


      this._createChildControl("captionbar");

      this._createChildControl("pane"); // apply constructor parameters


      if (icon != null) {
        this.setIcon(icon);
      }

      if (caption != null) {
        this.setCaption(caption);
      } // Update captionbar


      this._updateCaptionBar(); // Activation listener


      this.addListener("pointerdown", this._onWindowPointerDown, this, true); // Focusout listener

      this.addListener("focusout", this._onWindowFocusOut, this); // Automatically add to application root.

      qx.core.Init.getApplication().getRoot().add(this); // Initialize visibility

      this.initVisibility(); // Register as root for the focus handler

      qx.ui.core.FocusHandler.getInstance().addRoot(this); // Change the resize frames appearance

      this._getResizeFrame().setAppearance("window-resize-frame"); // ARIA attrs


      this.getContentElement().setAttribute("role", "dialog");
      this.addAriaLabelledBy(this.getChildControl("title"));
      this.addAriaDescribedBy(this.getChildControl("statusbar-text"));
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Class} The default window manager class. */
      DEFAULT_MANAGER_CLASS: qx.ui.window.Manager
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired before the window is closed.
       *
       * The close action can be prevented by calling
       * {@link qx.event.type.Event#preventDefault} on the event object
       */
      beforeClose: "qx.event.type.Event",

      /** Fired if the window is closed */
      close: "qx.event.type.Event",

      /**
       * Fired before the window is minimize.
       *
       * The minimize action can be prevented by calling
       * {@link qx.event.type.Event#preventDefault} on the event object
       */
      beforeMinimize: "qx.event.type.Event",

      /** Fired if the window is minimized */
      minimize: "qx.event.type.Event",

      /**
       * Fired before the window is maximize.
       *
       * The maximize action can be prevented by calling
       * {@link qx.event.type.Event#preventDefault} on the event object
       */
      beforeMaximize: "qx.event.type.Event",

      /** Fired if the window is maximized */
      maximize: "qx.event.type.Event",

      /**
       * Fired before the window is restored from a minimized or maximized state.
       *
       * The restored action can be prevented by calling
       * {@link qx.event.type.Event#preventDefault} on the event object
       */
      beforeRestore: "qx.event.type.Event",

      /** Fired if the window is restored from a minimized or maximized state */
      restore: "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /*
      ---------------------------------------------------------------------------
        INTERNAL OPTIONS
      ---------------------------------------------------------------------------
      */
      // overridden
      appearance: {
        refine: true,
        init: "window"
      },
      // overridden
      visibility: {
        refine: true,
        init: "excluded"
      },
      // overridden
      focusable: {
        refine: true,
        init: true
      },

      /**
       * If the window is active, only one window in a single qx.ui.window.Manager could
       *  have set this to true at the same time.
       */
      active: {
        check: "Boolean",
        init: false,
        apply: "_applyActive",
        event: "changeActive"
      },

      /*
      ---------------------------------------------------------------------------
        BASIC OPTIONS
      ---------------------------------------------------------------------------
      */

      /** Should the window be always on top */
      alwaysOnTop: {
        check: "Boolean",
        init: false,
        event: "changeAlwaysOnTop"
      },

      /** Should the window be modal (this disables minimize and maximize buttons) */
      modal: {
        check: "Boolean",
        init: false,
        event: "changeModal",
        apply: "_applyModal"
      },

      /** The text of the caption */
      caption: {
        apply: "_applyCaptionBarChange",
        event: "changeCaption",
        nullable: true
      },

      /** The icon of the caption */
      icon: {
        check: "String",
        nullable: true,
        apply: "_applyCaptionBarChange",
        event: "changeIcon",
        themeable: true
      },

      /** The text of the statusbar */
      status: {
        check: "String",
        nullable: true,
        apply: "_applyStatus",
        event: "changeStatus"
      },

      /*
      ---------------------------------------------------------------------------
        HIDE CAPTIONBAR FEATURES
      ---------------------------------------------------------------------------
      */

      /** Should the close button be shown */
      showClose: {
        check: "Boolean",
        init: true,
        apply: "_applyCaptionBarChange",
        themeable: true
      },

      /** Should the maximize button be shown */
      showMaximize: {
        check: "Boolean",
        init: true,
        apply: "_applyCaptionBarChange",
        themeable: true
      },

      /** Should the minimize button be shown */
      showMinimize: {
        check: "Boolean",
        init: true,
        apply: "_applyCaptionBarChange",
        themeable: true
      },

      /*
      ---------------------------------------------------------------------------
        DISABLE CAPTIONBAR FEATURES
      ---------------------------------------------------------------------------
      */

      /** Should the user have the ability to close the window */
      allowClose: {
        check: "Boolean",
        init: true,
        apply: "_applyCaptionBarChange"
      },

      /** Should the user have the ability to maximize the window */
      allowMaximize: {
        check: "Boolean",
        init: true,
        apply: "_applyCaptionBarChange"
      },

      /** Should the user have the ability to minimize the window */
      allowMinimize: {
        check: "Boolean",
        init: true,
        apply: "_applyCaptionBarChange"
      },

      /*
      ---------------------------------------------------------------------------
        STATUSBAR CONFIG
      ---------------------------------------------------------------------------
      */

      /** Should the statusbar be shown */
      showStatusbar: {
        check: "Boolean",
        init: false,
        apply: "_applyShowStatusbar"
      },

      /*
      ---------------------------------------------------------------------------
        WHEN TO AUTOMATICALY CENTER
      ---------------------------------------------------------------------------
      */

      /** Whether this window should be automatically centered when it appears */
      centerOnAppear: {
        init: false,
        check: "Boolean",
        apply: "_applyCenterOnAppear"
      },

      /**
       * Whether this window should be automatically centered when its container
       * is resized.
       */
      centerOnContainerResize: {
        init: false,
        check: "Boolean",
        apply: "_applyCenterOnContainerResize"
      },

      /*
      ---------------------------------------------------------------------------
        CLOSE BEHAVIOR
      ---------------------------------------------------------------------------
      */

      /**
       * Should the window be automatically destroyed when it is closed.
       *
       * When false, closing the window behaves like hiding the window.
       *
       * When true, the window is removed from its container (the root), all
       * listeners are removed, the window's widgets are removed, and the window
       * is destroyed.
       *
       * NOTE: If any widgets that were added to this window require special
       * clean-up, you should listen on the 'close' event and remove and clean
       * up those widgets there.
       */
      autoDestroy: {
        check: "Boolean",
        init: false
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */

    /* eslint-disable @qooxdoo/qx/no-refs-in-members */
    members: {
      /** @type {Integer} Original top value before maximation had occurred */
      __restoredTop__P_25_0: null,

      /** @type {Integer} Original left value before maximation had occurred */
      __restoredLeft__P_25_1: null,

      /** @type {Integer} Listener ID for centering on appear */
      __centeringAppearId__P_25_2: null,

      /** @type {Integer} Listener ID for centering on resize */
      __centeringResizeId__P_25_3: null,

      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */

      /**
       * The children container needed by the {@link qx.ui.core.MRemoteChildrenHandling}
       * mixin
       *
       * @return {qx.ui.container.Composite} pane sub widget
       */
      getChildrenContainer: function getChildrenContainer() {
        return this.getChildControl("pane");
      },
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        active: true,
        maximized: true,
        showStatusbar: true,
        modal: true
      },
      // overridden
      setLayoutParent: function setLayoutParent(parent) {
        var oldParent;
        {
          parent && this.assertInterface(parent, qx.ui.window.IDesktop, "Windows can only be added to widgets, which implement the interface qx.ui.window.IDesktop. All root widgets implement this interface.");
        } // Before changing the parent, if there's a prior one, remove our resize
        // listener

        oldParent = this.getLayoutParent();

        if (oldParent && this.__centeringResizeId__P_25_3) {
          oldParent.removeListenerById(this.__centeringResizeId__P_25_3);
          this.__centeringResizeId__P_25_3 = null;
        } // Call the superclass


        qx.ui.window.Window.superclass.prototype.setLayoutParent.call(this, parent); // Re-add a listener for resize, if required

        if (parent && this.getCenterOnContainerResize()) {
          this.__centeringResizeId__P_25_3 = parent.addListener("resize", this.center, this);
        }
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "statusbar":
            control = new qx.ui.container.Composite(new qx.ui.layout.HBox());

            this._add(control);

            control.add(this.getChildControl("statusbar-text"));
            break;

          case "statusbar-text":
            control = new qx.ui.basic.Label();
            control.setValue(this.getStatus());
            break;

          case "pane":
            control = new qx.ui.container.Composite();

            this._add(control, {
              flex: 1
            });

            break;

          case "captionbar":
            // captionbar
            var layout = new qx.ui.layout.Grid();
            layout.setRowFlex(0, 1);
            layout.setColumnFlex(1, 1);
            control = new qx.ui.container.Composite(layout);

            this._add(control); // captionbar events


            control.addListener("dbltap", this._onCaptionPointerDblTap, this); // register as move handle

            this._activateMoveHandle(control);

            break;

          case "icon":
            control = new qx.ui.basic.Image(this.getIcon());
            this.getChildControl("captionbar").add(control, {
              row: 0,
              column: 0
            });
            break;

          case "title":
            control = new qx.ui.basic.Label(this.getCaption());
            control.setWidth(0);
            control.setAllowGrowX(true);
            var captionBar = this.getChildControl("captionbar");
            captionBar.add(control, {
              row: 0,
              column: 1
            });
            break;

          case "minimize-button":
            control = new qx.ui.form.Button();
            control.setFocusable(false);
            control.addListener("execute", this._onMinimizeButtonTap, this);
            this.getChildControl("captionbar").add(control, {
              row: 0,
              column: 2
            });
            break;

          case "restore-button":
            control = new qx.ui.form.Button();
            control.setFocusable(false);
            control.addListener("execute", this._onRestoreButtonTap, this);
            this.getChildControl("captionbar").add(control, {
              row: 0,
              column: 3
            });
            break;

          case "maximize-button":
            control = new qx.ui.form.Button();
            control.setFocusable(false);
            control.addListener("execute", this._onMaximizeButtonTap, this);
            this.getChildControl("captionbar").add(control, {
              row: 0,
              column: 4
            });
            break;

          case "close-button":
            control = new qx.ui.form.Button();
            control.setFocusable(false);
            control.addListener("execute", this._onCloseButtonTap, this);
            this.getChildControl("captionbar").add(control, {
              row: 0,
              column: 6
            });
            break;
        }

        return control || qx.ui.window.Window.superclass.prototype._createChildControlImpl.call(this, id);
      },

      /*
      ---------------------------------------------------------------------------
        CAPTIONBAR INTERNALS
      ---------------------------------------------------------------------------
      */

      /**
       * Updates the status and the visibility of each element of the captionbar.
       */
      _updateCaptionBar: function _updateCaptionBar() {
        var btn;
        var icon = this.getIcon();

        if (icon) {
          this.getChildControl("icon").setSource(icon);

          this._showChildControl("icon");
        } else {
          this._excludeChildControl("icon");
        }

        var caption = this.getCaption();

        if (caption) {
          this.getChildControl("title").setValue(caption);

          this._showChildControl("title");
        } else {
          this._excludeChildControl("title");
        }

        if (this.getShowMinimize()) {
          this._showChildControl("minimize-button");

          btn = this.getChildControl("minimize-button");
          this.getAllowMinimize() ? btn.resetEnabled() : btn.setEnabled(false);
        } else {
          this._excludeChildControl("minimize-button");
        }

        if (this.getShowMaximize()) {
          if (this.isMaximized()) {
            this._showChildControl("restore-button");

            this._excludeChildControl("maximize-button");
          } else {
            this._showChildControl("maximize-button");

            this._excludeChildControl("restore-button");
          }

          btn = this.getChildControl("maximize-button");
          this.getAllowMaximize() ? btn.resetEnabled() : btn.setEnabled(false);
        } else {
          this._excludeChildControl("maximize-button");

          this._excludeChildControl("restore-button");
        }

        if (this.getShowClose()) {
          this._showChildControl("close-button");

          btn = this.getChildControl("close-button");
          this.getAllowClose() ? btn.resetEnabled() : btn.setEnabled(false);
        } else {
          this._excludeChildControl("close-button");
        }
      },

      /*
      ---------------------------------------------------------------------------
        USER API
      ---------------------------------------------------------------------------
      */

      /**
       * Close the current window instance.
       *
       * Simply calls the {@link qx.ui.core.Widget#hide} method if the
       * {@link qx.ui.win.Window#autoDestroy} property is false; otherwise
       * removes and destroys the window.
       */
      close: function close() {
        if (!this.getAutoDestroy() && !this.isVisible()) {
          return;
        }

        if (this.fireNonBubblingEvent("beforeClose", qx.event.type.Event, [false, true])) {
          this.hide();
          this.fireEvent("close");
        } // If automatically destroying the window upon close was requested, do
        // so now. (Note that we explicitly re-obtain the autoDestroy property
        // value, allowing the user's close handler to enable/disable it before
        // here.)


        if (this.getAutoDestroy()) {
          this.dispose();
        }
      },

      /**
       * Open the window.
       */
      open: function open() {
        this.show();
        this.setActive(true);
        this.focus();
      },

      /**
       * Centers the window to the parent.
       *
       * This call works with the size of the parent widget and the size of
       * the window as calculated in the last layout flush. It is best to call
       * this method just after rendering the window in the "resize" event:
       * <pre class='javascript'>
       *   win.addListenerOnce("resize", this.center, this);
       * </pre>
       */
      center: function center() {
        var parent = this.getLayoutParent();

        if (parent) {
          var bounds = parent.getBounds();

          if (bounds) {
            var hint = this.getSizeHint();
            var left = Math.round((bounds.width - hint.width) / 2);
            var top = Math.round((bounds.height - hint.height) / 2);

            if (top < 0) {
              top = 0;
            }

            this.moveTo(left, top);
            return;
          }
        }

        {
          this.warn("Centering depends on parent bounds!");
        }
      },

      /**
       * Maximize the window.
       */
      maximize: function maximize() {
        // If the window is already maximized -> return
        if (this.isMaximized()) {
          return;
        } // First check if the parent uses a canvas layout
        // Otherwise maximize() is not possible


        var parent = this.getLayoutParent();

        if (parent != null && parent.supportsMaximize()) {
          if (this.fireNonBubblingEvent("beforeMaximize", qx.event.type.Event, [false, true])) {
            if (!this.isVisible()) {
              this.open();
            } // store current dimension and location


            var props = this.getLayoutProperties();
            this.__restoredLeft__P_25_1 = props.left === undefined ? 0 : props.left;
            this.__restoredTop__P_25_0 = props.top === undefined ? 0 : props.top; // Update layout properties

            this.setLayoutProperties({
              left: null,
              top: null,
              edge: 0
            }); // Add state

            this.addState("maximized"); // Update captionbar

            this._updateCaptionBar(); // Fire user event


            this.fireEvent("maximize");
          }
        }
      },

      /**
       * Minimized the window.
       */
      minimize: function minimize() {
        if (!this.isVisible()) {
          return;
        }

        if (this.fireNonBubblingEvent("beforeMinimize", qx.event.type.Event, [false, true])) {
          // store current dimension and location
          var props = this.getLayoutProperties();
          this.__restoredLeft__P_25_1 = props.left === undefined ? 0 : props.left;
          this.__restoredTop__P_25_0 = props.top === undefined ? 0 : props.top;
          this.removeState("maximized");
          this.hide();
          this.fireEvent("minimize");
        }
      },

      /**
       * Restore the window to <code>"normal"</code>, if it is
       * <code>"maximized"</code> or <code>"minimized"</code>.
       */
      restore: function restore() {
        if (this.getMode() === "normal") {
          return;
        }

        if (this.fireNonBubblingEvent("beforeRestore", qx.event.type.Event, [false, true])) {
          if (!this.isVisible()) {
            this.open();
          } // Restore old properties


          var left = this.__restoredLeft__P_25_1;
          var top = this.__restoredTop__P_25_0;
          this.setLayoutProperties({
            edge: null,
            left: left,
            top: top
          }); // Remove maximized state

          this.removeState("maximized"); // Update captionbar

          this._updateCaptionBar(); // Fire user event


          this.fireEvent("restore");
        }
      },

      /**
       * Set the window's position relative to its parent
       *
       * @param left {Integer} The left position
       * @param top {Integer} The top position
       */
      moveTo: function moveTo(left, top) {
        if (this.isMaximized()) {
          return;
        }

        this.setLayoutProperties({
          left: left,
          top: top
        });
      },

      /**
       * Return <code>true</code> if the window is in maximized state,
       * but note that the window in maximized state could also be invisible, this
       * is equivalent to minimized. So use the {@link qx.ui.window.Window#getMode}
       * to get the window mode.
       *
       * @return {Boolean} <code>true</code> if the window is maximized,
       *   <code>false</code> otherwise.
       */
      isMaximized: function isMaximized() {
        return this.hasState("maximized");
      },

      /**
       * Return the window mode as <code>String</code>:
       * <code>"maximized"</code>, <code>"normal"</code> or <code>"minimized"</code>.
       *
       * @return {String} The window mode as <code>String</code> value.
       */
      getMode: function getMode() {
        if (!this.isVisible()) {
          return "minimized";
        } else {
          if (this.isMaximized()) {
            return "maximized";
          } else {
            return "normal";
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyActive: function _applyActive(value, old) {
        if (old) {
          this.removeState("active");
        } else {
          this.addState("active");
        }
      },
      // property apply
      _applyModal: function _applyModal(value, old) {
        if (old) {
          this.removeState("modal");
        } else {
          this.addState("modal");
        } // ARIA attrs


        this.getContentElement().setAttribute("aria-modal", value);
      },

      /**
       * Returns the element, to which the content padding should be applied.
       *
       * @return {qx.ui.core.Widget} The content padding target.
       */
      _getContentPaddingTarget: function _getContentPaddingTarget() {
        return this.getChildControl("pane");
      },
      // property apply
      _applyShowStatusbar: function _applyShowStatusbar(value, old) {
        // store the state if the status bar is shown
        var resizeFrame = this._getResizeFrame();

        if (value) {
          this.addState("showStatusbar");
          resizeFrame.addState("showStatusbar");
        } else {
          this.removeState("showStatusbar");
          resizeFrame.removeState("showStatusbar");
        }

        if (value) {
          this._showChildControl("statusbar");
        } else {
          this._excludeChildControl("statusbar");
        }
      },
      // property apply
      _applyCaptionBarChange: function _applyCaptionBarChange(value, old) {
        this._updateCaptionBar();
      },
      // property apply
      _applyStatus: function _applyStatus(value, old) {
        var label = this.getChildControl("statusbar-text", true);

        if (label) {
          label.setValue(value);
        }
      },
      // overridden
      _applyFocusable: function _applyFocusable(value, old) {
        // Workaround for bug #7581: Don't set the tabIndex
        // to prevent native scrolling on focus in IE
        if (qx.core.Environment.get("engine.name") !== "mshtml") {
          qx.ui.window.Window.superclass.prototype._applyFocusable.call(this, value, old);
        }
      },
      _applyCenterOnAppear: function _applyCenterOnAppear(value, old) {
        // Remove prior listener for centering on appear
        if (this.__centeringAppearId__P_25_2 !== null) {
          this.removeListenerById(this.__centeringAppearId__P_25_2);
          this.__centeringAppearId__P_25_2 = null;
        } // If we are to center on appear, arrange to do so


        if (value) {
          this.__centeringAppearId__P_25_2 = this.addListener("appear", this.center, this);
        }
      },
      _applyCenterOnContainerResize: function _applyCenterOnContainerResize(value, old) {
        var parent = this.getLayoutParent(); // Remove prior listener for centering on resize

        if (this.__centeringResizeId__P_25_3 !== null) {
          parent.removeListenerById(this.__centeringResizeId__P_25_3);
          this.__centeringResizeId__P_25_3 = null;
        } // If we are to center on resize, arrange to do so


        if (value) {
          if (parent) {
            this.__centeringResizeId__P_25_3 = parent.addListener("resize", this.center, this);
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        BASIC EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Stops every event
       *
       * @param e {qx.event.type.Event} any event
       */
      _onWindowEventStop: function _onWindowEventStop(e) {
        e.stopPropagation();
      },

      /**
       * Focuses the window instance.
       *
       * @param e {qx.event.type.Pointer} pointer down event
       */
      _onWindowPointerDown: function _onWindowPointerDown(e) {
        this.setActive(true);
      },

      /**
       * Listens to the "focusout" event to deactivate the window (if the
       * currently focused widget is not a child of the window)
       *
       * @param e {qx.event.type.Focus} focus event
       */
      _onWindowFocusOut: function _onWindowFocusOut(e) {
        // only needed for non-modal windows
        if (this.getModal()) {
          return;
        } // get the current focused widget and check if it is a child


        var current = e.getRelatedTarget();

        if (current != null && !qx.ui.core.Widget.contains(this, current)) {
          this.setActive(false);
        }
      },

      /**
       * Maximizes the window or restores it if it is already
       * maximized.
       *
       * @param e {qx.event.type.Pointer} double tap event
       */
      _onCaptionPointerDblTap: function _onCaptionPointerDblTap(e) {
        if (this.getAllowMaximize() && (e.getTarget() === this.getChildControl("captionbar") || e.getTarget() === this.getChildControl("title"))) {
          this.isMaximized() ? this.restore() : this.maximize();
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENTS FOR CAPTIONBAR BUTTONS
      ---------------------------------------------------------------------------
      */

      /**
       * Minimizes the window, removes all states from the minimize button and
       * stops the further propagation of the event (calling {@link qx.event.type.Event#stopPropagation}).
       *
       * @param e {qx.event.type.Pointer} pointer tap event
       */
      _onMinimizeButtonTap: function _onMinimizeButtonTap(e) {
        this.minimize();
        this.getChildControl("minimize-button").reset();
      },

      /**
       * Restores the window, removes all states from the restore button and
       * stops the further propagation of the event (calling {@link qx.event.type.Event#stopPropagation}).
       *
       * @param e {qx.event.type.Pointer} pointer pointer event
       */
      _onRestoreButtonTap: function _onRestoreButtonTap(e) {
        this.restore();
        this.getChildControl("restore-button").reset();
      },

      /**
       * Maximizes the window, removes all states from the maximize button and
       * stops the further propagation of the event (calling {@link qx.event.type.Event#stopPropagation}).
       *
       * @param e {qx.event.type.Pointer} pointer pointer event
       */
      _onMaximizeButtonTap: function _onMaximizeButtonTap(e) {
        this.maximize();
        this.getChildControl("maximize-button").reset();
      },

      /**
       * Closes the window, removes all states from the close button and
       * stops the further propagation of the event (calling {@link qx.event.type.Event#stopPropagation}).
       *
       * @param e {qx.event.type.Pointer} pointer pointer event
       */
      _onCloseButtonTap: function _onCloseButtonTap(e) {
        this.close();
        this.getChildControl("close-button").reset();
      }
    },
    destruct: function destruct() {
      var id;
      var parent; // Remove ourselves from the focus handler

      qx.ui.core.FocusHandler.getInstance().removeRoot(this); // If we haven't been removed from our parent, clean it up too.

      parent = this.getLayoutParent();

      if (parent) {
        // Remove the listener for resize, if there is one
        id = this.__centeringResizeId__P_25_3;
        id && parent.removeListenerById(id); // Remove ourself from our parent

        parent.remove(this);
      }
    }
  });
  qx.ui.window.Window.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "require": true
      },
      "qx.ui.core.LayoutItem": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.debug": {
          "load": true
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Base class for all layout managers.
   *
   * Custom layout manager must derive from
   * this class and implement the methods {@link #invalidateLayoutCache},
   * {@link #renderLayout} and {@link #getSizeHint}.
   */
  qx.Class.define("qx.ui.layout.Abstract", {
    type: "abstract",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {Map} The cached size hint */
      __sizeHint__P_80_0: null,

      /** @type {Boolean} Whether the children cache is valid. This field is protected
       *    because sub classes must be able to access it quickly.
       */
      _invalidChildrenCache: null,

      /** @type {qx.ui.core.Widget} The connected widget */
      __widget__P_80_1: null,

      /*
      ---------------------------------------------------------------------------
        LAYOUT INTERFACE
      ---------------------------------------------------------------------------
      */

      /**
       * Invalidate all layout relevant caches. Automatically deletes the size hint.
       *
       * @abstract
       */
      invalidateLayoutCache: function invalidateLayoutCache() {
        this.__sizeHint__P_80_0 = null;
      },

      /**
       * Applies the children layout.
       *
       * @abstract
       * @param availWidth {Integer} Final width available for the content (in pixel)
       * @param availHeight {Integer} Final height available for the content (in pixel)
       * @param padding {Map} Map containing the padding values. Keys:
       * <code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>
       */
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        this.warn("Missing renderLayout() implementation!");
      },

      /**
       * Computes the layout dimensions and possible ranges of these.
       *
       * @return {Map|null} The map with the preferred width/height and the allowed
       *   minimum and maximum values in cases where shrinking or growing
       *   is required. Can also return <code>null</code> when this detection
       *   is not supported by the layout.
       */
      getSizeHint: function getSizeHint() {
        if (this.__sizeHint__P_80_0) {
          return this.__sizeHint__P_80_0;
        }

        return this.__sizeHint__P_80_0 = this._computeSizeHint();
      },

      /**
       * Whether the layout manager supports height for width.
       *
       * @return {Boolean} Whether the layout manager supports height for width
       */
      hasHeightForWidth: function hasHeightForWidth() {
        return false;
      },

      /**
       * If layout wants to trade height for width it has to implement this
       * method and return the preferred height if it is resized to
       * the given width. This function returns <code>null</code> if the item
       * do not support height for width.
       *
       * @param width {Integer} The computed width
       * @return {Integer} The desired height
       */
      getHeightForWidth: function getHeightForWidth(width) {
        this.warn("Missing getHeightForWidth() implementation!");
        return null;
      },

      /**
       * This computes the size hint of the layout and returns it.
       *
       * @abstract
       * @return {Map} The size hint.
       */
      _computeSizeHint: function _computeSizeHint() {
        return null;
      },

      /**
       * This method is called, on each child "add" and "remove" action and
       * whenever the layout data of a child is changed. The method should be used
       * to clear any children relevant cached data.
       *
       */
      invalidateChildrenCache: function invalidateChildrenCache() {
        this._invalidChildrenCache = true;
      },

      /**
       * Verifies the value of a layout property.
       *
       * Note: This method is only available in the debug builds.
       *
       * @signature function(item, name, value)
       * @param item {Object} The affected layout item
       * @param name {Object} Name of the layout property
       * @param value {Object} Value of the layout property
       */
      verifyLayoutProperty: qx.core.Environment.select("qx.debug", {
        "true": function _true(item, name, value) {// empty implementation
        },
        "false": null
      }),

      /**
       * Remove all currently visible separators
       */
      _clearSeparators: function _clearSeparators() {
        // It may be that the widget do not implement clearSeparators which is especially true
        // when it do not inherit from LayoutItem.
        var widget = this.__widget__P_80_1;

        if (widget instanceof qx.ui.core.LayoutItem) {
          widget.clearSeparators();
        }
      },

      /**
       * Renders a separator between two children
       *
       * @param separator {String|qx.ui.decoration.IDecorator} The separator to render
       * @param bounds {Map} Contains the left and top coordinate and the width and height
       *    of the separator to render.
       */
      _renderSeparator: function _renderSeparator(separator, bounds) {
        this.__widget__P_80_1.renderSeparator(separator, bounds);
      },

      /**
       * This method is called by the widget to connect the widget with the layout.
       *
       * @param widget {qx.ui.core.Widget} The widget to connect to.
       */
      connectToWidget: function connectToWidget(widget) {
        if (widget && this.__widget__P_80_1) {
          throw new Error("It is not possible to manually set the connected widget.");
        }

        this.__widget__P_80_1 = widget; // Invalidate cache

        this.invalidateChildrenCache();
      },

      /**
       * Return the widget that is this layout is responsible for.
       *
       * @return {qx.ui.core.Widget} The widget connected to this layout.
       */
      _getWidget: function _getWidget() {
        return this.__widget__P_80_1;
      },

      /**
       * Indicate that the layout has layout changed and propagate this information
       * up the widget hierarchy.
       *
       * Also a generic property apply method for all layout relevant properties.
       */
      _applyLayoutChange: function _applyLayoutChange() {
        if (this.__widget__P_80_1) {
          this.__widget__P_80_1.scheduleLayoutUpdate();
        }
      },

      /**
       * Returns the list of all layout relevant children.
       *
       * @return {Array} List of layout relevant children.
       */
      _getLayoutChildren: function _getLayoutChildren() {
        return this.__widget__P_80_1.getLayoutChildren();
      }
    },

    /*
    *****************************************************************************
       DESTRUCT
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__widget__P_80_1 = this.__sizeHint__P_80_0 = null;
    }
  });
  qx.ui.layout.Abstract.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.layout.Abstract": {
        "require": true
      },
      "qx.ui.layout.Util": {},
      "qx.lang.Type": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.debug": {
          "load": true
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The Canvas is an extended Basic layout.
   *
   * It is possible to position a widget relative to the right or bottom edge of
   * the available space. It further supports stretching between left and right
   * or top and bottom e.g. <code>left=20</code> and <code>right=20</code> would
   * keep a margin of 20 pixels to both edges. The Canvas layout has support for
   * percent dimensions and locations.
   *
   * *Features*
   *
   * * Pixel dimensions and locations
   * * Percent dimensions and locations
   * * Stretching between left+right and top+bottom
   * * Minimum and maximum dimensions
   * * Children are automatically shrunk to their minimum dimensions if not enough space is available
   * * Auto sizing (ignoring percent values)
   * * Margins (also negative ones)
   *
   * *Item Properties*
   *
   * <ul>
   * <li><strong>left</strong> <em>(Integer|String)</em>: The left coordinate in pixel or as a percent string e.g. <code>20</code> or <code>30%</code>.</li>
   * <li><strong>top</strong> <em>(Integer|String)</em>: The top coordinate in pixel or as a percent string e.g. <code>20</code> or <code>30%</code>.</li>
   * <li><strong>right</strong> <em>(Integer|String)</em>: The right coordinate in pixel or as a percent string e.g. <code>20</code> or <code>30%</code>.</li>
   * <li><strong>bottom</strong> <em>(Integer|String)</em>: The bottom coordinate in pixel or as a percent string e.g. <code>20</code> or <code>30%</code>.</li>
   * <li><strong>edge</strong> <em>(Integer|String)</em>: The coordinate in pixels or as a percent string to be used for all four edges.
   * <li><strong>width</strong> <em>(String)</em>: A percent width e.g. <code>40%</code>.</li>
   * <li><strong>height</strong> <em>(String)</em>: A percent height e.g. <code>60%</code>.</li>
   * </ul>
   *
   * *Notes*
   *
   * <ul>
   * <li>Stretching (<code>left</code>-><code>right</code> or <code>top</code>-><code>bottom</code>)
   *   has a higher priority than the preferred dimensions</li>
   * <li>Stretching has a lower priority than the min/max dimensions.</li>
   * <li>Percent values have no influence on the size hint of the layout.</li>
   * </ul>
   *
   * *Example*
   *
   * Here is a little example of how to use the canvas layout.
   *
   * <pre class="javascript">
   * var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
   *
   * // simple positioning
   * container.add(new qx.ui.core.Widget(), {top: 10, left: 10});
   *
   * // stretch vertically with 10 pixel distance to the parent's top
   * // and bottom border
   * container.add(new qx.ui.core.Widget(), {top: 10, left: 10, bottom: 10});
   *
   * // percent positioning and size
   * container.add(new qx.ui.core.Widget(), {left: "50%", top: "50%", width: "25%", height: "40%"});
   * </pre>
   *
   * *External Documentation*
   *
   * <a href='https://qooxdoo.org/documentation/#/desktop/layout/canvas.md'>
   * Extended documentation</a> and links to demos of this layout in the qooxdoo manual.
   */
  qx.Class.define("qx.ui.layout.Canvas", {
    extend: qx.ui.layout.Abstract,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * If desktop mode is active, the children's minimum sizes are ignored
       * by the layout calculation. This is necessary to prevent the desktop
       * from growing if e.g. a window is moved beyond the edge of the desktop
       */
      desktop: {
        check: "Boolean",
        init: false
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        LAYOUT INTERFACE
      ---------------------------------------------------------------------------
      */
      // overridden
      verifyLayoutProperty: qx.core.Environment.select("qx.debug", {
        "true": function _true(item, name, value) {
          var layoutProperties = {
            top: 1,
            left: 1,
            bottom: 1,
            right: 1,
            width: 1,
            height: 1,
            edge: 1
          };
          this.assert(layoutProperties[name] == 1, "The property '" + name + "' is not supported by the Canvas layout!");

          if (name == "width" || name == "height") {
            this.assertMatch(value, qx.ui.layout.Util.PERCENT_VALUE);
          } else {
            if (typeof value === "number") {
              this.assertInteger(value);
            } else if (qx.lang.Type.isString(value)) {
              this.assertMatch(value, qx.ui.layout.Util.PERCENT_VALUE);
            } else {
              this.fail("Bad format of layout property '" + name + "': " + value + ". The value must be either an integer or an percent string.");
            }
          }
        },
        "false": null
      }),
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        var children = this._getLayoutChildren();

        var child, size, props;
        var left, top, right, bottom, width, height;
        var marginTop, marginRight, marginBottom, marginLeft;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          size = child.getSizeHint();
          props = child.getLayoutProperties(); // Cache margins

          marginTop = child.getMarginTop();
          marginRight = child.getMarginRight();
          marginBottom = child.getMarginBottom();
          marginLeft = child.getMarginLeft(); // **************************************
          //   Processing location
          // **************************************

          left = props.left != null ? props.left : props.edge;

          if (qx.lang.Type.isString(left)) {
            left = Math.round(parseFloat(left) * availWidth / 100);
          }

          right = props.right != null ? props.right : props.edge;

          if (qx.lang.Type.isString(right)) {
            right = Math.round(parseFloat(right) * availWidth / 100);
          }

          top = props.top != null ? props.top : props.edge;

          if (qx.lang.Type.isString(top)) {
            top = Math.round(parseFloat(top) * availHeight / 100);
          }

          bottom = props.bottom != null ? props.bottom : props.edge;

          if (qx.lang.Type.isString(bottom)) {
            bottom = Math.round(parseFloat(bottom) * availHeight / 100);
          } // **************************************
          //   Processing dimension
          // **************************************
          // Stretching has higher priority than dimension data


          if (left != null && right != null) {
            width = availWidth - left - right - marginLeft - marginRight; // Limit computed value

            if (width < size.minWidth) {
              width = size.minWidth;
            } else if (width > size.maxWidth) {
              width = size.maxWidth;
            } // Add margin


            left += marginLeft;
          } else {
            // Layout data has higher priority than data from size hint
            width = props.width;

            if (width == null) {
              width = size.width;
            } else {
              width = Math.round(parseFloat(width) * availWidth / 100); // Limit computed value

              if (width < size.minWidth) {
                width = size.minWidth;
              } else if (width > size.maxWidth) {
                width = size.maxWidth;
              }
            } // AlignX support.


            if (left == null && right == null) {
              switch (child.getAlignX()) {
                case "center":
                  left = Math.round((availWidth - size.width) / 2 - marginRight);
                  break;

                case "right":
                  right = 0;
                  break;
              }
            }

            if (right != null) {
              left = availWidth - width - right - marginRight;
            } else if (left == null) {
              left = marginLeft;
            } else {
              left += marginLeft;
            }
          } // Stretching has higher priority than dimension data


          if (top != null && bottom != null) {
            height = availHeight - top - bottom - marginTop - marginBottom; // Limit computed value

            if (height < size.minHeight) {
              height = size.minHeight;
            } else if (height > size.maxHeight) {
              height = size.maxHeight;
            } // Add margin


            top += marginTop;
          } else {
            // Layout data has higher priority than data from size hint
            height = props.height;

            if (height == null) {
              height = size.height;
            } else {
              height = Math.round(parseFloat(height) * availHeight / 100); // Limit computed value

              if (height < size.minHeight) {
                height = size.minHeight;
              } else if (height > size.maxHeight) {
                height = size.maxHeight;
              }
            } // AlignY support.


            if (top == null && bottom == null) {
              switch (child.getAlignY()) {
                case "middle":
                  top = Math.round((availHeight - size.height) / 2 - marginBottom);
                  break;

                case "bottom":
                  bottom = 0;
                  break;
              }
            }

            if (bottom != null) {
              top = availHeight - height - bottom - marginBottom;
            } else if (top == null) {
              top = marginTop;
            } else {
              top += marginTop;
            }
          }

          left += padding.left;
          top += padding.top; // Apply layout

          child.renderLayout(left, top, width, height);
        }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var neededWidth = 0,
            neededMinWidth = 0;
        var neededHeight = 0,
            neededMinHeight = 0;
        var width, minWidth;
        var height, minHeight;

        var children = this._getLayoutChildren();

        var child, props, hint;
        var desktop = this.isDesktop();
        var left, top, right, bottom;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          props = child.getLayoutProperties();
          hint = child.getSizeHint(); // Cache margins

          var marginX = child.getMarginLeft() + child.getMarginRight();
          var marginY = child.getMarginTop() + child.getMarginBottom(); // Compute width

          width = hint.width + marginX;
          minWidth = hint.minWidth + marginX;
          left = props.left != null ? props.left : props.edge;

          if (left && typeof left === "number") {
            width += left;
            minWidth += left;
          }

          right = props.right != null ? props.right : props.edge;

          if (right && typeof right === "number") {
            width += right;
            minWidth += right;
          }

          neededWidth = Math.max(neededWidth, width);
          neededMinWidth = desktop ? 0 : Math.max(neededMinWidth, minWidth); // Compute height

          height = hint.height + marginY;
          minHeight = hint.minHeight + marginY;
          top = props.top != null ? props.top : props.edge;

          if (top && typeof top === "number") {
            height += top;
            minHeight += top;
          }

          bottom = props.bottom != null ? props.bottom : props.edge;

          if (bottom && typeof bottom === "number") {
            height += bottom;
            minHeight += bottom;
          }

          neededHeight = Math.max(neededHeight, height);
          neededMinHeight = desktop ? 0 : Math.max(neededMinHeight, minHeight);
        }

        return {
          width: neededWidth,
          minWidth: neededMinWidth,
          height: neededHeight,
          minHeight: neededMinHeight
        };
      }
    }
  });
  qx.ui.layout.Canvas.$$dbClassInfo = $$dbClassInfo;
})();
//# sourceMappingURL=package-5.js.map?dt=1673131574002
qx.$$packageData['5'] = {
  "locales": {},
  "resources": {},
  "translations": {}
};
