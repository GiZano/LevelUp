const fs = require('fs');
let content = fs.readFileSync('src/components/BlockChip.tsx', 'utf8');

content = content.replace(
  'done: boolean;',
  'done: boolean;\n  description?: string;'
);

content = content.replace(
  'done,\n  onPress',
  'done,\n  description,\n  onPress'
);

content = content.replace(
  `<View style={styles.nameContainer}>
        {done && <Text style={[styles.checkmark, { color: colors.success }]}>✓ </Text>}
        <Text
          style={[
            styles.name,
            { color: colors.text },
            done && styles.nameDone,
          ]}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>`,
  `<View style={styles.nameContainer}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {done && <Text style={[styles.checkmark, { color: colors.success }]}>✓ </Text>}
          <Text
            style={[
              styles.name,
              { color: colors.text },
              done && styles.nameDone,
            ]}
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
        {!!description && (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>`
);

content = content.replace(
  `nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },`,
  `nameContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },`
);

content = content.replace(
  `nameDone: {
    textDecorationLine: 'line-through',
  },`,
  `nameDone: {
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    marginTop: 2,
  },`
);

fs.writeFileSync('src/components/BlockChip.tsx', content);
console.log('BlockChip patched');
