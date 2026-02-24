const express = require("express")
const router = express.Router();
const multer = require("multer");
const {expense,displayexpense,uploadBill} = require("../controller/expense")

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/", expense);
router.get("/",displayexpense);
router.post("/upload-bill", upload.single("bill"), uploadBill);

module.exports = router;