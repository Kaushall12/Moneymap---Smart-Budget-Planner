const express = require("express")
const router = express.Router();
const {income,displayincome} = require("../controller/income")

router.post("/", income);
router.get("/",displayincome);

module.exports = router;