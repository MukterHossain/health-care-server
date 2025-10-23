import { NextFunction, Request, Response } from "express"
import { JwtHelper } from "../helper/jwtHelper"
import ApiError from "../error/ApiError"
import httpStatus from "http-status"

const auth = (...roles:string[]) =>{
    return async (req:Request & {user?: any}, res:Response, next:NextFunction) =>{
        try {
            const token = req.cookies.accessToken
            if (!token) {
                throw new ApiError(httpStatus.UNAUTHORIZED,"You are not authorized!")
            }

            const verifyUser = JwtHelper.verifyToken(token, "abcd");

            req.user = verifyUser;

            if (roles.length && !roles.includes(verifyUser.role)) {
                throw new ApiError(httpStatus.UNAUTHORIZED,"You are not authorized!")
            }

            next();
        } catch (error) {
            next(error)
        }
    }
}

export default auth;