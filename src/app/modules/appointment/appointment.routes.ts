import express from "express";
import { AppointmentController } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { AppointmentValidation } from "./appointment.validation";

const router = express.Router();

// router.get(
//     "/",
    
// )
router.get(
    "/",
    auth(UserRole.ADMIN),
    AppointmentController.getAllAppointment
)

router.get(
    "/my-appointment",
    auth(UserRole.PATIENT, UserRole.DOCTOR),
    AppointmentController.getMyAppointment
)


router.post(
    "/",
    auth(UserRole.PATIENT),
    validateRequest(AppointmentValidation.createAppointment),
    AppointmentController.createAppointment
)

router.patch(
    "/status/:id",
    auth(UserRole.ADMIN, UserRole.DOCTOR),
    AppointmentController.updateAppointmentStatus
)
router.delete(
    "/:id",
    auth(UserRole.ADMIN, UserRole.DOCTOR),
    AppointmentController.cancelUnpaidAppointments
)


export const AppointmentRoutes = router;