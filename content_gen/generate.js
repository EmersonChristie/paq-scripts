const sizeOf = require("image-size");
const nodeHtmlToImage = require("node-html-to-image");
const fs = require("fs");
const sharp = require("sharp");

const { generateWeb, generateShadow } = require("./image");
const { generateCanvas } = require("./shadows/toImage");
const { convertCsv } = require("../artlogic/helpers/index");

// Constants
// const pathToTiffs = "./static/tiffs/";
const pathToJpegs = "./static/jpegs/";
const pathToOutput = "./static/output/";

const getOrienation = (width, height) => {
  const orientation = width > height ? "landscape" : "portrait";
  return orientation;
};

const getDims = (imgUri) => {
  return sizeOf(imgUri);
};

// extension should include the dot, for example '.html'
const changeExtension = (file, extension) => {
  const basename = path.basename(file, path.extname(file));
  return path.join(path.dirname(file), basename + extension);
};

const createLargeShadows = async (pathToTiffs, fileName) => {
  const tifPath = `${pathToTiffs}${fileName}.tif`;
  const jpegPath = `${pathToJpegs}${fileName}.jpg`;
  const outPutPath = `${pathToOutput}shadow-${fileName}.png`;

  const imgMeta = getDims(tifPath);

  // await sharp(tifPath)
  //   .jpeg({
  //     quality: 100,
  //     chromaSubsampling: "4:4:4",
  //   })
  //   .toFile(jpegPath)
  //   .then(async (info) => {
  //     console.log("info", info);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  let canvasWidth, canvasHeight;

  canvasWidth = imgMeta.width * 1.25;
  canvasHeight = imgMeta.height * 1.25;

  const image = fs.readFileSync(jpegPath);
  const base64Image = new Buffer.from(image).toString("base64");
  const dataURI = "data:image/jpeg;base64," + base64Image;

  try {
    await generateCanvas(outPutPath, false, canvasWidth, canvasHeight, dataURI);
  } catch (err) {
    console.log(err);
  }
};

const path =
  "/Users/patriciaqualls/Desktop/Emerson/Art Images/Named TIFFs Artwork";

// const path = "/Users/patriciaqualls/Desktop/Emerson/Art Images/test";

fs.readdirSync(path).forEach(async (file) => {
  const fileName = file.split(".tif")[0];
  // console.log("Generating Shadow for: ", fileName);

  await createLargeShadows(`${path}/`, fileName);
});
