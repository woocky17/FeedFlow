import "dotenv/config";
import { TransformersEmbedder } from "@/infrastructure/ai/transformers-embedder";
import { buildEmbeddingText } from "@/infrastructure/ai/transformers-embedder";
import { cosineSimilarity } from "@/lib/similarity";
import { prisma } from "@/infrastructure/db/prisma/client";

async function main() {
  const articles = await prisma.article.findMany({
    select: { id: true, title: true, description: true, embedding: true },
    orderBy: { publishedAt: "desc" },
  });

  console.log(`Analyzing ${articles.length} articles...`);

  const embedder = new TransformersEmbedder();
  const toEmbed = articles.filter((a) => !a.embedding || (a.embedding as number[]).length === 0);
  if (toEmbed.length > 0) {
    console.log(`Computing embeddings for ${toEmbed.length} articles...`);
    const texts = toEmbed.map((a) => buildEmbeddingText(a.title, a.description));
    const vectors = await embedder.embedMany(texts);
    for (let i = 0; i < toEmbed.length; i++) {
      await prisma.article.update({
        where: { id: toEmbed[i].id },
        data: { embedding: vectors[i] },
      });
      toEmbed[i].embedding = vectors[i];
    }
  }

  const all = articles.map((a, idx) => ({
    idx,
    id: a.id,
    title: a.title,
    embedding: (a.embedding as number[]) || [],
  }));

  const THRESHOLD = 0.5;

  type Cluster = { seed: typeof all[number]; members: typeof all };
  const clusters: Cluster[] = [];
  const used = new Set<number>();

  for (let i = 0; i < all.length; i++) {
    if (used.has(i)) continue;
    const seed = all[i];
    if (seed.embedding.length === 0) continue;
    const members = [seed];
    for (let j = i + 1; j < all.length; j++) {
      if (used.has(j)) continue;
      const other = all[j];
      if (other.embedding.length === 0) continue;
      const sim = cosineSimilarity(seed.embedding, other.embedding);
      if (sim >= THRESHOLD) {
        members.push(other);
        used.add(j);
      }
    }
    if (members.length >= 2) {
      clusters.push({ seed, members });
      used.add(i);
    }
  }

  clusters.sort((a, b) => b.members.length - a.members.length);

  console.log(`\nFound ${clusters.length} clusters (>=2 members at sim >= ${THRESHOLD}):\n`);
  for (const c of clusters) {
    console.log(`Cluster of ${c.members.length} (seed id: ${c.seed.id}):`);
    for (const m of c.members) {
      const sim = cosineSimilarity(c.seed.embedding, m.embedding);
      console.log(`  [${(sim * 100).toFixed(1)}%] ${m.title}`);
    }
    console.log();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
