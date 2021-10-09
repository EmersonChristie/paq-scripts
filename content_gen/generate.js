const sizeOf = require("image-size");
const nodeHtmlToImage = require("node-html-to-image");
const fs = require("fs");
const sharp = require("sharp");

const { generateWeb, generateShadow } = require("./image");
const { generateCanvas } = require("./shadows/toImage");
const { convertCsv } = require("../artlogic/helpers/index");
const { info } = require("console");

// Constants
// const pathToTiffs = "./static/tiffs/";
const pathToJpegs = "./static/jpegs/";
const pathToOutput = "./static/output/";

const randomInt = (min, max) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const getOrienation = (width, height) => {
  const orientation = width > height ? "landscape" : "portrait";
  return orientation;
};

const getDims = (imgUri) => {
  return sizeOf(imgUri);
};

const changeExtension = (file, extension) => {
  const basename = path.basename(file, path.extname(file));
  return path.join(path.dirname(file), basename + extension);
};

// Make sure image is less than max bytes. If not,
// resize to percentage difference between maxBytes and size of image
const checkSize = async (imgInfo) => {
  const { width, height, size, jpegPath } = imgInfo;
  const maxBytes = 38000000;

  if (size >= maxBytes) {
    const newWidth = parseInt(width * (maxBytes / size));
    const newHeight = parseInt(height * (maxBytes / size));

    const appendString = randomInt(1, 10).toString() + ".jpg";
    const noExtPath = jpegPath.split(".jpg")[0];
    const newPath = noExtPath + appendString;

    console.log("Old Path ", jpegPath);
    console.log("NEW Path ", newPath);

    return await sharp(jpegPath)
      .resize(newWidth, newHeight, { fit: "inside" })
      .jpeg({
        quality: 100,
        chromaSubsampling: "4:4:4",
      })
      .toFile(newPath)
      .then(async (info) => {
        info.jpegPath = newPath;

        console.log("Old Image Info: /n", imgInfo);
        console.log("New Image Info: /n", info);

        return await checkSize(info);
      })
      .catch((err) => console.log(err));
  } else {
    console.log("Size is Good: /n", imgInfo);

    return imgInfo;
  }
};

const makeJpeg = async (tifPath, jpegPath) => {
  return await sharp(tifPath)
    .jpeg({
      quality: 100,
      chromaSubsampling: "4:4:4",
    })
    .toFile(jpegPath)
    .then(async (info) => {
      // console.log("info", info);
      info.jpegPath = jpegPath;
      const meta = await checkSize(info);
      return meta;
    })
    .catch((err) => {
      console.log(err);
    });
};

const createLargeShadows = async (pathToTiffs, fileName) => {
  const tifPath = `${pathToTiffs}${fileName}.tif`;
  const jpegPath = `${pathToJpegs}${fileName}.jpg`;
  const outPutPath = `${pathToOutput}shadow-${fileName}.png`;

  const imgMeta = await makeJpeg(tifPath, jpegPath);

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

const runner = async (artPath, fileName) => {
  return await createLargeShadows(artPath, fileName);
};

// const path =
//   "/Users/patriciaqualls/Desktop/Emerson/Art Images/Named TIFFs Artwork";

const path = "/Users/patriciaqualls/Desktop/Emerson/Art Images/test";

fs.readdirSync(path).forEach(async (file) => {
  const fileName = file.split(".tif")[0];
  // console.log("Generating Shadow for: ", fileName);

  const artPath = `${path}/`;

  if (fileName != ".DS_Store") {
    return new Promise(function (resolve) {
      // runner(artPath, fileName);

      setTimeout(runner, 60000, artPath, fileName);
    }).catch((err) => console.log(err));
  }
});
