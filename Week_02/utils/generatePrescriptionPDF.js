const PDFDocument = require("pdfkit");

/**
 * Generate a prescription PDF buffer
 * @param {Object} appointment
 * @returns {Promise<Buffer>}
 */
const generatePrescriptionPDF = (appointment) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    doc.fontSize(20).text("Appointment Prescription", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${appointment.name}`);
    doc.text(`Email: ${appointment.email}`);
    doc.text(`Date: ${appointment.date}`);
    doc.text(`Doctor: ${appointment.doctor}`);
    doc.text(`Symptoms: ${appointment.symptoms}`);
    doc.moveDown();
    doc.text(
      "Prescription Notes: Take rest, stay hydrated, and follow up in 7 days."
    );

    doc.end();
  });
};

module.exports = generatePrescriptionPDF;
