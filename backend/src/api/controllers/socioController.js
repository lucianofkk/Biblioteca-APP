import { pool } from "../../db/connection.js";

// Registrar socio nuevo
export const createSocio = async (req, res) => {
    const { nombre, numero_socio } = req.body;
    try {
        await pool.query(
        "INSERT INTO socios (nombre, numero_socio) VALUES (?, ?)",
        [nombre, numero_socio]
        );
        res.json({ message: "Socio registrado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    };

    // Listar socios
export const getSocios = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM socios");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    };
