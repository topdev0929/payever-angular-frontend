#!/usr/bin/env node

const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const Hashids = require('hashids');
const LOCALES = require('./locales.constant');

const argv = yargs.argv;
const deployPath = argv._[1] || 'deploy';
const microConfig = 'micro.config.json';
const envConfig = 'env.json';
const distPaths = LOCALES.map(locale => path.join(argv._[0] ?? './dist', locale))

distPaths.forEach(distPath => {
  const buildHash = (new Hashids()).encode(Math.floor(new Date() / 1000));
  const outputBuildFileName = path.join(distPath, `micro.js`);
  const outputBuildFileNameES5 = path.join(distPath, `micro-es5.js`);
  const outputBuildFileNameES2015 = path.join(distPath, `micro-es2015.js`);
  const outputHashmapFileName = path.join(distPath, `hashmap.json`);
  const outputMicroConfigFileName = path.join(distPath, microConfig);
  const outputEnvConfigFileName = path.join(distPath, envConfig);

  // Make webpack bundle unique with same hash
  console.log(`Making webpack bundle unique using hash ${buildHash}...`);
  mapDistJs(
    function(filePath,) {
      replace(filePath, '__webpack_require__', buildHash);
      replace(filePath, 'webpackJsonp', buildHash);
    },
    distPath,
  );

  function concat(files, destination, callback) {
    let concatted = '';
    for (let file of files) {
      concatted += fs.readFileSync(path.resolve(file), 'utf8');
      concatted += "\r\n";
    }
    fs.writeFileSync(path.resolve(destination), concatted);
    callback(null);
  }

  if (argv.resolveCssScope !== 'false') {
    // NOTE this code is disabled to allow launch apps with angular from CDN,
    // Because of changing of scope do not needed if use @angular/compiler from CDN

    // Resolving css-scope conflicts
    console.log(`Fixing css class conflicts issue by replacing '_nghost' with '_nghost-${buildHash}'`);
    mapDistJs(
      function (filePath) {
        replace(filePath, '_nghost', `-${buildHash}`);
      },
      distPath
    );
  }

  // Add hashes to .js files link  inside index.html
  findIndexHtml(
    function(filePath) {
      replaceWithRegexp(filePath, /\.js/g, '.js', `?${buildHash}`);
    },
    undefined,
    distPath,
  );

  // Concat files in exact order (polyfills excluded because they should be only once per page)
  const filesToConcat = [];
  const filesToConcatES5 = [];
  const filesToConcatES2015 = [];
  mapDistJs(
    function(filePath) {
      if (/^runtime/.test(path.basename(filePath))) {

        /* NOTE: runtime.js files contais names and hashes of lazy modules.
          But we can use --output-hashing=none. And to avoid browser cache issue we have to add hash as get param to
          the lazy modules links.
          Runtime.js updated synchronously
        */
        let runtimeContent = fs.readFileSync(path.resolve(filePath), 'utf8');
        runtimeContent = runtimeContent.replace('.js', '.js?' + buildHash);
        fs.writeFileSync(path.resolve(filePath), runtimeContent);
        console.log('Runtime.js file udpated. Added hash to chunks.');

        filesToConcat.push(filePath);
      }
      if (/^runtime-es5/.test(path.basename(filePath))) {
        filesToConcatES5.push(filePath);
      }
      if (/^runtime-es2015/.test(path.basename(filePath))) {
        filesToConcatES2015.push(filePath);
      }
    },
    distPath
  );
  mapDistJs(
    function(filePath) {
      if (/^scripts/.test(path.basename(filePath))) {
        filesToConcat.push(filePath);
        filesToConcatES5.push(filePath);
        filesToConcatES2015.push(filePath);
      }
    },
    distPath,
  );
  mapDistJs(
    function(filePath) {
      if (/^common/.test(path.basename(filePath))) {
        filesToConcat.push(filePath);
      }
      if (/^common-es5/.test(path.basename(filePath))) {
        filesToConcatES5.push(filePath);
      }
      if (/^common-es2015/.test(path.basename(filePath))) {
        filesToConcatES2015.push(filePath);
      }
    },
    distPath,
  );
  mapDistJs(
    function(filePath) {
      if (/^main/.test(path.basename(filePath))) {
        filesToConcat.push(filePath);
      }
      if (/^main-es5/.test(path.basename(filePath))) {
        filesToConcatES5.push(filePath);
      }
      if (/^main-es2015/.test(path.basename(filePath))) {
        filesToConcatES2015.push(filePath);
      }
    },
    distPath,
  );

  concat(filesToConcat, outputBuildFileName, function(err) {
    if (err) throw err;
    console.log(`Packed ${filesToConcat.join(", ")} to ${outputBuildFileName}`);
  });

  concat(filesToConcatES5, outputBuildFileNameES5, function(err) {
    if (err) throw err;
    console.log(`Packed ${filesToConcatES5.join(", ")} to ${outputBuildFileNameES5}`);
  });

  concat(filesToConcatES2015, outputBuildFileNameES2015, function(err) {
    if (err) throw err;
    console.log(`Packed ${filesToConcatES2015.join(", ")} to ${outputBuildFileNameES2015}`);
  });

  // Write hash map
  fs.writeFileSync(outputHashmapFileName, JSON.stringify({
    micro: buildHash
  }));

  console.log(`Created hashmap file ${outputHashmapFileName}`);

  // Create micro.config.json file from template
  let microConfigJson;
  try {
    microConfigJson = require(path.resolve(`./${deployPath}/${microConfig}`));
  } catch (e) {
    console.log('Please provide the AppRegistry file for micro-frontend application (micro.config.json)');
  }
  if (microConfigJson) {
    const dataWithHash = JSON.stringify(microConfigJson).replace(/{hash}/g, buildHash);

    // Write micro.config.json
    fs.writeFileSync(outputMicroConfigFileName, dataWithHash);
    console.log(`Created AppRegistry config file ${outputMicroConfigFileName}`);
  }

  // Create env.json file from template
  let envConfigJson;
  try {
    envConfigJson = require(path.resolve(`./${deployPath}/${envConfig}`));
  } catch (e) {
    console.log('Please provide the environment config file for micro-frontend application (env.json)');
  }
  if (envConfigJson) {
    const envConfigData = JSON.stringify(envConfigJson);

    // Write config.json
    fs.writeFileSync(outputEnvConfigFileName, envConfigData);
    console.log(`Created environment config file ${outputEnvConfigFileName}`);
  }

  if (argv._[0]) {
    moveMicro([
      outputBuildFileNameES2015,
      outputBuildFileNameES5,
    ]);
  }
});


/*** Utils ***/

function replaceWithRegexp(file, searchRegexp, searchString, hash) {
  const content = fs.readFileSync(file, 'utf8');
  const result = content.replace(searchRegexp, searchString + hash);
  fs.writeFileSync(file, result);
}

function replace(file, searchString, hash) {
  const content = fs.readFileSync(file, 'utf8');
  const searchRegexp = new RegExp(searchString, 'g');
  const result = content.replace(searchRegexp, searchString + hash);
  fs.writeFileSync(file, result);
}

function mapDistJs(callback, distPath) {
  const files = fs.readdirSync(distPath);
  for (const file of files) {
    const filePath = path.join(distPath, file);
    const extname = path.extname(filePath);
    if (extname === '.js') {
      callback(filePath);
    }
  }
}

function findIndexHtml(callback, name, distPath) {
  name = name || 'index.html';
  const files = fs.readdirSync(distPath);
  for (const file of files) {
    const filePath = path.join(distPath, file);
    const fileName = path.basename(filePath).toLowerCase();
    if (fileName === name) {
      callback(filePath);
    }
  }
}

function moveMicro(files) {
  files.forEach((file) => {
    fs.rename(
      file,
      file.replace('checkout-main-ce', ''),
      () => {},
    );
  });
}
