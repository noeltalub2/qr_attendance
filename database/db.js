var mysql = require("mysql2");

module.exports = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
    connectionLimit: process.env.CONN_LIMIT
});