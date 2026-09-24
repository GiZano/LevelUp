const fs = require('fs');
let content = fs.readFileSync('src/screens/TodayScreen.tsx', 'utf8');

content = content.replace(
  `<View style={{flex: 1}}>
                      <Text style={[styles.blockName, { color: colors.text }, b.done && {textDecorationLine: 'line-through'}]}>{name}</Text>
                    </View>`,
  `<View style={{flex: 1, flexDirection: 'column'}}>
                      <Text style={[styles.blockName, { color: colors.text }, b.done && {textDecorationLine: 'line-through'}]}>{name}</Text>
                      {!!b.description && (
                        <Text style={{fontSize: 13, color: colors.textSecondary, fontStyle: 'italic', marginTop: 2}}>
                          {b.description}
                        </Text>
                      )}
                    </View>`
);

fs.writeFileSync('src/screens/TodayScreen.tsx', content);
