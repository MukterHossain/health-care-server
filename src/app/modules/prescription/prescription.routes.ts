import { UserRole } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import { PrescriptionController } from './prescription.controller';
import validateRequest from '../../middlewares/validateRequest';
import { PrescriptionValidation } from './prescription.validation';
const router = express.Router();


router.get(
    '/',
    auth(UserRole.ADMIN),
    PrescriptionController.getAllFromDB
);
router.get(
    '/my-prescription',
    auth(UserRole.PATIENT),
    PrescriptionController.patientPrescription
)

router.post(
    "/",
    auth(UserRole.DOCTOR),
    validateRequest(PrescriptionValidation.create),
    PrescriptionController.createPrescription
);

export const PrescriptionRoutes = router;