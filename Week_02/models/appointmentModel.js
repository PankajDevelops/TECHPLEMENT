const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    doctor: {
      type: String,
      required: false,
    },
    symptoms: {
      type: String,
      required: false,
    },
    fileUrl: {
      type: String, // Cloudinary URL for image upload
      required: false,
    },
    prescriptionPdfUrl: {
      type: String, // Cloudinary URL for PDF
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
