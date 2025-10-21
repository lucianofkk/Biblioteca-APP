import { Router } from "express";
import {
    createPrestamo,
    devolverLibro,
    getMultas,
    getPrestamosActivos,
} from "../controllers/prestamoController.js";

const router = Router();

router.post("/", createPrestamo);
router.put("/:id/devolver", devolverLibro);
router.get("/multas", getMultas);
router.get("/", getPrestamosActivos);

export default router;
