const zeroFill = n => {
    return ('0' + n).slice(-2);
  }

const time = () => {
    // Get current time
	const now = new Date();
    var hours = now.getHours();

	var minutes = now.getMinutes();
	var seconds = zeroFill(now.getSeconds())
	minutes = minutes < 10 ? "0" + minutes : minutes;

	var AMPM = hours >= 12 ? "PM" : "AM";

	hours = hours % 12;
    hours = hours ? hours : 12;
    var currentTime = `${hours}:${minutes}:${seconds} ${AMPM}`;

    return currentTime
}

const date = () => {
	const now = new Date();

	var currentYear = now.getFullYear();
    var currentMonth = zeroFill(now.getMonth() + 1);
	var currentDay = now.getDate()
    
    var fullDate = `${currentYear}-${currentMonth}-${currentDay}`;
	return fullDate
}

module.exports = {time,date}