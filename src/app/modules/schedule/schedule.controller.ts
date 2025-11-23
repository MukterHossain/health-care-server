import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ScheduleService } from "./schedule.service";
import pick from "../../helper/pick";
import { IJWTPayload } from "../../types/common";
import httpStatus from "http-status";
import { IAuthUser } from "../../interface/common";
const inserIntoDB = catchAsync(async (req:Request, res:Response) =>{
    const result = await ScheduleService.inserIntoDB(req.body)
    

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success:true,
        message:"Schedule created successfully",
        data:result
    })
})

const getAllFromDB = catchAsync(async (req:Request &{user?: IAuthUser}, res:Response) =>{
    //    const filters = pick(req.query, ["startDateTime", "endDateTime"]) // searching , filtering
    const filters = pick(req.query, ['startDate', 'endDate']);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting
    const user = req.user
    const result = await ScheduleService.getAllFromDB( filters, options, user as IAuthUser)
    // console.log("result", result);

    sendResponse(res, {
        statusCode:httpStatus.OK,
        success:true,
        message:"Schedule retrieval successfully",
        data:result.data,
        meta: result.meta
    })
})

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ScheduleService.getByIdFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Schedule retrieval successfully',
        data: result,
    });
});
const deleteFromDB = catchAsync(async (req:Request, res:Response) =>{
     

    const result = await ScheduleService.deleteFromDB(req.params.id)
    

    sendResponse(res, {
        statusCode:httpStatus.OK,
        success:true,
        message:"Schedule delete successfully",
        data: result
    })
})





export const ScheduleController = {
    inserIntoDB,
    getAllFromDB,
    getByIdFromDB,
    deleteFromDB

}