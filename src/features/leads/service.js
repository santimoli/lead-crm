import { prisma} from "@/lib/prisma";
import {ConflictError,NotFoundError} from "@/lib/errors";

const newFirst = [{createdAt: 'desc'},{id: 'desc'}]

function ErrorsPrisma(error){
    if(error.code === 'P2002'){
        const message = 'A lead with this email already exists'
        throw new ConflictError(message,{email:message})
    }
    if(error.code === 'P2025') throw new NotFoundError('Lead not found');
    throw error;
}

export async function listLeads({search,status, page, pageSize}) {
    const findLead = {
        ...(status && {status}),
        ...(search && {
            OR: [{name: {contains: search}}, {email: {contains: search}}],
        }),
    };
    const [data,total] = await prisma.$transaction([
        prisma.lead.findMany({
            where: findLead,
            orderBy: newFirst,
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.lead.count({where: findLead}),
    ]);

    return {data,meta:{total,page,pageSize}};
}


export function createLead(data) {return prisma.lead.create({data}).catch(ErrorsPrisma);}

export function updateLead(id,data) {return prisma.lead.update({where:{id},data}).catch(ErrorsPrisma);}

export function deleteLead(id) {return prisma.lead.delete({where:{id}}).catch(ErrorsPrisma);}