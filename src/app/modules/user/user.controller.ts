import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../shared/sendResponse";
import pick from "../../helper/pick";
import { userFilterableFields } from "./user.constant";

const createPatient = catchAsync(async (req:Request, res:Response) =>{
    const result = await UserService.createPatient(req)
    console.log("result", result);

    sendResponse(res, {
        statusCode:201,
        success:true,
        message:"Patient created successfully",
        data:result
    })
})
const createAdmin = catchAsync(async (req:Request, res:Response) =>{
    const result = await UserService.createAdmin(req)
    console.log("result", result);

    sendResponse(res, {
        statusCode:201,
        success:true,
        message:"Admin created successfully",
        data:result
    })
})
const createDoctor = catchAsync(async (req:Request, res:Response) =>{
    const result = await UserService.createDoctor(req)
    console.log("result", result);

    sendResponse(res, {
        statusCode:201,
        success:true,
        message:"Doctor created successfully",
        data:result
    })
})
const getAllFromDB = catchAsync(async (req:Request, res:Response) =>{
     const filters = pick(req.query, userFilterableFields) // searching , filtering
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting

    const result = await UserService.getAllFromDB(filters, options);

    // const {page, limit, searchTerm, sortBy, sortOrder, role, status} = req.query;
    // const result = await UserService.getAllFromDB({page:Number(page), limit: Number(limit), searchTerm, sortBy, sortOrder, role, status})
    // console.log("result", result);

    sendResponse(res, {
        statusCode:200,
        success:true,
        message:"User retrieved successfully",
        meta:result.meta,
        data:result.data,
    })
})

// const getMyProfile = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {

//     const user = req.user;

//     const result = await UserService.getMyProfile(user as IJWTPayload);

//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         success: true,
//         message: "My profile data fetched!",
//         data: result
//     })
// });

// const changeProfileStatus = catchAsync(async (req: Request, res: Response) => {

//     const { id } = req.params;
//     const result = await UserService.changeProfileStatus(id, req.body)

//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         success: true,
//         message: "Users profile status changed!",
//         data: result
//     })
// });

// const updateMyProfie = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {

//     const user = req.user;

//     const result = await UserService.updateMyProfie(user as IJWTPayload, req);

//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         success: true,
//         message: "My profile updated!",
//         data: result
//     })
// });


export const UserController = {
    createPatient,
    createAdmin,
    createDoctor,
    getAllFromDB
}