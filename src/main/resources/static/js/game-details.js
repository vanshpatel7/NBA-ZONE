// NBA-ZONE Game Details Module - Live Game Support

const API_BASE_URL = '/api';

// ============================
// STATE MANAGEMENT
// ============================

// Normalized live game state
let liveGameState = null;
let playerRowMap = {}; // O(1) player row access: playerId -> HTMLElement
let livePollingInterval = null;
const POLL_INTERVAL_MS = 3000;

// ============================
// INITIALIZATION
// ============================

function getGameIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize user info
    const userInfo = window.AuthModule?.TokenManager?.getUserInfo();
    if (userInfo) {
        document.getElementById('userName').textContent = userInfo.username;
    }

    // Logout handler
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        window.AuthModule?.logout();
    });

    // Load game details
    const gameId = getGameIdFromUrl();
    if (gameId) {
        loadGameDetails(gameId);
    } else {
        showError();
    }

    // Tab handlers for preview view
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Tab handlers for live view (event delegation)
    document.querySelector('.live-tabs')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('live-tab')) {
            document.querySelectorAll('.live-tab').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        }
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', stopLivePolling);
});

// ============================
// GAME LOADING
// ============================

function loadGameDetails(gameId) {
    // Skip API entirely - directly show mock post-game data
    // This guarantees the page loads without any network dependency
    console.log('Loading game details for ID:', gameId);
    showMockLiveGame(gameId);
}

function showMockLiveGame(gameId) {
    const loadingState = document.getElementById('loadingState');
    const gameContent = document.getElementById('gameContent');

    loadingState.style.display = 'none';
    gameContent.style.display = 'block';

    // For demo, show live view with mock data
    const mockData = getMockLiveGameData(gameId);
    initializeLiveView(mockData);
}

function isGameLive(status) {
    return status === 'live' || status === 'in_progress';
}

// ============================
// VIEW SWITCHING
// ============================

function showPreviewView() {
    document.getElementById('liveGameView').style.display = 'none';
    document.getElementById('previewView').style.display = 'block';
    stopLivePolling();
}

function showLiveView() {
    document.getElementById('previewView').style.display = 'none';
    document.getElementById('liveGameView').style.display = 'block';
}

// ============================
// LIVE VIEW INITIALIZATION
// ============================

function initializeLiveView(data) {
    showLiveView();

    // Normalize and store state
    liveGameState = normalizeGameData(data);

    // Render initial UI (one-time DOM creation)
    renderLiveScoreboard(liveGameState);
    renderTeamStats(liveGameState.awayTeam);

    // For post-game: show both teams' players
    renderPostGameBoxScores(liveGameState);

    // Update tabs with team names
    document.getElementById('live-away-tab').textContent = liveGameState.awayTeam.abbr;
    document.getElementById('live-home-tab').textContent = liveGameState.homeTeam.abbr;

    console.log('Post-game view initialized');
}

// ============================
// DATA NORMALIZATION
// ============================

function normalizeGameData(data) {
    return {
        gameId: data.gameId || data.id || 1,
        status: data.status || 'live',
        clock: data.clock || '2:02',
        quarter: data.quarter || '4th',
        homeTeam: normalizeTeam(data.homeTeam || data.home_team),
        awayTeam: normalizeTeam(data.awayTeam || data.visitor_team || data.away_team)
    };
}

function normalizeTeam(team) {
    const players = team.players || [];
    const playersById = {};

    players.forEach(p => {
        playersById[p.id] = p;
    });

    return {
        id: team.id || team.abbreviation,
        name: team.name || 'Team',
        abbr: team.abbreviation || team.abbr || '???',
        score: team.score || 0,
        stats: team.stats || team.teamStats || {},
        players: players,
        playersById: playersById
    };
}

// ============================
// LIVE SCOREBOARD RENDER
// ============================

function renderLiveScoreboard(state) {
    // These are direct DOM updates - no re-render
    document.getElementById('live-away-logo').textContent = state.awayTeam.abbr;
    document.getElementById('live-away-name').textContent = state.awayTeam.name;
    document.getElementById('live-home-logo').textContent = state.homeTeam.abbr;
    document.getElementById('live-home-name').textContent = state.homeTeam.name;

    updateLiveScores(state);
}

