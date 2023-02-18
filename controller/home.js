const mysql = require("mysql2");
const { time, date, convertTime } = require("../utils/timestamp");
const db = require("../database/db");

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

const getHome = (req, res) => {
	res.render("index");
};
const postQrCode = async (req, res) => {
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
};
const getInsert = (req, res) => {
	res.render("insert");
};
const postInsert = async (req, res) => {
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
};
const postData = async (req, res) => {
	const attendance = await queryParam(
		`SELECT student_id,time_in,time_out FROM attendance WHERE log_date = '${date()}' ORDER BY logs DESC`
	);
	var resultData = [];

	attendance.forEach((data) => {
		resultData.push([data.student_id, data.time_in, data.time_out]);
	});

	res.json({ data: resultData });
};

module.exports = { getHome, postQrCode, getInsert, postInsert, postData };
