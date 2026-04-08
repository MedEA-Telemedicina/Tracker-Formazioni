// ============================================================
// Tracker Formazioni - Applicazione Principale
// ============================================================

// --- Mappatura Colore Google Calendar → Operatore ---
// I colorId sono quelli restituiti dall'API Google Calendar v3
const OPERATORS = {
    '11': { name: 'FABIO CATALDI',        colorName: 'Pomodoro',     hex: '#D50000' },
    '4':  { name: 'GIOVANNI CAFARO',      colorName: 'Fenicottero',  hex: '#E67C73' },
    '6':  { name: 'VITO PALLADINO',       colorName: 'Mandarino',    hex: '#F4511E' },
    '5':  { name: 'ANTONIO EQUESTRE',     colorName: 'Banana',       hex: '#F6BF26' },
    '2':  { name: 'CARMINE CALOCERO',     colorName: 'Salvia',       hex: '#33B679' },
    '9':  { name: 'WILLIAM POTENZA',      colorName: 'Mirtillo',     hex: '#3F51B5' },
    '7':  { name: 'Da Associare',         colorName: 'Pavone',       hex: '#039BE5' },
    '1':  { name: 'ANGELA LIONE',         colorName: 'Lavanda',      hex: '#7986CB' },
    '3':  { name: 'ROSY PIA CAVUOTI',     colorName: 'Vinaccia',     hex: '#8E24AA' },
    '8':  { name: 'GIANMARCO PALAZZO',    colorName: 'Grafite',      hex: '#616161' },
};

// --- Nomi dei mesi in italiano ---
const MESI = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

// --- Stato dell'applicazione ---
let tokenClient;
let accessToken = null;
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let currentData = null;
let calendars = [];
let selectedCalendarId = CONFIG.defaultCalendarId || 'primary';

// ============================================================
// INIZIALIZZAZIONE & AUTENTICAZIONE
// ============================================================

function initApp() {
    if (typeof google === 'undefined' || !google.accounts) {
        // GIS non ancora caricato, ritenta tra 100ms
        setTimeout(initApp, 100);
        return;
    }

    tokenClient = google.accounts.oauth2.initTokenModel({
        client_id: CONFIG.clientId,
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
        callback: handleTokenResponse,
    });

    updateMonthDisplay();

    // Controlla se c'è un token salvato in sessione
    const savedToken = sessionStorage.getItem('gcal_token');
    if (savedToken) {
        accessToken = savedToken;
        onLoginSuccess();
    }
}

function handleTokenResponse(response) {
    if (response.error) {
        showError('Errore di autenticazione: ' + response.error_description);
        return;
    }
    accessToken = response.access_token;
    sessionStorage.setItem('gcal_token', accessToken);
    onLoginSuccess();
}

function login() {
    if (!tokenClient) {
        showError('Libreria Google non ancora caricata. Riprova tra qualche secondo.');
        return;
    }
    tokenClient.requestAccessToken({ prompt: 'consent' });
}

function logout() {
    if (accessToken) {
        google.accounts.oauth2.revoke(accessToken);
        accessToken = null;
        sessionStorage.removeItem('gcal_token');
    }
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
}

async function onLoginSuccess() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';

    try {
        await loadCalendars();
        await loadEvents();
    } catch (e) {
        console.error('Errore inizializzazione:', e);
    }
}

// ============================================================
// CHIAMATE API GOOGLE CALENDAR
// ============================================================

async function apiCall(url) {
    const response = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + accessToken }
    });

    if (response.status === 401) {
        // Token scaduto
        accessToken = null;
        sessionStorage.removeItem('gcal_token');
        showError('Sessione scaduta. Effettua nuovamente l\'accesso.');
        logout();
        throw new Error('Token expired');
    }

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Errore API: ' + response.status);
    }

    return response.json();
}

async function loadCalendars() {
    try {
        const data = await apiCall(
            'https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=reader'
        );
        calendars = (data.items || []).sort((a, b) => {
            if (a.primary) return -1;
            if (b.primary) return 1;
            return (a.summary || '').localeCompare(b.summary || '');
        });
        renderCalendarSelector();
    } catch (e) {
        console.error('Errore caricamento calendari:', e);
    }
}

async function fetchAllEvents(year, month) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);

    const timeMin = start.toISOString();
    const timeMax = end.toISOString();

    let allEvents = [];
    let pageToken = '';

    do {
        let url = 'https://www.googleapis.com/calendar/v3/calendars/'
            + encodeURIComponent(selectedCalendarId)
            + '/events?'
            + 'timeMin=' + encodeURIComponent(timeMin)
            + '&timeMax=' + encodeURIComponent(timeMax)
            + '&singleEvents=true'
            + '&maxResults=2500'
            + '&orderBy=startTime';

        if (pageToken) {
            url += '&pageToken=' + encodeURIComponent(pageToken);
        }

        const data = await apiCall(url);
        allEvents = allEvents.concat(data.items || []);
        pageToken = data.nextPageToken || '';
    } while (pageToken);

    return allEvents;
}

