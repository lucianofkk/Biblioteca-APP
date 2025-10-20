import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import libroRoutes from "./api/routes/libros.routes.js";
import socioRoutes from "./api/routes/socios.routes.js";
import prestamoRoutes from "./api/routes/prestamos.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/libros", libroRoutes);
app.use("/socios", socioRoutes);
app.use("/prestamos", prestamoRoutes);

app.get("/", (req, res) => res.send("📚 API Biblioteca funcionando correctamente"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
