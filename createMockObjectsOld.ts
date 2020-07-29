import * as child from 'child_process';
import * as rimraf from 'rimraf';

import * as fs from 'fs';
const interfaceFolder = '../Ag-Portal-UI/src/app/core/models/interfaces';

function getInterfaceFileNames(pathToInterfaces: string) {
  const interfaces = [];
  fs.readdirSync(interfaceFolder).forEach((file) => {
    if (file.includes('.interface.ts')) {
      const fileContents = fs.readFileSync(
        `${interfaceFolder}/${file}`,
        'utf8'
      );
      interfaces.push(fileContents);
    }
  });
  return interfaces;
}

function createMock(myInterface: string, interfaceNames: string[]) {
  const PATH_TO_INTERFACES = "'@app/core/models/interfaces';";
  let interfaceName = myInterface.match(/export\s+interface\s+(.*)\s+{/)[1];
  if (interfaceName.match(/\s+extends\s+/)) {
    interfaceName = interfaceName.match(/(.*)\s+extends/)[1];
  }

  let mock: string = myInterface
    .replace(/string;/g, "'',")
    .replace(/string\[\];/g, "[''],")
    .replace(/number;/g, '0,')
    .replace(/number\[\];/g, '[0],')
    .replace(/boolean;/g, 'false,')
    .replace(/boolean\[\];/g, '[false],')
    .replace(/Date;/g, 'new Date(2000, 1, 30),')
    .replace(/Date\[\];/g, '[new Date(2000, 1, 30)],')
    .replace(/\?:/g, ':')
    .replace(/import.*;/g, '')
    .replace(
      new RegExp(`interface +${interfaceName}()`),
      `function getMock${interfaceName}(): ${interfaceName}`
    );

  let extendedDependency = '';
  if (mock.match(/\s+extends\s+.*\{/)) {
    extendedDependency = mock.match(/\s+extends\s+(\w+)/)[1];
    mock = mock.replace(/\s+extends\s+\w+/, '');
  }

  let dependencies = [];
  interfaceNames.forEach((interfaceName) => {
    const interfaceListDependency = new RegExp(
      `:\\s+${interfaceName}\\[\\];`,
      'g'
    );
    const interfaceDependency = new RegExp(`:\\s+${interfaceName};`, 'g');
    if (
      mock.match(interfaceDependency) ||
      mock.match(interfaceListDependency)
    ) {
      dependencies.push(interfaceName);
    }
    mock = mock.replace(
      interfaceListDependency,
      `: [getMock${interfaceName}()],`
    );
    mock = mock.replace(interfaceDependency, `: getMock${interfaceName}(),`);
  });

  let mockLines = mock.split('\n');

  mockLines = mockLines.filter((line) => line !== '\r');
  mockLines = mockLines.filter((line) => line);
  mockLines = mockLines.filter((line) => line !== '');

  let functionDefinitionIndex = 0;
  mockLines.forEach((mockLine, index) => {
    if (mockLine.match(/export\s+function/)) {
      functionDefinitionIndex = index;
      return;
    }
  });

  let lastBracketIndex = 0;
  for (let i = mockLines.length - 1; i > 0; i--) {
    if (mockLines[i].match(/\}/)) {
      lastBracketIndex = i;
      break;
    }
  }

  mockLines.splice(functionDefinitionIndex + 1, 0, 'return {');
  mockLines.splice(lastBracketIndex + 1, 0, '};');

  if (extendedDependency) {
    mockLines.forEach((mockLine, index) => {
      if (mockLine.match(/return\s+\{/)) {
        functionDefinitionIndex = index;
        return;
      }
    });
    mockLines.splice(
      functionDefinitionIndex + 1,
      0,
      `...getMock${extendedDependency}(),`
    );
    mockLines.unshift(`import { getMock${extendedDependency} } from './';`);
  }

  dependencies.forEach((dependency) => {
    mockLines.unshift(`import { getMock${dependency} } from './';`);
  });

  mockLines.unshift(`import { ${interfaceName} } from '../';`);

  return mockLines.join('\n');
}

function createMocks(interfaces) {
  const interfaceNames = interfaces.map((myInterface) => {
    return myInterface.match(/export\s+interface\s+(.*)\s+{/)[1];
  });
  const mocks = interfaces.map((myInterface) => {
    return createMock(myInterface, interfaceNames);
  });
  return mocks;
}

const interfaces = getInterfaceFileNames(interfaceFolder);
const mocks = createMocks(interfaces);

function createFiles(dir: string, mocks: string[]) {
  const interfaceNames = [];
  fs.rmdirSync(dir + '/mockObjects', { recursive: true });
  if (!fs.existsSync(dir + '/mockObjects')) {
    fs.mkdirSync(dir + '/mockObjects');
  }
  mocks.forEach((mock) => {
    let interfaceName = mock.match(/:\s+(.*)\s+{/)[1];
    if (interfaceName.match(/\s+extends\s+/)) {
      interfaceName = interfaceName.match(/(.*)\s+extends/)[1];
    }
    interfaceNames.push(interfaceName);
    fs.writeFileSync(`${dir}/mockObjects/${interfaceName}.mock.ts`, mock);
  });
  const indexFileLines = interfaceNames.map((interfaceName) => {
    return `export * from './${interfaceName}.mock'`;
  });
  const indexFile = indexFileLines.join('\n');
  fs.writeFileSync(`${dir}/mockObjects/index.ts`, indexFile);
  console.log(`Test Objects created succesfully in ${dir}/mockObjects`);
}

createFiles(interfaceFolder, mocks);

// Prompt User for folder path
// Loop through files in folder
// Get text in all folders
// get all interface names

// Loop through files in folder
// get interface name
// get extended interface name
// get interface keys

// create extendedInterfaceKeysAndMockValues with extended interface name
// create interfaceKeysAndMockValues with interface keys and all interface names
// create getMockDependencyImports with interface keys and all interface names

// ${getMockDependencyImports}
// import ${interfaceName} from '../interfaces'
//
// export function getMock${interfaceName}(depth = 0): ${interfaceName} {
//    If an interface has a recursive dependency, it will stop at 10
//    if(depth === 10) {
//      return
//    }
//    return {
//      ${extendedInterfaceKeysAndMockValues}
//      ${interfaceKeysAndMockValues}
//    }
// }
