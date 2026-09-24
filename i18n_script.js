const fs = require('fs');

const replaceInFile = (path, replacements) => {
  let content = fs.readFileSync(path, 'utf8');
  for (const [it, en] of Object.entries(replacements)) {
    content = content.replace(new RegExp(it, 'g'), en);
  }
  fs.writeFileSync(path, content);
};

// HomeScreen
replaceInFile('src/screens/HomeScreen.tsx', {
  "'Altitudine totale'": "t('home.totalAlt')",
  "'Vette raggiunte'": "t('home.peaksReached')",
  "'Giorni streak'": "t('home.streak')",
  "'Aggiungi la tua prima vetta!'": "t('home.addFirst')",
  "'Nuova Vetta'": "t('home.newPeak')",
  "'Nome Vetta'": "t('home.peakName')",
  "'Descrizione (opzionale)'": "t('home.descOptional')",
  "'Crea Vetta'": "t('home.createPeak')",
  "'Annulla'": "t('common.cancel')",
  "'Crea'": "t('common.create')"
});

// PeakDetailScreen
replaceInFile('src/screens/PeakDetailScreen.tsx', {
  "'campi'": "t('peakDetail.camps')",
  "'🏁 Vetta conquistata!'": "t('peakDetail.conquered')",
  "'Aggiungi campo...'": "t('peakDetail.addCamp')",
  "'Aggiungi'": "t('peakDetail.add')",
  "'Elimina Vetta'": "t('peakDetail.deleteTitle')",
  "'Sei sicuro di voler eliminare questa vetta\\?'": "t('peakDetail.deleteMsg')",
  "'Annulla'": "t('common.cancel')",
  "'Elimina'": "t('common.delete')"
});

// PlannerScreen
replaceInFile('src/screens/PlannerScreen.tsx', {
  "'← Precedente'": "t('planner.prev')",
  "'Prossima →'": "t('planner.next')",
  "'(Corrente)'": "t('planner.current')",
  "'Settimana '": "t('planner.week') + ' '",
  "'Questa settimana è vuota.'": "t('planner.emptyWeek')",
  "'Copia'": "t('planner.copyWeekTitle')",
  "'Vuoi copiare i blocchi ricorrenti dalla settimana precedente\\?'": "t('planner.copyWeekMsg')",
  "'🔄 Copia Settimana Precedente'": "t('planner.copyBtn')",
  "'Programma Blocco'": "t('planner.scheduleBlock')",
  "'Ora di inizio:'": "t('planner.startTime')",
  "'Crea prima un blocco attività!'": "t('planner.createFirst')",
  "'Vai a Gestisci Blocchi'": "t('planner.goToManage')",
  "'Segna da fare'": "t('planner.markTodo')",
  "'Completato'": "t('planner.markDone')",
  "'Vuoi modificare lo stato o rimuoverlo\\?'": "t('planner.modifyOrRemove')",
  "'Rimuovi'": "t('common.remove')",
  "'Annulla'": "t('common.cancel')",
  "'Planner'": "t('tabs.planner')"
});

// ManageBlocksScreen
replaceInFile('src/screens/ManageBlocksScreen.tsx', {
  "'Blocchi & Categorie'": "t('manage.title')",
  "'Tocca una categoria per modificarne le ore target.'": "t('manage.categoriesInfo')",
  "'h target'": "t('manage.targetHours')",
  "'Blocchi Attività'": "t('manage.activityBlocks')",
  "'Nessun blocco definito. Creane uno usando il tasto in basso.'": "t('manage.noBlocks')",
  "'Nuovo Blocco'": "t('manage.newBlock')",
  "'Nome blocco'": "t('manage.blockName')",
  "'Categoria'": "t('manage.category')",
  "'Durata'": "t('manage.duration')",
  "'Modifica Categoria'": "t('manage.editCategory')",
  "'Target ore settimanali (es. 20)'": "t('manage.targetHoursInput')",
  "'Elimina Blocco'": "t('manage.deleteBlockTitle')",
  "'Sei sicuro di voler eliminare '": "t('manage.deleteBlockMsg') + ' '",
  "'Annulla'": "t('common.cancel')",
  "'Elimina'": "t('common.delete')",
  "'Crea'": "t('common.create')",
  "'Salva'": "t('common.save')"
});

// TodayScreen
replaceInFile('src/screens/TodayScreen.tsx', {
  "'Oggi: '": "t('today.title') + ': '",
  "'Nessun blocco'": "t('today.noBlocks')",
  "'ore completate oggi'": "t('today.completedToday')",
});

console.log('Strings replaced.');
