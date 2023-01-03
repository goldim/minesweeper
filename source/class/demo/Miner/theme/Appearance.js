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
    "status-bar": {
      style() {
        return {
          decorator: "status-bar-bordered",
          padding: 5,
          marginBottom: 10
        }
      }
    },

    "board": {
      style() {
        return {
          decorator: "status-bar-bordered"
        }
      }
    },

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

    "status-label": {
      include: "atom",
      alias: "atom",
      style(){
        return {
          decorator: "status-label-bordered",
          font: "square-danger",
          textColor: "red",
          paddingRight: 5,
          paddingLeft: 5,
          backgroundColor: "black"
        }
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
      style(states){
        let icon = null;
        if (states.mined){
          icon = demo.Miner.theme.Image.URLS["square-mined"]
        }
        let textColor = undefined;

        for (let i = 1; i < 9; i++){
          const color = `mines-around-${i}`;
          if (states[color]){
            textColor = color;
            break;
          }
        }

        return {
          textColor,
          backgroundColor: states.blasted? "red": undefined,
          icon,
          width: 32,
          height: 32,
          alignX: "center",
        };
      }
    },

    "opened-square/icon": {
      style(){
        return {
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
          font: "square-danger",
          width: 32,
          height: 32
        }
      }
    }
  }
});