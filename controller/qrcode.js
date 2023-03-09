const { time, date} = require("../utils/timestamp");
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

const getHome = async (req, res) => {
	const todayEvent = (
		await zeroParam(
			`SELECT count(*) as 'count', event_name,event_code,attendance_type FROM event_list WHERE event_date = '${date()}'`
		)
	)[0];
	res.render("home", {todayEvent})
};

const postQrCodeWholeDay = async (req, res) => {
	const event_code = req.body.event_code;
	const student_data = req.body.data;
	const attendance_type = req.body.attendance_type;

	const studentArr = student_data.split(",");
	try {
		if (!event_code) {
			return res.status(200).json({
				status: "error",
				msg: "No Event",
			});
		}
		const attendance = (
			await zeroParam(
				`SELECT count(*) as 'count', time_in_am,time_out_am,time_in_pm,time_out_pm,status FROM attendance WHERE student_id = '${
					studentArr[0]
				}' AND log_date = '${date()}'`
			)
		)[0];

		const exist_student = (
			await zeroParam(
				`SELECT count(*) as 'count' FROM student WHERE student_id = '${studentArr[0]}'`
			)
		)[0].count;

		if (exist_student) {
			if (attendance_type === "1") {
				if (attendance.time_in_am) {
					res.status(200).json({
						status: "error",
						msg: "User Timed In (AM) Already",
					});
				} else {
					await zeroParam(
						`INSERT INTO attendance SET event_code='${event_code}',student_id='${
							studentArr[0]
						}',time_in_am='${time()}',log_date='${date()}',status='${attendance_type}',logs='${time()}'`
					);

					res.status(200).json({
						status: "success",

						student_id: studentArr[0],
						name: studentArr[1],
						activity: "TIME IN (AM)",
						timestamp: time(),
					});
				}
			} else if (attendance_type === "2") {
				if (attendance.count) {
					if (attendance.time_in_am) {
						if (attendance.time_out_am) {
							res.status(200).json({
								status: "error",
								msg: "User Timed Out (AM) Already",
							});
						} else {
							await zeroParam(
								`UPDATE attendance SET time_out_am='${time()}',status=${attendance_type},logs='${time()}' WHERE student_id = '${
									studentArr[0]
								}' AND event_code='${event_code}'`
							);

							res.status(200).json({
								status: "success",

								student_id: studentArr[0],
								name: studentArr[1],
								activity: "TIME OUT (AM)",
								timestamp: time(),
							});
						}
					} else {
						res.status(200).json({
							status: "error",
							msg: "Complete Time In (AM) first",
						});
					}
				} else {
					res.status(200).json({
						status: "error",
						msg: "You must time IN (AM) first",
					});
				}
			} else if (attendance_type === "3") {
				if (attendance.count) {
					if (attendance.time_in_am && attendance.time_out_am) {
						if (attendance.time_in_pm) {
							res.status(200).json({
								status: "error",
								msg: "User Timed In (PM) Already",
							});
						} else {
							await zeroParam(
								`UPDATE attendance SET time_in_pm='${time()}',status=${attendance_type},logs='${time()}' WHERE student_id = '${
									studentArr[0]
								}' AND event_code='${event_code}'`
							);

							res.status(200).json({
								status: "success",

								student_id: studentArr[0],
								name: studentArr[1],
								activity: "TIME IN (PM)",
								timestamp: time(),
							});
						}
					} else {
						res.status(200).json({
							status: "error",
							msg: "Complete the 2 attendance before proceeding",
						});
					}
				} else {
					res.status(200).json({
						status: "error",
						msg: "You must Time In (AM) first",
					});
				}
			} else if (attendance_type === "4") {
				if (attendance.count) {
					if (
						attendance.time_in_am &&
						attendance.time_out_am &&
						attendance.time_in_pm
					) {
						if (attendance.time_out_pm) {
							res.status(200).json({
								status: "error",
								msg: "User Timed Out (PM) Already",
							});
						} else {
							await zeroParam(
								`UPDATE attendance SET time_out_pm='${time()}',status=${attendance_type},logs='${time()}' WHERE student_id = '${
									studentArr[0]
								}' AND event_code='${event_code}'`
							);

							res.status(200).json({
								status: "success",

								student_id: studentArr[0],
								name: studentArr[1],
								activity: "TIME OUT (PM)",
								timestamp: time(),
							});
						}
					} else {
						res.status(200).json({
							status: "error",
							msg: "Complete the 3 attendance before proceeding",
						});
					}
				} else {
					res.status(200).json({
						status: "error",
						msg: "You must Time In (AM) first",
					});
				}
			} else {
				res.status(200).json({
					status: "error",
					msg: "Select Attendance Type Below",
				});
			}
		} else {
			res.status(200).json({
				status: "error",
				msg: "Student not exist in database",
			});
		}
		// insert QR code data into MySQL database
	} catch (err) {
		console.log(err);
		res.status(200).json({
			status: "error",
			msg: "Invalid QR Code",
		});
	}
};

