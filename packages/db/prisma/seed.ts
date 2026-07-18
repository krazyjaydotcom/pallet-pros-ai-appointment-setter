import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.knowledgeEntry.upsert({
    where: { id: "kb_training_url" },
    update: {},
    create: {
      id: "kb_training_url",
      title: "Training URL",
      category: "Training",
      content: "The free training link is shared with interested prospects.",
      retrievalSummary: "Use when a lead is warm and needs the training link.",
      tags: ["training", "link"],
      priority: 120,
      status: "Published",
      applicableLeadStages: ["new", "qualifying", "booked"],
      applicableProspectConditions: ["interested"],
      author: "seed",
      archived: false,
      version: 1,
      publishedAt: new Date(),
      previousVersionId: null
    }
  });

  await prisma.approvedExample.create({
    data: {
      id: "ex_qualified_city_state",
      prospectMessage: "How much do I need to start?",
      conversationContext: "Prospect is interested and asking startup questions.",
      leadStage: "qualifying",
      prospectAttributes: {},
      approvedResponse: "What city and state are you in?",
      explanation: "Short, direct, and qualification-first.",
      tags: ["qualifying", "startup"],
      priority: 100,
      active: true
    }
  }).catch(() => undefined);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
