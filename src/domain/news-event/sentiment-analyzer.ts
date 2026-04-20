export type Sentiment = "positive" | "neutral" | "negative";

export interface SentimentResult {
  sentiment: Sentiment;
  framing: string;
}

export interface SentimentInput {
  id: string;
  title: string;
  description: string;
}

export interface BatchSentimentResult {
  id: string;
  result: SentimentResult;
}

export interface SentimentAnalyzer {
  analyze(title: string, description: string): Promise<SentimentResult | null>;
  analyzeBatch(items: SentimentInput[]): Promise<BatchSentimentResult[]>;
}
