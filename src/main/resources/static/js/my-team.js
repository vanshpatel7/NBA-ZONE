// NBA-ZONE My Team Module

// All 30 NBA teams data
const NBA_TEAMS = [
    // Eastern Conference
    { id: 1, name: 'Hawks', fullName: 'Atlanta Hawks', abbreviation: 'ATL', conference: 'East', division: 'Southeast' },
    { id: 2, name: 'Celtics', fullName: 'Boston Celtics', abbreviation: 'BOS', conference: 'East', division: 'Atlantic' },
    { id: 3, name: 'Nets', fullName: 'Brooklyn Nets', abbreviation: 'BKN', conference: 'East', division: 'Atlantic' },
    { id: 4, name: 'Hornets', fullName: 'Charlotte Hornets', abbreviation: 'CHA', conference: 'East', division: 'Southeast' },
    { id: 5, name: 'Bulls', fullName: 'Chicago Bulls', abbreviation: 'CHI', conference: 'East', division: 'Central' },
    { id: 6, name: 'Cavaliers', fullName: 'Cleveland Cavaliers', abbreviation: 'CLE', conference: 'East', division: 'Central' },
    { id: 7, name: 'Pistons', fullName: 'Detroit Pistons', abbreviation: 'DET', conference: 'East', division: 'Central' },
    { id: 8, name: 'Pacers', fullName: 'Indiana Pacers', abbreviation: 'IND', conference: 'East', division: 'Central' },
    { id: 9, name: 'Heat', fullName: 'Miami Heat', abbreviation: 'MIA', conference: 'East', division: 'Southeast' },
    { id: 10, name: 'Bucks', fullName: 'Milwaukee Bucks', abbreviation: 'MIL', conference: 'East', division: 'Central' },
    { id: 11, name: 'Knicks', fullName: 'New York Knicks', abbreviation: 'NYK', conference: 'East', division: 'Atlantic' },
    { id: 12, name: 'Magic', fullName: 'Orlando Magic', abbreviation: 'ORL', conference: 'East', division: 'Southeast' },
    { id: 13, name: '76ers', fullName: 'Philadelphia 76ers', abbreviation: 'PHI', conference: 'East', division: 'Atlantic' },
    { id: 14, name: 'Raptors', fullName: 'Toronto Raptors', abbreviation: 'TOR', conference: 'East', division: 'Atlantic' },
    { id: 15, name: 'Wizards', fullName: 'Washington Wizards', abbreviation: 'WAS', conference: 'East', division: 'Southeast' },
    // Western Conference
    { id: 16, name: 'Mavericks', fullName: 'Dallas Mavericks', abbreviation: 'DAL', conference: 'West', division: 'Southwest' },
    { id: 17, name: 'Nuggets', fullName: 'Denver Nuggets', abbreviation: 'DEN', conference: 'West', division: 'Northwest' },
    { id: 18, name: 'Warriors', fullName: 'Golden State Warriors', abbreviation: 'GSW', conference: 'West', division: 'Pacific' },
    { id: 19, name: 'Rockets', fullName: 'Houston Rockets', abbreviation: 'HOU', conference: 'West', division: 'Southwest' },
    { id: 20, name: 'Clippers', fullName: 'LA Clippers', abbreviation: 'LAC', conference: 'West', division: 'Pacific' },
    { id: 21, name: 'Lakers', fullName: 'Los Angeles Lakers', abbreviation: 'LAL', conference: 'West', division: 'Pacific' },
    { id: 22, name: 'Grizzlies', fullName: 'Memphis Grizzlies', abbreviation: 'MEM', conference: 'West', division: 'Southwest' },
    { id: 23, name: 'Timberwolves', fullName: 'Minnesota Timberwolves', abbreviation: 'MIN', conference: 'West', division: 'Northwest' },
    { id: 24, name: 'Pelicans', fullName: 'New Orleans Pelicans', abbreviation: 'NOP', conference: 'West', division: 'Southwest' },
    { id: 25, name: 'Thunder', fullName: 'Oklahoma City Thunder', abbreviation: 'OKC', conference: 'West', division: 'Northwest' },
    { id: 26, name: 'Suns', fullName: 'Phoenix Suns', abbreviation: 'PHX', conference: 'West', division: 'Pacific' },
    { id: 27, name: 'Trail Blazers', fullName: 'Portland Trail Blazers', abbreviation: 'POR', conference: 'West', division: 'Northwest' },
    { id: 28, name: 'Kings', fullName: 'Sacramento Kings', abbreviation: 'SAC', conference: 'West', division: 'Pacific' },
    { id: 29, name: 'Spurs', fullName: 'San Antonio Spurs', abbreviation: 'SAS', conference: 'West', division: 'Southwest' },
    { id: 30, name: 'Jazz', fullName: 'Utah Jazz', abbreviation: 'UTA', conference: 'West', division: 'Northwest' }
];