const postQrCodeMorning = async (req, res) => {
	const event_code = req.body.event_code;
	const student_data = req.body.data;
	const attendance_type = req.body.attendance_type;

	const studentArr = student_data.split(",");
	try {
		if (!event_code) {
			return res.status(200).json({
				status: "error",
				msg: "No Event",
			});
		}
		const attendance = (
			await zeroParam(
				`SELECT count(*) as 'count', time_in_am,time_out_am FROM attendance WHERE student_id = '${
					studentArr[0]
				}' AND log_date = '${date()}'`
			)
		)[0];

		const exist_student = (
			await zeroParam(
				`SELECT count(*) as 'count' FROM student WHERE student_id = '${studentArr[0]}'`
			)
		)[0].count;

		if (exist_student) {
			if (attendance_type === "1") {
				if (attendance.time_in_am) {
					res.status(200).json({
						status: "error",
						msg: "User Timed In (AM) Already",
					});
				} else {
					await zeroParam(
						`INSERT INTO attendance SET event_code='${event_code}',student_id='${
							studentArr[0]
						}',time_in_am='${time()}',log_date='${date()}',status='${attendance_type}',logs='${time()}'`
					);

					res.status(200).json({
						status: "success",
						student_id: studentArr[0],
						name: studentArr[1],
						activity: "TIME IN (AM)",
						timestamp: time(),
					});
				}
			} else if (attendance_type === "2") {
				if (attendance.count) {
					if (attendance.time_out_am) {
						res.status(200).json({
							status: "error",
							msg: "User Timed Out (AM) Already",
						});
					} else {
						await zeroParam(
							`UPDATE attendance SET time_out_am='${time()}',status=${attendance_type},logs='${time()}' WHERE student_id = '${
								studentArr[0]
							}' AND event_code='${event_code}'`
						);

						res.status(200).json({
							status: "success",

							student_id: studentArr[0],
							name: studentArr[1],
							activity: "TIME OUT (AM)",
							timestamp: time(),
						});
					}
				} else {
					res.status(200).json({
						status: "error",
						msg: "You must time IN (AM) first",
					});
				}
			} else {
				res.status(200).json({
					status: "error",
					msg: "Select Attendance Type Below",
				});
			}
		} else {
			res.status(200).json({
				status: "error",
				msg: "Student not exist in database",
			});
		}
		// insert QR code data into MySQL database
	} catch (err) {
		console.log(err);
		res.status(200).json({
			status: "error",
			msg: "Invalid QR Code",
		});
	}
};

const postQrCodeAfternoon = async (req, res) => {
	const event_code = req.body.event_code;
	const student_data = req.body.data;
	const attendance_type = req.body.attendance_type;

	const studentArr = student_data.split(",");
	try {
		if (!event_code) {
			return res.status(200).json({
				status: "error",
				msg: "No Event",
			});
		}
		const attendance = (
			await zeroParam(
				`SELECT count(*) as 'count', time_in_pm,time_out_pm FROM attendance WHERE student_id = '${
					studentArr[0]
				}' AND log_date = '${date()}'`
			)
		)[0];

		const exist_student = (
			await zeroParam(
				`SELECT count(*) as 'count' FROM student WHERE student_id = '${studentArr[0]}'`
			)
		)[0].count;

		if (exist_student) {
			if (attendance_type === "1") {
				if (attendance.time_in_pm) {
					res.status(200).json({
						status: "error",
						msg: "User Timed In (PM) Already",
					});
				} else {
					await zeroParam(
						`INSERT INTO attendance SET event_code='${event_code}',student_id='${
							studentArr[0]
						}',time_in_pm='${time()}',log_date='${date()}',status='${attendance_type}',logs='${time()}'`
					);

					res.status(200).json({
						status: "success",
						student_id: studentArr[0],
						name: studentArr[1],
						activity: "TIME IN (PM)",
						timestamp: time(),
					});
				}
			} else if (attendance_type === "2") {
				if (attendance.count) {
					if (attendance.time_out_pm) {
						res.status(200).json({
							status: "error",
							msg: "User Timed Out (PM) Already",
						});
					} else {
						await zeroParam(
							`UPDATE attendance SET time_out_pm='${time()}',status=${attendance_type},logs='${time()}' WHERE student_id = '${
								studentArr[0]
							}' AND event_code='${event_code}'`
						);

						res.status(200).json({
							status: "success",

							student_id: studentArr[0],
							name: studentArr[1],
							activity: "TIME OUT (PM)",
							timestamp: time(),
						});
					}
				} else {
					res.status(200).json({
						status: "error",
						msg: "You must time IN (PM) first",
					});
				}
			} else {
				res.status(200).json({
					status: "error",
					msg: "Select Attendance Type Below",
				});
			}
		} else {
			res.status(200).json({
				status: "error",
				msg: "Student not exist in database",
			});
		}
		// insert QR code data into MySQL database
	} catch (err) {
		console.log(err);
		res.status(200).json({
			status: "error",
			msg: "Invalid QR Code",
		});
	}
};


module.exports = {
	getHome,
	postQrCodeWholeDay,
	postQrCodeMorning,
	postQrCodeAfternoon,
};
