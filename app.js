const mysql = require("mysql2");
const express = require("express");
const bodyParser = require("body-parser");
const { response } = require("express");
const app = express();
const dotenv = require("dotenv").config();

const { time, date } = require("./public/js/timestamp");
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

const db = require("./database/db.js");

db.getConnection((err, connection) => {
	if (err) throw err;
	console.log("Database connected successfully");
	connection.release();
});

const queryParam = async (sql, data) => {
	try {
		return (await db.promise().query(sql, [data]))[0];
	} catch (err) {
		throw err;
	}
};

const zeroParam = async (sql) => {
	try {
		return (await db.promise().query(sql))[0];
	} catch (err) {
		throw err;
	}
};

app.get("/", (req, res) => {
	res.render("index");
});

app.get("/insert", (req, res) => {
	res.render("insert");
});

app.post("/insert", async (req, res) => {
	const studentArr = req.body.data;

	var data = {
		student_id: studentArr[0],
		name: studentArr[1],
		degree: studentArr[2],
		year_section: studentArr[3],
		created_date: date(),
	};
	try {
		const exist_student = (
			await zeroParam(
				`SELECT count(*) as 'count' FROM student WHERE student_id = '${studentArr[0]}'`
			)
		)[0].count;

		if (exist_student) {
			res.status(200).json({
				status: "error",
			});
		} else {
			db.query("INSERT INTO student SET ?", data, (err, results) => {
				if (err) {
					console.log(err);
				} else {
					res.status(200).json({
						status: "success",
					});
				}
			});
		}
	} catch (err) {
		throw err;
	}
});

app.post("/data", async (req, res) => {
	const attendance = await queryParam(
		`SELECT student_id,time_in,time_out FROM attendance WHERE log_date = '${date()}' ORDER BY logs DESC`
	);
	var resultData = [];

	attendance.forEach((data) => {
		resultData.push([data.student_id, data.time_in, data.time_out]);
	});

	res.json({ data: resultData });
});

app.post("/qrcode", async (req, res) => {
	const student_data = req.body.data;

	const studentArr = student_data.split(",");

	try {
		const todayAttendance = (
			await zeroParam(
				`SELECT count(*) as 'count',status FROM attendance WHERE student_id = '${
					studentArr[0]
				}' AND log_date = '${date()}'`
			)
		)[0];

		const exist_student = (
			await zeroParam(
				`SELECT count(*) as 'count' FROM student WHERE student_id = '${studentArr[0]}'`
			)
		)[0];

		const sql =
			"UPDATE attendance SET time_out=?,status=?,logs=? WHERE student_id = ?";

		var data = {
			student_id: studentArr[0],
			time_in: time(),
			log_date: date(),
			status: "1",
			logs: date() + " " + time(),
		};

		if (exist_student.count) {
			if (todayAttendance.count) {
				todayAttendance.status === "1"
					? db.query(
							sql,
							[time(), 2, date() + " " + time(), studentArr[0]],
							(err, results) => {
								if (err) {
									console.log(err);
								} else {
									res.status(200).json({
										attendance: 0,
										status: "Time out",
										shift: "morning",
										time: time(),
										studentArr,
									});
								}
							}
					  )
					: res.status(200).json({
							attendance: 1,
							studentArr,
					  });
			} else {
				db.query(
					"INSERT INTO attendance SET ?",
					data,
					(err, results) => {
						if (err) {
							console.log(err);
						} else {
							res.status(200).json({
								status: "Time in",
								shift: "morning",
								time: time(),
								studentArr,
							});
						}
					}
				);
			}
		} else {
			res.status(200).json({
				status: "Invalid",
			});
		}

		// insert QR code data into MySQL database
	} catch (err) {
		res.status(200).json({
			status: "Error",
		});
	}
});

app.get("/dashboard", (req, res) => {
	res.render("dashboard");
});

app.get("/student", async (req, res) => {
	const student_record = await zeroParam("SELECT * FROM student");
	res.render("student", { student_record });
});

app.get("/student/view/:student_id", async (req, res) => {
	const student_id = req.params.student_id;
	const student_record = (
		await queryParam("SELECT * FROM student WHERE student_id = ?", [
			student_id,
		])
	)[0];
	const attendance_record = await queryParam(
		"SELECT * FROM attendance WHERE student_id = ?",
		[student_id]
	);
	res.render("student_view", { student_record, attendance_record });
});

app.delete("/student/delete", async (req, res) => {
	const student_id = req.body.data;
	try {
		const student_record = (
			await queryParam("DELETE FROM student WHERE student_id = ?", [
				student_id,
			])
		)[0];
		res.status(200).json({ status: "success" });
	} catch (err) {
		throw err;
	}
});

app.get("/attendance", async (req, res) => {
	const attendance_record = await zeroParam("SELECT * FROM attendance");
	res.render("attendance", { attendance_record });
});

app.get("/event", async (req, res) => {
	res.render("event");
});

app.post("/event", async (req, res) => {
	const {
		event_name,
		event_date,
		attendance_type,
		time_in_am,
		time_in_am_limit,
		time_out_am,
		time_out_am_limit,
		time_in_pm,
		time_in_pm_limit,
		time_out_pm,
		time_out_pm_limit,
	} = req.body;

	var data = {
		event_name: event_name,
		event_date: event_date,
		attendance_type: attendance_type,
		time_in_am: time_in_am,
		time_in_am_limit: time_in_am_limit,
		time_out_am: time_out_am,
		time_out_am_limit: time_out_am_limit,
		time_in_pm: time_in_pm,
		time_in_pm_limit: time_in_pm_limit,
		time_out_pm: time_out_pm,
		time_out_pm_limit: time_out_pm_limit,

	};

	db.query("INSERT INTO event_list SET ?",data, (err,result) => {
		if (err) {
			console.log(err)
		} else {
			res.render("event_new")
		}
	})
});

app.listen(3000, () => {
	console.log("Server listening on port 3000");
});
