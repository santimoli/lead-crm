const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const leads = [
  { name: "Ana Costa", email: "ana.costa@example.com", company: "Costa & Filhos", status: "NEW" },
  { name: "Rui Ferreira", email: "rui.ferreira@example.com", company: "Lusotrans", status: "NEW" },
  { name: "Marta Silva", email: "marta.silva@example.com", company: "Atlântico Seguros", status: "CONTACTED" },
  { name: "João Pereira", email: "joao.pereira@example.com", company: "Pereira Construções", status: "QUALIFIED" },
  { name: "Inês Rocha", email: "ines.rocha@example.com", company: "Rocha Design", status: "LOST" },
  { name: "Pedro Santos", email: "pedro.santos@example.com", company: "Douro Vinhos", status: "CONTACTED" },
  { name: "Carla Mendes", email: "carla.mendes@example.com", company: "Mendes Contabilidade", status: "NEW" },
  { name: "Tiago Lopes", email: "tiago.lopes@example.com", company: "Lopes Logística", status: "QUALIFIED" },
  { name: "Sofia Martins", email: "sofia.martins@example.com", company: "Studio Martins", status: "CONTACTED" },
  { name: "Miguel Alves", email: "miguel.alves@example.com", company: "Alves Informática", status: "NEW" },
  { name: "Beatriz Gomes", email: "beatriz.gomes@example.com", company: "Gomes Imobiliária", status: "LOST" },
  { name: "Diogo Ribeiro", email: "diogo.ribeiro@example.com", company: "Ribeiro Energia", status: "QUALIFIED" },
  { name: "Joana Carvalho", email: "joana.carvalho@example.com", company: "Carvalho Têxteis", status: "CONTACTED" },
  { name: "André Sousa", email: "andre.sousa@example.com", company: "Sousa Marketing", status: "NEW" },
  { name: "Rita Fernandes", email: "rita.fernandes@example.com", company: "Fernandes Clínica", status: "CONTACTED" },
];

async function main() {
  for (const [i, lead] of leads.entries()) {
    const createdAt = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    await prisma.lead.upsert({
      where: { email: lead.email },
      update: {},
      create: { ...lead, createdAt },
    });
  }
  console.log(`Seeded ${leads.length} leads`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
