import * as child from 'child_process';

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

const userInput = `
interface Dependency {
    example: Example[];
    example2: Example;
}


interface Example {
   lol: boolean; 
}



interface IEmployee {
    number: number;
    boolean: boolean;
    Date: Date;
    string: string;
    questionMark?:string;
    dependency: Dependency[];
    test: Test[];
} 
   `;

function getInterfaces(userInput) {
  const userInputLines = userInput.split('\n');
  let getInterface = false;
  let interfaces = [];
  let myInterface = [];
  let brackets = [];
  let currentLine = '';
  for (let i = 0; i < userInputLines.length; i++) {
    currentLine = userInputLines[i];

    if (currentLine.indexOf('interface') !== -1) {
      getInterface = true;
    }
    if (getInterface) {
      myInterface.push(currentLine);

      if (currentLine.indexOf('{') !== -1) {
        brackets.push('{');
      }
      if (currentLine.indexOf('}') !== -1) {
        brackets.pop();
      }
      if (brackets.length === 0) {
        getInterface = false;
        interfaces.push(myInterface.join('\n'));
        myInterface = [];
      }
    }
  }
  return interfaces;
}

function createMock(myInterface: string, interfaceNames: string[]) {
  const PATH_TO_INTERFACES = "'@app/core/models/interfaces';";
  const interfaceName = myInterface.match(/export\s+interface\s+(.*)\s+{/)[1];

  let mock: string = myInterface
    .replace(/string;/g, "'',")
    .replace(/number;/g, '0,')
    .replace(/boolean;/g, 'false,')
    .replace(/Date;/g, 'new Date(2000, 1, 30),')
    .replace(/\?:/g, ':')
    .replace(/import.*;/g, '')
    .replace(
      new RegExp(`interface +${interfaceName}()`),
      `function getMock${interfaceName}(): ${interfaceName}`
    );

  let dependencies = [];
  interfaceNames.forEach((interfaceName) => {
    const interfaceListDependency = new RegExp(
      `:\\s+${interfaceName}\\[\\];`,
      'g'
    );
    const interfaceDependency = new RegExp(`:\\s+${interfaceName}\\s+;`, 'g');
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

  dependencies.forEach((dependency) => {
    mockLines.unshift(`import { getMock${dependency} } from ./`);
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
  if (!fs.existsSync(dir + '/mockObjects')) {
    fs.mkdirSync(dir + '/mockObjects');
  }
  mocks.forEach((mock) => {
    const interfaceName = mock.match(/:\s+(.*)\s+{/)[1];
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

// for (let i = 0; i < 50; i++) {
//   console.log(interfaces[i]);
//   console.log(mocks[i]);
// }
