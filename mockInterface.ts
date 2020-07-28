import * as child from "child_process";

child.exec("cat *.interface.ts", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});

const userInput = ` 


interface Dependency {
    example: Example[];
    example2: Example;
}


interface Example {
   lol: boolean; 
}


    console.log(dependencies);

interface IEmployee {
    number: number;
    boolean: boolean;
    Date: Date;
    string: string;
    questionMark?:string;
    dependency: Dependency[];
} 
   `;

function getInterfaces(userInput) {
    const userInputLines = userInput.split("\n");
    let getInterface = false;
    let interfaces = [];
    let myInterface = [];
    let brackets = [];
    let currentLine = "";
    for (let i = 0; i < userInputLines.length; i++) {
        currentLine = userInputLines[i];

        if (currentLine.indexOf("interface") !== -1) {
            getInterface = true;
        }
        if (getInterface) {
            myInterface.push(currentLine);

            if (currentLine.indexOf("{") !== -1) {
                brackets.push("{");
            }
            if (currentLine.indexOf("}") !== -1) {
                brackets.pop();
            }
            if (brackets.length === 0) {
                getInterface = false;
                interfaces.push(myInterface.join("\n"));
                myInterface = [];
            }
        }
    }
    return interfaces;
}

function createMock(myInterface: string, interfaceNames) {
    const PATH_TO_INTERFACES = "@app/core/models/interfaces";
    const interfaceName = myInterface.split(" ")[1];

    const regex = new RegExp(`interface +${interfaceName}()`);

    let mock: string = myInterface
        .replace(/string;/g, "'',")
        .replace(/number;/g, "0,")
        .replace(/boolean;/g, "false,")
        .replace(/Date;/g, "new Date(2000, 1, 30),")
        .replace(/\?:/g, ":")
        .replace(/\;/g, ",")
        .replace(
            regex,
            `export function getMock${interfaceName}(): ${interfaceName}`
        );

    let dependencies = [];
    interfaceNames.forEach((interfaceName) => {
        const interfaceListDependency = `${interfaceName}[]`;
        const interfaceDependency = new RegExp(`: +${interfaceName},`);
        if (
            mock.match(interfaceDependency) ||
            mock.indexOf(interfaceListDependency) !== -1
        ) {
            dependencies.push(interfaceName);
        }
        mock = mock.replace(
            interfaceListDependency,
            `: [getMock${interfaceName}()]`
        );
        mock = mock.replace(interfaceDependency, `: getMock${interfaceName}()`);
    });

    let mockLines = mock.split("\n");

    mockLines.splice(0, 0, "\n");

    dependencies.forEach((dependency) => {
        mockLines.splice(
            0,
            0,
            `import { getMock${dependency} } from ./getMock${dependency}`
        );
    });

    mockLines
        .splice(0, 0, `import { ${interfaceName} } from ${PATH_TO_INTERFACES}`)
        .splice(2, 0, "return {")
        .splice(-2, 0, "}");

    return mockLines.join("\n");
}

function createMocks(interfaces) {
    const interfaceNames = interfaces.map((myInterface) => {
        return myInterface.split(" ")[1];
    });
    const mocks = interfaces.map((myInterface) => {
        return createMock(myInterface, interfaceNames);
    });
    return mocks;
}

// const interfaces = getInterfaces(userInput);
// const mocks = createMocks(interfaces);
// mocks.forEach((mock) => {
//     console.log("\n\n\n");
//     console.log(mock);
// });
