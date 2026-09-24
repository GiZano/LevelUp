const fs = require('fs');
let content = fs.readFileSync('src/screens/PlannerScreen.tsx', 'utf8');

// Aggiungi state
content = content.replace(
  "const [startTime, setStartTime] = useState(new Date());",
  "const [startTime, setStartTime] = useState(new Date());\n  const [editBlockId, setEditBlockId] = useState<string | null>(null);\n  const [editBlockDesc, setEditBlockDesc] = useState('');"
);

// Sostituisci handleBlockPress
const oldHandlePress = `const handleBlockPress = (block: any) => {
    let name = '';
    let duration = 0;
    if (block.isOneOff) {
      name = block.oneOffName;
      duration = block.oneOffDuration;
    } else {
      const template = getTemplateById(block.templateId);
      name = template?.name || 'Sconosciuto';
      duration = template?.durationHours || 0;
    }

    Alert.alert(
      name,
      \`Vuoi modificare lo stato o rimuoverlo?\`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: block.done ? t('planner.markTodo') : t('planner.markDone'),
          onPress: () => {
            toggleBlockDone(block.id);
            if (!block.done) addCompletedHours(duration);
            else addCompletedHours(-duration);
          }
        },
        { text: t('common.remove'), style: 'destructive', onPress: () => unscheduleBlock(block.id) }
      ]
    );
  };`;

const newHandlePress = `const handleBlockPress = (block: any) => {
    setEditBlockId(block.id);
    setEditBlockDesc(block.description || '');
  };

  const saveBlockDesc = () => {
    if (editBlockId) {
      updateBlockDescription(editBlockId, editBlockDesc.trim());
      setEditBlockId(null);
    }
  };

  const handleDeleteBlock = () => {
    if (editBlockId) {
      unscheduleBlock(editBlockId);
      setEditBlockId(null);
    }
  };

  const handleToggleBlock = () => {
    if (editBlockId) {
      const block = currentPlan.blocks.find(b => b.id === editBlockId);
      if (block) {
        let duration = 0;
        if (block.isOneOff) duration = block.oneOffDuration || 0;
        else {
          const template = getTemplateById(block.templateId!);
          duration = template?.durationHours || 0;
        }
        toggleBlockDone(block.id);
        if (!block.done) addCompletedHours(duration);
        else addCompletedHours(-duration);
      }
      setEditBlockId(null);
    }
  };`;

content = content.replace(oldHandlePress, newHandlePress);

// Recupera updateBlockDescription dal context
content = content.replace(
  "const { categories, templates, currentPlan, currentWeekId, getCategoryHours, getCategoryById, scheduleBlock, toggleBlockDone, unscheduleBlock, copyPreviousWeek, getTemplateById } = usePlanner();",
  "const { categories, templates, currentPlan, currentWeekId, getCategoryHours, getCategoryById, scheduleBlock, toggleBlockDone, unscheduleBlock, copyPreviousWeek, getTemplateById, updateBlockDescription } = usePlanner();"
);

// Aggiungi description al BlockChip
content = content.replace(
  "done={block.done}",
  "done={block.done}\n                            description={block.description}"
);

// Aggiungi Edit Block Modal
const modalCode = `      {/* Edit Block Modal */}
      <Modal visible={!!editBlockId} transparent animationType="fade" onRequestClose={() => setEditBlockId(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Block Details</Text>
            
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Specific Task / Description</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="e.g. Chapter 4 exercises"
              placeholderTextColor={colors.textTertiary}
              value={editBlockDesc}
              onChangeText={setEditBlockDesc}
            />
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md}}>
              <View style={{flexDirection: 'row', gap: Spacing.sm}}>
                <Pressable style={[styles.modalButton, { backgroundColor: colors.danger }]} onPress={handleDeleteBlock}>
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>Delete</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, { backgroundColor: colors.success }]} onPress={handleToggleBlock}>
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>✓ Toggle</Text>
                </Pressable>
              </View>
              <View style={{flexDirection: 'row', gap: Spacing.sm}}>
                <Pressable style={[styles.modalButton, { backgroundColor: colors.background }]} onPress={() => setEditBlockId(null)}>
                  <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, { backgroundColor: colors.primary }]} onPress={saveBlockDesc}>
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>{t('common.save')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Template Picker Modal */}`;

content = content.replace("      {/* Template Picker Modal */}", modalCode);

fs.writeFileSync('src/screens/PlannerScreen.tsx', content);
console.log('PlannerScreen patched');
