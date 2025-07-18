import packageJSON from "./package.json" with { type: "json" };
import analyzer from "rollup-plugin-analyzer";
import esbuild from "rollup-plugin-esbuild";
import copy from "rollup-plugin-copy";
import { nodeExternals } from "rollup-plugin-node-externals";
import nodeResolve from "@rollup/plugin-node-resolve";
import { generateHeader } from "./src/module/header.ts";

const VIS_DEBUG = ["1", "true", "y", "yes"].includes(
  process.env["VIS_DEBUG"] || "false",
);

/**
 *
 */
export default async function () {
  const bannerModule = await generateHeader();
  // Shebang is necessary to execute this as a command.
  const bannerCommand = "#!/usr/bin/env node\n\n" + bannerModule;

  const getPlugins = () => [
    analyzer(VIS_DEBUG ? undefined : { summaryOnly: true }),
    nodeExternals({ deps: true }),
    copy({
      targets: [
        {
          src: "public/*",
          dest: "dist",
        },
      ],
    }),
    nodeResolve({
      extensions: [".css", ".html", ".js", ".json", ".ts", ".txt"],
      preferBuiltins: true,
    }),
    esbuild({
      minify: false,
      target: "esnext",
      loaders: {
        ".css": "text",
        ".html": "text",
        ".json": "json",
        ".txt": "text",
      },
    }),
  ];

  return [
    // JavaScript module exports.
    {
      input: `src/module/index.ts`,
      output: [
        {
          banner: bannerModule,
          file: `dist/vis-dev-utils.cjs`,
          format: "cjs",
          sourcemap: true,
        },
        {
          banner: bannerModule,
          file: `dist/vis-dev-utils.mjs`,
          format: "esm",
          sourcemap: true,
        },
      ],
      plugins: getPlugins(),
    },
    // File exports (CJS+ESM).
    ...["babel-preset"].map((name) => {
      return {
        input: `src/${name}/index.ts`,
        output: [
          {
            banner: bannerCommand,
            file: `${name}/index.cjs`,
            format: "cjs",
            sourcemap: true,
          },
          {
            banner: bannerCommand,
            file: `${name}/index.mjs`,
            format: "esm",
            sourcemap: true,
          },
        ],
        plugins: getPlugins(),
      };
    }),
    // Node commands.
    ...Object.entries(packageJSON.bin).map(([name, file]) => {
      return {
        input: `src/${name}/index.ts`,
        output: [
          {
            banner: bannerCommand,
            file,
            format: "esm",
            sourcemap: true,
          },
        ],
        plugins: getPlugins(),
      };
    }),
  ];
}
