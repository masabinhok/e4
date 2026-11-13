import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The repo root has its own lockfile (for git hooks); this app's root is web/.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
