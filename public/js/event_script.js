

var today = new Date().toISOString().split("T")[0];
document.getElementsByName("event_date")[0].setAttribute("min", today);


(() => {
	"use strict";

	// Fetch all the forms we want to apply custom Bootstrap validation styles to
	const forms = document.querySelectorAll(".needs-validation");

	// Loop over them and prevent submission
	Array.from(forms).forEach((form) => {
		form.addEventListener(
			"submit",
			(event) => {
				if (!form.checkValidity()) {
					event.preventDefault();
					event.stopPropagation();
				}

				form.classList.add("was-validated");
			},
			false
		);
	});
})();

document.querySelector("form").addEventListener("submit", (event) => {
	var time_in_am_start = document.getElementById("time_in_am_start").value;
	var time_in_am_end = document.getElementById("time_in_am_end").value;

	var time_out_am_start = document.getElementById("time_out_am_start").value;
	var time_out_am_end = document.getElementById("time_out_am_end").value;

	var time_in_pm_start = document.getElementById("time_in_pm_start").value;
	var time_in_pm_end = document.getElementById("time_in_pm_end").value;

	var time_out_pm_start = document.getElementById("time_out_pm_start").value;
	var time_out_pm_end = document.getElementById("time_out_pm_end").value;

	if (time_in_am_start > time_in_am_end) {
		Toast.fire({
			icon: "error",
			title: "Time In Start (AM) must not be greater than Time In End (AM)",
		});

		event.preventDefault();
		event.stopPropagation();
	}

	if (time_out_am_start > time_out_am_end) {
		Toast.fire({
			icon: "error",
			title: "Time Out Start (AM) must not be greater than Time Out End (AM)",
		});

		event.preventDefault();
		event.stopPropagation();
	}

	if (time_in_pm_start > time_in_pm_end) {
		Toast.fire({
			icon: "error",
			title: "Time In Start (PM) must not be greater than Time In End (PM)",
		});

		event.preventDefault();
		event.stopPropagation();
	}

	if (time_out_pm_start > time_out_pm_end) {
		Toast.fire({
			icon: "error",
			title: "Time Out Start (PM) must not be greater than Time Out End (PM)",
		});

		event.preventDefault();
		event.stopPropagation();
	}

	return false;
});
