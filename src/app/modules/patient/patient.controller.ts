import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";
import pick from "../../helper/pick";
import sendResponse from "../../shared/sendResponse";
import { PatientService } from "./patient.service";
import { patientFilterableFields } from "./patient.constant";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const fillters = pick(req.query, patientFilterableFields)

    const result = await PatientService.getAllFromDB(fillters, options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Patient fetched successfully!",
        meta: result.meta,
        data: result.data
    })
})
const getSingleByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  
    const result = await PatientService.getSingleByIdFromDB(req.params.id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Patient single data fetched successfully!",
        data: result
    })
})

const updateIntoDB = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {

    const user = req.user;

    const result = await PatientService.updateIntoDB(user as IJWTPayload, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Patient updated successfully!",
        data: result
    })
})
const softDelete  = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;

    const result = await PatientService.softDelete(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Patient Deleted successfully!",
        data: null
    })
})


export const PatientController = {
    getAllFromDB,
    getSingleByIdFromDB,
    updateIntoDB,
    softDelete 
}