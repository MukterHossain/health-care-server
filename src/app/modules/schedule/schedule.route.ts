import express, { NextFunction, Request, Response } from 'express'
import { ScheduleController } from './schedule.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();





router.get("/", auth(UserRole.DOCTOR, UserRole.ADMIN), ScheduleController.getAllFromDB)

router.get(
    '/:id',
    auth( UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
    ScheduleController.getByIdFromDB
);

router.post("/", auth(UserRole.ADMIN), ScheduleController.inserIntoDB)

router.delete("/:id", auth(UserRole.ADMIN), ScheduleController.deleteFromDB)

   

export const ScheduleRoutes = router;