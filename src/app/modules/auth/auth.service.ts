import { Request } from "express";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { UserStatus } from "@prisma/client";
import jwt from "jsonwebtoken"
import { JwtHelper } from "../../helper/jwtHelper";
import ApiError from "../../error/ApiError";
import httpStatus from "http-status";


const login = async (payload: {email:string, password:string}) =>{
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                email: payload.email,
                status: UserStatus.ACTIVE
            }
        })
        const isCorrectPassword = await bcrypt.compare(payload.password, user.password);
        if(!isCorrectPassword){
            throw new ApiError(httpStatus.BAD_REQUEST,"Password is incorrect")
        }

        const accessToken = JwtHelper.generateToken({email:user.email, role:user.role}, 'abcd', "2h")

        // const accessToken =jwt.sign({email:user.email, role:user.role}, 'abcd', {
        //     algorithm:'HS256',
        //     expiresIn:'2h'
        // })
        const refreshToken =JwtHelper.generateToken({email:user.email, role:user.role}, 'abcd', "60d")
        // const refreshToken =jwt.sign({email:user.email, role:user.role}, 'abcd', {
        //     algorithm:'HS256',
        //     expiresIn:'60d'
        // })
        return {
            accessToken,
            refreshToken,
            needPasswordChange:user.needPasswordChange,
            user
        }
}




export const AuthService = {
    login
}