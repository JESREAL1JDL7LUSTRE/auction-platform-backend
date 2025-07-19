const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2];

if (!inputPath) {
  console.error('❌ Please provide a module name:');
  console.error('Example: node generate-module.js api/users');
  process.exit(1);
}

const parts = inputPath.split('/');
const moduleFolder = parts[parts.length - 1];
const singular = moduleFolder.endsWith('s') ? moduleFolder.slice(0, -1) : moduleFolder;
const modulePath = path.join(__dirname, 'src', ...parts);

if (fs.existsSync(modulePath)) {
  console.error(`❌ Module "${inputPath}" already exists.`);
  process.exit(1);
}

fs.mkdirSync(modulePath, { recursive: true });

const fileTypes = ['routes', 'controller', 'service', 'model', 'validator', 'kafka'];

fileTypes.forEach((type) => {
  const fileName = `${singular}.${type}.ts`;
  const filePath = path.join(modulePath, fileName);
  fs.writeFileSync(filePath, `// ${fileName}`);
});

console.log(`✅ Module "${inputPath}" created at src/${inputPath}/`);
