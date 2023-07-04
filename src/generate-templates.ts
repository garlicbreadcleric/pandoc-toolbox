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
const iconifyCss = readSync("./assets/iconify.css");

const faCss = readSync("./fontawesome/css/fontawesome.css");
const faRegularBase64 = readBase64Sync("./fontawesome/webfonts/fa-regular-400.ttf");
const faSolidBase64 = readBase64Sync("./fontawesome/webfonts/fa-solid-900.ttf");
const faBrandsBase64 = readBase64Sync("./fontawesome/webfonts/fa-brands-400.ttf");

const katexCss = readSync("node_modules/katex/dist/katex.min.css").replace(
  /url\([^)]*\) format\("woff2"\),url\([^)]*\) format\("woff"\),url\(([^)]*)\) format\("truetype"\)/g,
  (match, captureGroup) => {
    const katexFontBase64 = readBase64Sync(`./node_modules/katex/dist/${captureGroup}`);
    return `url(data:font/truetype;base64,${katexFontBase64}) format("truetype")`;
  }
);

const mermaidJs = readSync("node_modules/mermaid/dist/mermaid.min.js");

const previewTemplate = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style type="text/css">
      ${mainCss}
      ${iconifyCss}

      :root {
        --fa-style-family-classic: 'Font Awesome 6 Free';
        --fa-font-regular: normal 400 1em/1 'Font Awesome 6 Free';
        --fa-style-family-brands: 'Font Awesome 6 Brands';
        --fa-font-brands: normal 400 1em/1 'Font Awesome 6 Brands';
        --fa-style-family-classic: 'Font Awesome 6 Free';
        --fa-font-solid: normal 900 1em/1 'Font Awesome 6 Free';
      }
      @font-face {
        font-family: "Font Awesome 6 Free";
        src: url(data:font/truetype;base64,${faRegularBase64}) format("truetype")
      }
      @font-face {
        font-family: "Font Awesome 6 Free";
        src: url(data:font/truetype;base64,${faSolidBase64}) format("truetype")
      }
      @font-face {
        font-family: "Font Awesome 6 Brands";
        src: url(data:font/truetype;base64,${faBrandsBase64}) format("truetype")
      }
      ${faCss}

      ${katexCss}

      $if(highlighting-css)$
      $highlighting-css$
      $endif$

      $if(quotes)$
      q { quotes: "“" "”" "‘" "’"; }
      $endif$
    </style>
    <script type="application/javascript" defer="">
      ${mermaidJs}
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
