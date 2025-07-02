import cron from "node-cron";
import Appointment from "../models/appointment.model.js";
import { sendPushNotification } from "./pushNotification.js";
import moment from "moment";

// Todos los días a las 9:00 AM
cron.schedule("* * * * *", async () => {
  try {
    const hoy = moment().startOf("day");
    const mañana = moment(hoy).add(1, "day");

    const desde = mañana.clone().startOf("day").toDate();
    const hasta = mañana.clone().endOf("day").toDate();

    // Buscar turnos del día siguiente que aún no hayan recibido notificación
    const turnos = await Appointment.find({
      fecha: { $gte: desde, $lte: hasta },
      notificacion_enviada: false,
      estado: "Agendado",
    }).populate("paciente");

    for (const turno of turnos) {
      const token = turno.paciente?.expoPushToken;

      if (token) {
        await sendPushNotification(
          token,
          "Recordatorio de turno",
          `Tenés un turno mañana a las ${turno.hora}.`
        );

        // Marcar turno como notificado
        turno.notificacion_enviada = true;
        await turno.save();
      }
    }

    console.log(`[CRON] Notificaciones de recordatorio enviadas: ${turnos.length}`);
  } catch (error) {
    console.error("[CRON] Error al enviar notificaciones de turnos:", error.message);
  }
});
