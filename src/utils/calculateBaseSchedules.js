// Calculate base schedules from working hours
export const calculateBaseSchedules = (workingHours) => {
    const baseSchedules = [];

    workingHours.forEach(({ inicio, fin }) => {
        let [startHour, startMinute] = inicio.split(":").map(Number);
        const [endHour, endMinute] = fin.split(":").map(Number);

        while (startHour < endHour || (startHour === endHour && startMinute < endMinute)) {
            const schedule = `${startHour.toString().padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`;
            baseSchedules.push(schedule);

            startMinute += 20;
            if (startMinute >= 60) {
                startMinute -= 60;
                startHour += 1;
            }
        }
    });

    return baseSchedules;
};