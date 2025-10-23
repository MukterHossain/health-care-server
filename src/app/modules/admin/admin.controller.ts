import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";
import pick from "../../helper/pick";
import sendResponse from "../../shared/sendResponse";
import { AdminService } from "./admin.service";
import { adminFilterableFields } from "./admin.constant";
import httpStatus from 'http-status';

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const fillters = pick(req.query, adminFilterableFields)

    const result = await AdminService.getAllFromDB(fillters, options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Admin fetched successfully!",
        meta: result.meta,
        data: result.data
    })
})

const getSingleByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  
    const result = await AdminService.getSingleByIdFromDB(req.params.id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Patient single data fetched successfully!",
        data: result
    })
})

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;

    const result = await AdminService.updateIntoDB(id, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Admin updated successfully!",
        data: result
    })
})

const deleteAdminFromDB = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;

    const result = await AdminService.deleteAdminFromDB(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Admin Deleted successfully!",
        data: null
    })
})
const softDeleteFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await AdminService.softDeleteFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin data deleted!",
        data: result
    })
})


export const AdminController = {
    getAllFromDB,
    getSingleByIdFromDB,
    updateIntoDB,
    deleteAdminFromDB,
    softDeleteFromDB
}