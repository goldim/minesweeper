(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.String": {}
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
       * Christian Hagendorn (cs)
  
  ************************************************************************ */

  /**
   * Methods to convert colors between different color spaces.
   *
   * @ignore(qx.theme.*)
   * @ignore(qx.Class)
   * @ignore(qx.Class.*)
   */
  qx.Bootstrap.define("qx.util.ColorUtil", {
    statics: {
      /**
       * Regular expressions for color strings
       */
      REGEXP: {
        hexShort: /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])?$/,
        hexLong: /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?$/,
        hex3: /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/,
        hex6: /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/,
        rgb: /^rgb\(\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*\)$/,
        rgba: /^rgba\(\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,2}[0-9]*)\s*\)$/
      },

      /**
       * CSS3 system color names.
       */
      SYSTEM: {
        activeborder: true,
        activecaption: true,
        appworkspace: true,
        background: true,
        buttonface: true,
        buttonhighlight: true,
        buttonshadow: true,
        buttontext: true,
        captiontext: true,
        graytext: true,
        highlight: true,
        highlighttext: true,
        inactiveborder: true,
        inactivecaption: true,
        inactivecaptiontext: true,
        infobackground: true,
        infotext: true,
        menu: true,
        menutext: true,
        scrollbar: true,
        threeddarkshadow: true,
        threedface: true,
        threedhighlight: true,
        threedlightshadow: true,
        threedshadow: true,
        window: true,
        windowframe: true,
        windowtext: true
      },

      /**
       * Named colors, only the 16 basic colors plus the following ones:
       * transparent, grey, magenta, orange and brown
       */
      NAMED: {
        black: [0, 0, 0],
        silver: [192, 192, 192],
        gray: [128, 128, 128],
        white: [255, 255, 255],
        maroon: [128, 0, 0],
        red: [255, 0, 0],
        purple: [128, 0, 128],
        fuchsia: [255, 0, 255],
        green: [0, 128, 0],
        lime: [0, 255, 0],
        olive: [128, 128, 0],
        yellow: [255, 255, 0],
        navy: [0, 0, 128],
        blue: [0, 0, 255],
        teal: [0, 128, 128],
        aqua: [0, 255, 255],
        // Additional values
        transparent: [-1, -1, -1],
        magenta: [255, 0, 255],
        // alias for fuchsia
        orange: [255, 165, 0],
        brown: [165, 42, 42]
      },

      /**
       * Whether the incoming value is a named color.
       *
       * @param value {String} the color value to test
       * @return {Boolean} true if the color is a named color
       */
      isNamedColor: function isNamedColor(value) {
        return this.NAMED[value] !== undefined;
      },

      /**
       * Whether the incoming value is a system color.
       *
       * @param value {String} the color value to test
       * @return {Boolean} true if the color is a system color
       */
      isSystemColor: function isSystemColor(value) {
        return this.SYSTEM[value] !== undefined;
      },

      /**
       * Whether the color theme manager is loaded. Generally
       * part of the GUI of qooxdoo.
       *
       * @return {Boolean} <code>true</code> when color theme support is ready.
       **/
      supportsThemes: function supportsThemes() {
        if (qx.Class) {
          return qx.Class.isDefined("qx.theme.manager.Color");
        }

        return false;
      },

      /**
       * Whether the incoming value is a themed color.
       *
       * @param value {String} the color value to test
       * @return {Boolean} true if the color is a themed color
       */
      isThemedColor: function isThemedColor(value) {
        if (!this.supportsThemes()) {
          return false;
        }

        if (qx.theme && qx.theme.manager && qx.theme.manager.Color) {
          return qx.theme.manager.Color.getInstance().isDynamic(value);
        }

        return false;
      },

      /**
       * Try to convert an incoming string to an RGBA array.
       * Supports themed, named and system colors, but also RGBA strings,
       * hex[3468] values.
       *
       * @param str {String} any string
       * @return {Array} returns an array of red, green, blue and optional alpha on a successful transformation
       * @throws {Error} if the string could not be parsed
       */
      stringToRgb: function stringToRgb(str) {
        if (this.supportsThemes() && this.isThemedColor(str)) {
          str = qx.theme.manager.Color.getInstance().resolveDynamic(str);
        }

        return this.cssStringToRgb(str);
      },

      /**
       * Try to convert an incoming string to an RGB array with optional alpha.
       * Support named colors, RGB strings, RGBA strings, hex[3468] values.
       *
       * @param str {String} any string
       * @return {Array} returns an array of red, green, blue on a successful transformation
       * @throws {Error} if the string could not be parsed
       */
      cssStringToRgb: function cssStringToRgb(str) {
        var color;

        if (this.isNamedColor(str)) {
          color = this.NAMED[str].concat();
        } else if (this.isSystemColor(str)) {
          throw new Error("Could not convert system colors to RGB: " + str);
        } else if (this.isRgbaString(str)) {
          color = this.__rgbaStringToRgb__P_140_0(str);
        } else if (this.isRgbString(str)) {
          color = this.__rgbStringToRgb__P_140_1();
        } else if (this.ishexShortString(str)) {
          color = this.__hexShortStringToRgb__P_140_2();
        } else if (this.ishexLongString(str)) {
          color = this.__hexLongStringToRgb__P_140_3();
        }

        if (color) {
          // don't mention alpha if the color is opaque
          if (color.length === 3 && color[3] == 1) {
            color.pop();
          }

          return color;
        }

        throw new Error("Could not parse color: " + str);
      },

      /**
       * Try to convert an incoming string to an RGB string, which can be used
       * for all color properties.
       * Supports themed, named and system colors, but also RGB strings,
       * hexShort and hexLong values.
       *
       * @param str {String} any string
       * @return {String} a RGB string
       * @throws {Error} if the string could not be parsed
       */
      stringToRgbString: function stringToRgbString(str) {
        return this.rgbToRgbString(this.stringToRgb(str));
      },

      /**
       * Converts a RGB array to an RGB string
       *
       * @param rgb {Array} an array with red, green and blue values and optionally
       * an alpha value
       * @return {String} an RGB string
       */
      rgbToRgbString: function rgbToRgbString(rgb) {
        return "rgb" + (rgb.length === 4 ? "a" : "") + "(" + rgb.map(function (v) {
          return Math.round(v * 1000) / 1000;
        }).join(",") + ")";
      },

      /**
       * Converts a RGB array to a hex[68] string
       *
       * @param rgb {Array} an array with red, green, blue and optional alpha
       * @return {String} a hex[68] string (#xxxxxx)
       */
      rgbToHexString: function rgbToHexString(rgb) {
        return "#" + qx.lang.String.pad(rgb[0].toString(16).toUpperCase(), 2) + qx.lang.String.pad(rgb[1].toString(16).toUpperCase(), 2) + qx.lang.String.pad(rgb[2].toString(16).toUpperCase(), 2) + (rgb.length === 4 && rgb[3] !== 1 ? qx.lang.String.pad(Math.round(rgb[3] * 255).toString(16).toUpperCase(), 2) : "");
      },

      /**
       * Detects if a string is a valid qooxdoo color
       *
       * @param str {String} any string
       * @return {Boolean} true when the incoming value is a valid qooxdoo color
       */
      isValidPropertyValue: function isValidPropertyValue(str) {
        return this.isThemedColor(str) || this.isNamedColor(str) || this.ishexShortString(str) || this.ishexLongString(str) || this.isRgbString(str) || this.isRgbaString(str);
      },

      /**
       * Detects if a string is a valid CSS color string
       *
       * @param str {String} any string
       * @return {Boolean} true when the incoming value is a valid CSS color string
       */
      isCssString: function isCssString(str) {
        return this.isSystemColor(str) || this.isNamedColor(str) || this.ishexShortString(str) || this.ishexLongString(str) || this.isRgbString(str) || this.isRgbaString(str);
      },

      /**
       * Detects if a string is a valid hexShort string
       *
       * @param str {String} any string
       * @return {Boolean} true when the incoming value is a valid hexShort string
       */
      ishexShortString: function ishexShortString(str) {
        return this.REGEXP.hexShort.test(str);
      },

      /**
       * Detects if a string is a valid hex3 string
       *
       * @param str {String} any string
       * @return {Boolean} true when the incoming value is a valid hex3 string
       */
      isHex3String: function isHex3String(str) {
        return this.REGEXP.hex3.test(str);
      },

      /**
       * Detects if a string is a valid hex6 string
       *
       * @param str {String} any string
       * @return {Boolean} true when the incoming value is a valid hex6 string
       */
      isHex6String: function isHex6String(str) {
        return this.REGEXP.hex6.test(str);
      },

      /**
       * Detects if a string is a valid hex6/8 string
       *
       * @param str {String} any string
       * @return {Boolean} true when the incoming value is a valid hex8 string
       */
      ishexLongString: function ishexLongString(str) {
        return this.REGEXP.hexLong.test(str);
      },

      /**
       * Detects if a string is a valid RGB string
       *
       * @param str {String} any string
       * @return {Boolean} true when the incoming value is a valid RGB string
       */
      isRgbString: function isRgbString(str) {
        return this.REGEXP.rgb.test(str);
      },

      /**
       * Detects if a string is a valid RGBA string
       *
       * @param str {String} any string
       * @return {Boolean} true when the incoming value is a valid RGBA string
       */
      isRgbaString: function isRgbaString(str) {
        return this.REGEXP.rgba.test(str);
      },

      /**
       * Converts a regexp object match of a rgb string to an RGBA array.
       *
       * @return {Array} an array with red, green, blue
       */
      __rgbStringToRgb__P_140_1: function __rgbStringToRgb__P_140_1() {
        var red = parseInt(RegExp.$1, 10);
        var green = parseInt(RegExp.$2, 10);
        var blue = parseInt(RegExp.$3, 10);
        return [red, green, blue];
      },

      /**
       * Converts a regexp object match of a rgba string to an RGB array.
       *
       * @return {Array} an array with red, green, blue
       */
      __rgbaStringToRgb__P_140_0: function __rgbaStringToRgb__P_140_0() {
        var red = parseInt(RegExp.$1, 10);
        var green = parseInt(RegExp.$2, 10);
        var blue = parseInt(RegExp.$3, 10);
        var alpha = parseFloat(RegExp.$4, 10);

        if (red === 0 && green === 0 & blue === 0 && alpha === 0) {
          // this is the (pre-alpha) representation of transparency
          // in qooxdoo
          return [-1, -1, -1];
        }

        return alpha == 1 ? [red, green, blue] : [red, green, blue, alpha];
      },

      /**
       * Converts a regexp object match of a hexShort string to an RGB array.
       *
       * @return {Array} an array with red, green, blue
       */
      __hexShortStringToRgb__P_140_2: function __hexShortStringToRgb__P_140_2() {
        var red = parseInt(RegExp.$1, 16) * 17;
        var green = parseInt(RegExp.$2, 16) * 17;
        var blue = parseInt(RegExp.$3, 16) * 17;
        var alpha = Math.round(parseInt(RegExp.$4 || "f", 16) / 15 * 1000) / 1000;
        return alpha == 1 ? [red, green, blue] : [red, green, blue, alpha];
      },

      /**
       * Converts a regexp object match of a hex3 string to an RGB array.
       *
       * @return {Array} an array with red, green, blue
       */
      __hex3StringToRgb__P_140_4: function __hex3StringToRgb__P_140_4() {
        var red = parseInt(RegExp.$1, 16) * 17;
        var green = parseInt(RegExp.$2, 16) * 17;
        var blue = parseInt(RegExp.$3, 16) * 17;
        return [red, green, blue];
      },

      /**
       * Converts a regexp object match of a hex6 string to an RGB array.
       *
       * @return {Array} an array with red, green, blue
       */
      __hex6StringToRgb__P_140_5: function __hex6StringToRgb__P_140_5() {
        var red = parseInt(RegExp.$1, 16) * 16 + parseInt(RegExp.$2, 16);
        var green = parseInt(RegExp.$3, 16) * 16 + parseInt(RegExp.$4, 16);
        var blue = parseInt(RegExp.$5, 16) * 16 + parseInt(RegExp.$6, 16);
        return [red, green, blue];
      },

      /**
       * Converts a regexp object match of a hexLong string to an RGB array.
       *
       * @return {Array} an array with red, green, blue
       */
      __hexLongStringToRgb__P_140_3: function __hexLongStringToRgb__P_140_3() {
        var red = parseInt(RegExp.$1, 16);
        var green = parseInt(RegExp.$2, 16);
        var blue = parseInt(RegExp.$3, 16);
        var alpha = Math.round(parseInt(RegExp.$4 || "ff", 16) / 255 * 1000) / 1000;
        return alpha == 1 ? [red, green, blue] : [red, green, blue, alpha];
      },

      /**
       * Converts a hex3 string to an RGB array
       *
       * @param value {String} a hex3 (#xxx) string
       * @return {Array} an array with red, green, blue
       */
      hex3StringToRgb: function hex3StringToRgb(value) {
        if (this.isHex3String(value)) {
          return this.__hex3StringToRgb__P_140_4(value);
        }

        throw new Error("Invalid hex3 value: " + value);
      },

      /**
       * Converts a hex3 (#xxx) string to a hex6 (#xxxxxx) string.
       *
       * @param value {String} a hex3 (#xxx) string
       * @return {String} The hex6 (#xxxxxx) string or the passed value when the
       *   passed value is not an hex3 (#xxx) value.
       */
      hex3StringToHex6String: function hex3StringToHex6String(value) {
        if (this.isHex3String(value)) {
          return this.rgbToHexString(this.hex3StringToRgb(value));
        }

        return value;
      },

      /**
       * Converts a hex6 string to an RGB array
       *
       * @param value {String} a hex6 (#xxxxxx) string
       * @return {Array} an array with red, green, blue
       */
      hex6StringToRgb: function hex6StringToRgb(value) {
        if (this.isHex6String(value)) {
          return this.__hex6StringToRgb__P_140_5(value);
        }

        throw new Error("Invalid hex6 value: " + value);
      },

      /**
       * Converts a hex string to an RGB array
       *
       * @param value {String} a hexShort (#rgb/#rgba) or hexLong (#rrggbb/#rrggbbaa) string
       * @return {Array} an array with red, green, blue and alpha
       */
      hexStringToRgb: function hexStringToRgb(value) {
        if (this.ishexShortString(value)) {
          return this.__hexShortStringToRgb__P_140_2(value);
        }

        if (this.ishexLongString(value)) {
          return this.__hexLongStringToRgb__P_140_3(value);
        }

        throw new Error("Invalid hex value: " + value);
      },

      /**
       * Convert RGB colors to HSB/HSV
       *
       * @param rgb {Number[]} red, blue and green as array
       * @return {Array} an array with hue, saturation and brightness/value
       */
      rgbToHsb: function rgbToHsb(rgb) {
        var hue, saturation, brightness;
        var red = rgb[0];
        var green = rgb[1];
        var blue = rgb[2];
        var cmax = red > green ? red : green;

        if (blue > cmax) {
          cmax = blue;
        }

        var cmin = red < green ? red : green;

        if (blue < cmin) {
          cmin = blue;
        }

        brightness = cmax / 255.0;

        if (cmax != 0) {
          saturation = (cmax - cmin) / cmax;
        } else {
          saturation = 0;
        }

        if (saturation == 0) {
          hue = 0;
        } else {
          var redc = (cmax - red) / (cmax - cmin);
          var greenc = (cmax - green) / (cmax - cmin);
          var bluec = (cmax - blue) / (cmax - cmin);

          if (red == cmax) {
            hue = bluec - greenc;
          } else if (green == cmax) {
            hue = 2.0 + redc - bluec;
          } else {
            hue = 4.0 + greenc - redc;
          }

          hue = hue / 6.0;

          if (hue < 0) {
            hue = hue + 1.0;
          }
        }

        return [Math.round(hue * 360), Math.round(saturation * 100), Math.round(brightness * 100)];
      },

      /**
       * Convert HSB/HSV colors to RGB
       *
       * @param hsb {Number[]} an array with hue, saturation and brightness/value
       * @return {Integer[]} an array with red, green, blue
       */
      hsbToRgb: function hsbToRgb(hsb) {
        var i, f, p, r, t;
        var hue = hsb[0] / 360;
        var saturation = hsb[1] / 100;
        var brightness = hsb[2] / 100;

        if (hue >= 1.0) {
          hue %= 1.0;
        }

        if (saturation > 1.0) {
          saturation = 1.0;
        }

        if (brightness > 1.0) {
          brightness = 1.0;
        }

        var tov = Math.floor(255 * brightness);
        var rgb = {};

        if (saturation == 0.0) {
          rgb.red = rgb.green = rgb.blue = tov;
        } else {
          hue *= 6.0;
          i = Math.floor(hue);
          f = hue - i;
          p = Math.floor(tov * (1.0 - saturation));
          r = Math.floor(tov * (1.0 - saturation * f));
          t = Math.floor(tov * (1.0 - saturation * (1.0 - f)));

          switch (i) {
            case 0:
              rgb.red = tov;
              rgb.green = t;
              rgb.blue = p;
              break;

            case 1:
              rgb.red = r;
              rgb.green = tov;
              rgb.blue = p;
              break;

            case 2:
              rgb.red = p;
              rgb.green = tov;
              rgb.blue = t;
              break;

            case 3:
              rgb.red = p;
              rgb.green = r;
              rgb.blue = tov;
              break;

            case 4:
              rgb.red = t;
              rgb.green = p;
              rgb.blue = tov;
              break;

            case 5:
              rgb.red = tov;
              rgb.green = p;
              rgb.blue = r;
              break;
          }
        }

        return [rgb.red, rgb.green, rgb.blue];
      },

      /**
       * Convert RGB colors to HSL
       *
       * @param rgb {Number[]} red, blue and green as array
       * @return {Array} an array with hue, saturation and lightness
       */
      rgbToHsl: function rgbToHsl(rgb) {
        var r = rgb[0] / 255;
        var g = rgb[1] / 255;
        var b = rgb[2] / 255; // implementation from
        // https://stackoverflow.com/questions/2348597/why-doesnt-this-javascript-rgb-to-hsl-code-work/54071699#54071699

        var a = Math.max(r, g, b);
        var n = a - Math.min(r, g, b);
        var f = 1 - Math.abs(a + a - n - 1);
        var h = n && (a == r ? (g - b) / n : a == g ? 2 + (b - r) / n : 4 + (r - g) / n);
        return [60 * (h < 0 ? h + 6 : h), 100 * (f ? n / f : 0), 100 * (a + a - n) / 2];
      },

      /**
       * Convert HSL colors to RGB
       *
       * @param hsl {Number[]} an array with hue, saturation and lightness
       * @return {Integer[]} an array with red, green, blue
       */
      hslToRgb: function hslToRgb(hsl) {
        var h = hsl[0];
        var s = hsl[1] / 100;
        var l = hsl[2] / 100; // implementation from
        // https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex/54014428#54014428

        var a = s * Math.min(l, 1 - l);

        var f = function f(n) {
          var k = (n + h / 30) % 12;
          return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        };

        return [f(0), f(8), f(4)].map(function (v) {
          return Math.round(v * 2550) / 10;
        });
      },

      /**
       * Creates a random color.
       *
       * @return {String} a valid qooxdoo/CSS rgb color string.
       */
      randomColor: function randomColor() {
        var r = Math.round(Math.random() * 255);
        var g = Math.round(Math.random() * 255);
        var b = Math.round(Math.random() * 255);
        return this.rgbToRgbString([r, g, b]);
      },

      /**
       * Tune a color string according to the tuneMap
       *
       * @param color {String} a valid qooxdoo/CSS rgb color string
       * @param scaleMap {Map}  as described above
       * @param tuner {Function}  function
       * @param hue_tuner {Function}  function
       * @return {String} a valid CSS rgb color string.*
       */
      __tuner__P_140_6: function __tuner__P_140_6(color, tuneMap, tuner, hue_tuner) {
        var rgba = this.stringToRgb(color);

        for (var key in tuneMap) {
          if (tuneMap[key] == 0) {
            continue;
          }

          switch (key) {
            case "red":
              rgba[0] = tuner(rgba[0], tuneMap[key], 255);
              break;

            case "green":
              rgba[1] = tuner(rgba[1], tuneMap[key], 255);
              break;

            case "blue":
              rgba[2] = tuner(rgba[2], tuneMap[key], 255);
              break;

            case "alpha":
              rgba[3] = tuner(rgba[3] || 1, tuneMap[key], 1);
              break;

            case "hue":
              if (hue_tuner) {
                var hsb = this.rgbToHsb(rgba);
                hsb[0] = hue_tuner(hsb[0], tuneMap[key]);
                var rgb = this.hsbToRgb(hsb);
                rgb[3] = rgba[3];
                rgba = rgb;
              } else {
                throw new Error("Invalid key in map: " + key);
              }

              break;

            case "saturation":
              var hsb = this.rgbToHsb(rgba);
              hsb[1] = tuner(hsb[1], tuneMap[key], 100);
              rgb = this.hsbToRgb(hsb);
              rgb[3] = rgba[3];
              rgba = rgb;
              break;

            case "brightness":
              var hsb = this.rgbToHsb(rgba);
              hsb[2] = tuner(hsb[2], tuneMap[key], 100);
              rgb = this.hsbToRgb(hsb);
              rgb[3] = rgba[3];
              rgba = rgb;
              break;

            case "lightness":
              var hsl = this.rgbToHsl(rgba);
              hsl[2] = tuner(hsl[2], tuneMap[key], 100);
              rgb = this.hslToRgb(hsl);
              rgb[3] = rgba[3];
              rgba = rgb;
              break;

            default:
              throw new Error("Invalid key in tune map: " + key);
          }
        }

        if (rgba.length === 4) {
          if (rgba[3] === undefined || rgba[3] >= 1) {
            rgba.pop();
          } else if (rgba[3] < 0) {
            rgba[3] = 0;
          }
        }

        [0, 1, 2].forEach(function (i) {
          if (rgba[i] < 0) {
            rgba[i] = 0;
            return;
          }

          if (rgba[i] > 255) {
            rgba[i] = 255;
            return;
          }
        });
        return this.rgbToRgbString(rgba);
      },

      /**
       * Scale
       *
       * Scale the given properties of the input color according to the
       * configuration given in the `scaleMap`. Each key argument must point to a
       * number between -100% and 100% (inclusive). This indicates how far the
       * corresponding property should be moved from its original position
       * towards the maximum (if the argument is positive) or the minimum (if the
       * argument is negative). This means that, for example, `lightness: "50%"`
       * will make all colors 50% closer to maximum lightness without making them
       * fully white.
       *
       * Supported keys are:
       * `red`, `green`, `blue`, `alpha`, `saturation`,
       * `brightness`, `value`, `lightness`.
       *
       * @param color {String}  a valid qooxdoo/CSS rgb color string
       * @param scaleMap {Map}  as described above
       * @return {String} a valid CSS rgb color string.
       */
      scale: function scale(color, scaleMap) {
        return this.__tuner__P_140_6(color, scaleMap, function (value, scale, max) {
          if (value > max) {
            value = max;
          }

          if (scale > 0) {
            if (scale > 100) {
              scale = 100;
            }

            return value + (max - value) * scale / 100;
          } // scale < 0


          if (scale < -100) {
            scale = -100;
          }

          return value + value * scale / 100;
        });
      },

      /**
       * Adjust
       *
       * Increases or decreases one or more properties of the input color
       * by fixed amounts according to the configuration given in the
       * `adjustMap`. The value of the corresponding key is added to the
       * original value and the final result is adjusted to stay within legal
       * bounds. Hue values can go full circle.a1
       *
       * Supported keys are:
       * `red`, `green`, `blue`, `alpha`, `hue`, `saturation`, `brightness`,
       * `lightness`
       *
       * @param color {String} a valid qooxdoo/CSS rgb color string
       * @param scaleMap {Map} as described above
       * @return {String} a valid CSS rgb color string.
       */
      adjust: function adjust(color, adjustMap) {
        return this.__tuner__P_140_6(color, adjustMap, function (value, offset, max) {
          value += offset;

          if (value > max) {
            return max;
          }

          if (value < 0) {
            return 0;
          }

          return value;
        }, function (value, offset) {
          value += offset;

          while (value >= 360) {
            value -= 360;
          }

          while (value < 0) {
            value += 360;
          }

          return value;
        });
      },

      /**
       * RgbToLuminance
       *
       * Calculate the [luminance](https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests) of the given rgb color.
       *
       * @param color {String} a valid qooxdoo/CSS rgb color string
       * @return {Number} luminance
       */
      luminance: function luminance(color) {
        var rgb = this.stringToRgb(color);

        var lum = function lum(i) {
          var c = rgb[i] / 255;
          return c < 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        };

        return 0.2126 * lum(0) + 0.7152 * lum(1) + 0.0722 * lum(2);
      },

      /**
       * contrast
       *
       * Calculate the contrast of two given rgb colors.
       *
       * @param back {String} a valid qooxdoo/CSS rgb color string
       * @param front {String} a valid qooxdoo/CSS rgb color string
       * @return {Number} contrast
       */
      contrast: function contrast(back, front) {
        var bl = this.luminance(back) + 0.05;
        var fl = this.luminance(front) + 0.5;
        return Math.max(bl, fl) / Math.min(bl, fl);
      },

      /**
       * Picks a contrasting color
       *
       * @param rgb {Number[]|String} the color, either as a string or as an RGB array of 3 numbers
       * @param threshold {Number?} the threshold between light and dark outputs, where the range is 0-255, defaults to 128
       * @param dark {String?} the colour to use for "dark", defaults to black
       * @param light {String?} the colour to use for "light", defaults to white
       * @return {String} colour string
       */
      chooseContrastingColor: function chooseContrastingColor(rgb, threshold, dark, light) {
        if (typeof rgb == "string") {
          rgb = qx.util.ColorUtil.stringToRgb(rgb);
        }

        var r = rgb[0];
        var g = rgb[1];
        var b = rgb[2];

        if (!threshold) {
          threshold = 128;
        } // Combine into the YIQ color space (which gives us a handy scale we can use with a threshold)


        var yiq = (r * 299 + g * 587 + b * 114) / 1000;
        return yiq >= threshold ? dark || "#000" : light || "#fff";
      }
    }
  });
  qx.util.ColorUtil.$$dbClassInfo = $$dbClassInfo;
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
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * A decorator is responsible for computing a widget's decoration styles.
   *
   */
  qx.Interface.define("qx.ui.decoration.IDecorator", {
    members: {
      /**
       * Returns the decorator's styles.
       *
       * @return {Map} Map of decoration styles
       */
      getStyles: function getStyles() {},

      /**
       * Returns the configured padding minus the border width.
       * @return {Map} Map of top, right, bottom and left padding values
       */
      getPadding: function getPadding() {},

      /**
       * Get the amount of space the decoration needs for its border and padding
       * on each side.
       *
       * @return {Map} the desired inset as a map with the keys <code>top</code>,
       *     <code>right</code>, <code>bottom</code>, <code>left</code>.
       */
      getInsets: function getInsets() {}
    }
  });
  qx.ui.decoration.IDecorator.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.decoration.IDecorator": {
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
       * Martin Wittemann (martinwittemann)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * This class acts as abstract class for all decorators. It offers the
   * properties for the insets handling. Each decorator has to define its own
   * default insets by implementing the template method
   * (http://en.wikipedia.org/wiki/Template_Method) <code>_getDefaultInsets</code>
   */
  qx.Class.define("qx.ui.decoration.Abstract", {
    extend: qx.core.Object,
    implement: [qx.ui.decoration.IDecorator],
    type: "abstract",
    members: {
      __insets__P_154_0: null,

      /**
       * Abstract method. Should return a map containing the default insets of
       * the decorator. This could look like this:
       * <pre>
       * return {
       *   top : 0,
       *   right : 0,
       *   bottom : 0,
       *   left : 0
       * };
       * </pre>
       * @return {Map} Map containing the insets.
       */
      _getDefaultInsets: function _getDefaultInsets() {
        throw new Error("Abstract method called.");
      },

      /**
       * Abstract method. Should return an boolean value if the decorator is
       * already initialized or not.
       * @return {Boolean} True, if the decorator is initialized.
       */
      _isInitialized: function _isInitialized() {
        throw new Error("Abstract method called.");
      },

      /**
       * Resets the insets.
       */
      _resetInsets: function _resetInsets() {
        this.__insets__P_154_0 = null;
      },
      // interface implementation
      getInsets: function getInsets() {
        if (!this.__insets__P_154_0) {
          this.__insets__P_154_0 = this._getDefaultInsets();
        }

        return this.__insets__P_154_0;
      }
    },

    /*
     *****************************************************************************
        DESTRUCTOR
     *****************************************************************************
     */
    destruct: function destruct() {
      this.__insets__P_154_0 = null;
    }
  });
  qx.ui.decoration.Abstract.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.theme.manager.Color": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.theme": {}
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Mixin responsible for setting the background color of a widget.
   * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
   */
  qx.Mixin.define("qx.ui.decoration.MBackgroundColor", {
    properties: {
      /** Color of the background */
      backgroundColor: {
        check: "Color",
        nullable: true,
        apply: "_applyBackgroundColor"
      }
    },
    members: {
      /**
       * Adds the background-color styles to the given map
       * @param styles {Map} CSS style map
       */
      _styleBackgroundColor: function _styleBackgroundColor(styles) {
        var bgcolor = this.getBackgroundColor();

        if (bgcolor && qx.core.Environment.get("qx.theme")) {
          bgcolor = qx.theme.manager.Color.getInstance().resolve(bgcolor);
        }

        if (bgcolor) {
          styles["background-color"] = bgcolor;
        }
      },
      // property apply
      _applyBackgroundColor: function _applyBackgroundColor() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      }
    }
  });
  qx.ui.decoration.MBackgroundColor.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
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
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Mixin for the border radius CSS property.
   * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
   *
   * Keep in mind that this is not supported by all browsers:
   *
   * * Firefox 3,5+
   * * IE9+
   * * Safari 3.0+
   * * Opera 10.5+
   * * Chrome 4.0+
   */
  qx.Mixin.define("qx.ui.decoration.MBorderRadius", {
    properties: {
      /** top left corner radius */
      radiusTopLeft: {
        nullable: true,
        check: "Integer",
        apply: "_applyBorderRadius"
      },

      /** top right corner radius */
      radiusTopRight: {
        nullable: true,
        check: "Integer",
        apply: "_applyBorderRadius"
      },

      /** bottom left corner radius */
      radiusBottomLeft: {
        nullable: true,
        check: "Integer",
        apply: "_applyBorderRadius"
      },

      /** bottom right corner radius */
      radiusBottomRight: {
        nullable: true,
        check: "Integer",
        apply: "_applyBorderRadius"
      },

      /** Property group to set the corner radius of all sides */
      radius: {
        group: ["radiusTopLeft", "radiusTopRight", "radiusBottomRight", "radiusBottomLeft"],
        mode: "shorthand"
      }
    },
    members: {
      /**
       * Takes a styles map and adds the border radius styles in place to the
       * given map. This is the needed behavior for
       * {@link qx.ui.decoration.Decorator}.
       *
       * @param styles {Map} A map to add the styles.
       */
      _styleBorderRadius: function _styleBorderRadius(styles) {
        // Fixing the background bleed in Webkits
        // http://tumble.sneak.co.nz/post/928998513/fixing-the-background-bleed
        styles["-webkit-background-clip"] = "padding-box";
        styles["background-clip"] = "padding-box"; // radius handling

        var hasRadius = false;
        var radius = this.getRadiusTopLeft();

        if (radius > 0) {
          hasRadius = true;
          styles["-moz-border-radius-topleft"] = radius + "px";
          styles["-webkit-border-top-left-radius"] = radius + "px";
          styles["border-top-left-radius"] = radius + "px";
        }

        radius = this.getRadiusTopRight();

        if (radius > 0) {
          hasRadius = true;
          styles["-moz-border-radius-topright"] = radius + "px";
          styles["-webkit-border-top-right-radius"] = radius + "px";
          styles["border-top-right-radius"] = radius + "px";
        }

        radius = this.getRadiusBottomLeft();

        if (radius > 0) {
          hasRadius = true;
          styles["-moz-border-radius-bottomleft"] = radius + "px";
          styles["-webkit-border-bottom-left-radius"] = radius + "px";
          styles["border-bottom-left-radius"] = radius + "px";
        }

        radius = this.getRadiusBottomRight();

        if (radius > 0) {
          hasRadius = true;
          styles["-moz-border-radius-bottomright"] = radius + "px";
          styles["-webkit-border-bottom-right-radius"] = radius + "px";
          styles["border-bottom-right-radius"] = radius + "px";
        } // Fixing the background bleed in Webkits
        // http://tumble.sneak.co.nz/post/928998513/fixing-the-background-bleed


        if (hasRadius && qx.core.Environment.get("engine.name") == "webkit") {
          styles["-webkit-background-clip"] = "padding-box";
        } else {
          styles["background-clip"] = "padding-box";
        }
      },
      // property apply
      _applyBorderRadius: function _applyBorderRadius() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      }
    }
  });
  qx.ui.decoration.MBorderRadius.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Css": {
        "require": true
      },
      "qx.bom.Style": {},
      "qx.theme.manager.Color": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.boxshadow": {
          "className": "qx.bom.client.Css"
        },
        "qx.theme": {}
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Mixin for the box shadow CSS property.
   * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
   *
   * Keep in mind that this is not supported by all browsers:
   *
   * * Firefox 3,5+
   * * IE9+
   * * Safari 3.0+
   * * Opera 10.5+
   * * Chrome 4.0+
   *
   * It is possible to define multiple box shadows by setting an
   * array containing the needed values as the property value.
   * In case multiple values are specified, the values of the properties
   * are repeated until all match in length.
   *
   * An example:
   * <pre class="javascript">
   *   'my-decorator': {
   *     style: {
   *       shadowBlurRadius: 2,
   *       shadowVerticalLength: 1,
   *       shadowColor: ['rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.4)'],
   *       inset: [true, false]
   *     }
   *   }
   * </pre>
   * which is the same as:
   * <pre class="javascript">
   *   'my-decorator': {
   *     style: {
   *       shadowBlurRadius: [2, 2],
   *       shadowVerticalLength: [1, 1],
   *       shadowColor: ['rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.4)'],
   *       inset: [true, false]
   *     }
   *   }
   */
  qx.Mixin.define("qx.ui.decoration.MBoxShadow", {
    properties: {
      /** Horizontal length of the shadow. */
      shadowHorizontalLength: {
        nullable: true,
        apply: "_applyBoxShadow"
      },

      /** Vertical length of the shadow. */
      shadowVerticalLength: {
        nullable: true,
        apply: "_applyBoxShadow"
      },

      /** The blur radius of the shadow. */
      shadowBlurRadius: {
        nullable: true,
        apply: "_applyBoxShadow"
      },

      /** The spread radius of the shadow. */
      shadowSpreadRadius: {
        nullable: true,
        apply: "_applyBoxShadow"
      },

      /** The color of the shadow. */
      shadowColor: {
        nullable: true,
        apply: "_applyBoxShadow"
      },

      /** Inset shadows are drawn inside the border. */
      inset: {
        init: false,
        apply: "_applyBoxShadow"
      },

      /** Property group to set the shadow length. */
      shadowLength: {
        group: ["shadowHorizontalLength", "shadowVerticalLength"],
        mode: "shorthand"
      }
    },
    members: {
      /**
       * Takes a styles map and adds the box shadow styles in place to the
       * given map. This is the needed behavior for
       * {@link qx.ui.decoration.Decorator}.
       *
       * @param styles {Map} A map to add the styles.
       */
      _styleBoxShadow: function _styleBoxShadow(styles) {
        var propName = qx.core.Environment.get("css.boxshadow");

        if (!propName || this.getShadowVerticalLength() == null && this.getShadowHorizontalLength() == null) {
          return;
        }

        propName = qx.bom.Style.getCssName(propName);
        var Color = null;

        if (qx.core.Environment.get("qx.theme")) {
          Color = qx.theme.manager.Color.getInstance();
        }

        var boxShadowProperties = ["shadowVerticalLength", "shadowHorizontalLength", "shadowBlurRadius", "shadowSpreadRadius", "shadowColor", "inset"];
        (function (vLengths, hLengths, blurs, spreads, colors, insets) {
          for (var i = 0; i < vLengths.length; i++) {
            var vLength = vLengths[i] || 0;
            var hLength = hLengths[i] || 0;
            var blur = blurs[i] || 0;
            var spread = spreads[i] || 0;
            var color = colors[i] || "black";
            var inset = insets[i];

            if (Color) {
              color = Color.resolve(color);
            }

            if (color != null) {
              var value = (inset ? "inset " : "") + hLength + "px " + vLength + "px " + blur + "px " + spread + "px " + color; // apply or append the box shadow styles

              if (!styles[propName]) {
                styles[propName] = value;
              } else {
                styles[propName] += "," + value;
              }
            }
          }
        }).apply(this, this._getExtendedPropertyValueArrays(boxShadowProperties));
      },
      // property apply
      _applyBoxShadow: function _applyBoxShadow() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      }
    }
  });
  qx.ui.decoration.MBoxShadow.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.theme.manager.Color": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.theme": {}
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * A basic decorator featuring simple borders based on CSS styles.
   * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
   */
  qx.Mixin.define("qx.ui.decoration.MSingleBorder", {
    properties: {
      /*
      ---------------------------------------------------------------------------
        PROPERTY: WIDTH
      ---------------------------------------------------------------------------
      */

      /** top width of border */
      widthTop: {
        check: "Number",
        init: 0,
        apply: "_applyWidth"
      },

      /** right width of border */
      widthRight: {
        check: "Number",
        init: 0,
        apply: "_applyWidth"
      },

      /** bottom width of border */
      widthBottom: {
        check: "Number",
        init: 0,
        apply: "_applyWidth"
      },

      /** left width of border */
      widthLeft: {
        check: "Number",
        init: 0,
        apply: "_applyWidth"
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY: STYLE
      ---------------------------------------------------------------------------
      */

      /** top style of border */
      styleTop: {
        nullable: true,
        check: ["solid", "dotted", "dashed", "double", "inset", "outset", "ridge", "groove"],
        init: "solid",
        apply: "_applyStyle"
      },

      /** right style of border */
      styleRight: {
        nullable: true,
        check: ["solid", "dotted", "dashed", "double", "inset", "outset", "ridge", "groove"],
        init: "solid",
        apply: "_applyStyle"
      },

      /** bottom style of border */
      styleBottom: {
        nullable: true,
        check: ["solid", "dotted", "dashed", "double", "inset", "outset", "ridge", "groove"],
        init: "solid",
        apply: "_applyStyle"
      },

      /** left style of border */
      styleLeft: {
        nullable: true,
        check: ["solid", "dotted", "dashed", "double", "inset", "outset", "ridge", "groove"],
        init: "solid",
        apply: "_applyStyle"
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY: COLOR
      ---------------------------------------------------------------------------
      */

      /** top color of border */
      colorTop: {
        nullable: true,
        check: "Color",
        apply: "_applyStyle"
      },

      /** right color of border */
      colorRight: {
        nullable: true,
        check: "Color",
        apply: "_applyStyle"
      },

      /** bottom color of border */
      colorBottom: {
        nullable: true,
        check: "Color",
        apply: "_applyStyle"
      },

      /** left color of border */
      colorLeft: {
        nullable: true,
        check: "Color",
        apply: "_applyStyle"
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY GROUP: EDGE
      ---------------------------------------------------------------------------
      */

      /** Property group to configure the left border */
      left: {
        group: ["widthLeft", "styleLeft", "colorLeft"]
      },

      /** Property group to configure the right border */
      right: {
        group: ["widthRight", "styleRight", "colorRight"]
      },

      /** Property group to configure the top border */
      top: {
        group: ["widthTop", "styleTop", "colorTop"]
      },

      /** Property group to configure the bottom border */
      bottom: {
        group: ["widthBottom", "styleBottom", "colorBottom"]
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY GROUP: TYPE
      ---------------------------------------------------------------------------
      */

      /** Property group to set the border width of all sides */
      width: {
        group: ["widthTop", "widthRight", "widthBottom", "widthLeft"],
        mode: "shorthand"
      },

      /** Property group to set the border style of all sides */
      style: {
        group: ["styleTop", "styleRight", "styleBottom", "styleLeft"],
        mode: "shorthand"
      },

      /** Property group to set the border color of all sides */
      color: {
        group: ["colorTop", "colorRight", "colorBottom", "colorLeft"],
        mode: "shorthand"
      }
    },
    members: {
      /**
       * Takes a styles map and adds the border styles styles in place
       * to the given map. This is the needed behavior for
       * {@link qx.ui.decoration.Decorator}.
       *
       * @param styles {Map} A map to add the styles.
       */
      _styleBorder: function _styleBorder(styles) {
        if (qx.core.Environment.get("qx.theme")) {
          var Color = qx.theme.manager.Color.getInstance();
          var colorTop = Color.resolve(this.getColorTop());
          var colorRight = Color.resolve(this.getColorRight());
          var colorBottom = Color.resolve(this.getColorBottom());
          var colorLeft = Color.resolve(this.getColorLeft());
        } else {
          var colorTop = this.getColorTop();
          var colorRight = this.getColorRight();
          var colorBottom = this.getColorBottom();
          var colorLeft = this.getColorLeft();
        } // Add borders


        var width = this.getWidthTop();

        if (width > 0) {
          styles["border-top"] = width + "px " + this.getStyleTop() + " " + (colorTop || "");
        }

        var width = this.getWidthRight();

        if (width > 0) {
          styles["border-right"] = width + "px " + this.getStyleRight() + " " + (colorRight || "");
        }

        var width = this.getWidthBottom();

        if (width > 0) {
          styles["border-bottom"] = width + "px " + this.getStyleBottom() + " " + (colorBottom || "");
        }

        var width = this.getWidthLeft();

        if (width > 0) {
          styles["border-left"] = width + "px " + this.getStyleLeft() + " " + (colorLeft || "");
        } // Check if valid


        {
          if (styles.length === 0) {
            throw new Error("Invalid Single decorator (zero border width). Use qx.ui.decorator.Background instead!");
          }
        } // Add basic styles

        styles.position = "absolute";
      },

      /**
       * Implementation of the interface for the single border.
       *
       * @return {Map} A map containing the default insets.
       *   (top, right, bottom, left)
       */
      _getDefaultInsetsForBorder: function _getDefaultInsetsForBorder() {
        return {
          top: this.getWidthTop(),
          right: this.getWidthRight(),
          bottom: this.getWidthBottom(),
          left: this.getWidthLeft()
        };
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyWidth: function _applyWidth() {
        this._applyStyle();

        this._resetInsets();
      },
      // property apply
      _applyStyle: function _applyStyle() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      }
    }
  });
  qx.ui.decoration.MSingleBorder.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Type": {},
      "qx.util.AliasManager": {},
      "qx.util.ResourceManager": {},
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
       2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Mixin for supporting the background images on decorators.
   * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
   *
   * It is possible to define multiple background images by setting an
   * array containing the needed values as the property value.
   * In case multiple values are specified, the values of the properties
   * are repeated until all match in length.
   *
   * An example:
   * <pre class="javascript">
   *   'my-decorator': {
   *     style: {
   *       backgroundImage: ['foo1.png', 'foo2.png', 'bar1.png', 'bar2.png'],
   *       backgroundRepeat: 'no-repeat',
   *       backgroundPositionX: ['left', 'right', 'center'],
   *       backgroundPositionY: ['center', 'top']
   *     }
   *   }
   * </pre>
   * which is the same as:
   * <pre class="javascript">
   *   'my-decorator': {
   *     style: {
   *       backgroundImage: ['foo1.png', 'foo2.png', 'bar1.png', 'bar2.png'],
   *       backgroundRepeat: ['no-repeat', 'no-repeat', 'no-repeat', 'no-repeat'],
   *       backgroundPositionX: ['left', 'right', 'center', 'left'],
   *       backgroundPositionY: ['center', 'top', 'center', 'top']
   *     }
   *   }
   * </pre>
   */
  qx.Mixin.define("qx.ui.decoration.MBackgroundImage", {
    properties: {
      /** The URL of the background image */
      backgroundImage: {
        nullable: true,
        apply: "_applyBackgroundImage"
      },

      /** How the background image should be repeated */
      backgroundRepeat: {
        init: "repeat",
        apply: "_applyBackgroundImage"
      },

      /**
       * Either a string or a number, which defines the horizontal position
       * of the background image.
       *
       * If the value is an integer it is interpreted as a pixel value, otherwise
       * the value is taken to be a CSS value. For CSS, the values are "center",
       * "left" and "right".
       */
      backgroundPositionX: {
        nullable: true,
        apply: "_applyBackgroundPosition"
      },

      /**
       * Either a string or a number, which defines the vertical position
       * of the background image.
       *
       * If the value is an integer it is interpreted as a pixel value, otherwise
       * the value is taken to be a CSS value. For CSS, the values are "top",
       * "center" and "bottom".
       */
      backgroundPositionY: {
        nullable: true,
        apply: "_applyBackgroundPosition"
      },

      /**
       * Specifies where the background image is positioned.
       */
      backgroundOrigin: {
        nullable: true,
        apply: "_applyBackgroundImage"
      },

      /**
       * Property group to define the background position
       */
      backgroundPosition: {
        group: ["backgroundPositionY", "backgroundPositionX"]
      },

      /**
       * Whether to order gradients before Image-URL-based background declarations
       * if both qx.ui.decoration.MBackgroundImage and
       * qx.ui.decoration.MLinearBackgroundGradient decorations are used.
       */
      orderGradientsFront: {
        check: "Boolean",
        init: false
      }
    },
    members: {
      /**
       * Adds the background-image styles to the given map
       * @param styles {Map} CSS style map
       */
      _styleBackgroundImage: function _styleBackgroundImage(styles) {
        if (!this.getBackgroundImage()) {
          return;
        }

        if ("background" in styles) {
          if (!qx.lang.Type.isArray(styles["background"])) {
            styles["background"] = [styles["background"]];
          }
        } else {
          styles["background"] = [];
        }

        var backgroundImageProperties = ["backgroundImage", "backgroundRepeat", "backgroundPositionY", "backgroundPositionX", "backgroundOrigin"];
        (function (images, repeats, tops, lefts, origins) {
          for (var i = 0; i < images.length; i++) {
            var image = images[i];
            var repeat = repeats[i];
            var top = tops[i] || 0;
            var left = lefts[i] || 0;
            var origin = origins[i] || "";

            if (top == null) {
              top = 0;
            }

            if (left == null) {
              left = 0;
            }

            if (!isNaN(top)) {
              top += "px";
            }

            if (!isNaN(left)) {
              left += "px";
            }

            var id = qx.util.AliasManager.getInstance().resolve(image);
            var source = qx.util.ResourceManager.getInstance().toUri(id);
            var attrs = {
              image: "url(" + source + ")",
              position: left + " " + top,
              repeat: "repeat",
              origin: origin
            };

            if (repeat === "scale") {
              attrs.size = "100% 100%";
            } else {
              attrs.repeat = repeat;
            }

            var imageMarkup = [attrs.image, attrs.position + ("size" in attrs ? " / " + attrs.size : ""), attrs.repeat, attrs.origin];
            styles["background"][this.getOrderGradientsFront() ? "push" : "unshift"](imageMarkup.join(" "));

            if (true && source && source.endsWith(".png") && (repeat == "scale" || repeat == "no-repeat") && qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9) {
              this.warn("Background PNGs with repeat == 'scale' or repeat == 'no-repeat' are not supported in this client! The image's resource id is '" + id + "'");
            }
          }
        }).apply(this, this._getExtendedPropertyValueArrays(backgroundImageProperties));
      },
      // property apply
      _applyBackgroundImage: function _applyBackgroundImage() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      },
      // property apply
      _applyBackgroundPosition: function _applyBackgroundPosition() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }

          if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("browser.documentmode") < 9) {
            this.warn("The backgroundPosition property is not supported by this client!");
          }
        }
      }
    }
  });
  qx.ui.decoration.MBackgroundImage.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.decoration.MSingleBorder": {
        "require": true
      },
      "qx.ui.decoration.MBackgroundImage": {
        "require": true
      },
      "qx.bom.client.Css": {
        "require": true
      },
      "qx.theme.manager.Color": {},
      "qx.bom.Style": {},
      "qx.log.Logger": {},
      "qx.util.ColorUtil": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.boxshadow": {
          "className": "qx.bom.client.Css"
        },
        "qx.theme": {},
        "css.boxsizing": {
          "className": "qx.bom.client.Css"
        },
        "css.borderradius": {
          "className": "qx.bom.client.Css"
        },
        "css.rgba": {
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
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Border implementation with two CSS borders. Both borders can be styled
   * independent of each other.
   * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
   */
  qx.Mixin.define("qx.ui.decoration.MDoubleBorder", {
    include: [qx.ui.decoration.MSingleBorder, qx.ui.decoration.MBackgroundImage],
    construct: function construct() {
      // override the methods of single border and background image
      this._getDefaultInsetsForBorder = this.__getDefaultInsetsForDoubleBorder__P_155_0;
      this._styleBorder = this.__styleDoubleBorder__P_155_1;
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /*
      ---------------------------------------------------------------------------
        PROPERTY: INNER WIDTH
      ---------------------------------------------------------------------------
      */

      /** top width of border */
      innerWidthTop: {
        check: "Number",
        init: 0,
        apply: "_applyDoubleBorder"
      },

      /** right width of border */
      innerWidthRight: {
        check: "Number",
        init: 0,
        apply: "_applyDoubleBorder"
      },

      /** bottom width of border */
      innerWidthBottom: {
        check: "Number",
        init: 0,
        apply: "_applyDoubleBorder"
      },

      /** left width of border */
      innerWidthLeft: {
        check: "Number",
        init: 0,
        apply: "_applyDoubleBorder"
      },

      /** Property group to set the inner border width of all sides */
      innerWidth: {
        group: ["innerWidthTop", "innerWidthRight", "innerWidthBottom", "innerWidthLeft"],
        mode: "shorthand"
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY: INNER COLOR
      ---------------------------------------------------------------------------
      */

      /** top inner color of border */
      innerColorTop: {
        nullable: true,
        check: "Color",
        apply: "_applyDoubleBorder"
      },

      /** right inner color of border */
      innerColorRight: {
        nullable: true,
        check: "Color",
        apply: "_applyDoubleBorder"
      },

      /** bottom inner color of border */
      innerColorBottom: {
        nullable: true,
        check: "Color",
        apply: "_applyDoubleBorder"
      },

      /** left inner color of border */
      innerColorLeft: {
        nullable: true,
        check: "Color",
        apply: "_applyDoubleBorder"
      },

      /**
       * Property group for the inner color properties.
       */
      innerColor: {
        group: ["innerColorTop", "innerColorRight", "innerColorBottom", "innerColorLeft"],
        mode: "shorthand"
      },

      /**
       * The opacity of the inner border.
       */
      innerOpacity: {
        check: "Number",
        init: 1,
        apply: "_applyDoubleBorder"
      }
    },
    members: {
      /**
       * Takes a styles map and adds the outer border styles in place
       * to the given map. This is the needed behavior for
       * {@link qx.ui.decoration.Decorator}.
       *
       * @param styles {Map} A map to add the styles.
       */
      __styleDoubleBorder__P_155_1: function __styleDoubleBorder__P_155_1(styles) {
        var propName = qx.core.Environment.get("css.boxshadow");
        var color, innerColor, innerWidth;

        if (qx.core.Environment.get("qx.theme")) {
          var Color = qx.theme.manager.Color.getInstance();
          color = {
            top: Color.resolve(this.getColorTop()),
            right: Color.resolve(this.getColorRight()),
            bottom: Color.resolve(this.getColorBottom()),
            left: Color.resolve(this.getColorLeft())
          };
          innerColor = {
            top: Color.resolve(this.getInnerColorTop()),
            right: Color.resolve(this.getInnerColorRight()),
            bottom: Color.resolve(this.getInnerColorBottom()),
            left: Color.resolve(this.getInnerColorLeft())
          };
        } else {
          color = {
            top: this.getColorTop(),
            right: this.getColorRight(),
            bottom: this.getColorBottom(),
            left: this.getColorLeft()
          };
          innerColor = {
            top: this.getInnerColorTop(),
            right: this.getInnerColorRight(),
            bottom: this.getInnerColorBottom(),
            left: this.getInnerColorLeft()
          };
        }

        innerWidth = {
          top: this.getInnerWidthTop(),
          right: this.getInnerWidthRight(),
          bottom: this.getInnerWidthBottom(),
          left: this.getInnerWidthLeft()
        }; // Add outer borders

        var width = this.getWidthTop();

        if (width > 0) {
          styles["border-top"] = width + "px " + this.getStyleTop() + " " + color.top;
        }

        width = this.getWidthRight();

        if (width > 0) {
          styles["border-right"] = width + "px " + this.getStyleRight() + " " + color.right;
        }

        width = this.getWidthBottom();

        if (width > 0) {
          styles["border-bottom"] = width + "px " + this.getStyleBottom() + " " + color.bottom;
        }

        width = this.getWidthLeft();

        if (width > 0) {
          styles["border-left"] = width + "px " + this.getStyleLeft() + " " + color.left;
        }

        var innerOpacity = this.getInnerOpacity();

        if (innerOpacity < 1) {
          this.__processInnerOpacity__P_155_2(innerColor, innerOpacity);
        } // inner border


        if (innerWidth.top > 0 || innerWidth.right > 0 || innerWidth.bottom > 0 || innerWidth.left > 0) {
          var borderTop = (innerWidth.top || 0) + "px solid " + innerColor.top;
          var borderRight = (innerWidth.right || 0) + "px solid " + innerColor.right;
          var borderBottom = (innerWidth.bottom || 0) + "px solid " + innerColor.bottom;
          var borderLeft = (innerWidth.left || 0) + "px solid " + innerColor.left;
          styles[":before"] = {
            width: "100%",
            height: "100%",
            position: "absolute",
            content: '""',
            "border-top": borderTop,
            "border-right": borderRight,
            "border-bottom": borderBottom,
            "border-left": borderLeft,
            left: 0,
            top: 0
          };
          var boxSizingKey = qx.bom.Style.getCssName(qx.core.Environment.get("css.boxsizing"));
          styles[":before"][boxSizingKey] = "border-box"; // make sure to apply the border radius as well

          var borderRadiusKey = qx.core.Environment.get("css.borderradius");

          if (borderRadiusKey) {
            borderRadiusKey = qx.bom.Style.getCssName(borderRadiusKey);
            styles[":before"][borderRadiusKey] = "inherit";
          } // Add inner borders as shadows


          var shadowStyle = [];

          if (innerColor.top && innerWidth.top && innerColor.top == innerColor.bottom && innerColor.top == innerColor.right && innerColor.top == innerColor.left && innerWidth.top == innerWidth.bottom && innerWidth.top == innerWidth.right && innerWidth.top == innerWidth.left) {
            shadowStyle.push("inset 0 0 0 " + innerWidth.top + "px " + innerColor.top);
          } else {
            if (innerColor.top) {
              shadowStyle.push("inset 0 " + (innerWidth.top || 0) + "px " + innerColor.top);
            }

            if (innerColor.right) {
              shadowStyle.push("inset -" + (innerWidth.right || 0) + "px 0 " + innerColor.right);
            }

            if (innerColor.bottom) {
              shadowStyle.push("inset 0 -" + (innerWidth.bottom || 0) + "px " + innerColor.bottom);
            }

            if (innerColor.left) {
              shadowStyle.push("inset " + (innerWidth.left || 0) + "px 0 " + innerColor.left);
            }
          } // apply or append the box shadow styles


          if (shadowStyle.length > 0 && propName) {
            propName = qx.bom.Style.getCssName(propName);

            if (!styles[propName]) {
              styles[propName] = shadowStyle.join(",");
            } else {
              styles[propName] += "," + shadowStyle.join(",");
            }
          }
        } else {
          styles[":before"] = {
            border: 0
          };
        }
      },

      /**
       * Converts the inner border's colors to rgba.
       *
       * @param innerColor {Map} map of top, right, bottom and left colors
       * @param innerOpacity {Number} alpha value
       */
      __processInnerOpacity__P_155_2: function __processInnerOpacity__P_155_2(innerColor, innerOpacity) {
        if (!qx.core.Environment.get("css.rgba")) {
          {
            qx.log.Logger.warn("innerOpacity is configured but the browser doesn't support RGBA colors.");
          }
          return;
        }

        for (var edge in innerColor) {
          var rgb = qx.util.ColorUtil.stringToRgb(innerColor[edge]);
          rgb.push(innerOpacity);
          var rgbString = qx.util.ColorUtil.rgbToRgbString(rgb);
          innerColor[edge] = rgbString;
        }
      },
      _applyDoubleBorder: function _applyDoubleBorder() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      },

      /**
       * Implementation of the interface for the double border.
       *
       * @return {Map} A map containing the default insets.
       *   (top, right, bottom, left)
       */
      __getDefaultInsetsForDoubleBorder__P_155_0: function __getDefaultInsetsForDoubleBorder__P_155_0() {
        return {
          top: this.getWidthTop() + this.getInnerWidthTop(),
          right: this.getWidthRight() + this.getInnerWidthRight(),
          bottom: this.getWidthBottom() + this.getInnerWidthBottom(),
          left: this.getWidthLeft() + this.getInnerWidthLeft()
        };
      }
    }
  });
  qx.ui.decoration.MDoubleBorder.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Css": {
        "require": true
      },
      "qx.lang.Type": {},
      "qx.util.ColorUtil": {},
      "qx.theme.manager.Color": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.gradient.legacywebkit": {
          "className": "qx.bom.client.Css"
        },
        "css.gradient.linear": {
          "className": "qx.bom.client.Css"
        },
        "css.borderradius": {
          "className": "qx.bom.client.Css"
        },
        "qx.theme": {}
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Mixin for the linear background gradient CSS property.
   * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
   *
   * Keep in mind that this is not supported by all browsers:
   *
   * * Safari 4.0+
   * * Chrome 4.0+
   * * Firefox 3.6+
   * * Opera 11.1+
   * * IE 10+
   * * IE 5.5+ (with limitations)
   *
   * For IE 5.5 to IE 8,this class uses the filter rules to create the gradient. This
   * has some limitations: The start and end position property can not be used. For
   * more details, see the original documentation:
   * http://msdn.microsoft.com/en-us/library/ms532997(v=vs.85).aspx
   *
   * For IE9, we create a gradient in a canvas element and render this gradient
   * as background image. Due to restrictions in the <code>background-image</code>
   * css property, we can not allow negative start values in that case.
   *
   * It is possible to define multiple background gradients by setting an
   * array containing the needed values as the property value.
   * In case multiple values are specified, the values of the properties
   * are repeated until all match in length. It is not possible to define
   * multiple background gradients when falling back to filter rules (IE5.5 to IE8).
   *
   * An example:
   * <pre class="javascript">
   *   'my-decorator': {
   *     style: {
   *       startColor:['rgba(255, 0, 0, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(0, 0, 255, 0.5)'],
   *       endColor: 'rgba(255, 255, 255, 0.2)',
   *       orientation: ['horizontal', 'vertical']
   *     }
   *   }
   * </pre>
   * which is the same as:
   * <pre class="javascript">
   *   'my-decorator': {
   *     style: {
   *       startColor: ['rgba(255, 0, 0, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(0, 0, 255, 0.5)'],
   *       endColor: ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.2)'],
   *       orientation: ['horizontal', 'vertical', 'horizontal']
   *     }
   *   }
   * </pre>
   */
  qx.Mixin.define("qx.ui.decoration.MLinearBackgroundGradient", {
    properties: {
      /**
       * Start color of the background gradient.
       * Note that alpha transparency (rgba) is not supported in IE 8.
       */
      startColor: {
        nullable: true,
        apply: "_applyLinearBackgroundGradient"
      },

      /**
       * End color of the background gradient.
       * Note that alpha transparency (rgba) is not supported in IE 8.
       */
      endColor: {
        nullable: true,
        apply: "_applyLinearBackgroundGradient"
      },

      /** The orientation of the gradient. */
      orientation: {
        init: "vertical",
        apply: "_applyLinearBackgroundGradient"
      },

      /** Position in percent where to start the color. */
      startColorPosition: {
        init: 0,
        apply: "_applyLinearBackgroundGradient"
      },

      /** Position in percent where to start the color. */
      endColorPosition: {
        init: 100,
        apply: "_applyLinearBackgroundGradient"
      },

      /** Defines if the given positions are in % or px.*/
      colorPositionUnit: {
        init: "%",
        apply: "_applyLinearBackgroundGradient"
      },

      /** Property group to set the start color including its start position. */
      gradientStart: {
        group: ["startColor", "startColorPosition"],
        mode: "shorthand"
      },

      /** Property group to set the end color including its end position. */
      gradientEnd: {
        group: ["endColor", "endColorPosition"],
        mode: "shorthand"
      }
    },
    members: {
      /**
       * Takes a styles map and adds the linear background styles in place to the
       * given map. This is the needed behavior for
       * {@link qx.ui.decoration.Decorator}.
       *
       * @param styles {Map} A map to add the styles.
       */
      _styleLinearBackgroundGradient: function _styleLinearBackgroundGradient(styles) {
        var backgroundStyle = [];

        if (!this.getStartColor() || !this.getEndColor()) {
          return;
        }

        var styleImpl = this.__styleLinearBackgroundGradientAccordingToSpec__P_156_0;

        if (qx.core.Environment.get("css.gradient.legacywebkit")) {
          styleImpl = this.__styleLinearBackgroundGradientForLegacyWebkit__P_156_1;
        } else if (!qx.core.Environment.get("css.gradient.linear") && qx.core.Environment.get("css.borderradius")) {
          styleImpl = this.__styleLinearBackgroundGradientWithCanvas__P_156_2;
        } else if (!qx.core.Environment.get("css.gradient.linear")) {
          styleImpl = this.__styleLinearBackgroundGradientWithMSFilter__P_156_3;
        }

        var gradientProperties = ["startColor", "endColor", "colorPositionUnit", "orientation", "startColorPosition", "endColorPosition"];
        (function (startColors, endColors, units, orientations, startColorPositions, endColorPositions) {
          for (var i = 0; i < startColors.length; i++) {
            var startColor = this.__getColor__P_156_4(startColors[i]);

            var endColor = this.__getColor__P_156_4(endColors[i]);

            var unit = units[i];
            var orientation = orientations[i];
            var startColorPosition = startColorPositions[i];
            var endColorPosition = endColorPositions[i];

            if (!styleImpl(startColor, endColor, unit, orientation, startColorPosition, endColorPosition, styles, backgroundStyle)) {
              break;
            }
          }

          if ("background" in styles) {
            if (!qx.lang.Type.isArray(styles["background"])) {
              styles["background"] = [styles["background"]];
            }
          } else {
            styles["background"] = [];
          }

          var orderGradientsFront = "getOrderGradientsFront" in this ? this.getOrderGradientsFront() : false;
          var operation = orderGradientsFront ? Array.prototype.unshift : Array.prototype.push;
          operation.apply(styles["background"], backgroundStyle);
        }).apply(this, this._getExtendedPropertyValueArrays(gradientProperties));
      },

      /**
       * Compute CSS rules to style the background with gradients.
       * This can be called multiple times and SHOULD layer the gradients on top of each other and on top of existing backgrounds.
       * Legacy implementation for old WebKit browsers (Chrome < 10).
       *
       * @param startColor {Color} The color to start the gradient with
       * @param endColor {Color} The color to end the gradient with
       * @param unit {Color} The unit in which startColorPosition and endColorPosition are measured
       * @param orientation {String} Either 'horizontal' or 'vertical'
       * @param startColorPosition {Number} The position of the gradient’s starting point, measured in `unit` units along the `orientation` axis from top or left
       * @param endColorPosition {Number} The position of the gradient’s ending point, measured in `unit` units along the `orientation` axis from top or left
       * @param styles {Map} The complete styles currently poised to be applied by decorators. Should not be written to in this method (use `backgroundStyle` for that)
       * @param backgroundStyle {Map} This method should push new background styles onto this array.
       *
       * @return {Boolean} Whether this implementation supports multiple gradients atop each other (true).
       */
      __styleLinearBackgroundGradientForLegacyWebkit__P_156_1: function __styleLinearBackgroundGradientForLegacyWebkit__P_156_1(startColor, endColor, unit, orientation, startColorPosition, endColorPosition, styles, backgroundStyle) {
        // webkit uses px values if non are given
        unit = unit === "px" ? "" : unit;

        if (orientation == "horizontal") {
          var startPos = startColorPosition + unit + " 0" + unit;
          var endPos = endColorPosition + unit + " 0" + unit;
        } else {
          var startPos = "0" + unit + " " + startColorPosition + unit;
          var endPos = "0" + unit + " " + endColorPosition + unit;
        }

        var color = "from(" + startColor + "),to(" + endColor + ")";
        backgroundStyle.push("-webkit-gradient(linear," + startPos + "," + endPos + "," + color + ")");
        return true;
      },

      /**
       * Compute CSS rules to style the background with gradients.
       * This can be called multiple times and SHOULD layer the gradients on top of each other and on top of existing backgrounds.
       * IE9 canvas solution.
       *
       * @param startColor {Color} The color to start the gradient with
       * @param endColor {Color} The color to end the gradient with
       * @param unit {Color} The unit in which startColorPosition and endColorPosition are measured
       * @param orientation {String} Either 'horizontal' or 'vertical'
       * @param startColorPosition {Number} The position of the gradient’s starting point, measured in `unit` units along the `orientation` axis from top or left
       * @param endColorPosition {Number} The position of the gradient’s ending point, measured in `unit` units along the `orientation` axis from top or left
       * @param styles {Map} The complete styles currently poised to be applied by decorators. Should not be written to in this method (use `backgroundStyle` for that)
       * @param backgroundStyle {Map} This method should push new background styles onto this array.
       *
       * @return {Boolean} Whether this implementation supports multiple gradients atop each other (true).
       */
      __styleLinearBackgroundGradientWithCanvas__P_156_2: function __styleLinearBackgroundGradientWithCanvas__P_156_2(startColor, endColor, unit, orientation, startColorPosition, endColorPosition, styles, backgroundStyle) {
        var me = qx.ui.decoration.MLinearBackgroundGradient.__styleLinearBackgroundGradientWithCanvas__P_156_2;

        if (!me.__canvas__P_156_5) {
          me.__canvas__P_156_5 = document.createElement("canvas");
        }

        var isVertical = orientation == "vertical";
        var height = isVertical ? 200 : 1;
        var width = isVertical ? 1 : 200;
        var range = Math.max(100, endColorPosition - startColorPosition); // use the px difference as dimension

        if (unit === "px") {
          if (isVertical) {
            height = Math.max(height, endColorPosition - startColorPosition);
          } else {
            width = Math.max(width, endColorPosition - startColorPosition);
          }
        } else {
          if (isVertical) {
            height = Math.max(height, (endColorPosition - startColorPosition) * 2);
          } else {
            width = Math.max(width, (endColorPosition - startColorPosition) * 2);
          }
        }

        me.__canvas__P_156_5.width = width;
        me.__canvas__P_156_5.height = height;

        var ctx = me.__canvas__P_156_5.getContext("2d");

        if (isVertical) {
          var lingrad = ctx.createLinearGradient(0, 0, 0, height);
        } else {
          var lingrad = ctx.createLinearGradient(0, 0, width, 0);
        } // don't allow negative start values


        if (unit === "%") {
          lingrad.addColorStop(Math.max(0, startColorPosition) / range, startColor);
          lingrad.addColorStop(endColorPosition / range, endColor);
        } else {
          var comp = isVertical ? height : width;
          lingrad.addColorStop(Math.max(0, startColorPosition) / comp, startColor);
          lingrad.addColorStop(endColorPosition / comp, endColor);
        } //Clear the rect before drawing to allow for semitransparent colors


        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = lingrad;
        ctx.fillRect(0, 0, width, height);
        var size;

        if (unit === "%") {
          size = isVertical ? "100% " + range + "%" : range + "% 100%";
        } else {
          size = isVertical ? height + "px 100%" : "100% " + width + "px";
        }

        backgroundStyle.push("url(" + me.__canvas__P_156_5.toDataURL() + ") " + size);
        return true;
      },

      /**
       * Compute CSS rules to style the background with gradients.
       * This can be called multiple times and SHOULD layer the gradients on top of each other and on top of existing backgrounds.
       * Old IE filter fallback.
       *
       * @param startColor {Color} The color to start the gradient with
       * @param endColor {Color} The color to end the gradient with
       * @param unit {Color} The unit in which startColorPosition and endColorPosition are measured
       * @param orientation {String} Either 'horizontal' or 'vertical'
       * @param startColorPosition {Number} The position of the gradient’s starting point, measured in `unit` units along the `orientation` axis from top or left
       * @param endColorPosition {Number} The position of the gradient’s ending point, measured in `unit` units along the `orientation` axis from top or left
       * @param styles {Map} The complete styles currently poised to be applied by decorators. Should not be written to in this method (use `backgroundStyle` for that). Note: this particular implementation will do that because it needs to change the `filter` property.
       * @param backgroundStyle {Map} This method should push new background styles onto this array.
       *
       * @return {Boolean} Whether this implementation supports multiple gradients atop each other (false).
       */
      __styleLinearBackgroundGradientWithMSFilter__P_156_3: function __styleLinearBackgroundGradientWithMSFilter__P_156_3(startColor, endColor, unit, orientation, startColorPosition, endColorPosition, styles, backgroundStyle) {
        var type = orientation == "horizontal" ? 1 : 0; // convert rgb, hex3 and named colors to hex6

        if (!qx.util.ColorUtil.isHex6String(startColor)) {
          startColor = qx.util.ColorUtil.stringToRgb(startColor);
          startColor = qx.util.ColorUtil.rgbToHexString(startColor);
        }

        if (!qx.util.ColorUtil.isHex6String(endColor)) {
          endColor = qx.util.ColorUtil.stringToRgb(endColor);
          endColor = qx.util.ColorUtil.rgbToHexString(endColor);
        } // get rid of the starting '#'


        startColor = startColor.substring(1, startColor.length);
        endColor = endColor.substring(1, endColor.length);
        var value = "progid:DXImageTransform.Microsoft.Gradient(GradientType=" + type + ", " + "StartColorStr='#FF" + startColor + "', " + "EndColorStr='#FF" + endColor + "';)";

        if (styles["filter"]) {
          styles["filter"] += ", " + value;
        } else {
          styles["filter"] = value;
        } // Elements with transparent backgrounds will not receive receive pointer
        // events if a Gradient filter is set.


        if (!styles["background-color"] || styles["background-color"] == "transparent") {
          // We don't support alpha transparency for the gradient color stops
          // so it doesn't matter which color we set here.
          styles["background-color"] = "white";
        }

        return false;
      },

      /**
       * Compute CSS rules to style the background with gradients.
       * This can be called multiple times and SHOULD layer the gradients on top of each other and on top of existing backgrounds.
       * Default implementation (uses spec-compliant syntax).
       *
       * @param startColor {Color} The color to start the gradient with
       * @param endColor {Color} The color to end the gradient with
       * @param unit {Color} The unit in which startColorPosition and endColorPosition are measured
       * @param orientation {String} Either 'horizontal' or 'vertical'
       * @param startColorPosition {Number} The position of the gradient’s starting point, measured in `unit` units along the `orientation` axis from top or left
       * @param endColorPosition {Number} The position of the gradient’s ending point, measured in `unit` units along the `orientation` axis from top or left
       * @param styles {Map} The complete styles currently poised to be applied by decorators. Should not be written to in this method (use `backgroundStyle` for that)
       * @param backgroundStyle {Map} This method should push new background styles onto this array.
       *
       * @return {Boolean} Whether this implementation supports multiple gradients atop each other (true).
       */
      __styleLinearBackgroundGradientAccordingToSpec__P_156_0: function __styleLinearBackgroundGradientAccordingToSpec__P_156_0(startColor, endColor, unit, orientation, startColorPosition, endColorPosition, styles, backgroundStyle) {
        // WebKit, Opera and Gecko interpret 0deg as "to right"
        var deg = orientation == "horizontal" ? 0 : 270;
        var start = startColor + " " + startColorPosition + unit;
        var end = endColor + " " + endColorPosition + unit;
        var prefixedName = qx.core.Environment.get("css.gradient.linear"); // Browsers supporting the unprefixed implementation interpret 0deg as
        // "to top" as defined by the spec [BUG #6513]

        if (prefixedName === "linear-gradient") {
          deg = orientation == "horizontal" ? deg + 90 : deg - 90;
        }

        backgroundStyle.push(prefixedName + "(" + deg + "deg, " + start + "," + end + ")");
        return true;
      },

      /**
       * Helper to get a resolved color from a name
       * @param color {String} The color name
       * @return {Map} The resolved color
       */
      __getColor__P_156_4: function __getColor__P_156_4(color) {
        return qx.core.Environment.get("qx.theme") ? qx.theme.manager.Color.getInstance().resolve(color) : color;
      },
      // property apply
      _applyLinearBackgroundGradient: function _applyLinearBackgroundGradient() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      }
    }
  });
  qx.ui.decoration.MLinearBackgroundGradient.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.util.AliasManager": {},
      "qx.util.ResourceManager": {},
      "qx.bom.client.Css": {
        "require": true
      },
      "qx.bom.Style": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.borderimage.standardsyntax": {
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
       2013 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Decorator which uses the CSS3 border image properties.
   */
  qx.Mixin.define("qx.ui.decoration.MBorderImage", {
    properties: {
      /**
       * Base image URL.
       */
      borderImage: {
        check: "String",
        nullable: true,
        apply: "_applyBorderImage"
      },

      /**
       * The top slice line of the base image. The slice properties divide the
       * image into nine regions, which define the corner, edge and the center
       * images.
       */
      sliceTop: {
        check: "Integer",
        nullable: true,
        init: null,
        apply: "_applyBorderImage"
      },

      /**
       * The right slice line of the base image. The slice properties divide the
       * image into nine regions, which define the corner, edge and the center
       * images.
       */
      sliceRight: {
        check: "Integer",
        nullable: true,
        init: null,
        apply: "_applyBorderImage"
      },

      /**
       * The bottom slice line of the base image. The slice properties divide the
       * image into nine regions, which define the corner, edge and the center
       * images.
       */
      sliceBottom: {
        check: "Integer",
        nullable: true,
        init: null,
        apply: "_applyBorderImage"
      },

      /**
       * The left slice line of the base image. The slice properties divide the
       * image into nine regions, which define the corner, edge and the center
       * images.
       */
      sliceLeft: {
        check: "Integer",
        nullable: true,
        init: null,
        apply: "_applyBorderImage"
      },

      /**
       * The slice properties divide the image into nine regions, which define the
       * corner, edge and the center images.
       */
      slice: {
        group: ["sliceTop", "sliceRight", "sliceBottom", "sliceLeft"],
        mode: "shorthand"
      },

      /**
       * This property specifies how the images for the sides and the middle part
       * of the border image are scaled and tiled horizontally.
       *
       * Values have the following meanings:
       * <ul>
       *   <li><strong>stretch</strong>: The image is stretched to fill the area.</li>
       *   <li><strong>repeat</strong>: The image is tiled (repeated) to fill the area.</li>
       *   <li><strong>round</strong>: The image is tiled (repeated) to fill the area. If it does not
       *    fill the area with a whole number of tiles, the image is rescaled so
       *    that it does.</li>
       * </ul>
       */
      repeatX: {
        check: ["stretch", "repeat", "round"],
        init: "stretch",
        apply: "_applyBorderImage"
      },

      /**
       * This property specifies how the images for the sides and the middle part
       * of the border image are scaled and tiled vertically.
       *
       * Values have the following meanings:
       * <ul>
       *   <li><strong>stretch</strong>: The image is stretched to fill the area.</li>
       *   <li><strong>repeat</strong>: The image is tiled (repeated) to fill the area.</li>
       *   <li><strong>round</strong>: The image is tiled (repeated) to fill the area. If it does not
       *    fill the area with a whole number of tiles, the image is rescaled so
       *    that it does.</li>
       * </ul>
       */
      repeatY: {
        check: ["stretch", "repeat", "round"],
        init: "stretch",
        apply: "_applyBorderImage"
      },

      /**
       * This property specifies how the images for the sides and the middle part
       * of the border image are scaled and tiled.
       */
      repeat: {
        group: ["repeatX", "repeatY"],
        mode: "shorthand"
      },

      /**
       * If set to <code>false</code>, the center image will be omitted and only
       * the border will be drawn.
       */
      fill: {
        check: "Boolean",
        init: true,
        apply: "_applyBorderImage"
      },

      /**
       * Configures the border image mode. Supported values:
       * <ul>
       *   <li>horizontal: left and right border images</li>
       *   <li>vertical: top and bottom border images</li>
       *   <li>grid: border images for all edges</li>
       * </ul>
       */
      borderImageMode: {
        check: ["horizontal", "vertical", "grid"],
        init: "grid"
      }
    },
    members: {
      /**
       * Adds the border-image styles to the given map
       * @param styles {Map} CSS style map
       */
      _styleBorderImage: function _styleBorderImage(styles) {
        if (!this.getBorderImage()) {
          return;
        }

        var resolvedImage = qx.util.AliasManager.getInstance().resolve(this.getBorderImage());
        var source = qx.util.ResourceManager.getInstance().toUri(resolvedImage);

        var computedSlices = this._getDefaultInsetsForBorderImage();

        var slice = [computedSlices.top, computedSlices.right, computedSlices.bottom, computedSlices.left];
        var repeat = [this.getRepeatX(), this.getRepeatY()].join(" ");
        var fill = this.getFill() && qx.core.Environment.get("css.borderimage.standardsyntax") ? " fill" : "";
        var styleName = qx.bom.Style.getPropertyName("borderImage");

        if (styleName) {
          var cssName = qx.bom.Style.getCssName(styleName);
          styles[cssName] = 'url("' + source + '") ' + slice.join(" ") + fill + " " + repeat;
        } // Apply border styles even if we couldn't determine the borderImage property name
        // (e.g. because the browser doesn't support it). This is needed to keep
        // the layout intact.


        styles["border-style"] = "solid";
        styles["border-color"] = "transparent";
        styles["border-width"] = slice.join("px ") + "px";
      },

      /**
       * Computes the inset values based on the border image slices (defined in the
       * decoration theme or computed from the fallback image sizes).
       *
       * @return {Map} Map with the top, right, bottom and left insets
       */
      _getDefaultInsetsForBorderImage: function _getDefaultInsetsForBorderImage() {
        if (!this.getBorderImage()) {
          return {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          };
        }

        var resolvedImage = qx.util.AliasManager.getInstance().resolve(this.getBorderImage());

        var computedSlices = this.__getSlices__P_157_0(resolvedImage);

        return {
          top: this.getSliceTop() || computedSlices[0],
          right: this.getSliceRight() || computedSlices[1],
          bottom: this.getSliceBottom() || computedSlices[2],
          left: this.getSliceLeft() || computedSlices[3]
        };
      },
      _applyBorderImage: function _applyBorderImage() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      },

      /**
       * Gets the slice sizes from the fallback border images.
       *
       * @param baseImage {String} Resource Id of the base border image
       * @return {Integer[]} Array with the top, right, bottom and left slice widths
       */
      __getSlices__P_157_0: function __getSlices__P_157_0(baseImage) {
        var mode = this.getBorderImageMode();
        var topSlice = 0;
        var rightSlice = 0;
        var bottomSlice = 0;
        var leftSlice = 0;
        var split = /(.*)(\.[a-z]+)$/.exec(baseImage);
        var prefix = split[1];
        var ext = split[2];
        var ResourceManager = qx.util.ResourceManager.getInstance();

        if (mode == "grid" || mode == "vertical") {
          topSlice = ResourceManager.getImageHeight(prefix + "-t" + ext);
          bottomSlice = ResourceManager.getImageHeight(prefix + "-b" + ext);
        }

        if (mode == "grid" || mode == "horizontal") {
          rightSlice = ResourceManager.getImageWidth(prefix + "-r" + ext);
          leftSlice = ResourceManager.getImageWidth(prefix + "-l" + ext);
        }

        return [topSlice, rightSlice, bottomSlice, leftSlice];
      }
    }
  });
  qx.ui.decoration.MBorderImage.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.CssTransition": {
        "require": true
      },
      "qx.bom.client.Browser": {},
      "qx.bom.Style": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.transition": {
          "className": "qx.bom.client.CssTransition"
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2017 OETIKER+PARTNER AG
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Tobias Oetiker (oetiker)
  
  ************************************************************************ */

  /**
   * Mixin responsible for setting the css transition properties of a widget
   * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
   *
   * Keep in mind that this is not supported by all browsers:
   *
   * * Firefox 16+
   * * IE 10+
   * * Edge
   * * Safari 6.1+
   * * Opera 12.10+
   * * Chrome 26+
   *
   * It is possible to define transitions by setting an
   * array containing the needed values as the property value.
   * In case multiple values are specified, the values of the properties
   * are repeated until all match in length.
   *
   * An example:
   * <pre class="javascript">
   *   'my-decorator': {
   *     style: {
   *       transitionProperty: ['top','left']
   *       transitionDuration: '1s'
   *     }
   *   }
   * </pre>
   */
  qx.Mixin.define("qx.ui.decoration.MTransition", {
    properties: {
      /** transition property */
      transitionProperty: {
        nullable: true,
        apply: "_applyTransition"
      },

      /** transition duration */
      transitionDuration: {
        nullable: true,
        apply: "_applyTransition"
      },

      /** transition delay */
      transitionTimingFunction: {
        nullable: true,
        apply: "_applyTransition"
      },

      /** transition delay */
      transitionDelay: {
        nullable: true,
        apply: "_applyTransition"
      }
    },
    members: {
      /**
       * Takes a styles map and adds the box shadow styles in place to the
       * given map. This is the needed behavior for
       * {@link qx.ui.decoration.Decorator}.
       *
       * @param styles {Map} A map to add the styles.
       */
      _styleTransition: function _styleTransition(styles) {
        var propName = qx.core.Environment.get("css.transition");

        if (!propName || this.getTransitionDuration() == null) {
          return;
        }

        if (qx.bom.client.Browser.getName() === "chrome" && qx.bom.client.Browser.getVersion() >= 71) {
          // chrome has a repaint problem ... as suggested in
          // https://stackoverflow.com/a/21947628/235990 we are setting
          // a transform ...
          if (!styles.transform) {
            styles.transform = "translateZ(0)";
          }
        }

        propName = qx.bom.Style.getCssName(propName.name);
        var transitionProperties = ["transitionProperty", "transitionDuration", "transitionTimingFunction", "transitionDelay"];
        (function (tPros, tDurs, tTims, tDels) {
          for (var i = 0; i < tPros.length; i++) {
            var tPro = tPros[i] || "all";
            var tDur = tDurs[i] || "0s";
            var tTim = tTims[i] || "ease";
            var tDel = tDels[i] || "0s";
            var value = tPro + " " + tDur + " " + tTim + " " + tDel;

            if (!styles[propName]) {
              styles[propName] = value;
            } else {
              styles[propName] += "," + value;
            }
          }
        }).apply(this, this._getExtendedPropertyValueArrays(transitionProperties));
      },
      // property apply
      _applyTransition: function _applyTransition() {
        {
          if (this._isInitialized()) {
            throw new Error("This decorator is already in-use. Modification is not possible anymore!");
          }
        }
      }
    }
  });
  qx.ui.decoration.MTransition.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.decoration.Abstract": {
        "require": true
      },
      "qx.ui.decoration.IDecorator": {
        "require": true
      },
      "qx.ui.decoration.MBackgroundColor": {
        "require": true
      },
      "qx.ui.decoration.MBorderRadius": {
        "require": true
      },
      "qx.ui.decoration.MBoxShadow": {
        "require": true
      },
      "qx.ui.decoration.MDoubleBorder": {
        "require": true
      },
      "qx.ui.decoration.MLinearBackgroundGradient": {
        "require": true
      },
      "qx.ui.decoration.MBorderImage": {
        "require": true
      },
      "qx.ui.decoration.MTransition": {
        "require": true
      },
      "qx.lang.String": {},
      "qx.lang.Type": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2013 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (wittemann)
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Decorator including all decoration possibilities from mixins:
   *
   * <ul>
   * <li>Background color</li>
   * <li>Background image</li>
   * <li>Background gradient</li>
   * <li>Single and double borders</li>
   * <li>Border radius</li>
   * <li>Box shadow</li>
   * </ul>
   */
  qx.Class.define("qx.ui.decoration.Decorator", {
    extend: qx.ui.decoration.Abstract,
    implement: [qx.ui.decoration.IDecorator],
    include: [qx.ui.decoration.MBackgroundColor, qx.ui.decoration.MBorderRadius, qx.ui.decoration.MBoxShadow, qx.ui.decoration.MDoubleBorder, qx.ui.decoration.MLinearBackgroundGradient, qx.ui.decoration.MBorderImage, qx.ui.decoration.MTransition],
    members: {
      __initialized__P_130_0: false,

      /**
       * Returns the configured padding minus the border width.
       * @return {Map} Map of top, right, bottom and left padding values
       */
      getPadding: function getPadding() {
        var insets = this.getInset();

        var slices = this._getDefaultInsetsForBorderImage();

        var borderTop = insets.top - (slices.top ? slices.top : this.getWidthTop());
        var borderRight = insets.right - (slices.right ? slices.right : this.getWidthRight());
        var borderBottom = insets.bottom - (slices.bottom ? slices.bottom : this.getWidthBottom());
        var borderLeft = insets.left - (slices.left ? slices.left : this.getWidthLeft());
        return {
          top: insets.top ? borderTop : this.getInnerWidthTop(),
          right: insets.right ? borderRight : this.getInnerWidthRight(),
          bottom: insets.bottom ? borderBottom : this.getInnerWidthBottom(),
          left: insets.left ? borderLeft : this.getInnerWidthLeft()
        };
      },

      /**
       * Returns the styles of the decorator as a map with property names written
       * in javascript style (e.g. <code>fontWeight</code> instead of <code>font-weight</code>).
       *
       * @param css {Boolean?} <code>true</code> if hyphenated CSS names should be returned.
       * @return {Map} style information
       */
      getStyles: function getStyles(css) {
        if (css) {
          return this._getStyles();
        }

        var jsStyles = {};

        var cssStyles = this._getStyles();

        for (var property in cssStyles) {
          jsStyles[qx.lang.String.camelCase(property)] = cssStyles[property];
        }

        return jsStyles;
      },

      /**
       * Collects all the style information from the decorators.
       *
       * @return {Map} style information
       */
      _getStyles: function _getStyles() {
        var styles = {};

        for (var name in this) {
          if (name.indexOf("_style") == 0 && this[name] instanceof Function) {
            this[name](styles);
          }
        }

        for (var name in styles) {
          if (qx.lang.Type.isArray(styles[name])) {
            styles[name] = styles[name].join(", ");
          }
        }

        this.__initialized__P_130_0 = true;
        return styles;
      },
      // overridden
      _getDefaultInsets: function _getDefaultInsets() {
        var directions = ["top", "right", "bottom", "left"];
        var defaultInsets = {};

        for (var name in this) {
          if (name.indexOf("_getDefaultInsetsFor") == 0 && this[name] instanceof Function) {
            var currentInsets = this[name]();

            for (var i = 0; i < directions.length; i++) {
              var direction = directions[i]; // initialize with the first insets found

              if (defaultInsets[direction] == undefined) {
                defaultInsets[direction] = currentInsets[direction];
              } // take the largest inset


              if (currentInsets[direction] > defaultInsets[direction]) {
                defaultInsets[direction] = currentInsets[direction];
              }
            }
          }
        } // check if the mixins have created a default insets


        if (defaultInsets["top"] != undefined) {
          return defaultInsets;
        } // return a fallback which is 0 for all insets


        return {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        };
      },
      // overridden
      _isInitialized: function _isInitialized() {
        return this.__initialized__P_130_0;
      },

      /**
       * Ensures that every propertyValue specified in propertyNames is an array.
       * The value arrays are extended and repeated to match in length.
       * @param propertyNames {Array} Array containing the propertyNames.
       * @return {Array} Array containing the extended value arrays.
       */
      _getExtendedPropertyValueArrays: function _getExtendedPropertyValueArrays(propertyNames) {
        // transform non-array values to an array containing that value
        var propertyValues = propertyNames.map(function (propName) {
          var value = this.get(propName);

          if (!qx.lang.Type.isArray(value)) {
            value = [value];
          }

          return value;
        }, this); // Because it's possible to set multiple values for a property there's
        // a chance that not all properties have the same number of values set.
        // Extend the value arrays by repeating existing values until all
        // arrays match in length.

        var items = Math.max.apply(Math, propertyValues.map(function (prop) {
          return prop.length;
        }));

        for (var i = 0; i < propertyValues.length; i++) {
          this.__extendArray__P_130_1(propertyValues[i], items);
        }

        return propertyValues;
      },

      /**
       * Extends an array up to the given length by repeating the elements already present.
       * @param array {Array} Incoming array. Has to contain at least one element.
       * @param to {Integer} Desired length. Must be greater than or equal to the the length of arr.
       */
      __extendArray__P_130_1: function __extendArray__P_130_1(array, to) {
        var initial = array.length;

        while (array.length < to) {
          array.push(array[array.length % initial]);
        }
      }
    }
  });
  qx.ui.decoration.Decorator.$$dbClassInfo = $$dbClassInfo;
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
   * This singleton manages global resource aliases.
   *
   * The AliasManager supports simple prefix replacement on strings. There are
   * some pre-defined aliases, and you can register your own with {@link #add}.
   * The AliasManager is automatically invoked in various situations, e.g. when
   * resolving the icon image for a button, so it is common to register aliases for
   * <a href="http://qooxdoo.org/docs/#desktop/gui/resources.md">resource id's</a>.
   * You can of course call the AliasManager's {@link #resolve}
   * explicitly to get an alias resolution in any situation, but keep that
   * automatic invocation of the AliasManager in mind when defining new aliases as
   * they will be applied globally in many classes, not only your own.
   *
   * Examples:
   * <ul>
   *  <li> <code>foo</code> -> <code>bar/16pt/baz</code>  (resolves e.g. __"foo/a/b/c.png"__ to
   *    __"bar/16pt/baz/a/b/c.png"__)
   *  <li> <code>imgserver</code> -> <code>http&#058;&#047;&#047;imgs03.myserver.com/my/app/</code>
   *    (resolves e.g. __"imgserver/a/b/c.png"__ to
   *    __"http&#058;&#047;&#047;imgs03.myserver.com/my/app/a/b/c.png"__)
   * </ul>
   *
   * For resources, only aliases that resolve to proper resource id's can be __managed__
   * resources, and will be considered __unmanaged__ resources otherwise.
   */
  qx.Class.define("qx.util.AliasManager", {
    type: "singleton",
    extend: qx.util.ValueManager,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.util.ValueManager.constructor.call(this); // Contains defined aliases (like icons/, widgets/, application/, ...)

      this.__aliases__P_124_0 = {}; // Define static alias from setting

      this.add("static", "qx/static");
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __aliases__P_124_0: null,

      /**
       * pre-process incoming dynamic value
       *
       * @param value {String} incoming value
       * @return {String} pre processed value
       */
      _preprocess: function _preprocess(value) {
        var dynamics = this._getDynamic();

        if (dynamics[value] === false) {
          return value;
        } else if (dynamics[value] === undefined) {
          if (value.charAt(0) === "/" || value.charAt(0) === "." || value.indexOf("http://") === 0 || value.indexOf("https://") === "0" || value.indexOf("file://") === 0) {
            dynamics[value] = false;
            return value;
          }

          if (this.__aliases__P_124_0[value]) {
            return this.__aliases__P_124_0[value];
          }

          var alias = value.substring(0, value.indexOf("/"));
          var resolved = this.__aliases__P_124_0[alias];

          if (resolved !== undefined) {
            dynamics[value] = resolved + value.substring(alias.length);
          }
        }

        return value;
      },

      /**
       * Define an alias to a resource path
       *
       * @param alias {String} alias name for the resource path/url
       * @param base {String} first part of URI for all images which use this alias
       */
      add: function add(alias, base) {
        // Store new alias value
        this.__aliases__P_124_0[alias] = base; // Localify stores

        var dynamics = this._getDynamic(); // Update old entries which use this alias


        for (var path in dynamics) {
          if (path.substring(0, path.indexOf("/")) === alias) {
            dynamics[path] = base + path.substring(alias.length);
          }
        }
      },

      /**
       * Remove a previously defined alias
       *
       * @param alias {String} alias name for the resource path/url
       */
      remove: function remove(alias) {
        delete this.__aliases__P_124_0[alias]; // No signal for depending objects here. These
        // will informed with the new value using add().
      },

      /**
       * Resolves a given path
       *
       * @param path {String} input path
       * @return {String} resulting path (with interpreted aliases)
       */
      resolve: function resolve(path) {
        var dynamic = this._getDynamic();

        if (path != null) {
          path = this._preprocess(path);
        }

        return dynamic[path] || path;
      },

      /**
       * Get registered aliases
       *
       * @return {Map} the map of the currently registered alias:resolution pairs
       */
      getAliases: function getAliases() {
        var res = {};

        for (var key in this.__aliases__P_124_0) {
          res[key] = this.__aliases__P_124_0[key];
        }

        return res;
      }
    }
  });
  qx.util.AliasManager.$$dbClassInfo = $$dbClassInfo;
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
      "qx.lang.String": {},
      "qx.theme.manager.Color": {}
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
       * Mustafa Sak (msak)
  
  ************************************************************************ */

  /**
   * A wrapper for CSS font styles. Fond objects can be applied to instances
   * of {@link qx.html.Element}.
   */
  qx.Class.define("qx.bom.Font", {
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param size {String?} The font size (Unit: pixel)
     * @param family {String[]?} A sorted list of font families
     */
    construct: function construct(size, family) {
      qx.core.Object.constructor.call(this);
      this.__lookupMap__P_122_0 = {
        fontFamily: "",
        fontSize: null,
        fontWeight: null,
        fontStyle: null,
        textDecoration: null,
        lineHeight: null,
        color: null,
        textShadow: null,
        letterSpacing: null
      };

      if (size !== undefined) {
        this.setSize(size);
      }

      if (family !== undefined) {
        this.setFamily(family);
      }
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Converts a typical CSS font definition string to an font object
       *
       * Example string: <code>bold italic 20px Arial</code>
       *
       * @param str {String} the CSS string
       * @return {qx.bom.Font} the created instance
       */
      fromString: function fromString(str) {
        var font = new qx.bom.Font();
        var parts = str.split(/\s+/);
        var name = [];
        var part;

        for (var i = 0; i < parts.length; i++) {
          switch (part = parts[i]) {
            case "bold":
              font.setBold(true);
              break;

            case "italic":
              font.setItalic(true);
              break;

            case "underline":
              font.setDecoration("underline");
              break;

            default:
              var temp = parseInt(part, 10);

              if (temp == part || qx.lang.String.contains(part, "px")) {
                font.setSize(temp);
              } else {
                name.push(part);
              }

              break;
          }
        }

        if (name.length > 0) {
          font.setFamily(name);
        }

        return font;
      },

      /**
       * Converts a map property definition into a font object.
       *
       * @param config {Map} map of property values
       * @return {qx.bom.Font} the created instance
       */
      fromConfig: function fromConfig(config) {
        var font = new qx.bom.Font();
        font.set(config);
        return font;
      },

      /** @type {Map} Default (empty) CSS styles */
      __defaultStyles__P_122_1: {
        fontFamily: "",
        fontSize: "",
        fontWeight: "",
        fontStyle: "",
        textDecoration: "",
        lineHeight: 1.2,
        color: "",
        textShadow: "",
        letterSpacing: ""
      },

      /**
       * Returns a map of all properties in empty state.
       *
       * This is useful for resetting previously configured
       * font styles.
       *
       * @return {Map} Default styles
       */
      getDefaultStyles: function getDefaultStyles() {
        return this.__defaultStyles__P_122_1;
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The font size (Unit: pixel) */
      size: {
        check: "Integer",
        nullable: true,
        apply: "_applySize"
      },

      /**
       * The line height as scaling factor of the default line height. A value
       * of 1 corresponds to the default line height
       */
      lineHeight: {
        check: "Number",
        nullable: true,
        apply: "_applyLineHeight"
      },

      /**
       * Characters that are used to test if the font has loaded properly. These
       * default to "WEei" in `qx.bom.webfont.Validator` and can be overridden
       * for certain cases like icon fonts that do not provide the predefined
       * characters.
       */
      comparisonString: {
        check: "String",
        init: null,
        nullable: true
      },

      /**
       * Version identifier that is appended to the URL to be loaded. Fonts
       * that are defined thru themes may be managed by the resource manager.
       * In this case updated fonts persist due to aggressive fontface caching
       * of some browsers. To get around this, set the `version` property to
       * the version of your font. It will be appended to the CSS URL and forces
       * the browser to re-validate.
       *
       * The version needs to be URL friendly, so only characters, numbers,
       * dash and dots are allowed here.
       */
      version: {
        check: function check(value) {
          return value === null || typeof value === "string" && /^[a-zA-Z0-9.-]+$/.test(value);
        },
        init: null,
        nullable: true
      },

      /** A sorted list of font families */
      family: {
        check: "Array",
        nullable: true,
        apply: "_applyFamily"
      },

      /** Whether the font is bold */
      bold: {
        check: "Boolean",
        nullable: true,
        apply: "_applyBold"
      },

      /** Whether the font is italic */
      italic: {
        check: "Boolean",
        nullable: true,
        apply: "_applyItalic"
      },

      /** The text decoration for this font */
      decoration: {
        check: ["underline", "line-through", "overline"],
        nullable: true,
        apply: "_applyDecoration"
      },

      /** The text color for this font */
      color: {
        check: "Color",
        nullable: true,
        apply: "_applyColor"
      },

      /** The text shadow for this font */
      textShadow: {
        nullable: true,
        check: "String",
        apply: "_applyTextShadow"
      },

      /** The weight property of the font as opposed to just setting it to 'bold' by setting the bold property to true */
      weight: {
        nullable: true,
        check: "String",
        apply: "_applyWeight"
      },

      /** The Letter Spacing (Unit: pixel) */
      letterSpacing: {
        check: "Integer",
        nullable: true,
        apply: "_applyLetterSpacing"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __lookupMap__P_122_0: null,
      // property apply
      _applySize: function _applySize(value, old) {
        this.__lookupMap__P_122_0.fontSize = value === null ? null : value + "px";
      },
      _applyLineHeight: function _applyLineHeight(value, old) {
        this.__lookupMap__P_122_0.lineHeight = value === null ? null : value;
      },
      // property apply
      _applyFamily: function _applyFamily(value, old) {
        var family = "";

        for (var i = 0, l = value.length; i < l; i++) {
          // in FireFox 2 and WebKit fonts like 'serif' or 'sans-serif' must
          // not be quoted!
          if (value[i].indexOf(" ") > 0) {
            family += '"' + value[i] + '"';
          } else {
            family += value[i];
          }

          if (i !== l - 1) {
            family += ",";
          }
        } // font family is a special case. In order to render the labels correctly
        // we have to return a font family - even if it's an empty string to prevent
        // the browser from applying the element style


        this.__lookupMap__P_122_0.fontFamily = family;
      },
      // property apply
      _applyBold: function _applyBold(value, old) {
        this.__lookupMap__P_122_0.fontWeight = value == null ? null : value ? "bold" : "normal";
      },
      // property apply
      _applyItalic: function _applyItalic(value, old) {
        this.__lookupMap__P_122_0.fontStyle = value == null ? null : value ? "italic" : "normal";
      },
      // property apply
      _applyDecoration: function _applyDecoration(value, old) {
        this.__lookupMap__P_122_0.textDecoration = value == null ? null : value;
      },
      // property apply
      _applyColor: function _applyColor(value, old) {
        this.__lookupMap__P_122_0.color = null;

        if (value) {
          this.__lookupMap__P_122_0.color = qx.theme.manager.Color.getInstance().resolve(value);
        }
      },
      // property apply
      _applyWeight: function _applyWeight(value, old) {
        this.__lookupMap__P_122_0.fontWeight = value;
      },
      // property apply
      _applyTextShadow: function _applyTextShadow(value, old) {
        this.__lookupMap__P_122_0.textShadow = value == null ? null : value;
      },
      // property apply
      _applyLetterSpacing: function _applyLetterSpacing(value, old) {
        this.__lookupMap__P_122_0.letterSpacing = value === null ? null : value + "px";
      },

      /**
       * Get a map of all CSS styles, which will be applied to the widget. Only
       * the styles which are set are returned.
       *
       * @return {Map} Map containing the current styles. The keys are property
       * names which can directly be used with the <code>set</code> method of each
       * widget.
       */
      getStyles: function getStyles() {
        return this.__lookupMap__P_122_0;
      }
    }
  });
  qx.bom.Font.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.Font": {
        "require": true
      },
      "qx.bom.webfonts.Manager": {}
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
   * Requests web fonts from {@link qx.bom.webfonts.Manager} and fires events
   * when their loading status is known.
   */
  qx.Class.define("qx.bom.webfonts.WebFont", {
    extend: qx.bom.Font,

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
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The source of the webfont.
       */
      sources: {
        nullable: true,
        apply: "_applySources"
      },

      /**
       * Indicates that the font has loaded successfully
       */
      valid: {
        init: false,
        check: "Boolean",
        event: "changeValid"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __families__P_121_0: null,
      // property apply
      _applySources: function _applySources(value, old) {
        var families = [];

        for (var i = 0, l = value.length; i < l; i++) {
          var familyName = this._quoteFontFamily(value[i].family);

          families.push(familyName);
          var sourcesList = value[i];
          sourcesList.comparisonString = this.getComparisonString();
          sourcesList.version = this.getVersion();

          qx.bom.webfonts.Manager.getInstance().require(familyName, sourcesList, this._onWebFontChangeStatus, this);
        }

        this.setFamily(families.concat(this.getFamily()));
      },

      /**
       * Propagates web font status changes
       *
       * @param ev {qx.event.type.Data} "changeStatus"
       */
      _onWebFontChangeStatus: function _onWebFontChangeStatus(ev) {
        var result = ev.getData();
        this.setValid(!!result.valid);
        this.fireDataEvent("changeStatus", result);
        {
          if (result.valid === false) {
            this.warn("WebFont " + result.family + " was not applied, perhaps the source file could not be loaded.");
          }
        }
      },

      /**
       * Makes sure font-family names containing spaces are properly quoted
       *
       * @param familyName {String} A font-family CSS value
       * @return {String} The quoted family name
       */
      _quoteFontFamily: function _quoteFontFamily(familyName) {
        return familyName.replace(/["']/g, "");
      }
    }
  });
  qx.bom.webfonts.WebFont.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.Timer": {}
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
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * A generic singleton that fires an "interval" event all 100 milliseconds. It
   * can be used whenever one needs to run code periodically. The main purpose of
   * this class is reduce the number of timers.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.event.Idle", {
    extend: qx.core.Object,
    implement: [qx.core.IDisposable],
    type: "singleton",
    construct: function construct() {
      qx.core.Object.constructor.call(this);
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
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * Interval for the timer, which periodically fires the "interval" event,
       * in milliseconds.
       */
      timeoutInterval: {
        check: "Number",
        init: 100,
        apply: "_applyTimeoutInterval"
      }
    },
    members: {
      __timer__P_158_0: null,
      // property apply
      _applyTimeoutInterval: function _applyTimeoutInterval(value) {
        if (this.__timer__P_158_0) {
          this.__timer__P_158_0.setInterval(value);
        }
      },

      /**
       * Fires an "interval" event
       */
      _onInterval: function _onInterval() {
        this.fireEvent("interval");
      },

      /**
       * Starts the timer but only if there are listeners for the "interval" event
       */
      __startTimer__P_158_1: function __startTimer__P_158_1() {
        if (!this.__timer__P_158_0 && this.hasListener("interval")) {
          var timer = new qx.event.Timer(this.getTimeoutInterval());
          timer.addListener("interval", this._onInterval, this);
          timer.start();
          this.__timer__P_158_0 = timer;
        }
      },

      /**
       * Stops the timer but only if there are no listeners for the interval event
       */
      __stopTimer__P_158_2: function __stopTimer__P_158_2() {
        if (this.__timer__P_158_0 && !this.hasListener("interval")) {
          this.__timer__P_158_0.stop();

          this.__timer__P_158_0.dispose();

          this.__timer__P_158_0 = null;
        }
      },

      /*
       * @Override
       */
      addListener: function addListener(type, listener, self, capture) {
        var result = qx.event.Idle.superclass.prototype.addListener.call(this, type, listener, self, capture);

        this.__startTimer__P_158_1();

        return result;
      },

      /*
       * @Override
       */
      addListenerOnce: function addListenerOnce(type, listener, self, capture) {
        var result = qx.event.Idle.superclass.prototype.addListenerOnce.call(this, type, listener, self, capture);

        this.__startTimer__P_158_1();

        return result;
      },

      /*
       * @Override
       */
      removeListener: function removeListener(type, listener, self, capture) {
        var result = qx.event.Idle.superclass.prototype.removeListener.call(this, type, listener, self, capture);

        this.__stopTimer__P_158_2();

        return result;
      },

      /*
       * @Override
       */
      removeListenerById: function removeListenerById(id) {
        var result = qx.event.Idle.superclass.prototype.removeListenerById.call(this, id);

        this.__stopTimer__P_158_2();

        return result;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      if (this.__timer__P_158_0) {
        this.__timer__P_158_0.stop();
      }

      this.__timer__P_158_0 = null;
    }
  });
  qx.event.Idle.$$dbClassInfo = $$dbClassInfo;
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
      "qx.util.placement.DirectAxis": {
        "construct": true
      },
      "qx.core.Assert": {},
      "qx.util.placement.KeepAlignAxis": {},
      "qx.util.placement.BestFitAxis": {}
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
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * Contains methods to compute a position for any object which should
   * be positioned relative to another object.
   */
  qx.Class.define("qx.util.placement.Placement", {
    extend: qx.core.Object,
    construct: function construct() {
      qx.core.Object.constructor.call(this);
      this.__defaultAxis__P_159_0 = qx.util.placement.DirectAxis;
    },
    properties: {
      /**
       * The axis object to use for the horizontal placement
       */
      axisX: {
        check: "Class"
      },

      /**
       * The axis object to use for the vertical placement
       */
      axisY: {
        check: "Class"
      },

      /**
       * Specify to which edge of the target object, the object should be attached
       */
      edge: {
        check: ["top", "right", "bottom", "left"],
        init: "top"
      },

      /**
       * Specify with which edge of the target object, the object should be aligned
       */
      align: {
        check: ["top", "right", "bottom", "left", "center", "middle"],
        init: "right"
      }
    },
    statics: {
      __instance__P_159_1: null,

      /**
       * DOM and widget independent method to compute the location
       * of an object to make it relative to any other object.
       *
       * @param size {Map} With the keys <code>width</code> and <code>height</code>
       *   of the object to align
       * @param area {Map} Available area to position the object. Has the keys
       *   <code>width</code> and <code>height</code>. Normally this is the parent
       *   object of the one to align.
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>left</code>, <code>top</code>, <code>right</code>
       *   and <code>bottom</code>.
       * @param offsets {Map} Map with all offsets for each direction.
       *   Comes with the keys <code>left</code>, <code>top</code>,
       *   <code>right</code> and <code>bottom</code>.
       * @param position {String} Alignment of the object on the target, any of
       *   "top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right",
       *   "left-top", "left-middle", "left-bottom", "right-top", "right-middle", "right-bottom".
       * @param modeX {String} Horizontal placement mode. Valid values are:
       *   <ul>
       *   <li><code>direct</code>: place the object directly at the given
       *   location.</li>
       *   <li><code>keep-align</code>: if parts of the object is outside of the visible
       *   area it is moved to the best fitting 'edge' and 'alignment' of the target.
       *   It is guaranteed the the new position attaches the object to one of the
       *   target edges and that that is aligned with a target edge.</li>
       *   <li>best-fit</li>: If parts of the object are outside of the visible
       *   area it is moved into the view port ignoring any offset, and position
       *   values.
       *   </ul>
       * @param modeY {String} Vertical placement mode. Accepts the same values as
       *   the 'modeX' argument.
       * @return {Map} A map with the final location stored in the keys
       *   <code>left</code> and <code>top</code>.
       */
      compute: function compute(size, area, target, offsets, position, modeX, modeY) {
        this.__instance__P_159_1 = this.__instance__P_159_1 || new qx.util.placement.Placement();
        var splitted = position.split("-");
        var edge = splitted[0];
        var align = splitted[1];
        {
          if (align === "center" || align === "middle") {
            var expected = "middle";

            if (edge === "top" || edge === "bottom") {
              expected = "center";
            }

            qx.core.Assert.assertEquals(expected, align, "Please use '" + edge + "-" + expected + "' instead!");
          }
        }

        this.__instance__P_159_1.set({
          axisX: this.__getAxis__P_159_2(modeX),
          axisY: this.__getAxis__P_159_2(modeY),
          edge: edge,
          align: align
        });

        return this.__instance__P_159_1.compute(size, area, target, offsets);
      },
      __direct__P_159_3: null,
      __keepAlign__P_159_4: null,
      __bestFit__P_159_5: null,

      /**
       * Get the axis implementation for the given mode
       *
       * @param mode {String} One of <code>direct</code>, <code>keep-align</code> or
       *   <code>best-fit</code>
       * @return {qx.util.placement.AbstractAxis}
       */
      __getAxis__P_159_2: function __getAxis__P_159_2(mode) {
        switch (mode) {
          case "direct":
            this.__direct__P_159_3 = this.__direct__P_159_3 || qx.util.placement.DirectAxis;
            return this.__direct__P_159_3;

          case "keep-align":
            this.__keepAlign__P_159_4 = this.__keepAlign__P_159_4 || qx.util.placement.KeepAlignAxis;
            return this.__keepAlign__P_159_4;

          case "best-fit":
            this.__bestFit__P_159_5 = this.__bestFit__P_159_5 || qx.util.placement.BestFitAxis;
            return this.__bestFit__P_159_5;

          default:
            throw new Error("Invalid 'mode' argument!'");
        }
      }
    },
    members: {
      __defaultAxis__P_159_0: null,

      /**
       * DOM and widget independent method to compute the location
       * of an object to make it relative to any other object.
       *
       * @param size {Map} With the keys <code>width</code> and <code>height</code>
       *   of the object to align
       * @param area {Map} Available area to position the object. Has the keys
       *   <code>width</code> and <code>height</code>. Normally this is the parent
       *   object of the one to align.
       * @param target {Map} Location of the object to align the object to. This map
       *   should have the keys <code>left</code>, <code>top</code>, <code>right</code>
       *   and <code>bottom</code>.
       * @param offsets {Map} Map with all offsets for each direction.
       *   Comes with the keys <code>left</code>, <code>top</code>,
       *   <code>right</code> and <code>bottom</code>.
       * @return {Map} A map with the final location stored in the keys
       *   <code>left</code> and <code>top</code>.
       */
      compute: function compute(size, area, target, offsets) {
        {
          this.assertObject(size, "size");
          this.assertNumber(size.width, "size.width");
          this.assertNumber(size.height, "size.height");
          this.assertObject(area, "area");
          this.assertNumber(area.width, "area.width");
          this.assertNumber(area.height, "area.height");
          this.assertObject(target, "target");
          this.assertNumber(target.top, "target.top");
          this.assertNumber(target.right, "target.right");
          this.assertNumber(target.bottom, "target.bottom");
          this.assertNumber(target.left, "target.left");
          this.assertObject(offsets, "offsets");
          this.assertNumber(offsets.top, "offsets.top");
          this.assertNumber(offsets.right, "offsets.right");
          this.assertNumber(offsets.bottom, "offsets.bottom");
          this.assertNumber(offsets.left, "offsets.left");
        }

        var axisX = this.getAxisX() || this.__defaultAxis__P_159_0;

        var left = axisX.computeStart(size.width, {
          start: target.left,
          end: target.right
        }, {
          start: offsets.left,
          end: offsets.right
        }, area.width, this.__getPositionX__P_159_6());

        var axisY = this.getAxisY() || this.__defaultAxis__P_159_0;

        var top = axisY.computeStart(size.height, {
          start: target.top,
          end: target.bottom
        }, {
          start: offsets.top,
          end: offsets.bottom
        }, area.height, this.__getPositionY__P_159_7());
        return {
          left: left,
          top: top
        };
      },

      /**
       * Get the position value for the horizontal axis
       *
       * @return {String} the position
       */
      __getPositionX__P_159_6: function __getPositionX__P_159_6() {
        var edge = this.getEdge();
        var align = this.getAlign();

        if (edge == "left") {
          return "edge-start";
        } else if (edge == "right") {
          return "edge-end";
        } else if (align == "left") {
          return "align-start";
        } else if (align == "center") {
          return "align-center";
        } else if (align == "right") {
          return "align-end";
        }
      },

      /**
       * Get the position value for the vertical axis
       *
       * @return {String} the position
       */
      __getPositionY__P_159_7: function __getPositionY__P_159_7() {
        var edge = this.getEdge();
        var align = this.getAlign();

        if (edge == "top") {
          return "edge-start";
        } else if (edge == "bottom") {
          return "edge-end";
        } else if (align == "top") {
          return "align-start";
        } else if (align == "middle") {
          return "align-center";
        } else if (align == "bottom") {
          return "align-end";
        }
      }
    },
    destruct: function destruct() {
      this._disposeObjects("__defaultAxis__P_159_0");
    }
  });
  qx.util.placement.Placement.$$dbClassInfo = $$dbClassInfo;
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
      "qx.event.Registration": {
        "construct": true
      },
      "qx.bom.Element": {
        "construct": true
      },
      "qx.ui.core.Widget": {
        "require": true
      },
      "qx.ui.popup.Popup": {},
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
   * This singleton is used to manager multiple instances of popups and their
   * state.
   */
  qx.Class.define("qx.ui.popup.Manager", {
    type: "singleton",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this); // Create data structure, use an array because order matters [BUG #4323]

      this.__objects__P_164_0 = []; // Register pointerdown handler

      qx.event.Registration.addListener(document.documentElement, "pointerdown", this.__onPointerDown__P_164_1, this, true); // Hide all popups on window blur

      qx.bom.Element.addListener(window, "blur", this.hideAll, this);
    },
    properties: {
      /**
       * Function that is used to determine if a widget is contained within another one.
       **/
      containsFunction: {
        check: "Function",
        init: qx.ui.core.Widget.contains
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __objects__P_164_0: null,

      /**
       * Registers a visible popup.
       *
       * @param obj {qx.ui.popup.Popup} The popup to register
       */
      add: function add(obj) {
        {
          if (!(obj instanceof qx.ui.popup.Popup)) {
            throw new Error("Object is no popup: " + obj);
          }
        }

        this.__objects__P_164_0.push(obj);

        this.__updateIndexes__P_164_2();
      },

      /**
       * Removes a popup from the registry
       *
       * @param obj {qx.ui.popup.Popup} The popup which was excluded
       */
      remove: function remove(obj) {
        {
          if (!(obj instanceof qx.ui.popup.Popup)) {
            throw new Error("Object is no popup: " + obj);
          }
        }
        qx.lang.Array.remove(this.__objects__P_164_0, obj);

        this.__updateIndexes__P_164_2();
      },

      /**
       * Excludes all currently open popups,
       * except those with {@link qx.ui.popup.Popup#autoHide} set to false.
       */
      hideAll: function hideAll() {
        var l = this.__objects__P_164_0.length,
            current = {};

        while (l--) {
          current = this.__objects__P_164_0[l];

          if (current.getAutoHide()) {
            current.exclude();
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        INTERNAL HELPER
      ---------------------------------------------------------------------------
      */

      /**
       * Updates the zIndex of all registered items to push
       * newly added ones on top of existing ones
       *
       */
      __updateIndexes__P_164_2: function __updateIndexes__P_164_2() {
        var min = 1e7;

        for (var i = 0; i < this.__objects__P_164_0.length; i++) {
          this.__objects__P_164_0[i].setZIndex(min++);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for pointer down events
       *
       * @param e {qx.event.type.Pointer} Pointer event object
       */
      __onPointerDown__P_164_1: function __onPointerDown__P_164_1(e) {
        // Get the corresponding widget of the target since we are dealing with
        // DOM elements here. This is necessary because we have to be aware of
        // Inline applications which are not covering the whole document and
        // therefore are not able to get all pointer events when only the
        // application root is monitored.
        var target = qx.ui.core.Widget.getWidgetByElement(e.getTarget());
        var reg = this.__objects__P_164_0;

        for (var i = 0; i < reg.length; i++) {
          var obj = reg[i];

          if (!obj.getAutoHide() || target == obj || this.getContainsFunction()(obj, target)) {
            continue;
          }

          obj.exclude();
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      qx.event.Registration.removeListener(document.documentElement, "pointerdown", this.__onPointerDown__P_164_1, this, true);

      this._disposeArray("__objects__P_164_0");
    }
  });
  qx.ui.popup.Manager.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Type": {}
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
       * Tristan Koch (tristankoch)
  
  ************************************************************************ */

  /**
   * Static helpers for parsing and modifying URIs.
   */
  qx.Bootstrap.define("qx.util.Uri", {
    statics: {
      /**
       * Split URL
       *
       * Code taken from:
       *   parseUri 1.2.2
       *   (c) Steven Levithan <stevenlevithan.com>
       *   MIT License
       *
       *
       * @param str {String} String to parse as URI
       * @param strict {Boolean} Whether to parse strictly by the rules
       * @return {Object} Map with parts of URI as properties
       */
      parseUri: function parseUri(str, strict) {
        var options = {
          key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
          q: {
            name: "queryKey",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
          },
          parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@?]*)(?::([^:@?]*))?)?@)?((?:\[[0-9A-Fa-f:]+\])|(?:[^:\/?#\[\]]*))(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose: /^(?:(?![^:@?]+:[^:@?\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@?]*)(?::([^:@?]*))?)?@)?((?:\[[0-9A-Fa-f:]+\])|(?:[^:\/?#\[\]]*))(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
          }
        };
        var o = options,
            m = options.parser[strict ? "strict" : "loose"].exec(str),
            uri = {},
            i = 14;

        while (i--) {
          uri[o.key[i]] = m[i] || "";
        }

        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
          if ($1) {
            uri[o.q.name][$1] = $2;
          }
        });
        return uri;
      },

      /**
       * Append string to query part of URL. Respects existing query.
       *
       * @param url {String} URL to append string to.
       * @param params {String} Parameters to append to URL.
       * @return {String} URL with string appended in query part.
       */
      appendParamsToUrl: function appendParamsToUrl(url, params) {
        if (params === undefined) {
          return url;
        }

        {
          if (!(qx.lang.Type.isString(params) || qx.lang.Type.isObject(params))) {
            throw new Error("params must be either string or object");
          }
        }

        if (qx.lang.Type.isObject(params)) {
          params = qx.util.Uri.toParameter(params);
        }

        if (!params) {
          return url;
        }

        return url += /\?/.test(url) ? "&" + params : "?" + params;
      },

      /**
       * Serializes an object to URI parameters (also known as query string).
       *
       * Escapes characters that have a special meaning in URIs as well as
       * umlauts. Uses the global function encodeURIComponent, see
       * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent
       *
       * Note: For URI parameters that are to be sent as
       * application/x-www-form-urlencoded (POST), spaces should be encoded
       * with "+".
       *
       * @param obj {Object}   Object to serialize.
       * @param post {Boolean} Whether spaces should be encoded with "+".
       * @return {String}      Serialized object. Safe to append to URIs or send as
       *                       URL encoded string.
       */
      toParameter: function toParameter(obj, post) {
        var key,
            parts = [];

        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            var value = obj[key];

            if (value instanceof Array) {
              for (var i = 0; i < value.length; i++) {
                this.__toParameterPair__P_61_0(key, value[i], parts, post);
              }
            } else {
              this.__toParameterPair__P_61_0(key, value, parts, post);
            }
          }
        }

        return parts.join("&");
      },

      /**
       * Encodes key/value to URI safe string and pushes to given array.
       *
       * @param key {String} Key.
       * @param value {String} Value.
       * @param parts {Array} Array to push to.
       * @param post {Boolean} Whether spaces should be encoded with "+".
       */
      __toParameterPair__P_61_0: function __toParameterPair__P_61_0(key, value, parts, post) {
        var encode = window.encodeURIComponent;

        if (post) {
          parts.push(encode(key).replace(/%20/g, "+") + "=" + encode(value).replace(/%20/g, "+"));
        } else {
          parts.push(encode(key) + "=" + encode(value));
        }
      },

      /**
       * Takes a relative URI and returns an absolute one.
       *
       * @param uri {String} relative URI
       * @return {String} absolute URI
       */
      getAbsolute: function getAbsolute(uri) {
        var div = document.createElement("div");
        div.innerHTML = '<a href="' + uri + '">0</a>';
        return div.firstChild.href;
      }
    }
  });
  qx.util.Uri.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.CssAnimation": {
        "require": true
      },
      "qx.bom.Stylesheet": {},
      "qx.bom.Event": {},
      "qx.bom.element.Style": {},
      "qx.log.Logger": {},
      "qx.lang.String": {},
      "qx.bom.element.AnimationHandle": {},
      "qx.bom.element.Transform": {},
      "qx.bom.Style": {},
      "qx.bom.client.OperatingSystem": {
        "defer": "load",
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "css.animation": {
          "load": true,
          "className": "qx.bom.client.CssAnimation"
        },
        "qx.debug": {
          "load": true
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
       2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * This class is responsible for applying CSS3 animations to plain DOM elements.
   *
   * The implementation is mostly a cross-browser wrapper for applying the
   * animations, including transforms. If the browser does not support
   * CSS animations, but you have set a keep frame, the keep frame will be applied
   * immediately, thus making the animations optional.
   *
   * The API aligns closely to the spec wherever possible.
   *
   * http://www.w3.org/TR/css3-animations/
   *
   * {@link qx.bom.element.Animation} is the class, which takes care of the
   * feature detection for CSS animations and decides which implementation
   * (CSS or JavaScript) should be used. Most likely, this implementation should
   * be the one to use.
   */
  qx.Bootstrap.define("qx.bom.element.AnimationCss", {
    statics: {
      // initialization
      __sheet__P_181_0: null,
      __rulePrefix__P_181_1: "Anni",
      __id__P_181_2: 0,

      /** Static map of rules */
      __rules__P_181_3: {},

      /** The used keys for transforms. */
      __transitionKeys__P_181_4: {
        scale: true,
        rotate: true,
        skew: true,
        translate: true
      },

      /** Map of cross browser CSS keys. */
      __cssAnimationKeys__P_181_5: qx.core.Environment.get("css.animation"),

      /**
       * This is the main function to start the animation in reverse mode.
       * For further details, take a look at the documentation of the wrapper
       * {@link qx.bom.element.Animation}.
       * @param el {Element} The element to animate.
       * @param desc {Map} Animation description.
       * @param duration {Integer?} The duration of the animation which will
       *   override the duration given in the description.
       * @return {qx.bom.element.AnimationHandle} The handle.
       */
      animateReverse: function animateReverse(el, desc, duration) {
        return this._animate(el, desc, duration, true);
      },

      /**
       * This is the main function to start the animation. For further details,
       * take a look at the documentation of the wrapper
       * {@link qx.bom.element.Animation}.
       * @param el {Element} The element to animate.
       * @param desc {Map} Animation description.
       * @param duration {Integer?} The duration of the animation which will
       *   override the duration given in the description.
       * @return {qx.bom.element.AnimationHandle} The handle.
       */
      animate: function animate(el, desc, duration) {
        return this._animate(el, desc, duration, false);
      },

      /**
       * Internal method to start an animation either reverse or not.
       * {@link qx.bom.element.Animation}.
       * @param el {Element} The element to animate.
       * @param desc {Map} Animation description.
       * @param duration {Integer?} The duration of the animation which will
       *   override the duration given in the description.
       * @param reverse {Boolean} <code>true</code>, if the animation should be
       *   reversed.
       * @return {qx.bom.element.AnimationHandle} The handle.
       */
      _animate: function _animate(el, desc, duration, reverse) {
        this.__normalizeDesc__P_181_6(desc); // debug validation


        {
          this.__validateDesc__P_181_7(desc);
        } // reverse the keep property if the animation is reverse as well

        var keep = desc.keep;

        if (keep != null && (reverse || desc.alternate && desc.repeat % 2 == 0)) {
          keep = 100 - keep;
        }

        if (!this.__sheet__P_181_0) {
          this.__sheet__P_181_0 = qx.bom.Stylesheet.createElement();
        }

        var keyFrames = desc.keyFrames;

        if (duration == undefined) {
          duration = desc.duration;
        } // if animations are supported


        if (this.__cssAnimationKeys__P_181_5 != null) {
          var name = this.__addKeyFrames__P_181_8(keyFrames, reverse);

          var style = name + " " + duration + "ms " + desc.timing + " " + (desc.delay ? desc.delay + "ms " : "") + desc.repeat + " " + (desc.alternate ? "alternate" : "");
          qx.bom.Event.addNativeListener(el, this.__cssAnimationKeys__P_181_5["start-event"], this.__onAnimationStart__P_181_9);
          qx.bom.Event.addNativeListener(el, this.__cssAnimationKeys__P_181_5["iteration-event"], this.__onAnimationIteration__P_181_10);
          qx.bom.Event.addNativeListener(el, this.__cssAnimationKeys__P_181_5["end-event"], this.__onAnimationEnd__P_181_11);
          {
            if (qx.bom.element.Style.get(el, "display") == "none") {
              qx.log.Logger.warn(el, "Some browsers will not animate elements with display==none");
            }
          }
          el.style[qx.lang.String.camelCase(this.__cssAnimationKeys__P_181_5["name"])] = style; // use the fill mode property if available and suitable

          if (keep && keep == 100 && this.__cssAnimationKeys__P_181_5["fill-mode"]) {
            el.style[this.__cssAnimationKeys__P_181_5["fill-mode"]] = "forwards";
          }
        }

        var animation = new qx.bom.element.AnimationHandle();
        animation.desc = desc;
        animation.el = el;
        animation.keep = keep;
        el.$$animation = animation; // additional transform keys

        if (desc.origin != null) {
          qx.bom.element.Transform.setOrigin(el, desc.origin);
        } // fallback for browsers not supporting animations


        if (this.__cssAnimationKeys__P_181_5 == null) {
          window.setTimeout(function () {
            qx.bom.element.AnimationCss.__onAnimationEnd__P_181_11({
              target: el
            });
          }, 0);
        }

        return animation;
      },

      /**
       * Handler for the animation start.
       * @param e {Event} The native event from the browser.
       */
      __onAnimationStart__P_181_9: function __onAnimationStart__P_181_9(e) {
        if (e.target.$$animation) {
          e.target.$$animation.emit("start", e.target);
        }
      },

      /**
       * Handler for the animation iteration.
       * @param e {Event} The native event from the browser.
       */
      __onAnimationIteration__P_181_10: function __onAnimationIteration__P_181_10(e) {
        // It could happen that an animation end event is fired before an
        // animation iteration appears [BUG #6928]
        if (e.target != null && e.target.$$animation != null) {
          e.target.$$animation.emit("iteration", e.target);
        }
      },

      /**
       * Handler for the animation end.
       * @param e {Event} The native event from the browser.
       */
      __onAnimationEnd__P_181_11: function __onAnimationEnd__P_181_11(e) {
        var el = e.target;
        var animation = el.$$animation; // ignore events when already cleaned up

        if (!animation) {
          return;
        }

        var desc = animation.desc;

        if (qx.bom.element.AnimationCss.__cssAnimationKeys__P_181_5 != null) {
          // reset the styling
          var key = qx.lang.String.camelCase(qx.bom.element.AnimationCss.__cssAnimationKeys__P_181_5["name"]);
          el.style[key] = "";
          qx.bom.Event.removeNativeListener(el, qx.bom.element.AnimationCss.__cssAnimationKeys__P_181_5["name"], qx.bom.element.AnimationCss.__onAnimationEnd__P_181_11);
        }

        if (desc.origin != null) {
          qx.bom.element.Transform.setOrigin(el, "");
        }

        qx.bom.element.AnimationCss.__keepFrame__P_181_12(el, desc.keyFrames[animation.keep]);

        el.$$animation = null;
        animation.el = null;
        animation.ended = true;
        animation.emit("end", el);
      },

      /**
       * Helper method which takes an element and a key frame description and
       * applies the properties defined in the given frame to the element. This
       * method is used to keep the state of the animation.
       * @param el {Element} The element to apply the frame to.
       * @param endFrame {Map} The description of the end frame, which is basically
       *   a map containing CSS properties and values including transforms.
       */
      __keepFrame__P_181_12: function __keepFrame__P_181_12(el, endFrame) {
        // keep the element at this animation step
        var transforms;

        for (var style in endFrame) {
          if (style in qx.bom.element.AnimationCss.__transitionKeys__P_181_4) {
            if (!transforms) {
              transforms = {};
            }

            transforms[style] = endFrame[style];
          } else {
            el.style[qx.lang.String.camelCase(style)] = endFrame[style];
          }
        } // transform keeping


        if (transforms) {
          qx.bom.element.Transform.transform(el, transforms);
        }
      },

      /**
       * Preprocessing of the description to make sure every necessary key is
       * set to its default.
       * @param desc {Map} The description of the animation.
       */
      __normalizeDesc__P_181_6: function __normalizeDesc__P_181_6(desc) {
        if (!desc.hasOwnProperty("alternate")) {
          desc.alternate = false;
        }

        if (!desc.hasOwnProperty("keep")) {
          desc.keep = null;
        }

        if (!desc.hasOwnProperty("repeat")) {
          desc.repeat = 1;
        }

        if (!desc.hasOwnProperty("timing")) {
          desc.timing = "linear";
        }

        if (!desc.hasOwnProperty("origin")) {
          desc.origin = null;
        }
      },

      /**
       * Debugging helper to validate the description.
       * @signature function(desc)
       * @param desc {Map} The description of the animation.
       */
      __validateDesc__P_181_7: qx.core.Environment.select("qx.debug", {
        "true": function _true(desc) {
          var possibleKeys = ["origin", "duration", "keep", "keyFrames", "delay", "repeat", "timing", "alternate"]; // check for unknown keys

          for (var name in desc) {
            if (!(possibleKeys.indexOf(name) != -1)) {
              qx.Bootstrap.warn("Unknown key '" + name + "' in the animation description.");
            }
          }

          if (desc.keyFrames == null) {
            qx.Bootstrap.warn("No 'keyFrames' given > 0");
          } else {
            // check the key frames
            for (var pos in desc.keyFrames) {
              if (pos < 0 || pos > 100) {
                qx.Bootstrap.warn("Keyframe position needs to be between 0 and 100");
              }
            }
          }
        },
        "default": null
      }),

      /**
       * Helper to add the given frames to an internal CSS stylesheet. It parses
       * the description and adds the key frames to the sheet.
       * @param frames {Map} A map of key frames that describe the animation.
       * @param reverse {Boolean} <code>true</code>, if the key frames should
       *   be added in reverse order.
       * @return {String} The generated name of the keyframes rule.
       */
      __addKeyFrames__P_181_8: function __addKeyFrames__P_181_8(frames, reverse) {
        var rule = ""; // for each key frame

        for (var position in frames) {
          rule += (reverse ? -(position - 100) : position) + "% {";
          var frame = frames[position];
          var transforms; // each style

          for (var style in frame) {
            if (style in this.__transitionKeys__P_181_4) {
              if (!transforms) {
                transforms = {};
              }

              transforms[style] = frame[style];
            } else {
              var propName = qx.bom.Style.getPropertyName(style);
              var prefixed = propName !== null ? qx.bom.Style.getCssName(propName) : "";
              rule += (prefixed || style) + ":" + frame[style] + ";";
            }
          } // transform handling


          if (transforms) {
            rule += qx.bom.element.Transform.getCss(transforms);
          }

          rule += "} ";
        } // cached shorthand


        if (this.__rules__P_181_3[rule]) {
          return this.__rules__P_181_3[rule];
        }

        var name = this.__rulePrefix__P_181_1 + this.__id__P_181_2++;
        var selector = this.__cssAnimationKeys__P_181_5["keyframes"] + " " + name;
        qx.bom.Stylesheet.addRule(this.__sheet__P_181_0, selector, rule);
        this.__rules__P_181_3[rule] = name;
        return name;
      },

      /**
       * Internal helper to reset the cache.
       */
      __clearCache__P_181_13: function __clearCache__P_181_13() {
        this.__id__P_181_2 = 0;

        if (this.__sheet__P_181_0) {
          this.__sheet__P_181_0.ownerNode.remove();

          this.__sheet__P_181_0 = null;
          this.__rules__P_181_3 = {};
        }
      }
    },
    defer: function defer(statics) {
      // iOS 8 seems to stumble over the old sheet object on tab
      // changes or leaving the browser [BUG #8986]
      if (qx.core.Environment.get("os.name") === "ios" && parseInt(qx.core.Environment.get("os.version")) >= 8) {
        document.addEventListener("visibilitychange", function () {
          if (!document.hidden) {
            statics.__clearCache__P_181_13();
          }
        }, false);
      }
    }
  });
  qx.bom.element.AnimationCss.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.lang.Object": {},
      "qx.bom.element.AnimationHandle": {},
      "qx.bom.Style": {},
      "qx.bom.element.Transform": {},
      "qx.util.ColorUtil": {},
      "qx.bom.AnimationFrame": {},
      "qx.lang.String": {}
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
   * This class offers the same API as the CSS3 animation layer in
   * {@link qx.bom.element.AnimationCss} but uses JavaScript to fake the behavior.
   *
   * {@link qx.bom.element.Animation} is the class, which takes care of the
   * feature detection for CSS animations and decides which implementation
   * (CSS or JavaScript) should be used. Most likely, this implementation should
   * be the one to use.
   *
   * @ignore(qx.bom.element.Style.*)
   * @use(qx.bom.element.AnimationJs#play)
   */
  qx.Bootstrap.define("qx.bom.element.AnimationJs", {
    statics: {
      /**
       * The maximal time a frame should take.
       */
      __maxStepTime__P_182_0: 30,

      /**
       * The supported CSS units.
       */
      __units__P_182_1: ["%", "in", "cm", "mm", "em", "ex", "pt", "pc", "px"],

      /** The used keys for transforms. */
      __transitionKeys__P_182_2: {
        scale: true,
        rotate: true,
        skew: true,
        translate: true
      },

      /**
       * This is the main function to start the animation. For further details,
       * take a look at the documentation of the wrapper
       * {@link qx.bom.element.Animation}.
       * @param el {Element} The element to animate.
       * @param desc {Map} Animation description.
       * @param duration {Integer?} The duration of the animation which will
       *   override the duration given in the description.
       * @return {qx.bom.element.AnimationHandle} The handle.
       */
      animate: function animate(el, desc, duration) {
        return this._animate(el, desc, duration, false);
      },

      /**
       * This is the main function to start the animation in reversed mode.
       * For further details, take a look at the documentation of the wrapper
       * {@link qx.bom.element.Animation}.
       * @param el {Element} The element to animate.
       * @param desc {Map} Animation description.
       * @param duration {Integer?} The duration of the animation which will
       *   override the duration given in the description.
       * @return {qx.bom.element.AnimationHandle} The handle.
       */
      animateReverse: function animateReverse(el, desc, duration) {
        return this._animate(el, desc, duration, true);
      },

      /**
       * Helper to start the animation, either in reversed order or not.
       *
       * @param el {Element} The element to animate.
       * @param desc {Map} Animation description.
       * @param duration {Integer?} The duration of the animation which will
       *   override the duration given in the description.
       * @param reverse {Boolean} <code>true</code>, if the animation should be
       *   reversed.
       * @return {qx.bom.element.AnimationHandle} The handle.
       */
      _animate: function _animate(el, desc, duration, reverse) {
        // stop if an animation is already running
        if (el.$$animation) {
          return el.$$animation;
        }

        desc = qx.lang.Object.clone(desc, true);

        if (duration == undefined) {
          duration = desc.duration;
        }

        var keyFrames = desc.keyFrames;

        var keys = this.__getOrderedKeys__P_182_3(keyFrames);

        var stepTime = this.__getStepTime__P_182_4(duration, keys);

        var steps = parseInt(duration / stepTime, 10);

        this.__normalizeKeyFrames__P_182_5(keyFrames, el);

        var delta = this.__calculateDelta__P_182_6(steps, stepTime, keys, keyFrames, duration, desc.timing);

        var handle = new qx.bom.element.AnimationHandle();
        handle.jsAnimation = true;

        if (reverse) {
          delta.reverse();
          handle.reverse = true;
        }

        handle.desc = desc;
        handle.el = el;
        handle.delta = delta;
        handle.stepTime = stepTime;
        handle.steps = steps;
        el.$$animation = handle;
        handle.i = 0;
        handle.initValues = {};
        handle.repeatSteps = this.__applyRepeat__P_182_7(steps, desc.repeat);
        var delay = desc.delay || 0;
        var self = this;
        handle.delayId = window.setTimeout(function () {
          handle.delayId = null;
          self.play(handle);
        }, delay);
        return handle;
      },

      /**
       * Try to normalize the keyFrames by adding the default / set values of the
       * element.
       * @param keyFrames {Map} The map of key frames.
       * @param el {Element} The element to animate.
       */
      __normalizeKeyFrames__P_182_5: function __normalizeKeyFrames__P_182_5(keyFrames, el) {
        // collect all possible keys and its units
        var units = {};

        for (var percent in keyFrames) {
          for (var name in keyFrames[percent]) {
            // prefixed key calculation
            var prefixed = qx.bom.Style.getPropertyName(name);

            if (prefixed && prefixed != name) {
              var prefixedName = qx.bom.Style.getCssName(prefixed);
              keyFrames[percent][prefixedName] = keyFrames[percent][name];
              delete keyFrames[percent][name];
              name = prefixedName;
            } // check for the available units


            if (units[name] == undefined) {
              var item = keyFrames[percent][name];

              if (typeof item == "string") {
                units[name] = this.__getUnit__P_182_8(item);
              } else {
                units[name] = "";
              }
            }
          }
        } // add all missing keys


        for (var percent in keyFrames) {
          var frame = keyFrames[percent];

          for (var name in units) {
            if (frame[name] == undefined) {
              if (name in el.style) {
                // get the computed style if possible
                if (window.getComputedStyle) {
                  frame[name] = window.getComputedStyle(el, null)[name];
                } else {
                  frame[name] = el.style[name];
                }
              } else {
                frame[name] = el[name];
              } // if its a unit we know, set 0 as fallback


              if (frame[name] === "" && this.__units__P_182_1.indexOf(units[name]) != -1) {
                frame[name] = "0" + units[name];
              }
            }
          }
        }
      },

      /**
       * Checks for transform keys and returns a cloned frame
       * with the right transform style set.
       * @param frame {Map} A single key frame of the description.
       * @return {Map} A modified clone of the given frame.
       */
      __normalizeKeyFrameTransforms__P_182_9: function __normalizeKeyFrameTransforms__P_182_9(frame) {
        frame = qx.lang.Object.clone(frame);
        var transforms;

        for (var name in frame) {
          if (name in this.__transitionKeys__P_182_2) {
            if (!transforms) {
              transforms = {};
            }

            transforms[name] = frame[name];
            delete frame[name];
          }
        }

        if (transforms) {
          var transformStyle = qx.bom.element.Transform.getCss(transforms).split(":");

          if (transformStyle.length > 1) {
            frame[transformStyle[0]] = transformStyle[1].replace(";", "");
          }
        }

        return frame;
      },

      /**
       * Precalculation of the delta which will be applied during the animation.
       * The whole deltas will be calculated prior to the animation and stored
       * in a single array. This method takes care of that calculation.
       *
       * @param steps {Integer} The amount of steps to take to the end of the
       *   animation.
       * @param stepTime {Integer} The amount of milliseconds each step takes.
       * @param keys {Array} Ordered list of keys in the key frames map.
       * @param keyFrames {Map} The map of key frames.
       * @param duration {Integer} Time in milliseconds the animation should take.
       * @param timing {String} The given timing function.
       * @return {Array} An array containing the animation deltas.
       */
      __calculateDelta__P_182_6: function __calculateDelta__P_182_6(steps, stepTime, keys, keyFrames, duration, timing) {
        var delta = new Array(steps);
        var keyIndex = 1;
        delta[0] = this.__normalizeKeyFrameTransforms__P_182_9(keyFrames[0]);
        var last = keyFrames[0];
        var next = keyFrames[keys[keyIndex]];
        var stepsToNext = Math.floor(keys[keyIndex] / (stepTime / duration * 100));
        var calculationIndex = 1; // is used as counter for the timing calculation
        // for every step

        for (var i = 1; i < delta.length; i++) {
          // switch key frames if we crossed a percent border
          if (i * stepTime / duration * 100 > keys[keyIndex]) {
            last = next;
            keyIndex++;
            next = keyFrames[keys[keyIndex]];
            stepsToNext = Math.floor(keys[keyIndex] / (stepTime / duration * 100)) - stepsToNext;
            calculationIndex = 1;
          }

          delta[i] = {};
          var transforms; // for every property

          for (var name in next) {
            var nItem = next[name] + ""; // transform values

            if (name in this.__transitionKeys__P_182_2) {
              if (!transforms) {
                transforms = {};
              }

              if (qx.Bootstrap.isArray(last[name])) {
                if (!qx.Bootstrap.isArray(next[name])) {
                  next[name] = [next[name]];
                }

                transforms[name] = [];

                for (var j = 0; j < next[name].length; j++) {
                  var item = next[name][j] + "";
                  var x = calculationIndex / stepsToNext;
                  transforms[name][j] = this.__getNextValue__P_182_10(item, last[name], timing, x);
                }
              } else {
                var x = calculationIndex / stepsToNext;
                transforms[name] = this.__getNextValue__P_182_10(nItem, last[name], timing, x);
              } // color values

            } else if (nItem.charAt(0) == "#") {
              // get the two values from the frames as RGB arrays
              var value0 = qx.util.ColorUtil.cssStringToRgb(last[name]);
              var value1 = qx.util.ColorUtil.cssStringToRgb(nItem);
              var stepValue = []; // calculate every color channel

              for (var j = 0; j < value0.length; j++) {
                var range = value0[j] - value1[j];
                var x = calculationIndex / stepsToNext;
                var timingX = qx.bom.AnimationFrame.calculateTiming(timing, x);
                stepValue[j] = parseInt(value0[j] - range * timingX, 10);
              }

              delta[i][name] = qx.util.ColorUtil.rgbToHexString(stepValue);
            } else if (!isNaN(parseFloat(nItem))) {
              var x = calculationIndex / stepsToNext;
              delta[i][name] = this.__getNextValue__P_182_10(nItem, last[name], timing, x);
            } else {
              delta[i][name] = last[name] + "";
            }
          } // save all transformations in the delta values


          if (transforms) {
            var transformStyle = qx.bom.element.Transform.getCss(transforms).split(":");

            if (transformStyle.length > 1) {
              delta[i][transformStyle[0]] = transformStyle[1].replace(";", "");
            }
          }

          calculationIndex++;
        } // make sure the last key frame is right


        delta[delta.length - 1] = this.__normalizeKeyFrameTransforms__P_182_9(keyFrames[100]);
        return delta;
      },

      /**
       * Ties to parse out the unit of the given value.
       *
       * @param item {String} A CSS value including its unit.
       * @return {String} The unit of the given value.
       */
      __getUnit__P_182_8: function __getUnit__P_182_8(item) {
        return item.substring((parseFloat(item) + "").length, item.length);
      },

      /**
       * Returns the next value based on the given arguments.
       *
       * @param nextItem {String} The CSS value of the next frame
       * @param lastItem {String} The CSS value of the last frame
       * @param timing {String} The timing used for the calculation
       * @param x {Number} The x position of the animation on the time axis
       * @return {String} The calculated value including its unit.
       */
      __getNextValue__P_182_10: function __getNextValue__P_182_10(nextItem, lastItem, timing, x) {
        var range = parseFloat(nextItem) - parseFloat(lastItem);
        return parseFloat(lastItem) + range * qx.bom.AnimationFrame.calculateTiming(timing, x) + this.__getUnit__P_182_8(nextItem);
      },

      /**
       * Internal helper for the {@link qx.bom.element.AnimationHandle} to play
       * the animation.
       * @internal
       * @param handle {qx.bom.element.AnimationHandle} The hand which
       *   represents the animation.
       * @return {qx.bom.element.AnimationHandle} The handle for chaining.
       */
      play: function play(handle) {
        handle.emit("start", handle.el);
        var id = window.setInterval(function () {
          handle.repeatSteps--;
          var values = handle.delta[handle.i % handle.steps]; // save the init values

          if (handle.i === 0) {
            for (var name in values) {
              if (handle.initValues[name] === undefined) {
                // animate element property
                if (handle.el[name] !== undefined) {
                  handle.initValues[name] = handle.el[name];
                } // animate CSS property
                else if (qx.bom.element.Style) {
                  handle.initValues[name] = qx.bom.element.Style.get(handle.el, qx.lang.String.camelCase(name));
                } else {
                  handle.initValues[name] = handle.el.style[qx.lang.String.camelCase(name)];
                }
              }
            }
          }

          qx.bom.element.AnimationJs.__applyStyles__P_182_11(handle.el, values);

          handle.i++; // iteration condition

          if (handle.i % handle.steps == 0) {
            handle.emit("iteration", handle.el);

            if (handle.desc.alternate) {
              handle.delta.reverse();
            }
          } // end condition


          if (handle.repeatSteps < 0) {
            qx.bom.element.AnimationJs.stop(handle);
          }
        }, handle.stepTime);
        handle.animationId = id;
        return handle;
      },

      /**
       * Internal helper for the {@link qx.bom.element.AnimationHandle} to pause
       * the animation.
       * @internal
       * @param handle {qx.bom.element.AnimationHandle} The hand which
       *   represents the animation.
       * @return {qx.bom.element.AnimationHandle} The handle for chaining.
       */
      pause: function pause(handle) {
        // stop the interval
        window.clearInterval(handle.animationId);
        handle.animationId = null;
        return handle;
      },

      /**
       * Internal helper for the {@link qx.bom.element.AnimationHandle} to stop
       * the animation.
       * @internal
       * @param handle {qx.bom.element.AnimationHandle} The hand which
       *   represents the animation.
       * @return {qx.bom.element.AnimationHandle} The handle for chaining.
       */
      stop: function stop(handle) {
        var desc = handle.desc;
        var el = handle.el;
        var initValues = handle.initValues;

        if (handle.animationId) {
          window.clearInterval(handle.animationId);
        } // clear the delay if the animation has not been started


        if (handle.delayId) {
          window.clearTimeout(handle.delayId);
        } // check if animation is already stopped


        if (el == undefined) {
          return handle;
        } // if we should keep a frame


        var keep = desc.keep;

        if (keep != undefined && !handle.stopped) {
          if (handle.reverse || desc.alternate && desc.repeat && desc.repeat % 2 == 0) {
            keep = 100 - keep;
          }

          this.__applyStyles__P_182_11(el, this.__normalizeKeyFrameTransforms__P_182_9(desc.keyFrames[keep]));
        } else {
          this.__applyStyles__P_182_11(el, initValues);
        }

        el.$$animation = null;
        handle.el = null;
        handle.ended = true;
        handle.animationId = null;
        handle.emit("end", el);
        return handle;
      },

      /**
       * Takes care of the repeat key of the description.
       * @param steps {Integer} The number of steps one iteration would take.
       * @param repeat {Integer|String} It can be either a number how often the
       * animation should be repeated or the string 'infinite'.
       * @return {Integer} The number of steps to animate.
       */
      __applyRepeat__P_182_7: function __applyRepeat__P_182_7(steps, repeat) {
        if (repeat == undefined) {
          return steps;
        }

        if (repeat == "infinite") {
          return Number.MAX_VALUE;
        }

        return steps * repeat;
      },

      /**
       * Central method to apply css styles and element properties.
       * @param el {Element} The DOM element to apply the styles.
       * @param styles {Map} A map containing styles and values.
       */
      __applyStyles__P_182_11: function __applyStyles__P_182_11(el, styles) {
        for (var key in styles) {
          // ignore undefined values (might be a bad detection)
          if (styles[key] === undefined) {
            continue;
          } // apply element property value - only if a CSS property
          // is *not* available


          if (typeof el.style[key] === "undefined" && key in el) {
            el[key] = styles[key];
            continue;
          }

          var name = qx.bom.Style.getPropertyName(key) || key;

          if (qx.bom.element.Style) {
            qx.bom.element.Style.set(el, name, styles[key]);
          } else {
            el.style[name] = styles[key];
          }
        }
      },

      /**
       * Dynamic calculation of the steps time considering a max step time.
       * @param duration {Number} The duration of the animation.
       * @param keys {Array} An array containing the ordered set of key frame keys.
       * @return {Integer} The best suited step time.
       */
      __getStepTime__P_182_4: function __getStepTime__P_182_4(duration, keys) {
        // get min difference
        var minDiff = 100;

        for (var i = 0; i < keys.length - 1; i++) {
          minDiff = Math.min(minDiff, keys[i + 1] - keys[i]);
        }

        var stepTime = duration * minDiff / 100;

        while (stepTime > this.__maxStepTime__P_182_0) {
          stepTime = stepTime / 2;
        }

        return Math.round(stepTime);
      },

      /**
       * Helper which returns the ordered keys of the key frame map.
       * @param keyFrames {Map} The map of key frames.
       * @return {Array} An ordered list of keys.
       */
      __getOrderedKeys__P_182_3: function __getOrderedKeys__P_182_3(keyFrames) {
        var keys = Object.keys(keyFrames);

        for (var i = 0; i < keys.length; i++) {
          keys[i] = parseInt(keys[i], 10);
        }

        keys.sort(function (a, b) {
          return a - b;
        });
        return keys;
      }
    }
  });
  qx.bom.element.AnimationJs.$$dbClassInfo = $$dbClassInfo;
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
      "qx.html.Element": {
        "construct": true,
        "require": true
      },
      "qx.bom.element.Decoration": {},
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
  
  ************************************************************************ */

  /**
   * This is a simple image class using the low level image features of
   * qooxdoo and wraps it for the qx.html layer.
   */
  qx.Class.define("qx.html.Image", {
    extend: qx.html.Element,

    /**
     * Creates a new Image
     *
     * @see constructor for {Element}
     */
    construct: function construct(tagName, styles, attributes) {
      qx.html.Element.constructor.call(this, tagName, styles, attributes);
      this.registerProperty("source", null, this._setSourceProperty, function (writer, key, property) {
        return property.value && writer("src=" + JSON.stringify(property.value));
      });
      this.registerProperty("scale", null, this._setScaleProperty);
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __paddingTop__P_126_0: null,
      __paddingLeft__P_126_1: null,
      // this member variable is only used for IE browsers to be able
      // to the tag name which will be set. This is heavily connected to the runtime
      // change of decorators and the use of external (=unmanaged images). It is
      // necessary to be able to determine what tag will be used e.g. before the
      // ImageLoader has finished its loading of an external image.
      // See Bug #3894 for more details
      tagNameHint: null,

      /**
       * Maps padding to background-position if the widget is rendered as a
       * background image
       * @param paddingLeft {Integer} left padding value
       * @param paddingTop {Integer} top padding value
       */
      setPadding: function setPadding(paddingLeft, paddingTop) {
        this.__paddingLeft__P_126_1 = paddingLeft;
        this.__paddingTop__P_126_0 = paddingTop;

        if (this.getNodeName() == "div") {
          this.setStyle("backgroundPosition", paddingLeft + "px " + paddingTop + "px");
        }
      },

      /*
      ---------------------------------------------------------------------------
        ELEMENT API
      ---------------------------------------------------------------------------
      */

      /**
       * Implementation of setter for the "source" property
       *
       * @param value {String?} value to set
       */
      _setSourceProperty: function _setSourceProperty(value) {
        var elem = this.getDomElement(); // To prevent any wrong background-position or -repeat it is necessary
        // to reset those styles whenever a background-image is updated.
        // This is only necessary if any backgroundImage was set already.
        // See bug #3376 for details

        var styles = this.getAllStyles() || {};

        if (this.getNodeName() == "div" && this.getStyle("backgroundImage")) {
          styles.backgroundRepeat = null;
        }

        var source = this._getProperty("source");

        var scale = this._getProperty("scale");

        var repeat = scale ? "scale" : "no-repeat"; // Source can be null in certain circumstances.
        // See bug #3701 for details.

        if (source != null) {
          // Normalize "" to null
          source = source || null;
          styles.paddingTop = this.__paddingTop__P_126_0;
          styles.paddingLeft = this.__paddingLeft__P_126_1;
          qx.bom.element.Decoration.update(elem, source, repeat, styles);
        }
      },
      _setScaleProperty: function _setScaleProperty(value) {// Nothing
      },
      // overridden
      _removeProperty: function _removeProperty(key, direct) {
        if (key == "source") {
          // Work-around check for null in #_applyProperty, introduced with fix
          // for bug #3701. Use empty string that is later normalized to null.
          // This fixes bug #4524.
          this._setProperty(key, "", direct);
        } else {
          this._setProperty(key, null, direct);
        }
      },
      // overridden
      _createDomElement: function _createDomElement() {
        var scale = this._getProperty("scale");

        var repeat = scale ? "scale" : "no-repeat";

        if (qx.core.Environment.get("engine.name") == "mshtml") {
          var source = this._getProperty("source");

          if (this.tagNameHint != null) {
            this.setNodeName(this.tagNameHint);
          } else {
            this.setNodeName(qx.bom.element.Decoration.getTagName(repeat, source));
          }
        } else {
          this.setNodeName(qx.bom.element.Decoration.getTagName(repeat));
        }

        return qx.html.Image.superclass.prototype._createDomElement.call(this);
      },
      // overridden
      // be sure that style attributes are merged and not overwritten
      _copyData: function _copyData(fromMarkup, propertiesFromDom) {
        return qx.html.Image.superclass.prototype._copyData.call(this, true, propertiesFromDom);
      },

      /*
      ---------------------------------------------------------------------------
        IMAGE API
      ---------------------------------------------------------------------------
      */

      /**
       * Configures the image source
       *
       * @param value {Boolean} Whether the HTML mode should be used.
       * @return {qx.html.Label} This instance for for chaining support.
       */
      setSource: function setSource(value) {
        this._setProperty("source", value);

        return this;
      },

      /**
       * Returns the image source.
       *
       * @return {String} Current image source.
       */
      getSource: function getSource() {
        return this._getProperty("source");
      },

      /**
       * Resets the current source to null which means that no image
       * is shown anymore.
       * @return {qx.html.Image} The current instance for chaining
       */
      resetSource: function resetSource() {
        // webkit browser do not allow to remove the required "src" attribute.
        // If removing the attribute the old image is still visible.
        if (qx.core.Environment.get("engine.name") == "webkit") {
          this._setProperty("source", "qx/static/blank.gif");
        } else {
          this._removeProperty("source", true);
        }

        return this;
      },

      /**
       * Whether the image should be scaled or not.
       *
       * @param value {Boolean} Scale the image
       * @return {qx.html.Label} This instance for for chaining support.
       */
      setScale: function setScale(value) {
        this._setProperty("scale", value);

        return this;
      },

      /**
       * Returns whether the image is scaled or not.
       *
       * @return {Boolean} Whether the image is scaled
       */
      getScale: function getScale() {
        return this._getProperty("scale");
      }
    }
  });
  qx.html.Image.$$dbClassInfo = $$dbClassInfo;
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
      },
      "qx.bom.Iframe": {}
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
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * A cross browser iframe instance.
   */
  qx.Class.define("qx.html.Iframe", {
    extend: qx.html.Element,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * Wrapper for the HTML Iframe element.
     * @param url {String} Location which should be loaded inside the Iframe.
     * @param styles {Map?null} optional map of CSS styles, where the key is the name
     *    of the style and the value is the value to use.
     * @param attributes {Map?null} optional map of element attributes, where the
     *    key is the name of the attribute and the value is the value to use.
     */
    construct: function construct(url, styles, attributes) {
      qx.html.Element.constructor.call(this, "iframe", styles, attributes);
      this.registerProperty("source", null, this._setSourceProperty);
      this.setSource(url);
      this.addListener("navigate", this.__onNavigate__P_183_0, this); // add yourself to the element queue to enforce the creation of DOM element

      qx.html.Element._modified[this.toHashCode()] = this;

      qx.html.Element._scheduleFlush("element");
    },

    /*
     *****************************************************************************
        EVENTS
     *****************************************************************************
     */
    events: {
      /**
       * The "load" event is fired after the iframe content has successfully been loaded.
       */
      load: "qx.event.type.Event",

      /**
       * The "navigate" event is fired whenever the location of the iframe
       * changes.
       *
       * Useful to track user navigation and internally used to keep the source
       * property in sync. Only works when the destination source is of same
       * origin than the page embedding the iframe.
       */
      navigate: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /*
      ---------------------------------------------------------------------------
        ELEMENT API
      ---------------------------------------------------------------------------
      */

      /**
       * Implementation of setter for the "source" property
       *
       * @param value {String?} value to set
       */
      _setSourceProperty: function _setSourceProperty(value) {
        var element = this.getDomElement();
        var currentUrl = qx.bom.Iframe.queryCurrentUrl(element); // Skip if frame is already on URL.
        //
        // When URL of Iframe and source property get out of sync, the source
        // property needs to be updated [BUG #4481]. This is to make sure the
        // same source is not set twice on the BOM level.

        if (value === currentUrl) {
          return;
        }

        qx.bom.Iframe.setSource(element, value);
      },
      // overridden
      _createDomElement: function _createDomElement() {
        return qx.bom.Iframe.create();
      },

      /*
      ---------------------------------------------------------------------------
        IFRAME API
      ---------------------------------------------------------------------------
      */

      /**
       * Get the DOM window object of an iframe.
       *
       * @return {Window} The DOM window object of the iframe.
       */
      getWindow: function getWindow() {
        var element = this.getDomElement();

        if (element) {
          return qx.bom.Iframe.getWindow(element);
        } else {
          return null;
        }
      },

      /**
       * Get the DOM document object of an iframe.
       *
       * @return {Document} The DOM document object of the iframe.
       */
      getDocument: function getDocument() {
        var element = this.getDomElement();

        if (element) {
          return qx.bom.Iframe.getDocument(element);
        } else {
          return null;
        }
      },

      /**
       * Get the HTML body element of the iframe.
       *
       * @return {Element} The DOM node of the <code>body</code> element of the iframe.
       */
      getBody: function getBody() {
        var element = this.getDomElement();

        if (element) {
          return qx.bom.Iframe.getBody(element);
        } else {
          return null;
        }
      },

      /**
       * Sets iframe's source attribute to given value
       *
       * @param source {String} URL to be set.
       * @return {qx.html.Iframe} The current instance for chaining
       */
      setSource: function setSource(source) {
        // the source needs to be applied directly in case the iFrame is hidden
        this._setProperty("source", source, true);

        return this;
      },

      /**
       * Get the current source.
       *
       * @return {String} The iframe's source
       */
      getSource: function getSource() {
        return this._getProperty("source");
      },

      /**
       * Sets iframe's name attribute to given value
       *
       * @param name {String} Name to be set.
       * @return {qx.html.Iframe} The current instance for chaining
       */
      setName: function setName(name) {
        this.setAttribute("name", name);
        return this;
      },

      /**
       * Get the current name.
       *
       * @return {String} The iframe's name.
       */
      getName: function getName() {
        return this.getAttribute("name");
      },

      /**
       * Reloads iframe
       */
      reload: function reload() {
        var element = this.getDomElement();

        if (element) {
          var url = this.getSource();
          this.setSource(null);
          this.setSource(url);
        }
      },

      /*
      ---------------------------------------------------------------------------
        LISTENER
      ---------------------------------------------------------------------------
      */

      /**
       * Handle user navigation. Sync actual URL of iframe with source property.
       *
       * @param e {qx.event.type.Data} navigate event
       */
      __onNavigate__P_183_0: function __onNavigate__P_183_0(e) {
        var actualUrl = e.getData();

        if (actualUrl) {
          this.setSource(actualUrl);
        }
      }
    }
  });
  qx.html.Iframe.$$dbClassInfo = $$dbClassInfo;
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
      "qx.html.Element": {
        "construct": true,
        "require": true
      },
      "qx.bom.Input": {},
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * A Input wrap any valid HTML input element and make it accessible
   * through the normalized qooxdoo element interface.
   */
  qx.Class.define("qx.html.Input", {
    extend: qx.html.Element,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param type {String} The type of the input field. Valid values are
     *   <code>text</code>, <code>textarea</code>, <code>select</code>,
     *   <code>checkbox</code>, <code>radio</code>, <code>password</code>,
     *   <code>hidden</code>, <code>submit</code>, <code>image</code>,
     *   <code>file</code>, <code>search</code>, <code>reset</code>,
     *   <code>select</code> and <code>textarea</code>.
     * @param styles {Map?null} optional map of CSS styles, where the key is the name
     *    of the style and the value is the value to use.
     * @param attributes {Map?null} optional map of element attributes, where the
     *    key is the name of the attribute and the value is the value to use.
     */
    construct: function construct(type, styles, attributes) {
      // Update node name correctly
      if (type === "select" || type === "textarea") {
        var nodeName = type;
      } else {
        nodeName = "input";
      }

      qx.html.Element.constructor.call(this, nodeName, styles, attributes);
      this.__type__P_184_0 = type;
      this.registerProperty("value", this._getValueProperty, this._setValueProperty);
      this.registerProperty("wrap", null, this._setWrapProperty);
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __type__P_184_0: null,
      // used for webkit only
      __selectable__P_184_1: null,
      __enabled__P_184_2: null,

      /*
      ---------------------------------------------------------------------------
        ELEMENT API
      ---------------------------------------------------------------------------
      */
      _useNodeImpl: function _useNodeImpl(domNode, newChildren) {
        qx.html.Input.superclass.prototype._useNodeImpl.call(this, domNode, newChildren);
      },
      //overridden
      _createDomElement: function _createDomElement() {
        return qx.bom.Input.create(this.__type__P_184_0);
      },

      /**
       * Implementation of setter for the "value" property
       *
       * @param value {String?} value to set
       */
      _setValueProperty: function _setValueProperty(value) {
        var element = this.getDomElement();
        qx.bom.Input.setValue(element, value);
      },

      /**
       * Implementation of getter for the "value" property
       *
       * @return {String?} value on the dom
       */
      _getValueProperty: function _getValueProperty() {
        var element = this.getDomElement();
        var value = qx.bom.Input.getValue(element);
        return value;
      },

      /**
       * Implementation of setter for the "wrap" property
       *
       * @param value {String?} value to set
       */
      _setWrapProperty: function _setWrapProperty(value) {
        var element = this.getDomElement();
        qx.bom.Input.setWrap(element, value); // qx.bom.Input#setWrap has the side-effect that the CSS property
        // overflow is set via DOM methods, causing queue and DOM to get
        // out of sync. Mirror all overflow properties to handle the case
        // when group and x/y property differ.

        this.setStyle("overflow", element.style.overflow, true);
        this.setStyle("overflowX", element.style.overflowX, true);
        this.setStyle("overflowY", element.style.overflowY, true);
      },

      /**
       * Set the input element enabled / disabled.
       * Webkit needs a special treatment because the set color of the input
       * field changes automatically. Therefore, we use
       * <code>-webkit-user-modify: read-only</code> and
       * <code>-webkit-user-select: none</code>
       * for disabling the fields in webkit. All other browsers use the disabled
       * attribute.
       *
       * @param value {Boolean} true, if the input element should be enabled.
       */
      setEnabled: function setEnabled(value) {
        this.__enabled__P_184_2 = value;
        this.setAttribute("disabled", value === false);

        if (qx.core.Environment.get("engine.name") == "webkit") {
          if (!value) {
            this.setStyles({
              userModify: "read-only",
              userSelect: "none"
            });
          } else {
            this.setStyles({
              userModify: null,
              userSelect: this.__selectable__P_184_1 ? null : "none"
            });
          }
        }
      },

      /**
       * Set whether the element is selectable. It uses the qooxdoo attribute
       * qxSelectable with the values 'on' or 'off'.
       * In webkit, a special css property will be used and checks for the
       * enabled state.
       *
       * @param value {Boolean} True, if the element should be selectable.
       */
      setSelectable: qx.core.Environment.select("engine.name", {
        webkit: function webkit(value) {
          this.__selectable__P_184_1 = value; // Only apply the value when it is enabled

          qx.html.Input.superclass.prototype.setSelectable.call(this, this.__enabled__P_184_2 && value);
        },
        "default": function _default(value) {
          qx.html.Input.superclass.prototype.setSelectable.call(this, value);
        }
      }),

      /*
      ---------------------------------------------------------------------------
        INPUT API
      ---------------------------------------------------------------------------
      */

      /**
       * Sets the value of the input element.
       *
       * @param value {var} the new value
       * @return {qx.html.Input} This instance for for chaining support.
       */
      setValue: function setValue(value) {
        var element = this.getDomElement();

        if (element) {
          // Do not overwrite when already correct (on input events)
          // This is needed to keep caret position while typing.
          if (element.value != value) {
            qx.bom.Input.setValue(element, value);
          }
        } else {
          this._setProperty("value", value);
        }

        return this;
      },

      /**
       * Get the current value.
       *
       * @return {String} The element's current value.
       */
      getValue: function getValue() {
        var element = this.getDomElement();

        if (element) {
          return qx.bom.Input.getValue(element);
        }

        return this._getProperty("value") || "";
      },

      /**
       * Sets the text wrap behavior of a text area element.
       *
       * This property uses the style property "wrap" (IE) respectively "whiteSpace"
       *
       * @param wrap {Boolean} Whether to turn text wrap on or off.
       * @param direct {Boolean?false} Whether the execution should be made
       *  directly when possible
       * @return {qx.html.Input} This instance for for chaining support.
       */
      setWrap: function setWrap(wrap, direct) {
        if (this.__type__P_184_0 === "textarea") {
          this._setProperty("wrap", wrap, direct);
        } else {
          throw new Error("Text wrapping is only support by textareas!");
        }

        return this;
      },

      /**
       * Gets the text wrap behavior of a text area element.
       *
       * This property uses the style property "wrap" (IE) respectively "whiteSpace"
       *
       * @return {Boolean} Whether wrapping is enabled or disabled.
       */
      getWrap: function getWrap() {
        if (this.__type__P_184_0 === "textarea") {
          return this._getProperty("wrap");
        } else {
          throw new Error("Text wrapping is only support by textareas!");
        }
      }
    }
  });
  qx.html.Input.$$dbClassInfo = $$dbClassInfo;
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
      "qx.util.Wheel": {}
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
       * Fabian Jakobs (fjakobs)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Mouse wheel event object.
   */
  qx.Class.define("qx.event.type.MouseWheel", {
    extend: qx.event.type.Mouse,
    members: {
      // overridden
      stop: function stop() {
        this.stopPropagation();
        this.preventDefault();
      },

      /**
       * Get the amount the wheel has been scrolled
       *
       * @param axis {String?} Optional parameter which defines the scroll axis.
       *   The value can either be <code>"x"</code> or <code>"y"</code>.
       * @return {Integer} Scroll wheel movement for the given axis. If no axis
       *   is given, the y axis is used.
       */
      getWheelDelta: function getWheelDelta(axis) {
        return qx.util.Wheel.getDelta(this._native, axis);
      }
    }
  });
  qx.event.type.MouseWheel.$$dbClassInfo = $$dbClassInfo;
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
   * Orientation event object.
   */
  qx.Class.define("qx.event.type.Orientation", {
    extend: qx.event.type.Event,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __orientation__P_193_0: null,
      __mode__P_193_1: null,

      /**
       * Initialize the fields of the event. The event must be initialized before
       * it can be dispatched.
       *
       * @param orientation {String} One of <code>0</code>, <code>90</code> or <code>-90</code>
       * @param mode {String} <code>landscape</code> or <code>portrait</code>
       * @return {qx.event.type.Orientation} The initialized event instance
       */
      init: function init(orientation, mode) {
        qx.event.type.Orientation.superclass.prototype.init.call(this, false, false);
        this.__orientation__P_193_0 = orientation;
        this.__mode__P_193_1 = mode;
        return this;
      },

      /**
       * Get a copy of this object
       *
       * @param embryo {qx.event.type.Orientation?null} Optional event class, which will
       *     be configured using the data of this event instance. The event must be
       *     an instance of this event class. If the data is <code>null</code>,
       *     a new pooled instance is created.
       *
       * @return {qx.event.type.Orientation} a copy of this object
       */
      clone: function clone(embryo) {
        var clone = qx.event.type.Orientation.superclass.prototype.clone.call(this, embryo);
        clone.__orientation__P_193_0 = this.__orientation__P_193_0;
        clone.__mode__P_193_1 = this.__mode__P_193_1;
        return clone;
      },

      /**
       * Returns the current orientation of the viewport in degree.
       *
       * All possible values and their meaning:
       *
       * * <code>0</code>: "Portrait"
       * * <code>-90</code>: "Landscape (right, screen turned clockwise)"
       * * <code>90</code>: "Landscape (left, screen turned counterclockwise)"
       * * <code>180</code>: "Portrait (upside-down portrait)"
       *
       * @return {Integer} The current orientation in degree
       */
      getOrientation: function getOrientation() {
        return this.__orientation__P_193_0;
      },

      /**
       * Whether the viewport orientation is currently in landscape mode.
       *
       * @return {Boolean} <code>true</code> when the viewport orientation
       *     is currently in landscape mode.
       */
      isLandscape: function isLandscape() {
        return this.__mode__P_193_1 == "landscape";
      },

      /**
       * Whether the viewport orientation is currently in portrait mode.
       *
       * @return {Boolean} <code>true</code> when the viewport orientation
       *     is currently in portrait mode.
       */
      isPortrait: function isPortrait() {
        return this.__mode__P_193_1 == "portrait";
      }
    }
  });
  qx.event.type.Orientation.$$dbClassInfo = $$dbClassInfo;
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
       2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
       * Tino Butz (tbtz)
  
  ************************************************************************ */

  /**
   * Touch event object.
   *
   * For more information see:
   *     https://developer.apple.com/library/safari/#documentation/UserExperience/Reference/TouchEventClassReference/TouchEvent/TouchEvent.html
   */
  qx.Class.define("qx.event.type.Touch", {
    extend: qx.event.type.Dom,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _cloneNativeEvent: function _cloneNativeEvent(nativeEvent, clone) {
        var clone = qx.event.type.Touch.superclass.prototype._cloneNativeEvent.call(this, nativeEvent, clone);

        clone.pageX = nativeEvent.pageX;
        clone.pageY = nativeEvent.pageY;
        clone.offsetX = nativeEvent.offsetX;
        clone.offsetY = nativeEvent.offsetY; // Workaround for BUG #6491

        clone.layerX = nativeEvent.offsetX || nativeEvent.layerX;
        clone.layerY = nativeEvent.offsetY || nativeEvent.layerY;
        clone.scale = nativeEvent.scale;
        clone.rotation = nativeEvent.rotation;
        clone._rotation = nativeEvent._rotation;
        clone.delta = nativeEvent.delta;
        clone.srcElement = nativeEvent.srcElement;
        clone.targetTouches = [];

        for (var i = 0; i < nativeEvent.targetTouches.length; i++) {
          clone.targetTouches[i] = nativeEvent.targetTouches[i];
        }

        clone.changedTouches = [];

        for (i = 0; i < nativeEvent.changedTouches.length; i++) {
          clone.changedTouches[i] = nativeEvent.changedTouches[i];
        }

        clone.touches = [];

        for (i = 0; i < nativeEvent.touches.length; i++) {
          clone.touches[i] = nativeEvent.touches[i];
        }

        return clone;
      },
      // overridden
      stop: function stop() {
        this.stopPropagation();
      },

      /**
       * Returns an array of native Touch objects representing all current
       * touches on the document.
       * Returns an empty array for the "touchend" event.
       *
       * @return {Object[]} Array of touch objects. For more information see:
       *     https://developer.apple.com/library/safari/#documentation/UserExperience/Reference/TouchClassReference/Touch/Touch.html
       */
      getAllTouches: function getAllTouches() {
        return this._native.touches;
      },

      /**
       * Returns an array of native Touch objects representing all touches
       * associated with the event target element.
       * Returns an empty array for the "touchend" event.
       *
       * @return {Object[]} Array of touch objects. For more information see:
       *     https://developer.apple.com/library/safari/#documentation/UserExperience/Reference/TouchClassReference/Touch/Touch.html
       */
      getTargetTouches: function getTargetTouches() {
        return this._native.targetTouches;
      },

      /**
       * Returns an array of native Touch objects representing all touches of
       * the target element that changed in this event.
       *
       * On the "touchstart" event the array contains all touches that were
       * added to the target element.
       * On the "touchmove" event the array contains all touches that were
       * moved on the target element.
       * On the "touchend" event the array contains all touches that used
       * to be on the target element.
       *
       * @return {Object[]} Array of touch objects. For more information see:
       *     https://developer.apple.com/library/safari/#documentation/UserExperience/Reference/TouchClassReference/Touch/Touch.html
       */
      getChangedTargetTouches: function getChangedTargetTouches() {
        return this._native.changedTouches;
      },

      /**
       * Checks whether more than one touch is associated with the event target
       * element.
       *
       * @return {Boolean} Is multi-touch
       */
      isMultiTouch: function isMultiTouch() {
        return this.__getEventSpecificTouches__P_187_0().length > 1;
      },

      /**
       * Returns the distance between two fingers since the start of the event.
       * The distance is a multiplier of the initial distance.
       * Initial value: 1.0.
       * Gestures:
       * < 1.0, pinch close / zoom out.
       * > 1.0, pinch open / to zoom in.
       *
       * @return {Float} The scale distance between two fingers
       */
      getScale: function getScale() {
        return this._native.scale;
      },

      /**
       * Returns the delta of the rotation since the start of the event, in degrees.
       * Initial value is 0.0
       * Clockwise > 0
       * Counter-clockwise < 0.
       *
       * @return {Float} The rotation delta
       */
      getRotation: function getRotation() {
        if (typeof this._native._rotation === "undefined") {
          return this._native.rotation;
        } else {
          return this._native._rotation;
        }
      },

      /**
       * Returns an array with the calculated delta coordinates of all active touches,
       * relative to the position on <code>touchstart</code> event.
       *
       * @return {Array} an array with objects for each active touch which contains the delta as <code>x</code> and
       * <code>y</code>, the touch identifier as <code>identifier</code> and the movement axis as <code>axis</code>.
       */
      getDelta: function getDelta() {
        return this._native.delta;
      },

      /**
       * Get the horizontal position at which the event occurred relative to the
       * left of the document. This property takes into account any scrolling of
       * the page.
       *
       * @param touchIndex {Integer ? 0} The index of the Touch object
       * @return {Integer} The horizontal position of the touch in the document.
       */
      getDocumentLeft: function getDocumentLeft(touchIndex) {
        return this.__getEventSpecificTouch__P_187_1(touchIndex).pageX;
      },

      /**
       * Get the vertical position at which the event occurred relative to the
       * top of the document. This property takes into account any scrolling of
       * the page.
       *
       * @param touchIndex {Integer ? 0} The index of the Touch object
       * @return {Integer} The vertical position of the touch in the document.
       */
      getDocumentTop: function getDocumentTop(touchIndex) {
        return this.__getEventSpecificTouch__P_187_1(touchIndex).pageY;
      },

      /**
       * Get the horizontal coordinate at which the event occurred relative to
       * the origin of the screen coordinate system.
       *
       * @param touchIndex {Integer ? 0} The index of the Touch object
       * @return {Integer} The horizontal position of the touch
       */
      getScreenLeft: function getScreenLeft(touchIndex) {
        return this.__getEventSpecificTouch__P_187_1(touchIndex).screenX;
      },

      /**
       * Get the vertical coordinate at which the event occurred relative to
       * the origin of the screen coordinate system.
       *
       * @param touchIndex {Integer ? 0} The index of the Touch object
       * @return {Integer} The vertical position of the touch
       */
      getScreenTop: function getScreenTop(touchIndex) {
        return this.__getEventSpecificTouch__P_187_1(touchIndex).screenY;
      },

      /**
       * Get the the horizontal coordinate at which the event occurred relative
       * to the viewport.
       *
       * @param touchIndex {Integer ? 0} The index of the Touch object
       * @return {Integer} The horizontal position of the touch
       */
      getViewportLeft: function getViewportLeft(touchIndex) {
        return this.__getEventSpecificTouch__P_187_1(touchIndex).clientX;
      },

      /**
       * Get the vertical coordinate at which the event occurred relative
       * to the viewport.
       *
       * @param touchIndex {Integer ? 0} The index of the Touch object
       * @return {Integer} The vertical position of the touch
       */
      getViewportTop: function getViewportTop(touchIndex) {
        return this.__getEventSpecificTouch__P_187_1(touchIndex).clientY;
      },

      /**
       * Returns the unique identifier for a certain touch object.
       *
       * @param touchIndex {Integer ? 0} The index of the Touch object
       * @return {Integer} Unique identifier of the touch object
       */
      getIdentifier: function getIdentifier(touchIndex) {
        return this.__getEventSpecificTouch__P_187_1(touchIndex).identifier;
      },

      /**
       * Returns an event specific touch on the target element. This function is
       * used as the "touchend" event only offers Touch objects in the
       * changedTouches array.
       *
       * @param touchIndex {Integer ? 0} The index of the Touch object to
       *     retrieve
       * @return {Object} A native Touch object
       */
      __getEventSpecificTouch__P_187_1: function __getEventSpecificTouch__P_187_1(touchIndex) {
        touchIndex = touchIndex == null ? 0 : touchIndex;
        return this.__getEventSpecificTouches__P_187_0()[touchIndex];
      },

      /**
       * Returns the event specific touches on the target element. This function
       * is used as the "touchend" event only offers Touch objects in the
       * changedTouches array.
       *
       * @return {Object[]} Array of native Touch objects
       */
      __getEventSpecificTouches__P_187_0: function __getEventSpecificTouches__P_187_0() {
        var touches = this._isTouchEnd() ? this.getChangedTargetTouches() : this.getTargetTouches();
        return touches;
      },

      /**
       * Indicates if the event occurs during the "touchend" phase. Needed to
       * determine the event specific touches. Override this method if you derive
       * from this class and want to indicate that the specific event occurred
       * during the "touchend" phase.
       *
       * @return {Boolean} Whether the event occurred during the "touchend" phase
       */
      _isTouchEnd: function _isTouchEnd() {
        return this.getType() == "touchend" || this.getType() == "touchcancel";
      }
    }
  });
  qx.event.type.Touch.$$dbClassInfo = $$dbClassInfo;
})();

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Engine": {},
      "qx.bom.client.Browser": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["plugin.gears", "plugin.quicktime", "plugin.quicktime.version", "plugin.windowsmedia", "plugin.windowsmedia.version", "plugin.divx", "plugin.divx.version", "plugin.silverlight", "plugin.silverlight.version", "plugin.pdf", "plugin.pdf.version", "plugin.activex", "plugin.skype"],
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
   * Contains detection for QuickTime, Windows Media, DivX, Silverlight and gears.
   * If no version could be detected the version is set to an empty string as
   * default.
   *
   * This class is used by {@link qx.core.Environment} and should not be used
   * directly. Please check its class comment for details how to use it.
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Plugin", {
    statics: {
      /**
       * Checks for the availability of google gears plugin.
       *
       * @internal
       * @return {Boolean} <code>true</code> if gears is available
       */
      getGears: function getGears() {
        return !!(window.google && window.google.gears);
      },

      /**
       * Checks for ActiveX availability.
       *
       * @internal
       * @return {Boolean} <code>true</code> if ActiveX is available
       *
       * @ignore(window.ActiveXObject)
       */
      getActiveX: function getActiveX() {
        if (typeof window.ActiveXObject === "function") {
          return true;
        }

        try {
          // in IE11 Preview, ActiveXObject is undefined but instances can
          // still be created
          return window.ActiveXObject !== undefined && (_typeof(new window.ActiveXObject("Microsoft.XMLHTTP")) === "object" || _typeof(new window.ActiveXObject("MSXML2.DOMDocument.6.0")) === "object");
        } catch (ex) {
          return false;
        }
      },

      /**
       * Checks for Skypes 'Click to call' availability.
       *
       * @internal
       * @return {Boolean} <code>true</code> if the plugin is available.
       */
      getSkype: function getSkype() {
        // IE Support
        if (qx.bom.client.Plugin.getActiveX()) {
          try {
            new window.ActiveXObject("Skype.Detection");
            return true;
          } catch (e) {}
        }

        var mimeTypes = navigator.mimeTypes;

        if (mimeTypes) {
          // FF support
          if ("application/x-skype" in mimeTypes) {
            return true;
          } // webkit support


          for (var i = 0; i < mimeTypes.length; i++) {
            var desc = mimeTypes[i];

            if (desc.type.indexOf("skype.click2call") != -1) {
              return true;
            }
          }
        }

        return false;
      },

      /**
       * Database of supported features.
       * Filled with additional data at initialization
       */
      __db__P_188_0: {
        quicktime: {
          plugin: ["QuickTime"],
          control: "QuickTimeCheckObject.QuickTimeCheck.1" // call returns boolean: instance.IsQuickTimeAvailable(0)

        },
        wmv: {
          plugin: ["Windows Media"],
          control: "WMPlayer.OCX.7" // version string in: instance.versionInfo

        },
        divx: {
          plugin: ["DivX Web Player"],
          control: "npdivx.DivXBrowserPlugin.1"
        },
        silverlight: {
          plugin: ["Silverlight"],
          control: "AgControl.AgControl" // version string in: instance.version (Silverlight 1.0)
          // version string in: instance.settings.version (Silverlight 1.1)
          // version check possible using instance.IsVersionSupported

        },
        pdf: {
          plugin: ["Chrome PDF Viewer", "Adobe Acrobat"],
          control: "AcroPDF.PDF" // this is detecting Acrobat PDF version > 7 and Chrome PDF Viewer

        }
      },

      /**
       * Fetches the version of the quicktime plugin.
       * @return {String} The version of the plugin, if available,
       *   an empty string otherwise
       * @internal
       */
      getQuicktimeVersion: function getQuicktimeVersion() {
        var entry = qx.bom.client.Plugin.__db__P_188_0["quicktime"];
        return qx.bom.client.Plugin.__getVersion__P_188_1(entry.control, entry.plugin);
      },

      /**
       * Fetches the version of the windows media plugin.
       * @return {String} The version of the plugin, if available,
       *   an empty string otherwise
       * @internal
       */
      getWindowsMediaVersion: function getWindowsMediaVersion() {
        var entry = qx.bom.client.Plugin.__db__P_188_0["wmv"];
        return qx.bom.client.Plugin.__getVersion__P_188_1(entry.control, entry.plugin, true);
      },

      /**
       * Fetches the version of the divx plugin.
       * @return {String} The version of the plugin, if available,
       *   an empty string otherwise
       * @internal
       */
      getDivXVersion: function getDivXVersion() {
        var entry = qx.bom.client.Plugin.__db__P_188_0["divx"];
        return qx.bom.client.Plugin.__getVersion__P_188_1(entry.control, entry.plugin);
      },

      /**
       * Fetches the version of the silverlight plugin.
       * @return {String} The version of the plugin, if available,
       *   an empty string otherwise
       * @internal
       */
      getSilverlightVersion: function getSilverlightVersion() {
        var entry = qx.bom.client.Plugin.__db__P_188_0["silverlight"];
        return qx.bom.client.Plugin.__getVersion__P_188_1(entry.control, entry.plugin);
      },

      /**
       * Fetches the version of the pdf plugin.
       *
       * There are two built-in PDF viewer shipped with browsers:
       *
       * <ul>
       *  <li>Chrome PDF Viewer</li>
       *  <li>PDF.js (Firefox)</li>
       * </ul>
       *
       * While the Chrome PDF Viewer is implemented as plugin and therefore
       * detected by this method PDF.js is <strong>not</strong>.
       *
       * See the dedicated environment key (<em>plugin.pdfjs</em>) instead,
       * which you might check additionally.
       *
       * @return {String} The version of the plugin, if available,
       *  an empty string otherwise
       * @internal
       */
      getPdfVersion: function getPdfVersion() {
        var entry = qx.bom.client.Plugin.__db__P_188_0["pdf"];
        return qx.bom.client.Plugin.__getVersion__P_188_1(entry.control, entry.plugin);
      },

      /**
       * Checks if the quicktime plugin is available.
       * @return {Boolean} <code>true</code> if the plugin is available
       * @internal
       */
      getQuicktime: function getQuicktime() {
        var entry = qx.bom.client.Plugin.__db__P_188_0["quicktime"];
        return qx.bom.client.Plugin.__isAvailable__P_188_2(entry.control, entry.plugin);
      },

      /**
       * Checks if the windows media plugin is available.
       * @return {Boolean} <code>true</code> if the plugin is available
       * @internal
       */
      getWindowsMedia: function getWindowsMedia() {
        var entry = qx.bom.client.Plugin.__db__P_188_0["wmv"];
        return qx.bom.client.Plugin.__isAvailable__P_188_2(entry.control, entry.plugin, true);
      },

      /**
       * Checks if the divx plugin is available.
       * @return {Boolean} <code>true</code> if the plugin is available
       * @internal
       */
      getDivX: function getDivX() {
        var entry = qx.bom.client.Plugin.__db__P_188_0["divx"];
        return qx.bom.client.Plugin.__isAvailable__P_188_2(entry.control, entry.plugin);
      },

      /**
       * Checks if the silverlight plugin is available.
       * @return {Boolean} <code>true</code> if the plugin is available
       * @internal
       */
      getSilverlight: function getSilverlight() {
        var entry = qx.bom.client.Plugin.__db__P_188_0["silverlight"];
        return qx.bom.client.Plugin.__isAvailable__P_188_2(entry.control, entry.plugin);
      },

      /**
       * Checks if the pdf plugin is available.
       *
       * There are two built-in PDF viewer shipped with browsers:
       *
       * <ul>
       *  <li>Chrome PDF Viewer</li>
       *  <li>PDF.js (Firefox)</li>
       * </ul>
       *
       * While the Chrome PDF Viewer is implemented as plugin and therefore
       * detected by this method PDF.js is <strong>not</strong>.
       *
       * See the dedicated environment key (<em>plugin.pdfjs</em>) instead,
       * which you might check additionally.
       *
       * @return {Boolean} <code>true</code> if the plugin is available
       * @internal
       */
      getPdf: function getPdf() {
        var entry = qx.bom.client.Plugin.__db__P_188_0["pdf"];
        return qx.bom.client.Plugin.__isAvailable__P_188_2(entry.control, entry.plugin);
      },

      /**
       * Internal helper for getting the version of a given plugin.
       *
       * @param activeXName {String} The name which should be used to generate
       *   the test ActiveX Object.
       * @param pluginNames {Array} The names with which the plugins are listed in
       *   the navigator.plugins list.
       * @param forceActiveX {Boolean?false} Force detection using ActiveX
       *   for IE11 plugins that aren't listed in navigator.plugins
       * @return {String} The version of the plugin as string.
       */
      __getVersion__P_188_1: function __getVersion__P_188_1(activeXName, pluginNames, forceActiveX) {
        var available = qx.bom.client.Plugin.__isAvailable__P_188_2(activeXName, pluginNames, forceActiveX); // don't check if the plugin is not available


        if (!available) {
          return "";
        } // IE checks


        if (qx.bom.client.Engine.getName() == "mshtml" && (qx.bom.client.Browser.getDocumentMode() < 11 || forceActiveX)) {
          try {
            var obj = new window.ActiveXObject(activeXName);
            var version; // pdf version detection

            if (obj.GetVersions && obj.GetVersions()) {
              version = obj.GetVersions().split(",");

              if (version.length > 1) {
                version = version[0].split("=");

                if (version.length === 2) {
                  return version[1];
                }
              }
            }

            version = obj.versionInfo;

            if (version != undefined) {
              return version;
            }

            version = obj.version;

            if (version != undefined) {
              return version;
            }

            version = obj.settings.version;

            if (version != undefined) {
              return version;
            }
          } catch (ex) {
            return "";
          }

          return ""; // all other browsers
        } else {
          var plugins = navigator.plugins;
          var verreg = /([0-9]\.[0-9])/g;

          for (var i = 0; i < plugins.length; i++) {
            var plugin = plugins[i];

            for (var j = 0; j < pluginNames.length; j++) {
              if (plugin.name.indexOf(pluginNames[j]) !== -1) {
                if (verreg.test(plugin.name) || verreg.test(plugin.description)) {
                  return RegExp.$1;
                }
              }
            }
          }

          return "";
        }
      },

      /**
       * Internal helper for getting the availability of a given plugin.
       *
       * @param activeXName {String} The name which should be used to generate
       *   the test ActiveX Object.
       * @param pluginNames {Array} The names with which the plugins are listed in
       *   the navigator.plugins list.
       * @param forceActiveX {Boolean?false} Force detection using ActiveX
       *   for IE11 plugins that aren't listed in navigator.plugins
       * @return {Boolean} <code>true</code>, if the plugin available
       */
      __isAvailable__P_188_2: function __isAvailable__P_188_2(activeXName, pluginNames, forceActiveX) {
        // IE checks
        if (qx.bom.client.Engine.getName() == "mshtml" && (qx.bom.client.Browser.getDocumentMode() < 11 || forceActiveX)) {
          if (!this.getActiveX()) {
            return false;
          }

          try {
            new window.ActiveXObject(activeXName);
          } catch (ex) {
            return false;
          }

          return true; // all other
        } else {
          var plugins = navigator.plugins;

          if (!plugins) {
            return false;
          }

          var name;

          for (var i = 0; i < plugins.length; i++) {
            name = plugins[i].name;

            for (var j = 0; j < pluginNames.length; j++) {
              if (name.indexOf(pluginNames[j]) !== -1) {
                return true;
              }
            }
          }

          return false;
        }
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("plugin.gears", statics.getGears);
      qx.core.Environment.add("plugin.quicktime", statics.getQuicktime);
      qx.core.Environment.add("plugin.quicktime.version", statics.getQuicktimeVersion);
      qx.core.Environment.add("plugin.windowsmedia", statics.getWindowsMedia);
      qx.core.Environment.add("plugin.windowsmedia.version", statics.getWindowsMediaVersion);
      qx.core.Environment.add("plugin.divx", statics.getDivX);
      qx.core.Environment.add("plugin.divx.version", statics.getDivXVersion);
      qx.core.Environment.add("plugin.silverlight", statics.getSilverlight);
      qx.core.Environment.add("plugin.silverlight.version", statics.getSilverlightVersion);
      qx.core.Environment.add("plugin.pdf", statics.getPdf);
      qx.core.Environment.add("plugin.pdf.version", statics.getPdfVersion);
      qx.core.Environment.add("plugin.activex", statics.getActiveX);
      qx.core.Environment.add("plugin.skype", statics.getSkype);
    }
  });
  qx.bom.client.Plugin.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.xml.Document": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["xml.implementation", "xml.domparser", "xml.selectsinglenode", "xml.selectnodes", "xml.getelementsbytagnamens", "xml.domproperties", "xml.attributens", "xml.createelementns", "xml.createnode", "xml.getqualifieditem"],
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
   * This class should contain all XML-related checks
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Xml", {
    statics: {
      /**
       * Checks if XML is supported
       *
       * @internal
       * @return {Boolean} <code>true</code> if XML is supported
       */
      getImplementation: function getImplementation() {
        return document.implementation && document.implementation.hasFeature && document.implementation.hasFeature("XML", "1.0");
      },

      /**
       * Checks if an XML DOMParser is available
       *
       * @internal
       * @return {Boolean} <code>true</code> if DOMParser is supported
       */
      getDomParser: function getDomParser() {
        return typeof window.DOMParser !== "undefined";
      },

      /**
       * Checks if the proprietary selectSingleNode method is available on XML DOM
       * nodes.
       *
       * @internal
       * @return {Boolean} <code>true</code> if selectSingleNode is available
       */
      getSelectSingleNode: function getSelectSingleNode() {
        return typeof qx.xml.Document.create().selectSingleNode !== "undefined";
      },

      /**
       * Checks if the proprietary selectNodes method is available on XML DOM
       * nodes.
       *
       * @internal
       * @return {Boolean} <code>true</code> if selectSingleNode is available
       */
      getSelectNodes: function getSelectNodes() {
        return typeof qx.xml.Document.create().selectNodes !== "undefined";
      },

      /**
       * Checks availability of the getElementsByTagNameNS XML DOM method.
       *
       * @internal
       * @return {Boolean} <code>true</code> if getElementsByTagNameNS is available
       */
      getElementsByTagNameNS: function getElementsByTagNameNS() {
        return typeof qx.xml.Document.create().getElementsByTagNameNS !== "undefined";
      },

      /**
       * Checks if MSXML-style DOM Level 2 properties are supported.
       *
       * @internal
       * @return {Boolean} <code>true</code> if DOM Level 2 properties are supported
       */
      getDomProperties: function getDomProperties() {
        var doc = qx.xml.Document.create();
        return "getProperty" in doc && typeof doc.getProperty("SelectionLanguage") === "string";
      },

      /**
       * Checks if the getAttributeNS and setAttributeNS methods are supported on
       * XML DOM elements
       *
       * @internal
       * @return {Boolean} <code>true</code> if get/setAttributeNS is supported
       */
      getAttributeNS: function getAttributeNS() {
        var docElem = qx.xml.Document.fromString("<a></a>").documentElement;
        return typeof docElem.getAttributeNS === "function" && typeof docElem.setAttributeNS === "function";
      },

      /**
       * Checks if the createElementNS method is supported on XML DOM documents
       *
       * @internal
       * @return {Boolean} <code>true</code> if createElementNS is supported
       */
      getCreateElementNS: function getCreateElementNS() {
        return typeof qx.xml.Document.create().createElementNS === "function";
      },

      /**
       * Checks if the proprietary createNode method is supported on XML DOM
       * documents
       *
       * @internal
       * @return {Boolean} <code>true</code> if DOM Level 2 properties are supported
       */
      getCreateNode: function getCreateNode() {
        return typeof qx.xml.Document.create().createNode !== "undefined";
      },

      /**
       * Checks if the proprietary getQualifiedItem method is supported for XML
       * element attributes
       *
       * @internal
       * @return {Boolean} <code>true</code> if DOM Level 2 properties are supported
       */
      getQualifiedItem: function getQualifiedItem() {
        var docElem = qx.xml.Document.fromString("<a></a>").documentElement;
        return typeof docElem.attributes.getQualifiedItem !== "undefined";
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("xml.implementation", statics.getImplementation);
      qx.core.Environment.add("xml.domparser", statics.getDomParser);
      qx.core.Environment.add("xml.selectsinglenode", statics.getSelectSingleNode);
      qx.core.Environment.add("xml.selectnodes", statics.getSelectNodes);
      qx.core.Environment.add("xml.getelementsbytagnamens", statics.getElementsByTagNameNS);
      qx.core.Environment.add("xml.domproperties", statics.getDomProperties);
      qx.core.Environment.add("xml.attributens", statics.getAttributeNS);
      qx.core.Environment.add("xml.createelementns", statics.getCreateElementNS);
      qx.core.Environment.add("xml.createnode", statics.getCreateNode);
      qx.core.Environment.add("xml.getqualifieditem", statics.getQualifiedItem);
    }
  });
  qx.bom.client.Xml.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Plugin": {
        "defer": "load",
        "require": true
      },
      "qx.bom.client.Xml": {
        "require": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "plugin.activex": {
          "className": "qx.bom.client.Plugin",
          "defer": true
        },
        "xml.implementation": {
          "className": "qx.bom.client.Xml"
        },
        "xml.domparser": {
          "className": "qx.bom.client.Xml"
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
   * Cross browser XML document creation API
   *
   * The main purpose of this class is to allow you to create XML document objects in a
   * cross-browser fashion. Use <code>create</code> to create an empty document,
   * <code>fromString</code> to create one from an existing XML text. Both methods
   * return a *native DOM object*. That means you use standard DOM methods on such
   * an object (e.g. <code>createElement</code>).
   *
   * The following links provide further information on XML documents:
   *
   * * <a href="http://www.w3.org/TR/DOM-Level-2-Core/core.html#i-Document">W3C Interface Specification</a>
   * * <a href="http://msdn2.microsoft.com/en-us/library/ms535918.aspx">MS xml Object</a>
   * * <a href="http://msdn2.microsoft.com/en-us/library/ms764622.aspx">MSXML GUIDs and ProgIDs</a>
   * * <a href="https://developer.mozilla.org/en-US/docs/Parsing_and_serializing_XML">MDN Parsing and Serializing XML</a>
   */

  /* global ActiveXObject */

  /* global window */
  qx.Bootstrap.define("qx.xml.Document", {
    statics: {
      /** @type {String} ActiveX class name of DOMDocument (IE specific) */
      DOMDOC: null,

      /** @type {String} ActiveX class name of XMLHttpRequest (IE specific) */
      XMLHTTP: null,

      /**
       * Whether the given element is a XML document or element
       * which is part of a XML document.
       *
       * @param elem {Document|Element} Any DOM Document or Element
       * @return {Boolean} Whether the document is a XML document
       */
      isXmlDocument: function isXmlDocument(elem) {
        if (elem.nodeType === 9) {
          return elem.documentElement.nodeName !== "HTML";
        } else if (elem.ownerDocument) {
          return this.isXmlDocument(elem.ownerDocument);
        } else {
          return false;
        }
      },

      /**
       * Create an XML document.
       *
       * Returns a native DOM document object, set up for XML.
       *
       * @param namespaceUri {String ? null} The namespace URI of the document element to create or null.
       * @param qualifiedName {String ? null} The qualified name of the document element to be created or null.
       * @return {Document} empty XML object
       *
       * @ignore(ActiveXObject)
       */
      create: function create(namespaceUri, qualifiedName) {
        // ActiveX - This is the preferred way for IE9 as well since it has no XPath
        // support when using the native implementation.createDocument
        if (qx.core.Environment.get("plugin.activex")) {
          var obj = new ActiveXObject(this.DOMDOC); //The SelectionLanguage property is no longer needed in MSXML 6; trying
          // to set it causes an exception in IE9.

          if (this.DOMDOC == "MSXML2.DOMDocument.3.0") {
            obj.setProperty("SelectionLanguage", "XPath");
          }

          if (qualifiedName) {
            var str = '<?xml version="1.0" encoding="utf-8"?>\n<';
            str += qualifiedName;

            if (namespaceUri) {
              str += " xmlns='" + namespaceUri + "'";
            }

            str += " />";
            obj.loadXML(str);
          }

          return obj;
        }

        if (qx.core.Environment.get("xml.implementation")) {
          return document.implementation.createDocument(namespaceUri || "", qualifiedName || "", null);
        }

        throw new Error("No XML implementation available!");
      },

      /**
       * The string passed in is parsed into a DOM document.
       *
       * @param str {String} the string to be parsed
       * @return {Document} XML document with given content
       * @signature function(str)
       *
       * @ignore(DOMParser)
       */
      fromString: function fromString(str) {
        // Legacy IE/ActiveX
        if (qx.core.Environment.get("plugin.activex")) {
          var dom = qx.xml.Document.create();
          dom.loadXML(str);
          return dom;
        }

        if (qx.core.Environment.get("xml.domparser")) {
          var parser = new DOMParser();
          return parser.parseFromString(str, "text/xml");
        }

        throw new Error("No XML implementation available!");
      }
    },

    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
    defer: function defer(statics) {
      // Detecting available ActiveX implementations.
      if (qx.core.Environment.get("plugin.activex")) {
        // According to information on the Microsoft XML Team's WebLog
        // it is recommended to check for availability of MSXML versions 6.0 and 3.0.
        // http://blogs.msdn.com/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
        var domDoc = ["MSXML2.DOMDocument.6.0", "MSXML2.DOMDocument.3.0"];
        var httpReq = ["MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.3.0"];

        for (var i = 0, l = domDoc.length; i < l; i++) {
          try {
            // Keep both objects in sync with the same version.
            // This is important as there were compatibility issues detected.
            new ActiveXObject(domDoc[i]);
            new ActiveXObject(httpReq[i]);
          } catch (ex) {
            continue;
          } // Update static constants


          statics.DOMDOC = domDoc[i];
          statics.XMLHTTP = httpReq[i]; // Stop loop here

          break;
        }
      }
    }
  });
  qx.xml.Document.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.Selection": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "html.selection": {
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
       * Alexander Steitz (aback)
  
  ************************************************************************ */

  /**
   * Low-level Range API which is used together with the low-level Selection API.
   * This is especially useful whenever a developer want to work on text level,
   * e.g. for an editor.
   */
  qx.Bootstrap.define("qx.bom.Range", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Returns the range object of the given node.
       *
       * @signature function(node)
       * @param node {Node} node to get the range of
       * @return {Range} valid range of given selection
       */
      get: qx.core.Environment.select("html.selection", {
        selection: function selection(node) {
          // check for the type of the given node
          // for legacy IE the nodes input, textarea, button and body
          // have access to own TextRange objects. Everything else is
          // gathered via the selection object.
          if (qx.dom.Node.isElement(node)) {
            switch (node.nodeName.toLowerCase()) {
              case "input":
                switch (node.type) {
                  case "text":
                  case "password":
                  case "hidden":
                  case "button":
                  case "reset":
                  case "file":
                  case "submit":
                    return node.createTextRange();

                  default:
                    return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node)).createRange();
                }

              case "textarea":
              case "body":
              case "button":
                return node.createTextRange();

              default:
                return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node)).createRange();
            }
          } else {
            if (node == null) {
              node = window;
            } // need to pass the document node to work with multi-documents


            return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(node)).createRange();
          }
        },
        // suitable for gecko, opera and webkit
        "default": function _default(node) {
          var doc = qx.dom.Node.getDocument(node); // get the selection object of the corresponding document

          var sel = qx.bom.Selection.getSelectionObject(doc);

          if (sel.rangeCount > 0) {
            return sel.getRangeAt(0);
          } else {
            return doc.createRange();
          }
        }
      })
    }
  });
  qx.bom.Range.$$dbClassInfo = $$dbClassInfo;
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
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Adrian Olaru (adrianolaru)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Cross-Browser Split
       http://blog.stevenlevithan.com/archives/cross-browser-split
       Version 1.0.1
  
       Copyright:
         (c) 2006-2007, Steven Levithan <http://stevenlevithan.com>
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
       Authors:
         * Steven Levithan
  
  ************************************************************************ */

  /**
   * Implements an ECMA-compliant, uniform cross-browser split method
   */
  qx.Bootstrap.define("qx.util.StringSplit", {
    statics: {
      /**
       * ECMA-compliant, uniform cross-browser split method
       *
       * @param str {String} Incoming string to split
       * @param separator {RegExp} Specifies the character to use for separating the string.
       *   The separator is treated as a string or a  regular expression. If separator is
       *   omitted, the array returned contains one element consisting of the entire string.
       * @param limit {Integer?} Integer specifying a limit on the number of splits to be found.
       * @return {String[]} split string
       */
      split: function split(str, separator, limit) {
        // if `separator` is not a regex, use the native `split`
        if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
          return String.prototype.split.call(str, separator, limit);
        }

        var output = [],
            lastLastIndex = 0,
            flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.sticky ? "y" : ""),
            separator = RegExp(separator.source, flags + "g"),
            // make `global` and avoid `lastIndex` issues by working with a copy
        separator2,
            match,
            lastIndex,
            lastLength,
            compliantExecNpcg = /()??/.exec("")[1] === undefined; // NPCG: nonparticipating capturing group

        str = str + ""; // type conversion

        if (!compliantExecNpcg) {
          separator2 = RegExp("^" + separator.source + "$(?!\\s)", flags); // doesn't need /g or /y, but they don't hurt
        }
        /* behavior for `limit`: if it's...
        - `undefined`: no limit.
        - `NaN` or zero: return an empty array.
        - a positive number: use `Math.floor(limit)`.
        - a negative number: no limit.
        - other: type-convert, then use the above rules. */


        if (limit === undefined || +limit < 0) {
          limit = Infinity;
        } else {
          limit = Math.floor(+limit);

          if (!limit) {
            return [];
          }
        }

        while (match = separator.exec(str)) {
          lastIndex = match.index + match[0].length; // `separator.lastIndex` is not reliable cross-browser

          if (lastIndex > lastLastIndex) {
            output.push(str.slice(lastLastIndex, match.index)); // fix browsers whose `exec` methods don't consistently return `undefined` for nonparticipating capturing groups

            if (!compliantExecNpcg && match.length > 1) {
              match[0].replace(separator2, function () {
                for (var i = 1; i < arguments.length - 2; i++) {
                  if (arguments[i] === undefined) {
                    match[i] = undefined;
                  }
                }
              });
            }

            if (match.length > 1 && match.index < str.length) {
              Array.prototype.push.apply(output, match.slice(1));
            }

            lastLength = match[0].length;
            lastLastIndex = lastIndex;

            if (output.length >= limit) {
              break;
            }
          }

          if (separator.lastIndex === match.index) {
            separator.lastIndex++; // avoid an infinite loop
          }
        }

        if (lastLastIndex === str.length) {
          if (lastLength || !separator.test("")) {
            output.push("");
          }
        } else {
          output.push(str.slice(lastLastIndex));
        }

        return output.length > limit ? output.slice(0, limit) : output;
      }
    }
  });
  qx.util.StringSplit.$$dbClassInfo = $$dbClassInfo;
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
   * Common base class for all focus events.
   */
  qx.Class.define("qx.event.type.Focus", {
    extend: qx.event.type.Event,
    members: {
      /**
       * Initialize the fields of the event. The event must be initialized before
       * it can be dispatched.
       *
       * @param target {Object} Any possible event target
       * @param relatedTarget {Object} Any possible event target
       * @param canBubble {Boolean?false} Whether or not the event is a bubbling event.
       *     If the event is bubbling, the bubbling can be stopped using
       *     {@link qx.event.type.Event#stopPropagation}
       * @return {qx.event.type.Event} The initialized event instance
       */
      init: function init(target, relatedTarget, canBubble) {
        qx.event.type.Focus.superclass.prototype.init.call(this, canBubble, false);
        this._target = target;
        this._relatedTarget = relatedTarget;
        return this;
      }
    }
  });
  qx.event.type.Focus.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.layout.VBox": {
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Layouter used by the qooxdoo menu's to render their buttons
   *
   * @internal
   */
  qx.Class.define("qx.ui.menu.Layout", {
    extend: qx.ui.layout.VBox,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Spacing between each cell on the menu buttons */
      columnSpacing: {
        check: "Integer",
        init: 0,
        apply: "_applyLayoutChange"
      },

      /**
       * Whether a column and which column should automatically span
       * when the following cell is empty. Spanning may be disabled
       * through setting this property to <code>null</code>.
       */
      spanColumn: {
        check: "Integer",
        init: 1,
        nullable: true,
        apply: "_applyLayoutChange"
      },

      /** Default icon column width if no icons are rendered */
      iconColumnWidth: {
        check: "Integer",
        init: 0,
        themeable: true,
        apply: "_applyLayoutChange"
      },

      /** Default arrow column width if no sub menus are rendered */
      arrowColumnWidth: {
        check: "Integer",
        init: 0,
        themeable: true,
        apply: "_applyLayoutChange"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __columnSizes__P_133_0: null,

      /*
      ---------------------------------------------------------------------------
        LAYOUT INTERFACE
      ---------------------------------------------------------------------------
      */
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var children = this._getLayoutChildren();

        var child, sizes, spacing;
        var spanColumn = this.getSpanColumn();
        var columnSizes = this.__columnSizes__P_133_0 = [0, 0, 0, 0];
        var columnSpacing = this.getColumnSpacing();
        var spanColumnWidth = 0;
        var maxInset = 0; // Compute column sizes and insets

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];

          if (child.isAnonymous()) {
            continue;
          }

          sizes = child.getChildrenSizes();

          for (var column = 0; column < sizes.length; column++) {
            if (spanColumn != null && column == spanColumn && sizes[spanColumn + 1] == 0) {
              spanColumnWidth = Math.max(spanColumnWidth, sizes[column]);
            } else {
              columnSizes[column] = Math.max(columnSizes[column], sizes[column]);
            }
          }

          var insets = children[i].getInsets();
          maxInset = Math.max(maxInset, insets.left + insets.right);
        } // Fix label column width is cases where the maximum button with no shortcut
        // is larger than the maximum button with a shortcut


        if (spanColumn != null && columnSizes[spanColumn] + columnSpacing + columnSizes[spanColumn + 1] < spanColumnWidth) {
          columnSizes[spanColumn] = spanColumnWidth - columnSizes[spanColumn + 1] - columnSpacing;
        } // When merging the cells for label and shortcut
        // ignore the spacing between them


        if (spanColumnWidth == 0) {
          spacing = columnSpacing * 2;
        } else {
          spacing = columnSpacing * 3;
        } // Fix zero size icon column


        if (columnSizes[0] == 0) {
          columnSizes[0] = this.getIconColumnWidth();
        } // Fix zero size arrow column


        if (columnSizes[3] == 0) {
          columnSizes[3] = this.getArrowColumnWidth();
        }

        var height = qx.ui.menu.Layout.superclass.prototype._computeSizeHint.call(this).height; // Build hint


        return {
          minHeight: height,
          height: height,
          width: qx.lang.Array.sum(columnSizes) + maxInset + spacing
        };
      },

      /*
      ---------------------------------------------------------------------------
        CUSTOM ADDONS
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the column sizes detected during the pre-layout phase
       *
       * @return {Array} List of all column widths
       */
      getColumnSizes: function getColumnSizes() {
        return this.__columnSizes__P_133_0 || null;
      }
    },

    /*
     *****************************************************************************
        DESTRUCT
     *****************************************************************************
     */
    destruct: function destruct() {
      this.__columnSizes__P_133_0 = null;
    }
  });
  qx.ui.menu.Layout.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {
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
   * This widget draws a separator line between two instances of
   * {@link qx.ui.menu.AbstractButton} and is inserted into the
   * {@link qx.ui.menu.Menu}.
   *
   * For convenience reasons there is also
   * a method {@link qx.ui.menu.Menu#addSeparator} to append instances
   * of this class to the menu.
   */
  qx.Class.define("qx.ui.menu.Separator", {
    extend: qx.ui.core.Widget,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      appearance: {
        refine: true,
        init: "menu-separator"
      },
      // overridden
      anonymous: {
        refine: true,
        init: true
      }
    }
  });
  qx.ui.menu.Separator.$$dbClassInfo = $$dbClassInfo;
})();

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
      "qx.event.Registration": {
        "construct": true
      },
      "qx.bom.client.Event": {
        "construct": true,
        "require": true
      },
      "qx.bom.Element": {
        "construct": true
      },
      "qx.event.Timer": {
        "construct": true
      },
      "qx.ui.menu.Menu": {},
      "qx.ui.menu.AbstractButton": {},
      "qx.lang.Array": {},
      "qx.ui.core.Widget": {},
      "qx.ui.menubar.Button": {},
      "qx.ui.menu.Button": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "event.touch": {
          "construct": true,
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
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * This singleton manages visible menu instances and supports some
   * core features to schedule menu open/close with timeout support.
   *
   * It also manages the whole keyboard support for the currently
   * registered widgets.
   *
   * The zIndex order is also managed by this class.
   */
  qx.Class.define("qx.ui.menu.Manager", {
    type: "singleton",
    extend: qx.core.Object,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this); // Create data structure

      this.__objects__P_134_0 = [];
      var el = document.body;
      var Registration = qx.event.Registration; // React on pointer/mouse events, but on native, to support inline applications

      Registration.addListener(window.document.documentElement, "pointerdown", this._onPointerDown, this, true);
      Registration.addListener(el, "roll", this._onRoll, this, true); // React on keypress events

      Registration.addListener(el, "keydown", this._onKeyUpDown, this, true);
      Registration.addListener(el, "keyup", this._onKeyUpDown, this, true);
      Registration.addListener(el, "keypress", this._onKeyPress, this, true); // only use the blur event to hide windows on non touch devices [BUG #4033]
      // When the menu is located on top of an iFrame, the select will fail

      if (!qx.core.Environment.get("event.touch")) {
        // Hide all when the window is blurred
        qx.bom.Element.addListener(window, "blur", this.hideAll, this);
      } // Create open timer


      this.__openTimer__P_134_1 = new qx.event.Timer();

      this.__openTimer__P_134_1.addListener("interval", this._onOpenInterval, this); // Create close timer


      this.__closeTimer__P_134_2 = new qx.event.Timer();

      this.__closeTimer__P_134_2.addListener("interval", this._onCloseInterval, this);
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */

    /* eslint-disable @qooxdoo/qx/no-refs-in-members */
    members: {
      __scheduleOpen__P_134_3: null,
      __scheduleClose__P_134_4: null,
      __openTimer__P_134_1: null,
      __closeTimer__P_134_2: null,
      __objects__P_134_0: null,

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Query engine for menu children.
       *
       * @param menu {qx.ui.menu.Menu} Any menu instance
       * @param start {Integer} Child index to start with
       * @param iter {Integer} Iteration count, normally <code>+1</code> or <code>-1</code>
       * @param loop {Boolean?false} Whether to wrap when reaching the begin/end of the list
       * @return {qx.ui.menu.Button} Any menu button or <code>null</code>
       */
      _getChild: function _getChild(menu, start, iter, loop) {
        var children = menu.getChildren();
        var length = children.length;
        var child;

        for (var i = start; i < length && i >= 0; i += iter) {
          child = children[i];

          if (child.isEnabled() && !child.isAnonymous() && child.isVisible()) {
            return child;
          }
        }

        if (loop) {
          i = i == length ? 0 : length - 1;

          for (; i != start; i += iter) {
            child = children[i];

            if (child.isEnabled() && !child.isAnonymous() && child.isVisible()) {
              return child;
            }
          }
        }

        return null;
      },

      /**
       * Whether the given widget is inside any Menu instance.
       *
       * @param widget {qx.ui.core.Widget} Any widget
       * @return {Boolean} <code>true</code> when the widget is part of any menu
       */
      _isInMenu: function _isInMenu(widget) {
        while (widget) {
          if (widget instanceof qx.ui.menu.Menu) {
            return true;
          }

          widget = widget.getLayoutParent();
        }

        return false;
      },

      /**
       * Whether the given widget is one of the menu openers.
       *
       * @param widget {qx.ui.core.Widget} Any widget
       * @return {Boolean} <code>true</code> if the widget is a menu opener
       */
      _isMenuOpener: function _isMenuOpener(widget) {
        var menus = this.__objects__P_134_0;

        for (var i = 0; i < menus.length; i++) {
          if (menus[i].getOpener() === widget) {
            return true;
          }
        }

        return false;
      },

      /**
       * Returns an instance of a menu button if the given widget is a child
       *
       * @param widget {qx.ui.core.Widget} any widget
       * @return {qx.ui.menu.Button} Any menu button instance or <code>null</code>
       */
      _getMenuButton: function _getMenuButton(widget) {
        while (widget) {
          if (widget instanceof qx.ui.menu.AbstractButton) {
            return widget;
          }

          widget = widget.getLayoutParent();
        }

        return null;
      },

      /*
      ---------------------------------------------------------------------------
        PUBLIC METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Adds a menu to the list of visible menus.
       *
       * @param obj {qx.ui.menu.Menu} Any menu instance.
       */
      add: function add(obj) {
        {
          if (!(obj instanceof qx.ui.menu.Menu)) {
            throw new Error("Object is no menu: " + obj);
          }
        }
        var reg = this.__objects__P_134_0;
        reg.push(obj);
        obj.setZIndex(1e6 + reg.length);
      },

      /**
       * Remove a menu from the list of visible menus.
       *
       * @param obj {qx.ui.menu.Menu} Any menu instance.
       */
      remove: function remove(obj) {
        {
          if (!(obj instanceof qx.ui.menu.Menu)) {
            throw new Error("Object is no menu: " + obj);
          }
        }
        var reg = this.__objects__P_134_0;

        if (reg) {
          qx.lang.Array.remove(reg, obj);
        }
      },

      /**
       * Hides all currently opened menus.
       */
      hideAll: function hideAll() {
        var reg = this.__objects__P_134_0;

        if (reg) {
          for (var i = reg.length - 1; i >= 0; i--) {
            reg[i].exclude();
          }
        }
      },

      /**
       * Returns the menu which was opened at last (which
       * is the active one this way)
       *
       * @return {qx.ui.menu.Menu} The current active menu or <code>null</code>
       */
      getActiveMenu: function getActiveMenu() {
        var reg = this.__objects__P_134_0;
        return reg.length > 0 ? reg[reg.length - 1] : null;
      },

      /*
      ---------------------------------------------------------------------------
        SCHEDULED OPEN/CLOSE SUPPORT
      ---------------------------------------------------------------------------
      */

      /**
       * Schedules the given menu to be opened after the
       * {@link qx.ui.menu.Menu#openInterval} configured by the
       * menu instance itself.
       *
       * @param menu {qx.ui.menu.Menu} The menu to schedule for open
       */
      scheduleOpen: function scheduleOpen(menu) {
        // Cancel close of given menu first
        this.cancelClose(menu); // When the menu is already visible

        if (menu.isVisible()) {
          // Cancel all other open requests
          if (this.__scheduleOpen__P_134_3) {
            this.cancelOpen(this.__scheduleOpen__P_134_3);
          }
        } // When the menu is not visible and not scheduled already
        // then schedule it for opening
        else if (this.__scheduleOpen__P_134_3 != menu) {
          // menu.debug("Schedule open");
          this.__scheduleOpen__P_134_3 = menu;

          this.__openTimer__P_134_1.restartWith(menu.getOpenInterval());
        }
      },

      /**
       * Schedules the given menu to be closed after the
       * {@link qx.ui.menu.Menu#closeInterval} configured by the
       * menu instance itself.
       *
       * @param menu {qx.ui.menu.Menu} The menu to schedule for close
       */
      scheduleClose: function scheduleClose(menu) {
        // Cancel open of the menu first
        this.cancelOpen(menu); // When the menu is already invisible

        if (!menu.isVisible()) {
          // Cancel all other close requests
          if (this.__scheduleClose__P_134_4) {
            this.cancelClose(this.__scheduleClose__P_134_4);
          }
        } // When the menu is visible and not scheduled already
        // then schedule it for closing
        else if (this.__scheduleClose__P_134_4 != menu) {
          // menu.debug("Schedule close");
          this.__scheduleClose__P_134_4 = menu;

          this.__closeTimer__P_134_2.restartWith(menu.getCloseInterval());
        }
      },

      /**
       * When the given menu is scheduled for open this pending
       * request is canceled.
       *
       * @param menu {qx.ui.menu.Menu} The menu to cancel for open
       */
      cancelOpen: function cancelOpen(menu) {
        if (this.__scheduleOpen__P_134_3 == menu) {
          // menu.debug("Cancel open");
          this.__openTimer__P_134_1.stop();

          this.__scheduleOpen__P_134_3 = null;
        }
      },

      /**
       * When the given menu is scheduled for close this pending
       * request is canceled.
       *
       * @param menu {qx.ui.menu.Menu} The menu to cancel for close
       */
      cancelClose: function cancelClose(menu) {
        if (this.__scheduleClose__P_134_4 == menu) {
          // menu.debug("Cancel close");
          this.__closeTimer__P_134_2.stop();

          this.__scheduleClose__P_134_4 = null;
        }
      },

      /*
      ---------------------------------------------------------------------------
        TIMER EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for a pending open request. Configured to the interval
       * of the current menu to open.
       *
       * @param e {qx.event.type.Event} Interval event
       */
      _onOpenInterval: function _onOpenInterval(e) {
        // Stop timer
        this.__openTimer__P_134_1.stop(); // Open menu and reset flag


        this.__scheduleOpen__P_134_3.open();

        this.__scheduleOpen__P_134_3 = null;
      },

      /**
       * Event listener for a pending close request. Configured to the interval
       * of the current menu to close.
       *
       * @param e {qx.event.type.Event} Interval event
       */
      _onCloseInterval: function _onCloseInterval(e) {
        // Stop timer, reset scheduling flag
        this.__closeTimer__P_134_2.stop(); // Close menu and reset flag


        this.__scheduleClose__P_134_4.exclude();

        this.__scheduleClose__P_134_4 = null;
      },

      /*
      ---------------------------------------------------------------------------
        CONTEXTMENU EVENT HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * Internal function registers a handler to stop next
       * <code>contextmenu</code> event.
       * This function will be called by {@link qx.ui.menu.Button#_onTap}, if
       * right click was pressed.
       *
       * @internal
       */
      preventContextMenuOnce: function preventContextMenuOnce() {
        qx.event.Registration.addListener(document.body, "contextmenu", this.__onPreventContextMenu__P_134_5, this, true);
      },

      /**
       * Internal event handler to stop <code>contextmenu</code> event bubbling,
       * if target is inside the opened menu.
       *
       * @param e {qx.event.type.Mouse} contextmenu event
       *
       * @internal
       */
      __onPreventContextMenu__P_134_5: function __onPreventContextMenu__P_134_5(e) {
        var target = e.getTarget();
        target = qx.ui.core.Widget.getWidgetByElement(target, true);

        if (this._isInMenu(target)) {
          e.stopPropagation();
          e.preventDefault();
        } // stop only once


        qx.event.Registration.removeListener(document.body, "contextmenu", this.__onPreventContextMenu__P_134_5, this, true);
      },

      /*
      ---------------------------------------------------------------------------
        POINTER EVENT HANDLERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event handler for pointerdown events
       *
       * @param e {qx.event.type.Pointer} pointerdown event
       */
      _onPointerDown: function _onPointerDown(e) {
        var target = e.getTarget();
        target = qx.ui.core.Widget.getWidgetByElement(target, true); // If the target is 'null' the tap appears on a DOM element witch is not
        // a widget. This happens normally with an inline application, when the user
        // taps not in the inline application. In this case all all currently
        // open menus should be closed.

        if (target == null) {
          this.hideAll();
          return;
        } // If the target is the one which has opened the current menu
        // we ignore the pointerdown to let the button process the event
        // further with toggling or ignoring the tap.


        if (target.getMenu && target.getMenu() && target.getMenu().isVisible()) {
          return;
        } // All taps not inside a menu will hide all currently open menus


        if (this.__objects__P_134_0.length > 0 && !this._isInMenu(target)) {
          this.hideAll();
        }
      },

      /*
      ---------------------------------------------------------------------------
        KEY EVENT HANDLING
      ---------------------------------------------------------------------------
      */

      /**
       * @type {Map} Map of all keys working on an active menu selection
       * @lint ignoreReferenceField(__selectionKeys)
       */
      __selectionKeys__P_134_6: {
        Enter: 1,
        Space: 1
      },

      /**
       * @type {Map} Map of all keys working without a selection
       * @lint ignoreReferenceField(__navigationKeys)
       */
      __navigationKeys__P_134_7: {
        Tab: 1,
        Escape: 1,
        Up: 1,
        Down: 1,
        Left: 1,
        Right: 1
      },

      /**
       * Event handler for all keyup/keydown events. Stops all events
       * when any menu is opened.
       *
       * @param e {qx.event.type.KeySequence} Keyboard event
       */
      _onKeyUpDown: function _onKeyUpDown(e) {
        var menu = this.getActiveMenu();

        if (!menu) {
          return;
        } // Stop for all supported key combos


        var iden = e.getKeyIdentifier();

        if (this.__navigationKeys__P_134_7[iden] || this.__selectionKeys__P_134_6[iden] && menu.getSelectedButton()) {
          e.stopPropagation();
        }
      },

      /**
       * Event handler for all keypress events. Delegates the event to the more
       * specific methods defined in this class.
       *
       * Currently processes the keys: <code>Up</code>, <code>Down</code>,
       * <code>Left</code>, <code>Right</code> and <code>Enter</code>.
       *
       * @param e {qx.event.type.KeySequence} Keyboard event
       */
      _onKeyPress: function _onKeyPress(e) {
        var menu = this.getActiveMenu();

        if (!menu) {
          return;
        }

        var iden = e.getKeyIdentifier();
        var navigation = this.__navigationKeys__P_134_7[iden];
        var selection = this.__selectionKeys__P_134_6[iden];

        if (navigation) {
          switch (iden) {
            case "Up":
              this._onKeyPressUp(menu);

              break;

            case "Down":
              this._onKeyPressDown(menu);

              break;

            case "Left":
              this._onKeyPressLeft(menu);

              break;

            case "Right":
              this._onKeyPressRight(menu);

              break;

            case "Tab":
            case "Escape":
              this.hideAll();
              break;
          }

          e.stopPropagation();
          e.preventDefault();
        } else if (selection) {
          // Do not process these events when no item is hovered
          var button = menu.getSelectedButton();

          if (button) {
            switch (iden) {
              case "Enter":
                this._onKeyPressEnter(menu, button, e);

                break;

              case "Space":
                this._onKeyPressSpace(menu, button, e);

                break;
            }

            e.stopPropagation();
            e.preventDefault();
          }
        }
      },

      /**
       * Event handler for <code>Up</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       */
      _onKeyPressUp: function _onKeyPressUp(menu) {
        // Query for previous child
        var selectedButton = menu.getSelectedButton();
        var children = menu.getChildren();
        var start = selectedButton ? menu.indexOf(selectedButton) - 1 : children.length - 1;

        var nextItem = this._getChild(menu, start, -1, true); // Reconfigure property


        if (nextItem) {
          menu.setSelectedButton(nextItem);
        } else {
          menu.resetSelectedButton();
        }
      },

      /**
       * Event handler for <code>Down</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       */
      _onKeyPressDown: function _onKeyPressDown(menu) {
        // Query for next child
        var selectedButton = menu.getSelectedButton();
        var start = selectedButton ? menu.indexOf(selectedButton) + 1 : 0;

        var nextItem = this._getChild(menu, start, 1, true); // Reconfigure property


        if (nextItem) {
          menu.setSelectedButton(nextItem);
        } else {
          menu.resetSelectedButton();
        }
      },

      /**
       * Event handler for <code>Left</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       */
      _onKeyPressLeft: function _onKeyPressLeft(menu) {
        var menuOpener = menu.getOpener();

        if (!menuOpener) {
          return;
        } // Back to the "parent" menu


        if (menuOpener instanceof qx.ui.menu.AbstractButton) {
          var parentMenu = menuOpener.getLayoutParent();
          parentMenu.resetOpenedButton();
          parentMenu.setSelectedButton(menuOpener);
        } // Goto the previous toolbar button
        else if (menuOpener instanceof qx.ui.menubar.Button) {
          var buttons = menuOpener.getMenuBar().getMenuButtons();
          var index = buttons.indexOf(menuOpener); // This should not happen, definitely!

          if (index === -1) {
            return;
          } // Get previous button, fallback to end if first arrived


          var prevButton = null;
          var length = buttons.length;

          for (var i = 1; i <= length; i++) {
            var button = buttons[(index - i + length) % length];

            if (button.isEnabled() && button.isVisible()) {
              prevButton = button;
              break;
            }
          }

          if (prevButton && prevButton != menuOpener) {
            prevButton.open(true);
          }
        }
      },

      /**
       * Event handler for <code>Right</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       */
      _onKeyPressRight: function _onKeyPressRight(menu) {
        var selectedButton = menu.getSelectedButton(); // Open sub-menu of hovered item and select first child

        if (selectedButton) {
          var subMenu = selectedButton.getMenu();

          if (subMenu) {
            // Open previously hovered item
            menu.setOpenedButton(selectedButton); // Hover first item in new submenu

            var first = this._getChild(subMenu, 0, 1);

            if (first) {
              subMenu.setSelectedButton(first);
            }

            return;
          }
        } // No hover and no open item
        // When first button has a menu, open it, otherwise only hover it
        else if (!menu.getOpenedButton()) {
          var first = this._getChild(menu, 0, 1);

          if (first) {
            menu.setSelectedButton(first);

            if (first.getMenu()) {
              menu.setOpenedButton(first);
            }

            return;
          }
        } // Jump to the next toolbar button


        var menuOpener = menu.getOpener(); // Look up opener hierarchy for menu button

        if (menuOpener instanceof qx.ui.menu.Button && selectedButton) {
          // From one inner selected button try to find the top level
          // menu button which has opened the whole menu chain.
          while (menuOpener) {
            menuOpener = menuOpener.getLayoutParent();

            if (menuOpener instanceof qx.ui.menu.Menu) {
              menuOpener = menuOpener.getOpener();

              if (menuOpener instanceof qx.ui.menubar.Button) {
                break;
              }
            } else {
              break;
            }
          }

          if (!menuOpener) {
            return;
          }
        } // Ask the toolbar for the next menu button


        if (menuOpener instanceof qx.ui.menubar.Button) {
          var buttons = menuOpener.getMenuBar().getMenuButtons();
          var index = buttons.indexOf(menuOpener); // This should not happen, definitely!

          if (index === -1) {
            return;
          } // Get next button, fallback to first if end arrived


          var nextButton = null;
          var length = buttons.length;

          for (var i = 1; i <= length; i++) {
            var button = buttons[(index + i) % length];

            if (button.isEnabled() && button.isVisible()) {
              nextButton = button;
              break;
            }
          }

          if (nextButton && nextButton != menuOpener) {
            nextButton.open(true);
          }
        }
      },

      /**
       * Event handler for <code>Enter</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       * @param button {qx.ui.menu.AbstractButton} The selected button
       * @param e {qx.event.type.KeySequence} The keypress event
       */
      _onKeyPressEnter: function _onKeyPressEnter(menu, button, e) {
        // Route keypress event to the selected button
        if (button.hasListener("keypress")) {
          // Clone and reconfigure event
          var clone = e.clone();
          clone.setBubbles(false);
          clone.setTarget(button); // Finally dispatch the clone

          button.dispatchEvent(clone);
        } // Hide all open menus


        this.hideAll();
      },

      /**
       * Event handler for <code>Space</code> key
       *
       * @param menu {qx.ui.menu.Menu} The active menu
       * @param button {qx.ui.menu.AbstractButton} The selected button
       * @param e {qx.event.type.KeySequence} The keypress event
       */
      _onKeyPressSpace: function _onKeyPressSpace(menu, button, e) {
        // Route keypress event to the selected button
        if (button.hasListener("keypress")) {
          // Clone and reconfigure event
          var clone = e.clone();
          clone.setBubbles(false);
          clone.setTarget(button); // Finally dispatch the clone

          button.dispatchEvent(clone);
        }
      },

      /**
       * Event handler for roll which hides all windows on scroll.
       *
       * @param e {qx.event.type.Roll} The roll event.
       */
      _onRoll: function _onRoll(e) {
        var target = e.getTarget();
        target = qx.ui.core.Widget.getWidgetByElement(target, true);

        if (this.__objects__P_134_0.length > 0 && !this._isInMenu(target) && !this._isMenuOpener(target) && !e.getMomentum()) {
          this.hideAll();
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      var Registration = qx.event.Registration;
      var el = document.body; // React on pointerdown events

      Registration.removeListener(window.document.documentElement, "pointerdown", this._onPointerDown, this, true); // React on keypress events

      Registration.removeListener(el, "keydown", this._onKeyUpDown, this, true);
      Registration.removeListener(el, "keyup", this._onKeyUpDown, this, true);
      Registration.removeListener(el, "keypress", this._onKeyPress, this, true);

      this._disposeObjects("__openTimer__P_134_1", "__closeTimer__P_134_2");

      this._disposeArray("__objects__P_134_0");
    }
  });
  qx.ui.menu.Manager.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.MExecutable": {
        "require": true
      },
      "qx.ui.form.IExecutable": {
        "require": true
      },
      "qx.ui.menu.ButtonLayout": {
        "construct": true
      },
      "qx.ui.menu.Menu": {},
      "qx.ui.basic.Image": {},
      "qx.ui.basic.Label": {},
      "qx.event.Timer": {},
      "qx.ui.menu.Manager": {},
      "qx.locale.Manager": {},
      "qx.core.ObjectRegistry": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.dynlocale": {
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
   * The abstract menu button class is used for all type of menu content
   * for example normal buttons, checkboxes or radiobuttons.
   *
   * @childControl icon {qx.ui.basic.Image} icon of the button
   * @childControl label {qx.ui.basic.Label} label of the button
   * @childControl shortcut {qx.ui.basic.Label} shows if specified the shortcut
   * @childControl arrow {qx.ui.basic.Image} shows the arrow to show an additional widget (e.g. popup or submenu)
   */
  qx.Class.define("qx.ui.menu.AbstractButton", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MExecutable],
    implement: [qx.ui.form.IExecutable],
    type: "abstract",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this); // Use hard coded layout

      this._setLayout(new qx.ui.menu.ButtonLayout()); // Add listeners


      this.addListener("tap", this._onTap);
      this.addListener("keypress", this._onKeyPress); // Add command listener

      this.addListener("changeCommand", this._onChangeCommand, this);
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      // overridden
      blockToolTip: {
        refine: true,
        init: true
      },

      /** The label text of the button */
      label: {
        check: "String",
        apply: "_applyLabel",
        nullable: true,
        event: "changeLabel"
      },

      /** Whether a sub menu should be shown and which one */
      menu: {
        check: "qx.ui.menu.Menu",
        apply: "_applyMenu",
        nullable: true,
        dereference: true,
        event: "changeMenu"
      },

      /** The icon to use */
      icon: {
        check: "String",
        apply: "_applyIcon",
        themeable: true,
        nullable: true,
        event: "changeIcon"
      },

      /** Indicates whether the label for the command (shortcut) should be visible or not. */
      showCommandLabel: {
        check: "Boolean",
        apply: "_applyShowCommandLabel",
        themeable: true,
        init: true,
        event: "changeShowCommandLabel"
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
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "icon":
            control = new qx.ui.basic.Image();
            control.setAnonymous(true);

            this._add(control, {
              column: 0
            });

            break;

          case "label":
            control = new qx.ui.basic.Label();
            control.setAnonymous(true);

            this._add(control, {
              column: 1
            });

            break;

          case "shortcut":
            control = new qx.ui.basic.Label();
            control.setAnonymous(true);

            if (!this.getShowCommandLabel()) {
              control.exclude();
            }

            this._add(control, {
              column: 2
            });

            break;

          case "arrow":
            control = new qx.ui.basic.Image();
            control.setAnonymous(true);

            this._add(control, {
              column: 3
            });

            break;
        }

        return control || qx.ui.menu.AbstractButton.superclass.prototype._createChildControlImpl.call(this, id);
      },
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        selected: 1
      },

      /*
      ---------------------------------------------------------------------------
        LAYOUT UTILS
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the dimensions of all children
       *
       * @return {Array} Preferred width of each child
       */
      getChildrenSizes: function getChildrenSizes() {
        var iconWidth = 0,
            labelWidth = 0,
            shortcutWidth = 0,
            arrowWidth = 0;

        if (this._isChildControlVisible("icon")) {
          var icon = this.getChildControl("icon");
          iconWidth = icon.getMarginLeft() + icon.getSizeHint().width + icon.getMarginRight();
        }

        if (this._isChildControlVisible("label")) {
          var label = this.getChildControl("label");
          labelWidth = label.getMarginLeft() + label.getSizeHint().width + label.getMarginRight();
        }

        if (this._isChildControlVisible("shortcut")) {
          var shortcut = this.getChildControl("shortcut");
          shortcutWidth = shortcut.getMarginLeft() + shortcut.getSizeHint().width + shortcut.getMarginRight();
        }

        if (this._isChildControlVisible("arrow")) {
          var arrow = this.getChildControl("arrow");
          arrowWidth = arrow.getMarginLeft() + arrow.getSizeHint().width + arrow.getMarginRight();
        }

        return [iconWidth, labelWidth, shortcutWidth, arrowWidth];
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for tap
       *
       * @param e {qx.event.type.Pointer} pointer event
       */
      _onTap: function _onTap(e) {
        if (e.isLeftPressed()) {
          this.execute();
          qx.event.Timer.once(qx.ui.menu.Manager.getInstance().hideAll, qx.ui.menu.Manager.getInstance(), 0);
        } // right click
        else {
          // only prevent contextmenu event if button has no further context menu.
          if (!this.getContextMenu()) {
            qx.ui.menu.Manager.getInstance().preventContextMenuOnce();
          }
        }
      },

      /**
       * Event listener for keypress event
       *
       * @param e {qx.event.type.KeySequence} keypress event
       */
      _onKeyPress: function _onKeyPress(e) {
        this.execute();
      },

      /**
       * Event listener for command changes. Updates the text of the shortcut.
       *
       * @param e {qx.event.type.Data} Property change event
       */
      _onChangeCommand: function _onChangeCommand(e) {
        var command = e.getData(); // do nothing if no command is set

        if (command == null) {
          return;
        }

        {
          var oldCommand = e.getOldData();

          if (!oldCommand) {
            qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
          }

          if (!command) {
            qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
          }
        }
        var cmdString = command != null ? command.toString() : "";
        this.getChildControl("shortcut").setValue(cmdString);
      },

      /**
       * Update command string on locale changes
       */
      _onChangeLocale: qx.core.Environment.select("qx.dynlocale", {
        "true": function _true(e) {
          var command = this.getCommand();

          if (command != null) {
            this.getChildControl("shortcut").setValue(command.toString());
          }
        },
        "false": null
      }),

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyIcon: function _applyIcon(value, old) {
        if (value) {
          this._showChildControl("icon").setSource(value);
        } else {
          this._excludeChildControl("icon");
        }
      },
      // property apply
      _applyLabel: function _applyLabel(value, old) {
        if (value) {
          this._showChildControl("label").setValue(value);
        } else {
          this._excludeChildControl("label");
        }
      },
      // property apply
      _applyMenu: function _applyMenu(value, old) {
        if (old) {
          old.removeListener("changeVisibility", this._onMenuChange, this);
          old.resetOpener();
          old.removeState("submenu");
        }

        if (value) {
          this._showChildControl("arrow");

          value.addListener("changeVisibility", this._onMenuChange, this);
          value.setOpener(this);
          value.addState("submenu");
        } else {
          this._excludeChildControl("arrow");
        } // ARIA attrs


        var contentEl = this.getContentElement();

        if (!contentEl) {
          return;
        }

        if (value) {
          contentEl.setAttribute("aria-haspopup", "menu");
          contentEl.setAttribute("aria-expanded", value.isVisible());
          contentEl.setAttribute("aria-controls", value.getContentElement().getAttribute("id"));
        } else {
          contentEl.removeAttribute("aria-haspopup");
          contentEl.removeAttribute("aria-expanded");
          contentEl.removeAttribute("aria-controls");
        }
      },

      /**
       * Listener for visibility property changes of the attached menu
       *
       * @param e {qx.event.type.Data} Property change event
       */
      _onMenuChange: function _onMenuChange(e) {
        // ARIA attrs
        this.getContentElement().setAttribute("aria-expanded", this.getMenu().isVisible());
      },
      // property apply
      _applyShowCommandLabel: function _applyShowCommandLabel(value, old) {
        if (value) {
          this._showChildControl("shortcut");
        } else {
          this._excludeChildControl("shortcut");
        }
      }
    },

    /*
     *****************************************************************************
        DESTRUCTOR
     *****************************************************************************
     */
    destruct: function destruct() {
      this.removeListener("changeCommand", this._onChangeCommand, this);

      if (this.getMenu()) {
        if (!qx.core.ObjectRegistry.inShutDown) {
          this.getMenu().destroy();
        }
      }

      {
        qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
      }
    }
  });
  qx.ui.menu.AbstractButton.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.core.MRemoteChildrenHandling": {
        "require": true
      },
      "qx.ui.core.MRemoteLayoutHandling": {
        "require": true
      },
      "qx.ui.form.RepeatButton": {},
      "qx.ui.container.Composite": {},
      "qx.ui.core.scroll.ScrollPane": {},
      "qx.ui.layout.HBox": {},
      "qx.ui.layout.VBox": {}
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
       * Jonathan Weiß (jonathan_rass)
  
  ************************************************************************ */

  /**
   * Container, which provides scrolling in one dimension (vertical or horizontal).
   *
   * @childControl button-forward {qx.ui.form.RepeatButton} button to step forward
   * @childControl button-backward {qx.ui.form.RepeatButton} button to step backward
   * @childControl content {qx.ui.container.Composite} container to hold the content
   * @childControl scrollpane {qx.ui.core.scroll.ScrollPane} the scroll pane holds the content to enable scrolling
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   // create slide bar container
   *   slideBar = new qx.ui.container.SlideBar().set({
   *     width: 300
   *   });
   *
   *   // set layout
   *   slideBar.setLayout(new qx.ui.layout.HBox());
   *
   *   // add some widgets
   *   for (var i=0; i<10; i++)
   *   {
   *     slideBar.add((new qx.ui.core.Widget()).set({
   *       backgroundColor : (i % 2 == 0) ? "red" : "blue",
   *       width : 60
   *     }));
   *   }
   *
   *   this.getRoot().add(slideBar);
   * </pre>
   *
   * This example creates a SlideBar and add some widgets with alternating
   * background colors. Since the content is larger than the container, two
   * scroll buttons at the left and the right edge are shown.
   *
   * *External Documentation*
   *
   * <a href='http://qooxdoo.org/docs/#desktop/widget/slidebar.md' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.container.SlideBar", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MRemoteChildrenHandling, qx.ui.core.MRemoteLayoutHandling],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param orientation {String?"horizontal"} The slide bar orientation
     */
    construct: function construct(orientation) {
      qx.ui.core.Widget.constructor.call(this);
      var scrollPane = this.getChildControl("scrollpane");

      this._add(scrollPane, {
        flex: 1
      });

      if (orientation != null) {
        this.setOrientation(orientation);
      } else {
        this.initOrientation();
      }

      this.addListener("roll", this._onRoll, this);
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
        init: "slidebar"
      },

      /** Orientation of the bar */
      orientation: {
        check: ["horizontal", "vertical"],
        init: "horizontal",
        apply: "_applyOrientation"
      },

      /** The number of pixels to scroll if the buttons are pressed */
      scrollStep: {
        check: "Integer",
        init: 15,
        themeable: true
      }
    },

    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired on scroll animation end invoked by 'scroll*' methods. */
      scrollAnimationEnd: "qx.event.type.Event"
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
        WIDGET API
      ---------------------------------------------------------------------------
      */
      // overridden
      getChildrenContainer: function getChildrenContainer() {
        return this.getChildControl("content");
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "button-forward":
            control = new qx.ui.form.RepeatButton();
            control.addListener("execute", this._onExecuteForward, this);
            control.setFocusable(false);

            this._addAt(control, 2);

            break;

          case "button-backward":
            control = new qx.ui.form.RepeatButton();
            control.addListener("execute", this._onExecuteBackward, this);
            control.setFocusable(false);

            this._addAt(control, 0);

            break;

          case "content":
            control = new qx.ui.container.Composite();
            this.getChildControl("scrollpane").add(control);
            break;

          case "scrollpane":
            control = new qx.ui.core.scroll.ScrollPane();
            control.addListener("update", this._onResize, this);
            control.addListener("scrollX", this._onScroll, this);
            control.addListener("scrollY", this._onScroll, this);
            control.addListener("scrollAnimationEnd", this._onScrollAnimationEnd, this);
            break;
        }

        return control || qx.ui.container.SlideBar.superclass.prototype._createChildControlImpl.call(this, id);
      },
      // overridden

      /**
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: {
        barLeft: true,
        barTop: true,
        barRight: true,
        barBottom: true
      },

      /*
      ---------------------------------------------------------------------------
        PUBLIC SCROLL API
      ---------------------------------------------------------------------------
      */

      /**
       * Scrolls the element's content by the given amount.
       *
       * @param offset {Integer?0} Amount to scroll
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollBy: function scrollBy(offset, duration) {
        var pane = this.getChildControl("scrollpane");

        if (this.getOrientation() === "horizontal") {
          pane.scrollByX(offset, duration);
        } else {
          pane.scrollByY(offset, duration);
        }
      },

      /**
       * Scrolls the element's content to the given coordinate
       *
       * @param value {Integer} The position to scroll to.
       * @param duration {Number?} The time in milliseconds the scroll to should take.
       */
      scrollTo: function scrollTo(value, duration) {
        var pane = this.getChildControl("scrollpane");

        if (this.getOrientation() === "horizontal") {
          pane.scrollToX(value, duration);
        } else {
          pane.scrollToY(value, duration);
        }
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // overridden
      _applyEnabled: function _applyEnabled(value, old, name) {
        qx.ui.container.SlideBar.superclass.prototype._applyEnabled.call(this, value, old, name);

        this._updateArrowsEnabled();
      },
      // property apply
      _applyOrientation: function _applyOrientation(value, old) {
        // ARIA attrs
        this.getContentElement().setAttribute("aria-orientation", value);
        var oldLayouts = [this.getLayout(), this._getLayout()];
        var buttonForward = this.getChildControl("button-forward");
        var buttonBackward = this.getChildControl("button-backward"); // old can also be null, so we have to check both explicitly to set
        // the states correctly.

        if (old == "vertical" && value == "horizontal") {
          buttonForward.removeState("vertical");
          buttonBackward.removeState("vertical");
          buttonForward.addState("horizontal");
          buttonBackward.addState("horizontal");
        } else if (old == "horizontal" && value == "vertical") {
          buttonForward.removeState("horizontal");
          buttonBackward.removeState("horizontal");
          buttonForward.addState("vertical");
          buttonBackward.addState("vertical");
        }

        if (value == "horizontal") {
          this._setLayout(new qx.ui.layout.HBox());

          this.setLayout(new qx.ui.layout.HBox());
        } else {
          this._setLayout(new qx.ui.layout.VBox());

          this.setLayout(new qx.ui.layout.VBox());
        }

        if (oldLayouts[0]) {
          oldLayouts[0].dispose();
        }

        if (oldLayouts[1]) {
          oldLayouts[1].dispose();
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Scrolls pane on roll events
       *
       * @param e {qx.event.type.Roll} the roll event
       */
      _onRoll: function _onRoll(e) {
        // only wheel and touch
        if (e.getPointerType() == "mouse") {
          return;
        }

        var delta = 0;
        var pane = this.getChildControl("scrollpane");

        if (this.getOrientation() === "horizontal") {
          delta = e.getDelta().x;
          var position = pane.getScrollX();
          var max = pane.getScrollMaxX();
          var steps = parseInt(delta); // pass the event to the parent if both scrollbars are at the end

          if (!(steps < 0 && position <= 0 || steps > 0 && position >= max || delta == 0)) {
            e.stop();
          } else {
            e.stopMomentum();
          }
        } else {
          delta = e.getDelta().y;
          var position = pane.getScrollY();
          var max = pane.getScrollMaxY();
          var steps = parseInt(delta); // pass the event to the parent if both scrollbars are at the end

          if (!(steps < 0 && position <= 0 || steps > 0 && position >= max || delta == 0)) {
            e.stop();
          } else {
            e.stopMomentum();
          }
        }

        this.scrollBy(parseInt(delta, 10)); // block all momentum scrolling

        if (e.getMomentum()) {
          e.stop();
        }
      },

      /**
       * Update arrow enabled state after scrolling
       */
      _onScroll: function _onScroll() {
        this._updateArrowsEnabled();
      },

      /**
       * Handler to fire the 'scrollAnimationEnd' event.
       */
      _onScrollAnimationEnd: function _onScrollAnimationEnd() {
        this.fireEvent("scrollAnimationEnd");
      },

      /**
       * Listener for resize event. This event is fired after the
       * first flush of the element which leads to another queuing
       * when the changes modify the visibility of the scroll buttons.
       *
       * @param e {Event} Event object
       */
      _onResize: function _onResize(e) {
        var content = this.getChildControl("scrollpane").getChildren()[0];

        if (!content) {
          return;
        }

        var innerSize = this.getInnerSize();
        var contentSize = content.getBounds();
        var overflow = this.getOrientation() === "horizontal" ? contentSize.width > innerSize.width : contentSize.height > innerSize.height;

        if (overflow) {
          this._showArrows();

          this._updateArrowsEnabled();
        } else {
          this._hideArrows();
        }
      },

      /**
       * Scroll handler for left scrolling
       *
       */
      _onExecuteBackward: function _onExecuteBackward() {
        this.scrollBy(-this.getScrollStep());
      },

      /**
       * Scroll handler for right scrolling
       *
       */
      _onExecuteForward: function _onExecuteForward() {
        this.scrollBy(this.getScrollStep());
      },

      /*
      ---------------------------------------------------------------------------
        UTILITIES
      ---------------------------------------------------------------------------
      */

      /**
       * Update arrow enabled state
       */
      _updateArrowsEnabled: function _updateArrowsEnabled() {
        // set the disables state directly because we are overriding the
        // inheritance
        if (!this.getEnabled()) {
          this.getChildControl("button-backward").setEnabled(false);
          this.getChildControl("button-forward").setEnabled(false);
          return;
        }

        var pane = this.getChildControl("scrollpane");

        if (this.getOrientation() === "horizontal") {
          var position = pane.getScrollX();
          var max = pane.getScrollMaxX();
        } else {
          var position = pane.getScrollY();
          var max = pane.getScrollMaxY();
        }

        this.getChildControl("button-backward").setEnabled(position > 0);
        this.getChildControl("button-forward").setEnabled(position < max);
      },

      /**
       * Show the arrows (Called from resize event)
       *
       */
      _showArrows: function _showArrows() {
        this._showChildControl("button-forward");

        this._showChildControl("button-backward");
      },

      /**
       * Hide the arrows (Called from resize event)
       *
       */
      _hideArrows: function _hideArrows() {
        this._excludeChildControl("button-forward");

        this._excludeChildControl("button-backward");

        this.scrollTo(0);
      }
    }
  });
  qx.ui.container.SlideBar.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.container.SlideBar": {
        "construct": true,
        "require": true
      },
      "qx.ui.form.HoverButton": {}
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
   * The MenuSlideBar is used to scroll menus if they don't fit on the screen.
   *
   * @childControl button-forward {qx.ui.form.HoverButton} scrolls forward of hovered
   * @childControl button-backward {qx.ui.form.HoverButton} scrolls backward if hovered
   *
   * @internal
   */
  qx.Class.define("qx.ui.menu.MenuSlideBar", {
    extend: qx.ui.container.SlideBar,
    construct: function construct() {
      qx.ui.container.SlideBar.constructor.call(this, "vertical");
    },
    properties: {
      appearance: {
        refine: true,
        init: "menu-slidebar"
      }
    },
    members: {
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "button-forward":
            control = new qx.ui.form.HoverButton();
            control.addListener("execute", this._onExecuteForward, this);

            this._addAt(control, 2);

            break;

          case "button-backward":
            control = new qx.ui.form.HoverButton();
            control.addListener("execute", this._onExecuteBackward, this);

            this._addAt(control, 0);

            break;
        }

        return control || qx.ui.menu.MenuSlideBar.superclass.prototype._createChildControlImpl.call(this, id);
      }
    }
  });
  qx.ui.menu.MenuSlideBar.$$dbClassInfo = $$dbClassInfo;
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
      }
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
  
  ************************************************************************ */

  /**
   * The grow layout stretches all children to the full available size
   * but still respects limits configured by min/max values.
   *
   * It will place all children over each other with the top and left coordinates
   * set to <code>0</code>. The {@link qx.ui.container.Stack} and the
   * {@link qx.ui.core.scroll.ScrollPane} are using this layout.
   *
   * *Features*
   *
   * * Auto-sizing
   * * Respects minimum and maximum child dimensions
   *
   * *Item Properties*
   *
   * None
   *
   * *Example*
   *
   * <pre class="javascript">
   * var layout = new qx.ui.layout.Grow();
   *
   * var w1 = new qx.ui.core.Widget();
   * var w2 = new qx.ui.core.Widget();
   * var w3 = new qx.ui.core.Widget();
   *
   * var container = new qx.ui.container.Composite(layout);
   * container.add(w1);
   * container.add(w2);
   * container.add(w3);
   * </pre>
   *
   * *External Documentation*
   *
   * <a href='https://qooxdoo.org/documentation/#/desktop/layout/grow.md'>
   * Extended documentation</a> and links to demos of this layout in the qooxdoo manual.
   */
  qx.Class.define("qx.ui.layout.Grow", {
    extend: qx.ui.layout.Abstract,

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
          this.assert(false, "The property '" + name + "' is not supported by the Grow layout!");
        },
        "false": null
      }),
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        var children = this._getLayoutChildren();

        var child, size, width, height; // Render children

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          size = child.getSizeHint();
          width = availWidth;

          if (width < size.minWidth) {
            width = size.minWidth;
          } else if (width > size.maxWidth) {
            width = size.maxWidth;
          }

          height = availHeight;

          if (height < size.minHeight) {
            height = size.minHeight;
          } else if (height > size.maxHeight) {
            height = size.maxHeight;
          }

          child.renderLayout(padding.left, padding.top, width, height);
        }
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var children = this._getLayoutChildren();

        var child, size;
        var neededWidth = 0,
            neededHeight = 0;
        var minWidth = 0,
            minHeight = 0;
        var maxWidth = Infinity,
            maxHeight = Infinity; // Iterate over children

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          size = child.getSizeHint();
          neededWidth = Math.max(neededWidth, size.width);
          neededHeight = Math.max(neededHeight, size.height);
          minWidth = Math.max(minWidth, size.minWidth);
          minHeight = Math.max(minHeight, size.minHeight);
          maxWidth = Math.min(maxWidth, size.maxWidth);
          maxHeight = Math.min(maxHeight, size.maxHeight);
        } // Return hint


        return {
          width: neededWidth,
          height: neededHeight,
          minWidth: minWidth,
          minHeight: minHeight,
          maxWidth: maxWidth,
          maxHeight: maxHeight
        };
      }
    }
  });
  qx.ui.layout.Grow.$$dbClassInfo = $$dbClassInfo;
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
      "qx.lang.Type": {},
      "qx.util.ResourceManager": {},
      "qx.lang.Function": {},
      "qx.event.GlobalError": {
        "require": true
      },
      "qx.bom.client.Engine": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "qx.globalErrorHandling": {
          "className": "qx.event.GlobalError"
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
   * The ImageLoader can preload and manage loaded image resources. It easily
   * handles multiple requests and supports callbacks for successful and failed
   * requests.
   *
   * After loading of an image the dimension of the image is stored as long
   * as the application is running. This is quite useful for in-memory layouting.
   *
   * Use {@link #load} to preload your own images.
   */
  qx.Bootstrap.define("qx.io.ImageLoader", {
    statics: {
      /** @type {Map} Internal data structure to cache image sizes */
      __data__P_125_0: {},

      /** @type {Map} Default image size */
      __defaultSize__P_125_1: {
        width: null,
        height: null
      },

      /** @type {RegExp} Known image types */
      __knownImageTypesRegExp__P_125_2: /\.(png|gif|jpg|jpeg|bmp)\b/i,

      /** @type {RegExp} Image types of a data URL */
      __dataUrlRegExp__P_125_3: /^data:image\/(png|gif|jpg|jpeg|bmp)\b/i,

      /**
       * Whether the given image has previously been loaded using the
       * {@link #load} method.
       *
       * @param source {String} Image source to query
       * @return {Boolean} <code>true</code> when the image is loaded
       */
      isLoaded: function isLoaded(source) {
        var entry = this.__data__P_125_0[source];
        return !!(entry && entry.loaded);
      },

      /**
       * Whether the given image has previously been requested using the
       * {@link #load} method but failed.
       *
       * @param source {String} Image source to query
       * @return {Boolean} <code>true</code> when the image loading failed
       */
      isFailed: function isFailed(source) {
        var entry = this.__data__P_125_0[source];
        return !!(entry && entry.failed);
      },

      /**
       * Whether the given image is currently loading.
       *
       * @param source {String} Image source to query
       * @return {Boolean} <code>true</code> when the image is loading in the moment.
       */
      isLoading: function isLoading(source) {
        var entry = this.__data__P_125_0[source];
        return !!(entry && entry.loading);
      },

      /**
       * Returns the format of a previously loaded image
       *
       * @param source {String} Image source to query
       * @return {String ? null} The format of the image or <code>null</code>
       */
      getFormat: function getFormat(source) {
        var entry = this.__data__P_125_0[source];

        if (!entry || !entry.format) {
          var result = this.__dataUrlRegExp__P_125_3.exec(source);

          if (result != null) {
            // If width and height aren't defined, provide some defaults
            var width = entry && qx.lang.Type.isNumber(entry.width) ? entry.width : this.__defaultSize__P_125_1.width;
            var height = entry && qx.lang.Type.isNumber(entry.height) ? entry.height : this.__defaultSize__P_125_1.height;
            entry = {
              loaded: true,
              format: result[1],
              width: width,
              height: height
            };
          }
        }

        return entry ? entry.format : null;
      },

      /**
       * Returns the size of a previously loaded image
       *
       * @param source {String} Image source to query
       * @return {Map} The dimension of the image (<code>width</code> and
       *    <code>height</code> as key). If the image is not yet loaded, the
       *    dimensions are given as <code>null</code> for width and height.
       */
      getSize: function getSize(source) {
        var entry = this.__data__P_125_0[source];
        return entry ? {
          width: entry.width,
          height: entry.height
        } : this.__defaultSize__P_125_1;
      },

      /**
       * Returns the image width
       *
       * @param source {String} Image source to query
       * @return {Integer} The width or <code>null</code> when the image is not loaded
       */
      getWidth: function getWidth(source) {
        var entry = this.__data__P_125_0[source];
        return entry ? entry.width : null;
      },

      /**
       * Returns the image height
       *
       * @param source {String} Image source to query
       * @return {Integer} The height or <code>null</code> when the image is not loaded
       */
      getHeight: function getHeight(source) {
        var entry = this.__data__P_125_0[source];
        return entry ? entry.height : null;
      },

      /**
       * Loads the given image. Supports a callback which is
       * executed when the image is loaded.
       *
       * This method works asynchronous.
       *
       * @param source {String} Image source to load
       * @param callback {Function?} Callback function to execute
       *   The first parameter of the callback is the given source url, the
       *   second parameter is the data entry which contains additional
       *   information about the image.
       * @param context {Object?} Context in which the given callback should be executed
       */
      load: function load(source, callback, context) {
        // Shorthand
        var entry = this.__data__P_125_0[source];

        if (!entry) {
          entry = this.__data__P_125_0[source] = {};
        } // Normalize context


        if (callback && !context) {
          context = window;
        } // Already known image source


        if (entry.loaded || entry.loading || entry.failed) {
          if (callback) {
            if (entry.loading) {
              entry.callbacks.push(callback, context);
            } else {
              callback.call(context, source, entry);
            }
          }
        } else {
          // Updating entry
          entry.loading = true;
          entry.callbacks = [];

          if (callback) {
            entry.callbacks.push(callback, context);
          }

          var ResourceManager = qx.util.ResourceManager.getInstance();

          if (ResourceManager.isFontUri(source)) {
            var el = document.createElement("div");
            var charCode = ResourceManager.fromFontUriToCharCode(source);
            el.value = String.fromCharCode(charCode);
            entry.element = el;
            return;
          } // Create image element


          var el = document.createElement("img"); // Create common callback routine

          var boundCallback = qx.lang.Function.listener(this.__onload__P_125_4, this, el, source); // Assign callback to element

          el.onload = boundCallback;
          el.onerror = boundCallback; // Start loading of image

          el.src = source; // save the element for aborting

          entry.element = el;
        }
      },

      /**
       * Abort the loading for the given url.
       *
       * @param source {String} URL of the image to abort its loading.
       */
      abort: function abort(source) {
        var entry = this.__data__P_125_0[source];

        if (entry && !entry.loaded) {
          entry.aborted = true;
          var callbacks = entry.callbacks;
          var element = entry.element; // Cleanup listeners

          element.onload = element.onerror = null; // prevent further loading

          element.src = ""; // Cleanup entry

          delete entry.callbacks;
          delete entry.element;
          delete entry.loading;

          for (var i = 0, l = callbacks.length; i < l; i += 2) {
            callbacks[i].call(callbacks[i + 1], source, entry);
          }
        }

        this.__data__P_125_0[source] = null;
      },

      /**
       * Calls a method based on qx.globalErrorHandling
       */
      __onload__P_125_4: function __onload__P_125_4() {
        var callback = qx.core.Environment.select("qx.globalErrorHandling", {
          "true": qx.event.GlobalError.observeMethod(this.__onLoadHandler__P_125_5),
          "false": this.__onLoadHandler__P_125_5
        });
        callback.apply(this, arguments);
      },

      /**
       * Internal event listener for all load/error events.
       *
       * @signature function(event, element, source)
       *
       * @param event {Event} Native event object
       * @param element {Element} DOM element which represents the image
       * @param source {String} The image source loaded
       */
      __onLoadHandler__P_125_5: function __onLoadHandler__P_125_5(event, element, source) {
        // Shorthand
        var entry = this.__data__P_125_0[source]; // [BUG #9149]: When loading a SVG IE11 won't have
        // the width/height of the element set, unless
        // it is inserted into the DOM.

        if (qx.bom.client.Engine.getName() == "mshtml" && parseFloat(qx.bom.client.Engine.getVersion()) === 11) {
          document.body.appendChild(element);
        }

        var isImageAvailable = function isImageAvailable(imgElem) {
          return imgElem && imgElem.height !== 0;
        }; // [BUG #7497]: IE11 doesn't properly emit an error event
        // when loading fails so augment success check


        if (event.type === "load" && isImageAvailable(element)) {
          // Store dimensions
          entry.loaded = true;
          entry.width = element.width;
          entry.height = element.height; // try to determine the image format

          var result = this.__knownImageTypesRegExp__P_125_2.exec(source);

          if (result != null) {
            entry.format = result[1];
          }
        } else {
          entry.failed = true;
        }

        if (qx.bom.client.Engine.getName() == "mshtml" && parseFloat(qx.bom.client.Engine.getVersion()) === 11) {
          document.body.removeChild(element);
        } // Cleanup listeners


        element.onload = element.onerror = null; // Cache callbacks

        var callbacks = entry.callbacks; // Cleanup entry

        delete entry.loading;
        delete entry.callbacks;
        delete entry.element; // Execute callbacks

        for (var i = 0, l = callbacks.length; i < l; i += 2) {
          callbacks[i].call(callbacks[i + 1], source, entry);
        }
      },

      /**
       * Dispose stored images.
       */
      dispose: function dispose() {
        this.__data__P_125_0 = {};
      }
    }
  });
  qx.io.ImageLoader.$$dbClassInfo = $$dbClassInfo;
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
      },
      "qx.bom.Label": {}
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
   * A cross browser label instance with support for rich HTML and text labels.
   *
   * Text labels supports ellipsis to reduce the text width.
   *
   * The mode can be changed through the method {@link #setRich}
   * which accepts a boolean value. The default mode is "text" which is
   * a good choice because it has a better performance.
   */
  qx.Class.define("qx.html.Label", {
    extend: qx.html.Element,

    /**
     * Creates a new Image
     *
     * @see constructor for {Element}
     */
    construct: function construct(tagName, styles, attributes) {
      qx.html.Element.constructor.call(this, tagName, styles, attributes);
      this.registerProperty("value", null, this._setValueProperty);
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      __rich__P_120_0: null,

      /*
      ---------------------------------------------------------------------------
        ELEMENT API
      ---------------------------------------------------------------------------
      */

      /**
       * Implementation of setter for the "value" property
       *
       * @param value {String?} value to set
       */
      _setValueProperty: function _setValueProperty(value) {
        var element = this.getDomElement();
        qx.bom.Label.setValue(element, value);
      },
      // overridden
      _createDomElement: function _createDomElement() {
        var rich = this.__rich__P_120_0;
        var el = qx.bom.Label.create(this._content, rich);
        el.style.overflow = "hidden";
        return el;
      },
      // overridden
      // be sure that style attributes are merged and not overwritten
      _copyData: function _copyData(fromMarkup, propertiesFromDom) {
        return qx.html.Label.superclass.prototype._copyData.call(this, true, propertiesFromDom);
      },

      /*
      ---------------------------------------------------------------------------
        LABEL API
      ---------------------------------------------------------------------------
      */

      /**
       * Toggles between rich HTML mode and pure text mode.
       *
       * @param value {Boolean} Whether the HTML mode should be used.
       * @return {qx.html.Label} This instance for chaining support.
       */
      setRich: function setRich(value) {
        var element = this.getDomElement();

        if (element) {
          throw new Error("The label mode cannot be modified after initial creation");
        }

        value = !!value;

        if (this.__rich__P_120_0 == value) {
          return this;
        }

        this.__rich__P_120_0 = value;
        return this;
      },

      /**
       * Sets the HTML/text content depending on the content mode.
       *
       * @param value {String} The content to be used.
       * @return {qx.html.Label} This instance for for chaining support.
       */
      setValue: function setValue(value) {
        this._setProperty("value", value);

        return this;
      },

      /**
       * Get the current content.
       *
       * @return {String} The labels's content
       */
      getValue: function getValue() {
        return this._getProperty("value");
      },

      /**
       * Reset the current content
       *
       * @return {qx.html.Label} This instance for for chaining support.
       */
      resetValue: function resetValue() {
        return this._removeProperty("value");
      }
    }
  });
  qx.html.Label.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.bom.client.Engine": {},
      "qx.core.Environment": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": ["io.maxrequests", "io.ssl", "io.xhr"],
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
       * Carsten Lergenmueller (carstenl)
       * Fabian Jakobs (fbjakobs)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Determines browser-dependent information about the transport layer.
   *
   * This class is used by {@link qx.core.Environment} and should not be used
   * directly. Please check its class comment for details how to use it.
   *
   * @internal
   */
  qx.Bootstrap.define("qx.bom.client.Transport", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /**
       * Returns the maximum number of parallel requests the current browser
       * supports per host addressed.
       *
       * Note that this assumes one connection can support one request at a time
       * only. Technically, this is not correct when pipelining is enabled (which
       * it currently is only for IE 8 and Opera). In this case, the number
       * returned will be too low, as one connection supports multiple pipelined
       * requests. This is accepted for now because pipelining cannot be
       * detected from JavaScript and because modern browsers have enough
       * parallel connections already - it's unlikely an app will require more
       * than 4 parallel XMLHttpRequests to one server at a time.
       *
       * @internal
       * @return {Integer} Maximum number of parallel requests
       */
      getMaxConcurrentRequestCount: function getMaxConcurrentRequestCount() {
        var maxConcurrentRequestCount; // Parse version numbers.

        var versionParts = qx.bom.client.Engine.getVersion().split(".");
        var versionMain = 0;
        var versionMajor = 0;
        var versionMinor = 0; // Main number

        if (versionParts[0]) {
          versionMain = versionParts[0];
        } // Major number


        if (versionParts[1]) {
          versionMajor = versionParts[1];
        } // Minor number


        if (versionParts[2]) {
          versionMinor = versionParts[2];
        } // IE 8 gives the max number of connections in a property
        // see http://msdn.microsoft.com/en-us/library/cc197013(VS.85).aspx


        if (window.maxConnectionsPerServer) {
          maxConcurrentRequestCount = window.maxConnectionsPerServer;
        } else if (qx.bom.client.Engine.getName() == "opera") {
          // Opera: 8 total
          // see http://operawiki.info/HttpProtocol
          maxConcurrentRequestCount = 8;
        } else if (qx.bom.client.Engine.getName() == "webkit") {
          // Safari: 4
          // http://www.stevesouders.com/blog/2008/03/20/roundup-on-parallel-connections/
          // Bug #6917: Distinguish Chrome from Safari, Chrome has 6 connections
          //       according to
          //      http://stackoverflow.com/questions/561046/how-many-concurrent-ajax-xmlhttprequest-requests-are-allowed-in-popular-browser
          maxConcurrentRequestCount = 4;
        } else if (qx.bom.client.Engine.getName() == "gecko" && (versionMain > 1 || versionMain == 1 && versionMajor > 9 || versionMain == 1 && versionMajor == 9 && versionMinor >= 1)) {
          // FF 3.5 (== Gecko 1.9.1): 6 Connections.
          // see  http://gemal.dk/blog/2008/03/18/firefox_3_beta_5_will_have_improved_connection_parallelism/
          maxConcurrentRequestCount = 6;
        } else {
          // Default is 2, as demanded by RFC 2616
          // see http://blogs.msdn.com/ie/archive/2005/04/11/407189.aspx
          maxConcurrentRequestCount = 2;
        }

        return maxConcurrentRequestCount;
      },

      /**
       * Checks whether the app is loaded with SSL enabled which means via https.
       *
       * @internal
       * @return {Boolean} <code>true</code>, if the app runs on https
       */
      getSsl: function getSsl() {
        return window.location.protocol === "https:";
      },

      /**
       * Checks what kind of XMLHttpRequest object the browser supports
       * for the current protocol, if any.
       *
       * The standard XMLHttpRequest is preferred over ActiveX XMLHTTP.
       *
       * @internal
       * @return {String}
       *  <code>"xhr"</code>, if the browser provides standard XMLHttpRequest.<br/>
       *  <code>"activex"</code>, if the browser provides ActiveX XMLHTTP.<br/>
       *  <code>""</code>, if there is not XHR support at all.
       */
      getXmlHttpRequest: function getXmlHttpRequest() {
        // Standard XHR can be disabled in IE's security settings,
        // therefore provide ActiveX as fallback. Additionally,
        // standard XHR in IE7 is broken for file protocol.
        var supports = window.ActiveXObject ? function () {
          if (window.location.protocol !== "file:") {
            try {
              new window.XMLHttpRequest();
              return "xhr";
            } catch (noXhr) {}
          }

          try {
            new window.ActiveXObject("Microsoft.XMLHTTP");
            return "activex";
          } catch (noActiveX) {}
        }() : function () {
          try {
            new window.XMLHttpRequest();
            return "xhr";
          } catch (noXhr) {}
        }();
        return supports || "";
      }
    },
    defer: function defer(statics) {
      qx.core.Environment.add("io.maxrequests", statics.getMaxConcurrentRequestCount);
      qx.core.Environment.add("io.ssl", statics.getSsl);
      qx.core.Environment.add("io.xhr", statics.getXmlHttpRequest);
    }
  });
  qx.bom.client.Transport.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Device": {},
      "qx.bom.client.Engine": {
        "defer": "load",
        "require": true
      },
      "qx.bom.client.Transport": {
        "defer": "load",
        "require": true
      },
      "qx.util.LibraryManager": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine",
          "defer": true
        },
        "io.ssl": {
          "className": "qx.bom.client.Transport",
          "defer": true
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
   * Contains information about images (size, format, clipping, ...) and
   * other resources like CSS files, local data, ...
   */
  qx.Class.define("qx.util.ResourceManager", {
    extend: qx.core.Object,
    type: "singleton",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Map} the shared image registry */
      __registry__P_127_0: qx.$$resources || {},

      /** @type {Map} prefix per library used in HTTPS mode for IE */
      __urlPrefix__P_127_1: {}
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Detects whether there is a high-resolution image available.
       * A high-resolution image is assumed to have the same file name as
       * the parameter source, but with a pixelRatio identifier before the file
       * extension, like "@2x".
       * Medium Resolution: "example.png", high-resolution: "example@2x.png"
       *
       * @param lowResImgSrc {String} source of the low resolution image.
       * @param factor {Number} Factor to find the right image. If not set calculated by getDevicePixelRatio()
       * @return {String|Boolean} If a high-resolution image source.
       */
      findHighResolutionSource: function findHighResolutionSource(lowResImgSrc, factor) {
        var pixelRatioCandidates = ["3", "2", "1.5"]; // Calculate the optimal ratio, based on the rem scale factor of the application and the device pixel ratio.

        if (!factor) {
          factor = parseFloat(qx.bom.client.Device.getDevicePixelRatio().toFixed(2));
        }

        if (factor <= 1) {
          return false;
        }

        var i = pixelRatioCandidates.length;

        while (i > 0 && factor > pixelRatioCandidates[--i]) {}

        var hiResImgSrc;
        var k; // Search for best img with a higher resolution.

        for (k = i; k >= 0; k--) {
          hiResImgSrc = this.getHighResolutionSource(lowResImgSrc, pixelRatioCandidates[k]);

          if (hiResImgSrc) {
            return hiResImgSrc;
          }
        } // Search for best img with a lower resolution.


        for (k = i + 1; k < pixelRatioCandidates.length; k++) {
          hiResImgSrc = this.getHighResolutionSource(lowResImgSrc, pixelRatioCandidates[k]);

          if (hiResImgSrc) {
            return hiResImgSrc;
          }
        }

        return null;
      },

      /**
       * Returns the source name for the high-resolution image based on the passed
       * parameters.
       * @param source {String} the source of the medium resolution image.
       * @param pixelRatio {Number} the pixel ratio of the high-resolution image.
       * @return {String} the high-resolution source name or null if no source could be found.
       */
      getHighResolutionSource: function getHighResolutionSource(source, pixelRatio) {
        var fileExtIndex = source.lastIndexOf(".");

        if (fileExtIndex > -1) {
          var pixelRatioIdentifier = "@" + pixelRatio + "x";
          var candidate = source.slice(0, fileExtIndex) + pixelRatioIdentifier + source.slice(fileExtIndex);

          if (this.has(candidate)) {
            return candidate;
          }
        }

        return null;
      },

      /**
       * Get all known resource IDs.
       *
       * @param pathfragment{String|null|undefined} an optional path fragment to check against with id.indexOf(pathfragment)
       * @return {Array|null} an array containing the IDs or null if the registry is not initialized
       */
      getIds: function getIds(pathfragment) {
        var registry = qx.util.ResourceManager.__registry__P_127_0;

        if (!registry) {
          return null;
        }

        return Object.keys(registry).filter(function (key) {
          return !pathfragment || key.indexOf(pathfragment) != -1;
        });
      },

      /**
       * Whether the registry has information about the given resource.
       *
       * @param id {String} The resource to get the information for
       * @return {Boolean} <code>true</code> when the resource is known.
       */
      has: function has(id) {
        return !!qx.util.ResourceManager.__registry__P_127_0[id];
      },

      /**
       * Get information about an resource.
       *
       * @param id {String} The resource to get the information for
       * @return {Array} Registered data or <code>null</code>
       */
      getData: function getData(id) {
        return qx.util.ResourceManager.__registry__P_127_0[id] || null;
      },

      /**
       * Returns the width of the given resource ID,
       * when it is not a known image <code>0</code> is
       * returned.
       *
       * @param id {String} Resource identifier
       * @return {Integer} The image width, maybe <code>null</code> when the width is unknown
       */
      getImageWidth: function getImageWidth(id) {
        var size;

        if (id && id.startsWith("@")) {
          var part = id.split("/");
          size = parseInt(part[2], 10);

          if (size) {
            id = part[0] + "/" + part[1];
          }
        }

        var entry = qx.util.ResourceManager.__registry__P_127_0[id]; // [ width, height, codepoint ]

        if (size && entry) {
          var width = Math.ceil(size / entry[1] * entry[0]);
          return width;
        }

        return entry ? entry[0] : null;
      },

      /**
       * Returns the height of the given resource ID,
       * when it is not a known image <code>0</code> is
       * returned.
       *
       * @param id {String} Resource identifier
       * @return {Integer} The image height, maybe <code>null</code> when the height is unknown
       */
      getImageHeight: function getImageHeight(id) {
        if (id && id.startsWith("@")) {
          var part = id.split("/");
          var size = parseInt(part[2], 10);

          if (size) {
            return size;
          }
        }

        var entry = qx.util.ResourceManager.__registry__P_127_0[id];
        return entry ? entry[1] : null;
      },

      /**
       * Returns the format of the given resource ID,
       * when it is not a known image <code>null</code>
       * is returned.
       *
       * @param id {String} Resource identifier
       * @return {String} File format of the image
       */
      getImageFormat: function getImageFormat(id) {
        if (id && id.startsWith("@")) {
          return "font";
        }

        var entry = qx.util.ResourceManager.__registry__P_127_0[id];
        return entry ? entry[2] : null;
      },

      /**
       * Returns the format of the combined image (png, gif, ...), if the given
       * resource identifier is an image contained in one, or the empty string
       * otherwise.
       *
       * @param id {String} Resource identifier
       * @return {String} The type of the combined image containing id
       */
      getCombinedFormat: function getCombinedFormat(id) {
        var clippedtype = "";
        var entry = qx.util.ResourceManager.__registry__P_127_0[id];
        var isclipped = entry && entry.length > 4 && typeof entry[4] == "string" && this.constructor.__registry__P_127_0[entry[4]];

        if (isclipped) {
          var combId = entry[4];
          var combImg = this.constructor.__registry__P_127_0[combId];
          clippedtype = combImg[2];
        }

        return clippedtype;
      },

      /**
       * Converts the given resource ID to a full qualified URI
       *
       * @param id {String} Resource ID
       * @return {String} Resulting URI
       */
      toUri: function toUri(id) {
        if (id == null) {
          return id;
        }

        var entry = qx.util.ResourceManager.__registry__P_127_0[id];

        if (!entry) {
          return id;
        }

        if (typeof entry === "string") {
          var lib = entry;
        } else {
          var lib = entry[3]; // no lib reference
          // may mean that the image has been registered dynamically

          if (!lib) {
            return id;
          }
        }

        var urlPrefix = "";

        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("io.ssl")) {
          urlPrefix = qx.util.ResourceManager.__urlPrefix__P_127_1[lib];
        }

        return urlPrefix + qx.util.LibraryManager.getInstance().get(lib, "resourceUri") + "/" + id;
      },

      /**
       * Construct a data: URI for an image resource.
       *
       * Constructs a data: URI for a given resource id, if this resource is
       * contained in a base64 combined image. If this is not the case (e.g.
       * because the combined image has not been loaded yet), returns the direct
       * URI to the image file itself.
       *
       * @param resid {String} resource id of the image
       * @return {String} "data:" or "http:" URI
       */
      toDataUri: function toDataUri(resid) {
        var resentry = this.constructor.__registry__P_127_0[resid];
        var combined = resentry ? this.constructor.__registry__P_127_0[resentry[4]] : null;
        var uri;

        if (combined) {
          var resstruct = combined[4][resid];
          uri = "data:image/" + resstruct["type"] + ";" + resstruct["encoding"] + "," + resstruct["data"];
        } else {
          uri = this.toUri(resid);
        }

        return uri;
      },

      /**
       * Checks whether a given resource id for an image is a font handle.
       *
       * @param resid {String} resource id of the image
       * @return {Boolean} True if it's a font URI
       */
      isFontUri: function isFontUri(resid) {
        return resid ? resid.startsWith("@") : false;
      },

      /**
       * Returns the correct char code, ignoring scale postfix.
       *
       * The resource ID can be a ligature name (eg `@FontAwesome/heart` or `@MaterialIcons/home/16`),
       * or a hex character code (eg `@FontAwesome/f004` or `@FontAwesome/f004/16`)
       *
       * @param source {String} resource id of the image
       * @returns charCode of the glyph
       */
      fromFontUriToCharCode: function fromFontUriToCharCode(source) {
        var sparts = source.split("/");
        var fontSource = source;

        if (sparts.length > 2) {
          fontSource = sparts[0] + "/" + sparts[1];
        }

        var resource = this.getData(fontSource);
        var charCode = null;

        if (resource) {
          charCode = resource[2];
        } else {
          var hexString = source.match(/@([^/]+)\/(.*)$/)[2];

          if (hexString) {
            charCode = parseInt(hexString, 16);

            if (isNaN(charCode)) {
              charCode = null;
            }
          }
        }

        if (!charCode) {
          throw new Error("Cannot determine charCode from source: ".concat(source));
        }

        return charCode;
      }
    },
    defer: function defer(statics) {
      if (qx.core.Environment.get("engine.name") == "mshtml") {
        // To avoid a "mixed content" warning in IE when the application is
        // delivered via HTTPS a prefix has to be added. This will transform the
        // relative URL to an absolute one in IE.
        // Though this warning is only displayed in conjunction with images which
        // are referenced as a CSS "background-image", every resource path is
        // changed when the application is served with HTTPS.
        if (qx.core.Environment.get("io.ssl")) {
          for (var lib in qx.$$libraries) {
            var resourceUri;

            if (qx.util.LibraryManager.getInstance().get(lib, "resourceUri")) {
              resourceUri = qx.util.LibraryManager.getInstance().get(lib, "resourceUri");
            } else {
              // default for libraries without a resourceUri set
              statics.__urlPrefix__P_127_1[lib] = "";
              continue;
            }

            var href; //first check if there is base url set

            var baseElements = document.getElementsByTagName("base");

            if (baseElements.length > 0) {
              href = baseElements[0].href;
            } // It is valid to to begin a URL with "//" so this case has to
            // be considered. If the to resolved URL begins with "//" the
            // manager prefixes it with "https:" to avoid any problems for IE


            if (resourceUri.match(/^\/\//) != null) {
              statics.__urlPrefix__P_127_1[lib] = window.location.protocol;
            } // If the resourceUri begins with a single slash, include the current
            // hostname
            else if (resourceUri.match(/^\//) != null) {
              if (href) {
                statics.__urlPrefix__P_127_1[lib] = href;
              } else {
                statics.__urlPrefix__P_127_1[lib] = window.location.protocol + "//" + window.location.host;
              }
            } // If the resolved URL begins with "./" the final URL has to be
            // put together using the document.URL property.
            // IMPORTANT: this is only applicable for the source version
            else if (resourceUri.match(/^\.\//) != null) {
              var url = document.URL;
              statics.__urlPrefix__P_127_1[lib] = url.substring(0, url.lastIndexOf("/") + 1);
            } else if (resourceUri.match(/^http/) != null) {
              // Let absolute URLs pass through
              statics.__urlPrefix__P_127_1[lib] = "";
            } else {
              if (!href) {
                // check for parameters with URLs as value
                var index = window.location.href.indexOf("?");

                if (index == -1) {
                  href = window.location.href;
                } else {
                  href = window.location.href.substring(0, index);
                }
              }

              statics.__urlPrefix__P_127_1[lib] = href.substring(0, href.lastIndexOf("/") + 1);
            }
          }
        }
      }
    }
  });
  qx.util.ResourceManager.$$dbClassInfo = $$dbClassInfo;
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
  
     Author:
       * Daniel Wagner (danielwagner)
  
  ************************************************************************ */

  /**
   * Provides read/write access to library-specific information such as
   * source/resource URIs.
   */
  qx.Class.define("qx.util.LibraryManager", {
    extend: qx.core.Object,
    type: "singleton",
    statics: {
      /** @type {Map} The libraries used by this application */
      __libs__P_152_0: qx.$$libraries || {}
    },
    members: {
      /**
       * Checks whether the library with the given namespace is known to the
       * application.
       * @param namespace {String} The library's namespace
       * @return {Boolean} <code>true</code> if the given library is known
       */
      has: function has(namespace) {
        return !!qx.util.LibraryManager.__libs__P_152_0[namespace];
      },

      /**
       * Returns the value of an attribute of the given library
       * @param namespace {String} The library's namespace
       * @param key {String} Name of the attribute
       * @return {var|null} The attribute's value or <code>null</code> if it's not defined
       */
      get: function get(namespace, key) {
        return qx.util.LibraryManager.__libs__P_152_0[namespace][key] ? qx.util.LibraryManager.__libs__P_152_0[namespace][key] : null;
      },

      /**
       * Sets an attribute on the given library.
       *
       * @param namespace {String} The library's namespace
       * @param key {String} Name of the attribute
       * @param value {var} Value of the attribute
       */
      set: function set(namespace, key, value) {
        qx.util.LibraryManager.__libs__P_152_0[namespace][key] = value;
      }
    }
  });
  qx.util.LibraryManager.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.client.Engine": {
        "require": true
      },
      "qx.util.ResourceManager": {},
      "qx.bom.element.Style": {},
      "qx.bom.client.Css": {
        "require": true
      },
      "qx.theme.manager.Font": {},
      "qx.lang.Object": {},
      "qx.bom.Style": {},
      "qx.io.ImageLoader": {},
      "qx.log.Logger": {},
      "qx.bom.element.Background": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "load": true,
          "className": "qx.bom.client.Engine"
        },
        "css.alphaimageloaderneeded": {
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
       * Alexander Steitz (aback)
  
  ************************************************************************ */

  /**
   * Powerful creation and update features for images used for decoration
   * purposes like for rounded borders, icons, etc.
   *
   * Includes support for image clipping, PNG alpha channel support, additional
   * repeat options like <code>scale-x</code> or <code>scale-y</code>.
   */
  qx.Class.define("qx.bom.element.Decoration", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Boolean} Whether clipping hints should be logged */
      DEBUG: false,

      /** @type {Map} Collect warnings for potential clipped images */
      __warnings__P_128_0: {},

      /** @type {Map} List of repeat modes which supports the IE AlphaImageLoader */
      __alphaFixRepeats__P_128_1: qx.core.Environment.select("engine.name", {
        mshtml: {
          "scale-x": true,
          "scale-y": true,
          scale: true,
          "no-repeat": true
        },
        "default": null
      }),

      /** @type {Map} Mapping between background repeat and the tag to create */
      __repeatToTagname__P_128_2: {
        "scale-x": "img",
        "scale-y": "img",
        scale: "img",
        repeat: "div",
        "no-repeat": "div",
        "repeat-x": "div",
        "repeat-y": "div"
      },

      /**
       * Updates the element to display the given source
       * with the repeat option.
       *
       * @param element {Element} DOM element to update
       * @param source {String} Any valid URI
       * @param repeat {String} One of <code>scale-x</code>, <code>scale-y</code>,
       *   <code>scale</code>, <code>repeat</code>, <code>repeat-x</code>,
       *   <code>repeat-y</code>, <code>repeat</code>
       * @param style {Map} Additional styles to apply
       */
      update: function update(element, source, repeat, style) {
        var tag = this.getTagName(repeat, source);

        if (tag != element.tagName.toLowerCase()) {
          // The "no-repeat" means that `getTagName` will suggest a `div` as opposed to an `img` tag, preferring to use
          //  `img` only for things that need scaling.  The Desktop `qx.ui.*` will always follow this rule, but it
          //  is valid for virtual DOM (`qx.html.*`) to be used to create a no-repeat `img` tag.  Ignore the validation
          //  for `no-repeat` `img`.
          if (repeat != "no-repeat" || element.tagName.toLowerCase() != "img") {
            throw new Error("Image modification not possible because elements could not be replaced at runtime anymore!");
          }
        }

        var ret = this.getAttributes(source, repeat, style);

        if (tag === "img") {
          element.src = ret.src || qx.util.ResourceManager.getInstance().toUri("qx/static/blank.gif");
        } // Fix for old background position


        if (element.style.backgroundPosition != "" && ret.style.backgroundPosition === undefined) {
          ret.style.backgroundPosition = null;
        } // Fix for old clip


        if (element.style.clip != "" && ret.style.clip === undefined) {
          ret.style.clip = null;
        } // Apply new styles


        qx.bom.element.Style.setStyles(element, ret.style); // we need to apply the filter to prevent black rendering artifacts
        // http://blog.hackedbrain.com/archive/2007/05/21/6110.aspx

        if (qx.core.Environment.get("css.alphaimageloaderneeded")) {
          try {
            element.filters["DXImageTransform.Microsoft.AlphaImageLoader"].apply();
          } catch (e) {}
        }
      },

      /**
       * Creates the HTML for a decorator image element with the given options.
       *
       * @param source {String} Any valid URI
       * @param repeat {String} One of <code>scale-x</code>, <code>scale-y</code>,
       *   <code>scale</code>, <code>repeat</code>, <code>repeat-x</code>,
       *   <code>repeat-y</code>, <code>repeat</code>
       * @param style {Map} Additional styles to apply
       * @return {String} Decorator image HTML
       */
      create: function create(source, repeat, style) {
        var tag = this.getTagName(repeat, source);
        var ret = this.getAttributes(source, repeat, style);
        var css = qx.bom.element.Style.compile(ret.style);
        var ResourceManager = qx.util.ResourceManager.getInstance();

        if (ResourceManager.isFontUri(source)) {
          var font = qx.theme.manager.Font.getInstance().resolve(source.match(/@([^/]+)/)[1]);
          var styles = qx.lang.Object.clone(font.getStyles());
          styles["width"] = style.width;
          styles["height"] = style.height;
          styles["fontSize"] = parseInt(style.width) > parseInt(style.height) ? style.height : style.width;
          styles["display"] = style.display;
          styles["verticalAlign"] = style.verticalAlign;
          styles["position"] = style.position;
          var css = "";

          for (var _style in styles) {
            if (styles.hasOwnProperty(_style)) {
              css += qx.bom.Style.getCssName(_style) + ": " + styles[_style] + ";";
            }
          }

          var charCode = ResourceManager.fromFontUriToCharCode(source);
          return '<div style="' + css + '">' + String.fromCharCode(charCode) + "</div>";
        } else {
          if (tag === "img") {
            return '<img src="' + ret.src + '" style="' + css + '"/>';
          } else {
            return '<div style="' + css + '"></div>';
          }
        }
      },

      /**
       * Translates the given repeat option to a tag name. Useful
       * for systems which depends on early information of the tag
       * name to prepare element like {@link qx.html.Image}.
       *
       * @param repeat {String} One of <code>scale-x</code>, <code>scale-y</code>,
       *   <code>scale</code>, <code>repeat</code>, <code>repeat-x</code>,
       *   <code>repeat-y</code>, <code>repeat</code>
       * @param source {String?null} Source used to identify the image format
       * @return {String} The tag name: <code>div</code> or <code>img</code>
       */
      getTagName: function getTagName(repeat, source) {
        if (source && qx.core.Environment.get("css.alphaimageloaderneeded") && this.__alphaFixRepeats__P_128_1[repeat] && source.endsWith(".png")) {
          return "div";
        }

        return this.__repeatToTagname__P_128_2[repeat];
      },

      /**
       * This method is used to collect all needed attributes for
       * the tag name detected by {@link #getTagName}.
       *
       * @param source {String} Image source
       * @param repeat {String} Repeat mode of the image
       * @param style {Map} Additional styles to apply
       * @return {String} Markup for image
       */
      getAttributes: function getAttributes(source, repeat, style) {
        if (!style) {
          style = {};
        }

        if (qx.core.Environment.get("engine.name") == "mshtml") {
          // Add a fix for small blocks where IE has a minHeight
          // of the fontSize in quirks mode
          style.fontSize = 0;
          style.lineHeight = 0;
        } else if (qx.core.Environment.get("engine.name") == "webkit") {
          // This stops images from being draggable in webkit
          style.WebkitUserDrag = "none";
        }

        var format = qx.util.ResourceManager.getInstance().getImageFormat(source) || qx.io.ImageLoader.getFormat(source);
        {
          if (source != null && format == null) {
            qx.log.Logger.warn("ImageLoader: Not recognized format of external image '" + source + "'!");
          }
        }
        var result; // Enable AlphaImageLoader in IE6/IE7/IE8

        if (qx.core.Environment.get("css.alphaimageloaderneeded") && this.__alphaFixRepeats__P_128_1[repeat] && format === "png") {
          var dimension = this.__getDimension__P_128_3(source);

          this.__normalizeWidthHeight__P_128_4(style, dimension.width, dimension.height);

          result = this.processAlphaFix(style, repeat, source);
        } else {
          delete style.clip;

          if (repeat === "scale") {
            result = this.__processScale__P_128_5(style, repeat, source);
          } else if (repeat === "scale-x" || repeat === "scale-y") {
            result = this.__processScaleXScaleY__P_128_6(style, repeat, source);
          } else {
            // Native repeats or "no-repeat"
            result = this.__processRepeats__P_128_7(style, repeat, source);
          }
        }

        return result;
      },

      /**
       * Normalize the given width and height values
       *
       * @param style {Map} style information
       * @param width {Integer?null} width as number or null
       * @param height {Integer?null} height as number or null
       */
      __normalizeWidthHeight__P_128_4: function __normalizeWidthHeight__P_128_4(style, width, height) {
        if (style.width == null && width != null) {
          style.width = width + "px";
        }

        if (style.height == null && height != null) {
          style.height = height + "px";
        }
      },

      /**
       * Returns the dimension of the image by calling
       * {@link qx.util.ResourceManager} or {@link qx.io.ImageLoader}
       * depending on if the image is a managed one.
       *
       * @param source {String} image source
       * @return {Map} dimension of image
       */
      __getDimension__P_128_3: function __getDimension__P_128_3(source) {
        var width = qx.util.ResourceManager.getInstance().getImageWidth(source) || qx.io.ImageLoader.getWidth(source);
        var height = qx.util.ResourceManager.getInstance().getImageHeight(source) || qx.io.ImageLoader.getHeight(source);
        return {
          width: width,
          height: height
        };
      },

      /**
       * Get all styles for IE browser which need to load the image
       * with the help of the AlphaImageLoader
       *
       * @param style {Map} style information
       * @param repeat {String} repeat mode
       * @param source {String} image source
       *
       * @return {Map} style infos
       */
      processAlphaFix: function processAlphaFix(style, repeat, source) {
        if (repeat == "repeat" || repeat == "repeat-x" || repeat == "repeat-y") {
          return style;
        }

        var sizingMethod = repeat == "no-repeat" ? "crop" : "scale";
        var filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + qx.util.ResourceManager.getInstance().toUri(source) + "', sizingMethod='" + sizingMethod + "')";
        style.filter = filter;
        style.backgroundImage = style.backgroundRepeat = "";
        delete style["background-image"];
        delete style["background-repeat"];
        return {
          style: style
        };
      },

      /**
       * Process scaled images.
       *
       * @param style {Map} style information
       * @param repeat {String} repeat mode
       * @param source {String} image source
       *
       * @return {Map} image URI and style infos
       */
      __processScale__P_128_5: function __processScale__P_128_5(style, repeat, source) {
        var uri = qx.util.ResourceManager.getInstance().toUri(source);

        var dimension = this.__getDimension__P_128_3(source);

        this.__normalizeWidthHeight__P_128_4(style, dimension.width, dimension.height);

        return {
          src: uri,
          style: style
        };
      },

      /**
       * Process images which are either scaled horizontally or
       * vertically.
       *
       * @param style {Map} style information
       * @param repeat {String} repeat mode
       * @param sourceid {String} image resource id
       *
       * @return {Map} image URI and style infos
       */
      __processScaleXScaleY__P_128_6: function __processScaleXScaleY__P_128_6(style, repeat, sourceid) {
        var ResourceManager = qx.util.ResourceManager.getInstance();
        var clipped = ResourceManager.getCombinedFormat(sourceid);

        var dimension = this.__getDimension__P_128_3(sourceid);

        var uri;

        if (clipped) {
          var data = ResourceManager.getData(sourceid);
          var combinedid = data[4];

          if (clipped == "b64") {
            uri = ResourceManager.toDataUri(sourceid);
          } else {
            uri = ResourceManager.toUri(combinedid);
          }

          if (repeat === "scale-x") {
            style = this.__getStylesForClippedScaleX__P_128_8(style, data, dimension.height);
          } else {
            style = this.__getStylesForClippedScaleY__P_128_9(style, data, dimension.width);
          }

          return {
            src: uri,
            style: style
          };
        } // No clipped image available
        else {
          {
            this.__checkForPotentialClippedImage__P_128_10(sourceid);
          }

          if (repeat == "scale-x") {
            style.height = dimension.height == null ? null : dimension.height + "px"; // note: width is given by the user
          } else if (repeat == "scale-y") {
            style.width = dimension.width == null ? null : dimension.width + "px"; // note: height is given by the user
          }

          uri = ResourceManager.toUri(sourceid);
          return {
            src: uri,
            style: style
          };
        }
      },

      /**
       * Generates the style infos for horizontally scaled clipped images.
       *
       * @param style {Map} style infos
       * @param data {Array} image data retrieved from the {@link qx.util.ResourceManager}
       * @param height {Integer} image height
       *
       * @return {Map} style infos and image URI
       */
      __getStylesForClippedScaleX__P_128_8: function __getStylesForClippedScaleX__P_128_8(style, data, height) {
        // Use clipped image (multi-images on x-axis)
        var imageHeight = qx.util.ResourceManager.getInstance().getImageHeight(data[4]); // Add size and clipping

        style.clip = {
          top: -data[6],
          height: height
        };
        style.height = imageHeight + "px"; // note: width is given by the user
        // Fix user given y-coordinate to include the combined image offset

        if (style.top != null) {
          style.top = parseInt(style.top, 10) + data[6] + "px";
        } else if (style.bottom != null) {
          style.bottom = parseInt(style.bottom, 10) + height - imageHeight - data[6] + "px";
        }

        return style;
      },

      /**
       * Generates the style infos for vertically scaled clipped images.
       *
       * @param style {Map} style infos
       * @param data {Array} image data retrieved from the {@link qx.util.ResourceManager}
       * @param width {Integer} image width
       *
       * @return {Map} style infos and image URI
       */
      __getStylesForClippedScaleY__P_128_9: function __getStylesForClippedScaleY__P_128_9(style, data, width) {
        // Use clipped image (multi-images on x-axis)
        var imageWidth = qx.util.ResourceManager.getInstance().getImageWidth(data[4]); // Add size and clipping

        style.clip = {
          left: -data[5],
          width: width
        };
        style.width = imageWidth + "px"; // note: height is given by the user
        // Fix user given x-coordinate to include the combined image offset

        if (style.left != null) {
          style.left = parseInt(style.left, 10) + data[5] + "px";
        } else if (style.right != null) {
          style.right = parseInt(style.right, 10) + width - imageWidth - data[5] + "px";
        }

        return style;
      },

      /**
       * Process repeated images.
       *
       * @param style {Map} style information
       * @param repeat {String} repeat mode
       * @param sourceid {String} image resource id
       *
       * @return {Map} image URI and style infos
       */
      __processRepeats__P_128_7: function __processRepeats__P_128_7(style, repeat, sourceid) {
        var ResourceManager = qx.util.ResourceManager.getInstance();
        var clipped = ResourceManager.getCombinedFormat(sourceid);

        var dimension = this.__getDimension__P_128_3(sourceid); // Double axis repeats cannot be clipped


        if (clipped && repeat !== "repeat") {
          // data = [ 8, 5, "png", "qx", "qx/decoration/Modern/arrows-combined.png", -36, 0]
          var data = ResourceManager.getData(sourceid);
          var combinedid = data[4];

          if (clipped == "b64") {
            var uri = ResourceManager.toDataUri(sourceid);
            var offx = 0;
            var offy = 0;
          } else {
            var uri = ResourceManager.toUri(combinedid);
            var offx = data[5];
            var offy = data[6]; // honor padding for combined images

            if (style.paddingTop || style.paddingLeft || style.paddingRight || style.paddingBottom) {
              var top = style.paddingTop || 0;
              var left = style.paddingLeft || 0;
              offx += style.paddingLeft || 0;
              offy += style.paddingTop || 0;
              style.clip = {
                left: left,
                top: top,
                width: dimension.width,
                height: dimension.height
              };
            }
          }

          var bg = qx.bom.element.Background.getStyles(uri, repeat, offx, offy);

          for (var key in bg) {
            style[key] = bg[key];
          }

          if (dimension.width != null && style.width == null && (repeat == "repeat-y" || repeat === "no-repeat")) {
            style.width = dimension.width + "px";
          }

          if (dimension.height != null && style.height == null && (repeat == "repeat-x" || repeat === "no-repeat")) {
            style.height = dimension.height + "px";
          }

          return {
            style: style
          };
        } else {
          // honor padding
          var top = style.paddingTop || 0;
          var left = style.paddingLeft || 0;
          style.backgroundPosition = left + "px " + top + "px";
          {
            if (repeat !== "repeat") {
              this.__checkForPotentialClippedImage__P_128_10(sourceid);
            }
          }

          this.__normalizeWidthHeight__P_128_4(style, dimension.width, dimension.height);

          this.__getStylesForSingleRepeat__P_128_11(style, sourceid, repeat);

          return {
            style: style
          };
        }
      },

      /**
       * Generate all style infos for single repeated images
       *
       * @param style {Map} style information
       * @param repeat {String} repeat mode
       * @param source {String} image source
       */
      __getStylesForSingleRepeat__P_128_11: function __getStylesForSingleRepeat__P_128_11(style, source, repeat) {
        // retrieve the "backgroundPosition" style if available to prevent
        // overwriting with default values
        var top = null;
        var left = null;

        if (style.backgroundPosition) {
          var backgroundPosition = style.backgroundPosition.split(" ");
          left = parseInt(backgroundPosition[0], 10);

          if (isNaN(left)) {
            left = backgroundPosition[0];
          }

          top = parseInt(backgroundPosition[1], 10);

          if (isNaN(top)) {
            top = backgroundPosition[1];
          }
        }

        var bg = qx.bom.element.Background.getStyles(source, repeat, left, top);

        for (var key in bg) {
          style[key] = bg[key];
        } // Reset the AlphaImageLoader filter if applied
        // This prevents IE from setting BOTH CSS filter AND backgroundImage
        // This is only a fallback if the image is not recognized as PNG
        // If it's a Alpha-PNG file it *may* result in display problems


        if (style.filter) {
          style.filter = "";
        }
      },

      /**
       * Output a warning if the image can be clipped.
       *
       * @param source {String} image source
       */
      __checkForPotentialClippedImage__P_128_10: function __checkForPotentialClippedImage__P_128_10(source) {
        if (this.DEBUG && qx.util.ResourceManager.getInstance().has(source) && source.indexOf("qx/icon") == -1) {
          if (!this.__warnings__P_128_0[source]) {
            qx.log.Logger.debug("Potential clipped image candidate: " + source);
            this.__warnings__P_128_0[source] = true;
          }
        }
      }
    }
  });
  qx.bom.element.Decoration.$$dbClassInfo = $$dbClassInfo;
})();

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
      "qx.html.Element": {
        "construct": true,
        "require": true
      },
      "qx.theme.manager.Color": {
        "construct": true
      },
      "qx.bom.client.Engine": {
        "construct": true,
        "require": true
      },
      "qx.util.ResourceManager": {
        "construct": true
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "construct": true,
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
       2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The blocker element is used to block interaction with the application.
   *
   * It is usually transparent or semi-transparent and blocks all events from
   * the underlying elements.
   */
  qx.Class.define("qx.html.Blocker", {
    extend: qx.html.Element,

    /**
     * @param backgroundColor {Color?null} the blocker's background color. This
     *    color can be themed and will be resolved by the blocker.
     * @param opacity {Number?0} The blocker's opacity
     */
    construct: function construct(backgroundColor, opacity) {
      var backgroundColor = backgroundColor ? qx.theme.manager.Color.getInstance().resolve(backgroundColor) : null;
      var styles = {
        position: "absolute",
        opacity: opacity || 0,
        backgroundColor: backgroundColor
      }; // IE needs some extra love here to convince it to block events.

      if (qx.core.Environment.get("engine.name") == "mshtml") {
        styles.backgroundImage = "url(" + qx.util.ResourceManager.getInstance().toUri("qx/static/blank.gif") + ")";
        styles.backgroundRepeat = "repeat";
      }

      qx.html.Element.constructor.call(this, "div", styles);
      this.addListener("mousedown", this._stopPropagation, this);
      this.addListener("mouseup", this._stopPropagation, this);
      this.addListener("click", this._stopPropagation, this);
      this.addListener("dblclick", this._stopPropagation, this);
      this.addListener("mousemove", this._stopPropagation, this);
      this.addListener("mouseover", this._stopPropagation, this);
      this.addListener("mouseout", this._stopPropagation, this);
      this.addListener("mousewheel", this._stopPropagation, this);
      this.addListener("roll", this._stopPropagation, this);
      this.addListener("contextmenu", this._stopPropagation, this);
      this.addListener("pointerdown", this._stopPropagation, this);
      this.addListener("pointerup", this._stopPropagation, this);
      this.addListener("pointermove", this._stopPropagation, this);
      this.addListener("pointerover", this._stopPropagation, this);
      this.addListener("pointerout", this._stopPropagation, this);
      this.addListener("tap", this._stopPropagation, this);
      this.addListener("dbltap", this._stopPropagation, this);
      this.addListener("swipe", this._stopPropagation, this);
      this.addListener("longtap", this._stopPropagation, this);
      this.addListener("appear", this.__refreshCursor__P_150_0, this);
      this.addListener("disappear", this.__refreshCursor__P_150_0, this);
    },
    members: {
      /**
       * Stop the event propagation from the passed event.
       *
       * @param e {qx.event.type.Mouse} mouse event to stop propagation.
       */
      _stopPropagation: function _stopPropagation(e) {
        e.stopPropagation();
      },

      /**
       * Refreshes the cursor by setting it to <code>null</code> and then to the
       * old value.
       */
      __refreshCursor__P_150_0: function __refreshCursor__P_150_0() {
        var currentCursor = this.getStyle("cursor");
        this.setStyle("cursor", null, true);
        this.setStyle("cursor", currentCursor, true);
      }
    }
  });
  qx.html.Blocker.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.locale.Manager": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Assert": {}
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
   * Static class that provides localized date information (like names of week
   * days, AM/PM markers, start of week, etc.).
   *
   * @cldr()
   */
  qx.Class.define("qx.locale.Date", {
    statics: {
      /**
       * Reference to the locale manager.
       *
       * @internal
       */
      __mgr__P_110_0: qx.locale.Manager.getInstance(),

      /**
       * Get AM marker for time definitions
       *
       * @param locale {String} optional locale to be used
       * @return {String} translated AM marker.
       */
      getAmMarker: function getAmMarker(locale) {
        return this.__mgr__P_110_0.localize("cldr_am", [], locale);
      },

      /**
       * Get PM marker for time definitions
       *
       * @param locale {String} optional locale to be used
       * @return {String} translated PM marker.
       */
      getPmMarker: function getPmMarker(locale) {
        return this.__mgr__P_110_0.localize("cldr_pm", [], locale);
      },

      /**
       * Return localized names of day names
       *
       * @param length {String} format of the day names.
       *       Possible values: "abbreviated", "narrow", "wide"
       * @param locale {String} optional locale to be used
       * @param context {String} (default: "format") intended context.
       *       Possible values: "format", "stand-alone"
       * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
       * in order to find a localized name for the day
       * @return {String[]} array of localized day names starting with sunday.
       */
      getDayNames: function getDayNames(length, locale, context, withFallback) {
        var context = context ? context : "format";
        {
          qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
          qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
        }
        var days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        var names = [];

        for (var i = 0; i < days.length; i++) {
          var key = "cldr_day_" + context + "_" + length + "_" + days[i];
          names.push(withFallback ? this.__localizeWithFallback__P_110_1(context, context === "format" ? "stand-alone" : "format", key, locale) : this.__mgr__P_110_0.localize(key, [], locale));
        }

        return names;
      },

      /**
       * Return localized name of a week day name
       *
       * @param length {String} format of the day name.
       *       Possible values: "abbreviated", "narrow", "wide"
       * @param day {Integer} day number. 0=sunday, 1=monday, ...
       * @param locale {String} optional locale to be used
       * @param context {String} (default: "format") intended context.
       *       Possible values: "format", "stand-alone"
       * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
       * in order to find a localized name for the day
       * @return {String} localized day name
       */
      getDayName: function getDayName(length, day, locale, context, withFallback) {
        var context = context ? context : "format";
        {
          qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
          qx.core.Assert.assertInteger(day);
          qx.core.Assert.assertInRange(day, 0, 6);
          qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
        }
        var days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        var key = "cldr_day_" + context + "_" + length + "_" + days[day];
        return withFallback ? this.__localizeWithFallback__P_110_1(context, context === "format" ? "stand-alone" : "format", key, locale) : this.__mgr__P_110_0.localize(key, [], locale);
      },

      /**
       * Return localized names of month names
       *
       * @param length {String} format of the month names.
       *       Possible values: "abbreviated", "narrow", "wide"
       * @param locale {String} optional locale to be used
       * @param context {String} (default: "format") intended context.
       *       Possible values: "format", "stand-alone"
       * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
       * in order to find a localized name for the month
       * @return {String[]} array of localized month names starting with january.
       */
      getMonthNames: function getMonthNames(length, locale, context, withFallback) {
        var context = context ? context : "format";
        {
          qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
          qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
        }
        var names = [];

        for (var i = 0; i < 12; i++) {
          var key = "cldr_month_" + context + "_" + length + "_" + (i + 1);
          names.push(withFallback ? this.__localizeWithFallback__P_110_1(context, context === "format" ? "stand-alone" : "format", key, locale) : this.__mgr__P_110_0.localize(key, [], locale));
        }

        return names;
      },

      /**
       * Return localized name of a month
       *
       * @param length {String} format of the month names.
       *       Possible values: "abbreviated", "narrow", "wide"
       * @param month {Integer} index of the month. 0=january, 1=february, ...
       * @param locale {String} optional locale to be used
       * @param context {String} (default: "format") intended context.
       *       Possible values: "format", "stand-alone"
       * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
       * in order to find a localized name for the month
       * @return {String} localized month name
       */
      getMonthName: function getMonthName(length, month, locale, context, withFallback) {
        var context = context ? context : "format";
        {
          qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
          qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
        }
        var key = "cldr_month_" + context + "_" + length + "_" + (month + 1);
        return withFallback ? this.__localizeWithFallback__P_110_1(context, context === "format" ? "stand-alone" : "format", key, locale) : this.__mgr__P_110_0.localize(key, [], locale);
      },

      /**
       * Return localized date format string to be used with {@link qx.util.format.DateFormat}.
       *
       * @param size {String} format of the date format.
       *      Possible values: "short", "medium", "long", "full"
       * @param locale {String?} optional locale to be used
       * @return {String} localized date format string
       */
      getDateFormat: function getDateFormat(size, locale) {
        {
          qx.core.Assert.assertInArray(size, ["short", "medium", "long", "full"]);
        }
        var key = "cldr_date_format_" + size;
        return this.__mgr__P_110_0.localize(key, [], locale);
      },

      /**
       * Try to localize a date/time format string. For format string possibilities see
       * <a href="http://cldr.unicode.org/translation/date-time">Date/Time Symbol reference</a>
       * at CLDR - Unicode Common Locale Data Repository.
       *
       * If no localization is available take the fallback format string.
       *
       * @param canonical {String} format string containing only field information, and in a canonical order.
       *       Examples are "yyyyMMMM" for year + full month, or "MMMd" for abbreviated month + day.
       * @param fallback {String} fallback format string if no localized version is found
       * @param locale {String} optional locale to be used
       * @return {String} best matching format string
       */
      getDateTimeFormat: function getDateTimeFormat(canonical, fallback, locale) {
        var key = "cldr_date_time_format_" + canonical;

        var localizedFormat = this.__mgr__P_110_0.localize(key, [], locale);

        if (localizedFormat == key) {
          localizedFormat = fallback;
        }

        return localizedFormat;
      },

      /**
       * Return localized time format string to be used with {@link qx.util.format.DateFormat}.
       *
       * @param size {String} format of the time pattern.
       *      Possible values: "short", "medium", "long", "full"
       * @param locale {String} optional locale to be used
       * @return {String} localized time format string
       */
      getTimeFormat: function getTimeFormat(size, locale) {
        {
          qx.core.Assert.assertInArray(size, ["short", "medium", "long", "full"]);
        }
        var key = "cldr_time_format_" + size;

        var localizedFormat = this.__mgr__P_110_0.localize(key, [], locale);

        if (localizedFormat != key) {
          return localizedFormat;
        }

        switch (size) {
          case "short":
          case "medium":
            return qx.locale.Date.getDateTimeFormat("HHmm", "HH:mm");

          case "long":
            return qx.locale.Date.getDateTimeFormat("HHmmss", "HH:mm:ss");

          case "full":
            return qx.locale.Date.getDateTimeFormat("HHmmsszz", "HH:mm:ss zz");

          default:
            throw new Error("This case should never happen.");
        }
      },

      /**
       * Return the day the week starts with
       *
       * Reference: Common Locale Data Repository (cldr) supplementalData.xml
       *
       * @param locale {String} optional locale to be used
       * @return {Integer} index of the first day of the week. 0=sunday, 1=monday, ...
       */
      getWeekStart: function getWeekStart(locale) {
        var weekStart = {
          // default is monday
          MV: 5,
          // friday
          AE: 6,
          // saturday
          AF: 6,
          BH: 6,
          DJ: 6,
          DZ: 6,
          EG: 6,
          ER: 6,
          ET: 6,
          IQ: 6,
          IR: 6,
          JO: 6,
          KE: 6,
          KW: 6,
          LB: 6,
          LY: 6,
          MA: 6,
          OM: 6,
          QA: 6,
          SA: 6,
          SD: 6,
          SO: 6,
          TN: 6,
          YE: 6,
          AS: 0,
          // sunday
          AU: 0,
          AZ: 0,
          BW: 0,
          CA: 0,
          CN: 0,
          FO: 0,
          GE: 0,
          GL: 0,
          GU: 0,
          HK: 0,
          IE: 0,
          IL: 0,
          IS: 0,
          JM: 0,
          JP: 0,
          KG: 0,
          KR: 0,
          LA: 0,
          MH: 0,
          MN: 0,
          MO: 0,
          MP: 0,
          MT: 0,
          NZ: 0,
          PH: 0,
          PK: 0,
          SG: 0,
          TH: 0,
          TT: 0,
          TW: 0,
          UM: 0,
          US: 0,
          UZ: 0,
          VI: 0,
          ZA: 0,
          ZW: 0,
          MW: 0,
          NG: 0,
          TJ: 0
        };

        var territory = qx.locale.Date._getTerritory(locale); // default is monday


        return weekStart[territory] != null ? weekStart[territory] : 1;
      },

      /**
       * Return the day the weekend starts with
       *
       * Reference: Common Locale Data Repository (cldr) supplementalData.xml
       *
       * @param locale {String} optional locale to be used
       * @return {Integer} index of the first day of the weekend. 0=sunday, 1=monday, ...
       */
      getWeekendStart: function getWeekendStart(locale) {
        var weekendStart = {
          // default is saturday
          EG: 5,
          // friday
          IL: 5,
          SY: 5,
          IN: 0,
          // sunday
          AE: 4,
          // thursday
          BH: 4,
          DZ: 4,
          IQ: 4,
          JO: 4,
          KW: 4,
          LB: 4,
          LY: 4,
          MA: 4,
          OM: 4,
          QA: 4,
          SA: 4,
          SD: 4,
          TN: 4,
          YE: 4
        };

        var territory = qx.locale.Date._getTerritory(locale); // default is saturday


        return weekendStart[territory] != null ? weekendStart[territory] : 6;
      },

      /**
       * Return the day the weekend ends with
       *
       * Reference: Common Locale Data Repository (cldr) supplementalData.xml
       *
       * @param locale {String} optional locale to be used
       * @return {Integer} index of the last day of the weekend. 0=sunday, 1=monday, ...
       */
      getWeekendEnd: function getWeekendEnd(locale) {
        var weekendEnd = {
          // default is sunday
          AE: 5,
          // friday
          BH: 5,
          DZ: 5,
          IQ: 5,
          JO: 5,
          KW: 5,
          LB: 5,
          LY: 5,
          MA: 5,
          OM: 5,
          QA: 5,
          SA: 5,
          SD: 5,
          TN: 5,
          YE: 5,
          AF: 5,
          IR: 5,
          EG: 6,
          // saturday
          IL: 6,
          SY: 6
        };

        var territory = qx.locale.Date._getTerritory(locale); // default is sunday


        return weekendEnd[territory] != null ? weekendEnd[territory] : 0;
      },

      /**
       * Returns whether a certain day of week belongs to the week end.
       *
       * @param day {Integer} index of the day. 0=sunday, 1=monday, ...
       * @param locale {String} optional locale to be used
       * @return {Boolean} whether the given day is a weekend day
       */
      isWeekend: function isWeekend(day, locale) {
        var weekendStart = qx.locale.Date.getWeekendStart(locale);
        var weekendEnd = qx.locale.Date.getWeekendEnd(locale);

        if (weekendEnd > weekendStart) {
          return day >= weekendStart && day <= weekendEnd;
        } else {
          return day >= weekendStart || day <= weekendEnd;
        }
      },

      /**
       * Extract the territory part from a locale
       *
       * @param locale {String} the locale
       * @return {String} territory
       */
      _getTerritory: function _getTerritory(locale) {
        if (locale) {
          var territory = locale.split("_")[1] || locale;
        } else {
          territory = this.__mgr__P_110_0.getTerritory() || this.__mgr__P_110_0.getLanguage();
        }

        return territory.toUpperCase();
      },

      /**
       * Provide localization (CLDR) data with fallback between "format" and "stand-alone" contexts.
       * It is used in {@link #getDayName} and {@link #getMonthName} methods.
       *
       * @param context {String} intended context.
       *       Possible values: "format", "stand-alone".
       * @param fallbackContext {String} the context used in case no localization is found for the key.
       * @param key {String} message id (may contain format strings)
       * @param locale {String} the locale
       * @return {String} localized name for the key
       *
       */
      __localizeWithFallback__P_110_1: function __localizeWithFallback__P_110_1(context, fallbackContext, key, locale) {
        var localizedString = this.__mgr__P_110_0.localize(key, [], locale);

        if (localizedString == key) {
          var newKey = key.replace("_" + context + "_", "_" + fallbackContext + "_");
          return this.__mgr__P_110_0.localize(newKey, [], locale);
        } else {
          return localizedString;
        }
      }
    }
  });
  qx.locale.Date.$$dbClassInfo = $$dbClassInfo;
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
      "qx.dom.Element": {},
      "qx.bom.client.Css": {
        "require": true
      },
      "qx.bom.client.Html": {
        "require": true
      },
      "qx.bom.element.Style": {},
      "qx.core.Assert": {},
      "qx.bom.element.Attribute": {},
      "qx.bom.element.Dimension": {}
    },
    "environment": {
      "provided": [],
      "required": {
        "css.textoverflow": {
          "className": "qx.bom.client.Css"
        },
        "html.xul": {
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Cross browser abstractions to work with labels.
   */
  qx.Bootstrap.define("qx.bom.Label", {
    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Map} Contains all supported styles */
      __styles__P_123_0: {
        fontFamily: 1,
        fontSize: 1,
        fontWeight: 1,
        fontStyle: 1,
        lineHeight: 1,
        wordBreak: 1,
        letterSpacing: 1
      },

      /**
       * Generates the helper DOM element for text measuring
       *
       * @return {Element} Helper DOM element
       */
      __prepareText__P_123_1: function __prepareText__P_123_1() {
        var el = this.__createMeasureElement__P_123_2(false);

        document.body.insertBefore(el, document.body.firstChild);
        return this._textElement = el;
      },

      /**
       * Generates the helper DOM element for HTML measuring
       *
       * @return {Element} Helper DOM element
       */
      __prepareHtml__P_123_3: function __prepareHtml__P_123_3() {
        var el = this.__createMeasureElement__P_123_2(true);

        document.body.insertBefore(el, document.body.firstChild);
        return this._htmlElement = el;
      },

      /**
       * Creates the measure element
       *
       * @param html {Boolean?false} Whether HTML markup should be used.
       * @return {Element} The measure element
       */
      __createMeasureElement__P_123_2: function __createMeasureElement__P_123_2(html) {
        var el = qx.dom.Element.create("div");
        var style = el.style;
        style.width = style.height = "auto";
        style.left = style.top = "-1000px";
        style.visibility = "hidden";
        style.position = "absolute";
        style.overflow = "visible";
        style.display = "block";

        if (html) {
          style.whiteSpace = "normal";
        } else {
          style.whiteSpace = "nowrap";

          if (!qx.core.Environment.get("css.textoverflow") && qx.core.Environment.get("html.xul")) {
            var inner = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label"); // Force style inheritance for font styles to omit usage of
            // CSS "label" selector, See bug #1349 for details.

            var style = inner.style;
            style.padding = "0";
            style.margin = "0";
            style.width = "auto";

            for (var key in this.__styles__P_123_0) {
              style[key] = "inherit";
            }

            el.appendChild(inner);
          }
        }

        return el;
      },

      /**
       * Returns a map of all styles which should be applied as
       * a basic set.
       *
       * @param html {Boolean?false} Whether HTML markup should be used.
       * @return {Map} Initial styles which should be applied to a label element.
       */
      __getStyles__P_123_4: function __getStyles__P_123_4(html) {
        var styles = {};
        styles.overflow = "hidden";

        if (html) {
          styles.whiteSpace = "normal";
        } else if (!qx.core.Environment.get("css.textoverflow") && qx.core.Environment.get("html.xul")) {
          styles.display = "block";
        } else {
          styles.whiteSpace = "nowrap";
          styles[qx.core.Environment.get("css.textoverflow")] = "ellipsis";
        }

        return styles;
      },

      /**
       * Creates a label.
       *
       * The default mode is 'text' which means that the overlapping text is cut off
       * using ellipsis automatically. Text wrapping is disabled in this mode
       * as well. Spaces are normalized. Umlauts and other special symbols are only
       * allowed in unicode mode as normal characters.
       *
       * In the HTML mode you can insert any HTML, but loose the capability to cut
       * of overlapping text. Automatic text wrapping is enabled by default.
       *
       * It is not possible to modify the mode afterwards.
       *
       * @param content {String} Content of the label
       * @param html {Boolean?false} Whether HTML markup should be used.
       * @param win {Window?null} Window to create the element for
       * @return {Element} The created iframe node
       */
      create: function create(content, html, win) {
        if (!win) {
          win = window;
        }

        var el = win.document.createElement("div");

        if (html) {
          el.useHtml = true;
        }

        if (!qx.core.Environment.get("css.textoverflow") && qx.core.Environment.get("html.xul")) {
          // Gecko as of Firefox 2.x and 3.0 does not support ellipsis
          // for text overflow. We use this feature from XUL instead.
          var xulel = win.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label");
          var style = xulel.style;
          style.cursor = "inherit";
          style.color = "inherit";
          style.overflow = "hidden";
          style.maxWidth = "100%";
          style.padding = "0";
          style.margin = "0";
          style.width = "auto"; // Force style inheritance for font styles to omit usage of
          // CSS "label" selector, See bug #1349 for details.

          for (var key in this.__styles__P_123_0) {
            xulel.style[key] = "inherit";
          }

          xulel.setAttribute("crop", "end");
          el.appendChild(xulel);
        } else {
          qx.bom.element.Style.setStyles(el, this.__getStyles__P_123_4(html));
        }

        if (content) {
          this.setValue(el, content);
        }

        return el;
      },

      /** Sanitizer function */
      __sanitizer__P_123_5: null,

      /**
       * Sets a function to sanitize values. It will be used by {@link #setValue}.
       * The function to sanitize will get the <code>string</code> value and
       * should return a sanitized / cleared <code>string</code>.
       *
       * @param func {Function | null} Function to sanitize / clean HTML code
       *  from given string parameter
       */
      setSanitizer: function setSanitizer(func) {
        {
          if (func) {
            qx.core.Assert.assertFunction(func);
          }
        }
        qx.bom.Label.__sanitizer__P_123_5 = func;
      },

      /**
       * Sets the content of the element.
       *
       * The possibilities of the value depends on the mode
       * defined using {@link #create}.
       *
       * @param element {Element} DOM element to modify.
       * @param value {String} Content to insert.
       */
      setValue: function setValue(element, value) {
        value = value || "";

        if (element.useHtml) {
          if (qx.bom.Label.__sanitizer__P_123_5 && typeof qx.bom.Label.__sanitizer__P_123_5 === "function") {
            value = qx.bom.Label.__sanitizer__P_123_5(value);
          }

          element.innerHTML = value;
        } else if (!qx.core.Environment.get("css.textoverflow") && qx.core.Environment.get("html.xul")) {
          element.firstChild.setAttribute("value", value);
        } else {
          qx.bom.element.Attribute.set(element, "text", value);
        }
      },

      /**
       * Returns the content of the element.
       *
       * @param element {Element} DOM element to query.
       * @return {String} Content stored in the element.
       */
      getValue: function getValue(element) {
        if (element.useHtml) {
          return element.innerHTML;
        } else if (!qx.core.Environment.get("css.textoverflow") && qx.core.Environment.get("html.xul")) {
          return element.firstChild.getAttribute("value") || "";
        } else {
          return qx.bom.element.Attribute.get(element, "text");
        }
      },

      /**
       * Returns the preferred dimensions of the given HTML content.
       *
       * @param content {String} The HTML markup to measure
       * @param styles {Map?null} Optional styles to apply
       * @param width {Integer} To support width for height it is possible to limit the width
       * @return {Map} A map with preferred <code>width</code> and <code>height</code>.
       */
      getHtmlSize: function getHtmlSize(content, styles, width) {
        var element = this._htmlElement || this.__prepareHtml__P_123_3(); // apply width


        element.style.width = width != undefined ? width + "px" : "auto"; // insert content

        element.innerHTML = content;
        return this.__measureSize__P_123_6(element, styles);
      },

      /**
       * Returns the preferred dimensions of the given text.
       *
       * @param text {String} The text to measure
       * @param styles {Map} Optional styles to apply
       * @return {Map} A map with preferred <code>width</code> and <code>height</code>.
       */
      getTextSize: function getTextSize(text, styles) {
        var element = this._textElement || this.__prepareText__P_123_1();

        if (!qx.core.Environment.get("css.textoverflow") && qx.core.Environment.get("html.xul")) {
          element.firstChild.setAttribute("value", text);
        } else {
          qx.bom.element.Attribute.set(element, "text", text);
        }

        return this.__measureSize__P_123_6(element, styles);
      },

      /**
       * Measure the size of the given element
       *
       * @param element {Element} The element to measure
       * @param styles {Map?null} Optional styles to apply
       * @return {Map} A map with preferred <code>width</code> and <code>height</code>.
       */
      __measureSize__P_123_6: function __measureSize__P_123_6(element, styles) {
        // sync styles
        var keys = this.__styles__P_123_0;

        if (!styles) {
          styles = {};
        }

        for (var key in keys) {
          element.style[key] = styles[key] || "";
        } // detect size


        var size = qx.bom.element.Dimension.getSize(element); // all modern browser are needing one more pixel for width

        size.width++;
        return size;
      }
    }
  });
  qx.bom.Label.$$dbClassInfo = $$dbClassInfo;
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
      "qx.bom.Shortcut": {
        "construct": true
      },
      "qx.ui.menu.Menu": {}
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
       * Mustafa Sak (msak)
  
  ************************************************************************ */

  /**
   * Commands can be used to globally define keyboard shortcuts. They could
   * also be used to assign an execution of a command sequence to multiple
   * widgets. It is possible to use the same Command in a MenuButton and
   * ToolBarButton for example.
   *
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Class.define("qx.ui.command.Command", {
    extend: qx.core.Object,

    /**
     * @param shortcut {String} Shortcuts can be composed of optional modifier
     *    keys Control, Alt, Shift, Meta and a non modifier key.
     *    If no non modifier key is specified, the second parameter is evaluated.
     *    The key must be separated by a <code>+</code> or <code>-</code> character.
     *    Examples: Alt+F1, Control+C, Control+Alt+Delete
     */
    construct: function construct(shortcut) {
      qx.core.Object.constructor.call(this);
      this._shortcut = new qx.bom.Shortcut(shortcut);

      this._shortcut.addListener("execute", this.execute, this);

      if (shortcut !== undefined) {
        this.setShortcut(shortcut);
      }
    },
    events: {
      /**
       * Fired when the command is executed. Sets the "data" property of the
       * event to the object that issued the command.
       */
      execute: "qx.event.type.Data"
    },
    properties: {
      /** Whether the command should be activated. If 'false' execute event
       * wouldn't fire. This property will be used by command groups when
       * activating/deactivating all commands of the group.*/
      active: {
        init: true,
        check: "Boolean",
        event: "changeActive",
        apply: "_applyActive"
      },

      /** Whether the command should be respected/enabled. If 'false' execute event
       * wouldn't fire. If value of property {@link qx.ui.command.Command#active}
       * is 'false', enabled value can be set but has no effect until
       * {@link qx.ui.command.Command#active} will be set to 'true'.*/
      enabled: {
        init: true,
        check: "Boolean",
        event: "changeEnabled",
        apply: "_applyEnabled"
      },

      /** The command shortcut as a string */
      shortcut: {
        check: "String",
        apply: "_applyShortcut",
        nullable: true
      },

      /** The label, which will be set in all connected widgets (if available) */
      label: {
        check: "String",
        nullable: true,
        event: "changeLabel"
      },

      /** The icon, which will be set in all connected widgets (if available) */
      icon: {
        check: "String",
        nullable: true,
        event: "changeIcon"
      },

      /**
       * The tooltip text, which will be set in all connected
       * widgets (if available)
       */
      toolTipText: {
        check: "String",
        nullable: true,
        event: "changeToolTipText"
      },

      /** The value of the connected widgets */
      value: {
        nullable: true,
        event: "changeValue"
      },

      /** The menu, which will be set in all connected widgets (if available) */
      menu: {
        check: "qx.ui.menu.Menu",
        nullable: true,
        event: "changeMenu"
      }
    },
    members: {
      _shortcut: null,
      // property apply
      _applyActive: function _applyActive(value) {
        if (value === false) {
          this._shortcut.setEnabled(false);
        } else {
          // synchronize value with current "enabled" value of this command
          this._shortcut.setEnabled(this.getEnabled());
        }
      },
      // property apply
      _applyEnabled: function _applyEnabled(value) {
        if (this.getActive()) {
          this._shortcut.setEnabled(value);
        }
      },
      // property apply
      _applyShortcut: function _applyShortcut(value) {
        this._shortcut.setShortcut(value);
      },

      /**
       * Fire the "execute" event on this command. If property
       * <code>active</code> and <code>enabled</code> set to
       * <code>true</code>.
       * @param target {Object?} Object which issued the execute event
       */
      execute: function execute(target) {
        if (this.getActive() && this.getEnabled()) {
          this.fireDataEvent("execute", target);
        }
      },

      /**
       * Returns the used shortcut as string using the currently selected locale.
       *
       * @return {String} shortcut
       */
      toString: function toString() {
        if (this._shortcut) {
          return this._shortcut.toString();
        }

        return qx.ui.command.Command.superclass.prototype.toString.call(this);
      }
    },
    destruct: function destruct() {
      this._shortcut.removeListener("execute", this.execute, this);

      this._disposeObjects("_shortcut");
    }
  });
  qx.ui.command.Command.$$dbClassInfo = $$dbClassInfo;
})();
//# sourceMappingURL=package-13.js.map?dt=1673131574420
qx.$$packageData['13'] = {
  "locales": {},
  "resources": {},
  "translations": {}
};
