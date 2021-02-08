// config.js
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  artLogicUser: process.env.ARTLOGIC_USERNAME,
  artLogicPwd: process.env.ARTLOGIC_PWD,
};
