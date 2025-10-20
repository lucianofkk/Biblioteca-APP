    import { pool } from "../../db/connection.js";

    // Registrar préstamo
    export const createPrestamo = async (req, res) => {
    const { socio_id, libro_id, fecha_inicio } = req.body;
    try {
        // Cambiar estado del libro a "prestado"
        await pool.query("UPDATE libros SET estado = 'prestado' WHERE id = ?", [libro_id]);

        // Insertar préstamo
        await pool.query(
        "INSERT INTO prestamos (socio_id, libro_id, fecha_inicio) VALUES (?, ?, ?)",
        [socio_id, libro_id, fecha_inicio]
        );

        res.json({ message: "Préstamo registrado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    };

    // Registrar devolución
    export const devolverLibro = async (req, res) => {
    const { id } = req.params; // ID del préstamo
    const { fecha_devolucion, libro_danado, monto_multa, motivo } = req.body;

    try {
        // Actualizar fecha de devolución
        await pool.query("UPDATE prestamos SET fecha_devolucion = ? WHERE id = ?", [
        fecha_devolucion,
        id,
        ]);

        // Obtener libro asociado
        const [prestamo] = await pool.query("SELECT libro_id FROM prestamos WHERE id = ?", [id]);
        const libroId = prestamo[0]?.libro_id;

        // Cambiar estado del libro a disponible
        if (libroId) {
        await pool.query("UPDATE libros SET estado = 'disponible' WHERE id = ?", [libroId]);
        }

        // Si el libro está dañado o tiene multa
        if (libro_danado && monto_multa > 0) {
        await pool.query(
            "INSERT INTO multas (prestamo_id, monto, motivo) VALUES (?, ?, ?)",
            [id, monto_multa, motivo || "Libro dañado"]
        );
        }

        res.json({ message: "Devolución registrada correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    };

    // Ver todas las multas
    export const getMultas = async (req, res) => {
    try {
        const [rows] = await pool.query(
        `SELECT m.id, s.nombre AS socio, l.titulo AS libro, m.monto, m.motivo, m.fecha
        FROM multas m
        JOIN prestamos p ON m.prestamo_id = p.id
        JOIN socios s ON p.socio_id = s.id
        JOIN libros l ON p.libro_id = l.id`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    };