function updateLiveScores(state) {
    // Efficient: only update text content
    document.getElementById('away-score').textContent = state.awayTeam.score;
    document.getElementById('home-score').textContent = state.homeTeam.score;
    document.getElementById('game-clock').textContent = state.clock;
    document.getElementById('game-quarter').textContent = state.quarter;
}

// ============================
// TEAM STATS BAR
// ============================

function renderTeamStats(team) {
    const statsBar = document.getElementById('away-stats-bar');
    const stats = team.stats;

    // Update data attributes for efficient updates
    statsBar.querySelector('[data-team="away"]').textContent = team.abbr;
    statsBar.querySelector('[data-stat="fg"]').textContent = stats.fg || '0/0';
    statsBar.querySelector('[data-stat="fgPct"]').textContent = `${stats.fgPct || 0}%`;
    statsBar.querySelector('[data-stat="fg3"]').textContent = stats.fg3 || '0/0';
    statsBar.querySelector('[data-stat="fg3Pct"]').textContent = `${stats.fg3Pct || 0}%`;
    statsBar.querySelector('[data-stat="ft"]').textContent = stats.ft || '0/0';
    statsBar.querySelector('[data-stat="ftPct"]').textContent = `${stats.ftPct || 0}%`;
    statsBar.querySelector('[data-stat="reb"]').textContent = stats.reb || 0;
    statsBar.querySelector('[data-stat="ast"]').textContent = stats.ast || 0;
}

// ============================
// PLAYER BOX SCORES
// ============================

function renderPlayerBoxScores(players) {
    const onCourtContainer = document.getElementById('on-court-players');
    const benchContainer = document.getElementById('bench-players');
    const boxScoresContainer = document.getElementById('box-scores');

    // Clear and reset row map
    onCourtContainer.innerHTML = '';
    benchContainer.innerHTML = '';
    playerRowMap = {};

    // Separate on-court vs bench players
    const onCourt = players.filter(p => p.onCourt);
    const bench = players.filter(p => !p.onCourt);

    // Add header row to on-court section
    onCourtContainer.innerHTML = createStatsHeaderRow();

    onCourt.forEach(player => {
        const row = createPlayerRow(player);
        onCourtContainer.appendChild(row);
        playerRowMap[player.id] = row;
    });

    bench.forEach(player => {
        const row = createPlayerRow(player);
        benchContainer.appendChild(row);
        playerRowMap[player.id] = row;
    });

    console.log(`Rendered ${onCourt.length} on-court players, ${bench.length} bench players`);
}

// Render post-game box scores with both teams
function renderPostGameBoxScores(state) {
    const onCourtContainer = document.getElementById('on-court-players');
    const benchContainer = document.getElementById('bench-players');

    // Get the section labels and update them
    const sections = document.querySelectorAll('.box-section-label');
    if (sections.length >= 2) {
        sections[0].textContent = `${state.awayTeam.abbr} - ${state.awayTeam.name}`;
        sections[1].textContent = `${state.homeTeam.abbr} - ${state.homeTeam.name}`;
    }

    // Clear containers
    onCourtContainer.innerHTML = '';
    benchContainer.innerHTML = '';
    playerRowMap = {};

    // Add header row and away team players
    onCourtContainer.innerHTML = createPostGameHeaderRow();

    // Filter players who actually played (min > 0) and sort by points
    const awayPlayers = state.awayTeam.players
        .filter(p => p.min > 0)
        .sort((a, b) => b.pts - a.pts);

    awayPlayers.forEach(player => {
        const row = createPostGamePlayerRow(player);
        onCourtContainer.appendChild(row);
        playerRowMap[player.id] = row;
    });

    // Add header row for home team
    benchContainer.innerHTML = createPostGameHeaderRow();

    // Home team players
    const homePlayers = state.homeTeam.players
        .filter(p => p.min > 0)
        .sort((a, b) => b.pts - a.pts);

    homePlayers.forEach(player => {
        const row = createPostGamePlayerRow(player);
        benchContainer.appendChild(row);
        playerRowMap[player.id] = row;
    });

    console.log(`Post-game: ${awayPlayers.length} away players, ${homePlayers.length} home players`);
}

