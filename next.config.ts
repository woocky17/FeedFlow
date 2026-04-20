import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@xenova/transformers", "onnxruntime-node"],
};

export default nextConfig;
