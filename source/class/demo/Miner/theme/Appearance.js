/* ************************************************************************

   Copyright: 2023 Dmitrii Zolotov

   License: MIT license

   Authors: Dmitrii Zolotov (goldim) zolotovdy@yandex.ru

************************************************************************ */

qx.Theme.define("demo.Miner.theme.Appearance",
{
  extend : qx.theme.classic.Appearance,

  appearances :
  {
    square: {
      include: "button",
      alias: "button",
      style(states) {
        return {
          icon: demo.Miner.theme.Image.URLS[
            states.flagged
              ? "square-flagged"
              : states.questioned
                  ? "square-question"
                  : states.cleared
                    ? ""
                    : ""
          ],
          width: 32,
          height: 32
        }
      }
    },

    "square/icon": {
      style() {
        return {
          alignX: "center",
          scale: true,
          width: 16,
          height: 16
        };
      }
    },

    "state-button": {
      include: "button",
      alias: "button",

      style(states){
        return {
          icon: demo.Miner.theme.Image.URLS[
              states.start
                  ? "state-button-start"
                  : states.over
                      ? "state-button-over"
                      : "state-button-success"
              ]
        };
      }
    },

    "state-button/icon": {
      style() {
        return {
          alignX: "center",
          scale: true,
          width: 24,
          height: 24
        };
      }
    },

    "opened-square": {
      include: "atom",
      alias: "atom",

      style(states){
        let icon;
        if (states.mined){
          icon = demo.Miner.theme.Image.URLS["square-mined"]
        } else if (states.empty){
          icon = null
        }

        return {
          backgroundColor: states.blasted ? "red" : undefined,
          icon: icon,
          width: 32,
          height: 32
        };
      }
    },

    "opened-square/icon": {
      style(){
        return {
          alignX: "center",
          scale: true,
          width: 32,
          height: 32
        }
      }
    },

    "opened-square/label": {
      style(){
        return {
          textAlign: "center",
          font: "square-danger"
        }
      }
    }
  }
});