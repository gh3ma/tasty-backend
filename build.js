// build.js
import { build } from "esbuild";
import { nodeExternalsPlugin } from "esbuild-node-externals";

build({
  entryPoints: ["server.js"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outfile: "api/bundle.js",
  plugins: [nodeExternalsPlugin()],
}).catch(() => process.exit(1));
