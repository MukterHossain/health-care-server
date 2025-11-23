import { NextFunction, Request, Response } from "express"

import ApiError from "../error/ApiError"
import httpStatus from "http-status"
import config from "../../config"
import { Secret } from "jsonwebtoken"
import { jwtHelper } from "../helper/jwtHelper"

const auth = (...roles:string[]) =>{
    return async (req:Request & {user?: any}, res:Response, next:NextFunction) =>{
        try {
            const token = req.cookies.accessToken
            // console.log(req.cookies)
            if (!token) {
                throw new ApiError(httpStatus.UNAUTHORIZED,"You are not authorized!")
            }

            const verifyUser = jwtHelper.verifyToken(token, config.jwt.jwt_secret as Secret);

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