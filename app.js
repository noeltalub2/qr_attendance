const https = require("https")
const fs = require("fs")
const express = require("express");
const bodyParser = require("body-parser");
const { response } = require("express");
const flash = require("connect-flash");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser")

const app = express();
const dotenv = require("dotenv").config();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
	cookieSession({
		name: "session",
		keys: [process.env.SESSION_SECRET],
		cookie: {
			secure: true,
			httpOnly: true,
		},
	})
);

app.use(flash());

// Global variables
app.use((req, res, next) => {
	res.locals.success_msg = req.flash("success_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");
	next();
});

// parse application/json
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

const db = require("./database/db.js");

//Routes
const home = require("./routes/home");
const qrcode = require("./routes/qrcode");
const admin = require("./routes/admin");

db.getConnection((err, connection) => {
	if (err) throw err;
	console.log("Database connected successfully");
	connection.release();
});

app.use("/",qrcode)
app.use("/", admin);
app.use("/", home);

https
  .createServer(
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    app
  )
  .listen(3000, () => {
	console.log("Server listening on port 3000");
  });