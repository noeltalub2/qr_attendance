const bcrypt = require("bcrypt");
const { createTokensAdmin } = require("../utils/token");
const { time, date, convertTime } = require("../utils/timestamp");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

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

const getLogin = (req, res) => {
	res.render("login");
};

const postLogin = (req, res) => {
	try {
		const { username, password } = req.body;
		const findUser = "SELECT * from admin WHERE username = ?";
		db.query(findUser, [username], async (err, result) => {
			if (err) {
				req.flash("error_msg", "Authentication failed.");
				res.redirect("/login");
			} else {
				if (result.length > 0) {
					const match_password = await bcrypt.compare(
						password,
						result[0].password
					);
					if (match_password) {
						const generateToken = createTokensAdmin(
							result[0].username
						);
						res.cookie("token", generateToken, { httpOnly: true });
						res.redirect("/dashboard");
					} else {
						req.flash(
							"error_msg",
							"Incorrect username or password"
						);
						res.redirect("/login");
					}
				} else {
					req.flash("error_msg", "Could'nt find your account");
					res.redirect("/login");
				}
			}
		});
	} catch {
		throw err;
	}
};

const getDashboard = async (req, res) => {
	var attendance_count = (
		await queryParam(
			"SELECT count(*) as 'count' FROM attendance WHERE log_date = ?",
			[date()]
		)
	)[0].count;
	var student_count = (
		await zeroParam("SELECT count(*) as 'count' FROM student")
	)[0].count;
	var degree_count = (
		await zeroParam(
			"SELECT COUNT(DISTINCT degree) as 'count' FROM `student`"
		)
	)[0].count;
	var section_count = (
		await zeroParam(
			"SELECT COUNT(DISTINCT year_section) as 'count' FROM `student`"
		)
	)[0].count;

	var recent_new_user = await zeroParam(
		"SELECT * FROM `student` ORDER BY `id` DESC LIMIT 5"
	);
	var recent_attendance = await zeroParam(
		"SELECT student_id,event_code,status,log_date FROM `attendance` ORDER BY `logs` DESC, `log_date` DESC LIMIT 5"
	);

	res.render("dashboard", {
		attendance_count,
		student_count,
		degree_count,
		section_count,
		recent_new_user,
		recent_attendance,
	});
};

const getStudent = async (req, res) => {
	res.render("student");
};

const postAllStudent = async (req, res) => {
	const student_record = await zeroParam("SELECT * FROM student");
	var resultData = [];

	student_record.forEach((data) => {
		resultData.push({
			student_id: data.student_id,
			name: data.name,
			degree: data.degree,
			year_section: data.year_section,
		});
	});

	res.json({ data: resultData });
};
const getStudentEdit = async (req, res) => {
	const student_id = req.params.student_id;
	var student_record = (
		await queryParam("SELECT * FROM student WHERE student_id = ?", [
			student_id,
		])
	)[0];
	res.render("student_edit", { student_record });
};

const postStudentEdit = async (req, res) => {
	const { student_id, name, degree, year_section } = req.body;
	var data = {
		name: name,
		degree: degree,
		year_section: year_section,
	};
	var sql = "UPDATE student SET ? WHERE student_id = ?";
	//Add account to database
	db.query(sql, [data, student_id], (err, rset) => {
		if (err) {
			req.flash("error_msg", "Error updating event");
			res.redirect("/student");
		} else {
			req.flash("success_msg", "Successfully edited student");
			res.redirect("/student");
		}
	});
};

const getStudentView = async (req, res) => {
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
};

const deleteStudent = async (req, res) => {
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
};

const getAttendance = async (req, res) => {
	res.render("attendance");
};
const postAllAttendance = async (req, res) => {
	const attendance = await zeroParam("SELECT * FROM attendance");
	var resultData = [];

	attendance.forEach((data) => {
		resultData.push({
			attendance_id: data.attendance_id,
			event_code: data.event_code,
			student_id: data.student_id,
			time_in_am: data.time_in_am,
			time_out_am: data.time_out_am,
			time_in_pm: data.time_in_pm,
			time_out_pm: data.time_out_pm,
			log_date: data.log_date,
		});
	});

	res.json({ data: resultData });
};

const getEvent = async (req, res) => {
	const event_record = await zeroParam("SELECT * FROM event_list");

	res.render("event", { event_record, date: date() });
};

const getEventNew = async (req, res) => {
	res.render("event_new");
};

