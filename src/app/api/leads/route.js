import {NextResponse} from 'next/server'
import {errorResponse} from "@/lib/http";
import {createLead, listLeads} from "@/features/leads/service";
import {createLeadSchema, listLeadsSchema} from "@/features/leads/schema";

export async function GET(request) {
    try{
        const query = Object.fromEntries([...request.nextUrl.searchParams].filter(([,value]) => value !== ''))
        const filters =  listLeadsSchema.parse(query);
        return NextResponse.json(await listLeads(filters));
    }catch(error){
        return errorResponse(error);
    }
}

export async function POST(request) {
    try{
        const data = createLeadSchema.parse(await request.json());
        return NextResponse.json(await createLead(data), {status: 201});
    }catch(error){
        return errorResponse(error);
    }
}