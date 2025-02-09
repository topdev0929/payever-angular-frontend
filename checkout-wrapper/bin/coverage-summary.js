const fs = require('fs');
const path = require('path');

const COVERAGE_DIR = path.join(__dirname, '../', 'coverage');
const YELLOW_COLOR = '\x1b[33m';
const RESET_COLOR = '\x1b[0m';
const RED_COLOR = '\x1b[31m%s\x1b[0m';
const HEADER_TITLE_LENGTH = 35;
const ALL_TITLE_LENGTH = 60;
const FILE_LENGTH = 55;
const excludedExtensions = [
  'total',
  'index',
  'html',
  'module',
  'stub',
  'config',
  'dto',
  'fixture',
  'constants',
  'constant',
  'enum',
  'translations',
  'interface',
];
const ziniaDir = ['installments', 'bnpl'];

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

function isCoverageValid(coverage) {
  return coverage.pct !== 'Unknown' && coverage.pct > 0;
}

function printLine() {
  console.log('-'.repeat(117));
}

function highlightsValue(value) {
  return Number(value) < 80 ? RED_COLOR.replace('%s', value) : value.toString();
}

function printFileCoverage(titleLength, file, statements, functions, lines, branches) {
  console.log(`${file.padEnd(titleLength, ' ')}\t${highlightsValue(statements)}\t\t${highlightsValue(functions)}\t\t${highlightsValue(lines)}\t\t${highlightsValue(branches)}`,
  );
}

function printHeader() {
  console.log(YELLOW_COLOR, `\t\t${'File'.padEnd(HEADER_TITLE_LENGTH, ' ')}\t\t% Stmts\t\t% Funcs\t\t% Lines\t\t% Branches`, RESET_COLOR);
}

function checkCoverage(fileName, values) {
  const coverageTypes = ['Statements', 'Functions', 'Lines', 'Branches'];
  for (let i = 0; i < values.length; i++) {
    if (Number(values[i]) < 60) {
      const errorMessage = `${coverageTypes[i]} coverage for ${fileName} is less then 60%`;
      throw new Error(errorMessage)
    }
  }
}

function shouldSkip(key) {
  const fileWords = key.split('/').slice(-1).join().split('.');
  for (const word of fileWords) {
    if (excludedExtensions.includes(word)) {
      return false;
    }
  }

  return true;
}

function readCoverageSummary(filePath, projectName) {
  const data = readJsonFile(filePath);
  if (!data) {
    console.error(`Failed to read data from ${filePath}`);
  }

  const totalCoverage = data.total.lines.total > 0 ? {
    file: 'All files',
    lines: data.total.lines.pct,
    statements: data.total.statements.pct,
    functions: data.total.functions.pct,
    branches: data.total.branches.pct,
  } : null;

  const filesCoverage = Object.keys(data).filter(key =>
    shouldSkip(key),
  ).map(file => {
    const { lines, statements, functions, branches } = data[file];
    const filePath = file.split(`${projectName}/`).pop();

    if (!isCoverageValid(lines)) return null;

    return {
      file: `${projectName}/${filePath}`,
      lines: lines.pct,
      statements: statements.pct,
      functions: functions.pct,
      branches: branches.pct,
    };
  }).filter(item => item !== null);

  return { totalCoverage, filesCoverage };
}

function printCoverageSummary({ totalCoverage, filesCoverage }) {

  if (totalCoverage) {
    printLine();
    printHeader();
    printLine();
    printFileCoverage(
      ALL_TITLE_LENGTH,
      'All files',
      totalCoverage.statements,
      totalCoverage.functions,
      totalCoverage.lines,
      totalCoverage.branches,
    );
  }

  if (totalCoverage && filesCoverage.length) {

    printLine();
    const groupedFiles = new Map();

    filesCoverage.forEach(data => {
      const parts = data.file.split('/');
      const subPath = parts.slice(3, -1).join('/');
      const fileName = parts.pop();
      let basePath = parts.slice(0, 3).join('/');

      if (ziniaDir.includes(basePath.split('/')[0])) {
        basePath = [].concat(['zinia'], basePath.split('/')).join('/');
      }

      if (!groupedFiles.has(basePath)) {
        groupedFiles.set(basePath, new Map());
      }
      if (!groupedFiles.get(basePath).has(subPath)) {
        groupedFiles.get(basePath).set(subPath, []);
      }

      groupedFiles.get(basePath).get(subPath).push({ ...data, file: fileName });
    });

    groupedFiles.forEach((folders, basePath) => {
      console.log(basePath + '/');
      folders.forEach((files, subPath) => {
        if (subPath) {
          console.group();
          console.log(`${subPath}/`);
        }

        files.forEach(({ file, lines, statements, functions, branches }) => {
          console.group();
          printFileCoverage(
            FILE_LENGTH,
            file,
            statements,
            functions,
            lines,
            branches,
          );
          checkCoverage(file, [statements, functions, lines, branches]);
          console.groupEnd();
        });

        console.groupEnd();
      });
    });
    printLine();

    console.log();
  }
}

function processDirectory(directory) {
  const projectName = path.basename(directory);

  fs.readdirSync(directory, { withFileTypes: true })
    .forEach(direct => {
      const fullPath = path.join(directory, direct.name);

      if (direct.isDirectory()) {
        processDirectory(fullPath);
      }

      if (direct.name === 'coverage-summary.json') {
        const coverageSummary = readCoverageSummary(fullPath, projectName);

        printCoverageSummary(coverageSummary);
      }
    });
}

processDirectory(COVERAGE_DIR);
