const fs = require('fs');
const path = 'src/screens/ManageBlocksScreen.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/\{\{\/\*/g, '{/*').replace(/\*\/}}/g, '*/}');
fs.writeFileSync(path, content);
