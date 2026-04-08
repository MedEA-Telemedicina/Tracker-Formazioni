// ============================================
// CONFIGURAZIONE TRACKER FORMAZIONI
// ============================================

const CONFIG = {
  // Google OAuth Client ID
  CLIENT_ID: '976159946912-dkm3g8mo5apvl6d6gdiaqt2jf27fl9r2.apps.googleusercontent.com',

  // Scope di sola lettura del calendario
  SCOPES: 'https://www.googleapis.com/auth/calendar.readonly',

  // Mappatura colori Google Calendar -> Operatori
  // Fonte: https://developers.google.com/calendar/api/v3/reference/colors
  OPERATORI: {
    '11': { nome: 'FABIO CATALDI',       colore: 'Pomodoro',   hex: '#DC2127' },
    '6':  { nome: 'GIOVANNI CAFARO',     colore: 'Fenicottero', hex: '#F691B2' },
    '6':  { nome: 'GIOVANNI CAFARO',     colore: 'Fenicottero', hex: '#F691B2' },
    '3':  { nome: 'VITO PALLADINO',      colore: 'Mandarino',  hex: '#F6BF26' },  // Banana/Mandarino da verificare
    '5':  { nome: 'ANTONIO EQUESTRE',    colore: 'Banana',     hex: '#51B749' },
    '10': { nome: 'CARMINE CALOCERO',    colore: 'Salvia',     hex: '#0B8043' },
    '9':  { nome: 'WILLIAM POTENZA',     colore: 'Mirtillo',   hex: '#7986CB' },
    '8':  { nome: '(da assegnare)',       colore: 'Pavone',     hex: '#039BE5' },
    '1':  { nome: 'ANGELA LIONE',        colore: 'Lavanda',    hex: '#9FC6E7' },
    '7':  { nome: 'ROSY PIA CAVUOTI',    colore: 'Vinaccia',   hex: '#616161' },
    '8':  { nome: 'GIANMARCO PALAZZO',   colore: 'Grafite',    hex: '#616161' },
  },

  // Durata minima per 1 punto formazione (in minuti)
  MINUTI_PER_PUNTO: 30,

  // Auto-refresh intervallo (in minuti). 0 = disabilitato
  AUTO_REFRESH_MINUTI: 5,
};
