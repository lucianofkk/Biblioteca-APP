import { Router } from "express";
import {
    createPrestamo,
    devolverLibro,
    getMultas,
} from "../controllers/prestamoController.js";

const router = Router();

router.post("/", createPrestamo);
router.put("/:id/devolver", devolverLibro);
router.get("/multas", getMultas);

export default router;