function createPostGameHeaderRow() {
    return `
        <div class="stats-header-row">
            <span></span>
            <span>Player</span>
            <span>MIN</span>
            <span>PTS</span>
            <span>REB</span>
            <span>AST</span>
            <span>+/-</span>
        </div>
    `;
}

function createPostGamePlayerRow(player) {
    const row = document.createElement('div');
    row.className = 'player-row';
    row.dataset.playerId = player.id;

    const initials = getPlayerInitials(player.name);
    const plusMinusClass = player.plusMinus >= 0 ? '' : 'negative';
    const plusMinusValue = player.plusMinus >= 0 ? `+${player.plusMinus}` : player.plusMinus;

    row.innerHTML = `
        <div class="player-headshot">
            <img src="https://cdn.nba.com/headshots/nba/latest/260x190/${player.nbaId || 0}.png" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                 alt="${player.name}">
            <span class="player-headshot-initials" style="display:none;">${initials}</span>
        </div>
        <div class="player-info">
            <span class="player-name-row">${player.name}</span>
            <div class="player-meta">
                <span class="player-position">${player.position || '-'}</span>
            </div>
        </div>
        <span class="player-stat">${player.min}</span>
        <span class="player-stat" style="font-weight: 800;">${player.pts}</span>
        <span class="player-stat">${player.reb}</span>
        <span class="player-stat">${player.ast}</span>
        <span class="player-stat plus-minus ${plusMinusClass}">${plusMinusValue}</span>
    `;

    return row;
}

function createStatsHeaderRow() {
    return `
        <div class="stats-header-row">
            <span></span>
            <span>Player</span>
            <span>MIN</span>
            <span>PTS</span>
            <span>REB</span>
            <span>AST</span>
            <span>STL</span>
            <span>BLK</span>
            <span>+/-</span>
        </div>
    `;
}

function createPlayerRow(player) {
    const row = document.createElement('div');
    row.className = 'player-row';
    row.dataset.playerId = player.id;

    const initials = getPlayerInitials(player.name);
    const plusMinusClass = player.plusMinus >= 0 ? '' : 'negative';
    const plusMinusValue = player.plusMinus >= 0 ? `+${player.plusMinus}` : player.plusMinus;

    row.innerHTML = `
        <div class="player-headshot">
            <img src="https://cdn.nba.com/headshots/nba/latest/260x190/${player.nbaId || 0}.png" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                 alt="${player.name}">
            <span class="player-headshot-initials" style="display:none;">${initials}</span>
        </div>
        <div class="player-info">
            <span class="player-name-row">${player.name}</span>
            <div class="player-meta">
                <span class="player-position">${player.position || '-'}</span>
            </div>
        </div>
        <span class="player-stat" data-stat="min">${player.min || 0}</span>
        <span class="player-stat" data-stat="pts">${player.pts || 0}</span>
        <span class="player-stat" data-stat="reb">${player.reb || 0}</span>
        <span class="player-stat" data-stat="ast">${player.ast || 0}</span>
        <span class="player-stat" data-stat="stl">${player.stl || 0}</span>
        <span class="player-stat" data-stat="blk">${player.blk || 0}</span>
        <span class="player-stat plus-minus ${plusMinusClass}" data-stat="plusMinus">${plusMinusValue}</span>
    `;

    return row;
}

function getPlayerInitials(name) {
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
    }
    return name.substring(0, 2).toUpperCase();
}

// ============================
// EFFICIENT LIVE UPDATES
// ============================

