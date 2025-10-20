import { Router } from "express";
import { getLibros, createLibro } from "../controllers/libroController.js";

const router = Router();

router.get("/", getLibros);
router.post("/", createLibro);

export default router;
