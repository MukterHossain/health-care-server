import { Doctor, Prisma } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import { IPatientUpdateInput } from "./patient.interface";
import { patientSearchableFields } from "./patient.constant";


const getAllFromDB = async (filters: any, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
    const { searchTerm,  ...filterData } = filters;

    const andConditions: Prisma.PatientWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: patientSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }


    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: (filterData as any)[key]
            }
        }))

        andConditions.push(...filterConditions)
    }

    const whereConditions: Prisma.PatientWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.patient.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
    });

    const total = await prisma.patient.count({
        where: whereConditions
    })

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    }
}

const getSingleByIdFromDB = async (id: string) => {
    const result = await prisma.patient.findUniqueOrThrow({
        where: {
            id
        }
    });
    return result;


}
const updateIntoDB = async (id: string, payload: Partial<IPatientUpdateInput>) => {
    const patientInfo = await prisma.patient.findUniqueOrThrow({
        where: {
            id
        }
    });

    const updatePatient = await prisma.patient.update({
        where:{
            id: patientInfo.id
        },
        data:payload
    })
    return updatePatient;


}

const deletePatientFromDB = async (id: string) => {
    const result = await prisma.patient.delete({
        where: {
            id
        }
    });
    return result;


}

export const PatientService = {
    getAllFromDB,
    getSingleByIdFromDB,
    updateIntoDB,
    deletePatientFromDB
}