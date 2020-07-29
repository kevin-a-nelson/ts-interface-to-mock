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

function getPathToInterfacesFolderFromUser() {
  return '../Ag-Portal-UI/src/app/core/models/interfaces';
}

function getInterfaceFiles(folder) {
  return [];
}

function getInterfaceNames(interfaceFiles) {
  return [];
}

function createMockObject(interfaceFileContent, interfaceNames) {
  return {};
}

function createMockObjects(interfaceFilesContents, interfaceNames) {
  return interfaceFilesContents.map((interfaceFileContent) => {
    return createMockObject(interfaceFileContent, interfaceNames);
  });
}

function createMockObjectsFolder(pathToInterfacesFolder) {
  return;
}

function createMockObjectFiles(pathToMockObjectsFolder, mockObjects) {
  return;
}

function getMockObjectFileNames(pathToInterfacesFolder) {
  return;
}

function createIndexFile(pathToMockObjectsFolder, mockObjectFileNames) {
  return;
}

function main() {
  const pathToInterfacesFolder = getPathToInterfacesFolderFromUser();

  const interfaceFiles = getInterfaceFiles(pathToInterfacesFolder);
  const interfaceNames = getInterfaceNames(interfaceFiles);

  const mockObjects = createMockObjects(interfaceFiles, interfaceNames);

  const pathToMockObjectsFolder = pathToInterfacesFolder + '/mockObjects';

  createMockObjectsFolder(pathToMockObjectsFolder);
  createMockObjectFiles(pathToMockObjectsFolder, mockObjects);

  const mockObjectFileNames = getMockObjectFileNames(pathToMockObjectsFolder);

  createIndexFile(pathToMockObjectsFolder, mockObjectFileNames);
}
