import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // lodash CommonJS → ESM
      "lodash.pick": "lodash-es/pick",
      "lodash.omit": "lodash-es/omit",
      "lodash.clamp": "lodash-es/clamp",

      // stats.js legacy → source entry
      "stats.js": "stats.js/src/Stats.js",

      // prop-types explicit entry
      "prop-types": "prop-types/index.js",
    },
  },

  optimizeDeps: {
    exclude: ["@react-three/drei"],
  },
});
