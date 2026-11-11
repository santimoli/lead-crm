import { prisma } from "@/lib/prisma";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { leadStatuses } from "@/features/leads/status";

const newFirst = [{ createdAt: "desc" }, { id: "desc" }];

function handlePrismaError(error) {
  if (error.code === "P2002") {
    const message = "A lead with this email already exists";
    throw new ConflictError(message, { email: message });
  }
  if (error.code === "P2025") throw new NotFoundError("Lead not found");
  throw error;
}

export async function listLeads({ search, status, page, pageSize }) {
  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [{ name: { contains: search } }, { email: { contains: search } }],
    }),
  };
  const [data, total] = await prisma.$transaction([
    prisma.lead.findMany({
      where,
      orderBy: newFirst,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count({ where }),
  ]);

  return { data, meta: { total, page, pageSize } };
}

export function createLead(data) {
  return prisma.lead.create({ data }).catch(handlePrismaError);
}

export function updateLead(id, data) {
  return prisma.lead.update({ where: { id }, data }).catch(handlePrismaError);
}

export function deleteLead(id) {
  return prisma.lead.delete({ where: { id } }).catch(handlePrismaError);
}

export async function getLeadStats() {
  const [groups, total, recent] = await prisma.$transaction([
    prisma.lead.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.lead.count(),
    prisma.lead.findMany({
      orderBy: newFirst,
      take: 5,
      select: { id: true, name: true, createdAt: true },
    }),
  ]);

  const byStatus = Object.fromEntries(
    leadStatuses.map((status) => [status, 0]),
  );
  for (const group of groups) {
    byStatus[group.status] = group._count.status;
  }
  return { total, byStatus, recent };
}
