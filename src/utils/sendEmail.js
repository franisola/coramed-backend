import moment from "moment";
import "moment/locale/es.js";
import nodemailer from "nodemailer";

moment.locale("es");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: "turnosmedicosapp@gmail.com",
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export const sendAppointmentEmail = async ({ to, subject, appointment, action }) => {
  const fechaLegible = moment(appointment.fecha).format("dddd D [de] MMMM [de] YYYY");
  const html = `
    <p>Hola ${appointment.paciente?.nombreCompleto || "usuario"},</p>
    <p>Tu turno para el <strong>${fechaLegible}</strong> a las <strong>${appointment.hora}</strong> fue <strong>${action}</strong>.</p>
    <p>Gracias por usar nuestra app.</p>
  `;
  await sendEmail(to, subject, html);
};