const postEventNew = async (req, res) => {
	const {
		event_code,
		event_name,
		event_date,
		attendance_type,
		time_in_am_start,
		time_in_am_end,
		time_out_am_start,
		time_out_am_end,
		time_in_pm_start,
		time_in_pm_end,
		time_out_pm_start,
		time_out_pm_end,
	} = req.body;

	let errors = [];
	try {
		const exist_event_code = (
			await zeroParam(
				`SELECT count(event_code) as 'count' FROM event_list WHERE event_code = '${event_code}'`
			)
		)[0].count;

		const exist_event_date = (
			await zeroParam(
				`SELECT count(event_date) as 'count' FROM event_list WHERE event_date = '${event_date}'`
			)
		)[0].count;

		if (exist_event_code > 0) {
			errors.push({
				msg: `Event code ${event_code} is already registered`,
			});
		}
		if (exist_event_date > 0) {
			errors.push({
				msg: `Event date ${event_date} is already registered`,
			});
		}

		if (exist_event_code || exist_event_date) {
			res.render("event_new", { errors });
		} else {
			var data = {
				event_code: event_code,
				event_name: event_name,
				event_date: event_date,
				attendance_type: attendance_type,
				time_in_am_start: convertTime(time_in_am_start),
				time_in_am_end: convertTime(time_in_am_end),
				time_out_am_start: convertTime(time_out_am_start),
				time_out_am_end: convertTime(time_out_am_end),
				time_in_pm_start: convertTime(time_in_pm_start),
				time_in_pm_end: convertTime(time_in_pm_end),
				time_out_pm_start: convertTime(time_out_pm_start),
				time_out_pm_end: convertTime(time_out_pm_end),
			};

			db.query("INSERT INTO event_list SET ?", data, (err, result) => {
				if (err) {
					req.flash("error_msg", "Event date is currently created.");
					res.redirect("/event_new");
				} else {
					req.flash("success_msg", "Successfully created event");
					res.redirect("/event");
				}
			});
		}
	} catch (err) {
		throw err;
	}
};

const getEventView = async (req, res) => {
	const event_code = req.params.event_code;
	const event_record = (
		await queryParam("SELECT * FROM event_list WHERE event_code = ?", [
			event_code,
		])
	)[0];
	const degree = await zeroParam(
		"SELECT degree,year_section FROM `student` GROUP BY degree,year_section ORDER BY year_section ASC"
	);
	const attendance_record = await zeroParam(
		`SELECT a.student_id,s.name,s.degree,a.time_in_am,a.time_out_am,a.time_in_pm,a.time_out_pm FROM attendance AS a INNER JOIN student AS s ON s.student_id = a.student_id INNER JOIN event_list AS e ON e.event_code = a.event_code WHERE a.event_code = '${event_code}';`
	);

	res.render("event_view", {
		event_record,
		attendance_record,
		degree,
		event_code,
	});
};

const getEventEdit = async (req, res) => {
	const event_code = req.params.event_code;
	const event_record = (
		await queryParam("SELECT * FROM event_list WHERE event_code = ?", [
			event_code,
		])
	)[0];

	res.render("event_edit", { event_record });
};

const postEventEdit = async (req, res) => {
	const {
		event_code,
		event_name,
		event_date,
		attendance_type,
		time_in_am_start,
		time_in_am_end,
		time_out_am_start,
		time_out_am_end,
		time_in_pm_start,
		time_in_pm_end,
		time_out_pm_start,
		time_out_pm_end,
	} = req.body;

	var time_in_am_s = convertTime(time_in_am_start);
	var time_in_am_e = convertTime(time_in_am_end);
	var time_out_am_s = convertTime(time_out_am_start);
	var time_out_am_e = convertTime(time_out_am_end);
	var time_in_pm_s = convertTime(time_in_pm_start);
	var time_in_pm_e = convertTime(time_in_pm_end);
	var time_out_pm_s = convertTime(time_out_pm_start);
	var time_out_pm_e = convertTime(time_out_pm_end);
	db.query(
		"UPDATE event_list SET event_name=?,attendance_type=?,time_in_am_start=?,time_in_am_end=?,time_out_am_start=?,time_out_am_end=?,time_in_pm_start=?,time_in_pm_end=?,time_out_pm_start=?,time_out_pm_end=?  WHERE event_code = ?",
		[
			event_name,
			attendance_type,
			time_in_am_s,
			time_in_am_e,
			time_out_am_s,
			time_out_am_e,
			time_in_pm_s,
			time_in_pm_e,
			time_out_pm_s,
			time_out_pm_e,
			event_code,
		],
		(err, result) => {
			if (err) {
				req.flash("error_msg", "Error updating event");

				res.redirect("/event");
			} else {
				req.flash("success_msg", "Successfully edited event");
				res.redirect("/event");
			}
		}
	);
};

const deleteEvent = async (req, res) => {
	const event_code = req.body.data;
	try {
		const event = (
			await queryParam("DELETE FROM event_list WHERE event_code = ?", [
				event_code,
			])
		)[0];
		res.status(200).json({ status: "success" });
	} catch (err) {
		throw err;
	}
};

