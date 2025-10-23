import { Admin, Prisma, UserStatus } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import { IAdminUpdateInput } from "./admin.interface";
import { adminSearchableFields } from "./admin.constant";

const getAllFromDB = async (filters: any, options: IOptions) => {
 const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
     const { searchTerm,  ...filterData } = filters;
 
     const andConditions: Prisma.AdminWhereInput[] = [];
 
     if (searchTerm) {
         andConditions.push({
             OR: adminSearchableFields.map((field) => ({
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
 
     const whereConditions: Prisma.AdminWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};
 
     const result = await prisma.admin.findMany({
         where: whereConditions,
         skip,
         take: limit,
         orderBy: {
             [sortBy]: sortOrder
         },
     });
 
     const total = await prisma.admin.count({
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
    const result = await prisma.admin.findUniqueOrThrow({
        where: {
            id
        }
    });
    return result;


}

const updateIntoDB = async (id: string, payload: Partial<IAdminUpdateInput>) => {
    const adminInfo = await prisma.admin.findUniqueOrThrow({
        where: {
            id
        }
    });
    const result = await prisma.admin.update({
        where:{
            id:adminInfo.id
        },
        data:payload
    })
    return result;
}

const deleteAdminFromDB = async (id: string) => {
    const result = await prisma.admin.delete({
        where: {
            id
        }
    });
    return result;



}
const softDeleteFromDB = async (id: string): Promise<Admin | null> => {
    await prisma.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false
        }
    });

    const result = await prisma.$transaction(async (transactionClient) => {
        const adminDeletedData = await transactionClient.admin.update({
            where: {
                id
            },
            data: {
                isDeleted: true
            }
        });

        await transactionClient.user.update({
            where: {
                email: adminDeletedData.email
            },
            data: {
                status: UserStatus.DELETED
            }
        });

        return adminDeletedData;
    });

    return result;
}
export const AdminService = {
    getAllFromDB,
    getSingleByIdFromDB,
    updateIntoDB,
    deleteAdminFromDB,
    softDeleteFromDB
}