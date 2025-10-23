import express, { NextFunction, Request, Response } from 'express'
import { AuthController } from './auth.controller';

const router = express.Router();

router.post("/login", AuthController.login)
    

// create doctor
// create admin

export const AuthRoutes = router;