// NBA Team ID mapping for logo URLs
const NBA_TEAM_IDS = {
    'ATL': 1610612737, 'BOS': 1610612738, 'BKN': 1610612751, 'CHA': 1610612766,
    'CHI': 1610612741, 'CLE': 1610612739, 'DAL': 1610612742, 'DEN': 1610612743,
    'DET': 1610612765, 'GSW': 1610612744, 'HOU': 1610612745, 'IND': 1610612754,
    'LAC': 1610612746, 'LAL': 1610612747, 'MEM': 1610612763, 'MIA': 1610612748,
    'MIL': 1610612749, 'MIN': 1610612750, 'NOP': 1610612740, 'NYK': 1610612752,
    'OKC': 1610612760, 'ORL': 1610612753, 'PHI': 1610612755, 'PHX': 1610612756,
    'POR': 1610612757, 'SAC': 1610612758, 'SAS': 1610612759, 'TOR': 1610612761,
    'UTA': 1610612762, 'WAS': 1610612764
};

function getTeamLogoUrl(abbreviation) {
    const teamId = NBA_TEAM_IDS[abbreviation];
    if (teamId) {
        return `https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`;
    }
    return '';
}

// Team stats mock data - Updated with more accurate current stats
const TEAM_STATS = {
    'LAL': {
        leaders: [
            { category: 'Points', name: 'A. Davis', value: '25.6 PPG' },
            { category: 'Rebounds', name: 'A. Davis', value: '11.8 RPG' },
            { category: 'Assists', name: 'L. James', value: '7.2 APG' },
            { category: 'Steals', name: 'A. Reaves', value: '1.3 SPG' }
        ],
        roster: [
            { name: 'Anthony Davis', pos: 'PF', ppg: 25.6, rpg: 11.8, apg: 3.4 },
            { name: 'LeBron James', pos: 'SF', ppg: 17.6, rpg: 5.7, apg: 7.2 },
            { name: 'Austin Reaves', pos: 'SG', ppg: 16.4, rpg: 4.0, apg: 4.8 },
            { name: "D'Angelo Russell", pos: 'PG', ppg: 12.8, rpg: 2.6, apg: 5.2 },
            { name: 'Rui Hachimura', pos: 'PF', ppg: 10.8, rpg: 4.2, apg: 1.0 }
        ],
        lastGames: [
            { date: 'Dec 14', result: 'W 114-106', opponent: 'vs PHX', win: true },
            { date: 'Dec 12', result: 'L 101-108', opponent: 'at MIN', win: false },
            { date: 'Dec 10', result: 'L 104-116', opponent: 'vs MEM', win: false },
            { date: 'Dec 8', result: 'W 124-118', opponent: 'vs POR', win: true },
            { date: 'Dec 6', result: 'W 116-110', opponent: 'at SAC', win: true }
        ]
    },
    'NYK': {
        leaders: [
            { category: 'Points', name: 'J. Brunson', value: '28.8 PPG' },
            { category: 'Rebounds', name: 'K. Towns', value: '11.9 RPG' },
            { category: 'Assists', name: 'J. Brunson', value: '6.4 APG' },
            { category: 'Steals', name: 'M. Bridges', value: '1.2 SPG' }
        ],
        roster: [
            { name: 'Jalen Brunson', pos: 'PG', ppg: 28.8, rpg: 3.2, apg: 6.4 },
            { name: 'Karl-Anthony Towns', pos: 'C', ppg: 24.5, rpg: 11.9, apg: 3.1 },
            { name: 'Mikal Bridges', pos: 'SF', ppg: 17.2, rpg: 4.1, apg: 2.8 },
            { name: 'OG Anunoby', pos: 'SF', ppg: 15.8, rpg: 4.5, apg: 1.9 },
            { name: 'Josh Hart', pos: 'SG', ppg: 11.2, rpg: 8.1, apg: 4.2 }
        ],
        lastGames: [
            { date: 'Dec 13', result: 'W 132-120', opponent: 'at ORL', win: true },
            { date: 'Dec 9', result: 'W 117-101', opponent: 'at TOR', win: true },
            { date: 'Dec 7', result: 'W 100-106', opponent: 'vs ORL', win: true },
            { date: 'Dec 5', result: 'W 112-146', opponent: 'vs UTA', win: true },
            { date: 'Dec 3', result: 'W 104-119', opponent: 'vs CHA', win: true }
        ]
    },
    'SAS': {
        leaders: [
            { category: 'Points', name: 'V. Wembanyama', value: '25.8 PPG' },
            { category: 'Rebounds', name: 'V. Wembanyama', value: '12.6 RPG' },
            { category: 'Assists', name: 'S. Castle', value: '6.9 APG' },
            { category: 'Blocks', name: 'V. Wembanyama', value: '4.0 BPG' }
        ],
        roster: [
            { name: 'Victor Wembanyama', pos: 'C', ppg: 25.8, rpg: 12.6, apg: 3.8 },
            { name: 'Stephon Castle', pos: 'PG', ppg: 12.5, rpg: 4.2, apg: 6.9 },
            { name: 'Harrison Barnes', pos: 'SF', ppg: 11.2, rpg: 4.1, apg: 1.8 },
            { name: 'Keldon Johnson', pos: 'SG', ppg: 10.8, rpg: 3.5, apg: 2.1 },
            { name: 'Devin Vassell', pos: 'SG', ppg: 15.2, rpg: 3.8, apg: 3.2 }
        ],
        lastGames: [
            { date: 'Dec 13', result: 'W 111-109', opponent: 'at OKC', win: true },
            { date: 'Dec 10', result: 'W 132-119', opponent: 'at LAL', win: true },
            { date: 'Dec 8', result: 'W 135-132', opponent: 'at NOP', win: true },
            { date: 'Dec 5', result: 'L 117-130', opponent: 'at CLE', win: false },
            { date: 'Dec 3', result: 'W 114-112', opponent: 'at ORL', win: true }
        ]
    }
};

