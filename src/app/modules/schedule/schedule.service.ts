import { Request } from "express";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { fileUploader } from "../../helper/fileUploader";
import { addHours, addMinutes, format } from "date-fns";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { Prisma } from "@prisma/client";
import { IJWTPayload } from "../../types/common";

const inserIntoDB = async (payload:any) =>{
    const {startTime, endTime, startDate, endDate}= payload
    console.log({startTime, endTime, startDate, endDate})
    const invervalTime = 30;
    const schedule = []

    const currentDate = new Date(startDate)
    const lastDate = new Date(endDate)

    while(currentDate <= lastDate){
        const startDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(startTime.split(":")[0])
                ),
                 Number(startTime.split(":")[1])
            )
        )

        const endDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(endTime.split(":")[0])
                ),
                 Number(endTime.split(":")[1])
            )
        )
        console.log({startDateTime, endDateTime})
        while(startDateTime < endDateTime){
            const slotStartDateTime = startDateTime;
            const slotEndDateTime = addMinutes(startDateTime, invervalTime)

            const scheduleData ={
                startDateTime: slotStartDateTime,
                endDateTime: slotEndDateTime
            }
            console.log("scheduleData", scheduleData)
            const existingSchedule = await prisma.schedule.findFirst({
                where: scheduleData
            })
            if(!existingSchedule){
                const result = await prisma.schedule.create({
                    data: scheduleData
                })
                schedule.push(result)
            }
            slotStartDateTime.setMinutes(slotStartDateTime.getMinutes() + invervalTime);
        }
        currentDate.setDate(currentDate.getDate() + 1)
    }
         
    return schedule;
}

const schedulesForDoctor = async(user:IJWTPayload, filters:any, options:IOptions) =>{
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const {startDateTime: filterStartDateTime, endDateTime: filterEndDateTime} = filters

    const andConditions: Prisma.ScheduleWhereInput[] = [];

    if(filterStartDateTime && filterEndDateTime){
        andConditions.push({
            AND: [
                {
                    startDateTime: {
                        gte: filterStartDateTime
                    }
                },
                {
                    endDateTime: {
                        lte: filterEndDateTime
                    }
                }
            ]
        })
    }
     const whereConditions: Prisma.ScheduleWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}

    const doctorSchedules = await prisma.doctorSchedules.findMany({
        where: {
            doctor: {
                email:user.email
            }
        },
        select:{
            scheduleId:true
        }
    })
    console.log("doctor Schedule", doctorSchedules)

    const doctorScheduleIds = doctorSchedules.map(shedule => shedule.scheduleId)

    const result = await prisma.schedule.findMany({
        skip,
        take:limit,
        where: {
            ...whereConditions,
            id:{
                notIn:doctorScheduleIds
            }
        },
        orderBy:{
            [sortBy]: sortOrder
        }
    })
    const total = await prisma.schedule.count({
        where: {
            ...whereConditions,
            id:{
                notIn:doctorScheduleIds
            }
        },
    })
    return {
        meta:{
            page,
            limit,
            total
        },
        data:result
    };
}


const deleteScheduleFromDB = async(id:string) =>{
    return await prisma.schedule.delete({
        where: {id}
    })
   
}









export const ScheduleService = {
    inserIntoDB,
    schedulesForDoctor,
    deleteScheduleFromDB
    
}