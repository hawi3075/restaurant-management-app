const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Matches EMAIL_USER in your .env
      pass: process.env.EMAIL_PASS, // Matches EMAIL_PASS in your .env
    },
  });

  const mailOptions = {
    from: `"ROMS Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;