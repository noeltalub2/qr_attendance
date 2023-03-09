const express = require("express");
const router = express.Router();

const qrcodeController = require("../controller/qrcode");

router.get("/", qrcodeController.getHome);
router.post("/qrcode/WholeDay", qrcodeController.postQrCodeWholeDay);
router.post("/qrcode/MorningOnly", qrcodeController.postQrCodeMorning);
router.post("/qrcode/AfternoonOnly", qrcodeController.postQrCodeAfternoon);


module.exports = router;
