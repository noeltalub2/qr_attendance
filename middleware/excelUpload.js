const multer = require("multer");
const path = require("path");

const excelStorage = multer.diskStorage({
	// Destination to store image
	destination: "public/document",
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname));

		// path.extname get the uploaded file extension
	},
});
const excelUpload = multer({
	storage: excelStorage,

	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(xlsx)$/)) {
			// upload only png, jpg, and jpeg format
			req.fileValidationError = 'Please upload a Excel File. Try again';
			return cb(null, false, req.fileValidationError);
		}
		cb(undefined, true);
	},
});


module.exports = excelUpload;