function updatePlayerStats(playerId, newStats) {
    const row = playerRowMap[playerId];
    if (!row) return;

    // O(1) direct stat updates - no DOM searching
    if (newStats.min !== undefined) {
        row.querySelector('[data-stat="min"]').textContent = newStats.min;
    }
    if (newStats.pts !== undefined) {
        row.querySelector('[data-stat="pts"]').textContent = newStats.pts;
    }
    if (newStats.reb !== undefined) {
        row.querySelector('[data-stat="reb"]').textContent = newStats.reb;
    }
    if (newStats.ast !== undefined) {
        row.querySelector('[data-stat="ast"]').textContent = newStats.ast;
    }
    if (newStats.stl !== undefined) {
        row.querySelector('[data-stat="stl"]').textContent = newStats.stl;
    }
    if (newStats.blk !== undefined) {
        row.querySelector('[data-stat="blk"]').textContent = newStats.blk;
    }
    if (newStats.plusMinus !== undefined) {
        const pmEl = row.querySelector('[data-stat="plusMinus"]');
        pmEl.textContent = newStats.plusMinus >= 0 ? `+${newStats.plusMinus}` : newStats.plusMinus;
        pmEl.classList.toggle('negative', newStats.plusMinus < 0);
    }
}

// ============================
// LIVE POLLING
// ============================

function startLivePolling() {
    if (livePollingInterval) return;

    livePollingInterval = setInterval(() => {
        refreshLiveGame();
    }, POLL_INTERVAL_MS);

    console.log('Live polling started');
}

function stopLivePolling() {
    if (livePollingInterval) {
        clearInterval(livePollingInterval);
        livePollingInterval = null;
        console.log('Live polling stopped');
    }
}

async function refreshLiveGame() {
    if (!liveGameState) return;

    try {
        // In production: fetch updated data from API
        // const response = await fetch(`${API_BASE_URL}/games/${liveGameState.gameId}/live`);
        // const newData = await response.json();

        // For demo: simulate live updates
        simulateLiveUpdate();

    } catch (error) {
        console.error('Error refreshing live game:', error);
    }
}

function simulateLiveUpdate() {
    // Simulate score changes
    if (Math.random() > 0.7) {
        const team = Math.random() > 0.5 ? 'homeTeam' : 'awayTeam';
        liveGameState[team].score += Math.random() > 0.5 ? 2 : 3;
        updateLiveScores(liveGameState);
    }

    // Simulate clock ticking
    const clockParts = liveGameState.clock.split(':');
    let mins = parseInt(clockParts[0]);
    let secs = parseInt(clockParts[1]) - 3;

    if (secs < 0) {
        secs = 57;
        mins = Math.max(0, mins - 1);
    }

    liveGameState.clock = `${mins}:${secs.toString().padStart(2, '0')}`;
    document.getElementById('game-clock').textContent = liveGameState.clock;

    // Simulate player stat updates
    const players = liveGameState.awayTeam.players;
    if (players.length > 0 && Math.random() > 0.5) {
        const randomPlayer = players[Math.floor(Math.random() * players.length)];
        randomPlayer.pts += Math.random() > 0.6 ? 2 : 0;
        randomPlayer.reb += Math.random() > 0.8 ? 1 : 0;
        randomPlayer.ast += Math.random() > 0.85 ? 1 : 0;

        updatePlayerStats(randomPlayer.id, randomPlayer);
    }
}

// ============================
// MOCK LIVE GAME DATA
// ============================

