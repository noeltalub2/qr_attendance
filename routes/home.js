const express = require("express");
const router = express.Router();

const homeController = require("../controller/home");

router.get("/", homeController.getHome);
router.post("/qrcode", homeController.postQrCode);

router.get("/insert", homeController.getInsert);
router.post("/insert", homeController.postInsert);

router.post("/data", homeController.postData);

module.exports = router;
