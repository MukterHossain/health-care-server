import { AppointmentStatus, PaymentStatus, Prisma, UserRole } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import ApiError from "../../error/ApiError";
import httpStatus from "http-status"
import { IJWTPayload } from "../../types/common";
import { v4 as uuidv4 } from 'uuid';
import { stripe } from "../../helper/stripe";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { IAuthUser } from "../../interface/common";
import { IPaginationOptions } from "../../interface/pagination";


const createAppointment = async (user: IAuthUser, payload: { doctorId: string, scheduleId: string }) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    })

    // const doctorData = await prisma.doctor.findUniqueOrThrow({
    //     where: {
    //         id: payload.doctorId,
    //         isDeleted: false
    //     }
    // })
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId
        }
    });

    await prisma.doctorSchedules.findFirstOrThrow({
        where: {
            doctorId: doctorData.id,
            scheduleId: payload.scheduleId,
            isBooked: false
        }
    });

    // const isBookedOrNot = await prisma.doctorSchedules.findFirstOrThrow({
    //     where: {
    //         doctorId: payload.doctorId,
    //         scheduleId: payload.scheduleId,
    //         isBooked: false
    //     }
    // })

    const videoCallingId: string = uuidv4();

    const result = await prisma.$transaction(async (tnx) => {
        const appointmentData = await tnx.appointment.create({
            data: {
                patientId: patientData.id,
                doctorId: doctorData.id,
                scheduleId: payload.scheduleId,
                videoCallingId,
            },
            include: {
                patient: true,
                doctor: true,
                schedule: true
            }
        })
        await tnx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: payload.scheduleId
                }
            },
            data: {
                isBooked: true,
                 appointmentId: appointmentData.id
            }
        })
        // const videoCallingId: string = uuidv4();

        // console.log("transactionId", transactionId)
        // console.log("appointmentData", appointmentData)

        // const paymentData = await tnx.payment.create({
        //     data: {
        //         appointmentId: appointmentData.id,
        //         amount: doctorData.appointmentFee,
        //         transactionId
        //     }
        // })
         // PH-HealthCare-datatime
        const today = new Date();

        const transactionId = "HealthCare-" + today.getFullYear() + "-" + today.getMonth() + "-" + today.getDay() + "-" + today.getHours() + "-" + today.getMinutes();

        await tnx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId
            }
        })

        return appointmentData;

        // console.log("doctorData", doctorData)
        // const session = await stripe.checkout.sessions.create({
        //     payment_method_types: ["card"],
        //     mode: "payment",
        //     customer_email: user.email,
        //     line_items: [
        //         {
        //             price_data: {
        //                 currency: "bdt",
        //                 product_data: {
        //                     name: `Appointment with ${doctorData.name}`,
        //                 },
        //                 unit_amount: doctorData.appointmentFee * 100,
        //             },
        //             quantity: 1,
        //         },
        //     ],
        //     metadata: {
        //         appointmentId: appointmentData.id,
        //         paymentId: paymentData.id
        //     },
        //     success_url: `https://www.programming-hero.com`,
        //     cancel_url: `https://next.programming-hero.com`,
        // });
        // console.log("session", session)
        // return { paymentUrl: session.url };

        // return appointmentData
    })

    return result


}

const getMyAppointment = async (user: IAuthUser, filters: any, options: IPaginationOptions) => {
   const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { ...filterData } = filters;

    const andConditions: Prisma.AppointmentWhereInput[] = [];

    if (user?.role === UserRole.PATIENT) {
        andConditions.push({
            patient: {
                email: user?.email
            }
        })
    }
    else if (user?.role === UserRole.DOCTOR) {
        andConditions.push({
            doctor: {
                email: user?.email
            }
        })
    }

    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map(key => ({
            [key]: {
                equals: (filterData as any)[key],
            },
        }));
        andConditions.push(...filterConditions);
    }

    const whereConditions: Prisma.AppointmentWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.appointment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { createdAt: 'desc' },
        include: user?.role === UserRole.PATIENT
            ? { doctor: true, schedule: true, review: true, prescription: true }
            : {
                patient: {
                    include: { medicalReport: true, patientHealthData: true },
                },
                schedule: true,
                prescription: true,
                review: true,
            }
    });

    const total = await prisma.appointment.count({
        where: whereConditions,
    });

    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };

}


const getAllAppointment = async (filters: any,
    options: IPaginationOptions) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { patientEmail, doctorEmail, ...filterData } = filters;
    const andConditions = [];

    if (patientEmail) {
        andConditions.push({
            patient: {
                email: patientEmail
            }
        })
    }
    else if (doctorEmail) {
        andConditions.push({
            doctor: {
                email: doctorEmail
            }
        })
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => {
                return {
                    [key]: {
                        equals: (filterData as any)[key]
                    }
                };
            })
        });
    }

    // if (Object.keys(filterData).length > 0) {
    //     const filterConditions = Object.keys(filterData).map(key => ({
    //         [key]: {
    //             equals: (filterData as any)[key]
    //         }
    //     }))

    //     andConditions.push(...filterConditions)
    // }

    // console.dir(andConditions, { depth: Infinity })
    const whereConditions: Prisma.AppointmentWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.appointment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                    createdAt: 'desc',
                },
        include: {
            doctor: true,
            patient: true
        }
    });

    const total = await prisma.appointment.count({
        where: whereConditions
    });
    console.log("total", total)
    console.log("andConditions", andConditions)

    return {
        meta: {
            total,
            limit,
            page
        },
        data: result
    }

}



const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus, user: IAuthUser) => {
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId
        },
        include: {
            doctor: true
        }
    });

    if (user?.role === UserRole.DOCTOR) {
        if (!(user.email === appointmentData.doctor.email))
            throw new ApiError(httpStatus.BAD_REQUEST, "This is not your appointment")
    }

    const result = await prisma.appointment.update({
        where: {
            id: appointmentId
        },
        data: {
            status
        }
    })

    return result

}
const cancelUnpaidAppointments = async () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

    const unPaidAppointments = await prisma.appointment.findMany({
        where: {
            createdAt: {
                lte: thirtyMinAgo
            },
            paymentStatus: PaymentStatus.UNPAID
        }
    })

    const appointmentIdsToCancel = unPaidAppointments.map(appointment => appointment.id);

    await prisma.$transaction(async (tnx) => {
        await tnx.payment.deleteMany({
            where: {
                appointmentId: {
                    in: appointmentIdsToCancel
                }
            }
        })

        await tnx.appointment.deleteMany({
            where: {
                id: {
                    in: appointmentIdsToCancel
                }
            }
        })

        for (const unPaidAppointment of unPaidAppointments) {
            await tnx.doctorSchedules.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: unPaidAppointment.doctorId,
                        scheduleId: unPaidAppointment.scheduleId
                    }
                },
                data: {
                    isBooked: false
                }
            })
        }
    })
}



export const AppointmentService = {
    createAppointment,
    getAllAppointment,
    getMyAppointment,
    updateAppointmentStatus,
    cancelUnpaidAppointments
}