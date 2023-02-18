const express = require("express");
const router = express.Router();

const adminController = require("../controller/admin");

router.get("/dashboard", adminController.getDashboard);

router.get("/student", adminController.getStudent)
router.get("/student/view/:student_id", adminController.getStudentView)
router.delete("/student/delete", adminController.deleteStudent)

router.get("/attendance", adminController.getAttendance)

router.get("/event", adminController.getEvent)
router.get("/event_new", adminController.getEventNew)
router.post("/event_new", adminController.postEventNew)



module.exports = router;