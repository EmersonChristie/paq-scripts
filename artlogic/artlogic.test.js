const { login, init } = require("./index");

// 1. unit under test
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
