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

const getDashboard = (req, res) => {
	res.render("dashboard");
};

const getStudent = async (req, res) => {
	const student_record = await zeroParam("SELECT * FROM student");
	res.render("student", { student_record });
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
	const attendance_record = await zeroParam("SELECT * FROM attendance");
	res.render("attendance", { attendance_record });
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
		const exist_event_date = (
			await zeroParam(
				`SELECT count(*) as 'count' FROM event_list WHERE event_date = '${event_date}'`
			)
		)[0].count;

		if (exist_event_date) {
			req.flash("error_msg", "Event date is currently exist.");
			res.redirect("/event_new");
		} else {
			var data = {
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

module.exports = {
	getDashboard,
	getStudent,
	getStudentView,
	deleteStudent,
	getAttendance,
	getEvent,
	getEventNew,
	postEventNew,
};
