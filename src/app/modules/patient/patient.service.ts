import { Doctor, Patient, Prisma, UserStatus } from "@prisma/client";
import { paginationHelper } from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";

import { patientSearchableFields } from "./patient.constant";
import { IJWTPayload } from "../../types/common";
import { IPatientFilterRequest } from "./patient.interface";
import { IPaginationOptions } from "../../interface/pagination";


const getAllFromDB = async (filters: IPatientFilterRequest, options: IPaginationOptions, includeHealthData: boolean = false) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions = [];

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
        andConditions.push({
            AND: Object.keys(filterData).map((key) => {
                return {
                    [key]: {
                        equals: (filterData as any)[key],
                    },
                };
            }),
        });
        // const filterConditions = Object.keys(filterData).map((key) => ({
        //     [key]: {
        //         equals: (filterData as any)[key]
        //     }
        // }))

        // andConditions.push(...filterConditions)
        andConditions.push({
            isDeleted: false
        })
    }

    const whereConditions: Prisma.PatientWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.patient.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            // [sortBy]: sortOrder
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                    createdAt: 'desc',
                }

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
            id,
            isDeleted: false
        }
    });
    return result;


}
const updateIntoDB = async (user: IJWTPayload, payload: any) => {
    const { medicalReport, patientHealthData, ...patientData } = payload;
    const patientInfo = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
            isDeleted: false
        }
    });

    return await prisma.$transaction(async (tnx) => {
        await tnx.patient.update({
            where: {
                id: patientInfo.id
            },
            data: patientData
        })
        if (patientHealthData) {
            await tnx.patientHealthData.upsert({
                where: {
                    patientId: patientInfo.id
                },
                update: patientHealthData,
                create: {
                    ...patientHealthData,
                    patientId: patientInfo.id
                }
            })
        }
        if (medicalReport) {
            await tnx.medicalReport.create({
                data: {
                    ...medicalReport,
                    patientId: patientInfo.id
                }
            })
        }
        const result = await tnx.patient.findUnique({
            where: {
                id: patientInfo.id
            },
            include: {
                patientHealthData: true,
                medicalReport: true
            }
        })

        return result
    })


}
const softDelete = async (id: string): Promise<Patient | null> => {
    return await prisma.$transaction(async transactionClient => {
        const deletedPatient = await transactionClient.patient.update({
            where: { id },
            data: {
                isDeleted: true,
            },
        });

        await transactionClient.user.update({
            where: {
                email: deletedPatient.email,
            },
            data: {
                status: UserStatus.DELETED,
            },
        });

        return deletedPatient;
    });
};

export const PatientService = {
    getAllFromDB,
    getSingleByIdFromDB,
    updateIntoDB,
    softDelete
}