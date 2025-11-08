import { defineConfig } from "prisma/config";
console.log("In the main File")
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: "postgresql://postgres.ftzpbimcnbbjzntfvdcq:f19759a9-751f-4c4e-bfc1-6de36cf53d50@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
  },
});
