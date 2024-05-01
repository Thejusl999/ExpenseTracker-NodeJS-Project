const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  process.env.MYSQL_DB_NAME,
  process.env.MYSQL_DB_USERNAME,
  process.env.MYSQL_DB_PASSWORD,
  {
    dialect: "mysql",
    host: process.env.MYSQL_DB_HOST,
  }
);
module.exports = sequelize;
