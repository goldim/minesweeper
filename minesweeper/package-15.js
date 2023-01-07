(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.core.LayoutItem": {
        "construct": true,
        "require": true
      },
      "qx.ui.core.queue.Dispose": {}
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
   * A Spacer is a "virtual" widget, which can be placed into any layout and takes
   * the space a normal widget of the same size would take.
   *
   * Spacers are invisible and very light weight because they don't require any
   * DOM modifications.
   *
   * *Example*
   *
   * Here is a little example of how to use the widget.
   *
   * <pre class='javascript'>
   *   var container = new qx.ui.container.Composite(new qx.ui.layout.HBox());
   *   container.add(new qx.ui.core.Widget());
   *   container.add(new qx.ui.core.Spacer(50));
   *   container.add(new qx.ui.core.Widget());
   * </pre>
   *
   * This example places two widgets and a spacer into a container with a
   * horizontal box layout. In this scenario the spacer creates an empty area of
   * 50 pixel width between the two widgets.
   *
   * *External Documentation*
   *
   * <a href='http://qooxdoo.org/docs/#desktop/widget/spacer.md' target='_blank'>
   * Documentation of this widget in the qooxdoo manual.</a>
   */
  qx.Class.define("qx.ui.core.Spacer", {
    extend: qx.ui.core.LayoutItem,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param width {Integer?null} the initial width
     * @param height {Integer?null} the initial height
     */
    construct: function construct(width, height) {
      qx.ui.core.LayoutItem.constructor.call(this); // Initialize dimensions

      this.setWidth(width != null ? width : 0);
      this.setHeight(height != null ? height : 0);
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Helper method called from the visibility queue to detect outstanding changes
       * to the appearance.
       *
       * @internal
       */
      checkAppearanceNeeds: function checkAppearanceNeeds() {// placeholder to improve compatibility with Widget.
      },

      /**
       * Recursively adds all children to the given queue
       *
       * @param queue {Map} The queue to add widgets to
       */
      addChildrenToQueue: function addChildrenToQueue(queue) {// placeholder to improve compatibility with Widget.
      },

      /**
       * Removes this widget from its parent and dispose it.
       *
       * Please note that the widget is not disposed synchronously. The
       * real dispose happens after the next queue flush.
       *
       */
      destroy: function destroy() {
        if (this.$$disposed) {
          return;
        }

        var parent = this.$$parent;

        if (parent) {
          parent._remove(this);
        }

        qx.ui.core.queue.Dispose.add(this);
      }
    }
  });
  qx.ui.core.Spacer.$$dbClassInfo = $$dbClassInfo;
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
       * Andreas Ecker (ecker)
  
  ************************************************************************ */

  /**
   * A widget used for decoration proposes to structure a toolbar. Each
   * Separator renders a line between the buttons around.
   */
  qx.Class.define("qx.ui.toolbar.Separator", {
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
        init: "toolbar-separator"
      },
      // overridden
      anonymous: {
        refine: true,
        init: true
      },
      // overridden
      width: {
        refine: true,
        init: 0
      },
      // overridden
      height: {
        refine: true,
        init: 0
      }
    }
  });
  qx.ui.toolbar.Separator.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.menu.Menu": {},
      "qx.ui.core.FocusHandler": {},
      "qx.ui.menu.Manager": {}
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
   * A button which opens the connected menu when tapping on it.
   */
  qx.Class.define("qx.ui.form.MenuButton", {
    extend: qx.ui.form.Button,

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */

    /**
     * @param label {String} Initial label
     * @param icon {String?null} Initial icon
     * @param menu {qx.ui.menu.Menu} Connect to menu instance
     */
    construct: function construct(label, icon, menu) {
      qx.ui.form.Button.constructor.call(this, label, icon); // Initialize properties

      if (menu != null) {
        this.setMenu(menu);
      } // ARIA attrs


      this.getContentElement().setAttribute("role", "button");
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      /** The menu instance to show when tapping on the button */
      menu: {
        check: "qx.ui.menu.Menu",
        nullable: true,
        apply: "_applyMenu",
        event: "changeMenu"
      },
      // overridden
      appearance: {
        refine: true,
        init: "menubutton"
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
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      // overridden
      _applyVisibility: function _applyVisibility(value, old) {
        qx.ui.form.MenuButton.superclass.prototype._applyVisibility.call(this, value, old); // hide the menu too


        var menu = this.getMenu();

        if (value != "visible" && menu) {
          menu.hide();
        }
      },
      // property apply
      _applyMenu: function _applyMenu(value, old) {
        if (old) {
          old.removeListener("changeVisibility", this._onMenuChange, this);
          old.resetOpener();
        }

        if (value) {
          value.addListener("changeVisibility", this._onMenuChange, this);
          value.setOpener(this);
          value.removeState("submenu");
          value.removeState("contextmenu");
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

      /*
      ---------------------------------------------------------------------------
        HELPER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Positions and shows the attached menu widget.
       *
       * @param selectFirst {Boolean?false} Whether the first menu button should be selected
       */
      open: function open(selectFirst) {
        var menu = this.getMenu();

        if (menu) {
          // Focus this button when the menu opens
          if (this.isFocusable() && !qx.ui.core.FocusHandler.getInstance().isFocused(this)) {
            this.focus();
          } // Hide all menus first


          qx.ui.menu.Manager.getInstance().hideAll(); // Open the attached menu

          menu.setOpener(this);
          menu.open(); // Select first item

          if (selectFirst) {
            var first = menu.getSelectables()[0];

            if (first) {
              menu.setSelectedButton(first);
            }
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Listener for visibility property changes of the attached menu
       *
       * @param e {qx.event.type.Data} Property change event
       */
      _onMenuChange: function _onMenuChange(e) {
        var menu = this.getMenu();
        var menuVisible = menu.isVisible();

        if (menuVisible) {
          this.addState("pressed");
        } else {
          this.removeState("pressed");
        } // ARIA attrs


        this.getContentElement().setAttribute("aria-expanded", menuVisible);
      },
      // overridden
      _onPointerDown: function _onPointerDown(e) {
        // call the base function to get into the capture phase [BUG #4340]
        qx.ui.form.MenuButton.superclass.prototype._onPointerDown.call(this, e); // only open on left clicks [BUG #5125]


        if (e.getButton() != "left") {
          return;
        }

        var menu = this.getMenu();

        if (menu) {
          // Toggle sub menu visibility
          if (!menu.isVisible()) {
            this.open();
          } else {
            menu.exclude();
          } // Event is processed, stop it for others


          e.stopPropagation();
        }
      },
      // overridden
      _onPointerUp: function _onPointerUp(e) {
        // call base for firing the execute event
        qx.ui.form.MenuButton.superclass.prototype._onPointerUp.call(this, e); // Just stop propagation to stop menu manager
        // from getting the event


        e.stopPropagation();
      },
      // overridden
      _onPointerOver: function _onPointerOver(e) {
        // Add hovered state
        this.addState("hovered");
      },
      // overridden
      _onPointerOut: function _onPointerOut(e) {
        // Just remove the hover state
        this.removeState("hovered");
      },
      // overridden
      _onKeyDown: function _onKeyDown(e) {
        switch (e.getKeyIdentifier()) {
          case "Space":
          case "Enter":
            this.removeState("abandoned");
            this.addState("pressed");
            var menu = this.getMenu();

            if (menu) {
              // Toggle sub menu visibility
              if (!menu.isVisible()) {
                this.open();
              } else {
                menu.exclude();
              }
            }

            e.stopPropagation();
        }
      },
      // overridden
      _onKeyUp: function _onKeyUp(e) {// no action required here
      }
    }
  });
  qx.ui.form.MenuButton.$$dbClassInfo = $$dbClassInfo;
})();

(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.ui.form.MenuButton": {
        "require": true
      },
      "qx.ui.toolbar.ToolBar": {},
      "qx.ui.menu.Manager": {}
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
   * A menubar button
   */
  qx.Class.define("qx.ui.menubar.Button", {
    extend: qx.ui.form.MenuButton,

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      appearance: {
        refine: true,
        init: "menubar-button"
      },
      show: {
        refine: true,
        init: "inherit"
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
        HELPER METHODS
      ---------------------------------------------------------------------------
      */

      /**
       * Inspects the parent chain to find the MenuBar
       *
       * @return {qx.ui.menubar.MenuBar} MenuBar instance or <code>null</code>.
       */
      getMenuBar: function getMenuBar() {
        var parent = this;

        while (parent) {
          /* this method is also used by toolbar.MenuButton, so we need to check
             for a ToolBar instance. */
          if (parent instanceof qx.ui.toolbar.ToolBar) {
            return parent;
          }

          parent = parent.getLayoutParent();
        }

        return null;
      },
      // overridden
      open: function open(selectFirst) {
        qx.ui.menubar.Button.superclass.prototype.open.call(this, selectFirst);
        var menubar = this.getMenuBar();

        if (menubar) {
          menubar._setAllowMenuOpenHover(true);
        }
      },

      /*
      ---------------------------------------------------------------------------
        EVENT LISTENERS
      ---------------------------------------------------------------------------
      */

      /**
       * Listener for visibility property changes of the attached menu
       *
       * @param e {qx.event.type.Data} Property change event
       */
      _onMenuChange: function _onMenuChange(e) {
        var menu = this.getMenu();
        var menubar = this.getMenuBar();

        if (menu.isVisible()) {
          this.addState("pressed"); // Sync with open menu property

          if (menubar) {
            menubar.setOpenMenu(menu);
          }
        } else {
          this.removeState("pressed"); // Sync with open menu property

          if (menubar && menubar.getOpenMenu() == menu) {
            menubar.resetOpenMenu();

            menubar._setAllowMenuOpenHover(false);
          }
        }
      },
      // overridden
      _onPointerUp: function _onPointerUp(e) {
        qx.ui.menubar.Button.superclass.prototype._onPointerUp.call(this, e); // Set state 'pressed' to visualize that the menu is open.


        var menu = this.getMenu();

        if (menu && menu.isVisible() && !this.hasState("pressed")) {
          this.addState("pressed");
        }
      },

      /**
       * Event listener for pointerover event
       *
       * @param e {qx.event.type.Pointer} pointerover event object
       */
      _onPointerOver: function _onPointerOver(e) {
        // Add hovered state
        this.addState("hovered"); // Open submenu

        if (this.getMenu() && e.getPointerType() == "mouse") {
          var menubar = this.getMenuBar();

          if (menubar && menubar._isAllowMenuOpenHover()) {
            // Hide all open menus
            qx.ui.menu.Manager.getInstance().hideAll(); // Set it again, because hideAll remove it.

            menubar._setAllowMenuOpenHover(true); // Then show the attached menu


            if (this.isEnabled()) {
              this.open();
            }
          }
        }
      }
    }
  });
  qx.ui.menubar.Button.$$dbClassInfo = $$dbClassInfo;
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
      "qx.ui.layout.HBox": {
        "construct": true
      },
      "qx.ui.basic.Image": {},
      "qx.ui.toolbar.PartContainer": {},
      "qx.ui.toolbar.Separator": {},
      "qx.ui.menubar.Button": {}
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
   * A part is a container for multiple toolbar buttons. Each part comes
   * with a handle which may be used in later versions to drag the part
   * around and move it to another position. Currently mainly used
   * for structuring large toolbars beyond the capabilities of the
   * {@link Separator}.
   *
   * @childControl handle {qx.ui.basic.Image} prat handle to visualize the separation
   * @childControl container {qx.ui.toolbar.PartContainer} holds the content of the toolbar part
   */
  qx.Class.define("qx.ui.toolbar.Part", {
    extend: qx.ui.core.Widget,
    include: [qx.ui.core.MRemoteChildrenHandling],

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.ui.core.Widget.constructor.call(this); // Hard coded HBox layout

      this._setLayout(new qx.ui.layout.HBox()); // Force creation of the handle


      this._createChildControl("handle");
    },

    /*
    *****************************************************************************
       PROPERTIES
    *****************************************************************************
    */
    properties: {
      appearance: {
        refine: true,
        init: "toolbar/part"
      },

      /** Whether icons, labels, both or none should be shown. */
      show: {
        init: "both",
        check: ["both", "label", "icon"],
        inheritable: true,
        event: "changeShow"
      },

      /** The spacing between every child of the toolbar */
      spacing: {
        nullable: true,
        check: "Integer",
        themeable: true,
        apply: "_applySpacing"
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
        var _this = this;

        var control;

        switch (id) {
          case "handle":
            control = new qx.ui.basic.Image();
            control.setAlignY("middle");

            this._add(control);

            break;

          case "container":
            control = new qx.ui.toolbar.PartContainer();
            control.addListener("syncAppearance", this.__onSyncAppearance__P_131_0, this);

            this._add(control);

            control.addListener("changeChildren", function () {
              _this.__onSyncAppearance__P_131_0();
            });
            break;
        }

        return control || qx.ui.toolbar.Part.superclass.prototype._createChildControlImpl.call(this, id);
      },
      // overridden
      getChildrenContainer: function getChildrenContainer() {
        return this.getChildControl("container");
      },

      /*
      ---------------------------------------------------------------------------
        PROPERTY APPLY ROUTINES
      ---------------------------------------------------------------------------
      */
      _applySpacing: function _applySpacing(value, old) {
        var layout = this.getChildControl("container").getLayout();
        value == null ? layout.resetSpacing() : layout.setSpacing(value);
      },

      /*
      ---------------------------------------------------------------------------
        UTILITIES
      ---------------------------------------------------------------------------
      */

      /**
       * Helper which applies the left, right and middle states.
       */
      __onSyncAppearance__P_131_0: function __onSyncAppearance__P_131_0() {
        // check every child
        var children = this.getChildrenContainer().getChildren();
        children = children.filter(function (child) {
          return child.getVisibility() == "visible";
        });

        for (var i = 0; i < children.length; i++) {
          // if its the first child
          if (i == 0 && i != children.length - 1) {
            children[i].addState("left");
            children[i].removeState("right");
            children[i].removeState("middle"); // if its the last child
          } else if (i == children.length - 1 && i != 0) {
            children[i].addState("right");
            children[i].removeState("left");
            children[i].removeState("middle"); // if there is only one child
          } else if (i == 0 && i == children.length - 1) {
            children[i].removeState("left");
            children[i].removeState("middle");
            children[i].removeState("right");
          } else {
            children[i].addState("middle");
            children[i].removeState("right");
            children[i].removeState("left");
          }
        }
      },

      /**
       * Adds a separator to the toolbar part.
       */
      addSeparator: function addSeparator() {
        this.add(new qx.ui.toolbar.Separator());
      },

      /**
       * Returns all nested buttons which contains a menu to show. This is mainly
       * used for keyboard support.
       *
       * @return {Array} List of all menu buttons
       */
      getMenuButtons: function getMenuButtons() {
        var children = this.getChildren();
        var buttons = [];
        var child;

        for (var i = 0, l = children.length; i < l; i++) {
          child = children[i];

          if (child instanceof qx.ui.menubar.Button) {
            buttons.push(child);
          }
        }

        return buttons;
      }
    }
  });
  qx.ui.toolbar.Part.$$dbClassInfo = $$dbClassInfo;
})();
//# sourceMappingURL=package-15.js.map?dt=1673131574517
qx.$$packageData['15'] = {
  "locales": {},
  "resources": {},
  "translations": {}
};
