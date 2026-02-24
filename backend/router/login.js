const express = require("express")
const router = express.Router();
const {checkLogin} = require("../controller/login")

router.post("/", checkLogin);

module.exports = router;