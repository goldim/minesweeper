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
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.util.ResourceManager": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.event.Timer": {},
      "qx.lang.Array": {},
      "qx.bom.client.OperatingSystem": {
        "require": true
      },
      "qx.bom.Stylesheet": {},
      "qx.bom.webfonts.Validator": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "engine.version": {
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
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
  ************************************************************************ */

  /**
   * Manages font-face definitions, making sure that each rule is only applied
   * once. It supports adding fonts of the same family but with different style
   * and weight. For instance, the following declaration uses 4 different source
   * files and combine them in a single font family.
   *
   * <pre class='javascript'>
   *   sources: [
   *     {
   *       family: "Sansation",
   *       source: [
   *         "fonts/Sansation-Regular.ttf"
   *       ]
   *     },
   *     {
   *       family: "Sansation",
   *       fontWeight: "bold",
   *       source: [
   *         "fonts/Sansation-Bold.ttf",
   *       ]
   *     },
   *     {
   *       family: "Sansation",
   *       fontStyle: "italic",
   *       source: [
   *         "fonts/Sansation-Italic.ttf",
   *       ]
   *     },
   *     {
   *       family: "Sansation",
   *       fontWeight: "bold",
   *       fontStyle: "italic",
   *       source: [
   *         "fonts/Sansation-BoldItalic.ttf",
   *       ]
   *     }
   *   ]
   * </pre>
   *
   * This class does not need to be disposed, except when you want to abort the loading
   * and validation process.
   */
  qx.Class.define("qx.bom.webfonts.Manager", {
    extend: qx.core.Object,
    type: "singleton",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__createdStyles__P_151_0 = [];
      this.__validators__P_151_1 = {};
      this.__queue__P_151_2 = [];
      this.__preferredFormats__P_151_3 = this.getPreferredFormats();
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * List of known font definition formats (i.e. file extensions). Used to
       * identify the type of each font file configured for a web font.
       */
      FONT_FORMATS: ["eot", "woff2", "woff", "ttf", "svg"],

      /**
       * Timeout (in ms) to wait before deciding that a web font was not loaded.
       */
      VALIDATION_TIMEOUT: 5000
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __createdStyles__P_151_0: null,
      __styleSheet__P_151_4: null,
      __validators__P_151_1: null,
      __preferredFormats__P_151_3: null,
      __queue__P_151_2: null,
      __queueInterval__P_151_5: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Adds the necessary font-face rule for a web font to the document. Also
       * creates a web font Validator ({@link qx.bom.webfonts.Validator}) that
       * checks if the webFont was applied correctly.
       *
       * @param familyName {String} Name of the web font
       * @param sourcesList {Object} List of source URLs along with their style
       * (e.g. fontStyle: "italic") and weight (e.g. fontWeight: "bold").
       * For maximum compatibility, this should include EOT, WOFF and TTF versions
       * of the font.
       * @param callback {Function?} Optional event listener callback that will be
       * executed once the validator has determined whether the webFont was
       * applied correctly.
       * See {@link qx.bom.webfonts.Validator#changeStatus}
       * @param context {Object?} Optional context for the callback function
       */
      require: function require(familyName, sourcesList, callback, context) {
        var sourceUrls = sourcesList.source;
        var comparisonString = sourcesList.comparisonString;
        var version = sourcesList.version;
        var fontWeight = sourcesList.fontWeight;
        var fontStyle = sourcesList.fontStyle;
        var sources = [];

        for (var i = 0, l = sourceUrls.length; i < l; i++) {
          var split = sourceUrls[i].split("#");
          var src = qx.util.ResourceManager.getInstance().toUri(split[0]);

          if (split.length > 1) {
            src = src + "#" + split[1];
          }

          sources.push(src);
        } // old IEs need a break in between adding @font-face rules


        if (qx.core.Environment.get("engine.name") == "mshtml" && (parseInt(qx.core.Environment.get("engine.version")) < 9 || qx.core.Environment.get("browser.documentmode") < 9)) {
          if (!this.__queueInterval__P_151_5) {
            this.__queueInterval__P_151_5 = new qx.event.Timer(100);

            this.__queueInterval__P_151_5.addListener("interval", this.__flushQueue__P_151_6, this);
          }

          if (!this.__queueInterval__P_151_5.isEnabled()) {
            this.__queueInterval__P_151_5.start();
          }

          this.__queue__P_151_2.push([familyName, sources, fontWeight, fontStyle, comparisonString, version, callback, context]);
        } else {
          this.__require__P_151_7(familyName, sources, fontWeight, fontStyle, comparisonString, version, callback, context);
        }
      },

      /**
       * Removes a font's font-face definition from the style sheet. This means
       * the font will no longer be available and any elements using it will
       * fall back to the their regular font-families.
       *
       * @param familyName {String} font-family name
       * @param fontWeight {String} the font-weight.
       * @param fontStyle {String} the font-style.
       */
      remove: function remove(familyName, fontWeight, fontStyle) {
        var fontLookupKey = this.__createFontLookupKey__P_151_8(familyName, fontWeight, fontStyle);

        var index = null;

        for (var i = 0, l = this.__createdStyles__P_151_0.length; i < l; i++) {
          if (this.__createdStyles__P_151_0[i] == fontLookupKey) {
            index = i;

            this.__removeRule__P_151_9(familyName, fontWeight, fontStyle);

            break;
          }
        }

        if (index !== null) {
          qx.lang.Array.removeAt(this.__createdStyles__P_151_0, index);
        }

        if (fontLookupKey in this.__validators__P_151_1) {
          this.__validators__P_151_1[fontLookupKey].dispose();

          delete this.__validators__P_151_1[fontLookupKey];
        }
      },

      /**
       * Returns the preferred font format(s) for the currently used browser. Some
       * browsers support multiple formats, e.g. WOFF and TTF or WOFF and EOT. In
       * those cases, WOFF is considered the preferred format.
       *
       * @return {String[]} List of supported font formats ordered by preference
       * or empty Array if none could be determined
       */
      getPreferredFormats: function getPreferredFormats() {
        var preferredFormats = [];
        var browser = qx.core.Environment.get("browser.name");
        var browserVersion = qx.core.Environment.get("browser.version");
        var os = qx.core.Environment.get("os.name");
        var osVersion = qx.core.Environment.get("os.version");

        if (browser == "edge" && browserVersion >= 14 || browser == "firefox" && browserVersion >= 69 || browser == "chrome" && browserVersion >= 36) {
          preferredFormats.push("woff2");
        }

        if (browser == "ie" && qx.core.Environment.get("browser.documentmode") >= 9 || browser == "edge" && browserVersion >= 12 || browser == "firefox" && browserVersion >= 3.6 || browser == "chrome" && browserVersion >= 6) {
          preferredFormats.push("woff");
        }

        if (browser == "edge" && browserVersion >= 12 || browser == "opera" && browserVersion >= 10 || browser == "safari" && browserVersion >= 3.1 || browser == "firefox" && browserVersion >= 3.5 || browser == "chrome" && browserVersion >= 4 || browser == "mobile safari" && os == "ios" && osVersion >= 4.2) {
          preferredFormats.push("ttf");
        }

        if (browser == "ie" && browserVersion >= 4) {
          preferredFormats.push("eot");
        }

        if (browser == "mobileSafari" && os == "ios" && osVersion >= 4.1) {
          preferredFormats.push("svg");
        }

        return preferredFormats;
      },

      /**
       * Removes the styleSheet element used for all web font definitions from the
       * document. This means all web fonts declared by the manager will no longer
       * be available and elements using them will fall back to their regular
       * font-families
       */
      removeStyleSheet: function removeStyleSheet() {
        this.__createdStyles__P_151_0 = [];

        if (this.__styleSheet__P_151_4) {
          qx.bom.Stylesheet.removeSheet(this.__styleSheet__P_151_4);
        }

        this.__styleSheet__P_151_4 = null;
      },

      /*
      ---------------------------------------------------------------------------
        PRIVATE API
      ---------------------------------------------------------------------------
      */

      /**
       * Creates a lookup key to index the created fonts.
       * @param familyName {String} font-family name
       * @param fontWeight {String} the font-weight.
       * @param fontStyle {String} the font-style.
       * @return {string} the font lookup key
       */
      __createFontLookupKey__P_151_8: function __createFontLookupKey__P_151_8(familyName, fontWeight, fontStyle) {
        var lookupKey = familyName + "_" + (fontWeight ? fontWeight : "normal") + "_" + (fontStyle ? fontStyle : "normal");
        return lookupKey;
      },

      /**
       * Does the actual work of adding stylesheet rules and triggering font
       * validation
       *
       * @param familyName {String} Name of the web font
       * @param sources {String[]} List of source URLs. For maximum compatibility,
       * this should include EOT, WOFF and TTF versions of the font.
       * @param fontWeight {String} the web font should be registered using a
       * fontWeight font weight.
       * @param fontStyle {String} the web font should be registered using an
       * fontStyle font style.
       * @param comparisonString {String} String to check whether the font has loaded or not
       * @param version {String?} Optional version that is appended to the font URL to be able to override caching
       * @param callback {Function?} Optional event listener callback that will be
       * executed once the validator has determined whether the webFont was
       * applied correctly.
       * @param context {Object?} Optional context for the callback function
       */
      __require__P_151_7: function __require__P_151_7(familyName, sources, fontWeight, fontStyle, comparisonString, version, callback, context) {
        var fontLookupKey = this.__createFontLookupKey__P_151_8(familyName, fontWeight, fontStyle);

        if (!this.__createdStyles__P_151_0.includes(fontLookupKey)) {
          var sourcesMap = this.__getSourcesMap__P_151_10(sources);

          var rule = this.__getRule__P_151_11(familyName, fontWeight, fontStyle, sourcesMap, version);

          if (!rule) {
            throw new Error("Couldn't create @font-face rule for WebFont " + familyName + "!");
          }

          if (!this.__styleSheet__P_151_4) {
            this.__styleSheet__P_151_4 = qx.bom.Stylesheet.createElement();
          }

          try {
            this.__addRule__P_151_12(rule);
          } catch (ex) {
            {
              this.warn("Error while adding @font-face rule:", ex.message);
              return;
            }
          }

          this.__createdStyles__P_151_0.push(fontLookupKey);
        }

        if (!this.__validators__P_151_1[fontLookupKey]) {
          this.__validators__P_151_1[fontLookupKey] = new qx.bom.webfonts.Validator(familyName, comparisonString, fontWeight, fontStyle);

          this.__validators__P_151_1[fontLookupKey].setTimeout(qx.bom.webfonts.Manager.VALIDATION_TIMEOUT);

          this.__validators__P_151_1[fontLookupKey].addListenerOnce("changeStatus", this.__onFontChangeStatus__P_151_13, this);
        }

        if (callback) {
          var cbContext = context || window;

          this.__validators__P_151_1[fontLookupKey].addListenerOnce("changeStatus", callback, cbContext);
        }

        this.__validators__P_151_1[fontLookupKey].validate();
      },

      /**
       * Processes the next item in the queue
       */
      __flushQueue__P_151_6: function __flushQueue__P_151_6() {
        if (this.__queue__P_151_2.length == 0) {
          this.__queueInterval__P_151_5.stop();

          return;
        }

        var next = this.__queue__P_151_2.shift();

        this.__require__P_151_7.apply(this, next);
      },

      /**
       * Removes the font-face declaration if a font could not be validated
       *
       * @param ev {qx.event.type.Data} qx.bom.webfonts.Validator#changeStatus
       */
      __onFontChangeStatus__P_151_13: function __onFontChangeStatus__P_151_13(ev) {
        var result = ev.getData();

        if (result.valid === false) {
          qx.event.Timer.once(function () {
            this.remove(result.family);
          }, this, 250);
        }
      },

      /**
       * Uses a naive regExp match to determine the format of each defined source
       * file for a webFont. Returns a map with the format names as keys and the
       * corresponding source URLs as values.
       *
       * @param sources {String[]} Array of source URLs
       * @return {Map} Map of formats and URLs
       */
      __getSourcesMap__P_151_10: function __getSourcesMap__P_151_10(sources) {
        var formats = qx.bom.webfonts.Manager.FONT_FORMATS;
        var sourcesMap = {};
        var reg = new RegExp(".(" + formats.join("|") + ")");

        for (var i = 0, l = sources.length; i < l; i++) {
          var match = reg.exec(sources[i]);

          if (match) {
            var type = match[1];
            sourcesMap[type] = sources[i];
          }
        }

        return sourcesMap;
      },

      /**
       * Assembles the body of a font-face rule for a single webFont.
       *
       * @param familyName {String} Font-family name
       * @param fontWeight {String} the web font should be registered using a
       * fontWeight font weight.
       * @param fontStyle {String} the web font should be registered using an
       * fontStyle font style.
       * @param sourcesMap {Map} Map of font formats and sources
       * @param version {String?} Optional version to be appended to the URL
       * @return {String} The computed CSS rule
       */
      __getRule__P_151_11: function __getRule__P_151_11(familyName, fontWeight, fontStyle, sourcesMap, version) {
        var rules = [];
        var formatList = this.__preferredFormats__P_151_3.length > 0 ? this.__preferredFormats__P_151_3 : qx.bom.webfonts.Manager.FONT_FORMATS;

        for (var i = 0, l = formatList.length; i < l; i++) {
          var format = formatList[i];

          if (sourcesMap[format]) {
            rules.push(this.__getSourceForFormat__P_151_14(format, sourcesMap[format], version));
          }
        }

        var rule = "src: " + rules.join(",\n") + ";";
        rule = "font-family: " + familyName + ";\n" + rule;
        rule = rule + "\nfont-style: " + (fontStyle ? fontStyle : "normal") + ";";
        rule = rule + "\nfont-weight: " + (fontWeight ? fontWeight : "normal") + ";";
        return rule;
      },

      /**
       * Returns the full src value for a given font URL depending on the type
       * @param format {String} The font format, one of eot, woff2, woff, ttf, svg
       * @param url {String} The font file's URL
       * @param version {String?} Optional version to be appended to the URL
       * @return {String} The src directive
       */
      __getSourceForFormat__P_151_14: function __getSourceForFormat__P_151_14(format, url, version) {
        if (version) {
          url += "?" + version;
        }

        switch (format) {
          case "eot":
            return "url('" + url + "');" + "src: url('" + url + "?#iefix') format('embedded-opentype')";

          case "woff2":
            return "url('" + url + "') format('woff2')";

          case "woff":
            return "url('" + url + "') format('woff')";

          case "ttf":
            return "url('" + url + "') format('truetype')";

          case "svg":
            return "url('" + url + "') format('svg')";

          default:
            return null;
        }
      },

      /**
       * Adds a font-face rule to the document
       *
       * @param rule {String} The body of the CSS rule
       */
      __addRule__P_151_12: function __addRule__P_151_12(rule) {
        var completeRule = "@font-face {" + rule + "}\n";

        if (qx.core.Environment.get("browser.name") == "ie" && qx.core.Environment.get("browser.documentmode") < 9) {
          var cssText = this.__fixCssText__P_151_15(this.__styleSheet__P_151_4.cssText);

          cssText += completeRule;
          this.__styleSheet__P_151_4.cssText = cssText;
        } else {
          this.__styleSheet__P_151_4.insertRule(completeRule, this.__styleSheet__P_151_4.cssRules.length);
        }
      },

      /**
       * Removes the font-face declaration for the given font-family from the
       * stylesheet
       *
       * @param familyName {String} The font-family name
       * @param fontWeight {String} fontWeight font-weight.
       * @param fontStyle {String} fontStyle font-style.
       */
      __removeRule__P_151_9: function __removeRule__P_151_9(familyName, fontWeight, fontStyle) {
        // In IE and edge even if the rule was added with font-style first
        // and font-weight second, it is not guaranteed that the attributes
        // remain in that order. Therefore we check for both version,
        // style first, weight second and weight first, style second.
        // Without this fix the rule isn't found and removed reliable.
        var regtext = "@font-face.*?" + familyName + "(.*font-style: *" + (fontStyle ? fontStyle : "normal") + ".*font-weight: *" + (fontWeight ? fontWeight : "normal") + ")|" + "(.*font-weight: *" + (fontWeight ? fontWeight : "normal") + ".*font-style: *" + (fontStyle ? fontStyle : "normal") + ")";
        var reg = new RegExp(regtext, "m");

        for (var i = 0, l = document.styleSheets.length; i < l; i++) {
          var sheet = document.styleSheets[i];

          if (sheet.cssText) {
            var cssText = sheet.cssText.replace(/\n/g, "").replace(/\r/g, "");
            cssText = this.__fixCssText__P_151_15(cssText);

            if (reg.exec(cssText)) {
              cssText = cssText.replace(reg, "");
            }

            sheet.cssText = cssText;
          } else {
            var cssRules = null;

            try {
              cssRules = sheet.cssRules;
            } catch (ex) {// Exception is thrown if there are no rules (eg a `<link>` tag inserted by the user)
            }

            if (cssRules) {
              for (var j = 0, m = cssRules.length; j < m; j++) {
                var cssText = cssRules[j].cssText.replace(/\n/g, "").replace(/\r/g, "");

                if (reg.exec(cssText)) {
                  this.__styleSheet__P_151_4.deleteRule(j);

                  return;
                }
              }
            }
          }
        }
      },

      /**
       * IE 6 and 7 omit the trailing quote after the format name when
       * querying cssText. This needs to be fixed before cssText is replaced
       * or all rules will be invalid and no web fonts will work any more.
       *
       * @param cssText {String} CSS text
       * @return {String} Fixed CSS text
       */
      __fixCssText__P_151_15: function __fixCssText__P_151_15(cssText) {
        return cssText.replace("'eot)", "'eot')").replace("('embedded-opentype)", "('embedded-opentype')");
      }
    },

    /*
    *****************************************************************************
      DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (this.__queueInterval__P_151_5) {
        this.__queueInterval__P_151_5.stop();

        this.__queueInterval__P_151_5.dispose();
      }

      delete this.__createdStyles__P_151_0;
      this.removeStyleSheet();

      for (var prop in this.__validators__P_151_1) {
        this.__validators__P_151_1[prop].dispose();
      }

      qx.bom.webfonts.Validator.removeDefaultHelperElements();
    }
  });
  qx.bom.webfonts.Manager.$$dbClassInfo = $$dbClassInfo;
})();

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
       2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Abstract class to compute the position of an object on one axis.
   */
  qx.Bootstrap.define("qx.util.placement.AbstractAxis", {
    extend: Object,
    statics: {
      /**
       * Computes the start of the object on the axis
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param areaSize {Integer} Size of the axis.
       * @param position {String} Alignment of the object on the target. Valid values are
       *   <ul>
       *   <li><code>edge-start</code> The object is placed before the target</li>
       *   <li><code>edge-end</code> The object is placed after the target</li>
       *   <li><code>align-start</code>The start of the object is aligned with the start of the target</li>
       *   <li><code>align-center</code>The center of the object is aligned with the center of the target</li>
       *   <li><code>align-end</code>The end of the object is aligned with the end of the object</li>
       *   </ul>
       * @return {Integer} The computed start position of the object.
       * @abstract
       */
      computeStart: function computeStart(size, target, offsets, areaSize, position) {
        throw new Error("abstract method call!");
      },

      /**
       * Computes the start of the object by taking only the attachment and
       * alignment into account. The object by be not fully visible.
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param position {String} Accepts the same values as the <code> position</code>
       *   argument of {@link #computeStart}.
       * @return {Integer} The computed start position of the object.
       */
      _moveToEdgeAndAlign: function _moveToEdgeAndAlign(size, target, offsets, position) {
        switch (position) {
          case "edge-start":
            return target.start - offsets.end - size;

          case "edge-end":
            return target.end + offsets.start;

          case "align-start":
            return target.start + offsets.start;

          case "align-center":
            return target.start + parseInt((target.end - target.start - size) / 2, 10) + offsets.start;

          case "align-end":
            return target.end - offsets.end - size;
        }
      },

      /**
       * Whether the object specified by <code>start</code> and <code>size</code>
       * is completely inside of the axis' range..
       *
       * @param start {Integer} Computed start position of the object
       * @param size {Integer} Size of the object
       * @param areaSize {Integer} The size of the axis
       * @return {Boolean} Whether the object is inside of the axis' range
       */
      _isInRange: function _isInRange(start, size, areaSize) {
        return start >= 0 && start + size <= areaSize;
      }
    }
  });
  qx.util.placement.AbstractAxis.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.placement.AbstractAxis": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Places the object directly at the specified position. It is not moved if
   * parts of the object are outside of the axis' range.
   */
  qx.Bootstrap.define("qx.util.placement.DirectAxis", {
    statics: {
      /**
       * Computes the start of the object by taking only the attachment and
       * alignment into account. The object by be not fully visible.
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param position {String} Accepts the same values as the <code> position</code>
       *   argument of {@link #computeStart}.
       * @return {Integer} The computed start position of the object.
       */
      _moveToEdgeAndAlign: qx.util.placement.AbstractAxis._moveToEdgeAndAlign,

      /**
       * Computes the start of the object on the axis
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param areaSize {Integer} Size of the axis.
       * @param position {String} Alignment of the object on the target. Valid values are
       *   <ul>
       *   <li><code>edge-start</code> The object is placed before the target</li>
       *   <li><code>edge-end</code> The object is placed after the target</li>
       *   <li><code>align-start</code>The start of the object is aligned with the start of the target</li>
       *   <li><code>align-center</code>The center of the object is aligned with the center of the target</li>
       *   <li><code>align-end</code>The end of the object is aligned with the end of the object</li>
       *   </ul>
       * @return {Integer} The computed start position of the object.
       */
      computeStart: function computeStart(size, target, offsets, areaSize, position) {
        return this._moveToEdgeAndAlign(size, target, offsets, position);
      }
    }
  });
  qx.util.placement.DirectAxis.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.placement.AbstractAxis": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Places the object to the target. If parts of the object are outside of the
   * range this class places the object at the best "edge", "alignment"
   * combination so that the overlap between object and range is maximized.
   */
  qx.Bootstrap.define("qx.util.placement.KeepAlignAxis", {
    statics: {
      /**
       * Computes the start of the object by taking only the attachment and
       * alignment into account. The object by be not fully visible.
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param position {String} Accepts the same values as the <code> position</code>
       *   argument of {@link #computeStart}.
       * @return {Integer} The computed start position of the object.
       */
      _moveToEdgeAndAlign: qx.util.placement.AbstractAxis._moveToEdgeAndAlign,

      /**
       * Whether the object specified by <code>start</code> and <code>size</code>
       * is completely inside of the axis' range..
       *
       * @param start {Integer} Computed start position of the object
       * @param size {Integer} Size of the object
       * @param areaSize {Integer} The size of the axis
       * @return {Boolean} Whether the object is inside of the axis' range
       */
      _isInRange: qx.util.placement.AbstractAxis._isInRange,

      /**
       * Computes the start of the object on the axis
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param areaSize {Integer} Size of the axis.
       * @param position {String} Alignment of the object on the target. Valid values are
       *   <ul>
       *   <li><code>edge-start</code> The object is placed before the target</li>
       *   <li><code>edge-end</code> The object is placed after the target</li>
       *   <li><code>align-start</code>The start of the object is aligned with the start of the target</li>
       *   <li><code>align-center</code>The center of the object is aligned with the center of the target</li>
       *   <li><code>align-end</code>The end of the object is aligned with the end of the object</li>
       *   </ul>
       * @return {Integer} The computed start position of the object.
       */
      computeStart: function computeStart(size, target, offsets, areaSize, position) {
        var start = this._moveToEdgeAndAlign(size, target, offsets, position);

        var range1End, range2Start;

        if (this._isInRange(start, size, areaSize)) {
          return start;
        }

        if (position == "edge-start" || position == "edge-end") {
          range1End = target.start - offsets.end;
          range2Start = target.end + offsets.start;
        } else {
          range1End = target.end - offsets.end;
          range2Start = target.start + offsets.start;
        }

        if (range1End > areaSize - range2Start) {
          start = Math.max(0, range1End - size);
        } else {
          start = range2Start;
        }

        return start;
      }
    }
  });
  qx.util.placement.KeepAlignAxis.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.placement.AbstractAxis": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Places the object according to the target. If parts of the object are outside
   * of the axis' range the object's start is adjusted so that the overlap between
   * the object and the axis is maximized.
   */
  qx.Bootstrap.define("qx.util.placement.BestFitAxis", {
    statics: {
      /**
       * Whether the object specified by <code>start</code> and <code>size</code>
       * is completely inside of the axis' range..
       *
       * @param start {Integer} Computed start position of the object
       * @param size {Integer} Size of the object
       * @param areaSize {Integer} The size of the axis
       * @return {Boolean} Whether the object is inside of the axis' range
       */
      _isInRange: qx.util.placement.AbstractAxis._isInRange,

      /**
       * Computes the start of the object by taking only the attachment and
       * alignment into account. The object by be not fully visible.
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param position {String} Accepts the same values as the <code> position</code>
       *   argument of {@link #computeStart}.
       * @return {Integer} The computed start position of the object.
       */
      _moveToEdgeAndAlign: qx.util.placement.AbstractAxis._moveToEdgeAndAlign,

      /**
       * Computes the start of the object on the axis
       *
       * @param size {Integer} Size of the object to align
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>start</code> and <code>end</code>.
       * @param offsets {Map} Map with all offsets on each side.
       *   Comes with the keys <code>start</code> and <code>end</code>.
       * @param areaSize {Integer} Size of the axis.
       * @param position {String} Alignment of the object on the target. Valid values are
       *   <ul>
       *   <li><code>edge-start</code> The object is placed before the target</li>
       *   <li><code>edge-end</code> The object is placed after the target</li>
       *   <li><code>align-start</code>The start of the object is aligned with the start of the target</li>
       *   <li><code>align-center</code>The center of the object is aligned with the center of the target</li>
       *   <li><code>align-end</code>The end of the object is aligned with the end of the object</li>
       *   </ul>
       * @return {Integer} The computed start position of the object.
       */
      computeStart: function computeStart(size, target, offsets, areaSize, position) {
        var start = this._moveToEdgeAndAlign(size, target, offsets, position);

        if (this._isInRange(start, size, areaSize)) {
          return start;
        }

        if (start < 0) {
          start = Math.min(0, areaSize - size);
        }

        if (start + size > areaSize) {
          start = Math.max(0, areaSize - size);
        }

        return start;
      }
    }
  });
  qx.util.placement.BestFitAxis.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "construct": true,
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.Emitter": {
        "require": true
      },
      "qx.bom.client.CssAnimation": {
        "construct": true,
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "css.animation": {
          "construct": true,
          "className": "qx.bom.client.CssAnimation"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * This is a simple handle, which will be returned when an animation is
   * started using the {@link qx.bom.element.Animation#animate} method. It
   * basically controls the animation.
   *
   * @ignore(qx.bom.element.AnimationJs)
   */
  qx.Bootstrap.define("qx.bom.element.AnimationHandle", {
    extend: qx.event.Emitter,
    construct: function construct() {
      var css = qx.core.Environment.get("css.animation");
      this.__playState__P_189_0 = css && css["play-state"];
      this.__playing__P_189_1 = true;
      this.addListenerOnce("end", this.__setEnded__P_189_2, this);
    },
    events: {
      /** Fired when the animation started via {@link qx.bom.element.Animation}. */
      start: "Element",

      /**
       * Fired when the animation started via {@link qx.bom.element.Animation} has
       * ended.
       */
      end: "Element",

      /** Fired on every iteration of the animation. */
      iteration: "Element"
    },
    members: {
      __playState__P_189_0: null,
      __playing__P_189_1: false,
      __ended__P_189_3: false,

      /**
       * Accessor of the playing state.
       * @return {Boolean} <code>true</code>, if the animations is playing.
       */
      isPlaying: function isPlaying() {
        return this.__playing__P_189_1;
      },

      /**
       * Accessor of the ended state.
       * @return {Boolean} <code>true</code>, if the animations has ended.
       */
      isEnded: function isEnded() {
        return this.__ended__P_189_3;
      },

      /**
       * Accessor of the paused state.
       * @return {Boolean} <code>true</code>, if the animations is paused.
       */
      isPaused: function isPaused() {
        return this.el.style[this.__playState__P_189_0] == "paused";
      },

      /**
       * Pauses the animation, if running. If not running, it will be ignored.
       */
      pause: function pause() {
        if (this.el) {
          this.el.style[this.__playState__P_189_0] = "paused";
          this.el.$$animation.__playing__P_189_1 = false; // in case the animation is based on JS

          if (this.animationId && qx.bom.element.AnimationJs) {
            qx.bom.element.AnimationJs.pause(this);
          }
        }
      },

      /**
       * Resumes an animation. This does not start the animation once it has ended.
       * In this case you need to start a new Animation.
       */
      play: function play() {
        if (this.el) {
          this.el.style[this.__playState__P_189_0] = "running";
          this.el.$$animation.__playing__P_189_1 = true; // in case the animation is based on JS

          if (this.i != undefined && qx.bom.element.AnimationJs) {
            qx.bom.element.AnimationJs.play(this);
          }
        }
      },

      /**
       * Stops the animation if running.
       */
      stop: function stop() {
        if (this.el && qx.core.Environment.get("css.animation") && !this.jsAnimation) {
          this.el.style[this.__playState__P_189_0] = "";
          this.el.style[qx.core.Environment.get("css.animation").name] = "";
          this.el.$$animation.__playing__P_189_1 = false;
          this.el.$$animation.__ended__P_189_3 = true;
        } // in case the animation is based on JS
        else if (this.jsAnimation) {
          this.stopped = true;
          qx.bom.element.AnimationJs.stop(this);
        }
      },

      /**
       * Set the animation state to ended
       */
      __setEnded__P_189_2: function __setEnded__P_189_2() {
        this.__playing__P_189_1 = false;
        this.__ended__P_189_3 = true;
      }
    }
  });
  qx.bom.element.AnimationHandle.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.Style": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["css.transform", "css.transform.3d"],
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
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * Responsible for checking all relevant CSS transform properties.
   *
   * Specs:
   * http://www.w3.org/TR/css3-2d-transforms/
   * http://www.w3.org/TR/css3-3d-transforms/
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.CssTransform", {
    statics: {
      /**
       * Main check method which returns an object if CSS animations are
       * supported. This object contains all necessary keys to work with CSS
       * animations.
       * <ul>
       *  <li><code>name</code> The name of the css transform style</li>
       *  <li><code>style</code> The name of the css transform-style style</li>
       *  <li><code>origin</code> The name of the transform-origin style</li>
       *  <li><code>3d</code> Whether 3d transforms are supported</li>
       *  <li><code>perspective</code> The name of the perspective style</li>
       *  <li><code>perspective-origin</code> The name of the perspective-origin style</li>
       *  <li><code>backface-visibility</code> The name of the backface-visibility style</li>
       * </ul>
       *
       * @internal
       * @return {Object|null} The described object or null, if animations are
       *   not supported.
       */
      getSupport: function getSupport() {
        var name = qx.bom.client.CssTransform.getName();

        if (name != null) {
          return {
            name: name,
            style: qx.bom.client.CssTransform.getStyle(),
            origin: qx.bom.client.CssTransform.getOrigin(),
            "3d": qx.bom.client.CssTransform.get3D(),
            perspective: qx.bom.client.CssTransform.getPerspective(),
            "perspective-origin": qx.bom.client.CssTransform.getPerspectiveOrigin(),
            "backface-visibility": qx.bom.client.CssTransform.getBackFaceVisibility()
          };
        }

        return null;
      },

      /**
       * Checks for the style name used to set the transform origin.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getStyle: function getStyle() {
        return qx.bom.Style.getPropertyName("transformStyle");
      },

      /**
       * Checks for the style name used to set the transform origin.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getPerspective: function getPerspective() {
        return qx.bom.Style.getPropertyName("perspective");
      },

      /**
       * Checks for the style name used to set the perspective origin.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getPerspectiveOrigin: function getPerspectiveOrigin() {
        return qx.bom.Style.getPropertyName("perspectiveOrigin");
      },

      /**
       * Checks for the style name used to set the backface visibility.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getBackFaceVisibility: function getBackFaceVisibility() {
        return qx.bom.Style.getPropertyName("backfaceVisibility");
      },

      /**
       * Checks for the style name used to set the transform origin.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getOrigin: function getOrigin() {
        return qx.bom.Style.getPropertyName("transformOrigin");
      },

      /**
       * Checks for the style name used for transforms.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getName: function getName() {
        return qx.bom.Style.getPropertyName("transform");
      },

      /**
       * Checks if 3D transforms are supported.
       * @internal
       * @return {Boolean} <code>true</code>, if 3D transformations are supported
       */
      get3D: function get3D() {
        return qx.bom.client.CssTransform.getPerspective() != null;
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("css.transform", statics.getSupport);
      qx.core.Environment.add("css.transform.3d", statics.get3D);
    }
  });
  qx.bom.client.CssTransform.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.CssTransform": {
        "require": true
      },
      "qx.bom.Style": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.transform": {
          "load": true,
          "className": "qx.bom.client.CssTransform"
        },
        "css.transform.3d": {
          "className": "qx.bom.client.CssTransform"
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
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * This class is responsible for applying CSS3 transforms to plain DOM elements.
   * The implementation is mostly a cross browser wrapper for applying the
   * transforms.
   * The API is keep to the spec as close as possible.
   *
   * http://www.w3.org/TR/css3-3d-transforms/
   */
  qx.Bootstrap.define("qx.bom.element.Transform", {
    statics: {
      /** Internal storage of the CSS names */
      __cssKeys__P_190_0: qx.core.Environment.get("css.transform"),

      /**
       * Method to apply multiple transforms at once to the given element. It
       * takes a map containing the transforms you want to apply plus the values
       * e.g.<code>{scale: 2, rotate: "5deg"}</code>.
       * The values can be either singular, which means a single value will
       * be added to the CSS. If you give an array, the values will be split up
       * and each array entry will be used for the X, Y or Z dimension in that
       * order e.g. <code>{scale: [2, 0.5]}</code> will result in a element
       * double the size in X direction and half the size in Y direction.
       * The values can be either singular, which means a single value will
       * be added to the CSS. If you give an array, the values will be join to
       * a string.
       * 3d suffixed properties will be taken for translate and scale if they are
       * available and an array with three values is given.
       * Make sure your browser supports all transformations you apply.
       *
       * @param el {Element} The element to apply the transformation.
       * @param transforms {Map} The map containing the transforms and value.
       */
      transform: function transform(el, transforms) {
        var transformCss = this.getTransformValue(transforms);

        if (this.__cssKeys__P_190_0 != null) {
          var style = this.__cssKeys__P_190_0["name"];
          el.style[style] = transformCss;
        }
      },

      /**
       * Translates the given element by the given value. For further details, take
       * a look at the {@link #transform} method.
       * @param el {Element} The element to apply the transformation.
       * @param value {String|Array} The value to translate e.g. <code>"10px"</code>.
       */
      translate: function translate(el, value) {
        this.transform(el, {
          translate: value
        });
      },

      /**
       * Scales the given element by the given value. For further details, take
       * a look at the {@link #transform} method.
       * @param el {Element} The element to apply the transformation.
       * @param value {Number|Array} The value to scale.
       */
      scale: function scale(el, value) {
        this.transform(el, {
          scale: value
        });
      },

      /**
       * Rotates the given element by the given value. For further details, take
       * a look at the {@link #transform} method.
       * @param el {Element} The element to apply the transformation.
       * @param value {String|Array} The value to rotate e.g. <code>"90deg"</code>.
       */
      rotate: function rotate(el, value) {
        this.transform(el, {
          rotate: value
        });
      },

      /**
       * Skews the given element by the given value. For further details, take
       * a look at the {@link #transform} method.
       * @param el {Element} The element to apply the transformation.
       * @param value {String|Array} The value to skew e.g. <code>"90deg"</code>.
       */
      skew: function skew(el, value) {
        this.transform(el, {
          skew: value
        });
      },

      /**
       * Converts the given map to a string which could be added to a css
       * stylesheet.
       * @param transforms {Map} The transforms map. For a detailed description,
       * take a look at the {@link #transform} method.
       * @return {String} The CSS value.
       */
      getCss: function getCss(transforms) {
        var transformCss = this.getTransformValue(transforms);

        if (this.__cssKeys__P_190_0 != null) {
          var style = this.__cssKeys__P_190_0["name"];
          return qx.bom.Style.getCssName(style) + ":" + transformCss + ";";
        }

        return "";
      },

      /**
       * Sets the transform-origin property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-origin-property
       * @param el {Element} The dom element to set the property.
       * @param value {String} CSS position values like <code>50% 50%</code> or
       *   <code>left top</code>.
       */
      setOrigin: function setOrigin(el, value) {
        if (this.__cssKeys__P_190_0 != null) {
          el.style[this.__cssKeys__P_190_0["origin"]] = value;
        }
      },

      /**
       * Returns the transform-origin property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-origin-property
       * @param el {Element} The dom element to read the property.
       * @return {String} The set property, e.g. <code>50% 50%</code>
       */
      getOrigin: function getOrigin(el) {
        if (this.__cssKeys__P_190_0 != null) {
          return el.style[this.__cssKeys__P_190_0["origin"]];
        }

        return "";
      },

      /**
       * Sets the transform-style property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-style-property
       * @param el {Element} The dom element to set the property.
       * @param value {String} Either <code>flat</code> or <code>preserve-3d</code>.
       */
      setStyle: function setStyle(el, value) {
        if (this.__cssKeys__P_190_0 != null) {
          el.style[this.__cssKeys__P_190_0["style"]] = value;
        }
      },

      /**
       * Returns the transform-style property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-style-property
       * @param el {Element} The dom element to read the property.
       * @return {String} The set property, either <code>flat</code> or
       *   <code>preserve-3d</code>.
       */
      getStyle: function getStyle(el) {
        if (this.__cssKeys__P_190_0 != null) {
          return el.style[this.__cssKeys__P_190_0["style"]];
        }

        return "";
      },

      /**
       * Sets the perspective property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-property
       * @param el {Element} The dom element to set the property.
       * @param value {Number} The perspective layer. Numbers between 100
       *   and 5000 give the best results.
       */
      setPerspective: function setPerspective(el, value) {
        if (this.__cssKeys__P_190_0 != null) {
          el.style[this.__cssKeys__P_190_0["perspective"]] = value + "px";
        }
      },

      /**
       * Returns the perspective property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-property
       * @param el {Element} The dom element to read the property.
       * @return {String} The set property, e.g. <code>500</code>
       */
      getPerspective: function getPerspective(el) {
        if (this.__cssKeys__P_190_0 != null) {
          return el.style[this.__cssKeys__P_190_0["perspective"]];
        }

        return "";
      },

      /**
       * Sets the perspective-origin property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-origin-property
       * @param el {Element} The dom element to set the property.
       * @param value {String} CSS position values like <code>50% 50%</code> or
       *   <code>left top</code>.
       */
      setPerspectiveOrigin: function setPerspectiveOrigin(el, value) {
        if (this.__cssKeys__P_190_0 != null) {
          el.style[this.__cssKeys__P_190_0["perspective-origin"]] = value;
        }
      },

      /**
       * Returns the perspective-origin property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-origin-property
       * @param el {Element} The dom element to read the property.
       * @return {String} The set property, e.g. <code>50% 50%</code>
       */
      getPerspectiveOrigin: function getPerspectiveOrigin(el) {
        if (this.__cssKeys__P_190_0 != null) {
          var value = el.style[this.__cssKeys__P_190_0["perspective-origin"]];

          if (value != "") {
            return value;
          } else {
            var valueX = el.style[this.__cssKeys__P_190_0["perspective-origin"] + "X"];
            var valueY = el.style[this.__cssKeys__P_190_0["perspective-origin"] + "Y"];

            if (valueX != "") {
              return valueX + " " + valueY;
            }
          }
        }

        return "";
      },

      /**
       * Sets the backface-visibility property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#backface-visibility-property
       * @param el {Element} The dom element to set the property.
       * @param value {Boolean} <code>true</code> if the backface should be visible.
       */
      setBackfaceVisibility: function setBackfaceVisibility(el, value) {
        if (this.__cssKeys__P_190_0 != null) {
          el.style[this.__cssKeys__P_190_0["backface-visibility"]] = value ? "visible" : "hidden";
        }
      },

      /**
       * Returns the backface-visibility property of the given element.
       *
       * Spec: http://www.w3.org/TR/css3-3d-transforms/#backface-visibility-property
       * @param el {Element} The dom element to read the property.
       * @return {Boolean} <code>true</code>, if the backface is visible.
       */
      getBackfaceVisibility: function getBackfaceVisibility(el) {
        if (this.__cssKeys__P_190_0 != null) {
          return el.style[this.__cssKeys__P_190_0["backface-visibility"]] == "visible";
        }

        return true;
      },

      /**
       * Converts the given transforms map to a valid CSS string.
       *
       * @param transforms {Map} A map containing the transforms.
       * @return {String} The CSS transforms.
       */
      getTransformValue: function getTransformValue(transforms) {
        var value = "";
        var properties3d = ["translate", "scale"];

        for (var property in transforms) {
          var params = transforms[property]; // if an array is given

          if (qx.Bootstrap.isArray(params)) {
            // use 3d properties for translate and scale if all 3 parameter are given
            if (params.length === 3 && properties3d.indexOf(property) > -1 && qx.core.Environment.get("css.transform.3d")) {
              value += this._compute3dProperty(property, params);
            } // use axis related properties
            else {
              value += this._computeAxisProperties(property, params);
            } // case for single values given

          } else {
            // single value case
            value += property + "(" + params + ") ";
          }
        }

        return value.trim();
      },

      /**
       * Helper function to create 3d property.
       *
       * @param property {String} Property of transform, e.g. translate
       * @param params {Array} Array with three values, each one stands for an axis.
       *
       * @return {String} Computed property and its value
       */
      _compute3dProperty: function _compute3dProperty(property, params) {
        var cssValue = "";
        property += "3d";

        for (var i = 0; i < params.length; i++) {
          if (params[i] == null) {
            params[i] = 0;
          }
        }

        cssValue += property + "(" + params.join(", ") + ") ";
        return cssValue;
      },

      /**
       * Helper function to create axis related properties.
       *
       * @param property {String} Property of transform, e.g. rotate
       * @param params {Array} Array with values, each one stands for an axis.
       *
       * @return {String} Computed property and its value
       */
      _computeAxisProperties: function _computeAxisProperties(property, params) {
        var value = "";
        var dimensions = ["X", "Y", "Z"];

        for (var i = 0; i < params.length; i++) {
          if (params[i] == null || i == 2 && !qx.core.Environment.get("css.transform.3d")) {
            continue;
          }

          value += property + dimensions[i] + "(";
          value += params[i];
          value += ") ";
        }

        return value;
      }
    }
  });
  qx.bom.element.Transform.$$dbClassInfo = $$dbClassInfo;
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
      },
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.Iframe": {},
      "qx.event.type.Data": {}
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
   * This handler provides a "load" event for iframes
   */
  qx.Class.define("qx.event.handler.Iframe", {
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
        load: 1,
        navigate: 1
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: false,

      /**
       * Internal function called by iframes created using {@link qx.bom.Iframe}.
       *
       * @signature function(target)
       * @internal
       * @param target {Element} DOM element which is the target of this event
       */
      onevent: qx.event.GlobalError.observeMethod(function (target) {
        // Fire navigate event when actual URL diverges from stored URL
        var currentUrl = qx.bom.Iframe.queryCurrentUrl(target);

        if (currentUrl !== target.$$url) {
          qx.event.Registration.fireEvent(target, "navigate", qx.event.type.Data, [currentUrl]);
          target.$$url = currentUrl;
        } // Always fire load event


        qx.event.Registration.fireEvent(target, "load");
      })
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
      canHandleEvent: function canHandleEvent(target, type) {
        return target.tagName.toLowerCase() === "iframe";
      },
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
  qx.event.handler.Iframe.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.Iframe": {
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
      "qx.lang.Object": {},
      "qx.dom.Element": {},
      "qx.dom.Hierarchy": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.OperatingSystem": {
        "require": true
      },
      "qx.log.Logger": {},
      "qx.bom.Event": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "os.name": {
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Jonathan Weiß (jonathan_rass)
       * Christian Hagendorn (Chris_schmidt)
  
  ************************************************************************ */

  /**
   * Cross browser abstractions to work with iframes.
   *
   * @require(qx.event.handler.Iframe)
   */
  qx.Class.define("qx.bom.Iframe", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * @type {Map} Default attributes for creation {@link #create}.
       */
      DEFAULT_ATTRIBUTES: {
        frameBorder: 0,
        frameSpacing: 0,
        marginWidth: 0,
        marginHeight: 0,
        hspace: 0,
        vspace: 0,
        border: 0,
        allowTransparency: true
      },

      /**
       * Creates an DOM element.
       *
       * Attributes may be given directly with this call. This is critical
       * for some attributes e.g. name, type, ... in many clients.
       *
       * @param attributes {Map?null} Map of attributes to apply
       * @param win {Window?null} Window to create the element for
       * @return {Element} The created iframe node
       */
      create: function create(attributes, win) {
        // Work on a copy to not modify given attributes map
        var attributes = attributes ? qx.lang.Object.clone(attributes) : {};
        var initValues = qx.bom.Iframe.DEFAULT_ATTRIBUTES;

        for (var key in initValues) {
          if (!(key in attributes)) {
            attributes[key] = initValues[key];
          }
        }

        var elem = qx.dom.Element.create("iframe", attributes, win);

        if (!("onload" in attributes)) {
          elem.onload = function () {
            qx.event.handler.Iframe.onevent(elem);
          };
        }

        return elem;
      },

      /**
       * Get the DOM window object of an iframe.
       *
       * @param iframe {Element} DOM element of the iframe.
       * @return {Window?null} The DOM window object of the iframe or null.
       * @signature function(iframe)
       */
      getWindow: function getWindow(iframe) {
        try {
          return iframe.contentWindow;
        } catch (ex) {
          return null;
        }
      },

      /**
       * Get the DOM document object of an iframe.
       *
       * @param iframe {Element} DOM element of the iframe.
       * @return {Document} The DOM document object of the iframe.
       */
      getDocument: function getDocument(iframe) {
        if ("contentDocument" in iframe) {
          try {
            return iframe.contentDocument;
          } catch (ex) {
            return null;
          }
        }

        try {
          var win = this.getWindow(iframe);
          return win ? win.document : null;
        } catch (ex) {
          return null;
        }
      },

      /**
       * Get the HTML body element of the iframe.
       *
       * @param iframe {Element} DOM element of the iframe.
       * @return {Element} The DOM node of the <code>body</code> element of the iframe.
       */
      getBody: function getBody(iframe) {
        try {
          var doc = this.getDocument(iframe);
          return doc ? doc.getElementsByTagName("body")[0] : null;
        } catch (ex) {
          return null;
        }
      },

      /**
       * Sets iframe's source attribute to given value
       *
       * @param iframe {Element} DOM element of the iframe.
       * @param source {String} URL to be set.
       * @signature function(iframe, source)
       */
      setSource: function setSource(iframe, source) {
        try {
          // the guru says ...
          // it is better to use 'replace' than 'src'-attribute, since 'replace'
          // does not interfere with the history (which is taken care of by the
          // history manager), but there has to be a loaded document
          if (this.getWindow(iframe) && qx.dom.Hierarchy.isRendered(iframe)) {
            /*
              Some gecko users might have an exception here:
              Exception... "Component returned failure code: 0x805e000a
              [nsIDOMLocation.replace]"  nsresult: "0x805e000a (<unknown>)"
            */
            try {
              // Webkit on Mac can't set the source when the iframe is still
              // loading its current page
              if (qx.core.Environment.get("engine.name") == "webkit" && qx.core.Environment.get("os.name") == "osx") {
                var contentWindow = this.getWindow(iframe);

                if (contentWindow) {
                  contentWindow.stop();
                }
              }

              this.getWindow(iframe).location.replace(source);
            } catch (ex) {
              iframe.src = source;
            }
          } else {
            iframe.src = source;
          } // This is a programmer provided source. Remember URL for this source
          // for later comparison with current URL. The current URL can diverge
          // if the end-user navigates in the Iframe.


          this.__rememberUrl__P_191_0(iframe);
        } catch (ex) {
          qx.log.Logger.warn("Iframe source could not be set!");
        }
      },

      /**
       * Returns the current (served) URL inside the iframe
       *
       * @param iframe {Element} DOM element of the iframe.
       * @return {String} Returns the location href or null (if a query is not possible/allowed)
       */
      queryCurrentUrl: function queryCurrentUrl(iframe) {
        var doc = this.getDocument(iframe);

        try {
          if (doc && doc.location) {
            return doc.location.href;
          }
        } catch (ex) {}

        return "";
      },

      /**
       * Remember actual URL of iframe.
       *
       * @param iframe {Element} DOM element of the iframe.
       */
      __rememberUrl__P_191_0: function __rememberUrl__P_191_0(iframe) {
        // URL can only be detected after load. Retrieve and store URL once.
        var callback = function callback() {
          qx.bom.Event.removeNativeListener(iframe, "load", callback);
          iframe.$$url = qx.bom.Iframe.queryCurrentUrl(iframe);
        };

        qx.bom.Event.addNativeListener(iframe, "load", callback);
      }
    }
  });
  qx.bom.Iframe.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Assert": {},
      "qx.lang.Object": {},
      "qx.dom.Element": {},
      "qx.lang.Type": {},
      "qx.bom.client.Engine": {
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine",
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
       * Andreas Ecker (ecker)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * jQuery
       http://jquery.com
       Version 1.3.1
  
       Copyright:
         2009 John Resig
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
  ************************************************************************ */

  /**
   * Cross browser abstractions to work with input elements.
   */
  qx.Bootstrap.define("qx.bom.Input", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Map} Internal data structures with all supported input types */
      __types__P_192_0: {
        text: 1,
        textarea: 1,
        select: 1,
        checkbox: 1,
        radio: 1,
        password: 1,
        hidden: 1,
        submit: 1,
        image: 1,
        file: 1,
        search: 1,
        reset: 1,
        button: 1
      },

      /**
       * Creates an DOM input/textarea/select element.
       *
       * Attributes may be given directly with this call. This is critical
       * for some attributes e.g. name, type, ... in many clients.
       *
       * Note: <code>select</code> and <code>textarea</code> elements are created
       * using the identically named <code>type</code>.
       *
       * @param type {String} Any valid type for HTML, <code>select</code>
       *   and <code>textarea</code>
       * @param attributes {Map} Map of attributes to apply
       * @param win {Window} Window to create the element for
       * @return {Element} The created input node
       */
      create: function create(type, attributes, win) {
        {
          qx.core.Assert.assertKeyInMap(type, this.__types__P_192_0, "Unsupported input type.");
        } // Work on a copy to not modify given attributes map

        var attributes = attributes ? qx.lang.Object.clone(attributes) : {};
        var tag;

        if (type === "textarea" || type === "select") {
          tag = type;
        } else {
          tag = "input";
          attributes.type = type;
        }

        return qx.dom.Element.create(tag, attributes, win);
      },

      /**
       * Applies the given value to the element.
       *
       * Normally the value is given as a string/number value and applied
       * to the field content (textfield, textarea) or used to
       * detect whether the field is checked (checkbox, radiobutton).
       *
       * Supports array values for selectboxes (multiple-selection)
       * and checkboxes or radiobuttons (for convenience).
       *
       * Please note: To modify the value attribute of a checkbox or
       * radiobutton use {@link qx.bom.element.Attribute#set} instead.
       *
       * @param element {Element} element to update
       * @param value {String|Number|Array} the value to apply
       */
      setValue: function setValue(element, value) {
        var tag = element.nodeName.toLowerCase();
        var type = element.type;
        var Type = qx.lang.Type;

        if (typeof value === "number") {
          value += "";
        }

        if (type === "checkbox" || type === "radio") {
          if (Type.isArray(value)) {
            element.checked = value.includes(element.value);
          } else {
            element.checked = element.value == value;
          }
        } else if (tag === "select") {
          var isArray = Type.isArray(value);
          var options = element.options;
          var subel, subval;

          for (var i = 0, l = options.length; i < l; i++) {
            subel = options[i];
            subval = subel.getAttribute("value");

            if (subval == null) {
              subval = subel.text;
            }

            subel.selected = isArray ? value.includes(subval) : value == subval;
          }

          if (isArray && value.length == 0) {
            element.selectedIndex = -1;
          }
        } else if ((type === "text" || type === "textarea") && qx.core.Environment.get("engine.name") == "mshtml") {
          // These flags are required to detect self-made property-change
          // events during value modification. They are used by the Input
          // event handler to filter events.
          element.$$inValueSet = true;
          element.value = value;
          element.$$inValueSet = null;
        } else {
          element.value = value;
        }
      },

      /**
       * Returns the currently configured value.
       *
       * Works with simple input fields as well as with
       * select boxes or option elements.
       *
       * Returns an array in cases of multi-selection in
       * select boxes but in all other cases a string.
       *
       * @param element {Element} DOM element to query
       * @return {String|Array} The value of the given element
       */
      getValue: function getValue(element) {
        var tag = element.nodeName.toLowerCase();

        if (tag === "option") {
          return (element.attributes.value || {}).specified ? element.value : element.text;
        }

        if (tag === "select") {
          var index = element.selectedIndex; // Nothing was selected

          if (index < 0) {
            return null;
          }

          var values = [];
          var options = element.options;
          var one = element.type == "select-one";
          var clazz = qx.bom.Input;
          var value; // Loop through all the selected options

          for (var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++) {
            var option = options[i];

            if (option.selected) {
              // Get the specific value for the option
              value = clazz.getValue(option); // We don't need an array for one selects

              if (one) {
                return value;
              } // Multi-Selects return an array


              values.push(value);
            }
          }

          return values;
        } else {
          return (element.value || "").replace(/\r/g, "");
        }
      },

      /**
       * Sets the text wrap behaviour of a text area element.
       * This property uses the attribute "wrap" respectively
       * the style property "whiteSpace"
       *
       * @signature function(element, wrap)
       * @param element {Element} DOM element to modify
       * @param wrap {Boolean} Whether to turn text wrap on or off.
       */
      setWrap: qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(element, wrap) {
          var wrapValue = wrap ? "soft" : "off"; // Explicitly set overflow-y CSS property to auto when wrapped,
          // allowing the vertical scroll-bar to appear if necessary

          var styleValue = wrap ? "auto" : "";
          element.wrap = wrapValue;
          element.style.overflowY = styleValue;
        },
        gecko: function gecko(element, wrap) {
          var wrapValue = wrap ? "soft" : "off";
          var styleValue = wrap ? "" : "auto";
          element.setAttribute("wrap", wrapValue);
          element.style.overflow = styleValue;
        },
        webkit: function webkit(element, wrap) {
          var wrapValue = wrap ? "soft" : "off";
          var styleValue = wrap ? "" : "auto";
          element.setAttribute("wrap", wrapValue);
          element.style.overflow = styleValue;
        },
        "default": function _default(element, wrap) {
          element.style.whiteSpace = wrap ? "normal" : "nowrap";
        }
      })
    }
  });
  qx.bom.Input.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.Button": {
        "construct": true,
        "require": true
      },
      "qx.event.AcceleratingTimer": {
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
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Martin Wittemann (martinwittemann)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The RepeatButton is a special button, which fires repeatedly {@link #execute}
   * events, while a button is pressed on the button. The initial delay
   * and the interval time can be set using the properties {@link #firstInterval}
   * and {@link #interval}. The {@link #execute} events will be fired in a shorter
   * amount of time if a button is hold, until the min {@link #minTimer}
   * is reached. The {@link #timerDecrease} property sets the amount of milliseconds
   * which will decreased after every firing.
   *
   * <pre class='javascript'>
   *   var button = new qx.ui.form.RepeatButton("Hello World");
   *
   *   button.addListener("execute", function(e) {
   *     alert("Button is executed");
   *   }, this);
   *
   *   this.getRoot.add(button);
   * </pre>
   *
   * This example creates a button with the label "Hello World" and attaches an
   * event listener to the {@link #execute} event.
   *
   * *External Documentation*
   *
   * <a href='http://qooxdoo.org/docs/#desktop/widget/repeatbutton.md' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.form.RepeatButton", {
    extend: qx.ui.form.Button,

    /**
     * @param label {String} Label to use
     * @param icon {String?null} Icon to use
     */
    construct: function construct(label, icon) {
      qx.ui.form.Button.constructor.call(this, label, icon); // create the timer and add the listener

      this.__timer__P_177_0 = new qx.event.AcceleratingTimer();

      this.__timer__P_177_0.addListener("interval", this._onInterval, this);
    },
    events: {
      /**
       * This event gets dispatched with every interval. The timer gets executed
       * as long as the user holds down a button.
       */
      execute: "qx.event.type.Event",

      /**
       * This event gets dispatched when the button is pressed.
       */
      press: "qx.event.type.Event",

      /**
       * This event gets dispatched when the button is released.
       */
      release: "qx.event.type.Event"
    },
    properties: {
      /**
       * Interval used after the first run of the timer. Usually a smaller value
       * than the "firstInterval" property value to get a faster reaction.
       */
      interval: {
        check: "Integer",
        init: 100
      },

      /**
       * Interval used for the first run of the timer. Usually a greater value
       * than the "interval" property value to a little delayed reaction at the first
       * time.
       */
      firstInterval: {
        check: "Integer",
        init: 500
      },

      /** This configures the minimum value for the timer interval. */
      minTimer: {
        check: "Integer",
        init: 20
      },

      /** Decrease of the timer on each interval (for the next interval) until minTimer reached. */
      timerDecrease: {
        check: "Integer",
        init: 2
      }
    },
    members: {
      __executed__P_177_1: null,
      __timer__P_177_0: null,

      /**
       * Calling this function is like a tap from the user on the
       * button with all consequences.
       * <span style='color: red'>Be sure to call the {@link #release} function.</span>
       *
       */
      press: function press() {
        // only if the button is enabled
        if (this.isEnabled()) {
          // if the state pressed must be applied (first call)
          if (!this.hasState("pressed")) {
            // start the timer
            this.__startInternalTimer__P_177_2();
          } // set the states


          this.removeState("abandoned");
          this.addState("pressed");
        }
      },

      /**
       * Calling this function is like a release from the user on the
       * button with all consequences.
       * Usually the {@link #release} function will be called before the call of
       * this function.
       *
       * @param fireExecuteEvent {Boolean?true} flag which signals, if an event should be fired
       */
      release: function release(fireExecuteEvent) {
        // only if the button is enabled
        if (!this.isEnabled()) {
          return;
        } // only if the button is pressed


        if (this.hasState("pressed")) {
          // if the button has not been executed
          if (!this.__executed__P_177_1) {
            this.execute();
          }
        } // remove button states


        this.removeState("pressed");
        this.removeState("abandoned"); // stop the repeat timer and therefore the execution

        this.__stopInternalTimer__P_177_3();
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // overridden
      _applyEnabled: function _applyEnabled(value, old) {
        qx.ui.form.RepeatButton.superclass.prototype._applyEnabled.call(this, value, old);

        if (!value) {
          if (this.isCapturing()) {
            // also release capture because out event is missing on iOS
            this.releaseCapture();
          } // remove button states


          this.removeState("pressed");
          this.removeState("abandoned"); // stop the repeat timer and therefore the execution

          this.__stopInternalTimer__P_177_3();
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Listener method for "pointerover" event
       * <ul>
       * <li>Adds state "hovered"</li>
       * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state is set)</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} Pointer event
       */
      _onPointerOver: function _onPointerOver(e) {
        if (!this.isEnabled() || e.getTarget() !== this) {
          return;
        }

        if (this.hasState("abandoned")) {
          this.removeState("abandoned");
          this.addState("pressed");

          this.__timer__P_177_0.start();
        }

        this.addState("hovered");
      },

      /**
       * Listener method for "pointerout" event
       * <ul>
       * <li>Removes "hovered" state</li>
       * <li>Adds "abandoned" and removes "pressed" state (if "pressed" state is set)</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} Pointer event
       */
      _onPointerOut: function _onPointerOut(e) {
        if (!this.isEnabled() || e.getTarget() !== this) {
          return;
        }

        this.removeState("hovered");

        if (this.hasState("pressed")) {
          this.removeState("pressed");
          this.addState("abandoned");

          this.__timer__P_177_0.stop();
        }
      },

      /**
       * Callback method for the "pointerdown" method.
       *
       * Sets the interval of the timer (value of firstInterval property) and
       * starts the timer. Additionally removes the state "abandoned" and adds the
       * state "pressed".
       *
       * @param e {qx.event.type.Pointer} pointerdown event
       */
      _onPointerDown: function _onPointerDown(e) {
        if (!e.isLeftPressed()) {
          return;
        } // Activate capturing if the button get a pointerout while
        // the button is pressed.


        this.capture();

        this.__startInternalTimer__P_177_2();

        e.stopPropagation();
      },

      /**
       * Callback method for the "pointerup" event.
       *
       * Handles the case that the user is releasing a button
       * before the timer interval method got executed. This way the
       * "execute" method get executed at least one time.
       *
       * @param e {qx.event.type.Pointer} pointerup event
       */
      _onPointerUp: function _onPointerUp(e) {
        this.releaseCapture();

        if (!this.hasState("abandoned")) {
          this.addState("hovered");

          if (this.hasState("pressed") && !this.__executed__P_177_1) {
            this.execute();
          }
        }

        this.__stopInternalTimer__P_177_3();

        e.stopPropagation();
      },
      // Nothing to do, 'execute' is already fired by _onPointerUp.
      _onTap: function _onTap(e) {},

      /**
       * Listener method for "keyup" event.
       *
       * Removes "abandoned" and "pressed" state (if "pressed" state is set)
       * for the keys "Enter" or "Space" and stops the internal timer
       * (same like pointer up).
       *
       * @param e {Event} Key event
       */
      _onKeyUp: function _onKeyUp(e) {
        switch (e.getKeyIdentifier()) {
          case "Enter":
          case "Space":
            if (this.hasState("pressed")) {
              if (!this.__executed__P_177_1) {
                this.execute();
              }

              this.removeState("pressed");
              this.removeState("abandoned");
              e.stopPropagation();

              this.__stopInternalTimer__P_177_3();
            }

        }
      },

      /**
       * Listener method for "keydown" event.
       *
       * Removes "abandoned" and adds "pressed" state
       * for the keys "Enter" or "Space". It also starts
       * the internal timer (same like pointerdown).
       *
       * @param e {Event} Key event
       */
      _onKeyDown: function _onKeyDown(e) {
        switch (e.getKeyIdentifier()) {
          case "Enter":
          case "Space":
            this.removeState("abandoned");
            this.addState("pressed");
            e.stopPropagation();

            this.__startInternalTimer__P_177_2();

        }
      },

      /**
       * Callback for the interval event.
       *
       * Stops the timer and starts it with a new interval
       * (value of the "interval" property - value of the "timerDecrease" property).
       * Dispatches the "execute" event.
       *
       * @param e {qx.event.type.Event} interval event
       */
      _onInterval: function _onInterval(e) {
        this.__executed__P_177_1 = true;
        this.fireEvent("execute");
      },

      /*
      ---------------------------------------------------------------------------
        INTERNAL TIMER
      ---------------------------------------------------------------------------
      */

      /**
       * Starts the internal timer which causes firing of execution
       * events in an interval. It also presses the button.
       *
       */
      __startInternalTimer__P_177_2: function __startInternalTimer__P_177_2() {
        this.fireEvent("press");
        this.__executed__P_177_1 = false;

        this.__timer__P_177_0.set({
          interval: this.getInterval(),
          firstInterval: this.getFirstInterval(),
          minimum: this.getMinTimer(),
          decrease: this.getTimerDecrease()
        }).start();

        this.removeState("abandoned");
        this.addState("pressed");
      },

      /**
       * Stops the internal timer and releases the button.
       *
       */
      __stopInternalTimer__P_177_3: function __stopInternalTimer__P_177_3() {
        this.fireEvent("release");

        this.__timer__P_177_0.stop();

        this.removeState("abandoned");
        this.removeState("pressed");
      }
    },

    /*
      *****************************************************************************
         DESTRUCTOR
      *****************************************************************************
      */
    destruct: function destruct() {
      this._disposeObjects("__timer__P_177_0");
    }
  });
  qx.ui.form.RepeatButton.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.layout.Grow": {
        "construct": true
      },
      "qx.bom.AnimationFrame": {}
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
   * This class represents a scroll able pane. This means that this widget
   * may contain content which is bigger than the available (inner)
   * dimensions of this widget. The widget also offer methods to control
   * the scrolling position. It can only have exactly one child.
   */
  qx.Class.define("qx.ui.core.scroll.ScrollPane", {
    extend: qx.ui.core.Widget,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this);
      this.set({
        minWidth: 0,
        minHeight: 0
      }); // Automatically configure a "fixed" grow layout.

      this._setLayout(new qx.ui.layout.Grow()); // Add resize listener to "translate" event


      this.addListener("resize", this._onUpdate);
      var contentEl = this.getContentElement(); // Synchronizes the DOM scroll position with the properties

      contentEl.addListener("scroll", this._onScroll, this); // Fixed some browser quirks e.g. correcting scroll position
      // to the previous value on re-display of a pane

      contentEl.addListener("appear", this._onAppear, this);
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired on resize of both the container or the content. */
      update: "qx.event.type.Event",

      /** Fired on scroll animation end invoked by 'scroll*' methods. */
      scrollAnimationEnd: "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The horizontal scroll position */
      scrollX: {
        check: "qx.lang.Type.isNumber(value)&&value>=0&&value<=this.getScrollMaxX()",
        apply: "_applyScrollX",
        transform: "_transformScrollX",
        event: "scrollX",
        init: 0
      },

      /** The vertical scroll position */
      scrollY: {
        check: "qx.lang.Type.isNumber(value)&&value>=0&&value<=this.getScrollMaxY()",
        apply: "_applyScrollY",
        transform: "_transformScrollY",
        event: "scrollY",
        init: 0
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __frame__P_178_0: null,

      /*
      ---------------------------------------------------------------------------
        CONTENT MANAGEMENT
      ---------------------------------------------------------------------------
      */

      /**
       * Configures the content of the scroll pane. Replaces any existing child
       * with the newly given one.
       *
       * @param widget {qx.ui.core.Widget?null} The content widget of the pane
       */
      add: function add(widget) {
        var old = this._getChildren()[0];

        if (old) {
          this._remove(old);

          old.removeListener("resize", this._onUpdate, this);
        }

        if (widget) {
          this._add(widget);

          widget.addListener("resize", this._onUpdate, this);
        }
      },

      /**
       * Removes the given widget from the content. The pane is empty
       * afterwards as only one child is supported by the pane.
       *
       * @param widget {qx.ui.core.Widget?null} The content widget of the pane
       */
      remove: function remove(widget) {
        if (widget) {
          this._remove(widget);

          widget.removeListener("resize", this._onUpdate, this);
        }
      },

      /**
       * Returns an array containing the current content.
       *
       * @return {Object[]} The content array
       */
      getChildren: function getChildren() {
        return this._getChildren();
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENER
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for resize event of content and container
       *
       * @param e {Event} Resize event object
       */
      _onUpdate: function _onUpdate(e) {
        this.fireEvent("update");
      },

      /**
       * Event listener for scroll event of content
       *
       * @param e {qx.event.type.Event} Scroll event object
       */
      _onScroll: function _onScroll(e) {
        var contentEl = this.getContentElement();
        this.setScrollX(contentEl.getScrollX());
        this.setScrollY(contentEl.getScrollY());
      },

      /**
       * Event listener for appear event of content
       *
       * @param e {qx.event.type.Event} Appear event object
       */
      _onAppear: function _onAppear(e) {
        var contentEl = this.getContentElement();
        var internalX = this.getScrollX();
        var domX = contentEl.getScrollX();

        if (internalX != domX) {
          contentEl.scrollToX(internalX);
        }

        var internalY = this.getScrollY();
        var domY = contentEl.getScrollY();

        if (internalY != domY) {
          contentEl.scrollToY(internalY);
        }
      },

      /*
      ---------------------------------------------------------------------------
        ITEM LOCATION SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the top offset of the given item in relation to the
       * inner height of this widget.
       *
       * @param item {qx.ui.core.Widget} Item to query
       * @return {Integer} Top offset
       */
      getItemTop: function getItemTop(item) {
        var top = 0;

        do {
          top += item.getBounds().top;
          item = item.getLayoutParent();
        } while (item && item !== this);

        return top;
      },

      /**
       * Returns the top offset of the end of the given item in relation to the
       * inner height of this widget.
       *
       * @param item {qx.ui.core.Widget} Item to query
       * @return {Integer} Top offset
       */
      getItemBottom: function getItemBottom(item) {
        return this.getItemTop(item) + item.getBounds().height;
      },

      /**
       * Returns the left offset of the given item in relation to the
       * inner width of this widget.
       *
       * @param item {qx.ui.core.Widget} Item to query
       * @return {Integer} Top offset
       */
      getItemLeft: function getItemLeft(item) {
        var left = 0;
        var parent;

        do {
          left += item.getBounds().left;
          parent = item.getLayoutParent();

          if (parent) {
            left += parent.getInsets().left;
          }

          item = parent;
        } while (item && item !== this);

        return left;
      },

      /**
       * Returns the left offset of the end of the given item in relation to the
       * inner width of this widget.
       *
       * @param item {qx.ui.core.Widget} Item to query
       * @return {Integer} Right offset
       */
      getItemRight: function getItemRight(item) {
        return this.getItemLeft(item) + item.getBounds().width;
      },

      /*
      ---------------------------------------------------------------------------
        DIMENSIONS
      ---------------------------------------------------------------------------
      */

      /**
       * The size (identical with the preferred size) of the content.
       *
       * @return {Map} Size of the content (keys: <code>width</code> and <code>height</code>)
       */
      getScrollSize: function getScrollSize() {
        return this.getChildren()[0].getBounds();
      },

      /*
      ---------------------------------------------------------------------------
        SCROLL SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * The maximum horizontal scroll position.
       *
       * @return {Integer} Maximum horizontal scroll position.
       */
      getScrollMaxX: function getScrollMaxX() {
        var paneSize = this.getInnerSize();
        var scrollSize = this.getScrollSize();

        if (paneSize && scrollSize) {
          return Math.max(0, scrollSize.width - paneSize.width);
        }

        return 0;
      },

      /**
       * The maximum vertical scroll position.
       *
       * @return {Integer} Maximum vertical scroll position.
       */
      getScrollMaxY: function getScrollMaxY() {
        var paneSize = this.getInnerSize();
        var scrollSize = this.getScrollSize();

        if (paneSize && scrollSize) {
          return Math.max(0, scrollSize.height - paneSize.height);
        }

        return 0;
      },

      /**
       * Scrolls the element's content to the given left coordinate
       *
       * @param value {Integer} The vertical position to scroll to.
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollToX: function scrollToX(value, duration) {
        var max = this.getScrollMaxX();

        if (value < 0) {
          value = 0;
        } else if (value > max) {
          value = max;
        }

        this.stopScrollAnimation();

        if (duration) {
          var from = this.getScrollX();
          this.__frame__P_178_0 = new qx.bom.AnimationFrame();

          this.__frame__P_178_0.on("end", function () {
            this.setScrollX(value);
            this.__frame__P_178_0 = null;
            this.fireEvent("scrollAnimationEnd");
          }, this);

          this.__frame__P_178_0.on("frame", function (timePassed) {
            var newX = parseInt(timePassed / duration * (value - from) + from);
            this.setScrollX(newX);
          }, this);

          this.__frame__P_178_0.startSequence(duration);
        } else {
          this.setScrollX(value);
        }
      },

      /**
       * Scrolls the element's content to the given top coordinate
       *
       * @param value {Integer} The horizontal position to scroll to.
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollToY: function scrollToY(value, duration) {
        var max = this.getScrollMaxY();

        if (value < 0) {
          value = 0;
        } else if (value > max) {
          value = max;
        }

        this.stopScrollAnimation();

        if (duration) {
          var from = this.getScrollY();
          this.__frame__P_178_0 = new qx.bom.AnimationFrame();

          this.__frame__P_178_0.on("end", function () {
            this.setScrollY(value);
            this.__frame__P_178_0 = null;
            this.fireEvent("scrollAnimationEnd");
          }, this);

          this.__frame__P_178_0.on("frame", function (timePassed) {
            var newY = parseInt(timePassed / duration * (value - from) + from);
            this.setScrollY(newY);
          }, this);

          this.__frame__P_178_0.startSequence(duration);
        } else {
          this.setScrollY(value);
        }
      },

      /**
       * Scrolls the element's content horizontally by the given amount.
       *
       * @param x {Integer?0} Amount to scroll
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollByX: function scrollByX(x, duration) {
        this.scrollToX(this.getScrollX() + x, duration);
      },

      /**
       * Scrolls the element's content vertically by the given amount.
       *
       * @param y {Integer?0} Amount to scroll
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollByY: function scrollByY(y, duration) {
        this.scrollToY(this.getScrollY() + y, duration);
      },

      /**
       * If an scroll animation is running, it will be stopped with that method.
       */
      stopScrollAnimation: function stopScrollAnimation() {
        if (this.__frame__P_178_0) {
          this.__frame__P_178_0.cancelSequence();

          this.__frame__P_178_0 = null;
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyScrollX: function _applyScrollX(value) {
        this.getContentElement().scrollToX(value);
      },

      /**
       * Transform property
       *
       * @param value {Number} Value to transform
       * @return {Number} Rounded value
       */
      _transformScrollX: function _transformScrollX(value) {
        return Math.round(value);
      },
      // property apply
      _applyScrollY: function _applyScrollY(value) {
        this.getContentElement().scrollToY(value);
      },

      /**
       * Transform property
       *
       * @param value {Number} Value to transform
       * @return {Number} Rounded value
       */
      _transformScrollY: function _transformScrollY(value) {
        return Math.round(value);
      }
    }
  });
  qx.ui.core.scroll.ScrollPane.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.basic.Atom": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.MExecutable": {
        "require": true
      },
      "qx.ui.form.IExecutable": {
        "require": true
      },
      "qx.event.AcceleratingTimer": {
        "construct": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The HoverButton is an {@link qx.ui.basic.Atom}, which fires repeatedly
   * execute events while the pointer is over the widget.
   *
   * The rate at which the execute event is fired accelerates is the pointer keeps
   * inside of the widget. The initial delay and the interval time can be set using
   * the properties {@link #firstInterval} and {@link #interval}. The
   * {@link #execute} events will be fired in a shorter amount of time if the pointer
   * remains over the widget, until the min {@link #minTimer} is reached.
   * The {@link #timerDecrease} property sets the amount of milliseconds which will
   * decreased after every firing.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   var button = new qx.ui.form.HoverButton("Hello World");
   *
   *   button.addListener("execute", function(e) {
   *     alert("Button is hovered");
   *   }, this);
   *
   *   this.getRoot.add(button);
   * </pre>
   *
   * This example creates a button with the label "Hello World" and attaches an
   * event listener to the {@link #execute} event.
   *
   * *External Documentation*
   *
   * <a href='http://qooxdoo.org/docs/#desktop/widget/hoverbutton.md' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.form.HoverButton", {
    extend: qx.ui.basic.Atom,
    include: [qx.ui.core.MExecutable],
    implement: [qx.ui.form.IExecutable],

    /**
     * @param label {String} Label to use
     * @param icon {String?null} Icon to use
     */
    construct: function construct(label, icon) {
      qx.ui.basic.Atom.constructor.call(this, label, icon);
      this.addListener("pointerover", this._onPointerOver, this);
      this.addListener("pointerout", this._onPointerOut, this);
      this.__timer__P_161_0 = new qx.event.AcceleratingTimer();

      this.__timer__P_161_0.addListener("interval", this._onInterval, this);
    },
    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "hover-button"
      },

      /**
       * Interval used after the first run of the timer. Usually a smaller value
       * than the "firstInterval" property value to get a faster reaction.
       */
      interval: {
        check: "Integer",
        init: 80
      },

      /**
       * Interval used for the first run of the timer. Usually a greater value
       * than the "interval" property value to a little delayed reaction at the first
       * time.
       */
      firstInterval: {
        check: "Integer",
        init: 200
      },

      /** This configures the minimum value for the timer interval. */
      minTimer: {
        check: "Integer",
        init: 20
      },

      /** Decrease of the timer on each interval (for the next interval) until minTimer reached. */
      timerDecrease: {
        check: "Integer",
        init: 2
      }
    },
    members: {
      __timer__P_161_0: null,

      /**
       * Start timer on pointer over
       *
       * @param e {qx.event.type.Pointer} The pointer event
       */
      _onPointerOver: function _onPointerOver(e) {
        if (!this.isEnabled() || e.getTarget() !== this) {
          return;
        }

        this.__timer__P_161_0.set({
          interval: this.getInterval(),
          firstInterval: this.getFirstInterval(),
          minimum: this.getMinTimer(),
          decrease: this.getTimerDecrease()
        }).start();

        this.addState("hovered");
      },

      /**
       * Stop timer on pointer out
       *
       * @param e {qx.event.type.Pointer} The pointer event
       */
      _onPointerOut: function _onPointerOut(e) {
        this.__timer__P_161_0.stop();

        this.removeState("hovered");

        if (!this.isEnabled() || e.getTarget() !== this) {
          return;
        }
      },

      /**
       * Fire execute event on timer interval event
       */
      _onInterval: function _onInterval() {
        if (this.isEnabled()) {
          this.execute();
        } else {
          this.__timer__P_161_0.stop();
        }
      }
    },
    destruct: function destruct() {
      this._disposeObjects("__timer__P_161_0");
    }
  });
  qx.ui.form.HoverButton.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.util.ResourceManager": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine"
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
       * Fabian Jakobs (fjakobs)
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * The background class contains methods to compute and set the background image
   * of a DOM element.
   *
   * It fixes a background position issue in Firefox 2.
   */
  qx.Class.define("qx.bom.element.Background", {
    statics: {
      /** @type {Array} Internal helper to improve compile performance */
      __tmpl__P_153_0: ["background-image:url(", null, ");", "background-position:", null, ";", "background-repeat:", null, ";"],

      /** @type {Map} Empty styles when no image is given */
      __emptyStyles__P_153_1: {
        backgroundImage: null,
        backgroundPosition: null,
        backgroundRepeat: null
      },

      /**
       * Computes the background position CSS value
       *
       * @param left {Integer|String} either an integer pixel value or a CSS
       *    string value
       * @param top {Integer|String} either an integer pixel value or a CSS
       *    string value
       * @return {String} The background position CSS value
       */
      __computePosition__P_153_2: function __computePosition__P_153_2(left, top) {
        // Correcting buggy Firefox background-position implementation
        // Have problems with identical values
        var engine = qx.core.Environment.get("engine.name");
        var version = qx.core.Environment.get("engine.version");

        if (engine == "gecko" && version < 1.9 && left == top && typeof left == "number") {
          top += 0.01;
        }

        if (left) {
          var leftCss = typeof left == "number" ? left + "px" : left;
        } else {
          leftCss = "0";
        }

        if (top) {
          var topCss = typeof top == "number" ? top + "px" : top;
        } else {
          topCss = "0";
        }

        return leftCss + " " + topCss;
      },

      /**
       * Compiles the background into a CSS compatible string.
       *
       * @param source {String?null} The URL of the background image
       * @param repeat {String?null} The background repeat property. valid values
       *     are <code>repeat</code>, <code>repeat-x</code>,
       *     <code>repeat-y</code>, <code>no-repeat</code>
       * @param left {Integer|String?null} The horizontal offset of the image
       *      inside of the image element. If the value is an integer it is
       *      interpreted as pixel value otherwise the value is taken as CSS value.
       *      CSS the values are "center", "left" and "right"
       * @param top {Integer|String?null} The vertical offset of the image
       *      inside of the image element. If the value is an integer it is
       *      interpreted as pixel value otherwise the value is taken as CSS value.
       *      CSS the values are "top", "bottom" and "center"
       * @return {String} CSS string
       */
      compile: function compile(source, repeat, left, top) {
        var position = this.__computePosition__P_153_2(left, top);

        var backgroundImageUrl = qx.util.ResourceManager.getInstance().toUri(source); // Updating template

        var tmpl = this.__tmpl__P_153_0;
        tmpl[1] = "'" + backgroundImageUrl + "'"; // Put in quotes so spaces work

        tmpl[4] = position;
        tmpl[7] = repeat;
        return tmpl.join("");
      },

      /**
       * Get standard css background styles
       *
       * @param source {String} The URL of the background image
       * @param repeat {String?null} The background repeat property. valid values
       *     are <code>repeat</code>, <code>repeat-x</code>,
       *     <code>repeat-y</code>, <code>no-repeat</code>
       * @param left {Integer|String?null} The horizontal offset of the image
       *      inside of the image element. If the value is an integer it is
       *      interpreted as pixel value otherwise the value is taken as CSS value.
       *      CSS the values are "center", "left" and "right"
       * @param top {Integer|String?null} The vertical offset of the image
       *      inside of the image element. If the value is an integer it is
       *      interpreted as pixel value otherwise the value is taken as CSS value.
       *      CSS the values are "top", "bottom" and "center"
       * @return {Map} A map of CSS styles
       */
      getStyles: function getStyles(source, repeat, left, top) {
        if (!source) {
          return this.__emptyStyles__P_153_1;
        }

        var position = this.__computePosition__P_153_2(left, top);

        var backgroundImageUrl = qx.util.ResourceManager.getInstance().toUri(source);
        var backgroundImageCssString = "url('" + backgroundImageUrl + "')"; // Put in quotes so spaces work

        var map = {
          backgroundPosition: position,
          backgroundImage: backgroundImageCssString
        };

        if (repeat != null) {
          map.backgroundRepeat = repeat;
        }

        return map;
      },

      /**
       * Set the background on the given DOM element
       *
       * @param element {Element} The element to modify
       * @param source {String?null} The URL of the background image
       * @param repeat {String?null} The background repeat property. valid values
       *     are <code>repeat</code>, <code>repeat-x</code>,
       *     <code>repeat-y</code>, <code>no-repeat</code>
       * @param left {Integer?null} The horizontal offset of the image inside of
       *     the image element.
       * @param top {Integer?null} The vertical offset of the image inside of
       *     the image element.
       */
      set: function set(element, source, repeat, left, top) {
        var styles = this.getStyles(source, repeat, left, top);

        for (var prop in styles) {
          element.style[prop] = styles[prop];
        }
      }
    }
  });
  qx.bom.element.Background.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.event.Registration": {},
      "qx.event.util.Keyboard": {},
      "qx.lang.String": {},
      "qx.locale.Key": {}
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
   * Shortcuts can be used to globally define keyboard shortcuts.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.bom.Shortcut", {
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Create a new instance of Command
     *
     * @param shortcut {String} shortcuts can be composed of optional modifier
     *    keys Control, Alt, Shift, Meta and a non modifier key.
     *    If no non modifier key is specified, the second parameter is evaluated.
     *    The key must be separated by a <code>+</code> or <code>-</code> character.
     *    Examples: Alt+F1, Control+C, Control+Alt+Delete
     */
    construct: function construct(shortcut) {
      qx.core.Object.constructor.call(this);
      this.__modifier__P_176_0 = {};
      this.__key__P_176_1 = null;

      if (shortcut != null) {
        this.setShortcut(shortcut);
      }

      this.initEnabled();
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired when the command is executed. Sets the "data" property of the event to
       * the object that issued the command.
       */
      execute: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** whether the command should be respected/enabled */
      enabled: {
        init: true,
        check: "Boolean",
        event: "changeEnabled",
        apply: "_applyEnabled"
      },

      /** The command shortcut */
      shortcut: {
        check: "String",
        apply: "_applyShortcut",
        nullable: true
      },

      /**
       * Whether the execute event should be fired repeatedly if the user keep
       * the keys pressed.
       */
      autoRepeat: {
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
      __modifier__P_176_0: "",
      __key__P_176_1: "",

      /*
      ---------------------------------------------------------------------------
        USER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Fire the "execute" event on this shortcut.
       *
       * @param target {Object} Object which issued the execute event
       */
      execute: function execute(target) {
        this.fireDataEvent("execute", target);
      },

      /**
       * Key down event handler.
       *
       * @param event {qx.event.type.KeySequence} The key event object
       */
      __onKeyDown__P_176_2: function __onKeyDown__P_176_2(event) {
        if (this.getEnabled() && this.__matchesKeyEvent__P_176_3(event)) {
          if (!this.isAutoRepeat()) {
            this.execute(event.getTarget());
          }

          event.stop();
        }
      },

      /**
       * Key press event handler.
       *
       * @param event {qx.event.type.KeySequence} The key event object
       */
      __onKeyPress__P_176_4: function __onKeyPress__P_176_4(event) {
        if (this.getEnabled() && this.__matchesKeyEvent__P_176_3(event)) {
          if (this.isAutoRepeat()) {
            this.execute(event.getTarget());
          }

          event.stop();
        }
      },

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyEnabled: function _applyEnabled(value, old) {
        if (value) {
          qx.event.Registration.addListener(document.documentElement, "keydown", this.__onKeyDown__P_176_2, this);
          qx.event.Registration.addListener(document.documentElement, "keypress", this.__onKeyPress__P_176_4, this);
        } else {
          qx.event.Registration.removeListener(document.documentElement, "keydown", this.__onKeyDown__P_176_2, this);
          qx.event.Registration.removeListener(document.documentElement, "keypress", this.__onKeyPress__P_176_4, this);
        }
      },
      // property apply
      _applyShortcut: function _applyShortcut(value, old) {
        if (value) {
          // do not allow whitespaces within shortcuts
          if (value.search(/[\s]+/) != -1) {
            var msg = "Whitespaces are not allowed within shortcuts";
            this.error(msg);
            throw new Error(msg);
          }

          this.__modifier__P_176_0 = {
            Control: false,
            Shift: false,
            Meta: false,
            Alt: false
          };
          this.__key__P_176_1 = null; // To support shortcuts with "+" and "-" as keys it is necessary
          // to split the given value in a different way to determine the
          // several keyIdentifiers

          var index;
          var a = [];

          while (value.length > 0 && index != -1) {
            // search for delimiters "+" and "-"
            index = value.search(/[-+]+/); // add identifiers - take value if no separator was found or
            // only one char is left (second part of shortcut)

            a.push(value.length == 1 || index == -1 ? value : value.substring(0, index)); // extract the already detected identifier

            value = value.substring(index + 1);
          }

          var al = a.length;

          for (var i = 0; i < al; i++) {
            var identifier = this.__normalizeKeyIdentifier__P_176_5(a[i]);

            switch (identifier) {
              case "Control":
              case "Shift":
              case "Meta":
              case "Alt":
                this.__modifier__P_176_0[identifier] = true;
                break;

              case "Unidentified":
                var msg = "Not a valid key name for a shortcut: " + a[i];
                this.error(msg);
                throw msg;

              default:
                if (this.__key__P_176_1) {
                  var msg = "You can only specify one non modifier key!";
                  this.error(msg);
                  throw msg;
                }

                this.__key__P_176_1 = identifier;
            }
          }
        }

        return true;
      },

      /*
      --------------------------------------------------------------------------
        INTERNAL MATCHING LOGIC
      ---------------------------------------------------------------------------
      */

      /**
       * Checks whether the given key event matches the shortcut's shortcut
       *
       * @param e {qx.event.type.KeySequence} the key event object
       * @return {Boolean} whether the shortcuts shortcut matches the key event
       */
      __matchesKeyEvent__P_176_3: function __matchesKeyEvent__P_176_3(e) {
        var key = this.__key__P_176_1;

        if (!key) {
          // no shortcut defined.
          return false;
        } // for check special keys
        // and check if a shortcut is a single char and special keys are pressed


        if (!this.__modifier__P_176_0.Shift && e.isShiftPressed() || this.__modifier__P_176_0.Shift && !e.isShiftPressed() || !this.__modifier__P_176_0.Control && e.isCtrlPressed() || this.__modifier__P_176_0.Control && !e.isCtrlPressed() || !this.__modifier__P_176_0.Meta && e.isMetaPressed() || this.__modifier__P_176_0.Meta && !e.isMetaPressed() || !this.__modifier__P_176_0.Alt && e.isAltPressed() || this.__modifier__P_176_0.Alt && !e.isAltPressed()) {
          return false;
        }

        if (key == e.getKeyIdentifier()) {
          return true;
        }

        return false;
      },

      /*
      ---------------------------------------------------------------------------
        COMPATIBILITY TO COMMAND
      ---------------------------------------------------------------------------
      */

      /**
       * @lint ignoreReferenceField(__oldKeyNameToKeyIdentifierMap)
       */
      __oldKeyNameToKeyIdentifierMap__P_176_6: {
        // all other keys are converted by converting the first letter to uppercase
        esc: "Escape",
        ctrl: "Control",
        print: "PrintScreen",
        del: "Delete",
        pageup: "PageUp",
        pagedown: "PageDown",
        numlock: "NumLock",
        numpad_0: "0",
        numpad_1: "1",
        numpad_2: "2",
        numpad_3: "3",
        numpad_4: "4",
        numpad_5: "5",
        numpad_6: "6",
        numpad_7: "7",
        numpad_8: "8",
        numpad_9: "9",
        numpad_divide: "/",
        numpad_multiply: "*",
        numpad_minus: "-",
        numpad_plus: "+"
      },

      /**
       * Checks and normalizes the key identifier.
       *
       * @param keyName {String} name of the key.
       * @return {String} normalized keyIdentifier or "Unidentified" if a conversion was not possible
       */
      __normalizeKeyIdentifier__P_176_5: function __normalizeKeyIdentifier__P_176_5(keyName) {
        var kbUtil = qx.event.util.Keyboard;
        var keyIdentifier = "Unidentified";

        if (kbUtil.isValidKeyIdentifier(keyName)) {
          return keyName;
        }

        if (keyName.length == 1 && keyName >= "a" && keyName <= "z") {
          return keyName.toUpperCase();
        }

        keyName = keyName.toLowerCase();
        var keyIdentifier = this.__oldKeyNameToKeyIdentifierMap__P_176_6[keyName] || qx.lang.String.firstUp(keyName);

        if (kbUtil.isValidKeyIdentifier(keyIdentifier)) {
          return keyIdentifier;
        } else {
          return "Unidentified";
        }
      },

      /*
      ---------------------------------------------------------------------------
        STRING CONVERSION
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the shortcut as string using the currently selected locale.
       *
       * @return {String} shortcut
       */
      toString: function toString() {
        var key = this.__key__P_176_1;
        var str = [];

        for (var modifier in this.__modifier__P_176_0) {
          // this.__modifier holds a map with shortcut combination keys
          // like "Control", "Alt", "Meta" and "Shift" as keys with
          // Boolean values
          if (this.__modifier__P_176_0[modifier]) {
            str.push(qx.locale.Key.getKeyName("short", modifier));
          }
        }

        if (key) {
          str.push(qx.locale.Key.getKeyName("short", key));
        }

        return str.join("+");
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      // this will remove the event listener
      this.setEnabled(false);
      this.__modifier__P_176_0 = this.__key__P_176_1 = null;
    }
  });
  qx.bom.Shortcut.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.container.Composite": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.HBox": {
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
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * The container used by {@link Part} to insert the buttons.
   *
   * @internal
   */
  qx.Class.define("qx.ui.toolbar.PartContainer", {
    extend: qx.ui.container.Composite,
    construct: function construct() {
      qx.ui.container.Composite.constructor.call(this);

      this._setLayout(new qx.ui.layout.HBox());
    },
    events: {
      /** Fired if a child has been added or removed */
      changeChildren: "qx.event.type.Event"
    },
    properties: {
      appearance: {
        refine: true,
        init: "toolbar/part/container"
      },

      /** Whether icons, labels, both or none should be shown. */
      show: {
        init: "both",
        check: ["both", "label", "icon"],
        inheritable: true,
        event: "changeShow"
      }
    },
    members: {
      // overridden
      _afterAddChild: function _afterAddChild(child) {
        this.fireEvent("changeChildren");
      },
      // overridden
      _afterRemoveChild: function _afterRemoveChild(child) {
        this.fireEvent("changeChildren");
      }
    }
  });
  qx.ui.toolbar.PartContainer.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Assert": {
        "construct": true
      },
      "qx.ui.core.ISingleSelectionProvider": {
        "construct": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Responsible for the single selection management.
   *
   * The class manage a list of {@link qx.ui.core.Widget} which are returned from
   * {@link qx.ui.core.ISingleSelectionProvider#getItems}.
   *
   * @internal
   */
  qx.Class.define("qx.ui.core.SingleSelectionManager", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Construct the single selection manager.
     *
     * @param selectionProvider {qx.ui.core.ISingleSelectionProvider} The provider
     * for selection.
     */
    construct: function construct(selectionProvider) {
      qx.core.Object.constructor.call(this);
      {
        qx.core.Assert.assertInterface(selectionProvider, qx.ui.core.ISingleSelectionProvider, "Invalid selectionProvider!");
      }
      this.__selectionProvider__P_162_0 = selectionProvider;
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fires after the selection was modified */
      changeSelected: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * If the value is <code>true</code> the manager allows an empty selection,
       * otherwise the first selectable element returned from the
       * <code>qx.ui.core.ISingleSelectionProvider</code> will be selected.
       */
      allowEmptySelection: {
        check: "Boolean",
        init: true,
        apply: "__applyAllowEmptySelection__P_162_1"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {qx.ui.core.Widget} The selected widget. */
      __selected__P_162_2: null,

      /** @type {qx.ui.core.ISingleSelectionProvider} The provider for selection management */
      __selectionProvider__P_162_0: null,

      /*
      ---------------------------------------------------------------------------
         PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the current selected element.
       *
       * @return {qx.ui.core.Widget | null} The current selected widget or
       *    <code>null</code> if the selection is empty.
       */
      getSelected: function getSelected() {
        return this.__selected__P_162_2;
      },

      /**
       * Selects the passed element.
       *
       * @param item {qx.ui.core.Widget} Element to select.
       * @throws {Error} if the element is not a child element.
       */
      setSelected: function setSelected(item) {
        if (!this.__isChildElement__P_162_3(item)) {
          throw new Error("Could not select " + item + ", because it is not a child element!");
        }

        this.__setSelected__P_162_4(item);
      },

      /**
       * Reset the current selection. If {@link #allowEmptySelection} is set to
       * <code>true</code> the first element will be selected.
       */
      resetSelected: function resetSelected() {
        this.__setSelected__P_162_4(null);
      },

      /**
       * Return <code>true</code> if the passed element is selected.
       *
       * @param item {qx.ui.core.Widget} Element to check if selected.
       * @return {Boolean} <code>true</code> if passed element is selected,
       *    <code>false</code> otherwise.
       * @throws {Error} if the element is not a child element.
       */
      isSelected: function isSelected(item) {
        if (!this.__isChildElement__P_162_3(item)) {
          throw new Error("Could not check if " + item + " is selected," + " because it is not a child element!");
        }

        return this.__selected__P_162_2 === item;
      },

      /**
       * Returns <code>true</code> if selection is empty.
       *
       * @return {Boolean} <code>true</code> if selection is empty,
       *    <code>false</code> otherwise.
       */
      isSelectionEmpty: function isSelectionEmpty() {
        return this.__selected__P_162_2 == null;
      },

      /**
       * Returns all elements which are selectable.
       *
       * @param all {Boolean} true for all selectables, false for the
       *   selectables the user can interactively select
       * @return {qx.ui.core.Widget[]} The contained items.
       */
      getSelectables: function getSelectables(all) {
        var items = this.__selectionProvider__P_162_0.getItems();

        var result = [];

        for (var i = 0; i < items.length; i++) {
          if (this.__selectionProvider__P_162_0.isItemSelectable(items[i])) {
            result.push(items[i]);
          }
        } // in case of an user selectable list, remove the enabled items


        if (!all) {
          for (var i = result.length - 1; i >= 0; i--) {
            if (!result[i].getEnabled()) {
              result.splice(i, 1);
            }
          }
        }

        return result;
      },

      /*
      ---------------------------------------------------------------------------
         APPLY METHODS
      ---------------------------------------------------------------------------
      */
      // apply method
      __applyAllowEmptySelection__P_162_1: function __applyAllowEmptySelection__P_162_1(value, old) {
        if (!value) {
          this.__setSelected__P_162_4(this.__selected__P_162_2);
        }
      },

      /*
      ---------------------------------------------------------------------------
         HELPERS
      ---------------------------------------------------------------------------
      */

      /**
       * Set selected element.
       *
       * If passes value is <code>null</code>, the selection will be reseted.
       *
       * @param item {qx.ui.core.Widget | null} element to select, or
       *    <code>null</code> to reset selection.
       */
      __setSelected__P_162_4: function __setSelected__P_162_4(item) {
        var oldSelected = this.__selected__P_162_2;
        var newSelected = item;

        if (newSelected != null && oldSelected === newSelected) {
          return;
        }

        if (!this.isAllowEmptySelection() && newSelected == null) {
          var firstElement = this.getSelectables(true)[0];

          if (firstElement) {
            newSelected = firstElement;
          }
        }

        this.__selected__P_162_2 = newSelected;
        this.fireDataEvent("changeSelected", newSelected, oldSelected);
      },

      /**
       * Checks if passed element is a child element.
       *
       * @param item {qx.ui.core.Widget} Element to check if child element.
       * @return {Boolean} <code>true</code> if element is child element,
       *    <code>false</code> otherwise.
       */
      __isChildElement__P_162_3: function __isChildElement__P_162_3(item) {
        var items = this.__selectionProvider__P_162_0.getItems();

        for (var i = 0; i < items.length; i++) {
          if (items[i] === item) {
            return true;
          }
        }

        return false;
      }
    },

    /*
     *****************************************************************************
        DESTRUCTOR
     *****************************************************************************
     */
    destruct: function destruct() {
      if (this.__selectionProvider__P_162_0.toHashCode) {
        this._disposeObjects("__selectionProvider__P_162_0");
      } else {
        this.__selectionProvider__P_162_0 = null;
      }

      this._disposeObjects("__selected__P_162_2");
    }
  });
  qx.ui.core.SingleSelectionManager.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.Timer": {},
      "qx.bom.element.Dimension": {},
      "qx.lang.Object": {},
      "qx.bom.element.Style": {}
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
  
  ************************************************************************ */

  /**
   * Checks whether a given font is available on the document and fires events
   * accordingly.
   *
   * This class does not need to be disposed, unless you want to abort the validation
   * early
   */
  qx.Class.define("qx.bom.webfonts.Validator", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param fontFamily {String} The name of the font to be verified
     * @param comparisonString {String?} String to be used to detect whether a font was loaded or not
     * @param fontWeight {String?} the weight of the font to be verified
     * @param fontStyle {String?} the style of the font to be verified
     * whether the font has loaded properly
     */
    construct: function construct(fontFamily, comparisonString, fontWeight, fontStyle) {
      qx.core.Object.constructor.call(this);

      if (comparisonString) {
        this.setComparisonString(comparisonString);
      }

      if (fontWeight) {
        this.setFontWeight(fontWeight);
      }

      if (fontStyle) {
        this.setFontStyle(fontStyle);
      }

      if (fontFamily) {
        this.setFontFamily(fontFamily);
        this.__requestedHelpers__P_175_0 = this._getRequestedHelpers();
      }
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Sets of serif and sans-serif fonts to be used for size comparisons.
       * At least one of these fonts should be present on any system.
       */
      COMPARISON_FONTS: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        serif: ["Times New Roman", "Georgia", "serif"]
      },

      /**
       * Map of common CSS attributes to be used for all  size comparison elements
       */
      HELPER_CSS: {
        position: "absolute",
        margin: "0",
        padding: "0",
        top: "-1000px",
        left: "-1000px",
        fontSize: "350px",
        width: "auto",
        height: "auto",
        lineHeight: "normal",
        fontVariant: "normal",
        visibility: "hidden"
      },

      /**
       * The string to be used in the size comparison elements. This is the default string
       * which is used for the {@link #COMPARISON_FONTS} and the font to be validated. It
       * can be overridden for the font to be validated using the {@link #comparisonString}
       * property.
       */
      COMPARISON_STRING: "WEei",
      __defaultSizes__P_175_1: null,
      __defaultHelpers__P_175_2: null,

      /**
       * Removes the two common helper elements used for all size comparisons from
       * the DOM
       */
      removeDefaultHelperElements: function removeDefaultHelperElements() {
        var defaultHelpers = qx.bom.webfonts.Validator.__defaultHelpers__P_175_2;

        if (defaultHelpers) {
          for (var prop in defaultHelpers) {
            document.body.removeChild(defaultHelpers[prop]);
          }
        }

        delete qx.bom.webfonts.Validator.__defaultHelpers__P_175_2;
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The font-family this validator should check
       */
      fontFamily: {
        nullable: true,
        init: null,
        apply: "_applyFontFamily"
      },

      /** The font weight to check */
      fontWeight: {
        nullable: true,
        check: "String",
        apply: "_applyFontWeight"
      },

      /** The font style to check */
      fontStyle: {
        nullable: true,
        check: "String",
        apply: "_applyFontStyle"
      },

      /**
       * Comparison string used to check whether the font has loaded or not.
       */
      comparisonString: {
        nullable: true,
        init: null
      },

      /**
       * Time in milliseconds from the beginning of the check until it is assumed
       * that a font is not available
       */
      timeout: {
        check: "Integer",
        init: 5000
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired when the status of a web font has been determined. The event data
       * is a map with the keys "family" (the font-family name) and "valid"
       * (Boolean).
       */
      changeStatus: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __requestedHelpers__P_175_0: null,
      __checkTimer__P_175_3: null,
      __checkStarted__P_175_4: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Validates the font
       */
      validate: function validate() {
        this.__checkStarted__P_175_4 = new Date().getTime();

        if (this.__checkTimer__P_175_3) {
          this.__checkTimer__P_175_3.restart();
        } else {
          this.__checkTimer__P_175_3 = new qx.event.Timer(100);

          this.__checkTimer__P_175_3.addListener("interval", this.__onTimerInterval__P_175_5, this); // Give the browser a chance to render the new elements


          qx.event.Timer.once(function () {
            this.__checkTimer__P_175_3.start();
          }, this, 0);
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROTECTED API
      ---------------------------------------------------------------------------
      */

      /**
       * Removes the helper elements from the DOM
       */
      _reset: function _reset() {
        if (this.__requestedHelpers__P_175_0) {
          for (var prop in this.__requestedHelpers__P_175_0) {
            var elem = this.__requestedHelpers__P_175_0[prop];
            document.body.removeChild(elem);
          }

          this.__requestedHelpers__P_175_0 = null;
        }
      },

      /**
       * Checks if the font is available by comparing the widths of the elements
       * using the generic fonts to the widths of the elements using the font to
       * be validated
       *
       * @return {Boolean} Whether or not the font caused the elements to differ
       * in size
       */
      _isFontValid: function _isFontValid() {
        if (!qx.bom.webfonts.Validator.__defaultSizes__P_175_1) {
          this.__init__P_175_6();
        }

        if (!this.__requestedHelpers__P_175_0) {
          this.__requestedHelpers__P_175_0 = this._getRequestedHelpers();
        } // force rerendering for chrome


        this.__requestedHelpers__P_175_0.sans.style.visibility = "visible";
        this.__requestedHelpers__P_175_0.sans.style.visibility = "hidden";
        this.__requestedHelpers__P_175_0.serif.style.visibility = "visible";
        this.__requestedHelpers__P_175_0.serif.style.visibility = "hidden";
        var requestedSans = qx.bom.element.Dimension.getWidth(this.__requestedHelpers__P_175_0.sans);
        var requestedSerif = qx.bom.element.Dimension.getWidth(this.__requestedHelpers__P_175_0.serif);
        var cls = qx.bom.webfonts.Validator;

        if (requestedSans !== cls.__defaultSizes__P_175_1.sans || requestedSerif !== cls.__defaultSizes__P_175_1.serif) {
          return true;
        }

        return false;
      },

      /**
       * Creates the two helper elements styled with the font to be checked
       *
       * @return {Map} A map with the keys <pre>sans</pre> and <pre>serif</pre>
       * and the created span elements as values
       */
      _getRequestedHelpers: function _getRequestedHelpers() {
        var fontsSans = [this.getFontFamily()].concat(qx.bom.webfonts.Validator.COMPARISON_FONTS.sans);
        var fontsSerif = [this.getFontFamily()].concat(qx.bom.webfonts.Validator.COMPARISON_FONTS.serif);
        return {
          sans: this._getHelperElement(fontsSans, this.getComparisonString()),
          serif: this._getHelperElement(fontsSerif, this.getComparisonString())
        };
      },

      /**
       * Creates a span element with the comparison text (either {@link #COMPARISON_STRING} or
       * {@link #comparisonString}) and styled with the default CSS ({@link #HELPER_CSS}) plus
       * the given font-family value and appends it to the DOM
       *
       * @param fontFamily {String} font-family string
       * @param comparisonString {String?} String to be used to detect whether a font was loaded or not
       * @return {Element} the created DOM element
       */
      _getHelperElement: function _getHelperElement(fontFamily, comparisonString) {
        var styleMap = qx.lang.Object.clone(qx.bom.webfonts.Validator.HELPER_CSS);

        if (fontFamily) {
          if (styleMap.fontFamily) {
            styleMap.fontFamily += "," + fontFamily.join(",");
          } else {
            styleMap.fontFamily = fontFamily.join(",");
          }
        }

        if (this.getFontWeight()) {
          styleMap.fontWeight = this.getFontWeight();
        }

        if (this.getFontStyle()) {
          styleMap.fontStyle = this.getFontStyle();
        }

        var elem = document.createElement("span");
        elem.innerHTML = comparisonString || qx.bom.webfonts.Validator.COMPARISON_STRING;
        qx.bom.element.Style.setStyles(elem, styleMap);
        document.body.appendChild(elem);
        return elem;
      },
      // property apply
      _applyFontFamily: function _applyFontFamily(value, old) {
        if (value !== old) {
          this._reset();
        }
      },
      // property apply
      _applyFontWeight: function _applyFontWeight(value, old) {
        if (value !== old) {
          this._reset();
        }
      },
      // property apply
      _applyFontStyle: function _applyFontStyle(value, old) {
        if (value !== old) {
          this._reset();
        }
      },

      /*
      ---------------------------------------------------------------------------
        PRIVATE API
      ---------------------------------------------------------------------------
      */

      /**
       * Creates the default helper elements and gets their widths
       */
      __init__P_175_6: function __init__P_175_6() {
        var cls = qx.bom.webfonts.Validator;

        if (!cls.__defaultHelpers__P_175_2) {
          cls.__defaultHelpers__P_175_2 = {
            sans: this._getHelperElement(cls.COMPARISON_FONTS.sans),
            serif: this._getHelperElement(cls.COMPARISON_FONTS.serif)
          };
        }

        cls.__defaultSizes__P_175_1 = {
          sans: qx.bom.element.Dimension.getWidth(cls.__defaultHelpers__P_175_2.sans),
          serif: qx.bom.element.Dimension.getWidth(cls.__defaultHelpers__P_175_2.serif)
        };
      },

      /**
       * Triggers helper element size comparison and fires a ({@link #changeStatus})
       * event with the result.
       */
      __onTimerInterval__P_175_5: function __onTimerInterval__P_175_5() {
        if (this._isFontValid()) {
          this.__checkTimer__P_175_3.stop();

          this._reset();

          this.fireDataEvent("changeStatus", {
            family: this.getFontFamily(),
            valid: true
          });
        } else {
          var now = new Date().getTime();

          if (now - this.__checkStarted__P_175_4 >= this.getTimeout()) {
            this.__checkTimer__P_175_3.stop();

            this._reset();

            this.fireDataEvent("changeStatus", {
              family: this.getFontFamily(),
              valid: false
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
      this._reset();

      this.__checkTimer__P_175_3.stop();

      this.__checkTimer__P_175_3.removeListener("interval", this.__onTimerInterval__P_175_5, this);

      this._disposeObjects("__checkTimer__P_175_3");
    }
  });
  qx.bom.webfonts.Validator.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.event.Timer": {
        "construct": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Timer, which accelerates after each interval. The initial delay and the
   * interval time can be set using the properties {@link #firstInterval}
   * and {@link #interval}. The {@link #interval} events will be fired with
   * decreasing interval times while the timer is running, until the {@link #minimum}
   * is reached. The {@link #decrease} property sets the amount of milliseconds
   * which will decreased after every firing.
   *
   * This class is e.g. used in the {@link qx.ui.form.RepeatButton} and
   * {@link qx.ui.form.HoverButton} widgets.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.event.AcceleratingTimer", {
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__timer__P_179_0 = new qx.event.Timer(this.getInterval());

      this.__timer__P_179_0.addListener("interval", this._onInterval, this);
    },
    events: {
      /** This event if fired each time the interval time has elapsed */
      interval: "qx.event.type.Event"
    },
    properties: {
      /**
       * Interval used after the first run of the timer. Usually a smaller value
       * than the "firstInterval" property value to get a faster reaction.
       */
      interval: {
        check: "Integer",
        init: 100
      },

      /**
       * Interval used for the first run of the timer. Usually a greater value
       * than the "interval" property value to a little delayed reaction at the first
       * time.
       */
      firstInterval: {
        check: "Integer",
        init: 500
      },

      /** This configures the minimum value for the timer interval. */
      minimum: {
        check: "Integer",
        init: 20
      },

      /** Decrease of the timer on each interval (for the next interval) until minTimer reached. */
      decrease: {
        check: "Integer",
        init: 2
      }
    },
    members: {
      __timer__P_179_0: null,
      __currentInterval__P_179_1: null,

      /**
       * Reset and start the timer.
       */
      start: function start() {
        this.__timer__P_179_0.setInterval(this.getFirstInterval());

        this.__timer__P_179_0.start();
      },

      /**
       * Stop the timer
       */
      stop: function stop() {
        this.__timer__P_179_0.stop();

        this.__currentInterval__P_179_1 = null;
      },

      /**
       * Interval event handler
       */
      _onInterval: function _onInterval() {
        this.__timer__P_179_0.stop();

        if (this.__currentInterval__P_179_1 == null) {
          this.__currentInterval__P_179_1 = this.getInterval();
        }

        this.__currentInterval__P_179_1 = Math.max(this.getMinimum(), this.__currentInterval__P_179_1 - this.getDecrease());

        this.__timer__P_179_0.setInterval(this.__currentInterval__P_179_1);

        this.__timer__P_179_0.start();

        this.fireEvent("interval");
      }
    },
    destruct: function destruct() {
      this._disposeObjects("__timer__P_179_0");
    }
  });
  qx.event.AcceleratingTimer.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Assert": {},
      "qx.bom.client.OperatingSystem": {
        "require": true
      },
      "qx.locale.Manager": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
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
   * Static class, which contains functionality to localize the names of keyboard keys.
   */
  qx.Class.define("qx.locale.Key", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Return localized name of a key identifier
       * {@link qx.event.type.KeySequence}
       *
       * @param size {String} format of the key identifier.
       *       Possible values: "short", "full"
       * @param keyIdentifier {String} key identifier to translate {@link qx.event.type.KeySequence}
       * @param locale {String} optional locale to be used
       * @return {String} localized key name
       */
      getKeyName: function getKeyName(size, keyIdentifier, locale) {
        {
          qx.core.Assert.assertInArray(size, ["short", "full"]);
        }
        var key = "key_" + size + "_" + keyIdentifier; // Control is always named control on a mac and not Strg in German e.g.

        if (qx.core.Environment.get("os.name") == "osx" && keyIdentifier == "Control") {
          key += "_Mac";
        }

        var localizedKey = qx.locale.Manager.getInstance().translate(key, [], locale);

        if (localizedKey == key) {
          return qx.locale.Key._keyNames[key] || keyIdentifier;
        } else {
          return localizedKey;
        }
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      var keyNames = {};
      var Manager = qx.locale.Manager; // TRANSLATION: short representation of key names

      keyNames[Manager.marktr("key_short_Backspace")] = "Backspace";
      keyNames[Manager.marktr("key_short_Tab")] = "Tab";
      keyNames[Manager.marktr("key_short_Space")] = "Space";
      keyNames[Manager.marktr("key_short_Enter")] = "Enter";
      keyNames[Manager.marktr("key_short_Shift")] = "Shift";
      keyNames[Manager.marktr("key_short_Control")] = "Ctrl";
      keyNames[Manager.marktr("key_short_Control_Mac")] = "Ctrl";
      keyNames[Manager.marktr("key_short_Alt")] = "Alt";
      keyNames[Manager.marktr("key_short_CapsLock")] = "Caps";
      keyNames[Manager.marktr("key_short_Meta")] = "Meta";
      keyNames[Manager.marktr("key_short_Escape")] = "Esc";
      keyNames[Manager.marktr("key_short_Left")] = "Left";
      keyNames[Manager.marktr("key_short_Up")] = "Up";
      keyNames[Manager.marktr("key_short_Right")] = "Right";
      keyNames[Manager.marktr("key_short_Down")] = "Down";
      keyNames[Manager.marktr("key_short_PageUp")] = "PgUp";
      keyNames[Manager.marktr("key_short_PageDown")] = "PgDn";
      keyNames[Manager.marktr("key_short_End")] = "End";
      keyNames[Manager.marktr("key_short_Home")] = "Home";
      keyNames[Manager.marktr("key_short_Insert")] = "Ins";
      keyNames[Manager.marktr("key_short_Delete")] = "Del";
      keyNames[Manager.marktr("key_short_NumLock")] = "Num";
      keyNames[Manager.marktr("key_short_PrintScreen")] = "Print";
      keyNames[Manager.marktr("key_short_Scroll")] = "Scroll";
      keyNames[Manager.marktr("key_short_Pause")] = "Pause";
      keyNames[Manager.marktr("key_short_Win")] = "Win";
      keyNames[Manager.marktr("key_short_Apps")] = "Apps"; // TRANSLATION: full/long representation of key names

      keyNames[Manager.marktr("key_full_Backspace")] = "Backspace";
      keyNames[Manager.marktr("key_full_Tab")] = "Tabulator";
      keyNames[Manager.marktr("key_full_Space")] = "Space";
      keyNames[Manager.marktr("key_full_Enter")] = "Enter";
      keyNames[Manager.marktr("key_full_Shift")] = "Shift";
      keyNames[Manager.marktr("key_full_Control")] = "Control";
      keyNames[Manager.marktr("key_full_Control_Mac")] = "Control";
      keyNames[Manager.marktr("key_full_Alt")] = "Alt";
      keyNames[Manager.marktr("key_full_CapsLock")] = "CapsLock";
      keyNames[Manager.marktr("key_full_Meta")] = "Meta";
      keyNames[Manager.marktr("key_full_Escape")] = "Escape";
      keyNames[Manager.marktr("key_full_Left")] = "Left";
      keyNames[Manager.marktr("key_full_Up")] = "Up";
      keyNames[Manager.marktr("key_full_Right")] = "Right";
      keyNames[Manager.marktr("key_full_Down")] = "Down";
      keyNames[Manager.marktr("key_full_PageUp")] = "PageUp";
      keyNames[Manager.marktr("key_full_PageDown")] = "PageDown";
      keyNames[Manager.marktr("key_full_End")] = "End";
      keyNames[Manager.marktr("key_full_Home")] = "Home";
      keyNames[Manager.marktr("key_full_Insert")] = "Insert";
      keyNames[Manager.marktr("key_full_Delete")] = "Delete";
      keyNames[Manager.marktr("key_full_NumLock")] = "NumLock";
      keyNames[Manager.marktr("key_full_PrintScreen")] = "PrintScreen";
      keyNames[Manager.marktr("key_full_Scroll")] = "Scroll";
      keyNames[Manager.marktr("key_full_Pause")] = "Pause";
      keyNames[Manager.marktr("key_full_Win")] = "Win";
      keyNames[Manager.marktr("key_full_Apps")] = "Apps"; // Save

      statics._keyNames = keyNames;
    }
  });
  qx.locale.Key.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
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
       2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Defines the callback for the single selection manager.
   *
   * @internal
   */
  qx.Interface.define("qx.ui.core.ISingleSelectionProvider", {
    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Returns the elements which are part of the selection.
       *
       * @return {qx.ui.core.Widget[]} The widgets for the selection.
       */
      getItems: function getItems() {},

      /**
       * Returns whether the given item is selectable.
       *
       * @param item {qx.ui.core.Widget} The item to be checked
       * @return {Boolean} Whether the given item is selectable
       */
      isItemSelectable: function isItemSelectable(item) {}
    }
  });
  qx.ui.core.ISingleSelectionProvider.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
        "require": true
      },
      "qx.Theme": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Css": {
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "css.rgba": {
          "load": true,
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
       * Andreas Ecker (ecker)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Windows classic color theme
   */
  qx.Theme.define("qx.theme.classic.Color", {
    colors: {
      background: "#EBE9ED",
      "background-light": "#F3F0F5",
      "light-background": "#EBE9ED",
      // compatibility
      "background-focused": "#F3F8FD",
      "background-focused-inner": "#DBEAF9",
      "background-disabled": "#F4F4F4",
      "background-selected": "#3E6CA8",
      "background-field": "white",
      "background-pane": "#FAFBFE",
      "background-invalid": "#FFE0E0",
      "border-lead": "#888888",
      "border-light": "white",
      "border-light-shadow": "#DCDFE4",
      "border-dark-shadow": "#A7A6AA",
      "border-dark": "#85878C",
      // alias for compatibility reasons
      "border-main": "#85878C",
      "border-focused-light": "#BCCEE5",
      "border-focused-light-shadow": "#A5BDDE",
      "border-focused-dark-shadow": "#7CA0CF",
      "border-focused-dark": "#3E6CA8",
      "border-separator": "#808080",
      // shadows
      shadow: qx.core.Environment.get("css.rgba") ? "rgba(0, 0, 0, 0.4)" : "#666666",
      invalid: "#990000",
      "border-focused-invalid": "#FF9999",
      text: "black",
      "text-disabled": "#A7A6AA",
      "text-selected": "white",
      "text-focused": "#3E5B97",
      "text-placeholder": "#CBC8CD",
      tooltip: "#FFFFE1",
      "tooltip-text": "black",
      "tooltip-invalid": "#C82C2C",
      button: "#EBE9ED",
      "button-hovered": "#F6F5F7",
      "button-abandoned": "#F9F8E9",
      "button-checked": "#F3F0F5",
      "window-active-caption-text": [255, 255, 255],
      "window-inactive-caption-text": [255, 255, 255],
      "window-active-caption": [51, 94, 168],
      "window-inactive-caption": [111, 161, 217],
      "date-chooser": "white",
      "date-chooser-title": [116, 116, 116],
      "date-chooser-selected": [52, 52, 52],
      effect: [254, 200, 60],
      "table-pane": "white",
      "table-header": [242, 242, 242],
      "table-header-border": [214, 213, 217],
      "table-header-cell": [235, 234, 219],
      "table-header-cell-hover": [255, 255, 255],
      "table-focus-indicator": [179, 217, 255],
      "table-row-background-focused-selected": [90, 138, 211],
      "table-row-background-focused": [221, 238, 255],
      "table-row-background-selected": [51, 94, 168],
      "table-row-background-even": [250, 248, 243],
      "table-row-background-odd": [255, 255, 255],
      "table-row-selected": [255, 255, 255],
      "table-row": [0, 0, 0],
      "table-row-line": "#EEE",
      "table-column-line": "#EEE",
      "progressive-table-header": "#AAAAAA",
      "progressive-table-row-background-even": [250, 248, 243],
      "progressive-table-row-background-odd": [255, 255, 255],
      "progressive-progressbar-background": "gray",
      "progressive-progressbar-indicator-done": "#CCCCCC",
      "progressive-progressbar-indicator-undone": "white",
      "progressive-progressbar-percent-background": "gray",
      "progressive-progressbar-percent-text": "white"
    }
  });
  qx.theme.classic.Color.$$dbClassInfo = $$dbClassInfo;
})();
//# sourceMappingURL=package-19.js.map?dt=1673131574552
qx.$$packageData['19'] = {
  "locales": {},
  "resources": {},
  "translations": {}
};
