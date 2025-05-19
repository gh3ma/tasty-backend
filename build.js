// build.js
import { build } from "esbuild";
import { nodeExternalsPlugin } from "esbuild-node-externals";

build({
  entryPoints: ["server.js"], // or your actual server entry point
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm", // ✅ ESM output
  outfile: "api/bundle.js", // ✅ Output goes to api directory
  plugins: [nodeExternalsPlugin()],
}).catch(() => process.exit(1));
