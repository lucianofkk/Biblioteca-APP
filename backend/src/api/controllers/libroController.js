import { pool } from "../../db/connection.js";

// Obtener todos los libros
export const getLibros = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM libros");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    };

// Agregar un libro nuevo
export const createLibro = async (req, res) => {
    const { titulo, autor, isbn } = req.body;
    try {
        await pool.query(
        "INSERT INTO libros (titulo, autor, isbn) VALUES (?, ?, ?)",
        [titulo, autor, isbn]
        );
        res.json({ message: "Libro agregado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    };
