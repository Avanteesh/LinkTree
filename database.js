const {config} = require("dotenv");
const mysql = require("mysql2");

config();

const database = mysql.createPool({
  user: process.env.user,
  password: process.env.passwd,
  host: process.env.host,
  database: process.env.database
}).promise();


async function execute(_query) {
  const result = await database.query(_query).then((res) => {
    return res.at(0);
  }).catch((error) => {
    return error.message    
  });
  return result;
}


module.exports = {execute};