function getMockLiveGameData(gameId) {
    return {
        gameId: gameId,
        status: 'final',  // Game has ended
        clock: '0:00',
        quarter: 'Final',
        homeTeam: {
            id: 'TOR',
            name: 'Raptors',
            abbreviation: 'TOR',
            score: 109,
            stats: {
                fg: '38/89', fgPct: 42.7,
                fg3: '12/35', fg3Pct: 34.3,
                ft: '21/25', ftPct: 84.0,
                reb: 48, ast: 29
            },
            players: [
                { id: 'tor1', name: 'S. Barnes', position: 'F', nbaId: 1630567, min: 38, pts: 28, reb: 9, ast: 6, stl: 1, blk: 0, plusMinus: 12 },
                { id: 'tor2', name: 'I. Quickley', position: 'G', nbaId: 1630193, min: 35, pts: 22, reb: 4, ast: 8, stl: 2, blk: 0, plusMinus: 8 },
                { id: 'tor3', name: 'R. Barrett', position: 'F', nbaId: 1629628, min: 34, pts: 18, reb: 5, ast: 3, stl: 0, blk: 1, plusMinus: 6 },
                { id: 'tor4', name: 'J. Poeltl', position: 'C', nbaId: 1627751, min: 28, pts: 14, reb: 12, ast: 2, stl: 0, blk: 3, plusMinus: 10 },
                { id: 'tor5', name: 'G. Dick', position: 'G', nbaId: 1641709, min: 26, pts: 12, reb: 3, ast: 2, stl: 1, blk: 0, plusMinus: 4 },
                { id: 'tor6', name: 'O. Agbaji', position: 'G', nbaId: 1631209, min: 18, pts: 8, reb: 2, ast: 1, stl: 0, blk: 0, plusMinus: -2 },
                { id: 'tor7', name: 'K. Olynyk', position: 'C', nbaId: 203482, min: 15, pts: 5, reb: 6, ast: 3, stl: 0, blk: 0, plusMinus: 3 },
                { id: 'tor8', name: 'J. Mogbo', position: 'F', nbaId: 0, min: 6, pts: 2, reb: 4, ast: 0, stl: 0, blk: 1, plusMinus: 1 }
            ]
        },
        awayTeam: {
            id: 'ATL',
            name: 'Hawks',
            abbreviation: 'ATL',
            score: 95,
            stats: {
                fg: '34/84', fgPct: 40.5,
                fg3: '11/31', fg3Pct: 35.5,
                ft: '16/19', ftPct: 84.2,
                reb: 45, ast: 27
            },
            players: [
                { id: 'atl1', name: 'T. Young', position: 'G', nbaId: 1629027, min: 36, pts: 24, reb: 3, ast: 11, stl: 1, blk: 0, plusMinus: -8 },
                { id: 'atl2', name: 'D. Murray', position: 'G', nbaId: 1627749, min: 34, pts: 18, reb: 5, ast: 6, stl: 2, blk: 0, plusMinus: -10 },
                { id: 'atl3', name: 'J. Johnson', position: 'F', nbaId: 1629660, min: 35, pts: 16, reb: 8, ast: 4, stl: 1, blk: 1, plusMinus: -6 },
                { id: 'atl4', name: 'C. Capela', position: 'C', nbaId: 203991, min: 28, pts: 12, reb: 14, ast: 1, stl: 0, blk: 3, plusMinus: -4 },
                { id: 'atl5', name: 'D. Hunter', position: 'F', nbaId: 1629631, min: 30, pts: 11, reb: 4, ast: 1, stl: 0, blk: 0, plusMinus: -8 },
                { id: 'atl6', name: 'O. Okongwu', position: 'C', nbaId: 1630168, min: 20, pts: 8, reb: 6, ast: 1, stl: 1, blk: 2, plusMinus: 2 },
                { id: 'atl7', name: 'B. Bogdanovic', position: 'G', nbaId: 203992, min: 18, pts: 4, reb: 2, ast: 2, stl: 0, blk: 0, plusMinus: -5 },
                { id: 'atl8', name: 'K. Bufkin', position: 'G', nbaId: 0, min: 12, pts: 2, reb: 1, ast: 1, stl: 0, blk: 0, plusMinus: -3 }
            ]
        }
    };
}

// ============================
// PREVIEW VIEW (EXISTING CODE)
// ============================

