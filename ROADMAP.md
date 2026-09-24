# 🏔️ LevelUp — Roadmap

> Side project personale. Timeboxed, AI-assisted, scope controllato.
> L'obiettivo è avere un'app funzionante sul telefono, non vincere un premio di design.

---

## Filosofia di sviluppo

- **Product Owner + Solutions Architect**: tu definisci architettura e specifiche, l'AI genera il codice UI
- **Timebox per fase**: ogni fase ha un budget di ore. Se sfora, si taglia scope, non si aggiunge tempo
- **Ship early, iterate later**: meglio un'app brutta che usi davvero che una bella che non finisci mai

---

## Fase 0 — Setup progetto `[~4h]`

- [x] Brainstorming e definizione del concept
- [x] Creazione repo GitHub
- [x] README e ROADMAP
- [ ] Inizializzazione progetto Expo (React Native)
- [ ] Struttura cartelle (`/src`, `/components`, `/store`, `/assets`, ecc.)
- [ ] Configurazione linter + formatter (ESLint + Prettier)
- [ ] Primo commit con scheletro vuoto funzionante

**Deliverable**: `npx expo start` funziona, app mostra una schermata vuota con il nome "LevelUp"

---

## Fase 1 — MVP: Vette e Campi `[~12-16h]`

Il cuore dell'app. Nient'altro.

### 1.1 — Modello dati e persistenza
- [ ] Definire lo schema dati (`Peak`, `Camp`, metadati)
- [ ] Setup storage locale (`expo-sqlite` o `AsyncStorage` + JSON)
- [ ] CRUD completo: creare/modificare/eliminare vette e campi

### 1.2 — UI principale
- [ ] Schermata Home: lista delle vette con progresso (barra o %)
- [ ] Schermata dettaglio vetta: lista campi con checkbox
- [ ] Visualizzazione SVG montagna con tracciato che si riempie (`react-native-svg`)
- [ ] Statistiche aggregate: altitudine totale, vette raggiunte

### 1.3 — Gamification base
- [ ] Contatore streak (giorni consecutivi di attività)
- [ ] Feedback visivo al completamento di un campo (animazione semplice)
- [ ] Feedback visivo al completamento di una vetta (bandierina + celebrazione)

### 1.4 — Polish minimo
- [ ] Tema chiaro/scuro (segue il sistema)
- [ ] Navigazione fluida tra schermate (Expo Router o React Navigation)
- [ ] Icona app e splash screen

**Deliverable**: APK installabile sul telefono. Puoi creare vette, spuntare campi, vedere il progresso. Fine.

---

## Fase 2 — Weekly Planner `[~10-14h]`

Il time-blocking che risolve il problema originale: "non so cosa fare".

### 2.1 — Modello dati planner
- [ ] Definire `Block` (attività, categoria, durata stimata, colore)
- [ ] Definire `WeeklySlot` (giorno, fascia oraria, blocco assegnato)
- [ ] Collegamento opzionale blocco → vetta (le ore di studio contano come progresso)

### 2.2 — UI planner
- [ ] Vista settimanale a griglia (lun-dom, fasce orarie)
- [ ] Drag & drop dei blocchi negli slot (o tap per assegnare)
- [ ] Monte ore settimanale per categoria (barra di progresso)
- [ ] Vista giornaliera: "cosa devo fare oggi" — la schermata che apri la mattina

### 2.3 — Tracking e review
- [ ] Spunta blocchi completati durante la giornata
- [ ] Riepilogo settimanale: ore pianificate vs ore fatte
- [ ] Prompt domenicale di review ("com'è andata questa settimana?")

**Deliverable**: puoi pianificare la settimana la domenica sera, e ogni mattina sai cosa fare senza pensarci.

---

## Fase 3 — Automazione e CI/CD `[~4-6h]`

### 3.1 — Build automatizzata
- [ ] Configurazione EAS Build (account Expo gratuito)
- [ ] GitHub Action: su tag/release → build APK → allegato alla release
- [ ] Documentare il processo di installazione APK nel README

### 3.2 — Quality
- [ ] Test unitari sullo store/logica (Jest)
- [ ] Test di base sui componenti principali

**Deliverable**: pushare un tag su GitHub genera automaticamente un APK scaricabile dalla pagina Releases.

---

## Backlog — Idee future (non pianificate, non promesse)

> Queste feature esistono solo qui. Non vanno toccate finché la Fase 2 non è stabile e usata quotidianamente da almeno 2 settimane.

- [ ] Notifiche/reminder per i blocchi pianificati
- [ ] Widget Android per la vista giornaliera
- [ ] Grafici storici (progresso nel tempo, ore per settimana)
- [ ] Export dati (JSON/CSV)
- [ ] Sincronizzazione tra dispositivi (solo se davvero necessario)
- [ ] Integrazione con Google Calendar (import blocchi)
- [ ] Achievements/badge per milestone particolari

---

## Anti-pattern da evitare

| ❌ Non fare | ✅ Fai invece |
|---|---|
| Aggiungere feature al backlog durante una fase attiva | Scrivile su un post-it e ignorale fino a fine fase |
| Perfezionare la UI prima che la logica funzioni | Ship ugly, polish later |
| Passare più di 30 min su un bug CSS | Chiedi all'AI, accetta il risultato, vai avanti |
| Confrontare l'app con Todoist/Notion/TickTick | Questa app risolve **il tuo** problema, non quello di tutti |
| Lavorarci quando dovresti studiare | Mai durante i blocchi di Deep Work |

---

*Ultimo aggiornamento: settembre 2026*
