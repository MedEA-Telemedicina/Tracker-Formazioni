# 📋 Tracker Formazioni

Dashboard web per il monitoraggio automatico delle formazioni da Google Calendar.

L'applicazione legge gli eventi dal calendario, identifica l'operatore assegnato in base al **colore** dell'evento, e conteggia automaticamente le formazioni (1 formazione = 30 minuti di appuntamento).

---

## 🎨 Mappatura Colori → Operatori

| Colore Google Calendar | Operatore           |
|----------------------|---------------------|
| 🔴 Pomodoro          | FABIO CATALDI       |
| 🩷 Fenicottero       | GIOVANNI CAFARO     |
| 🟠 Mandarino         | VITO PALLADINO      |
| 🟡 Banana            | ANTONIO EQUESTRE    |
| 🌿 Salvia            | CARMINE CALOCERO    |
| 🔵 Mirtillo          | WILLIAM POTENZA     |
| 🦚 Pavone            | Da Associare        |
| 💜 Lavanda           | ANGELA LIONE        |
| 🍇 Vinaccia          | ROSY PIA CAVUOTI    |
| ⚫ Grafite           | GIANMARCO PALAZZO   |

---

## 🚀 Setup - Passo per Passo

### 1. Creare un Progetto Google Cloud

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Clicca **"Crea Progetto"** (o "Select a project" → "New Project")
3. Dai un nome al progetto (es. "Tracker Formazioni")
4. Clicca **"Crea"**

### 2. Abilitare l'API Google Calendar

1. Nel menu laterale vai su **"API e servizi"** → **"Libreria"**
2. Cerca **"Google Calendar API"**
3. Clicca su **Google Calendar API** e poi su **"Abilita"**

### 3. Configurare la Schermata di Consenso OAuth

1. Vai su **"API e servizi"** → **"Schermata consenso OAuth"**
2. Seleziona **"Interno"** (se usi Google Workspace aziendale) oppure **"Esterno"**
3. Compila i campi obbligatori:
   - **Nome app**: Tracker Formazioni
   - **Email di supporto**: la tua email
   - **Email contatto sviluppatore**: la tua email
4. Clicca **"Salva e continua"**
5. Nella sezione **Ambiti (Scopes)**, clicca **"Aggiungi o rimuovi ambiti"**
6. Cerca e seleziona: `https://www.googleapis.com/auth/calendar.readonly`
7. Clicca **"Aggiorna"** poi **"Salva e continua"**
8. Se hai scelto "Esterno", nella sezione **"Utenti di test"** aggiungi gli indirizzi email degli utenti che useranno l'app
9. Clicca **"Salva e continua"**

### 4. Creare le Credenziali OAuth2

1. Vai su **"API e servizi"** → **"Credenziali"**
2. Clicca **"+ CREA CREDENZIALI"** → **"ID client OAuth"**
3. Tipo di applicazione: **"Applicazione web"**
4. Nome: "Tracker Formazioni Web"
5. In **"Origini JavaScript autorizzate"** aggiungi:
   - `https://TUO-USERNAME.github.io` (per GitHub Pages)
   - `http://localhost:8000` (opzionale, per test locale)
6. Clicca **"Crea"**
7. **Copia il Client ID** (sarà qualcosa come `123456789-xxxx.apps.googleusercontent.com`)

### 5. Configurare l'Applicazione

1. Apri il file `config.js`
2. Sostituisci `'IL_TUO_CLIENT_ID.apps.googleusercontent.com'` con il Client ID copiato al passo 4

```javascript
const CONFIG = {
    clientId: 'IL-TUO-CLIENT-ID.apps.googleusercontent.com',
    defaultCalendarId: 'primary',
};
```

---

## 📤 Deploy su GitHub Pages

### Creare il Repository

