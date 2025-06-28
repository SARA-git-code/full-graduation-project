const express = require("express");
const router = express.Router();

const { reportUser, getAllReports } = require("../controllers/reportController");
const { protect, adminOnly } = require("../middlewares/auth");

router.post("/", protect, reportUser);
router.get("/", adminOnly, getAllReports);


module.exports = router;