async function loadEvents() {
    showLoading(true);
    try {
        const events = await fetchAllEvents(currentYear, currentMonth);
        currentData = calculateFormations(events);
        renderDashboard(currentData);
    } catch (e) {
        if (e.message !== 'Token expired') {
            showError('Errore nel caricamento: ' + e.message);
        }
    } finally {
        showLoading(false);
    }
}

// ============================================================
// CALCOLO FORMAZIONI
// ============================================================

function calculateFormations(events) {
    const counts = {};

    // Inizializza tutti gli operatori a zero
    Object.entries(OPERATORS).forEach(([colorId, op]) => {
        counts[colorId] = {
            ...op,
            colorId: colorId,
            formations: 0,
            totalMinutes: 0,
            eventCount: 0,
            events: []
        };
    });

    let totalFormations = 0;
    let totalMinutes = 0;
    let totalEvents = 0;

    events.forEach(event => {
        const colorId = event.colorId;

        // Ignora eventi senza colore o con colore non mappato
        if (!colorId || !OPERATORS[colorId]) return;

        // Ignora eventi cancellati
        if (event.status === 'cancelled') return;

        // Calcola durata in minuti (solo eventi con orario, no all-day)
        if (!event.start.dateTime || !event.end.dateTime) return;

        const startTime = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);
        const durationMinutes = (endTime - startTime) / (1000 * 60);

        if (durationMinutes <= 0) return;

        // 1 formazione ogni 30 minuti (arrotondamento per difetto)
        const formations = Math.floor(durationMinutes / 30);

        counts[colorId].formations += formations;
        counts[colorId].totalMinutes += durationMinutes;
        counts[colorId].eventCount++;
        counts[colorId].events.push({
            title: event.summary || '(Senza titolo)',
            start: startTime,
            end: endTime,
            duration: durationMinutes,
            formations: formations
        });

        totalFormations += formations;
        totalMinutes += durationMinutes;
        totalEvents++;
    });

    return { operators: counts, totalFormations, totalMinutes, totalEvents };
}

// ============================================================
// RENDERING UI
// ============================================================

function updateMonthDisplay() {
    document.getElementById('month-display').textContent =
        MESI[currentMonth] + ' ' + currentYear;
}

