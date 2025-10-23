import express from "express";
import { AppointmentController } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

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
    "/my-appointments",
    auth(UserRole.PATIENT, UserRole.DOCTOR),
    AppointmentController.getMyAppointment
)


router.post(
    "/",
    auth(UserRole.PATIENT),
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