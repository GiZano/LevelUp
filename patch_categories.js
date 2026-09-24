const fs = require('fs');

const path = 'src/screens/ManageBlocksScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// Aggiungiamo i nuovi stati
content = content.replace(
  "const [catTargetHours, setCatTargetHours] = useState('');",
  `const [catTargetHours, setCatTargetHours] = useState('');
  const [catName, setCatName] = useState('');
  const [catEmoji, setCatEmoji] = useState('⭐');
  const [catColor, setCatColor] = useState('#EF4444');
  const CATEGORY_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];`
);

// Nuova funzione
content = content.replace(
  "const openEditCategory = (cat: any) => {",
  `const openNewCategory = () => {
    setEditCatId(null);
    setCatName('');
    setCatEmoji('⭐');
    setCatColor('#EF4444');
    setCatTargetHours('10');
    setCatModalVisible(true);
  };

  const openEditCategory = (cat: any) => {`
);

// Salva categoria
content = content.replace(
  "if (!isNaN(hours) && editCatId) {\n      editCategory(editCatId, hours);\n    }",
  `if (!isNaN(hours)) {
      if (editCatId) {
        editCategory(editCatId, hours);
      } else if (catName.trim()) {
        addCategory(catName.trim(), catEmoji, catColor, hours);
      }
    }`
);

// Pulsante Aggiungi Categoria
content = content.replace(
  "<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm}}>\n          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('manage.title')}</Text>\n        </View>",
  `<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm}}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('manage.title')}</Text>
          <Pressable onPress={openNewCategory} style={{padding: Spacing.sm, backgroundColor: colors.surfaceAlt, borderRadius: BorderRadius.sm}}>
            <Text style={{color: colors.primary, fontWeight: 'bold'}}>+ New</Text>
          </Pressable>
        </View>`
);

// Render del Modal Category
const modalContentOld = `<Text style={[styles.modalTitle, { color: colors.text }]}>{t('manage.editCategory')}</Text>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('manage.targetHoursInput')}</Text>
            <TextInput`;

const modalContentNew = `<Text style={[styles.modalTitle, { color: colors.text }]}>{editCatId ? t('manage.editCategory') : 'New Category'}</Text>
            
            {!editCatId && (
              <>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={catName}
                  onChangeText={setCatName}
                />
                
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Emoji</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={catEmoji}
                  onChangeText={setCatEmoji}
                  maxLength={2}
                />

                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Color</Text>
                <View style={[styles.chipsRow, {marginBottom: Spacing.md}]}>
                  {CATEGORY_COLORS.map(c => (
                    <Pressable 
                      key={c} 
                      onPress={() => setCatColor(c)}
                      style={{width: 32, height: 32, borderRadius: 16, backgroundColor: c, borderWidth: 2, borderColor: catColor === c ? colors.text : 'transparent', marginRight: 8, marginBottom: 8}}
                    />
                  ))}
                </View>
              </>
            )}

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('manage.targetHoursInput')}</Text>
            <TextInput`;

content = content.replace(modalContentOld, modalContentNew);

fs.writeFileSync(path, content);
console.log('Done patching ManageBlocksScreen');
