const express = require("express");
const router = express.Router();
const upload = require("../utils/multerConfig");
const {
  bookAppointment,
  getAppointments,
} = require("../controllers/appointmentController");

router.post("/book", upload.single("file"), bookAppointment);
router.get("/", getAppointments);

module.exports = router;
