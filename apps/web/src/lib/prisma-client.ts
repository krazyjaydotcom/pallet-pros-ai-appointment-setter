type PrismaClientModule = typeof import("../../../../packages/db/src/client");

let prismaClientModulePromise: Promise<PrismaClientModule> | null = null;

export async function getPrismaClient() {
  prismaClientModulePromise ??= import("../../../../packages/db/src/client");
  return (await prismaClientModulePromise).prisma;
}
