/**
 * Convert the CSV export file to a JSON object
 * @param {String} filePath - the path to the CSV file
 * @returns {Object Array} a JSON array with all the artwork objects
 */
const csvToJson = async (filePath) => {
  const csv = require("csvtojson");
  const converter = csv({
    ignoreEmpty: true,
    trim: true,
  });
  return csv()
    .fromFile(filePath)
    .then((artJson) => {
      //   console.log(artJson);
      return artJson;
    });
};

/**
 * @desc    Converts a string to Camel Case
 */
const camelize = (str) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
};

/**
 * @desc  Cleans the data converted from CSV to json so that it is a valid json
 *        object with camelCase keys, ready to be mapped to an Art Model.
 * @param csvArt - the invalid json object with spaces and /n in the keys
 */
const cleanCsv = (csvArt) => {
  // Function to remove non alphanumeric chars in some of the keys
  const transform = (str) => {
    let newstr = "";
    for (let i = 0; i < str.length; i++)
      if (!(str[i] == "\n" || str[i] == "\r" || str[i] == "(" || str[i] == ")"))
        newstr += camelize(str[i]);

    return newstr;
  };

  for (let i = 0; i < csvArt.length; i++) {
    const art = csvArt[i];
    for (key in art) {
      const val = csvArt[i][key];

      // delete the old key
      delete csvArt[i][key];

      // if the value is not empty assign val to new key name
      if (val != "") {
        const newKey = transform(key);
        csvArt[i][newKey] = val;
      }
    }
  }
  return csvArt;
};

/**
 * @desc  Saves a string to a file with given name
 */
const saveToFile = async (filename, json) => {
  let obj = {
    ...json,
  };
  const strObj = JSON.stringify(json);
  await fs.writeFile(
    filename,
    strObj,
    "utf8",
    function readFileCallback(err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log("File Successfully written");
      }
    }
  );
};

/**
 * @desc Cleans up the formatting of dimensions proeprty of the art object
 */
const convertDimensions = (dimensions) => {
  const inches = dimensions.split("\r\n")[0];
  const splitInches = inches.split(" x ");
  const height = splitInches[0];
  const width = splitInches[1].split(" ")[0];
  return {
    height,
    width,
  };
};

module.exports = {
  csvToJson,
  saveToFile,
};
