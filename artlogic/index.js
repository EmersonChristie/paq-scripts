const puppeteer = require("puppeteer");
const { artLogicUser, artLogicPwd } = require("../config.js");
const fs = require("fs");

/**
 * Logs in to Artlogic Databse
 */
const login = async (page) => {
  console.log("Logging in to ArtLogic...");

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

/**
 * @desc Updates the price of a piece of artwork based on the update funtion passed.
 * @param {function} updateFunc - the update function to be run against the current price
 * @param id
 */

/**
 * Initialize function that pulls up Artlogic Login Page
 */
const init = async () => {
  const browser = await puppeteer.launch();
  const newpage = await browser.newPage();
  const page = newpage.goto("https://app.artlogic.net/patriciaquallsgallery/");

  return page;
};

module.exports = {
  login,
  init,
};
