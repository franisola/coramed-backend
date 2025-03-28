import Turno from "../models/turno.model.js";

// Obtener un turno específico
export const getTurnoById = async (req, res, next) => {
    try {
        const { turnoId } = req.params;

        const turno = await Turno.findById(turnoId).populate("profesional", "nombre apellido especialidad");

        if (!turno) {
            return res.status(404).json({ message: "Turno no encontrado" });
        }

        res.status(200).json(turno);
    } catch (error) {
        next(error);
    }
};

// Crear un nuevo turno
export const createTurno = async (req, res, next) => {
    try {
        const { paciente, profesional, fecha, hora, motivo_consulta } = req.body;

        // Validar si ya existe un turno en la misma fecha y hora con el mismo profesional
        const turnoExistente = await Turno.findOne({ profesional, fecha, hora });
        if (turnoExistente) {
            return res.status(400).json({ message: "Ya existe un turno en esta fecha y hora con este profesional" });
        }

        const nuevoTurno = new Turno({
            paciente,
            profesional,
            fecha,
            hora,
            motivo_consulta,
        });

        await nuevoTurno.save();

        res.status(201).json({ message: "Turno creado exitosamente", turno: nuevoTurno });
    } catch (error) {
        next(error);
    }
};

// Actualizar el estado de un turno
export const updateTurnoEstado = async (req, res, next) => {
    try {
        const { turnoId } = req.params;
        const { estado } = req.body;

        if (!["Agendado", "Cancelado", "Completado"].includes(estado)) {
            return res.status(400).json({ message: "Estado inválido" });
        }

        const turno = await Turno.findById(turnoId);

        if (!turno) {
            return res.status(404).json({ message: "Turno no encontrado" });
        }

        turno.estado = estado;
        await turno.save();

        res.status(200).json({ message: "Estado del turno actualizado", turno });
    } catch (error) {
        next(error);
    }
};

// Agregar resultados de estudios a un turno
export const addResultadosEstudios = async (req, res, next) => {
    try {
        const { turnoId } = req.params;
        const { resultados_estudios } = req.body;

        const turno = await Turno.findById(turnoId);

        if (!turno) {
            return res.status(404).json({ message: "Turno no encontrado" });
        }

        turno.resultados_estudios.push(...resultados_estudios);
        await turno.save();

        res.status(200).json({ message: "Resultados de estudios agregados", turno });
    } catch (error) {
        next(error);
    }
};

// Eliminar un turno
export const deleteTurno = async (req, res, next) => {
    try {
        const { turnoId } = req.params;

        const turno = await Turno.findById(turnoId);

        if (!turno) {
            return res.status(404).json({ message: "Turno no encontrado" });
        }

        await Turno.findByIdAndDelete(turnoId);

        res.status(200).json({ message: "Turno eliminado exitosamente" });
    } catch (error) {
        next(error);
    }
};