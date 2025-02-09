#!/usr/bin/env node

const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
    const files = [
        './dist/embed/runtime-es5.js',
        './dist/embed/polyfills-es5.js',
        './dist/embed/main-es5.js',
        './dist/embed/style.js'
    ];

    const style = await fs.readFile("./dist/embed/styles.css", "utf-8");
    const wrapper = 'var style = document.createElement(\'style\');\n' +
        'style.innerHTML = `' +
        style.replace(/\n/g, '') +
        '`;\n' +
        'document.head.appendChild(style);\n' +
        '\n' +
        '  var scriptPeStatic = document.createElement(\'script\');\n' +
        '  scriptPeStatic.src = \'MICRO_URL_TRANSLATION_STORAGE/js/pe-static.js\';\n' +
        '  scriptPeStatic.onload = function() {\n' +
        '    window?.PayeverStatic?.IconLoader?.loadIcons([\n' +
        '      \'apps\',\n' +
        '      \'commerceos\',\n' +
        '      \'messaging\',\n' +
        '      \'set\',\n' +
        '    ]);\n' +
        '  };\n' +
        '  document.head.appendChild(scriptPeStatic);\n' +
        '  \n' +
        '  var msg = document.createElement(\'pe-message-webcomponent\');\n' +
        '   msg.dataset.channels = window.channels || "";\n' +
        '   msg.dataset.business = window.business || "";\n' +
        '  document.body.appendChild(msg);';

    await fs.writeFile('./dist/embed/style.js', wrapper);

    await fs.ensureDir('dist');
    await concat(files, 'dist/libs/message/pe-message-widget.min.js');
})();