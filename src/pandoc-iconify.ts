#!/usr/bin/env node

import * as pandoc from "pandoc-filter";
import type { SingleFilterActionAsync } from "pandoc-filter";

const action: SingleFilterActionAsync = ({ t: type, c: value }, format, meta) => {
  if (type === "Link") {
    const [linkId, linkClasses, linkAttrs] = value[0];

    const target = value.at(2)?.at(0);
    if (target == null) return;
    if (typeof target !== "string") return;

    if (/^https?:\/\/([a-z0-9]+\.)?wikipedia\.org/.exec(target)) {
      return pandoc.Link([linkId, [...linkClasses, "pandoc-iconify-link-wikipedia"], linkAttrs], value[1], value[2]);
    } else if (/^https?:\/\/([a-zA-Z0-9]+\.)?github\.com/.exec(target)) {
      return pandoc.Link([linkId, [...linkClasses, "pandoc-iconify-link-github"], linkAttrs], value[1], value[2]);
    } else if (/^https?:\/\//.exec(target)) {
      return pandoc.Link([linkId, [...linkClasses, "pandoc-iconify-link-web"], linkAttrs], value[1], value[2]);
    } else if (/^[.0-9a-zA-Z\-_\/]+\.md$/.exec(target)) {
      return pandoc.Link([linkId, [...linkClasses, "pandoc-iconify-link-note"], linkAttrs], value[1], value[2]);
    }
  } else if (type === "Str" && value === "☐") {
    return pandoc.RawInline("html", `<i class="fa-regular fa-square pandoc-iconify-checkbox"></i>`);
  } else if (type === "Str" && value === "☒") {
    return pandoc.RawInline("html", `<i class="fa-regular fa-square-check pandoc-iconify-checkbox"></i>`);
  }
};

export default () => {
  pandoc.stdio(action);
};
