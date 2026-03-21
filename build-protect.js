const fs = require("fs-extra");
const path = require("path");
const obfuscator = require("javascript-obfuscator");
const { minify } = require("html-minifier-terser");

const srcDir = "./";
const buildDir = "./build";

async function processHTML(filePath, outputPath){

let html = await fs.readFile(filePath,"utf8");

const scriptRegex = /<script>([\s\S]*?)<\/script>/g;

let match;
let index = 0;

while((match = scriptRegex.exec(html)) !== null){

const jsCode = match[1];

const obf = obfuscator.obfuscate(jsCode,{
compact:true,
controlFlowFlattening:true,
stringArrayEncoding:["base64"]
});

const jsName = path.basename(filePath,".html") + "_" + index + ".js";

await fs.writeFile(path.join(buildDir,jsName),obf.getObfuscatedCode());

html = html.replace(match[0], `<script src="${jsName}"></script>`);

index++;

}

const minified = await minify(html,{
collapseWhitespace:true,
removeComments:true,
minifyCSS:true
});

await fs.writeFile(outputPath,minified);

}

async function run(){

await fs.remove(buildDir);
await fs.mkdir(buildDir);

const files = await fs.readdir(srcDir);

for(const file of files){

if(file === "build" || file === "node_modules") continue;

const srcPath = path.join(srcDir,file);
const destPath = path.join(buildDir,file);

const stat = await fs.stat(srcPath);

if(stat.isDirectory()){
await fs.copy(srcPath,destPath);
}
else if(file.endsWith(".html")){
await processHTML(srcPath,destPath);
}
else{
await fs.copy(srcPath,destPath);
}

}

console.log("Build protected successfully");

}

run();