const getStudentNew = async (req, res) => {
	res.render("student_new");
};

const postStudentExist = async (req, res) => {
	const student_id = req.body.student_id;
	console.log(student_id)
	const exist_student = (
		await zeroParam(
			`SELECT count(*) as 'count' FROM student WHERE student_id = '${student_id}'`
		)
	)[0].count;

	if (exist_student) {
		res.status(200).json({ status: "success" });
	} else {
		res.status(200).json({ status: "error" });
	}
};
const postStudentUpload = async (req, res) => {
	const { student_id, name, degree, year_section } = req.body;

	var data = {
		student_id: student_id,
		name: name,
		degree: degree,
		year_section: year_section,
	};
	try {
		const exist_student = (
			await zeroParam(
				`SELECT count(*) as 'count' FROM student WHERE student_id = '${student_id}'`
			)
		)[0].count;

		if (exist_student) {
			req.flash("error_msg", `${student_id} is already registered.`);
			res.redirect("/student_new");
		} else {
			db.query("INSERT INTO student SET ?", data, (err, results) => {
				if (err) {
					console.log(err);
				} else {
					req.flash(
						"success_msg",
						`Student successfully registered.`
					);
					res.redirect("/student_new");
				}
			});
		}
	} catch (err) {
		throw err;
	}
};

const postExcelUpload = async (req, res) => {
	if (req.fileValidationError) {
		req.flash("error_msg", `${req.fileValidationError}`);
		return res.redirect("/student_new");
	}

	var filePath = importExcelData2MySQL(
		`public/document/${req.file.filename}`
	);

	// -> Import Excel Data to MySQL database
	function importExcelData2MySQL(filePath) {
		// File path.
		readXlsxFile(filePath).then((rows) => {
			// `rows` is an array of rows
			// each row being an array of cells.

			// Remove Header ROW
			rows.shift();
			// Open the MySQL connection

			let query =
				"INSERT INTO student (student_id, name, degree, year_section) VALUES ?";
			db.query(query, [rows], (error, response) => {
				if (error) {
					req.flash("error_msg", `Inserting Data ${error}`);
					res.redirect("/student_new");
				} else {
					req.flash("success_msg", "Successfully Uploaded Data");
					res.redirect("/student_new");
				}
				fs.unlink(filePath, (err) => {
					if (err) {
						console.log(err);
					} else {
						console.log("DELETED");
					}
				});
			});
		});
	}
};

const getSettings = (req, res) => {
	res.render("settings");
};

const changePassword = async (req, res) => {
	const { newPassword, oldPassword } = req.body;
	try {
		const password = (
			await queryParam("SELECT password FROM admin WHERE username = ?", [
				res.locals.sid,
			])
		)[0].password;

		const match_password = await bcrypt.compare(oldPassword, password);

		if (match_password) {
			const salt = bcrypt.genSaltSync(12);
			const hash = bcrypt.hashSync(newPassword, salt);

			const update_password = await zeroParam(
				`UPDATE admin SET password = '${hash}' WHERE username = '${res.locals.sid}'`
			);
			req.flash("success_msg", `Successfully changed password`);
			res.redirect("/settings");
		} else {
			req.flash("error", `Invalid Password. Try Again`);
			res.redirect("/settings");
		}
	} catch (e) {
		console.log(e);
	}
};

const delDatabase = (req, res) => {
	try {
		const del_password = req.body.password;

		const findUser = `SELECT * from admin WHERE username = ?`;
		db.query(findUser, [res.locals.sid], async (err, result) => {
			if (err) {
				req.flash("error_msg", "Authentication failed.");
				res.redirect("/login");
			} else {
				if (result.length > 0) {
					const match_password = await bcrypt.compare(
						del_password,
						result[0].password
					);
					if (match_password) {
						res.status(200).json({ status: "success" });
					} else {
						res.status(200).json({ status: "error" });
					}
				}
			}
		});
	} catch (e) {
		console.log(e);
	}
};
const getLogout = (req, res) => {
	res.clearCookie("token");
	res.redirect("/login");
};
module.exports = {
	getLogin,
	postLogin,
	getDashboard,
	getStudent,
	postAllStudent,
	getStudentView,
	getStudentEdit,
	postStudentEdit,
	getStudentNew,
	deleteStudent,
	getAttendance,
	postAllAttendance,
	getEvent,
	getEventNew,
	postEventNew,
	getEventView,
	getEventEdit,
	postEventEdit,
	deleteEvent,
	postStudentUpload,
	postStudentExist,
	postExcelUpload,
	getSettings,
	changePassword,
	delDatabase,
	getLogout,
};
