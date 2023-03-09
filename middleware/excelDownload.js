const excelJS = require("exceljs");
const db = require("../database/db");
const { convertDate } = require("../utils/timestamp");

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
const getExcelDownload = async (req, res) => {
	const degree = req.params.degree;
	const event_code = req.params.event_code;
	const year_section = req.params.year_section;
	const event = (
		await queryParam(
			"SELECT * FROM event_list WHERE event_code = ?",
			[event_code]
		)
	)[0];
	
	var event_date = convertDate(event.event_date);
	
	const User = await zeroParam(
		`SELECT a.student_id,s.name,s.degree,a.time_in_am,a.time_out_am,a.time_in_pm,a.time_out_pm FROM attendance AS a INNER JOIN student AS s ON s.student_id = a.student_id INNER JOIN event_list AS e ON e.event_code = a.event_code WHERE a.event_code = '${event_code}' AND s.degree='${degree}' AND s.year_section='${year_section}';`
	);
	const workbook = new excelJS.Workbook(); // Create a new workbook
	const worksheet = workbook.addWorksheet("Attendance", {pageSetup: {fitToPage: true,paperSize: 9,orientation: "portrait"}}); // New Worksheet

	// Add new row
	var image = workbook.addImage({
		filename: './public/img/cte_logo.png',
		extension: 'png'
	})
	worksheet.addImage(image,'D1:D4')
	worksheet.getRow(1).alignment = {
		vertical: "middle",
		horizontal: "center",
		wrapText: true,
	};
	worksheet.mergeCells("A5", "G6");
	worksheet.getRow(5).alignment = {
		vertical: "middle",
		horizontal: "center",
		wrapText: true,
	};
	worksheet.getCell(
		"A5"
	).value = `Attendance for ${event.event_name} (${event_code})`;
	worksheet.getRow(5).font = { bold: true,size: '14' };
	worksheet.getCell("A7").value = `Degree : ${degree} ${year_section}`;
	worksheet.getCell("A8").value = `Date : ${event_date}`;
	worksheet.getRow(9).values = [
		"No.",
		"Student No.",
		"Name",
		"Time In (AM)",
		"Time Out (AM)",
		"Time In (PM)",
		"Time Out (PM)",
	];

	worksheet.getRow(9).font = { bold: true };

	// Column for data in excel. key must match data key
	worksheet.columns = [
		{ key: "id", width: 5 },
		{ key: "student_id", width: 11 },
		{ key: "name", width: 25 },
		{ key: "time_in_am", width: 12 },
		{ key: "time_out_am", width: 14 },
		{ key: "time_in_pm", width: 12 },
		{ key: "time_out_pm", width: 14 },
	];
	// Looping through User data
	let counter = 1;
	User.forEach((user) => {
		user.id = counter;
	
		let row = worksheet.addRow(user);
		
		let time_in_am = row.getCell(4);
		let time_out_am = row.getCell(5);
		let time_in_pm = row.getCell(6);
		let time_out_pm = row.getCell(7);
	

		// 8:00:00 AM > 9:55:00 AM AND 8:30:00 AM < 9:55:00
		if (event.time_in_am_start >= time_in_am.value || event.time_in_am_end <= time_in_am.value) {
		  time_in_am.font = {color: {argb: '00FF0000'}}
		} 


		if (event.time_out_am_start >= time_out_am.value || event.time_out_am_end <= time_out_am.value) {
			time_out_am.font = {color: {argb: '00FF0000'}}
		}
		

		if (event.time_in_pm_start >= time_in_pm.value || event.time_in_pm_end <= time_in_pm.value) {
			time_in_pm.font = {color: {argb: '00FF0000'}}
		} 

		if (event.time_out_pm_start >= time_out_pm.value || event.time_out_pm_end <= time_out_pm.value) {
			time_out_pm.font = {color: {argb: '00FF0000'}}
		} 
		
		counter++;
	});

	res.setHeader(
		"Content-Type",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	);
	res.setHeader(
		"Content-Disposition",
		"attachment; filename=" +
			`${degree} ${year_section} - Attendance for ${event_code}.xlsx`
	);
	try {
		workbook.xlsx.write(res).then(function (data) {
			res.end();
		});
	} catch (err) {
		res.send({
			status: "error",
			message: "Something went wrong",
		});
	}
};

module.exports = getExcelDownload;
