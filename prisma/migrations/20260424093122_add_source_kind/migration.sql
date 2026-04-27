-- CreateEnum
CREATE TYPE "SourceKind" AS ENUM ('WORLDNEWS', 'RSS');

-- AlterTable
ALTER TABLE "sources" ADD COLUMN     "kind" "SourceKind" NOT NULL DEFAULT 'WORLDNEWS';
