import fs from "fs";

function sanitize(s: string): string {
  return s.replace(/\$/g, "$$$$");
}

function readBase64Sync(path: string): string {
  const content = fs.readFileSync(path);
  return sanitize(Buffer.from(content).toString("base64"));
}

function readSync(path: string): string {
  const content = fs.readFileSync(path).toString("utf-8");
  return sanitize(content);
}

const mainCss = readSync("./assets/main.css");
const floatCss = readSync("./assets/float.css");
const iconifyCss = readSync("./assets/iconify.css");
const faCss = readSync("./assets/fontawesome.css");
const katexCss = readSync("./assets/katex.css");
const mermaidCss = readSync("./assets/mermaid.css");

const faLibCss = readSync("./fontawesome/css/fontawesome.min.css");
const faLibRegularBase64 = readBase64Sync("./fontawesome/webfonts/fa-regular-400.ttf");
const faLibSolidBase64 = readBase64Sync("./fontawesome/webfonts/fa-solid-900.ttf");
const faLibBrandsBase64 = readBase64Sync("./fontawesome/webfonts/fa-brands-400.ttf");

const katexLibCss = readSync("node_modules/katex/dist/katex.min.css").replace(
  /url\([^)]*\) format\("woff2"\),url\([^)]*\) format\("woff"\),url\(([^)]*)\) format\("truetype"\)/g,
  (match, captureGroup) => {
    const katexFontBase64 = readBase64Sync(`./node_modules/katex/dist/${captureGroup}`);
    return `url(data:font/truetype;base64,${katexFontBase64}) format("truetype")`;
  }
);

const mermaidLibJs = readSync("node_modules/mermaid/dist/mermaid.min.js");

const previewTemplate = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style type="text/css">
      ${mainCss}
      ${floatCss}
      ${iconifyCss}
      ${faCss}
      ${katexCss}
      ${mermaidCss}

      @font-face {
        font-family: "Font Awesome 6 Free";
        font-style: normal;
        font-weight: 400;
        font-display: block;
        src: url(data:font/truetype;base64,${faLibRegularBase64}) format("truetype")
      }
      @font-face {
        font-family: "Font Awesome 6 Free";
        font-style: normal;
        font-weight: 900;
        font-display: block;
        src: url(data:font/truetype;base64,${faLibSolidBase64}) format("truetype")
      }
      @font-face {
        font-family: "Font Awesome 6 Brands";
        font-style: normal;
        font-weight: 400;
        font-display: block;
        src: url(data:font/truetype;base64,${faLibBrandsBase64}) format("truetype")
      }

      ${faLibCss}
      ${katexLibCss}

      $if(highlighting-css)$
      $highlighting-css$
      $endif$

      $if(quotes)$
      q { quotes: "“" "”" "‘" "’"; }
      $endif$
    </style>
    <script type="application/javascript" defer="">
      ${mermaidLibJs}
      mermaid.mermaidAPI.initialize({ startOnLoad: false, theme: "neutral" });

      window.addEventListener("load", () => {
        const codes = document.querySelectorAll("pre > code");
        for (const code of codes) {
          const pre = code.parentElement;
          if (pre.classList.contains("mermaid")) {
            const div = document.createElement("div");
            div.className = "mermaid";
            div.innerHTML = code.innerText;
            pre.parentElement.insertBefore(div, pre);
            pre.parentElement.removeChild(pre);
          }
        }

        mermaid.init();
      });
    </script>
  </head>
  <body>
    $body$

    $for(include-after)$
    $include-after$
    $endfor$
  </body>
</html>`;

const previewBodyTemplate = `$body$

$for(include-after)$
$include-after$
$endfor$`;

fs.writeFileSync("./templates/preview.html", previewTemplate);
fs.writeFileSync("./templates/preview-body.html", previewBodyTemplate);
