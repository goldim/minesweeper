/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("demo.Miner.Board", {
    extend: qx.ui.container.Composite,

    construct(){
        // noinspection JSAnnotator
        super();
        this.setLayout(new qx.ui.layout.Grid());
        this.fillBoard();
    },

    members: {
        fillBoard(){
            for (let i = 0; i < 10; i++){
                for (let j = 0; j < 10; j++){
                    this.add(new qx.ui.form.Button().set({width: 25, height: 25}), {row: j, column: i});
                }
            }
        }
    }
});