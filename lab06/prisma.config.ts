import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Only needed to talk to a database. `prisma generate` (all the docs build needs) works without it.
    url: process.env["DATABASE_URL"] ?? "postgresql://localhost:5432/learnlab",
  },
});
