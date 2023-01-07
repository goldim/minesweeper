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
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * Abstract base class for all managers of themed values.
   */
  qx.Class.define("qx.util.ValueManager", {
    type: "abstract",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this); // Create empty dynamic map

      this._dynamic = {};
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      _dynamic: null,

      /**
       * Returns the dynamically interpreted result for the incoming value
       *
       * @param value {String} dynamically interpreted identifier
       * @return {var} return the (translated) result of the incoming value
       */
      resolveDynamic: function resolveDynamic(value) {
        return this._dynamic[value];
      },

      /**
       * Whether a value is interpreted dynamically
       *
       * @param value {String} dynamically interpreted identifier
       * @return {Boolean} returns true if the value is interpreted dynamically
       */
      isDynamic: function isDynamic(value) {
        return !!this._dynamic[value];
      },

      /**
       * Returns the dynamically interpreted result for the incoming value,
       * (if available), otherwise returns the original value
       * @param value {String} Value to resolve
       * @return {var} either returns the (translated) result of the incoming
       * value or the value itself
       */
      resolve: function resolve(value) {
        if (value && this._dynamic[value]) {
          return this._dynamic[value];
        }

        return value;
      },

      /**
       * Sets the dynamics map.
       * @param value {Map} The map.
       */
      _setDynamic: function _setDynamic(value) {
        this._dynamic = value;
      },

      /**
       * Returns the dynamics map.
       * @return {Map} The map.
       */
      _getDynamic: function _getDynamic() {
        return this._dynamic;
      }
    }
  });
  qx.util.ValueManager.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.ValueManager": {
        "require": true
      },
      "qx.util.ColorUtil": {}
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
   * Manager for color themes
   */
  qx.Class.define("qx.theme.manager.Color", {
    type: "singleton",
    extend: qx.util.ValueManager,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** the currently selected color theme */
      theme: {
        check: "Theme",
        nullable: true,
        apply: "_applyTheme",
        event: "changeTheme"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      _applyTheme: function _applyTheme(value) {
        var dest = {};

        this._setDynamic(dest); // reset dynamic cache


        if (value) {
          var colors = value.colors;

          for (var name in colors) {
            if (!dest[name]) {
              dest[name] = this.__parseColor__P_92_0(colors, name);
            }
          }
        }
      },

      /**
       * Helper to take a color stored in the theme and returns the string color value.
       * In most of the times that means it just returns the string stored in the theme.
       * It additionally checks if its a valid color at all.
       *
       * @param colors {Map} The map of color definitions.
       * @param name {String} The name of the color to check.
       * @return {String} The resolved color as string.
       */
      __parseColor__P_92_0: function __parseColor__P_92_0(colors, name) {
        var color = colors[name];

        if (typeof color === "string") {
          if (!qx.util.ColorUtil.isCssString(color)) {
            // check for references to in theme colors
            if (colors[color] != undefined) {
              return this.__parseColor__P_92_0(colors, color);
            }

            throw new Error("Could not parse color: " + color);
          }

          return color;
        } else if (color instanceof Array) {
          return qx.util.ColorUtil.rgbToRgbString(color);
        } else if (color instanceof Function) {
          return this.__parseColor__P_92_0(colors, color(name));
        } // this is might already be a rgb or hex color


        return name;
      },

      /**
       * Returns the dynamically interpreted result for the incoming value,
       * (if available), otherwise returns the original value
       * @param value {String} Value to resolve
       * @return {var} either returns the (translated) result of the incoming
       * value or the value itself
       */
      resolve: function resolve(value) {
        var cache = this._dynamic;
        var resolved = cache[value];

        if (resolved) {
          return resolved;
        } // If the font instance is not yet cached create a new one to return
        // This is true whenever a runtime include occurred (using "qx.Theme.include"
        // or "qx.Theme.patch"), since these methods only merging the keys of
        // the theme and are not updating the cache


        var theme = this.getTheme();

        if (theme !== null && theme.colors[value]) {
          return cache[value] = this.__parseColor__P_92_0(theme.colors, value);
        }

        return value;
      },

      /**
       * Whether a value is interpreted dynamically
       *
       * @param value {String} dynamically interpreted identifier
       * @return {Boolean} returns true if the value is interpreted dynamically
       */
      isDynamic: function isDynamic(value) {
        var cache = this._dynamic;

        if (value && cache[value] !== undefined) {
          return true;
        } // If the font instance is not yet cached create a new one to return
        // This is true whenever a runtime include occurred (using "qx.Theme.include"
        // or "qx.Theme.patch"), since these methods only merging the keys of
        // the theme and are not updating the cache


        var theme = this.getTheme();

        if (theme !== null && value && theme.colors[value] !== undefined) {
          cache[value] = this.__parseColor__P_92_0(theme.colors, value);
          return true;
        }

        return false;
      }
    }
  });
  qx.theme.manager.Color.$$dbClassInfo = $$dbClassInfo;
})();

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "construct": true,
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
      "qx.bom.client.Engine": {
        "construct": true,
        "require": true
      },
      "qx.bom.client.Browser": {
        "construct": true,
        "require": true
      },
      "qx.lang.Type": {},
      "qx.ui.style.Stylesheet": {},
      "qx.Bootstrap": {},
      "qx.ui.decoration.Decorator": {},
      "qx.ui.decoration.IDecorator": {},
      "qx.lang.Object": {},
      "qx.util.AliasManager": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "construct": true,
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "construct": true,
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
   * Manager for decoration themes
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.theme.manager.Decoration", {
    type: "singleton",
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],
    statics: {
      /** The prefix for all created CSS classes*/
      CSS_CLASSNAME_PREFIX: "qx-"
    },
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__rules__P_81_0 = [];
      this.__legacyIe__P_81_1 = qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9;
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Selected decoration theme */
      theme: {
        check: "Theme",
        nullable: true,
        apply: "_applyTheme",
        event: "changeTheme"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __dynamic__P_81_2: null,
      __rules__P_81_0: null,
      __legacyIe__P_81_1: false,

      /**
       * Returns the name which will be / is used as css class name.
       * @param value {String|qx.ui.decoration.IDecorator} The decorator string or instance.
       * @return {String} The css class name.
       */
      getCssClassName: function getCssClassName(value) {
        var prefix = qx.theme.manager.Decoration.CSS_CLASSNAME_PREFIX;

        if (qx.lang.Type.isString(value)) {
          return prefix + value;
        } else {
          return prefix + value.toHashCode();
        }
      },

      /**
       * Adds a css class to the global stylesheet for the given decorator.
       * This includes resolving the decorator if it's a string.
       * @param value {String|qx.ui.decoration.IDecorator} The decorator string or instance.
       * @return {String} the css class name.
       */
      addCssClass: function addCssClass(value) {
        var sheet = qx.ui.style.Stylesheet.getInstance();
        var instance = value;
        value = this.getCssClassName(value);
        var selector = "." + value;

        if (sheet.hasRule(selector)) {
          return value;
        }

        if (qx.lang.Type.isString(instance)) {
          instance = this.resolve(instance);
        }

        if (!instance) {
          throw new Error("Unable to resolve decorator '" + value + "'.");
        } // create and add a CSS rule


        var css = "";
        var styles = instance.getStyles(true); // Sort the styles so that more specific styles come after the group styles,
        // eg background-color comes after background. The sort order is alphabetical
        // so that short cut rules come before actual

        Object.keys(styles).sort().forEach(function (key) {
          // if we find a map value, use it as pseudo class
          if (qx.Bootstrap.isObject(styles[key])) {
            var innerCss = "";
            var innerStyles = styles[key];
            var inner = false;

            for (var innerKey in innerStyles) {
              inner = true;
              innerCss += innerKey + ":" + innerStyles[innerKey] + ";";
            }

            var innerSelector = this.__legacyIe__P_81_1 ? selector : selector + (inner ? ":" : "");

            this.__rules__P_81_0.push(innerSelector + key);

            sheet.addRule(innerSelector + key, innerCss);
            return;
          }

          css += key + ":" + styles[key] + ";";
        }, this);

        if (css) {
          sheet.addRule(selector, css);

          this.__rules__P_81_0.push(selector);
        }

        return value;
      },

      /**
       * Removes all previously by {@link #addCssClass} created CSS rule from
       * the global stylesheet.
       */
      removeAllCssClasses: function removeAllCssClasses() {
        // remove old rules
        for (var i = 0; i < this.__rules__P_81_0.length; i++) {
          var selector = this.__rules__P_81_0[i];
          qx.ui.style.Stylesheet.getInstance().removeRule(selector);
        }

        this.__rules__P_81_0 = [];
      },

      /**
       * Returns the dynamically interpreted result for the incoming value
       *
       * @param value {String} dynamically interpreted idenfier
       * @return {var} return the (translated) result of the incoming value
       */
      resolve: function resolve(value) {
        if (!value) {
          return null;
        }

        if (_typeof(value) === "object") {
          return value;
        }

        var cache = this.__dynamic__P_81_2;

        if (!cache) {
          cache = this.__dynamic__P_81_2 = {};
        }

        var resolved = cache[value];

        if (resolved) {
          return resolved;
        }

        var theme = this.getTheme();

        if (!theme) {
          return null;
        }

        if (!theme.decorations[value]) {
          return null;
        } // create an empty decorator


        var decorator = new qx.ui.decoration.Decorator(); // handle recursive decorator includes

        var recurseDecoratorInclude = function recurseDecoratorInclude(currentEntry, name) {
          // follow the include chain to the topmost decorator entry
          if (currentEntry.include && theme.decorations[currentEntry.include]) {
            recurseDecoratorInclude(theme.decorations[currentEntry.include], currentEntry.include);
          } // apply styles from the included decorator,
          // overwriting existing values.


          if (currentEntry.style) {
            decorator.set(currentEntry.style);
          }
        }; // start with the current decorator entry


        recurseDecoratorInclude(theme.decorations[value], value);
        cache[value] = decorator;
        return cache[value];
      },

      /**
       * Whether the given value is valid for being used in a property
       * with the 'check' configured to 'Decorator'.
       *
       * @param value {var} Incoming value
       * @return {Boolean} Whether the value is valid for being used in a Decorator property
       */
      isValidPropertyValue: function isValidPropertyValue(value) {
        if (typeof value === "string") {
          return this.isDynamic(value);
        } else if (_typeof(value) === "object") {
          var clazz = value.constructor;
          return qx.Class.hasInterface(clazz, qx.ui.decoration.IDecorator);
        }

        return false;
      },

      /**
       * Whether a value is interpreted dynamically
       *
       * @param value {String} dynamically interpreted identifier
       * @return {Boolean} returns <code>true</code> if the value is interpreted dynamically
       */
      isDynamic: function isDynamic(value) {
        if (!value) {
          return false;
        }

        var theme = this.getTheme();

        if (!theme) {
          return false;
        }

        return !!theme.decorations[value];
      },

      /**
       * Whether the given decorator is cached
       *
       * @param decorator {String|qx.ui.decoration.IDecorator} The decorator to check
       * @return {Boolean} <code>true</code> if the decorator is cached
       * @internal
       */
      isCached: function isCached(decorator) {
        return !this.__dynamic__P_81_2 ? false : qx.lang.Object.contains(this.__dynamic__P_81_2, decorator);
      },
      // property apply
      _applyTheme: function _applyTheme(value, old) {
        var aliasManager = qx.util.AliasManager.getInstance(); // remove old rules

        this.removeAllCssClasses();

        if (old) {
          for (var alias in old.aliases) {
            aliasManager.remove(alias);
          }
        }

        if (value) {
          for (var alias in value.aliases) {
            aliasManager.add(alias, value.aliases[alias]);
          }
        }

        this._disposeMap("__dynamic__P_81_2");

        this.__dynamic__P_81_2 = {};
      },

      /**
       * Clears internal caches and removes all previously created CSS classes.
       */
      clear: function clear() {
        // remove aliases
        var aliasManager = qx.util.AliasManager.getInstance();
        var theme = this.getTheme();

        if (!aliasManager.isDisposed() && theme && theme.alias) {
          for (var alias in theme.aliases) {
            aliasManager.remove(alias, theme.aliases[alias]);
          }
        } // remove old rules


        this.removeAllCssClasses();

        this._disposeMap("__dynamic__P_81_2");

        this.__dynamic__P_81_2 = {};
      },

      /**
       * Refreshes all decorator by clearing internal caches and re applying
       * aliases.
       */
      refresh: function refresh() {
        this.clear();
        var aliasManager = qx.util.AliasManager.getInstance();
        var theme = this.getTheme();

        if (theme && theme.alias) {
          for (var alias in theme.aliases) {
            aliasManager.add(alias, theme.aliases[alias]);
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
      this.clear();
    }
  });
  qx.theme.manager.Decoration.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.ValueManager": {
        "construct": true,
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.bom.Font": {},
      "qx.lang.Object": {},
      "qx.bom.webfonts.WebFont": {}
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
   * Manager for font themes
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @ignore(qx.$$fontBootstrap)
   */
  qx.Class.define("qx.theme.manager.Font", {
    type: "singleton",
    extend: qx.util.ValueManager,
    implement: [qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.util.ValueManager.constructor.call(this); // Grab bootstrap info

      if (qx.$$fontBootstrap) {
        this._manifestFonts = qx.$$fontBootstrap;
        delete qx.$$fontBootstrap;
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** the currently selected font theme */
      theme: {
        check: "Theme",
        nullable: true,
        apply: "_applyTheme",
        event: "changeTheme"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      _manifestFonts: null,

      /**
       * Returns the dynamically interpreted result for the incoming value
       *
       * @param value {String} dynamically interpreted identifier
       * @return {var} return the (translated) result of the incoming value
       */
      resolveDynamic: function resolveDynamic(value) {
        var dynamic = this._dynamic;
        return value instanceof qx.bom.Font ? value : dynamic[value];
      },

      /**
       * Returns the dynamically interpreted result for the incoming value,
       * (if available), otherwise returns the original value
       * @param value {String} Value to resolve
       * @return {var} either returns the (translated) result of the incoming
       * value or the value itself
       */
      resolve: function resolve(value) {
        var cache = this._dynamic;
        var resolved = cache[value];

        if (resolved) {
          return resolved;
        } // If the font instance is not yet cached create a new one to return
        // This is true whenever a runtime include occurred (using "qx.Theme.include"
        // or "qx.Theme.patch"), since these methods only merging the keys of
        // the theme and are not updating the cache


        var theme = this.getTheme();

        if (theme !== null && theme.fonts[value]) {
          var font = this.__getFontClass__P_93_0(theme.fonts[value]);

          var fo = new font(); // Inject information about custom charcter set tests before we apply the
          // complete blob in one.

          if (theme.fonts[value].comparisonString) {
            fo.setComparisonString(theme.fonts[value].comparisonString);
          }

          return cache[value] = fo.set(theme.fonts[value]);
        }

        {
          if (theme) {
            if (!this.__warnedMissingFonts__P_93_1) {
              this.__warnedMissingFonts__P_93_1 = {};
            }

            if (!this.__warnedMissingFonts__P_93_1[value]) {
              this.__warnedMissingFonts__P_93_1[value] = true;
              this.debug("Cannot resolve a font named ".concat(value, " - available fonts are ").concat(Object.keys(theme.fonts).join(", ")));
            }
          }
        }
        return value;
      },

      /**
       * Whether a value is interpreted dynamically
       *
       * @param value {String} dynamically interpreted identifier
       * @return {Boolean} returns true if the value is interpreted dynamically
       */
      isDynamic: function isDynamic(value) {
        var cache = this._dynamic;

        if (value && (value instanceof qx.bom.Font || cache[value] !== undefined)) {
          return true;
        } // If the font instance is not yet cached create a new one to return
        // This is true whenever a runtime include occurred (using "qx.Theme.include"
        // or "qx.Theme.patch"), since these methods only merging the keys of
        // the theme and are not updating the cache


        var theme = this.getTheme();

        if (theme !== null && value && theme.fonts[value]) {
          var font = this.__getFontClass__P_93_0(theme.fonts[value]);

          var fo = new font(); // Inject information about custom charcter set tests before we apply the
          // complete blob in one.

          if (theme.fonts[value].comparisonString) {
            fo.setComparisonString(theme.fonts[value].comparisonString);
          }

          cache[value] = fo.set(theme.fonts[value]);
          return true;
        }

        return false;
      },

      /**
       * Checks for includes and resolves them recursively
       *
       * @param fonts {Map} all fonts of the theme
       * @param fontName {String} font name to include
       */
      __resolveInclude__P_93_2: function __resolveInclude__P_93_2(fonts, fontName) {
        if (fonts[fontName].include) {
          // get font infos out of the font theme
          var fontToInclude = fonts[fonts[fontName].include]; // delete 'include' key - not part of the merge

          fonts[fontName].include = null;
          delete fonts[fontName].include;
          fonts[fontName] = qx.lang.Object.mergeWith(fonts[fontName], fontToInclude, false);

          this.__resolveInclude__P_93_2(fonts, fontName);
        }
      },
      // apply method
      _applyTheme: function _applyTheme(value) {
        var dest = this._dynamic = {};

        for (var key in dest) {
          if (dest[key].themed) {
            dest[key].dispose();
            delete dest[key];
          }
        }

        if (value) {
          var source = this._manifestFonts ? Object.assign(value.fonts, this._manifestFonts) : value.fonts;

          for (var key in source) {
            if (source[key].include && source[source[key].include]) {
              this.__resolveInclude__P_93_2(source, key);
            }

            var font = this.__getFontClass__P_93_0(source[key]);

            var fo = new font(); // Inject information about custom charcter set tests before we apply the
            // complete blob in one.

            if (source[key].comparisonString) {
              fo.setComparisonString(source[key].comparisonString);
            }

            dest[key] = fo.set(source[key]);
            dest[key].themed = true;
          }
        }

        this._setDynamic(dest);
      },

      /**
       * Decides which Font class should be used based on the theme configuration
       *
       * @param config {Map} The font's configuration map
       * @return {Class}
       */
      __getFontClass__P_93_0: function __getFontClass__P_93_0(config) {
        if (config.sources) {
          return qx.bom.webfonts.WebFont;
        }

        return qx.bom.Font;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeMap("_dynamic");
    }
  });
  qx.theme.manager.Font.$$dbClassInfo = $$dbClassInfo;
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
      "qx.util.AliasManager": {}
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
   * Manager for icon themes
   */
  qx.Class.define("qx.theme.manager.Icon", {
    type: "singleton",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** currently used icon theme */
      theme: {
        check: "Theme",
        nullable: true,
        apply: "_applyTheme",
        event: "changeTheme"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // property apply
      _applyTheme: function _applyTheme(value, old) {
        var aliasManager = qx.util.AliasManager.getInstance();

        if (old) {
          for (var alias in old.aliases) {
            aliasManager.remove(alias);
          }
        }

        if (value) {
          for (var alias in value.aliases) {
            aliasManager.add(alias, value.aliases[alias]);
          }
        }
      }
    }
  });
  qx.theme.manager.Icon.$$dbClassInfo = $$dbClassInfo;
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
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * Manager for appearance themes
   */
  qx.Class.define("qx.theme.manager.Appearance", {
    type: "singleton",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__styleCache__P_94_0 = {};
      this.__aliasMap__P_94_1 = {};
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Currently used appearance theme */
      theme: {
        check: "Theme",
        nullable: true,
        event: "changeTheme",
        apply: "_applyTheme"
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
       * @lint ignoreReferenceField(__defaultStates)
       */
      __defaultStates__P_94_2: {},
      __styleCache__P_94_0: null,
      __aliasMap__P_94_1: null,
      // property apply
      _applyTheme: function _applyTheme() {
        // empty the caches
        this.__aliasMap__P_94_1 = {};
        this.__styleCache__P_94_0 = {};
      },

      /*
      ---------------------------------------------------------------------------
        THEME HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the appearance entry ID to use
       * when all aliases etc. are processed.
       *
       * @param id {String} ID to resolve.
       * @param theme {Theme} Theme to use for lookup.
       * @param defaultId {String} ID for a fallback.
       * @param chain {Array} The appearance id chain.
       * @return {String} Resolved ID
       */
      __resolveId__P_94_3: function __resolveId__P_94_3(id, theme, defaultId, chain) {
        var db = theme.appearances;
        var entry = db[id];

        if (!entry) {
          var divider = "/";
          var end = [];
          var splitted = id.split(divider);
          var chainCopy = qx.lang.Array.clone(splitted);
          var alias;

          while (!entry && splitted.length > 0) {
            end.unshift(splitted.pop());
            var baseid = splitted.join(divider);
            entry = db[baseid];

            if (entry) {
              alias = entry.alias || entry;

              if (typeof alias === "string") {
                var mapped = alias + divider + end.join(divider);
                return this.__resolveId__P_94_3(mapped, theme, defaultId, chainCopy);
              }
            }
          } // check if we find a control fitting in the appearance [BUG #4020]


          for (var i = 0; i < end.length - 1; i++) {
            // remove the first id, it has already been checked at startup
            end.shift(); // build a new subid without the former first id

            var subId = end.join(divider);

            var resolved = this.__resolveId__P_94_3(subId, theme, null, chainCopy);

            if (resolved) {
              return resolved;
            }
          } // check for the fallback


          if (defaultId != null) {
            return this.__resolveId__P_94_3(defaultId, theme, null, chainCopy);
          } // it's safe to output this message here since we can be sure that the return
          // value is 'null' and something went wrong with the id lookup.


          {
            if (typeof chain !== "undefined") {
              this.debug("Cannot find a matching appearance for '" + chain.join("/") + "'.");

              if (chain.length > 1) {
                this.info("Hint: This may be an issue with nested child controls and a missing alias definition in the appearance theme.");
              }
            }
          }
          return null;
        } else if (typeof entry === "string") {
          return this.__resolveId__P_94_3(entry, theme, defaultId, chainCopy);
        } else if (entry.include && !entry.style) {
          return this.__resolveId__P_94_3(entry.include, theme, defaultId, chainCopy);
        }

        return id;
      },

      /**
       * Get the result of the "state" function for a given id and states
       *
       * @param id {String} id of the appearance (e.g. "button", "label", ...)
       * @param states {Map} hash map defining the set states
       * @param theme {Theme?} appearance theme
       * @param defaultId {String} fallback id.
       * @return {Map} map of widget properties as returned by the "state" function
       */
      styleFrom: function styleFrom(id, states, theme, defaultId) {
        if (!theme) {
          theme = this.getTheme();
        } // Resolve ID


        var aliasMap = this.__aliasMap__P_94_1;

        if (!aliasMap[theme.name]) {
          aliasMap[theme.name] = {};
        }

        var resolved = aliasMap[theme.name][id];

        if (!resolved) {
          resolved = aliasMap[theme.name][id] = this.__resolveId__P_94_3(id, theme, defaultId);
        } // Query theme for ID


        var entry = theme.appearances[resolved];

        if (!entry) {
          this.warn("Missing appearance: " + id);
          return null;
        } // Entries with includes, but without style are automatically merged
        // by the ID handling in {@link #getEntry}. When there is no style method in the
        // final object the appearance is empty and null could be returned.


        if (!entry.style) {
          return null;
        } // Build an unique cache name from ID and state combination


        var unique = resolved;

        if (states) {
          // Create data fields
          var bits = entry.$$bits;

          if (!bits) {
            bits = entry.$$bits = {};
            entry.$$length = 0;
          } // Compute sum


          var sum = 0;

          for (var state in states) {
            if (!states[state]) {
              continue;
            }

            if (bits[state] == null) {
              bits[state] = 1 << entry.$$length++;
            }

            sum += bits[state];
          } // Only append the sum if it is bigger than zero


          if (sum > 0) {
            unique += ":" + sum;
          }
        } // Using cache if available


        var cache = this.__styleCache__P_94_0;

        if (cache[theme.name] && cache[theme.name][unique] !== undefined) {
          return cache[theme.name][unique];
        } // Fallback to default (empty) states map


        if (!states) {
          states = this.__defaultStates__P_94_2;
        } // Compile the appearance


        var result; // If an include or base is defined, too, we need to merge the entries

        if (entry.include || entry.base) {
          // Gather included data
          var incl;

          if (entry.include) {
            incl = this.styleFrom(entry.include, states, theme, defaultId);
          } // This process tries to insert the original data first, and
          // append the new data later, to higher prioritize the local
          // data above the included/inherited data. This is especially needed
          // for property groups or properties which includes other
          // properties when modified.


          var local = entry.style(states, incl); // Create new map

          result = {}; // Copy base data, but exclude overwritten local and included stuff

          if (entry.base) {
            var base = this.styleFrom(resolved, states, entry.base, defaultId);

            if (entry.include) {
              for (var baseIncludeKey in base) {
                if (!incl.hasOwnProperty(baseIncludeKey) && !local.hasOwnProperty(baseIncludeKey)) {
                  result[baseIncludeKey] = base[baseIncludeKey];
                }
              }
            } else {
              for (var baseKey in base) {
                if (!local.hasOwnProperty(baseKey)) {
                  result[baseKey] = base[baseKey];
                }
              }
            }
          } // Copy include data, but exclude overwritten local stuff


          if (entry.include) {
            for (var includeKey in incl) {
              if (!local.hasOwnProperty(includeKey)) {
                result[includeKey] = incl[includeKey];
              }
            }
          } // Append local data


          for (var localKey in local) {
            result[localKey] = local[localKey];
          }
        } else {
          result = entry.style(states);
        } // Cache new entry and return


        if (!cache[theme.name]) {
          cache[theme.name] = {};
        }

        return cache[theme.name][unique] = result || null;
      }
    }
  });
  qx.theme.manager.Appearance.$$dbClassInfo = $$dbClassInfo;
})();

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

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
      "qx.dev.StackTrace": {}
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
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * Theme classes contain styling information for certain aspects of the
   * graphical user interface.
   *
   * Supported themes are: colors, decorations, fonts, icons, appearances.
   * The additional meta theme allows for grouping of the individual
   * themes.
   *
   * For more details, take a look at the
   * <a href='http://qooxdoo.org/docs/#desktop/gui/theming.md' target='_blank'>
   * documentation of the theme system in the qooxdoo manual.</a>
   */
  qx.Bootstrap.define("qx.Theme", {
    statics: {
      /*
      ---------------------------------------------------------------------------
         PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Theme config
       *
       * Example:
       * <pre class='javascript'>
       * qx.Theme.define("name",
       * {
       *   aliases : {
       *     "aliasKey" : "resourceFolderOrUri"
       *   },
       *   extend : otherTheme,
       *   include : [MMixinTheme],
       *   patch : [MMixinTheme],
       *   colors : {},
       *   decorations : {},
       *   fonts : {},
       *   widgets : {},
       *   appearances : {},
       *   meta : {},
       *   boot : function(){}
       * });
       * </pre>
       *
       * For more details, take a look at the
       * <a href='http://qooxdoo.org/docs/#desktop/gui/theming.md' target='_blank'>
       * documentation of the theme system in the qooxdoo manual.</a>
       *
       * @param name {String} name of the mixin
       * @param config {Map} config structure
       */
      define: function define(name, config) {
        if (!config) {
          var config = {};
        }

        config.include = this.__normalizeArray__P_7_0(config.include);
        config.patch = this.__normalizeArray__P_7_0(config.patch); // Validate incoming data

        {
          this.__validateConfig__P_7_1(name, config);
        } // Create alias

        var theme = {
          $$type: "Theme",
          name: name,
          title: config.title,
          // Attach toString
          toString: this.genericToString
        }; // Remember extend

        if (config.extend) {
          theme.supertheme = config.extend;
        } // Assign to namespace


        theme.basename = qx.Bootstrap.createNamespace(name, theme); // Convert theme entry from Object to Function (for prototype inheritance)

        this.__convert__P_7_2(theme, config);

        this.__initializeAliases__P_7_3(theme, config); // Store class reference in global class registry


        this.$$registry[name] = theme; // Include mixin themes

        for (var i = 0, a = config.include, l = a.length; i < l; i++) {
          this.include(theme, a[i]);
        }

        for (var i = 0, a = config.patch, l = a.length; i < l; i++) {
          this.patch(theme, a[i]);
        } // Run boot code


        if (config.boot) {
          config.boot();
        }
      },

      /**
       * Normalize an object to an array
       *
       * @param objectOrArray {Object|Array} Either an object that is to be
       *   normalized to an array, or an array, which is just passed through
       *
       * @return {Array} Either an array that has the original object as its
       *   single item, or the original array itself
       */
      __normalizeArray__P_7_0: function __normalizeArray__P_7_0(objectOrArray) {
        if (!objectOrArray) {
          return [];
        }

        if (qx.Bootstrap.isArray(objectOrArray)) {
          return objectOrArray;
        } else {
          return [objectOrArray];
        }
      },

      /**
       * Initialize alias inheritance
       *
       * @param theme {Map} The theme
       * @param config {Map} config structure
       */
      __initializeAliases__P_7_3: function __initializeAliases__P_7_3(theme, config) {
        var aliases = config.aliases || {};

        if (config.extend && config.extend.aliases) {
          qx.Bootstrap.objectMergeWith(aliases, config.extend.aliases, false);
        }

        theme.aliases = aliases;
      },

      /**
       * Return a map of all known themes
       *
       * @return {Map} known themes
       */
      getAll: function getAll() {
        return this.$$registry;
      },

      /**
       * Returns a theme by name
       *
       * @param name {String} theme name to check
       * @return {Object ? void} theme object
       */
      getByName: function getByName(name) {
        return this.$$registry[name];
      },

      /**
       * Determine if theme exists
       *
       * @param name {String} theme name to check
       * @return {Boolean} true if theme exists
       */
      isDefined: function isDefined(name) {
        return this.getByName(name) !== undefined;
      },

      /**
       * Determine the number of themes which are defined
       *
       * @return {Number} the number of classes
       */
      getTotalNumber: function getTotalNumber() {
        return qx.Bootstrap.objectGetLength(this.$$registry);
      },

      /*
      ---------------------------------------------------------------------------
         PRIVATE/INTERNAL API
      ---------------------------------------------------------------------------
      */

      /**
       * This method will be attached to all themes to return
       * a nice identifier for them.
       *
       * @internal
       * @return {String} The interface identifier
       */
      genericToString: function genericToString() {
        return "[Theme " + this.name + "]";
      },

      /**
       * Extract the inheritable key (could be only one)
       *
       * @param config {Map} The map from where to extract the key
       * @return {String} the key which was found
       */
      __extractType__P_7_4: function __extractType__P_7_4(config) {
        for (var i = 0, keys = this.__inheritableKeys__P_7_5, l = keys.length; i < l; i++) {
          if (config[keys[i]]) {
            return keys[i];
          }
        }
      },

      /**
       * Convert existing entry to a prototype based inheritance function
       *
       * @param theme {Theme} newly created theme object
       * @param config {Map} incoming theme configuration
       */
      __convert__P_7_2: function __convert__P_7_2(theme, config) {
        var type = this.__extractType__P_7_4(config); // Use theme key from extended theme if own one is not available


        if (config.extend && !type) {
          type = config.extend.type;
        } // Save theme type


        theme.type = type || "other"; // Create pseudo class

        var clazz = function clazz() {}; // Process extend config


        if (config.extend) {
          clazz.prototype = new config.extend.$$clazz();
        }

        var target = clazz.prototype;
        var source = config[type]; // Copy entries to prototype

        for (var id in source) {
          target[id] = source[id]; // Appearance themes only:
          // Convert base flag to class reference (needed for mixin support)

          if (target[id].base) {
            {
              if (!config.extend) {
                throw new Error("Found base flag in entry '" + id + "' of theme '" + config.name + "'. Base flags are not allowed for themes without a valid super theme!");
              }
            }
            target[id].base = config.extend;
          }
        } // store pseudo class


        theme.$$clazz = clazz; // and create instance under the old key

        theme[type] = new clazz();
      },

      /** @type {Map} Internal theme registry */
      $$registry: {},

      /** @type {Array} Keys which support inheritance */
      __inheritableKeys__P_7_5: ["colors", "borders", "decorations", "fonts", "icons", "widgets", "appearances", "meta"],

      /** @type {Map} allowed keys in theme definition */
      __allowedKeys__P_7_6: qx.core.Environment.select("qx.debug", {
        "true": {
          title: "string",
          // String
          aliases: "object",
          // Map
          type: "string",
          // String
          extend: "object",
          // Theme
          colors: "object",
          // Map
          borders: "object",
          // Map
          decorations: "object",
          // Map
          fonts: "object",
          // Map
          icons: "object",
          // Map
          widgets: "object",
          // Map
          appearances: "object",
          // Map
          meta: "object",
          // Map
          include: "object",
          // Array
          patch: "object",
          // Array
          boot: "function" // Function

        },
        "default": null
      }),

      /** @type {Map} allowed keys inside a meta theme block */
      __metaKeys__P_7_7: qx.core.Environment.select("qx.debug", {
        "true": {
          color: "object",
          border: "object",
          decoration: "object",
          font: "object",
          icon: "object",
          appearance: "object",
          widget: "object"
        },
        "default": null
      }),

      /**
       * Validates incoming configuration and checks keys and values
       *
       * @signature function(name, config)
       * @param name {String} The name of the class
       * @param config {Map} Configuration map
       * @throws {Error} if the given config is not valid (e.g. wrong key or wrong key value)
       */
      __validateConfig__P_7_1: qx.core.Environment.select("qx.debug", {
        "true": function _true(name, config) {
          var allowed = this.__allowedKeys__P_7_6;

          for (var key in config) {
            if (allowed[key] === undefined) {
              throw new Error('The configuration key "' + key + '" in theme "' + name + '" is not allowed!');
            }

            if (config[key] == null) {
              throw new Error('Invalid key "' + key + '" in theme "' + name + '"! The value is undefined/null!');
            }

            if (allowed[key] !== null && _typeof(config[key]) !== allowed[key]) {
              throw new Error('Invalid type of key "' + key + '" in theme "' + name + '"! The type of the key must be "' + allowed[key] + '"!');
            }
          } // Validate maps


          var maps = ["colors", "borders", "decorations", "fonts", "icons", "widgets", "appearances", "meta"];

          for (var i = 0, l = maps.length; i < l; i++) {
            var key = maps[i];

            if (config[key] !== undefined && (config[key] instanceof Array || config[key] instanceof RegExp || config[key] instanceof Date || config[key].classname !== undefined)) {
              throw new Error('Invalid key "' + key + '" in theme "' + name + '"! The value needs to be a map!');
            }
          } // Check conflicts (detect number ...)


          var counter = 0;

          for (var i = 0, l = maps.length; i < l; i++) {
            var key = maps[i];

            if (config[key]) {
              counter++;
            }

            if (counter > 1) {
              throw new Error("You can only define one theme category per file! Invalid theme: " + name);
            }
          } // Validate meta


          if (config.meta) {
            var value;

            for (var key in config.meta) {
              value = config.meta[key];

              if (this.__metaKeys__P_7_7[key] === undefined) {
                throw new Error('The key "' + key + '" is not allowed inside a meta theme block.');
              }

              if (_typeof(value) !== this.__metaKeys__P_7_7[key]) {
                throw new Error('The type of the key "' + key + '" inside the meta block is wrong.');
              }

              if (!(_typeof(value) === "object" && value !== null && value.$$type === "Theme")) {
                throw new Error('The content of a meta theme must reference to other themes. The value for "' + key + '" in theme "' + name + '" is invalid: ' + value);
              }
            }
          } // Validate extend


          if (config.extend && config.extend.$$type !== "Theme") {
            throw new Error('Invalid extend in theme "' + name + '": ' + config.extend);
          } // Validate include


          if (config.include) {
            for (var i = 0, l = config.include.length; i < l; i++) {
              if (typeof config.include[i] == "undefined" || config.include[i].$$type !== "Theme") {
                throw new Error('Invalid include in theme "' + name + '": ' + config.include[i]);
              }
            }
          } // Validate patch


          if (config.patch) {
            for (var i = 0, l = config.patch.length; i < l; i++) {
              if (typeof config.patch[i] === "undefined" || config.patch[i].$$type !== "Theme") {
                throw new Error('Invalid patch in theme "' + name + '": ' + config.patch[i]);
              }
            }
          }
        },
        "default": function _default() {}
      }),

      /**
       * Include all keys of the given mixin theme into the theme. The mixin may
       * include keys which are already defined in the target theme. Existing
       * features of equal name will be overwritten.
       *
       * @param theme {Theme} An existing theme which should be modified by including the mixin theme.
       * @param mixinTheme {Theme} The theme to be included.
       */
      patch: function patch(theme, mixinTheme) {
        this.__checkForInvalidTheme__P_7_8(mixinTheme);

        var type = this.__extractType__P_7_4(mixinTheme);

        if (type !== this.__extractType__P_7_4(theme)) {
          throw new Error("The mixins '" + theme.name + "' are not compatible '" + mixinTheme.name + "'!");
        }

        var source = mixinTheme[type];
        var target = theme.$$clazz.prototype;

        for (var key in source) {
          target[key] = source[key];
        }
      },

      /**
       * Include all keys of the given mixin theme into the theme. If the
       * mixin includes any keys that are already available in the
       * class, they will be silently ignored. Use the {@link #patch} method
       * if you need to overwrite keys in the current class.
       *
       * @param theme {Theme} An existing theme which should be modified by including the mixin theme.
       * @param mixinTheme {Theme} The theme to be included.
       */
      include: function include(theme, mixinTheme) {
        this.__checkForInvalidTheme__P_7_8(mixinTheme);

        var type = mixinTheme.type;

        if (type !== theme.type) {
          throw new Error("The mixins '" + theme.name + "' are not compatible '" + mixinTheme.name + "'!");
        }

        var source = mixinTheme[type];
        var target = theme.$$clazz.prototype;

        for (var key in source) {
          //Skip keys already present
          if (target[key] !== undefined) {
            continue;
          }

          target[key] = source[key];
        }
      },

      /**
       * Helper method to check for an invalid theme
       *
       * @param mixinTheme {qx.Theme?null} theme to check
       * @throws {Error} if the theme is not valid
       */
      __checkForInvalidTheme__P_7_8: function __checkForInvalidTheme__P_7_8(mixinTheme) {
        if (typeof mixinTheme === "undefined" || mixinTheme == null) {
          var errorObj = new Error("Mixin theme is not a valid theme!");
          {
            var stackTrace = qx.dev.StackTrace.getStackTraceFromError(errorObj);
            qx.Bootstrap.error(this, stackTrace);
          }
          throw errorObj;
        }
      }
    }
  });
  qx.Theme.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Assert": {},
      "qx.event.GlobalError": {
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
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * Global timer support.
   *
   * This class can be used to periodically fire an event. This event can be
   * used to simulate e.g. a background task. The static method
   * {@link #once} is a special case. It will call a function deferred after a
   * given timeout.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.event.Timer", {
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param interval {Number} initial interval in milliseconds of the timer.
     */
    construct: function construct(interval) {
      qx.core.Object.constructor.call(this);

      if (interval != null) {
        this.setInterval(interval);
      } // don't use qx.lang.Function.bind because this function would add a
      // disposed check, which could break the functionality. In IE the handler
      // may get called after "clearInterval" (i.e. after the timer is disposed)
      // and we must be able to handle this.


      var self = this;

      this.__oninterval__P_87_0 = function () {
        self._oninterval.call(self);
      };
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** This event if fired each time the interval time has elapsed */
      interval: "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Start a function after a given timeout.
       *
       * @param func {Function} Function to call
       * @param obj {Object} context (this), the function is called with
       * @param timeout {Number} Number of milliseconds to wait before the
       *   function is called.
       * @return {qx.event.Timer} The timer object used for the timeout. This
       *    object can be used to cancel the timeout. Note that the timer is
       *    only valid until the timer has been executed.
       */
      once: function once(func, obj, timeout) {
        {
          // check the given parameter
          qx.core.Assert.assertFunction(func, "func is not a function");
          qx.core.Assert.assertNotUndefined(timeout, "No timeout given");
        } // Create time instance

        var timer = new qx.event.Timer(timeout); // Bug #3481: append original function to timer instance so it can be
        // read by a debugger

        timer.__onceFunc__P_87_1 = func; // Add event listener to interval

        timer.addListener("interval", function (e) {
          timer.stop();
          func.call(obj, e);
          delete timer.__onceFunc__P_87_1;
          timer.dispose();
          obj = null;
        }, obj); // Directly start timer

        timer.start();
        return timer;
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * With the enabled property the Timer can be started and suspended.
       * Setting it to "true" is equivalent to {@link #start}, setting it
       * to "false" is equivalent to {@link #stop}.
       */
      enabled: {
        init: false,
        check: "Boolean",
        apply: "_applyEnabled"
      },

      /**
       * Time in milliseconds between two callback calls.
       * This property can be set to modify the interval of
       * a running timer.
       */
      interval: {
        check: "Integer",
        init: 1000,
        apply: "_applyInterval"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __intervalHandler__P_87_2: null,
      __oninterval__P_87_0: null,

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */

      /**
       * Apply the interval of the timer.
       *
       * @param value {var} Current value
       * @param old {var} Previous value
       */
      _applyInterval: function _applyInterval(value, old) {
        if (this.getEnabled()) {
          this.restart();
        }
      },

      /**
       * Apply the enabled state of the timer.
       *
       * @param value {var} Current value
       * @param old {var} Previous value
       */
      _applyEnabled: function _applyEnabled(value, old) {
        if (old) {
          window.clearInterval(this.__intervalHandler__P_87_2);
          this.__intervalHandler__P_87_2 = null;
        } else if (value) {
          this.__intervalHandler__P_87_2 = window.setInterval(this.__oninterval__P_87_0, this.getInterval());
        }
      },

      /*
      ---------------------------------------------------------------------------
        USER-ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Start the timer
       *
       */
      start: function start() {
        this.setEnabled(true);
      },

      /**
       * Start the timer with a given interval
       *
       * @param interval {Integer} Time in milliseconds between two callback calls.
       */
      startWith: function startWith(interval) {
        this.setInterval(interval);
        this.start();
      },

      /**
       * Stop the timer.
       *
       */
      stop: function stop() {
        this.setEnabled(false);
      },

      /**
       * Restart the timer.
       * This makes it possible to change the interval of a running timer.
       *
       */
      restart: function restart() {
        this.stop();
        this.start();
      },

      /**
       * Restart the timer. with a given interval.
       *
       * @param interval {Integer} Time in milliseconds between two callback calls.
       */
      restartWith: function restartWith(interval) {
        this.stop();
        this.startWith(interval);
      },

      /*
      ---------------------------------------------------------------------------
        EVENT-MAPPER
      ---------------------------------------------------------------------------
      */

      /**
       * timer callback
       *
       * @signature function()
       */
      _oninterval: qx.event.GlobalError.observeMethod(function () {
        if (this.$$disposed) {
          return;
        }

        if (this.getEnabled()) {
          this.fireEvent("interval");
        }
      })
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (this.__intervalHandler__P_87_2) {
        window.clearInterval(this.__intervalHandler__P_87_2);
      }

      this.__intervalHandler__P_87_2 = this.__oninterval__P_87_0 = null;
    }
  });
  qx.event.Timer.$$dbClassInfo = $$dbClassInfo;
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
   * This mixin exposes all methods to manage the layout manager of a widget.
   * It can only be included into instances of {@link qx.ui.core.Widget}.
   *
   * To optimize the method calls the including widget should call the method
   * {@link #remap} in its defer function. This will map the protected
   * methods to the public ones and save one method call for each function.
   */
  qx.Mixin.define("qx.ui.core.MLayoutHandling", {
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
        this._setLayout(layout);
      },

      /**
       * Get the widget's layout manager.
       *
       * @return {qx.ui.layout.Abstract} The widget's layout manager
       */
      getLayout: function getLayout() {
        return this._getLayout();
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
          qx.log.Logger.debug("Calling qx.ui.core.MLayoutHandling.remap is deprecated, please dont use it");
        }
        members.getLayout = members._getLayout;
        members.setLayout = members._setLayout;
      }
    }
  });
  qx.ui.core.MLayoutHandling.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.MLayoutHandling": {
        "require": true
      },
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
   * The Composite is a generic container widget.
   *
   * It exposes all methods to set layouts and to manage child widgets
   * as public methods. You must configure this widget with a layout manager to
   * define the way the widget's children are positioned.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   // create the composite
   *   var composite = new qx.ui.container.Composite()
   *
   *   // configure it with a horizontal box layout with a spacing of '5'
   *   composite.setLayout(new qx.ui.layout.HBox(5));
   *
   *   // add some children
   *   composite.add(new qx.ui.basic.Label("Name: "));
   *   composite.add(new qx.ui.form.TextField());
   *
   *   this.getRoot().add(composite);
   * </pre>
   *
   * This example horizontally groups a label and text field by using a
   * Composite configured with a horizontal box layout as a container.
   *
   * *External Documentation*
   *
   * <a href='http://qooxdoo.org/docs/#desktop/widget/composite.md' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.container.Composite", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MChildrenHandling, qx.ui.core.MLayoutHandling],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param layout {qx.ui.layout.Abstract} A layout instance to use to
     *   place widgets on the screen.
     */
    construct: function construct(layout) {
      qx.ui.core.Widget.constructor.call(this);

      if (layout != null) {
        this._setLayout(layout);
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * This event is fired after a child widget was added to this widget. The
       * {@link qx.event.type.Data#getData} method of the event returns the
       * added child.
       */
      addChildWidget: "qx.event.type.Data",

      /**
       * This event is fired after a child widget has been removed from this widget.
       * The {@link qx.event.type.Data#getData} method of the event returns the
       * removed child.
       */
      removeChildWidget: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _afterAddChild: function _afterAddChild(child) {
        this.fireNonBubblingEvent("addChildWidget", qx.event.type.Data, [child]);
      },
      // overridden
      _afterRemoveChild: function _afterRemoveChild(child) {
        this.fireNonBubblingEvent("removeChildWidget", qx.event.type.Data, [child]);
      }
    }
  });
  qx.ui.container.Composite.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Function": {},
      "qx.event.Idle": {},
      "qx.bom.element.Location": {},
      "qx.util.placement.Placement": {}
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
       * Martin Wittemann (martinwittemann)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Methods to place popup like widgets to other widgets, points,
   * pointer event coordinates, etc.
   */
  qx.Mixin.define("qx.ui.core.MPlacement", {
    statics: {
      __visible__P_132_0: null,
      __direction__P_132_1: "left",

      /**
       * Set the always visible element. If an element is set, the
       * {@link #moveTo} method takes care of every move and tries not to cover
       * the given element with a movable widget like a popup or context menu.
       *
       * @param elem {qx.ui.core.Widget} The widget which should always be visible.
       */
      setVisibleElement: function setVisibleElement(elem) {
        this.__visible__P_132_0 = elem;
      },

      /**
       * Returns the given always visible element. See {@link #setVisibleElement}
       * for more details.
       *
       * @return {qx.ui.core.Widget|null} The given widget.
       */
      getVisibleElement: function getVisibleElement() {
        return this.__visible__P_132_0;
      },

      /**
       * Set the move direction for an element which hides always visible element.
       * The value has only an effect when the {@link #setVisibleElement} is set.
       *
       * @param direction {String} The direction <code>left</code> or <code>top</code>.
       */
      setMoveDirection: function setMoveDirection(direction) {
        if (direction === "top" || direction === "left") {
          this.__direction__P_132_1 = direction;
        } else {
          throw new Error("Invalid value for the parameter 'direction' [qx.ui.core.MPlacement.setMoveDirection()], the value was '" + direction + "' " + "but 'top' or 'left' are allowed.");
        }
      },

      /**
       * Returns the move direction for an element which hides always visible element.
       * See {@link #setMoveDirection} for more details.
       *
       * @return {String} The move direction.
       */
      getMoveDirection: function getMoveDirection() {
        return this.__direction__P_132_1;
      }
    },
    properties: {
      /**
       * Position of the aligned object in relation to the opener.
       *
       * Please note than changes to this property are only applied
       * when re-aligning the widget.
       *
       * The first part of the value is the edge to attach to. The second
       * part the alignment of the orthogonal edge after the widget
       * has been attached.
       *
       * The default value "bottom-left" for example means that the
       * widget should be shown directly under the given target and
       * then should be aligned to be left edge:
       *
       * <pre>
       * +--------+
       * | target |
       * +--------+
       * +-------------+
       * |   widget    |
       * +-------------+
       * </pre>
       */
      position: {
        check: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right", "left-top", "left-middle", "left-bottom", "right-top", "right-middle", "right-bottom"],
        init: "bottom-left",
        themeable: true
      },

      /**
       * Whether the widget should be placed relative to an other widget or to
       * the pointer.
       */
      placeMethod: {
        check: ["widget", "pointer"],
        init: "pointer",
        themeable: true
      },

      /** Whether the widget should moved using DOM methods. */
      domMove: {
        check: "Boolean",
        init: false
      },

      /**
       * Selects the algorithm to place the widget horizontally. <code>direct</code>
       * uses {@link qx.util.placement.DirectAxis}, <code>keep-align</code>
       * uses {@link qx.util.placement.KeepAlignAxis} and <code>best-fit</code>
       * uses {@link qx.util.placement.BestFitAxis}.
       */
      placementModeX: {
        check: ["direct", "keep-align", "best-fit"],
        init: "keep-align",
        themeable: true
      },

      /**
       * Selects the algorithm to place the widget vertically. <code>direct</code>
       * uses {@link qx.util.placement.DirectAxis}, <code>keep-align</code>
       * uses {@link qx.util.placement.KeepAlignAxis} and <code>best-fit</code>
       * uses {@link qx.util.placement.BestFitAxis}.
       */
      placementModeY: {
        check: ["direct", "keep-align", "best-fit"],
        init: "keep-align",
        themeable: true
      },

      /** Left offset of the pointer (in pixel) */
      offsetLeft: {
        check: "Integer",
        init: 0,
        themeable: true
      },

      /** Top offset of the pointer (in pixel) */
      offsetTop: {
        check: "Integer",
        init: 0,
        themeable: true
      },

      /** Right offset of the pointer (in pixel) */
      offsetRight: {
        check: "Integer",
        init: 0,
        themeable: true
      },

      /** Bottom offset of the pointer (in pixel) */
      offsetBottom: {
        check: "Integer",
        init: 0,
        themeable: true
      },

      /** Offsets in one group */
      offset: {
        group: ["offsetTop", "offsetRight", "offsetBottom", "offsetLeft"],
        mode: "shorthand",
        themeable: true
      }
    },
    members: {
      __ptwLiveUpdater__P_132_2: null,
      __ptwLiveDisappearListener__P_132_3: null,
      __ptwLiveUpdateDisappearListener__P_132_4: null,

      /**
       * Returns the location data like {qx.bom.element.Location#get} does,
       * but does not rely on DOM elements coordinates to be rendered. Instead,
       * this method works with the available layout data available in the moment
       * when it is executed.
       * This works best when called in some type of <code>resize</code> or
       * <code>move</code> event which are supported by all widgets out of the
       * box.
       *
       * @param widget {qx.ui.core.Widget} Any widget
       * @return {Map|null} Returns a map with <code>left</code>, <code>top</code>,
       *   <code>right</code> and <code>bottom</code> which contains the distance
       *   of the widget relative coords the document.
       */
      getLayoutLocation: function getLayoutLocation(widget) {
        // Use post-layout dimensions
        // which do not rely on the final rendered DOM element
        var insets, bounds, left, top; // Add bounds of the widget itself

        bounds = widget.getBounds();

        if (!bounds) {
          return null;
        }

        left = bounds.left;
        top = bounds.top; // Keep size to protect it for loop

        var size = bounds; // Now loop up with parents until reaching the root

        widget = widget.getLayoutParent();

        while (widget && !widget.isRootWidget()) {
          // Add coordinates
          bounds = widget.getBounds();
          left += bounds.left;
          top += bounds.top; // Add insets

          insets = widget.getInsets();
          left += insets.left;
          top += insets.top; // Next parent

          widget = widget.getLayoutParent();
        } // Add the rendered location of the root widget


        if (widget && widget.isRootWidget()) {
          var rootCoords = widget.getContentLocation();

          if (rootCoords) {
            left += rootCoords.left;
            top += rootCoords.top;
          }
        } // Build location data


        return {
          left: left,
          top: top,
          right: left + size.width,
          bottom: top + size.height
        };
      },

      /**
       * Sets the position. Uses low-level, high-performance DOM
       * methods when the property {@link #domMove} is enabled.
       * Checks if an always visible element is set and moves the widget to not
       * overlay the always visible widget if possible. The algorithm tries to
       * move the widget as far left as necessary but not of the screen.
       * ({@link #setVisibleElement})
       *
       * @param left {Integer} The left position
       * @param top {Integer} The top position
       */
      moveTo: function moveTo(left, top) {
        var visible = qx.ui.core.MPlacement.getVisibleElement(); // if we have an always visible element

        if (visible) {
          var bounds = this.getBounds();
          var elemLocation = visible.getContentLocation(); // if we have bounds for both elements

          if (bounds && elemLocation) {
            var bottom = top + bounds.height;
            var right = left + bounds.width; // horizontal placement wrong
            // each number is for the upcomming check (huge element is
            // the always visible, eleme prefixed)
            //     | 3 |
            //   ---------
            //   | |---| |
            //   |       |
            // --|-|   |-|--
            // 1 | |   | | 2
            // --|-|   |-|--
            //   |       |
            //   | |---| |
            //   ---------
            //     | 4 |

            if (right > elemLocation.left && left < elemLocation.right && bottom > elemLocation.top && top < elemLocation.bottom) {
              var direction = qx.ui.core.MPlacement.getMoveDirection();

              if (direction === "left") {
                left = Math.max(elemLocation.left - bounds.width, 0);
              } else {
                top = Math.max(elemLocation.top - bounds.height, 0);
              }
            }
          }
        }

        if (this.getDomMove()) {
          this.setDomPosition(left, top);
        } else {
          this.setLayoutProperties({
            left: left,
            top: top
          });
        }
      },

      /**
       * Places the widget to another (at least laid out) widget. The DOM
       * element is not needed, but the bounds are needed to compute the
       * location of the widget to align to.
       *
       * @param target {qx.ui.core.Widget} Target coords align coords
       * @param liveupdate {Boolean} Flag indicating if the position of the
       * widget should be checked and corrected automatically.
       * @return {Boolean} true if the widget was successfully placed
       */
      placeToWidget: function placeToWidget(target, liveupdate) {
        // Use the idle event to make sure that the widget's position gets
        // updated automatically (e.g. the widget gets scrolled).
        if (liveupdate) {
          this.__cleanupFromLastPlaceToWidgetLiveUpdate__P_132_5(); // Bind target and livupdate to placeToWidget


          this.__ptwLiveUpdater__P_132_2 = qx.lang.Function.bind(this.placeToWidget, this, target, false);
          qx.event.Idle.getInstance().addListener("interval", this.__ptwLiveUpdater__P_132_2); // Remove the listener when the element disappears.

          this.__ptwLiveUpdateDisappearListener__P_132_4 = function () {
            this.__cleanupFromLastPlaceToWidgetLiveUpdate__P_132_5();
          };

          this.addListener("disappear", this.__ptwLiveUpdateDisappearListener__P_132_4, this);
        }

        var coords = target.getContentLocation() || this.getLayoutLocation(target);

        if (coords != null) {
          this._place(coords);

          return true;
        } else {
          return false;
        }
      },

      /**
       * Removes all resources allocated by the last run of placeToWidget with liveupdate=true
       */
      __cleanupFromLastPlaceToWidgetLiveUpdate__P_132_5: function __cleanupFromLastPlaceToWidgetLiveUpdate__P_132_5() {
        if (this.__ptwLiveUpdater__P_132_2) {
          qx.event.Idle.getInstance().removeListener("interval", this.__ptwLiveUpdater__P_132_2);
          this.__ptwLiveUpdater__P_132_2 = null;
        }

        if (this.__ptwLiveUpdateDisappearListener__P_132_4) {
          this.removeListener("disappear", this.__ptwLiveUpdateDisappearListener__P_132_4, this);
          this.__ptwLiveUpdateDisappearListener__P_132_4 = null;
        }
      },

      /**
       * Places the widget to the pointer position.
       *
       * @param event {qx.event.type.Pointer} Pointer event to align to
       */
      placeToPointer: function placeToPointer(event) {
        var left = Math.round(event.getDocumentLeft());
        var top = Math.round(event.getDocumentTop());
        var coords = {
          left: left,
          top: top,
          right: left,
          bottom: top
        };

        this._place(coords);
      },

      /**
       * Places the widget to any (rendered) DOM element.
       *
       * @param elem {Element} DOM element to align to
       * @param liveupdate {Boolean} Flag indicating if the position of the
       * widget should be checked and corrected automatically.
       */
      placeToElement: function placeToElement(elem, liveupdate) {
        var _this = this;

        var location = qx.bom.element.Location.get(elem);
        var coords = {
          left: location.left,
          top: location.top,
          right: location.left + elem.offsetWidth,
          bottom: location.top + elem.offsetHeight
        }; // Use the idle event to make sure that the widget's position gets
        // updated automatically (e.g. the widget gets scrolled).

        if (liveupdate) {
          // Bind target and livupdate to placeToWidget
          this.__ptwLiveUpdater__P_132_2 = qx.lang.Function.bind(this.placeToElement, this, elem, false);
          qx.event.Idle.getInstance().addListener("interval", this.__ptwLiveUpdater__P_132_2); // Remove the listener when the element disappears.

          this.addListener("disappear", function () {
            if (_this.__ptwLiveUpdater__P_132_2) {
              qx.event.Idle.getInstance().removeListener("interval", _this.__ptwLiveUpdater__P_132_2);
              _this.__ptwLiveUpdater__P_132_2 = null;
            }
          });
        }

        this._place(coords);
      },

      /**
       * Places the widget in relation to the given point
       *
       * @param point {Map} Coordinate of any point with the keys <code>left</code>
       *   and <code>top</code>.
       */
      placeToPoint: function placeToPoint(point) {
        var coords = {
          left: point.left,
          top: point.top,
          right: point.left,
          bottom: point.top
        };

        this._place(coords);
      },

      /**
       * Returns the placement offsets as a map
       *
       * @return {Map} The placement offsets
       */
      _getPlacementOffsets: function _getPlacementOffsets() {
        return {
          left: this.getOffsetLeft(),
          top: this.getOffsetTop(),
          right: this.getOffsetRight(),
          bottom: this.getOffsetBottom()
        };
      },

      /**
       * Get the size of the object to place. The callback will be called with
       * the size as first argument. This methods works asynchronously.
       *
       * The size of the object to place is the size of the widget. If a widget
       * including this mixin needs a different size it can implement the method
       * <code>_computePlacementSize</code>, which returns the size.
       *
       *  @param callback {Function} This function will be called with the size as
       *    first argument
       */
      __getPlacementSize__P_132_6: function __getPlacementSize__P_132_6(callback) {
        var _this2 = this;

        var size = null;

        if (this._computePlacementSize) {
          var size = this._computePlacementSize();
        } else if (this.isVisible()) {
          var size = this.getBounds();
        }

        if (size == null) {
          this.addListenerOnce("appear", function () {
            _this2.__getPlacementSize__P_132_6(callback);
          });
        } else {
          callback.call(this, size);
        }
      },

      /**
       * Internal method to read specific this properties and
       * apply the results to the this afterwards.
       *
       * @param coords {Map} Location of the object to align the this to. This map
       *   should have the keys <code>left</code>, <code>top</code>, <code>right</code>
       *   and <code>bottom</code>.
       */
      _place: function _place(coords) {
        this.__getPlacementSize__P_132_6(function (size) {
          var result = qx.util.placement.Placement.compute(size, this.getLayoutParent().getBounds(), coords, this._getPlacementOffsets(), this.getPosition(), this.getPlacementModeX(), this.getPlacementModeY()); // state handling for tooltips e.g.

          this.removeState("placementLeft");
          this.removeState("placementRight");
          this.addState(coords.left < result.left ? "placementRight" : "placementLeft");
          this.moveTo(result.left, result.top);
        });
      }
    },
    destruct: function destruct() {
      this.__cleanupFromLastPlaceToWidgetLiveUpdate__P_132_5();
    }
  });
  qx.ui.core.MPlacement.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.MPlacement": {
        "require": true
      },
      "qx.core.Init": {},
      "qx.ui.popup.Manager": {}
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
   * Popups are widgets, which can be placed on top of the application.
   * They are automatically added to the application root.
   *
   * Popups are used to display menus, the lists of combo or select boxes,
   * tooltips, etc.
   */
  qx.Class.define("qx.ui.popup.Popup", {
    extend: qx.ui.container.Composite,
    include: qx.ui.core.MPlacement,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct(layout) {
      qx.ui.container.Composite.constructor.call(this, layout); // Initialize visibility

      this.initVisibility();
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
        init: "popup"
      },
      // overridden
      visibility: {
        refine: true,
        init: "excluded"
      },

      /**
       * Whether to let the system decide when to hide the popup. Setting
       * this to false gives you better control but it also requires you
       * to handle the closing of the popup.
       */
      autoHide: {
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
      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      // overridden
      show: function show() {
        // Lazy adding to the root element, otherwise it could happen that
        // IE scrolls automatically to top, see bug #3955 for details.
        if (this.getLayoutParent() == null) {
          // Automatically add to application's root
          qx.core.Init.getApplication().getRoot().add(this);
        }

        qx.ui.popup.Popup.superclass.prototype.show.call(this);
      },
      // overridden
      _applyVisibility: function _applyVisibility(value, old) {
        qx.ui.popup.Popup.superclass.prototype._applyVisibility.call(this, value, old);

        var mgr = qx.ui.popup.Manager.getInstance();
        value === "visible" ? mgr.add(this) : mgr.remove(this);
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (!qx.ui.popup.Manager.getInstance().isDisposed()) {
        qx.ui.popup.Manager.getInstance().remove(this);
      }
    }
  });
  qx.ui.popup.Popup.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.popup.Popup": {
        "construct": true,
        "require": true
      },
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qx.ui.core.Widget": {},
      "qx.ui.basic.Atom": {},
      "qx.ui.basic.Image": {}
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
   * A Tooltip provides additional information for widgets when the user hovers
   * over a widget.
   *
   * @childControl atom {qx.ui.basic.Atom} atom widget which represents the content of the tooltip
   */
  qx.Class.define("qx.ui.tooltip.ToolTip", {
    extend: qx.ui.popup.Popup,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} label of the tooltip
     * @param icon {String?null} Icon URL of the tooltip
     */
    construct: function construct(label, icon) {
      qx.ui.popup.Popup.constructor.call(this); // Use static layout

      this.setLayout(new qx.ui.layout.HBox());

      this._createChildControl("arrow"); // Integrate atom


      this._createChildControl("atom"); // Initialize properties


      if (label != null) {
        this.setLabel(label);
      }

      if (icon != null) {
        this.setIcon(icon);
      }

      this.addListener("pointerover", this._onPointerOver, this);
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
        init: "tooltip"
      },

      /** Interval after the tooltip is shown (in milliseconds) */
      showTimeout: {
        check: "Integer",
        init: 700,
        themeable: true
      },

      /** Interval after the tooltip is hidden (in milliseconds) */
      hideTimeout: {
        check: "Integer",
        init: 4000,
        themeable: true
      },

      /** The label/caption/text of the ToolTip's atom. */
      label: {
        check: "String",
        nullable: true,
        apply: "_applyLabel"
      },

      /**
       * Any URI String supported by qx.ui.basic.Image to display an icon in
       * ToolTips's atom.
       */
      icon: {
        check: "String",
        nullable: true,
        apply: "_applyIcon",
        themeable: true
      },

      /**
       * Switches between rich HTML and text content. The text mode
       * (<code>false</code>) supports advanced features like ellipsis when the
       * available space is not enough. HTML mode (<code>true</code>) supports
       * multi-line content and all the markup features of HTML content.
       */
      rich: {
        check: "Boolean",
        init: false,
        apply: "_applyRich"
      },

      /** Widget that opened the tooltip */
      opener: {
        check: "qx.ui.core.Widget",
        nullable: true
      },

      /** Position of the arrow pointing towards the opening widget **/
      arrowPosition: {
        check: ["left", "right"],
        init: "left",
        themeable: true,
        apply: "_applyArrowPosition"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        placementLeft: true
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "atom":
            control = new qx.ui.basic.Atom();

            this._add(control, {
              flex: 1
            });

            break;

          case "arrow":
            control = new qx.ui.basic.Image();

            this._add(control);

        }

        return control || qx.ui.tooltip.ToolTip.superclass.prototype._createChildControlImpl.call(this, id);
      },

      /**
       * Listener method for "pointerover" event
       *
       * @param e {qx.event.type.Pointer} Pointer event
       */
      _onPointerOver: function _onPointerOver(e) {//this.hide();
      },

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyIcon: function _applyIcon(value, old) {
        var atom = this.getChildControl("atom");
        value == null ? atom.resetIcon() : atom.setIcon(value);
      },
      // property apply
      _applyLabel: function _applyLabel(value, old) {
        var atom = this.getChildControl("atom");
        value == null ? atom.resetLabel() : atom.setLabel(value);
      },
      // property apply
      _applyRich: function _applyRich(value, old) {
        var atom = this.getChildControl("atom");
        atom.setRich(value);
      },
      // property apply
      _applyArrowPosition: function _applyArrowPosition(value, old) {
        this._getLayout().setReversed(value == "left");
      }
    }
  });
  qx.ui.tooltip.ToolTip.$$dbClassInfo = $$dbClassInfo;
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Form interface for all form widgets. It includes the API for enabled,
   * required and valid states.
   */
  qx.Interface.define("qx.ui.form.IForm", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired when the enabled state was modified */
      changeEnabled: "qx.event.type.Data",

      /** Fired when the valid state was modified */
      changeValid: "qx.event.type.Data",

      /** Fired when the invalidMessage was modified */
      changeInvalidMessage: "qx.event.type.Data",

      /** Fired when the required was modified */
      changeRequired: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        ENABLED PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Set the enabled state of the widget.
       *
       * @param enabled {Boolean} The enabled state.
       */
      setEnabled: function setEnabled(enabled) {
        return arguments.length == 1;
      },

      /**
       * Return the current set enabled state.
       *
       * @return {Boolean} If the widget is enabled.
       */
      getEnabled: function getEnabled() {},

      /*
      ---------------------------------------------------------------------------
        REQUIRED PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the required state of a widget.
       *
       * @param required {Boolean} A flag signaling if the widget is required.
       */
      setRequired: function setRequired(required) {
        return arguments.length == 1;
      },

      /**
       * Return the current required state of the widget.
       *
       * @return {Boolean} True, if the widget is required.
       */
      getRequired: function getRequired() {},

      /*
      ---------------------------------------------------------------------------
        VALID PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the valid state of the widget.
       *
       * @param valid {Boolean} The valid state of the widget.
       */
      setValid: function setValid(valid) {
        return arguments.length == 1;
      },

      /**
       * Returns the valid state of the widget.
       *
       * @return {Boolean} If the state of the widget is valid.
       */
      getValid: function getValid() {},

      /*
      ---------------------------------------------------------------------------
        INVALID MESSAGE PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the invalid message of the widget.
       *
       * @param message {String} The invalid message.
       */
      setInvalidMessage: function setInvalidMessage(message) {
        return arguments.length == 1;
      },

      /**
       * Returns the invalid message of the widget.
       *
       * @return {String} The current set message.
       */
      getInvalidMessage: function getInvalidMessage() {},

      /*
      ---------------------------------------------------------------------------
        REQUIRED INVALID MESSAGE PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the invalid message if required of the widget.
       *
       * @param message {String} The invalid message.
       */
      setRequiredInvalidMessage: function setRequiredInvalidMessage(message) {
        return arguments.length == 1;
      },

      /**
       * Returns the invalid message if required of the widget.
       *
       * @return {String} The current set message.
       */
      getRequiredInvalidMessage: function getRequiredInvalidMessage() {}
    }
  });
  qx.ui.form.IForm.$$dbClassInfo = $$dbClassInfo;
})();

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.Stylesheet": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["html.stylesheet.createstylesheet", "html.stylesheet.insertrule", "html.stylesheet.deleterule", "html.stylesheet.addimport", "html.stylesheet.removeimport"],
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
       * Daniel Wagner (d_wagner)
  
  ************************************************************************ */

  /**
   * Internal class which contains the checks used by {@link qx.core.Environment}.
   * All checks in here are marked as internal which means you should never use
   * them directly.
   *
   * This class contains checks related to Stylesheet objects.
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Stylesheet", {
    statics: {
      /**
       * Returns a stylesheet to be used for feature checks
       *
       * @return {StyleSheet} Stylesheet element
       */
      __getStylesheet__P_60_0: function __getStylesheet__P_60_0() {
        if (!qx.bom.client.Stylesheet.__stylesheet__P_60_1) {
          qx.bom.client.Stylesheet.__stylesheet__P_60_1 = qx.bom.Stylesheet.createElement();
        }

        return qx.bom.client.Stylesheet.__stylesheet__P_60_1;
      },

      /**
       * Check for IE's non-standard document.createStyleSheet function.
       * In IE9 (standards mode), the typeof check returns "function" so false is
       * returned. This is intended since IE9 supports the DOM-standard
       * createElement("style") which should be used instead.
       *
       * @internal
       * @return {Boolean} <code>true</code> if the browser supports
       * document.createStyleSheet
       */
      getCreateStyleSheet: function getCreateStyleSheet() {
        return _typeof(document.createStyleSheet) === "object";
      },

      /**
       * Check for stylesheet.insertRule. Legacy IEs do not support this.
       *
       * @internal
       * @return {Boolean} <code>true</code> if insertRule is supported
       */
      getInsertRule: function getInsertRule() {
        return typeof qx.bom.client.Stylesheet.__getStylesheet__P_60_0().insertRule === "function";
      },

      /**
       * Check for stylesheet.deleteRule. Legacy IEs do not support this.
       *
       * @internal
       * @return {Boolean} <code>true</code> if deleteRule is supported
       */
      getDeleteRule: function getDeleteRule() {
        return typeof qx.bom.client.Stylesheet.__getStylesheet__P_60_0().deleteRule === "function";
      },

      /**
       * Decides whether to use the legacy IE-only stylesheet.addImport or the
       * DOM-standard stylesheet.insertRule('@import [...]')
       *
       * @internal
       * @return {Boolean} <code>true</code> if stylesheet.addImport is supported
       */
      getAddImport: function getAddImport() {
        return _typeof(qx.bom.client.Stylesheet.__getStylesheet__P_60_0().addImport) === "object";
      },

      /**
       * Decides whether to use the legacy IE-only stylesheet.removeImport or the
       * DOM-standard stylesheet.deleteRule('@import [...]')
       *
       * @internal
       * @return {Boolean} <code>true</code> if stylesheet.removeImport is supported
       */
      getRemoveImport: function getRemoveImport() {
        return _typeof(qx.bom.client.Stylesheet.__getStylesheet__P_60_0().removeImport) === "object";
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("html.stylesheet.createstylesheet", statics.getCreateStyleSheet);
      qx.core.Environment.add("html.stylesheet.insertrule", statics.getInsertRule);
      qx.core.Environment.add("html.stylesheet.deleterule", statics.getDeleteRule);
      qx.core.Environment.add("html.stylesheet.addimport", statics.getAddImport);
      qx.core.Environment.add("html.stylesheet.removeimport", statics.getRemoveImport);
    }
  });
  qx.bom.client.Stylesheet.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.bom.client.Stylesheet": {
        "require": true
      },
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Assert": {},
      "qx.dom.Element": {},
      "qx.util.Uri": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "html.stylesheet.createstylesheet": {
          "className": "qx.bom.client.Stylesheet"
        },
        "html.stylesheet.insertrule": {
          "className": "qx.bom.client.Stylesheet"
        },
        "html.stylesheet.deleterule": {
          "className": "qx.bom.client.Stylesheet"
        },
        "html.stylesheet.addimport": {
          "className": "qx.bom.client.Stylesheet"
        },
        "html.stylesheet.removeimport": {
          "className": "qx.bom.client.Stylesheet"
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
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Andreas Junghans (lucidcake)
  
  ************************************************************************ */

  /**
   * Cross-browser wrapper to work with CSS stylesheets.
   * @require(qx.bom.client.Stylesheet)
   */
  qx.Bootstrap.define("qx.bom.Stylesheet", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Include a CSS file
       *
       * <em>Note:</em> Using a resource ID as the <code>href</code> parameter
       * will no longer be supported. Call
       * <code>qx.util.ResourceManager.getInstance().toUri(href)</code> to get
       * valid URI to be used with this method.
       *
       * @param href {String} Href value
       * @param doc {Document?} Document to modify
       */
      includeFile: function includeFile(href, doc) {
        if (!doc) {
          doc = document;
        }

        var el = doc.createElement("link");
        el.type = "text/css";
        el.rel = "stylesheet";
        el.href = href;
        var head = doc.getElementsByTagName("head")[0];
        head.appendChild(el);
      },

      /**
       * Create a new Stylesheet node and append it to the document
       *
       * @param text {String?} optional string of css rules
       * @return {StyleSheet} the generates stylesheet element
       */
      createElement: function createElement(text) {
        if (qx.core.Environment.get("html.stylesheet.createstylesheet")) {
          var sheet = document.createStyleSheet();

          if (text) {
            sheet.cssText = text;
          }

          return sheet;
        } else {
          var elem = document.createElement("style");
          elem.type = "text/css";

          if (text) {
            elem.appendChild(document.createTextNode(text));
          }

          document.getElementsByTagName("head")[0].appendChild(elem);
          return elem.sheet;
        }
      },

      /**
       * Insert a new CSS rule into a given Stylesheet
       *
       * @param sheet {Object} the target Stylesheet object
       * @param selector {String} the selector
       * @param entry {String} style rule
       */
      addRule: function addRule(sheet, selector, entry) {
        {
          var msg = "qx.bom.Stylesheet.addRule: The rule '" + entry + "' for the selector '" + selector + "' must not be enclosed in braces";
          qx.core.Assert.assertFalse(/^\s*?\{.*?\}\s*?$/.test(entry), msg);
        }

        if (qx.core.Environment.get("html.stylesheet.insertrule")) {
          sheet.insertRule(selector + "{" + entry + "}", sheet.cssRules.length);
        } else {
          sheet.addRule(selector, entry);
        }
      },

      /**
       * Remove a CSS rule from a stylesheet
       *
       * @param sheet {Object} the Stylesheet
       * @param selector {String} the Selector of the rule to remove
       */
      removeRule: function removeRule(sheet, selector) {
        if (qx.core.Environment.get("html.stylesheet.deleterule")) {
          var rules = sheet.cssRules;
          var len = rules.length;

          for (var i = len - 1; i >= 0; --i) {
            if (rules[i].selectorText == selector) {
              sheet.deleteRule(i);
            }
          }
        } else {
          var rules = sheet.rules;
          var len = rules.length;

          for (var i = len - 1; i >= 0; --i) {
            if (rules[i].selectorText == selector) {
              sheet.removeRule(i);
            }
          }
        }
      },

      /**
       * Remove the given sheet from its owner.
       * @param sheet {Object} the stylesheet object
       */
      removeSheet: function removeSheet(sheet) {
        var owner = sheet.ownerNode ? sheet.ownerNode : sheet.owningElement;
        qx.dom.Element.removeChild(owner, owner.parentNode);
      },

      /**
       * Remove all CSS rules from a stylesheet
       *
       * @param sheet {Object} the stylesheet object
       */
      removeAllRules: function removeAllRules(sheet) {
        if (qx.core.Environment.get("html.stylesheet.deleterule")) {
          var rules = sheet.cssRules;
          var len = rules.length;

          for (var i = len - 1; i >= 0; i--) {
            sheet.deleteRule(i);
          }
        } else {
          var rules = sheet.rules;
          var len = rules.length;

          for (var i = len - 1; i >= 0; i--) {
            sheet.removeRule(i);
          }
        }
      },

      /**
       * Add an import of an external CSS file to a stylesheet
       *
       * @param sheet {Object} the stylesheet object
       * @param url {String} URL of the external stylesheet file
       */
      addImport: function addImport(sheet, url) {
        if (qx.core.Environment.get("html.stylesheet.addimport")) {
          sheet.addImport(url);
        } else {
          sheet.insertRule('@import "' + url + '";', sheet.cssRules.length);
        }
      },

      /**
       * Removes an import from a stylesheet
       *
       * @param sheet {Object} the stylesheet object
       * @param url {String} URL of the imported CSS file
       */
      removeImport: function removeImport(sheet, url) {
        if (qx.core.Environment.get("html.stylesheet.removeimport")) {
          var imports = sheet.imports;
          var len = imports.length;

          for (var i = len - 1; i >= 0; i--) {
            if (imports[i].href == url || imports[i].href == qx.util.Uri.getAbsolute(url)) {
              sheet.removeImport(i);
            }
          }
        } else {
          var rules = sheet.cssRules;
          var len = rules.length;

          for (var i = len - 1; i >= 0; i--) {
            if (rules[i].href == url) {
              sheet.deleteRule(i);
            }
          }
        }
      },

      /**
       * Remove all imports from a stylesheet
       *
       * @param sheet {Object} the stylesheet object
       */
      removeAllImports: function removeAllImports(sheet) {
        if (qx.core.Environment.get("html.stylesheet.removeimport")) {
          var imports = sheet.imports;
          var len = imports.length;

          for (var i = len - 1; i >= 0; i--) {
            sheet.removeImport(i);
          }
        } else {
          var rules = sheet.cssRules;
          var len = rules.length;

          for (var i = len - 1; i >= 0; i--) {
            if (rules[i].type == rules[i].IMPORT_RULE) {
              sheet.deleteRule(i);
            }
          }
        }
      }
    }
  });
  qx.bom.Stylesheet.$$dbClassInfo = $$dbClassInfo;
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
       2004-2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * Basic implementation for an event emitter. This supplies a basic and
   * minimalistic event mechanism.
   */
  qx.Bootstrap.define("qx.event.Emitter", {
    extend: Object,
    statics: {
      /** Static storage for all event listener */
      __storage__P_141_0: []
    },
    members: {
      __listener__P_141_1: null,
      __any__P_141_2: null,

      /**
       * Attach a listener to the event emitter. The given <code>name</code>
       * will define the type of event. Handing in a <code>'*'</code> will
       * listen to all events emitted by the event emitter.
       *
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       * @return {Integer} An unique <code>id</code> for the attached listener.
       */
      on: function on(name, listener, ctx) {
        var id = qx.event.Emitter.__storage__P_141_0.length;

        this.__getStorage__P_141_3(name).push({
          listener: listener,
          ctx: ctx,
          id: id,
          name: name
        });

        qx.event.Emitter.__storage__P_141_0.push({
          name: name,
          listener: listener,
          ctx: ctx
        });

        return id;
      },

      /**
       * Attach a listener to the event emitter which will be executed only once.
       * The given <code>name</code> will define the type of event. Handing in a
       * <code>'*'</code> will listen to all events emitted by the event emitter.
       *
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       * @return {Integer} An unique <code>id</code> for the attached listener.
       */
      once: function once(name, listener, ctx) {
        var id = qx.event.Emitter.__storage__P_141_0.length;

        this.__getStorage__P_141_3(name).push({
          listener: listener,
          ctx: ctx,
          once: true,
          id: id
        });

        qx.event.Emitter.__storage__P_141_0.push({
          name: name,
          listener: listener,
          ctx: ctx
        });

        return id;
      },

      /**
       * Remove a listener from the event emitter. The given <code>name</code>
       * will define the type of event.
       *
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       * @return {Integer|null} The listener's id if it was removed or
       * <code>null</code> if it wasn't found
       */
      off: function off(name, listener, ctx) {
        var storage = this.__getStorage__P_141_3(name);

        for (var i = storage.length - 1; i >= 0; i--) {
          var entry = storage[i];

          if (entry.listener == listener && entry.ctx == ctx) {
            storage.splice(i, 1);
            qx.event.Emitter.__storage__P_141_0[entry.id] = null;
            return entry.id;
          }
        }

        return null;
      },

      /**
       * Removes the listener identified by the given <code>id</code>. The id
       * will be return on attaching the listener and can be stored for removing.
       *
       * @param id {Integer} The id of the listener.
       * @return {Integer|null} The listener's id if it was removed or
       * <code>null</code> if it wasn't found
       */
      offById: function offById(id) {
        var entry = qx.event.Emitter.__storage__P_141_0[id];

        if (entry) {
          this.off(entry.name, entry.listener, entry.ctx);
        }

        return null;
      },

      /**
       * Alternative for {@link #on}.
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       * @return {Integer} An unique <code>id</code> for the attached listener.
       */
      addListener: function addListener(name, listener, ctx) {
        return this.on(name, listener, ctx);
      },

      /**
       * Alternative for {@link #once}.
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       * @return {Integer} An unique <code>id</code> for the attached listener.
       */
      addListenerOnce: function addListenerOnce(name, listener, ctx) {
        return this.once(name, listener, ctx);
      },

      /**
       * Alternative for {@link #off}.
       * @param name {String} The name of the event to listen to.
       * @param listener {Function} The function execute on {@link #emit}.
       * @param ctx {var?Window} The context of the listener.
       */
      removeListener: function removeListener(name, listener, ctx) {
        this.off(name, listener, ctx);
      },

      /**
       * Alternative for {@link #offById}.
       * @param id {Integer} The id of the listener.
       */
      removeListenerById: function removeListenerById(id) {
        this.offById(id);
      },

      /**
       * Emits an event with the given name. The data will be passed
       * to the listener.
       * @param name {String} The name of the event to emit.
       * @param data {var?undefined} The data which should be passed to the listener.
       */
      emit: function emit(name, data) {
        var storage = this.__getStorage__P_141_3(name).concat();

        var toDelete = [];

        for (var i = 0; i < storage.length; i++) {
          var entry = storage[i];
          entry.listener.call(entry.ctx, data);

          if (entry.once) {
            toDelete.push(entry);
          }
        } // listener callbacks could manipulate the storage
        // (e.g. module.Event.once)


        toDelete.forEach(function (entry) {
          var origStorage = this.__getStorage__P_141_3(name);

          var idx = origStorage.indexOf(entry);
          origStorage.splice(idx, 1);
        }.bind(this)); // call on any

        storage = this.__getStorage__P_141_3("*");

        for (var i = storage.length - 1; i >= 0; i--) {
          var entry = storage[i];
          entry.listener.call(entry.ctx, data);
        }
      },

      /**
       * Returns the internal attached listener.
       * @internal
       * @return {Map} A map which has the event name as key. The values are
       *   arrays containing a map with 'listener' and 'ctx'.
       */
      getListeners: function getListeners() {
        return this.__listener__P_141_1;
      },

      /**
       * Returns the data entry for a given event id. If the entry could
       * not be found, undefined will be returned.
       * @internal
       * @param id {Number} The listeners id
       * @return {Map|undefined} The data entry if found
       */
      getEntryById: function getEntryById(id) {
        for (var name in this.__listener__P_141_1) {
          var store = this.__listener__P_141_1[name];

          for (var i = 0, j = store.length; i < j; i++) {
            if (store[i].id === id) {
              return store[i];
            }
          }
        }
      },

      /**
       * Internal helper which will return the storage for the given name.
       * @param name {String} The name of the event.
       * @return {Array} An array which is the storage for the listener and
       *   the given event name.
       */
      __getStorage__P_141_3: function __getStorage__P_141_3(name) {
        if (this.__listener__P_141_1 == null) {
          this.__listener__P_141_1 = {};
        }

        if (this.__listener__P_141_1[name] == null) {
          this.__listener__P_141_1[name] = [];
        }

        return this.__listener__P_141_1[name];
      }
    }
  });
  qx.event.Emitter.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.bom.Stylesheet": {
        "require": true,
        "defer": "runtime"
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.Style": {},
      "qx.bom.Event": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["css.animation", "css.animation.requestframe"],
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
   * Responsible for checking all relevant animation properties.
   *
   * Spec: http://www.w3.org/TR/css3-animations/
   *
   * @require(qx.bom.Stylesheet)
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.CssAnimation", {
    statics: {
      /**
       * Main check method which returns an object if CSS animations are
       * supported. This object contains all necessary keys to work with CSS
       * animations.
       * <ul>
       *  <li><code>name</code> The name of the css animation style</li>
       *  <li><code>play-state</code> The name of the play-state style</li>
       *  <li><code>start-event</code> The name of the start event</li>
       *  <li><code>iteration-event</code> The name of the iteration event</li>
       *  <li><code>end-event</code> The name of the end event</li>
       *  <li><code>fill-mode</code> The fill-mode style</li>
       *  <li><code>keyframes</code> The name of the keyframes selector.</li>
       * </ul>
       *
       * @internal
       * @return {Object|null} The described object or null, if animations are
       *   not supported.
       */
      getSupport: function getSupport() {
        var name = qx.bom.client.CssAnimation.getName();

        if (name != null) {
          return {
            name: name,
            "play-state": qx.bom.client.CssAnimation.getPlayState(),
            "start-event": qx.bom.client.CssAnimation.getAnimationStart(),
            "iteration-event": qx.bom.client.CssAnimation.getAnimationIteration(),
            "end-event": qx.bom.client.CssAnimation.getAnimationEnd(),
            "fill-mode": qx.bom.client.CssAnimation.getFillMode(),
            keyframes: qx.bom.client.CssAnimation.getKeyFrames()
          };
        }

        return null;
      },

      /**
       * Checks for the 'animation-fill-mode' CSS style.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getFillMode: function getFillMode() {
        return qx.bom.Style.getPropertyName("AnimationFillMode");
      },

      /**
       * Checks for the 'animation-play-state' CSS style.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getPlayState: function getPlayState() {
        return qx.bom.Style.getPropertyName("AnimationPlayState");
      },

      /**
       * Checks for the style name used for animations.
       * @internal
       * @return {String|null} The name of the style or null, if the style is
       *   not supported.
       */
      getName: function getName() {
        return qx.bom.Style.getPropertyName("animation");
      },

      /**
       * Checks for the event name of animation start.
       * @internal
       * @return {String} The name of the event.
       */
      getAnimationStart: function getAnimationStart() {
        // special handling for mixed prefixed / unprefixed implementations
        if (qx.bom.Event.supportsEvent(window, "webkitanimationstart")) {
          return "webkitAnimationStart";
        }

        var mapping = {
          msAnimation: "MSAnimationStart",
          WebkitAnimation: "webkitAnimationStart",
          MozAnimation: "animationstart",
          OAnimation: "oAnimationStart",
          animation: "animationstart"
        };
        return mapping[this.getName()];
      },

      /**
       * Checks for the event name of animation end.
       * @internal
       * @return {String} The name of the event.
       */
      getAnimationIteration: function getAnimationIteration() {
        // special handling for mixed prefixed / unprefixed implementations
        if (qx.bom.Event.supportsEvent(window, "webkitanimationiteration")) {
          return "webkitAnimationIteration";
        }

        var mapping = {
          msAnimation: "MSAnimationIteration",
          WebkitAnimation: "webkitAnimationIteration",
          MozAnimation: "animationiteration",
          OAnimation: "oAnimationIteration",
          animation: "animationiteration"
        };
        return mapping[this.getName()];
      },

      /**
       * Checks for the event name of animation end.
       * @internal
       * @return {String} The name of the event.
       */
      getAnimationEnd: function getAnimationEnd() {
        // special handling for mixed prefixed / unprefixed implementations
        if (qx.bom.Event.supportsEvent(window, "webkitanimationend")) {
          return "webkitAnimationEnd";
        }

        var mapping = {
          msAnimation: "MSAnimationEnd",
          WebkitAnimation: "webkitAnimationEnd",
          MozAnimation: "animationend",
          OAnimation: "oAnimationEnd",
          animation: "animationend"
        };
        return mapping[this.getName()];
      },

      /**
       * Checks what selector should be used to add keyframes to stylesheets.
       * @internal
       * @return {String|null} The name of the selector or null, if the selector
       *   is not supported.
       */
      getKeyFrames: function getKeyFrames() {
        var prefixes = qx.bom.Style.VENDOR_PREFIXES;
        var keyFrames = [];

        for (var i = 0; i < prefixes.length; i++) {
          var key = "@" + qx.bom.Style.getCssName(prefixes[i]) + "-keyframes";
          keyFrames.push(key);
        }

        keyFrames.unshift("@keyframes");
        var sheet = qx.bom.Stylesheet.createElement();

        for (var i = 0; i < keyFrames.length; i++) {
          try {
            qx.bom.Stylesheet.addRule(sheet, keyFrames[i] + " name", "");
            return keyFrames[i];
          } catch (e) {}
        }

        return null;
      },

      /**
       * Checks for the requestAnimationFrame method and return the prefixed name.
       * @internal
       * @return {String|null} A string the method name or null, if the method
       *   is not supported.
       */
      getRequestAnimationFrame: function getRequestAnimationFrame() {
        var choices = ["requestAnimationFrame", "msRequestAnimationFrame", "webkitRequestAnimationFrame", "mozRequestAnimationFrame", "oRequestAnimationFrame" // currently unspecified, so we guess the name!
        ];

        for (var i = 0; i < choices.length; i++) {
          if (window[choices[i]] != undefined) {
            return choices[i];
          }
        }

        return null;
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("css.animation", statics.getSupport);
      qx.core.Environment.add("css.animation.requestframe", statics.getRequestAnimationFrame);
    }
  });
  qx.bom.client.CssAnimation.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.lang.normalize.Date": {
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
      "qx.event.Emitter": {
        "require": true
      },
      "qx.bom.client.CssAnimation": {
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "css.animation.requestframe": {
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
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
  
  ************************************************************************ */

  /**
   * This is a cross browser wrapper for requestAnimationFrame. For further
   * information about the feature, take a look at spec:
   * http://www.w3.org/TR/animation-timing/
   *
   * This class offers two ways of using this feature. First, the plain
   * API the spec describes.
   *
   * Here is a sample usage:
   * <pre class='javascript'>var start = Date.now();
   * var cb = function(time) {
   *   if (time >= start + duration) {
   *     // ... do some last tasks
   *   } else {
   *     var timePassed = time - start;
   *     // ... calculate the current step and apply it
   *     qx.bom.AnimationFrame.request(cb, this);
   *   }
   * };
   * qx.bom.AnimationFrame.request(cb, this);
   * </pre>
   *
   * Another way of using it is to use it as an instance emitting events.
   *
   * Here is a sample usage of that API:
   * <pre class='javascript'>var frame = new qx.bom.AnimationFrame();
   * frame.on("end", function() {
   *   // ... do some last tasks
   * }, this);
   * frame.on("frame", function(timePassed) {
   *   // ... calculate the current step and apply it
   * }, this);
   * frame.startSequence(duration);
   * </pre>
   *
   * @require(qx.lang.normalize.Date)
   */
  qx.Bootstrap.define("qx.bom.AnimationFrame", {
    extend: qx.event.Emitter,
    events: {
      /** Fired as soon as the animation has ended. */
      end: undefined,

      /**
       * Fired on every frame having the passed time as value
       * (might be a float for higher precision).
       */
      frame: "Number"
    },
    members: {
      __canceled__P_95_0: false,

      /**
       * Method used to start a series of animation frames. The series will end as
       * soon as the given duration is over.
       *
       * @param duration {Number} The duration the sequence should take.
       *
       * @ignore(performance.*)
       */
      startSequence: function startSequence(duration) {
        this.__canceled__P_95_0 = false;
        var start = window.performance && performance.now ? performance.now() + qx.bom.AnimationFrame.__start__P_95_1 : Date.now();

        var cb = function cb(time) {
          if (this.__canceled__P_95_0) {
            this.id = null;
            return;
          } // final call


          if (time >= start + duration) {
            this.emit("end");
            this.id = null;
          } else {
            var timePassed = Math.max(time - start, 0);
            this.emit("frame", timePassed);
            this.id = qx.bom.AnimationFrame.request(cb, this);
          }
        };

        this.id = qx.bom.AnimationFrame.request(cb, this);
      },

      /**
       * Cancels a started sequence of frames. It will do nothing if no
       * sequence is running.
       */
      cancelSequence: function cancelSequence() {
        this.__canceled__P_95_0 = true;
      }
    },
    statics: {
      /**
       * The default time in ms the timeout fallback implementation uses.
       */
      TIMEOUT: 30,

      /**
       * Calculation of the predefined timing functions. Approximation of the real
       * bezier curves has been used for easier calculation. This is good and close
       * enough for the predefined functions like <code>ease</code> or
       * <code>linear</code>.
       *
       * @param func {String} The defined timing function. One of the following values:
       *   <code>"ease-in"</code>, <code>"ease-out"</code>, <code>"linear"</code>,
       *   <code>"ease-in-out"</code>, <code>"ease"</code>.
       * @param x {Integer} The percent value of the function.
       * @return {Integer} The calculated value
       */
      calculateTiming: function calculateTiming(func, x) {
        if (func == "ease-in") {
          var a = [3.1223e-7, 0.0757, 1.2646, -0.167, -0.4387, 0.2654];
        } else if (func == "ease-out") {
          var a = [-7.0198e-8, 1.652, -0.551, -0.0458, 0.1255, -0.1807];
        } else if (func == "linear") {
          return x;
        } else if (func == "ease-in-out") {
          var a = [2.482e-7, -0.2289, 3.3466, -1.0857, -1.7354, 0.7034];
        } else {
          // default is 'ease'
          var a = [-0.0021, 0.2472, 9.8054, -21.6869, 17.7611, -5.1226];
        } // A 6th grade polynomial has been used as approximation of the original
        // bezier curves  described in the transition spec
        // http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
        // (the same is used for animations as well)


        var y = 0;

        for (var i = 0; i < a.length; i++) {
          y += a[i] * Math.pow(x, i);
        }

        return y;
      },

      /**
       * Request for an animation frame. If the native <code>requestAnimationFrame</code>
       * method is supported, it will be used. Otherwise, we use timeouts with a
       * 30ms delay. The HighResolutionTime will be used if supported but the time given
       * to the callback will still be a timestamp starting at 1 January 1970 00:00:00 UTC.
       *
       * @param callback {Function} The callback function which will get the current
       *   time as argument (which could be a float for higher precision).
       * @param context {var} The context of the callback.
       * @return {Number} The id of the request.
       */
      request: function request(callback, context) {
        var req = qx.core.Environment.get("css.animation.requestframe");

        var cb = function cb(time) {
          // check for high resolution time
          if (time < 1e10) {
            time = qx.bom.AnimationFrame.__start__P_95_1 + time;
          }

          time = time || Date.now();
          callback.call(context, time);
        };

        if (req) {
          return window[req](cb);
        } else {
          // make sure to use an indirection because setTimeout passes a
          // number as first argument as well
          return window.setTimeout(function () {
            cb();
          }, qx.bom.AnimationFrame.TIMEOUT);
        }
      }
    },

    /**
     * @ignore(performance.timing.*)
     */
    defer: function defer(statics) {
      // check and use the high resolution start time if available
      statics.__start__P_95_1 = window.performance && performance.timing && performance.timing.navigationStart; // if not, simply use the current time

      if (!statics.__start__P_95_1) {
        statics.__start__P_95_1 = Date.now();
      }
    }
  });
  qx.bom.AnimationFrame.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Array": {},
      "qx.lang.Object": {},
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
       * Fabian Jakobs (fjakobs)
       * Mustafa Sak (msak)
  
  ************************************************************************ */

  /**
   * The widget queue handles the deferred computation of certain widget properties.
   * It is used e.g. for the tree to update the indentation of tree nodes.
   *
   * This queue calls the method {@link qx.ui.core.Widget#syncWidget} of each
   * queued widget before the layout queues are processed.
   */
  qx.Class.define("qx.ui.core.queue.Widget", {
    statics: {
      /** @type {Array} This contains all the queued widgets for the next flush. */
      __queue__P_24_0: [],

      /**
       * @type {Object} This contains a map of widgets hash ($$hash) and their
       * corresponding map of jobs.
       */
      __jobs__P_24_1: {},

      /**
       * Clears given job of a widget from the internal queue. If no jobs left, the
       * widget will be removed completely from queue. If job param is <code>null</code>
       * or <code>undefined</code> widget will be removed completely from queue.
       * Normally only used during interims disposes of one or a few widgets.
       *
       * @param widget {qx.ui.core.Widget} The widget to clear
       * @param job {String?} Job identifier. If not used, it will be converted to
       * "$$default".
       */
      remove: function remove(widget, job) {
        var queue = this.__queue__P_24_0;

        if (!queue.includes(widget)) {
          return;
        }

        var hash = widget.toHashCode(); // remove widget and all corresponding jobs, if job param is not given.

        if (job == null) {
          qx.lang.Array.remove(queue, widget);
          delete this.__jobs__P_24_1[hash];
          return;
        }

        if (this.__jobs__P_24_1[hash]) {
          delete this.__jobs__P_24_1[hash][job];

          if (qx.lang.Object.getLength(this.__jobs__P_24_1[hash]) == 0) {
            qx.lang.Array.remove(queue, widget);
          }
        }
      },

      /**
       * Adds a widget to the queue. The second param can be used to identify
       * several jobs. You can add one job at once, which will be returned as
       * an map at flushing on method {@link qx.ui.core.Widget#syncWidget}.
       *
       * @param widget {qx.ui.core.Widget} The widget to add.
       * @param job {String?} Job identifier. If not used, it will be converted to
       * "$$default".
       */
      add: function add(widget, job) {
        var queue = this.__queue__P_24_0; //add widget if not containing

        if (!queue.includes(widget)) {
          queue.unshift(widget);
        } //add job


        if (job == null) {
          job = "$$default";
        }

        var hash = widget.toHashCode();

        if (!this.__jobs__P_24_1[hash]) {
          this.__jobs__P_24_1[hash] = {};
        }

        this.__jobs__P_24_1[hash][job] = true;
        qx.ui.core.queue.Manager.scheduleFlush("widget");
      },

      /**
       * Flushes the widget queue.
       *
       * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
       */
      flush: function flush() {
        // Process all registered widgets
        var queue = this.__queue__P_24_0;
        var obj, jobs;

        for (var i = queue.length - 1; i >= 0; i--) {
          // Order is important to allow the same widget to be requeued directly
          obj = queue[i];
          jobs = this.__jobs__P_24_1[obj.toHashCode()];
          queue.splice(i, 1);
          obj.syncWidget(jobs);
        } // Empty check


        if (queue.length != 0) {
          return;
        } // Recreate the array is cheaper compared to keep a sparse array over time


        this.__queue__P_24_0 = [];
        this.__jobs__P_24_1 = {};
      }
    }
  });
  qx.ui.core.queue.Widget.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Array": {},
      "qx.ui.core.queue.Manager": {},
      "qx.ui.core.queue.Visibility": {}
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
   * The AppearanceQueue registers all widgets which are influences through
   * state changes.
   */
  qx.Class.define("qx.ui.core.queue.Appearance", {
    statics: {
      /** @type {Array} This contains all the queued widgets for the next flush. */
      __queue__P_97_0: [],

      /** @type {Map} map of widgets by hash code which are in the queue */
      __lookup__P_97_1: {},

      /**
       * Clears the widget from the internal queue. Normally only used
       * during interims disposes of one or a few widgets.
       *
       * @param widget {qx.ui.core.Widget} The widget to clear
       */
      remove: function remove(widget) {
        if (this.__lookup__P_97_1[widget.toHashCode()]) {
          qx.lang.Array.remove(this.__queue__P_97_0, widget);
          delete this.__lookup__P_97_1[widget.toHashCode()];
        }
      },

      /**
       * Adds a widget to the queue.
       *
       * Should only be used by {@link qx.ui.core.Widget}.
       *
       * @param widget {qx.ui.core.Widget} The widget to add.
       */
      add: function add(widget) {
        if (this.__lookup__P_97_1[widget.toHashCode()]) {
          return;
        }

        this.__queue__P_97_0.unshift(widget);

        this.__lookup__P_97_1[widget.toHashCode()] = widget;
        qx.ui.core.queue.Manager.scheduleFlush("appearance");
      },

      /**
       * Whether the given widget is already queued
       *
       * @param widget {qx.ui.core.Widget} The widget to check
       * @return {Boolean} <code>true</code> if the widget is queued
       */
      has: function has(widget) {
        return !!this.__lookup__P_97_1[widget.toHashCode()];
      },

      /**
       * Flushes the appearance queue.
       *
       * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
       */
      flush: function flush() {
        var Visibility = qx.ui.core.queue.Visibility;
        var queue = this.__queue__P_97_0;
        var obj;

        for (var i = queue.length - 1; i >= 0; i--) {
          // Order is important to allow the same widget to be re-queued directly
          obj = queue[i];
          queue.splice(i, 1);
          delete this.__lookup__P_97_1[obj.toHashCode()]; // Only apply to currently visible widgets

          if (Visibility.isVisible(obj)) {
            obj.syncAppearance();
          } else {
            obj.$$stateChanges = true;
          }
        }
      }
    }
  });
  qx.ui.core.queue.Appearance.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.queue.Manager": {},
      "qx.ui.core.queue.Visibility": {}
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
   * The layout queue manages all widgets, which need a recalculation of their
   * layout. The {@link #flush} method computes the layout of all queued widgets
   * and their dependent widgets.
   */
  qx.Class.define("qx.ui.core.queue.Layout", {
    statics: {
      /** @type {Map} This contains all the queued widgets for the next flush. */
      __queue__P_45_0: {},

      /** Nesting level cache **/
      __nesting__P_45_1: {},

      /**
       * Clears the widget from the internal queue. Normally only used
       * during interims disposes of one or a few widgets.
       *
       * @param widget {qx.ui.core.Widget} The widget to clear
       */
      remove: function remove(widget) {
        delete this.__queue__P_45_0[widget.toHashCode()];
      },

      /**
       * Mark a widget's layout as invalid and add its layout root to
       * the queue.
       *
       * Should only be used by {@link qx.ui.core.Widget}.
       *
       * @param widget {qx.ui.core.Widget} Widget to add.
       */
      add: function add(widget) {
        this.__queue__P_45_0[widget.toHashCode()] = widget;
        qx.ui.core.queue.Manager.scheduleFlush("layout");
      },

      /**
       * Check whether the queue has scheduled changes for a widget.
       * Note that the layout parent can have changes scheduled that
       * affect the children widgets.
       *
       * @param widget {qx.ui.core.Widget} Widget to check.
       * @return {Boolean} Whether the widget given has layout changes queued.
       */
      isScheduled: function isScheduled(widget) {
        return !!this.__queue__P_45_0[widget.toHashCode()];
      },

      /**
       * Update the layout of all widgets, which layout is marked as invalid.
       *
       * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
       *
       */
      flush: function flush() {
        // get sorted widgets to (re-)layout
        var queue = this.__getSortedQueue__P_45_2(); // iterate in reversed order to process widgets with the smallest nesting
        // level first because these may affect the inner lying children


        for (var i = queue.length - 1; i >= 0; i--) {
          var widget = queue[i]; // continue if a relayout of one of the root's parents has made the
          // layout valid

          if (widget.hasValidLayout()) {
            continue;
          } // overflow areas or qx.ui.root.*


          if (widget.isRootWidget() && !widget.hasUserBounds()) {
            // This is a real root widget. Set its size to its preferred size.
            var hint = widget.getSizeHint();
            widget.renderLayout(0, 0, hint.width, hint.height);
          } else {
            // This is an inner item of layout changes. Do a relayout of its
            // children without changing its position and size.
            var bounds = widget.getBounds();

            if (bounds) {
              widget.renderLayout(bounds.left, bounds.top, bounds.width, bounds.height);
            }
          }
        }
      },

      /**
       * Get the widget's nesting level. Top level widgets have a nesting level
       * of <code>0</code>.
       *
       * @param widget {qx.ui.core.Widget} The widget to query.
       * @return {Integer} The nesting level
       */
      getNestingLevel: function getNestingLevel(widget) {
        var cache = this.__nesting__P_45_1;
        var level = 0;
        var parent = widget; // Detecting level

        while (true) {
          if (cache[parent.toHashCode()] != null) {
            level += cache[parent.toHashCode()];
            break;
          }

          if (!parent.$$parent) {
            break;
          }

          parent = parent.$$parent;
          level += 1;
        } // Update the processed hierarchy (runs from inner to outer)


        var leveldown = level;

        while (widget && widget !== parent) {
          cache[widget.toHashCode()] = leveldown--;
          widget = widget.$$parent;
        }

        return level;
      },

      /**
       * Group widget by their nesting level.
       *
       * @return {Map[]} A sparse array. Each entry of the array contains a widget
       *     map with all widgets of the same level as the array index.
       */
      __getLevelGroupedWidgets__P_45_3: function __getLevelGroupedWidgets__P_45_3() {
        var VisibilityQueue = qx.ui.core.queue.Visibility; // clear cache

        this.__nesting__P_45_1 = {}; // sparse level array

        var levels = [];
        var queue = this.__queue__P_45_0;
        var widget, level;

        for (var hash in queue) {
          widget = queue[hash];

          if (VisibilityQueue.isVisible(widget)) {
            level = this.getNestingLevel(widget); // create hierarchy

            if (!levels[level]) {
              levels[level] = {};
            } // store widget in level map


            levels[level][hash] = widget; // remove widget from layout queue

            delete queue[hash];
          }
        }

        return levels;
      },

      /**
       * Compute all layout roots of the given widgets. Layout roots are either
       * root widgets or widgets, which preferred size has not changed by the
       * layout changes of its children.
       *
       * This function returns the roots ordered by their nesting factors. The
       * layout with the largest nesting level comes first.
       *
       * @return {qx.ui.core.Widget[]} Ordered list or layout roots.
       */
      __getSortedQueue__P_45_2: function __getSortedQueue__P_45_2() {
        var sortedQueue = [];

        var levels = this.__getLevelGroupedWidgets__P_45_3();

        for (var level = levels.length - 1; level >= 0; level--) {
          // Ignore empty levels (levels is an sparse array)
          if (!levels[level]) {
            continue;
          }

          for (var hash in levels[level]) {
            var widget = levels[level][hash]; // This is a real layout root. Add it directly to the list

            if (level == 0 || widget.isRootWidget() || widget.hasUserBounds()) {
              sortedQueue.push(widget);
              widget.invalidateLayoutCache();
              continue;
            } // compare old size hint to new size hint


            var oldSizeHint = widget.getSizeHint(false);

            if (oldSizeHint) {
              widget.invalidateLayoutCache();
              var newSizeHint = widget.getSizeHint();
              var hintChanged = !widget.getBounds() || oldSizeHint.minWidth !== newSizeHint.minWidth || oldSizeHint.width !== newSizeHint.width || oldSizeHint.maxWidth !== newSizeHint.maxWidth || oldSizeHint.minHeight !== newSizeHint.minHeight || oldSizeHint.height !== newSizeHint.height || oldSizeHint.maxHeight !== newSizeHint.maxHeight;
            } else {
              hintChanged = true;
            }

            if (hintChanged) {
              // Since the level is > 0, the widget must
              // have a parent != null.
              var parent = widget.getLayoutParent();

              if (!levels[level - 1]) {
                levels[level - 1] = {};
              }

              levels[level - 1][parent.toHashCode()] = parent;
            } else {
              // this is an internal layout root since its own preferred size
              // has not changed.
              sortedQueue.push(widget);
            }
          }
        }

        return sortedQueue;
      }
    }
  });
  qx.ui.core.queue.Layout.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The DisposeQueue registers all widgets which are should be disposed.
   * This queue makes it possible to remove widgets from the DOM using
   * the layout and element queues and dispose them afterwards.
   */
  qx.Class.define("qx.ui.core.queue.Dispose", {
    statics: {
      /** @type {Array} This contains all the queued widgets for the next flush. */
      __queue__P_99_0: [],

      /**
       * Adds a widget to the queue.
       *
       * Should only be used by {@link qx.ui.core.Widget}.
       *
       * @param widget {qx.ui.core.Widget} The widget to add.
       */
      add: function add(widget) {
        var queue = this.__queue__P_99_0;

        if (queue.includes(widget)) {
          return;
        }

        queue.unshift(widget);
        qx.ui.core.queue.Manager.scheduleFlush("dispose");
      },

      /**
       * Whether the dispose queue is empty
       * @return {Boolean}
       * @internal
       */
      isEmpty: function isEmpty() {
        return this.__queue__P_99_0.length == 0;
      },

      /**
       * Flushes the dispose queue.
       *
       * This is used exclusively by the {@link qx.ui.core.queue.Manager}.
       */
      flush: function flush() {
        // Dispose all registered objects
        var queue = this.__queue__P_99_0;

        for (var i = queue.length - 1; i >= 0; i--) {
          var widget = queue[i];
          queue.splice(i, 1);
          widget.dispose();
        } // Empty check


        if (queue.length != 0) {
          return;
        } // Recreate the array is cheaper compared to keep a sparse array over time


        this.__queue__P_99_0 = [];
      }
    }
  });
  qx.ui.core.queue.Dispose.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.element.Style": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.dom.Node": {}
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
       2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Contains support for calculating dimensions of HTML elements.
   *
   * We differ between the box (or border) size which is available via
   * {@link #getWidth} and {@link #getHeight} and the content or scroll
   * sizes which are available via {@link #getContentWidth} and
   * {@link #getContentHeight}.
   */
  qx.Bootstrap.define("qx.bom.element.Dimension", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Returns the rendered width of the given element.
       *
       * This is the visible width of the object, which need not to be identical
       * to the width configured via CSS. This highly depends on the current
       * box-sizing for the document and maybe even for the element.
       *
       * @signature function(element)
       * @param element {Element} element to query
       * @return {Integer} width of the element
       */
      getWidth: function getWidth(element) {
        var rect = element.getBoundingClientRect();
        return Math.round(rect.right - rect.left);
      },

      /**
       * Returns the rendered height of the given element.
       *
       * This is the visible height of the object, which need not to be identical
       * to the height configured via CSS. This highly depends on the current
       * box-sizing for the document and maybe even for the element.
       *
       * @signature function(element)
       * @param element {Element} element to query
       * @return {Integer} height of the element
       */
      getHeight: function getHeight(element) {
        var rect = element.getBoundingClientRect();
        return Math.round(rect.bottom - rect.top);
      },

      /**
       * Returns the rendered size of the given element.
       *
       * @param element {Element} element to query
       * @return {Map} map containing the width and height of the element
       */
      getSize: function getSize(element) {
        return {
          width: this.getWidth(element),
          height: this.getHeight(element)
        };
      },

      /**
       * Returns the outer height of the given element, including height, vertical padding, and vertical borders
       *
       * @param element {Element} element to query
       * @param includeMargins {Boolean?} whether to include margins in teh
       * @return {Integer} the height of the element
       */
      getOuterHeight: function getOuterHeight(element, includeMargins) {
        if (includeMargins) {
          var marginTop = parseInt(document.defaultView.getComputedStyle(element, "").getPropertyValue("margin-top"), 10);
          var marginBottom = parseInt(document.defaultView.getComputedStyle(element, "").getPropertyValue("margin-bottom"), 10);
          return element.offsetHeight + marginTop + marginBottom;
        }

        return element.offsetHeight;
      },

      /**
       * Returns the outer width of the given element, including height, vertical padding, and vertical borders
       *
       * @param element {Element} element to query
       * @param includeMargins {Boolean?} whether to include margins in teh
       * @return {Integer} the width of the element
       */
      getOuterWidth: function getOuterWidth(element, includeMargins) {
        if (includeMargins) {
          var marginLeft = parseInt(document.defaultView.getComputedStyle(element, "").getPropertyValue("margin-left"), 10);
          var marginRight = parseInt(document.defaultView.getComputedStyle(element, "").getPropertyValue("margin-right"), 10);
          return element.offsetWidth + marginLeft + marginRight;
        }

        return element.offsetWidth;
      },

      /**
       * Returns the outer size of the given element, including height, vertical padding, and vertical borders
       *
       * @param element {Element} element to query
       * @param includeMargins {Boolean?} whether to include margins in teh
       * @return {Map} map containing the width and height of the element
       */
      getOuterSize: function getOuterSize(element, includeMargins) {
        return {
          width: this.getOuterWidth(element, includeMargins),
          height: this.getOuterHeight(element, includeMargins)
        };
      },

      /** @type {Map} Contains all overflow values where scrollbars are invisible */
      __hiddenScrollbars__P_147_0: {
        visible: true,
        hidden: true
      },

      /**
       * Returns the content width.
       *
       * The content width is basically the maximum
       * width used or the maximum width which can be used by the content. This
       * excludes all kind of styles of the element like borders, paddings, margins,
       * and even scrollbars.
       *
       * Please note that with visible scrollbars the content width returned
       * may be larger than the box width returned via {@link #getWidth}.
       *
       * @param element {Element} element to query
       * @return {Integer} Computed content width
       */
      getContentWidth: function getContentWidth(element) {
        var Style = qx.bom.element.Style;
        var overflowX = qx.bom.element.Style.get(element, "overflowX");
        var paddingLeft = parseInt(Style.get(element, "paddingLeft") || "0px", 10);
        var paddingRight = parseInt(Style.get(element, "paddingRight") || "0px", 10);

        if (this.__hiddenScrollbars__P_147_0[overflowX]) {
          var contentWidth = element.clientWidth;

          if (qx.core.Environment.get("engine.name") == "opera" || qx.dom.Node.isBlockNode(element)) {
            contentWidth = contentWidth - paddingLeft - paddingRight;
          } // IE seems to return 0 on clientWidth if the element is 0px
          // in height so we use the offsetWidth instead


          if (qx.core.Environment.get("engine.name") == "mshtml") {
            if (contentWidth === 0 && element.offsetHeight === 0) {
              return element.offsetWidth;
            }
          }

          return contentWidth;
        } else {
          if (element.clientWidth >= element.scrollWidth) {
            // Scrollbars visible, but not needed? We need to substract both paddings
            return Math.max(element.clientWidth, element.scrollWidth) - paddingLeft - paddingRight;
          } else {
            // Scrollbars visible and needed. We just remove the left padding,
            // as the right padding is not respected in rendering.
            var width = element.scrollWidth - paddingLeft; // IE renders the paddingRight as well with scrollbars on

            if (qx.core.Environment.get("engine.name") == "mshtml") {
              width -= paddingRight;
            }

            return width;
          }
        }
      },

      /**
       * Returns the content height.
       *
       * The content height is basically the maximum
       * height used or the maximum height which can be used by the content. This
       * excludes all kind of styles of the element like borders, paddings, margins,
       * and even scrollbars.
       *
       * Please note that with visible scrollbars the content height returned
       * may be larger than the box height returned via {@link #getHeight}.
       *
       * @param element {Element} element to query
       * @return {Integer} Computed content height
       */
      getContentHeight: function getContentHeight(element) {
        var Style = qx.bom.element.Style;
        var overflowY = qx.bom.element.Style.get(element, "overflowY");
        var paddingTop = parseInt(Style.get(element, "paddingTop") || "0px", 10);
        var paddingBottom = parseInt(Style.get(element, "paddingBottom") || "0px", 10);

        if (this.__hiddenScrollbars__P_147_0[overflowY]) {
          return element.clientHeight - paddingTop - paddingBottom;
        } else {
          if (element.clientHeight >= element.scrollHeight) {
            // Scrollbars visible, but not needed? We need to substract both paddings
            return Math.max(element.clientHeight, element.scrollHeight) - paddingTop - paddingBottom;
          } else {
            // Scrollbars visible and needed. We just remove the top padding,
            // as the bottom padding is not respected in rendering.
            return element.scrollHeight - paddingTop;
          }
        }
      },

      /**
       * Returns the rendered content size of the given element.
       *
       * @param element {Element} element to query
       * @return {Map} map containing the content width and height of the element
       */
      getContentSize: function getContentSize(element) {
        return {
          width: this.getContentWidth(element),
          height: this.getContentHeight(element)
        };
      }
    }
  });
  qx.bom.element.Dimension.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.Viewport": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
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
       * Sebastian Werner (wpbasti)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Yahoo! UI Library
         http://developer.yahoo.com/yui
         Version 2.2.0
  
       Copyright:
         (c) 2007, Yahoo! Inc.
  
       License:
         BSD: http://developer.yahoo.com/yui/license.txt
  
     ----------------------------------------------------------------------
  
       http://developer.yahoo.com/yui/license.html
  
       Copyright (c) 2009, Yahoo! Inc.
       All rights reserved.
  
       Redistribution and use of this software in source and binary forms,
       with or without modification, are permitted provided that the
       following conditions are met:
  
       * Redistributions of source code must retain the above copyright
         notice, this list of conditions and the following disclaimer.
       * Redistributions in binary form must reproduce the above copyright
         notice, this list of conditions and the following disclaimer in
         the documentation and/or other materials provided with the
         distribution.
       * Neither the name of Yahoo! Inc. nor the names of its contributors
         may be used to endorse or promote products derived from this
         software without specific prior written permission of Yahoo! Inc.
  
       THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
       "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
       LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
       FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
       COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
       INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
       (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
       SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
       HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
       STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
       ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
       OF THE POSSIBILITY OF SUCH DAMAGE.
  
  ************************************************************************ */

  /**
   * Includes library functions to work with the current document.
   */
  qx.Bootstrap.define("qx.bom.Document", {
    statics: {
      /**
       * Whether the document is in quirks mode (e.g. non XHTML, HTML4 Strict or missing doctype)
       *
       * @signature function(win)
       * @param win {Window?window} The window to query
       * @return {Boolean} true when containing document is in quirks mode
       */
      isQuirksMode: qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(win) {
          if (qx.core.Environment.get("engine.version") >= 8) {
            return (win || window).document.documentMode === 5;
          } else {
            return (win || window).document.compatMode !== "CSS1Compat";
          }
        },
        webkit: function webkit(win) {
          if (document.compatMode === undefined) {
            var el = (win || window).document.createElement("div");
            el.style.cssText = "position:absolute;width:0;height:0;width:1";
            return el.style.width === "1px" ? true : false;
          } else {
            return (win || window).document.compatMode !== "CSS1Compat";
          }
        },
        "default": function _default(win) {
          return (win || window).document.compatMode !== "CSS1Compat";
        }
      }),

      /**
       * Whether the document is in standard mode (e.g. XHTML, HTML4 Strict or doctype defined)
       *
       * @param win {Window?window} The window to query
       * @return {Boolean} true when containing document is in standard mode
       */
      isStandardMode: function isStandardMode(win) {
        return !this.isQuirksMode(win);
      },

      /**
       * Returns the width of the document.
       *
       * Internet Explorer in standard mode stores the proprietary <code>scrollWidth</code> property
       * on the <code>documentElement</code>, but in quirks mode on the body element. All
       * other known browsers simply store the correct value on the <code>documentElement</code>.
       *
       * If the viewport is wider than the document the viewport width is returned.
       *
       * As the html element has no visual appearance it also can not scroll. This
       * means that we must use the body <code>scrollWidth</code> in all non mshtml clients.
       *
       * Verified to correctly work with:
       *
       * * Mozilla Firefox 2.0.0.4
       * * Opera 9.2.1
       * * Safari 3.0 beta (3.0.2)
       * * Internet Explorer 7.0
       *
       * @param win {Window?window} The window to query
       * @return {Integer} The width of the actual document (which includes the body and its margin).
       *
       * NOTE: Opera 9.5x and 9.6x have wrong value for the scrollWidth property,
       * if an element use negative value for top and left to be outside the viewport!
       * See: http://bugzilla.qooxdoo.org/show_bug.cgi?id=2869
       */
      getWidth: function getWidth(win) {
        var doc = (win || window).document;
        var view = qx.bom.Viewport.getWidth(win);
        var scroll = this.isStandardMode(win) ? doc.documentElement.scrollWidth : doc.body.scrollWidth;
        return Math.max(scroll, view);
      },

      /**
       * Returns the height of the document.
       *
       * Internet Explorer in standard mode stores the proprietary <code>scrollHeight</code> property
       * on the <code>documentElement</code>, but in quirks mode on the body element. All
       * other known browsers simply store the correct value on the <code>documentElement</code>.
       *
       * If the viewport is higher than the document the viewport height is returned.
       *
       * As the html element has no visual appearance it also can not scroll. This
       * means that we must use the body <code>scrollHeight</code> in all non mshtml clients.
       *
       * Verified to correctly work with:
       *
       * * Mozilla Firefox 2.0.0.4
       * * Opera 9.2.1
       * * Safari 3.0 beta (3.0.2)
       * * Internet Explorer 7.0
       *
       * @param win {Window?window} The window to query
       * @return {Integer} The height of the actual document (which includes the body and its margin).
       *
       * NOTE: Opera 9.5x and 9.6x have wrong value for the scrollWidth property,
       * if an element use negative value for top and left to be outside the viewport!
       * See: http://bugzilla.qooxdoo.org/show_bug.cgi?id=2869
       */
      getHeight: function getHeight(win) {
        var doc = (win || window).document;
        var view = qx.bom.Viewport.getHeight(win);
        var scroll = this.isStandardMode(win) ? doc.documentElement.scrollHeight : doc.body.scrollHeight;
        return Math.max(scroll, view);
      }
    }
  });
  qx.bom.Document.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.Document": {},
      "qx.bom.client.OperatingSystem": {
        "require": true
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
       * Sebastian Fastner (fastner)
       * Tino Butz (tbtz)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Unify Project
  
       Homepage:
         http://unify-project.org
  
       Copyright:
         2009-2010 Deutsche Telekom AG, Germany, http://telekom.com
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
     * Yahoo! UI Library
         http://developer.yahoo.com/yui
         Version 2.2.0
  
       Copyright:
         (c) 2007, Yahoo! Inc.
  
       License:
         BSD: http://developer.yahoo.com/yui/license.txt
  
     ----------------------------------------------------------------------
  
       http://developer.yahoo.com/yui/license.html
  
       Copyright (c) 2009, Yahoo! Inc.
       All rights reserved.
  
       Redistribution and use of this software in source and binary forms,
       with or without modification, are permitted provided that the
       following conditions are met:
  
       * Redistributions of source code must retain the above copyright
         notice, this list of conditions and the following disclaimer.
       * Redistributions in binary form must reproduce the above copyright
         notice, this list of conditions and the following disclaimer in
         the documentation and/or other materials provided with the
         distribution.
       * Neither the name of Yahoo! Inc. nor the names of its contributors
         may be used to endorse or promote products derived from this
         software without specific prior written permission of Yahoo! Inc.
  
       THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
       "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
       LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
       FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
       COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
       INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
       (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
       SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
       HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
       STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
       ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
       OF THE POSSIBILITY OF SUCH DAMAGE.
  
  ************************************************************************ */

  /**
   * Includes library functions to work with the client's viewport (window).
   * Orientation related functions are point to window.top as default.
   */
  qx.Bootstrap.define("qx.bom.Viewport", {
    statics: {
      /**
       * Returns the current width of the viewport (excluding the vertical scrollbar
       * if present).
       *
       * @param win {Window?window} The window to query
       * @return {Integer} The width of the viewable area of the page (excluding scrollbars).
       */
      getWidth: function getWidth(win) {
        var win = win || window;
        var doc = win.document;
        return qx.bom.Document.isStandardMode(win) ? doc.documentElement.clientWidth : doc.body.clientWidth;
      },

      /**
       * Returns the current height of the viewport (excluding the horizontal scrollbar
       * if present).
       *
       * @param win {Window?window} The window to query
       * @return {Integer} The Height of the viewable area of the page (excluding scrollbars).
       */
      getHeight: function getHeight(win) {
        var win = win || window;
        var doc = win.document; // [BUG #7785] Document element's clientHeight is calculated wrong on iPad iOS7

        if (qx.core.Environment.get("os.name") == "ios" && window.innerHeight != doc.documentElement.clientHeight) {
          return window.innerHeight;
        }

        return qx.bom.Document.isStandardMode(win) ? doc.documentElement.clientHeight : doc.body.clientHeight;
      },

      /**
       * Returns the scroll position of the viewport
       *
       * All clients except IE < 9 support the non-standard property <code>pageXOffset</code>.
       * As this is easier to evaluate we prefer this property over <code>scrollLeft</code>.
       * Since the window could differ from the one the application is running in, we can't
       * use a one-time environment check to decide which property to use.
       *
       * @param win {Window?window} The window to query
       * @return {Integer} Scroll position in pixels from left edge, always a positive integer or zero
       */
      getScrollLeft: function getScrollLeft(win) {
        var win = win ? win : window;

        if (typeof win.pageXOffset !== "undefined") {
          return win.pageXOffset;
        } // Firefox is using 'documentElement.scrollLeft' and Chrome is using
        // 'document.body.scrollLeft'. For the other value each browser is returning
        // 0, so we can use this check to get the positive value without using specific
        // browser checks.


        var doc = win.document;
        return doc.documentElement.scrollLeft || doc.body.scrollLeft;
      },

      /**
       * Returns the scroll position of the viewport
       *
       * All clients except MSHTML support the non-standard property <code>pageYOffset</code>.
       * As this is easier to evaluate we prefer this property over <code>scrollTop</code>.
       * Since the window could differ from the one the application is running in, we can't
       * use a one-time environment check to decide which property to use.
       *
       * @param win {Window?window} The window to query
       * @return {Integer} Scroll position in pixels from top edge, always a positive integer or zero
       */
      getScrollTop: function getScrollTop(win) {
        var win = win ? win : window;

        if (typeof win.pageYOffset !== "undefined") {
          return win.pageYOffset;
        } // Firefox is using 'documentElement.scrollTop' and Chrome is using
        // 'document.body.scrollTop'. For the other value each browser is returning
        // 0, so we can use this check to get the positive value without using specific
        // browser checks.


        var doc = win.document;
        return doc.documentElement.scrollTop || doc.body.scrollTop;
      },

      /**
       * Returns an orientation normalizer value that should be added to device orientation
       * to normalize behaviour on different devices.
       *
       * @param win {Window} The window to query
       * @return {Map} Orientation normalizing value
       */
      __getOrientationNormalizer__P_50_0: function __getOrientationNormalizer__P_50_0(win) {
        // Calculate own understanding of orientation (0 = portrait, 90 = landscape)
        var currentOrientation = this.getWidth(win) > this.getHeight(win) ? 90 : 0;
        var deviceOrientation = win.orientation;

        if (deviceOrientation == null || Math.abs(deviceOrientation % 180) == currentOrientation) {
          // No device orientation available or device orientation equals own understanding of orientation
          return {
            "-270": 90,
            "-180": 180,
            "-90": -90,
            0: 0,
            90: 90,
            180: 180,
            270: -90
          };
        } else {
          // Device orientation is not equal to own understanding of orientation
          return {
            "-270": 180,
            "-180": -90,
            "-90": 0,
            0: 90,
            90: 180,
            180: -90,
            270: 0
          };
        }
      },
      // Cache orientation normalizer map on start
      __orientationNormalizer__P_50_1: null,

      /**
       * Returns the current orientation of the viewport in degree.
       *
       * All possible values and their meaning:
       *
       * * <code>-90</code>: "Landscape"
       * * <code>0</code>: "Portrait"
       * * <code>90</code>: "Landscape"
       * * <code>180</code>: "Portrait"
       *
       * @param win {Window?window.top} The window to query. (Default = top window)
       * @return {Integer} The current orientation in degree
       */
      getOrientation: function getOrientation(win) {
        // Set window.top as default, because orientationChange event is only fired top window
        var win = win || window.top; // The orientation property of window does not have the same behaviour over all devices
        // iPad has 0degrees = Portrait, Playbook has 90degrees = Portrait, same for Android Honeycomb
        //
        // To fix this an orientationNormalizer map is calculated on application start
        //
        // The calculation of getWidth and getHeight returns wrong values if you are in an input field
        // on iPad and rotate your device!

        var orientation = win.orientation;

        if (orientation == null) {
          // Calculate orientation from window width and window height
          orientation = this.getWidth(win) > this.getHeight(win) ? 90 : 0;
        } else {
          if (this.__orientationNormalizer__P_50_1 == null) {
            this.__orientationNormalizer__P_50_1 = this.__getOrientationNormalizer__P_50_0(win);
          } // Normalize orientation value


          orientation = this.__orientationNormalizer__P_50_1[orientation];
        }

        return orientation;
      },

      /**
       * Whether the viewport orientation is currently in landscape mode.
       *
       * @param win {Window?window} The window to query
       * @return {Boolean} <code>true</code> when the viewport orientation
       *     is currently in landscape mode.
       */
      isLandscape: function isLandscape(win) {
        var orientation = this.getOrientation(win);
        return orientation === -90 || orientation === 90;
      },

      /**
       * Whether the viewport orientation is currently in portrait mode.
       *
       * @param win {Window?window} The window to query
       * @return {Boolean} <code>true</code> when the viewport orientation
       *     is currently in portrait mode.
       */
      isPortrait: function isPortrait(win) {
        var orientation = this.getOrientation(win);
        return orientation === 0 || orientation === 180;
      }
    }
  });
  qx.bom.Viewport.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.element.Style": {},
      "qx.dom.Node": {},
      "qx.bom.Viewport": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.bom.element.BoxSizing": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "browser.quirksmode": {
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * jQuery Dimension Plugin
         http://jquery.com/
         Version 1.1.3
  
       Copyright:
         (c) 2007, Paul Bakaus & Brandon Aaron
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
       Authors:
         Paul Bakaus
         Brandon Aaron
  
  ************************************************************************ */

  /**
   * Query the location of an arbitrary DOM element in relation to its top
   * level body element. Works in all major browsers:
   *
   * * Mozilla 1.5 + 2.0
   * * Internet Explorer 6.0 + 7.0 (both standard & quirks mode)
   * * Opera 9.2
   * * Safari 3.0 beta
   *
   * @ignore(SVGElement)
   */
  qx.Bootstrap.define("qx.bom.element.Location", {
    statics: {
      /**
       * Queries a style property for the given element
       *
       * @param elem {Element} DOM element to query
       * @param style {String} Style property
       * @return {String} Value of given style property
       */
      __style__P_101_0: function __style__P_101_0(elem, style) {
        return qx.bom.element.Style.get(elem, style, qx.bom.element.Style.COMPUTED_MODE, false);
      },

      /**
       * Queries a style property for the given element and parses it to an integer value
       *
       * @param elem {Element} DOM element to query
       * @param style {String} Style property
       * @return {Integer} Value of given style property
       */
      __num__P_101_1: function __num__P_101_1(elem, style) {
        return parseInt(qx.bom.element.Style.get(elem, style, qx.bom.element.Style.COMPUTED_MODE, false), 10) || 0;
      },

      /**
       * Computes the scroll offset of the given element relative to the document
       * <code>body</code>.
       *
       * @param elem {Element} DOM element to query
       * @return {Map} Map which contains the <code>left</code> and <code>top</code> scroll offsets
       */
      __computeScroll__P_101_2: function __computeScroll__P_101_2(elem) {
        var left = 0,
            top = 0; // Find window

        var win = qx.dom.Node.getWindow(elem);
        left -= qx.bom.Viewport.getScrollLeft(win);
        top -= qx.bom.Viewport.getScrollTop(win);
        return {
          left: left,
          top: top
        };
      },

      /**
       * Computes the offset of the given element relative to the document
       * <code>body</code>.
       *
       * @param elem {Element} DOM element to query
       * @return {Map} Map which contains the <code>left</code> and <code>top</code> offsets
       */
      __computeBody__P_101_3: qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(elem) {
          // Find body element
          var doc = qx.dom.Node.getDocument(elem);
          var body = doc.body;
          var left = 0;
          var top = 0;
          left -= body.clientLeft + doc.documentElement.clientLeft;
          top -= body.clientTop + doc.documentElement.clientTop;

          if (!qx.core.Environment.get("browser.quirksmode")) {
            left += this.__num__P_101_1(body, "borderLeftWidth");
            top += this.__num__P_101_1(body, "borderTopWidth");
          }

          return {
            left: left,
            top: top
          };
        },
        webkit: function webkit(elem) {
          // Find body element
          var doc = qx.dom.Node.getDocument(elem);
          var body = doc.body; // Start with the offset

          var left = body.offsetLeft;
          var top = body.offsetTop;
          return {
            left: left,
            top: top
          };
        },
        gecko: function gecko(elem) {
          // Find body element
          var body = qx.dom.Node.getDocument(elem).body; // Start with the offset

          var left = body.offsetLeft;
          var top = body.offsetTop; // Correct substracted border (only in content-box mode)

          if (qx.bom.element.BoxSizing.get(body) !== "border-box") {
            left += this.__num__P_101_1(body, "borderLeftWidth");
            top += this.__num__P_101_1(body, "borderTopWidth");
          }

          return {
            left: left,
            top: top
          };
        },
        // At the moment only correctly supported by Opera
        "default": function _default(elem) {
          // Find body element
          var body = qx.dom.Node.getDocument(elem).body; // Start with the offset

          var left = body.offsetLeft;
          var top = body.offsetTop;
          return {
            left: left,
            top: top
          };
        }
      }),

      /**
       * Computes the sum of all offsets of the given element node.
       *
       * @signature function(elem)
       * @param elem {Element} DOM element to query
       * @return {Map} Map which contains the <code>left</code> and <code>top</code> offsets
       */
      __computeOffset__P_101_4: function __computeOffset__P_101_4(elem) {
        var rect = elem.getBoundingClientRect(); // Firefox 3.0 alpha 6 (gecko 1.9) returns floating point numbers
        // use Math.round() to round them to style compatible numbers
        // MSHTML returns integer numbers

        return {
          left: Math.round(rect.left),
          top: Math.round(rect.top)
        };
      },

      /**
       * Computes the location of the given element in context of
       * the document dimensions.
       *
       * Supported modes:
       *
       * * <code>margin</code>: Calculate from the margin box of the element (bigger than the visual appearance: including margins of given element)
       * * <code>box</code>: Calculates the offset box of the element (default, uses the same size as visible)
       * * <code>border</code>: Calculate the border box (useful to align to border edges of two elements).
       * * <code>scroll</code>: Calculate the scroll box (relevant for absolute positioned content).
       * * <code>padding</code>: Calculate the padding box (relevant for static/relative positioned content).
       *
       * @param elem {Element} DOM element to query
       * @param mode {String?box} A supported option. See comment above.
       * @return {Map} Returns a map with <code>left</code>, <code>top</code>,
       *   <code>right</code> and <code>bottom</code> which contains the distance
       *   of the element relative to the document.
       */
      get: function get(elem, mode) {
        if (elem.tagName == "BODY") {
          var location = this.__getBodyLocation__P_101_5(elem);

          var left = location.left;
          var top = location.top;
        } else {
          var body = this.__computeBody__P_101_3(elem);

          var offset = this.__computeOffset__P_101_4(elem); // Reduce by viewport scrolling.
          // Hint: getBoundingClientRect returns the location of the
          // element in relation to the viewport which includes
          // the scrolling


          var scroll = this.__computeScroll__P_101_2(elem);

          var left = offset.left + body.left - scroll.left;
          var top = offset.top + body.top - scroll.top;
        }

        var elementWidth;
        var elementHeight;

        if (elem instanceof SVGElement) {
          var rect = elem.getBoundingClientRect();
          elementWidth = rect.width;
          elementHeight = rect.height;
        } else {
          elementWidth = elem.offsetWidth;
          elementHeight = elem.offsetHeight;
        }

        var right = left + elementWidth;
        var bottom = top + elementHeight;

        if (mode) {
          // In this modes we want the size as seen from a child what means that we want the full width/height
          // which may be higher than the outer width/height when the element has scrollbars.
          if (mode == "padding" || mode == "scroll") {
            var overX = qx.bom.element.Style.get(elem, "overflowX");

            if (overX == "scroll" || overX == "auto") {
              right += elem.scrollWidth - elementWidth + this.__num__P_101_1(elem, "borderLeftWidth") + this.__num__P_101_1(elem, "borderRightWidth");
            }

            var overY = qx.bom.element.Style.get(elem, "overflowY");

            if (overY == "scroll" || overY == "auto") {
              bottom += elem.scrollHeight - elementHeight + this.__num__P_101_1(elem, "borderTopWidth") + this.__num__P_101_1(elem, "borderBottomWidth");
            }
          }

          switch (mode) {
            case "padding":
              left += this.__num__P_101_1(elem, "paddingLeft");
              top += this.__num__P_101_1(elem, "paddingTop");
              right -= this.__num__P_101_1(elem, "paddingRight");
              bottom -= this.__num__P_101_1(elem, "paddingBottom");
            // no break here

            case "scroll":
              left -= elem.scrollLeft;
              top -= elem.scrollTop;
              right -= elem.scrollLeft;
              bottom -= elem.scrollTop;
            // no break here

            case "border":
              left += this.__num__P_101_1(elem, "borderLeftWidth");
              top += this.__num__P_101_1(elem, "borderTopWidth");
              right -= this.__num__P_101_1(elem, "borderRightWidth");
              bottom -= this.__num__P_101_1(elem, "borderBottomWidth");
              break;

            case "margin":
              left -= this.__num__P_101_1(elem, "marginLeft");
              top -= this.__num__P_101_1(elem, "marginTop");
              right += this.__num__P_101_1(elem, "marginRight");
              bottom += this.__num__P_101_1(elem, "marginBottom");
              break;
          }
        }

        return {
          left: left,
          top: top,
          right: right,
          bottom: bottom
        };
      },

      /**
       * Get the location of the body element relative to the document.
       * @param body {Element} The body element.
       * @return {Map} map with the keys <code>left</code> and <code>top</code>
       */
      __getBodyLocation__P_101_5: function __getBodyLocation__P_101_5(body) {
        var top = body.offsetTop;
        var left = body.offsetLeft;
        top += this.__num__P_101_1(body, "marginTop");
        left += this.__num__P_101_1(body, "marginLeft");

        if (qx.core.Environment.get("engine.name") === "gecko") {
          top += this.__num__P_101_1(body, "borderLeftWidth");
          left += this.__num__P_101_1(body, "borderTopWidth");
        }

        return {
          left: left,
          top: top
        };
      },

      /**
       * Computes the location of the given element in context of
       * the document dimensions. For supported modes please
       * have a look at the {@link qx.bom.element.Location#get} method.
       *
       * @param elem {Element} DOM element to query
       * @param mode {String} A supported option. See comment above.
       * @return {Integer} The left distance
       *   of the element relative to the document.
       */
      getLeft: function getLeft(elem, mode) {
        return this.get(elem, mode).left;
      },

      /**
       * Computes the location of the given element in context of
       * the document dimensions. For supported modes please
       * have a look at the {@link qx.bom.element.Location#get} method.
       *
       * @param elem {Element} DOM element to query
       * @param mode {String} A supported option. See comment above.
       * @return {Integer} The top distance
       *   of the element relative to the document.
       */
      getTop: function getTop(elem, mode) {
        return this.get(elem, mode).top;
      },

      /**
       * Computes the location of the given element in context of
       * the document dimensions. For supported modes please
       * have a look at the {@link qx.bom.element.Location#get} method.
       *
       * @param elem {Element} DOM element to query
       * @param mode {String} A supported option. See comment above.
       * @return {Integer} The right distance
       *   of the element relative to the document.
       */
      getRight: function getRight(elem, mode) {
        return this.get(elem, mode).right;
      },

      /**
       * Computes the location of the given element in context of
       * the document dimensions. For supported modes please
       * have a look at the {@link qx.bom.element.Location#get} method.
       *
       * @param elem {Element} DOM element to query
       * @param mode {String} A supported option. See comment above.
       * @return {Integer} The bottom distance
       *   of the element relative to the document.
       */
      getBottom: function getBottom(elem, mode) {
        return this.get(elem, mode).bottom;
      },

      /**
       * Returns the distance between two DOM elements. For supported modes please
       * have a look at the {@link qx.bom.element.Location#get} method.
       *
       * @param elem1 {Element} First element
       * @param elem2 {Element} Second element
       * @param mode1 {String?null} Mode for first element
       * @param mode2 {String?null} Mode for second element
       * @return {Map} Returns a map with <code>left</code> and <code>top</code>
       *   which contains the distance of the elements from each other.
       */
      getRelative: function getRelative(elem1, elem2, mode1, mode2) {
        var loc1 = this.get(elem1, mode1);
        var loc2 = this.get(elem2, mode2);
        return {
          left: loc1.left - loc2.left,
          top: loc1.top - loc2.top,
          right: loc1.right - loc2.right,
          bottom: loc1.bottom - loc2.bottom
        };
      },

      /**
       * Returns the distance between the given element to its offset parent.
       *
       * @param elem {Element} DOM element to query
       * @return {Map} Returns a map with <code>left</code> and <code>top</code>
       *   which contains the distance of the elements from each other.
       */
      getPosition: function getPosition(elem) {
        return this.getRelative(elem, this.getOffsetParent(elem));
      },

      /**
       * Detects the offset parent of the given element
       *
       * @param element {Element} Element to query for offset parent
       * @return {Element} Detected offset parent
       */
      getOffsetParent: function getOffsetParent(element) {
        // Ther is no offsetParent for SVG elements
        if (element instanceof SVGElement) {
          return document.body;
        }

        var offsetParent = element.offsetParent || document.body;
        var Style = qx.bom.element.Style;

        while (offsetParent && !/^body|html$/i.test(offsetParent.tagName) && Style.get(offsetParent, "position") === "static") {
          offsetParent = offsetParent.offsetParent;
        }

        return offsetParent;
      }
    }
  });
  qx.bom.element.Location.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.lang.normalize.String": {
        "require": true
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.element.Style": {}
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
   * Contains methods to control and query the element's clip property
   *
   * @require(qx.lang.normalize.String)
   */
  qx.Bootstrap.define("qx.bom.element.Clip", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Compiles the given clipping into a CSS compatible string. This
       * is a simple square which describes the visible area of an DOM element.
       * Changing the clipping does not change the dimensions of
       * an element.
       *
       * @param map {Map}  Map which contains <code>left</code>, <code>top</code>
       *   <code>width</code> and <code>height</code> of the clipped area.
       * @return {String} CSS compatible string
       */
      compile: function compile(map) {
        if (!map) {
          return "clip:auto;";
        }

        var left = map.left;
        var top = map.top;
        var width = map.width;
        var height = map.height;
        var right, bottom;

        if (left == null) {
          right = width == null ? "auto" : width + "px";
          left = "auto";
        } else {
          right = width == null ? "auto" : left + width + "px";
          left = left + "px";
        }

        if (top == null) {
          bottom = height == null ? "auto" : height + "px";
          top = "auto";
        } else {
          bottom = height == null ? "auto" : top + height + "px";
          top = top + "px";
        }

        return "clip:rect(" + top + "," + right + "," + bottom + "," + left + ");";
      },

      /**
       * Gets the clipping of the given element.
       *
       * @param element {Element} DOM element to query
       * @param mode {Number} Choose one of the modes {@link qx.bom.element.Style#COMPUTED_MODE},
       *   {@link qx.bom.element.Style#CASCADED_MODE}, {@link qx.bom.element.Style#LOCAL_MODE}.
       *   The computed mode is the default one.
       * @return {Map} Map which contains <code>left</code>, <code>top</code>
       *   <code>width</code> and <code>height</code> of the clipped area.
       *   Each one could be null or any integer value.
       */
      get: function get(element, mode) {
        var clip = qx.bom.element.Style.get(element, "clip", mode, false);
        var left, top, width, height;
        var right, bottom;

        if (typeof clip === "string" && clip !== "auto" && clip !== "") {
          clip = clip.trim(); // Do not use "global" here. This will break Firefox because of
          // an issue that the lastIndex will not be reset on separate calls.

          if (/\((.*)\)/.test(clip)) {
            var result = RegExp.$1; // Process result
            // Some browsers store values space-separated, others comma-separated.
            // Handle both cases by means of feature-detection.

            if (/,/.test(result)) {
              var split = result.split(",");
            } else {
              var split = result.split(" ");
            }

            top = split[0].trim();
            right = split[1].trim();
            bottom = split[2].trim();
            left = split[3].trim(); // Normalize "auto" to null

            if (left === "auto") {
              left = null;
            }

            if (top === "auto") {
              top = null;
            }

            if (right === "auto") {
              right = null;
            }

            if (bottom === "auto") {
              bottom = null;
            } // Convert to integer values


            if (top != null) {
              top = parseInt(top, 10);
            }

            if (right != null) {
              right = parseInt(right, 10);
            }

            if (bottom != null) {
              bottom = parseInt(bottom, 10);
            }

            if (left != null) {
              left = parseInt(left, 10);
            } // Compute width and height


            if (right != null && left != null) {
              width = right - left;
            } else if (right != null) {
              width = right;
            }

            if (bottom != null && top != null) {
              height = bottom - top;
            } else if (bottom != null) {
              height = bottom;
            }
          } else {
            throw new Error("Could not parse clip string: " + clip);
          }
        } // Return map when any value is available.


        return {
          left: left || null,
          top: top || null,
          width: width || null,
          height: height || null
        };
      },

      /**
       * Sets the clipping of the given element. This is a simple
       * square which describes the visible area of an DOM element.
       * Changing the clipping does not change the dimensions of
       * an element.
       *
       * @param element {Element} DOM element to modify
       * @param map {Map} A map with one or more of these available keys:
       *   <code>left</code>, <code>top</code>, <code>width</code>, <code>height</code>.
       */
      set: function set(element, map) {
        if (!map) {
          element.style.clip = "rect(auto,auto,auto,auto)";
          return;
        }

        var left = map.left;
        var top = map.top;
        var width = map.width;
        var height = map.height;
        var right, bottom;

        if (left == null) {
          right = width == null ? "auto" : width + "px";
          left = "auto";
        } else {
          right = width == null ? "auto" : left + width + "px";
          left = left + "px";
        }

        if (top == null) {
          bottom = height == null ? "auto" : height + "px";
          top = "auto";
        } else {
          bottom = height == null ? "auto" : top + height + "px";
          top = top + "px";
        }

        element.style.clip = "rect(" + top + "," + right + "," + bottom + "," + left + ")";
      },

      /**
       * Resets the clipping of the given DOM element.
       *
       * @param element {Element} DOM element to modify
       */
      reset: function reset(element) {
        element.style.clip = "rect(auto, auto, auto, auto)";
      }
    }
  });
  qx.bom.element.Clip.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.element.Style": {},
      "qx.bom.client.Engine": {
        "defer": "load",
        "require": true
      },
      "qx.bom.client.Browser": {
        "defer": "load",
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "defer": true,
          "className": "qx.bom.client.Engine"
        },
        "engine.version": {
          "defer": true,
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "defer": true,
          "className": "qx.bom.client.Browser"
        },
        "browser.quirksmode": {
          "defer": true,
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * Contains methods to control and query the element's cursor property
   */
  qx.Bootstrap.define("qx.bom.element.Cursor", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** Internal helper structure to map cursor values to supported ones */
      __map__P_100_0: {},

      /**
       * Compiles the given cursor into a CSS compatible string.
       *
       * @param cursor {String} Valid CSS cursor name
       * @return {String} CSS string
       */
      compile: function compile(cursor) {
        return "cursor:" + (this.__map__P_100_0[cursor] || cursor) + ";";
      },

      /**
       * Returns the computed cursor style for the given element.
       *
       * @param element {Element} The element to query
       * @param mode {Number} Choose one of the modes {@link qx.bom.element.Style#COMPUTED_MODE},
       *   {@link qx.bom.element.Style#CASCADED_MODE}, {@link qx.bom.element.Style#LOCAL_MODE}.
       *   The computed mode is the default one.
       * @return {String} Computed cursor value of the given element.
       */
      get: function get(element, mode) {
        return qx.bom.element.Style.get(element, "cursor", mode, false);
      },

      /**
       * Applies a new cursor style to the given element
       *
       * @param element {Element} The element to modify
       * @param value {String} New cursor value to set
       */
      set: function set(element, value) {
        element.style.cursor = this.__map__P_100_0[value] || value;
      },

      /**
       * Removes the local cursor style applied to the element
       *
       * @param element {Element} The element to modify
       */
      reset: function reset(element) {
        element.style.cursor = "";
      }
    },
    defer: function defer(statics) {
      // < IE 9
      if (qx.core.Environment.get("engine.name") == "mshtml" && (parseFloat(qx.core.Environment.get("engine.version")) < 9 || qx.core.Environment.get("browser.documentmode") < 9) && !qx.core.Environment.get("browser.quirksmode")) {
        statics.__map__P_100_0["nesw-resize"] = "ne-resize";
        statics.__map__P_100_0["nwse-resize"] = "nw-resize";
      }
    }
  });
  qx.bom.element.Cursor.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Css": {
        "require": true
      },
      "qx.bom.element.Style": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "css.opacity": {
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
       * Christian Hagendorn (chris_schmidt)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Prototype JS
       http://www.prototypejs.org/
       Version 1.5
  
       Copyright:
         (c) 2006-2007, Prototype Core Team
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
       Authors:
         * Prototype Core Team
  
     ----------------------------------------------------------------------
  
       Copyright (c) 2005-2008 Sam Stephenson
  
       Permission is hereby granted, free of charge, to any person
       obtaining a copy of this software and associated documentation
       files (the "Software"), to deal in the Software without restriction,
       including without limitation the rights to use, copy, modify, merge,
       publish, distribute, sublicense, and/or sell copies of the Software,
       and to permit persons to whom the Software is furnished to do so,
       subject to the following conditions:
  
       THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
       EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
       MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
       NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
       HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
       WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
       OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
       DEALINGS IN THE SOFTWARE.
  
  ************************************************************************ */

  /**
   * Cross-browser opacity support.
   *
   * Optimized for animations (contains workarounds for typical flickering
   * in some browsers). Reduced class dependencies for optimal size and
   * performance.
   */
  qx.Bootstrap.define("qx.bom.element.Opacity", {
    statics: {
      /**
       * Compiles the given opacity value into a cross-browser CSS string.
       * Accepts numbers between zero and one
       * where "0" means transparent, "1" means opaque.
       *
       * @signature function(opacity)
       * @param opacity {Float} A float number between 0 and 1
       * @return {String} CSS compatible string
       */
      compile: qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(opacity) {
          if (opacity >= 1) {
            opacity = 1;
          }

          if (opacity < 0.00001) {
            opacity = 0;
          }

          if (qx.core.Environment.get("css.opacity")) {
            return "opacity:" + opacity + ";";
          } else {
            return "zoom:1;filter:alpha(opacity=" + opacity * 100 + ");";
          }
        },
        "default": function _default(opacity) {
          return "opacity:" + opacity + ";";
        }
      }),

      /**
       * Sets opacity of given element. Accepts numbers between zero and one
       * where "0" means transparent, "1" means opaque.
       *
       * @param element {Element} DOM element to modify
       * @param opacity {Float} A float number between 0 and 1
       * @signature function(element, opacity)
       */
      set: qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(element, opacity) {
          if (qx.core.Environment.get("css.opacity")) {
            element.style.opacity = opacity;
          } else {
            // Read in computed filter
            var filter = qx.bom.element.Style.get(element, "filter", qx.bom.element.Style.COMPUTED_MODE, false);

            if (opacity >= 1) {
              opacity = 1;
            }

            if (opacity < 0.00001) {
              opacity = 0;
            } // IE has trouble with opacity if it does not have layout (hasLayout)
            // Force it by setting the zoom level


            if (!element.currentStyle || !element.currentStyle.hasLayout) {
              element.style.zoom = 1;
            } // Remove old alpha filter and add new one


            element.style.filter = filter.replace(/alpha\([^\)]*\)/gi, "") + "alpha(opacity=" + opacity * 100 + ")";
          }
        },
        "default": function _default(element, opacity) {
          element.style.opacity = opacity;
        }
      }),

      /**
       * Resets opacity of given element.
       *
       * @param element {Element} DOM element to modify
       * @signature function(element)
       */
      reset: qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(element) {
          if (qx.core.Environment.get("css.opacity")) {
            element.style.opacity = "";
          } else {
            // Read in computed filter
            var filter = qx.bom.element.Style.get(element, "filter", qx.bom.element.Style.COMPUTED_MODE, false); // Remove old alpha filter

            element.style.filter = filter.replace(/alpha\([^\)]*\)/gi, "");
          }
        },
        "default": function _default(element) {
          element.style.opacity = "";
        }
      }),

      /**
       * Gets computed opacity of given element. Accepts numbers between zero and one
       * where "0" means transparent, "1" means opaque.
       *
       * @param element {Element} DOM element to modify
       * @param mode {Number} Choose one of the modes {@link qx.bom.element.Style#COMPUTED_MODE},
       *   {@link qx.bom.element.Style#CASCADED_MODE}, {@link qx.bom.element.Style#LOCAL_MODE}.
       *   The computed mode is the default one.
       * @return {Float} A float number between 0 and 1
       * @signature function(element, mode)
       */
      get: qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(element, mode) {
          if (qx.core.Environment.get("css.opacity")) {
            var opacity = qx.bom.element.Style.get(element, "opacity", mode, false);

            if (opacity != null) {
              return parseFloat(opacity);
            }

            return 1.0;
          } else {
            var filter = qx.bom.element.Style.get(element, "filter", mode, false);

            if (filter) {
              var opacity = filter.match(/alpha\(opacity=(.*)\)/);

              if (opacity && opacity[1]) {
                return parseFloat(opacity[1]) / 100;
              }
            }

            return 1.0;
          }
        },
        "default": function _default(element, mode) {
          var opacity = qx.bom.element.Style.get(element, "opacity", mode, false);

          if (opacity != null) {
            return parseFloat(opacity);
          }

          return 1.0;
        }
      })
    }
  });
  qx.bom.element.Opacity.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Css": {
        "require": true
      },
      "qx.bom.Style": {},
      "qx.log.Logger": {},
      "qx.bom.element.Style": {},
      "qx.bom.Document": {},
      "qx.dom.Node": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.boxsizing": {
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
   * Contains methods to control and query the element's box-sizing property.
   *
   * Supported values:
   *
   * * "content-box" = W3C model (dimensions are content specific)
   * * "border-box" = Microsoft model (dimensions are box specific incl. border and padding)
   */
  qx.Bootstrap.define("qx.bom.element.BoxSizing", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Map} Internal data structure for __usesNativeBorderBox() */
      __nativeBorderBox__P_108_0: {
        tags: {
          button: true,
          select: true
        },
        types: {
          search: true,
          button: true,
          submit: true,
          reset: true,
          checkbox: true,
          radio: true
        }
      },

      /**
       * Whether the given elements defaults to the "border-box" Microsoft model in all cases.
       *
       * @param element {Element} DOM element to query
       * @return {Boolean} true when the element uses "border-box" independently from the doctype
       */
      __usesNativeBorderBox__P_108_1: function __usesNativeBorderBox__P_108_1(element) {
        var map = this.__nativeBorderBox__P_108_0;
        return map.tags[element.tagName.toLowerCase()] || map.types[element.type];
      },

      /**
       * Compiles the given box sizing into a CSS compatible string.
       *
       * @param value {String} Valid CSS box-sizing value
       * @return {String} CSS string
       */
      compile: function compile(value) {
        if (qx.core.Environment.get("css.boxsizing")) {
          var prop = qx.bom.Style.getCssName(qx.core.Environment.get("css.boxsizing"));
          return prop + ":" + value + ";";
        } else {
          {
            qx.log.Logger.warn(this, "This client does not support dynamic modification of the boxSizing property.");
            qx.log.Logger.trace();
          }
        }
      },

      /**
       * Returns the box sizing for the given element.
       *
       * @param element {Element} The element to query
       * @return {String} Box sizing value of the given element.
       */
      get: function get(element) {
        if (qx.core.Environment.get("css.boxsizing")) {
          return qx.bom.element.Style.get(element, "boxSizing", null, false) || "";
        }

        if (qx.bom.Document.isStandardMode(qx.dom.Node.getWindow(element))) {
          if (!this.__usesNativeBorderBox__P_108_1(element)) {
            return "content-box";
          }
        }

        return "border-box";
      },

      /**
       * Applies a new box sizing to the given element
       *
       * @param element {Element} The element to modify
       * @param value {String} New box sizing value to set
       */
      set: function set(element, value) {
        if (qx.core.Environment.get("css.boxsizing")) {
          // IE8 bombs when trying to apply an unsupported value
          try {
            element.style[qx.core.Environment.get("css.boxsizing")] = value;
          } catch (ex) {
            {
              qx.log.Logger.warn(this, "This client does not support the boxSizing value", value);
            }
          }
        } else {
          {
            qx.log.Logger.warn(this, "This client does not support dynamic modification of the boxSizing property.");
          }
        }
      },

      /**
       * Removes the local box sizing applied to the element
       *
       * @param element {Element} The element to modify
       */
      reset: function reset(element) {
        this.set(element, "");
      }
    }
  });
  qx.bom.element.BoxSizing.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.lang.String": {
        "require": true,
        "defer": "runtime"
      },
      "qx.bom.client.Css": {
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
      "qx.lang.Object": {},
      "qx.bom.Style": {},
      "qx.bom.element.Clip": {
        "require": true
      },
      "qx.bom.element.Cursor": {
        "require": true
      },
      "qx.bom.element.Opacity": {
        "require": true
      },
      "qx.bom.element.BoxSizing": {
        "require": true
      },
      "qx.core.Assert": {},
      "qx.dom.Node": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.appearance": {
          "className": "qx.bom.client.Css"
        },
        "css.userselect": {
          "className": "qx.bom.client.Css"
        },
        "css.textoverflow": {
          "className": "qx.bom.client.Css"
        },
        "css.borderimage": {
          "className": "qx.bom.client.Css"
        },
        "css.float": {
          "className": "qx.bom.client.Css"
        },
        "css.usermodify": {
          "className": "qx.bom.client.Css"
        },
        "css.boxsizing": {
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
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Prototype JS
       http://www.prototypejs.org/
       Version 1.5
  
       Copyright:
         (c) 2006-2007, Prototype Core Team
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
       Authors:
         * Prototype Core Team
  
     ----------------------------------------------------------------------
  
       Copyright (c) 2005-2008 Sam Stephenson
  
       Permission is hereby granted, free of charge, to any person
       obtaining a copy of this software and associated documentation
       files (the "Software"), to deal in the Software without restriction,
       including without limitation the rights to use, copy, modify, merge,
       publish, distribute, sublicense, and/or sell copies of the Software,
       and to permit persons to whom the Software is furnished to do so,
       subject to the following conditions:
  
       THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
       EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
       MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
       NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
       HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
       WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
       OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
       DEALINGS IN THE SOFTWARE.
  
  ************************************************************************ */

  /**
   * Style querying and modification of HTML elements.
   *
   * Automatically normalizes cross-browser differences for setting and reading
   * CSS attributes. Optimized for performance.
   *
   * @require(qx.lang.String)
   * @require(qx.bom.client.Css)
  
   * @require(qx.bom.element.Clip#set)
   * @require(qx.bom.element.Cursor#set)
   * @require(qx.bom.element.Opacity#set)
   * @require(qx.bom.element.BoxSizing#set)
  
   * @require(qx.bom.element.Clip#get)
   * @require(qx.bom.element.Cursor#get)
   * @require(qx.bom.element.Opacity#get)
   * @require(qx.bom.element.BoxSizing#get)
  
   * @require(qx.bom.element.Clip#reset)
   * @require(qx.bom.element.Cursor#reset)
   * @require(qx.bom.element.Opacity#reset)
   * @require(qx.bom.element.BoxSizing#reset)
  
   * @require(qx.bom.element.Clip#compile)
   * @require(qx.bom.element.Cursor#compile)
   * @require(qx.bom.element.Opacity#compile)
   * @require(qx.bom.element.BoxSizing#compile)
   */
  qx.Bootstrap.define("qx.bom.element.Style", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      __styleNames__P_51_0: null,
      __cssNames__P_51_1: null,

      /**
       * Detect vendor specific properties.
       */
      __detectVendorProperties__P_51_2: function __detectVendorProperties__P_51_2() {
        var styleNames = {
          appearance: qx.core.Environment.get("css.appearance"),
          userSelect: qx.core.Environment.get("css.userselect"),
          textOverflow: qx.core.Environment.get("css.textoverflow"),
          borderImage: qx.core.Environment.get("css.borderimage"),
          "float": qx.core.Environment.get("css.float"),
          userModify: qx.core.Environment.get("css.usermodify"),
          boxSizing: qx.core.Environment.get("css.boxsizing")
        };
        this.__cssNames__P_51_1 = {};

        for (var key in qx.lang.Object.clone(styleNames)) {
          if (!styleNames[key]) {
            delete styleNames[key];
          } else {
            if (key === "float") {
              this.__cssNames__P_51_1["cssFloat"] = key;
            } else {
              this.__cssNames__P_51_1[key] = qx.bom.Style.getCssName(styleNames[key]);
            }
          }
        }

        this.__styleNames__P_51_0 = styleNames;
      },

      /**
       * Gets the (possibly vendor-prefixed) name of a style property and stores
       * it to avoid multiple checks.
       *
       * @param name {String} Style property name to check
       * @return {String|null} The client-specific name of the property, or
       * <code>null</code> if it's not supported.
       */
      __getStyleName__P_51_3: function __getStyleName__P_51_3(name) {
        var styleName = qx.bom.Style.getPropertyName(name);

        if (styleName) {
          this.__styleNames__P_51_0[name] = styleName;
        }

        return styleName;
      },

      /**
       * Mshtml has proprietary pixel* properties for locations and dimensions
       * which return the pixel value. Used by getComputed() in mshtml variant.
       *
       * @internal
       */
      __mshtmlPixel__P_51_4: {
        width: "pixelWidth",
        height: "pixelHeight",
        left: "pixelLeft",
        right: "pixelRight",
        top: "pixelTop",
        bottom: "pixelBottom"
      },

      /**
       * Whether a special class is available for the processing of this style.
       *
       * @internal
       */
      __special__P_51_5: {
        clip: qx.bom.element.Clip,
        cursor: qx.bom.element.Cursor,
        opacity: qx.bom.element.Opacity,
        boxSizing: qx.bom.element.BoxSizing
      },

      /*
      ---------------------------------------------------------------------------
        COMPILE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Compiles the given styles into a string which can be used to
       * concat a HTML string for innerHTML usage.
       *
       * @param map {Map} Map of style properties to compile
       * @return {String} Compiled string of given style properties.
       */
      compile: function compile(map) {
        var html = [];
        var special = this.__special__P_51_5;
        var cssNames = this.__cssNames__P_51_1;
        var name, value;

        for (name in map) {
          // read value
          value = map[name];

          if (value == null) {
            continue;
          } // normalize name


          name = this.__cssNames__P_51_1[name] || name; // process special properties

          if (special[name]) {
            html.push(special[name].compile(value));
          } else {
            if (!cssNames[name]) {
              cssNames[name] = qx.bom.Style.getCssName(name);
            }

            html.push(cssNames[name], ":", value === "" ? '""' : value, ";");
          }
        }

        return html.join("");
      },

      /*
      ---------------------------------------------------------------------------
        CSS TEXT SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Set the full CSS content of the style attribute
       *
       * @param element {Element} The DOM element to modify
       * @param value {String} The full CSS string
       */
      setCss: function setCss(element, value) {
        element.setAttribute("style", value);
      },

      /**
       * Returns the full content of the style attribute.
       *
       * @param element {Element} The DOM element to query
       * @return {String} the full CSS string
       * @signature function(element)
       */
      getCss: function getCss(element) {
        return element.getAttribute("style");
      },

      /*
      ---------------------------------------------------------------------------
        STYLE ATTRIBUTE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Checks whether the browser supports the given CSS property.
       *
       * @param propertyName {String} The name of the property
       * @return {Boolean} Whether the property id supported
       */
      isPropertySupported: function isPropertySupported(propertyName) {
        return this.__special__P_51_5[propertyName] || this.__styleNames__P_51_0[propertyName] || propertyName in document.documentElement.style;
      },

      /** @type {Integer} Computed value of a style property. Compared to the cascaded style,
       * this one also interprets the values e.g. translates <code>em</code> units to
       * <code>px</code>.
       */
      COMPUTED_MODE: 1,

      /** @type {Integer} Cascaded value of a style property. */
      CASCADED_MODE: 2,

      /**
       * @type {Integer} Local value of a style property. Ignores inheritance cascade.
       *   Does not interpret values.
       */
      LOCAL_MODE: 3,

      /**
       * Sets the value of a style property
       *
       * @param element {Element} The DOM element to modify
       * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
       * @param value {var} The value for the given style
       * @param smart {Boolean?true} Whether the implementation should automatically use
       *    special implementations for some properties
       */
      set: function set(element, name, value, smart) {
        {
          qx.core.Assert.assertElement(element, "Invalid argument 'element'");
          qx.core.Assert.assertString(name, "Invalid argument 'name'");

          if (smart !== undefined) {
            qx.core.Assert.assertBoolean(smart, "Invalid argument 'smart'");
          }
        } // normalize name

        name = this.__styleNames__P_51_0[name] || this.__getStyleName__P_51_3(name) || name; // special handling for specific properties
        // through this good working switch this part costs nothing when
        // processing non-smart properties

        if (smart !== false && this.__special__P_51_5[name]) {
          this.__special__P_51_5[name].set(element, value);
        } else {
          element.style[name] = value !== null ? value : "";
        }
      },

      /**
       * Convenience method to modify a set of styles at once.
       *
       * @param element {Element} The DOM element to modify
       * @param styles {Map} a map where the key is the name of the property
       *    and the value is the value to use.
       * @param smart {Boolean?true} Whether the implementation should automatically use
       *    special implementations for some properties
       */
      setStyles: function setStyles(element, styles, smart) {
        {
          qx.core.Assert.assertElement(element, "Invalid argument 'element'");
          qx.core.Assert.assertMap(styles, "Invalid argument 'styles'");

          if (smart !== undefined) {
            qx.core.Assert.assertBoolean(smart, "Invalid argument 'smart'");
          }
        } // inline calls to "set" and "reset" because this method is very
        // performance critical!

        var styleNames = this.__styleNames__P_51_0;
        var special = this.__special__P_51_5;
        var style = element.style;

        for (var key in styles) {
          var value = styles[key];
          var name = styleNames[key] || this.__getStyleName__P_51_3(key) || key;

          if (value === undefined) {
            if (smart !== false && special[name]) {
              special[name].reset(element);
            } else {
              style[name] = "";
            }
          } else {
            if (smart !== false && special[name]) {
              special[name].set(element, value);
            } else {
              style[name] = value !== null ? value : "";
            }
          }
        }
      },

      /**
       * Resets the value of a style property
       *
       * @param element {Element} The DOM element to modify
       * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
       * @param smart {Boolean?true} Whether the implementation should automatically use
       *    special implementations for some properties
       */
      reset: function reset(element, name, smart) {
        // normalize name
        name = this.__styleNames__P_51_0[name] || this.__getStyleName__P_51_3(name) || name; // special handling for specific properties

        if (smart !== false && this.__special__P_51_5[name]) {
          this.__special__P_51_5[name].reset(element);
        } else {
          element.style[name] = "";
        }
      },

      /**
       * Gets the value of a style property.
       *
       * *Computed*
       *
       * Returns the computed value of a style property. Compared to the cascaded style,
       * this one also interprets the values e.g. translates <code>em</code> units to
       * <code>px</code>.
       *
       * *Cascaded*
       *
       * Returns the cascaded value of a style property.
       *
       * *Local*
       *
       * Ignores inheritance cascade. Does not interpret values.
       *
       * @signature function(element, name, mode, smart)
       * @param element {Element} The DOM element to modify
       * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
       * @param mode {Number} Choose one of the modes {@link #COMPUTED_MODE}, {@link #CASCADED_MODE},
       *   {@link #LOCAL_MODE}. The computed mode is the default one.
       * @param smart {Boolean?true} Whether the implementation should automatically use
       *    special implementations for some properties
       * @return {var} The value of the property
       */
      get: function get(element, name, mode, smart) {
        // normalize name
        name = this.__styleNames__P_51_0[name] || this.__getStyleName__P_51_3(name) || name; // special handling

        if (smart !== false && this.__special__P_51_5[name]) {
          return this.__special__P_51_5[name].get(element, mode);
        } // switch to right mode


        switch (mode) {
          case this.LOCAL_MODE:
            return element.style[name] || "";

          case this.CASCADED_MODE:
            // Currently only supported by Opera and Internet Explorer
            if (element.currentStyle) {
              return element.currentStyle[name] || "";
            }

            throw new Error("Cascaded styles are not supported in this browser!");

          default:
            // Opera, Mozilla and Safari 3+ also have a global getComputedStyle which is identical
            // to the one found under document.defaultView.
            // The problem with this is however that this does not work correctly
            // when working with frames and access an element of another frame.
            // Then we must use the <code>getComputedStyle</code> of the document
            // where the element is defined.
            var doc = qx.dom.Node.getDocument(element);
            var getStyle = doc.defaultView ? doc.defaultView.getComputedStyle : undefined;

            if (getStyle !== undefined) {
              // Support for the DOM2 getComputedStyle method
              //
              // Safari >= 3 & Gecko > 1.4 expose all properties to the returned
              // CSSStyleDeclaration object. In older browsers the function
              // "getPropertyValue" is needed to access the values.
              //
              // On a computed style object all properties are read-only which is
              // identical to the behavior of MSHTML's "currentStyle".
              var computed = getStyle(element, null); // All relevant browsers expose the configured style properties to
              // the CSSStyleDeclaration objects

              if (computed && computed[name]) {
                return computed[name];
              }
            } else {
              // if the element is not inserted into the document "currentStyle"
              // may be undefined. In this case always return the local style.
              if (!element.currentStyle) {
                return element.style[name] || "";
              } // Read cascaded style. Shorthand properties like "border" are not available
              // on the currentStyle object.


              var currentStyle = element.currentStyle[name] || element.style[name] || ""; // Pixel values are always OK

              if (/^-?[\.\d]+(px)?$/i.test(currentStyle)) {
                return currentStyle;
              } // Try to convert non-pixel values


              var pixel = this.__mshtmlPixel__P_51_4[name];

              if (pixel && pixel in element.style) {
                // Backup local and runtime style
                var localStyle = element.style[name]; // Overwrite local value with cascaded value
                // This is needed to have the pixel value setup

                element.style[name] = currentStyle || 0; // Read pixel value and add "px"

                var value = element.style[pixel] + "px"; // Recover old local value

                element.style[name] = localStyle; // Return value

                return value;
              } // Just the current style


              return currentStyle;
            }

            return element.style[name] || "";
        }
      }
    },
    defer: function defer(statics) {
      statics.__detectVendorProperties__P_51_2();
    }
  });
  qx.bom.element.Style.$$dbClassInfo = $$dbClassInfo;
})();

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

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
      "qx.bom.client.Html": {
        "require": true
      },
      "qx.log.Logger": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "html.classlist": {
          "load": true,
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
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Base2
       http://code.google.com/p/base2/
       Version 0.9
  
       Copyright:
         (c) 2006-2007, Dean Edwards
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
       Authors:
         * Dean Edwards
  
  ************************************************************************ */

  /**
   * CSS class name support for HTML elements. Supports multiple class names
   * for each element. Can query and apply class names to HTML elements.
   */
  qx.Bootstrap.define("qx.bom.element.Class", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {RegExp} Regular expressions to split class names */
      __splitter__P_180_0: /\s+/g,

      /** @type {RegExp} String trim regular expression. */
      __trim__P_180_1: /^\s+|\s+$/g,

      /**
       * Adds a className to the given element
       * If successfully added the given className will be returned
       *
       * @signature function(element, name)
       * @param element {Element} The element to modify
       * @param name {String} The class name to add
       * @return {String} The added classname (if so)
       */
      add: {
        "native": function native(element, name) {
          if (name.length > 0) {
            element.classList.add(name);
          }

          return name;
        },
        "default": function _default(element, name) {
          if (!this.has(element, name)) {
            element.className += (element.className ? " " : "") + name;
          }

          return name;
        }
      }[qx.core.Environment.get("html.classlist") ? "native" : "default"],

      /**
       * Adds multiple classes to the given element
       *
       * @signature function(element, classes)
       * @param element {Element} DOM element to modify
       * @param classes {String[]} List of classes to add.
       * @return {String} The resulting class name which was applied
       */
      addClasses: {
        "native": function native(element, classes) {
          for (var i = 0; i < classes.length; i++) {
            if (classes[i].length > 0) {
              element.classList.add(classes[i]);
            }
          }

          return element.className;
        },
        "default": function _default(element, classes) {
          var keys = {};
          var result;
          var old = element.className;

          if (old) {
            result = old.split(this.__splitter__P_180_0);

            for (var i = 0, l = result.length; i < l; i++) {
              keys[result[i]] = true;
            }

            for (var i = 0, l = classes.length; i < l; i++) {
              if (!keys[classes[i]]) {
                result.push(classes[i]);
              }
            }
          } else {
            result = classes;
          }

          return element.className = result.join(" ");
        }
      }[qx.core.Environment.get("html.classlist") ? "native" : "default"],

      /**
       * Gets the classname of the given element
       *
       * @param element {Element} The element to query
       * @return {String} The retrieved classname
       */
      get: function get(element) {
        var className = element.className;

        if (typeof className.split !== "function") {
          if (_typeof(className) === "object") {
            if (qx.Bootstrap.getClass(className) == "SVGAnimatedString") {
              className = className.baseVal;
            } else {
              {
                qx.log.Logger.warn(this, "className for element " + element + " cannot be determined");
              }
              className = "";
            }
          }

          if (typeof className === "undefined") {
            {
              qx.log.Logger.warn(this, "className for element " + element + " is undefined");
            }
            className = "";
          }
        }

        return className;
      },

      /**
       * Whether the given element has the given className.
       *
       * @signature function(element, name)
       * @param element {Element} The DOM element to check
       * @param name {String} The class name to check for
       * @return {Boolean} true when the element has the given classname
       */
      has: {
        "native": function native(element, name) {
          return element.classList.contains(name);
        },
        "default": function _default(element, name) {
          var regexp = new RegExp("(^|\\s)" + name + "(\\s|$)");
          return regexp.test(element.className);
        }
      }[qx.core.Environment.get("html.classlist") ? "native" : "default"],

      /**
       * Removes a className from the given element
       *
       * @signature function(element, name)
       * @param element {Element} The DOM element to modify
       * @param name {String} The class name to remove
       * @return {String} The removed class name
       */
      remove: {
        "native": function native(element, name) {
          element.classList.remove(name);
          return name;
        },
        "default": function _default(element, name) {
          var regexp = new RegExp("(^|\\s)" + name + "(\\s|$)");
          element.className = element.className.replace(regexp, "$2");
          return name;
        }
      }[qx.core.Environment.get("html.classlist") ? "native" : "default"],

      /**
       * Removes multiple classes from the given element
       *
       * @signature function(element, classes)
       * @param element {Element} DOM element to modify
       * @param classes {String[]} List of classes to remove.
       * @return {String} The resulting class name which was applied
       */
      removeClasses: {
        "native": function native(element, classes) {
          for (var i = 0; i < classes.length; i++) {
            element.classList.remove(classes[i]);
          }

          return element.className;
        },
        "default": function _default(element, classes) {
          var reg = new RegExp("\\b" + classes.join("\\b|\\b") + "\\b", "g");
          return element.className = element.className.replace(reg, "").replace(this.__trim__P_180_1, "").replace(this.__splitter__P_180_0, " ");
        }
      }[qx.core.Environment.get("html.classlist") ? "native" : "default"],

      /**
       * Replaces the first given class name with the second one
       *
       * @param element {Element} The DOM element to modify
       * @param oldName {String} The class name to remove
       * @param newName {String} The class name to add
       * @return {String} The added class name
       */
      replace: function replace(element, oldName, newName) {
        if (!this.has(element, oldName)) {
          return "";
        }

        this.remove(element, oldName);
        return this.add(element, newName);
      },

      /**
       * Toggles a className of the given element
       *
       * @signature function(element, name, toggle)
       * @param element {Element} The DOM element to modify
       * @param name {String} The class name to toggle
       * @param toggle {Boolean?null} Whether to switch class on/off. Without
       *    the parameter an automatic toggling would happen.
       * @return {String} The class name
       */
      toggle: {
        "native": function native(element, name, toggle) {
          if (toggle === undefined) {
            element.classList.toggle(name);
          } else {
            toggle ? this.add(element, name) : this.remove(element, name);
          }

          return name;
        },
        "default": function _default(element, name, toggle) {
          if (toggle == null) {
            toggle = !this.has(element, name);
          }

          toggle ? this.add(element, name) : this.remove(element, name);
          return name;
        }
      }[qx.core.Environment.get("html.classlist") ? "native" : "default"]
    }
  });
  qx.bom.element.Class.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.CssAnimation": {
        "require": true
      },
      "qx.bom.element.AnimationCss": {},
      "qx.bom.element.AnimationJs": {},
      "qx.lang.String": {},
      "qx.bom.Style": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.animation": {
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
       2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Wrapper for {@link qx.bom.element.AnimationCss} and
   * {@link qx.bom.element.AnimationJs}. It offers the public API and decides using
   * feature checks either to use CSS animations or JS animations.
   *
   * If you use this class, the restrictions of the JavaScript animations apply.
   * This means that you can not use transforms and custom bezier timing functions.
   */
  qx.Bootstrap.define("qx.bom.element.Animation", {
    statics: {
      /**
       * This function takes care of the feature check and starts the animation.
       * It takes a DOM element to apply the animation to, and a description.
       * The description should be a map, which could look like this:
       *
       * <pre class="javascript">
       * {
       *   "duration": 1000,
       *   "keep": 100,
       *   "keyFrames": {
       *     0 : {"opacity": 1, "scale": 1},
       *     100 : {"opacity": 0, "scale": 0}
       *   },
       *   "origin": "50% 50%",
       *   "repeat": 1,
       *   "timing": "ease-out",
       *   "alternate": false,
       *   "delay" : 2000
       * }
       * </pre>
       *
       * *duration* is the time in milliseconds one animation cycle should take.
       *
       * *keep* is the key frame to apply at the end of the animation. (optional)
       *   Keep in mind that the keep key is reversed in case you use an reverse
       *   animation or set the alternate key and a even repeat count.
       *
       * *keyFrames* is a map of separate frames. Each frame is defined by a
       *   number which is the percentage value of time in the animation. The value
       *   is a map itself which holds css properties or transforms
       *   {@link qx.bom.element.Transform} (Transforms only for CSS Animations).
       *
       * *origin* maps to the transform origin {@link qx.bom.element.Transform#setOrigin}
       *   (Only for CSS animations).
       *
       * *repeat* is the amount of time the animation should be run in
       *   sequence. You can also use "infinite".
       *
       * *timing* takes one of the predefined value:
       *   <code>ease</code> | <code>linear</code> | <code>ease-in</code>
       *   | <code>ease-out</code> | <code>ease-in-out</code> |
       *   <code>cubic-bezier(&lt;number&gt;, &lt;number&gt;, &lt;number&gt;, &lt;number&gt;)</code>
       *   (cubic-bezier only available for CSS animations)
       *
       * *alternate* defines if every other animation should be run in reverse order.
       *
       * *delay* is the time in milliseconds the animation should wait before start.
       *
       * @param el {Element} The element to animate.
       * @param desc {Map} The animations description.
       * @param duration {Integer?} The duration in milliseconds of the animation
       *   which will override the duration given in the description.
       * @return {qx.bom.element.AnimationHandle} AnimationHandle instance to control
       *   the animation.
       */
      animate: function animate(el, desc, duration) {
        var onlyCssKeys = qx.bom.element.Animation.__hasOnlyCssKeys__P_167_0(el, desc.keyFrames);

        if (qx.core.Environment.get("css.animation") && onlyCssKeys) {
          return qx.bom.element.AnimationCss.animate(el, desc, duration);
        } else {
          return qx.bom.element.AnimationJs.animate(el, desc, duration);
        }
      },

      /**
       * Starts an animation in reversed order. For further details, take a look at
       * the {@link #animate} method.
       * @param el {Element} The element to animate.
       * @param desc {Map} The animations description.
       * @param duration {Integer?} The duration in milliseconds of the animation
       *   which will override the duration given in the description.
       * @return {qx.bom.element.AnimationHandle} AnimationHandle instance to control
       *   the animation.
       */
      animateReverse: function animateReverse(el, desc, duration) {
        var onlyCssKeys = qx.bom.element.Animation.__hasOnlyCssKeys__P_167_0(el, desc.keyFrames);

        if (qx.core.Environment.get("css.animation") && onlyCssKeys) {
          return qx.bom.element.AnimationCss.animateReverse(el, desc, duration);
        } else {
          return qx.bom.element.AnimationJs.animateReverse(el, desc, duration);
        }
      },

      /**
       * Detection helper which detects if only CSS keys are in
       * the animations key frames.
       * @param el {Element} The element to check for the styles.
       * @param keyFrames {Map} The keyFrames of the animation.
       * @return {Boolean} <code>true</code> if only css properties are included.
       */
      __hasOnlyCssKeys__P_167_0: function __hasOnlyCssKeys__P_167_0(el, keyFrames) {
        var keys = [];

        for (var nr in keyFrames) {
          var frame = keyFrames[nr];

          for (var key in frame) {
            if (keys.indexOf(key) == -1) {
              keys.push(key);
            }
          }
        }

        var transformKeys = ["scale", "rotate", "skew", "translate"];

        for (var i = 0; i < keys.length; i++) {
          var key = qx.lang.String.camelCase(keys[i]);

          if (!(key in el.style)) {
            // check for transform keys
            if (transformKeys.indexOf(keys[i]) != -1) {
              continue;
            } // check for prefixed keys


            if (qx.bom.Style.getPropertyName(key)) {
              continue;
            }

            return false;
          }
        }

        return true;
      }
    }
  });
  qx.bom.element.Animation.$$dbClassInfo = $$dbClassInfo;
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
      "qx.html.Text": {
        "construct": true
      },
      "qx.html.Image": {
        "construct": true
      },
      "qx.html.Iframe": {
        "construct": true
      },
      "qx.html.Input": {
        "construct": true
      },
      "qx.html.Element": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2019-2020 Zenesis Limited, https://www.zenesis.com
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * John Spackman (https://github.com/johnspackman, john.spackman@zenesis.com)
  
  ************************************************************************ */

  /**
   * Factory class used to create Virtual DOM instances by JSX support
   */
  qx.Class.define("qx.html.Factory", {
    extend: qx.core.Object,
    type: "singleton",
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__factoriesByTagName__P_169_0 = {};
      this.registerFactory("#text", function (tagName, attributes, styles) {
        return new qx.html.Text("");
      });
      this.registerFactory("img", qx.html.Image);
      this.registerFactory("iframe", function (tagName, attributes, styles) {
        return new qx.html.Iframe(attributes.src, attributes, styles);
      });
      this.registerFactory("input", function (tagName, attributes, styles) {
        return new qx.html.Input(attributes.type || "text", attributes, styles);
      });
    },
    members: {
      __factoriesByTagName__P_169_0: null,

      /**
       * Registers a factory; a factory is either a class, or a function which is
       * called with the parameters (tagName {String}, styles{Map?}, attributes {Map?}), and
       * which is expected to return an {Element}
       *
       * @param tagName {String} the name of the tag
       * @param factory {Class|Function} the function used to create instances for that tagName
       */
      registerFactory: function registerFactory(tagName, factory) {
        tagName = tagName.toLowerCase();

        if (this.__factoriesByTagName__P_169_0[tagName] === undefined) {
          this.__factoriesByTagName__P_169_0[tagName] = [];
        }

        this.__factoriesByTagName__P_169_0[tagName].push(factory);
      },

      /**
       * Called to create an {Element}
       *
       * @param tagName {String} the name of the tag
       * @param attributes {Map?} the attributes to create (including style etc)
       * @return {qx.html.Node}
       */
      createElement: function createElement(tagName, attributes) {
        tagName = tagName.toLowerCase();

        if (attributes) {
          if (window.NamedNodeMap && attributes instanceof window.NamedNodeMap) {
            var newAttrs = {};

            for (var i = attributes.length - 1; i >= 0; i--) {
              newAttrs[attributes[i].name] = attributes[i].value;
            }

            attributes = newAttrs;
          }

          var styles = {};

          if (attributes.style) {
            attributes.style.split(/;/).forEach(function (seg) {
              var pos = seg.indexOf(":");
              var key = seg.substring(0, pos);
              var value = seg.substring(pos + 1).trim();

              if (key) {
                styles[key] = value;
              }
            });
            delete attributes.style;
          }

          var classname = attributes["data-qx-classname"];

          if (classname) {
            var clazz = qx.Class.getByName(classname);
            {
              this.assertTrue(clazz && qx.Class.isSubClassOf(clazz, qx.html.Element));
              return new clazz(tagName, styles, attributes);
            }
          }
        }

        var factories = this.__factoriesByTagName__P_169_0[tagName];

        if (factories) {
          for (var i = factories.length - 1; i > -1; i--) {
            var factory = factories[i];

            if (factory.classname && qx.Class.getByName(factory.classname) === factory) {
              return new factory(tagName, styles, attributes);
            }

            {
              this.assertTrue(typeof factory == "function");
            }
            var element = factory(tagName, styles, attributes);

            if (element) {
              return element;
            }
          }
        }

        return new qx.html.Element(tagName, styles, attributes);
      }
    }
  });
  qx.html.Factory.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.Init": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2017 Zenesis Limited, http://www.zenesis.com
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * John Spackman (john.spackman@zenesis.com, @johnspackman)
  
  ************************************************************************ */

  /**
   * Provides a registry of top level objects
   */
  qx.Class.define("qx.core.Id", {
    extend: qx.core.Object,
    type: "singleton",
    members: {
      __registeredObjects__P_145_0: null,
      __registeredIdHashes__P_145_1: null,

      /*
       * @Override
       */
      _createQxObject: function _createQxObject(id) {
        // Create the object, but don't add it to the list of owned objects
        var result = this._createQxObjectImpl(id);

        return result;
      },

      /*
       * @Override
       */
      _createQxObjectImpl: function _createQxObjectImpl(id) {
        if (this.__registeredObjects__P_145_0) {
          var obj = this.__registeredObjects__P_145_0[id];

          if (obj !== undefined) {
            return obj;
          }
        }

        switch (id) {
          case "application":
            return qx.core.Init.getApplication() || undefined;
        }

        return undefined;
      },

      /**
       * Returns an object path which can be used to locate an object anywhere in the application
       * with a call to `qx.core.Id.getQxObject()`.
       *
       * This will return null if it is not possible to calculate a path because one of the
       * ancestors has a null `qxObjectId`.
       *
       * This will also return null if the top-most ancestor is not one of the globals registered
       * with `registerObject` or a known global (such as the application); however, by passing
       * `true` as the `suppressWarnings` parameter, this will prevent errors from appearing in
       * the console when this happens
       *
       * @param obj {qx.core.Object} the object
       * @param suppressWarnings {Boolean?} default: false; silently returns null if an ID cannot be created
       * @return {String} full path to the object
       */
      getAbsoluteIdOf: function getAbsoluteIdOf(obj, suppressWarnings) {
        if (this.__registeredIdHashes__P_145_1 && this.__registeredIdHashes__P_145_1[obj.toHashCode()]) {
          return obj.getQxObjectId();
        }

        var segs = [];
        var application = qx.core.Init.getApplication();

        while (obj) {
          var id = obj.getQxObjectId();

          if (!id) {
            if (!suppressWarnings) {
              this.error("Cannot determine an absolute Object ID because one of the ancestor ObjectID's is null (got as far as " + segs.join("/") + ")");
            }

            return null;
          }

          segs.unshift(id);
          var owner = obj.getQxOwner();

          if (owner) {
            // Find the ID of the owner, *if* it is registered as a top level object
            var ownerId = null;

            if (owner === application) {
              ownerId = "application";
            } else {
              ownerId = this.__registeredIdHashes__P_145_1 && this.__registeredIdHashes__P_145_1[owner.toHashCode()] || null;
            } // When we have found the ID of a top level object, add it to the path and stop


            if (ownerId) {
              segs.unshift(ownerId);
              break;
            }
          } else {
            if (!suppressWarnings) {
              this.error("Cannot determine a global absolute Object ID because the topmost object is not registered");
            }

            return null;
          }

          obj = owner;
        }

        var path = segs.join("/");
        return path;
      },

      /**
       * Registers an object with an ID; as this is registering a global object which is the root of a tree
       * of objects with IDs, the `id` parameter can be provided to set the ID used for the root object - this
       * allows an object to be registered under a well known, common name without affecting the API of the
       * object.
       *
       * @param obj {qx.core.Object} the object to register
       * @param id {String?} the ID to register the object under, otherwise the object's own Object Id is used
       */
      register: function register(obj, id) {
        if (!this.__registeredObjects__P_145_0) {
          this.__registeredObjects__P_145_0 = {};
          this.__registeredIdHashes__P_145_1 = {};
        }

        if (!id) {
          id = obj.getQxObjectId();
        }

        this.__registeredObjects__P_145_0[id] = obj;
        this.__registeredIdHashes__P_145_1[obj.toHashCode()] = id;

        obj._cascadeQxObjectIdChanges();
      },

      /**
       * Unregisters a previously registered object with an ID
       *
       * @param data {Object|String} the object to unregister, or the ID of the object
       * @return {Boolean} whether there was an object to unregister
       */
      unregister: function unregister(data) {
        if (!this.__registeredObjects__P_145_0) {
          return false;
        }

        var id;

        if (typeof data == "string") {
          id = data;
        } else {
          var hash = data.toHashCode();
          id = this.__registeredIdHashes__P_145_1[hash];

          if (!id) {
            return false;
          }
        }

        var obj = this.__registeredObjects__P_145_0[id];

        if (obj) {
          delete this.__registeredObjects__P_145_0[id];
          delete this.__registeredIdHashes__P_145_1[obj.toHashCode()];

          obj._cascadeQxObjectIdChanges();

          return true;
        }

        return false;
      },

      /**
       * Returns a map of the objects that have been registered as id roots, with
       * the topmost part of the ID as key.
       * @return {Object}
       */
      getRegisteredObjects: function getRegisteredObjects() {
        return this.__registeredObjects__P_145_0;
      }
    },
    statics: {
      /**
       * Returns a top level instance
       *
       * @param id {String} the ID to look for
       * @return {qx.core.Object?} the object
       */
      getQxObject: function getQxObject(id) {
        return this.getInstance().getQxObject(id);
      },

      /**
       * Helper for `qx.core.Id.getAbsoluteIdOf`
       *
       * @param obj {qx.core.Object} the object
       * @param suppressWarnings {Boolean?} default: false; silently returns null if an ID cannot be created
       * @return {String} full path to the object
       */
      getAbsoluteIdOf: function getAbsoluteIdOf(obj, suppressWarnings) {
        return this.getInstance().getAbsoluteIdOf(obj, suppressWarnings);
      }
    }
  });
  qx.core.Id.$$dbClassInfo = $$dbClassInfo;
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
      "qx.lang.Function": {
        "construct": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      },
      "qx.bom.Event": {},
      "qx.bom.client.OperatingSystem": {
        "require": true
      },
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Mouse": {},
      "qx.event.type.MouseWheel": {},
      "qx.event.type.Data": {},
      "qx.bom.client.Event": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.dom.Hierarchy": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "className": "qx.bom.client.OperatingSystem"
        },
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
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This class provides an unified mouse event handler for Internet Explorer,
   * Firefox, Opera and Safari
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @require(qx.event.handler.UserAction)
   * @ignore(qx.event.handler.DragDrop)
   * @ignore(performance.now)
   */
  qx.Class.define("qx.event.handler.Mouse", {
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

      this.__manager__P_170_0 = manager;
      this.__window__P_170_1 = manager.getWindow();
      this.__root__P_170_2 = this.__window__P_170_1.document;
      this.__onNativeListener__P_170_3 = qx.lang.Function.listener(this._onNative, this); // Initialize observers

      this._initButtonObserver();

      this._initMoveObserver();

      this._initWheelObserver();
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
        auxclick: 1,
        click: 1,
        contextmenu: 1,
        dblclick: 1,
        mousedown: 1,
        mouseenter: 1,
        mouseleave: 1,
        mousemove: 1,
        mouseout: 1,
        mouseover: 1,
        mouseup: 1,
        mousewheel: 1
      },

      /** @type{Map} these event types cannot be attached to the root (the document), they must be attached to the element itself */
      NON_BUBBLING_EVENTS: {
        mouseenter: true,
        mouseleave: true
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE + qx.event.IEventHandler.TARGET_DOCUMENT + qx.event.IEventHandler.TARGET_WINDOW,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __onButtonEventWrapper__P_170_4: null,
      __onMoveEventWrapper__P_170_5: null,
      __onWheelEventWrapper__P_170_6: null,
      __lastEventType__P_170_7: null,
      __lastMouseDownTarget__P_170_8: null,
      __manager__P_170_0: null,
      __window__P_170_1: null,
      __root__P_170_2: null,
      __preventNextClick__P_170_9: null,

      /** @type{Function} wrapper for `_onNative`, bound as a native listener */
      __onNativeListener__P_170_3: null,

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER INTERFACE
      ---------------------------------------------------------------------------
      */
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {},

      /**
       * @Override
       */
      registerEvent: function registerEvent(target, type, capture) {
        if (qx.event.handler.Mouse.NON_BUBBLING_EVENTS[type]) {
          qx.bom.Event.addNativeListener(target, type, this.__onNativeListener__P_170_3);
        } else if (qx.core.Environment.get("os.name") === "ios") {
          // The iPhone requires for attaching mouse events natively to every element which
          // should react on mouse events. As of version 3.0 it also requires to keep the
          // listeners as long as the event should work. In 2.0 it was enough to attach the
          // listener once.
          target["on" + type] = function () {
            return null;
          };
        }
      },

      /**
       * @Override
       */
      unregisterEvent: function unregisterEvent(target, type, capture) {
        if (qx.event.handler.Mouse.NON_BUBBLING_EVENTS[type]) {
          qx.bom.Event.removeNativeListener(target, type, this.__onNativeListener__P_170_3);
        } else if (qx.core.Environment.get("os.name") === "ios") {
          target["on" + type] = undefined;
        }
      },

      /**
       * Default event handler for events that do not bubble
       *
       * @signature function(domEvent, eventId)
       * @param domEvent {Event} Native event
       */
      _onNative: qx.event.GlobalError.observeMethod(function (domEvent) {
        var target = qx.bom.Event.getTarget(domEvent);
        qx.event.Registration.fireNonBubblingEvent(target, domEvent.type, qx.event.type.Mouse, [domEvent, target, undefined, undefined, domEvent.cancelable]);
      }),

      /*
      ---------------------------------------------------------------------------
        HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Fire a mouse event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param type {String} type of the event
       * @param target {Element} event target
       */
      __fireEvent__P_170_10: function __fireEvent__P_170_10(domEvent, type, target) {
        if (!target) {
          target = qx.bom.Event.getTarget(domEvent);
        } // we need a true node for the fireEvent
        // e.g. when hovering over text of disabled textfields IE is returning
        // an empty object as "srcElement"


        if (target && target.nodeType) {
          qx.event.Registration.fireEvent(target, type || domEvent.type, type == "mousewheel" ? qx.event.type.MouseWheel : qx.event.type.Mouse, [domEvent, target, null, true, true]);
        } // Fire user action event


        qx.event.Registration.fireEvent(this.__window__P_170_1, "useraction", qx.event.type.Data, [type || domEvent.type]);
      },

      /**
       * Helper to prevent the next click.
       * @internal
       */
      preventNextClick: function preventNextClick() {
        this.__preventNextClick__P_170_9 = true;
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER INIT
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes the native mouse button event listeners.
       *
       * @signature function()
       */
      _initButtonObserver: function _initButtonObserver() {
        this.__onButtonEventWrapper__P_170_4 = qx.lang.Function.listener(this._onButtonEvent, this);
        var Event = qx.bom.Event;
        Event.addNativeListener(this.__root__P_170_2, "mousedown", this.__onButtonEventWrapper__P_170_4);
        Event.addNativeListener(this.__root__P_170_2, "mouseup", this.__onButtonEventWrapper__P_170_4);
        Event.addNativeListener(this.__root__P_170_2, "click", this.__onButtonEventWrapper__P_170_4);
        Event.addNativeListener(this.__root__P_170_2, "auxclick", this.__onButtonEventWrapper__P_170_4);
        Event.addNativeListener(this.__root__P_170_2, "dblclick", this.__onButtonEventWrapper__P_170_4);
        Event.addNativeListener(this.__root__P_170_2, "contextmenu", this.__onButtonEventWrapper__P_170_4);
      },

      /**
       * Initializes the native mouse move event listeners.
       *
       * @signature function()
       */
      _initMoveObserver: function _initMoveObserver() {
        this.__onMoveEventWrapper__P_170_5 = qx.lang.Function.listener(this._onMoveEvent, this);
        var Event = qx.bom.Event;
        Event.addNativeListener(this.__root__P_170_2, "mousemove", this.__onMoveEventWrapper__P_170_5);
        Event.addNativeListener(this.__root__P_170_2, "mouseout", this.__onMoveEventWrapper__P_170_5);
        Event.addNativeListener(this.__root__P_170_2, "mouseover", this.__onMoveEventWrapper__P_170_5);
      },

      /**
       * Initializes the native mouse wheel event listeners.
       *
       * @signature function()
       */
      _initWheelObserver: function _initWheelObserver() {
        this.__onWheelEventWrapper__P_170_6 = qx.lang.Function.listener(this._onWheelEvent, this);
        var data = qx.bom.client.Event.getMouseWheel(this.__window__P_170_1);
        qx.bom.Event.addNativeListener(data.target, data.type, this.__onWheelEventWrapper__P_170_6);
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER STOP
      ---------------------------------------------------------------------------
      */

      /**
       * Disconnects the native mouse button event listeners.
       *
       * @signature function()
       */
      _stopButtonObserver: function _stopButtonObserver() {
        var Event = qx.bom.Event;
        Event.removeNativeListener(this.__root__P_170_2, "mousedown", this.__onButtonEventWrapper__P_170_4);
        Event.removeNativeListener(this.__root__P_170_2, "mouseup", this.__onButtonEventWrapper__P_170_4);
        Event.removeNativeListener(this.__root__P_170_2, "click", this.__onButtonEventWrapper__P_170_4);
        Event.removeNativeListener(this.__root__P_170_2, "dblclick", this.__onButtonEventWrapper__P_170_4);
        Event.removeNativeListener(this.__root__P_170_2, "contextmenu", this.__onButtonEventWrapper__P_170_4);
      },

      /**
       * Disconnects the native mouse move event listeners.
       *
       * @signature function()
       */
      _stopMoveObserver: function _stopMoveObserver() {
        var Event = qx.bom.Event;
        Event.removeNativeListener(this.__root__P_170_2, "mousemove", this.__onMoveEventWrapper__P_170_5);
        Event.removeNativeListener(this.__root__P_170_2, "mouseover", this.__onMoveEventWrapper__P_170_5);
        Event.removeNativeListener(this.__root__P_170_2, "mouseout", this.__onMoveEventWrapper__P_170_5);
      },

      /**
       * Disconnects the native mouse wheel event listeners.
       *
       * @signature function()
       */
      _stopWheelObserver: function _stopWheelObserver() {
        var data = qx.bom.client.Event.getMouseWheel(this.__window__P_170_1);
        qx.bom.Event.removeNativeListener(data.target, data.type, this.__onWheelEventWrapper__P_170_6);
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE EVENT OBSERVERS
      ---------------------------------------------------------------------------
      */

      /**
       * Global handler for all mouse move related events like "mousemove",
       * "mouseout" and "mouseover".
       *
       * @signature function(domEvent)
       * @param domEvent {Event} DOM event
       */
      _onMoveEvent: qx.event.GlobalError.observeMethod(function (domEvent) {
        this.__fireEvent__P_170_10(domEvent);
      }),

      /**
       * Global handler for all mouse button related events like "mouseup",
       * "mousedown", "click", "dblclick" and "contextmenu".
       *
       * @signature function(domEvent)
       * @param domEvent {Event} DOM event
       */
      _onButtonEvent: qx.event.GlobalError.observeMethod(function (domEvent) {
        var type = domEvent.type;
        var target = qx.bom.Event.getTarget(domEvent);

        if (type == "click" && this.__preventNextClick__P_170_9) {
          delete this.__preventNextClick__P_170_9;
          return;
        } // Safari (and maybe gecko) takes text nodes as targets for events
        // See: http://www.quirksmode.org/js/events_properties.html


        if (qx.core.Environment.get("engine.name") == "gecko" || qx.core.Environment.get("engine.name") == "webkit") {
          if (target && target.nodeType == 3) {
            target = target.parentNode;
          }
        } // prevent click events on drop during Drag&Drop [BUG #6846]


        var isDrag = qx.event.handler.DragDrop && this.__manager__P_170_0.getHandler(qx.event.handler.DragDrop).isSessionActive();

        if (isDrag && type == "click") {
          return;
        }

        if (this.__doubleClickFixPre__P_170_11) {
          this.__doubleClickFixPre__P_170_11(domEvent, type, target);
        }

        this.__fireEvent__P_170_10(domEvent, type, target);
        /*
         * In order to normalize middle button click events we
         * need to fire an artificial click event if the client
         * fires auxclick events for non primary buttons instead.
         *
         * See https://github.com/qooxdoo/qooxdoo/issues/9268
         */


        if (type == "auxclick" && domEvent.button == 1) {
          this.__fireEvent__P_170_10(domEvent, "click", target);
        }

        if (this.__rightClickFixPost__P_170_12) {
          this.__rightClickFixPost__P_170_12(domEvent, type, target);
        }

        if (this.__differentTargetClickFixPost__P_170_13 && !isDrag) {
          this.__differentTargetClickFixPost__P_170_13(domEvent, type, target);
        }

        this.__lastEventType__P_170_7 = type;
      }),

      /**
       * Global handler for the mouse wheel event.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} DOM event
       */
      _onWheelEvent: qx.event.GlobalError.observeMethod(function (domEvent) {
        this.__fireEvent__P_170_10(domEvent, "mousewheel");
      }),

      /*
      ---------------------------------------------------------------------------
        CROSS BROWSER SUPPORT FIXES
      ---------------------------------------------------------------------------
      */

      /**
       * Normalizes the click sequence of right click events in Webkit and Opera.
       * The normalized sequence is:
       *
       *  1. mousedown  <- not fired by Webkit
       *  2. mouseup  <- not fired by Webkit
       *  3. contextmenu <- not fired by Opera
       *
       * @param domEvent {Event} original DOM event
       * @param type {String} event type
       * @param target {Element} event target of the DOM event.
       *
       * @signature function(domEvent, type, target)
       */
      __rightClickFixPost__P_170_12: qx.core.Environment.select("engine.name", {
        opera: function opera(domEvent, type, target) {
          if (type == "mouseup" && domEvent.button == 2) {
            this.__fireEvent__P_170_10(domEvent, "contextmenu", target);
          }
        },
        "default": null
      }),

      /**
       * Normalizes the click sequence of double click event in the Internet
       * Explorer. The normalized sequence is:
       *
       *  1. mousedown
       *  2. mouseup
       *  3. click
       *  4. mousedown  <- not fired by IE
       *  5. mouseup
       *  6. click  <- not fired by IE
       *  7. dblclick
       *
       *  Note: This fix is only applied, when the IE event model is used, otherwise
       *  the fix is ignored.
       *
       * @param domEvent {Event} original DOM event
       * @param type {String} event type
       * @param target {Element} event target of the DOM event.
       *
       * @signature function(domEvent, type, target)
       */
      __doubleClickFixPre__P_170_11: qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(domEvent, type, target) {
          // Do only apply the fix when the event is from the IE event model,
          // otherwise do not apply the fix.
          if (domEvent.target !== undefined) {
            return;
          }

          if (type == "mouseup" && this.__lastEventType__P_170_7 == "click") {
            this.__fireEvent__P_170_10(domEvent, "mousedown", target);
          } else if (type == "dblclick") {
            this.__fireEvent__P_170_10(domEvent, "click", target);
          }
        },
        "default": null
      }),

      /**
       * If the mouseup event happens on a different target than the corresponding
       * mousedown event the internet explorer dispatches a click event on the
       * first common ancestor of both targets. The presence of this click event
       * is essential for the qooxdoo widget system. All other browsers don't fire
       * the click event so it must be emulated.
       *
       * @param domEvent {Event} original DOM event
       * @param type {String} event type
       * @param target {Element} event target of the DOM event.
       *
       * @signature function(domEvent, type, target)
       */
      __differentTargetClickFixPost__P_170_13: qx.core.Environment.select("engine.name", {
        mshtml: null,
        "default": function _default(domEvent, type, target) {
          switch (type) {
            case "mousedown":
              this.__lastMouseDownTarget__P_170_8 = target;
              break;

            case "mouseup":
              if (target !== this.__lastMouseDownTarget__P_170_8) {
                var commonParent = qx.dom.Hierarchy.getCommonParent(target, this.__lastMouseDownTarget__P_170_8);

                if (commonParent) {
                  this.__fireEvent__P_170_10(domEvent, "click", commonParent);
                }
              }

          }
        }
      })
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._stopButtonObserver();

      this._stopMoveObserver();

      this._stopWheelObserver();

      this.__manager__P_170_0 = this.__window__P_170_1 = this.__root__P_170_2 = this.__lastMouseDownTarget__P_170_8 = null;
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
  qx.event.handler.Mouse.$$dbClassInfo = $$dbClassInfo;
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
      "qx.core.ObjectRegistry": {},
      "qx.lang.Function": {},
      "qx.bom.Event": {},
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Native": {}
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
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * This class supports typical DOM element inline events like scroll,
   * change, select, ...
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.event.handler.Element", {
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
      qx.core.Object.constructor.call(this);
      this._manager = manager;
      this._registeredEvents = {};
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
        abort: true,
        // Image elements
        load: true,
        // Image elements
        scroll: true,
        select: true,
        reset: true,
        // Form Elements
        submit: true // Form Elements

      },

      /** @type {MAP} Whether the event is cancelable */
      CANCELABLE: {
        selectstart: true
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: false
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
        // Don't handle "load" event of Iframe. Unfortunately, both Element and
        // Iframe handler support "load" event. Should be handled by
        // qx.event.handler.Iframe only. Fixes [#BUG 4587].
        if (type === "load") {
          return target.tagName.toLowerCase() !== "iframe";
        } else {
          return true;
        }
      },
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {
        var elementId = qx.core.ObjectRegistry.toHashCode(target);
        var eventId = elementId + "-" + type;
        var listener = qx.lang.Function.listener(this._onNative, this, eventId);
        qx.bom.Event.addNativeListener(target, type, listener);
        this._registeredEvents[eventId] = {
          element: target,
          type: type,
          listener: listener
        };
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {
        var events = this._registeredEvents;

        if (!events) {
          return;
        }

        var elementId = qx.core.ObjectRegistry.toHashCode(target);
        var eventId = elementId + "-" + type;
        var eventData = this._registeredEvents[eventId];

        if (eventData) {
          qx.bom.Event.removeNativeListener(target, type, eventData.listener);
        }

        delete this._registeredEvents[eventId];
      },

      /*
      ---------------------------------------------------------------------------
        EVENT-HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Default event handler.
       *
       * @signature function(nativeEvent, eventId)
       * @param nativeEvent {Event} Native event
       * @param eventId {Integer} ID of the event (as stored internally)
       */
      _onNative: qx.event.GlobalError.observeMethod(function (nativeEvent, eventId) {
        var events = this._registeredEvents;

        if (!events) {
          return;
        }

        var eventData = events[eventId];
        var isCancelable = nativeEvent.cancelable || this.constructor.CANCELABLE[eventData.type];
        qx.event.Registration.fireNonBubblingEvent(eventData.element, eventData.type, qx.event.type.Native, [nativeEvent, undefined, undefined, undefined, isCancelable]);
      })
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      var entry;
      var events = this._registeredEvents;

      for (var id in events) {
        entry = events[id];
        qx.bom.Event.removeNativeListener(entry.element, entry.type, entry.listener);
      }

      this._manager = this._registeredEvents = null;
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
  qx.event.handler.Element.$$dbClassInfo = $$dbClassInfo;
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
        "defer": "runtime",
        "require": true
      },
      "qx.core.ObjectRegistry": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.event.Utils": {}
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
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * This class supports <code>appear</code> and <code>disappear</code> events
   * on DOM level.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.event.handler.Appear", {
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
      qx.core.Object.constructor.call(this);
      this.__manager__P_144_0 = manager;
      this.__targets__P_144_1 = {}; // Register

      qx.event.handler.Appear.__instances__P_144_2[this.toHashCode()] = this;
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
        appear: true,
        disappear: true
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true,

      /** @type {Map} Stores all appear manager instances */
      __instances__P_144_2: {},

      /**
       * Refreshes all appear handlers. Useful after massive DOM manipulations e.g.
       * through qx.html.Element.
       *
       */
      refresh: function refresh() {
        var all = this.__instances__P_144_2;

        for (var hash in all) {
          all[hash].refresh();
        }
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __manager__P_144_0: null,
      __targets__P_144_1: null,

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER INTERFACE
      ---------------------------------------------------------------------------
      */
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {},
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {
        var hash = qx.core.ObjectRegistry.toHashCode(target) + type;
        var targets = this.__targets__P_144_1;

        if (targets && !targets[hash]) {
          targets[hash] = target;
          target.$$displayed = target.offsetWidth > 0;
        }
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {
        var hash = qx.core.ObjectRegistry.toHashCode(target) + type;
        var targets = this.__targets__P_144_1;

        if (!targets) {
          return;
        }

        if (targets[hash]) {
          delete targets[hash];
        }
      },

      /*
      ---------------------------------------------------------------------------
        USER ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * This method should be called by all DOM tree modifying routines
       * to check the registered nodes for changes.
       *
       * @return {qx.Promise?} a promise, if one or more of the event handlers returned one
       */
      refresh: function refresh() {
        var targets = this.__targets__P_144_1;
        var legacyIe = qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9;
        var tracker = {};
        var self = this;
        Object.keys(targets).forEach(function (hash) {
          var elem = targets[hash];

          if (elem === undefined) {
            return;
          }

          qx.event.Utils.then(tracker, function () {
            var displayed = elem.offsetWidth > 0;

            if (!displayed && legacyIe) {
              // force recalculation in IE 8. See bug #7872
              displayed = elem.offsetWidth > 0;
            }

            if (!!elem.$$displayed !== displayed) {
              elem.$$displayed = displayed;
              var evt = qx.event.Registration.createEvent(displayed ? "appear" : "disappear");
              return self.__manager__P_144_0.dispatchEvent(elem, evt);
            }
          });
        });
        return tracker.promise;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__manager__P_144_0 = this.__targets__P_144_1 = null; // Deregister

      delete qx.event.handler.Appear.__instances__P_144_2[this.toHashCode()];
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
  qx.event.handler.Appear.$$dbClassInfo = $$dbClassInfo;
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
        "defer": "runtime",
        "require": true
      },
      "qx.lang.Function": {},
      "qx.bom.Event": {},
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.OperatingSystem": {
        "require": true
      },
      "qx.bom.Viewport": {},
      "qx.event.type.Orientation": {}
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
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Tino Butz (tbtz)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Unify Project
  
       Homepage:
         http://unify-project.org
  
       Copyright:
         2009-2010 Deutsche Telekom AG, Germany, http://telekom.com
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
  ************************************************************************ */

  /**
   * This class provides a handler for the orientation event.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.event.handler.Orientation", {
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

      this.__manager__P_185_0 = manager;
      this.__window__P_185_1 = manager.getWindow();

      this._initObserver();
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
        orientationchange: 1
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_WINDOW,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __manager__P_185_0: null,
      __window__P_185_1: null,
      __nativeEventType__P_185_2: null,
      _currentOrientation: null,
      __onNativeWrapper__P_185_3: null,

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER INTERFACE
      ---------------------------------------------------------------------------
      */
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {// Nothing needs to be done here
      },
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {// Nothing needs to be done here
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {// Nothing needs to be done here
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER INIT
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes the native orientation change event listeners.
       */
      _initObserver: function _initObserver() {
        this.__onNativeWrapper__P_185_3 = qx.lang.Function.listener(this._onNative, this); // Handle orientation change event for Android devices by the resize event.
        // See http://stackoverflow.com/questions/1649086/detect-rotation-of-android-phone-in-the-browser-with-javascript
        // for more information.

        this.__nativeEventType__P_185_2 = qx.bom.Event.supportsEvent(this.__window__P_185_1, "orientationchange") ? "orientationchange" : "resize";
        var Event = qx.bom.Event;
        Event.addNativeListener(this.__window__P_185_1, this.__nativeEventType__P_185_2, this.__onNativeWrapper__P_185_3);
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER STOP
      ---------------------------------------------------------------------------
      */

      /**
       * Disconnects the native orientation change event listeners.
       */
      _stopObserver: function _stopObserver() {
        var Event = qx.bom.Event;
        Event.removeNativeListener(this.__window__P_185_1, this.__nativeEventType__P_185_2, this.__onNativeWrapper__P_185_3);
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE EVENT OBSERVERS
      ---------------------------------------------------------------------------
      */

      /**
       * Handler for the native orientation change event.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} The touch event from the browser.
       */
      _onNative: qx.event.GlobalError.observeMethod(function (domEvent) {
        var detectOrientationChangeDelay = 0;

        if (qx.core.Environment.get("os.name") == "android") {
          // On Android Devices the detection of orientation mode has to be delayed.
          // See: http://stackoverflow.com/questions/8985805/orientation-change-in-android-using-javascript
          detectOrientationChangeDelay = 300;
        }

        qx.lang.Function.delay(this._onOrientationChange, detectOrientationChangeDelay, this, domEvent);
      }),

      /**
       * Handler for the detection of an orientation change.
       * @param domEvent {Event} The touch event from the browser.
       */
      _onOrientationChange: function _onOrientationChange(domEvent) {
        var Viewport = qx.bom.Viewport;
        var orientation = Viewport.getOrientation(domEvent.target);

        if (this._currentOrientation != orientation) {
          this._currentOrientation = orientation;
          var mode = Viewport.isLandscape(domEvent.target) ? "landscape" : "portrait";
          qx.event.Registration.fireEvent(this.__window__P_185_1, "orientationchange", qx.event.type.Orientation, [orientation, mode]);
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._stopObserver();

      this.__manager__P_185_0 = this.__window__P_185_1 = null;
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
  qx.event.handler.Orientation.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.OperatingSystem": {
        "require": true
      },
      "qx.bom.client.Device": {
        "require": true
      },
      "qx.lang.Function": {},
      "qx.bom.client.Event": {
        "require": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.Event": {},
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.bom.element.Style": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "load": true,
          "className": "qx.bom.client.OperatingSystem"
        },
        "device.touch": {
          "load": true,
          "className": "qx.bom.client.Device"
        },
        "event.mspointer": {
          "className": "qx.bom.client.Event"
        },
        "engine.version": {
          "className": "qx.bom.client.Engine"
        },
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
       2004-2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
       * Tino Butz (tbtz)
       * Christian Hagendorn (chris_schmidt)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Listens for native touch events and fires composite events like "tap" and
   * "swipe"
   *
   * @ignore(qx.event.*)
   */
  qx.Bootstrap.define("qx.event.handler.TouchCore", {
    extend: Object,
    implement: [qx.core.IDisposable],
    statics: {
      /** @type {Integer} The maximum distance of a tap. Only if the x or y distance of
       *      the performed tap is less or equal the value of this constant, a tap
       *      event is fired.
       */
      TAP_MAX_DISTANCE: qx.core.Environment.get("os.name") != "android" ? 10 : 40,

      /** @type {Map} The direction of a swipe relative to the axis */
      SWIPE_DIRECTION: {
        x: ["left", "right"],
        y: ["up", "down"]
      },

      /** @type {Integer} The minimum distance of a swipe. Only if the x or y distance
       *      of the performed swipe is greater as or equal the value of this
       *      constant, a swipe event is fired.
       */
      SWIPE_MIN_DISTANCE: qx.core.Environment.get("os.name") != "android" ? 11 : 41,

      /** @type {Integer} The minimum velocity of a swipe. Only if the velocity of the
       *      performed swipe is greater as or equal the value of this constant, a
       *      swipe event is fired.
       */
      SWIPE_MIN_VELOCITY: 0,

      /**
       * @type {Integer} The time delta in milliseconds to fire a long tap event.
       */
      LONGTAP_TIME: qx.core.Environment.get("device.touch") ? 500 : 99999
    },

    /**
     * Create a new instance
     *
     * @param target {Element} element on which to listen for native touch events
     * @param emitter {qx.event.Emitter} Event emitter object
     */
    construct: function construct(target, emitter) {
      this.__target__P_186_0 = target;
      this.__emitter__P_186_1 = emitter;

      this._initTouchObserver();

      this.__pointers__P_186_2 = [];
      this.__touchStartPosition__P_186_3 = {};
    },
    members: {
      __target__P_186_0: null,
      __emitter__P_186_1: null,
      __onTouchEventWrapper__P_186_4: null,
      __originalTarget__P_186_5: null,
      __touchStartPosition__P_186_3: null,
      __startTime__P_186_6: null,
      __beginScalingDistance__P_186_7: null,
      __beginRotation__P_186_8: null,
      __pointers__P_186_2: null,
      __touchEventNames__P_186_9: null,

      /*
      ---------------------------------------------------------------------------
        OBSERVER INIT
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes the native touch event listeners.
       */
      _initTouchObserver: function _initTouchObserver() {
        this.__onTouchEventWrapper__P_186_4 = qx.lang.Function.listener(this._onTouchEvent, this);
        this.__touchEventNames__P_186_9 = ["touchstart", "touchmove", "touchend", "touchcancel"];

        if (qx.core.Environment.get("event.mspointer")) {
          var engineVersion = parseInt(qx.core.Environment.get("engine.version"), 10);

          if (engineVersion == 10) {
            // IE 10
            this.__touchEventNames__P_186_9 = ["MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerCancel"];
          } else {
            // IE 11+
            this.__touchEventNames__P_186_9 = ["pointerdown", "pointermove", "pointerup", "pointercancel"];
          }
        }

        for (var i = 0; i < this.__touchEventNames__P_186_9.length; i++) {
          qx.bom.Event.addNativeListener(this.__target__P_186_0, this.__touchEventNames__P_186_9[i], this.__onTouchEventWrapper__P_186_4);
        }
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER STOP
      ---------------------------------------------------------------------------
      */

      /**
       * Disconnects the native touch event listeners.
       */
      _stopTouchObserver: function _stopTouchObserver() {
        for (var i = 0; i < this.__touchEventNames__P_186_9.length; i++) {
          qx.bom.Event.removeNativeListener(this.__target__P_186_0, this.__touchEventNames__P_186_9[i], this.__onTouchEventWrapper__P_186_4);
        }
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE EVENT OBSERVERS
      ---------------------------------------------------------------------------
      */

      /**
       * Handler for native touch events.
       *
       * @param domEvent {Event} The touch event from the browser.
       */
      _onTouchEvent: function _onTouchEvent(domEvent) {
        this._commonTouchEventHandler(domEvent);
      },

      /**
       * Calculates the scaling distance between two touches.
       * @param touch0 {Event} The touch event from the browser.
       * @param touch1 {Event} The touch event from the browser.
       * @return {Number} the calculated distance.
       */
      _getScalingDistance: function _getScalingDistance(touch0, touch1) {
        return Math.sqrt(Math.pow(touch0.pageX - touch1.pageX, 2) + Math.pow(touch0.pageY - touch1.pageY, 2));
      },

      /**
       * Calculates the rotation between two touches.
       * @param touch0 {Event} The touch event from the browser.
       * @param touch1 {Event} The touch event from the browser.
       * @return {Number} the calculated rotation.
       */
      _getRotationAngle: function _getRotationAngle(touch0, touch1) {
        var x = touch0.pageX - touch1.pageX;
        var y = touch0.pageY - touch1.pageY;
        return Math.atan2(y, x) * 180 / Math.PI;
      },

      /**
       * Calculates the delta of the touch position relative to its position when <code>touchstart/code> event occurred.
       * @param touches {Array} an array with the current active touches, provided by <code>touchmove/code> event.
       * @return {Array} an array containing objects with the calculated delta as <code>x</code>,
       * <code>y</code> and the identifier of the corresponding touch.
       */
      _calcTouchesDelta: function _calcTouchesDelta(touches) {
        var delta = [];

        for (var i = 0; i < touches.length; i++) {
          delta.push(this._calcSingleTouchDelta(touches[i]));
        }

        return delta;
      },

      /**
       * Calculates the delta of one single touch position relative to its position when <code>touchstart/code> event occurred.
       * @param touch {Event} the current active touch, provided by <code>touchmove/code> event.
       * @return {Map} a map containing deltaX as <code>x</code>, deltaY as <code>y</code>, the direction of the movement as <code>axis</code> and the touch identifier as <code>identifier</code>.
       */
      _calcSingleTouchDelta: function _calcSingleTouchDelta(touch) {
        if (this.__touchStartPosition__P_186_3.hasOwnProperty(touch.identifier)) {
          var touchStartPosition = this.__touchStartPosition__P_186_3[touch.identifier];
          var deltaX = Math.floor(touch.clientX - touchStartPosition[0]);
          var deltaY = Math.floor(touch.clientY - touchStartPosition[1]);
          var axis = "x";

          if (Math.abs(deltaX / deltaY) < 1) {
            axis = "y";
          }

          return {
            x: deltaX,
            y: deltaY,
            axis: axis,
            identifier: touch.identifier
          };
        } else {
          return {
            x: 0,
            y: 0,
            axis: null,
            identifier: touch.identifier
          };
        }
      },

      /**
       * Called by an event handler.
       *
       * @param domEvent {Event} DOM event
       * @param type {String ? null} type of the event
       */
      _commonTouchEventHandler: function _commonTouchEventHandler(domEvent, type) {
        var type = type || domEvent.type;

        if (qx.core.Environment.get("event.mspointer")) {
          type = this._mapPointerEvent(type);

          var touches = this._detectTouchesByPointer(domEvent, type);

          domEvent.changedTouches = touches;
          domEvent.targetTouches = touches;
          domEvent.touches = touches;
        }

        domEvent.delta = [];

        if (type == "touchstart") {
          this.__originalTarget__P_186_5 = this._getTarget(domEvent);

          if (domEvent.touches && domEvent.touches.length > 1) {
            this.__beginScalingDistance__P_186_7 = this._getScalingDistance(domEvent.touches[0], domEvent.touches[1]);
            this.__beginRotation__P_186_8 = this._getRotationAngle(domEvent.touches[0], domEvent.touches[1]);
          }

          for (var i = 0; i < domEvent.changedTouches.length; i++) {
            var touch = domEvent.changedTouches[i];
            this.__touchStartPosition__P_186_3[touch.identifier] = [touch.clientX, touch.clientY];
          }
        }

        if (type == "touchmove") {
          // Polyfill for scale
          if (typeof domEvent.scale == "undefined" && domEvent.targetTouches.length > 1) {
            var currentScalingDistance = this._getScalingDistance(domEvent.targetTouches[0], domEvent.targetTouches[1]);

            domEvent.scale = currentScalingDistance / this.__beginScalingDistance__P_186_7;
          } // Polyfill for rotation


          if ((typeof domEvent.rotation == "undefined" || qx.core.Environment.get("event.mspointer")) && domEvent.targetTouches.length > 1) {
            var currentRotation = this._getRotationAngle(domEvent.targetTouches[0], domEvent.targetTouches[1]);

            domEvent._rotation = currentRotation - this.__beginRotation__P_186_8;
          }

          domEvent.delta = this._calcTouchesDelta(domEvent.targetTouches);
        }

        this._fireEvent(domEvent, type, this.__originalTarget__P_186_5);

        if (qx.core.Environment.get("event.mspointer")) {
          if (type == "touchend" || type == "touchcancel") {
            delete this.__pointers__P_186_2[domEvent.pointerId];
          }
        }

        if ((type == "touchend" || type == "touchcancel") && domEvent.changedTouches[0]) {
          delete this.__touchStartPosition__P_186_3[domEvent.changedTouches[0].identifier];
        }
      },

      /**
       * Creates an array with all current used touches out of multiple serial pointer events.
       * Needed because pointerEvents do not provide a touch list.
       * @param domEvent {Event} DOM event
       * @param type {String ? null} type of the event
       * @return {Array} touch list array.
       */
      _detectTouchesByPointer: function _detectTouchesByPointer(domEvent, type) {
        var touches = [];

        if (type == "touchstart") {
          this.__pointers__P_186_2[domEvent.pointerId] = domEvent;
        } else if (type == "touchmove") {
          this.__pointers__P_186_2[domEvent.pointerId] = domEvent;
        }

        for (var pointerId in this.__pointers__P_186_2) {
          var pointer = this.__pointers__P_186_2[pointerId];
          touches.push(pointer);
        }

        return touches;
      },

      /**
       * Maps a pointer event type to the corresponding touch event type.
       * @param type {String} the event type to parse.
       * @return {String} the parsed event name.
       */
      _mapPointerEvent: function _mapPointerEvent(type) {
        type = type.toLowerCase();

        if (type.indexOf("pointerdown") !== -1) {
          return "touchstart";
        } else if (type.indexOf("pointerup") !== -1) {
          return "touchend";
        } else if (type.indexOf("pointermove") !== -1) {
          return "touchmove";
        } else if (type.indexOf("pointercancel") !== -1) {
          return "touchcancel";
        }

        return type;
      },

      /**
       * Return the target of the event.
       *
       * @param domEvent {Event} DOM event
       * @return {Element} Event target
       */
      _getTarget: function _getTarget(domEvent) {
        var target = qx.bom.Event.getTarget(domEvent); // Text node. Fix Safari Bug, see http://www.quirksmode.org/js/events_properties.html

        if (qx.core.Environment.get("engine.name") == "webkit") {
          if (target && target.nodeType == 3) {
            target = target.parentNode;
          }
        } else if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 11) {
          // Fix for IE10 and pointer-events:none
          //
          // Changed the condition above to match exactly those browsers
          // for which the fix was intended
          // See: https://github.com/qooxdoo/qooxdoo/issues/9481
          //
          var targetForIE = this.__evaluateTarget__P_186_10(domEvent);

          if (targetForIE) {
            target = targetForIE;
          }
        }

        return target;
      },

      /**
       * This method fixes "pointer-events:none" for Internet Explorer 10.
       * Checks which elements are placed to position x/y and traverses the array
       * till one element has no "pointer-events:none" inside its style attribute.
       * @param domEvent {Event} DOM event
       * @return {Element | null} Event target
       */
      __evaluateTarget__P_186_10: function __evaluateTarget__P_186_10(domEvent) {
        var clientX = null;
        var clientY = null;

        if (domEvent && domEvent.touches && domEvent.touches.length !== 0) {
          clientX = domEvent.touches[0].clientX;
          clientY = domEvent.touches[0].clientY;
        } // Retrieve an array with elements on point X/Y.


        var hitTargets = document.msElementsFromPoint(clientX, clientY);

        if (hitTargets) {
          // Traverse this array for the elements which has no pointer-events:none inside.
          for (var i = 0; i < hitTargets.length; i++) {
            var currentTarget = hitTargets[i];
            var pointerEvents = qx.bom.element.Style.get(currentTarget, "pointer-events", 3);

            if (pointerEvents != "none") {
              return currentTarget;
            }
          }
        }

        return null;
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
          target = this._getTarget(domEvent);
        }

        var type = type || domEvent.type;

        if (target && target.nodeType && this.__emitter__P_186_1) {
          this.__emitter__P_186_1.emit(type, domEvent);
        }
      },

      /**
       * Dispose this object
       */
      dispose: function dispose() {
        this._stopTouchObserver();

        this.__originalTarget__P_186_5 = this.__target__P_186_0 = this.__touchEventNames__P_186_9 = this.__pointers__P_186_2 = this.__emitter__P_186_1 = this.__beginScalingDistance__P_186_7 = this.__beginRotation__P_186_8 = null;
      }
    }
  });
  qx.event.handler.TouchCore.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.UserAction": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.handler.Orientation": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.type.Tap": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.type.Swipe": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.type.Track": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.type.Rotate": {
        "require": true,
        "defer": "runtime"
      },
      "qx.event.type.Pinch": {
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
      "qx.event.handler.TouchCore": {
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
      "qx.event.type.Touch": {},
      "qx.event.type.Data": {},
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Event": {
        "defer": "load",
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "event.touch": {
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
       2004-2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
       * Tino Butz (tbtz)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This class provides a unified touch event handler.
   *
   * @require(qx.event.handler.UserAction)
   * @require(qx.event.handler.Orientation)
   * @require(qx.event.type.Tap)
   * @require(qx.event.type.Swipe)
   * @require(qx.event.type.Track)
   * @require(qx.event.type.Rotate)
   * @require(qx.event.type.Pinch)
   */
  qx.Class.define("qx.event.handler.Touch", {
    extend: qx.event.handler.TouchCore,
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
      // Define shorthands
      this.__manager__P_171_0 = manager;
      this.__window__P_171_1 = manager.getWindow();
      this.__root__P_171_2 = this.__window__P_171_1.document;
      qx.event.handler.TouchCore.apply(this, [this.__root__P_171_2]);
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
        touchstart: 1,
        touchmove: 1,
        touchend: 1,
        touchcancel: 1,
        // Appears when the touch is interrupted, e.g. by an alert box
        tap: 1,
        longtap: 1,
        swipe: 1
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE + qx.event.IEventHandler.TARGET_DOCUMENT,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true,

      /** @type {Map} Mapping of mouse events to touch events */
      MOUSE_TO_TOUCH_MAPPING: {
        mousedown: "touchstart",
        mousemove: "touchmove",
        mouseup: "touchend"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __manager__P_171_0: null,
      __window__P_171_1: null,
      __root__P_171_2: null,
      // Checks if the mouse movement is happening while simulating a touch event
      __isInTouch__P_171_3: false,

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
       * Fire a touch event with the given parameters
       *
       * @param domEvent {Event} DOM event
       * @param type {String ? null} type of the event
       * @param target {Element ? null} event target
       * @param eventTypeClass {Class ? qx.event.type.Touch} the event type class
       */
      _fireEvent: function _fireEvent(domEvent, type, target, eventTypeClass) {
        if (!target) {
          target = this._getTarget(domEvent);
        }

        var type = type || domEvent.type;

        if (target && target.nodeType) {
          qx.event.Registration.fireEvent(target, type, eventTypeClass || qx.event.type.Touch, [domEvent, target, null, true, true]);
        } // Fire user action event


        qx.event.Registration.fireEvent(this.__window__P_171_1, "useraction", qx.event.type.Data, [type]);
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE EVENT OBSERVERS
      ---------------------------------------------------------------------------
      */

      /**
       * Handler for the native touch events.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} The touch event from the browser.
       */
      _onTouchEvent: qx.event.GlobalError.observeMethod(function (domEvent) {
        this._commonTouchEventHandler(domEvent);
      }),

      /**
       * Dispose this object
       */
      dispose: function dispose() {
        this.__callBase__P_171_4("dispose");

        this.__manager__P_171_0 = this.__window__P_171_1 = this.__root__P_171_2 = null;
      },

      /**
       * Call overridden method.
       *
       * @param method {String} Name of the overridden method.
       * @param args {Array} Arguments.
       */
      __callBase__P_171_4: function __callBase__P_171_4(method, args) {
        qx.event.handler.TouchCore.prototype[method].apply(this, args || []);
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      qx.event.Registration.addHandler(statics); // Prevent scrolling on the document to avoid scrolling at all

      if (qx.core.Environment.get("event.touch")) {
        // get the handler to assure that the instance is created
        qx.event.Registration.getManager(document).getHandler(statics);
      }
    }
  });
  qx.event.handler.Touch.$$dbClassInfo = $$dbClassInfo;
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
      "qx.lang.Function": {},
      "qx.bom.Event": {},
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Event": {},
      "qx.event.handler.Appear": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2007-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * This class provides a handler for the online event.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.event.handler.Offline", {
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
      qx.core.Object.constructor.call(this);
      this.__manager__P_172_0 = manager;
      this.__window__P_172_1 = manager.getWindow();

      this._initObserver();
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
        online: true,
        offline: true
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_WINDOW,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __manager__P_172_0: null,
      __window__P_172_1: null,
      __onNativeWrapper__P_172_2: null,

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

      /**
       * Connects the native online and offline event listeners.
       */
      _initObserver: function _initObserver() {
        this.__onNativeWrapper__P_172_2 = qx.lang.Function.listener(this._onNative, this);
        qx.bom.Event.addNativeListener(this.__window__P_172_1, "offline", this.__onNativeWrapper__P_172_2);
        qx.bom.Event.addNativeListener(this.__window__P_172_1, "online", this.__onNativeWrapper__P_172_2);
      },

      /**
       * Disconnects the native online and offline event listeners.
       */
      _stopObserver: function _stopObserver() {
        qx.bom.Event.removeNativeListener(this.__window__P_172_1, "offline", this.__onNativeWrapper__P_172_2);
        qx.bom.Event.removeNativeListener(this.__window__P_172_1, "online", this.__onNativeWrapper__P_172_2);
      },

      /**
       * Native handler function which fires a qooxdoo event.
       * @signature function(domEvent)
       * @param domEvent {Event} Native DOM event
       */
      _onNative: qx.event.GlobalError.observeMethod(function (domEvent) {
        qx.event.Registration.fireEvent(this.__window__P_172_1, domEvent.type, qx.event.type.Event, []);
      }),

      /*
      ---------------------------------------------------------------------------
        USER ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Returns whether the current window thinks its online or not.
       * @return {Boolean} <code>true</code> if its online
       */
      isOnline: function isOnline() {
        return !!this.__window__P_172_1.navigator.onLine;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__manager__P_172_0 = null;

      this._stopObserver(); // Deregister


      delete qx.event.handler.Appear.__instances__P_172_3[this.toHashCode()];
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
  qx.event.handler.Offline.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
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
      "qx.lang.Function": {
        "construct": true
      },
      "qx.bom.client.Engine": {
        "construct": true,
        "require": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      },
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.bom.Event": {},
      "qx.event.type.Data": {},
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "construct": true,
          "className": "qx.bom.client.Engine",
          "load": true
        },
        "engine.version": {
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */
  // Original behavior:
  // ================================================================
  // Normally a "change" event should occur on blur of the element
  // (http://www.w3.org/TR/DOM-Level-2-Events/events.html)
  // However this is not true for "file" upload fields
  // And this is also not true for checkboxes and radiofields (all non mshtml)
  // And this is also not true for select boxes where the selections
  // happens in the opened popup (Gecko + Webkit)
  // Normalized behavior:
  // ================================================================
  // Change on blur for textfields, textareas and file
  // Instant change event on checkboxes, radiobuttons
  // Select field fires on select (when using popup or size>1)
  // but differs when using keyboard:
  // mshtml+opera=keypress; mozilla+safari=blur
  // Input event for textareas does not work in Safari 3 beta (WIN)
  // Safari 3 beta (WIN) repeats change event for select box on blur when selected using popup
  // Opera fires "change" on radio buttons two times for each change

  /**
   * This handler provides an "change" event for all form fields and an
   * "input" event for form fields of type "text" and "textarea".
   *
   * To let these events work it is needed to create the elements using
   * {@link qx.bom.Input}
   */
  qx.Class.define("qx.event.handler.Input", {
    extend: qx.core.Object,
    implement: qx.event.IEventHandler,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this._onChangeCheckedWrapper = qx.lang.Function.listener(this._onChangeChecked, this);
      this._onChangeValueWrapper = qx.lang.Function.listener(this._onChangeValue, this);
      this._onInputWrapper = qx.lang.Function.listener(this._onInput, this);
      this._onPropertyWrapper = qx.lang.Function.listener(this._onProperty, this); // special event handler for opera

      if (qx.core.Environment.get("engine.name") == "opera") {
        this._onKeyDownWrapper = qx.lang.Function.listener(this._onKeyDown, this);
        this._onKeyUpWrapper = qx.lang.Function.listener(this._onKeyUp, this);
      }
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
        input: 1,
        change: 1
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: false
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // special handling for opera
      __enter__P_173_0: false,
      __onInputTimeoutId__P_173_1: null,
      // stores the former set value for opera and IE
      __oldValue__P_173_2: null,
      // stores the former set value for IE
      __oldInputValue__P_173_3: null,

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER INTERFACE
      ---------------------------------------------------------------------------
      */
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {
        var lower = target.tagName.toLowerCase();

        if (type === "input" && (lower === "input" || lower === "textarea")) {
          return true;
        }

        if (type === "change" && (lower === "input" || lower === "textarea" || lower === "select")) {
          return true;
        }

        return false;
      },
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {
        if (qx.core.Environment.get("engine.name") == "mshtml" && (qx.core.Environment.get("engine.version") < 9 || qx.core.Environment.get("engine.version") >= 9 && qx.core.Environment.get("browser.documentmode") < 9)) {
          if (!target.__inputHandlerAttached__P_173_4) {
            var tag = target.tagName.toLowerCase();
            var elementType = target.type;

            if (elementType === "text" || elementType === "password" || tag === "textarea" || elementType === "checkbox" || elementType === "radio") {
              qx.bom.Event.addNativeListener(target, "propertychange", this._onPropertyWrapper);
            }

            if (elementType !== "checkbox" && elementType !== "radio") {
              qx.bom.Event.addNativeListener(target, "change", this._onChangeValueWrapper);
            }

            if (elementType === "text" || elementType === "password") {
              this._onKeyPressWrapped = qx.lang.Function.listener(this._onKeyPress, this, target);
              qx.bom.Event.addNativeListener(target, "keypress", this._onKeyPressWrapped);
            }

            target.__inputHandlerAttached__P_173_4 = true;
          }
        } else {
          if (type === "input") {
            this.__registerInputListener__P_173_5(target);
          } else if (type === "change") {
            if (target.type === "radio" || target.type === "checkbox") {
              qx.bom.Event.addNativeListener(target, "change", this._onChangeCheckedWrapper);
            } else {
              qx.bom.Event.addNativeListener(target, "change", this._onChangeValueWrapper);
            } // special enter bugfix for opera


            if (qx.core.Environment.get("engine.name") == "opera" || qx.core.Environment.get("engine.name") == "mshtml") {
              if (target.type === "text" || target.type === "password") {
                this._onKeyPressWrapped = qx.lang.Function.listener(this._onKeyPress, this, target);
                qx.bom.Event.addNativeListener(target, "keypress", this._onKeyPressWrapped);
              }
            }
          }
        }
      },
      __registerInputListener__P_173_5: qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(target) {
          if (qx.core.Environment.get("engine.version") >= 9 && qx.core.Environment.get("browser.documentmode") >= 9) {
            qx.bom.Event.addNativeListener(target, "input", this._onInputWrapper);

            if (target.type === "text" || target.type === "password" || target.type === "textarea") {
              // Fixed input for delete and backspace key
              this._inputFixWrapper = qx.lang.Function.listener(this._inputFix, this, target);
              qx.bom.Event.addNativeListener(target, "keyup", this._inputFixWrapper);
            }
          }
        },
        webkit: function webkit(target) {
          var tag = target.tagName.toLowerCase(); // the change event is not fired while typing
          // this has been fixed in the latest nightlies

          if (parseFloat(qx.core.Environment.get("engine.version")) < 532 && tag == "textarea") {
            qx.bom.Event.addNativeListener(target, "keypress", this._onInputWrapper);
          }

          qx.bom.Event.addNativeListener(target, "input", this._onInputWrapper);
        },
        opera: function opera(target) {
          // register key events for filtering "enter" on input events
          qx.bom.Event.addNativeListener(target, "keyup", this._onKeyUpWrapper);
          qx.bom.Event.addNativeListener(target, "keydown", this._onKeyDownWrapper); // register an blur event for preventing the input event on blur

          qx.bom.Event.addNativeListener(target, "input", this._onInputWrapper);
        },
        "default": function _default(target) {
          qx.bom.Event.addNativeListener(target, "input", this._onInputWrapper);
        }
      }),
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type) {
        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("engine.version") < 9 && qx.core.Environment.get("browser.documentmode") < 9) {
          if (target.__inputHandlerAttached__P_173_4) {
            var tag = target.tagName.toLowerCase();
            var elementType = target.type;

            if (elementType === "text" || elementType === "password" || tag === "textarea" || elementType === "checkbox" || elementType === "radio") {
              qx.bom.Event.removeNativeListener(target, "propertychange", this._onPropertyWrapper);
            }

            if (elementType !== "checkbox" && elementType !== "radio") {
              qx.bom.Event.removeNativeListener(target, "change", this._onChangeValueWrapper);
            }

            if (elementType === "text" || elementType === "password") {
              qx.bom.Event.removeNativeListener(target, "keypress", this._onKeyPressWrapped);
            }

            try {
              delete target.__inputHandlerAttached__P_173_4;
            } catch (ex) {
              target.__inputHandlerAttached__P_173_4 = null;
            }
          }
        } else {
          if (type === "input") {
            this.__unregisterInputListener__P_173_6(target);
          } else if (type === "change") {
            if (target.type === "radio" || target.type === "checkbox") {
              qx.bom.Event.removeNativeListener(target, "change", this._onChangeCheckedWrapper);
            } else {
              qx.bom.Event.removeNativeListener(target, "change", this._onChangeValueWrapper);
            }
          }

          if (qx.core.Environment.get("engine.name") == "opera" || qx.core.Environment.get("engine.name") == "mshtml") {
            if (target.type === "text" || target.type === "password") {
              qx.bom.Event.removeNativeListener(target, "keypress", this._onKeyPressWrapped);
            }
          }
        }
      },
      __unregisterInputListener__P_173_6: qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(target) {
          if (qx.core.Environment.get("engine.version") >= 9 && qx.core.Environment.get("browser.documentmode") >= 9) {
            qx.bom.Event.removeNativeListener(target, "input", this._onInputWrapper);

            if (target.type === "text" || target.type === "password" || target.type === "textarea") {
              // Fixed input for delete and backspace key
              qx.bom.Event.removeNativeListener(target, "keyup", this._inputFixWrapper);
            }
          }
        },
        webkit: function webkit(target) {
          var tag = target.tagName.toLowerCase(); // the change event is not fired while typing
          // this has been fixed in the latest nightlies

          if (parseFloat(qx.core.Environment.get("engine.version")) < 532 && tag == "textarea") {
            qx.bom.Event.removeNativeListener(target, "keypress", this._onInputWrapper);
          }

          qx.bom.Event.removeNativeListener(target, "input", this._onInputWrapper);
        },
        opera: function opera(target) {
          // unregister key events for filtering "enter" on input events
          qx.bom.Event.removeNativeListener(target, "keyup", this._onKeyUpWrapper);
          qx.bom.Event.removeNativeListener(target, "keydown", this._onKeyDownWrapper);
          qx.bom.Event.removeNativeListener(target, "input", this._onInputWrapper);
        },
        "default": function _default(target) {
          qx.bom.Event.removeNativeListener(target, "input", this._onInputWrapper);
        }
      }),

      /*
      ---------------------------------------------------------------------------
        FOR OPERA AND IE (KEYPRESS TO SIMULATE CHANGE EVENT)
      ---------------------------------------------------------------------------
      */

      /**
       * Handler for fixing the different behavior when pressing the enter key.
       *
       * FF and Safari fire a "change" event if the user presses the enter key.
       * IE and Opera fire the event only if the focus is changed.
       *
       * @signature function(e, target)
       * @param e {Event} DOM event object
       * @param target {Element} The event target
       */
      _onKeyPress: qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(e, target) {
          if (e.keyCode === 13) {
            if (target.value !== this.__oldValue__P_173_2) {
              this.__oldValue__P_173_2 = target.value;
              qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.value]);
            }
          }
        },
        opera: function opera(e, target) {
          if (e.keyCode === 13) {
            if (target.value !== this.__oldValue__P_173_2) {
              this.__oldValue__P_173_2 = target.value;
              qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.value]);
            }
          }
        },
        "default": null
      }),

      /*
      ---------------------------------------------------------------------------
        FOR IE (KEYUP TO SIMULATE INPUT EVENT)
      ---------------------------------------------------------------------------
      */

      /**
       * Handler for fixing the different behavior when pressing the backspace or
       * delete key.
       *
       * The other browsers fire a "input" event if the user presses the backspace
       * or delete key.
       * IE fire the event only for other keys.
       *
       * @signature function(e, target)
       * @param e {Event} DOM event object
       * @param target {Element} The event target
       */
      _inputFix: qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(e, target) {
          if (e.keyCode === 46 || e.keyCode === 8) {
            if (target.value !== this.__oldInputValue__P_173_3) {
              this.__oldInputValue__P_173_3 = target.value;
              qx.event.Registration.fireEvent(target, "input", qx.event.type.Data, [target.value]);
            }
          }
        },
        "default": null
      }),

      /*
      ---------------------------------------------------------------------------
        FOR OPERA ONLY LISTENER (KEY AND BLUR)
      ---------------------------------------------------------------------------
      */

      /**
       * Key event listener for opera which recognizes if the enter key has been
       * pressed.
       *
       * @signature function(e)
       * @param e {Event} DOM event object
       */
      _onKeyDown: qx.core.Environment.select("engine.name", {
        opera: function opera(e) {
          // enter is pressed
          if (e.keyCode === 13) {
            this.__enter__P_173_0 = true;
          }
        },
        "default": null
      }),

      /**
       * Key event listener for opera which recognizes if the enter key has been
       * pressed.
       *
       * @signature function(e)
       * @param e {Event} DOM event object
       */
      _onKeyUp: qx.core.Environment.select("engine.name", {
        opera: function opera(e) {
          // enter is pressed
          if (e.keyCode === 13) {
            this.__enter__P_173_0 = false;
          }
        },
        "default": null
      }),

      /*
      ---------------------------------------------------------------------------
        NATIVE EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Internal function called by input elements created using {@link qx.bom.Input}.
       *
       * @signature function(e)
       * @param e {Event} Native DOM event
       */
      _onInput: qx.event.GlobalError.observeMethod(function (e) {
        var target = qx.bom.Event.getTarget(e);
        var tag = target.tagName.toLowerCase(); // ignore native input event when triggered by return in input element

        if (!this.__enter__P_173_0 || tag !== "input") {
          // opera lower 10.6 needs a special treatment for input events because
          // they are also fired on blur
          if (qx.core.Environment.get("engine.name") == "opera" && qx.core.Environment.get("browser.version") < 10.6) {
            this.__onInputTimeoutId__P_173_1 = window.setTimeout(function () {
              qx.event.Registration.fireEvent(target, "input", qx.event.type.Data, [target.value]);
            }, 0);
          } else {
            qx.event.Registration.fireEvent(target, "input", qx.event.type.Data, [target.value]);
          }
        }
      }),

      /**
       * Internal function called by input elements created using {@link qx.bom.Input}.
       *
       * @signature function(e)
       * @param e {Event} Native DOM event
       */
      _onChangeValue: qx.event.GlobalError.observeMethod(function (e) {
        var target = qx.bom.Event.getTarget(e);
        var data = target.value;

        if (target.type === "select-multiple") {
          var data = [];

          for (var i = 0, o = target.options, l = o.length; i < l; i++) {
            if (o[i].selected) {
              data.push(o[i].value);
            }
          }
        }

        qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [data]);
      }),

      /**
       * Internal function called by input elements created using {@link qx.bom.Input}.
       *
       * @signature function(e)
       * @param e {Event} Native DOM event
       */
      _onChangeChecked: qx.event.GlobalError.observeMethod(function (e) {
        var target = qx.bom.Event.getTarget(e);

        if (target.type === "radio") {
          if (target.checked) {
            qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.value]);
          }
        } else {
          qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.checked]);
        }
      }),

      /**
       * Internal function called by input elements created using {@link qx.bom.Input}.
       *
       * @signature function(e)
       * @param e {Event} Native DOM event
       */
      _onProperty: qx.core.Environment.select("engine.name", {
        mshtml: qx.event.GlobalError.observeMethod(function (e) {
          var target = qx.bom.Event.getTarget(e);
          var prop = e.propertyName;

          if (prop === "value" && (target.type === "text" || target.type === "password" || target.tagName.toLowerCase() === "textarea")) {
            if (!target.$$inValueSet) {
              qx.event.Registration.fireEvent(target, "input", qx.event.type.Data, [target.value]);
            }
          } else if (prop === "checked") {
            if (target.type === "checkbox") {
              qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.checked]);
            } else if (target.checked) {
              qx.event.Registration.fireEvent(target, "change", qx.event.type.Data, [target.value]);
            }
          }
        }),
        "default": function _default() {}
      })
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
  qx.event.handler.Input.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.IEventHandler": {
        "require": true
      },
      "qx.lang.Function": {
        "construct": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      },
      "qx.bom.Event": {},
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Dom": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2021 Zenesis Limited, https://www.zenesis.com
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * John Spackman (johnspackman, john.spackman@zenesis.com)
  
  ************************************************************************ */

  /**
   * Defines the event handlers for Video tags - also Audio because they are identical
   */
  qx.Class.define("qx.event.handler.Video", {
    extend: qx.core.Object,
    implement: qx.event.IEventHandler,
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__onNativeListener__P_174_0 = qx.lang.Function.listener(this._onNative, this);
    },
    statics: {
      /** @type {Integer} Priority of this handler */
      PRIORITY: qx.event.Registration.PRIORITY_NORMAL,

      /** @type {Map} Supported event types */
      SUPPORTED_TYPES: {
        abort: 1,
        canplay: 1,
        canplaythrough: 1,
        durationchange: 1,
        emptied: 1,
        ended: 1,
        error: 1,
        loadeddata: 1,
        loadedmetadata: 1,
        loadstart: 1,
        pause: 1,
        play: 1,
        playing: 1,
        progress: 1,
        ratechange: 1,
        seeked: 1,
        seeking: 1,
        stalled: 1,
        suspend: 1,
        timeupdate: 1,
        volumechange: 1,
        waiting: 1
      },

      /** @type {Integer} Which target check to use */
      TARGET_CHECK: qx.event.IEventHandler.TARGET_DOMNODE,

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: false
    },
    members: {
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {
        var lower = target.tagName.toLowerCase();

        if (lower === "video" || lower === "audio") {
          return true;
        }

        return false;
      },
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {
        qx.bom.Event.addNativeListener(target, type, this.__onNativeListener__P_174_0);
      },

      /**
       * Default event handler for events that do not bubble
       *
       * @signature function(domEvent, eventId)
       * @param domEvent {Event} Native event
       */
      _onNative: qx.event.GlobalError.observeMethod(function (domEvent) {
        var target = qx.bom.Event.getTarget(domEvent);
        qx.event.Registration.fireNonBubblingEvent(target, domEvent.type, qx.event.type.Dom, [domEvent, target, undefined, undefined, domEvent.cancelable]);
      }),
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type) {
        qx.bom.Event.removeNativeListener(target, type, this.__onNativeListener__P_174_0);
      }
    },
    defer: function defer(statics) {
      qx.event.Registration.addHandler(statics);
    }
  });
  qx.event.handler.Video.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.dispatch.Direct": {
        "require": true
      },
      "qx.event.dispatch.DomBubbling": {
        "require": true
      },
      "qx.event.handler.Keyboard": {
        "require": true
      },
      "qx.event.handler.Mouse": {
        "require": true
      },
      "qx.event.handler.Element": {
        "require": true
      },
      "qx.event.handler.Appear": {
        "require": true
      },
      "qx.event.handler.Touch": {
        "require": true
      },
      "qx.event.handler.Offline": {
        "require": true
      },
      "qx.event.handler.Input": {
        "require": true
      },
      "qx.event.handler.Pointer": {
        "require": true
      },
      "qx.event.handler.Gesture": {
        "require": true
      },
      "qx.event.handler.Video": {
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
      "qx.event.Registration": {},
      "qx.event.handler.Focus": {},
      "qx.event.dispatch.MouseCapture": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.xml.Document": {},
      "qx.dom.Hierarchy": {}
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
  
  ************************************************************************ */

  /**
   * This class is mainly a convenience wrapper for DOM elements to
   * qooxdoo's event system.
   *
   * @require(qx.event.dispatch.Direct)
   * @require(qx.event.dispatch.DomBubbling)
   * @require(qx.event.handler.Keyboard)
   * @require(qx.event.handler.Mouse)
   * @require(qx.event.handler.Element)
   * @require(qx.event.handler.Appear)
   * @require(qx.event.handler.Touch)
   * @require(qx.event.handler.Offline)
   * @require(qx.event.handler.Input)
   * @require(qx.event.handler.Pointer)
   * @require(qx.event.handler.Gesture)
   * @require(qx.event.handler.Video)
   */
  qx.Class.define("qx.bom.Element", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /*
      ---------------------------------------------------------------------------
        EVENTS
      ---------------------------------------------------------------------------
      */

      /**
       * Add an event listener to a DOM element. The event listener is passed an
       * instance of {@link Event} containing all relevant information
       * about the event as parameter.
       *
       * @param element {Element} DOM element to attach the event on.
       * @param type {String} Name of the event e.g. "click", "keydown", ...
       * @param listener {Function} Event listener function
       * @param self {Object ? null} Reference to the 'this' variable inside
       *         the event listener. When not given, the corresponding dispatcher
       *         usually falls back to a default, which is the target
       *         by convention. Note this is not a strict requirement, i.e.
       *         custom dispatchers can follow a different strategy.
       * @param capture {Boolean} Whether to attach the event to the
       *       capturing phase or the bubbling phase of the event. The default is
       *       to attach the event handler to the bubbling phase.
       * @return {String} An opaque id, which can be used to remove the event listener
       *       using the {@link #removeListenerById} method.
       */
      addListener: function addListener(element, type, listener, self, capture) {
        return qx.event.Registration.addListener(element, type, listener, self, capture);
      },

      /**
       * Remove an event listener from a from DOM node.
       *
       * Note: All registered event listeners will automatically be removed from
       *   the DOM at page unload so it is not necessary to detach events yourself.
       *
       * @param element {Element} DOM Element
       * @param type {String} Name of the event
       * @param listener {Function} The pointer to the event listener
       * @param self {Object ? null} Reference to the 'this' variable inside
       *         the event listener.
       * @param capture {Boolean} Whether to remove the event listener of
       *       the bubbling or of the capturing phase.
       * @return {Boolean} <code>true</code> if the listener was removed
       */
      removeListener: function removeListener(element, type, listener, self, capture) {
        return qx.event.Registration.removeListener(element, type, listener, self, capture);
      },

      /**
       * Removes an event listener from an event target by an id returned by
       * {@link #addListener}
       *
       * @param target {Object} The event target
       * @param id {String} The id returned by {@link #addListener}
       * @return {Boolean} <code>true</code> if the listener was removed
       */
      removeListenerById: function removeListenerById(target, id) {
        return qx.event.Registration.removeListenerById(target, id);
      },

      /**
       * Check whether there are one or more listeners for an event type
       * registered at the element.
       *
       * @param element {Element} DOM element
       * @param type {String} The event type
       * @param capture {Boolean ? false} Whether to check for listeners of
       *       the bubbling or of the capturing phase.
       * @return {Boolean} Whether the element has event listeners of the given type.
       */
      hasListener: function hasListener(element, type, capture) {
        return qx.event.Registration.hasListener(element, type, capture);
      },

      /**
       * Focuses the given element. The element needs to have a positive <code>tabIndex</code> value.
       *
       * @param element {Element} DOM element to focus
       */
      focus: function focus(element) {
        qx.event.Registration.getManager(element).getHandler(qx.event.handler.Focus).focus(element);
      },

      /**
       * Blurs the given element
       *
       * @param element {Element} DOM element to blur
       */
      blur: function blur(element) {
        qx.event.Registration.getManager(element).getHandler(qx.event.handler.Focus).blur(element);
      },

      /**
       * Activates the given element. The active element receives all key board events.
       *
       * @param element {Element} DOM element to focus
       */
      activate: function activate(element) {
        qx.event.Registration.getManager(element).getHandler(qx.event.handler.Focus).activate(element);
      },

      /**
       * Deactivates the given element. The active element receives all key board events.
       *
       * @param element {Element} DOM element to focus
       */
      deactivate: function deactivate(element) {
        qx.event.Registration.getManager(element).getHandler(qx.event.handler.Focus).deactivate(element);
      },

      /**
       * Captures the given element
       *
       * @param element {Element} DOM element to capture
       * @param containerCapture {Boolean?true} If true all events originating in
       *   the container are captured. If false events originating in the container
       *   are not captured.
       */
      capture: function capture(element, containerCapture) {
        qx.event.Registration.getManager(element).getDispatcher(qx.event.dispatch.MouseCapture).activateCapture(element, containerCapture);
      },

      /**
       * Releases the given element (from a previous {@link #capture} call)
       *
       * @param element {Element} DOM element to release
       */
      releaseCapture: function releaseCapture(element) {
        qx.event.Registration.getManager(element).getDispatcher(qx.event.dispatch.MouseCapture).releaseCapture(element);
      },

      /*
      ---------------------------------------------------------------------------
        UTILS
      ---------------------------------------------------------------------------
      */

      /**
       * Clone given DOM element. May optionally clone all attached
       * events (recursively) as well.
       *
       * @param element {Element} Element to clone
       * @param events {Boolean?false} Whether events should be copied as well
       * @return {Element} The copied element
       */
      clone: function clone(element, events) {
        var clone;

        if (events || qx.core.Environment.get("engine.name") == "mshtml" && !qx.xml.Document.isXmlDocument(element)) {
          var mgr = qx.event.Registration.getManager(element);
          var all = qx.dom.Hierarchy.getDescendants(element);
          all.push(element);
        } // IE copies events bound via attachEvent() when
        // using cloneNode(). Calling detachEvent() on the
        // clone will also remove the events from the original.
        //
        // In order to get around this, we detach all locally
        // attached events first, do the cloning and recover
        // them afterwards again.


        if (qx.core.Environment.get("engine.name") == "mshtml") {
          for (var i = 0, l = all.length; i < l; i++) {
            mgr.toggleAttachedEvents(all[i], false);
          }
        } // Do the native cloning


        var clone = element.cloneNode(true); // Recover events on original elements

        if (qx.core.Environment.get("engine.name") == "mshtml") {
          for (var i = 0, l = all.length; i < l; i++) {
            mgr.toggleAttachedEvents(all[i], true);
          }
        } // Attach events from original element


        if (events === true) {
          // Produce recursive list of elements in the clone
          var cloneAll = qx.dom.Hierarchy.getDescendants(clone);
          cloneAll.push(clone); // Process all elements and copy over listeners

          var eventList, cloneElem, origElem, eventEntry;

          for (var i = 0, il = all.length; i < il; i++) {
            origElem = all[i];
            eventList = mgr.serializeListeners(origElem);

            if (eventList.length > 0) {
              cloneElem = cloneAll[i];

              for (var j = 0, jl = eventList.length; j < jl; j++) {
                eventEntry = eventList[j];
                mgr.addListener(cloneElem, eventEntry.type, eventEntry.handler, eventEntry.self, eventEntry.capture);
              }
            }
          }
        } // Finally return the clone


        return clone;
      }
    }
  });
  qx.bom.Element.$$dbClassInfo = $$dbClassInfo;
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
      "qx.dom.Node": {},
      "qx.bom.client.Html": {
        "require": true
      },
      "qx.lang.Array": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "html.element.contains": {
          "className": "qx.bom.client.Html"
        },
        "html.element.compareDocumentPosition": {
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
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Prototype JS
       http://www.prototypejs.org/
       Version 1.5
  
       Copyright:
         (c) 2006-2007, Prototype Core Team
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
       Authors:
         * Prototype Core Team
  
     ----------------------------------------------------------------------
  
       Copyright (c) 2005-2008 Sam Stephenson
  
       Permission is hereby granted, free of charge, to any person
       obtaining a copy of this software and associated documentation
       files (the "Software"), to deal in the Software without restriction,
       including without limitation the rights to use, copy, modify, merge,
       publish, distribute, sublicense, and/or sell copies of the Software,
       and to permit persons to whom the Software is furnished to do so,
       subject to the following conditions:
  
       THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
       EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
       MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
       NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
       HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
       WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
       OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
       DEALINGS IN THE SOFTWARE.
  
  ************************************************************************ */

  /**
   * Methods to operate on nodes and elements on a DOM tree. This contains
   * special getters to query for child nodes, siblings, etc. This class also
   * supports to operate on one element and reorganize the content with
   * the insertion of new HTML or nodes.
   */
  qx.Bootstrap.define("qx.dom.Hierarchy", {
    statics: {
      /**
       * Returns the DOM index of the given node
       *
       * @param node {Node} Node to look for
       * @return {Integer} The DOM index
       */
      getNodeIndex: function getNodeIndex(node) {
        var index = 0;

        while (node && (node = node.previousSibling)) {
          index++;
        }

        return index;
      },

      /**
       * Returns the DOM index of the given element (ignoring non-elements)
       *
       * @param element {Element} Element to look for
       * @return {Integer} The DOM index
       */
      getElementIndex: function getElementIndex(element) {
        var index = 0;
        var type = qx.dom.Node.ELEMENT;

        while (element && (element = element.previousSibling)) {
          if (element.nodeType == type) {
            index++;
          }
        }

        return index;
      },

      /**
       * Return the next element to the supplied element
       *
       * "nextSibling" is not good enough as it might return a text or comment element
       *
       * @param element {Element} Starting element node
       * @return {Element | null} Next element node
       */
      getNextElementSibling: function getNextElementSibling(element) {
        while (element && (element = element.nextSibling) && !qx.dom.Node.isElement(element)) {
          continue;
        }

        return element || null;
      },

      /**
       * Return the previous element to the supplied element
       *
       * "previousSibling" is not good enough as it might return a text or comment element
       *
       * @param element {Element} Starting element node
       * @return {Element | null} Previous element node
       */
      getPreviousElementSibling: function getPreviousElementSibling(element) {
        while (element && (element = element.previousSibling) && !qx.dom.Node.isElement(element)) {
          continue;
        }

        return element || null;
      },

      /**
       * Whether the first element contains the second one
       *
       * Uses native non-standard contains() in Internet Explorer,
       * Opera and Webkit (supported since Safari 3.0 beta)
       *
       * @param element {Element} Parent element
       * @param target {Node} Child node
       * @return {Boolean}
       */
      contains: function contains(element, target) {
        if (qx.core.Environment.get("html.element.contains")) {
          if (qx.dom.Node.isDocument(element)) {
            var doc = qx.dom.Node.getDocument(target);
            return element && doc == element;
          } else if (qx.dom.Node.isDocument(target)) {
            return false;
          } else {
            return element.contains(target);
          }
        } else if (qx.core.Environment.get("html.element.compareDocumentPosition")) {
          // https://developer.mozilla.org/en-US/docs/DOM:Node.compareDocumentPosition
          return !!(element.compareDocumentPosition(target) & 16);
        } else {
          while (target) {
            if (element == target) {
              return true;
            }

            target = target.parentNode;
          }

          return false;
        }
      },

      /**
       * Whether the element is inserted into the document
       * for which it was created.
       *
       * @param element {Element} DOM element to check
       * @return {Boolean} <code>true</code> when the element is inserted
       *    into the document.
       */
      isRendered: function isRendered(element) {
        var doc = element.ownerDocument || element.document;

        if (qx.core.Environment.get("html.element.contains")) {
          // Fast check for all elements which are not in the DOM
          if (!element.parentNode) {
            return false;
          }

          return doc.body.contains(element);
        } else if (qx.core.Environment.get("html.element.compareDocumentPosition")) {
          // Gecko way, DOM3 method
          return !!(doc.compareDocumentPosition(element) & 16);
        } else {
          while (element) {
            if (element == doc.body) {
              return true;
            }

            element = element.parentNode;
          }

          return false;
        }
      },

      /**
       * Checks if <code>element</code> is a descendant of <code>ancestor</code>.
       *
       * @param element {Element} first element
       * @param ancestor {Element} second element
       * @return {Boolean} Element is a descendant of ancestor
       */
      isDescendantOf: function isDescendantOf(element, ancestor) {
        return this.contains(ancestor, element);
      },

      /**
       * Get the common parent element of two given elements. Returns
       * <code>null</code> when no common element has been found.
       *
       * Uses native non-standard contains() in Opera and Internet Explorer
       *
       * @param element1 {Element} First element
       * @param element2 {Element} Second element
       * @return {Element} the found parent, if none was found <code>null</code>
       */
      getCommonParent: function getCommonParent(element1, element2) {
        if (element1 === element2) {
          return element1;
        }

        if (qx.core.Environment.get("html.element.contains")) {
          while (element1 && qx.dom.Node.isElement(element1)) {
            if (element1.contains(element2)) {
              return element1;
            }

            element1 = element1.parentNode;
          }

          return null;
        } else {
          var known = [];

          while (element1 || element2) {
            if (element1) {
              if (known.includes(element1)) {
                return element1;
              }

              known.push(element1);
              element1 = element1.parentNode;
            }

            if (element2) {
              if (known.includes(element2)) {
                return element2;
              }

              known.push(element2);
              element2 = element2.parentNode;
            }
          }

          return null;
        }
      },

      /**
       * Collects all of element's ancestors and returns them as an array of
       * elements.
       *
       * @param element {Element} DOM element to query for ancestors
       * @return {Array} list of all parents
       */
      getAncestors: function getAncestors(element) {
        return this._recursivelyCollect(element, "parentNode");
      },

      /**
       * Returns element's children.
       *
       * @param element {Element} DOM element to query for child elements
       * @return {Array} list of all child elements
       */
      getChildElements: function getChildElements(element) {
        element = element.firstChild;

        if (!element) {
          return [];
        }

        var arr = this.getNextSiblings(element);

        if (element.nodeType === 1) {
          arr.unshift(element);
        }

        return arr;
      },

      /**
       * Collects all of element's descendants (deep) and returns them as an array
       * of elements.
       *
       * @param element {Element} DOM element to query for child elements
       * @return {Array} list of all found elements
       */
      getDescendants: function getDescendants(element) {
        return qx.lang.Array.fromCollection(element.getElementsByTagName("*"));
      },

      /**
       * Returns the first child that is an element. This is opposed to firstChild DOM
       * property which will return any node (whitespace in most usual cases).
       *
       * @param element {Element} DOM element to query for first descendant
       * @return {Element} the first descendant
       */
      getFirstDescendant: function getFirstDescendant(element) {
        element = element.firstChild;

        while (element && element.nodeType != 1) {
          element = element.nextSibling;
        }

        return element;
      },

      /**
       * Returns the last child that is an element. This is opposed to lastChild DOM
       * property which will return any node (whitespace in most usual cases).
       *
       * @param element {Element} DOM element to query for last descendant
       * @return {Element} the last descendant
       */
      getLastDescendant: function getLastDescendant(element) {
        element = element.lastChild;

        while (element && element.nodeType != 1) {
          element = element.previousSibling;
        }

        return element;
      },

      /**
       * Collects all of element's previous siblings and returns them as an array of elements.
       *
       * @param element {Element} DOM element to query for previous siblings
       * @return {Array} list of found DOM elements
       */
      getPreviousSiblings: function getPreviousSiblings(element) {
        return this._recursivelyCollect(element, "previousSibling");
      },

      /**
       * Collects all of element's next siblings and returns them as an array of
       * elements.
       *
       * @param element {Element} DOM element to query for next siblings
       * @return {Array} list of found DOM elements
       */
      getNextSiblings: function getNextSiblings(element) {
        return this._recursivelyCollect(element, "nextSibling");
      },

      /**
       * Recursively collects elements whose relationship is specified by
       * property.  <code>property</code> has to be a property (a method won't
       * do!) of element that points to a single DOM node. Returns an array of
       * elements.
       *
       * @param element {Element} DOM element to start with
       * @param property {String} property to look for
       * @return {Array} result list
       */
      _recursivelyCollect: function _recursivelyCollect(element, property) {
        var list = [];

        while (element = element[property]) {
          if (element.nodeType == 1) {
            list.push(element);
          }
        }

        return list;
      },

      /**
       * Collects all of element's siblings and returns them as an array of elements.
       *
       * @param element {var} DOM element to start with
       * @return {Array} list of all found siblings
       */
      getSiblings: function getSiblings(element) {
        return this.getPreviousSiblings(element).reverse().concat(this.getNextSiblings(element));
      },

      /**
       * Whether the given element is empty.
       * Inspired by Base2 (Dean Edwards)
       *
       * @param element {Element} The element to check
       * @return {Boolean} true when the element is empty
       */
      isEmpty: function isEmpty(element) {
        element = element.firstChild;

        while (element) {
          if (element.nodeType === qx.dom.Node.ELEMENT || element.nodeType === qx.dom.Node.TEXT) {
            return false;
          }

          element = element.nextSibling;
        }

        return true;
      },

      /**
       * Removes all of element's text nodes which contain only whitespace
       *
       * @param element {Element} Element to cleanup
       */
      cleanWhitespace: function cleanWhitespace(element) {
        var node = element.firstChild;

        while (node) {
          var nextNode = node.nextSibling;

          if (node.nodeType == 3 && !/\S/.test(node.nodeValue)) {
            element.removeChild(node);
          }

          node = nextNode;
        }
      }
    }
  });
  qx.dom.Hierarchy.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.element.Style": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.dom.Node": {},
      "qx.bom.Viewport": {},
      "qx.bom.element.Location": {},
      "qx.event.Registration": {}
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
  
  ************************************************************************ */

  /**
   * Contains methods to control and query the element's scroll properties
   */
  qx.Class.define("qx.bom.element.Scroll", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Integer} The typical native scrollbar size in the environment */
      __scrollbarSize__P_143_0: null,

      /**
       * Get the typical native scrollbar size in the environment
       *
       * @return {Number} The native scrollbar size
       */
      getScrollbarWidth: function getScrollbarWidth() {
        if (this.__scrollbarSize__P_143_0 !== null) {
          return this.__scrollbarSize__P_143_0;
        }

        var Style = qx.bom.element.Style;

        var getStyleSize = function getStyleSize(el, propertyName) {
          return parseInt(Style.get(el, propertyName), 10) || 0;
        };

        var getBorderRight = function getBorderRight(el) {
          return Style.get(el, "borderRightStyle") == "none" ? 0 : getStyleSize(el, "borderRightWidth");
        };

        var getBorderLeft = function getBorderLeft(el) {
          return Style.get(el, "borderLeftStyle") == "none" ? 0 : getStyleSize(el, "borderLeftWidth");
        };

        var getInsetRight = qx.core.Environment.select("engine.name", {
          mshtml: function mshtml(el) {
            if (Style.get(el, "overflowY") == "hidden" || el.clientWidth == 0) {
              return getBorderRight(el);
            }

            return Math.max(0, el.offsetWidth - el.clientLeft - el.clientWidth);
          },
          "default": function _default(el) {
            // Alternative method if clientWidth is unavailable
            // clientWidth == 0 could mean both: unavailable or really 0
            if (el.clientWidth == 0) {
              var ov = Style.get(el, "overflow");
              var sbv = ov == "scroll" || ov == "-moz-scrollbars-vertical" ? 16 : 0;
              return Math.max(0, getBorderRight(el) + sbv);
            }

            return Math.max(0, el.offsetWidth - el.clientWidth - getBorderLeft(el));
          }
        });

        var getScrollBarSizeRight = function getScrollBarSizeRight(el) {
          return getInsetRight(el) - getBorderRight(el);
        };

        var t = document.createElement("div");
        var s = t.style;
        s.height = s.width = "100px";
        s.overflow = "scroll";
        document.body.appendChild(t);
        var c = getScrollBarSizeRight(t);
        this.__scrollbarSize__P_143_0 = c;
        document.body.removeChild(t);
        return this.__scrollbarSize__P_143_0;
      },

      /*
      ---------------------------------------------------------------------------
        SCROLL INTO VIEW
      ---------------------------------------------------------------------------
      */

      /**
       * The method scrolls the element into view (x-axis only).
       *
       * @param element {Element} DOM element to scroll into view
       * @param stop {Element?null} Any parent element which functions as
       *   outermost element to scroll. Default is the HTML document.
       * @param align {String?null} Alignment of the element. Allowed values:
       *   <code>left</code> or <code>right</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       */
      intoViewX: function intoViewX(element, stop, align) {
        var parent = element.parentNode;
        var doc = qx.dom.Node.getDocument(element);
        var body = doc.body;
        var parentLocation, parentLeft, parentRight;
        var parentOuterWidth, parentClientWidth, parentScrollWidth;
        var parentLeftBorder, parentRightBorder, parentScrollBarWidth;
        var elementLocation, elementLeft, elementRight, elementWidth;
        var leftOffset, rightOffset, scrollDiff;
        var alignLeft = align === "left";
        var alignRight = align === "right"; // Correcting stop position

        stop = stop ? stop.parentNode : doc; // Go up the parent chain

        while (parent && parent != stop) {
          // "overflow" is always visible for both: document.body and document.documentElement
          if (parent.scrollWidth > parent.clientWidth && (parent === body || qx.bom.element.Style.get(parent, "overflowY") != "visible")) {
            // Calculate parent data
            // Special handling for body element
            if (parent === body) {
              parentLeft = parent.scrollLeft;
              parentRight = parentLeft + qx.bom.Viewport.getWidth();
              parentOuterWidth = qx.bom.Viewport.getWidth();
              parentClientWidth = parent.clientWidth;
              parentScrollWidth = parent.scrollWidth;
              parentLeftBorder = 0;
              parentRightBorder = 0;
              parentScrollBarWidth = 0;
            } else {
              parentLocation = qx.bom.element.Location.get(parent);
              parentLeft = parentLocation.left;
              parentRight = parentLocation.right;
              parentOuterWidth = parent.offsetWidth;
              parentClientWidth = parent.clientWidth;
              parentScrollWidth = parent.scrollWidth;
              parentLeftBorder = parseInt(qx.bom.element.Style.get(parent, "borderLeftWidth"), 10) || 0;
              parentRightBorder = parseInt(qx.bom.element.Style.get(parent, "borderRightWidth"), 10) || 0;
              parentScrollBarWidth = parentOuterWidth - parentClientWidth - parentLeftBorder - parentRightBorder;
            } // Calculate element data


            elementLocation = qx.bom.element.Location.get(element);
            elementLeft = elementLocation.left;
            elementRight = elementLocation.right;
            elementWidth = element.offsetWidth; // Relative position from each other

            leftOffset = elementLeft - parentLeft - parentLeftBorder;
            rightOffset = elementRight - parentRight + parentRightBorder; // Scroll position rearrangement

            scrollDiff = 0; // be sure that element is on left edge

            if (alignLeft) {
              scrollDiff = leftOffset;
            } // be sure that element is on right edge
            else if (alignRight) {
              scrollDiff = rightOffset + parentScrollBarWidth;
            } // element must go down
            // * when current left offset is smaller than 0
            // * when width is bigger than the inner width of the parent
            else if (leftOffset < 0 || elementWidth > parentClientWidth) {
              scrollDiff = leftOffset;
            } // element must go up
            // * when current right offset is bigger than 0
            else if (rightOffset > 0) {
              scrollDiff = rightOffset + parentScrollBarWidth;
            }

            parent.scrollLeft += scrollDiff; // Browsers that follow the CSSOM View Spec fire the "scroll"
            // event asynchronously. See #intoViewY for more details.

            qx.event.Registration.fireNonBubblingEvent(parent, "scroll");
          }

          if (parent === body) {
            break;
          }

          parent = parent.parentNode;
        }
      },

      /**
       * The method scrolls the element into view (y-axis only).
       *
       * @param element {Element} DOM element to scroll into view
       * @param stop {Element?null} Any parent element which functions as
       *   outermost element to scroll. Default is the HTML document.
       * @param align {String?null} Alignment of the element. Allowed values:
       *   <code>top</code> or <code>bottom</code>. Could also be null.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       */
      intoViewY: function intoViewY(element, stop, align) {
        var parent = element.parentNode;
        var doc = qx.dom.Node.getDocument(element);
        var body = doc.body;
        var parentLocation, parentTop, parentBottom;
        var parentOuterHeight, parentClientHeight, parentScrollHeight;
        var parentTopBorder, parentBottomBorder, parentScrollBarHeight;
        var elementLocation, elementTop, elementBottom, elementHeight;
        var topOffset, bottomOffset, scrollDiff;
        var alignTop = align === "top";
        var alignBottom = align === "bottom"; // Correcting stop position

        stop = stop ? stop.parentNode : doc; // Go up the parent chain

        while (parent && parent != stop) {
          // "overflow" is always visible for both: document.body and document.documentElement
          if (parent.scrollHeight > parent.clientHeight && (parent === body || qx.bom.element.Style.get(parent, "overflowY") != "visible")) {
            // Calculate parent data
            // Special handling for body element
            if (parent === body) {
              parentTop = parent.scrollTop;
              parentBottom = parentTop + qx.bom.Viewport.getHeight();
              parentOuterHeight = qx.bom.Viewport.getHeight();
              parentClientHeight = parent.clientHeight;
              parentScrollHeight = parent.scrollHeight;
              parentTopBorder = 0;
              parentBottomBorder = 0;
              parentScrollBarHeight = 0;
            } else {
              parentLocation = qx.bom.element.Location.get(parent);
              parentTop = parentLocation.top;
              parentBottom = parentLocation.bottom;
              parentOuterHeight = parent.offsetHeight;
              parentClientHeight = parent.clientHeight;
              parentScrollHeight = parent.scrollHeight;
              parentTopBorder = parseInt(qx.bom.element.Style.get(parent, "borderTopWidth"), 10) || 0;
              parentBottomBorder = parseInt(qx.bom.element.Style.get(parent, "borderBottomWidth"), 10) || 0;
              parentScrollBarHeight = parentOuterHeight - parentClientHeight - parentTopBorder - parentBottomBorder;
            } // Calculate element data


            elementLocation = qx.bom.element.Location.get(element);
            elementTop = elementLocation.top;
            elementBottom = elementLocation.bottom;
            elementHeight = element.offsetHeight; // Relative position from each other

            topOffset = elementTop - parentTop - parentTopBorder;
            bottomOffset = elementBottom - parentBottom + parentBottomBorder; // Scroll position rearrangement

            scrollDiff = 0; // be sure that element is on top edge

            if (alignTop) {
              scrollDiff = topOffset;
            } // be sure that element is on bottom edge
            else if (alignBottom) {
              scrollDiff = bottomOffset + parentScrollBarHeight;
            } // element must go down
            // * when current top offset is smaller than 0
            // * when height is bigger than the inner height of the parent
            else if (topOffset < 0 || elementHeight > parentClientHeight) {
              scrollDiff = topOffset;
            } // element must go up
            // * when current bottom offset is bigger than 0
            else if (bottomOffset > 0) {
              scrollDiff = bottomOffset + parentScrollBarHeight;
            }

            parent.scrollTop += scrollDiff; // Browsers that follow the CSSOM View Spec fire the "scroll"
            // event asynchronously.
            //
            // The widget layer expects the "scroll" event to be fired before
            // the "appear" event. Fire non-bubbling "scroll" in all browsers,
            // since a duplicate "scroll" should not cause any issues and it
            // is hard to track which version of the browser engine started to
            // follow the CSSOM Spec. Fixes [BUG #4570].

            qx.event.Registration.fireNonBubblingEvent(parent, "scroll");
          }

          if (parent === body) {
            break;
          }

          parent = parent.parentNode;
        }
      },

      /**
       * The method scrolls the element into view.
       *
       * @param element {Element} DOM element to scroll into view
       * @param stop {Element?null} Any parent element which functions as
       *   outermost element to scroll. Default is the HTML document.
       * @param alignX {String} Alignment of the element. Allowed values:
       *   <code>left</code> or <code>right</code>. Could also be undefined.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       * @param alignY {String} Alignment of the element. Allowed values:
       *   <code>top</code> or <code>bottom</code>. Could also be undefined.
       *   Without a given alignment the method tries to scroll the widget
       *   with the minimum effort needed.
       */
      intoView: function intoView(element, stop, alignX, alignY) {
        this.intoViewX(element, stop, alignX);
        this.intoViewY(element, stop, alignY);
      }
    }
  });
  qx.bom.element.Scroll.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Html": {
        "require": true
      },
      "qx.dom.Node": {},
      "qx.bom.Range": {},
      "qx.util.StringSplit": {},
      "qx.bom.client.Engine": {
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "html.selection": {
          "load": true,
          "className": "qx.bom.client.Html"
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
       * Alexander Steitz (aback)
  
  ************************************************************************ */

  /**
   * Low-level selection API to select elements like input and textarea elements
   * as well as text nodes or elements which their child nodes.
   *
   * @ignore(qx.bom.Element, qx.bom.Element.blur)
   */
  qx.Bootstrap.define("qx.bom.Selection", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Returns the native selection object.
       *
       * @signature function(documentNode)
       * @param documentNode {document} Document node to retrieve the connected selection from
       * @return {Selection} native selection object
       */
      getSelectionObject: qx.core.Environment.select("html.selection", {
        selection: function selection(documentNode) {
          return documentNode.selection;
        },
        // suitable for gecko, opera, webkit and mshtml >= 9
        "default": function _default(documentNode) {
          return qx.dom.Node.getWindow(documentNode).getSelection();
        }
      }),

      /**
       * Returns the current selected text.
       *
       * @signature function(node)
       * @param node {Node} node to retrieve the selection for
       * @return {String|null} selected text as string
       */
      get: qx.core.Environment.select("html.selection", {
        selection: function selection(node) {
          // to get the selected text in legacy IE you have to work with the TextRange
          // of the selection object. So always pass the document node to the
          // Range class to get this TextRange object.
          var rng = qx.bom.Range.get(qx.dom.Node.getDocument(node));
          return rng.text;
        },
        // suitable for gecko, opera and webkit
        "default": function _default(node) {
          if (this.__isInputOrTextarea__P_112_0(node)) {
            return node.value.substring(node.selectionStart, node.selectionEnd);
          } else {
            return this.getSelectionObject(qx.dom.Node.getDocument(node)).toString();
          }
        }
      }),

      /**
       * Returns the length of the selection
       *
       * @signature function(node)
       * @param node {Node} Form node or document/window to check.
       * @return {Integer|null} length of the selection or null
       */
      getLength: qx.core.Environment.select("html.selection", {
        selection: function selection(node) {
          var selectedValue = this.get(node); // get the selected part and split it by linebreaks

          var split = qx.util.StringSplit.split(selectedValue, /\r\n/); // return the length substracted by the count of linebreaks
          // legacy IE counts linebreaks as two chars
          // -> harmonize this to one char per linebreak

          return selectedValue.length - (split.length - 1);
        },
        "default": function _default(node) {
          if (qx.core.Environment.get("engine.name") == "opera") {
            var selectedValue, selectedLength, split;

            if (this.__isInputOrTextarea__P_112_0(node)) {
              var start = node.selectionStart;
              var end = node.selectionEnd;
              selectedValue = node.value.substring(start, end);
              selectedLength = end - start;
            } else {
              selectedValue = qx.bom.Selection.get(node);
              selectedLength = selectedValue.length;
            } // get the selected part and split it by linebreaks


            split = qx.util.StringSplit.split(selectedValue, /\r\n/); // substract the count of linebreaks
            // Opera counts each linebreak as two chars
            // -> harmonize this to one char per linebreak

            return selectedLength - (split.length - 1);
          } // suitable for gecko and webkit


          if (this.__isInputOrTextarea__P_112_0(node)) {
            return node.selectionEnd - node.selectionStart;
          } else {
            return this.get(node).length;
          }
        }
      }),

      /**
       * Returns the start of the selection
       *
       * @signature function(node)
       * @param node {Node} node to check for
       * @return {Integer} start of current selection or "-1" if the current
       *                   selection is not within the given node
       */
      getStart: qx.core.Environment.select("html.selection", {
        selection: function selection(node) {
          if (this.__isInputOrTextarea__P_112_0(node)) {
            var documentRange = qx.bom.Range.get(); // Check if the document.selection is the text range inside the input element

            if (!node.contains(documentRange.parentElement())) {
              return -1;
            }

            var range = qx.bom.Range.get(node);
            var len = node.value.length; // Synchronize range start and end points

            range.moveToBookmark(documentRange.getBookmark());
            range.moveEnd("character", len);
            return len - range.text.length;
          } else {
            var range = qx.bom.Range.get(node);
            var parentElement = range.parentElement(); // get a range which holds the text of the parent element

            var elementRange = qx.bom.Range.get();

            try {
              // IE throws an invalid argument error when the document has no selection
              elementRange.moveToElementText(parentElement);
            } catch (ex) {
              return 0;
            } // Move end points of full range so it starts at the user selection
            // and ends at the end of the element text.


            var bodyRange = qx.bom.Range.get(qx.dom.Node.getBodyElement(node));
            bodyRange.setEndPoint("StartToStart", range);
            bodyRange.setEndPoint("EndToEnd", elementRange); // selection is at beginning

            if (elementRange.compareEndPoints("StartToStart", bodyRange) == 0) {
              return 0;
            }

            var moved;
            var steps = 0;

            while (true) {
              moved = bodyRange.moveStart("character", -1); // Starting points of both ranges are equal

              if (elementRange.compareEndPoints("StartToStart", bodyRange) == 0) {
                break;
              } // Moving had no effect -> range is at begin of body


              if (moved == 0) {
                break;
              } else {
                steps++;
              }
            }

            return ++steps;
          }
        },
        "default": function _default(node) {
          if (qx.core.Environment.get("engine.name") === "gecko" || qx.core.Environment.get("engine.name") === "webkit") {
            if (this.__isInputOrTextarea__P_112_0(node)) {
              return node.selectionStart;
            } else {
              var documentElement = qx.dom.Node.getDocument(node);
              var documentSelection = this.getSelectionObject(documentElement); // gecko and webkit do differ how the user selected the text
              // "left-to-right" or "right-to-left"

              if (documentSelection.anchorOffset < documentSelection.focusOffset) {
                return documentSelection.anchorOffset;
              } else {
                return documentSelection.focusOffset;
              }
            }
          }

          if (this.__isInputOrTextarea__P_112_0(node)) {
            return node.selectionStart;
          } else {
            return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node)).anchorOffset;
          }
        }
      }),

      /**
       * Returns the end of the selection
       *
       * @signature function(node)
       * @param node {Node} node to check
       * @return {Integer} end of current selection
       */
      getEnd: qx.core.Environment.select("html.selection", {
        selection: function selection(node) {
          if (this.__isInputOrTextarea__P_112_0(node)) {
            var documentRange = qx.bom.Range.get(); // Check if the document.selection is the text range inside the input element

            if (!node.contains(documentRange.parentElement())) {
              return -1;
            }

            var range = qx.bom.Range.get(node);
            var len = node.value.length; // Synchronize range start and end points

            range.moveToBookmark(documentRange.getBookmark());
            range.moveStart("character", -len);
            return range.text.length;
          } else {
            var range = qx.bom.Range.get(node);
            var parentElement = range.parentElement(); // get a range which holds the text of the parent element

            var elementRange = qx.bom.Range.get();

            try {
              // IE throws an invalid argument error when the document has no selection
              elementRange.moveToElementText(parentElement);
            } catch (ex) {
              return 0;
            }

            var len = elementRange.text.length; // Move end points of full range so it ends at the user selection
            // and starts at the start of the element text.

            var bodyRange = qx.bom.Range.get(qx.dom.Node.getBodyElement(node));
            bodyRange.setEndPoint("EndToEnd", range);
            bodyRange.setEndPoint("StartToStart", elementRange); // selection is at beginning

            if (elementRange.compareEndPoints("EndToEnd", bodyRange) == 0) {
              return len - 1;
            }

            var moved;
            var steps = 0;

            while (true) {
              moved = bodyRange.moveEnd("character", 1); // Ending points of both ranges are equal

              if (elementRange.compareEndPoints("EndToEnd", bodyRange) == 0) {
                break;
              } // Moving had no effect -> range is at begin of body


              if (moved == 0) {
                break;
              } else {
                steps++;
              }
            }

            return len - ++steps;
          }
        },
        "default": function _default(node) {
          if (qx.core.Environment.get("engine.name") === "gecko" || qx.core.Environment.get("engine.name") === "webkit") {
            if (this.__isInputOrTextarea__P_112_0(node)) {
              return node.selectionEnd;
            } else {
              var documentElement = qx.dom.Node.getDocument(node);
              var documentSelection = this.getSelectionObject(documentElement); // gecko and webkit do differ how the user selected the text
              // "left-to-right" or "right-to-left"

              if (documentSelection.focusOffset > documentSelection.anchorOffset) {
                return documentSelection.focusOffset;
              } else {
                return documentSelection.anchorOffset;
              }
            }
          }

          if (this.__isInputOrTextarea__P_112_0(node)) {
            return node.selectionEnd;
          } else {
            return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node)).focusOffset;
          }
        }
      }),

      /**
       * Utility method to check for an input or textarea element
       *
       * @param node {Node} node to check
       * @return {Boolean} Whether the given node is an input or textarea element
       */
      __isInputOrTextarea__P_112_0: function __isInputOrTextarea__P_112_0(node) {
        return qx.dom.Node.isElement(node) && (node.nodeName.toLowerCase() == "input" || node.nodeName.toLowerCase() == "textarea");
      },

      /**
       * Sets a selection at the given node with the given start and end.
       * For text nodes, input and textarea elements the start and end parameters
       * set the boundaries at the text.
       * For element nodes the start and end parameters are used to select the
       * childNodes of the given element.
       *
       * @signature function(node, start, end)
       * @param node {Node} node to set the selection at
       * @param start {Integer} start of the selection
       * @param end {Integer} end of the selection
       * @return {Boolean} whether a selection is drawn
       */
      set: qx.core.Environment.select("html.selection", {
        selection: function selection(node, start, end) {
          var rng; // if the node is the document itself then work on with the body element

          if (qx.dom.Node.isDocument(node)) {
            node = node.body;
          }

          if (qx.dom.Node.isElement(node) || qx.dom.Node.isText(node)) {
            switch (node.nodeName.toLowerCase()) {
              case "input":
              case "textarea":
              case "button":
                if (end === undefined) {
                  end = node.value.length;
                }

                if (start >= 0 && start <= node.value.length && end >= 0 && end <= node.value.length) {
                  rng = qx.bom.Range.get(node);
                  rng.collapse(true);
                  rng.moveStart("character", start);
                  rng.moveEnd("character", end - start);
                  rng.select();
                  return true;
                }

                break;

              case "#text":
                if (end === undefined) {
                  end = node.nodeValue.length;
                }

                if (start >= 0 && start <= node.nodeValue.length && end >= 0 && end <= node.nodeValue.length) {
                  // get a range of the body element
                  rng = qx.bom.Range.get(qx.dom.Node.getBodyElement(node)); // use the parent node -> "moveToElementText" expects an element

                  rng.moveToElementText(node.parentNode);
                  rng.collapse(true);
                  rng.moveStart("character", start);
                  rng.moveEnd("character", end - start);
                  rng.select();
                  return true;
                }

                break;

              default:
                if (end === undefined) {
                  end = node.childNodes.length - 1;
                } // check start and end -> childNodes


                if (node.childNodes[start] && node.childNodes[end]) {
                  // get the TextRange of the body element
                  // IMPORTANT: only with a range of the body the method "moveElementToText" is available
                  rng = qx.bom.Range.get(qx.dom.Node.getBodyElement(node)); // position it at the given node

                  rng.moveToElementText(node.childNodes[start]);
                  rng.collapse(true); // create helper range

                  var newRng = qx.bom.Range.get(qx.dom.Node.getBodyElement(node));
                  newRng.moveToElementText(node.childNodes[end]); // set the end of the range to the end of the helper range

                  rng.setEndPoint("EndToEnd", newRng);
                  rng.select();
                  return true;
                }

            }
          }

          return false;
        },
        // suitable for gecko, opera, webkit and mshtml >=9
        "default": function _default(node, start, end) {
          // special handling for input and textarea elements
          var nodeName = node.nodeName.toLowerCase();

          if (qx.dom.Node.isElement(node) && (nodeName == "input" || nodeName == "textarea")) {
            // if "end" is not given set it to the end
            if (end === undefined) {
              end = node.value.length;
            } // check boundaries


            if (start >= 0 && start <= node.value.length && end >= 0 && end <= node.value.length) {
              node.focus();
              node.select(); // IE can throw "Unspecified error"

              try {
                node.setSelectionRange(start, end);
              } catch (ex) {}

              return true;
            }
          } else {
            var validBoundaries = false;
            var sel = qx.dom.Node.getWindow(node).getSelection();
            var rng = qx.bom.Range.get(node); // element or text node?
            // for elements nodes the offsets are applied to childNodes
            // for text nodes the offsets are applied to the text content

            if (qx.dom.Node.isText(node)) {
              if (end === undefined) {
                end = node.length;
              }

              if (start >= 0 && start < node.length && end >= 0 && end <= node.length) {
                validBoundaries = true;
              }
            } else if (qx.dom.Node.isElement(node)) {
              if (end === undefined) {
                end = node.childNodes.length - 1;
              }

              if (start >= 0 && node.childNodes[start] && end >= 0 && node.childNodes[end]) {
                validBoundaries = true;
              }
            } else if (qx.dom.Node.isDocument(node)) {
              // work on with the body element
              node = node.body;

              if (end === undefined) {
                end = node.childNodes.length - 1;
              }

              if (start >= 0 && node.childNodes[start] && end >= 0 && node.childNodes[end]) {
                validBoundaries = true;
              }
            }

            if (validBoundaries) {
              // collapse the selection if needed
              if (!sel.isCollapsed) {
                sel.collapseToStart();
              } // set start and end of the range


              rng.setStart(node, start); // for element nodes set the end after the childNode

              if (qx.dom.Node.isText(node)) {
                rng.setEnd(node, end);
              } else {
                rng.setEndAfter(node.childNodes[end]);
              } // remove all existing ranges and add the new one


              if (sel.rangeCount > 0) {
                sel.removeAllRanges();
              }

              sel.addRange(rng);
              return true;
            }
          }

          return false;
        }
      }),

      /**
       * Selects all content/childNodes of the given node
       *
       * @param node {Node} text, element or document node
       * @return {Boolean} whether a selection is drawn
       */
      setAll: function setAll(node) {
        return qx.bom.Selection.set(node, 0);
      },

      /**
       * Clears the selection on the given node.
       *
       * @param node {Node} node to clear the selection for
       */
      clear: qx.core.Environment.select("html.selection", {
        selection: function selection(node) {
          var rng = qx.bom.Range.get(node);
          var parent = rng.parentElement();
          var documentRange = qx.bom.Range.get(qx.dom.Node.getDocument(node)); // only collapse if the selection is really on the given node
          // -> compare the two parent elements of the ranges with each other and
          // the given node

          if (qx.dom.Node.isText(node)) {
            node = node.parentNode;
          }

          if (parent == documentRange.parentElement() && parent == node) {
            var sel = qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node));
            sel.empty();
          }
        },
        "default": function _default(node) {
          var sel = qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node));
          var nodeName = node.nodeName.toLowerCase(); // if the node is an input or textarea element use the specialized methods

          if (qx.dom.Node.isElement(node) && (nodeName == "input" || nodeName == "textarea")) {
            // IE can throw "Unspecified error"
            try {
              node.setSelectionRange(0, 0);
            } catch (ex) {}

            if (qx.bom.Element && qx.bom.Element.blur) {
              qx.bom.Element.blur(node);
            }
          } // if the given node is the body/document node -> collapse the selection
          else if (qx.dom.Node.isDocument(node) || nodeName == "body") {
            sel.collapse(node.body ? node.body : node, 0);
          } // if an element/text node is given the current selection has to
          // encompass the node. Only then the selection is cleared.
          else {
            var rng = qx.bom.Range.get(node);

            if (!rng.collapsed) {
              var compareNode;
              var commonAncestor = rng.commonAncestorContainer; // compare the parentNode of the textNode with the given node
              // (if this node is an element) to decide whether the selection
              // is cleared or not.

              if (qx.dom.Node.isElement(node) && qx.dom.Node.isText(commonAncestor)) {
                compareNode = commonAncestor.parentNode;
              } else {
                compareNode = commonAncestor;
              }

              if (compareNode == node) {
                sel.collapse(node, 0);
              }
            }
          }
        }
      })
    }
  });
  qx.bom.Selection.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.dispatch.DomBubbling": {
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
      "qx.bom.client.OperatingSystem": {
        "construct": true,
        "require": true
      },
      "qx.core.Init": {
        "construct": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.Selection": {},
      "qx.event.type.Focus": {},
      "qx.lang.Function": {},
      "qx.bom.Event": {},
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.event.GlobalError": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {},
      "qx.bom.element.Attribute": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "construct": true,
          "className": "qx.bom.client.OperatingSystem"
        },
        "os.version": {
          "construct": true,
          "className": "qx.bom.client.OperatingSystem"
        },
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "browser.name": {
          "load": true,
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
       2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This handler is used to normalize all focus/activation requirements
   * and normalize all cross browser quirks in this area.
   *
   * Notes:
   *
   * * Webkit and Opera (before 9.5) do not support tabIndex for all elements
   * (See also: https://bugs.webkit.org/show_bug.cgi?id=7138)
   *
   * * TabIndex is normally 0, which means all naturally focusable elements are focusable.
   * * TabIndex > 0 means that the element is focusable and tabable
   * * TabIndex < 0 means that the element, even if naturally possible, is not focusable.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   * @use(qx.event.dispatch.DomBubbling)
   */
  qx.Class.define("qx.event.handler.Focus", {
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
     *
     * @ignore(qx.application.Inline)
     */
    construct: function construct(manager) {
      qx.core.Object.constructor.call(this); // Define shorthands

      this._manager = manager;
      this._window = manager.getWindow();
      this._document = this._window.document;
      this._root = this._document.documentElement;
      this._body = this._document.body;

      if (qx.core.Environment.get("os.name") == "ios" && parseFloat(qx.core.Environment.get("os.version")) > 6 && (!qx.application.Inline || !qx.core.Init.getApplication() instanceof qx.application.Inline)) {
        this.__needsScrollFix__P_57_0 = true;
      } // Initialize


      this._initObserver();
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The active DOM element */
      active: {
        apply: "_applyActive",
        nullable: true
      },

      /** The focused DOM element */
      focus: {
        apply: "_applyFocus",
        nullable: true
      }
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
        focus: 1,
        blur: 1,
        focusin: 1,
        focusout: 1,
        activate: 1,
        deactivate: 1
      },

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: true,

      /**
       * @type {Map} See: http://msdn.microsoft.com/en-us/library/ms534654(VS.85).aspx
       */
      FOCUSABLE_ELEMENTS: qx.core.Environment.select("engine.name", {
        mshtml: {
          a: 1,
          body: 1,
          button: 1,
          frame: 1,
          iframe: 1,
          img: 1,
          input: 1,
          object: 1,
          select: 1,
          textarea: 1
        },
        gecko: {
          a: 1,
          body: 1,
          button: 1,
          frame: 1,
          iframe: 1,
          img: 1,
          input: 1,
          object: 1,
          select: 1,
          textarea: 1
        },
        opera: {
          button: 1,
          input: 1,
          select: 1,
          textarea: 1
        },
        webkit: {
          button: 1,
          input: 1,
          select: 1,
          textarea: 1
        }
      })
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __onNativeMouseDownWrapper__P_57_1: null,
      __onNativeMouseUpWrapper__P_57_2: null,
      __onNativeFocusWrapper__P_57_3: null,
      __onNativeBlurWrapper__P_57_4: null,
      __onNativeDragGestureWrapper__P_57_5: null,
      __onNativeSelectStartWrapper__P_57_6: null,
      __onNativeFocusInWrapper__P_57_7: null,
      __onNativeFocusOutWrapper__P_57_8: null,
      __previousFocus__P_57_9: null,
      __previousActive__P_57_10: null,
      __down__P_57_11: "",
      __up__P_57_12: "",
      __needsScrollFix__P_57_0: false,
      __relatedTarget__P_57_13: null,

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
        FOCUS/BLUR USER INTERFACE
      ---------------------------------------------------------------------------
      */

      /**
       * Focuses the given DOM element
       *
       * @param element {Element} DOM element to focus
       */
      focus: function focus(element) {
        // Fixed timing issue with IE, see [BUG #3267]
        if (qx.core.Environment.get("engine.name") == "mshtml") {
          window.setTimeout(function () {
            try {
              // focus element before set cursor position
              element.focus(); // Fixed cursor position issue with IE, only when nothing is selected.
              // See [BUG #3519] for details.

              var selection = qx.bom.Selection.get(element);

              if (selection.length == 0 && typeof element.createTextRange == "function") {
                var textRange = element.createTextRange();
                textRange.moveStart("character", element.value.length);
                textRange.collapse();
                textRange.select();
              }
            } catch (ex) {}
          }, 0);
        } else {
          // Fix re-focusing on mousup event
          // See https://github.com/qooxdoo/qooxdoo/issues/9393 and
          // discussion in https://github.com/qooxdoo/qooxdoo/pull/9394
          window.setTimeout(function () {
            try {
              element.focus();
            } catch (ex) {}
          }, 0);
        }

        this.setFocus(element);
        this.setActive(element);
      },

      /**
       * Activates the given DOM element
       *
       * @param element {Element} DOM element to activate
       */
      activate: function activate(element) {
        this.setActive(element);
      },

      /**
       * Blurs the given DOM element
       *
       * @param element {Element} DOM element to focus
       */
      blur: function blur(element) {
        try {
          element.blur();
        } catch (ex) {}

        if (this.getActive() === element) {
          this.resetActive();
        }

        if (this.getFocus() === element) {
          this.resetFocus();
        }
      },

      /**
       * Deactivates the given DOM element
       *
       * @param element {Element} DOM element to activate
       */
      deactivate: function deactivate(element) {
        if (this.getActive() === element) {
          this.resetActive();
        }
      },

      /**
       * Tries to activate the given element. This checks whether
       * the activation is allowed first.
       *
       * @param element {Element} DOM element to activate
       */
      tryActivate: function tryActivate(element) {
        var active = this.__findActivatableElement__P_57_14(element);

        if (active) {
          this.setActive(active);
        }
      },

      /*
      ---------------------------------------------------------------------------
        HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Shorthand to fire events from within this class.
       *
       * @param target {Element} DOM element which is the target
       * @param related {Element} DOM element which is the related target
       * @param type {String} Name of the event to fire
       * @param bubbles {Boolean} Whether the event should bubble
       * @return {qx.Promise?} a promise, if one or more of the event handlers returned a promise
       */
      __fireEvent__P_57_15: function __fireEvent__P_57_15(target, related, type, bubbles) {
        var Registration = qx.event.Registration;
        var evt = Registration.createEvent(type, qx.event.type.Focus, [target, related, bubbles]);
        return Registration.dispatchEvent(target, evt);
      },

      /*
      ---------------------------------------------------------------------------
        WINDOW FOCUS/BLUR SUPPORT
      ---------------------------------------------------------------------------
      */

      /** @type {Boolean} Whether the window is focused currently */
      _windowFocused: true,

      /**
       * Helper for native event listeners to react on window blur
       */
      __doWindowBlur__P_57_16: function __doWindowBlur__P_57_16() {
        // Omit doubled blur events
        // which is a common behavior at least for gecko based clients
        if (this._windowFocused) {
          this._windowFocused = false;

          this.__fireEvent__P_57_15(this._window, null, "blur", false);
        }
      },

      /**
       * Helper for native event listeners to react on window focus
       */
      __doWindowFocus__P_57_17: function __doWindowFocus__P_57_17() {
        // Omit doubled focus events
        // which is a common behavior at least for gecko based clients
        if (!this._windowFocused) {
          this._windowFocused = true;

          this.__fireEvent__P_57_15(this._window, null, "focus", false);
        }
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE OBSERVER
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes event listeners.
       *
       * @signature function()
       */
      _initObserver: qx.core.Environment.select("engine.name", {
        gecko: function gecko() {
          // Bind methods
          this.__onNativeMouseDownWrapper__P_57_1 = qx.lang.Function.listener(this.__onNativeMouseDown__P_57_18, this);
          this.__onNativeMouseUpWrapper__P_57_2 = qx.lang.Function.listener(this.__onNativeMouseUp__P_57_19, this);
          this.__onNativeFocusWrapper__P_57_3 = qx.lang.Function.listener(this.__onNativeFocus__P_57_20, this);
          this.__onNativeBlurWrapper__P_57_4 = qx.lang.Function.listener(this.__onNativeBlur__P_57_21, this);
          this.__onNativeDragGestureWrapper__P_57_5 = qx.lang.Function.listener(this.__onNativeDragGesture__P_57_22, this); // Register events

          qx.bom.Event.addNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper__P_57_1, true);
          qx.bom.Event.addNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper__P_57_2, true); // Capturing is needed for gecko to correctly
          // handle focus of input and textarea fields

          qx.bom.Event.addNativeListener(this._window, "focus", this.__onNativeFocusWrapper__P_57_3, true);
          qx.bom.Event.addNativeListener(this._window, "blur", this.__onNativeBlurWrapper__P_57_4, true); // Capture drag events

          qx.bom.Event.addNativeListener(this._window, "draggesture", this.__onNativeDragGestureWrapper__P_57_5, true);
        },
        mshtml: function mshtml() {
          // Bind methods
          this.__onNativeMouseDownWrapper__P_57_1 = qx.lang.Function.listener(this.__onNativeMouseDown__P_57_18, this);
          this.__onNativeMouseUpWrapper__P_57_2 = qx.lang.Function.listener(this.__onNativeMouseUp__P_57_19, this);
          this.__onNativeFocusInWrapper__P_57_7 = qx.lang.Function.listener(this.__onNativeFocusIn__P_57_23, this);
          this.__onNativeFocusOutWrapper__P_57_8 = qx.lang.Function.listener(this.__onNativeFocusOut__P_57_24, this);
          this.__onNativeSelectStartWrapper__P_57_6 = qx.lang.Function.listener(this.__onNativeSelectStart__P_57_25, this); // Register events

          qx.bom.Event.addNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper__P_57_1);
          qx.bom.Event.addNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper__P_57_2); // MSHTML supports their own focusin and focusout events
          // To detect which elements get focus the target is useful
          // The window blur can detected using focusout and look
          // for the toTarget property which is empty in this case.

          qx.bom.Event.addNativeListener(this._document, "focusin", this.__onNativeFocusInWrapper__P_57_7);
          qx.bom.Event.addNativeListener(this._document, "focusout", this.__onNativeFocusOutWrapper__P_57_8); // Add selectstart to prevent selection

          qx.bom.Event.addNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper__P_57_6);
        },
        webkit: qx.core.Environment.select("browser.name", {
          // fix for [ISSUE #9174]
          // distinguish bettween MS Edge, which is reported
          // as engine webkit and all other webkit browsers
          edge: function edge(domEvent) {
            // Bind methods
            this.__onNativeMouseDownWrapper__P_57_1 = qx.lang.Function.listener(this.__onNativeMouseDown__P_57_18, this);
            this.__onNativeMouseUpWrapper__P_57_2 = qx.lang.Function.listener(this.__onNativeMouseUp__P_57_19, this);
            this.__onNativeFocusOutWrapper__P_57_8 = qx.lang.Function.listener(this.__onNativeFocusOut__P_57_24, this);
            this.__onNativeFocusInWrapper__P_57_7 = qx.lang.Function.listener(this.__onNativeFocusIn__P_57_23, this);
            this.__onNativeSelectStartWrapper__P_57_6 = qx.lang.Function.listener(this.__onNativeSelectStart__P_57_25, this); // Register events

            qx.bom.Event.addNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper__P_57_1, true);
            qx.bom.Event.addNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper__P_57_2, true);
            qx.bom.Event.addNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper__P_57_6, false);
            qx.bom.Event.addNativeListener(this._document, "focusin", this.__onNativeFocusInWrapper__P_57_7);
            qx.bom.Event.addNativeListener(this._document, "focusout", this.__onNativeFocusOutWrapper__P_57_8);
          },
          "default": function _default(domEvent) {
            // Bind methods
            this.__onNativeMouseDownWrapper__P_57_1 = qx.lang.Function.listener(this.__onNativeMouseDown__P_57_18, this);
            this.__onNativeMouseUpWrapper__P_57_2 = qx.lang.Function.listener(this.__onNativeMouseUp__P_57_19, this);
            this.__onNativeFocusOutWrapper__P_57_8 = qx.lang.Function.listener(this.__onNativeFocusOut__P_57_24, this);
            this.__onNativeFocusWrapper__P_57_3 = qx.lang.Function.listener(this.__onNativeFocus__P_57_20, this);
            this.__onNativeBlurWrapper__P_57_4 = qx.lang.Function.listener(this.__onNativeBlur__P_57_21, this);
            this.__onNativeSelectStartWrapper__P_57_6 = qx.lang.Function.listener(this.__onNativeSelectStart__P_57_25, this); // Register events

            qx.bom.Event.addNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper__P_57_1, true);
            qx.bom.Event.addNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper__P_57_2, true);
            qx.bom.Event.addNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper__P_57_6, false);
            qx.bom.Event.addNativeListener(this._window, "DOMFocusOut", this.__onNativeFocusOutWrapper__P_57_8, true);
            qx.bom.Event.addNativeListener(this._window, "focus", this.__onNativeFocusWrapper__P_57_3, true);
            qx.bom.Event.addNativeListener(this._window, "blur", this.__onNativeBlurWrapper__P_57_4, true);
          }
        }),
        opera: function opera() {
          // Bind methods
          this.__onNativeMouseDownWrapper__P_57_1 = qx.lang.Function.listener(this.__onNativeMouseDown__P_57_18, this);
          this.__onNativeMouseUpWrapper__P_57_2 = qx.lang.Function.listener(this.__onNativeMouseUp__P_57_19, this);
          this.__onNativeFocusInWrapper__P_57_7 = qx.lang.Function.listener(this.__onNativeFocusIn__P_57_23, this);
          this.__onNativeFocusOutWrapper__P_57_8 = qx.lang.Function.listener(this.__onNativeFocusOut__P_57_24, this); // Register events

          qx.bom.Event.addNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper__P_57_1, true);
          qx.bom.Event.addNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper__P_57_2, true);
          qx.bom.Event.addNativeListener(this._window, "DOMFocusIn", this.__onNativeFocusInWrapper__P_57_7, true);
          qx.bom.Event.addNativeListener(this._window, "DOMFocusOut", this.__onNativeFocusOutWrapper__P_57_8, true);
        }
      }),

      /**
       * Disconnects event listeners.
       *
       * @signature function()
       */
      _stopObserver: qx.core.Environment.select("engine.name", {
        gecko: function gecko() {
          qx.bom.Event.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper__P_57_1, true);
          qx.bom.Event.removeNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper__P_57_2, true);
          qx.bom.Event.removeNativeListener(this._window, "focus", this.__onNativeFocusWrapper__P_57_3, true);
          qx.bom.Event.removeNativeListener(this._window, "blur", this.__onNativeBlurWrapper__P_57_4, true);
          qx.bom.Event.removeNativeListener(this._window, "draggesture", this.__onNativeDragGestureWrapper__P_57_5, true);
        },
        mshtml: function mshtml() {
          qx.bom.Event.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper__P_57_1);
          qx.bom.Event.removeNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper__P_57_2);
          qx.bom.Event.removeNativeListener(this._document, "focusin", this.__onNativeFocusInWrapper__P_57_7);
          qx.bom.Event.removeNativeListener(this._document, "focusout", this.__onNativeFocusOutWrapper__P_57_8);
          qx.bom.Event.removeNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper__P_57_6);
        },
        webkit: qx.core.Environment.select("browser.name", {
          // fix for [ISSUE #9174]
          // distinguish bettween MS Edge, which is reported
          // as engine webkit and all other webkit browsers
          edge: function edge() {
            qx.bom.Event.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper__P_57_1);
            qx.bom.Event.removeNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper__P_57_2);
            qx.bom.Event.removeNativeListener(this._document, "focusin", this.__onNativeFocusInWrapper__P_57_7);
            qx.bom.Event.removeNativeListener(this._document, "focusout", this.__onNativeFocusOutWrapper__P_57_8);
            qx.bom.Event.removeNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper__P_57_6);
          },
          "default": function _default() {
            qx.bom.Event.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper__P_57_1, true);
            qx.bom.Event.removeNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper__P_57_2, true);
            qx.bom.Event.removeNativeListener(this._document, "selectstart", this.__onNativeSelectStartWrapper__P_57_6, false);
            qx.bom.Event.removeNativeListener(this._window, "DOMFocusOut", this.__onNativeFocusOutWrapper__P_57_8, true);
            qx.bom.Event.removeNativeListener(this._window, "focus", this.__onNativeFocusWrapper__P_57_3, true);
            qx.bom.Event.removeNativeListener(this._window, "blur", this.__onNativeBlurWrapper__P_57_4, true);
          }
        }),
        opera: function opera() {
          qx.bom.Event.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper__P_57_1, true);
          qx.bom.Event.removeNativeListener(this._document, "mouseup", this.__onNativeMouseUpWrapper__P_57_2, true);
          qx.bom.Event.removeNativeListener(this._window, "DOMFocusIn", this.__onNativeFocusInWrapper__P_57_7, true);
          qx.bom.Event.removeNativeListener(this._window, "DOMFocusOut", this.__onNativeFocusOutWrapper__P_57_8, true);
        }
      }),

      /*
      ---------------------------------------------------------------------------
        NATIVE LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Native event listener for <code>draggesture</code> event
       * supported by gecko. Used to stop native drag and drop when
       * selection is disabled.
       *
       * @see https://developer.mozilla.org/en-US/docs/Drag_and_Drop
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeDragGesture__P_57_22: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        gecko: function gecko(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (!this.__isSelectable__P_57_26(target)) {
            qx.bom.Event.preventDefault(domEvent);
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>DOMFocusIn</code> or <code>focusin</code>
       * depending on the client's engine.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeFocusIn__P_57_23: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(domEvent) {
          // Force window focus to be the first
          this.__doWindowFocus__P_57_17(); // Update internal data


          var target = qx.bom.Event.getTarget(domEvent); // IE focusin is also fired on elements which are not focusable at all
          // We need to look up for the next focusable element.

          var focusTarget = this.__findFocusableElement__P_57_27(target);

          if (focusTarget) {
            this.setFocus(focusTarget);
          } // Make target active


          this.tryActivate(target);
        },
        webkit: qx.core.Environment.select("browser.name", {
          // fix for [ISSUE #9174]
          // distinguish bettween MS Edge, which is reported
          // as engine webkit and all other webkit browsers
          edge: function edge(domEvent) {
            // Force window focus to be the first
            this.__doWindowFocus__P_57_17(); // Update internal data


            var target = qx.bom.Event.getTarget(domEvent); // IE focusin is also fired on elements which are not focusable at all
            // We need to look up for the next focusable element.

            var focusTarget = this.__findFocusableElement__P_57_27(target);

            if (focusTarget) {
              this.setFocus(focusTarget);
            } // Make target active


            this.tryActivate(target);
          },
          "default": null
        }),
        opera: function opera(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target == this._document || target == this._window) {
            this.__doWindowFocus__P_57_17();

            if (this.__previousFocus__P_57_9) {
              this.setFocus(this.__previousFocus__P_57_9);
              delete this.__previousFocus__P_57_9;
            }

            if (this.__previousActive__P_57_10) {
              this.setActive(this.__previousActive__P_57_10);
              delete this.__previousActive__P_57_10;
            }
          } else {
            this.setFocus(target);
            this.tryActivate(target); // Clear selection

            if (!this.__isSelectable__P_57_26(target)) {
              target.selectionStart = 0;
              target.selectionEnd = 0;
            }
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>DOMFocusOut</code> or <code>focusout</code>
       * depending on the client's engine.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeFocusOut__P_57_24: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(domEvent) {
          var relatedTarget = qx.bom.Event.getRelatedTarget(domEvent); // If the focus goes to nowhere (the document is blurred)

          if (relatedTarget == null) {
            // Update internal representation
            this.__doWindowBlur__P_57_16(); // Reset active and focus


            this.resetFocus();
            this.resetActive();
          }
        },
        webkit: qx.core.Environment.select("browser.name", {
          // fix for [ISSUE #9174]
          // distinguish bettween MS Edge, which is reported
          // as engine webkit and all other webkit browsers
          edge: function edge(domEvent) {
            var relatedTarget = qx.bom.Event.getRelatedTarget(domEvent); // If the focus goes to nowhere (the document is blurred)

            if (relatedTarget == null) {
              // Update internal representation
              this.__doWindowBlur__P_57_16(); // Reset active and focus


              this.resetFocus();
              this.resetActive();
            }
          },
          "default": function _default(domEvent) {
            var target = qx.bom.Event.getTarget(domEvent);

            if (target === this.getFocus()) {
              this.resetFocus();
            }

            if (target === this.getActive()) {
              this.resetActive();
            }
          }
        }),
        opera: function opera(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target == this._document) {
            this.__doWindowBlur__P_57_16(); // Store old focus/active elements
            // Opera do not fire focus events for them
            // when refocussing the window (in my opinion an error)


            this.__previousFocus__P_57_9 = this.getFocus();
            this.__previousActive__P_57_10 = this.getActive();
            this.resetFocus();
            this.resetActive();
          } else {
            if (target === this.getFocus()) {
              this.resetFocus();
            }

            if (target === this.getActive()) {
              this.resetActive();
            }
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>blur</code>.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeBlur__P_57_21: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        gecko: function gecko(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target === this._window || target === this._document) {
            this.__doWindowBlur__P_57_16();

            this.resetActive();
            this.resetFocus();
          }
        },
        webkit: function webkit(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target === this._window || target === this._document) {
            this.__doWindowBlur__P_57_16(); // Store old focus/active elements
            // Opera do not fire focus events for them
            // when refocussing the window (in my opinion an error)


            this.__previousFocus__P_57_9 = this.getFocus();
            this.__previousActive__P_57_10 = this.getActive();
            this.resetActive();
            this.resetFocus();
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>focus</code>.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeFocus__P_57_20: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        gecko: function gecko(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target === this._window || target === this._document) {
            this.__doWindowFocus__P_57_17(); // Always speak of the body, not the window or document


            target = this._body;
          }

          this.setFocus(target);
          this.tryActivate(target);
        },
        webkit: function webkit(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target === this._window || target === this._document) {
            this.__doWindowFocus__P_57_17();

            if (this.__previousFocus__P_57_9) {
              this.setFocus(this.__previousFocus__P_57_9);
              delete this.__previousFocus__P_57_9;
            }

            if (this.__previousActive__P_57_10) {
              this.setActive(this.__previousActive__P_57_10);
              delete this.__previousActive__P_57_10;
            }
          } else {
            this.__relatedTarget__P_57_13 = domEvent.relatedTarget;
            this.setFocus(target);
            this.__relatedTarget__P_57_13 = null;
            this.tryActivate(target);
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>mousedown</code>.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeMouseDown__P_57_18: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent); // Stop events when no focus element available (or blocked)

          var focusTarget = this.__findFocusableElement__P_57_27(target);

          if (focusTarget) {
            // Add unselectable to keep selection
            if (!this.__isSelectable__P_57_26(target)) {
              // The element is not selectable. Block selection.
              target.unselectable = "on"; // Unselectable may keep the current selection which
              // is not what we like when changing the focus element.
              // So we clear it

              try {
                if (document.selection) {
                  document.selection.empty();
                }
              } catch (ex) {// ignore 'Unknown runtime error'
              } // The unselectable attribute stops focussing as well.
              // Do this manually.


              try {
                focusTarget.focus();
              } catch (ex) {// ignore "Can't move focus of this control" error
              }
            }
          } else {
            // Stop event for blocking support
            qx.bom.Event.preventDefault(domEvent); // Add unselectable to keep selection

            if (!this.__isSelectable__P_57_26(target)) {
              target.unselectable = "on";
            }
          }
        },
        webkit: function webkit(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          var focusTarget = this.__findFocusableElement__P_57_27(target);

          if (focusTarget) {
            this.setFocus(focusTarget);
          } else {
            qx.bom.Event.preventDefault(domEvent);
          }
        },
        gecko: function gecko(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          var focusTarget = this.__findFocusableElement__P_57_27(target);

          if (focusTarget) {
            this.setFocus(focusTarget);
          } else {
            qx.bom.Event.preventDefault(domEvent);
          }
        },
        opera: function opera(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          var focusTarget = this.__findFocusableElement__P_57_27(target);

          if (!this.__isSelectable__P_57_26(target)) {
            // Prevent the default action for all non-selectable
            // targets. This prevents text selection and context menu.
            qx.bom.Event.preventDefault(domEvent); // The stopped event keeps the selection
            // of the previously focused element.
            // We need to clear the old selection.

            if (focusTarget) {
              var current = this.getFocus();

              if (current && current.selectionEnd) {
                current.selectionStart = 0;
                current.selectionEnd = 0;
                current.blur();
              } // The prevented event also stop the focus, do
              // it manually if needed.


              if (focusTarget) {
                this.setFocus(focusTarget);
              }
            }
          } else if (focusTarget) {
            this.setFocus(focusTarget);
          }
        },
        "default": null
      })),

      /**
       * Native event listener for <code>mouseup</code>.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeMouseUp__P_57_19: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (target.unselectable) {
            target.unselectable = "off";
          }

          this.tryActivate(this.__fixFocus__P_57_28(target));
        },
        gecko: function gecko(domEvent) {
          // As of Firefox 3.0:
          // Gecko fires mouseup on XUL elements
          // We only want to deal with real HTML elements
          var target = qx.bom.Event.getTarget(domEvent);

          while (target && target.offsetWidth === undefined) {
            target = target.parentNode;
          }

          if (target) {
            this.tryActivate(target);
          }
        },
        webkit: function webkit(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);
          this.tryActivate(this.__fixFocus__P_57_28(target));
        },
        opera: function opera(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);
          this.tryActivate(this.__fixFocus__P_57_28(target));
        },
        "default": null
      })),

      /**
       * Fix for bug #9331.
       *
       * @signature function(target)
       * @param target {Element} element to check
       * @return {Element} return correct target (in case of compound input controls should always return textfield);
       */
      __getCorrectFocusTarget__P_57_29: function __getCorrectFocusTarget__P_57_29(target) {
        var focusedElement = this.getFocus();

        if (focusedElement && target != focusedElement) {
          if (focusedElement.nodeName.toLowerCase() === "input" || focusedElement.nodeName.toLowerCase() === "textarea") {
            return focusedElement;
          }

          if (qx.Class.isClass("qx.ui.core.Widget")) {
            // Check compound widgets
            var widget = qx.ui.core.Widget.getWidgetByElement(focusedElement),
                textField = widget && widget.getChildControl && widget.getChildControl("textfield", true);
          }

          if (textField) {
            return textField.getContentElement().getDomElement();
          }
        }

        return target;
      },

      /**
       * Fix for bug #2602.
       *
       * @signature function(target)
       * @param target {Element} target element from mouse up event
       * @return {Element} Element to activate;
       */
      __fixFocus__P_57_28: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(target) {
          return this.__getCorrectFocusTarget__P_57_29(target);
        },
        webkit: function webkit(target) {
          return this.__getCorrectFocusTarget__P_57_29(target);
        },
        "default": function _default(target) {
          return target;
        }
      })),

      /**
       * Native event listener for <code>selectstart</code>.
       *
       *@signature function(domEvent)
       * @param domEvent {Event} Native event
       */
      __onNativeSelectStart__P_57_25: qx.event.GlobalError.observeMethod(qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (!this.__isSelectable__P_57_26(target)) {
            qx.bom.Event.preventDefault(domEvent);
          }
        },
        webkit: function webkit(domEvent) {
          var target = qx.bom.Event.getTarget(domEvent);

          if (!this.__isSelectable__P_57_26(target)) {
            qx.bom.Event.preventDefault(domEvent);
          }
        },
        "default": null
      })),

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Whether the given element is focusable. This is perfectly modeled to the
       * browsers behavior and this way may differ in the various clients.
       *
       * @param el {Element} DOM Element to query
       * @return {Boolean} Whether the element is focusable
       */
      __isFocusable__P_57_30: function __isFocusable__P_57_30(el) {
        var index = qx.bom.element.Attribute.get(el, "tabIndex");

        if (index >= 1) {
          return true;
        }

        var focusable = qx.event.handler.Focus.FOCUSABLE_ELEMENTS;

        if (index >= 0 && focusable[el.tagName]) {
          return true;
        }

        return false;
      },

      /**
       * Returns the next focusable parent element of an activated DOM element.
       *
       * @param el {Element} Element to start lookup with.
       * @return {Element|null} The next focusable element.
       */
      __findFocusableElement__P_57_27: function __findFocusableElement__P_57_27(el) {
        while (el && el.nodeType === 1) {
          if (el.getAttribute("qxKeepFocus") == "on") {
            return null;
          }

          if (this.__isFocusable__P_57_30(el)) {
            return el;
          }

          el = el.parentNode;
        } // This should be identical to the one which is selected when
        // clicking into an empty page area. In mshtml this must be
        // the body of the document.


        return this._body;
      },

      /**
       * Returns the next activatable element. May be the element itself.
       * Works a bit different than the method {@link #__findFocusableElement}
       * as it looks up for a parent which is has a keep focus flag. When
       * there is such a parent it returns null otherwise the original
       * incoming element.
       *
       * @param el {Element} Element to start lookup with.
       * @return {Element} The next activatable element.
       */
      __findActivatableElement__P_57_14: function __findActivatableElement__P_57_14(el) {
        var orig = el;

        while (el && el.nodeType === 1) {
          if (el.getAttribute("qxKeepActive") == "on") {
            return null;
          }

          el = el.parentNode;
        }

        return orig;
      },

      /**
       * Whether the given el (or its content) should be selectable
       * by the user.
       *
       * @param node {Element} Node to start lookup with
       * @return {Boolean} Whether the content is selectable.
       */
      __isSelectable__P_57_26: function __isSelectable__P_57_26(node) {
        while (node && node.nodeType === 1) {
          var attr = node.getAttribute("qxSelectable");

          if (attr != null) {
            return attr === "on";
          }

          node = node.parentNode;
        }

        return true;
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // apply routine
      _applyActive: function _applyActive(value, old) {
        // Fire events
        if (old) {
          this.__fireEvent__P_57_15(old, value, "deactivate", true);
        }

        if (value) {
          this.__fireEvent__P_57_15(value, old, "activate", true);
        } // correct scroll position for iOS 7


        if (this.__needsScrollFix__P_57_0) {
          window.scrollTo(0, 0);
        }
      },
      // apply routine
      _applyFocus: function _applyFocus(value, old) {
        // Fire bubbling events
        if (old) {
          this.__fireEvent__P_57_15(old, value, "focusout", true);
        }

        if (value) {
          this.__fireEvent__P_57_15(value, old, "focusin", true);
        } // Fire after events


        if (old) {
          this.__fireEvent__P_57_15(old, value, "blur", false);
        }

        if (value) {
          this.__fireEvent__P_57_15(value, old || this.__relatedTarget__P_57_13, "focus", false);
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._stopObserver();

      this._manager = this._window = this._document = this._root = this._body = this.__mouseActive__P_57_31 = this.__relatedTarget__P_57_13 = null;
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      qx.event.Registration.addHandler(statics); // For faster lookups generate uppercase tag names dynamically

      var focusable = statics.FOCUSABLE_ELEMENTS;

      for (var entry in focusable) {
        focusable[entry.toUpperCase()] = 1;
      }
    }
  });
  qx.event.handler.Focus.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.handler.Focus": {
        "defer": "runtime"
      },
      "qx.event.handler.Window": {
        "defer": "runtime"
      },
      "qx.event.handler.Capture": {
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
      "qx.event.dispatch.AbstractBubbling": {
        "construct": true,
        "require": true
      },
      "qx.event.Registration": {
        "defer": "runtime",
        "require": true
      },
      "qx.dom.Hierarchy": {},
      "qx.bom.Event": {},
      "qx.event.type.Event": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.bom.client.OperatingSystem": {
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "browser.documentmode": {
          "load": true,
          "className": "qx.bom.client.Browser"
        },
        "os.version": {
          "load": true,
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
      2007-2008 1&1 Internet AG, Germany, http://www.1und1.de
     License:
      MIT: https://opensource.org/licenses/MIT
      See the LICENSE file in the project's top-level directory for details.
     Authors:
      * Fabian Jakobs (fjakobs)
  ************************************************************************ */

  /**
   * Implementation of the Internet Explorer specific event capturing mode for
   * mouse events http://msdn2.microsoft.com/en-us/library/ms536742.aspx.
   *
   * This class is used internally by {@link qx.event.Manager} to do mouse event
   * capturing.
   *
   * @use(qx.event.handler.Focus)
   * @use(qx.event.handler.Window)
   * @use(qx.event.handler.Capture)
   */
  qx.Class.define("qx.event.dispatch.MouseCapture", {
    extend: qx.event.dispatch.AbstractBubbling,

    /**
     * @param manager {qx.event.Manager} Event manager for the window to use
     * @param registration {qx.event.Registration} The event registration to use
     */
    construct: function construct(manager, registration) {
      qx.event.dispatch.AbstractBubbling.constructor.call(this, manager);
      this.__window__P_106_0 = manager.getWindow();
      this.__registration__P_106_1 = registration;
      manager.addListener(this.__window__P_106_0, "blur", this.releaseCapture, this);
      manager.addListener(this.__window__P_106_0, "focus", this.releaseCapture, this);
      manager.addListener(this.__window__P_106_0, "scroll", this.releaseCapture, this);
    },
    statics: {
      /** @type {Integer} Priority of this dispatcher */
      PRIORITY: qx.event.Registration.PRIORITY_FIRST
    },

    /* eslint-disable @qooxdoo/qx/no-refs-in-members */
    members: {
      __registration__P_106_1: null,
      __captureElement__P_106_2: null,
      __containerCapture__P_106_3: true,
      __window__P_106_0: null,
      // overridden
      _getParent: function _getParent(target) {
        return target.parentNode;
      },

      /*
      ---------------------------------------------------------------------------
        EVENT DISPATCHER INTERFACE
      ---------------------------------------------------------------------------
      */
      // overridden
      canDispatchEvent: function canDispatchEvent(target, event, type) {
        return !!(this.__captureElement__P_106_2 && this.__captureEvents__P_106_4[type]);
      },
      // overridden
      dispatchEvent: function dispatchEvent(target, event, type) {
        if (type == "click") {
          event.stopPropagation();
          this.releaseCapture();
          return;
        }

        if (this.__containerCapture__P_106_3 || !qx.dom.Hierarchy.contains(this.__captureElement__P_106_2, target)) {
          target = this.__captureElement__P_106_2;
        }

        return qx.event.dispatch.MouseCapture.superclass.prototype.dispatchEvent.call(this, target, event, type);
      },

      /*
      ---------------------------------------------------------------------------
        HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * @lint ignoreReferenceField(__captureEvents)
       */
      __captureEvents__P_106_4: {
        mouseup: 1,
        mousedown: 1,
        click: 1,
        dblclick: 1,
        mousemove: 1,
        mouseout: 1,
        mouseover: 1,
        pointerdown: 1,
        pointerup: 1,
        pointermove: 1,
        pointerover: 1,
        pointerout: 1,
        tap: 1,
        dbltap: 1
      },

      /*
      ---------------------------------------------------------------------------
        USER ACCESS
      ---------------------------------------------------------------------------
      */

      /**
       * Set the given element as target for event
       *
       * @param element {Element} The element which should capture the mouse events.
       * @param containerCapture {Boolean?true} If true all events originating in
       *   the container are captured. IF false events originating in the container
       *   are not captured.
       */
      activateCapture: function activateCapture(element, containerCapture) {
        var containerCapture = containerCapture !== false;

        if (this.__captureElement__P_106_2 === element && this.__containerCapture__P_106_3 == containerCapture) {
          return;
        }

        if (this.__captureElement__P_106_2) {
          this.releaseCapture();
        } // turn on native mouse capturing if the browser supports it


        if (this.hasNativeCapture) {
          this.nativeSetCapture(element, containerCapture);
          var self = this;

          var onNativeListener = function onNativeListener() {
            qx.bom.Event.removeNativeListener(element, "losecapture", onNativeListener);
            self.releaseCapture();
          };

          qx.bom.Event.addNativeListener(element, "losecapture", onNativeListener);
        }

        this.__containerCapture__P_106_3 = containerCapture;
        this.__captureElement__P_106_2 = element;

        this.__registration__P_106_1.fireEvent(element, "capture", qx.event.type.Event, [true, false]);
      },

      /**
       * Get the element currently capturing events.
       *
       * @return {Element|null} The current capture element. This value may be
       *    null.
       */
      getCaptureElement: function getCaptureElement() {
        return this.__captureElement__P_106_2;
      },

      /**
       * Stop capturing of mouse events.
       */
      releaseCapture: function releaseCapture() {
        var element = this.__captureElement__P_106_2;

        if (!element) {
          return;
        }

        this.__captureElement__P_106_2 = null;

        this.__registration__P_106_1.fireEvent(element, "losecapture", qx.event.type.Event, [true, false]); // turn off native mouse capturing if the browser supports it


        this.nativeReleaseCapture(element);
      },

      /** Whether the browser should use native mouse capturing */
      hasNativeCapture: qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9 || parseInt(qx.core.Environment.get("os.version"), 10) > 7 && qx.core.Environment.get("browser.documentmode") > 9,

      /**
       * If the browser supports native mouse capturing, sets the mouse capture to
       * the object that belongs to the current document.
       *
       * Please note that under Windows 7 (but not Windows 8), capturing is
       * not only applied to mouse events as expected, but also to native pointer events.
       *
       * @param element {Element} The capture DOM element
       * @param containerCapture {Boolean?true} If true all events originating in
       *   the container are captured. If false events originating in the container
       *   are not captured.
       * @signature function(element, containerCapture)
       */
      nativeSetCapture: qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(element, containerCapture) {
          element.setCapture(containerCapture !== false);
        },
        "default": function _default() {}
      }),

      /**
       * If the browser supports native mouse capturing, removes mouse capture
       * from the object in the current document.
       *
       * @param element {Element} The DOM element to release the capture for
       * @signature function(element)
       */
      nativeReleaseCapture: qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(element) {
          element.releaseCapture();
        },
        "default": function _default() {}
      })
    },
    defer: function defer(statics) {
      qx.event.Registration.addDispatcher(statics);
    }
  });
  qx.event.dispatch.MouseCapture.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.element.Attribute": {}
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
  
  ************************************************************************ */

  /**
   * Manages children structures of an element. Easy and convenient APIs
   * to insert, remove and replace children.
   */
  qx.Bootstrap.define("qx.dom.Element", {
    statics: {
      /**
       * Whether the given <code>child</code> is a child of <code>parent</code>
       *
       * @param parent {Element} parent element
       * @param child {Node} child node
       * @return {Boolean} true when the given <code>child</code> is a child of <code>parent</code>
       */
      hasChild: function hasChild(parent, child) {
        return child.parentNode === parent;
      },

      /**
       * Whether the given <code>element</code> has children.
       *
       * @param element {Element} element to test
       * @return {Boolean} true when the given <code>element</code> has at least one child node
       */
      hasChildren: function hasChildren(element) {
        return !!element.firstChild;
      },

      /**
       * Whether the given <code>element</code> has any child elements.
       *
       * @param element {Element} element to test
       * @return {Boolean} true when the given <code>element</code> has at least one child element
       */
      hasChildElements: function hasChildElements(element) {
        element = element.firstChild;

        while (element) {
          if (element.nodeType === 1) {
            return true;
          }

          element = element.nextSibling;
        }

        return false;
      },

      /**
       * Returns the parent element of the given element.
       *
       * @param element {Element} Element to find the parent for
       * @return {Element} The parent element
       */
      getParentElement: function getParentElement(element) {
        return element.parentNode;
      },

      /**
       * Checks if the <code>element</code> is in the DOM, but note that
       * the method is very expensive!
       *
       * @param element {Element} The DOM element to check.
       * @param win {Window} The window to check for.
       * @return {Boolean} <code>true</code> if the <code>element</code> is in
       *          the DOM, <code>false</code> otherwise.
       */
      isInDom: function isInDom(element, win) {
        if (!win) {
          win = window;
        }

        var domElements = win.document.getElementsByTagName(element.nodeName);

        for (var i = 0, l = domElements.length; i < l; i++) {
          if (domElements[i] === element) {
            return true;
          }
        }

        return false;
      },

      /*
      ---------------------------------------------------------------------------
        INSERTION
      ---------------------------------------------------------------------------
      */

      /**
       * Inserts <code>node</code> at the given <code>index</code>
       * inside <code>parent</code>.
       *
       * @param node {Node} node to insert
       * @param parent {Element} parent element node
       * @param index {Integer} where to insert
       * @return {Boolean} returns true (successful)
       */
      insertAt: function insertAt(node, parent, index) {
        var ref = parent.childNodes[index];

        if (ref) {
          parent.insertBefore(node, ref);
        } else {
          parent.appendChild(node);
        }

        return true;
      },

      /**
       * Insert <code>node</code> into <code>parent</code> as first child.
       * Indexes of other children will be incremented by one.
       *
       * @param node {Node} Node to insert
       * @param parent {Element} parent element node
       * @return {Boolean} returns true (successful)
       */
      insertBegin: function insertBegin(node, parent) {
        if (parent.firstChild) {
          this.insertBefore(node, parent.firstChild);
        } else {
          parent.appendChild(node);
        }

        return true;
      },

      /**
       * Insert <code>node</code> into <code>parent</code> as last child.
       *
       * @param node {Node} Node to insert
       * @param parent {Element} parent element node
       * @return {Boolean} returns true (successful)
       */
      insertEnd: function insertEnd(node, parent) {
        parent.appendChild(node);
        return true;
      },

      /**
       * Inserts <code>node</code> before <code>ref</code> in the same parent.
       *
       * @param node {Node} Node to insert
       * @param ref {Node} Node which will be used as reference for insertion
       * @return {Boolean} returns true (successful)
       */
      insertBefore: function insertBefore(node, ref) {
        ref.parentNode.insertBefore(node, ref);
        return true;
      },

      /**
       * Inserts <code>node</code> after <code>ref</code> in the same parent.
       *
       * @param node {Node} Node to insert
       * @param ref {Node} Node which will be used as reference for insertion
       * @return {Boolean} returns true (successful)
       */
      insertAfter: function insertAfter(node, ref) {
        var parent = ref.parentNode;

        if (ref == parent.lastChild) {
          parent.appendChild(node);
        } else {
          return this.insertBefore(node, ref.nextSibling);
        }

        return true;
      },

      /*
      ---------------------------------------------------------------------------
        REMOVAL
      ---------------------------------------------------------------------------
      */

      /**
       * Removes the given <code>node</code> from its parent element.
       *
       * @param node {Node} Node to remove
       * @return {Boolean} <code>true</code> when node was successfully removed,
       *   otherwise <code>false</code>
       */
      remove: function remove(node) {
        if (!node.parentNode) {
          return false;
        }

        node.parentNode.removeChild(node);
        return true;
      },

      /**
       * Removes the given <code>node</code> from the <code>parent</code>.
       *
       * @param node {Node} Node to remove
       * @param parent {Element} parent element which contains the <code>node</code>
       * @return {Boolean} <code>true</code> when node was successfully removed,
       *   otherwise <code>false</code>
       */
      removeChild: function removeChild(node, parent) {
        if (node.parentNode !== parent) {
          return false;
        }

        parent.removeChild(node);
        return true;
      },

      /**
       * Removes the node at the given <code>index</code>
       * from the <code>parent</code>.
       *
       * @param index {Integer} position of the node which should be removed
       * @param parent {Element} parent DOM element
       * @return {Boolean} <code>true</code> when node was successfully removed,
       *   otherwise <code>false</code>
       */
      removeChildAt: function removeChildAt(index, parent) {
        var child = parent.childNodes[index];

        if (!child) {
          return false;
        }

        parent.removeChild(child);
        return true;
      },

      /*
      ---------------------------------------------------------------------------
        REPLACE
      ---------------------------------------------------------------------------
      */

      /**
       * Replaces <code>oldNode</code> with <code>newNode</code> in the current
       * parent of <code>oldNode</code>.
       *
       * @param newNode {Node} DOM node to insert
       * @param oldNode {Node} DOM node to remove
       * @return {Boolean} <code>true</code> when node was successfully replaced
       */
      replaceChild: function replaceChild(newNode, oldNode) {
        if (!oldNode.parentNode) {
          return false;
        }

        oldNode.parentNode.replaceChild(newNode, oldNode);
        return true;
      },

      /**
       * Replaces the node at <code>index</code> with <code>newNode</code> in
       * the given parent.
       *
       * @param newNode {Node} DOM node to insert
       * @param index {Integer} position of old DOM node
       * @param parent {Element} parent DOM element
       * @return {Boolean} <code>true</code> when node was successfully replaced
       */
      replaceAt: function replaceAt(newNode, index, parent) {
        var oldNode = parent.childNodes[index];

        if (!oldNode) {
          return false;
        }

        parent.replaceChild(newNode, oldNode);
        return true;
      },

      /**
       * Stores helper element for element creation in WebKit
       *
       * @internal
       */
      __helperElement__P_52_0: {},

      /**
       * Creates and returns a DOM helper element.
       *
       * @param win {Window?} Window to create the element for
       * @return {Element} The created element node
       */
      getHelperElement: function getHelperElement(win) {
        if (!win) {
          win = window;
        } // key is needed to allow using different windows


        var key = win.location.href;

        if (!qx.dom.Element.__helperElement__P_52_0[key]) {
          var helper = qx.dom.Element.__helperElement__P_52_0[key] = win.document.createElement("div"); // innerHTML will only parsed correctly if element is appended to document

          if (qx.core.Environment.get("engine.name") == "webkit") {
            helper.style.display = "none";
            win.document.body.appendChild(helper);
          }
        }

        return qx.dom.Element.__helperElement__P_52_0[key];
      },

      /**
       * Creates a DOM element.
       *
       * @param name {String} Tag name of the element
       * @param attributes {Map?} Map of attributes to apply
       * @param win {Window?} Window to create the element for
       * @return {Element} The created element node
       */
      create: function create(name, attributes, win) {
        if (!win) {
          win = window;
        }

        if (!name) {
          throw new Error("The tag name is missing!");
        }

        var element = win.document.createElement(name);

        for (var key in attributes) {
          qx.bom.element.Attribute.set(element, key, attributes[key]);
        }

        return element;
      },

      /**
       * Removes all content from the given element
       *
       * @param element {Element} element to clean
       * @return {String} empty string (new HTML content)
       */
      empty: function empty(element) {
        return element.innerHTML = "";
      }
    }
  });
  qx.dom.Element.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Html": {
        "require": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.lang.Type": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "html.element.textcontent": {
          "load": true,
          "className": "qx.bom.client.Html"
        },
        "engine.name": {
          "load": true,
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
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Alexander Steitz (aback)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Prototype JS
       http://www.prototypejs.org/
       Version 1.5
  
       Copyright:
         (c) 2006-2007, Prototype Core Team
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
       Authors:
         * Prototype Core Team
  
     ----------------------------------------------------------------------
  
       Copyright (c) 2005-2008 Sam Stephenson
  
       Permission is hereby granted, free of charge, to any person
       obtaining a copy of this software and associated documentation
       files (the "Software"), to deal in the Software without restriction,
       including without limitation the rights to use, copy, modify, merge,
       publish, distribute, sublicense, and/or sell copies of the Software,
       and to permit persons to whom the Software is furnished to do so,
       subject to the following conditions:
  
       THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
       EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
       MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
       NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
       HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
       WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
       OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
       DEALINGS IN THE SOFTWARE.
  
  ************************************************************************ */

  /**
   * Attribute/Property handling for DOM HTML elements.
   *
   * Also includes support for HTML properties like <code>checked</code>
   * or <code>value</code>. This feature set is supported cross-browser
   * through one common interface and is independent of the differences between
   * the multiple implementations.
   *
   * Supports applying text and HTML content using the attribute names
   * <code>text</code> and <code>html</code>.
   */
  qx.Bootstrap.define("qx.bom.element.Attribute", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** Internal map of attribute conversions */
      __hints__P_109_0: {
        // Name translation table (camelcase is important for some attributes)
        names: {
          "class": "className",
          "for": "htmlFor",
          html: "innerHTML",
          text: qx.core.Environment.get("html.element.textcontent") ? "textContent" : "innerText",
          colspan: "colSpan",
          rowspan: "rowSpan",
          valign: "vAlign",
          datetime: "dateTime",
          accesskey: "accessKey",
          tabindex: "tabIndex",
          maxlength: "maxLength",
          readonly: "readOnly",
          longdesc: "longDesc",
          cellpadding: "cellPadding",
          cellspacing: "cellSpacing",
          frameborder: "frameBorder",
          usemap: "useMap"
        },
        // Attributes which are only applyable on a DOM element (not using compile())
        runtime: {
          html: 1,
          text: 1
        },
        // Attributes which are (forced) boolean
        bools: {
          compact: 1,
          nowrap: 1,
          ismap: 1,
          declare: 1,
          noshade: 1,
          checked: 1,
          disabled: 1,
          readOnly: 1,
          multiple: 1,
          selected: 1,
          noresize: 1,
          defer: 1,
          allowTransparency: 1
        },
        // Interpreted as property (element.property)
        property: {
          // Used by qx.html.Element
          $$element: 1,
          $$elementObject: 1,
          // Used by qx.ui.core.Widget
          $$qxObjectHash: 1,
          $$qxObject: 1,
          // Native properties
          checked: 1,
          readOnly: 1,
          multiple: 1,
          selected: 1,
          value: 1,
          maxLength: 1,
          className: 1,
          innerHTML: 1,
          innerText: 1,
          textContent: 1,
          htmlFor: 1,
          tabIndex: 1
        },
        qxProperties: {
          $$qxObjectHash: 1,
          $$qxObject: 1,
          $$element: 1,
          $$elementObject: 1
        },
        // Default values when "null" is given to a property
        propertyDefault: {
          disabled: false,
          checked: false,
          readOnly: false,
          multiple: false,
          selected: false,
          value: "",
          className: "",
          innerHTML: "",
          innerText: "",
          textContent: "",
          htmlFor: "",
          tabIndex: 0,
          maxLength: qx.core.Environment.select("engine.name", {
            mshtml: 2147483647,
            webkit: 524288,
            "default": -1
          })
        },
        // Properties which can be removed to reset them
        removeableProperties: {
          disabled: 1,
          multiple: 1,
          maxLength: 1
        }
      },

      /**
       * Compiles an incoming attribute map to a string which
       * could be used when building HTML blocks using innerHTML.
       *
       * This method silently ignores runtime attributes like
       * <code>html</code> or <code>text</code>.
       *
       * @param map {Map} Map of attributes. The key is the name of the attribute.
       * @return {String} Returns a compiled string ready for usage.
       */
      compile: function compile(map) {
        var html = [];
        var runtime = this.__hints__P_109_0.runtime;

        for (var key in map) {
          if (!runtime[key]) {
            html.push(key, "='", map[key], "'");
          }
        }

        return html.join("");
      },

      /**
       * Returns the value of the given HTML attribute
       *
       * @param element {Element} The DOM element to query
       * @param name {String} Name of the attribute
       * @return {var} The value of the attribute
       */
      get: function get(element, name) {
        var hints = this.__hints__P_109_0;
        var value; // normalize name

        name = hints.names[name] || name; // respect properties

        if (hints.property[name]) {
          value = element[name];

          if (typeof hints.propertyDefault[name] !== "undefined" && value == hints.propertyDefault[name]) {
            // only return null for all non-boolean properties
            if (typeof hints.bools[name] === "undefined") {
              return null;
            } else {
              return value;
            }
          }
        } else {
          // fallback to attribute
          value = element.getAttribute(name); // All modern browsers interpret "" as true but not IE8, which set the property to "" reset

          if (hints.bools[name] && !(qx.core.Environment.get("engine.name") == "mshtml" && parseInt(qx.core.Environment.get("browser.documentmode"), 10) <= 8)) {
            return qx.Bootstrap.isString(value); // also respect empty strings as true
          }
        }

        if (hints.bools[name]) {
          return !!value;
        }

        return value;
      },

      /**
       * Sets an HTML attribute on the given DOM element
       *
       * @param element {Element} The DOM element to modify
       * @param name {String} Name of the attribute
       * @param value {var} New value of the attribute
       */
      set: function set(element, name, value) {
        if (typeof value === "undefined") {
          return;
        }

        var hints = this.__hints__P_109_0; // normalize name

        name = hints.names[name] || name; // respect booleans

        if (hints.bools[name] && !qx.lang.Type.isBoolean(value)) {
          value = qx.lang.Type.isString(value);
        } // apply attribute
        // only properties which can be applied by the browser or qxProperties
        // otherwise use the attribute methods


        if (hints.property[name] && (!(element[name] === undefined) || hints.qxProperties[name])) {
          // resetting the attribute/property
          if (value == null) {
            // for properties which need to be removed for a correct reset
            if (hints.removeableProperties[name]) {
              element.removeAttribute(name);
              return;
            } else if (typeof hints.propertyDefault[name] !== "undefined") {
              value = hints.propertyDefault[name];
            }
          }

          element[name] = value;
        } else {
          if ((hints.bools[name] || value === null) && name.indexOf("data-") !== 0) {
            if (value === true) {
              element.setAttribute(name, name);
            } else if (value === false || value === null) {
              element.removeAttribute(name);
            }
          } else if (value === null) {
            element.removeAttribute(name);
          } else {
            element.setAttribute(name, value);
          }
        }
      },

      /**
       * Serializes an HTML attribute into a writer; the `writer` function accepts
       *  an varargs, which can be joined with an empty string or streamed.
       *
       * @param writer {Function} The writer to serialize to
       * @param name {String} Name of the attribute
       * @param value {var} New value of the attribute
       */
      serialize: function serialize(writer, name, value) {
        if (typeof value === "undefined") {
          return;
        }

        var hints = this.__hints__P_109_0; // Skip serialization of hidden Qooxdoo state properties

        if (hints.qxProperties[name]) {
          return;
        } // respect booleans


        if (hints.bools[name] && !qx.lang.Type.isBoolean(value)) {
          value = qx.lang.Type.isString(value);
        } // apply attribute


        if ((hints.bools[name] || value === null) && name.indexOf("data-") !== 0) {
          if (value === true) {
            writer(name, "=", name);
          }
        } else if (value !== null) {
          writer(name, '="', value, '"');
        }
      },

      /**
       * Resets an HTML attribute on the given DOM element
       *
       * @param element {Element} The DOM element to modify
       * @param name {String} Name of the attribute
       */
      reset: function reset(element, name) {
        if (name.indexOf("data-") === 0) {
          element.removeAttribute(name);
        } else {
          this.set(element, name, null);
        }
      }
    }
  });
  qx.bom.element.Attribute.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.html.Node": {
        "construct": true,
        "require": true
      },
      "qx.html.Element": {
        "defer": "runtime"
      },
      "qx.util.DeferredCall": {
        "defer": "runtime"
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2019-2020 Zenesis Limited, https://www.zenesis.com
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * John Spackman (https://github.com/johnspackman, john.spackman@zenesis.com)
  
  ************************************************************************ */

  /**
   * DOM representation of Text nodes
   */
  qx.Class.define("qx.html.Text", {
    extend: qx.html.Node,

    /*
     * ****************************************************************************
     * CONSTRUCTOR
     * ****************************************************************************
     */

    /**
     * Creates a new Text
     *
     * @param value
     *          {String?} the value of the text
     */
    construct: function construct(text) {
      qx.html.Node.constructor.call(this, "#text");

      if (text) {
        this.__text__P_146_0 = text;
      }
    },

    /*
     * ****************************************************************************
     * MEMBERS
     * ****************************************************************************
     */
    members: {
      __text__P_146_0: null,

      /*
       * @Override
       */
      _createDomElement: function _createDomElement() {
        return window.document.createTextNode(this.__text__P_146_0 || "");
      },

      /*
       * @Override
       */
      isRoot: function isRoot() {
        return false;
      },

      /*
       * @Override
       */
      _copyData: function _copyData(fromMarkup, propertiesFromDom) {
        qx.html.Text.superclass.prototype._copyData.call(this, fromMarkup, propertiesFromDom);

        var elem = this._domNode;
        elem.nodeValue = this.__text__P_146_0 || "";
      },

      /*
       * @Override
       */
      _useNode: function _useNode(domNode) {
        this.setText(domNode.nodeValue);
      },

      /*
       * @Override
       */
      _useNodeImpl: function _useNodeImpl(domNode) {
        this.setText(domNode.nodeValue);
      },

      /**
       * @Override
       */
      _syncData: function _syncData() {
        qx.html.Text.superclass.prototype._syncData.call(this);

        var elem = this._domNode;
        elem.nodeValue = this.__text__P_146_0 || "";
      },

      /*
       * @Override
       */
      _serializeImpl: function _serializeImpl(writer) {
        if (this.__text__P_146_0 !== null) {
          writer(this.__text__P_146_0);
        }
      },

      /**
       * @Override
       */
      useMarkup: function useMarkup(html) {
        throw new Error("Could not overwrite existing text node!");
      },

      /**
       * Sets the text value
       *
       * @param value {String?} the text value of for the text node
       * @param direct {Boolean?} whether to set the DOM node immediately if there is one
       */
      setText: function setText(value, direct) {
        this.__text__P_146_0 = value;

        if (direct && this._domNode) {
          this._domNode.nodeValue = value;
        } else {
          qx.html.Element._modified[this.$$hash] = this;

          qx.html.Element._scheduleFlush("element");
        }
      },

      /**
       * Returns the value of the node
       *
       * @return {String} the text node
       */
      getText: function getText() {
        return this.__text__P_146_0;
      }
    },

    /*
     * ****************************************************************************
     * DEFER
     * ****************************************************************************
     */
    defer: function defer(statics) {
      statics.__deferredCall__P_146_1 = new qx.util.DeferredCall(statics.flush, statics);
    },

    /*
     * ****************************************************************************
     * DESTRUCT
     * ****************************************************************************
     */
    destruct: function destruct() {
      if (this.toHashCode()) {
        delete qx.html.Element._modified[this.toHashCode()];
        delete qx.html.Element._scroll[this.toHashCode()];
      }

      this.__attribValues__P_146_2 = this.__styleValues__P_146_3 = this.__eventValues__P_146_4 = this.__attribJobs__P_146_5 = this.__styleJobs__P_146_6 = this.__lazyScrollIntoViewX__P_146_7 = this.__lazyScrollIntoViewY__P_146_8 = null;
    }
  });
  qx.html.Text.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.IEventHandler": {
        "require": true
      },
      "qx.event.Registration": {
        "construct": true,
        "defer": "runtime",
        "require": true
      },
      "qx.ui.core.Widget": {},
      "qx.event.type.Event": {},
      "qx.event.Pool": {},
      "qx.event.Utils": {}
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
   * Connects the widgets to the browser DOM events.
   */
  qx.Class.define("qx.ui.core.EventHandler", {
    extend: qx.core.Object,
    implement: qx.event.IEventHandler,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__manager__P_102_0 = qx.event.Registration.getManager(window);
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Integer} Priority of this handler */
      PRIORITY: qx.event.Registration.PRIORITY_FIRST,

      /** @type {Map} Supported event types. Identical to events map of qx.ui.core.Widget */
      SUPPORTED_TYPES: {
        // mouse events
        mousemove: 1,
        mouseover: 1,
        mouseout: 1,
        mousedown: 1,
        mouseup: 1,
        click: 1,
        auxclick: 1,
        dblclick: 1,
        contextmenu: 1,
        mousewheel: 1,
        // key events
        keyup: 1,
        keydown: 1,
        keypress: 1,
        keyinput: 1,
        // mouse capture
        capture: 1,
        losecapture: 1,
        // focus events
        focusin: 1,
        focusout: 1,
        focus: 1,
        blur: 1,
        activate: 1,
        deactivate: 1,
        // appear events
        appear: 1,
        disappear: 1,
        // drag drop events
        dragstart: 1,
        dragend: 1,
        dragover: 1,
        dragleave: 1,
        drop: 1,
        drag: 1,
        dragchange: 1,
        droprequest: 1,
        // touch events
        touchstart: 1,
        touchend: 1,
        touchmove: 1,
        touchcancel: 1,
        // gestures
        tap: 1,
        longtap: 1,
        swipe: 1,
        dbltap: 1,
        track: 1,
        trackend: 1,
        trackstart: 1,
        pinch: 1,
        rotate: 1,
        roll: 1,
        // pointer events
        pointermove: 1,
        pointerover: 1,
        pointerout: 1,
        pointerdown: 1,
        pointerup: 1,
        pointercancel: 1
      },

      /** @type {Integer} Whether the method "canHandleEvent" must be called */
      IGNORE_CAN_HANDLE: false
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */

    /* eslint-disable @qooxdoo/qx/no-refs-in-members */
    members: {
      __manager__P_102_0: null,

      /**
       * @type {Map} Supported focus event types
       *
       * @lint ignoreReferenceField(__focusEvents)
       */
      __focusEvents__P_102_1: {
        focusin: 1,
        focusout: 1,
        focus: 1,
        blur: 1
      },

      /**
       * @type {Map} Map of events which should be fired independently from being disabled
       *
       * @lint ignoreReferenceField(__ignoreDisabled)
       */
      __ignoreDisabled__P_102_2: {
        // mouse events
        mouseover: 1,
        mouseout: 1,
        // appear events
        appear: 1,
        disappear: 1
      },
      // interface implementation
      canHandleEvent: function canHandleEvent(target, type) {
        return target instanceof qx.ui.core.Widget;
      },

      /**
       * Dispatches a DOM event on a widget.
       *
       * @param domEvent {qx.event.type.Event} The event object to dispatch.
       */
      _dispatchEvent: function _dispatchEvent(domEvent) {
        // EVENT TARGET
        var domTarget = domEvent.getTarget();
        var widgetTarget = qx.ui.core.Widget.getWidgetByElement(domTarget);
        var targetChanged = false;

        while (widgetTarget && widgetTarget.isAnonymous()) {
          var targetChanged = true;
          widgetTarget = widgetTarget.getLayoutParent();
        } // don't activate anonymous widgets!


        if (widgetTarget && targetChanged && domEvent.getType() == "activate") {
          widgetTarget.getContentElement().activate();
        } // Correcting target for focus events


        if (this.__focusEvents__P_102_1[domEvent.getType()]) {
          widgetTarget = widgetTarget && widgetTarget.getFocusTarget(); // Whether nothing is returned

          if (!widgetTarget) {
            return;
          }
        } // EVENT RELATED TARGET


        if (domEvent.getRelatedTarget) {
          var domRelatedTarget = domEvent.getRelatedTarget();
          var widgetRelatedTarget = qx.ui.core.Widget.getWidgetByElement(domRelatedTarget);

          while (widgetRelatedTarget && widgetRelatedTarget.isAnonymous()) {
            widgetRelatedTarget = widgetRelatedTarget.getLayoutParent();
          }

          if (widgetRelatedTarget) {
            // Correcting target for focus events
            if (this.__focusEvents__P_102_1[domEvent.getType()]) {
              widgetRelatedTarget = widgetRelatedTarget.getFocusTarget();
            } // If target and related target are identical ignore the event


            if (widgetRelatedTarget === widgetTarget) {
              return;
            }
          }
        } // EVENT CURRENT TARGET


        var currentTarget = domEvent.getCurrentTarget();
        var currentWidget = qx.ui.core.Widget.getWidgetByElement(currentTarget);

        if (!currentWidget || currentWidget.isAnonymous()) {
          return;
        } // Correcting target for focus events


        if (this.__focusEvents__P_102_1[domEvent.getType()]) {
          currentWidget = currentWidget.getFocusTarget();
        } // Ignore most events in the disabled state.


        var type = domEvent.getType();

        if (!currentWidget || !(currentWidget.isEnabled() || this.__ignoreDisabled__P_102_2[type])) {
          return;
        } // PROCESS LISTENERS
        // Load listeners


        var capture = domEvent.getEventPhase() == qx.event.type.Event.CAPTURING_PHASE;

        var listeners = this.__manager__P_102_0.getListeners(currentWidget, type, capture);

        if (domEvent.getEventPhase() == qx.event.type.Event.AT_TARGET) {
          if (!listeners) {
            listeners = [];
          }

          var otherListeners = this.__manager__P_102_0.getListeners(currentWidget, type, !capture);

          if (otherListeners) {
            listeners = listeners.concat(otherListeners);
          }
        }

        if (!listeners || listeners.length === 0) {
          return;
        } // Create cloned event with correct target


        var widgetEvent = qx.event.Pool.getInstance().getObject(domEvent.constructor);
        domEvent.clone(widgetEvent);
        widgetEvent.setTarget(widgetTarget);
        widgetEvent.setRelatedTarget(widgetRelatedTarget || null);
        widgetEvent.setCurrentTarget(currentWidget); // Keep original target of DOM event, otherwise map it to the original

        var orig = domEvent.getOriginalTarget();

        if (orig) {
          var widgetOriginalTarget = qx.ui.core.Widget.getWidgetByElement(orig);

          while (widgetOriginalTarget && widgetOriginalTarget.isAnonymous()) {
            widgetOriginalTarget = widgetOriginalTarget.getLayoutParent();
          }

          widgetEvent.setOriginalTarget(widgetOriginalTarget);
        } else {
          widgetEvent.setOriginalTarget(domTarget);
        } // Dispatch it on all listeners


        var tracker = {};
        qx.event.Utils.then(tracker, function () {
          return qx.event.Utils.series(listeners, function (listener) {
            var context = listener.context || currentWidget;
            return listener.handler.call(context, widgetEvent);
          });
        }); // Synchronize propagation stopped/prevent default property

        qx.event.Utils.then(tracker, function () {
          if (widgetEvent.getPropagationStopped()) {
            domEvent.stopPropagation();
          }

          if (widgetEvent.getDefaultPrevented()) {
            domEvent.preventDefault();
          }
        });
        return qx.event.Utils.then(tracker, function () {
          qx.event.Pool.getInstance().poolObject(widgetEvent);
        });
      },
      // interface implementation
      registerEvent: function registerEvent(target, type, capture) {
        var elem;

        if (type === "focus" || type === "blur") {
          elem = target.getFocusElement();
        } else {
          elem = target.getContentElement();
        }

        if (elem) {
          elem.addListener(type, this._dispatchEvent, this, capture);
        }
      },
      // interface implementation
      unregisterEvent: function unregisterEvent(target, type, capture) {
        var elem;

        if (type === "focus" || type === "blur") {
          elem = target.getFocusElement();
        } else {
          elem = target.getContentElement();
        }

        if (elem) {
          elem.removeListener(type, this._dispatchEvent, this, capture);
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__manager__P_102_0 = null;
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
  qx.ui.core.EventHandler.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {},
      "qx.core.Property": {}
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
   * A helper class for accessing the property system directly.
   *
   * This class is rather to be used internally. For all regular usage of the
   * property system the default API should be sufficient.
   */
  qx.Class.define("qx.util.PropertyUtil", {
    statics: {
      /**
       * Get the property map of the given class
       *
       * @param clazz {Class} a qooxdoo class
       * @return {Map} A properties map as defined in {@link qx.Class#define}
       *   including the properties of included mixins and not including refined
       *   properties.
       */
      getProperties: function getProperties(clazz) {
        return clazz.$$properties;
      },

      /**
       * Get the property map of the given class including the properties of all
       * superclasses!
       *
       * @param clazz {Class} a qooxdoo class
       * @return {Map} The properties map as defined in {@link qx.Class#define}
       *   including the properties of included mixins of the current class and
       *   all superclasses.
       */
      getAllProperties: function getAllProperties(clazz) {
        var properties = {};
        var superclass = clazz; // go threw the class hierarchy

        while (superclass != qx.core.Object) {
          var currentProperties = this.getProperties(superclass);

          for (var property in currentProperties) {
            properties[property] = currentProperties[property];
          }

          superclass = superclass.superclass;
        }

        return properties;
      },

      /*
      -------------------------------------------------------------------------
        USER VALUES
      -------------------------------------------------------------------------
      */

      /**
       * Returns the user value of the given property
       *
       * @param object {Object} The object to access
       * @param propertyName {String} The name of the property
       * @return {var} The user value
       */
      getUserValue: function getUserValue(object, propertyName) {
        return object["$$user_" + propertyName];
      },

      /**
       * Sets the user value of the given property
       *
       * @param object {Object} The object to access
       * @param propertyName {String} The name of the property
       * @param value {var} The value to set
       */
      setUserValue: function setUserValue(object, propertyName, value) {
        object["$$user_" + propertyName] = value;
      },

      /**
       * Deletes the user value of the given property
       *
       * @param object {Object} The object to access
       * @param propertyName {String} The name of the property
       */
      deleteUserValue: function deleteUserValue(object, propertyName) {
        delete object["$$user_" + propertyName];
      },

      /*
      -------------------------------------------------------------------------
        INIT VALUES
      -------------------------------------------------------------------------
      */

      /**
       * Returns the init value of the given property
       *
       * @param object {Object} The object to access
       * @param propertyName {String} The name of the property
       * @return {var} The init value
       */
      getInitValue: function getInitValue(object, propertyName) {
        return object["$$init_" + propertyName];
      },

      /**
       * Sets the init value of the given property
       *
       * @param object {Object} The object to access
       * @param propertyName {String} The name of the property
       * @param value {var} The value to set
       */
      setInitValue: function setInitValue(object, propertyName, value) {
        object["$$init_" + propertyName] = value;
      },

      /**
       * Deletes the init value of the given property
       *
       * @param object {Object} The object to access
       * @param propertyName {String} The name of the property
       */
      deleteInitValue: function deleteInitValue(object, propertyName) {
        delete object["$$init_" + propertyName];
      },

      /*
      -------------------------------------------------------------------------
        THEME VALUES
      -------------------------------------------------------------------------
      */

      /**
       * Returns the theme value of the given property
       *
       * @param object {Object} The object to access
       * @param propertyName {String} The name of the property
       * @return {var} The theme value
       */
      getThemeValue: function getThemeValue(object, propertyName) {
        return object["$$theme_" + propertyName];
      },

      /**
       * Sets the theme value of the given property
       *
       * @param object {Object} The object to access
       * @param propertyName {String} The name of the property
       * @param value {var} The value to set
       */
      setThemeValue: function setThemeValue(object, propertyName, value) {
        object["$$theme_" + propertyName] = value;
      },

      /**
       * Deletes the theme value of the given property
       *
       * @param object {Object} The object to access
       * @param propertyName {String} The name of the property
       */
      deleteThemeValue: function deleteThemeValue(object, propertyName) {
        delete object["$$theme_" + propertyName];
      },

      /*
      -------------------------------------------------------------------------
        THEMED PROPERTY
      -------------------------------------------------------------------------
      */

      /**
       * Sets a themed property
       *
       * @param object {Object} The object to access
       * @param propertyName {String} The name of the property
       * @param value {var} The value to set
       */
      setThemed: function setThemed(object, propertyName, value) {
        var styler = qx.core.Property.$$method.setThemed;
        object[styler[propertyName]](value);
      },

      /**
       * Resets a themed property
       *
       * @param object {Object} The object to access
       * @param propertyName {String} The name of the property
       */
      resetThemed: function resetThemed(object, propertyName) {
        var unstyler = qx.core.Property.$$method.resetThemed;
        object[unstyler[propertyName]]();
      }
    }
  });
  qx.util.PropertyUtil.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.MPlacement": {
        "require": true
      },
      "qx.ui.core.MRemoteChildrenHandling": {
        "require": true
      },
      "qx.ui.menu.Layout": {
        "construct": true
      },
      "qx.ui.core.Blocker": {
        "construct": true
      },
      "qx.ui.menu.Separator": {},
      "qx.ui.menu.Manager": {},
      "qx.ui.menu.AbstractButton": {},
      "qx.ui.menu.MenuSlideBar": {},
      "qx.ui.layout.Grow": {},
      "qx.lang.Array": {},
      "qx.ui.core.queue.Widget": {},
      "qx.core.ObjectRegistry": {}
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
   * The menu is a popup like control which supports buttons. It comes
   * with full keyboard navigation and an improved timeout based pointer
   * control behavior.
   *
   * This class is the container for all derived instances of
   * {@link qx.ui.menu.AbstractButton}.
   *
   * @childControl slidebar {qx.ui.menu.MenuSlideBar} shows a slidebar to easily navigate inside the menu (if too little space is left)
   */
  qx.Class.define("qx.ui.menu.Menu", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MPlacement, qx.ui.core.MRemoteChildrenHandling],
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this); // Use hard coded layout

      this._setLayout(new qx.ui.menu.Layout()); // Automatically add to application's root


      var root = this.getApplicationRoot();
      root.add(this); // ARIA attrs

      var contentEl = this.getContentElement();
      contentEl.setAttribute("role", "menu");
      contentEl.setAttribute("id", "menu-" + this.toHashCode()); // Register pointer listeners

      this.addListener("pointerover", this._onPointerOver);
      this.addListener("pointerout", this._onPointerOut); // add resize listener

      this.addListener("resize", this._onResize, this);
      root.addListener("resize", this._onResize, this);
      this._blocker = new qx.ui.core.Blocker(root); // Initialize properties

      this.initVisibility();
      this.initKeepFocus();
      this.initKeepActive();
    },
    properties: {
      /*
      ---------------------------------------------------------------------------
        WIDGET PROPERTIES
      ---------------------------------------------------------------------------
      */
      // overridden
      appearance: {
        refine: true,
        init: "menu"
      },
      // overridden
      allowGrowX: {
        refine: true,
        init: false
      },
      // overridden
      allowGrowY: {
        refine: true,
        init: false
      },
      // overridden
      visibility: {
        refine: true,
        init: "excluded"
      },
      // overridden
      keepFocus: {
        refine: true,
        init: true
      },
      // overridden
      keepActive: {
        refine: true,
        init: true
      },

      /*
      ---------------------------------------------------------------------------
        STYLE OPTIONS
      ---------------------------------------------------------------------------
      */

      /** The spacing between each cell of the menu buttons */
      spacingX: {
        check: "Integer",
        apply: "_applySpacingX",
        init: 0,
        themeable: true
      },

      /** The spacing between each menu button */
      spacingY: {
        check: "Integer",
        apply: "_applySpacingY",
        init: 0,
        themeable: true
      },

      /**
       * Default icon column width if no icons are rendered.
       * This property is ignored as soon as an icon is present.
       */
      iconColumnWidth: {
        check: "Integer",
        init: 0,
        themeable: true,
        apply: "_applyIconColumnWidth"
      },

      /** Default arrow column width if no sub menus are rendered */
      arrowColumnWidth: {
        check: "Integer",
        init: 0,
        themeable: true,
        apply: "_applyArrowColumnWidth"
      },

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
      },

      /*
      ---------------------------------------------------------------------------
        FUNCTIONALITY PROPERTIES
      ---------------------------------------------------------------------------
      */

      /** The currently selected button */
      selectedButton: {
        check: "qx.ui.core.Widget",
        nullable: true,
        apply: "_applySelectedButton"
      },

      /** The currently opened button (sub menu is visible) */
      openedButton: {
        check: "qx.ui.core.Widget",
        nullable: true,
        apply: "_applyOpenedButton"
      },

      /** Widget that opened the menu */
      opener: {
        check: "qx.ui.core.Widget",
        nullable: true,
        apply: "_applyOpener"
      },

      /*
      ---------------------------------------------------------------------------
        BEHAVIOR PROPERTIES
      ---------------------------------------------------------------------------
      */

      /** Interval in ms after which sub menus should be opened */
      openInterval: {
        check: "Integer",
        themeable: true,
        init: 250,
        apply: "_applyOpenInterval"
      },

      /** Interval in ms after which sub menus should be closed  */
      closeInterval: {
        check: "Integer",
        themeable: true,
        init: 250,
        apply: "_applyCloseInterval"
      },

      /** Blocks the background if value is <code>true<code> */
      blockBackground: {
        check: "Boolean",
        themeable: true,
        init: false
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __scheduledOpen__P_84_0: null,
      __onAfterSlideBarAdd__P_84_1: null,

      /** @type {qx.ui.core.Blocker} blocker for background blocking */
      _blocker: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * Opens the menu and configures the opener
       */
      open: function open() {
        if (this.getOpener() != null) {
          var isPlaced = this.placeToWidget(this.getOpener(), true);

          if (isPlaced) {
            this.__updateSlideBar__P_84_2();

            this.show();
            this._placementTarget = this.getOpener();
          } else {
            this.warn("Could not open menu instance because 'opener' widget is not visible");
          }
        } else {
          this.warn("The menu instance needs a configured 'opener' widget!");
        }
      },

      /**
       * Opens the menu at the pointer position
       *
       * @param e {qx.event.type.Pointer} Pointer event to align to
       */
      openAtPointer: function openAtPointer(e) {
        this.placeToPointer(e);

        this.__updateSlideBar__P_84_2();

        this.show();
        this._placementTarget = {
          left: e.getDocumentLeft(),
          top: e.getDocumentTop()
        };
      },

      /**
       * Opens the menu in relation to the given point
       *
       * @param point {Map} Coordinate of any point with the keys <code>left</code>
       *   and <code>top</code>.
       */
      openAtPoint: function openAtPoint(point) {
        this.placeToPoint(point);

        this.__updateSlideBar__P_84_2();

        this.show();
        this._placementTarget = point;
      },

      /**
       * Convenience method to add a separator to the menu
       */
      addSeparator: function addSeparator() {
        this.add(new qx.ui.menu.Separator());
      },

      /**
       * Returns the column sizes detected during the pre-layout phase
       *
       * @return {Array} List of all column widths
       */
      getColumnSizes: function getColumnSizes() {
        return this._getMenuLayout().getColumnSizes();
      },

      /**
       * Return all selectable menu items.
       *
       * @return {qx.ui.core.Widget[]} selectable widgets
       */
      getSelectables: function getSelectables() {
        var result = [];
        var children = this.getChildren();

        for (var i = 0; i < children.length; i++) {
          if (children[i].isEnabled()) {
            result.push(children[i]);
          }
        }

        return result;
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyIconColumnWidth: function _applyIconColumnWidth(value, old) {
        this._getMenuLayout().setIconColumnWidth(value);
      },
      // property apply
      _applyArrowColumnWidth: function _applyArrowColumnWidth(value, old) {
        this._getMenuLayout().setArrowColumnWidth(value);
      },
      // property apply
      _applySpacingX: function _applySpacingX(value, old) {
        this._getMenuLayout().setColumnSpacing(value);
      },
      // property apply
      _applySpacingY: function _applySpacingY(value, old) {
        this._getMenuLayout().setSpacing(value);
      },
      // overridden
      _applyVisibility: function _applyVisibility(value, old) {
        qx.ui.menu.Menu.superclass.prototype._applyVisibility.call(this, value, old);

        var mgr = qx.ui.menu.Manager.getInstance();

        if (value === "visible") {
          // Register to manager (zIndex handling etc.)
          mgr.add(this); // Mark opened in parent menu

          var parentMenu = this.getParentMenu();

          if (parentMenu) {
            parentMenu.setOpenedButton(this.getOpener());
          }
        } else if (old === "visible") {
          // Deregister from manager (zIndex handling etc.)
          mgr.remove(this); // Unmark opened in parent menu

          var parentMenu = this.getParentMenu();

          if (parentMenu && parentMenu.getOpenedButton() == this.getOpener()) {
            parentMenu.resetOpenedButton();
          } // Clear properties


          this.resetOpenedButton();
          this.resetSelectedButton();
        }

        this.__updateBlockerVisibility__P_84_3();
      },

      /**
       * Updates the blocker's visibility
       */
      __updateBlockerVisibility__P_84_3: function __updateBlockerVisibility__P_84_3() {
        if (this.isVisible()) {
          if (this.getBlockBackground()) {
            var zIndex = this.getZIndex();

            this._blocker.blockContent(zIndex - 1);
          }
        } else {
          if (this._blocker.isBlocked()) {
            this._blocker.unblock();
          }
        }
      },

      /**
       * Get the parent menu. Returns <code>null</code> if the menu doesn't have a
       * parent menu.
       *
       * @return {qx.ui.core.Widget|null} The parent menu.
       */
      getParentMenu: function getParentMenu() {
        var widget = this.getOpener();

        if (!widget || !(widget instanceof qx.ui.menu.AbstractButton)) {
          return null;
        }

        if (widget && widget.getContextMenu() === this) {
          return null;
        }

        while (widget && !(widget instanceof qx.ui.menu.Menu)) {
          widget = widget.getLayoutParent();
        }

        return widget;
      },
      // property apply
      _applySelectedButton: function _applySelectedButton(value, old) {
        if (old) {
          old.removeState("selected");
        }

        if (value) {
          value.addState("selected");
        } // ARIA attrs


        var opener = this.__getRootOpener__P_84_4();

        var contentEl = opener ? opener.getContentElement() : this.getContentElement();

        if (!contentEl) {
          return;
        }

        var valueContentEl = value ? value.getContentElement() : null;

        if (valueContentEl) {
          contentEl.setAttribute("aria-activedescendant", valueContentEl.getAttribute("id"));
        } else {
          contentEl.removeAttribute("aria-activedescendant");
        }
      },
      // property apply
      _applyOpenedButton: function _applyOpenedButton(value, old) {
        if (old && old.getMenu()) {
          old.getMenu().exclude();
        }

        if (value) {
          value.getMenu().open();
        }
      },
      // property apply
      _applyOpener: function _applyOpener(value, old) {
        // ARIA attrs
        var contentEl = this.getContentElement();

        if (!contentEl) {
          return;
        }

        if (value && value.getContentElement()) {
          contentEl.setAttribute("aria-labelledby", "");
          this.addAriaLabelledBy(value);
        } else {
          contentEl.removeAttribute("aria-labelledby");
        }
      },
      // property apply
      _applyBlockerColor: function _applyBlockerColor(value, old) {
        this._blocker.setColor(value);
      },
      // property apply
      _applyBlockerOpacity: function _applyBlockerOpacity(value, old) {
        this._blocker.setOpacity(value);
      },

      /*
      ---------------------------------------------------------------------------
      SCROLLING SUPPORT
      ---------------------------------------------------------------------------
      */
      // overridden
      getChildrenContainer: function getChildrenContainer() {
        return this.getChildControl("slidebar", true) || this;
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "slidebar":
            var control = new qx.ui.menu.MenuSlideBar();

            var layout = this._getLayout();

            this._setLayout(new qx.ui.layout.Grow());

            var slidebarLayout = control.getLayout();
            control.setLayout(layout);
            slidebarLayout.dispose();
            var children = qx.lang.Array.clone(this.getChildren());

            for (var i = 0; i < children.length; i++) {
              control.add(children[i]);
            }

            this.removeListener("resize", this._onResize, this);
            control.getChildrenContainer().addListener("resize", this._onResize, this);

            this._add(control);

            break;
        }

        return control || qx.ui.menu.Menu.superclass.prototype._createChildControlImpl.call(this, id);
      },

      /**
       * Get the menu layout manager
       *
       * @return {qx.ui.layout.Abstract} The menu layout manager
       */
      _getMenuLayout: function _getMenuLayout() {
        if (this.hasChildControl("slidebar")) {
          return this.getChildControl("slidebar").getChildrenContainer().getLayout();
        } else {
          return this._getLayout();
        }
      },

      /**
       * Get the menu bounds
       *
       * @return {Map} The menu bounds
       */
      _getMenuBounds: function _getMenuBounds() {
        if (this.hasChildControl("slidebar")) {
          return this.getChildControl("slidebar").getChildrenContainer().getBounds();
        } else {
          return this.getBounds();
        }
      },

      /**
       * Computes the size of the menu. This method is used by the
       * {@link qx.ui.core.MPlacement} mixin.
       * @return {Map} The menu bounds
       */
      _computePlacementSize: function _computePlacementSize() {
        return this._getMenuBounds();
      },

      /**
       * Updates the visibility of the slidebar based on the menu's current size
       * and position.
       */
      __updateSlideBar__P_84_2: function __updateSlideBar__P_84_2() {
        var menuBounds = this._getMenuBounds();

        if (!menuBounds) {
          this.addListenerOnce("resize", this.__updateSlideBar__P_84_2, this);
          return;
        }

        var rootHeight = this.getLayoutParent().getBounds().height;
        var top = this.getLayoutProperties().top;
        var left = this.getLayoutProperties().left; // Adding the slidebar must be deferred because this call can happen
        // during the layout flush, which make it impossible to move existing
        // layout to the slidebar

        if (top < 0) {
          this._assertSlideBar(function () {
            this.setHeight(menuBounds.height + top);
            this.moveTo(left, 0);
          });
        } else if (top + menuBounds.height > rootHeight) {
          this._assertSlideBar(function () {
            this.setHeight(rootHeight - top);
          });
        } else {
          this.setHeight(null);
        }
      },

      /**
       * Schedules the addition of the slidebar and calls the given callback
       * after the slidebar has been added.
       *
       * @param callback {Function} the callback to call
       * @return {var|undefined} The return value of the callback if the slidebar
       * already exists, or <code>undefined</code> if it doesn't
       */
      _assertSlideBar: function _assertSlideBar(callback) {
        if (this.hasChildControl("slidebar")) {
          return callback.call(this);
        }

        this.__onAfterSlideBarAdd__P_84_1 = callback;
        qx.ui.core.queue.Widget.add(this);
      },
      // overridden
      syncWidget: function syncWidget(jobs) {
        this.getChildControl("slidebar");

        if (this.__onAfterSlideBarAdd__P_84_1) {
          this.__onAfterSlideBarAdd__P_84_1.call(this);

          delete this.__onAfterSlideBarAdd__P_84_1;
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * Gets called when a child is added. Sets ARIA attrs
       * @param {*} child
       */
      _afterAddChild: function _afterAddChild(child) {
        // Some childs, e.g. Seperators, are no meaningful menu items
        if (child instanceof qx.ui.menu.AbstractButton) {
          var contentEl = child.getContentElement();
          contentEl.setAttribute("id", "menu-item-" + child.toHashCode());
          contentEl.setAttribute("role", "menuitem");
        }
      },

      /**
       * Update position if the menu or the root is resized
       */
      _onResize: function _onResize() {
        if (this.isVisible()) {
          var target = this._placementTarget;

          if (!target) {
            return;
          } else if (target instanceof qx.ui.core.Widget) {
            this.placeToWidget(target, true);
          } else if (target.top !== undefined) {
            this.placeToPoint(target);
          } else {
            throw new Error("Unknown target: " + target);
          }

          this.__updateSlideBar__P_84_2();
        }
      },

      /**
       * Event listener for pointerover event.
       *
       * @param e {qx.event.type.Pointer} pointerover event
       */
      _onPointerOver: function _onPointerOver(e) {
        // Cache manager
        var mgr = qx.ui.menu.Manager.getInstance(); // Be sure this menu is kept

        mgr.cancelClose(this); // Change selection

        var target = e.getTarget();

        if (target.isEnabled() && target instanceof qx.ui.menu.AbstractButton) {
          // Select button directly
          this.setSelectedButton(target);
          var subMenu = target.getMenu && target.getMenu();

          if (subMenu) {
            subMenu.setOpener(target); // Finally schedule for opening

            mgr.scheduleOpen(subMenu); // Remember scheduled menu for opening

            this.__scheduledOpen__P_84_0 = subMenu;
          } else {
            var opened = this.getOpenedButton();

            if (opened) {
              mgr.scheduleClose(opened.getMenu());
            }

            if (this.__scheduledOpen__P_84_0) {
              mgr.cancelOpen(this.__scheduledOpen__P_84_0);
              this.__scheduledOpen__P_84_0 = null;
            }
          }
        } else if (!this.getOpenedButton()) {
          // When no button is opened reset the selection
          // Otherwise keep it
          this.resetSelectedButton();
        }
      },

      /**
       * Event listener for pointerout event.
       *
       * @param e {qx.event.type.Pointer} pointerout event
       */
      _onPointerOut: function _onPointerOut(e) {
        // Cache manager
        var mgr = qx.ui.menu.Manager.getInstance(); // Detect whether the related target is out of the menu

        if (!qx.ui.core.Widget.contains(this, e.getRelatedTarget())) {
          // Update selected property
          // Force it to the open sub menu in cases where that is opened
          // Otherwise reset it. Menus which are left by the cursor should
          // not show any selection.
          var opened = this.getOpenedButton();
          opened ? this.setSelectedButton(opened) : this.resetSelectedButton(); // Cancel a pending close request for the currently
          // opened sub menu

          if (opened) {
            mgr.cancelClose(opened.getMenu());
          } // When leaving this menu to the outside, stop
          // all pending requests to open any other sub menu


          if (this.__scheduledOpen__P_84_0) {
            mgr.cancelOpen(this.__scheduledOpen__P_84_0);
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        HELPER FUNCTIONS
      ---------------------------------------------------------------------------
      */

      /**
       * Get the opener of the root/the first parent menu.
       * parent menu.
       *
       * @return {qx.ui.core.Widget|null} The opener.
       */
      __getRootOpener__P_84_4: function __getRootOpener__P_84_4() {
        var parentMenu = this.getParentMenu();

        if (!parentMenu) {
          return this.getOpener();
        }

        var opener;

        while (parentMenu) {
          opener = parentMenu.getOpener();
          parentMenu = parentMenu.getParentMenu();
        }

        return opener;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (!qx.core.ObjectRegistry.inShutDown) {
        qx.ui.menu.Manager.getInstance().remove(this);
      }

      this.getApplicationRoot().removeListener("resize", this._onResize, this);
      this._placementTarget = null;

      this._disposeObjects("_blocker");
    }
  });
  qx.ui.menu.Menu.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "defer": "runtime",
        "require": true
      },
      "qx.core.ObjectRegistry": {},
      "qx.core.Object": {},
      "qx.core.MAssert": {
        "defer": "runtime"
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
       * Jonathan Weiß (jonathan_rass)
  
     ======================================================================
  
       This class uses documentation of the native String methods from the MDC
       documentation of Mozilla.
  
       License:
         CC Attribution-Sharealike License:
         http://creativecommons.org/licenses/by-sa/2.5/
  
  ************************************************************************ */

  /**
   * This class emulates the built-in JavaScript String class. It can be used as
   * base class for classes, which need to derive from String.
   *
   * Instances of this class can be used in any place a JavaScript string can.
   */
  qx.Class.define("qx.type.BaseString", {
    extend: Object,

    /**
     * @param txt {String?""} Initialize with this string
     */
    construct: function construct(txt) {
      var txt = txt || ""; // no base call needed

      this.__txt__P_163_0 = txt;
      this.length = txt.length;
    },
    members: {
      $$isString: true,
      length: 0,
      __txt__P_163_0: null,

      /**
       * Returns a string representing the specified object.
       *
       * The valueOf method of String returns the primitive value of a String
       * object as a string data type.
       * This method is usually called internally by JavaScript and not
       * explicitly in code.
       *
       * @return {String} A new string containing the string value.
       */
      toString: function toString() {
        return this.__txt__P_163_0;
      },

      /**
       *  Returns the specified character from a string.
       *
       * Characters in a string are indexed from left to right. The index of the
       * first character is 0, and the index of the last character in a string
       * called stringName is stringName.length - 1. If the index you supply is
       * out of range, JavaScript returns an empty string.
       *
       * @signature function(index)
       * @param index {Integer} An integer between 0 and 1 less than the length
       *   of the string.
       * @return {String} The character.
       */
      charAt: null,

      /**
       * Returns the primitive value of a String object.
       *
       * The valueOf method of String returns the primitive value of a String
       * object as a string data type.
       * This method is usually called internally by JavaScript and not
       * explicitly in code.
       *
       * @signature function()
       * @return {String} A new string containing the primitive value.
       */
      valueOf: null,

      /**
       * Returns a number indicating the Unicode value of the character at the given index.
       *
       * @signature function(index)
       * @param index {Integer} An integer greater than 0 and less than the length
       *   of the string; if it is not a number, it defaults to 0.
       * @return {Integer} The number.
       */
      charCodeAt: null,

      /**
       * Combines the text of two or more strings and returns a new string.
       * Changes to the text in one string do not affect the other string.
       *
       * @signature function(stringN)
       * @param stringN {String} One or more strings to be combined.
       * @return {String} The combined string.
       */
      concat: null,

      /**
       * Returns the index within the calling String object of the first
       * occurrence of the specified value, starting the search at fromIndex,
       * returns -1 if the value is not found.
       *
       * @signature function(index, offset)
       * @param index {String} A string representing the value to search for.
       * @param offset {Integer?0} The location within the calling string to start
       *   the search from. It can be any integer between 0 and the length of the
       *   string. The default value is 0.
       * @return {Integer} The index or -1.
       */
      indexOf: null,

      /**
       * Returns the index within the calling String object of the last occurrence
       * of the specified value, or -1 if not found. The calling string is
       * searched backward, starting at fromIndex.
       *
       * @signature function(index, offset)
       * @param index {String} A string representing the value to search for.
       * @param offset {Integer?0} The location within the calling string to start
       *   the search from, indexed from left to right. It can be any integer
       *   between 0 and the length of the string. The default value is the length
       *    of the string.
       * @return {Integer} The index or -1.
       */
      lastIndexOf: null,

      /**
       * Used to retrieve the matches when matching a string against a regular
       * expression.
       *
       * If the regular expression does not include the g flag, returns the same
       * result as regexp.exec(string). If the regular expression includes the g
       * flag, the method returns an Array containing all matches.
       *
       * @signature function(regexp)
       * @param regexp {Object} A regular expression object. If a non-RegExp object
       *  obj is passed, it is implicitly converted to a RegExp by using
       *   new RegExp(obj).
       * @return {Object} The matching RegExp object or an array containing all
       *   matches.
       */
      match: null,

      /**
       * Finds a match between a regular expression and a string, and replaces the
       * matched substring with a new substring.
       *
       * @signature function(regexp, aFunction)
       * @param regexp {Object} A RegExp object. The match is replaced by the
       *   return value of parameter #2. Or a String that is to be replaced by
       *   newSubStr.
       * @param aFunction {Function} A function to be invoked to create the new
       *   substring (to put in place of the substring received from parameter
       *   #1).
       * @return {String} The new substring.
       */
      replace: null,

      /**
       * Executes the search for a match between a regular expression and this
       * String object.
       *
       * If successful, search returns the index of the regular expression inside
       * the string. Otherwise, it returns -1.
       *
       * @signature function(regexp)
       * @param regexp {Object} A regular expression object. If a non-RegExp object
       *  obj is passed, it is implicitly converted to a RegExp by using
       *   new RegExp(obj).
       * @return {Object} The matching RegExp object or -1.
       *   matches.
       */
      search: null,

      /**
       * Extracts a section of a string and returns a new string.
       *
       * Slice extracts the text from one string and returns a new string. Changes
       * to the text in one string do not affect the other string.
       * As a negative index, endSlice indicates an offset from the end of the
       * string.
       *
       * @signature function(beginslice, endSlice)
       * @param beginslice {Integer} The zero-based index at which to begin
       *   extraction.
       * @param endSlice {Integer?null} The zero-based index at which to end
       *   extraction. If omitted, slice extracts to the end of the string.
       * @return {String} The extracted string.
       */
      slice: null,

      /**
       * Splits a String object into an array of strings by separating the string
       * into substrings.
       *
       * When found, separator is removed from the string and the substrings are
       * returned in an array. If separator is omitted, the array contains one
       * element consisting of the entire string.
       *
       * If separator is a regular expression that contains capturing parentheses,
       * then each time separator is matched the results (including any undefined
       * results) of the capturing parentheses are spliced into the output array.
       * However, not all browsers support this capability.
       *
       * Note: When the string is empty, split returns an array containing one
       *
       * @signature function(separator, limit)
       * @param separator {String?null} Specifies the character to use for
       *   separating the string. The separator is treated as a string or a regular
       *   expression. If separator is omitted, the array returned contains one
       *   element consisting of the entire string.
       * @param limit {Integer?null} Integer specifying a limit on the number of
       *   splits to be found.
       * @return {Array} The Array containing substrings.
       */
      split: null,

      /**
       * Returns the characters in a string beginning at the specified location
       * through the specified number of characters.
       *
       * Start is a character index. The index of the first character is 0, and the
       * index of the last character is 1 less than the length of the string. substr
       *  begins extracting characters at start and collects length characters
       * (unless it reaches the end of the string first, in which case it will
       * return fewer).
       * If start is positive and is greater than or equal to the length of the
       * string, substr returns an empty string.
       *
       * @signature function(start, length)
       * @param start {Integer} Location at which to begin extracting characters
       *   (an integer between 0 and one less than the length of the string).
       * @param length {Integer?null} The number of characters to extract.
       * @return {String} The substring.
       */
      substr: null,

      /**
       * Returns a subset of a String object.
       *
       * substring extracts characters from indexA up to but not including indexB.
       * In particular:
       * If indexA equals indexB, substring returns an empty string.
       * If indexB is omitted, substring extracts characters to the end of the
       * string.
       * If either argument is less than 0 or is NaN, it is treated as if it were
       * 0.
       * If either argument is greater than stringName.length, it is treated as if
       * it were stringName.length.
       * If indexA is larger than indexB, then the effect of substring is as if
       * the two arguments were swapped; for example, str.substring(1, 0) == str.substring(0, 1).
       *
       * @signature function(indexA, indexB)
       * @param indexA {Integer} An integer between 0 and one less than the
       *   length of the string.
       * @param indexB {Integer?null} (optional) An integer between 0 and the
       *   length of the string.
       * @return {String} The subset.
       */
      substring: null,

      /**
       * Returns the calling string value converted to lowercase.
       * The toLowerCase method returns the value of the string converted to
       * lowercase. toLowerCase does not affect the value of the string itself.
       *
       * @signature function()
       * @return {String} The new string.
       */
      toLowerCase: null,

      /**
       * Returns the calling string value converted to uppercase.
       * The toUpperCase method returns the value of the string converted to
       * uppercase. toUpperCase does not affect the value of the string itself.
       *
       * @signature function()
       * @return {String} The new string.
       */
      toUpperCase: null,

      /**
       * Return unique hash code of object
       *
       * @return {Integer} unique hash code of the object
       */
      toHashCode: function toHashCode() {
        return qx.core.ObjectRegistry.toHashCode(this);
      },

      /**
       * The characters within a string are converted to lower case while
       * respecting the current locale.
       *
       * The toLowerCase method returns the value of the string converted to
       * lowercase. toLowerCase does not affect the value of the string itself.
       *
       * @signature function()
       * @return {String} The new string.
       */
      toLocaleLowerCase: null,

      /**
       * The characters within a string are converted to upper case while
       * respecting the current locale.
       * The toUpperCase method returns the value of the string converted to
       * uppercase. toUpperCase does not affect the value of the string itself.
       *
       * @signature function()
       * @return {String} The new string.
       */
      toLocaleUpperCase: null,

      /**
       * Call the same method of the super class.
       *
       * @param args {arguments} the arguments variable of the calling method
       * @param varags {var} variable number of arguments passed to the overwritten function
       * @return {var} the return value of the method of the base class.
       */
      base: function base(args, varags) {
        return qx.core.Object.prototype.base.apply(this, arguments);
      }
    },

    /*
     *****************************************************************************
        DEFER
     *****************************************************************************
     */
    defer: function defer(statics, members) {
      // add asserts into each debug build
      {
        qx.Class.include(statics, qx.core.MAssert);
      }
      var mappedFunctions = ["charAt", "charCodeAt", "concat", "indexOf", "lastIndexOf", "match", "replace", "search", "slice", "split", "substr", "substring", "toLowerCase", "toUpperCase", "toLocaleLowerCase", "toLocaleUpperCase", "trim", "codePointAt"]; // feature/bug detection:
      // Some older Firefox version (<2) break if valueOf is overridden

      members.valueOf = members.toString;

      if (new statics("").valueOf() == null) {
        delete members.valueOf;
      }

      for (var i = 0, l = mappedFunctions.length; i < l; i++) {
        members[mappedFunctions[i]] = String.prototype[mappedFunctions[i]];
      }
    }
  });
  qx.type.BaseString.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.type.BaseString": {
        "construct": true,
        "require": true
      },
      "qx.locale.Manager": {}
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
   * This class contains the translation of a message and all information
   * to translate it again into a different language.
   */
  qx.Class.define("qx.locale.LocalizedString", {
    extend: qx.type.BaseString,

    /**
     * @param translation {String} The translated message
     * @param messageId {String} The messageId to translate
     * @param args {Array} list of arguments passed used as values for format strings
     * @param localized {Boolean} True if the string uses localize instead of translate
     */
    construct: function construct(translation, messageId, args, localized) {
      qx.type.BaseString.constructor.call(this, translation);
      this.__messageId__P_137_0 = messageId;
      this.__localized__P_137_1 = !!localized;
      this.__args__P_137_2 = args;
    },
    members: {
      __localized__P_137_1: null,
      __messageId__P_137_0: null,
      __args__P_137_2: null,

      /**
       * Get a translation of the string using the current locale.
       *
       * @return {qx.locale.LocalizedString|String} This string translated using the current
       *    locale.
       */
      translate: function translate() {
        if (this.__localized__P_137_1) {
          return qx.locale.Manager.getInstance().localize(this.__messageId__P_137_0, this.__args__P_137_2);
        }

        return qx.locale.Manager.getInstance().translate(this.__messageId__P_137_0, this.__args__P_137_2);
      },

      /**
       * Returns the messageId.
       *
       * @return {String} The messageId of this localized String
       */
      getMessageId: function getMessageId() {
        return this.__messageId__P_137_0;
      }
    }
  });
  qx.locale.LocalizedString.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.bom.client.OperatingSystem": {
        "require": true,
        "defer": "runtime"
      },
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Type": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["locale", "locale.variant", "locale.default"],
      "required": {}
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * This class comes with all relevant information regarding
   * the client's selected locale.
   *
   * This class is used by {@link qx.core.Environment} and should not be used
   * directly. Please check its class comment for details how to use it.
   *
   * @internal
   * @require(qx.bom.client.OperatingSystem)
   */
  qx.Bootstrap.define("qx.bom.client.Locale", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * The name of the system locale e.g. "de" when the full locale is "de_AT"
       * @return {String} The current locale
       * @internal
       */
      getLocale: function getLocale() {
        var locale = qx.bom.client.Locale.__getNavigatorLocale__P_138_0();

        var index = locale.indexOf("-");

        if (index != -1) {
          locale = locale.substr(0, index);
        }

        return locale;
      },

      /**
       * The name of the variant for the system locale e.g. "at" when the
       * full locale is "de_AT"
       *
       * @return {String} The locales variant.
       * @internal
       */
      getVariant: function getVariant() {
        var locale = qx.bom.client.Locale.__getNavigatorLocale__P_138_0();

        var variant = "";
        var index = locale.indexOf("-");

        if (index != -1) {
          variant = locale.substr(index + 1);
        }

        return variant;
      },

      /**
       * Internal helper for accessing the navigators language.
       *
       * @return {String} The language set by the navigator.
       */
      __getNavigatorLocale__P_138_0: function __getNavigatorLocale__P_138_0() {
        var locale = navigator.userLanguage || navigator.language || ""; // Android Bug: Android does not return the system language from the
        // navigator language before version 4.4.x. Try to parse the language
        // from the userAgent.
        // See http://code.google.com/p/android/issues/detail?id=4641

        if (qx.bom.client.OperatingSystem.getName() == "android") {
          var version = /^(\d+)\.(\d+)(\..+)?/i.exec(qx.bom.client.OperatingSystem.getVersion());

          if (qx.lang.Type.isArray(version) && version.length >= 3) {
            if (parseInt(version[1]) < 4 || parseInt(version[1]) === 4 && parseInt(version[2]) < 4) {
              var match = /(\w{2})-(\w{2})/i.exec(navigator.userAgent);

              if (match) {
                locale = match[0];
              }
            }
          }
        }

        return locale.toLowerCase();
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("locale", statics.getLocale);
      qx.core.Environment.add("locale.variant", statics.getVariant);
      qx.core.Environment.add("locale.default", "C");
    }
  });
  qx.bom.client.Locale.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.event.dispatch.Direct": {
        "require": true
      },
      "qx.locale.LocalizedString": {
        "require": true
      },
      "qx.bom.client.Locale": {
        "require": true
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
      "qx.lang.Array": {},
      "qx.log.Logger": {},
      "qx.lang.String": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "locale": {
          "className": "qx.bom.client.Locale"
        },
        "locale.default": {
          "className": "qx.bom.client.Locale",
          "load": true
        },
        "locale.variant": {
          "className": "qx.bom.client.Locale"
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
   * The qx.locale.Manager provides static translation methods (like tr()) and
   * general locale information.
   *
   * @require(qx.event.dispatch.Direct)
   * @require(qx.locale.LocalizedString)
   * @require(qx.bom.client.Locale)
   *
   * Note: "translating" the empty string, e.g. tr("") will return the header
   * of the respective .po file. See also https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html#PO-Files
   *
   * @cldr()
   */
  qx.Class.define("qx.locale.Manager", {
    type: "singleton",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__translations__P_86_0 = qx.$$translations || {};
      this.__locales__P_86_1 = qx.$$locales || {};
      this.initLocale();
      this.__clientLocale__P_86_2 = this.getLocale();
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Translate a message
       *
       * @param messageId {String} message id (may contain format strings)
       * @param varargs {Object} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       * @see qx.lang.String.format
       */
      tr: function tr(messageId, varargs) {
        var args = qx.lang.Array.fromArguments(arguments, 1);
        return qx.locale.Manager.getInstance().translate(messageId, args);
      },

      /**
       * Translate a plural message
       *
       * Depending on the third argument the plural or the singular form is chosen.
       *
       * @param singularMessageId {String} message id of the singular form (may contain format strings)
       * @param pluralMessageId {String} message id of the plural form (may contain format strings)
       * @param count {Integer} singular form if equals 1, otherwise plural
       * @param varargs {Object} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       * @see qx.lang.String.format
       */
      trn: function trn(singularMessageId, pluralMessageId, count, varargs) {
        var args = qx.lang.Array.fromArguments(arguments);
        args.splice(0, 3); // assumes "Two forms, singular used for one only" (seems to be the most common form)
        // (http://www.gnu.org/software/gettext/manual/html_node/gettext_150.html#Plural-forms)
        // closely related with bug #745

        if (count != 1) {
          return qx.locale.Manager.getInstance().translate(pluralMessageId, args);
        } else {
          return qx.locale.Manager.getInstance().translate(singularMessageId, args);
        }
      },

      /**
       * Translate a message with translation hint (from developer addressed to translator).
       *
       * @param hint {String} hint for the translator of the message. Will be included in the .po file.
       * @param messageId {String} message id (may contain format strings)
       * @param varargs {Object} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       * @see qx.lang.String.format
       */
      trc: function trc(hint, messageId, varargs) {
        var args = qx.lang.Array.fromArguments(arguments);
        args.splice(0, 2);
        return qx.locale.Manager.getInstance().translate(messageId, args);
      },

      /**
       * Translate a plural message with translation hint (from developer addressed to translator).
       *
       * Depending on the third argument the plural or the singular form is chosen.
       *
       * @param hint {String} hint for the translator of the message. Will be included in the .po file.
       * @param singularMessageId {String} message id of the singular form (may contain format strings)
       * @param pluralMessageId {String} message id of the plural form (may contain format strings)
       * @param count {Integer} singular form if equals 1, otherwise plural
       * @param varargs {Object} variable number of arguments applied to the format string
       * @return {String | LocalizedString} The translated message or localized string
       * @see qx.lang.String.format
       */
      trnc: function trnc(hint, singularMessageId, pluralMessageId, count, varargs) {
        var args = qx.lang.Array.fromArguments(arguments);
        args.splice(0, 4); // see trn()

        if (count != 1) {
          return qx.locale.Manager.getInstance().translate(pluralMessageId, args);
        } else {
          return qx.locale.Manager.getInstance().translate(singularMessageId, args);
        }
      },

      /**
       * Mark the message for translation but return the original message.
       *
       * @param messageId {String} the message ID
       * @return {String} messageId
       */
      marktr: function marktr(messageId) {
        return messageId;
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** current locale. locale is an language code like de, de_AT, en, en_GB, fr, ... */
      locale: {
        check: "String",
        apply: "_applyLocale",
        event: "changeLocale",
        init: function () {
          var locale = qx.core.Environment.get("locale");

          if (!locale || locale === "") {
            return qx.core.Environment.get("locale.default");
          }

          var variant = qx.core.Environment.get("locale.variant");

          if (variant !== "") {
            locale += "_" + variant;
          }

          return locale;
        }()
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __defaultLocale__P_86_3: qx.core.Environment.get("locale.default"),
      __locale__P_86_4: null,
      __language__P_86_5: null,
      __translations__P_86_0: null,
      __locales__P_86_1: null,
      __clientLocale__P_86_2: null,

      /**
       * Get the language code of the current locale
       *
       * This is the first part of a locale definition. The language for "de_DE" would be "de"
       *
       * @return {String} language code
       */
      getLanguage: function getLanguage() {
        return this.__language__P_86_5;
      },

      /**
       * Get the territory code of the current locale
       *
       * This is the second part of a locale definition. The territory for "de_DE" would be "DE"
       *
       * @return {String} territory code
       */
      getTerritory: function getTerritory() {
        return this.getLocale().split("_")[1] || "";
      },

      /**
       * Return the available application locales
       *
       * This corresponds to the LOCALES setting in config.json. Without argument,
       * it only returns the currently loaded locales, with an argument of true
       * all locales that went into the build. This is particularly interesting if
       * locales were generated as dedicated I18N parts, and have to be loaded
       * explicitly before being available.
       *
       * @param includeNonloaded {Boolean?null} include locales not yet loaded
       * @return {String[]} array of available locales
       */
      getAvailableLocales: function getAvailableLocales(includeNonloaded) {
        var locales = [];

        for (var locale in this.__locales__P_86_1) {
          if (locale != this.__defaultLocale__P_86_3) {
            if (this.__locales__P_86_1[locale] === null && !includeNonloaded) {
              continue; // skip not yet loaded locales
            }

            locales.push(locale);
          }
        }

        return locales;
      },

      /**
       * Extract the language part from a locale.
       *
       * @param locale {String} locale to be used
       * @return {String} language
       */
      __extractLanguage__P_86_6: function __extractLanguage__P_86_6(locale) {
        var language;

        if (locale == null) {
          return null;
        }

        var pos = locale.indexOf("_");

        if (pos == -1) {
          language = locale;
        } else {
          language = locale.substring(0, pos);
        }

        return language;
      },
      // property apply
      _applyLocale: function _applyLocale(value, old) {
        {
          if (!(value in this.__locales__P_86_1 || value == this.__clientLocale__P_86_2)) {
            qx.log.Logger.warn("Locale: " + value + " not available.");
          }
        }
        this.__locale__P_86_4 = value;
        this.__language__P_86_5 = this.__extractLanguage__P_86_6(value);
      },

      /**
       * Add a translation to the translation manager.
       *
       * If <code>languageCode</code> already exists, its map will be updated with
       * <code>translationMap</code> (new keys will be added, existing keys will be
       * overwritten).
       *
       * @param languageCode {String} language code of the translation like <i>de, de_AT, en, en_GB, fr, ...</i>
       * @param translationMap {Map} mapping of message identifiers to message strings in the target
       *                             language, e.g. <i>{"greeting_short" : "Hello"}</i>. Plural forms
       *                             are separate keys.
       */
      addTranslation: function addTranslation(languageCode, translationMap) {
        var catalog = this.__translations__P_86_0;

        if (catalog[languageCode]) {
          for (var key in translationMap) {
            catalog[languageCode][key] = translationMap[key];
          }
        } else {
          catalog[languageCode] = translationMap;
        }
      },

      /**
       * Add a localization to the localization manager.
       *
       * If <code>localeCode</code> already exists, its map will be updated with
       * <code>localeMap</code> (new keys will be added, existing keys will be overwritten).
       *
       * @param localeCode {String} locale code of the translation like <i>de, de_AT, en, en_GB, fr, ...</i>
       * @param localeMap {Map} mapping of locale keys to the target locale values, e.g.
       *                        <i>{"cldr_date_format_short" : "M/d/yy"}</i>.
       */
      addLocale: function addLocale(localeCode, localeMap) {
        var catalog = this.__locales__P_86_1;

        if (catalog[localeCode]) {
          for (var key in localeMap) {
            catalog[localeCode][key] = localeMap[key];
          }
        } else {
          catalog[localeCode] = localeMap;
        }
      },

      /**
       * Translate a message using the current locale and apply format string to the arguments.
       *
       * Implements the lookup chain locale (e.g. en_US) -> language (e.g. en) ->
       * default locale (e.g. C). Localizes the arguments if possible and splices
       * them into the message. If qx.dynlocale is on, returns a {@link
       * LocalizedString}.
       *
       * @param messageId {String} message id (may contain format strings)
       * @param args {Object[]} array of objects, which are inserted into the format string
       * @param locale {String ? #locale} locale to be used; if not given, defaults to the value of {@link #locale}
       * @return {String | LocalizedString} translated message or localized string
       */
      translate: function translate(messageId, args, locale) {
        var catalog = this.__translations__P_86_0;
        return this.__lookupAndExpand__P_86_7(catalog, messageId, args, locale);
      },

      /**
       * Provide localization (CLDR) data.
       *
       * Implements the lookup chain locale (e.g. en_US) -> language (e.g. en) ->
       * default locale (e.g. C). Localizes the arguments if possible and splices
       * them into the message. If qx.dynlocale is on, returns a {@link
       * LocalizedString}.
       *
       * @param messageId {String} message id (may contain format strings)
       * @param args {Object[]} array of objects, which are inserted into the format string
       * @param locale {String ? #locale} locale to be used; if not given, defaults to the value of {@link #locale}
       * @return {String | LocalizedString} translated message or localized string
       */
      localize: function localize(messageId, args, locale) {
        var catalog = this.__locales__P_86_1;
        return this.__lookupAndExpand__P_86_7(catalog, messageId, args, locale);
      },

      /**
       * Look up an I18N key in a catalog and expand format strings.
       *
       * Implements the lookup chain locale (e.g. en_US) -> language (e.g. en) ->
       * default locale (e.g. C). Localizes the arguments if possible and splices
       * them into the message. If qx.dynlocale is on, returns a {@link
       * LocalizedString}.
       *
       * @param catalog {Map} map of I18N keys and their values
       * @param messageId {String} message id (may contain format strings)
       * @param args {Object[]} array of objects, which are inserted into the format string
       * @param locale {String ? #locale} locale to be used; if not given, defaults to the value of {@link #locale}
       * @return {String | LocalizedString} translated message or localized string
       */
      __lookupAndExpand__P_86_7: function __lookupAndExpand__P_86_7(catalog, messageId, args, locale) {
        {
          this.assertObject(catalog);
          this.assertString(messageId);
          this.assertArray(args);
        }
        var txt;

        if (!catalog) {
          return messageId;
        }

        if (locale) {
          var language = this.__extractLanguage__P_86_6(locale);
        } else {
          locale = this.__locale__P_86_4;
          language = this.__language__P_86_5;
        } // e.g. DE_at


        if (!txt && catalog[locale]) {
          txt = catalog[locale][messageId];
        } // e.g. DE


        if (!txt && catalog[language]) {
          txt = catalog[language][messageId];
        } // C


        if (!txt && catalog[this.__defaultLocale__P_86_3]) {
          txt = catalog[this.__defaultLocale__P_86_3][messageId];
        }

        if (!txt) {
          txt = messageId;
        }

        if (args.length > 0) {
          var translatedArgs = [];

          for (var i = 0; i < args.length; i++) {
            var arg = args[i];

            if (arg && arg.translate) {
              translatedArgs[i] = arg.translate();
            } else {
              translatedArgs[i] = arg;
            }
          }

          txt = qx.lang.String.format(txt, translatedArgs);
        }

        {
          txt = new qx.locale.LocalizedString(txt, messageId, args, catalog === this.__locales__P_86_1);
        }
        return txt;
      }
    }
  });
  qx.locale.Manager.$$dbClassInfo = $$dbClassInfo;
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
      "qx.util.AliasManager": {},
      "qx.theme.manager.Color": {},
      "qx.io.ImageLoader": {},
      "qx.lang.String": {},
      "qx.bom.client.Css": {
        "require": true
      },
      "qx.html.Image": {},
      "qx.html.Label": {},
      "qx.html.Element": {},
      "qx.util.ResourceManager": {},
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Browser": {
        "require": true
      },
      "qx.bom.element.Decoration": {},
      "qx.lang.Type": {},
      "qx.bom.AnimationFrame": {},
      "qx.theme.manager.Font": {},
      "qx.lang.Object": {},
      "qx.theme.manager.Decoration": {},
      "qx.ui.core.queue.Layout": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.alphaimageloaderneeded": {
          "className": "qx.bom.client.Css"
        },
        "engine.name": {
          "className": "qx.bom.client.Engine",
          "load": true
        },
        "engine.version": {
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
       * Sebastian Werner (wpbasti)
  
  ************************************************************************ */

  /**
   * The image class displays an image file
   *
   * This class supports image clipping, which means that multiple images can be combined
   * into one large image and only the relevant part is shown.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   var image = new qx.ui.basic.Image("icon/32/actions/format-justify-left.png");
   *
   *   this.getRoot().add(image);
   * </pre>
   *
   * This example create a widget to display the image
   * <code>icon/32/actions/format-justify-left.png</code>.
   *
   * *External Documentation*
   *
   * <a href='http://qooxdoo.org/docs/#desktop/widget/image.md' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.ui.basic.Image", {
    extend: qx.ui.core.Widget,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param source {String?null} The URL of the image to display.
     */
    construct: function construct(source) {
      this.__contentElements__P_79_0 = {};
      qx.ui.core.Widget.constructor.call(this);

      if (source) {
        this.setSource(source);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The URL of the image. Setting it will possibly abort loading of current image. */
      source: {
        check: "String",
        init: null,
        nullable: true,
        event: "changeSource",
        apply: "_applySource",
        themeable: true
      },

      /**
       * Whether the image should be scaled to the given dimensions
       *
       * This is disabled by default because it prevents the usage
       * of image clipping when enabled.
       */
      scale: {
        check: "Boolean",
        init: false,
        event: "changeScale",
        themeable: true,
        apply: "_applyScale"
      },

      /**
       * Whether to preserve the image ratio (ie prevent distortion), and which dimension
       * to prioritise
       */
      forceRatio: {
        init: "auto",
        check: ["disabled", "height", "width", "auto"],
        apply: "_applyDimension"
      },

      /**
       * Whether to allow scaling the image up
       */
      allowScaleUp: {
        init: false,
        check: "Boolean",
        apply: "_applyDimension"
      },
      // overridden
      appearance: {
        refine: true,
        init: "image"
      },
      // overridden
      allowShrinkX: {
        refine: true,
        init: false
      },
      // overridden
      allowShrinkY: {
        refine: true,
        init: false
      },
      // overridden
      allowGrowX: {
        refine: true,
        init: false
      },
      // overridden
      allowGrowY: {
        refine: true,
        init: false
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired if the image source can not be loaded. This event can only be
       * fired for the first loading of an unmanaged resource (external image).
       */
      loadingFailed: "qx.event.type.Event",

      /**
       * Fired if the image has been loaded. This is even true for managed
       * resources (images known by generator).
       */
      loaded: "qx.event.type.Event",

      /** Fired when the pending request has been aborted. */
      aborted: "qx.event.type.Event"
    },
    statics: {
      PLACEHOLDER_IMAGE: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __width__P_79_1: null,
      __height__P_79_2: null,
      __mode__P_79_3: null,
      __contentElements__P_79_0: null,
      __currentContentElement__P_79_4: null,
      __wrapper__P_79_5: null,
      __requestId__P_79_6: 0,
      // overridden
      _onChangeTheme: function _onChangeTheme() {
        qx.ui.basic.Image.superclass.prototype._onChangeTheme.call(this); // restyle source (theme change might have changed the resolved url)


        this._styleSource();
      },

      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      // overridden
      getContentElement: function getContentElement() {
        return this.__getSuitableContentElement__P_79_7();
      },
      // overridden
      _createContentElement: function _createContentElement() {
        return this.__getSuitableContentElement__P_79_7();
      },
      // overridden
      _getContentHint: function _getContentHint() {
        return {
          width: this.__width__P_79_1 || 0,
          height: this.__height__P_79_2 || 0
        };
      },
      // overridden
      _applyDecorator: function _applyDecorator(value, old) {
        qx.ui.basic.Image.superclass.prototype._applyDecorator.call(this, value, old);

        var source = this.getSource();
        source = qx.util.AliasManager.getInstance().resolve(source);
        var el = this.getContentElement();

        if (this.__wrapper__P_79_5) {
          el = el.getChild(0);
        }

        this.__setSource__P_79_8(el, source);
      },
      // overridden
      _applyTextColor: function _applyTextColor(value) {
        if (this.__getMode__P_79_9() === "font") {
          var el = this.getContentElement();

          if (this.__wrapper__P_79_5) {
            el = el.getChild(0);
          }

          if (value) {
            el.setStyle("color", qx.theme.manager.Color.getInstance().resolve(value));
          } else {
            el.removeStyle("color");
          }
        }
      },
      // overridden
      _applyPadding: function _applyPadding(value, old, name) {
        qx.ui.basic.Image.superclass.prototype._applyPadding.call(this, value, old, name);

        var element = this.getContentElement();

        if (this.__wrapper__P_79_5) {
          element.getChild(0).setStyles({
            top: this.getPaddingTop() || 0,
            left: this.getPaddingLeft() || 0
          });
        } else if (this.__getMode__P_79_9() === "font") {
          element.setStyles({
            top: this.getPaddingTop() || 0,
            left: this.getPaddingLeft() || 0
          });
        } else {
          element.setPadding(this.getPaddingLeft() || 0, this.getPaddingTop() || 0);
        }
      },
      renderLayout: function renderLayout(left, top, width, height) {
        qx.ui.basic.Image.superclass.prototype.renderLayout.call(this, left, top, width, height);
        var element = this.getContentElement();

        if (this.__wrapper__P_79_5) {
          element.getChild(0).setStyles({
            width: width - (this.getPaddingLeft() || 0) - (this.getPaddingRight() || 0),
            height: height - (this.getPaddingTop() || 0) - (this.getPaddingBottom() || 0),
            top: this.getPaddingTop() || 0,
            left: this.getPaddingLeft() || 0
          });
        }
      },

      /*
      ---------------------------------------------------------------------------
        IMAGE API
      ---------------------------------------------------------------------------
      */
      // property apply, overridden
      _applyEnabled: function _applyEnabled(value, old) {
        qx.ui.basic.Image.superclass.prototype._applyEnabled.call(this, value, old);

        if (this.getSource()) {
          this._styleSource();
        }
      },
      // property apply
      _applySource: function _applySource(value, old) {
        // abort loading current image
        if (old) {
          if (qx.io.ImageLoader.isLoading(old)) {
            qx.io.ImageLoader.abort(old);
          }
        }

        this._styleSource();
      },
      // property apply
      _applyScale: function _applyScale(value) {
        this._styleSource();
      },

      /**
       * Remembers the mode to keep track which contentElement is currently in use.
       * @param mode {String} internal mode (alphaScaled|scaled|nonScaled)
       */
      __setMode__P_79_10: function __setMode__P_79_10(mode) {
        this.__mode__P_79_3 = mode;
      },

      /**
       * Returns the current mode if set. Otherwise checks the current source and
       * the current scaling to determine the current mode.
       *
       * @return {String} current internal mode
       */
      __getMode__P_79_9: function __getMode__P_79_9() {
        if (this.__mode__P_79_3 == null) {
          var source = this.getSource();

          if (source && qx.lang.String.startsWith(source, "@")) {
            this.__mode__P_79_3 = "font";
          }

          var isPng = false;

          if (source != null) {
            isPng = source.endsWith(".png");
          }

          if (this.getScale() && isPng && qx.core.Environment.get("css.alphaimageloaderneeded")) {
            this.__mode__P_79_3 = "alphaScaled";
          } else if (this.getScale()) {
            this.__mode__P_79_3 = "scaled";
          } else {
            this.__mode__P_79_3 = "nonScaled";
          }
        }

        return this.__mode__P_79_3;
      },

      /**
       * Creates a contentElement suitable for the current mode
       *
       * @param mode {String} internal mode
       * @return {qx.html.Image} suitable image content element
       */
      __createSuitableContentElement__P_79_11: function __createSuitableContentElement__P_79_11(mode) {
        var scale;
        var tagName;
        var clazz = qx.html.Image;

        switch (mode) {
          case "font":
            clazz = qx.html.Label;
            scale = true;
            tagName = "div";
            break;

          case "alphaScaled":
            scale = true;
            tagName = "div";
            break;

          case "nonScaled":
            scale = false;
            tagName = "div";
            break;

          default:
            scale = true;
            tagName = "img";
            break;
        }

        var element = new clazz(tagName);
        element.connectObject(this);
        element.setStyles({
          overflowX: "hidden",
          overflowY: "hidden",
          boxSizing: "border-box"
        });

        if (mode == "font") {
          element.setRich(true);
        } else {
          element.setScale(scale);

          if (qx.core.Environment.get("css.alphaimageloaderneeded")) {
            var wrapper = this.__wrapper__P_79_5 = new qx.html.Element("div");
            element.connectObject(this);
            wrapper.setStyle("position", "absolute");
            wrapper.add(element);
            return wrapper;
          }
        }

        return element;
      },

      /**
       * Returns a contentElement suitable for the current mode
       *
       * @return {qx.html.Image} suitable image contentElement
       */
      __getSuitableContentElement__P_79_7: function __getSuitableContentElement__P_79_7() {
        if (this.$$disposed) {
          return null;
        }

        var mode = this.__getMode__P_79_9();

        if (this.__contentElements__P_79_0[mode] == null) {
          this.__contentElements__P_79_0[mode] = this.__createSuitableContentElement__P_79_11(mode);
        }

        var element = this.__contentElements__P_79_0[mode];

        if (!this.__currentContentElement__P_79_4) {
          this.__currentContentElement__P_79_4 = element;
        }

        return element;
      },

      /**
       * Applies the source to the clipped image instance or preload
       * an image to detect sizes and apply it afterwards.
       *
       */
      _styleSource: function _styleSource() {
        var AliasManager = qx.util.AliasManager.getInstance();
        var ResourceManager = qx.util.ResourceManager.getInstance();
        var source = AliasManager.resolve(this.getSource());
        var element = this.getContentElement();

        if (this.__wrapper__P_79_5) {
          element = element.getChild(0);
        }

        if (!source) {
          this.__resetSource__P_79_12(element);

          return;
        }

        this.__checkForContentElementSwitch__P_79_13(source);

        if (qx.core.Environment.get("engine.name") == "mshtml" && (parseInt(qx.core.Environment.get("engine.version"), 10) < 9 || qx.core.Environment.get("browser.documentmode") < 9)) {
          var repeat = this.getScale() ? "scale" : "no-repeat";
          element.tagNameHint = qx.bom.element.Decoration.getTagName(repeat, source);
        }

        var contentEl = this.__getContentElement__P_79_14(); // Detect if the image registry knows this image


        if (ResourceManager.isFontUri(source)) {
          this.__setManagedImage__P_79_15(contentEl, source);

          var color = this.getTextColor();

          if (qx.lang.Type.isString(color)) {
            this._applyTextColor(color, null);
          }
        } else if (ResourceManager.has(source)) {
          var highResolutionSource = ResourceManager.findHighResolutionSource(source);

          if (highResolutionSource) {
            var imageWidth = ResourceManager.getImageWidth(source);
            var imageHeight = ResourceManager.getImageHeight(source);
            this.setWidth(imageWidth);
            this.setHeight(imageHeight); // set background size on current element (div or img)

            var backgroundSize = imageWidth + "px, " + imageHeight + "px";

            this.__currentContentElement__P_79_4.setStyle("background-size", backgroundSize);

            this.setSource(highResolutionSource);
            source = highResolutionSource;
          }

          this.__setManagedImage__P_79_15(contentEl, source);

          this.__fireLoadEvent__P_79_16();
        } else if (qx.io.ImageLoader.isLoaded(source)) {
          this.__setUnmanagedImage__P_79_17(contentEl, source);

          this.__fireLoadEvent__P_79_16();
        } else {
          this.__loadUnmanagedImage__P_79_18(contentEl, source);
        }
      },

      /**
       * Helper function, which fires <code>loaded</code> event asynchronously.
       * It emulates native <code>loaded</code> event of an image object. This
       * helper will be called, if you try to load a managed image or an
       * previously loaded unmanaged image.
       */
      __fireLoadEvent__P_79_16: function __fireLoadEvent__P_79_16() {
        this.__requestId__P_79_6++;
        qx.bom.AnimationFrame.request(function (rId) {
          // prevent firing of the event if source changed in the meantime
          if (rId === this.__requestId__P_79_6) {
            this.fireEvent("loaded");
          } else {
            this.fireEvent("aborted");
          }
        }.bind(this, this.__requestId__P_79_6));
      },

      /**
       * Returns the content element.
       * @return {qx.html.Image} content element
       */
      __getContentElement__P_79_14: function __getContentElement__P_79_14() {
        var contentEl = this.__currentContentElement__P_79_4;

        if (this.__wrapper__P_79_5) {
          contentEl = contentEl.getChild(0);
        }

        return contentEl;
      },

      /**
       * Checks if the current content element is capable to display the image
       * with the current settings (scaling, alpha PNG)
       *
       * @param source {String} source of the image
       */
      __checkForContentElementSwitch__P_79_13: qx.core.Environment.select("engine.name", {
        mshtml: function mshtml(source) {
          var alphaImageLoader = qx.core.Environment.get("css.alphaimageloaderneeded");
          var isPng = source.endsWith(".png");
          var isFont = source.startsWith("@");

          if (isFont) {
            this.__setMode__P_79_10("font");
          } else if (alphaImageLoader && isPng) {
            if (this.getScale() && this.__getMode__P_79_9() != "alphaScaled") {
              this.__setMode__P_79_10("alphaScaled");
            } else if (!this.getScale() && this.__getMode__P_79_9() != "nonScaled") {
              this.__setMode__P_79_10("nonScaled");
            }
          } else {
            if (this.getScale() && this.__getMode__P_79_9() != "scaled") {
              this.__setMode__P_79_10("scaled");
            } else if (!this.getScale() && this.__getMode__P_79_9() != "nonScaled") {
              this.__setMode__P_79_10("nonScaled");
            }
          }

          this.__checkForContentElementReplacement__P_79_19(this.__getSuitableContentElement__P_79_7());
        },
        "default": function _default(source) {
          var isFont = source && qx.lang.String.startsWith(source, "@");

          if (isFont) {
            this.__setMode__P_79_10("font");
          } else if (this.getScale() && this.__getMode__P_79_9() != "scaled") {
            this.__setMode__P_79_10("scaled");
          } else if (!this.getScale() && this.__getMode__P_79_9() != "nonScaled") {
            this.__setMode__P_79_10("nonScaled");
          }

          this.__checkForContentElementReplacement__P_79_19(this.__getSuitableContentElement__P_79_7());
        }
      }),

      /**
       * Checks the current child and replaces it if necessary
       *
       * @param elementToAdd {qx.html.Image} content element to add
       */
      __checkForContentElementReplacement__P_79_19: function __checkForContentElementReplacement__P_79_19(elementToAdd) {
        var currentContentElement = this.__currentContentElement__P_79_4;

        if (currentContentElement != elementToAdd) {
          if (currentContentElement != null) {
            var pixel = "px";
            var styles = {}; //inherit styles from current element

            var currentStyles = currentContentElement.getAllStyles();

            if (currentStyles) {
              for (var prop in currentStyles) {
                styles[prop] = currentStyles[prop];
              }
            } // Don't transfer background image when switching from image to icon font


            if (this.__getMode__P_79_9() === "font") {
              delete styles.backgroundImage;
            } // Copy dimension and location of the current content element


            var bounds = this.getBounds();

            if (bounds != null) {
              styles.width = bounds.width + pixel;
              styles.height = bounds.height + pixel;
            }

            var insets = this.getInsets();
            styles.left = parseInt(currentContentElement.getStyle("left") || insets.left) + pixel;
            styles.top = parseInt(currentContentElement.getStyle("top") || insets.top) + pixel;
            styles.zIndex = 10;
            var newEl = this.__wrapper__P_79_5 ? elementToAdd.getChild(0) : elementToAdd;
            newEl.setStyles(styles, true);
            newEl.setSelectable(this.getSelectable());

            if (!currentContentElement.isVisible()) {
              elementToAdd.hide();
            } else if (!elementToAdd.isVisible()) {
              elementToAdd.show();
            }

            if (!currentContentElement.isIncluded()) {
              elementToAdd.exclude();
            } else if (!elementToAdd.isIncluded()) {
              elementToAdd.include();
            }

            var container = currentContentElement.getParent();

            if (container) {
              var index = container.getChildren().indexOf(currentContentElement);
              container.removeAt(index);
              container.addAt(elementToAdd, index);
            } // force re-application of source so __setSource is called again


            var hint = newEl.getNodeName();

            if (newEl.setSource) {
              newEl.setSource(null);
            } else {
              newEl.setValue("");
            }

            var currentEl = this.__getContentElement__P_79_14();

            newEl.tagNameHint = hint;
            newEl.setAttribute("class", currentEl.getAttribute("class")); // Flush elements to make sure the DOM elements are created.

            qx.html.Element.flush();
            var currentDomEl = currentEl.getDomElement();
            var newDomEl = elementToAdd.getDomElement(); // copy event listeners

            var listeners = currentContentElement.getListeners() || [];
            listeners.forEach(function (listenerData) {
              elementToAdd.addListener(listenerData.type, listenerData.handler, listenerData.self, listenerData.capture);
            });

            if (currentDomEl && newDomEl) {
              // Switch the DOM elements' hash codes. This is required for the event
              // layer to work [BUG #7447]
              var currentHash = currentDomEl.$$hash;
              currentDomEl.$$hash = newDomEl.$$hash;
              newDomEl.$$hash = currentHash;
            }

            this.__currentContentElement__P_79_4 = elementToAdd;
          }
        }
      },

      /**
       * Use the ResourceManager to set a managed image
       *
       * @param el {Element} image DOM element
       * @param source {String} source path
       */
      __setManagedImage__P_79_15: function __setManagedImage__P_79_15(el, source) {
        var ResourceManager = qx.util.ResourceManager.getInstance();
        var isFont = ResourceManager.isFontUri(source); // Try to find a disabled image in registry

        if (!this.getEnabled()) {
          var disabled = source.replace(/\.([a-z]+)$/, "-disabled.$1");

          if (!isFont && ResourceManager.has(disabled)) {
            source = disabled;
            this.addState("replacement");
          } else {
            this.removeState("replacement");
          }
        } // Optimize case for enabled changes when no disabled image was found


        if (!isFont && el.getSource() === source) {
          return;
        } // Special case for non resource manager handled font icons


        if (isFont) {
          // Don't use scale if size is set via postfix
          if (this.getScale() && parseInt(source.split("/")[2], 10)) {
            this.setScale(false);
          } // Adjust size if scaling is applied


          var width;
          var height;

          if (this.getScale()) {
            var hint = this.getSizeHint();
            width = this.getWidth() || hint.width;
            height = this.getHeight() || hint.height;
          } else {
            var font = this.__getFont__P_79_20(source);

            var size = parseInt(source.split("/")[2] || font.getSize(), 10);
            width = ResourceManager.getImageWidth(source) || size;
            height = ResourceManager.getImageHeight(source) || size;
          }

          this.__updateContentHint__P_79_21(width, height);

          this.__setSource__P_79_8(el, source); // Apply source

        } else {
          // Apply source
          this.__setSource__P_79_8(el, source); // Compare with old sizes and relayout if necessary


          this.__updateContentHint__P_79_21(ResourceManager.getImageWidth(source), ResourceManager.getImageHeight(source));
        }
      },
      __setFontSize__P_79_22: function __setFontSize__P_79_22(el, width, height) {
        if (this.getScale()) {
          el.setStyle("fontSize", (width > height ? height : width) + "px");
        } else {
          var source = qx.util.AliasManager.getInstance().resolve(this.getSource());
          var sparts = source.split("/");

          var font = this.__getFont__P_79_20(source);

          var size = parseInt(sparts[2] || font.getSize());
          el.setStyle("fontSize", size + "px");
        }
      },
      _applyDimension: function _applyDimension() {
        qx.ui.basic.Image.superclass.prototype._applyDimension.call(this);

        var isFont = this.getSource() && qx.lang.String.startsWith(this.getSource(), "@");

        if (isFont) {
          var el = this.getContentElement();

          if (el) {
            var hint = this.getSizeHint();
            var width = this.getWidth() || hint.width || 40;
            var height = this.getHeight() || hint.height || 40;

            this.__setFontSize__P_79_22(el, width, height);
          }
        } else {
          this.__updateContentHint__P_79_21();
        }
      },

      /**
       * Use the infos of the ImageLoader to set an unmanaged image
       *
       * @param el {Element} image DOM element
       * @param source {String} source path
       */
      __setUnmanagedImage__P_79_17: function __setUnmanagedImage__P_79_17(el, source) {
        var ImageLoader = qx.io.ImageLoader; // Apply source

        this.__setSource__P_79_8(el, source); // Compare with old sizes and relayout if necessary


        var width = ImageLoader.getWidth(source);
        var height = ImageLoader.getHeight(source);

        this.__updateContentHint__P_79_21(width, height);
      },

      /**
       * Use the ImageLoader to load an unmanaged image
       *
       * @param el {Element} image DOM element
       * @param source {String} source path
       */
      __loadUnmanagedImage__P_79_18: function __loadUnmanagedImage__P_79_18(el, source) {
        var ImageLoader = qx.io.ImageLoader;
        {
          // loading external images via HTTP/HTTPS is a common usecase, as is
          // using data URLs.
          var sourceLC = source.toLowerCase();

          if (!sourceLC.startsWith("http") && !sourceLC.startsWith("data:image/")) {
            var self = qx.ui.basic.Image;

            if (!self.__warned__P_79_23) {
              self.__warned__P_79_23 = {};
            }

            if (!self.__warned__P_79_23[source]) {
              this.debug("try to load an unmanaged relative image: " + source);
              self.__warned__P_79_23[source] = true;
            }
          }
        } // only try to load the image if it not already failed

        if (!ImageLoader.isFailed(source)) {
          ImageLoader.load(source, this.__loaderCallback__P_79_24, this);
        } else {
          this.__resetSource__P_79_12(el);
        }
      },

      /**
       * Reset source displayed by the DOM element.
       *
       * @param el {Element} image DOM element
       */
      __resetSource__P_79_12: function __resetSource__P_79_12(el) {
        if (el != null) {
          if (el instanceof qx.html.Image) {
            el.resetSource();
          } else {
            el.resetValue();
          }
        }
      },
      __getFont__P_79_20: function __getFont__P_79_20(source) {
        var font = qx.theme.manager.Font.getInstance().resolve(source.match(/@([^/]+)/)[1]);

        if (typeof font == "string") {
          throw new Error("Cannot find font in virtual image source: '".concat(source, "'"));
        }

        return font;
      },

      /**
       * Combines the decorator's image styles with our own image to make sure
       * gradient and backgroundImage decorators work on Images.
       *
       * @param el {Element} image DOM element
       * @param source {String} source path
       */
      __setSource__P_79_8: function __setSource__P_79_8(el, source) {
        var isFont = source && qx.lang.String.startsWith(source, "@");

        if (isFont) {
          var ResourceManager = qx.util.ResourceManager.getInstance();

          var font = this.__getFont__P_79_20(source);

          var fontStyles = qx.lang.Object.clone(font.getStyles());
          delete fontStyles.color;
          el.setStyles(fontStyles);
          el.setStyle("font");
          el.setStyle("display", "table-cell");
          el.setStyle("verticalAlign", "middle");
          el.setStyle("textAlign", "center");

          this.__setFontSize__P_79_22(el, this.__width__P_79_1, this.__height__P_79_2);

          var charCode = ResourceManager.fromFontUriToCharCode(source);
          el.setValue(String.fromCharCode(charCode));
          return;
        } else if (el.getNodeName() == "div") {
          // checks if a decorator already set.
          // In this case we have to merge background styles
          var decorator = qx.theme.manager.Decoration.getInstance().resolve(this.getDecorator());

          if (decorator) {
            var hasGradient = decorator.getStartColor() && decorator.getEndColor();
            var hasBackground = decorator.getBackgroundImage();

            if (hasGradient || hasBackground) {
              var repeat = this.getScale() ? "scale" : "no-repeat"; // get the style attributes for the given source

              var attr = qx.bom.element.Decoration.getAttributes(source, repeat); // get the background image(s) defined by the decorator

              var decoratorStyle = decorator.getStyles(true);
              var combinedStyles = {
                backgroundImage: attr.style.backgroundImage,
                backgroundPosition: attr.style.backgroundPosition || "0 0",
                backgroundRepeat: attr.style.backgroundRepeat || "no-repeat",
                position: "absolute"
              };

              if (hasBackground) {
                combinedStyles["backgroundPosition"] += "," + decoratorStyle["background-position"] || "0 0";
                combinedStyles["backgroundRepeat"] += ", " + decorator.getBackgroundRepeat();
              }

              if (hasGradient) {
                combinedStyles["backgroundPosition"] += ", 0 0";
                combinedStyles["backgroundRepeat"] += ", no-repeat";
              }

              combinedStyles["backgroundImage"] += "," + (decoratorStyle["background-image"] || decoratorStyle["background"]); // apply combined background images

              el.setStyles(combinedStyles);
              return;
            }
          } else {
            // force re-apply to remove old decorator styles
            if (el.setSource) {
              el.setSource(null);
            }
          }
        }

        if (el.setSource) {
          el.setSource(source);
          el.setStyle("position", "absolute");
        }
      },

      /**
       * Event handler fired after the preloader has finished loading the icon
       *
       * @param source {String} Image source which was loaded
       * @param imageInfo {Map} Dimensions of the loaded image
       */
      __loaderCallback__P_79_24: function __loaderCallback__P_79_24(source, imageInfo) {
        // Ignore the callback on already disposed images
        if (this.$$disposed === true) {
          return;
        } // Ignore when the source has already been modified


        if (source !== qx.util.AliasManager.getInstance().resolve(this.getSource())) {
          this.fireEvent("aborted");
          return;
        } /// Output a warning if the image could not loaded and quit


        if (imageInfo.failed) {
          this.warn("Image could not be loaded: " + source);
          this.fireEvent("loadingFailed");
        } else if (imageInfo.aborted) {
          this.fireEvent("aborted");
          return;
        } else {
          this.fireEvent("loaded");
        } // Update image


        this.__setUnmanagedImage__P_79_17(this.__getContentElement__P_79_14(), source);
      },

      /**
       * Updates the content hint when the image size has been changed
       *
       * @param width {Integer} width of the image
       * @param height {Integer} height of the image
       */
      __updateContentHint__P_79_21: function __updateContentHint__P_79_21(width, height) {
        if (width === undefined) {
          width = this.__width__P_79_1;
        }

        if (height === undefined) {
          height = this.__height__P_79_2;
        }

        if (this._recalc(width, height)) {
          qx.ui.core.queue.Layout.add(this);
        }
      },

      /**
       * Recalculates the size of the image, according to scaling parameters
       * @param maxWidth {Integer?} maximum width restriction
       * @param maxHeight {Integer?} minimum height restriction
       */
      _recalc: function _recalc(originalWidth, originalHeight) {
        var maxWidth = this.getMaxWidth();
        var maxHeight = this.getMaxHeight();
        var minWidth = this.getMinWidth();
        var minHeight = this.getMinHeight();
        var width = originalWidth;
        var height = originalHeight;
        var ratio = originalHeight / originalWidth;

        switch (this.getForceRatio()) {
          case "height":
            if (maxHeight !== null && height > maxHeight) {
              height = maxHeight;
              width = height / ratio;
            } else if (height < minHeight) {
              height = minHeight;
              width = height / ratio;
            }

            if (height < maxHeight && this.isAllowScaleUp()) {
              height = maxHeight;
              width = height / ratio;
            }

            break;

          case "width":
            if (maxWidth !== null && width > maxWidth) {
              width = maxWidth;
              height = width * ratio;
            } else if (width < minWidth) {
              width = minWidth;
              height = width * ratio;
            }

            if (width < maxWidth && this.isAllowScaleUp()) {
              width = maxWidth;
              height = width * ratio;
            }

            break;

          case "auto":
          case "bestfit":
            if (maxWidth !== null && width > maxWidth) {
              width = maxWidth;
              height = width * ratio;
            } else if (width < minWidth) {
              width = minWidth;
              height = width * ratio;
            }

            if (width < maxWidth && this.isAllowScaleUp()) {
              width = maxWidth;
              height = width * ratio;
            }

            if (maxHeight !== null && height > maxHeight) {
              height = maxHeight;
              width = height / ratio;
            }

            break;
        }

        width = Math.round(width);
        height = Math.round(height);

        if (width != this.__width__P_79_1 || height != this.__height__P_79_2) {
          this.__width__P_79_1 = width;
          this.__height__P_79_2 = height;
          return true;
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
      for (var mode in this.__contentElements__P_79_0) {
        if (this.__contentElements__P_79_0.hasOwnProperty(mode)) {
          this.__contentElements__P_79_0[mode].disconnectObject(this);
        }
      }

      delete this.__currentContentElement__P_79_4;

      if (this.__wrapper__P_79_5) {
        delete this.__wrapper__P_79_5;
      }

      this._disposeMap("__contentElements__P_79_0");
    }
  });
  qx.ui.basic.Image.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.basic.Image": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.MPlacement": {
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
   * This widget is used as feedback widget in drag and drop actions.
   */
  qx.Class.define("qx.ui.core.DragDropCursor", {
    extend: qx.ui.basic.Image,
    include: qx.ui.core.MPlacement,
    type: "singleton",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.basic.Image.constructor.call(this); // Put above other stuff

      this.setZIndex(1e8); // Move using DOM

      this.setDomMove(true); // Automatically add to root

      var root = this.getApplicationRoot();
      root.add(this, {
        left: -1000,
        top: -1000
      });
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      appearance: {
        refine: true,
        init: "dragdrop-cursor"
      },

      /** The current drag&drop action */
      action: {
        check: ["alias", "copy", "move"],
        apply: "_applyAction",
        nullable: true
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    members: {
      // property apply
      _applyAction: function _applyAction(value, old) {
        if (old) {
          this.removeState(old);
        }

        if (value) {
          this.addState(value);
        }
      }
    }
  });
  qx.ui.core.DragDropCursor.$$dbClassInfo = $$dbClassInfo;
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
        "construct": true,
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.theme.manager.Meta": {
        "construct": true
      },
      "qx.theme.manager.Color": {},
      "qx.event.Registration": {},
      "qx.event.handler.Focus": {},
      "qx.ui.core.Widget": {},
      "qx.html.Blocker": {},
      "qx.event.type.Event": {},
      "qx.ui.core.FocusHandler": {}
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This class blocks events and can be included into all widgets.
   *
   * The {@link #block} and {@link #unblock} methods provided by this class can be used
   * to block any event from the widget. When blocked,
   * the blocker widget overlays the widget to block, including the padding area.
   *
   * @ignore(qx.ui.root.Abstract)
   */
  qx.Class.define("qx.ui.core.Blocker", {
    extend: qx.core.Object,
    events: {
      /**
       * Fires after {@link #block} executed.
       */
      blocked: "qx.event.type.Event",

      /**
       * Fires after {@link #unblock} executed.
       */
      unblocked: "qx.event.type.Event"
    },

    /**
     * Creates a blocker for the passed widget.
     *
     * @param widget {qx.ui.core.Widget} Widget which should be added the blocker
     */
    construct: function construct(widget) {
      qx.core.Object.constructor.call(this);
      this._widget = widget;
      widget.addListener("resize", this.__onBoundsChange__P_119_0, this);
      widget.addListener("move", this.__onBoundsChange__P_119_0, this);
      widget.addListener("disappear", this.__onWidgetDisappear__P_119_1, this);

      if (qx.Class.isDefined("qx.ui.root.Abstract") && widget instanceof qx.ui.root.Abstract) {
        this._isRoot = true;
        this.setKeepBlockerActive(true);
      } // dynamic theme switch


      {
        qx.theme.manager.Meta.getInstance().addListener("changeTheme", this._onChangeTheme, this);
      }
      this.__activeElements__P_119_2 = [];
      this.__focusElements__P_119_3 = [];
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Color of the blocker
       */
      color: {
        check: "Color",
        init: null,
        nullable: true,
        apply: "_applyColor",
        themeable: true
      },

      /**
       * Opacity of the blocker
       */
      opacity: {
        check: "Number",
        init: 1,
        apply: "_applyOpacity",
        themeable: true
      },

      /**
       * If this property is enabled, the blocker created with {@link #block}
       * will always stay activated. This means that the blocker then gets all keyboard
       * events, this is useful to block keyboard input on other widgets.
       * Take care that only one blocker instance will be kept active, otherwise your
       * browser will freeze.
       *
       * Setting this property to true is ignored, if the blocker is attached to a
       * widget with a focus handler, as this would mean that the focus handler
       * tries to activate the widget behind the blocker.
       *
       * fixes:
       *     https://github.com/qooxdoo/qooxdoo/issues/9449
       *     https://github.com/qooxdoo/qooxdoo/issues/8104
       */
      keepBlockerActive: {
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
      __blocker__P_119_4: null,
      __blockerCount__P_119_5: 0,
      __activeElements__P_119_2: null,
      __focusElements__P_119_3: null,
      __timer__P_119_6: null,
      _widget: null,
      _isRoot: false,
      __appearListener__P_119_7: null,

      /**
       * Adjust html element size on layout resizes.
       *
       * @param e {qx.event.type.Data} event object
       */
      __onBoundsChange__P_119_0: function __onBoundsChange__P_119_0(e) {
        var data = e.getData();

        if (this.isBlocked()) {
          this._updateBlockerBounds(data);
        }
      },

      /**
       * Widget re-appears: Update blocker size/position and attach to (new) parent
       */
      __onWidgetAppear__P_119_8: function __onWidgetAppear__P_119_8() {
        this._updateBlockerBounds(this._widget.getBounds());

        if (this._widget.isRootWidget()) {
          this._widget.getContentElement().add(this.getBlockerElement());
        } else {
          this._widget.getLayoutParent().getContentElement().add(this.getBlockerElement());
        }
      },

      /**
       * Remove the blocker if the widget disappears
       */
      __onWidgetDisappear__P_119_1: function __onWidgetDisappear__P_119_1() {
        if (this.isBlocked()) {
          this.getBlockerElement().getParent().remove(this.getBlockerElement());

          this._widget.addListenerOnce("appear", this.__onWidgetAppear__P_119_8, this);
        }
      },

      /**
       * set the blocker's size and position
       * @param bounds {Map} Map with the new width, height, left and top values
       */
      _updateBlockerBounds: function _updateBlockerBounds(bounds) {
        this.getBlockerElement().setStyles({
          width: bounds.width + "px",
          height: bounds.height + "px",
          left: bounds.left + "px",
          top: bounds.top + "px"
        });
      },
      // property apply
      _applyColor: function _applyColor(value, old) {
        var color = qx.theme.manager.Color.getInstance().resolve(value);

        this.__setBlockersStyle__P_119_9("backgroundColor", color);
      },
      // property apply
      _applyOpacity: function _applyOpacity(value, old) {
        this.__setBlockersStyle__P_119_9("opacity", value);
      },

      /**
       * Handler for the theme change.
       * @signature function()
       */
      _onChangeTheme: qx.core.Environment.select("qx.dyntheme", {
        "true": function _true() {
          this._applyColor(this.getColor());
        },
        "false": null
      }),

      /**
       * Set the style to all blockers (blocker and content blocker).
       *
       * @param key {String} The name of the style attribute.
       * @param value {String} The value.
       */
      __setBlockersStyle__P_119_9: function __setBlockersStyle__P_119_9(key, value) {
        var blockers = [];
        this.__blocker__P_119_4 && blockers.push(this.__blocker__P_119_4);

        for (var i = 0; i < blockers.length; i++) {
          blockers[i].setStyle(key, value);
        }
      },

      /**
       * Backup the current active and focused widget.
       */
      _backupActiveWidget: function _backupActiveWidget() {
        var focusHandler = qx.event.Registration.getManager(window).getHandler(qx.event.handler.Focus);
        var activeWidget = qx.ui.core.Widget.getWidgetByElement(focusHandler.getActive());
        var focusedWidget = qx.ui.core.Widget.getWidgetByElement(focusHandler.getFocus());

        this.__activeElements__P_119_2.push(activeWidget);

        this.__focusElements__P_119_3.push(focusedWidget);

        if (activeWidget) {
          activeWidget.deactivate();
        }

        if (focusedWidget && focusedWidget.isFocusable()) {
          focusedWidget.blur();
        }
      },

      /**
       * Restore the current active and focused widget.
       */
      _restoreActiveWidget: function _restoreActiveWidget() {
        var widget;
        var focusElementsLength = this.__focusElements__P_119_3.length;

        if (focusElementsLength > 0) {
          widget = this.__focusElements__P_119_3.pop();

          if (widget && !widget.isDisposed() && widget.isFocusable()) {
            widget.focus();
          }
        }

        var activeElementsLength = this.__activeElements__P_119_2.length;

        if (activeElementsLength > 0) {
          widget = this.__activeElements__P_119_2.pop();

          if (widget && !widget.isDisposed()) {
            widget.activate();
          }
        }
      },

      /**
       * Creates the blocker element.
       *
       * @return {qx.html.Element} The blocker element
       */
      __createBlockerElement__P_119_10: function __createBlockerElement__P_119_10() {
        return new qx.html.Blocker(this.getColor(), this.getOpacity());
      },

      /**
       * Get/create the blocker element
       *
       * @param widget {qx.ui.core.Widget} The blocker will be added to this
       * widget's content element
       * @return {qx.html.Element} The blocker element
       */
      getBlockerElement: function getBlockerElement(widget) {
        if (!this.__blocker__P_119_4) {
          this.__blocker__P_119_4 = this.__createBlockerElement__P_119_10();

          this.__blocker__P_119_4.setStyle("zIndex", 15);

          if (!widget) {
            if (this._isRoot) {
              widget = this._widget;
            } else {
              widget = this._widget.getLayoutParent();
            }
          }

          widget.getContentElement().add(this.__blocker__P_119_4);

          this.__blocker__P_119_4.exclude();
        }

        return this.__blocker__P_119_4;
      },

      /**
       * Block all events from this widget by placing a transparent overlay widget,
       * which receives all events, exactly over the widget.
       */
      block: function block() {
        this._block();
      },

      /**
       * Adds the blocker to the appropriate element and includes it.
       *
       * @param zIndex {Number} All child widgets with a zIndex below this value will be blocked
       * @param blockContent {Boolean} append the blocker to the widget's content if true
       */
      _block: function _block(zIndex, blockContent) {
        if (!this._isRoot && !this._widget.getLayoutParent()) {
          if (!this.__appearListener__P_119_7) {
            this.__appearListener__P_119_7 = this._widget.addListenerOnce("appear", this._block.bind(this, zIndex));
          }

          return;
        }

        var parent;

        if (this._isRoot || blockContent) {
          parent = this._widget;
        } else {
          parent = this._widget.getLayoutParent();
        }

        var blocker = this.getBlockerElement(parent);

        if (zIndex != null) {
          blocker.setStyle("zIndex", zIndex);
        }

        this.__blockerCount__P_119_5++;

        if (this.__blockerCount__P_119_5 < 2) {
          this._backupActiveWidget();

          var bounds = this._widget.getBounds(); // no bounds -> widget not yet rendered -> bounds will be set on resize


          if (bounds) {
            this._updateBlockerBounds(bounds);
          }

          blocker.include();

          if (!blockContent) {
            blocker.activate();
          }

          blocker.addListener("deactivate", this.__activateBlockerElement__P_119_11, this);
          blocker.addListener("keypress", this.__stopTabEvent__P_119_12, this);
          blocker.addListener("keydown", this.__stopTabEvent__P_119_12, this);
          blocker.addListener("keyup", this.__stopTabEvent__P_119_12, this);
          this.fireEvent("blocked", qx.event.type.Event);
        }
      },

      /**
       * Returns whether the widget is blocked.
       *
       * @return {Boolean} Whether the widget is blocked.
       */
      isBlocked: function isBlocked() {
        return this.__blockerCount__P_119_5 > 0;
      },

      /**
       * Unblock the widget blocked by {@link #block}, but it takes care of
       * the amount of {@link #block} calls. The blocker is only removed if
       * the number of {@link #unblock} calls is identical to {@link #block} calls.
       */
      unblock: function unblock() {
        if (this.__appearListener__P_119_7) {
          this._widget.removeListenerById(this.__appearListener__P_119_7);

          this.__appearListener__P_119_7 = null;
        }

        if (!this.isBlocked()) {
          return;
        }

        this.__blockerCount__P_119_5--;

        if (this.__blockerCount__P_119_5 < 1) {
          this.__unblock__P_119_13();

          this.__blockerCount__P_119_5 = 0;
        }
      },

      /**
       * Unblock the widget blocked by {@link #block}, but it doesn't take care of
       * the amount of {@link #block} calls. The blocker is directly removed.
       */
      forceUnblock: function forceUnblock() {
        if (this.__appearListener__P_119_7) {
          this._widget.removeListenerById(this.__appearListener__P_119_7);

          this.__appearListener__P_119_7 = null;
        }

        if (!this.isBlocked()) {
          return;
        }

        this.__blockerCount__P_119_5 = 0;

        this.__unblock__P_119_13();
      },

      /**
       * Unblock the widget blocked by {@link #block}.
       */
      __unblock__P_119_13: function __unblock__P_119_13() {
        this._restoreActiveWidget();

        var blocker = this.getBlockerElement();
        blocker.removeListener("deactivate", this.__activateBlockerElement__P_119_11, this);
        blocker.removeListener("keypress", this.__stopTabEvent__P_119_12, this);
        blocker.removeListener("keydown", this.__stopTabEvent__P_119_12, this);
        blocker.removeListener("keyup", this.__stopTabEvent__P_119_12, this);
        blocker.exclude();
        this.fireEvent("unblocked", qx.event.type.Event);
      },

      /**
       * Block direct child widgets with a zIndex below <code>zIndex</code>
       *
       * @param zIndex {Integer} All child widgets with a zIndex below this value
       *     will be blocked
       */
      blockContent: function blockContent(zIndex) {
        this._block(zIndex, true);
      },

      /**
       * Stops the passed "Tab" event.
       *
       * @param e {qx.event.type.KeySequence} event to stop.
       */
      __stopTabEvent__P_119_12: function __stopTabEvent__P_119_12(e) {
        if (e.getKeyIdentifier() == "Tab") {
          e.stop();
        }
      },

      /**
       * Sets the blocker element to active.
       */
      __activateBlockerElement__P_119_11: function __activateBlockerElement__P_119_11() {
        //
        // If this._widget is attached to the focus handler as a focus root,
        // activating the blocker after this widget was deactivated,
        // leads to the focus handler re-activate the widget behind
        // the blocker, loosing tab handling for this._widget which is
        // visually in front. Hence we prevent activating the
        // blocker in this situation.
        //
        // fixes:
        //  https://github.com/qooxdoo/qooxdoo/issues/9449
        //  https://github.com/qooxdoo/qooxdoo/issues/8104
        //
        if (this.getKeepBlockerActive() && !qx.ui.core.FocusHandler.getInstance().isFocusRoot(this._widget)) {
          this.getBlockerElement().activate();
        }
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

      this._widget.removeListener("resize", this.__onBoundsChange__P_119_0, this);

      this._widget.removeListener("move", this.__onBoundsChange__P_119_0, this);

      this._widget.removeListener("appear", this.__onWidgetAppear__P_119_8, this);

      this._widget.removeListener("disappear", this.__onWidgetDisappear__P_119_1, this);

      if (this.__appearListener__P_119_7) {
        this._widget.removeListenerById(this.__appearListener__P_119_7);
      }

      this._disposeObjects("__blocker__P_119_4", "__timer__P_119_6");

      this.__activeElements__P_119_2 = this.__focusElements__P_119_3 = this._widget = null;
    }
  });
  qx.ui.core.Blocker.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.html.Element": {
        "construct": true,
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
  
  ************************************************************************ */

  /**
   * This is the root element for a set of {@link qx.html.Element}s.
   *
   * To make other elements visible these elements must be inserted
   * into an root element at any level.
   *
   * A root element uses an existing DOM element where is assumed that
   * this element is always visible. In the easiest case, the root element
   * is identical to the document's body.
   */
  qx.Class.define("qx.html.Root", {
    extend: qx.html.Element,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Creates a root element
     *
     * @param elem {Element?null} DOM element to use
     */
    construct: function construct(elem) {
      qx.html.Element.constructor.call(this);

      if (elem != null) {
        this.useNode(elem);
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Sets the element to an already existing node. It will be
       * assumed that this DOM element is already visible e.g.
       * like a normal displayed element in the document's body.
       *
       * @param elem {Element} the dom element to set
       * @throws {Error} if the element is assigned again
       */
      useNode: function useNode(elem) {
        // Base call
        qx.html.Root.superclass.prototype.useNode.call(this, elem); // Mark as root

        this.setRoot(true); // Register for synchronization

        qx.html.Element._modified[this.toHashCode()] = this;
      }
    }
  });
  qx.html.Root.$$dbClassInfo = $$dbClassInfo;
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
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Til Schneider (til132)
  
  ************************************************************************ */

  /**
   * Superclass for formatters and parsers.
   */
  qx.Interface.define("qx.util.format.IFormat", {
    members: {
      /**
       * Formats an object.
       *
       * @abstract
       * @param obj {var} The object to format.
       * @return {String} the formatted object.
       * @throws {Error} the abstract function warning.
       */
      format: function format(obj) {},

      /**
       * Parses an object.
       *
       * @abstract
       * @param str {String} the string to parse.
       * @return {var} the parsed object.
       * @throws {Error} the abstract function warning.
       */
      parse: function parse(str) {}
    }
  });
  qx.util.format.IFormat.$$dbClassInfo = $$dbClassInfo;
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
      "qx.util.format.IFormat": {
        "require": true
      },
      "qx.locale.Date": {
        "construct": true
      },
      "qx.locale.Manager": {},
      "qx.log.Logger": {},
      "qx.lang.String": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2006 STZ-IDA, Germany, http://www.stz-ida.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Til Schneider (til132)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * A formatter and parser for dates, see
   * http://www.unicode.org/reports/tr35/#Date_Format_Patterns
   *
   * Here is a quick overview of the format pattern keys:
   * <table>
   * <tr><th>Key &nbsp;<th>Description
   * <tr><td><code> G </code><td> era, e.g. "AD"
   * <tr><td><code> y </code><td> year
   * <tr><td><code> Y </code><td> week year
   * <tr><td><code> u </code><td> extended year [Not supported yet]
   * <tr><td><code> Q </code><td> quarter
   * <tr><td><code> q </code><td> stand-alone quarter
   * <tr><td><code> M </code><td> month
   * <tr><td><code> L </code><td> stand-alone month
   * <tr><td><code> I </code><td> chinese leap month [Not supported yet]
   * <tr><td><code> w </code><td> week of year
   * <tr><td><code> W </code><td> week of month
   * <tr><td><code> d </code><td> day of month
   * <tr><td><code> D </code><td> day of year
   * <tr><td><code> F </code><td> day of week in month [Not supported yet]
   * <tr><td><code> g </code><td> modified Julian day [Not supported yet]
   * <tr><td><code> E </code><td> day of week
   * <tr><td><code> e </code><td> local day of week
   * <tr><td><code> c </code><td> stand-alone local day of week
   * <tr><td><code> a </code><td> period of day (am or pm)
   * <tr><td><code> h </code><td> 12-hour hour
   * <tr><td><code> H </code><td> 24-hour hour
   * <tr><td><code> K </code><td> hour [0-11]
   * <tr><td><code> k </code><td> hour [1-24]
   * <tr><td><code> j </code><td> special symbol [Not supported yet]
   * <tr><td><code> m </code><td> minute
   * <tr><td><code> s </code><td> second
   * <tr><td><code> S </code><td> fractional second
   * <tr><td><code> A </code><td> millisecond in day [Not supported yet]
   * <tr><td><code> z </code><td> time zone, specific non-location format
   * <tr><td><code> Z </code><td> time zone, rfc822/gmt format
   * <tr><td><code> v </code><td> time zone, generic non-location format [Not supported yet]
   * <tr><td><code> V </code><td> time zone, like z except metazone abbreviations [Not supported yet]
   * </table>
   *
   * (This list is preliminary, not all format keys might be implemented). Most
   * keys support repetitions that influence the meaning of the format. Parts of the
   * format string that should not be interpreted as format keys have to be
   * single-quoted.
   *
   * The same format patterns will be used for both parsing and output formatting.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.util.format.DateFormat", {
    extend: qx.core.Object,
    implement: [qx.util.format.IFormat],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param format {String|null} The format to use. If null, the locale's default
     * format is used.
     * @param locale {String?} optional locale to be used. In case this is not present, the {@link #locale} property of DateFormat
     * will be following the {@link qx.locale.Manager#locale} property of qx.locale.Manager
     */
    construct: function construct(format, locale) {
      qx.core.Object.constructor.call(this);
      this.__initialLocale__P_53_0 = this.__locale__P_53_1 = locale;

      if (format != null) {
        this.__format__P_53_2 = format.toString();

        if (this.__format__P_53_2 in qx.util.format.DateFormat.ISO_MASKS) {
          if (this.__format__P_53_2 === "isoUtcDateTime") {
            this.__UTC__P_53_3 = true;
          }

          this.__format__P_53_2 = qx.util.format.DateFormat.ISO_MASKS[this.__format__P_53_2];
        }
      } else {
        this.__format__P_53_2 = qx.locale.Date.getDateFormat("long", this.getLocale()) + " " + qx.locale.Date.getDateTimeFormat("HHmmss", "HH:mm:ss", this.getLocale());
      }
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Convenience factory that returns a <code>DateFomat</code> instance that
       * uses a short date-only format. Beware that the overall layout of the
       * date/time format string is that of the locale in effect when the factory
       * function is called.
       *
       * Implemented as a quasi-singleton, so beware of side effects.
       *
       * @return {DateFormat} a DateFormat instance.
       */
      getDateInstance: function getDateInstance() {
        var DateFormat = qx.util.format.DateFormat;
        var format = qx.locale.Date.getDateFormat("short") + ""; // Memoizing the instance, so caller doesn't have to dispose it.

        if (DateFormat._dateInstance == null || DateFormat._dateInstance.__format__P_53_2 != format) {
          DateFormat._dateInstance = new DateFormat(format);
        }

        return DateFormat._dateInstance;
      },

      /**
       * Convenience factory that returns a <code>DateFomat</code> instance that
       * uses a long date/time format. Beware that the overall layout of the
       * date/time format string is that of the locale in effect when the factory
       * function is called.
       *
       * Implemented as a quasi-singleton, so beware of side effects.
       *
       * @return {DateFormat} a DateFormat instance.
       */
      getDateTimeInstance: function getDateTimeInstance() {
        var DateFormat = qx.util.format.DateFormat;
        var format = qx.locale.Date.getDateFormat("long") + " " + qx.locale.Date.getDateTimeFormat("HHmmss", "HH:mm:ss"); // Memoizing the instance, so caller doesn't have to dispose it.

        if (DateFormat._dateTimeInstance == null || DateFormat._dateTimeInstance.__format__P_53_2 != format) {
          DateFormat._dateTimeInstance = new DateFormat(format);
        }

        return DateFormat._dateTimeInstance;
      },

      /**
       * @type {Integer} The threshold until when a year should be assumed to belong to the
       *   21st century (e.g. 12 -> 2012). Years over this threshold but below 100 will be
       *   assumed to belong to the 20th century (e.g. 88 -> 1988). Years over 100 will be
       *   used unchanged (e.g. 1792 -> 1792).
       */
      ASSUME_YEAR_2000_THRESHOLD: 30,

      /** @type {Map} Special masks of patterns that are used frequently*/
      ISO_MASKS: {
        isoDate: "yyyy-MM-dd",
        isoTime: "HH:mm:ss",
        isoDateTime: "yyyy-MM-dd'T'HH:mm:ss",
        isoDateTimeTz: "yyyy-MM-dd'T'HH:mm:ssZ",
        isoUtcDateTime: "yyyy-MM-dd'T'HH:mm:ss'Z'"
      },

      /** @type {String} The am marker. */
      AM_MARKER: "am",

      /** @type {String} The pm marker. */
      PM_MARKER: "pm"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __locale__P_53_1: null,
      __initialLocale__P_53_0: null,
      __format__P_53_2: null,
      __parseFeed__P_53_4: null,
      __parseRules__P_53_5: null,
      __formatTree__P_53_6: null,
      __UTC__P_53_3: null,

      /**
       * Fills a number with leading zeros ("25" -> "0025").
       *
       * @param number {Integer} the number to fill.
       * @param minSize {Integer} the minimum size the returned string should have.
       * @return {String} the filled number as string.
       */
      __fillNumber__P_53_7: function __fillNumber__P_53_7(number, minSize) {
        var str = "" + (number < 0 ? -1 * number : number);

        while (str.length < minSize) {
          str = "0" + str;
        }

        return number < 0 ? "-" + str : str;
      },

      /**
       * Returns the day in year of a date.
       *
       * @param date {Date} the date.
       * @return {Integer} the day in year.
       */
      __getDayInYear__P_53_8: function __getDayInYear__P_53_8(date) {
        var helpDate = new Date(date.getTime());
        var day = helpDate.getDate();

        while (helpDate.getMonth() != 0) {
          // Set the date to the last day of the previous month
          helpDate.setDate(-1);
          day += helpDate.getDate() + 1;
        }

        return day;
      },

      /**
       * Returns the thursday in the same week as the date.
       *
       * @param date {Date} the date to get the thursday of.
       * @return {Date} the thursday in the same week as the date.
       */
      __thursdayOfSameWeek__P_53_9: function __thursdayOfSameWeek__P_53_9(date) {
        return new Date(date.getTime() + (3 - (date.getDay() + 6) % 7) * 86400000);
      },

      /**
       * Returns the week in year of a date.
       *
       * @param date {Date} the date to get the week in year of.
       * @return {Integer} the week in year.
       */
      __getWeekInYear__P_53_10: function __getWeekInYear__P_53_10(date) {
        // The following algorithm comes from http://www.salesianer.de/util/kalwoch.html
        // Get the thursday of the week the date belongs to
        var thursdayDate = this.__thursdayOfSameWeek__P_53_9(date); // Get the year the thursday (and therefore the week) belongs to


        var weekYear = thursdayDate.getFullYear(); // Get the thursday of the week january 4th belongs to
        // (which defines week 1 of a year)

        var thursdayWeek1 = this.__thursdayOfSameWeek__P_53_9(new Date(weekYear, 0, 4)); // Calculate the calendar week


        return Math.floor(1.5 + (thursdayDate.getTime() - thursdayWeek1.getTime()) / 86400000 / 7);
      },

      /**
       * Returns the week in month of a date.
       *
       * @param date {Date} the date to get the week in year of.
       * @return {Integer} the week in month.
       */
      __getWeekInMonth__P_53_11: function __getWeekInMonth__P_53_11(date) {
        var thursdayDate = this.__thursdayOfSameWeek__P_53_9(date);

        var thursdayWeek1 = this.__thursdayOfSameWeek__P_53_9(new Date(date.getFullYear(), date.getMonth(), 4));

        return Math.floor(1.5 + (thursdayDate.getTime() - thursdayWeek1.getTime()) / 86400000 / 7);
      },

      /**
       * Returns the week year of a date. (that is the year of the week where this date happens to be)
       * For a week in the middle of the summer, the year is easily obtained, but for a week
       * when New Year's Eve takes place, the year of that week is ambiguous.
       * The thursday day of that week is used to determine the year.
       *
       * @param date {Date} the date to get the week in year of.
       * @return {Integer} the week year.
       */
      __getWeekYear__P_53_12: function __getWeekYear__P_53_12(date) {
        var thursdayDate = this.__thursdayOfSameWeek__P_53_9(date);

        return thursdayDate.getFullYear();
      },

      /**
       * Returns true if the year is a leap one.
       *
       * @param year {Integer} the year to check.
       * @return {Boolean} true if it is a leap year.
       */
      __isLeapYear__P_53_13: function __isLeapYear__P_53_13(year) {
        var februaryDate = new Date(year, 2, 1);
        februaryDate.setDate(-1);
        return februaryDate.getDate() + 1 === 29;
      },

      /**
       * Returns a json object with month and day as keys.
       *
       * @param dayOfYear {Integer} the day of year.
       * @param year {Integer} the year to check.
       * @return {Object} a json object {month: M, day: D}.
       */
      __getMonthAndDayFromDayOfYear__P_53_14: function __getMonthAndDayFromDayOfYear__P_53_14(dayOfYear, year) {
        var month = 0;
        var day = 0; // if we don't know the year, we take a non-leap year'

        if (!year) {
          year = 1971;
        }

        var dayCounter = 0;

        for (var i = 1; i <= 12; i++) {
          var tempDate = new Date(year, i, 1);
          tempDate.setDate(-1);
          var days = tempDate.getDate() + 1;
          dayCounter += days;

          if (dayCounter < dayOfYear) {
            month++;
            day += days;
          } else {
            day = dayOfYear - (dayCounter - days);
            break;
          }
        }

        return {
          month: month,
          day: day
        };
      },

      /**
       * Returns the year of a date when we know the week year
       *
       * @param weekYear {Integer} the week year.
       * @param month {Integer} the month
       * @param dayOfMonth {Integer} the day in month
       * @return {Integer} the year.
       */
      __getYearFromWeekYearAndMonth__P_53_15: function __getYearFromWeekYearAndMonth__P_53_15(weekYear, month, dayOfMonth) {
        var year;

        switch (month) {
          case 11:
            year = weekYear - 1;

            if (weekYear != this.__getWeekYear__P_53_12(new Date(year, month, dayOfMonth))) {
              year = weekYear;
            }

            break;

          case 0:
            year = weekYear + 1;

            if (weekYear != this.__getWeekYear__P_53_12(new Date(year, month, dayOfMonth))) {
              year = weekYear;
            }

            break;

          default:
            year = weekYear;
        }

        return year;
      },

      /**
       * Sets the new value for locale property
       * @param value {String} The new value.
       *
       */
      setLocale: function setLocale(value) {
        if (value !== null && typeof value != "string") {
          throw new Error("Cannot set locale to " + value + " - please provide a string");
        }

        this.__locale__P_53_1 = value === null ? this.__initialLocale__P_53_0 : value;
      },

      /**
       * Resets the Locale
       */
      resetLocale: function resetLocale() {
        this.setLocale(null);
      },

      /**
       * Returns the locale
       */
      getLocale: function getLocale() {
        var locale = this.__locale__P_53_1;

        if (locale === undefined) {
          locale = qx.locale.Manager.getInstance().getLocale();
        }

        return locale;
      },

      /**
       * Returns the original format string
       *
       * @return {String}
       */
      getFormatString: function getFormatString() {
        return this.__format__P_53_2;
      },

      /**
       * Formats a date.
       *
       * @param date {Date} The date to format.
       * @return {String} the formatted date.
       */
      format: function format(date) {
        // check for null dates
        if (date == null) {
          return null;
        }

        if (isNaN(date.getTime())) {
          {
            qx.log.Logger.error("Provided date is invalid");
          }
          return null;
        }

        if (this.__UTC__P_53_3) {
          date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
        }

        var locale = this.getLocale();
        var fullYear = date.getFullYear();
        var month = date.getMonth();
        var dayOfMonth = date.getDate();
        var dayOfWeek = date.getDay();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var ms = date.getMilliseconds();
        var timezoneOffset = date.getTimezoneOffset();
        var timezoneSign = timezoneOffset > 0 ? 1 : -1;
        var timezoneHours = Math.floor(Math.abs(timezoneOffset) / 60);
        var timezoneMinutes = Math.abs(timezoneOffset) % 60; // Create the output

        this.__initFormatTree__P_53_16();

        var output = "";

        for (var i = 0; i < this.__formatTree__P_53_6.length; i++) {
          var currAtom = this.__formatTree__P_53_6[i];

          if (currAtom.type == "literal") {
            output += currAtom.text;
          } else {
            // This is a wildcard
            var wildcardChar = currAtom.character;
            var wildcardSize = currAtom.size; // Get its replacement

            var replacement = "?";

            switch (wildcardChar) {
              case "y":
                // Year
                if (wildcardSize == 2) {
                  replacement = this.__fillNumber__P_53_7(fullYear % 100, 2);
                } else {
                  var year = Math.abs(fullYear);
                  replacement = year + "";

                  if (wildcardSize > replacement.length) {
                    for (var j = replacement.length; j < wildcardSize; j++) {
                      replacement = "0" + replacement;
                    }
                  }

                  if (fullYear < 0) {
                    replacement = "-" + replacement;
                  }
                }

                break;

              case "Y":
                // Year
                replacement = this.__getWeekYear__P_53_12(date) + "";
                var year = replacement.replace("-", "");

                if (wildcardSize > replacement.length) {
                  for (var j = year.length; j < wildcardSize; j++) {
                    year = "0" + year;
                  }
                }

                replacement = replacement.indexOf("-") != -1 ? "-" + year : year;
                break;

              case "G":
                // Era - there is no CLDR data for ERA yet
                if (wildcardSize >= 1 && wildcardSize <= 3) {
                  replacement = fullYear > 0 ? "AD" : "BC";
                } else if (wildcardSize == 4) {
                  replacement = fullYear > 0 ? "Anno Domini" : "Before Christ";
                } else if (wildcardSize == 5) {
                  replacement = fullYear > 0 ? "A" : "B";
                }

                break;

              case "Q":
                // quarter
                if (wildcardSize == 1 || wildcardSize == 2) {
                  replacement = this.__fillNumber__P_53_7(parseInt(month / 4) + 1, wildcardSize);
                }

                if (wildcardSize == 3) {
                  replacement = "Q" + (parseInt(month / 4) + 1);
                }

                break;

              case "q":
                // quarter stand alone
                if (wildcardSize == 1 || wildcardSize == 2) {
                  replacement = this.__fillNumber__P_53_7(parseInt(month / 4) + 1, wildcardSize);
                }

                if (wildcardSize == 3) {
                  replacement = "Q" + (parseInt(month / 4) + 1);
                }

                break;

              case "D":
                // Day in year (e.g. 189)
                replacement = this.__fillNumber__P_53_7(this.__getDayInYear__P_53_8(date), wildcardSize);
                break;

              case "d":
                // Day in month
                replacement = this.__fillNumber__P_53_7(dayOfMonth, wildcardSize);
                break;

              case "w":
                // Week in year (e.g. 27)
                replacement = this.__fillNumber__P_53_7(this.__getWeekInYear__P_53_10(date), wildcardSize);
                break;

              case "W":
                // Week in year (e.g. 27)
                replacement = this.__getWeekInMonth__P_53_11(date);
                break;

              case "E":
                // Day in week
                if (wildcardSize >= 1 && wildcardSize <= 3) {
                  replacement = qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "format", true);
                } else if (wildcardSize == 4) {
                  replacement = qx.locale.Date.getDayName("wide", dayOfWeek, locale, "format", true);
                } else if (wildcardSize == 5) {
                  replacement = qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "format", true);
                }

                break;

              case "e":
                // Day in week
                var startOfWeek = qx.locale.Date.getWeekStart(locale); // the index is 1 based

                var localeDayOfWeek = 1 + (dayOfWeek - startOfWeek >= 0 ? dayOfWeek - startOfWeek : 7 + (dayOfWeek - startOfWeek));

                if (wildcardSize >= 1 && wildcardSize <= 2) {
                  replacement = this.__fillNumber__P_53_7(localeDayOfWeek, wildcardSize);
                } else if (wildcardSize == 3) {
                  replacement = qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "format", true);
                } else if (wildcardSize == 4) {
                  replacement = qx.locale.Date.getDayName("wide", dayOfWeek, locale, "format", true);
                } else if (wildcardSize == 5) {
                  replacement = qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "format", true);
                }

                break;

              case "c":
                // Stand-alone local day in week
                var startOfWeek = qx.locale.Date.getWeekStart(locale); // the index is 1 based

                var localeDayOfWeek = 1 + (dayOfWeek - startOfWeek >= 0 ? dayOfWeek - startOfWeek : 7 + (dayOfWeek - startOfWeek));

                if (wildcardSize == 1) {
                  replacement = "" + localeDayOfWeek;
                } else if (wildcardSize == 3) {
                  replacement = qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "stand-alone", true);
                } else if (wildcardSize == 4) {
                  replacement = qx.locale.Date.getDayName("wide", dayOfWeek, locale, "stand-alone", true);
                } else if (wildcardSize == 5) {
                  replacement = qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "stand-alone", true);
                }

                break;

              case "M":
                // Month
                if (wildcardSize == 1 || wildcardSize == 2) {
                  replacement = this.__fillNumber__P_53_7(month + 1, wildcardSize);
                } else if (wildcardSize == 3) {
                  replacement = qx.locale.Date.getMonthName("abbreviated", month, locale, "format", true);
                } else if (wildcardSize == 4) {
                  replacement = qx.locale.Date.getMonthName("wide", month, locale, "format", true);
                } else if (wildcardSize == 5) {
                  replacement = qx.locale.Date.getMonthName("narrow", month, locale, "format", true);
                }

                break;

              case "L":
                // Stand-alone month
                if (wildcardSize == 1 || wildcardSize == 2) {
                  replacement = this.__fillNumber__P_53_7(month + 1, wildcardSize);
                } else if (wildcardSize == 3) {
                  replacement = qx.locale.Date.getMonthName("abbreviated", month, locale, "stand-alone", true);
                } else if (wildcardSize == 4) {
                  replacement = qx.locale.Date.getMonthName("wide", month, locale, "stand-alone", true);
                } else if (wildcardSize == 5) {
                  replacement = qx.locale.Date.getMonthName("narrow", month, locale, "stand-alone", true);
                }

                break;

              case "a":
                // am/pm marker
                // NOTE: 0:00 is am, 12:00 is pm
                replacement = hours < 12 ? qx.locale.Date.getAmMarker(locale) : qx.locale.Date.getPmMarker(locale);
                break;

              case "H":
                // Hour in day (0-23)
                replacement = this.__fillNumber__P_53_7(hours, wildcardSize);
                break;

              case "k":
                // Hour in day (1-24)
                replacement = this.__fillNumber__P_53_7(hours == 0 ? 24 : hours, wildcardSize);
                break;

              case "K":
                // Hour in am/pm (0-11)
                replacement = this.__fillNumber__P_53_7(hours % 12, wildcardSize);
                break;

              case "h":
                // Hour in am/pm (1-12)
                replacement = this.__fillNumber__P_53_7(hours % 12 == 0 ? 12 : hours % 12, wildcardSize);
                break;

              case "m":
                // Minute in hour
                replacement = this.__fillNumber__P_53_7(minutes, wildcardSize);
                break;

              case "s":
                // Second in minute
                replacement = this.__fillNumber__P_53_7(seconds, wildcardSize);
                break;

              case "S":
                // Fractional second
                replacement = this.__fillNumber__P_53_7(ms, 3);

                if (wildcardSize < replacement.length) {
                  replacement = replacement.substr(0, wildcardSize);
                } else {
                  while (wildcardSize > replacement.length) {
                    // if needed, fill the remaining wildcard length with trailing zeros
                    replacement += "0";
                  }
                }

                break;

              case "z":
                // Time zone
                if (wildcardSize >= 1 && wildcardSize <= 4) {
                  replacement = "GMT" + (timezoneSign > 0 ? "-" : "+") + this.__fillNumber__P_53_7(Math.abs(timezoneHours), 2) + ":" + this.__fillNumber__P_53_7(timezoneMinutes, 2);
                }

                break;

              case "Z":
                // RFC 822 time zone
                if (wildcardSize >= 1 && wildcardSize <= 3) {
                  replacement = (timezoneSign > 0 ? "-" : "+") + this.__fillNumber__P_53_7(Math.abs(timezoneHours), 2) + this.__fillNumber__P_53_7(timezoneMinutes, 2);
                } else {
                  replacement = "GMT" + (timezoneSign > 0 ? "-" : "+") + this.__fillNumber__P_53_7(Math.abs(timezoneHours), 2) + ":" + this.__fillNumber__P_53_7(timezoneMinutes, 2);
                }

                break;
            }

            output += replacement;
          }
        }

        return output;
      },

      /**
       * Parses a date.
       *
       * @param dateStr {String} the date to parse.
       * @return {Date} the parsed date.
       * @throws {Error} If the format is not well formed or if the date string does not
       *       match to the format.
       */
      parse: function parse(dateStr) {
        this.__initParseFeed__P_53_17(); // Apply the regex


        var hit = this.__parseFeed__P_53_4.regex.exec(dateStr);

        if (hit == null) {
          throw new Error("Date string '" + dateStr + "' does not match the date format: " + this.__format__P_53_2);
        } // Apply the rules


        var dateValues = {
          era: 1,
          year: 1970,
          quarter: 1,
          month: 0,
          day: 1,
          dayOfYear: 1,
          hour: 0,
          ispm: false,
          weekDay: 4,
          weekYear: 1970,
          weekOfMonth: 1,
          weekOfYear: 1,
          min: 0,
          sec: 0,
          ms: 0,
          tzOffsetMins: null
        };
        var currGroup = 1;
        var applyWeekYearAfterRule = false;
        var applyDayOfYearAfterRule = false;

        for (var i = 0; i < this.__parseFeed__P_53_4.usedRules.length; i++) {
          var rule = this.__parseFeed__P_53_4.usedRules[i];
          var value = hit[currGroup];

          if (rule.field != null) {
            dateValues[rule.field] = parseInt(value, 10);
          } else {
            rule.manipulator(dateValues, value, rule.pattern);
          }

          if (rule.pattern == "Y+") {
            var yearRuleApplied = false;

            for (var k = 0; k < this.__parseFeed__P_53_4.usedRules.length; k++) {
              if (this.__parseFeed__P_53_4.usedRules[k].pattern == "y+") {
                yearRuleApplied = true;
                break;
              }
            }

            if (!yearRuleApplied) {
              applyWeekYearAfterRule = true;
            }
          }

          if (rule.pattern.indexOf("D") != -1) {
            var dayRuleApplied = false;

            for (var k = 0; k < this.__parseFeed__P_53_4.usedRules.length; k++) {
              if (this.__parseFeed__P_53_4.usedRules[k].pattern.indexOf("d") != -1) {
                dayRuleApplied = true;
                break;
              }
            }

            if (!dayRuleApplied) {
              applyDayOfYearAfterRule = true;
            }
          }

          currGroup += rule.groups == null ? 1 : rule.groups;
        }

        if (applyWeekYearAfterRule) {
          dateValues.year = this.__getYearFromWeekYearAndMonth__P_53_15(dateValues.weekYear, dateValues.month, dateValues.day);
        }

        if (applyDayOfYearAfterRule) {
          var dayAndMonth = this.__getMonthAndDayFromDayOfYear__P_53_14(dateValues.dayOfYear, dateValues.year);

          dateValues.month = dayAndMonth.month;
          dateValues.day = dayAndMonth.day;
        }

        if (dateValues.era < 0 && dateValues.year * dateValues.era < 0) {
          dateValues.year = dateValues.year * dateValues.era;
        }

        var date;

        if (this.__UTC__P_53_3 || dateValues.tzOffsetMins !== null) {
          var utcMs = Date.UTC(dateValues.year, dateValues.month, dateValues.day, dateValues.ispm ? dateValues.hour + 12 : dateValues.hour, dateValues.min, dateValues.sec, dateValues.ms);

          if (dateValues.tzOffsetMins !== 0) {
            utcMs += dateValues.tzOffsetMins * 60000;
          }

          date = new Date(utcMs);

          if (this.__UTC__P_53_3 && (dateValues.month !== date.getUTCMonth() || dateValues.year !== date.getUTCFullYear())) {
            throw new Error("Error parsing date '" + dateStr + "': the value for day or month is too large");
          }
        } else {
          date = new Date(dateValues.year, dateValues.month, dateValues.day, dateValues.ispm ? dateValues.hour + 12 : dateValues.hour, dateValues.min, dateValues.sec, dateValues.ms);

          if (dateValues.month !== date.getMonth() || dateValues.year !== date.getFullYear()) {
            throw new Error("Error parsing date '" + dateStr + "': the value for day or month is too large");
          }
        }

        return date;
      },

      /**
       * Helper method for {@link #format()} and {@link #parse()}.
       * Parses the date format.
       *
       */
      __initFormatTree__P_53_16: function __initFormatTree__P_53_16() {
        if (this.__formatTree__P_53_6 != null) {
          return;
        }

        this.__formatTree__P_53_6 = [];
        var currWildcardChar;
        var currWildcardSize = 0;
        var currLiteral = "";
        var format = this.__format__P_53_2;
        var state = "default";
        var i = 0;

        while (i < format.length) {
          var currChar = format.charAt(i);

          switch (state) {
            case "quoted_literal":
              // We are now inside a quoted literal
              // Check whether the current character is an escaped "'" character
              if (currChar == "'") {
                if (i + 1 >= format.length) {
                  // this is the last character
                  i++;
                  break;
                }

                var lookAhead = format.charAt(i + 1);

                if (lookAhead == "'") {
                  currLiteral += currChar;
                  i++;
                } else {
                  // quoted literal ends
                  i++;
                  state = "unkown";
                }
              } else {
                currLiteral += currChar;
                i++;
              }

              break;

            case "wildcard":
              // Check whether the currChar belongs to that wildcard
              if (currChar == currWildcardChar) {
                // It does -> Raise the size
                currWildcardSize++;
                i++;
              } else {
                // It does not -> The current wildcard is done
                this.__formatTree__P_53_6.push({
                  type: "wildcard",
                  character: currWildcardChar,
                  size: currWildcardSize
                });

                currWildcardChar = null;
                currWildcardSize = 0;
                state = "default";
              }

              break;

            default:
              // We are not (any more) in a wildcard or quoted literal -> Check what's starting here
              if (currChar >= "a" && currChar <= "z" || currChar >= "A" && currChar <= "Z") {
                // This is a letter -> All letters are wildcards
                // Start a new wildcard
                currWildcardChar = currChar;
                state = "wildcard";
              } else if (currChar == "'") {
                if (i + 1 >= format.length) {
                  // this is the last character
                  currLiteral += currChar;
                  i++;
                  break;
                }

                var lookAhead = format.charAt(i + 1);

                if (lookAhead == "'") {
                  currLiteral += currChar;
                  i++;
                }

                i++;
                state = "quoted_literal";
              } else {
                state = "default";
              }

              if (state != "default") {
                // Add the literal
                if (currLiteral.length > 0) {
                  this.__formatTree__P_53_6.push({
                    type: "literal",
                    text: currLiteral
                  });

                  currLiteral = "";
                }
              } else {
                // This is an unquoted literal -> Add it to the current literal
                currLiteral += currChar;
                i++;
              }

              break;
          }
        } // Add the last wildcard or literal


        if (currWildcardChar != null) {
          this.__formatTree__P_53_6.push({
            type: "wildcard",
            character: currWildcardChar,
            size: currWildcardSize
          });
        } else if (currLiteral.length > 0) {
          this.__formatTree__P_53_6.push({
            type: "literal",
            text: currLiteral
          });
        }
      },

      /**
       * Initializes the parse feed.
       *
       * The parse contains everything needed for parsing: The regular expression
       * (in compiled and uncompiled form) and the used rules.
       *
       * @throws {Error} If the date format is malformed.
       */
      __initParseFeed__P_53_17: function __initParseFeed__P_53_17() {
        if (this.__parseFeed__P_53_4 != null) {
          // We already have the parse feed
          return;
        }

        var format = this.__format__P_53_2; // Initialize the rules

        this.__initParseRules__P_53_18();

        this.__initFormatTree__P_53_16(); // Get the used rules and construct the regex pattern


        var usedRules = [];
        var pattern = "^";

        for (var atomIdx = 0; atomIdx < this.__formatTree__P_53_6.length; atomIdx++) {
          var currAtom = this.__formatTree__P_53_6[atomIdx];

          if (currAtom.type == "literal") {
            pattern += qx.lang.String.escapeRegexpChars(currAtom.text);
          } else {
            // This is a wildcard
            var wildcardChar = currAtom.character;
            var wildcardSize = currAtom.size; // Get the rule for this wildcard

            var wildcardRule;

            for (var ruleIdx = 0; ruleIdx < this.__parseRules__P_53_5.length; ruleIdx++) {
              var rule = this.__parseRules__P_53_5[ruleIdx];

              if (this.__isRuleForWildcard__P_53_19(rule, wildcardChar, wildcardSize)) {
                // We found the right rule for the wildcard
                wildcardRule = rule;
                break;
              }
            } // Check the rule


            if (wildcardRule == null) {
              // We have no rule for that wildcard -> Malformed date format
              var wildcardStr = "";

              for (var i = 0; i < wildcardSize; i++) {
                wildcardStr += wildcardChar;
              }

              throw new Error("Malformed date format: " + format + ". Wildcard " + wildcardStr + " is not supported");
            } else {
              // Add the rule to the pattern
              usedRules.push(wildcardRule);
              pattern += wildcardRule.regex;
            }
          }
        }

        pattern += "$"; // Create the regex

        var regex;

        try {
          regex = new RegExp(pattern);
        } catch (exc) {
          throw new Error("Malformed date format: " + format);
        } // Create the this.__parseFeed


        this.__parseFeed__P_53_4 = {
          regex: regex,
          usedRules: usedRules,
          pattern: pattern
        };
      },

      /**
       * Checks whether the rule matches the wildcard or not.
       * @param rule {Object} the rule we try to match with the wildcard
       * @param wildcardChar {String} the character in the wildcard
       * @param wildcardSize {Integer} the number of  wildcardChar characters in the wildcard
       * @return {Boolean} if the rule matches or not
       */
      __isRuleForWildcard__P_53_19: function __isRuleForWildcard__P_53_19(rule, wildcardChar, wildcardSize) {
        if (wildcardChar === "y" && rule.pattern === "y+") {
          rule.regex = rule.regexFunc(wildcardSize);
          return true;
        } else if (wildcardChar === "Y" && rule.pattern === "Y+") {
          rule.regex = rule.regexFunc(wildcardSize);
          return true;
        } else {
          return wildcardChar == rule.pattern.charAt(0) && wildcardSize == rule.pattern.length;
        }
      },

      /**
       * Initializes the static parse rules.
       *
       */
      __initParseRules__P_53_18: function __initParseRules__P_53_18() {
        var DateFormat = qx.util.format.DateFormat;
        var LString = qx.lang.String;

        if (this.__parseRules__P_53_5 != null) {
          // The parse rules are already initialized
          return;
        }

        var rules = this.__parseRules__P_53_5 = [];
        var amMarker = qx.locale.Date.getAmMarker(this.getLocale()).toString() || DateFormat.AM_MARKER;
        var pmMarker = qx.locale.Date.getPmMarker(this.getLocale()).toString() || DateFormat.PM_MARKER;
        var locale = this.getLocale();

        var yearManipulator = function yearManipulator(dateValues, value) {
          value = parseInt(value, 10);

          if (value >= 0) {
            if (value < DateFormat.ASSUME_YEAR_2000_THRESHOLD) {
              value += 2000;
            } else if (value < 100) {
              value += 1900;
            }
          }

          dateValues.year = value;
        };

        var weekYearManipulator = function weekYearManipulator(dateValues, value) {
          value = parseInt(value, 10);

          if (value >= 0) {
            if (value < DateFormat.ASSUME_YEAR_2000_THRESHOLD) {
              value += 2000;
            } else if (value < 100) {
              value += 1900;
            }
          }

          dateValues.weekYear = value;
        };

        var monthManipulator = function monthManipulator(dateValues, value) {
          dateValues.month = parseInt(value, 10) - 1;
        };

        var localWeekDayManipulator = function localWeekDayManipulator(dateValues, value) {
          var startOfWeek = qx.locale.Date.getWeekStart(locale);
          var dayOfWeek = parseInt(value, 10) - 1 + startOfWeek <= 6 ? parseInt(value, 10) - 1 + startOfWeek : parseInt(value, 10) - 1 + startOfWeek - 7;
          dateValues.weekDay = dayOfWeek;
        };

        var ampmManipulator = function ampmManipulator(dateValues, value) {
          var pmMarker = qx.locale.Date.getPmMarker(locale).toString() || DateFormat.PM_MARKER;
          dateValues.ispm = value == pmMarker;
        };

        var noZeroHourManipulator = function noZeroHourManipulator(dateValues, value) {
          dateValues.hour = parseInt(value, 10) % 24;
        };

        var noZeroAmPmHourManipulator = function noZeroAmPmHourManipulator(dateValues, value) {
          dateValues.hour = parseInt(value, 10) % 12;
        };

        var timezoneManipulator = function timezoneManipulator(dateValues, value) {
          var regEx = new RegExp("([+-]?)(\\d\\d)(?::?(\\d\\d))?$");
          var tzResults = regEx.exec(value);
          var offsetHours = parseInt(tzResults[2], 10);
          var offsetMins = parseInt(tzResults[3], 10); // basic check, hours range is -12 to +14 https://en.wikipedia.org/wiki/Category:UTC_offsets

          if (offsetHours > 14) {
            throw new Error("Invalid hours in time zone offset.");
          }

          if (offsetMins > 59) {
            throw new Error("Invalid minutes in time zone offset.");
          }

          dateValues.tzOffsetMins = offsetHours * 60 + offsetMins;

          if (tzResults[1] === "-") {
            dateValues.tzOffsetMins = -dateValues.tzOffsetMins;
          }
        }; // var ignoreManipulator = function(dateValues, value) {
        //   return;
        // };


        var narrowEraNames = ["A", "B"];

        var narrowEraNameManipulator = function narrowEraNameManipulator(dateValues, value) {
          dateValues.era = value == "A" ? 1 : -1;
        };

        var abbrevEraNames = ["AD", "BC"];

        var abbrevEraNameManipulator = function abbrevEraNameManipulator(dateValues, value) {
          dateValues.era = value == "AD" ? 1 : -1;
        };

        var fullEraNames = ["Anno Domini", "Before Christ"];

        var fullEraNameManipulator = function fullEraNameManipulator(dateValues, value) {
          dateValues.era = value == "Anno Domini" ? 1 : -1;
        };

        var abbrevQuarterNames = ["Q1", "Q2", "Q3", "Q4"];

        var abbrevQuarterManipulator = function abbrevQuarterManipulator(dateValues, value) {
          dateValues.quarter = abbrevQuarterNames.indexOf(value);
        };

        var fullQuarterNames = ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"];

        var fullQuarterManipulator = function fullQuarterManipulator(dateValues, value) {
          dateValues.quarter = fullQuarterNames.indexOf(value);
        };

        var cache = {};

        var dateNamesManipulator = function dateNamesManipulator(pattern) {
          var monthPatternLetters = ["L", "M"];
          var dayPatternLetters = ["c", "e", "E"];
          var firstLetterInPattern = pattern.charAt(0);
          var isMonth = monthPatternLetters.indexOf(firstLetterInPattern) >= 0;

          var getContext = function getContext() {
            var letters = isMonth ? monthPatternLetters : dayPatternLetters;
            var context = firstLetterInPattern === letters[0] ? "stand-alone" : "format";
            var patternLength = pattern.length;
            var lengthName = "abbreviated";

            switch (patternLength) {
              case 4:
                lengthName = "wide";
                break;

              case 5:
                lengthName = "narrow";
                break;

              default:
                lengthName = "abbreviated";
            }

            return [context, lengthName];
          };

          if (!cache[pattern]) {
            cache[pattern] = {};
            var context = getContext();
            var func = isMonth ? qx.locale.Date.getMonthNames : qx.locale.Date.getDayNames;
            var names = func.call(qx.locale.Date, context[1], locale, context[0], true);

            for (var i = 0, l = names.length; i < l; i++) {
              names[i] = LString.escapeRegexpChars(names[i].toString());
            }

            cache[pattern].data = names;

            cache[pattern].func = function (dateValues, value) {
              value = LString.escapeRegexpChars(value);
              dateValues[isMonth ? "month" : "weekDay"] = names.indexOf(value);
            };
          }

          return cache[pattern];
        }; // Unsupported: F (Day of week in month)


        rules.push({
          pattern: "y+",
          regexFunc: function regexFunc(yNumber) {
            var regex = "(-*";

            for (var i = 0; i < yNumber; i++) {
              regex += "\\d";

              if (i === yNumber - 1 && i !== 1) {
                regex += "+?";
              }
            }

            regex += ")";
            return regex;
          },
          manipulator: yearManipulator
        });
        rules.push({
          pattern: "Y+",
          regexFunc: function regexFunc(yNumber) {
            var regex = "(-*";

            for (var i = 0; i < yNumber; i++) {
              regex += "\\d";

              if (i === yNumber - 1) {
                regex += "+?";
              }
            }

            regex += ")";
            return regex;
          },
          manipulator: weekYearManipulator
        });
        rules.push({
          pattern: "G",
          regex: "(" + abbrevEraNames.join("|") + ")",
          manipulator: abbrevEraNameManipulator
        });
        rules.push({
          pattern: "GG",
          regex: "(" + abbrevEraNames.join("|") + ")",
          manipulator: abbrevEraNameManipulator
        });
        rules.push({
          pattern: "GGG",
          regex: "(" + abbrevEraNames.join("|") + ")",
          manipulator: abbrevEraNameManipulator
        });
        rules.push({
          pattern: "GGGG",
          regex: "(" + fullEraNames.join("|") + ")",
          manipulator: fullEraNameManipulator
        });
        rules.push({
          pattern: "GGGGG",
          regex: "(" + narrowEraNames.join("|") + ")",
          manipulator: narrowEraNameManipulator
        });
        rules.push({
          pattern: "Q",
          regex: "(\\d\\d*?)",
          field: "quarter"
        });
        rules.push({
          pattern: "QQ",
          regex: "(\\d\\d?)",
          field: "quarter"
        });
        rules.push({
          pattern: "QQQ",
          regex: "(" + abbrevQuarterNames.join("|") + ")",
          manipulator: abbrevQuarterManipulator
        });
        rules.push({
          pattern: "QQQQ",
          regex: "(" + fullQuarterNames.join("|") + ")",
          manipulator: fullQuarterManipulator
        });
        rules.push({
          pattern: "q",
          regex: "(\\d\\d*?)",
          field: "quarter"
        });
        rules.push({
          pattern: "qq",
          regex: "(\\d\\d?)",
          field: "quarter"
        });
        rules.push({
          pattern: "qqq",
          regex: "(" + abbrevQuarterNames.join("|") + ")",
          manipulator: abbrevQuarterManipulator
        });
        rules.push({
          pattern: "qqqq",
          regex: "(" + fullQuarterNames.join("|") + ")",
          manipulator: fullQuarterManipulator
        });
        rules.push({
          pattern: "M",
          regex: "(\\d\\d*?)",
          manipulator: monthManipulator
        });
        rules.push({
          pattern: "MM",
          regex: "(\\d\\d?)",
          manipulator: monthManipulator
        });
        rules.push({
          pattern: "MMM",
          regex: "(" + dateNamesManipulator("MMM").data.join("|") + ")",
          manipulator: dateNamesManipulator("MMM").func
        });
        rules.push({
          pattern: "MMMM",
          regex: "(" + dateNamesManipulator("MMMM").data.join("|") + ")",
          manipulator: dateNamesManipulator("MMMM").func
        });
        rules.push({
          pattern: "MMMMM",
          regex: "(" + dateNamesManipulator("MMMMM").data.join("|") + ")",
          manipulator: dateNamesManipulator("MMMMM").func
        });
        rules.push({
          pattern: "L",
          regex: "(\\d\\d*?)",
          manipulator: monthManipulator
        });
        rules.push({
          pattern: "LL",
          regex: "(\\d\\d?)",
          manipulator: monthManipulator
        });
        rules.push({
          pattern: "LLL",
          regex: "(" + dateNamesManipulator("LLL").data.join("|") + ")",
          manipulator: dateNamesManipulator("LLL").func
        });
        rules.push({
          pattern: "LLLL",
          regex: "(" + dateNamesManipulator("LLLL").data.join("|") + ")",
          manipulator: dateNamesManipulator("LLLL").func
        });
        rules.push({
          pattern: "LLLLL",
          regex: "(" + dateNamesManipulator("LLLLL").data.join("|") + ")",
          manipulator: dateNamesManipulator("LLLLL").func
        });
        rules.push({
          pattern: "dd",
          regex: "(\\d\\d?)",
          field: "day"
        });
        rules.push({
          pattern: "d",
          regex: "(\\d\\d*?)",
          field: "day"
        });
        rules.push({
          pattern: "D",
          regex: "(\\d?)",
          field: "dayOfYear"
        });
        rules.push({
          pattern: "DD",
          regex: "(\\d\\d?)",
          field: "dayOfYear"
        });
        rules.push({
          pattern: "DDD",
          regex: "(\\d\\d\\d?)",
          field: "dayOfYear"
        });
        rules.push({
          pattern: "E",
          regex: "(" + dateNamesManipulator("E").data.join("|") + ")",
          manipulator: dateNamesManipulator("E").func
        });
        rules.push({
          pattern: "EE",
          regex: "(" + dateNamesManipulator("EE").data.join("|") + ")",
          manipulator: dateNamesManipulator("EE").func
        });
        rules.push({
          pattern: "EEE",
          regex: "(" + dateNamesManipulator("EEE").data.join("|") + ")",
          manipulator: dateNamesManipulator("EEE").func
        });
        rules.push({
          pattern: "EEEE",
          regex: "(" + dateNamesManipulator("EEEE").data.join("|") + ")",
          manipulator: dateNamesManipulator("EEEE").func
        });
        rules.push({
          pattern: "EEEEE",
          regex: "(" + dateNamesManipulator("EEEEE").data.join("|") + ")",
          manipulator: dateNamesManipulator("EEEEE").func
        });
        rules.push({
          pattern: "e",
          regex: "(\\d?)",
          manipulator: localWeekDayManipulator
        });
        rules.push({
          pattern: "ee",
          regex: "(\\d\\d?)",
          manipulator: localWeekDayManipulator
        });
        rules.push({
          pattern: "eee",
          regex: "(" + dateNamesManipulator("eee").data.join("|") + ")",
          manipulator: dateNamesManipulator("eee").func
        });
        rules.push({
          pattern: "eeee",
          regex: "(" + dateNamesManipulator("eeee").data.join("|") + ")",
          manipulator: dateNamesManipulator("eeee").func
        });
        rules.push({
          pattern: "eeeee",
          regex: "(" + dateNamesManipulator("eeeee").data.join("|") + ")",
          manipulator: dateNamesManipulator("eeeee").func
        });
        rules.push({
          pattern: "c",
          regex: "\\d?",
          manipulator: localWeekDayManipulator
        });
        rules.push({
          pattern: "ccc",
          regex: "(" + dateNamesManipulator("ccc").data.join("|") + ")",
          manipulator: dateNamesManipulator("ccc").func
        });
        rules.push({
          pattern: "cccc",
          regex: "(" + dateNamesManipulator("cccc").data.join("|") + ")",
          manipulator: dateNamesManipulator("cccc").func
        });
        rules.push({
          pattern: "ccccc",
          regex: "(" + dateNamesManipulator("ccccc").data.join("|") + ")",
          manipulator: dateNamesManipulator("ccccc").func
        });
        rules.push({
          pattern: "a",
          regex: "(" + amMarker + "|" + pmMarker + ")",
          manipulator: ampmManipulator
        });
        rules.push({
          pattern: "W",
          regex: "(\\d?)",
          field: "weekOfMonth"
        });
        rules.push({
          pattern: "w",
          regex: "(\\d\\d?)",
          field: "weekOfYear"
        });
        rules.push({
          pattern: "ww",
          regex: "(\\d\\d)",
          field: "weekOfYear"
        });
        rules.push({
          pattern: "HH",
          regex: "(\\d\\d?)",
          field: "hour"
        });
        rules.push({
          pattern: "H",
          regex: "(\\d\\d?)",
          field: "hour"
        });
        rules.push({
          pattern: "kk",
          regex: "(\\d\\d?)",
          manipulator: noZeroHourManipulator
        });
        rules.push({
          pattern: "k",
          regex: "(\\d\\d?)",
          manipulator: noZeroHourManipulator
        });
        rules.push({
          pattern: "KK",
          regex: "(\\d\\d?)",
          field: "hour"
        });
        rules.push({
          pattern: "K",
          regex: "(\\d\\d?)",
          field: "hour"
        });
        rules.push({
          pattern: "hh",
          regex: "(\\d\\d?)",
          manipulator: noZeroAmPmHourManipulator
        });
        rules.push({
          pattern: "h",
          regex: "(\\d\\d?)",
          manipulator: noZeroAmPmHourManipulator
        });
        rules.push({
          pattern: "mm",
          regex: "(\\d\\d?)",
          field: "min"
        });
        rules.push({
          pattern: "m",
          regex: "(\\d\\d?)",
          field: "min"
        });
        rules.push({
          pattern: "ss",
          regex: "(\\d\\d?)",
          field: "sec"
        });
        rules.push({
          pattern: "s",
          regex: "(\\d\\d?)",
          field: "sec"
        });
        rules.push({
          pattern: "SSS",
          regex: "(\\d\\d?\\d?)",
          field: "ms"
        });
        rules.push({
          pattern: "SS",
          regex: "(\\d\\d?\\d?)",
          field: "ms"
        });
        rules.push({
          pattern: "S",
          regex: "(\\d\\d?\\d?)",
          field: "ms"
        });
        rules.push({
          pattern: "Z",
          regex: "([\\+\\-]\\d\\d\\d\\d)",
          manipulator: timezoneManipulator
        });
        rules.push({
          pattern: "z",
          regex: "(GMT[\\+\\-]\\d\\d:\\d\\d)",
          manipulator: timezoneManipulator
        });
      }
    }
  });
  qx.util.format.DateFormat.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Dom": {
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
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Keyboard input event object.
   *
   * the interface of this class is based on the DOM Level 3 keyboard event
   * interface: http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents
   */
  qx.Class.define("qx.event.type.KeyInput", {
    extend: qx.event.type.Dom,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Initialize the fields of the event.
       *
       * @param domEvent {Event} DOM event
       * @param target {Object} The event target
       * @param charCode {Integer} the character code
       * @return {qx.event.type.KeyInput} The initialized key event instance
       */
      init: function init(domEvent, target, charCode) {
        qx.event.type.KeyInput.superclass.prototype.init.call(this, domEvent, target, null, true, true);
        this._charCode = charCode;
        return this;
      },
      // overridden
      clone: function clone(embryo) {
        var clone = qx.event.type.KeyInput.superclass.prototype.clone.call(this, embryo);
        clone._charCode = this._charCode;
        return clone;
      },

      /**
       * Unicode number of the pressed character.
       *
       * @return {Integer} Unicode number of the pressed character
       */
      getCharCode: function getCharCode() {
        return this._charCode;
      },

      /**
       * Returns the pressed character
       *
       * @return {String} The character
       */
      getChar: function getChar() {
        return String.fromCharCode(this._charCode);
      }
    }
  });
  qx.event.type.KeyInput.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Dom": {
        "require": true
      },
      "qx.event.util.Keyboard": {}
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
   * Keyboard event object.
   *
   * the interface of this class is based on the DOM Level 3 keyboard event
   * interface: http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents
   */
  qx.Class.define("qx.event.type.KeySequence", {
    extend: qx.event.type.Dom,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Initialize the fields of the event.
       *
       * @param domEvent {Event} DOM event
       * @param target {Object} The event target
       * @param identifier {String} Key identifier
       * @return {qx.event.type.KeySequence} The initialized key event instance
       */
      init: function init(domEvent, target, identifier) {
        qx.event.type.KeySequence.superclass.prototype.init.call(this, domEvent, target, null, true, true);
        this._keyCode = domEvent.keyCode;
        this._identifier = identifier;
        return this;
      },
      // overridden
      clone: function clone(embryo) {
        var clone = qx.event.type.KeySequence.superclass.prototype.clone.call(this, embryo);
        clone._keyCode = this._keyCode;
        clone._identifier = this._identifier;
        return clone;
      },

      /**
       * Identifier of the pressed key. This property is modeled after the <em>KeyboardEvent.keyIdentifier</em> property
       * of the W3C DOM 3 event specification
       * (http://www.w3.org/TR/2003/NOTE-DOM-Level-3-Events-20031107/events.html#Events-KeyboardEvent-keyIdentifier).
       *
       * Printable keys are represented by an unicode string, non-printable keys
       * have one of the following values:
       *
       * <table>
       * <tr><th>Backspace</th><td>The Backspace (Back) key.</td></tr>
       * <tr><th>Tab</th><td>The Horizontal Tabulation (Tab) key.</td></tr>
       * <tr><th>Space</th><td>The Space (Spacebar) key.</td></tr>
       * <tr><th>Enter</th><td>The Enter key. Note: This key identifier is also used for the Return (Macintosh numpad) key.</td></tr>
       * <tr><th>Shift</th><td>The Shift key.</td></tr>
       * <tr><th>Control</th><td>The Control (Ctrl) key.</td></tr>
       * <tr><th>Alt</th><td>The Alt (Menu) key.</td></tr>
       * <tr><th>CapsLock</th><td>The CapsLock key</td></tr>
       * <tr><th>Meta</th><td>The Meta key. (Apple Meta and Windows key)</td></tr>
       * <tr><th>Escape</th><td>The Escape (Esc) key.</td></tr>
       * <tr><th>Left</th><td>The Left Arrow key.</td></tr>
       * <tr><th>Up</th><td>The Up Arrow key.</td></tr>
       * <tr><th>Right</th><td>The Right Arrow key.</td></tr>
       * <tr><th>Down</th><td>The Down Arrow key.</td></tr>
       * <tr><th>PageUp</th><td>The Page Up key.</td></tr>
       * <tr><th>PageDown</th><td>The Page Down (Next) key.</td></tr>
       * <tr><th>End</th><td>The End key.</td></tr>
       * <tr><th>Home</th><td>The Home key.</td></tr>
       * <tr><th>Insert</th><td>The Insert (Ins) key. (Does not fire in Opera/Win)</td></tr>
       * <tr><th>Delete</th><td>The Delete (Del) Key.</td></tr>
       * <tr><th>F1</th><td>The F1 key.</td></tr>
       * <tr><th>F2</th><td>The F2 key.</td></tr>
       * <tr><th>F3</th><td>The F3 key.</td></tr>
       * <tr><th>F4</th><td>The F4 key.</td></tr>
       * <tr><th>F5</th><td>The F5 key.</td></tr>
       * <tr><th>F6</th><td>The F6 key.</td></tr>
       * <tr><th>F7</th><td>The F7 key.</td></tr>
       * <tr><th>F8</th><td>The F8 key.</td></tr>
       * <tr><th>F9</th><td>The F9 key.</td></tr>
       * <tr><th>F10</th><td>The F10 key.</td></tr>
       * <tr><th>F11</th><td>The F11 key.</td></tr>
       * <tr><th>F12</th><td>The F12 key.</td></tr>
       * <tr><th>NumLock</th><td>The Num Lock key.</td></tr>
       * <tr><th>PrintScreen</th><td>The Print Screen (PrintScrn, SnapShot) key.</td></tr>
       * <tr><th>Scroll</th><td>The scroll lock key</td></tr>
       * <tr><th>Pause</th><td>The pause/break key</td></tr>
       * <tr><th>Win</th><td>The Windows Logo key</td></tr>
       * <tr><th>Apps</th><td>The Application key (Windows Context Menu)</td></tr>
       * </table>
       *
       * @return {String} The key identifier
       */
      getKeyIdentifier: function getKeyIdentifier() {
        return this._identifier;
      },

      /**
       * Returns the native keyCode and is best used on keydown/keyup events to
       * check which physical key was pressed.
       * Don't use this on keypress events because it's erroneous and
       * inconsistent across browsers. But it can be used to detect which key is
       * exactly pressed (e.g. for num pad keys).
       * In any regular case, you should use {@link #getKeyIdentifier} which
       * takes care of all cross browser stuff.
       *
       * The key codes are not character codes, they are just ASCII codes to
       * identify the keyboard (or other input devices) keys.
       *
       * @return {Number} The key code.
       */
      getKeyCode: function getKeyCode() {
        return this._keyCode;
      },

      /**
       * Checks whether the pressed key is printable.
       *
       * @return {Boolean} Whether the pressed key is printable.
       */
      isPrintable: function isPrintable() {
        return qx.event.util.Keyboard.isPrintableKeyIdentifier(this._identifier);
      }
    }
  });
  qx.event.type.KeySequence.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.OperatingSystem": {
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "os.name": {
          "load": true,
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
       2004-2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Andreas Ecker (ecker)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Utilities for working with character codes and key identifiers
   */
  qx.Bootstrap.define("qx.event.util.Keyboard", {
    statics: {
      /*
      ---------------------------------------------------------------------------
        KEY MAPS
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Map} maps the charcodes of special printable keys to key identifiers
       *
       * @lint ignoreReferenceField(specialCharCodeMap)
       */
      specialCharCodeMap: {
        8: "Backspace",
        // The Backspace (Back) key.
        9: "Tab",
        // The Horizontal Tabulation (Tab) key.
        //   Note: This key identifier is also used for the
        //   Return (Macintosh numpad) key.
        13: "Enter",
        // The Enter key.
        27: "Escape",
        // The Escape (Esc) key.
        32: "Space" // The Space (Spacebar) key.

      },

      /**
       * @type {Map} maps the keycodes of the numpad keys to the right charcodes
       *
       * @lint ignoreReferenceField(numpadToCharCode)
       */
      numpadToCharCode: {
        96: "0".charCodeAt(0),
        97: "1".charCodeAt(0),
        98: "2".charCodeAt(0),
        99: "3".charCodeAt(0),
        100: "4".charCodeAt(0),
        101: "5".charCodeAt(0),
        102: "6".charCodeAt(0),
        103: "7".charCodeAt(0),
        104: "8".charCodeAt(0),
        105: "9".charCodeAt(0),
        106: "*".charCodeAt(0),
        107: "+".charCodeAt(0),
        109: "-".charCodeAt(0),
        110: ",".charCodeAt(0),
        111: "/".charCodeAt(0)
      },

      /**
       * @type {Map} maps the keycodes of non printable keys to key identifiers
       *
       * @lint ignoreReferenceField(keyCodeToIdentifierMap)
       */
      keyCodeToIdentifierMap: {
        16: "Shift",
        // The Shift key.
        17: "Control",
        // The Control (Ctrl) key.
        18: "Alt",
        // The Alt (Menu) key.
        20: "CapsLock",
        // The CapsLock key
        224: "Meta",
        // The Meta key. (Apple Meta and Windows key)
        37: "Left",
        // The Left Arrow key.
        38: "Up",
        // The Up Arrow key.
        39: "Right",
        // The Right Arrow key.
        40: "Down",
        // The Down Arrow key.
        33: "PageUp",
        // The Page Up key.
        34: "PageDown",
        // The Page Down (Next) key.
        35: "End",
        // The End key.
        36: "Home",
        // The Home key.
        45: "Insert",
        // The Insert (Ins) key. (Does not fire in Opera/Win)
        46: "Delete",
        // The Delete (Del) Key.
        112: "F1",
        // The F1 key.
        113: "F2",
        // The F2 key.
        114: "F3",
        // The F3 key.
        115: "F4",
        // The F4 key.
        116: "F5",
        // The F5 key.
        117: "F6",
        // The F6 key.
        118: "F7",
        // The F7 key.
        119: "F8",
        // The F8 key.
        120: "F9",
        // The F9 key.
        121: "F10",
        // The F10 key.
        122: "F11",
        // The F11 key.
        123: "F12",
        // The F12 key.
        144: "NumLock",
        // The Num Lock key.
        44: "PrintScreen",
        // The Print Screen (PrintScrn, SnapShot) key.
        145: "Scroll",
        // The scroll lock key
        19: "Pause",
        // The pause/break key
        // The left Windows Logo key or left cmd key
        91: qx.core.Environment.get("os.name") == "osx" ? "cmd" : "Win",
        92: "Win",
        // The right Windows Logo key or left cmd key
        // The Application key (Windows Context Menu) or right cmd key
        93: qx.core.Environment.get("os.name") == "osx" ? "cmd" : "Apps"
      },

      /** char code for capital A */
      charCodeA: "A".charCodeAt(0),

      /** char code for capital Z */
      charCodeZ: "Z".charCodeAt(0),

      /** char code for 0 */
      charCode0: "0".charCodeAt(0),

      /** char code for 9 */
      charCode9: "9".charCodeAt(0),

      /**
       * converts a keyboard code to the corresponding identifier
       *
       * @param keyCode {Integer} key code
       * @return {String} key identifier
       */
      keyCodeToIdentifier: function keyCodeToIdentifier(keyCode) {
        if (this.isIdentifiableKeyCode(keyCode)) {
          var numPadKeyCode = this.numpadToCharCode[keyCode];

          if (numPadKeyCode) {
            return String.fromCharCode(numPadKeyCode);
          }

          return this.keyCodeToIdentifierMap[keyCode] || this.specialCharCodeMap[keyCode] || String.fromCharCode(keyCode);
        } else {
          return "Unidentified";
        }
      },

      /**
       * converts a character code to the corresponding identifier
       *
       * @param charCode {String} character code
       * @return {String} key identifier
       */
      charCodeToIdentifier: function charCodeToIdentifier(charCode) {
        return this.specialCharCodeMap[charCode] || String.fromCharCode(charCode).toUpperCase();
      },

      /**
       * Check whether the keycode can be reliably detected in keyup/keydown events
       *
       * @param keyCode {String} key code to check.
       * @return {Boolean} Whether the keycode can be reliably detected in keyup/keydown events.
       */
      isIdentifiableKeyCode: function isIdentifiableKeyCode(keyCode) {
        if (keyCode >= this.charCodeA && keyCode <= this.charCodeZ) {
          return true;
        } // 0-9


        if (keyCode >= this.charCode0 && keyCode <= this.charCode9) {
          return true;
        } // Enter, Space, Tab, Backspace


        if (this.specialCharCodeMap[keyCode]) {
          return true;
        } // Numpad


        if (this.numpadToCharCode[keyCode]) {
          return true;
        } // non printable keys


        if (this.isNonPrintableKeyCode(keyCode)) {
          return true;
        }

        return false;
      },

      /**
       * Checks whether the keyCode represents a non printable key
       *
       * @param keyCode {String} key code to check.
       * @return {Boolean} Whether the keyCode represents a non printable key.
       */
      isNonPrintableKeyCode: function isNonPrintableKeyCode(keyCode) {
        return this.keyCodeToIdentifierMap[keyCode] ? true : false;
      },

      /**
       * Checks whether a given string is a valid keyIdentifier
       *
       * @param keyIdentifier {String} The key identifier.
       * @return {Boolean} whether the given string is a valid keyIdentifier
       */
      isValidKeyIdentifier: function isValidKeyIdentifier(keyIdentifier) {
        if (this.identifierToKeyCodeMap[keyIdentifier]) {
          return true;
        }

        if (keyIdentifier.length != 1) {
          return false;
        }

        if (keyIdentifier >= "0" && keyIdentifier <= "9") {
          return true;
        }

        if (keyIdentifier >= "A" && keyIdentifier <= "Z") {
          return true;
        }

        switch (keyIdentifier) {
          case "+":
          case "-":
          case "*":
          case "/":
          case ",":
            return true;

          default:
            return false;
        }
      },

      /**
       * Checks whether a given string is a printable keyIdentifier.
       *
       * @param keyIdentifier {String} The key identifier.
       * @return {Boolean} whether the given string is a printable keyIdentifier.
       */
      isPrintableKeyIdentifier: function isPrintableKeyIdentifier(keyIdentifier) {
        if (keyIdentifier === "Space") {
          return true;
        } else {
          return this.identifierToKeyCodeMap[keyIdentifier] ? false : true;
        }
      }
    },
    defer: function defer(statics) {
      // construct inverse of keyCodeToIdentifierMap
      if (!statics.identifierToKeyCodeMap) {
        statics.identifierToKeyCodeMap = {};

        for (var key in statics.keyCodeToIdentifierMap) {
          statics.identifierToKeyCodeMap[statics.keyCodeToIdentifierMap[key]] = parseInt(key, 10);
        }

        for (var key in statics.specialCharCodeMap) {
          statics.identifierToKeyCodeMap[statics.specialCharCodeMap[key]] = parseInt(key, 10);
        }
      }
    }
  });
  qx.event.util.Keyboard.$$dbClassInfo = $$dbClassInfo;
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
       2004-2014 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
   ************************************************************************ */

  /**
   * Util for mouse wheel normalization.
   */
  qx.Bootstrap.define("qx.util.Wheel", {
    statics: {
      /**
       * The maximal measured scroll wheel delta.
       * @internal
       */
      MAXSCROLL: null,

      /**
       * The minimal measured scroll wheel delta.
       * @internal
       */
      MINSCROLL: null,

      /**
       * The normalization factor for the speed calculation.
       * @internal
       */
      FACTOR: 1,

      /**
       * Is the Wheel actually a touchpad ?
       * @internal
       */
      IS_TOUCHPAD: false,

      /**
       * Get the amount the wheel has been scrolled
       *
       * @param domEvent {Event} The native wheel event.
       * @param axis {String?} Optional parameter which defines the scroll axis.
       *   The value can either be <code>"x"</code> or <code>"y"</code>.
       * @return {Integer} Scroll wheel movement for the given axis. If no axis
       *   is given, the y axis is used.
       */
      getDelta: function getDelta(domEvent, axis) {
        // default case
        if (axis === undefined) {
          // default case
          var delta = 0;

          if (domEvent.wheelDelta !== undefined) {
            delta = -domEvent.wheelDelta;
          } else if (domEvent.detail !== 0) {
            delta = domEvent.detail;
          } else if (domEvent.deltaY !== undefined) {
            // use deltaY as default for firefox
            delta = domEvent.deltaY;
          }

          return this.__normalize__P_115_0(delta);
        } // get the x scroll delta


        if (axis === "x") {
          var x = 0;

          if (domEvent.wheelDelta !== undefined) {
            if (domEvent.wheelDeltaX !== undefined) {
              x = domEvent.wheelDeltaX ? this.__normalize__P_115_0(-domEvent.wheelDeltaX) : 0;
            }
          } else {
            if (domEvent.axis && domEvent.axis == domEvent.HORIZONTAL_AXIS && domEvent.detail !== undefined && domEvent.detail > 0) {
              x = this.__normalize__P_115_0(domEvent.detail);
            } else if (domEvent.deltaX !== undefined) {
              x = this.__normalize__P_115_0(domEvent.deltaX);
            }
          }

          return x;
        } // get the y scroll delta


        if (axis === "y") {
          var y = 0;

          if (domEvent.wheelDelta !== undefined) {
            if (domEvent.wheelDeltaY !== undefined) {
              y = domEvent.wheelDeltaY ? this.__normalize__P_115_0(-domEvent.wheelDeltaY) : 0;
            } else {
              y = this.__normalize__P_115_0(-domEvent.wheelDelta);
            }
          } else {
            if (!(domEvent.axis && domEvent.axis == domEvent.HORIZONTAL_AXIS) && domEvent.detail !== undefined && domEvent.detail > 0) {
              y = this.__normalize__P_115_0(domEvent.detail);
            } else if (domEvent.deltaY !== undefined) {
              y = this.__normalize__P_115_0(domEvent.deltaY);
            }
          }

          return y;
        } // default case, return 0


        return 0;
      },

      /**
       * Normalizer for the mouse wheel data.
       *
       * @param delta {Number} The mouse delta.
       * @return {Number} The normalized delta value
       */
      __normalize__P_115_0: function __normalize__P_115_0(delta) {
        if (qx.util.Wheel.IS_TOUCHPAD) {
          // Reset normalization values that may be re-computed once a real mouse is plugged.
          qx.util.Wheel.MINSCROLL = null;
          qx.util.Wheel.MAXSCROLL = null;
          qx.util.Wheel.FACTOR = 1;
          return delta;
        }

        var absDelta = Math.abs(delta);

        if (absDelta === 0) {
          return 0;
        } // store the min value


        if (qx.util.Wheel.MINSCROLL == null || qx.util.Wheel.MINSCROLL > absDelta) {
          qx.util.Wheel.MINSCROLL = absDelta;

          this.__recalculateMultiplicator__P_115_1();
        } // store the max value


        if (qx.util.Wheel.MAXSCROLL == null || qx.util.Wheel.MAXSCROLL < absDelta) {
          qx.util.Wheel.MAXSCROLL = absDelta;

          this.__recalculateMultiplicator__P_115_1();
        } // special case for systems not speeding up


        if (qx.util.Wheel.MAXSCROLL === absDelta && qx.util.Wheel.MINSCROLL === absDelta) {
          return 2 * (delta / absDelta);
        }

        var range = qx.util.Wheel.MAXSCROLL - qx.util.Wheel.MINSCROLL;
        var ret = delta / range * Math.log(range) * qx.util.Wheel.FACTOR; // return at least 1 or -1

        return ret < 0 ? Math.min(ret, -1) : Math.max(ret, 1);
      },

      /**
       * Recalculates the factor with which the calculated delta is normalized.
       */
      __recalculateMultiplicator__P_115_1: function __recalculateMultiplicator__P_115_1() {
        var max = qx.util.Wheel.MAXSCROLL || 0;
        var min = qx.util.Wheel.MINSCROLL || max;

        if (max <= min) {
          return;
        }

        var range = max - min;
        var maxRet = max / range * Math.log(range);

        if (maxRet == 0) {
          maxRet = 1;
        }

        qx.util.Wheel.FACTOR = 6 / maxRet;
      }
    }
  });
  qx.util.Wheel.$$dbClassInfo = $$dbClassInfo;
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
        "construct": true,
        "require": true
      },
      "qx.ui.layout.Util": {},
      "qx.theme.manager.Decoration": {}
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
   * A horizontal box layout.
   *
   * The horizontal box layout lays out widgets in a horizontal row, from left
   * to right.
   *
   * *Features*
   *
   * * Minimum and maximum dimensions
   * * Prioritized growing/shrinking (flex)
   * * Margins (with horizontal collapsing)
   * * Auto sizing (ignoring percent values)
   * * Percent widths (not relevant for size hint)
   * * Alignment (child property {@link qx.ui.core.LayoutItem#alignX} is ignored)
   * * Horizontal spacing (collapsed with margins)
   * * Reversed children layout (from last to first)
   * * Vertical children stretching (respecting size hints)
   *
   * *Item Properties*
   *
   * <ul>
   * <li><strong>flex</strong> <em>(Integer)</em>: The flexibility of a layout item determines how the container
   *   distributes remaining empty space among its children. If items are made
   *   flexible, they can grow or shrink accordingly. Their relative flex values
   *   determine how the items are being resized, i.e. the larger the flex ratio
   *   of two items, the larger the resizing of the first item compared to the
   *   second.
   *
   *   If there is only one flex item in a layout container, its actual flex
   *   value is not relevant. To disallow items to become flexible, set the
   *   flex value to zero.
   * </li>
   * <li><strong>flexShrink</strong> <em>(Boolean)</em>: Only valid if `flex` is
   *    set to a non-zero value, `flexShrink` tells the layout to force the child
   *    widget to shink if there is not enough space available for all of the children.
   *    This is used in scenarios such as when the child insists that it has a `minWidth`
   *    but there simply is not enough space to support that minimum width, so the
   *    overflow has to be cut off.  This setting allows the container to pick
   *    which children are able to have their `minWidth` sacrificed.  Without this
   *    setting, one oversized child can force later children out of view, regardless
   *    of `flex` settings
   * </li>
   * <li><strong>width</strong> <em>(String)</em>: Allows to define a percent
   *   width for the item. The width in percent, if specified, is used instead
   *   of the width defined by the size hint. The minimum and maximum width still
   *   takes care of the element's limits. It has no influence on the layout's
   *   size hint. Percent values are mostly useful for widgets which are sized by
   *   the outer hierarchy.
   * </li>
   * </ul>
   *
   * *Example*
   *
   * Here is a little example of how to use the HBox layout.
   *
   * <pre class="javascript">
   * var layout = new qx.ui.layout.HBox();
   * layout.setSpacing(4); // apply spacing
   *
   * var container = new qx.ui.container.Composite(layout);
   *
   * container.add(new qx.ui.core.Widget());
   * container.add(new qx.ui.core.Widget());
   * container.add(new qx.ui.core.Widget());
   * </pre>
   *
   * *External Documentation*
   *
   * See <a href='https://qooxdoo.org/documentation/#/desktop/layout/box.md'>extended documentation</a>
   * and links to demos for this layout.
   *
   */
  qx.Class.define("qx.ui.layout.HBox", {
    extend: qx.ui.layout.Abstract,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param spacing {Integer?0} The spacing between child widgets {@link #spacing}.
     * @param alignX {String?"left"} Horizontal alignment of the whole children
     *     block {@link #alignX}.
     * @param separator {String|qx.ui.decoration.IDecorator?} A separator to render between the items
     */
    construct: function construct(spacing, alignX, separator) {
      qx.ui.layout.Abstract.constructor.call(this);

      if (spacing) {
        this.setSpacing(spacing);
      }

      if (alignX) {
        this.setAlignX(alignX);
      }

      if (separator) {
        this.setSeparator(separator);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Horizontal alignment of the whole children block. The horizontal
       * alignment of the child is completely ignored in HBoxes (
       * {@link qx.ui.core.LayoutItem#alignX}).
       */
      alignX: {
        check: ["left", "center", "right"],
        init: "left",
        apply: "_applyLayoutChange"
      },

      /**
       * Vertical alignment of each child. Can be overridden through
       * {@link qx.ui.core.LayoutItem#alignY}.
       */
      alignY: {
        check: ["top", "middle", "bottom"],
        init: "top",
        apply: "_applyLayoutChange"
      },

      /** Horizontal spacing between two children */
      spacing: {
        check: "Integer",
        init: 0,
        apply: "_applyLayoutChange"
      },

      /** Separator lines to use between the objects */
      separator: {
        check: "Decorator",
        nullable: true,
        apply: "_applyLayoutChange"
      },

      /** Whether the actual children list should be laid out in reversed order. */
      reversed: {
        check: "Boolean",
        init: false,
        apply: "_applyReversed"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __widths__P_76_0: null,
      __flexs__P_76_1: null,
      __enableFlex__P_76_2: null,
      __children__P_76_3: null,

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyReversed: function _applyReversed() {
        // easiest way is to invalidate the cache
        this._invalidChildrenCache = true; // call normal layout change

        this._applyLayoutChange();
      },

      /**
       * Rebuilds caches for flex and percent layout properties
       */
      __rebuildCache__P_76_4: function __rebuildCache__P_76_4() {
        var children = this._getLayoutChildren();

        var length = children.length;
        var enableFlex = false;
        var reuse = this.__widths__P_76_0 && this.__widths__P_76_0.length != length && this.__flexs__P_76_1 && this.__widths__P_76_0;
        var props; // Sparse array (keep old one if lengths has not been modified)

        var widths = reuse ? this.__widths__P_76_0 : new Array(length);
        var flexs = reuse ? this.__flexs__P_76_1 : new Array(length); // Reverse support

        if (this.getReversed()) {
          children = children.concat().reverse();
        } // Loop through children to preparse values


        for (var i = 0; i < length; i++) {
          props = children[i].getLayoutProperties();

          if (props.width != null) {
            widths[i] = parseFloat(props.width) / 100;
          }

          if (props.flex != null) {
            flexs[i] = props.flex;
            enableFlex = true;
          } else {
            // reset (in case the index of the children changed: BUG #3131)
            flexs[i] = 0;
          }
        } // Store data


        if (!reuse) {
          this.__widths__P_76_0 = widths;
          this.__flexs__P_76_1 = flexs;
        }

        this.__enableFlex__P_76_2 = enableFlex;
        this.__children__P_76_3 = children; // Clear invalidation marker

        delete this._invalidChildrenCache;
      },

      /*
      ---------------------------------------------------------------------------
        LAYOUT INTERFACE
      ---------------------------------------------------------------------------
      */
      // overridden
      verifyLayoutProperty: qx.core.Environment.select("qx.debug", {
        "true": function _true(item, name, value) {
          if (name === "width") {
            this.assertMatch(value, qx.ui.layout.Util.PERCENT_VALUE);
          } else if (name === "flex") {
            this.assertNumber(value);
            this.assert(value >= 0);
          } else if (name === "flexShrink") {
            this.assertBoolean(value);
          } else {
            this.assert(false, "The property '" + name + "' is not supported by the HBox layout!");
          }
        },
        "false": null
      }),
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        // Rebuild flex/width caches
        if (this._invalidChildrenCache) {
          this.__rebuildCache__P_76_4();
        } // Cache children


        var children = this.__children__P_76_3;
        var length = children.length;
        var util = qx.ui.layout.Util; // Compute gaps

        var spacing = this.getSpacing();
        var separator = this.getSeparator();
        var gaps;

        if (separator) {
          gaps = util.computeHorizontalSeparatorGaps(children, spacing, separator);
        } else {
          gaps = util.computeHorizontalGaps(children, spacing, true);
        } // First run to cache children data and compute allocated width


        var i, child, width, percent;
        var widths = [],
            hint;
        var allocatedWidth = gaps;

        for (i = 0; i < length; i += 1) {
          percent = this.__widths__P_76_0[i];
          hint = children[i].getSizeHint();
          width = percent != null ? Math.floor((availWidth - gaps) * percent) : hint.width; // Limit computed value

          if (width < hint.minWidth) {
            width = hint.minWidth;
          } else if (width > hint.maxWidth) {
            width = hint.maxWidth;
          }

          widths.push(width);
          allocatedWidth += width;
        } // Flex support (growing/shrinking)


        if (this.__enableFlex__P_76_2 && allocatedWidth != availWidth) {
          var flexibles = {};
          var flex, offset;
          var notEnoughSpace = allocatedWidth > availWidth;

          for (i = 0; i < length; i += 1) {
            flex = this.__flexs__P_76_1[i];

            if (flex > 0) {
              hint = children[i].getSizeHint();
              flexibles[i] = {
                min: hint.minWidth,
                value: widths[i],
                max: hint.maxWidth,
                flex: flex
              };

              if (notEnoughSpace) {
                var props = children[i].getLayoutProperties();

                if (props && props.flexShrink) {
                  flexibles[i].min = 0;
                }
              }
            }
          }

          var result = util.computeFlexOffsets(flexibles, availWidth, allocatedWidth);

          for (i in result) {
            offset = result[i].offset;
            widths[i] += offset;
            allocatedWidth += offset;
          }
        } // Start with left coordinate


        var left = children[0].getMarginLeft(); // Alignment support

        if (allocatedWidth < availWidth && this.getAlignX() != "left") {
          left = availWidth - allocatedWidth;

          if (this.getAlignX() === "center") {
            left = Math.round(left / 2);
          }
        } // Layouting children


        var hint, top, height, width, marginRight, marginTop, marginBottom;
        var spacing = this.getSpacing(); // Pre configure separators

        this._clearSeparators(); // Compute separator width


        if (separator) {
          var separatorInsets = qx.theme.manager.Decoration.getInstance().resolve(separator).getInsets();
          var separatorWidth = separatorInsets.left + separatorInsets.right;
        } // Render children and separators


        for (i = 0; i < length; i += 1) {
          child = children[i];
          width = widths[i];
          hint = child.getSizeHint();
          marginTop = child.getMarginTop();
          marginBottom = child.getMarginBottom(); // Find usable height

          height = Math.max(hint.minHeight, Math.min(availHeight - marginTop - marginBottom, hint.maxHeight)); // Respect vertical alignment

          top = util.computeVerticalAlignOffset(child.getAlignY() || this.getAlignY(), height, availHeight, marginTop, marginBottom); // Add collapsed margin

          if (i > 0) {
            // Whether a separator has been configured
            if (separator) {
              // add margin of last child and spacing
              left += marginRight + spacing; // then render the separator at this position

              this._renderSeparator(separator, {
                left: left + padding.left,
                top: padding.top,
                width: separatorWidth,
                height: availHeight
              }); // and finally add the size of the separator, the spacing (again) and the left margin


              left += separatorWidth + spacing + child.getMarginLeft();
            } else {
              // Support margin collapsing when no separator is defined
              left += util.collapseMargins(spacing, marginRight, child.getMarginLeft());
            }
          } // Layout child


          child.renderLayout(left + padding.left, top + padding.top, width, height); // Add width

          left += width; // Remember right margin (for collapsing)

          marginRight = child.getMarginRight();
        }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        // Rebuild flex/width caches
        if (this._invalidChildrenCache) {
          this.__rebuildCache__P_76_4();
        }

        var util = qx.ui.layout.Util;
        var children = this.__children__P_76_3; // Initialize

        var minWidth = 0,
            width = 0,
            percentMinWidth = 0;
        var minHeight = 0,
            height = 0;
        var child, hint, margin; // Iterate over children

        for (var i = 0, l = children.length; i < l; i += 1) {
          child = children[i];
          hint = child.getSizeHint(); // Sum up widths

          width += hint.width; // Detect if child is shrinkable or has percent width and update minWidth

          var flex = this.__flexs__P_76_1[i];
          var percent = this.__widths__P_76_0[i];

          if (flex) {
            minWidth += hint.minWidth;
          } else if (percent) {
            percentMinWidth = Math.max(percentMinWidth, Math.round(hint.minWidth / percent));
          } else {
            minWidth += hint.width;
          } // Build vertical margin sum


          margin = child.getMarginTop() + child.getMarginBottom(); // Find biggest height

          if (hint.height + margin > height) {
            height = hint.height + margin;
          } // Find biggest minHeight


          if (hint.minHeight + margin > minHeight) {
            minHeight = hint.minHeight + margin;
          }
        }

        minWidth += percentMinWidth; // Respect gaps

        var spacing = this.getSpacing();
        var separator = this.getSeparator();
        var gaps;

        if (separator) {
          gaps = util.computeHorizontalSeparatorGaps(children, spacing, separator);
        } else {
          gaps = util.computeHorizontalGaps(children, spacing, true);
        } // Return hint


        return {
          minWidth: minWidth + gaps,
          width: width + gaps,
          minHeight: minHeight,
          height: height
        };
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__widths__P_76_0 = this.__flexs__P_76_1 = this.__children__P_76_3 = null;
    }
  });
  qx.ui.layout.HBox.$$dbClassInfo = $$dbClassInfo;
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
       2017 Martijn Evers, The Netherlands
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martijn Evers (mever)
  
  ************************************************************************ */

  /**
   * Field interface.
   *
   * This interface allows any value to be set as long as the following constraint
   * is met: any value returned by {@link getValue} can be set by {@link setValue}.
   *
   * This specifies the interface for handling the model value of a field.
   * The model value is always in a consistent state (see duration example), and
   * should only handle model values of a type that correctly represents the
   * data available through its UI. E.g.: duration can ideally be modeled by a number
   * of time units, like seconds. When using a date the duration may be
   * unclear (since Unix time?). Type conversions should be handled by data binding.
   *
   * The model value is not necessary what is shown to the end-user
   * by implementing class. A good example is the {@link qx.ui.form.TextField}
   * which is able to operate with or without live updating the model value.
   *
   * Duration example: a field for duration may use two date pickers for begin
   * and end dates. When the end date is before the start date the model is in
   * inconsistent state. getValue should never return such state. And calling
   * it must result in either null or the last consistent value (depending
   * on implementation or setting).
   */
  qx.Interface.define("qx.ui.form.IField", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired when the model value was modified */
      changeValue: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        VALUE PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the field model value. Should also update the UI.
       *
       * @param value {var|null} Updates the field with the new model value.
       * @return {null|Error} Should return an error when the type of
       *  model value is not compatible with the implementing class (the concrete field).
       */
      setValue: function setValue(value) {
        return arguments.length == 1;
      },

      /**
       * Resets the model value to its initial value. Should also update the UI.
       */
      resetValue: function resetValue() {},

      /**
       * Returns a consistent and up-to-date model value.
       *
       * Note: returned value can also be a promise of type <code>Promise&lt;*|null&gt;</code>.
       *
       * @return {var|null} The model value plain or as promise.
       */
      getValue: function getValue() {}
    }
  });
  qx.ui.form.IField.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.IField": {
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Form interface for all form widgets which have strings as their primary
   * data type like textfield's.
   */
  qx.Interface.define("qx.ui.form.IStringForm", {
    extend: qx.ui.form.IField,

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired when the value was modified */
      changeValue: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        VALUE PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the element's value.
       *
       * @param value {String|null} The new value of the element.
       */
      setValue: function setValue(value) {
        return arguments.length == 1;
      },

      /**
       * Resets the element's value to its initial value.
       */
      resetValue: function resetValue() {},

      /**
       * The element's user set value.
       *
       * @return {String|null} The value.
       */
      getValue: function getValue() {}
    }
  });
  qx.ui.form.IStringForm.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.form.IStringForm": {
        "require": true
      },
      "qx.locale.Manager": {
        "construct": true
      },
      "qx.bom.client.Css": {
        "require": true
      },
      "qx.bom.client.Html": {
        "require": true
      },
      "qx.html.Label": {},
      "qx.theme.manager.Color": {},
      "qx.theme.manager.Font": {},
      "qx.bom.webfonts.WebFont": {},
      "qx.bom.Font": {},
      "qx.ui.core.queue.Layout": {},
      "qx.bom.Label": {},
      "qx.lang.Object": {},
      "qx.bom.client.OperatingSystem": {
        "require": true
      },
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.bom.client.Browser": {
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "css.textoverflow": {
          "className": "qx.bom.client.Css"
        },
        "html.xul": {
          "className": "qx.bom.client.Html"
        },
        "os.name": {
          "className": "qx.bom.client.OperatingSystem"
        },
        "engine.name": {
          "className": "qx.bom.client.Engine"
        },
        "engine.version": {
          "className": "qx.bom.client.Engine"
        },
        "qx.dynlocale": {
          "load": true
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * The label class brings typical text content to the widget system.
   *
   * It supports simple text nodes and complex HTML (rich). The default
   * content mode is for text only. The mode is changeable through the property
   * {@link #rich}.
   *
   * The label supports heightForWidth when used in HTML mode. This means
   * that multi line HTML automatically computes the correct preferred height.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   // a simple text label without wrapping and markup support
   *   var label1 = new qx.ui.basic.Label("Simple text label");
   *   this.getRoot().add(label1, {left:20, top:10});
   *
   *   // a HTML label with automatic line wrapping
   *   var label2 = new qx.ui.basic.Label().set({
   *     value: "A <b>long label</b> text with auto-wrapping. This also may contain <b style='color:red'>rich HTML</b> markup.",
   *     rich : true,
   *     width: 120
   *   });
   *   this.getRoot().add(label2, {left:20, top:50});
   * </pre>
   *
   * The first label in this example is a basic text only label. As such no
   * automatic wrapping is supported. The second label is a long label containing
   * HTML markup with automatic line wrapping.
   *
   * *External Documentation*
   *
   * <a href='http://qooxdoo.org/docs/#desktop/widget/label.md' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.ui.basic.Label", {
    extend: qx.ui.core.Widget,
    implement: [qx.ui.form.IStringForm],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param value {String} Text or HTML content to use
     */
    construct: function construct(value) {
      qx.ui.core.Widget.constructor.call(this);

      if (value != null) {
        this.setValue(value);
      }

      {
        qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Switches between rich HTML and text content. The text mode (<code>false</code>) supports
       * advanced features like ellipsis when the available space is not
       * enough. HTML mode (<code>true</code>) supports multi-line content and all the
       * markup features of HTML content.
       */
      rich: {
        check: "Boolean",
        init: false,
        event: "changeRich",
        apply: "_applyRich"
      },

      /**
       * Controls whether text wrap is activated or not. But please note, that
       * this property works only in combination with the property {@link #rich}.
       * The {@link #wrap} has only an effect if the {@link #rich} property is
       * set to <code>true</code>, otherwise {@link #wrap} has no effect.
       */
      wrap: {
        check: "Boolean",
        init: true,
        apply: "_applyWrap"
      },

      /**
       * Controls whether line wrapping can occur in the middle of a word; this is
       * typically only useful when there is a restricted amount of horizontal space
       * and words would otherwise overflow beyond the width of the element.  Words
       * are typically considered as separated by spaces, so "abc/def/ghi" is a 11
       * character word that would not be split without `breakWithWords` set to true.
       */
      breakWithinWords: {
        check: "Boolean",
        init: false,
        apply: "_applyBreakWithinWords"
      },

      /**
       * Contains the HTML or text content. Interpretation depends on the value
       * of {@link #rich}. In text mode entities and other HTML special content
       * is not supported. But it is possible to use unicode escape sequences
       * to insert symbols and other non ASCII characters.
       */
      value: {
        check: "String",
        apply: "_applyValue",
        event: "changeValue",
        nullable: true
      },

      /**
       * The buddy property can be used to connect the label to another widget.
       * That causes two things:
       * <ul>
       *   <li>The label will always take the same enabled state as the buddy
       *       widget.
       *   </li>
       *   <li>A tap on the label will focus the buddy widget.</li>
       * </ul>
       * This is the behavior of the for attribute of HTML:
       * http://www.w3.org/TR/html401/interact/forms.html#adef-for
       */
      buddy: {
        check: "qx.ui.core.Widget",
        apply: "_applyBuddy",
        nullable: true,
        init: null,
        dereference: true
      },

      /** Control the text alignment */
      textAlign: {
        check: ["left", "center", "right", "justify"],
        nullable: true,
        themeable: true,
        apply: "_applyTextAlign",
        event: "changeTextAlign"
      },
      // overridden
      appearance: {
        refine: true,
        init: "label"
      },
      // overridden
      selectable: {
        refine: true,
        init: false
      },
      // overridden
      allowGrowX: {
        refine: true,
        init: false
      },
      // overridden
      allowGrowY: {
        refine: true,
        init: false
      },
      // overridden
      allowShrinkY: {
        refine: true,
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
      __font__P_77_0: null,
      __invalidContentSize__P_77_1: null,
      __tapListenerId__P_77_2: null,
      __webfontListenerId__P_77_3: null,

      /*
      ---------------------------------------------------------------------------
        WIDGET API
      ---------------------------------------------------------------------------
      */
      // overridden
      _getContentHint: function _getContentHint() {
        if (this.__invalidContentSize__P_77_1) {
          this.__contentSize__P_77_4 = this.__computeContentSize__P_77_5();
          delete this.__invalidContentSize__P_77_1;
        }

        return {
          width: this.__contentSize__P_77_4.width,
          height: this.__contentSize__P_77_4.height
        };
      },
      // overridden
      _hasHeightForWidth: function _hasHeightForWidth() {
        return this.getRich() && this.getWrap();
      },
      // overridden
      _applySelectable: function _applySelectable(value) {
        // This is needed for all browsers not having text-overflow:ellipsis
        // but supporting XUL (firefox < 4)
        // https://bugzilla.mozilla.org/show_bug.cgi?id=312156
        if (!qx.core.Environment.get("css.textoverflow") && qx.core.Environment.get("html.xul")) {
          if (value && !this.isRich()) {
            {
              this.warn("Only rich labels are selectable in browsers with Gecko engine!");
            }
            return;
          }
        }

        qx.ui.basic.Label.superclass.prototype._applySelectable.call(this, value);
      },
      // overridden
      _getContentHeightForWidth: function _getContentHeightForWidth(width) {
        if (!this.getRich() && !this.getWrap()) {
          return null;
        }

        return this.__computeContentSize__P_77_5(width).height;
      },
      // overridden
      _createContentElement: function _createContentElement() {
        return new qx.html.Label();
      },
      // property apply
      _applyTextAlign: function _applyTextAlign(value, old) {
        this.getContentElement().setStyle("textAlign", value);
      },
      // overridden
      _applyTextColor: function _applyTextColor(value, old) {
        if (value) {
          this.getContentElement().setStyle("color", qx.theme.manager.Color.getInstance().resolve(value));
        } else {
          this.getContentElement().removeStyle("color");
        }
      },

      /*
      ---------------------------------------------------------------------------
        LABEL ADDONS
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Map} Internal fallback of label size when no font is defined
       *
       * @lint ignoreReferenceField(__contentSize)
       */
      __contentSize__P_77_4: {
        width: 0,
        height: 0
      },
      // property apply
      _applyFont: function _applyFont(value, old) {
        if (old && this.__font__P_77_0 && this.__webfontListenerId__P_77_3) {
          this.__font__P_77_0.removeListenerById(this.__webfontListenerId__P_77_3);

          this.__webfontListenerId__P_77_3 = null;
        } // Apply


        var styles;

        if (value) {
          this.__font__P_77_0 = qx.theme.manager.Font.getInstance().resolve(value);

          if (this.__font__P_77_0 instanceof qx.bom.webfonts.WebFont) {
            if (!this.__font__P_77_0.isValid()) {
              this.__webfontListenerId__P_77_3 = this.__font__P_77_0.addListener("changeStatus", this._onWebFontStatusChange, this);
            }
          }

          styles = this.__font__P_77_0.getStyles();
        } else {
          this.__font__P_77_0 = null;
          styles = qx.bom.Font.getDefaultStyles();
        } // check if text color already set - if so this local value has higher priority


        if (this.getTextColor() != null) {
          delete styles["color"];
        }

        this.getContentElement().setStyles(styles); // Invalidate text size

        this.__invalidContentSize__P_77_1 = true; // Update layout

        qx.ui.core.queue.Layout.add(this);
      },

      /**
       * Internal utility to compute the content dimensions.
       *
       * @param width {Integer?null} Optional width constraint
       * @return {Map} Map with <code>width</code> and <code>height</code> keys
       */
      __computeContentSize__P_77_5: function __computeContentSize__P_77_5(width) {
        var Label = qx.bom.Label;
        var font = this.getFont();
        var styles = font ? this.__font__P_77_0.getStyles() : qx.bom.Font.getDefaultStyles();
        var content = this.getValue() || "A";
        var rich = this.getRich();

        if (this.__webfontListenerId__P_77_3) {
          this.__fixEllipsis__P_77_6();
        }

        if (rich && this.getBreakWithinWords()) {
          styles = qx.lang.Object.clone(styles);
          styles.wordBreak = "break-all";
        }

        return rich ? Label.getHtmlSize(content, styles, width) : Label.getTextSize(content, styles);
      },

      /**
       * Firefox > 9 on OS X will draw an ellipsis on top of the label content even
       * though there is enough space for the text. Re-applying the content forces
       * a recalculation and fixes the problem. See qx bug #6293
       */
      __fixEllipsis__P_77_6: function __fixEllipsis__P_77_6() {
        if (!this.getContentElement()) {
          return;
        }

        if (qx.core.Environment.get("os.name") == "osx" && qx.core.Environment.get("engine.name") == "gecko" && parseInt(qx.core.Environment.get("engine.version"), 10) < 16 && parseInt(qx.core.Environment.get("engine.version"), 10) > 9) {
          var domEl = this.getContentElement().getDomElement();

          if (domEl) {
            /* eslint-disable-next-line no-self-assign */
            domEl.innerHTML = domEl.innerHTML;
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLIER
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyBuddy: function _applyBuddy(value, old) {
        if (old != null) {
          this.removeRelatedBindings(old);
          this.removeListenerById(this.__tapListenerId__P_77_2);
          this.__tapListenerId__P_77_2 = null;
        }

        if (value != null) {
          value.bind("enabled", this, "enabled");
          this.__tapListenerId__P_77_2 = this.addListener("tap", function () {
            // only focus focusable elements [BUG #3555]
            if (value.isFocusable()) {
              value.focus.apply(value);
            } // furthermore toggle if possible [BUG #6881]


            if ("toggleValue" in value && typeof value.toggleValue === "function") {
              value.toggleValue();
            }
          });
        }
      },
      // property apply
      _applyRich: function _applyRich(value) {
        // Sync with content element
        this.getContentElement().setRich(value); // Mark text size cache as invalid

        this.__invalidContentSize__P_77_1 = true; // Update layout

        qx.ui.core.queue.Layout.add(this);
      },
      // property apply
      _applyWrap: function _applyWrap(value, old) {
        if (value && !this.isRich()) {
          {
            this.warn("Only rich labels support wrap.");
          }
        }

        if (this.isRich()) {
          // apply the white space style to the label to force it not
          // to wrap if wrap is set to false [BUG #3732]
          var whiteSpace = value ? "normal" : "nowrap";
          this.getContentElement().setStyle("whiteSpace", whiteSpace);
        }
      },
      // property apply
      _applyBreakWithinWords: function _applyBreakWithinWords(value, old) {
        this.getContentElement().setStyle("wordBreak", this.isRich() && value ? "break-all" : "normal");
      },

      /**
       * Locale change event handler
       *
       * @signature function(e)
       * @param e {Event} the change event
       */
      _onChangeLocale: qx.core.Environment.select("qx.dynlocale", {
        "true": function _true(e) {
          var content = this.getValue();

          if (content && content.translate) {
            this.setValue(content.translate());
          }
        },
        "false": null
      }),

      /**
       * Triggers layout recalculation after a web font was loaded
       *
       * @param ev {qx.event.type.Data} "changeStatus" event
       */
      _onWebFontStatusChange: function _onWebFontStatusChange(ev) {
        if (ev.getData().valid === true) {
          // safari has trouble resizing, adding it again fixed the issue [BUG #8786]
          if (qx.core.Environment.get("browser.name") == "safari" && parseFloat(qx.core.Environment.get("browser.version")) >= 8) {
            window.setTimeout(function () {
              this.__invalidContentSize__P_77_1 = true;
              qx.ui.core.queue.Layout.add(this);
            }.bind(this), 0);
          }

          this.__invalidContentSize__P_77_1 = true;
          qx.ui.core.queue.Layout.add(this);
        }
      },
      // property apply
      _applyValue: qx.core.Environment.select("qx.dynlocale", {
        "true": function _true(value, old) {
          // Sync with content element
          if (value && value.translate) {
            this.getContentElement().setValue(value.translate());
          } else {
            this.getContentElement().setValue(value);
          } // Mark text size cache as invalid


          this.__invalidContentSize__P_77_1 = true; // Update layout

          qx.ui.core.queue.Layout.add(this);
        },
        "false": function _false(value, old) {
          this.getContentElement().setValue(value); // Mark text size cache as invalid

          this.__invalidContentSize__P_77_1 = true; // Update layout

          qx.ui.core.queue.Layout.add(this);
        }
      })
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      {
        qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
      }

      if (this.__font__P_77_0 && this.__webfontListenerId__P_77_3) {
        this.__font__P_77_0.removeListenerById(this.__webfontListenerId__P_77_3);
      }

      this.__font__P_77_0 = null;
    }
  });
  qx.ui.basic.Label.$$dbClassInfo = $$dbClassInfo;
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
        "construct": true,
        "require": true
      },
      "qx.lang.Object": {},
      "qx.ui.layout.Util": {}
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
   * The grid layout manager arranges the items in a two dimensional
   * grid. Widgets can be placed into the grid's cells and may span multiple rows
   * and columns.
   *
   * *Features*
   *
   * * Flex values for rows and columns
   * * Minimal and maximal column and row sizes
   * * Manually setting of column and row sizes
   * * Horizontal and vertical alignment
   * * Horizontal and vertical spacing
   * * Column and row spans
   * * Auto-sizing
   *
   * *Item Properties*
   *
   * <ul>
   * <li><strong>row</strong> <em>(Integer)</em>: The row of the cell the
   *   widget should occupy. Each cell can only containing one widget. This layout
   *   property is mandatory.
   * </li>
   * <li><strong>column</strong> <em>(Integer)</em>: The column of the cell the
   *   widget should occupy. Each cell can only containing one widget. This layout
   *   property is mandatory.
   * </li>
   * <li><strong>rowSpan</strong> <em>(Integer)</em>: The number of rows, the
   *   widget should span, starting from the row specified in the <code>row</code>
   *   property. The cells in the spanned rows must be empty as well.
   * </li>
   * <li><strong>colSpan</strong> <em>(Integer)</em>: The number of columns, the
   *   widget should span, starting from the column specified in the <code>column</code>
   *   property. The cells in the spanned columns must be empty as well.
   * </li>
   * </ul>
   *
   * *Example*
   *
   * Here is a little example of how to use the grid layout.
   *
   * <pre class="javascript">
   * var layout = new qx.ui.layout.Grid();
   * layout.setRowFlex(0, 1); // make row 0 flexible
   * layout.setColumnWidth(1, 200); // set with of column 1 to 200 pixel
   *
   * var container = new qx.ui.container.Composite(layout);
   * container.add(new qx.ui.core.Widget(), {row: 0, column: 0});
   * container.add(new qx.ui.core.Widget(), {row: 0, column: 1});
   * container.add(new qx.ui.core.Widget(), {row: 1, column: 0, rowSpan: 2});
   * </pre>
   *
   * *External Documentation*
   *
   * <a href='https://qooxdoo.org/documentation/#/desktop/layout/grid.md'>
   * Extended documentation</a> and links to demos of this layout in the qooxdoo manual.
   */
  qx.Class.define("qx.ui.layout.Grid", {
    extend: qx.ui.layout.Abstract,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param spacingX {Integer?0} The horizontal spacing between grid cells.
     *     Sets {@link #spacingX}.
     * @param spacingY {Integer?0} The vertical spacing between grid cells.
     *     Sets {@link #spacingY}.
     */
    construct: function construct(spacingX, spacingY) {
      qx.ui.layout.Abstract.constructor.call(this);
      this.__rowData__P_78_0 = [];
      this.__colData__P_78_1 = [];

      if (spacingX) {
        this.setSpacingX(spacingX);
      }

      if (spacingY) {
        this.setSpacingY(spacingY);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The horizontal spacing between grid cells.
       */
      spacingX: {
        check: "Integer",
        init: 0,
        apply: "_applyLayoutChange"
      },

      /**
       * The vertical spacing between grid cells.
       */
      spacingY: {
        check: "Integer",
        init: 0,
        apply: "_applyLayoutChange"
      },

      /**
       * Allow growing of spanning cells' widths beyond the accumulated widths of the columns.
       * The default behavior (init value false) is that the width of the spanning cell is
       * determined by the accumulated width of the columns (plus spacing).
       * Setting this property to true lets the cell width grow as needed to show
       * the widget in the spanning cell, which also enlarges the width of the spanned columns.
       */
      allowGrowSpannedCellWidth: {
        check: "Boolean",
        init: false,
        apply: "_applyLayoutChange"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {Array} 2D array of grid cell data */
      __grid__P_78_2: null,
      __rowData__P_78_0: null,
      __colData__P_78_1: null,
      __colSpans__P_78_3: null,
      __rowSpans__P_78_4: null,
      __maxRowIndex__P_78_5: null,
      __maxColIndex__P_78_6: null,

      /** @type {Array} cached row heights */
      __rowHeights__P_78_7: null,

      /** @type {Array} cached column widths */
      __colWidths__P_78_8: null,
      // overridden
      verifyLayoutProperty: qx.core.Environment.select("qx.debug", {
        "true": function _true(item, name, value) {
          var layoutProperties = {
            row: 1,
            column: 1,
            rowSpan: 1,
            colSpan: 1
          };
          this.assert(layoutProperties[name] == 1, "The property '" + name + "' is not supported by the Grid layout!");
          this.assertInteger(value);
          this.assert(value >= 0, "Value must be positive");
        },
        "false": null
      }),

      /**
       * Rebuild the internal representation of the grid
       */
      __buildGrid__P_78_9: function __buildGrid__P_78_9() {
        var grid = [];
        var colSpans = [];
        var rowSpans = [];
        var maxRowIndex = -1;
        var maxColIndex = -1;

        var children = this._getLayoutChildren();

        for (var i = 0, l = children.length; i < l; i++) {
          var child = children[i];
          var props = child.getLayoutProperties();
          var row = props.row;
          var column = props.column;
          props.colSpan = props.colSpan || 1;
          props.rowSpan = props.rowSpan || 1; // validate arguments

          if (row == null || column == null) {
            throw new Error("The layout properties 'row' and 'column' of the child widget '" + child + "' must be defined!");
          }

          if (grid[row] && grid[row][column]) {
            throw new Error("Cannot add widget '" + child + "'!. " + "There is already a widget '" + grid[row][column] + "' in this cell (" + row + ", " + column + ") for '" + this + "'");
          }

          for (var x = column; x < column + props.colSpan; x++) {
            for (var y = row; y < row + props.rowSpan; y++) {
              if (grid[y] == undefined) {
                grid[y] = [];
              }

              grid[y][x] = child;
              maxColIndex = Math.max(maxColIndex, x);
              maxRowIndex = Math.max(maxRowIndex, y);
            }
          }

          if (props.rowSpan > 1) {
            rowSpans.push(child);
          }

          if (props.colSpan > 1) {
            colSpans.push(child);
          }
        } // make sure all columns are defined so that accessing the grid using
        // this.__grid[column][row] will never raise an exception


        for (var y = 0; y <= maxRowIndex; y++) {
          if (grid[y] == undefined) {
            grid[y] = [];
          }
        }

        this.__grid__P_78_2 = grid;
        this.__colSpans__P_78_3 = colSpans;
        this.__rowSpans__P_78_4 = rowSpans;
        this.__maxRowIndex__P_78_5 = maxRowIndex;
        this.__maxColIndex__P_78_6 = maxColIndex;
        this.__rowHeights__P_78_7 = null;
        this.__colWidths__P_78_8 = null; // Clear invalidation marker

        delete this._invalidChildrenCache;
      },

      /**
       * Stores data for a grid row
       *
       * @param row {Integer} The row index
       * @param key {String} The key under which the data should be stored
       * @param value {var} data to store
       */
      _setRowData: function _setRowData(row, key, value) {
        var rowData = this.__rowData__P_78_0[row];

        if (!rowData) {
          this.__rowData__P_78_0[row] = {};
          this.__rowData__P_78_0[row][key] = value;
        } else {
          rowData[key] = value;
        }
      },

      /**
       * Stores data for a grid column
       *
       * @param column {Integer} The column index
       * @param key {String} The key under which the data should be stored
       * @param value {var} data to store
       */
      _setColumnData: function _setColumnData(column, key, value) {
        var colData = this.__colData__P_78_1[column];

        if (!colData) {
          this.__colData__P_78_1[column] = {};
          this.__colData__P_78_1[column][key] = value;
        } else {
          colData[key] = value;
        }
      },

      /**
       * Shortcut to set both horizontal and vertical spacing between grid cells
       * to the same value.
       *
       * @param spacing {Integer} new horizontal and vertical spacing
       * @return {qx.ui.layout.Grid} This object (for chaining support).
       */
      setSpacing: function setSpacing(spacing) {
        this.setSpacingY(spacing);
        this.setSpacingX(spacing);
        return this;
      },

      /**
       * Set the default cell alignment for a column. This alignment can be
       * overridden on a per cell basis by setting the cell's content widget's
       * <code>alignX</code> and <code>alignY</code> properties.
       *
       * If on a grid cell both row and a column alignment is set, the horizontal
       * alignment is taken from the column and the vertical alignment is taken
       * from the row.
       *
       * @param column {Integer} Column index
       * @param hAlign {String} The horizontal alignment. Valid values are
       *    "left", "center" and "right".
       * @param vAlign {String} The vertical alignment. Valid values are
       *    "top", "middle", "bottom"
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setColumnAlign: function setColumnAlign(column, hAlign, vAlign) {
        {
          this.assertInteger(column, "Invalid parameter 'column'");
          this.assertInArray(hAlign, ["left", "center", "right"]);
          this.assertInArray(vAlign, ["top", "middle", "bottom"]);
        }

        this._setColumnData(column, "hAlign", hAlign);

        this._setColumnData(column, "vAlign", vAlign);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get a map of the column's alignment.
       *
       * @param column {Integer} The column index
       * @return {Map} A map with the keys <code>vAlign</code> and <code>hAlign</code>
       *     containing the vertical and horizontal column alignment.
       */
      getColumnAlign: function getColumnAlign(column) {
        var colData = this.__colData__P_78_1[column] || {};
        return {
          vAlign: colData.vAlign || "top",
          hAlign: colData.hAlign || "left"
        };
      },

      /**
       * Set the default cell alignment for a row. This alignment can be
       * overridden on a per cell basis by setting the cell's content widget's
       * <code>alignX</code> and <code>alignY</code> properties.
       *
       * If on a grid cell both row and a column alignment is set, the horizontal
       * alignment is taken from the column and the vertical alignment is taken
       * from the row.
       *
       * @param row {Integer} Row index
       * @param hAlign {String} The horizontal alignment. Valid values are
       *    "left", "center" and "right".
       * @param vAlign {String} The vertical alignment. Valid values are
       *    "top", "middle", "bottom"
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setRowAlign: function setRowAlign(row, hAlign, vAlign) {
        {
          this.assertInteger(row, "Invalid parameter 'row'");
          this.assertInArray(hAlign, ["left", "center", "right"]);
          this.assertInArray(vAlign, ["top", "middle", "bottom"]);
        }

        this._setRowData(row, "hAlign", hAlign);

        this._setRowData(row, "vAlign", vAlign);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get a map of the row's alignment.
       *
       * @param row {Integer} The Row index
       * @return {Map} A map with the keys <code>vAlign</code> and <code>hAlign</code>
       *     containing the vertical and horizontal row alignment.
       */
      getRowAlign: function getRowAlign(row) {
        var rowData = this.__rowData__P_78_0[row] || {};
        return {
          vAlign: rowData.vAlign || "top",
          hAlign: rowData.hAlign || "left"
        };
      },

      /**
       * Get the widget located in the cell. If a the cell is empty or the widget
       * has a {@link qx.ui.core.Widget#visibility} value of <code>exclude</code>,
       * <code>null</code> is returned.
       *
       * @param row {Integer} The cell's row index
       * @param column {Integer} The cell's column index
       * @return {qx.ui.core.Widget|null}The cell's widget. The value may be null.
       */
      getCellWidget: function getCellWidget(row, column) {
        if (this._invalidChildrenCache) {
          this.__buildGrid__P_78_9();
        }

        var row = this.__grid__P_78_2[row] || {};
        return row[column] || null;
      },

      /**
       * Get the number of rows in the grid layout.
       *
       * @return {Integer} The number of rows in the layout
       */
      getRowCount: function getRowCount() {
        if (this._invalidChildrenCache) {
          this.__buildGrid__P_78_9();
        }

        return this.__maxRowIndex__P_78_5 + 1;
      },

      /**
       * Get the number of columns in the grid layout.
       *
       * @return {Integer} The number of columns in the layout
       */
      getColumnCount: function getColumnCount() {
        if (this._invalidChildrenCache) {
          this.__buildGrid__P_78_9();
        }

        return this.__maxColIndex__P_78_6 + 1;
      },

      /**
       * Get a map of the cell's alignment. For vertical alignment the row alignment
       * takes precedence over the column alignment. For horizontal alignment it is
       * the over way round. If an alignment is set on the cell widget using
       * {@link qx.ui.core.LayoutItem#setLayoutProperties}, this alignment takes
       * always precedence over row or column alignment.
       *
       * @param row {Integer} The cell's row index
       * @param column {Integer} The cell's column index
       * @return {Map} A map with the keys <code>vAlign</code> and <code>hAlign</code>
       *     containing the vertical and horizontal cell alignment.
       */
      getCellAlign: function getCellAlign(row, column) {
        var vAlign = "top";
        var hAlign = "left";
        var rowData = this.__rowData__P_78_0[row];
        var colData = this.__colData__P_78_1[column];
        var widget = this.__grid__P_78_2[row][column];

        if (widget) {
          var widgetProps = {
            vAlign: widget.getAlignY(),
            hAlign: widget.getAlignX()
          };
        } else {
          widgetProps = {};
        } // compute vAlign
        // precedence : widget -> row -> column


        if (widgetProps.vAlign) {
          vAlign = widgetProps.vAlign;
        } else if (rowData && rowData.vAlign) {
          vAlign = rowData.vAlign;
        } else if (colData && colData.vAlign) {
          vAlign = colData.vAlign;
        } // compute hAlign
        // precedence : widget -> column -> row


        if (widgetProps.hAlign) {
          hAlign = widgetProps.hAlign;
        } else if (colData && colData.hAlign) {
          hAlign = colData.hAlign;
        } else if (rowData && rowData.hAlign) {
          hAlign = rowData.hAlign;
        }

        return {
          vAlign: vAlign,
          hAlign: hAlign
        };
      },

      /**
       * Set the flex value for a grid column.
       * By default the column flex value is <code>0</code>.
       *
       * @param column {Integer} The column index
       * @param flex {Integer} The column's flex value
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setColumnFlex: function setColumnFlex(column, flex) {
        this._setColumnData(column, "flex", flex);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the flex value of a grid column.
       *
       * @param column {Integer} The column index
       * @return {Integer} The column's flex value
       */
      getColumnFlex: function getColumnFlex(column) {
        var colData = this.__colData__P_78_1[column] || {};
        return colData.flex !== undefined ? colData.flex : 0;
      },

      /**
       * Set the flex value for a grid row.
       * By default the row flex value is <code>0</code>.
       *
       * @param row {Integer} The row index
       * @param flex {Integer} The row's flex value
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setRowFlex: function setRowFlex(row, flex) {
        this._setRowData(row, "flex", flex);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the flex value of a grid row.
       *
       * @param row {Integer} The row index
       * @return {Integer} The row's flex value
       */
      getRowFlex: function getRowFlex(row) {
        var rowData = this.__rowData__P_78_0[row] || {};
        var rowFlex = rowData.flex !== undefined ? rowData.flex : 0;
        return rowFlex;
      },

      /**
       * Set the maximum width of a grid column.
       * The default value is <code>Infinity</code>.
       *
       * @param column {Integer} The column index
       * @param maxWidth {Integer} The column's maximum width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setColumnMaxWidth: function setColumnMaxWidth(column, maxWidth) {
        this._setColumnData(column, "maxWidth", maxWidth);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the maximum width of a grid column.
       *
       * @param column {Integer} The column index
       * @return {Integer} The column's maximum width
       */
      getColumnMaxWidth: function getColumnMaxWidth(column) {
        var colData = this.__colData__P_78_1[column] || {};
        return colData.maxWidth !== undefined ? colData.maxWidth : Infinity;
      },

      /**
       * Set the preferred width of a grid column.
       * The default value is <code>Infinity</code>.
       *
       * @param column {Integer} The column index
       * @param width {Integer} The column's width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setColumnWidth: function setColumnWidth(column, width) {
        this._setColumnData(column, "width", width);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the preferred width of a grid column.
       *
       * @param column {Integer} The column index
       * @return {Integer} The column's width
       */
      getColumnWidth: function getColumnWidth(column) {
        var colData = this.__colData__P_78_1[column] || {};
        return colData.width !== undefined ? colData.width : null;
      },

      /**
       * Set the minimum width of a grid column.
       * The default value is <code>0</code>.
       *
       * @param column {Integer} The column index
       * @param minWidth {Integer} The column's minimum width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setColumnMinWidth: function setColumnMinWidth(column, minWidth) {
        this._setColumnData(column, "minWidth", minWidth);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the minimum width of a grid column.
       *
       * @param column {Integer} The column index
       * @return {Integer} The column's minimum width
       */
      getColumnMinWidth: function getColumnMinWidth(column) {
        var colData = this.__colData__P_78_1[column] || {};
        return colData.minWidth || 0;
      },

      /**
       * Set the maximum height of a grid row.
       * The default value is <code>Infinity</code>.
       *
       * @param row {Integer} The row index
       * @param maxHeight {Integer} The row's maximum width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setRowMaxHeight: function setRowMaxHeight(row, maxHeight) {
        this._setRowData(row, "maxHeight", maxHeight);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the maximum height of a grid row.
       *
       * @param row {Integer} The row index
       * @return {Integer} The row's maximum width
       */
      getRowMaxHeight: function getRowMaxHeight(row) {
        var rowData = this.__rowData__P_78_0[row] || {};
        return rowData.maxHeight || Infinity;
      },

      /**
       * Set the preferred height of a grid row.
       * The default value is <code>Infinity</code>.
       *
       * @param row {Integer} The row index
       * @param height {Integer} The row's width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setRowHeight: function setRowHeight(row, height) {
        this._setRowData(row, "height", height);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the preferred height of a grid row.
       *
       * @param row {Integer} The row index
       * @return {Integer} The row's width
       */
      getRowHeight: function getRowHeight(row) {
        var rowData = this.__rowData__P_78_0[row] || {};
        return rowData.height !== undefined ? rowData.height : null;
      },

      /**
       * Set the minimum height of a grid row.
       * The default value is <code>0</code>.
       *
       * @param row {Integer} The row index
       * @param minHeight {Integer} The row's minimum width
       * @return {qx.ui.layout.Grid} This object (for chaining support)
       */
      setRowMinHeight: function setRowMinHeight(row, minHeight) {
        this._setRowData(row, "minHeight", minHeight);

        this._applyLayoutChange();

        return this;
      },

      /**
       * Get the minimum height of a grid row.
       *
       * @param row {Integer} The row index
       * @return {Integer} The row's minimum width
       */
      getRowMinHeight: function getRowMinHeight(row) {
        var rowData = this.__rowData__P_78_0[row] || {};
        return rowData.minHeight || 0;
      },

      /**
       * Computes the widget's size hint including the widget's margins
       *
       * @param widget {qx.ui.core.LayoutItem} The widget to get the size for
       * @return {Map} a size hint map
       */
      _getOuterSize: function _getOuterSize(widget) {
        var hint = widget.getSizeHint();
        var hMargins = widget.getMarginLeft() + widget.getMarginRight();
        var vMargins = widget.getMarginTop() + widget.getMarginBottom();
        var outerSize = {
          height: hint.height + vMargins,
          width: hint.width + hMargins,
          minHeight: hint.minHeight + vMargins,
          minWidth: hint.minWidth + hMargins,
          maxHeight: hint.maxHeight + vMargins,
          maxWidth: hint.maxWidth + hMargins
        };
        return outerSize;
      },

      /**
       * Check whether all row spans fit with their preferred height into the
       * preferred row heights. If there is not enough space, the preferred
       * row sizes are increased. The distribution respects the flex and max
       * values of the rows.
       *
       *  The same is true for the min sizes.
       *
       *  The height array is modified in place.
       *
       * @param rowHeights {Map[]} The current row height array as computed by
       *     {@link #_getRowHeights}.
       */
      _fixHeightsRowSpan: function _fixHeightsRowSpan(rowHeights) {
        var vSpacing = this.getSpacingY();

        for (var i = 0, l = this.__rowSpans__P_78_4.length; i < l; i++) {
          var widget = this.__rowSpans__P_78_4[i];

          var hint = this._getOuterSize(widget);

          var widgetProps = widget.getLayoutProperties();
          var widgetRow = widgetProps.row;
          var prefSpanHeight = vSpacing * (widgetProps.rowSpan - 1);
          var minSpanHeight = prefSpanHeight;
          var rowFlexes = {};

          for (var j = 0; j < widgetProps.rowSpan; j++) {
            var row = widgetProps.row + j;
            var rowHeight = rowHeights[row];
            var rowFlex = this.getRowFlex(row);

            if (rowFlex > 0) {
              // compute flex array for the preferred height
              rowFlexes[row] = {
                min: rowHeight.minHeight,
                value: rowHeight.height,
                max: rowHeight.maxHeight,
                flex: rowFlex
              };
            }

            prefSpanHeight += rowHeight.height;
            minSpanHeight += rowHeight.minHeight;
          } // If there is not enough space for the preferred size
          // increment the preferred row sizes.


          if (prefSpanHeight < hint.height) {
            if (!qx.lang.Object.isEmpty(rowFlexes)) {
              var rowIncrements = qx.ui.layout.Util.computeFlexOffsets(rowFlexes, hint.height, prefSpanHeight);

              for (var k = 0; k < widgetProps.rowSpan; k++) {
                var offset = rowIncrements[widgetRow + k] ? rowIncrements[widgetRow + k].offset : 0;
                rowHeights[widgetRow + k].height += offset;
              } // row is too small and we have no flex value set

            } else {
              var totalSpacing = vSpacing * (widgetProps.rowSpan - 1);
              var availableHeight = hint.height - totalSpacing; // get the row height which every child would need to share the
              // available hight equally

              var avgRowHeight = Math.floor(availableHeight / widgetProps.rowSpan); // get the hight already used and the number of children which do
              // not have at least that avg row height

              var usedHeight = 0;
              var rowsNeedAddition = 0;

              for (var k = 0; k < widgetProps.rowSpan; k++) {
                var currentHeight = rowHeights[widgetRow + k].height;
                usedHeight += currentHeight;

                if (currentHeight < avgRowHeight) {
                  rowsNeedAddition++;
                }
              } // the difference of available and used needs to be shared among
              // those not having the min size


              var additionalRowHeight = Math.floor((availableHeight - usedHeight) / rowsNeedAddition); // add the extra height to the too small children

              for (var k = 0; k < widgetProps.rowSpan; k++) {
                if (rowHeights[widgetRow + k].height < avgRowHeight) {
                  rowHeights[widgetRow + k].height += additionalRowHeight;
                }
              }
            }
          } // If there is not enough space for the min size
          // increment the min row sizes.


          if (minSpanHeight < hint.minHeight) {
            var rowIncrements = qx.ui.layout.Util.computeFlexOffsets(rowFlexes, hint.minHeight, minSpanHeight);

            for (var j = 0; j < widgetProps.rowSpan; j++) {
              var offset = rowIncrements[widgetRow + j] ? rowIncrements[widgetRow + j].offset : 0;
              rowHeights[widgetRow + j].minHeight += offset;
            }
          }
        }
      },

      /**
       * Check whether all col spans fit with their preferred width into the
       * preferred column widths. If there is not enough space the preferred
       * column sizes are increased. The distribution respects the flex and max
       * values of the columns.
       *
       *  The same is true for the min sizes.
       *
       *  The width array is modified in place.
       *
       * @param colWidths {Map[]} The current column width array as computed by
       *     {@link #_getColWidths}.
       */
      _fixWidthsColSpan: function _fixWidthsColSpan(colWidths) {
        var hSpacing = this.getSpacingX();

        var colSpans = this._getColSpans();

        for (var i = 0, l = colSpans.length; i < l; i++) {
          var widget = colSpans[i];

          var hint = this._getOuterSize(widget);

          var widgetProps = widget.getLayoutProperties();
          var widgetColumn = widgetProps.column;
          var prefSpanWidth = hSpacing * (widgetProps.colSpan - 1);
          var minSpanWidth = prefSpanWidth;
          var colFlexes = {};
          var offset;

          for (var j = 0; j < widgetProps.colSpan; j++) {
            var col = widgetProps.column + j;
            var colWidth = colWidths[col];
            var colFlex = this.getColumnFlex(col); // compute flex array for the preferred width

            if (colFlex > 0) {
              colFlexes[col] = {
                min: colWidth.minWidth,
                value: colWidth.width,
                max: colWidth.maxWidth,
                flex: colFlex
              };
            }

            prefSpanWidth += colWidth.width;
            minSpanWidth += colWidth.minWidth;
          } // If there is not enough space for the preferred size
          // increment the preferred column sizes.


          if (prefSpanWidth < hint.width) {
            // Do not adapt column widths to the width
            // of the spanning cell if allowGrowSpannedCellWidth property
            // is set to false
            // See https://github.com/qooxdoo/qooxdoo/issues/9871
            if (!this.getAllowGrowSpannedCellWidth() || !qx.lang.Object.isEmpty(colFlexes)) {
              var colIncrements = qx.ui.layout.Util.computeFlexOffsets(colFlexes, hint.width, prefSpanWidth);

              for (var j = 0; j < widgetProps.colSpan; j++) {
                offset = colIncrements[widgetColumn + j] ? colIncrements[widgetColumn + j].offset : 0;
                colWidths[widgetColumn + j].width += offset;
              } // col is too small and we have no flex value set

            } else {
              var totalSpacing = hSpacing * (widgetProps.colSpan - 1);
              var availableWidth = hint.width - totalSpacing; // get the col width which every child would need to share the
              // available width equally

              var avgColWidth = Math.floor(availableWidth / widgetProps.colSpan); // get the width already used and the number of children which do
              // not have at least that avg col width

              var usedWidth = 0;
              var colsNeedAddition = 0;

              for (var k = 0; k < widgetProps.colSpan; k++) {
                var currentWidth = colWidths[widgetColumn + k].width;
                usedWidth += currentWidth;

                if (currentWidth < avgColWidth) {
                  colsNeedAddition++;
                }
              } // the difference of available and used needs to be shared among
              // those not having the min size


              var additionalColWidth = Math.floor((availableWidth - usedWidth) / colsNeedAddition); // add the extra width to the too small children

              for (var k = 0; k < widgetProps.colSpan; k++) {
                if (colWidths[widgetColumn + k].width < avgColWidth) {
                  colWidths[widgetColumn + k].width += additionalColWidth;
                }
              }
            }
          } // If there is not enough space for the min size
          // increment the min column sizes.


          if (minSpanWidth < hint.minWidth) {
            var colIncrements = qx.ui.layout.Util.computeFlexOffsets(colFlexes, hint.minWidth, minSpanWidth);

            for (var j = 0; j < widgetProps.colSpan; j++) {
              offset = colIncrements[widgetColumn + j] ? colIncrements[widgetColumn + j].offset : 0;
              colWidths[widgetColumn + j].minWidth += offset;
            }
          }
        }
      },

      /**
       * Compute the min/pref/max row heights.
       *
       * @return {Map[]} An array containing height information for each row. The
       *     entries have the keys <code>minHeight</code>, <code>maxHeight</code> and
       *     <code>height</code>.
       */
      _getRowHeights: function _getRowHeights() {
        if (this.__rowHeights__P_78_7 != null) {
          return this.__rowHeights__P_78_7;
        }

        var rowHeights = [];
        var maxRowIndex = this.__maxRowIndex__P_78_5;
        var maxColIndex = this.__maxColIndex__P_78_6;

        for (var row = 0; row <= maxRowIndex; row++) {
          var minHeight = 0;
          var height = 0;
          var maxHeight = 0;

          for (var col = 0; col <= maxColIndex; col++) {
            var widget = this.__grid__P_78_2[row][col];

            if (!widget) {
              continue;
            } // ignore rows with row spans at this place
            // these rows will be taken into account later


            var widgetRowSpan = widget.getLayoutProperties().rowSpan || 0;

            if (widgetRowSpan > 1) {
              continue;
            }

            var cellSize = this._getOuterSize(widget);

            if (this.getRowFlex(row) > 0) {
              minHeight = Math.max(minHeight, cellSize.minHeight);
            } else {
              minHeight = Math.max(minHeight, cellSize.height);
            }

            height = Math.max(height, cellSize.height);
          }

          var minHeight = Math.max(minHeight, this.getRowMinHeight(row));
          var maxHeight = this.getRowMaxHeight(row);

          if (this.getRowHeight(row) !== null) {
            var height = this.getRowHeight(row);
          } else {
            var height = Math.max(minHeight, Math.min(height, maxHeight));
          }

          rowHeights[row] = {
            minHeight: minHeight,
            height: height,
            maxHeight: maxHeight
          };
        }

        if (this.__rowSpans__P_78_4.length > 0) {
          this._fixHeightsRowSpan(rowHeights);
        }

        this.__rowHeights__P_78_7 = rowHeights;
        return rowHeights;
      },

      /**
       * Compute the min/pref/max column widths.
       *
       * @return {Map[]} An array containing width information for each column. The
       *     entries have the keys <code>minWidth</code>, <code>maxWidth</code> and
       *     <code>width</code>.
       */
      _getColWidths: function _getColWidths() {
        if (this.__colWidths__P_78_8 != null) {
          return this.__colWidths__P_78_8;
        }

        var colWidths = [];
        var maxColIndex = this.__maxColIndex__P_78_6;
        var maxRowIndex = this.__maxRowIndex__P_78_5;

        for (var col = 0; col <= maxColIndex; col++) {
          var width = 0;
          var minWidth = 0;
          var maxWidth = Infinity;

          for (var row = 0; row <= maxRowIndex; row++) {
            var widget = this.__grid__P_78_2[row][col];

            if (!widget) {
              continue;
            } // ignore columns with col spans at this place
            // these columns will be taken into account later


            var widgetColSpan = widget.getLayoutProperties().colSpan || 0;

            if (widgetColSpan > 1) {
              continue;
            }

            var cellSize = this._getOuterSize(widget);

            minWidth = Math.max(minWidth, cellSize.minWidth);
            width = Math.max(width, cellSize.width);
          }

          minWidth = Math.max(minWidth, this.getColumnMinWidth(col));
          maxWidth = this.getColumnMaxWidth(col);

          if (this.getColumnWidth(col) !== null) {
            var width = this.getColumnWidth(col);
          } else {
            var width = Math.max(minWidth, Math.min(width, maxWidth));
          }

          colWidths[col] = {
            minWidth: minWidth,
            width: width,
            maxWidth: maxWidth
          };
        }

        if (this._getColSpans().length > 0) {
          this._fixWidthsColSpan(colWidths);
        }

        this.__colWidths__P_78_8 = colWidths;
        return colWidths;
      },

      /**
       * Computes for each column by how many pixels it must grow or shrink, taking
       * the column flex values and min/max widths into account.
       *
       * @param width {Integer} The grid width
       * @return {Integer[]} Sparse array of offsets to add to each column width. If
       *     an array entry is empty nothing should be added to the column.
       */
      _getColumnFlexOffsets: function _getColumnFlexOffsets(width) {
        var hint = this.getSizeHint();
        var diff = width - hint.width;

        if (diff == 0) {
          return {};
        } // collect all flexible children


        var colWidths = this._getColWidths();

        var flexibles = {};

        for (var i = 0, l = colWidths.length; i < l; i++) {
          var col = colWidths[i];
          var colFlex = this.getColumnFlex(i);

          if (colFlex <= 0 || col.width == col.maxWidth && diff > 0 || col.width == col.minWidth && diff < 0) {
            continue;
          }

          flexibles[i] = {
            min: col.minWidth,
            value: col.width,
            max: col.maxWidth,
            flex: colFlex
          };
        }

        return qx.ui.layout.Util.computeFlexOffsets(flexibles, width, hint.width);
      },

      /**
       * Computes for each row by how many pixels it must grow or shrink, taking
       * the row flex values and min/max heights into account.
       *
       * @param height {Integer} The grid height
       * @return {Integer[]} Sparse array of offsets to add to each row height. If
       *     an array entry is empty nothing should be added to the row.
       */
      _getRowFlexOffsets: function _getRowFlexOffsets(height) {
        var hint = this.getSizeHint();
        var diff = height - hint.height;

        if (diff == 0) {
          return {};
        } // collect all flexible children


        var rowHeights = this._getRowHeights();

        var flexibles = {};

        for (var i = 0, l = rowHeights.length; i < l; i++) {
          var row = rowHeights[i];
          var rowFlex = this.getRowFlex(i);

          if (rowFlex <= 0 || row.height == row.maxHeight && diff > 0 || row.height == row.minHeight && diff < 0) {
            continue;
          }

          flexibles[i] = {
            min: row.minHeight,
            value: row.height,
            max: row.maxHeight,
            flex: rowFlex
          };
        }

        return qx.ui.layout.Util.computeFlexOffsets(flexibles, height, hint.height);
      },

      /**
       * Returns the internal private __colSpans array in order
       * have a protected getter which can be used other methods
       * to make them overridable
       *
       * @return {Array} the __colSpans array
       */
      _getColSpans: function _getColSpans() {
        return this.__colSpans__P_78_3;
      },
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        if (this._invalidChildrenCache) {
          this.__buildGrid__P_78_9();
        }

        var Util = qx.ui.layout.Util;
        var hSpacing = this.getSpacingX();
        var vSpacing = this.getSpacingY(); // calculate column widths

        var prefWidths = this._getColWidths();

        var colStretchOffsets = this._getColumnFlexOffsets(availWidth);

        var colWidths = [];
        var maxColIndex = this.__maxColIndex__P_78_6;
        var maxRowIndex = this.__maxRowIndex__P_78_5;
        var offset;

        for (var col = 0; col <= maxColIndex; col++) {
          offset = colStretchOffsets[col] ? colStretchOffsets[col].offset : 0;
          colWidths[col] = prefWidths[col].width + offset;
        } // calculate row heights


        var prefHeights = this._getRowHeights();

        var rowStretchOffsets = this._getRowFlexOffsets(availHeight);

        var rowHeights = [];

        for (var row = 0; row <= maxRowIndex; row++) {
          offset = rowStretchOffsets[row] ? rowStretchOffsets[row].offset : 0;
          rowHeights[row] = prefHeights[row].height + offset;
        } // do the layout


        var left = 0;

        for (var col = 0; col <= maxColIndex; col++) {
          var top = 0;

          for (var row = 0; row <= maxRowIndex; row++) {
            var widget = this.__grid__P_78_2[row][col]; // ignore empty cells

            if (!widget) {
              top += rowHeights[row] + vSpacing;
              continue;
            }

            var widgetProps = widget.getLayoutProperties(); // ignore cells, which have cell spanning but are not the origin
            // of the widget

            if (widgetProps.row !== row || widgetProps.column !== col) {
              top += rowHeights[row] + vSpacing;
              continue;
            } // compute sizes width including cell spanning


            var spanWidth = hSpacing * (widgetProps.colSpan - 1);

            for (var i = 0; i < widgetProps.colSpan; i++) {
              spanWidth += colWidths[col + i];
            }

            var spanHeight = vSpacing * (widgetProps.rowSpan - 1);

            for (var i = 0; i < widgetProps.rowSpan; i++) {
              spanHeight += rowHeights[row + i];
            }

            var cellHint = widget.getSizeHint();
            var marginTop = widget.getMarginTop();
            var marginLeft = widget.getMarginLeft();
            var marginBottom = widget.getMarginBottom();
            var marginRight = widget.getMarginRight();
            var cellWidth = Math.max(cellHint.minWidth, Math.min(spanWidth - marginLeft - marginRight, cellHint.maxWidth));
            var cellHeight = Math.max(cellHint.minHeight, Math.min(spanHeight - marginTop - marginBottom, cellHint.maxHeight));
            var cellAlign = this.getCellAlign(row, col);
            var cellLeft = left + Util.computeHorizontalAlignOffset(cellAlign.hAlign, cellWidth, spanWidth, marginLeft, marginRight);
            var cellTop = top + Util.computeVerticalAlignOffset(cellAlign.vAlign, cellHeight, spanHeight, marginTop, marginBottom);
            widget.renderLayout(cellLeft + padding.left, cellTop + padding.top, cellWidth, cellHeight);
            top += rowHeights[row] + vSpacing;
          }

          left += colWidths[col] + hSpacing;
        }
      },
      // overridden
      invalidateLayoutCache: function invalidateLayoutCache() {
        qx.ui.layout.Grid.superclass.prototype.invalidateLayoutCache.call(this);
        this.__colWidths__P_78_8 = null;
        this.__rowHeights__P_78_7 = null;
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        if (this._invalidChildrenCache) {
          this.__buildGrid__P_78_9();
        } // calculate col widths


        var colWidths = this._getColWidths();

        var minWidth = 0,
            width = 0;

        for (var i = 0, l = colWidths.length; i < l; i++) {
          var col = colWidths[i];

          if (this.getColumnFlex(i) > 0) {
            minWidth += col.minWidth;
          } else {
            minWidth += col.width;
          }

          width += col.width;
        } // calculate row heights


        var rowHeights = this._getRowHeights();

        var minHeight = 0,
            height = 0;

        for (var i = 0, l = rowHeights.length; i < l; i++) {
          var row = rowHeights[i];

          if (this.getRowFlex(i) > 0) {
            minHeight += row.minHeight;
          } else {
            minHeight += row.height;
          }

          height += row.height;
        }

        var spacingX = this.getSpacingX() * (colWidths.length - 1);
        var spacingY = this.getSpacingY() * (rowHeights.length - 1);
        var hint = {
          minWidth: minWidth + spacingX,
          width: width + spacingX,
          minHeight: minHeight + spacingY,
          height: height + spacingY
        };
        return hint;
      }
    },

    /*
    *****************************************************************************
       DESTRUCT
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__grid__P_78_2 = this.__rowData__P_78_0 = this.__colData__P_78_1 = this.__colSpans__P_78_3 = this.__rowSpans__P_78_4 = this.__colWidths__P_78_8 = this.__rowHeights__P_78_7 = null;
    }
  });
  qx.ui.layout.Grid.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.layout.Atom": {
        "construct": true
      },
      "qx.ui.basic.Label": {},
      "qx.ui.basic.Image": {}
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
   * A multi-purpose widget, which combines a label with an icon.
   *
   * The intended purpose of qx.ui.basic.Atom is to easily align the common icon-text
   * combination in different ways.
   *
   * This is useful for all types of buttons, tooltips, ...
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   var atom = new qx.ui.basic.Atom("Icon Right", "icon/32/actions/go-next.png");
   *   this.getRoot().add(atom);
   * </pre>
   *
   * This example creates an atom with the label "Icon Right" and an icon.
   *
   * *External Documentation*
   *
   * <a href='http://qooxdoo.org/docs/#desktop/widget/atom.md' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   *
   *
   * @childControl label {qx.ui.basic.Label} label part of the atom
   * @childControl icon {qx.ui.basic.Image} icon part of the atom
   */
  qx.Class.define("qx.ui.basic.Atom", {
    extend: qx.ui.core.Widget,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} Label to use
     * @param icon {String?null} Icon to use
     */
    construct: function construct(label, icon) {
      {
        this.assertArgumentsCount(arguments, 0, 2);
      }
      qx.ui.core.Widget.constructor.call(this);

      this._setLayout(new qx.ui.layout.Atom());

      if (label != null) {
        this.setLabel(label);
      }

      if (icon !== undefined) {
        this.setIcon(icon);
      }
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
        init: "atom"
      },

      /** The label/caption/text of the qx.ui.basic.Atom instance */
      label: {
        apply: "_applyLabel",
        nullable: true,
        check: "String",
        event: "changeLabel"
      },

      /**
       * Switches between rich HTML and text content. The text mode (<code>false</code>) supports
       * advanced features like ellipsis when the available space is not
       * enough. HTML mode (<code>true</code>) supports multi-line content and all the
       * markup features of HTML content.
       */
      rich: {
        check: "Boolean",
        init: false,
        apply: "_applyRich"
      },

      /** Any URI String supported by qx.ui.basic.Image to display an icon */
      icon: {
        check: "String",
        apply: "_applyIcon",
        nullable: true,
        themeable: true,
        event: "changeIcon"
      },

      /**
       * The space between the icon and the label
       */
      gap: {
        check: "Integer",
        nullable: false,
        event: "changeGap",
        apply: "_applyGap",
        themeable: true,
        init: 4
      },

      /**
       * Configure the visibility of the sub elements/widgets.
       * Possible values: both, label, icon
       */
      show: {
        init: "both",
        check: ["both", "label", "icon"],
        themeable: true,
        inheritable: true,
        apply: "_applyShow",
        event: "changeShow"
      },

      /**
       * The position of the icon in relation to the text.
       * Only useful/needed if text and icon is configured and 'show' is configured as 'both' (default)
       */
      iconPosition: {
        init: "left",
        check: ["top", "right", "bottom", "left", "top-left", "bottom-left", "top-right", "bottom-right"],
        themeable: true,
        apply: "_applyIconPosition"
      },

      /**
       * Whether the content should be rendered centrally when to much space
       * is available. Enabling this property centers in both axis. The behavior
       * when disabled of the centering depends on the {@link #iconPosition} property.
       * If the icon position is <code>left</code> or <code>right</code>, the X axis
       * is not centered, only the Y axis. If the icon position is <code>top</code>
       * or <code>bottom</code>, the Y axis is not centered. In case of e.g. an
       * icon position of <code>top-left</code> no axis is centered.
       */
      center: {
        init: false,
        check: "Boolean",
        themeable: true,
        apply: "_applyCenter"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */

    /* eslint-disable @qooxdoo/qx/no-refs-in-members */
    members: {
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "label":
            control = new qx.ui.basic.Label(this.getLabel());
            control.setAnonymous(true);
            control.setRich(this.getRich());
            control.setSelectable(this.getSelectable());

            this._add(control);

            if (this.getLabel() == null || this.getShow() === "icon") {
              control.exclude();
            }

            break;

          case "icon":
            control = new qx.ui.basic.Image(this.getIcon());
            control.setAnonymous(true);

            this._addAt(control, 0);

            if (this.getIcon() == null || this.getShow() === "label") {
              control.exclude();
            }

            break;
        }

        return control || qx.ui.basic.Atom.superclass.prototype._createChildControlImpl.call(this, id);
      },
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        focused: true,
        hovered: true
      },

      /**
       * Updates the visibility of the label
       */
      _handleLabel: function _handleLabel() {
        if (this.getLabel() == null || this.getShow() === "icon") {
          this._excludeChildControl("label");
        } else {
          this._showChildControl("label");
        }
      },

      /**
       * Updates the visibility of the icon
       */
      _handleIcon: function _handleIcon() {
        if (this.getIcon() == null || this.getShow() === "label") {
          this._excludeChildControl("icon");
        } else {
          this._showChildControl("icon");
        }
      },
      // property apply
      _applyLabel: function _applyLabel(value, old) {
        var label = this.getChildControl("label", true);

        if (label) {
          label.setValue(value);
        }

        this._handleLabel();
      },
      // property apply
      _applyRich: function _applyRich(value, old) {
        var label = this.getChildControl("label", true);

        if (label) {
          label.setRich(value);
        }
      },
      // property apply
      _applyIcon: function _applyIcon(value, old) {
        var icon = this.getChildControl("icon", true);

        if (icon) {
          icon.setSource(value);
        }

        this._handleIcon();
      },
      // property apply
      _applyGap: function _applyGap(value, old) {
        this._getLayout().setGap(value);
      },
      // property apply
      _applyShow: function _applyShow(value, old) {
        this._handleLabel();

        this._handleIcon();
      },
      // property apply
      _applyIconPosition: function _applyIconPosition(value, old) {
        this._getLayout().setIconPosition(value);
      },
      // property apply
      _applyCenter: function _applyCenter(value, old) {
        this._getLayout().setCenter(value);
      },
      // overridden
      _applySelectable: function _applySelectable(value, old) {
        qx.ui.basic.Atom.superclass.prototype._applySelectable.call(this, value, old);

        var label = this.getChildControl("label", true);

        if (label) {
          this.getChildControl("label").setSelectable(value);
        }
      }
    }
  });
  qx.ui.basic.Atom.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "usage": "dynamic",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.command.Command": {},
      "qx.Class": {},
      "qx.util.PropertyUtil": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.command.bindEnabled": {
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * This mixin is included by all widgets, which support an 'execute' like
   * buttons or menu entries.
   */
  qx.Mixin.define("qx.ui.core.MExecutable", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired if the {@link #execute} method is invoked.*/
      execute: "qx.event.type.Event"
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * A command called if the {@link #execute} method is called, e.g. on a
       * button tap.
       */
      command: {
        check: "qx.ui.command.Command",
        apply: "_applyCommand",
        event: "changeCommand",
        nullable: true
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __executableBindingIds__P_129_0: null,
      __semaphore__P_129_1: false,
      __executeListenerId__P_129_2: null,

      /**
       * @type {Map} Set of properties, which will by synced from the command to the
       *    including widget
       *
       * @lint ignoreReferenceField(_bindableProperties)
       */
      _bindableProperties: qx.core.Environment.select("qx.command.bindEnabled", {
        "true": ["enabled", "label", "icon", "toolTipText", "value", "menu"],
        "false": ["label", "icon", "toolTipText", "value", "menu"]
      }),

      /**
       * Initiate the execute action.
       */
      execute: function execute() {
        var cmd = this.getCommand();

        if (cmd) {
          if (this.__semaphore__P_129_1) {
            this.__semaphore__P_129_1 = false;
          } else {
            this.__semaphore__P_129_1 = true;
            cmd.execute(this);
          }
        }

        this.fireEvent("execute");
      },

      /**
       * Handler for the execute event of the command.
       *
       * @param e {qx.event.type.Event} The execute event of the command.
       */
      __onCommandExecute__P_129_3: function __onCommandExecute__P_129_3(e) {
        if (this.isEnabled()) {
          if (this.__semaphore__P_129_1) {
            this.__semaphore__P_129_1 = false;
            return;
          }

          if (this.isEnabled()) {
            this.__semaphore__P_129_1 = true;
            this.execute();
          }
        }
      },
      // property apply
      _applyCommand: function _applyCommand(value, old) {
        // execute forwarding
        if (old != null) {
          old.removeListenerById(this.__executeListenerId__P_129_2);
        }

        if (value != null) {
          this.__executeListenerId__P_129_2 = value.addListener("execute", this.__onCommandExecute__P_129_3, this);
        } // binding stuff


        var ids = this.__executableBindingIds__P_129_0;

        if (ids == null) {
          this.__executableBindingIds__P_129_0 = ids = {};
        }

        var selfPropertyValue;

        for (var i = 0; i < this._bindableProperties.length; i++) {
          var property = this._bindableProperties[i]; // remove the old binding

          if (old != null && !old.isDisposed() && ids[property] != null) {
            old.removeBinding(ids[property]);
            ids[property] = null;
          } // add the new binding


          if (value != null && qx.Class.hasProperty(this.constructor, property)) {
            // handle the init value (don't sync the initial null)
            var cmdPropertyValue = value.get(property);

            if (cmdPropertyValue == null) {
              selfPropertyValue = this.get(property); // check also for themed values [BUG #5906]

              if (selfPropertyValue == null) {
                // update the appearance to make sure every themed property is up to date
                this.$$resyncNeeded = true;
                this.syncAppearance();
                selfPropertyValue = qx.util.PropertyUtil.getThemeValue(this, property);
              }
            } else {
              // Reset the self property value [BUG #4534]
              selfPropertyValue = null;
            } // set up the binding


            ids[property] = value.bind(property, this, property); // reapply the former value

            if (selfPropertyValue) {
              this.set(property, selfPropertyValue);
            }
          }
        }
      }
    },
    destruct: function destruct() {
      this._applyCommand(null, this.getCommand());

      this.__executableBindingIds__P_129_0 = null;
    }
  });
  qx.ui.core.MExecutable.$$dbClassInfo = $$dbClassInfo;
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Form interface for all form widgets which are executable in some way. This
   * could be a button for example.
   */
  qx.Interface.define("qx.ui.form.IExecutable", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /**
       * Fired when the widget is executed. Sets the "data" property of the
       * event to the object that issued the command.
       */
      execute: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        COMMAND PROPERTY
      ---------------------------------------------------------------------------
      */

      /**
       * Set the command of this executable.
       *
       * @param command {qx.ui.command.Command} The command.
       */
      setCommand: function setCommand(command) {
        return arguments.length == 1;
      },

      /**
       * Return the current set command of this executable.
       *
       * @return {qx.ui.command.Command} The current set command.
       */
      getCommand: function getCommand() {},

      /**
       * Fire the "execute" event on the command.
       */
      execute: function execute() {}
    }
  });
  qx.ui.form.IExecutable.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.basic.Label": {}
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
   * A atom layout. Used to place an image and label in relation
   * to each other. Useful to create buttons, list items, etc.
   *
   * *Features*
   *
   * * Gap between icon and text (using {@link #gap})
   * * Vertical and horizontal mode (using {@link #iconPosition})
   * * Sorting options to place first child on top/left or bottom/right (using {@link #iconPosition})
   * * Automatically middles/centers content to the available space
   * * Auto-sizing
   * * Supports more than two children (will be processed the same way like the previous ones)
   *
   * *Item Properties*
   *
   * None
   *
   * *Notes*
   *
   * * Does not support margins and alignment of {@link qx.ui.core.LayoutItem}.
   *
   * *Alternative Names*
   *
   * None
   */
  qx.Class.define("qx.ui.layout.Atom", {
    extend: qx.ui.layout.Abstract,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The gap between the icon and the text */
      gap: {
        check: "Integer",
        init: 4,
        apply: "_applyLayoutChange"
      },

      /** The position of the icon in relation to the text */
      iconPosition: {
        check: ["left", "top", "right", "bottom", "top-left", "bottom-left", "top-right", "bottom-right"],
        init: "left",
        apply: "_applyLayoutChange"
      },

      /**
       * Whether the content should be rendered centrally when to much space
       * is available. Enabling this property centers in both axis. The behavior
       * when disabled of the centering depends on the {@link #iconPosition} property.
       * If the icon position is <code>left</code> or <code>right</code>, the X axis
       * is not centered, only the Y axis. If the icon position is <code>top</code>
       * or <code>bottom</code>, the Y axis is not centered. In case of e.g. an
       * icon position of <code>top-left</code> no axis is centered.
       */
      center: {
        check: "Boolean",
        init: false,
        apply: "_applyLayoutChange"
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
          this.assert(false, "The property '" + name + "' is not supported by the Atom layout!");
        },
        "false": null
      }),
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        var left = padding.left;
        var top = padding.top;
        var Util = qx.ui.layout.Util;
        var iconPosition = this.getIconPosition();

        var children = this._getLayoutChildren();

        var length = children.length;
        var width, height;
        var child, hint;
        var gap = this.getGap();
        var center = this.getCenter(); // reverse ordering

        var allowedPositions = ["bottom", "right", "top-right", "bottom-right"];

        if (allowedPositions.indexOf(iconPosition) != -1) {
          var start = length - 1;
          var end = -1;
          var increment = -1;
        } else {
          var start = 0;
          var end = length;
          var increment = 1;
        } // vertical


        if (iconPosition == "top" || iconPosition == "bottom") {
          if (center) {
            var allocatedHeight = 0;

            for (var i = start; i != end; i += increment) {
              height = children[i].getSizeHint().height;

              if (height > 0) {
                allocatedHeight += height;

                if (i != start) {
                  allocatedHeight += gap;
                }
              }
            }

            top += Math.round((availHeight - allocatedHeight) / 2);
          }

          var childTop = top;

          for (var i = start; i != end; i += increment) {
            child = children[i];
            hint = child.getSizeHint();
            width = Math.min(hint.maxWidth, Math.max(availWidth, hint.minWidth));
            height = hint.height;
            left = Util.computeHorizontalAlignOffset("center", width, availWidth) + padding.left;
            child.renderLayout(left, childTop, width, height); // Ignore pseudo invisible elements

            if (height > 0) {
              childTop = top + height + gap;
            }
          }
        } // horizontal
        // in this way it also supports shrinking of the first label
        else {
          var remainingWidth = availWidth;
          var shrinkTarget = null;
          var count = 0;

          for (var i = start; i != end; i += increment) {
            child = children[i];
            width = child.getSizeHint().width;

            if (width > 0) {
              if (!shrinkTarget && child instanceof qx.ui.basic.Label) {
                shrinkTarget = child;
              } else {
                remainingWidth -= width;
              }

              count++;
            }
          }

          if (count > 1) {
            var gapSum = (count - 1) * gap;
            remainingWidth -= gapSum;
          }

          if (shrinkTarget) {
            var hint = shrinkTarget.getSizeHint();
            var shrinkTargetWidth = Math.max(hint.minWidth, Math.min(remainingWidth, hint.maxWidth));
            remainingWidth -= shrinkTargetWidth;
          }

          if (center && remainingWidth > 0) {
            left += Math.round(remainingWidth / 2);
          }

          for (var i = start; i != end; i += increment) {
            child = children[i];
            hint = child.getSizeHint();
            height = Math.min(hint.maxHeight, Math.max(availHeight, hint.minHeight));

            if (child === shrinkTarget) {
              width = shrinkTargetWidth;
            } else {
              width = hint.width;
            }

            var align = "middle";

            if (iconPosition == "top-left" || iconPosition == "top-right") {
              align = "top";
            } else if (iconPosition == "bottom-left" || iconPosition == "bottom-right") {
              align = "bottom";
            }

            var childTop = top + Util.computeVerticalAlignOffset(align, hint.height, availHeight);
            child.renderLayout(left, childTop, width, height); // Ignore pseudo invisible childs for gap e.g.
            // empty text or unavailable images

            if (width > 0) {
              left += width + gap;
            }
          }
        }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var children = this._getLayoutChildren();

        var length = children.length;
        var hint, result; // Fast path for only one child

        if (length === 1) {
          var hint = children[0].getSizeHint(); // Work on a copy, but do not respect max
          // values as a Atom can be rendered bigger
          // than its content.

          result = {
            width: hint.width,
            height: hint.height,
            minWidth: hint.minWidth,
            minHeight: hint.minHeight
          };
        } else {
          var minWidth = 0,
              width = 0;
          var minHeight = 0,
              height = 0;
          var iconPosition = this.getIconPosition();
          var gap = this.getGap();

          if (iconPosition === "top" || iconPosition === "bottom") {
            var count = 0;

            for (var i = 0; i < length; i++) {
              hint = children[i].getSizeHint(); // Max of widths

              width = Math.max(width, hint.width);
              minWidth = Math.max(minWidth, hint.minWidth); // Sum of heights

              if (hint.height > 0) {
                height += hint.height;
                minHeight += hint.minHeight;
                count++;
              }
            }

            if (count > 1) {
              var gapSum = (count - 1) * gap;
              height += gapSum;
              minHeight += gapSum;
            }
          } else {
            var count = 0;

            for (var i = 0; i < length; i++) {
              hint = children[i].getSizeHint(); // Max of heights

              height = Math.max(height, hint.height);
              minHeight = Math.max(minHeight, hint.minHeight); // Sum of widths

              if (hint.width > 0) {
                width += hint.width;
                minWidth += hint.minWidth;
                count++;
              }
            }

            if (count > 1) {
              var gapSum = (count - 1) * gap;
              width += gapSum;
              minWidth += gapSum;
            }
          } // Build hint


          result = {
            minWidth: minWidth,
            width: width,
            minHeight: minHeight,
            height: height
          };
        }

        return result;
      }
    }
  });
  qx.ui.layout.Atom.$$dbClassInfo = $$dbClassInfo;
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
   * A Button widget which supports various states and allows it to be used
   * via the mouse, touch, pen and the keyboard.
   *
   * If the user presses the button by clicking on it, or the <code>Enter</code> or
   * <code>Space</code> keys, the button fires an {@link qx.ui.core.MExecutable#execute} event.
   *
   * If the {@link qx.ui.core.MExecutable#command} property is set, the
   * command is executed as well.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   var button = new qx.ui.form.Button("Hello World");
   *
   *   button.addListener("execute", function(e) {
   *     alert("Button was clicked");
   *   }, this);
   *
   *   this.getRoot().add(button);
   * </pre>
   *
   * This example creates a button with the label "Hello World" and attaches an
   * event listener to the {@link #execute} event.
   *
   * *External Documentation*
   *
   * <a href='http://qooxdoo.org/docs/#desktop/widget/button.md' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.form.Button", {
    extend: qx.ui.basic.Atom,
    include: [qx.ui.core.MExecutable],
    implement: [qx.ui.form.IExecutable],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} label of the atom
     * @param icon {String?null} Icon URL of the atom
     * @param command {qx.ui.command.Command?null} Command instance to connect with
     */
    construct: function construct(label, icon, command) {
      qx.ui.basic.Atom.constructor.call(this, label, icon);

      if (command != null) {
        this.setCommand(command);
      } // ARIA attrs


      this.getContentElement().setAttribute("role", "button"); // Add listeners

      this.addListener("pointerover", this._onPointerOver);
      this.addListener("pointerout", this._onPointerOut);
      this.addListener("pointerdown", this._onPointerDown);
      this.addListener("pointerup", this._onPointerUp);
      this.addListener("tap", this._onTap);
      this.addListener("keydown", this._onKeyDown);
      this.addListener("keyup", this._onKeyUp); // Stop events

      this.addListener("dblclick", function (e) {
        e.stopPropagation();
      });
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
        init: "button"
      },
      // overridden
      focusable: {
        refine: true,
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
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        focused: true,
        hovered: true,
        pressed: true,
        disabled: true
      },

      /*
      ---------------------------------------------------------------------------
        USER API
      ---------------------------------------------------------------------------
      */

      /**
       * Manually press the button
       */
      press: function press() {
        if (this.hasState("abandoned")) {
          return;
        }

        this.addState("pressed");
      },

      /**
       * Manually release the button
       */
      release: function release() {
        if (this.hasState("pressed")) {
          this.removeState("pressed");
        }
      },

      /**
       * Completely reset the button (remove all states)
       */
      reset: function reset() {
        this.removeState("pressed");
        this.removeState("abandoned");
        this.removeState("hovered");
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Listener method for "pointerover" event
       * <ul>
       * <li>Adds state "hovered"</li>
       * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state is set)</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} Mouse event
       */
      _onPointerOver: function _onPointerOver(e) {
        if (!this.isEnabled() || e.getTarget() !== this) {
          return;
        }

        if (this.hasState("abandoned")) {
          this.removeState("abandoned");
          this.addState("pressed");
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
       * @param e {qx.event.type.Pointer} Mouse event
       */
      _onPointerOut: function _onPointerOut(e) {
        if (!this.isEnabled() || e.getTarget() !== this) {
          return;
        }

        this.removeState("hovered");

        if (this.hasState("pressed")) {
          this.removeState("pressed");
          this.addState("abandoned");
        }
      },

      /**
       * Listener method for "pointerdown" event
       * <ul>
       * <li>Removes "abandoned" state</li>
       * <li>Adds "pressed" state</li>
       * </ul>
       *
       * @param e {qx.event.type.Pointer} Mouse event
       */
      _onPointerDown: function _onPointerDown(e) {
        if (!e.isLeftPressed()) {
          return;
        }

        e.stopPropagation(); // Activate capturing if the button get a pointerout while
        // the button is pressed.

        this.capture();
        this.removeState("abandoned");
        this.addState("pressed");
      },

      /**
       * Listener method for "pointerup" event
       * <ul>
       * <li>Removes "pressed" state (if set)</li>
       * <li>Removes "abandoned" state (if set)</li>
       * <li>Adds "hovered" state (if "abandoned" state is not set)</li>
       *</ul>
       *
       * @param e {qx.event.type.Pointer} Mouse event
       */
      _onPointerUp: function _onPointerUp(e) {
        this.releaseCapture(); // We must remove the states before executing the command
        // because in cases were the window lost the focus while
        // executing we get the capture phase back (mouseout).

        var hasPressed = this.hasState("pressed");
        var hasAbandoned = this.hasState("abandoned");

        if (hasPressed) {
          this.removeState("pressed");
        }

        if (hasAbandoned) {
          this.removeState("abandoned");
        }

        e.stopPropagation();
      },

      /**
       * Listener method for "tap" event which stops the propagation.
       *
       * @param e {qx.event.type.Pointer} Pointer event
       */
      _onTap: function _onTap(e) {
        // "execute" is fired here so that the button can be dragged
        // without executing it (e.g. in a TabBar with overflow)
        this.execute();
        e.stopPropagation();
      },

      /**
       * Listener method for "keydown" event.<br/>
       * Removes "abandoned" and adds "pressed" state
       * for the keys "Enter" or "Space"
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
        }
      },

      /**
       * Listener method for "keyup" event.<br/>
       * Removes "abandoned" and "pressed" state (if "pressed" state is set)
       * for the keys "Enter" or "Space"
       *
       * @param e {Event} Key event
       */
      _onKeyUp: function _onKeyUp(e) {
        switch (e.getKeyIdentifier()) {
          case "Enter":
          case "Space":
            if (this.hasState("pressed")) {
              this.removeState("abandoned");
              this.removeState("pressed");
              this.execute();
              e.stopPropagation();
            }

        }
      }
    }
  });
  qx.ui.form.Button.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.event.type.Event": {
        "require": true
      },
      "qx.dom.Node": {},
      "qx.bom.Viewport": {},
      "qx.event.Registration": {},
      "qx.event.handler.DragDrop": {}
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
   * Event object class for drag events
   */
  qx.Class.define("qx.event.type.Drag", {
    extend: qx.event.type.Event,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Initialize the fields of the event. The event must be initialized before
       * it can be dispatched.
       *
       * @param cancelable {Boolean?false} Whether or not an event can have its default
       *     action prevented. The default action can either be the browser's
       *     default action of a native event (e.g. open the context menu on a
       *     right click) or the default action of a qooxdoo class (e.g. close
       *     the window widget). The default action can be prevented by calling
       *     {@link qx.event.type.Event#preventDefault}
       * @param originalEvent {qx.event.type.Track} The original (mouse) event to use
       * @return {qx.event.type.Event} The initialized event instance
       */
      init: function init(cancelable, originalEvent) {
        qx.event.type.Drag.superclass.prototype.init.call(this, true, cancelable);

        if (originalEvent) {
          this._native = originalEvent.getNativeEvent() || null;
          this._originalTarget = originalEvent.getOriginalTarget() || null;
        } else {
          this._native = null;
          this._originalTarget = null;
        }

        return this;
      },
      // overridden
      clone: function clone(embryo) {
        var clone = qx.event.type.Drag.superclass.prototype.clone.call(this, embryo);
        clone._native = this._native;
        return clone;
      },

      /**
       * Get the horizontal position at which the event occurred relative to the
       * left of the document. This property takes into account any scrolling of
       * the page.
       *
       * @return {Integer} The horizontal mouse position in the document.
       */
      getDocumentLeft: function getDocumentLeft() {
        if (this._native == null) {
          return 0;
        }

        var x = this._native.pageX;

        if (x !== undefined) {
          // iOS 6 does not copy pageX over to the fake pointer event
          if (x == 0 && this._native.pointerType == "touch") {
            x = this._native._original.changedTouches[0].pageX || 0;
          }

          return Math.round(x);
        } else {
          var win = qx.dom.Node.getWindow(this._native.srcElement);
          return Math.round(this._native.clientX) + qx.bom.Viewport.getScrollLeft(win);
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
        if (this._native == null) {
          return 0;
        }

        var y = this._native.pageY;

        if (y !== undefined) {
          // iOS 6 does not copy pageY over to the fake pointer event
          if (y == 0 && this._native.pointerType == "touch") {
            y = this._native._original.changedTouches[0].pageY || 0;
          }

          return Math.round(y);
        } else {
          var win = qx.dom.Node.getWindow(this._native.srcElement);
          return Math.round(this._native.clientY) + qx.bom.Viewport.getScrollTop(win);
        }
      },

      /**
       * Returns the drag&drop event handler responsible for the target
       *
       * @return {qx.event.handler.DragDrop} The drag&drop handler
       */
      getManager: function getManager() {
        return qx.event.Registration.getManager(this.getTarget()).getHandler(qx.event.handler.DragDrop);
      },

      /**
       * Used during <code>dragstart</code> listener to
       * inform the manager about supported data types.
       *
       * @param type {String} Data type to add to list of supported types
       */
      addType: function addType(type) {
        this.getManager().addType(type);
      },

      /**
       * Used during <code>dragstart</code> listener to
       * inform the manager about supported drop actions.
       *
       * @param action {String} Action to add to the list of supported actions
       */
      addAction: function addAction(action) {
        this.getManager().addAction(action);
      },

      /**
       * Whether the given type is supported by the drag
       * target (source target).
       *
       * This is used in the event listeners for <code>dragover</code>
       * or <code>dragdrop</code>.
       *
       * @param type {String} The type to look for
       * @return {Boolean} Whether the given type is supported
       */
      supportsType: function supportsType(type) {
        return this.getManager().supportsType(type);
      },

      /**
       * Whether the given action is supported by the drag
       * target (source target).
       *
       * This is used in the event listeners for <code>dragover</code>
       * or <code>dragdrop</code>.
       *
       * @param action {String} The action to look for
       * @return {Boolean} Whether the given action is supported
       */
      supportsAction: function supportsAction(action) {
        return this.getManager().supportsAction(action);
      },

      /**
       * Adds data of the given type to the internal storage. The data
       * is available until the <code>dragend</code> event is fired.
       *
       * @param type {String} Any valid type
       * @param data {var} Any data to store
       */
      addData: function addData(type, data) {
        this.getManager().addData(type, data);
      },

      /**
       * Returns the data of the given type. Used in the <code>drop</code> listener.
       *
       * Note that this is a synchronous method and if any of the drag and drop
       * events handlers are implemented using Promises, this may fail; @see
       * `getDataAsync`.
       *
       * @param type {String} Any of the supported types.
       * @return {var} The data for the given type
       */
      getData: function getData(type) {
        return this.getManager().getData(type);
      },

      /**
       * Returns the data of the given type. Used in the <code>drop</code> listener.
       *
       * @param type {String} Any of the supported types.
       * @return {qx.Promise|var} The data for the given type
       */
      getDataAsync: function getDataAsync(type) {
        return this.getManager().getDataAsync(type);
      },

      /**
       * Returns the type which was requested last, to be used
       * in the <code>droprequest</code> listener.
       *
       * @return {String} The last requested data type
       */
      getCurrentType: function getCurrentType() {
        return this.getManager().getCurrentType();
      },

      /**
       * Returns the currently selected action. Depends on the
       * supported actions of the source target and the modification
       * keys pressed by the user.
       *
       * Used in the <code>droprequest</code> listener.
       *
       * @return {String} The action. May be one of <code>move</code>,
       *    <code>copy</code> or <code>alias</code>.
       */
      getCurrentAction: function getCurrentAction() {
        if (this.getDefaultPrevented()) {
          return null;
        }

        return this.getManager().getCurrentAction();
      },

      /**
       * Returns the currently selected action. Depends on the
       * supported actions of the source target and the modification
       * keys pressed by the user.
       *
       * Used in the <code>droprequest</code> listener.
       *
       * @return {qx.Promise|String} The action. May be one of <code>move</code>,
       *    <code>copy</code> or <code>alias</code>.
       */
      getCurrentActionAsync: function getCurrentActionAsync() {
        if (this.getDefaultPrevented()) {
          return null;
        }

        return this.getManager().getCurrentActionAsync();
      },

      /**
       * Whether the current drop target allows the current drag target.
       *
       * This can be called from within the "drag" event to enable/disable
       * a drop target selectively, for example based on the child item,
       * above and beyond the one-time choice made by the the "dragover"
       * event for the droppable widget itself.
       *
       * @param isAllowed {Boolean} False if a drop should be disallowed
       */
      setDropAllowed: function setDropAllowed(isAllowed) {
        this.getManager().setDropAllowed(isAllowed);
      },

      /**
       * Returns the target which has been initially tapped on.
       * @return {qx.ui.core.Widget} The tapped widget.
       */
      getDragTarget: function getDragTarget() {
        return this.getManager().getDragTarget();
      },

      /**
       * Stops the drag&drop session and fires a <code>dragend</code> event.
       */
      stopSession: function stopSession() {
        this.getManager().clearSession();
      }
    }
  });
  qx.event.type.Drag.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.theme.manager.Decoration": {}
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
   * Common set of utility methods used by the standard qooxdoo layouts.
   *
   * @internal
   */
  qx.Class.define("qx.ui.layout.Util", {
    statics: {
      /** @type {RegExp} Regular expression to match percent values */
      PERCENT_VALUE: /[0-9]+(?:\.[0-9]+)?%/,

      /**
       * Computes the flex offsets needed to reduce the space
       * difference as much as possible by respecting the
       * potential of the given elements (being in the range of
       * their min/max values)
       *
       * @param flexibles {Map} Each entry must have these keys:
       *   <code>id</code>, <code>potential</code> and <code>flex</code>.
       *   The ID is used in the result map as the key for the user to work
       *   with later (e.g. upgrade sizes etc. to respect the given offset)
       *   The potential is an integer value which is the difference of the
       *   currently interesting direction (e.g. shrinking=width-minWidth, growing=
       *   maxWidth-width). The flex key holds the flex value of the item.
       * @param avail {Integer} Full available space to allocate (ignoring used one)
       * @param used {Integer} Size of already allocated space
       * @return {Map} A map which contains the calculated offsets under the key
       *   which is identical to the ID given in the incoming map.
       */
      computeFlexOffsets: function computeFlexOffsets(flexibles, avail, used) {
        var child, key, flexSum, flexStep;
        var grow = avail > used;
        var remaining = Math.abs(avail - used);
        var roundingOffset, currentOffset; // Preprocess data

        var result = {};

        for (key in flexibles) {
          child = flexibles[key];
          result[key] = {
            potential: grow ? child.max - child.value : child.value - child.min,
            flex: grow ? child.flex : 1 / child.flex,
            offset: 0
          };
        } // Continue as long as we need to do anything


        while (remaining != 0) {
          // Find minimum potential for next correction
          flexStep = Infinity;
          flexSum = 0;

          for (key in result) {
            child = result[key];

            if (child.potential > 0) {
              flexSum += child.flex;
              flexStep = Math.min(flexStep, child.potential / child.flex);
            }
          } // No potential found, quit here


          if (flexSum == 0) {
            break;
          } // Respect maximum potential given through remaining space
          // The parent should always win in such conflicts.


          flexStep = Math.min(remaining, flexStep * flexSum) / flexSum; // Start with correction

          roundingOffset = 0;

          for (key in result) {
            child = result[key];

            if (child.potential > 0) {
              // Compute offset for this step
              currentOffset = Math.min(remaining, child.potential, Math.ceil(flexStep * child.flex)); // Fix rounding issues

              roundingOffset += currentOffset - flexStep * child.flex;

              if (roundingOffset >= 1) {
                roundingOffset -= 1;
                currentOffset -= 1;
              } // Update child status


              child.potential -= currentOffset;

              if (grow) {
                child.offset += currentOffset;
              } else {
                child.offset -= currentOffset;
              } // Update parent status


              remaining -= currentOffset;
            }
          }
        }

        return result;
      },

      /**
       * Computes the offset which needs to be added to the top position
       * to result in the stated vertical alignment. Also respects
       * existing margins (without collapsing).
       *
       * @param align {String} One of <code>top</code>, <code>center</code> or <code>bottom</code>.
       * @param width {Integer} The visible width of the widget
       * @param availWidth {Integer} The available inner width of the parent
       * @param marginLeft {Integer?0} Optional left margin of the widget
       * @param marginRight {Integer?0} Optional right margin of the widget
       * @return {Integer} Computed top coordinate
       */
      computeHorizontalAlignOffset: function computeHorizontalAlignOffset(align, width, availWidth, marginLeft, marginRight) {
        if (marginLeft == null) {
          marginLeft = 0;
        }

        if (marginRight == null) {
          marginRight = 0;
        }

        var value = 0;

        switch (align) {
          case "left":
            value = marginLeft;
            break;

          case "right":
            // Align right changes priority to right edge:
            // To align to the right is more important here than to left.
            value = availWidth - width - marginRight;
            break;

          case "center":
            // Ideal center position
            value = Math.round((availWidth - width) / 2); // Try to make this possible (with left-right priority)

            if (value < marginLeft) {
              value = marginLeft;
            } else if (value < marginRight) {
              value = Math.max(marginLeft, availWidth - width - marginRight);
            }

            break;
        }

        return value;
      },

      /**
       * Computes the offset which needs to be added to the top position
       * to result in the stated vertical alignment. Also respects
       * existing margins (without collapsing).
       *
       * @param align {String} One of <code>top</code>, <code>middle</code> or <code>bottom</code>.
       * @param height {Integer} The visible height of the widget
       * @param availHeight {Integer} The available inner height of the parent
       * @param marginTop {Integer?0} Optional top margin of the widget
       * @param marginBottom {Integer?0} Optional bottom margin of the widget
       * @return {Integer} Computed top coordinate
       */
      computeVerticalAlignOffset: function computeVerticalAlignOffset(align, height, availHeight, marginTop, marginBottom) {
        if (marginTop == null) {
          marginTop = 0;
        }

        if (marginBottom == null) {
          marginBottom = 0;
        }

        var value = 0;

        switch (align) {
          case "top":
            value = marginTop;
            break;

          case "bottom":
            // Align bottom changes priority to bottom edge:
            // To align to the bottom is more important here than to top.
            value = availHeight - height - marginBottom;
            break;

          case "middle":
            // Ideal middle position
            value = Math.round((availHeight - height) / 2); // Try to make this possible (with top-down priority)

            if (value < marginTop) {
              value = marginTop;
            } else if (value < marginBottom) {
              value = Math.max(marginTop, availHeight - height - marginBottom);
            }

            break;
        }

        return value;
      },

      /**
       * Collapses two margins.
       *
       * Supports positive and negative margins.
       * Collapsing find the largest positive and the largest
       * negative value. Afterwards the result is computed through the
       * subtraction of the negative from the positive value.
       *
       * @param varargs {arguments} Any number of configured margins
       * @return {Integer} The collapsed margin
       */
      collapseMargins: function collapseMargins(varargs) {
        var max = 0,
            min = 0;

        for (var i = 0, l = arguments.length; i < l; i++) {
          var value = arguments[i];

          if (value < 0) {
            min = Math.min(min, value);
          } else if (value > 0) {
            max = Math.max(max, value);
          }
        }

        return max + min;
      },

      /**
       * Computes the sum of all horizontal gaps. Normally the
       * result is used to compute the available width in a widget.
       *
       * The method optionally respects margin collapsing as well. In
       * this mode the spacing is collapsed together with the margins.
       *
       * @param children {Array} List of children
       * @param spacing {Integer?0} Spacing between every child
       * @param collapse {Boolean?false} Optional margin collapsing mode
       * @return {Integer} Sum of all gaps in the final layout.
       */
      computeHorizontalGaps: function computeHorizontalGaps(children, spacing, collapse) {
        if (spacing == null) {
          spacing = 0;
        }

        var gaps = 0;

        if (collapse) {
          // Add first child
          gaps += children[0].getMarginLeft();

          for (var i = 1, l = children.length; i < l; i += 1) {
            gaps += this.collapseMargins(spacing, children[i - 1].getMarginRight(), children[i].getMarginLeft());
          } // Add last child


          gaps += children[l - 1].getMarginRight();
        } else {
          // Simple adding of all margins
          for (var i = 1, l = children.length; i < l; i += 1) {
            gaps += children[i].getMarginLeft() + children[i].getMarginRight();
          } // Add spacing


          gaps += spacing * (l - 1);
        }

        return gaps;
      },

      /**
       * Computes the sum of all vertical gaps. Normally the
       * result is used to compute the available height in a widget.
       *
       * The method optionally respects margin collapsing as well. In
       * this mode the spacing is collapsed together with the margins.
       *
       * @param children {Array} List of children
       * @param spacing {Integer?0} Spacing between every child
       * @param collapse {Boolean?false} Optional margin collapsing mode
       * @return {Integer} Sum of all gaps in the final layout.
       */
      computeVerticalGaps: function computeVerticalGaps(children, spacing, collapse) {
        if (spacing == null) {
          spacing = 0;
        }

        var gaps = 0;

        if (collapse) {
          // Add first child
          gaps += children[0].getMarginTop();

          for (var i = 1, l = children.length; i < l; i += 1) {
            gaps += this.collapseMargins(spacing, children[i - 1].getMarginBottom(), children[i].getMarginTop());
          } // Add last child


          gaps += children[l - 1].getMarginBottom();
        } else {
          // Simple adding of all margins
          for (var i = 1, l = children.length; i < l; i += 1) {
            gaps += children[i].getMarginTop() + children[i].getMarginBottom();
          } // Add spacing


          gaps += spacing * (l - 1);
        }

        return gaps;
      },

      /**
       * Computes the gaps together with the configuration of separators.
       *
       * @param children {qx.ui.core.LayoutItem[]} List of children
       * @param spacing {Integer} Configured spacing
       * @param separator {String|qx.ui.decoration.IDecorator} Separator to render
       * @return {Integer} Sum of gaps
       */
      computeHorizontalSeparatorGaps: function computeHorizontalSeparatorGaps(children, spacing, separator) {
        var instance = qx.theme.manager.Decoration.getInstance().resolve(separator);
        var insets = instance.getInsets();
        var width = insets.left + insets.right;
        var gaps = 0;

        for (var i = 0, l = children.length; i < l; i++) {
          var child = children[i];
          gaps += child.getMarginLeft() + child.getMarginRight();
        }

        gaps += (spacing + width + spacing) * (l - 1);
        return gaps;
      },

      /**
       * Computes the gaps together with the configuration of separators.
       *
       * @param children {qx.ui.core.LayoutItem[]} List of children
       * @param spacing {Integer} Configured spacing
       * @param separator {String|qx.ui.decoration.IDecorator} Separator to render
       * @return {Integer} Sum of gaps
       */
      computeVerticalSeparatorGaps: function computeVerticalSeparatorGaps(children, spacing, separator) {
        var instance = qx.theme.manager.Decoration.getInstance().resolve(separator);
        var insets = instance.getInsets();
        var height = insets.top + insets.bottom;
        var gaps = 0;

        for (var i = 0, l = children.length; i < l; i++) {
          var child = children[i];
          gaps += child.getMarginTop() + child.getMarginBottom();
        }

        gaps += (spacing + height + spacing) * (l - 1);
        return gaps;
      },

      /**
       * Arranges two sizes in one box to best respect their individual limitations.
       *
       * Mainly used by split layouts (Split Panes) where the layout is mainly defined
       * by the outer dimensions.
       *
       * @param beginMin {Integer} Minimum size of first widget (from size hint)
       * @param beginIdeal {Integer} Ideal size of first widget (maybe after dragging the splitter)
       * @param beginMax {Integer} Maximum size of first widget (from size hint)
       * @param endMin {Integer} Minimum size of second widget (from size hint)
       * @param endIdeal {Integer} Ideal size of second widget (maybe after dragging the splitter)
       * @param endMax {Integer} Maximum size of second widget (from size hint)
       * @return {Map} Map with the keys <code>begin</code and <code>end</code> with the
       *   arranged dimensions.
       */
      arrangeIdeals: function arrangeIdeals(beginMin, beginIdeal, beginMax, endMin, endIdeal, endMax) {
        if (beginIdeal < beginMin || endIdeal < endMin) {
          if (beginIdeal < beginMin && endIdeal < endMin) {
            // Just increase both, can not rearrange them otherwise
            // Result into overflowing of the overlapping content
            // Should normally not happen through auto sizing!
            beginIdeal = beginMin;
            endIdeal = endMin;
          } else if (beginIdeal < beginMin) {
            // Reduce end, increase begin to min
            endIdeal -= beginMin - beginIdeal;
            beginIdeal = beginMin; // Re-check to keep min size of end

            if (endIdeal < endMin) {
              endIdeal = endMin;
            }
          } else if (endIdeal < endMin) {
            // Reduce begin, increase end to min
            beginIdeal -= endMin - endIdeal;
            endIdeal = endMin; // Re-check to keep min size of begin

            if (beginIdeal < beginMin) {
              beginIdeal = beginMin;
            }
          }
        }

        if (beginIdeal > beginMax || endIdeal > endMax) {
          if (beginIdeal > beginMax && endIdeal > endMax) {
            // Just reduce both, can not rearrange them otherwise
            // Leaves a blank area in the pane!
            beginIdeal = beginMax;
            endIdeal = endMax;
          } else if (beginIdeal > beginMax) {
            // Increase end, reduce begin to max
            endIdeal += beginIdeal - beginMax;
            beginIdeal = beginMax; // Re-check to keep max size of end

            if (endIdeal > endMax) {
              endIdeal = endMax;
            }
          } else if (endIdeal > endMax) {
            // Increase begin, reduce end to max
            beginIdeal += endIdeal - endMax;
            endIdeal = endMax; // Re-check to keep max size of begin

            if (beginIdeal > beginMax) {
              beginIdeal = beginMax;
            }
          }
        }

        return {
          begin: beginIdeal,
          end: endIdeal
        };
      }
    }
  });
  qx.ui.layout.Util.$$dbClassInfo = $$dbClassInfo;
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
        "construct": true,
        "require": true
      },
      "qx.ui.layout.Util": {},
      "qx.theme.manager.Decoration": {}
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
   * Docks children to one of the edges.
   *
   * *Features*
   *
   * * Percent width for left/right/center attached children
   * * Percent height for top/bottom/center attached children
   * * Minimum and maximum dimensions
   * * Prioritized growing/shrinking (flex)
   * * Auto sizing
   * * Margins and Spacings
   * * Alignment in orthogonal axis (e.g. alignX of north attached)
   * * Different sort options for children
   *
   * *Item Properties*
   *
   * <ul>
   * <li><strong>edge</strong> <em>(String)</em>: The edge where the layout item
   *   should be docked. This may be one of <code>north</code>, <code>east</code>,
   *   <code>south</code>, <code>west</code> or <code>center</code>. (Required)</li>
   * <li><strong>width</strong> <em>(String)</em>: Defines a percent
   *   width for the item. The percent width,
   *   when specified, is used instead of the width defined by the size hint.
   *   This is only supported for children added to the north or south edge or
   *   are centered in the middle of the layout.
   *   The minimum and maximum width still takes care of the elements limitations.
   *   It has no influence on the layout's size hint. Percents are mainly useful for
   *   widgets which are sized by the outer hierarchy.
   * </li>
   * <li><strong>height</strong> <em>(String)</em>: Defines a percent
   *   height for the item. The percent height,
   *   when specified, is used instead of the height defined by the size hint.
   *   This is only supported for children added to the west or east edge or
   *   are centered in the middle of the layout.
   *   The minimum and maximum height still takes care of the elements limitations.
   *   It has no influence on the layout's size hint. Percents are mainly useful for
   *   widgets which are sized by the outer hierarchy.
   * </li>
   * </ul>
   *
   * *Example*
   *
   * <pre class="javascript">
   * var layout = new qx.ui.layout.Dock();
   *
   * var w1 = new qx.ui.core.Widget();
   * var w2 = new qx.ui.core.Widget();
   * var w3 = new qx.ui.core.Widget();
   *
   * w1.setHeight(200);
   * w2.setWidth(150);
   *
   * var container = new qx.ui.container.Composite(layout);
   * container.add(w1, {edge:"north"});
   * container.add(w2, {edge:"west"});
   * container.add(w3, {edge:"center"});
   * </pre>
   *
   * *Detailed Description*
   *
   * Using this layout, items may be "docked" to a specific side
   * of the available space. Each displayed item reduces the available space
   * for the following children. Priorities depend on the position of
   * the child in the internal children list.
   *
   * *External Documentation*
   *
   * <a href='https://qooxdoo.org/documentation/#/desktop/layout/dock.md'>
   * Extended documentation</a> and links to demos of this layout in the qooxdoo manual.
   */
  qx.Class.define("qx.ui.layout.Dock", {
    extend: qx.ui.layout.Abstract,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param spacingX {Integer?0} The horizontal spacing. Sets {@link #spacingX}.
     * @param spacingY {Integer?0} The vertical spacing. Sets {@link #spacingY}.
     * @param separatorX {String|qx.ui.decoration.IDecorator} Separator to render between columns
     * @param separatorY {String|qx.ui.decoration.IDecorator} Separator to render between rows
     */
    construct: function construct(spacingX, spacingY, separatorX, separatorY) {
      qx.ui.layout.Abstract.constructor.call(this);

      if (spacingX) {
        this.setSpacingX(spacingX);
      }

      if (spacingY) {
        this.setSpacingY(spacingY);
      }

      if (separatorX) {
        this.setSeparatorX(separatorX);
      }

      if (separatorY) {
        this.setSeparatorY(separatorY);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The way the widgets should be displayed (in conjunction with their
       * position in the childrens array).
       */
      sort: {
        check: ["auto", "y", "x"],
        init: "auto",
        apply: "_applySort"
      },

      /** Separator lines to use between the horizontal objects */
      separatorX: {
        check: "Decorator",
        nullable: true,
        apply: "_applyLayoutChange"
      },

      /** Separator lines to use between the vertical objects */
      separatorY: {
        check: "Decorator",
        nullable: true,
        apply: "_applyLayoutChange"
      },

      /**
       * Whether separators should be collapsed so when a spacing is
       * configured the line go over into each other
       */
      connectSeparators: {
        check: "Boolean",
        init: false,
        apply: "_applyLayoutChange"
      },

      /** Horizontal spacing between two children */
      spacingX: {
        check: "Integer",
        init: 0,
        apply: "_applyLayoutChange"
      },

      /** Vertical spacing between two children */
      spacingY: {
        check: "Integer",
        init: 0,
        apply: "_applyLayoutChange"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __children__P_26_0: null,
      __edges__P_26_1: null,
      // overridden
      verifyLayoutProperty: qx.core.Environment.select("qx.debug", {
        "true": function _true(item, name, value) {
          this.assertInArray(name, ["flex", "edge", "height", "width"], "The property '" + name + "' is not supported by the Dock layout!");

          if (name === "edge") {
            this.assertInArray(value, ["north", "south", "west", "east", "center"]);
          } else if (name === "flex") {
            this.assertNumber(value);
            this.assert(value >= 0);
          } else {
            this.assertMatch(value, qx.ui.layout.Util.PERCENT_VALUE);
          }
        },
        "false": null
      }),
      // property apply
      _applySort: function _applySort() {
        // easiest way is to invalidate the cache
        this._invalidChildrenCache = true; // call normal layout change

        this._applyLayoutChange();
      },

      /**
       * @type {Map} Maps edge IDs to numeric values
       *
       * @lint ignoreReferenceField(__edgeMap)
       */
      __edgeMap__P_26_2: {
        north: 1,
        south: 2,
        west: 3,
        east: 4,
        center: 5
      },

      /**
       * @type {Map} Maps edges to align values
       *
       * @lint ignoreReferenceField(__alignMap)
       */
      __alignMap__P_26_3: {
        1: "top",
        2: "bottom",
        3: "left",
        4: "right"
      },

      /**
       * Rebuilds cache for sorted children list.
       *
       */
      __rebuildCache__P_26_4: function __rebuildCache__P_26_4() {
        var all = this._getLayoutChildren();

        var child, center;
        var length = all.length;
        var high = [];
        var low = [];
        var edge = [];
        var yfirst = this.getSort() === "y";
        var xfirst = this.getSort() === "x";

        for (var i = 0; i < length; i++) {
          child = all[i];
          edge = child.getLayoutProperties().edge;

          if (edge === "center") {
            if (center) {
              throw new Error("It is not allowed to have more than one child aligned to 'center'!");
            }

            center = child;
          } else if (xfirst || yfirst) {
            if (edge === "north" || edge === "south") {
              yfirst ? high.push(child) : low.push(child);
            } else if (edge === "west" || edge === "east") {
              yfirst ? low.push(child) : high.push(child);
            }
          } else {
            high.push(child);
          }
        } // Combine sorted children list


        var result = high.concat(low);

        if (center) {
          result.push(center);
        }

        this.__children__P_26_0 = result; // Cache edges for faster access

        var edges = [];

        for (var i = 0; i < length; i++) {
          edge = result[i].getLayoutProperties().edge;
          edges[i] = this.__edgeMap__P_26_2[edge] || 5;
        }

        this.__edges__P_26_1 = edges; // Clear invalidation marker

        delete this._invalidChildrenCache;
      },

      /*
      ---------------------------------------------------------------------------
        LAYOUT INTERFACE
      ---------------------------------------------------------------------------
      */
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        // Rebuild flex/width caches
        if (this._invalidChildrenCache) {
          this.__rebuildCache__P_26_4();
        }

        var util = qx.ui.layout.Util;
        var children = this.__children__P_26_0;
        var edges = this.__edges__P_26_1;
        var length = children.length;
        var flexibles, child, hint, props, flex, grow, width, height, offset;
        var widths = [];
        var heights = [];

        var separatorWidths = this._getSeparatorWidths();

        var spacingX = this.getSpacingX();
        var spacingY = this.getSpacingY(); // **************************************
        //   Caching children data
        // **************************************

        var allocatedWidth = -spacingX;
        var allocatedHeight = -spacingY;

        if (separatorWidths.x) {
          allocatedWidth -= separatorWidths.x + spacingX;
        }

        if (separatorWidths.y) {
          allocatedHeight -= separatorWidths.y + spacingY;
        }

        for (var i = 0; i < length; i++) {
          child = children[i];
          props = child.getLayoutProperties();
          hint = child.getSizeHint();
          width = hint.width;
          height = hint.height;

          if (props.width != null) {
            width = Math.floor(availWidth * parseFloat(props.width) / 100);

            if (width < hint.minWidth) {
              width = hint.minWidth;
            } else if (width > hint.maxWidth) {
              width = hint.maxWidth;
            }
          }

          if (props.height != null) {
            height = Math.floor(availHeight * parseFloat(props.height) / 100);

            if (height < hint.minHeight) {
              height = hint.minHeight;
            } else if (height > hint.maxHeight) {
              height = hint.maxHeight;
            }
          }

          widths[i] = width;
          heights[i] = height; // Update allocated width

          switch (edges[i]) {
            // north+south
            case 1:
            case 2:
              allocatedHeight += height + child.getMarginTop() + child.getMarginBottom() + spacingY;

              if (separatorWidths.y) {
                allocatedHeight += separatorWidths.y + spacingY;
              }

              break;
            // west+east

            case 3:
            case 4:
              allocatedWidth += width + child.getMarginLeft() + child.getMarginRight() + spacingX;

              if (separatorWidths.x) {
                allocatedWidth += separatorWidths.x + spacingX;
              }

              break;
            // center

            default:
              allocatedWidth += width + child.getMarginLeft() + child.getMarginRight() + spacingX;
              allocatedHeight += height + child.getMarginTop() + child.getMarginBottom() + spacingY;

              if (separatorWidths.x) {
                allocatedWidth += separatorWidths.x + spacingX;
              }

              if (separatorWidths.y) {
                allocatedHeight += separatorWidths.y + spacingY;
              }

          }
        } // **************************************
        //   Horizontal flex support
        // **************************************


        if (allocatedWidth != availWidth) {
          flexibles = {};
          grow = allocatedWidth < availWidth;

          for (var i = 0; i < length; i++) {
            child = children[i];

            switch (edges[i]) {
              case 3:
              case 4:
              case 5:
                flex = child.getLayoutProperties().flex; // Default flex for centered children is '1'

                if (flex == null && edges[i] == 5) {
                  flex = 1;
                }

                if (flex > 0) {
                  hint = child.getSizeHint();
                  flexibles[i] = {
                    min: hint.minWidth,
                    value: widths[i],
                    max: hint.maxWidth,
                    flex: flex
                  };
                }

            }
          }

          var result = util.computeFlexOffsets(flexibles, availWidth, allocatedWidth);

          for (var i in result) {
            offset = result[i].offset;
            widths[i] += offset;
            allocatedWidth += offset;
          }
        } // **************************************
        //   Vertical flex support
        // **************************************
        // Process height for flex stretching/shrinking


        if (allocatedHeight != availHeight) {
          flexibles = {};
          grow = allocatedHeight < availHeight;

          for (var i = 0; i < length; i++) {
            child = children[i];

            switch (edges[i]) {
              case 1:
              case 2:
              case 5:
                flex = child.getLayoutProperties().flex; // Default flex for centered children is '1'

                if (flex == null && edges[i] == 5) {
                  flex = 1;
                }

                if (flex > 0) {
                  hint = child.getSizeHint();
                  flexibles[i] = {
                    min: hint.minHeight,
                    value: heights[i],
                    max: hint.maxHeight,
                    flex: flex
                  };
                }

            }
          }

          var result = util.computeFlexOffsets(flexibles, availHeight, allocatedHeight);

          for (var i in result) {
            offset = result[i].offset;
            heights[i] += offset;
            allocatedHeight += offset;
          }
        } // **************************************
        //   Layout children
        // **************************************
        // Pre configure separators


        this._clearSeparators(); // Prepare loop


        var separatorX = this.getSeparatorX(),
            separatorY = this.getSeparatorY();
        var connectSeparators = this.getConnectSeparators();
        var nextTop = 0,
            nextLeft = 0;
        var left, top, width, height, used, edge;
        var separatorLeft, separatorTop, separatorWidth, separatorHeight;
        var marginTop, marginBottom, marginLeft, marginRight;
        var alignMap = this.__alignMap__P_26_3;

        for (var i = 0; i < length; i++) {
          // Cache child data
          child = children[i];
          edge = edges[i];
          hint = child.getSizeHint(); // Cache child margins

          marginTop = child.getMarginTop();
          marginBottom = child.getMarginBottom();
          marginLeft = child.getMarginLeft();
          marginRight = child.getMarginRight(); // Calculate child layout

          switch (edge) {
            // north + south
            case 1:
            case 2:
              // Full available width
              width = availWidth - marginLeft - marginRight; // Limit width to min/max

              if (width < hint.minWidth) {
                width = hint.minWidth;
              } else if (width > hint.maxWidth) {
                width = hint.maxWidth;
              } // Child preferred height


              height = heights[i]; // Compute position

              top = nextTop + util.computeVerticalAlignOffset(alignMap[edge], height, availHeight, marginTop, marginBottom);
              left = nextLeft + util.computeHorizontalAlignOffset(child.getAlignX() || "left", width, availWidth, marginLeft, marginRight); // Render the separator

              if (separatorWidths.y) {
                if (edge == 1) {
                  separatorTop = nextTop + height + marginTop + spacingY + marginBottom;
                } else {
                  separatorTop = nextTop + availHeight - height - marginTop - spacingY - marginBottom - separatorWidths.y;
                }

                separatorLeft = left;
                separatorWidth = availWidth;

                if (connectSeparators && separatorLeft > 0) {
                  separatorLeft -= spacingX + marginLeft;
                  separatorWidth += spacingX * 2;
                } else {
                  separatorLeft -= marginLeft;
                }

                this._renderSeparator(separatorY, {
                  left: separatorLeft + padding.left,
                  top: separatorTop + padding.top,
                  width: separatorWidth,
                  height: separatorWidths.y
                });
              } // Update available height


              used = height + marginTop + marginBottom + spacingY;

              if (separatorWidths.y) {
                used += separatorWidths.y + spacingY;
              }

              availHeight -= used; // Update coordinates, for next child

              if (edge == 1) {
                nextTop += used;
              }

              break;
            // west + east

            case 3:
            case 4:
              // Full available height
              height = availHeight - marginTop - marginBottom; // Limit height to min/max

              if (height < hint.minHeight) {
                height = hint.minHeight;
              } else if (height > hint.maxHeight) {
                height = hint.maxHeight;
              } // Child preferred width


              width = widths[i]; // Compute position

              left = nextLeft + util.computeHorizontalAlignOffset(alignMap[edge], width, availWidth, marginLeft, marginRight);
              top = nextTop + util.computeVerticalAlignOffset(child.getAlignY() || "top", height, availHeight, marginTop, marginBottom); // Render the separator

              if (separatorWidths.x) {
                if (edge == 3) {
                  separatorLeft = nextLeft + width + marginLeft + spacingX + marginRight;
                } else {
                  separatorLeft = nextLeft + availWidth - width - marginLeft - spacingX - marginRight - separatorWidths.x;
                }

                separatorTop = top;
                separatorHeight = availHeight;

                if (connectSeparators && separatorTop > 0) {
                  separatorTop -= spacingY + marginTop;
                  separatorHeight += spacingY * 2;
                } else {
                  separatorTop -= marginTop;
                }

                this._renderSeparator(separatorX, {
                  left: separatorLeft + padding.left,
                  top: separatorTop + padding.top,
                  width: separatorWidths.x,
                  height: separatorHeight
                });
              } // Update available height


              used = width + marginLeft + marginRight + spacingX;

              if (separatorWidths.x) {
                used += separatorWidths.x + spacingX;
              }

              availWidth -= used; // Update coordinates, for next child

              if (edge == 3) {
                nextLeft += used;
              }

              break;
            // center

            default:
              // Calculated width/height
              width = availWidth - marginLeft - marginRight;
              height = availHeight - marginTop - marginBottom; // Limit width to min/max

              if (width < hint.minWidth) {
                width = hint.minWidth;
              } else if (width > hint.maxWidth) {
                width = hint.maxWidth;
              } // Limit height to min/max


              if (height < hint.minHeight) {
                height = hint.minHeight;
              } else if (height > hint.maxHeight) {
                height = hint.maxHeight;
              } // Compute coordinates (respect margins and alignments for both axis)


              left = nextLeft + util.computeHorizontalAlignOffset(child.getAlignX() || "left", width, availWidth, marginLeft, marginRight);
              top = nextTop + util.computeVerticalAlignOffset(child.getAlignY() || "top", height, availHeight, marginTop, marginBottom);
          } // Apply layout


          child.renderLayout(left + padding.left, top + padding.top, width, height);
        }
      },

      /**
       * Computes the dimensions each separator on both the <code>x</code> and
       * <code>y</code> axis needs.
       *
       * @return {Map} Map with the keys <code>x</code> and
       *   <code>y</code>
       */
      _getSeparatorWidths: function _getSeparatorWidths() {
        var separatorX = this.getSeparatorX(),
            separatorY = this.getSeparatorY();

        if (separatorX || separatorY) {
          var decorationManager = qx.theme.manager.Decoration.getInstance();
        }

        if (separatorX) {
          var separatorInstanceX = decorationManager.resolve(separatorX);
          var separatorInsetsX = separatorInstanceX.getInsets();
          var separatorWidthX = separatorInsetsX.left + separatorInsetsX.right;
        }

        if (separatorY) {
          var separatorInstanceY = decorationManager.resolve(separatorY);
          var separatorInsetsY = separatorInstanceY.getInsets();
          var separatorWidthY = separatorInsetsY.top + separatorInsetsY.bottom;
        }

        return {
          x: separatorWidthX || 0,
          y: separatorWidthY || 0
        };
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        // Rebuild flex/width caches
        if (this._invalidChildrenCache) {
          this.__rebuildCache__P_26_4();
        }

        var children = this.__children__P_26_0;
        var edges = this.__edges__P_26_1;
        var length = children.length;
        var hint, child;
        var marginX, marginY;
        var widthX = 0,
            minWidthX = 0;
        var heightX = 0,
            minHeightX = 0;
        var widthY = 0,
            minWidthY = 0;
        var heightY = 0,
            minHeightY = 0;

        var separatorWidths = this._getSeparatorWidths();

        var spacingX = this.getSpacingX(),
            spacingY = this.getSpacingY();
        var spacingSumX = -spacingX,
            spacingSumY = -spacingY;

        if (separatorWidths.x) {
          spacingSumX -= separatorWidths.x + spacingX;
        }

        if (separatorWidths.y) {
          spacingSumY -= separatorWidths.y + spacingY;
        } // Detect children sizes


        for (var i = 0; i < length; i++) {
          child = children[i];
          hint = child.getSizeHint(); // Pre-cache margin sums

          marginX = child.getMarginLeft() + child.getMarginRight();
          marginY = child.getMarginTop() + child.getMarginBottom(); // Ok, this part is a bit complicated :)

          switch (edges[i]) {
            case 1:
            case 2:
              // Find the maximum width used by these fully stretched items
              // The recommended width used by these must add the currently
              // occupied width by the orthogonal ordered children.
              widthY = Math.max(widthY, hint.width + widthX + marginX);
              minWidthY = Math.max(minWidthY, hint.minWidth + minWidthX + marginX); // Add the needed heights of this widget

              heightY += hint.height + marginY;
              minHeightY += hint.minHeight + marginY; // Add spacing

              spacingSumY += spacingY;

              if (separatorWidths.y) {
                spacingSumY += separatorWidths.y + spacingY;
              }

              break;

            case 3:
            case 4:
              // Find the maximum height used by these fully stretched items
              // The recommended height used by these must add the currently
              // occupied height by the orthogonal ordered children.
              heightX = Math.max(heightX, hint.height + heightY + marginY);
              minHeightX = Math.max(minHeightX, hint.minHeight + minHeightY + marginY); // Add the needed widths of this widget

              widthX += hint.width + marginX;
              minWidthX += hint.minWidth + marginX; // Add spacing

              spacingSumX += spacingX;

              if (separatorWidths.x) {
                spacingSumX += separatorWidths.x + spacingX;
              }

              break;

            default:
              // A centered widget must be added to both sums as
              // it stretches into the remaining available space.
              widthX += hint.width + marginX;
              minWidthX += hint.minWidth + marginX;
              heightY += hint.height + marginY;
              minHeightY += hint.minHeight + marginY; // Add spacing

              spacingSumX += spacingX;

              if (separatorWidths.x) {
                spacingSumX += separatorWidths.x + spacingX;
              }

              spacingSumY += spacingY;

              if (separatorWidths.y) {
                spacingSumY += separatorWidths.y + spacingY;
              }

          }
        }

        var minWidth = Math.max(minWidthX, minWidthY) + spacingSumX;
        var width = Math.max(widthX, widthY) + spacingSumX;
        var minHeight = Math.max(minHeightX, minHeightY) + spacingSumY;
        var height = Math.max(heightX, heightY) + spacingSumY; // Return hint

        return {
          minWidth: minWidth,
          width: width,
          minHeight: minHeight,
          height: height
        };
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this.__edges__P_26_1 = this.__children__P_26_0 = null;
    }
  });
  qx.ui.layout.Dock.$$dbClassInfo = $$dbClassInfo;
})();
//# sourceMappingURL=package-9.js.map?dt=1673131574201
qx.$$packageData['9'] = {
  "locales": {},
  "resources": {},
  "translations": {}
};
