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
      "qx.ui.layout.Grid": {
        "construct": true
      },
      "minesweeper.Game": {},
      "minesweeper.Square": {},
      "minesweeper.OpenedSquare": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     Copyright: 2023 Dmitrii Zolotov
  
     License: MIT license
  
     Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru
  
  ************************************************************************ */

  /**
   * This is an example of a contrib library, providing a very special button
   * @asset(minesweeper/*)
   */
  qx.Class.define("minesweeper.Board", {
    extend: qx.ui.container.Composite,
    construct: function construct() {
      // noinspection JSAnnotator
      qx.ui.container.Composite.constructor.call(this);
      this.setLayout(new qx.ui.layout.Grid());

      this.__setupHandlers__P_30_0();
    },
    properties: {
      appearance: {
        init: "board",
        refine: true
      },
      blocked: {
        init: false,
        check: "Boolean",
        apply: "_applyBlocked"
      }
    },
    members: {
      __setupHandlers__P_30_0: function __setupHandlers__P_30_0() {
        var game = minesweeper.Game.getInstance();
        game.addListener("changeDifficulty", function () {
          this.update();
        }, this);
        game.addListener("changeState", function (e) {
          if (e.getData() === "start") {
            this.update();
          }
        }, this);
      },
      update: function update() {
        this.resetBlocked();
        var game = minesweeper.Game.getInstance();
        this.__colSize__P_30_1 = game.getColumnSize();
        this.__rowSize__P_30_2 = game.getRowSize();
        this.__mineCount__P_30_3 = game.getMineCount();
        this.prepare();
      },
      prepare: function prepare() {
        this.removeAll();

        this.__fillBoard__P_30_4();

        this.__generateMines__P_30_5();

        this.__evaluateValues__P_30_6();
      },
      _applyBlocked: function _applyBlocked(blocked) {
        this.forEverySquare(function (square) {
          if (this.__isSquare__P_30_7(square)) {
            square.setBlocked(blocked);
          }
        }.bind(this));
      },
      __fillBoard__P_30_4: function __fillBoard__P_30_4() {
        this.forEverySquareWithIndexes(function (column, row) {
          this.add(this.__createSquare__P_30_8(column, row), {
            row: row,
            column: column
          });
        }.bind(this));
      },
      __generateMines__P_30_5: function __generateMines__P_30_5() {
        var count = this.__mineCount__P_30_3;

        while (count) {
          var column = this.randomInteger(0, this.__colSize__P_30_1);
          var row = this.randomInteger(0, this.__rowSize__P_30_2);
          var square = this.getLayout().getCellWidget(row, column);

          if (!square.hasState("mined")) {
            square.addState("mined");
            square.setValue(9);
            count--;
          }
        }
      },
      __getSquareAroundCoords__P_30_9: function __getSquareAroundCoords__P_30_9() {
        return [[1, 0], [0, 1], [1, 1], [-1, 0], [0, -1], [-1, -1], [-1, 1], [1, -1]];
      },
      showAllMines: function showAllMines() {
        this.forEverySquare(function (square) {
          if (this.__isSquare__P_30_7(square) && square.hasState("mined")) {
            var column = square.getColumnNo();
            var row = square.getRowNo();

            var mine = this.__createMineLabel__P_30_10();

            if (square.hasState("blasted")) {
              mine.addState("blasted");
            }

            square.destroy();
            this.add(mine, {
              row: row,
              column: column
            });
          }
        }.bind(this));
      },
      randomInteger: function randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
      },
      forEverySquareWithIndexes: function forEverySquareWithIndexes(handler) {
        for (var column = 0; column < this.__colSize__P_30_1; column++) {
          for (var row = 0; row < this.__rowSize__P_30_2; row++) {
            handler(column, row);
          }
        }
      },
      forEverySquare: function forEverySquare(handler) {
        this.forEverySquareWithIndexes(function (column, row) {
          var square = this.getLayout().getCellWidget(row, column);
          handler(square);
        }.bind(this));
      },
      __evaluateValues__P_30_6: function __evaluateValues__P_30_6() {
        this.forEverySquare(function (square) {
          if (square instanceof minesweeper.Square) {
            var count = this.__getSquareAroundCoords__P_30_9().filter(function (coords) {
              return this.checkMine(square.getColumnNo() + coords[0], square.getRowNo() + coords[1]);
            }, this).length;

            square.setValue(count);
          }
        }.bind(this));
      },
      __isSquare__P_30_7: function __isSquare__P_30_7(square) {
        return square instanceof minesweeper.Square;
      },
      checkMine: function checkMine(column, row) {
        var square = this.getLayout().getCellWidget(row, column);
        return this.__isSquare__P_30_7(square) && square.hasState("mined");
      },
      __createSquare__P_30_8: function __createSquare__P_30_8(column, row) {
        var square = new minesweeper.Square().set({
          width: 32,
          height: 32
        });
        square.setColumnNo(column);
        square.setRowNo(row);
        square.addListener("blast", this._onBlast, this);
        square.addListener("open", this._onOpen, this);
        return square;
      },
      _onOpen: function _onOpen(e) {
        var square = e.getTarget();
        var column = square.getColumnNo();
        var row = square.getRowNo();
        var value = square.getValue();
        square.destroy();

        if (!value) {
          value = "";
          this.__attended__P_30_11 = [];
          this.expandSpaceFromSquare(column, row);
        } else {
          this.add(this.__createColoredLabel__P_30_12(value), {
            row: row,
            column: column
          });
        }

        this.__checkFinished__P_30_13();
      },
      __createColoredLabel__P_30_12: function __createColoredLabel__P_30_12(value) {
        var valueStr = value.toString();
        var atom = new minesweeper.OpenedSquare(valueStr);
        atom.addState("mines-around-".concat(valueStr));
        return atom;
      },
      __createEmptyLabel__P_30_14: function __createEmptyLabel__P_30_14() {
        return new minesweeper.OpenedSquare(null);
      },
      __createMineLabel__P_30_10: function __createMineLabel__P_30_10() {
        var mine = new minesweeper.OpenedSquare(null);
        mine.addState("mined");
        return mine;
      },
      __checkOutOfBorders__P_30_15: function __checkOutOfBorders__P_30_15(column, row) {
        return column < 0 || row < 0 || column === this.__colSize__P_30_1 || row === this.__rowSize__P_30_2;
      },
      __checkFinished__P_30_13: function __checkFinished__P_30_13() {
        var countRevealedSquares = 0;
        this.forEverySquare(function (square) {
          if (!this.__isSquare__P_30_7(square)) {
            countRevealedSquares++;
          }
        }.bind(this));

        if (countRevealedSquares === this.__colSize__P_30_1 * this.__rowSize__P_30_2 - this.__mineCount__P_30_3) {
          this.setBlocked(true);
          minesweeper.Game.getInstance().setState("success");
        }
      },
      expandSpaceFromSquare: function expandSpaceFromSquare(column, row) {
        if (this.__checkOutOfBorders__P_30_15(column, row)) {
          return;
        }

        if (this.__attended__P_30_11.some(function (coords) {
          return coords.column === column && coords.row === row;
        })) {
          return;
        }

        this.__attended__P_30_11.push({
          column: column,
          row: row
        });

        var square = this.getLayout().getCellWidget(row, column);

        if (this.__isSquare__P_30_7(square)) {
          if (!square.hasState("mined")) {
            if (square.getValue() === 0) {
              square.destroy();
              this.add(this.__createEmptyLabel__P_30_14(), {
                row: row,
                column: column
              });
            } else if (square.getValue() > 0) {
              square.destroy();
              this.add(this.__createColoredLabel__P_30_12(square.getValue()), {
                row: row,
                column: column
              });
              return;
            }
          }
        }

        this.__getSquareAroundCoords__P_30_9().forEach(function (coords) {
          this.expandSpaceFromSquare(column + coords[0], row + coords[1]);
        }, this);
      },
      _onBlast: function _onBlast() {
        this.showAllMines();
        this.setBlocked(true);
        minesweeper.Game.getInstance().setState("over");
      }
    }
  });
  minesweeper.Board.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Board.js.map?dt=1673131552650