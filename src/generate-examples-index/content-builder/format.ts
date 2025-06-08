import prettier from "prettier";

export const formatCSS = (css: string | null | undefined): Promise<string> =>
  prettier.format(css || "", { filepath: "style.css" });
export const formatHTML = (html: string | null | undefined): Promise<string> =>
  prettier.format(html || "", { filepath: "index.html" });
export const formatJS = (js: string | null | undefined): Promise<string> =>
  prettier.format(js || "", { filepath: "script.js" });
export const formatMD = (md: string | null | undefined): Promise<string> =>
  prettier.format(md || "", { filepath: "README.md" });