function populateGameDetails(game) {
    const homeTeam = game.home_team || game.homeTeam || {};
    const awayTeam = game.visitor_team || game.visitorTeam || {};

    document.getElementById('homeTeamName').textContent = homeTeam.name || 'Home';
    document.getElementById('awayTeamName').textContent = awayTeam.name || 'Away';
    document.getElementById('homeLogo').textContent = homeTeam.abbreviation || '???';
    document.getElementById('awayLogo').textContent = awayTeam.abbreviation || '???';

    document.getElementById('homeTabBtn').textContent = homeTeam.name || 'Home';
    document.getElementById('awayTabBtn').textContent = awayTeam.name || 'Away';

    const homeAbbr = homeTeam.abbreviation || 'HOME';
    const awayAbbr = awayTeam.abbreviation || 'AWAY';

    document.getElementById('leaderHomeAbbr').textContent = homeAbbr;
    document.getElementById('leaderAwayAbbr').textContent = awayAbbr;
    document.getElementById('statsHomeAbbr').textContent = homeAbbr;
    document.getElementById('statsAwayAbbr').textContent = awayAbbr;
    document.getElementById('injuryHomeAbbr').textContent = homeAbbr;
    document.getElementById('injuryAwayAbbr').textContent = awayAbbr;
    document.getElementById('last5HomeAbbr').textContent = homeAbbr;
    document.getElementById('last5AwayAbbr').textContent = awayAbbr;

    if (game.datetime) {
        const gameDate = new Date(game.datetime);
        const today = new Date();
        const isToday = gameDate.toDateString() === today.toDateString();

        const timeStr = gameDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        const dateStr = isToday ? 'Today' : gameDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        document.getElementById('gameDateTime').textContent = `${dateStr} ${timeStr}`;
        document.getElementById('gameDate').textContent = gameDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }

    populateMockStats(homeTeam, awayTeam);
}

function populateMockStats(homeTeam, awayTeam) {
    const leaderData = getLeaderDataForTeam(homeTeam.abbreviation, awayTeam.abbreviation);

    document.getElementById('homePPGValue').textContent = leaderData.home.ppg;
    document.getElementById('homePPGPlayer').textContent = leaderData.home.ppgPlayer;
    document.getElementById('awayPPGValue').textContent = leaderData.away.ppg;
    document.getElementById('awayPPGPlayer').textContent = leaderData.away.ppgPlayer;

    document.getElementById('homeRPGValue').textContent = leaderData.home.rpg;
    document.getElementById('homeRPGPlayer').textContent = leaderData.home.rpgPlayer;
    document.getElementById('awayRPGValue').textContent = leaderData.away.rpg;
    document.getElementById('awayRPGPlayer').textContent = leaderData.away.rpgPlayer;

    document.getElementById('homeAPGValue').textContent = leaderData.home.apg;
    document.getElementById('homeAPGPlayer').textContent = leaderData.home.apgPlayer;
    document.getElementById('awayAPGValue').textContent = leaderData.away.apg;
    document.getElementById('awayAPGPlayer').textContent = leaderData.away.apgPlayer;
}

function getLeaderDataForTeam(homeAbbr, awayAbbr) {
    const teamLeaders = {
        'NYK': { ppg: '28.8', ppgPlayer: 'J. Brunson', rpg: '11.9', rpgPlayer: 'K. Towns', apg: '6.4', apgPlayer: 'J. Brunson' },
        'SAS': { ppg: '25.8', ppgPlayer: 'V. Wembanyama', rpg: '12.6', rpgPlayer: 'V. Wembanyama', apg: '6.9', apgPlayer: 'S. Castle' },
        'LAL': { ppg: '26.5', ppgPlayer: 'L. James', rpg: '8.2', rpgPlayer: 'A. Davis', apg: '8.5', apgPlayer: 'L. James' },
        'BOS': { ppg: '27.2', ppgPlayer: 'J. Tatum', rpg: '9.1', rpgPlayer: 'J. Tatum', apg: '5.8', apgPlayer: 'D. White' },
        'ATL': { ppg: '24.1', ppgPlayer: 'T. Young', rpg: '8.9', rpgPlayer: 'C. Capela', apg: '10.2', apgPlayer: 'T. Young' },
        'TOR': { ppg: '22.4', ppgPlayer: 'S. Barnes', rpg: '7.8', rpgPlayer: 'S. Barnes', apg: '5.1', apgPlayer: 'I. Quickley' },
        'DEFAULT': { ppg: '22.0', ppgPlayer: 'Team Leader', rpg: '8.0', rpgPlayer: 'Team Leader', apg: '5.5', apgPlayer: 'Team Leader' }
    };

    return {
        home: teamLeaders[homeAbbr] || teamLeaders['DEFAULT'],
        away: teamLeaders[awayAbbr] || teamLeaders['DEFAULT']
    };
}

function showError() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
}
