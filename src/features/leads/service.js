import { prisma } from "@/lib/prisma";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { lead_status } from "@/features/leads/schema";

const newFirst = [{ createdAt: "desc" }, { id: "desc" }];

function ErrorsPrisma(error) {
  if (error.code === "P2002") {
    const message = "A lead with this email already exists";
    throw new ConflictError(message, { email: message });
  }
  if (error.code === "P2025") throw new NotFoundError("Lead not found");
  throw error;
}

export async function listLeads({ search, status, page, pageSize }) {
  const findLead = {
    ...(status && { status }),
    ...(search && {
      OR: [{ name: { contains: search } }, { email: { contains: search } }],
    }),
  };
  const [data, total] = await prisma.$transaction([
    prisma.lead.findMany({
      where: findLead,
      orderBy: newFirst,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count({ where: findLead }),
  ]);

  return { data, meta: { total, page, pageSize } };
}

export function createLead(data) {
  return prisma.lead.create({ data }).catch(ErrorsPrisma);
}

export function updateLead(id, data) {
  return prisma.lead.update({ where: { id }, data }).catch(ErrorsPrisma);
}

export function deleteLead(id) {
  return prisma.lead.delete({ where: { id } }).catch(ErrorsPrisma);
}

export async function getLeadStats() {
  const [groups, total, recent] = await prisma.$transaction([
    prisma.lead.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.lead.count(),
    prisma.lead.findMany({ orderBy: newFirst, take: 5 }),
  ]);

  const byStatus = Object.fromEntries(lead_status.map((status) => [status, 0]));
  for (const group of groups) {
    byStatus[group.status] = group._count.status;
  }
  return { total, byStatus, recent };
}
