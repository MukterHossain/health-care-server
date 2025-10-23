import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";

import sendResponse from "../../shared/sendResponse";
import { AppointmentService } from "./appointment.service";
import pick from "../../helper/pick";
import { appointmentFilterableFields } from "./appointment.constant";


const createAppointment = catchAsync(async (req: Request & {user?:IJWTPayload}, res: Response) => {
  const user = req.user;
    console.log(user)
    console.log(req.body)
    const result = await AppointmentService.createAppointment(user as IJWTPayload,req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Appointment created successfully!",
        data: result
    })
})

const getMyAppointment = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const fillters = pick(req.query, ["status", "paymentStatus"])
    const user = req.user;
    const result = await AppointmentService.getMyAppointment(user as IJWTPayload, fillters, options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Appointment fetched successfully!",
        data: result
    })
})
const getAllAppointment = catchAsync(async (req: Request , res: Response) => {
   const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const fillters = pick(req.query, appointmentFilterableFields)


    const result = await AppointmentService.getAllAppointment(fillters, options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Appointment fetched successfully!",
        data: result?.data,
        meta: result?.meta
    })
})


const updateAppointmentStatus = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    const result = await AppointmentService.updateAppointmentStatus(id, status, user as IJWTPayload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Appointment updated successfully!",
        data: result
    })
})
const cancelUnpaidAppointments = catchAsync(async (req: Request, res: Response) => {
   
    const { id } = req.params;
    const result = await AppointmentService.cancelUnpaidAppointments();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Appointment Cencelled successfully!",
        data: result
    })
})




export const AppointmentController = {
    createAppointment,
    getAllAppointment,
    getMyAppointment,
    updateAppointmentStatus,
    cancelUnpaidAppointments
}