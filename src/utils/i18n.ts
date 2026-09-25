import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

const translations = {
  en: {
    // App.tsx
    tabs: {
      today: 'Today',
      peaks: 'Peaks',
      planner: 'Planner',
      blocks: 'Blocks',
      settings: 'Settings',
    },
    days: {
      lun: 'Monday',
      mar: 'Tuesday',
      mer: 'Wednesday',
      gio: 'Thursday',
      ven: 'Friday',
      sab: 'Saturday',
      dom: 'Sunday'
    },
    // Categories
    categories: {
      sleep: 'Sleep',
      uni: 'University',
      study: 'Study',
      cp: 'Competitive Prog.',
      hobby: 'Hobby',
      freetime: 'Free Time',
      other: 'Other'
    },
    // Common
    common: {
      cancel: 'Cancel',
      create: 'Create',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      remove: 'Remove',
    },
    // Home
    home: {
      totalAlt: 'Total Altitude',
      peaksReached: 'Peaks Reached',
      streak: 'Day Streak',
      addFirst: 'Add your first peak!',
      newPeak: 'New Peak',
      peakName: 'Peak Name',
      descOptional: 'Description (optional)',
      createPeak: 'Create Peak',
    },
    // Peak Detail
    peakDetail: {
      camps: 'camps',
      conquered: '🏁 Peak Conquered!',
      addCamp: 'Add new camp...',
      add: 'Add',
      deleteTitle: 'Delete Peak',
      deleteMsg: 'Are you sure you want to delete this peak?',
    },
    // Planner
    planner: {
      prev: '← Previous',
      next: 'Next →',
      current: '(Current)',
      week: 'Week',
      emptyWeek: 'This week is empty.',
      copyWeekTitle: 'Copy',
      copyWeekMsg: 'Do you want to copy recurring blocks from the previous week?',
      copyBtn: '🔄 Copy Previous Week',
      scheduleBlock: 'Schedule Block',
      startTime: 'Start time:',
      createFirst: 'Create an activity block first!',
      goToManage: 'Go to Manage Blocks',
      markTodo: 'Mark To-Do',
      markDone: 'Completed',
      modifyOrRemove: 'Modify status or remove?',
    },
    // Manage Blocks
    manage: {
      title: 'Blocks & Categories',
      categoriesInfo: 'Tap a category to edit target hours.',
      targetHours: 'h target',
      activityBlocks: 'Activity Blocks',
      noBlocks: 'No blocks defined. Create one using the button below.',
      newBlock: 'New Block',
      blockName: 'Block name',
      category: 'Category',
      duration: 'Duration',
      editCategory: 'Edit Category',
      targetHoursInput: 'Weekly target hours (e.g. 20)',
      deleteBlockTitle: 'Delete Block',
      deleteBlockMsg: 'Are you sure you want to delete',
    },
    // Today
    today: {
      title: 'Today',
      morning: '🌅 Morning',
      afternoon: '☀️ Afternoon',
      evening: '🌙 Evening',
      noBlocks: 'No blocks',
      completedToday: 'hours completed today',
      yourDay: 'Your day',
      todayProgress: 'Today\'s Progress',
    },
    settings: {
      langTitle: '🌐 Language / Lingua',
      backupTitle: '💾 Backup & Data',
      backupDesc: 'Export all your data (Peaks, Categories, Blocks) in JSON format. You can save it to Google Drive or email it to yourself as a safety backup.',
      exportBtn: '📥 Export JSON Backup',
      importBtn: '📤 Import JSON Backup',
      importConfirmTitle: 'Import Backup',
      importConfirmMsg: 'Are you sure? This will OVERWRITE all your current data.',
      importSuccess: 'Backup imported successfully! Please restart the app.',
      importError: 'Failed to import backup.',
      aboutTitle: 'ℹ️ About LevelUp',
      aboutDesc1: 'LevelUp was born from a simple need: eliminating decision fatigue in free time. The mountain climbing metaphor helps tracking long-term goals (Peaks) and breaking them down into actionable steps (Camps).',
      aboutDesc2: 'This app is 100% Open Source and built by developers, for everyone.',
      starGithub: '⭐ Star on GitHub',
      submitIssue: '🐛 Submit an Issue',
      feedbackPlayStore: '⭐ Leave a feedback on Play Store (WIP)'
    }
  },
  it: {
    // App.tsx
    tabs: {
      today: 'Oggi',
      peaks: 'Vette',
      planner: 'Planner',
      blocks: 'Blocchi',
      settings: 'Impostazioni',
    },
    days: {
      lun: 'Lunedì',
      mar: 'Martedì',
      mer: 'Mercoledì',
      gio: 'Giovedì',
      ven: 'Venerdì',
      sab: 'Sabato',
      dom: 'Domenica'
    },
    // Categories
    categories: {
      sleep: 'Sonno',
      uni: 'Lezione Uni',
      study: 'Studio',
      cp: 'Competitive Prog.',
      hobby: 'Hobby',
      freetime: 'Tempo Libero',
      other: 'Altro'
    },
    // Common
    common: {
      cancel: 'Annulla',
      create: 'Crea',
      save: 'Salva',
      delete: 'Elimina',
      edit: 'Modifica',
      remove: 'Rimuovi',
    },
    // Home
    home: {
      totalAlt: 'Altitudine totale',
      peaksReached: 'Vette raggiunte',
      streak: 'Giorni streak',
      addFirst: 'Aggiungi la tua prima vetta!',
      newPeak: 'Nuova Vetta',
      peakName: 'Nome Vetta',
      descOptional: 'Descrizione (opzionale)',
      createPeak: 'Crea Vetta',
    },
    // Peak Detail
    peakDetail: {
      camps: 'campi',
      conquered: '🏁 Vetta conquistata!',
      addCamp: 'Aggiungi campo...',
      add: 'Aggiungi',
      deleteTitle: 'Elimina Vetta',
      deleteMsg: 'Sei sicuro di voler eliminare questa vetta?',
    },
    // Planner
    planner: {
      prev: '← Precedente',
      next: 'Prossima →',
      current: '(Corrente)',
      week: 'Settimana',
      emptyWeek: 'Questa settimana è vuota.',
      copyWeekTitle: 'Copia',
      copyWeekMsg: 'Vuoi copiare i blocchi ricorrenti dalla settimana precedente?',
      copyBtn: '🔄 Copia Settimana Precedente',
      scheduleBlock: 'Programma Blocco',
      startTime: 'Ora di inizio:',
      createFirst: 'Crea prima un blocco attività!',
      goToManage: 'Vai a Gestisci Blocchi',
      markTodo: 'Segna da fare',
      markDone: 'Completato',
      modifyOrRemove: 'Vuoi modificare lo stato o rimuoverlo?',
    },
    // Manage Blocks
    manage: {
      title: 'Blocchi & Categorie',
      categoriesInfo: 'Tocca una categoria per modificarne le ore target.',
      targetHours: 'h target',
      activityBlocks: 'Blocchi Attività',
      noBlocks: 'Nessun blocco definito. Creane uno usando il tasto in basso.',
      newBlock: 'Nuovo Blocco',
      blockName: 'Nome blocco',
      category: 'Categoria',
      duration: 'Durata',
      editCategory: 'Modifica Categoria',
      targetHoursInput: 'Target ore settimanali (es. 20)',
      deleteBlockTitle: 'Elimina Blocco',
      deleteBlockMsg: 'Sei sicuro di voler eliminare',
    },
    // Today
    today: {
      title: 'Oggi',
      morning: '🌅 Mattina',
      afternoon: '☀️ Pomeriggio',
      evening: '🌙 Sera',
      noBlocks: 'Nessun blocco',
      completedToday: 'ore completate oggi',
      yourDay: 'La tua giornata',
      todayProgress: 'Progresso odierno',
    },
    settings: {
      langTitle: '🌐 Language / Lingua',
      backupTitle: '💾 Backup & Dati',
      backupDesc: 'Esporta tutti i tuoi dati (Vette, Categorie, Blocchi) in formato JSON. Potrai salvarli su Google Drive o inviarteli per email come backup di sicurezza.',
      exportBtn: '📥 Esporta Backup JSON',
      importBtn: '📤 Importa Backup JSON',
      importConfirmTitle: 'Importa Backup',
      importConfirmMsg: 'Sei sicuro? Questa operazione SOVRASCRIVERÀ tutti i tuoi dati correnti.',
      importSuccess: 'Backup importato con successo! Riavvia l\'app.',
      importError: 'Errore durante l\'importazione del backup.',
      aboutTitle: 'ℹ️ About LevelUp',
      aboutDesc1: 'LevelUp nasce da una necessità semplice: eliminare la "decision fatigue" nel tempo libero. La metafora dell\'arrampicata aiuta a tracciare obiettivi a lungo termine (Vette) e suddividerli in passaggi concreti (Campi).',
      aboutDesc2: 'Questa app è 100% Open Source, creata da sviluppatori per tutti.',
      starGithub: '⭐ Metti una stella su GitHub',
      submitIssue: '🐛 Aggiungi una Issue',
      feedbackPlayStore: '⭐ Lascia un feedback sul Play Store (WIP)'
    }
  }
};

const i18n = new I18n(translations);
i18n.locale = getLocales()[0]?.languageCode ?? 'en';
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export const t = (key: string, options?: any) => i18n.t(key, options);
export default i18n;
