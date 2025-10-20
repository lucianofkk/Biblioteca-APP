import { Router } from "express";
import { getSocios, createSocio } from "../controllers/socioController.js";

const router = Router();

router.get("/", getSocios);
router.post("/", createSocio);

export default router;