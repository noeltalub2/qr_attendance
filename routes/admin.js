const express = require("express");
const router = express.Router();

const adminController = require("../controller/admin");
const excelDownload = require("../middleware/excelDownload");
const excelUpload = require("../middleware/excelUpload");
const { forwardAuth, requireAuth } = require("../middleware/adminAuth");

router.get("/login", forwardAuth, adminController.getLogin)
router.post("/login", forwardAuth, adminController.postLogin)
router.get("/dashboard", requireAuth, adminController.getDashboard);

router.get("/student", requireAuth, adminController.getStudent);
router.post("/student_data", requireAuth, adminController.postAllStudent);
router.get(
	"/student/edit/:student_id",	
	requireAuth,
	adminController.getStudentEdit
);
router.post("/student/edit", requireAuth, adminController.postStudentEdit);
router.get("/student_new", requireAuth, adminController.getStudentNew);
router.post("/student_new", requireAuth, adminController.postStudentUpload);
router.post("/student_exist", requireAuth, adminController.postStudentExist);
router.get(
	"/student/view/:student_id",
	requireAuth,
	adminController.getStudentView
);
router.delete("/student/delete", requireAuth, adminController.deleteStudent);

router.get("/attendance", requireAuth, adminController.getAttendance);
router.post("/attendance_data", requireAuth, adminController.postAllAttendance);

router.get("/event", requireAuth, adminController.getEvent);

router.get("/event_new", requireAuth, adminController.getEventNew);
router.post("/event_new", requireAuth, adminController.postEventNew);

router.get(
	"/event/view/:event_code",
	requireAuth,
	adminController.getEventView
);

router.get(
	"/event/edit/:event_code",
	requireAuth,
	adminController.getEventEdit
);
router.post("/event/edit/", requireAuth, adminController.postEventEdit);
router.delete("/event/delete", requireAuth, adminController.deleteEvent);

router.post(
	"/upload_excel",
	requireAuth,
	excelUpload.single("import-excel"),
	adminController.postExcelUpload
);
router.get(
	"/downloadExcel/degree=:degree&event_code=:event_code&year_section=:year_section",
	requireAuth,
	excelDownload
);

router.get("/settings", requireAuth, adminController.getSettings)
router.post("/change_password", requireAuth, adminController.changePassword)
router.post("/delete_database", requireAuth, adminController.delDatabase)
router.get("/logout", requireAuth, adminController.getLogout)

module.exports = router;
