const { readdirSync, statSync } = require('fs');
const { join } = require('path');
const { execFile } = require('child_process');
const find = require('find');
var rimraf = require("rimraf");
var mkdirp = require("mkdirp");
var marked = require("marked");
var path = require("path");

const MODULES_DIR_PATH = './modules';
const README_HTML_DIR_PATH = './src/doc/assets/module-guides';

function mdToHtml() {
  const dirs = readdirSync(MODULES_DIR_PATH).filter(f => statSync(join(MODULES_DIR_PATH, f)).isDirectory());
  dirs.map(d => {
    find.file(/\.md$/, join(MODULES_DIR_PATH, d), function(files) {
      if (files.length != 0){
        // clean up dirs
        rimraf(join(README_HTML_DIR_PATH, d), function(){
          mkdirp(join(README_HTML_DIR_PATH, d), function(){
            execFile('marked', ['-i', files[0], '-o', join(README_HTML_DIR_PATH, d) + path.sep + d +'.html'], (error, stdout, stderr) => {
              if (error) {
                throw error;
              }
            });
          });
        });
      }
    })
  });
}
mdToHtml();

module.exports.mdToHtml = mdToHtml;