// Default stats for teams without specific data
const DEFAULT_STATS = {
    leaders: [
        { category: 'Points', name: 'Team Leader', value: '22.0 PPG' },
        { category: 'Rebounds', name: 'Team Leader', value: '8.0 RPG' },
        { category: 'Assists', name: 'Team Leader', value: '5.5 APG' },
        { category: 'Steals', name: 'Team Leader', value: '1.2 SPG' }
    ],
    roster: [
        { name: 'Player 1', pos: 'PG', ppg: 18.5, rpg: 4.2, apg: 6.5 },
        { name: 'Player 2', pos: 'SG', ppg: 16.2, rpg: 3.8, apg: 3.2 },
        { name: 'Player 3', pos: 'SF', ppg: 14.8, rpg: 5.5, apg: 2.1 },
        { name: 'Player 4', pos: 'PF', ppg: 12.5, rpg: 7.2, apg: 1.8 },
        { name: 'Player 5', pos: 'C', ppg: 10.2, rpg: 8.5, apg: 1.2 }
    ],
    lastGames: [
        { date: 'Dec 14', result: 'W 105-98', opponent: 'vs OPP', win: true },
        { date: 'Dec 12', result: 'L 95-102', opponent: 'at OPP', win: false },
        { date: 'Dec 10', result: 'W 110-105', opponent: 'vs OPP', win: true },
        { date: 'Dec 8', result: 'W 108-100', opponent: 'at OPP', win: true },
        { date: 'Dec 6', result: 'L 98-108', opponent: 'vs OPP', win: false }
    ]
};

let selectedTeam = null;
let pendingTeam = null;

