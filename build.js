// build.js
import { build } from "esbuild";
import { nodeExternalsPlugin } from "esbuild-node-externals";

build({
  entryPoints: ["server.js"], // replace with your actual main file
  bundle: true,
  platform: "node",
  target: "node18",
  outfile: "dist/bundle.js",
  plugins: [nodeExternalsPlugin()], // this excludes all node_modules like bcrypt
}).catch(() => process.exit(1));
