import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";
import { PrescriptionService } from "./prescription.service";
import sendResponse from "../../shared/sendResponse";
import pick from "../../helper/pick";
import httpStatus from 'http-status'
import { IAuthUser } from "../../interface/common";
import { prescriptionFilterableFields } from "./prescription.constants";

const createPrescription = catchAsync(async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    const result = await PrescriptionService.createPrescription(user as IAuthUser, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Prescription created successfully!",
        data: result
    })
})

const patientPrescription = catchAsync(async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
    const result = await PrescriptionService.patientPrescription(user as IAuthUser, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Prescription fetched successfully',
        meta: result.meta,
        data: result.data
    });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, prescriptionFilterableFields);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await PrescriptionService.getAllFromDB(filters, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Prescriptions retrieval successfully',
        meta: result.meta,
        data: result.data,
    });
});

export const PrescriptionController = {
    createPrescription,
    patientPrescription,
    getAllFromDB
}