// Initialize page
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

    // Load saved team from localStorage
    const savedTeam = localStorage.getItem('nbazone_my_team');
    if (savedTeam) {
        selectedTeam = JSON.parse(savedTeam);
        showTeamDashboard(selectedTeam);
    } else {
        renderTeamsGrid('all');
    }

    // Conference tab handlers
    document.querySelectorAll('.conf-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.conf-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderTeamsGrid(tab.dataset.conf);
        });
    });

    // Modal handlers
    document.getElementById('cancelBtn')?.addEventListener('click', hideModal);
    document.getElementById('confirmBtn')?.addEventListener('click', confirmTeamSelection);
    document.getElementById('changeTeamBtn')?.addEventListener('click', showTeamSelection);

    // Close modal on overlay click
    document.getElementById('confirmModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('confirmModal')) {
            hideModal();
        }
    });
});

// Render teams grid
function renderTeamsGrid(conference = 'all') {
    const grid = document.getElementById('teamsGrid');
    let teams = NBA_TEAMS;

    if (conference === 'east') {
        teams = NBA_TEAMS.filter(t => t.conference === 'East');
    } else if (conference === 'west') {
        teams = NBA_TEAMS.filter(t => t.conference === 'West');
    }

    grid.innerHTML = teams.map(team => {
        const logoUrl = getTeamLogoUrl(team.abbreviation);
        return `
            <div class="team-card" data-team-id="${team.id}" onclick="selectTeam(${team.id})">
                <div class="team-logo">
                    <img src="${logoUrl}" alt="${team.abbreviation}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <span class="logo-fallback" style="display:none;">${team.abbreviation}</span>
                </div>
                <div class="team-name">${team.name}</div>
            </div>
        `;
    }).join('');
}

// Select team (show confirmation)
function selectTeam(teamId) {
    pendingTeam = NBA_TEAMS.find(t => t.id === teamId);
    if (!pendingTeam) return;

    const logoUrl = getTeamLogoUrl(pendingTeam.abbreviation);
    document.getElementById('modalTeamLogo').innerHTML = `
        <img src="${logoUrl}" alt="${pendingTeam.abbreviation}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <span class="logo-fallback" style="display:none;">${pendingTeam.abbreviation}</span>
    `;
    document.getElementById('modalTeamName').textContent = pendingTeam.fullName;
    document.getElementById('confirmModal').style.display = 'flex';
}

// Confirm team selection
function confirmTeamSelection() {
    if (!pendingTeam) return;

    selectedTeam = pendingTeam;
    localStorage.setItem('nbazone_my_team', JSON.stringify(selectedTeam));

    hideModal();
    showTeamDashboard(selectedTeam);
}

// Hide modal
function hideModal() {
    document.getElementById('confirmModal').style.display = 'none';
    pendingTeam = null;
}

// Show team selection view
function showTeamSelection() {
    document.getElementById('teamDashboard').style.display = 'none';
    document.getElementById('teamSelection').style.display = 'block';
    renderTeamsGrid('all');
}

