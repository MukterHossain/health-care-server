import express from "express";
import { PatientController } from "./patient.controller";
const router = express.Router();

router.get(
    "/",
    PatientController.getAllFromDB
)
router.get(
    "/:id",
    PatientController.getSingleByIdFromDB
)

router.patch(
    "/:id",
    PatientController.updateIntoDB
)
router.delete(
    "/:id",
    PatientController.deletePatientFromDB
)


export const PatientRoutes = router;