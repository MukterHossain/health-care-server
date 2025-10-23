import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";
import pick from "../../helper/pick";
import { DoctorService } from "./doctor.service";
import sendResponse from "../../shared/sendResponse";
import { doctorFilterableFields } from "./doctor.constant";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const fillters = pick(req.query, doctorFilterableFields)

    const result = await DoctorService.getAllFromDB(fillters, options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Doctor fetched successfully!",
        meta: result.meta,
        data: result.data
    })
})
const getDoctorByIdFromDB = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id 
    const result = await DoctorService.getDoctorByIdFromDB(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Doctor fetched data by id successfully!",
        data: result
    })
})

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;

    const result = await DoctorService.updateIntoDB(id, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Doctor updated successfully!",
        data: result
    })
})
const deleteDoctorFromDB = catchAsync(async (req: Request, res: Response) => {


    const result = await DoctorService.deleteDoctorFromDB(req.params.id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Doctor deleted successfully!",
        data: null
    })
})
const getAISuggestions = catchAsync(async (req: Request, res: Response) => {


    const result = await DoctorService.getAISuggestions(req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Doctor AI suggestions successfully!",
        data: result
    })
})

const softDelete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DoctorService.softDelete(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Doctor soft deleted successfully',
        data: result,
    });
});


export const DoctorController = {
    getAllFromDB,
    getDoctorByIdFromDB,
    updateIntoDB,
    deleteDoctorFromDB,
    getAISuggestions,
    softDelete
}