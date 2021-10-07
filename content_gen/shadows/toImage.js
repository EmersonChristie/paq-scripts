const nodeHtmlToImage = require("node-html-to-image");
const fs = require("fs");
const BezierEasing = require("bezier-easing");

/**
 * Returns a string of box shadows sepereated based on user input
 * @param {Number} numShadowLayers - the number of layers for the shadow
 * @param {Object} options - optional parameters for angle, blur, spread, and transparency
 */
const getBoxShadows = (numShadowLayers, options = {}) => {
  const {
    angle = 40,
    length = 150,
    finalBlur = 100,
    spread = 0,
    finalTransparency = 0.2,
  } = options;

  const angleToRadians = (angle) => {
    return angle * (Math.PI / 180);
  };

  const fixed = (num, precision = 1) =>
    parseFloat(num.toFixed(precision), 10).toString();

  const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

  // prettier-ignore
  const shadow = (left, top, blur, spread, color) =>
  `${left}px ${top}px ${blur}px ${spread}px ${color}`

  let alphaEasingValue = [0.1, 0.5, 0.9, 0.5];
  let offsetEasingValue = [0.7, 0.1, 0.9, 0.3];
  let blurEasingValue = [0.7, 0.1, 0.9, 0.3];

  const alphaEasing = BezierEasing(...alphaEasingValue);
  const offsetEasing = BezierEasing(...offsetEasingValue);
  const blurEasing = BezierEasing(...blurEasingValue);

  let easedAlphaValues = [];
  let easedOffsetValues = [];
  let easedBlurValues = [];

  for (let i = 1; i <= numShadowLayers; i++) {
    const fraction = i / numShadowLayers;

    easedAlphaValues.push(alphaEasing(fraction));

    easedOffsetValues.push(offsetEasing(fraction));
    easedBlurValues.push(blurEasing(fraction));
  }
  let boxShadowValues = [];
  for (let i = 0; i < numShadowLayers; i++) {
    // Reverse SIN and COS for x & y points to measure angle off the bottom of positive x axis
    let yOffset =
      easedOffsetValues[i] * Math.cos(angleToRadians(angle)) * length;
    let xOffset =
      easedOffsetValues[i] * Math.sin(angleToRadians(angle)) * length;

    boxShadowValues.push([
      xOffset,
      yOffset,
      easedBlurValues[i] * finalBlur,
      spread,
      easedAlphaValues[i] * finalTransparency,
    ]);
  }
  /* offset-x | offset-y | blur-radius | spread-radius | color */
  const shadowString = boxShadowValues
    .map(([leftOffset, topOffset, blur, spread, alpha]) =>
      shadow(leftOffset, topOffset, blur, spread, rgba(0, 0, 0, alpha))
    )
    .join(",\n");

  return shadowString;
};

// console.log(getBoxShadows(7));

/**
 * A function with predefined options for artwork dropshadow
 * @param {Number} layers - number of shadow layers
 * @returns {String} - The string version of the box shadow css
 */
const generateArtShadows = (layers) => {
  const opts = {
    longShadow: {
      angle: 40,
      length: 275, // length x width / 60
      finalBlur: 105,
      finalTransparency: 0.2,
    },
    shortShadow: {
      angle: 35,
      length: 200,
      finalBlur: 75,
      finalTransparency: 0.17,
    },
    upperShadow: {
      angle: -62,
      length: -250,
      finalBlur: 75,
      finalTransparency: 0.17,
    },
  };

  let shadows =
    getBoxShadows(layers, opts.longShadow) +
    ",\n" +
    getBoxShadows(layers, opts.shortShadow) +
    ",\n" +
    getBoxShadows(layers, opts.upperShadow);

  return shadows;
};

/**
 * Generate canvas
 * @param {String} outFile
 * @param {Boolean} withText
 * @param {Number} canvasWidth
 * @param {Number} canvasHeight
 */
const generateCanvas = (
  outFile,
  withText,
  canvasWidth,
  canvasHeight,
  artwork
) => {
  const maxImgHeight = 0.75 * canvasHeight;
  const maxImgWidth = 0.75 * canvasWidth;

  const { artist, title, dimensions, imageSource } = artwork;

  const backgroundColor = "rgba(0, 0, 0, 0)";
  const noTextHtml = `
  <div id="container">
    <img id="artwork" src="{{imageSource}}" />
  </div>`;

  const textHtml = `
    <div id="container">
    <div id="text-container">
      <h3 id="artist">{{artist}}</h3>
      <h2 id="title">{{title}}</h2>
      <h3 id="dimensions">{{dimensions}}
    </div>
    <div id="art-container">

    <img id="artwork" src="{{imageSource}}" />
    </div>
    </div> 
`;

  const textStyle = `
    body {
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
    }  
  #container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: {{backgroundColor}};
      }
      h3 {
        font-size: 100px;
      }
      h2 {
        font-size: 125px;
      }
      #art-container {
        width: 50%;
      }
      #text-container {
        width: 50%;
        text-align: right;
        color: gray;
        justify-content: center;
      }
      #artwork {
          max-width: 75%;
          max-height: 75%;

          box-shadow: ${generateArtShadows(7)}
      }`;

  const noTextStyle = `
    #container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: {{backgroundColor}};
      }
      #artwork {
          max-width: 75%;
          max-height: 75%;

          box-shadow: ${generateArtShadows(7)}
      }`;

  const html = {
    style: withText ? textStyle : noTextStyle,
    body: withText ? textHtml : noTextHtml,
  };

  const htmlContainer = `<html>
    <style>
    body {
        width: {{canvasWidth}};
        height: {{canvasHeight}};
    }
    ${html.style}

    </style>
    <body>
      ${html.body}
    </body>
  </html>`;

  nodeHtmlToImage({
    output: outFile,
    html: htmlContainer,
    content: {
      imageSource: imageSource,
      canvasWidth,
      canvasHeight,
      maxImgHeight,
      maxImgWidth,
      backgroundColor,
      artist,
      title,
      dimensions,
    },
  });
};

module.exports = {
  generateCanvas,
  generateArtShadows,
};
