import { EmbeddingService } from "@/domain/story";
import { l2Normalize } from "@/lib/similarity";

type PipelineFn = (
  input: string | string[],
  options?: { pooling?: "mean"; normalize?: boolean },
) => Promise<{ data: Float32Array; dims: number[] }>;

let pipelinePromise: Promise<PipelineFn> | null = null;

async function getEmbedder(): Promise<PipelineFn> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { pipeline, env } = await import("@xenova/transformers");
      env.allowLocalModels = true;
      env.useBrowserCache = false;
      const fn = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
      );
      return fn as unknown as PipelineFn;
    })();
  }
  return pipelinePromise;
}

function tensorToVector(output: {
  data: Float32Array;
  dims: number[];
}, index = 0): number[] {
  const dim = output.dims[output.dims.length - 1];
  const start = index * dim;
  return Array.from(output.data.slice(start, start + dim));
}

export class TransformersEmbedder implements EmbeddingService {
  async embed(text: string): Promise<number[]> {
    const fn = await getEmbedder();
    const output = await fn(text, { pooling: "mean", normalize: true });
    return l2Normalize(tensorToVector(output));
  }

  async embedMany(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const fn = await getEmbedder();
    const results: number[][] = [];
    const batchSize = 32;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const output = await fn(batch, { pooling: "mean", normalize: true });
      for (let j = 0; j < batch.length; j++) {
        results.push(l2Normalize(tensorToVector(output, j)));
      }
    }
    return results;
  }
}

export function buildEmbeddingText(title: string, description: string | null | undefined): string {
  const desc = description?.trim() ?? "";
  return desc ? `${title}\n${desc}` : title;
}
