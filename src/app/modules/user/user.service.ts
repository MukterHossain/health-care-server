import { Request } from "express";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { fileUploader } from "../../helper/fileUploader";
import { Admin, Doctor, Prisma, UserRole, UserStatus } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { userSearchableFields } from "./user.constant";
import { IJWTPayload } from "../../types/common";


const createPatient = async (req:Request) =>{
          if (req.file) {
        const uploadResult = await fileUploader.uploadToCloudinary(req.file)
        console.log("uploadResult", uploadResult);
        req.body.patient.profilePhoto = uploadResult?.secure_url
    }
    const hasshedPassword = await bcrypt.hash(req.body.password, 10);

    const result = await prisma.$transaction(async (tnx) => {
        await tnx.user.create({
            data: {
                email: req.body.patient.email,
                password: hasshedPassword
            }
        });
      return  await tnx.patient.create({
            data:req.body.patient
        })
    })
    console.log("result", result);
    return result;
}

const createAdmin = async (req:Request): Promise<Admin> =>{
    const file = req.file;
          if (file) {
        const uploadResult = await fileUploader.uploadToCloudinary(file)
        console.log("uploadResult", uploadResult);
        req.body.admin.profilePhoto = uploadResult?.secure_url
    }
    const hasshedPassword = await bcrypt.hash(req.body.password, 10);

    const userData ={
        email: req.body.admin.email,
        password: hasshedPassword,
        role: UserRole.ADMIN
    }

    const result = await prisma.$transaction(async (transactionClient) => {
        await transactionClient.user.create({
            data: userData
        });

      const createAdminData =  await transactionClient.admin.create({
            data:req.body.admin
        })
        return createAdminData;
    })
    console.log("result", result);
    return result;
}
const createDoctor = async (req:Request):Promise<Doctor> =>{
          const file = req.file;
          if (file) {
        const uploadResult = await fileUploader.uploadToCloudinary(file)
        console.log("uploadResult", uploadResult);
        req.body.doctor.profilePhoto = uploadResult?.secure_url
    }
    const hasshedPassword = await bcrypt.hash(req.body.password, 10);

    const userData ={
        email: req.body.doctor.email,
        password: hasshedPassword,
        role: UserRole.DOCTOR
    }

    // new code 11/19
    const {specialties, ...doctorData} = req.body.doctor

    const result = await prisma.$transaction(async (transactionClient) => {
        // Step 1: Create user
        await transactionClient.user.create({
            data: userData,
        });

        // Step 2: Create doctor
        const createdDoctorData = await transactionClient.doctor.create({
            data: doctorData,
        });

        // Step 3: Create doctor specialties if provided
        if (specialties && Array.isArray(specialties) && specialties.length > 0) {
            // Verify all specialties exist
            const existingSpecialties = await transactionClient.specialties.findMany({
                where: {
                    id: {
                        in: specialties,
                    },
                },
                select: {
                    id: true,
                },
            });

            const existingSpecialtyIds = existingSpecialties.map((s) => s.id);
            const invalidSpecialties = specialties.filter(
                (id) => !existingSpecialtyIds.includes(id)
            );

            if (invalidSpecialties.length > 0) {
                throw new Error(
                    `Invalid specialty IDs: ${invalidSpecialties.join(", ")}`
                );
            }

            // Create doctor specialties relations
            const doctorSpecialtiesData = specialties.map((specialtyId) => ({
                doctorId: createdDoctorData.id,
                specialitiesId: specialtyId,
            }));

            await transactionClient.doctorSpecialties.createMany({
                data: doctorSpecialtiesData,
            });
        }

        // Step 4: Return doctor with specialties
        const doctorWithSpecialties = await transactionClient.doctor.findUnique({
            where: {
                id: createdDoctorData.id,
            },
            include: {
                doctorSpecialties: {
                    include: {
                        specialities: true,
                    },
                },
            },
        });

        return doctorWithSpecialties!;
    });

    return result;
    // const result = await prisma.$transaction(async (transactionClient) => {
    //     await transactionClient.user.create({
    //         data: userData
    //     });

    //   const createDoctorData =  await transactionClient.doctor.create({
    //         data:req.body.doctor
    //     })
    //     return createDoctorData;
    // })
    // console.log("result", result);
    // return result;
}

const getAllFromDB =async(params:any, options: IOptions)=>{
 
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    // const pageNumber = page || 1;
    // const limitNumber = limit || 10;
    // console.log("page", page, "limit", limit);
    // const skip = (pageNumber -1) * limitNumber

    const andConditions: Prisma.UserWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: userSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        })
    }

    const whereConditions: Prisma.UserWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}

    const result = await prisma.user.findMany({
        skip,
        take:limit,
        where: whereConditions,
        orderBy:{
            [sortBy]: sortOrder
        }
    })
    const total = await prisma.user.count({
        where: whereConditions
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


const getMyProfile = async (user: IJWTPayload) => {
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: UserStatus.ACTIVE
        },
        select: {
            id: true,
            email: true,
            needPasswordChange: true,
            role: true,
            status: true
        }
    })

    let profileData;

    if (userInfo.role === UserRole.PATIENT) {
        profileData = await prisma.patient.findUnique({
            where: {
                email: userInfo.email
            }
        })
    }
    else if (userInfo.role === UserRole.DOCTOR) {
        profileData = await prisma.doctor.findUnique({
            where: {
                email: userInfo.email
            }
        })
    }
    else if (userInfo.role === UserRole.ADMIN) {
        profileData = await prisma.admin.findUnique({
            where: {
                email: userInfo.email
            }
        })
    }

    return {
        ...userInfo,
        ...profileData
    };

};

const changeProfileStatus = async (id: string, payload: { status: UserStatus }) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            id
        }
    })

    const updateUserStatus = await prisma.user.update({
        where: {
            id
        },
        data: payload
    })

    return updateUserStatus;
};

const updateMyProfie = async (user: IJWTPayload, req: Request) => {
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            email: user?.email,
            status: UserStatus.ACTIVE
        }
    });

    const file = req.file;
    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        req.body.profilePhoto = uploadToCloudinary?.secure_url;
    }

    let profileInfo;

    if (userInfo.role === UserRole.ADMIN) {
        profileInfo = await prisma.admin.update({
            where: {
                email: userInfo.email
            },
            data: req.body
        })
    }
    else if (userInfo.role === UserRole.DOCTOR) {
        profileInfo = await prisma.doctor.update({
            where: {
                email: userInfo.email
            },
            data: req.body
        })
    }
    else if (userInfo.role === UserRole.PATIENT) {
        profileInfo = await prisma.patient.update({
            where: {
                email: userInfo.email
            },
            data: req.body
        })
    }

    return { ...profileInfo };
}






export const UserService = {
    createPatient,
    createAdmin,
    createDoctor,
    getAllFromDB,
    getMyProfile,
    changeProfileStatus,
    updateMyProfie
}