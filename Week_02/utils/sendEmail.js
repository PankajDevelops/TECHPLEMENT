const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, attachmentPath = null }) => {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const mailOptions = {
    from: '"Test Mailer" <test@example.com>',
    to,
    subject,
    text,
  };

  if (attachmentPath) {
    mailOptions.attachments = [
      {
        filename: attachmentPath.split("/").pop(),
        path: attachmentPath,
      },
    ];
  }

  const info = await transporter.sendMail(mailOptions);

  console.log("📬 Email sent: %s", nodemailer.getTestMessageUrl(info));
};

module.exports = sendEmail;
