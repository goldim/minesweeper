/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("demo.Miner.status.State", {
    extend: qx.ui.form.Button,

    construct(){
        // noinspection JSAnnotator
        super("", "@MaterialIcons/sentiment_satisfied_alt/24");
        this.set({width: 25});
    },

    members: {

    }
});