const fs = require('fs');
const glob = require('glob');

const replacements = {
  "// Raggruppa template per categoria": "// Group templates by category",
  "// Carica dati all'avvio": "// Load data on startup",
  "// Salva peaks ogni volta che cambiano": "// Save peaks whenever they change",
  "// Salva streak e ore ogni volta che cambiano": "// Save streak and hours whenever they change",
  "// Controlla se la vetta è stata completata": "// Check if peak was completed",
  "// Ricalcola completamento vetta": "// Recalculate peak completion",
  "// ── Categorie predefinite ──": "// ── Default Categories ──",
  "// Rimuovi anche i blocchi schedulati con questo template": "// Also remove scheduled blocks with this template",
  "// Sincronizza con Google Calendar in background e salva l'ID": "// Sync with Google Calendar in background and save ID",
  "// Sincronizza con Google Calendar in background": "// Sync with Google Calendar in background",
  "// Non copiamo eventi una tantum": "// Do not copy one-off events",
  "// Crea eventi sul nuovo calendario in background": "// Create events on the new calendar in background",
  "// collegamento opzionale a una vetta": "// optional link to a peak",
  "// 100m per campo completato + 1m per ora completata": "// 100m per completed camp + 1m per completed hour",
  "// Incrementato quando un blocco viene completato": "// Incremented when a block is completed",
  "// opzionale se è one-off": "// optional if it's one-off",
  "// formato \"HH:mm\", es. \"09:30\" o \"22:00\"": "// format \"HH:mm\", e.g. \"09:30\" or \"22:00\"",
  "// ID dell'evento su Google Calendar per poterlo cancellare": "// Google Calendar event ID to allow deletion",
  "// Campi per blocchi one-off temporanei": "// Fields for temporary one-off blocks",
  "// 100m per campo + 1m per ora": "// 100m per camp + 1m per hour",
  "// Già attivo oggi, non cambia": "// Already active today, no change",
  "// Giorno consecutivo": "// Consecutive day",
  "// Streak interrotto": "// Streak broken",
  "// Se il colore è cambiato, potremmo aggiornarlo, ma per ora teniamo semplice": "// If the color changed, we could update it, but keep it simple for now",
  "// Fallback al primario": "// Fallback to primary",
  "// 0=Lun, 6=Dom": "// 0=Mon, 6=Sun",
  "// Notifica 10 min prima": "// Notify 10 mins before",
  "// Auto-save": "// Auto-save",
  "// ── Actions ──": "// ── Actions ──",
  "/* Sezione Categorie */": "{/* Categories Section */}",
  "/* FAB – Nuovo Blocco */": "{/* FAB - New Block */}",
  "/* Modal Categoria */": "{/* Category Modal */}",
  "/* Modal Nuovo Blocco */": "{/* New Block Modal */}",
  "// Sezione Categorie": "// Categories Section",
  "// Categorie summary": "{/* Categories summary */}",
  "// Grid": "{/* Grid */}"
};

const replaceInFile = (path) => {
  let content = fs.readFileSync(path, 'utf8');
  let changed = false;
  for (const [it, en] of Object.entries(replacements)) {
    if (content.includes(it)) {
      content = content.replace(new RegExp(it.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), en);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(path, content);
  }
};

const findFiles = (dir) => {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const path = `${dir}/${file.name}`;
    if (file.isDirectory()) {
      findFiles(path);
    } else if (path.endsWith('.ts') || path.endsWith('.tsx') || path.endsWith('.js')) {
      replaceInFile(path);
    }
  }
};

findFiles('src');
console.log('Comments translated');
