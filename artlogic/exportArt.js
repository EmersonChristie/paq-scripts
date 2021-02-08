const puppeteer = require("puppeteer");
const { artLogicUser, artLogicPwd } = require("../config.js");
const fs = require("fs");

const exportPath = "../../static/export.csv";

const login = async (page) => {
  await page.goto("https://app.artlogic.net/patriciaquallsgallery/");

  // Login to Artlogic
  await page.type("#f_username", artLogicUser);
  await page.type("#f_password", artLogicPwd);

  // click submit and wait for navigation
  await Promise.all([
    page.click("#login-submit"),
    page.waitForNavigation({ waitUntil: "networkidle0" }),
  ]);

  return page;
};

const openExportPage = async (page) => {
  //   await page.goto(
  //     "https://app.artlogic.net/patriciaquallsgallery/records/artworks/shared_to_website_artworks/"
  //   );

  await Promise.all([
    // Open all artworks that are marked as live on website
    page.goto(
      "https://app.artlogic.net/patriciaquallsgallery/records/artworks/shared_to_website_artworks/"
    ),
    // wait for page to load
    page.waitForNavigation({ waitUntil: "networkidle0" }),
  ]);

  await page.click("#create-from-list");

  //   await page.screenshot({ path: "art-webs.png" });

  await page.waitForSelector("#export", { timeout: 60000 });

  // Initiate export of all artworks marked as live
  await Promise.all([page.click("#export"), page.waitFor(5000)]);
};
/**
 * Select te settings for exporting artlogic data
 * @param {*} page - the export page on ArtLogic
 */
const selectExportSettings = async (page, exportOptions) => {
  //   await page.click("#btn_save");

  //   // Export options holds the value of the fields we want to export
  //   await page.select("select#f_previously_saved", exportOptions);
  //   //await page.waitFor(4000);
  //   await page.screenshot({ path: "settings.png" });

  //   await Promise.all([
  //     page.click("#aui-overlay-box-button-c228"),
  //     page.waitForNavigation({ waitUntil: "networkidle0" }),
  //     page.screenshot({ path: "settings2.png" }),
  //   ]);

  // enter name of file
  //   const d = new Date();
  //   const timestamp = d.getTime();
  //   const exportFile = `ArtLogic-Export-${timestamp}`;
  //   console.log("FIlename: ", exportFile);
  //   await page.waitFor(5000);
  //   await page.type("#f_filename", exportFile, { delay: 100 });

  // select option to save as csv
  await page.select("select#f_format", "csv");

  // set the download settings and initiate download of file
  await Promise.all([
    page._client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: "./src/lib/exports",
    }),
    page.click("#btn_export"),
    page.waitFor(10000),
  ]);
  await page.screenshot({ path: "settings4.png" });
};

/**
 * Convert the CSV export file to a JSON object
 * @param filePath - the path to the CSV file
 * @returns a JSON array with all the artwork objects
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

const camelize = (str) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
};

/**
 * Cleans the data converted from CSV to json so that it is a valid json
 * object with camelCase keys, ready to be mapped to an Art Model.
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
/**
 * Download Excel file with data for all artworks that are marked as live on ArtLogic
 */
const getArt = async () => {
  //   console.log("Fetching art from ArtLogic...");
  //   const browser = await puppeteer.launch();
  //   const page = await browser.newPage();

  //   // Login to ArtLogic
  //   const homePage = await login(page);

  //   // Get Artworks that are marked as live on website
  //   await openExportPage(homePage, browser);
  //   const pages = await browser.pages(); // get all open pages by the browser
  //   const exportPage = pages[pages.length - 1]; // the popup should be the last page opened

  //   // await exportPage.screenshot({ path: "exportPage.png" });
  //   const exportOptions = `{"returnChar": "\n", "format": "", "viewHeadingRows": "2", "tablename": "artworks", "filename": "carmel-gallery-july-16", "foundSetOnly": "1", "selectedFields": "id,stock_number,artist,title,year,medium,dimensions,series,availability,location,main_image_url_small,main_image_url_medium,main_image_url_large,retail_price,display_price_ex_tax,photography_status_value"}`;
  //   // init export settings
  //   await selectExportSettings(exportPage, exportOptions);

  // Convert export file to JSON object
  const csvArt = await csvToJson(exportPath);
  const cleanData = await cleanCsv(csvArt);

  const artMap = await cleanData.map((art) => {
    const { height, width } = convertDimensions(art.dimensions);
    const arrayConvert = (terms) => {
      if (terms != "" && typeof terms != "undefined" && terms != null) {
        return terms.split(",");
      } else {
        return null;
      }
    };
    return {
      artlogicId: art.id,
      stockNumber: art.stocknumber,
      artist: art.artist || null,
      title: art.title || null,
      year: art.year || null,
      medium: art.medium || null,
      dimensions: art.dimensions || null,
      height: height,
      width: width,
      series: art.series || null,
      status: art.status || null,
      availability: art.availability || null,
      location: art.location || null,
      hasImage: parseInt(art.recordhasimage) || "0",
      imgSmall: art.mainimageurlsmall || null,
      imgMedium: art.mainimageurlmedium || null,
      imgLarge: art.mainimageurllarge || null,
      price: art.retailprice || null,
      formatPrice: art.displaypriceextax || null,
      searchTerms: arrayConvert(art.searchterms),
      createdOn: art.creationdate || null,
      lastSaved: art.lastsaved || null,
      lastSavedBy: art.lastsavedby || null,
    };
  });

  const path = "../../static/export.csv";
  await saveToFile(path, artMap).then(() => {});

  //   console.log("getArt -> csvArt", csvArt);

  // close browser
  //   await browser.close();
};

module.exports = {
  login,
  csvToJson,
  getArt,
};
