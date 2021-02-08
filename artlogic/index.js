const puppeteer = require("puppeteer");
const { artLogicUser, artLogicPwd } = require("../config.js");
const fs = require("fs");

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
