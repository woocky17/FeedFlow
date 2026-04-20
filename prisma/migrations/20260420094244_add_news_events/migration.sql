-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "framingSummary" TEXT,
ADD COLUMN     "newsEventId" TEXT,
ADD COLUMN     "sentiment" TEXT;

-- CreateTable
CREATE TABLE "news_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "news_events_lastSeenAt_idx" ON "news_events"("lastSeenAt");

-- CreateIndex
CREATE INDEX "articles_newsEventId_idx" ON "articles"("newsEventId");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_newsEventId_fkey" FOREIGN KEY ("newsEventId") REFERENCES "news_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