// Show team dashboard
async function showTeamDashboard(team) {
    document.getElementById('teamSelection').style.display = 'none';
    document.getElementById('teamDashboard').style.display = 'block';

    // Update header
    const logoUrl = getTeamLogoUrl(team.abbreviation);
    document.getElementById('myTeamLogo').innerHTML = `
        <img src="${logoUrl}" alt="${team.abbreviation}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <span class="logo-fallback" style="display:none;">${team.abbreviation}</span>
    `;
    document.getElementById('myTeamName').textContent = team.fullName;
    document.getElementById('myTeamConf').textContent = `${team.conference}ern Conference • ${team.division} Division`;

    // Show loading state
    document.getElementById('lastGamesList').innerHTML = '<p class="loading-text">Loading games...</p>';
    document.getElementById('leadersList').innerHTML = '<p class="loading-text">Loading stats...</p>';
    document.getElementById('rosterBody').innerHTML = '<tr><td colspan="5" class="loading-text">Loading roster...</td></tr>';

    // Use the NBA official team ID for API calls
    const nbaTeamId = NBA_TEAM_IDS[team.abbreviation];

    // Fetch LIVE last 5 games directly from Python service (real-time data)
    try {
        const gamesResponse = await fetch(`http://localhost:5001/teams/${nbaTeamId}/games?limit=5`);
        if (gamesResponse.ok) {
            const gamesData = await gamesResponse.json();
            if (gamesData.data && gamesData.data.length > 0) {
                updateLastGamesFromAPI(gamesData.data);
            } else {
                throw new Error('No games data returned');
            }
        } else {
            throw new Error('Games API failed');
        }
    } catch (error) {
        console.warn('Failed to fetch live games, using fallback:', error);
        const mockStats = TEAM_STATS[team.abbreviation] || DEFAULT_STATS;
        updateLastGamesFromMock(mockStats.lastGames);
    }

    // Fetch LIVE leaders and roster from Python service
    try {
        const leadersResponse = await fetch(`http://localhost:5001/teams/${nbaTeamId}/leaders`);
        if (leadersResponse.ok) {
            const leadersData = await leadersResponse.json();

            // Update leaders from live data
            if (leadersData.leaders && leadersData.leaders.length > 0) {
                updateLeadersFromAPI(leadersData.leaders);
            } else {
                throw new Error('No leaders data');
            }

            // Update roster from live data
            if (leadersData.roster && leadersData.roster.length > 0) {
                updateRosterFromAPI(leadersData.roster);
            } else {
                throw new Error('No roster data');
            }
        } else {
            throw new Error('Leaders API failed');
        }
    } catch (error) {
        console.warn('Failed to fetch live leaders, using fallback:', error);
        // Fall back to static JSON file
        try {
            const response = await fetch('/data/team_stats.json');
            if (response.ok) {
                const allTeamStats = await response.json();
                const teamData = allTeamStats[team.abbreviation];
                if (teamData) {
                    updateLeadersFromMock(teamData.leaders || []);
                    updateRosterFromMock(teamData.roster || []);
                } else {
                    throw new Error('Team not in static data');
                }
            }
        } catch (fallbackError) {
            const mockStats = TEAM_STATS[team.abbreviation] || DEFAULT_STATS;
            updateLeadersFromMock(mockStats.leaders);
            updateRosterFromMock(mockStats.roster);
        }
    }
}
// Team abbreviation to full name mapping for display
const TEAM_ABBREV_TO_NAME = {
    'ATL': 'Hawks', 'BOS': 'Celtics', 'BKN': 'Nets', 'CHA': 'Hornets',
    'CHI': 'Bulls', 'CLE': 'Cavaliers', 'DAL': 'Mavericks', 'DEN': 'Nuggets',
    'DET': 'Pistons', 'GSW': 'Warriors', 'HOU': 'Rockets', 'IND': 'Pacers',
    'LAC': 'Clippers', 'LAL': 'Lakers', 'MEM': 'Grizzlies', 'MIA': 'Heat',
    'MIL': 'Bucks', 'MIN': 'Timberwolves', 'NOP': 'Pelicans', 'NYK': 'Knicks',
    'OKC': 'Thunder', 'ORL': 'Magic', 'PHI': '76ers', 'PHX': 'Suns',
    'POR': 'Trail Blazers', 'SAC': 'Kings', 'SAS': 'Spurs', 'TOR': 'Raptors',
    'UTA': 'Jazz', 'WAS': 'Wizards'
};

// Update last games from LIVE API data
function updateLastGamesFromAPI(games) {
    const lastGamesList = document.getElementById('lastGamesList');
    lastGamesList.innerHTML = games.map(game => {
        // Format the date nicely
        const dateStr = game.formatted_date || game.date;

        // Get opponent full name
        const opponentName = TEAM_ABBREV_TO_NAME[game.opponent] || game.opponent;

        // Format: "W-Suns: 105-108" or "L-Warriors: 94-131"
        const resultPrefix = game.win ? 'W' : 'L';
        const displayResult = `${resultPrefix}-${opponentName}: ${game.team_score}-${game.opponent_score}`;

        return `
            <div class="game-row">
                <span class="game-date">${dateStr}</span>
                <span class="game-result ${game.win ? 'win' : 'loss'}">${displayResult}</span>
            </div>
        `;
    }).join('');
}

