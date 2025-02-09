#!/usr/bin/env node

const fse = require("fs-extra");
const path = require("path");
const minify = require('html-minifier').minify;
const babel = require('babel-core');

const getFilesInPath = path => {
  return fse.readdirSync(path);
};

let htmlBody = "";

const imagesPath = path.join('./', './svg-icons');
const iconsFiles = getFilesInPath(imagesPath);
const jsTemplateString = fse.readFileSync('./js/pe-svg-icons-loader-template.js', 'utf-8');

for (const iconFileName of iconsFiles) {

  if (iconFileName.indexOf('.svg') < 0) continue;

  const iconName = iconFileName.replace('.svg', '');

  let svgContent = fse.readFileSync(`./svg-icons/${iconFileName}`, 'utf-8');
  svgContent = svgContent.replace('<svg ', `<symbol id="icon-${iconName}" `).replace('<svg>', `<symbol id="icon-${iconName}">`).replace('</svg>', '</symbol>');
  svgContent = minify(svgContent, {
    preserveLineBreaks: true,
    collapseWhitespace: true,
    keepClosingSlash: true,
  });

  const jsTemplateClone = jsTemplateString;
  const newJsIconLoaderString = jsTemplateClone.replace('%%html%%', svgContent);

  htmlBody += `<svg xmlns="http://www.w3.org/2000/svg" style="display:none;" className="sprite">${newJsIconLoaderString}</svg>`;
  htmlBody += `<h1>${iconName}</h1><div><svg style="height:100px;width:100px"><use xlink:href="#icon-${iconName}" /></svg></div>\n`;
}

const newIconsJsFilePath = `./dist/preview-svg/index.html`;
const finalHTML = `
<!DOCTYPE html>
<html>
  <body style="background: #dddddd; overflow: auto; padding: 12px 48px;">
    ${htmlBody}
  </body>
</html>

`;
fse.createFileSync(newIconsJsFilePath);
fse.writeFile(newIconsJsFilePath, finalHTML, err => {
  if (err) {
    console.log(
      `Error with creation of a preview file generated ${iconName}, ${err}`
    );
  }
  console.log(`Icons preview file generated`);
});
