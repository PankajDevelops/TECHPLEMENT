const nodemailer = require("nodemailer");

async function main() {
  try {
    const testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    let info = await transporter.sendMail({
      from: '"Tester" <test@example.com>',
      to: "your_email@example.com", // Replace with your actual email here just to test
      subject: "Hello ✔",
      text: "This is a test email from Ethereal",
    });

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

main();
