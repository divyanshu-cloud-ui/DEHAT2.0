// The site's self-hosted web fonts, as declared in DEHAT.dc.html (tools/self-hosted-fonts.test.mjs keeps the
// two in step). Pages built outside the runtime template (the not-found pages, the district atlas) use these
// files instead of Google Fonts, so no page asks a third party for fonts and the policy needs no font origins.
export const FONT_FACES = Object.freeze([
  {subset: "vietnamese", family: "Bricolage Grotesque", style: "normal", weight: "400 800", stretch: "100%", file: "assets/fonts/web/font-00-7e13a14cb0bd5fca.woff2", range: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB"},
  {subset: "latin-ext", family: "Bricolage Grotesque", style: "normal", weight: "400 800", stretch: "100%", file: "assets/fonts/web/font-01-1d04719f1325400e.woff2", range: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"},
  {subset: "latin", family: "Bricolage Grotesque", style: "normal", weight: "400 800", stretch: "100%", file: "assets/fonts/web/font-02-85f55a58a31e61a2.woff2", range: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},
  {subset: "vietnamese", family: "Newsreader", style: "italic", weight: "400 800", file: "assets/fonts/web/font-03-d5a170a88bdb4e21.woff2", range: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB"},
  {subset: "latin-ext", family: "Newsreader", style: "italic", weight: "400 800", file: "assets/fonts/web/font-04-750e9629f56ae719.woff2", range: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"},
  {subset: "latin", family: "Newsreader", style: "italic", weight: "400 800", file: "assets/fonts/web/font-05-a99fb127682b9af5.woff2", range: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},
  {subset: "vietnamese", family: "Public Sans", style: "italic", weight: "400 600", file: "assets/fonts/web/font-06-756e8321be6ca8e5.woff2", range: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB"},
  {subset: "latin-ext", family: "Public Sans", style: "italic", weight: "400 600", file: "assets/fonts/web/font-07-bbf89d33a9f5a28a.woff2", range: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"},
  {subset: "latin", family: "Public Sans", style: "italic", weight: "400 600", file: "assets/fonts/web/font-08-03c56a19a5ee626e.woff2", range: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},
  {subset: "vietnamese", family: "Public Sans", style: "normal", weight: "400 700", file: "assets/fonts/web/font-09-e43b193880fdb1d6.woff2", range: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB"},
  {subset: "latin-ext", family: "Public Sans", style: "normal", weight: "400 700", file: "assets/fonts/web/font-10-1c8a26c0ed4312da.woff2", range: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"},
  {subset: "latin", family: "Public Sans", style: "normal", weight: "400 700", file: "assets/fonts/web/font-11-c1b6da516e0062e9.woff2", range: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},
].map(face => Object.freeze(face)));

// @font-face rules for the given families (all faces when none are named), with root-absolute file paths so
// they resolve from any route depth. Each face keeps its unicode-range, so a browser fetches only the subsets
// a page's text needs.
export function fontFaceCss(families) {
  return FONT_FACES.filter(face => !families || families.includes(face.family)).map(face =>
    `@font-face{font-family:'${face.family}';font-style:${face.style};font-weight:${face.weight};` +
    (face.stretch ? `font-stretch:${face.stretch};` : '') +
    `font-display:swap;src:url(/${face.file}) format('woff2');unicode-range:${face.range}}`).join('');
}
