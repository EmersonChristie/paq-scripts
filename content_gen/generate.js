const sizeOf = require("image-size");
const nodeHtmlToImage = require("node-html-to-image");
const fs = require("fs");
const { generateWeb, generateShadow } = require("./image");
const { generateCanvas } = require("./shadows/toImage");
const pathToImages = "./static/art_images/";
const { convertCsv } = require("../artlogic/helpers/index");

const getOrienation = (width, height) => {
  const orientation = width > height ? "landscape" : "portrait";
  return orientation;
};

const getDims = (imgUri) => {
  return sizeOf(imgUri);
};

const generateLarge = (artWork) => {
  const imgMeta = getDims(artWork.path);
  console.log(
    "🚀 ~ file: generate.js ~ line 23 ~ generateLarge ~ imgMeta",
    imgMeta
  );

  const orientation = getOrienation(imgMeta.width, imgMeta.height);

  let canvasWidth, canvasHeight;

  // if (orientation === "landscape") {
  //   canvasWidth = imgMeta.width * 1.25;
  //   canvasHeight = canvasWidth * (9 / 16); // 16:9 aspect ratio
  // } else {
  //   canvasHeight = imgMeta.height * 1.25;
  //   canvasWidth = canvasHeight * (16 / 9); // 16:9 aspect ratio
  // }

  canvasWidth = imgMeta.width * 1.25;
  canvasHeight = imgMeta.height * 1.25;

  // generateCanvas("textTest.png", true, canvasWidth, canvasHeight, artWork);
  generateCanvas("ttt12.png", false, canvasWidth, canvasHeight, artWork);
};

const generateContent = (path, artWork) => {
  const image = fs.readFileSync(path);
  const base64Image = new Buffer.from(image).toString("base64");
  const dataURI = "data:image/jpeg;base64," + base64Image;

  const art = {
    ...artWork,
    path: path,
    imageSource: dataURI,
  };

  generateLarge(art);
};
const path = "./static/art_images/wide.jpg";

const artwork = {
  artist: "Emerson Christie",
  title: "Meet Me in My Dreams",
  dimensions: `40 x 40"`,
};

generateContent(path, artwork);
