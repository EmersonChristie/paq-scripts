// image.js
// module for manipulating and creating images for marketing content
const sharp = require("sharp");
const fs = require("fs");

module.exports = {
  generateShadow: (
    inFile,
    outFile,
    canvasWidth,
    canvasHeight,
    mimeType,
    transparent
  ) => {
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const context = canvas.getContext("2d");

    const maxImgHeight = 0.75 * canvasHeight;
    const maxImgWidth = 0.75 * canvasWidth;

    if (!transparent) {
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    loadImage(inFile).then((image) => {
      image.onLoad = () => {
        image.style["boxShadow"] = "2px 4px 4px black";
      };

      let dx, dy, dWidth, dHeight;
      if (
        image.height > image.width ||
        Math.abs(image.width - image.height) < 0.1 * canvasHeight
      ) {
        dHeight = maxImgHeight;
        dWidth = (dHeight * image.width) / image.height;
      } else {
        dWidth = maxImgWidth;
        dHeight = (dWidth * image.height) / image.width;
      }
      dx = (canvasWidth - dWidth) / 2;
      dy = (canvasHeight - dHeight) / 2;

      // drawImage(image, dx, dy, dWidth, dHeight)
      context.drawImage(image, dx, dy, dWidth, dHeight);
      const buffer = canvas.toBuffer(
        `image/${mimeType === "jpg" || mimeType === "jpeg" ? "jpeg" : mimeType}`
      );
      fs.writeFileSync(`./static/output/${outFile}.${mimeType}`, buffer);
    });
  },

  /**
   * Generate Web Images
   * @param {*} fileName
   * @param {*} maxWidth
   * @param {*} maxHeight
   */
  generateWeb: (fileName, maxWidth, maxHeight) => {
    sharp(fileName)
      .resize(maxWidth, maxHeight, { fit: "inside" })
      .toColorspace("srgb")
      .jpeg()
      .toFile("output.jpg", (err) => {
        console.log(err);
      });
  },
  
};
