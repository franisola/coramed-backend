import moment from "moment";

/**
 * Calcula los horarios base a partir de los horarios laborales con intervalos de 20 minutos.
 * @param {Array} workingHours - Array de horarios laborales con inicio y fin.
 * @returns {Array} - Array de horarios disponibles en formato HH:mm.
 */
export const calculateBaseSchedules = (workingHours) => {
    const baseSchedules = [];

    workingHours.forEach(({ inicio, fin }) => {
        let [startHour, startMinute] = inicio.split(":").map(Number);
        const [endHour, endMinute] = fin.split(":").map(Number);

        while (startHour < endHour || (startHour === endHour && startMinute < endMinute)) {
            // Formatear el horario actual como HH:mm
            const schedule = `${startHour.toString().padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`;
            baseSchedules.push(schedule);

            // Incrementar en intervalos de 20 minutos
            startMinute += 20;
            if (startMinute >= 60) {
                startMinute -= 60;
                startHour += 1;
            }
        }
    });

    return baseSchedules;
};

/**
 * Valida si un día específico es laboral para el profesional.
 * @param {String} fecha - Fecha en formato YYYY-MM-DD.
 * @param {Array} diasLaborales - Días laborales del profesional.
 * @returns {Boolean} - True si el día es laboral, False en caso contrario.
 */
export const isDayLaboral = (fecha, diasLaborales) => {
    let dayOfWeek = moment(fecha).format("dddd");
    dayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
    return diasLaborales.includes(dayOfWeek);
};

/**
 * Busca las citas existentes para un profesional en una fecha específica.
 * @param {String} profesionalId - ID del profesional.
 * @param {String} fecha - Fecha en formato YYYY-MM-DD.
 * @param {String} estado - Estado de las citas a buscar (por defecto: "Agendado").
 * @returns {Promise<Array>} - Lista de citas existentes.
 */
export const findAppointmentsByProfessionalAndDate = async (profesionalId, fecha, estado = "Agendado") => {
    return await Appointment.find({
        profesional: profesionalId,
        fecha,
        estado,
    });
};

/**
 * Calcula los horarios disponibles para un profesional en una fecha específica.
 * @param {Array} horariosLaborales - Horarios laborales del profesional.
 * @param {Array} occupiedSchedules - Horarios ocupados por citas existentes.
 * @returns {Array} - Lista de horarios disponibles.
 */
export const getAvailableSchedulesForDay = (horariosLaborales, occupiedSchedules) => {
    const baseSchedules = calculateBaseSchedules(horariosLaborales);
    return baseSchedules.filter(schedule => !occupiedSchedules.includes(schedule));
};

/**
 * Valida si un horario específico está dentro del rango laboral del profesional.
 * @param {String} hora - Horario en formato HH:mm.
 * @param {Array} horariosLaborales - Horarios laborales del profesional.
 * @returns {Boolean} - True si el horario está disponible, False en caso contrario.
 */
export const isScheduleAvailable = (hora, horariosLaborales) => {
    const baseSchedules = calculateBaseSchedules(horariosLaborales);
    return baseSchedules.includes(hora);
};