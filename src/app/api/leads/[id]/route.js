import {NextResponse} from 'next/server'
import {errorResponse} from "@/lib/http";
import {updateLead, deleteLead} from "@/features/leads/service";
import {updateLeadSchema} from "@/features/leads/schema";

export async function PATCH(request, context) {
    try{
        const params = context.params;
        const {id} =  await params;
        const data = updateLeadSchema.parse(await request.json());
        return NextResponse.json(await updateLead(id, data));
    }catch(error){
        return errorResponse(error);
    }
}

export async function DELETE(request, context ) {
    try{

        const params = context.params;
        const {id} =  await params;
        await deleteLead(id);
        return  new NextResponse(null, {status: 204});
    }catch(error){
        return errorResponse(error);
    }
}