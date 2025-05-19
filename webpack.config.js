// webpack.config.js
import path from "path";
import { fileURLToPath } from "url";
import nodeExternals from "webpack-node-externals";

// Required to get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  target: "node",
  entry: "./server.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  externals: [nodeExternals()],
  mode: "production",
};
