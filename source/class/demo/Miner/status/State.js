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
        super(null);
        this.setWidth(width);
        this.initStatus("good");
    },

    properties: {
        status: {
            deferredInit: true,
            check: ["fail", "good", "finished"],
            event: "changeState",
            apply: "_applyStatus"
        }
    },

    members: {
        _applyStatus(value){
            let icon;
            const width = this.getWidth();
            switch (value){
                case "good":
                    icon = `sentiment_satisfied_alt`;
                    break;
                case "fail":
                    icon = `sentiment_very_dissatisfied`;
                    break;
                case "finished":
                    icon = `sentiment_very_satisfied`;
                    break;
            }
            this.setIcon(`@MaterialIcons/${icon}/${width}`);
        }
    }
});