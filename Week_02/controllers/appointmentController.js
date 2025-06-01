const Appointment = require("../models/appointmentModel");
const sendEmail = require("../utils/sendEmail");
const generatePrescriptionPDF = require("../utils/generatePrescriptionPDF");

const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const uploadPDFBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "prescriptions",
        format: "pdf",
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const bookAppointment = async (req, res) => {
  try {
    const { name, email, date, doctor, symptoms } = req.body;
    const fileUrl = req.file?.path || null;

    const appointment = new Appointment({
      name,
      email,
      date,
      doctor,
      symptoms,
      fileUrl,
    });
    await appointment.save();

    const pdfBuffer = await generatePrescriptionPDF(appointment);

    const cloudinaryResult = await uploadPDFBufferToCloudinary(pdfBuffer);
    const pdfUrl = cloudinaryResult.secure_url;

    appointment.prescriptionPdfUrl = pdfUrl;
    await appointment.save();

    await sendEmail({
      to: email,
      subject: "Appointment Confirmation & Prescription",
      text: `Hi ${name}, your appointment for ${date} is confirmed!\n\nDownload your prescription here:\n${pdfUrl}`,
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      prescription: pdfUrl,
    });
  } catch (error) {
    console.error("Booking Error:", error);
    console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
    res.status(500).json({ error: "Failed to book appointment" });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
};
