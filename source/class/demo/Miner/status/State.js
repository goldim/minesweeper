/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("demo.Miner.status.State", {
    extend: qx.ui.form.Button,

    construct(){
        const width = 24;
        // noinspection JSAnnotator
        super(null, `@MaterialIcons/sentiment_satisfied_alt/${width}`);
        this.setWidth(width);

    },

    members: {
        state: {
            init: "good",
            check: ["fail", "good", "done"],
            event: "changeState"
        }
    }
});