const { describe } = require("yargs");
const { login, init } = require("./index");

// 1. Login to Artlogic
describe("Artlogic Service", () => {
  describe("Login", () => {
    beforeAll(async () => {
      await page.goto("https://app.artlogic.net/patriciaquallsgallery/");
    });
    it("Logs in to Artlogic database", async () => {
      await expect(page.title()).resolves.toMatch(
        "Artlogic Database | Patricia Qualls Gallery"
      );
    });
  });
});

// 2. Change art Price
describe("Artlogic Service -> Change Price of Art", () => {
  it("Changes the price of a given artwork based on argument", async () => {
    const updateFunction = (originalPrice) => {
      return originalPrice * 1.2;
    };
    await updatePrice();
  });
});
