// NBA-ZONE Game Details Module

const API_BASE_URL = '/api';

// Get game ID from URL
function getGameIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Check authentication and initialize
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

    // Tab handlers
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});

// Load game details from API
async function loadGameDetails(gameId) {
    const loadingState = document.getElementById('loadingState');
    const gameContent = document.getElementById('gameContent');
    const errorState = document.getElementById('errorState');

    try {
        const response = await fetch(`${API_BASE_URL}/games/${gameId}`);

        if (!response.ok) {
            // If API fails, show page with default placeholder content
            console.warn('API failed, showing placeholder content');
            showPlaceholderContent();
            return;
        }

        const data = await response.json();

        // Populate page with game data
        populateGameDetails(data);

        loadingState.style.display = 'none';
        gameContent.style.display = 'block';

    } catch (error) {
        console.error('Error loading game details:', error);
        // Show page with placeholder content instead of error
        showPlaceholderContent();
    }
}

// Show page with placeholder/default content when API is unavailable
function showPlaceholderContent() {
    const loadingState = document.getElementById('loadingState');
    const gameContent = document.getElementById('gameContent');

    // The HTML already has default values, just show it
    loadingState.style.display = 'none';
    gameContent.style.display = 'block';
}

// Populate page with game data
function populateGameDetails(game) {
    // Game header
    const homeTeam = game.home_team || game.homeTeam || {};
    const awayTeam = game.visitor_team || game.visitorTeam || {};

    document.getElementById('homeTeamName').textContent = homeTeam.name || 'Home';
    document.getElementById('awayTeamName').textContent = awayTeam.name || 'Away';
    document.getElementById('homeLogo').textContent = homeTeam.abbreviation || '???';
    document.getElementById('awayLogo').textContent = awayTeam.abbreviation || '???';

    // Update tab buttons
    document.getElementById('homeTabBtn').textContent = homeTeam.name || 'Home';
    document.getElementById('awayTabBtn').textContent = awayTeam.name || 'Away';

    // Team abbreviations in cards
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

    // Game date/time
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

    // Populate mock stats data (would come from additional API calls in production)
    populateMockStats(homeTeam, awayTeam);
}

// Populate with mock statistics data
function populateMockStats(homeTeam, awayTeam) {
    // Season Leaders - Use realistic placeholder data based on team
    const leaderData = getLeaderDataForTeam(homeTeam.abbreviation, awayTeam.abbreviation);

    // Update leader values
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

// Get leader data for teams (mock data)
function getLeaderDataForTeam(homeAbbr, awayAbbr) {
    const teamLeaders = {
        'NYK': {
            ppg: '28.8', ppgPlayer: 'J. Brunson',
            rpg: '11.9', rpgPlayer: 'K. Towns',
            apg: '6.4', apgPlayer: 'J. Brunson'
        },
        'SAS': {
            ppg: '25.8', ppgPlayer: 'V. Wembanyama',
            rpg: '12.6', rpgPlayer: 'V. Wembanyama',
            apg: '6.9', apgPlayer: 'S. Castle'
        },
        'LAL': {
            ppg: '26.5', ppgPlayer: 'L. James',
            rpg: '8.2', rpgPlayer: 'A. Davis',
            apg: '8.5', apgPlayer: 'L. James'
        },
        'BOS': {
            ppg: '27.2', ppgPlayer: 'J. Tatum',
            rpg: '9.1', rpgPlayer: 'J. Tatum',
            apg: '5.8', apgPlayer: 'D. White'
        },
        'GSW': {
            ppg: '23.4', ppgPlayer: 'S. Curry',
            rpg: '6.8', rpgPlayer: 'D. Green',
            apg: '6.2', apgPlayer: 'S. Curry'
        },
        'DEFAULT': {
            ppg: '22.0', ppgPlayer: 'Team Leader',
            rpg: '8.0', rpgPlayer: 'Team Leader',
            apg: '5.5', apgPlayer: 'Team Leader'
        }
    };

    return {
        home: teamLeaders[homeAbbr] || teamLeaders['DEFAULT'],
        away: teamLeaders[awayAbbr] || teamLeaders['DEFAULT']
    };
}

// Show error state
function showError() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
}
