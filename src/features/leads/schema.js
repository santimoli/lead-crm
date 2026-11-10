import {z} from 'zod'
export const lead_status = ["NEW", "CONTACTED", "QUALIFIED", "LOST"];

const status = z.enum(lead_status,"Invalid lead status");

const fields = {
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().toLowerCase().pipe(z.string().email("Invalid email")),
    company: z.string().trim().min(1, "Company is required"),

};

export const createLeadSchema = z.object({
    ...fields,
    status: status.optional().default("NEW"),
});

export const updateLeadSchema = z.object({...fields,status}).partial();

export const listLeadsSchema = z.object({
    search: z.string().trim().optional(),
    status:status.optional(),
    page:z.coerce.number().int().min(1).default(1),
    pageSize:z.coerce.number().int().min(1).max(100).default(20)

});

