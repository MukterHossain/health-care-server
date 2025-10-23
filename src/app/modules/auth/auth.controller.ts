import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.service";

const login = catchAsync(async (req:Request, res:Response) =>{
    const result = await AuthService.login(req.body)

    // console.log("result", result);
    const {accessToken, refreshToken, needPasswordChange} = result;

    res.cookie('accessToken', accessToken, {
        secure:true,
        httpOnly:true,
        sameSite:'none',
        maxAge: 1000 * 60 * 60 // 1 hour
    })
    res.cookie('refreshToken', refreshToken, {
        secure:true,
        httpOnly:true,
        sameSite:'none',
        maxAge: 1000 * 60 * 60 * 24 * 60 // 60 days
    })

    sendResponse(res, {
        statusCode:201,
        success:true,
        message:`${result.user?.role} login successfully`,
        data:{
            needPasswordChange
        }
    })
})




export const AuthController = {
    login
}