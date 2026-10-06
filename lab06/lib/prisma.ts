/**
 * The shared database client.
 *
 * @module
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

// Internal, not part of the public API: a slot on globalThis that keeps the client alive across hot
// reloads in development, so we don't exhaust DB connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Internal, not part of the public API: import the shared `prisma` instead of creating more clients.
function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

/**
 * The one Prisma client of the application, connected to PostgreSQL through the `pg` driver adapter.
 *
 * It reads the connection string from the `DATABASE_URL` environment variable. In development the same
 * instance is reused across hot reloads. Use it on the server only.
 *
 * Creating the client does not connect or throw. A query rejects with the database client's error when
 * `DATABASE_URL` is missing or the database cannot be reached.
 *
 * @example
 * Load the `binary-search` problem directly:
 * ```ts
 * import { prisma } from "@/lib/prisma";
 *
 * const problem = await prisma.problem.findUnique({
 *   where: { id: "binary-search" },
 *   include: { category: true },
 * });
 * ```
 */
export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