// Update last games from static JSON data
function updateLastGamesFromStatic(lastGames) {
    const lastGamesList = document.getElementById('lastGamesList');
    lastGamesList.innerHTML = lastGames.map(game => {
        // Format the date nicely
        let dateStr = game.date;
        try {
            const dateObj = new Date(game.date);
            dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch (e) {
            // Use the date as-is if parsing fails
        }

        return `
            <div class="game-row">
                <span class="game-date">${dateStr}</span>
                <span class="game-result ${game.win ? 'win' : 'loss'}">${game.result}</span>
                <span class="opponent">${game.opponent}</span>
            </div>
        `;
    }).join('');
}

// Update last games from API data
function updateLastGames(games, team) {
    const lastGamesList = document.getElementById('lastGamesList');

    if (!games || games.length === 0) {
        const mockStats = TEAM_STATS[team.abbreviation] || DEFAULT_STATS;
        updateLastGamesFromMock(mockStats.lastGames);
        return;
    }

    // The new API returns games already sorted and with pre-formatted fields
    lastGamesList.innerHTML = games.map(game => {
        // Use the pre-formatted fields from the new Python API
        const dateStr = game.formatted_date || game.date;
        const displayResult = game.display_result || `${game.result} ${game.team_score}-${game.opponent_score}`;
        const displayOpponent = game.display_opponent || `${game.is_home ? 'vs' : 'at'} ${game.opponent}`;
        const isWin = game.win;

        return `
            <div class="game-row">
                <span class="game-date">${dateStr}</span>
                <span class="game-result ${isWin ? 'win' : 'loss'}">${displayResult}</span>
                <span class="opponent">${displayOpponent}</span>
            </div>
        `;
    }).join('');
}

// Update last games from mock data
function updateLastGamesFromMock(lastGames) {
    const lastGamesList = document.getElementById('lastGamesList');
    lastGamesList.innerHTML = lastGames.map(game => `
        <div class="game-row">
            <span class="game-date">${game.date}</span>
            <span class="game-result ${game.win ? 'win' : 'loss'}">${game.result}</span>
            <span class="opponent">${game.opponent}</span>
        </div>
    `).join('');
}

// Update roster from API data
function updateRoster(players) {
    const rosterBody = document.getElementById('rosterBody');
    const leadersList = document.getElementById('leadersList');

    if (!players || players.length === 0) {
        rosterBody.innerHTML = '<tr><td colspan="5">No player data available</td></tr>';
        leadersList.innerHTML = '<p>No stats available</p>';
        return;
    }

    // Display players (API gives basic info, not full stats without season_averages call)
    rosterBody.innerHTML = players.slice(0, 10).map(player => `
        <tr>
            <td>${player.first_name} ${player.last_name}</td>
            <td>${player.position || 'N/A'}</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
        </tr>
    `).join('');

    // Update leaders with first few players as placeholder
    leadersList.innerHTML = `
        <div class="leader-item">
            <span class="leader-category">Roster</span>
            <span class="leader-name">${players.length} players</span>
            <span class="leader-value">Active</span>
        </div>
        <p class="api-note">Stats require premium API access</p>
    `;
}

// Update roster from mock data
function updateRosterFromMock(roster) {
    const rosterBody = document.getElementById('rosterBody');
    rosterBody.innerHTML = roster.map(player => `
        <tr>
            <td>${player.name}</td>
            <td>${player.pos}</td>
            <td>${player.ppg}</td>
            <td>${player.rpg}</td>
            <td>${player.apg}</td>
        </tr>
    `).join('');
}

// Update leaders from mock data
function updateLeadersFromMock(leaders) {
    const leadersList = document.getElementById('leadersList');
    leadersList.innerHTML = leaders.map(leader => `
        <div class="leader-item">
            <span class="leader-category">${leader.category}</span>
            <span class="leader-name">${leader.name}</span>
            <span class="leader-value">${leader.value}</span>
        </div>
    `).join('');
}

// Update leaders from LIVE API data
function updateLeadersFromAPI(leaders) {
    const leadersList = document.getElementById('leadersList');
    leadersList.innerHTML = leaders.map(leader => `
        <div class="leader-item">
            <span class="leader-category">${leader.category}</span>
            <span class="leader-name">${leader.name}</span>
            <span class="leader-value">${leader.value}</span>
        </div>
    `).join('');
}

// Update roster from LIVE API data
function updateRosterFromAPI(roster) {
    const rosterBody = document.getElementById('rosterBody');
    rosterBody.innerHTML = roster.map(player => `
        <tr>
            <td>${player.name}</td>
            <td>-</td>
            <td>${player.ppg}</td>
            <td>${player.rpg}</td>
            <td>${player.apg}</td>
        </tr>
    `).join('');
}
