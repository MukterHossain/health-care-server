import { Gender } from "@prisma/client";

export type IAdminUpdateInput = {
    name?: string | undefined;
    email?: string | undefined;
    contactNumber?: string | undefined;
    searchTerm?: string | undefined;
}