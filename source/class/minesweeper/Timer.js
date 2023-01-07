/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("minesweeper.Timer", {
    extend: qx.core.Object,

    construct() {
        // noinspection JSAnnotator
        super();
        this.__timer = new qx.event.Timer(1000);
        this.__timer.addListener("interval", this.__updateTime, this);
    },

    destruct() {
        this.__timer.stop();
        this.__timer.dispose();
    },

    properties: {
        time: {
            init: 0,
            check: "Integer",
            event: "changeTime"
        }
    },

    members: {
        __updateTime() {
            this.setTime(this.getTime() + 1);
        },

        start() {
            this.resetTime();
            this.__timer.start();
        },

        stop() {
            this.__timer.stop();
        }
    }
});
