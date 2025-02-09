const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const mkdirp = require('mkdirp');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

let assetsPath = "./src/doc/assets";
let demoPath = path.resolve('../frontdoc');
let componentsGeneratePath = './src/doc/components/generated';
let includesDir = path.resolve(demoPath, '_includes');
let includes = fs.readdirSync(includesDir);
let classNames = [];
let imports = [];

copyAssets();
copyCss();
generateComponents();

function copyAssets() {
  fse.copySync(path.resolve(demoPath, 'img'), path.resolve(assetsPath, 'img'));
  fse.copySync(path.resolve(demoPath, 'logos'), path.resolve(assetsPath, 'logos'));
}

function copyCss() {
  fse.copySync(path.resolve(demoPath, '_scss/payever_ui.scss'), path.resolve("./src/doc", 'payever_ui.scss'));
}

function generateComponents() {
  const skip = ['head', 'scripts'];

  for (file of includes) {
    let basename = path.basename(file, ".html");
    if (skip.indexOf(basename) > -1) {
      continue;
    }
    let classname = basename.split("-").map(str => capitalize(str) + "Component").join('');
    mkdirp.sync(path.resolve(componentsGeneratePath, basename));
    fs.writeFileSync(path.resolve(componentsGeneratePath, `${basename}/${basename}.component.ts`), getClassText(basename, classname));
    let html = fs.readFileSync(path.resolve(includesDir, file));
    fse.outputFileSync(path.resolve(componentsGeneratePath, `${basename}/${basename}.component.html`), fixComponentHtml(html));

    // save results
    classNames.push(classname);
    imports.push(`import { ${classname} } from '../components/generated/${basename}/${basename}.component';`);
  }
}

function fixComponentHtml(input) {
  let html = input.toString();

  if (!html) {
    return;
  }

  // replace includes with component tags
  html = html.replace(/{% include (.*).html %}/g, '<$1></$1>');
  // replacing baseurl for images
  html = html.replace(/{{\s.*site\.baseurl\s.*}}/g, '../../../assets/');

  let $ = cheerio.load(html, {
    decodeEntities: false
  });

  let $codes = $("code");
  $codes.each(function(i, elem) {
    $el = $(this);
    pureHtml = entities.decode($el.html());

    $el.attr('html-entities', true);

    // pureHtml = pureHtml.replace(/"/g, '\\"');
    // $el.attr('html-entities', '');
    // console.log(pureHtml);

    if ($el.hasClass('javascript')) {
      if (/'/.test(pureHtml)) {
        $el.html('{{"' + pureHtml + '"}}');
      } else {
        // $el.html("{{'" + pureHtml + "'}}");
        $el.html(pureHtml);
      }
    } else {
      $el.html(pureHtml);
    }

    // if ($el.hasClass('scss') || $el.hasClass('html')) {
      // $el.html(pureHtml);
    // } else if ($el.hasClass('javascript')) {
      // $el.html(pureHtml);
      // $el.html(pureHtml);
    // } else if (/'/.test(pureHtml)) {
      // $el.html('{{"' + pureHtml + '"}}');
      // $el.html(pureHtml);
    // } else {
      // $el.html("{{'" + pureHtml + "'}}");
      // $el.html(pureHtml);
    // }
  });

  // removing <pre> from <p>
  let $pres = $("pre, div");
  $pres.each(function(i, elem) {
    $pre = $(this);
    $p_parent = $pre.parent('p');

    if ($p_parent) {
      $p_parent.before($pre);
    }

    if ($p_parent.html() && $p_parent.html().trim() == '') {
      $p_parent.remove();
    }
  });

  // removing empty img src
  let $imgs = $("img");
  $imgs.each(function(i, elem) {
    $img = $(this);
    if ($img.attr('src') === "...") {
      $img.attr('src', '');
    }
    // webpack doesnot support srcset yet natively
    $img.removeAttr('srcset');
    $img.attr('src', $img.attr('src').split(' ')[0]);
  });

  return $.html();
}

console.log('CLASSES');
classNames.map((str) => console.log(str + ','));
console.log('IMPORTS');
imports.map((str) => console.log(str));

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getClassText(basename, classname) {

  return `import { Component } from '@angular/core';

@Component({
  selector: '${basename}',
  templateUrl: '${basename}.component.html'
})
export class ${classname} {
}
`;

}
