// utils/emailUtils.js
import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, htmlContent) => {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	const mailOptions = {
		from: 'turnosmedicosapp@gmail.com',
		to,
		subject,
		html: htmlContent,
	};

	await transporter.sendMail(mailOptions);
};
