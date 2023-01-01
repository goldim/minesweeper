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
        this.setDifficulty("Low");
    },

    members: {
        setDifficulty(difficulty){
            this.removeAll();
            switch(difficulty){
                case "Low":
                    this.fillBoard(9, 9)
                    break;
                case "Medium":
                    this.fillBoard(16, 16)
                    break;
                case "Hard":
                    this.fillBoard( 16, 30)
                    break;
            }
        },

        fillBoard(colCount, rowCount){
            for (let i = 0; i < rowCount; i++){
                for (let j = 0; j < colCount; j++){
                    this.add(new qx.ui.form.Button().set({width: 25, height: 25}), {row: j, column: i});
                }
            }
        }
    }
});