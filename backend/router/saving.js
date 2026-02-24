// router/saving.js
const express = require("express");
const router = express.Router();

const { getUserSavings } = require("../controller/saving");

// GET /saving?user_id=...
router.get("/", getUserSavings);

module.exports = router;
