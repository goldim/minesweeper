/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Class.define("demo.Miner.theme.Image", {
    extend: qx.core.Object,

    statics: {
        /**
         * Holds a map containing all the URL to the images.
         * @internal
         */
        URLS: {
            blank: "qx/static/blank.png",

            "square-flagged": "@MaterialIcons/flag/16",
            "square-question": "@MaterialIcons/question_mark/16",
        }
    }
});