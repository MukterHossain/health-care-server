import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ScheduleService } from "./schedule.service";
import pick from "../../helper/pick";
import { IJWTPayload } from "../../types/common";

const inserIntoDB = catchAsync(async (req:Request, res:Response) =>{
    const result = await ScheduleService.inserIntoDB(req.body)
    

    sendResponse(res, {
        statusCode:201,
        success:true,
        message:"Schedule created successfully",
        data:result
    })
})

const schedulesForDoctor = catchAsync(async (req:Request &{user?: IJWTPayload}, res:Response) =>{
       const filters = pick(req.query, ["startDateTime", "endDateTime"]) // searching , filtering
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting
    const user = req.user
    const result = await ScheduleService.schedulesForDoctor(user as IJWTPayload, filters, options)
    console.log("result", result);

    sendResponse(res, {
        statusCode:201,
        success:true,
        message:"Schedule created successfully",
        data:result.data,
        meta: result.meta
    })
})
const deleteScheduleFromDB = catchAsync(async (req:Request, res:Response) =>{
     

    const result = await ScheduleService.deleteScheduleFromDB(req.params.id)
    

    sendResponse(res, {
        statusCode:201,
        success:true,
        message:"Schedule delete successfully",
        data: null
    })
})





export const ScheduleController = {
    inserIntoDB,
    schedulesForDoctor,
    deleteScheduleFromDB

}