1. Vai su [GitHub](https://github.com) e accedi
2. Clicca **"+"** → **"New repository"**
3. Nome: `formazioni-tracker`
4. Visibilità: **Public** (richiesto per GitHub Pages gratuito) oppure **Private** (con GitHub Pro)
5. Clicca **"Create repository"**

### Caricare i File

```bash
# Clona il repository vuoto
git clone https://github.com/TUO-USERNAME/formazioni-tracker.git
cd formazioni-tracker

# Copia i file dell'app nella cartella
# (index.html, style.css, app.js, config.js)

# Commit e push
git add .
git commit -m "Primo rilascio Tracker Formazioni"
git push origin main
```

Oppure carica i file direttamente dall'interfaccia web di GitHub:
1. Apri il repository
2. Clicca **"Add file"** → **"Upload files"**
3. Trascina tutti i file (index.html, style.css, app.js, config.js)
4. Clicca **"Commit changes"**

### Attivare GitHub Pages

1. Vai nelle **Settings** del repository
2. Nel menu laterale clicca **"Pages"**
3. In **"Source"** seleziona: **"Deploy from a branch"**
4. Branch: **main**, cartella: **/ (root)**
5. Clicca **"Save"**
6. Dopo 1-2 minuti, il sito sarà disponibile su: `https://TUO-USERNAME.github.io/formazioni-tracker/`

### ⚠️ Aggiornare le Origini OAuth

Dopo aver attivato GitHub Pages, torna su Google Cloud Console e verifica che l'URL `https://TUO-USERNAME.github.io` sia presente nelle **Origini JavaScript autorizzate** delle credenziali OAuth.

---

## 🟣 Integrazione con Microsoft Teams

Per aggiungere il tracker come **tab** in un canale Teams:

1. Apri il canale Teams desiderato
2. Clicca il **"+"** in alto (Aggiungi una scheda)
3. Cerca e seleziona **"Sito Web"** (Website)
4. Compila:
   - **Nome scheda**: Tracker Formazioni
   - **URL**: `https://TUO-USERNAME.github.io/formazioni-tracker/`
5. Clicca **"Salva"**

L'app sarà ora accessibile direttamente come tab nel canale Teams! 🎉

> **Nota**: Al primo accesso da Teams, ogni utente dovrà cliccare "Accedi con Google" per autorizzare la lettura del calendario. Questa autorizzazione viene mantenuta per la durata della sessione.

---

## 🧮 Come Funziona il Conteggio

- L'app legge tutti gli eventi del mese selezionato dal Google Calendar
- Per ogni evento con un **colore assegnato**, calcola la durata
- **1 formazione = 30 minuti** di appuntamento
  - 30 min → 1 formazione
  - 1 ora → 2 formazioni
  - 1,5 ore → 3 formazioni
  - 2 ore → 4 formazioni
- Gli eventi **senza colore** o con colori non mappati vengono ignorati
- Gli eventi **tutto il giorno** vengono ignorati

---

## 📥 Esportazione CSV

L'app permette di esportare i dati del mese corrente in formato **CSV** (compatibile con Excel italiano, separatore `;`).

Clicca il pulsante **📥 CSV** nell'header per scaricare il file.

---

## 🛠️ Test in Locale

Per testare l'app in locale prima del deploy:

```bash
# Dalla cartella del progetto
python3 -m http.server 8000

# Oppure con Node.js
npx serve .
```

Poi apri `http://localhost:8000` nel browser.

> Ricorda di aggiungere `http://localhost:8000` nelle Origini JavaScript autorizzate in Google Cloud Console.

---

## 🔒 Sicurezza

- L'app richiede **solo** il permesso di **lettura** del calendario (`calendar.readonly`)
- **Nessun dato viene inviato a server esterni** — tutto il processing avviene nel browser
- Il token di accesso viene salvato solo nella **sessione del browser** (sessionStorage) e cancellato alla chiusura della scheda
- Il codice sorgente è completamente ispezionabile

---

## ✏️ Personalizzazione

### Modificare gli Operatori

Per aggiungere, rimuovere o modificare gli operatori, edita l'oggetto `OPERATORS` nel file `app.js`:

```javascript
const OPERATORS = {
    '11': { name: 'FABIO CATALDI', colorName: 'Pomodoro', hex: '#D50000' },
    // ... aggiungi o modifica qui
};
```

I **colorId** di Google Calendar sono:
| ID | Colore      | Hex UI    |
|----|-------------|-----------|
| 1  | Lavanda     | #7986CB   |
| 2  | Salvia      | #33B679   |
| 3  | Vinaccia    | #8E24AA   |
| 4  | Fenicottero | #E67C73   |
| 5  | Banana      | #F6BF26   |
| 6  | Mandarino   | #F4511E   |
| 7  | Pavone      | #039BE5   |
| 8  | Grafite     | #616161   |
| 9  | Mirtillo    | #3F51B5   |
| 10 | Basilico    | #0B8043   |
| 11 | Pomodoro    | #D50000   |
