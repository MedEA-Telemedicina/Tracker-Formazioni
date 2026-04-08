// ============================================
// CONFIGURAZIONE TRACKER FORMAZIONI
// ============================================

const CONFIG = {
  // Google OAuth Client ID
  CLIENT_ID: '976159946912-dkm3g8mo5apvl6d6gdiaqt2jf27fl9r2.apps.googleusercontent.com',

  // Scope di sola lettura del calendario
  SCOPES: 'https://www.googleapis.com/auth/calendar.readonly',

  // Mappatura colori Google Calendar -> Operatori
  // ID ufficiali Google Calendar API:
  // 1=Lavanda, 2=Salvia, 3=Vinaccia/Uva, 4=Fenicottero, 5=Banana,
  // 6=Mandarino, 7=Pavone, 8=Mirtillo, 9=Basilico, 10=Pomodoro, 11=Grafite
  OPERATORI: {
    '10': { nome: 'FABIO CATALDI',      colore: 'Pomodoro',    hex: '#D50000' },
    '4':  { nome: 'GIOVANNI CAFARO',    colore: 'Fenicottero', hex: '#F4511E' },
    '6':  { nome: 'VITO PALLADINO',     colore: 'Mandarino',   hex: '#F6BF26' },
    '5':  { nome: 'ANTONIO EQUESTRE',   colore: 'Banana',      hex: '#F6BF26' },
    '2':  { nome: 'CARMINE CALOCERO',   colore: 'Salvia',      hex: '#33B679' },
    '8':  { nome: 'WILLIAM POTENZA',    colore: 'Mirtillo',    hex: '#3F51B5' },
    '7':  { nome: '(da assegnare)',      colore: 'Pavone',      hex: '#039BE5' },
    '1':  { nome: 'ANGELA LIONE',       colore: 'Lavanda',     hex: '#7986CB' },
    '3':  { nome: 'ROSY PIA CAVUOTI',   colore: 'Vinaccia',    hex: '#8E24AA' },
    '11': { nome: 'GIANMARCO PALAZZO',  colore: 'Grafite',     hex: '#616161' },
  },

  // Durata minima per 1 punto formazione (in minuti)
  MINUTI_PER_PUNTO: 30,

  // Auto-refresh intervallo (in minuti). 0 = disabilitato
  AUTO_REFRESH_MINUTI: 5,
};
