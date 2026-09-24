const fs = require('fs');
let content = fs.readFileSync('src/store/PlannerContext.tsx', 'utf8');

content = content.replace(
  'toggleBlockDone: (blockId: string) => void;',
  'toggleBlockDone: (blockId: string) => void;\n  updateBlockDescription: (blockId: string, desc: string) => void;'
);

const insertAfter = 'const toggleBlockDone = useCallback((blockId: string) => {';
const newFunc = `const updateBlockDescription = useCallback((blockId: string, desc: string) => {
    setCurrentPlan((prev) => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === blockId ? { ...b, description: desc } : b)
    }));
  }, []);

  const toggleBlockDone = useCallback((blockId: string) => {`;
  
content = content.replace(insertAfter, newFunc);

content = content.replace(
  'toggleBlockDone,',
  'toggleBlockDone,\n        updateBlockDescription,'
);

fs.writeFileSync('src/store/PlannerContext.tsx', content);
console.log('Done');