function renderCalendarSelector() {
    const select = document.getElementById('calendar-select');
    if (!select) return;

    select.innerHTML = '';
    calendars.forEach(cal => {
        const option = document.createElement('option');
        option.value = cal.id;
        option.textContent = cal.summary || cal.id;
        if (cal.primary && selectedCalendarId === 'primary') {
            option.selected = true;
            selectedCalendarId = cal.id;
        } else if (cal.id === selectedCalendarId) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function renderDashboard(data) {
    // Aggiorna riepilogo
    document.getElementById('total-formations').textContent = data.totalFormations;
    document.getElementById('total-hours').textContent = formatHours(data.totalMinutes);
    document.getElementById('total-events').textContent = data.totalEvents;

    // Griglia operatori
    const grid = document.getElementById('operators-grid');
    grid.innerHTML = '';

    // Ordina per formazioni (decrescente), poi per nome
    const sortedOps = Object.values(data.operators).sort((a, b) => {
        if (b.formations !== a.formations) return b.formations - a.formations;
        return a.name.localeCompare(b.name);
    });

    if (data.totalEvents === 0) {
        grid.innerHTML = '<div class="empty-state">'
            + '<div class="empty-icon">📅</div>'
            + '<h3>Nessuna formazione trovata</h3>'
            + '<p>Non ci sono eventi con colore assegnato per ' + MESI[currentMonth] + ' ' + currentYear + '</p>'
            + '</div>';
        grid.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    sortedOps.forEach(op => {
        grid.appendChild(createOperatorCard(op, data.totalFormations));
    });
}

function createOperatorCard(op, total) {
    const percentage = total > 0 ? ((op.formations / total) * 100).toFixed(1) : '0.0';

    const card = document.createElement('div');
    card.className = 'operator-card' + (op.formations > 0 ? ' has-data' : '');
    card.style.setProperty('--op-color', op.hex);

    let detailsHTML = '';
    if (op.events.length > 0) {
        const rows = op.events.map(e =>
            '<div class="event-row">'
            + '<span class="event-date">' + formatDate(e.start) + '</span>'
            + '<span class="event-title">' + escapeHtml(e.title) + '</span>'
            + '<span class="event-duration">' + formatDuration(e.duration) + ' → <strong>' + e.formations + '</strong></span>'
            + '</div>'
        ).join('');

        detailsHTML =
            '<button class="toggle-details" onclick="toggleDetails(this)">'
            + 'Mostra dettagli ▼'
            + '</button>'
            + '<div class="event-details">' + rows + '</div>';
    }

    card.innerHTML =
        '<div class="card-header">'
        + '<span class="color-dot" style="background:' + op.hex + '"></span>'
        + '<div class="card-title">'
        + '<h3>' + escapeHtml(op.name) + '</h3>'
        + '<span class="color-name">' + op.colorName + '</span>'
        + '</div>'
        + '</div>'
        + '<div class="card-body">'
        + '<div class="formation-count" style="color:' + op.hex + '">' + op.formations + '</div>'
        + '<div class="formation-label">formazioni</div>'
        + '</div>'
        + '<div class="card-footer">'
        + '<div class="stat"><span class="stat-value">' + formatHours(op.totalMinutes) + '</span><span class="stat-label">ore</span></div>'
        + '<div class="stat"><span class="stat-value">' + op.eventCount + '</span><span class="stat-label">eventi</span></div>'
        + '<div class="stat"><span class="stat-value">' + percentage + '%</span><span class="stat-label">del totale</span></div>'
        + '</div>'
        + '<div class="progress-bar"><div class="progress-fill" style="width:' + percentage + '%;background:' + op.hex + '"></div></div>'
        + detailsHTML;

    return card;
}

// ============================================================
// NAVIGAZIONE & INTERAZIONI
// ============================================================

function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    updateMonthDisplay();
    if (accessToken) loadEvents();
}

function goToToday() {
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();
    updateMonthDisplay();
    if (accessToken) loadEvents();
}

function changeCalendar(calId) {
    selectedCalendarId = calId;
    if (accessToken) loadEvents();
}

function toggleDetails(btn) {
    const details = btn.nextElementSibling;
    const isHidden = details.style.display === 'none' || !details.style.display;
    details.style.display = isHidden ? 'block' : 'none';
    btn.textContent = isHidden ? 'Nascondi dettagli ▲' : 'Mostra dettagli ▼';
}

function refreshData() {
    if (accessToken) loadEvents();
}

// ============================================================
// ESPORTAZIONE CSV
// ============================================================

function exportCSV() {
    if (!currentData) {
        showError('Nessun dato da esportare.');
        return;
    }

    // CSV con separatore punto e virgola (standard italiano per Excel)
    let csv = '\uFEFF'; // BOM per UTF-8
    csv += 'Operatore;Colore;Formazioni;Ore Totali;N. Eventi;% sul Totale\n';

    const sortedOps = Object.values(currentData.operators)
        .sort((a, b) => b.formations - a.formations);

    sortedOps.forEach(op => {
        const pct = currentData.totalFormations > 0
            ? ((op.formations / currentData.totalFormations) * 100).toFixed(1)
            : '0.0';
        csv += escapeCSV(op.name) + ';'
            + escapeCSV(op.colorName) + ';'
            + op.formations + ';'
            + formatHours(op.totalMinutes) + ';'
            + op.eventCount + ';'
            + pct + '%\n';
    });

    csv += '\nTOTALE;;'
        + currentData.totalFormations + ';'
        + formatHours(currentData.totalMinutes) + ';'
        + currentData.totalEvents + ';100%\n';

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formazioni_' + MESI[currentMonth] + '_' + currentYear + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ============================================================
// UTILITÀ
// ============================================================

function formatHours(minutes) {
    if (minutes === 0) return '0h';
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    if (m === 0) return h + 'h';
    if (h === 0) return m + 'm';
    return h + 'h ' + m + 'm';
}

function formatDuration(minutes) {
    if (minutes < 60) return minutes + ' min';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (m === 0) return h + 'h';
    return h + 'h ' + m + 'm';
}

function formatDate(date) {
    return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeCSV(text) {
    if (text.includes(';') || text.includes('"') || text.includes('\n')) {
        return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
    if (show) {
        document.getElementById('operators-grid').style.display = 'none';
        document.getElementById('summary-bar').style.opacity = '0.5';
    } else {
        document.getElementById('summary-bar').style.opacity = '1';
    }
}

function showError(message) {
    // Rimuovi toast esistenti
    document.querySelectorAll('.error-toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = '<span>' + escapeHtml(message) + '</span>'
        + '<button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;margin-left:1rem;">✕</button>';
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 6000);
}

// --- Navigazione da tastiera ---
document.addEventListener('keydown', function(e) {
    // Solo se non siamo in un input/select
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key === 'ArrowLeft') changeMonth(-1);
    if (e.key === 'ArrowRight') changeMonth(1);
});

// --- Inizializzazione al caricamento ---
window.addEventListener('load', function() {
    initApp();
});
