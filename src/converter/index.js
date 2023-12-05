const fs = require("fs-extra");
const { JSDOM } = require("jsdom");

const io = require("./io");
const math = require("./math");
const postprocessors = require("./postprocessor");

// Run postprocessing against a string of HTML
async function postprocess(htmlString, options) {
  const dom = new JSDOM(htmlString);
  const document = dom.window.document;

  // Run all processing on document.
  postprocessors.css(document, options);
  postprocessors.figures(document);
  postprocessors.footnotes(document);
  postprocessors.headings(document);
  postprocessors.links(document);
  await postprocessors.bibliographyLinks(document, options); // after links
  postprocessors.math(document);

  await math.renderMath(dom);

  return dom.serialize();
}

// Do all processing on the file that LaTeXML produces
async function processHTML(htmlPath, options) {
  let htmlString = await fs.readFile(htmlPath, "utf8");
  htmlString = await postprocess(htmlString, options);
  await fs.writeFile(htmlPath, htmlString);
}

/**
 * Render and postprocess a LaTeX file into outputDir (created if does not
 * exist). Calls callback with an error on failure or a path to an HTML file
 * on success.
 *
 * @param {Object} options
 * @param {string} options.input
 * @param {string} options.output
 * @param {boolean} [options.postProcessing]
 * @param {string} [options.externalCSS]
 * @param {string} [options.externalJavaScript]
 * @param {string} [options.biblioGluttonUrl]
 */
async function render({
  output,
  externalCSS,
  externalJavaScript,
}) {

  const htmlPath = await io.normalizeDirectory(output);

  // If there are external assets, don't let LaTeXML copy it to the output
  // directory - we will handle it ourselves
  // Otherwise, link directly to the built asset. Absolute path, assuming
  // latexml is always run in Docker.
  const cssPath = externalCSS ? null : "/app/dist/css/index.css";
  const javaScriptPath = externalJavaScript
    ? null
    : "/app/dist/javascript/index.js";

  await processHTML(htmlPath, {
    externalCSS,
    externalJavaScript,
  });

  return htmlPath;
}

module.exports = {
  render: render,
};
