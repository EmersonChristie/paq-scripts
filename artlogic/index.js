const puppeteer = require("puppeteer");
const { artLogicUser, artLogicPwd } = require("../config.js");
const fs = require("fs");

const { convertCsv } = require("./helpers/index");

/**
 * Logs in to Artlogic Databse
 */
const login = async (page) => {
  console.log("Logging in to ArtLogic...");

  const userSelector = "f_username";
  const passSelector = "f_password";

  //   await page.waitForSelector(userSelector, { visible: true, timeout: 3000 });
  await page.type("#f_username", "emerson@patriciaqualls.com");

  //   await page.waitForSelector(passSelector, { visible: true, timeout: 3000 });
  await page.type("#f_password", "JoanMitchell");

  // click submit and wait for navigation
  await Promise.all([
    page.click("#login-submit"),
    page.waitForNavigation({ waitUntil: "networkidle0" }),
  ]).catch((err) => {
    console.log(err);
  });

  return page;
};

/**
 * @desc Updates the price of a piece of artwork based on the update funtion passed.
 * @param {function} updateFunc - the update function to be run against the current price
 * @param id
 */
const updatePrice = async (page, id, newPrice) => {
  //231
  const url = `https://app.artlogic.net/patriciaquallsgallery/records/artworks/edit/${id}/#financial`;

  await Promise.all([
    page.goto(url),
    page.waitForNavigation({
      waitUntil: "networkidle0",
    }),
  ]).catch((err) => {
    console.log(err);
  });

  const inputId = `#f_artworks-${id}-retail_price`;
  await page.waitForSelector(inputId, { timeout: 60000 });

  // Select the input element containing the retail price
  await page
    .$(inputId)
    .then(async (currPriceEl) => {
      await page.evaluate((x) => x.value, currPriceEl);

      return currPriceEl;
    })
    .then(async (currPriceEl) => {
      await currPriceEl.click({ clickCount: 3 });
    })
    .catch((err) => {
      console.log(err);
    });

  // console.log("Current Price: ", priceVal);
  // console.log("Updating Price to: ", newPrice);

  await Promise.all([page.type(inputId, newPrice)]).catch((err) => {
    console.log(err);
  });

  // const newPriceEl = await page.$(inputId);
  // Get Value of Element - Current price
  // let newPriceVal = await page.evaluate((x) => x.value, newPriceEl);

  // console.log("New Price Successfully Updated to: ", newPriceVal);
  // console.log("Saving page...");

  // await page
  //   .click("#aui-footer-content > button.aui-button-extra-round.es-save-button")
  //   .then(async () => {
  //     await console.log("Save Successful!");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  // await page.close();

  await Promise.all([
    page.click(
      "#aui-footer-content > button.aui-button-extra-round.es-save-button"
    ),
    page.waitForNavigation({ waitUntil: "networkidle0" }),
  ]).catch((err) => {
    console.log(err);
  });

  // await page.evaluate(element => { element.value = 7; }, element);
};

/**
 * Initialize function that pulls up Artlogic Login Page
 */
const init = async () => {
  const browser = await puppeteer.launch({
    executbalePath: "/Applications/Google Chrome.app",
    headless: false,
  });
  const page = await browser.newPage();
  //   const navigationPromise = page.waitForNavigation({
  //     waitUntil: "domcontentloaded",
  //   });

  await Promise.all([
    // Open all artworks that are marked as live on website
    page.goto("https://app.artlogic.net/patriciaquallsgallery/"),
    // wait for page to load
    // await navigationPromise,
  ]).catch((err) => {
    console.log(err);
  });

  //   // get Array of Art Objects from CSV file
  const csvPath =
    "/Users/emersonchristie/dev/paq/paq-scripts/static/prices.csv";

  const artArr = await convertCsv(csvPath);
  //   console.log(artArr);

  await login(page).then(async (page) => {
    // await updatePrice(page, "231", "2999");
    // await updatePrice(page, "231", "2999");
    // await updatePrice(page, "231", "2999");

    await artArr.forEach(async ({ id, title, oldPrice, newPrice }) => {
      await updatePrice(page, id, newPrice).catch((err) => {
        console.log(`Error with ID ${id}: `, err);
      });
    });
  });

  // await browser.close();
};

init();

module.exports = {
  login,
  init,
};
