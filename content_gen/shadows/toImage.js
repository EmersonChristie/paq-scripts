const nodeHtmlToImage = require("node-html-to-image");
const fs = require("fs");
const BezierEasing = require("bezier-easing");
const { jpegVersion } = require("canvas");

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
const generateArtShadows = (layers, average) => {
  const opts = {
    longShadow: {
      angle: 40,
      length: 0.03759 * average, // length x width / 60
      // length: 175, // length x width / 60
      // finalBlur: 75,
      finalBlur: 0.015835 * average,
      finalTransparency: 0.09,
    },
    shortShadow: {
      angle: 35,
      length: 0.02614174 * average,
      finalBlur: 0.010524 * average,
      finalTransparency: 0.03,
    },
    upperShadow: {
      angle: -62,
      length: -0.024158 * average,
      finalBlur: 0.015825 * average,
      finalTransparency: 0.07,
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
const generateCanvas = async (
  outFile,
  withText,
  canvasWidth,
  canvasHeight,
  imageSource
) => {
  const maxImgHeight = 0.75 * canvasHeight;
  const maxImgWidth = 0.75 * canvasWidth;

  // used to calculate length of shadows
  const average = (maxImgWidth + maxImgHeight) / 2;

  // const { artist, title, dimensions, imageSource } = artwork;

  const html = {
    style: `
      #container {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        }
        #artwork {
            max-width: 75%;
            max-height: 75%;

            box-shadow: ${generateArtShadows(7, average)}
    }`,
    body: `
      <div id="container">
        <img id="artwork" src="{{imageSource}}" />
      </div>
    `,
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

  const puppeteer = {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--headless",
      "--no-zygote",
      "--disable-gpu",
    ],
    headless: true,
    ignoreHTTPSErrors: true,
  };

  try {
    await nodeHtmlToImage({
      output: outFile,
      html: htmlContainer,
      transparent: true,
      puppeteerArgs: puppeteer,
      waitUntil: "networkidle0",
      content: {
        imageSource: imageSource,
        canvasWidth,
        canvasHeight,
        maxImgHeight,
        maxImgWidth,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  generateCanvas,
  generateArtShadows,
};
