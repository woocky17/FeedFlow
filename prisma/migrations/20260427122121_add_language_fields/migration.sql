-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ES', 'EN');

-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'EN';

-- AlterTable
ALTER TABLE "sources" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'EN';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'ES';

-- CreateTable
CREATE TABLE "article_translations" (
    "articleId" TEXT NOT NULL,
    "targetLang" "Language" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "provider" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_translations_pkey" PRIMARY KEY ("articleId","targetLang")
);

-- CreateIndex
CREATE INDEX "article_translations_articleId_idx" ON "article_translations"("articleId");

-- CreateIndex
CREATE INDEX "articles_language_publishedAt_idx" ON "articles"("language", "publishedAt");

-- AddForeignKey
ALTER TABLE "article_translations" ADD CONSTRAINT "article_translations_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
