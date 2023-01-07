(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.menubar.Button": {
        "require": true
      },
      "qx.ui.toolbar.PartContainer": {},
      "qx.ui.core.queue.Appearance": {},
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
  
  ************************************************************************ */

  /**
   * The button to fill the menubar
   *
   * @childControl arrow {qx.ui.basic.Image} arrow widget to show a submenu is available
   */
  qx.Class.define("qx.ui.toolbar.MenuButton", {
    extend: qx.ui.menubar.Button,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** Appearance of the widget */
      appearance: {
        refine: true,
        init: "toolbar-menubutton"
      },

      /** Whether the button should show an arrow to indicate the menu behind it */
      showArrow: {
        check: "Boolean",
        init: false,
        themeable: true,
        apply: "_applyShowArrow"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      _applyVisibility: function _applyVisibility(value, old) {
        qx.ui.toolbar.MenuButton.superclass.prototype._applyVisibility.call(this, value, old); // hide the menu too


        var menu = this.getMenu();

        if (value != "visible" && menu) {
          menu.hide();
        } // trigger a appearance recalculation of the parent


        var parent = this.getLayoutParent();

        if (parent && parent instanceof qx.ui.toolbar.PartContainer) {
          qx.ui.core.queue.Appearance.add(parent);
        }
      },
      // overridden
      _createChildControlImpl: function _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
          case "arrow":
            control = new qx.ui.basic.Image();
            control.setAnonymous(true);

            this._addAt(control, 10);

            break;
        }

        return control || qx.ui.toolbar.MenuButton.superclass.prototype._createChildControlImpl.call(this, id);
      },
      // property apply routine
      _applyShowArrow: function _applyShowArrow(value, old) {
        if (value) {
          this._showChildControl("arrow");
        } else {
          this._excludeChildControl("arrow");
        }
      }
    }
  });
  qx.ui.toolbar.MenuButton.$$dbClassInfo = $$dbClassInfo;
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
      "qx.lang.Array": {},
      "qx.ui.layout.Util": {},
      "qx.ui.menu.Menu": {}
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
   * Layout used for the menu buttons which may contain four elements. A icon,
   * a label, a shortcut text and an arrow (for a sub menu)
   *
   * @internal
   */
  qx.Class.define("qx.ui.menu.ButtonLayout", {
    extend: qx.ui.layout.Abstract,

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      // overridden
      verifyLayoutProperty: qx.core.Environment.select("qx.debug", {
        "true": function _true(item, name, value) {
          this.assert(name == "column", "The property '" + name + "' is not supported by the MenuButton layout!");
        },
        "false": null
      }),
      // overridden
      renderLayout: function renderLayout(availWidth, availHeight, padding) {
        var children = this._getLayoutChildren();

        var child;
        var column;
        var columnChildren = [];

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];
          column = child.getLayoutProperties().column;
          columnChildren[column] = child;
        }

        var menu = this.__getMenu__P_160_0(children[0]);

        var columns = menu.getColumnSizes();
        var spacing = menu.getSpacingX(); // stretch label column

        var neededWidth = qx.lang.Array.sum(columns) + spacing * (columns.length - 1);

        if (neededWidth < availWidth) {
          columns[1] += availWidth - neededWidth;
        }

        var left = padding.left,
            top = padding.top;
        var Util = qx.ui.layout.Util;

        for (var i = 0, l = columns.length; i < l; i++) {
          child = columnChildren[i];

          if (child) {
            var hint = child.getSizeHint();
            var childTop = top + Util.computeVerticalAlignOffset(child.getAlignY() || "middle", hint.height, availHeight, 0, 0);
            var offsetLeft = Util.computeHorizontalAlignOffset(child.getAlignX() || "left", hint.width, columns[i], child.getMarginLeft(), child.getMarginRight());
            child.renderLayout(left + offsetLeft, childTop, hint.width, hint.height);
          }

          if (columns[i] > 0) {
            left += columns[i] + spacing;
          }
        }
      },

      /**
       * Get the widget's menu
       *
       * @param widget {qx.ui.core.Widget} the widget to get the menu for
       * @return {qx.ui.menu.Menu} the menu
       */
      __getMenu__P_160_0: function __getMenu__P_160_0(widget) {
        while (!(widget instanceof qx.ui.menu.Menu)) {
          widget = widget.getLayoutParent();
        }

        return widget;
      },
      // overridden
      _computeSizeHint: function _computeSizeHint() {
        var children = this._getLayoutChildren();

        var neededHeight = 0;
        var neededWidth = 0;

        for (var i = 0, l = children.length; i < l; i++) {
          var hint = children[i].getSizeHint();
          neededWidth += hint.width;
          neededHeight = Math.max(neededHeight, hint.height);
        }

        return {
          width: neededWidth,
          height: neededHeight
        };
      }
    }
  });
  qx.ui.menu.ButtonLayout.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.menu.AbstractButton": {
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
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * The real menu button class which supports a command and an icon. All
   * other features are inherited from the {@link qx.ui.menu.AbstractButton}
   * class.
   */
  qx.Class.define("qx.ui.menu.Button", {
    extend: qx.ui.menu.AbstractButton,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} Initial label
     * @param icon {String} Initial icon
     * @param command {qx.ui.command.Command} Initial command (shortcut)
     * @param menu {qx.ui.menu.Menu} Initial sub menu
     */
    construct: function construct(label, icon, command, menu) {
      qx.ui.menu.AbstractButton.constructor.call(this); // ARIA attrs

      this.getContentElement().setAttribute("role", "button"); // Initialize with incoming arguments

      if (label != null) {
        this.setLabel(label);
      }

      if (icon != null) {
        this.setIcon(icon);
      }

      if (command != null) {
        this.setCommand(command);
      }

      if (menu != null) {
        this.setMenu(menu);
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
        init: "menu-button"
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
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */
      // overridden
      _onTap: function _onTap(e) {
        if (e.isLeftPressed() && this.getMenu()) {
          this.execute(); // don't close menus if the button is a sub menu button

          this.getMenu().open();
          return;
        }

        qx.ui.menu.Button.superclass.prototype._onTap.call(this, e);
      }
    }
  });
  qx.ui.menu.Button.$$dbClassInfo = $$dbClassInfo;
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
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Each object, which should support single selection have to
   * implement this interface.
   */
  qx.Interface.define("qx.ui.core.ISingleSelection", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fires after the selection was modified */
      changeSelection: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Returns an array of currently selected items.
       *
       * Note: The result is only a set of selected items, so the order can
       * differ from the sequence in which the items were added.
       *
       * @return {qx.ui.core.Widget[]} List of items.
       */
      getSelection: function getSelection() {
        return true;
      },

      /**
       * Replaces current selection with the given items.
       *
       * @param items {qx.ui.core.Widget[]} Items to select.
       * @throws {Error} if the item is not a child element.
       */
      setSelection: function setSelection(items) {
        return arguments.length == 1;
      },

      /**
       * Clears the whole selection at once.
       */
      resetSelection: function resetSelection() {
        return true;
      },

      /**
       * Detects whether the given item is currently selected.
       *
       * @param item {qx.ui.core.Widget} Any valid selectable item
       * @return {Boolean} Whether the item is selected.
       * @throws {Error} if the item is not a child element.
       */
      isSelected: function isSelected(item) {
        return arguments.length == 1;
      },

      /**
       * Whether the selection is empty.
       *
       * @return {Boolean} Whether the selection is empty.
       */
      isSelectionEmpty: function isSelectionEmpty() {
        return true;
      },

      /**
       * Returns all elements which are selectable.
       *
       * @param all {Boolean} true for all selectables, false for the
       *   selectables the user can interactively select
       * @return {qx.ui.core.Widget[]} The contained items.
       */
      getSelectables: function getSelectables(all) {
        return arguments.length == 1;
      }
    }
  });
  qx.ui.core.ISingleSelection.$$dbClassInfo = $$dbClassInfo;
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
   * This interface should be used in all objects managing a set of items
   * implementing {@link qx.ui.form.IModel}.
   */
  qx.Interface.define("qx.ui.form.IModelSelection", {
    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Tries to set the selection using the given array containing the
       * representative models for the selectables.
       *
       * @param value {Array} An array of models.
       */
      setModelSelection: function setModelSelection(value) {},

      /**
       * Returns an array of the selected models.
       *
       * @return {Array} An array containing the models of the currently selected
       *   items.
       */
      getModelSelection: function getModelSelection() {}
    }
  });
  qx.ui.form.IModelSelection.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.Widget": {},
      "qx.ui.core.SingleSelectionManager": {}
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
       * Christian Hagendorn (chris_schmidt)
  
  ************************************************************************ */

  /**
   * This mixin links all methods to manage the single selection.
   *
   * The class which includes the mixin has to implements two methods:
   *
   * <ul>
   * <li><code>_getItems</code>, this method has to return a <code>Array</code>
   *    of <code>qx.ui.core.Widget</code> that should be managed from the manager.
   * </li>
   * <li><code>_isAllowEmptySelection</code>, this method has to return a
   *    <code>Boolean</code> value for allowing empty selection or not.
   * </li>
   * </ul>
   */
  qx.Mixin.define("qx.ui.core.MSingleSelectionHandling", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fires after the value was modified */
      changeValue: "qx.event.type.Data",

      /** Fires after the selection was modified */
      changeSelection: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {qx.ui.core.SingleSelectionManager} the single selection manager */
      __manager__P_135_0: null,

      /*
      ---------------------------------------------------------------------------
        PUBLIC API
      ---------------------------------------------------------------------------
      */

      /**
       * setValue implements part of the {@link qx.ui.form.IField} interface.
       *
       * @param item {null|qx.ui.core.Widget} Item to set as selected value.
       * @returns {null|TypeError} The status of this operation.
       */
      setValue: function setValue(item) {
        if (null === item) {
          this.resetSelection();
          return null;
        }

        if (item instanceof qx.ui.core.Widget) {
          this.__getManager__P_135_1().setSelected(item);

          return null;
        } else {
          return new TypeError("Given argument is not null or a {qx.ui.core.Widget}.");
        }
      },

      /**
       * getValue implements part of the {@link qx.ui.form.IField} interface.
       *
       * @returns {null|qx.ui.core.Widget} The currently selected widget or null if there is none.
       */
      getValue: function getValue() {
        return this.__getManager__P_135_1().getSelected() || null;
      },

      /**
       * resetValue implements part of the {@link qx.ui.form.IField} interface.
       */
      resetValue: function resetValue() {
        this.__getManager__P_135_1().resetSelected();
      },

      /**
       * Returns an array of currently selected items.
       *
       * Note: The result is only a set of selected items, so the order can
       * differ from the sequence in which the items were added.
       *
       * @return {qx.ui.core.Widget[]} List of items.
       */
      getSelection: function getSelection() {
        var selected = this.__getManager__P_135_1().getSelected();

        if (selected) {
          return [selected];
        } else {
          return [];
        }
      },

      /**
       * Replaces current selection with the given items.
       *
       * @param items {qx.ui.core.Widget[]} Items to select.
       * @throws {Error} if one of the items is not a child element and if
       *    items contains more than one elements.
       */
      setSelection: function setSelection(items) {
        switch (items.length) {
          case 0:
            this.resetSelection();
            break;

          case 1:
            this.__getManager__P_135_1().setSelected(items[0]);

            break;

          default:
            throw new Error("Could only select one item, but the selection array contains " + items.length + " items!");
        }
      },

      /**
       * Clears the whole selection at once.
       */
      resetSelection: function resetSelection() {
        this.__getManager__P_135_1().resetSelected();
      },

      /**
       * Detects whether the given item is currently selected.
       *
       * @param item {qx.ui.core.Widget} Any valid selectable item.
       * @return {Boolean} Whether the item is selected.
       * @throws {Error} if one of the items is not a child element.
       */
      isSelected: function isSelected(item) {
        return this.__getManager__P_135_1().isSelected(item);
      },

      /**
       * Whether the selection is empty.
       *
       * @return {Boolean} Whether the selection is empty.
       */
      isSelectionEmpty: function isSelectionEmpty() {
        return this.__getManager__P_135_1().isSelectionEmpty();
      },

      /**
       * Returns all elements which are selectable.
       *
       * @param all {Boolean} true for all selectables, false for the
       *   selectables the user can interactively select
       * @return {qx.ui.core.Widget[]} The contained items.
       */
      getSelectables: function getSelectables(all) {
        return this.__getManager__P_135_1().getSelectables(all);
      },

      /*
      ---------------------------------------------------------------------------
        EVENT HANDLER
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for <code>changeSelected</code> event on single
       * selection manager.
       *
       * @param e {qx.event.type.Data} Data event.
       */
      _onChangeSelected: function _onChangeSelected(e) {
        var newValue = e.getData();
        var oldValue = e.getOldData();
        this.fireDataEvent("changeValue", newValue, oldValue);
        newValue == null ? newValue = [] : newValue = [newValue];
        oldValue == null ? oldValue = [] : oldValue = [oldValue];
        this.fireDataEvent("changeSelection", newValue, oldValue);
      },

      /**
       * Return the selection manager if it is already exists, otherwise creates
       * the manager.
       *
       * @return {qx.ui.core.SingleSelectionManager} Single selection manager.
       */
      __getManager__P_135_1: function __getManager__P_135_1() {
        if (this.__manager__P_135_0 == null) {
          var that = this;
          this.__manager__P_135_0 = new qx.ui.core.SingleSelectionManager({
            getItems: function getItems() {
              return that._getItems();
            },
            isItemSelectable: function isItemSelectable(item) {
              if (that._isItemSelectable) {
                return that._isItemSelectable(item);
              } else {
                return item.isVisible();
              }
            }
          });

          this.__manager__P_135_0.addListener("changeSelected", this._onChangeSelected, this);
        }

        this.__manager__P_135_0.setAllowEmptySelection(this._isAllowEmptySelection());

        return this.__manager__P_135_0;
      }
    },

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._disposeObjects("__manager__P_135_0");
    }
  });
  qx.ui.core.MSingleSelectionHandling.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Mixin": {
        "usage": "dynamic",
        "require": true
      },
      "qx.data.Array": {
        "construct": true
      },
      "qx.lang.Array": {}
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
   * This mixin offers the selection of the model properties.
   * It can only be included if the object including it implements the
   * {@link qx.ui.core.ISingleSelection} interface and the selectables implement
   * the {@link qx.ui.form.IModel} interface.
   */
  qx.Mixin.define("qx.ui.form.MModelSelection", {
    construct: function construct() {
      // create the selection array
      this.__modelSelection__P_136_0 = new qx.data.Array(); // listen to the changes

      this.__modelSelection__P_136_0.addListener("change", this.__onModelSelectionArrayChange__P_136_1, this);

      this.addListener("changeSelection", this.__onModelSelectionChange__P_136_2, this);
    },
    events: {
      /**
       * Pseudo event. It will never be fired because the array itself can not
       * be changed. But the event description is needed for the data binding.
       */
      changeModelSelection: "qx.event.type.Data"
    },
    members: {
      __modelSelection__P_136_0: null,
      __inSelectionChange__P_136_3: false,

      /**
       * Handler for the selection change of the including class e.g. SelectBox,
       * List, ...
       * It sets the new modelSelection via {@link #setModelSelection}.
       */
      __onModelSelectionChange__P_136_2: function __onModelSelectionChange__P_136_2() {
        if (this.__inSelectionChange__P_136_3) {
          return;
        }

        var data = this.getSelection(); // create the array with the modes inside

        var modelSelection = [];

        for (var i = 0; i < data.length; i++) {
          var item = data[i]; // fallback if getModel is not implemented

          var model = item.getModel ? item.getModel() : null;

          if (model !== null) {
            modelSelection.push(model);
          }
        }

        try {
          this.setModelSelection(modelSelection);
        } catch (e) {
          throw new Error("Could not set the model selection. Maybe your models are not unique? " + e);
        }
      },

      /**
       * Listener for the change of the internal model selection data array.
       */
      __onModelSelectionArrayChange__P_136_1: function __onModelSelectionArrayChange__P_136_1() {
        this.__inSelectionChange__P_136_3 = true;
        var selectables = this.getSelectables(true);
        var itemSelection = [];

        var modelSelection = this.__modelSelection__P_136_0.toArray();

        for (var i = 0; i < modelSelection.length; i++) {
          var model = modelSelection[i];

          for (var j = 0; j < selectables.length; j++) {
            var selectable = selectables[j]; // fallback if getModel is not implemented

            var selectableModel = selectable.getModel ? selectable.getModel() : null;

            if (model === selectableModel) {
              itemSelection.push(selectable);
              break;
            }
          }
        }

        this.setSelection(itemSelection);
        this.__inSelectionChange__P_136_3 = false; // check if the setting has worked

        var currentSelection = this.getSelection();

        if (!qx.lang.Array.equals(currentSelection, itemSelection)) {
          // if not, set the actual selection
          this.__onModelSelectionChange__P_136_2();
        }
      },

      /**
       * Returns always an array of the models of the selected items. If no
       * item is selected or no model is given, the array will be empty.
       *
       * *CAREFUL!* The model selection can only work if every item item in the
       * selection providing widget has a model property!
       *
       * @return {qx.data.Array} An array of the models of the selected items.
       */
      getModelSelection: function getModelSelection() {
        return this.__modelSelection__P_136_0;
      },

      /**
       * Takes the given models in the array and searches for the corresponding
       * selectables. If an selectable does have that model attached, it will be
       * selected.
       *
       * *Attention:* This method can have a time complexity of O(n^2)!
       *
       * *CAREFUL!* The model selection can only work if every item item in the
       * selection providing widget has a model property!
       *
       * @param modelSelection {Array} An array of models, which should be
       *   selected.
       */
      setModelSelection: function setModelSelection(modelSelection) {
        // check for null values
        if (!modelSelection) {
          this.__modelSelection__P_136_0.removeAll();

          return;
        }

        {
          this.assertArray(modelSelection, "Please use an array as parameter.");
        } // add the first two parameter

        modelSelection.unshift(this.__modelSelection__P_136_0.getLength()); // remove index

        modelSelection.unshift(0); // start index

        var returnArray = this.__modelSelection__P_136_0.splice.apply(this.__modelSelection__P_136_0, modelSelection);

        returnArray.dispose();
      }
    },
    destruct: function destruct() {
      this._disposeObjects("__modelSelection__P_136_0");
    }
  });
  qx.ui.form.MModelSelection.$$dbClassInfo = $$dbClassInfo;
})();

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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
      "qx.ui.core.ISingleSelection": {
        "require": true
      },
      "qx.ui.form.IField": {
        "require": true
      },
      "qx.ui.form.IForm": {
        "require": true
      },
      "qx.ui.form.IModelSelection": {
        "require": true
      },
      "qx.ui.core.MSingleSelectionHandling": {
        "require": true
      },
      "qx.ui.form.MModelSelection": {
        "require": true
      },
      "qx.lang.String": {},
      "qx.lang.Array": {},
      "qx.ui.core.FocusHandler": {}
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
       * Christian Hagendorn (chris_schmidt)
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * The radio group handles a collection of items from which only one item
   * can be selected. Selection another item will deselect the previously selected
   * item.
   *
   * This class is e.g. used to create radio groups or {@link qx.ui.form.RadioButton}
   * or {@link qx.ui.toolbar.RadioButton} instances.
   *
   * We also offer a widget for the same purpose which uses this class. So if
   * you like to act with a widget instead of a pure logic coupling of the
   * widgets, take a look at the {@link qx.ui.form.RadioButtonGroup} widget.
   */
  qx.Class.define("qx.ui.form.RadioGroup", {
    extend: qx.core.Object,
    implement: [qx.ui.core.ISingleSelection, qx.ui.form.IField, qx.ui.form.IForm, qx.ui.form.IModelSelection],
    include: [qx.ui.core.MSingleSelectionHandling, qx.ui.form.MModelSelection],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param varargs {qx.core.Object} A variable number of items, which are
     *     initially added to the radio group, the first item will be selected.
     */
    construct: function construct(varargs) {
      qx.core.Object.constructor.call(this); // create item array

      this.__items__P_85_0 = []; // add listener before call add!!!

      this.addListener("changeSelection", this.__onChangeSelection__P_85_1, this);

      if (varargs != null) {
        this.add.apply(this, arguments);
      }
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /**
       * The property name in each of the added widgets that is grouped
       */
      groupedProperty: {
        check: "String",
        apply: "_applyGroupedProperty",
        event: "changeGroupedProperty",
        init: "value"
      },

      /**
       * The property name in each of the added widgets that is informed of the
       * RadioGroup object it is a member of
       */
      groupProperty: {
        check: "String",
        event: "changeGroupProperty",
        init: "group"
      },

      /**
       * Whether the radio group is enabled
       */
      enabled: {
        check: "Boolean",
        apply: "_applyEnabled",
        event: "changeEnabled",
        init: true
      },

      /**
       * Whether the selection should wrap around. This means that the successor of
       * the last item is the first item.
       */
      wrap: {
        check: "Boolean",
        init: true
      },

      /**
       * If is set to <code>true</code> the selection could be empty,
       * otherwise is always one <code>RadioButton</code> selected.
       */
      allowEmptySelection: {
        check: "Boolean",
        init: false,
        apply: "_applyAllowEmptySelection"
      },

      /**
       * Flag signaling if the group at all is valid. All children will have the
       * same state.
       */
      valid: {
        check: "Boolean",
        init: true,
        apply: "_applyValid",
        event: "changeValid"
      },

      /**
       * Flag signaling if the group is required.
       */
      required: {
        check: "Boolean",
        init: false,
        event: "changeRequired"
      },

      /**
       * Message which is shown in an invalid tooltip.
       */
      invalidMessage: {
        check: "String",
        init: "",
        event: "changeInvalidMessage",
        apply: "_applyInvalidMessage"
      },

      /**
       * Message which is shown in an invalid tooltip if the {@link #required} is
       * set to true.
       */
      requiredInvalidMessage: {
        check: "String",
        nullable: true,
        event: "changeInvalidMessage"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /** @type {qx.ui.form.IRadioItem[]} The items of the radio group */
      __items__P_85_0: null,

      /*
      ---------------------------------------------------------------------------
        UTILITIES
      ---------------------------------------------------------------------------
      */

      /**
       * Get all managed items
       *
       * @return {qx.ui.form.IRadioItem[]} All managed items.
       */
      getItems: function getItems() {
        return this.__items__P_85_0;
      },

      /*
      ---------------------------------------------------------------------------
        REGISTRY
      ---------------------------------------------------------------------------
      */

      /**
       * Add the passed items to the radio group.
       *
       * @param varargs {qx.ui.form.IRadioItem} A variable number of items to add.
       */
      add: function add(varargs) {
        var items = this.__items__P_85_0;
        var item;
        var groupedProperty = this.getGroupedProperty();
        var groupedPropertyUp = qx.lang.String.firstUp(groupedProperty);

        for (var i = 0, l = arguments.length; i < l; i++) {
          item = arguments[i];

          if (items.includes(item)) {
            continue;
          } // Register listeners


          item.addListener("change" + groupedPropertyUp, this._onItemChangeChecked, this); // Push RadioButton to array

          items.push(item); // Inform radio button about new group

          item.set(this.getGroupProperty(), this); // Need to update internal value?

          if (item.get(groupedProperty)) {
            this.setSelection([item]);
          }
        } // Select first item when only one is registered


        if (!this.isAllowEmptySelection() && items.length > 0 && !this.getSelection()[0]) {
          this.setSelection([items[0]]);
        }
      },

      /**
       * Remove an item from the radio group.
       *
       * @param item {qx.ui.form.IRadioItem} The item to remove.
       */
      remove: function remove(item) {
        var items = this.__items__P_85_0;
        var groupedProperty = this.getGroupedProperty();
        var groupedPropertyUp = qx.lang.String.firstUp(groupedProperty);

        if (items.includes(item)) {
          // Remove RadioButton from array
          qx.lang.Array.remove(items, item); // Inform radio button about new group

          if (item.get(this.getGroupProperty()) === this) {
            item.reset(this.getGroupProperty());
          } // Deregister listeners


          item.removeListener("change" + groupedPropertyUp, this._onItemChangeChecked, this); // if the radio was checked, set internal selection to null

          if (item.get(groupedProperty)) {
            this.resetSelection();
          }
        }
      },

      /**
       * Returns an array containing the group's items.
       *
       * @return {qx.ui.form.IRadioItem[]} The item array
       */
      getChildren: function getChildren() {
        return this.__items__P_85_0;
      },

      /*
      ---------------------------------------------------------------------------
        LISTENER FOR ITEM CHANGES
      ---------------------------------------------------------------------------
      */

      /**
       * Event listener for <code>changeValue</code> event of every managed item.
       *
       * @param e {qx.event.type.Data} Data event
       */
      _onItemChangeChecked: function _onItemChangeChecked(e) {
        var item = e.getTarget();
        var groupedProperty = this.getGroupedProperty();

        if (item.get(groupedProperty)) {
          this.setSelection([item]);
        } else if (this.getSelection()[0] == item) {
          this.resetSelection();
        }
      },

      /*
      ---------------------------------------------------------------------------
        APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // property apply
      _applyGroupedProperty: function _applyGroupedProperty(value, old) {
        var item;
        var oldFirstUp = qx.lang.String.firstUp(old);
        var newFirstUp = qx.lang.String.firstUp(value);

        for (var i = 0; i < this.__items__P_85_0.length; i++) {
          item = this.__items__P_85_0[i]; // remove the listener for the old change event

          item.removeListener("change" + oldFirstUp, this._onItemChangeChecked, this); // add the listener for the new change event

          item.removeListener("change" + newFirstUp, this._onItemChangeChecked, this);
        }
      },
      // property apply
      _applyInvalidMessage: function _applyInvalidMessage(value, old) {
        for (var i = 0; i < this.__items__P_85_0.length; i++) {
          this.__items__P_85_0[i].setInvalidMessage(value);
        }
      },
      // property apply
      _applyValid: function _applyValid(value, old) {
        for (var i = 0; i < this.__items__P_85_0.length; i++) {
          this.__items__P_85_0[i].setValid(value);
        }
      },
      // property apply
      _applyEnabled: function _applyEnabled(value, old) {
        var items = this.__items__P_85_0;

        if (value == null) {
          for (var i = 0, l = items.length; i < l; i++) {
            items[i].resetEnabled();
          }
        } else {
          for (var i = 0, l = items.length; i < l; i++) {
            items[i].setEnabled(value);
          }
        }
      },
      // property apply
      _applyAllowEmptySelection: function _applyAllowEmptySelection(value, old) {
        if (!value && this.isSelectionEmpty()) {
          this.resetSelection();
        }
      },

      /*
      ---------------------------------------------------------------------------
        SELECTION
      ---------------------------------------------------------------------------
      */

      /**
       * Select the item following the given item.
       */
      selectNext: function selectNext() {
        var item = this.getSelection()[0];
        var items = this.__items__P_85_0;
        var index = items.indexOf(item);

        if (index == -1) {
          return;
        }

        var i = 0;
        var length = items.length; // Find next enabled item

        if (this.getWrap()) {
          index = (index + 1) % length;
        } else {
          index = Math.min(index + 1, length - 1);
        }

        while (i < length && !items[index].getEnabled()) {
          index = (index + 1) % length;
          i++;
        }

        this.setSelection([items[index]]);
      },

      /**
       * Select the item previous the given item.
       */
      selectPrevious: function selectPrevious() {
        var item = this.getSelection()[0];
        var items = this.__items__P_85_0;
        var index = items.indexOf(item);

        if (index == -1) {
          return;
        }

        var i = 0;
        var length = items.length; // Find previous enabled item

        if (this.getWrap()) {
          index = (index - 1 + length) % length;
        } else {
          index = Math.max(index - 1, 0);
        }

        while (i < length && !items[index].getEnabled()) {
          index = (index - 1 + length) % length;
          i++;
        }

        this.setSelection([items[index]]);
      },

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS FOR SELECTION API
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the items for the selection.
       *
       * @return {qx.ui.form.IRadioItem[]} Items to select.
       */
      _getItems: function _getItems() {
        return this.getItems();
      },

      /**
       * Returns if the selection could be empty or not.
       *
       * @return {Boolean} <code>true</code> If selection could be empty,
       *    <code>false</code> otherwise.
       */
      _isAllowEmptySelection: function _isAllowEmptySelection() {
        return this.isAllowEmptySelection();
      },

      /**
       * Returns whether the item is selectable. In opposite to the default
       * implementation (which checks for visible items) every radio button
       * which is part of the group is selected even if it is currently not visible.
       *
       * @param item {qx.ui.form.IRadioItem} The item to check if its selectable.
       * @return {Boolean} <code>true</code> if the item is part of the radio group
       *    <code>false</code> otherwise.
       */
      _isItemSelectable: function _isItemSelectable(item) {
        return this.__items__P_85_0.indexOf(item) != -1;
      },

      /**
       * Event handler for <code>changeSelection</code>.
       *
       * @param e {qx.event.type.Data} Data event.
       */
      __onChangeSelection__P_85_1: function __onChangeSelection__P_85_1(e) {
        var value = e.getData()[0];
        var old = e.getOldData()[0];
        var groupedProperty = this.getGroupedProperty();

        if (old) {
          old.set(groupedProperty, false);
        }

        if (value) {
          value.set(groupedProperty, true); // If Group is focused, the selection was changed by keyboard. Switch focus to new value

          if (this.__isGroupFocused__P_85_2() && value.isFocusable()) {
            value.focus();
          }
        }
      },

      /**
       * Checks if this group is focused by checking focused state of each item
       * @returns {Boolean} result
       */
      __isGroupFocused__P_85_2: function __isGroupFocused__P_85_2() {
        var focusHandler = qx.ui.core.FocusHandler.getInstance();

        var _iterator = _createForOfIteratorHelper(this._getItems()),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var item = _step.value;

            if (focusHandler.isFocused(item)) {
              return true;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
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
      this._disposeArray("__items__P_85_0");
    }
  });
  qx.ui.form.RadioGroup.$$dbClassInfo = $$dbClassInfo;
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
       2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
  
  ************************************************************************ */

  /**
   * Can be included for implementing {@link qx.ui.form.IModel}. It only contains
   * a nullable property named 'model' with a 'changeModel' event.
   */
  qx.Mixin.define("qx.ui.form.MModelProperty", {
    properties: {
      /**
       * Model property for storing additional information for the including
       * object. It can act as value property on form items for example.
       *
       * Be careful using that property as this is used for the
       * {@link qx.ui.form.MModelSelection} it has some restrictions:
       *
       * * Don't use equal models in one widget using the
       *     {@link qx.ui.form.MModelSelection}.
       *
       * * Avoid setting only some model properties if the widgets are added to
       *     a {@link qx.ui.form.MModelSelection} widget.
       *
       * Both restrictions result of the fact, that the set models are deputies
       * for their widget.
       */
      model: {
        nullable: true,
        event: "changeModel",
        apply: "_applyModel",
        dereference: true
      }
    },
    members: {
      // apply method
      _applyModel: function _applyModel(value, old) {// Empty implementation
      }
    }
  });
  qx.ui.form.MModelProperty.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Interface": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.RadioGroup": {}
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
   * Each object, which should be managed by a {@link RadioGroup} have to
   * implement this interface.
   */
  qx.Interface.define("qx.ui.form.IRadioItem", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired when the item was checked or unchecked */
      changeValue: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Set whether the item is checked
       *
       * @param value {Boolean} whether the item should be checked
       */
      setValue: function setValue(value) {},

      /**
       * Get whether the item is checked
       *
       * @return {Boolean} whether the item it checked
       */
      getValue: function getValue() {},

      /**
       * Set the radiogroup, which manages this item
       *
       * @param value {qx.ui.form.RadioGroup} The radiogroup, which should
       *     manage the item.
       */
      setGroup: function setGroup(value) {
        this.assertInstance(value, qx.ui.form.RadioGroup);
      },

      /**
       * Get the radiogroup, which manages this item
       *
       * @return {qx.ui.form.RadioGroup} The radiogroup, which manages the item.
       */
      getGroup: function getGroup() {}
    }
  });
  qx.ui.form.IRadioItem.$$dbClassInfo = $$dbClassInfo;
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
   * Form interface for all form widgets which have boolean as their primary
   * data type like a checkbox.
   */
  qx.Interface.define("qx.ui.form.IBooleanForm", {
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
       * @param value {Boolean|null} The new value of the element.
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
       * @return {Boolean|null} The value.
       */
      getValue: function getValue() {}
    }
  });
  qx.ui.form.IBooleanForm.$$dbClassInfo = $$dbClassInfo;
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
   * Each object which wants to store data representative for the real item
   * should implement this interface.
   */
  qx.Interface.define("qx.ui.form.IModel", {
    /*
    *****************************************************************************
       EVENTS
    *****************************************************************************
    */
    events: {
      /** Fired when the model data changes */
      changeModel: "qx.event.type.Data"
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Set the representative data for the item.
       *
       * @param value {var} The data.
       */
      setModel: function setModel(value) {},

      /**
       * Returns the representative data for the item
       *
       * @return {var} The data.
       */
      getModel: function getModel() {},

      /**
       * Sets the representative data to null.
       */
      resetModel: function resetModel() {}
    }
  });
  qx.ui.form.IModel.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.menu.AbstractButton": {
        "construct": true,
        "require": true
      },
      "qx.ui.form.MModelProperty": {
        "require": true
      },
      "qx.ui.form.IRadioItem": {
        "require": true
      },
      "qx.ui.form.IBooleanForm": {
        "require": true
      },
      "qx.ui.form.IModel": {
        "require": true
      },
      "qx.ui.form.RadioGroup": {}
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
   * Renders a special radio button inside a menu. The button behaves like
   * a normal {@link qx.ui.form.RadioButton} and shows a radio icon when
   * checked; normally shows no icon when not checked (depends on the theme).
   */
  qx.Class.define("qx.ui.menu.RadioButton", {
    extend: qx.ui.menu.AbstractButton,
    include: [qx.ui.form.MModelProperty],
    implement: [qx.ui.form.IRadioItem, qx.ui.form.IBooleanForm, qx.ui.form.IModel],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} Initial label
     * @param menu {qx.ui.menu.Menu} Initial sub menu
     */
    construct: function construct(label, menu) {
      qx.ui.menu.AbstractButton.constructor.call(this); // ARIA attrs
      // Important: (Grouped) radio btns should be children of a div with role 'radiogroup'

      var contentEl = this.getContentElement();
      contentEl.setAttribute("role", "radio");
      contentEl.setAttribute("aria-checked", false); // Initialize with incoming arguments

      if (label != null) {
        this.setLabel(label);
      }

      if (menu != null) {
        this.setMenu(menu);
      }

      this.addListener("execute", this._onExecute, this);
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
        init: "menu-radiobutton"
      },

      /** The value of the widget. True, if the widget is checked. */
      value: {
        check: "Boolean",
        nullable: true,
        event: "changeValue",
        apply: "_applyValue",
        init: false
      },

      /** The assigned qx.ui.form.RadioGroup which handles the switching between registered buttons */
      group: {
        check: "qx.ui.form.RadioGroup",
        nullable: true,
        apply: "_applyGroup"
      }
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */

    /* eslint-disable @qooxdoo/qx/no-refs-in-members */
    members: {
      // overridden (from MExecutable to keep the icon out of the binding)

      /**
       * @lint ignoreReferenceField(_bindableProperties)
       */
      _bindableProperties: ["enabled", "label", "toolTipText", "value", "menu"],
      // property apply
      _applyValue: function _applyValue(value, old) {
        value ? this.addState("checked") : this.removeState("checked"); // ARIA attrs

        this.getContentElement().setAttribute("aria-checked", Boolean(value));
      },
      // property apply
      _applyGroup: function _applyGroup(value, old) {
        if (old) {
          old.remove(this);
        }

        if (value) {
          value.add(this);
        }
      },

      /**
       * Handler for the execute event.
       *
       * @param e {qx.event.type.Event} The execute event.
       */
      _onExecute: function _onExecute(e) {
        var grp = this.getGroup();

        if (grp && grp.getAllowEmptySelection()) {
          this.toggleValue();
        } else {
          this.setValue(true);
        }
      }
    }
  });
  qx.ui.menu.RadioButton.$$dbClassInfo = $$dbClassInfo;
})();
//# sourceMappingURL=package-17.js.map?dt=1673131574529
qx.$$packageData['17'] = {
  "locales": {},
  "resources": {},
  "translations": {}
};
