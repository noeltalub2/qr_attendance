const moment = require("../public/vendor/moment/moment.js")

const zeroFill = (n) => {
	return ("0" + n).slice(-2);
};

const time = () => {
	// Get current time
	const now = new Date();
	var hours = now.getHours();

	var minutes = now.getMinutes();
	var seconds = zeroFill(now.getSeconds());
	minutes = minutes < 10 ? "0" + minutes : minutes;

	var AMPM = hours >= 12 ? "PM" : "AM";

	hours = hours % 12;
	hours = hours ? hours : 12;
	var currentTime = `${hours}:${minutes}:${seconds} ${AMPM}`;

	return currentTime;
};

const date = () => {
	var now = new Date();
	var fullDate = moment(now).format("YYYY-MM-DD");
	return fullDate
};

const convertTime = (time) => {
	if (time) {
		var hours = `${time[0]}${time[1]}`;

		var minutes = `${time[3]}${time[4]}`;

		minutes = minutes < 10 ? "" + minutes : minutes;

		var AMPM = hours >= 12 ? "PM" : "AM";

		hours = hours % 12;
		hours = hours ? hours : 12;
		var currentTime = `${hours}:${minutes} ${AMPM}`;

		return currentTime;
	} else {
		return null;
	}
};

const convertDate = (time) => {

	var fullDate = moment(time).format("MMMM DD, YYYY");
	return fullDate
}

module.exports = { time, date, convertTime,convertDate };
