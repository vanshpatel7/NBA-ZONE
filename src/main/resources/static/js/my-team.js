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

    grid.innerHTML = teams.map(team => `
        <div class="team-card" data-team-id="${team.id}" onclick="selectTeam(${team.id})">
            <div class="team-logo">${team.abbreviation}</div>
            <div class="team-name">${team.name}</div>
        </div>
    `).join('');
}

// Select team (show confirmation)
function selectTeam(teamId) {
    pendingTeam = NBA_TEAMS.find(t => t.id === teamId);
    if (!pendingTeam) return;

    document.getElementById('modalTeamLogo').textContent = pendingTeam.abbreviation;
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
    document.getElementById('myTeamLogo').textContent = team.abbreviation;
    document.getElementById('myTeamName').textContent = team.fullName;
    document.getElementById('myTeamConf').textContent = `${team.conference}ern Conference • ${team.division} Division`;

    // Show loading state
    document.getElementById('lastGamesList').innerHTML = '<p class="loading-text">Loading games...</p>';
    document.getElementById('leadersList').innerHTML = '<p class="loading-text">Loading stats...</p>';
    document.getElementById('rosterBody').innerHTML = '<tr><td colspan="5" class="loading-text">Loading roster...</td></tr>';

    // Try to fetch live data, fall back to mock if API fails
    try {
        // Fetch recent games
        const gamesResponse = await fetch(`/api/teams/${team.id}/games?limit=5`);
        if (gamesResponse.ok) {
            const gamesData = await gamesResponse.json();
            updateLastGames(gamesData.data || [], team);
        } else {
            throw new Error('Games API failed');
        }
    } catch (error) {
        console.warn('Failed to fetch live games, using mock:', error);
        const mockStats = TEAM_STATS[team.abbreviation] || DEFAULT_STATS;
        updateLastGamesFromMock(mockStats.lastGames);
    }

    try {
        // Fetch players
        const playersResponse = await fetch(`/api/teams/${team.id}/players`);
        if (playersResponse.ok) {
            const playersData = await playersResponse.json();
            updateRoster(playersData.data || []);
        } else {
            throw new Error('Players API failed');
        }
    } catch (error) {
        console.warn('Failed to fetch live players, using mock:', error);
        const mockStats = TEAM_STATS[team.abbreviation] || DEFAULT_STATS;
        updateRosterFromMock(mockStats.roster);
        updateLeadersFromMock(mockStats.leaders);
    }
}

// Update last games from API data
function updateLastGames(games, team) {
    const lastGamesList = document.getElementById('lastGamesList');

    if (!games || games.length === 0) {
        const mockStats = TEAM_STATS[team.abbreviation] || DEFAULT_STATS;
        updateLastGamesFromMock(mockStats.lastGames);
        return;
    }

    // Sort by date descending
    const sortedGames = games.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    lastGamesList.innerHTML = sortedGames.map(game => {
        const isHome = game.home_team.id === team.id;
        const myScore = isHome ? game.home_team_score : game.visitor_team_score;
        const oppScore = isHome ? game.visitor_team_score : game.home_team_score;
        const opponent = isHome ? game.visitor_team : game.home_team;
        const win = myScore > oppScore;
        const gameDate = new Date(game.date);
        const dateStr = gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return `
            <div class="game-row">
                <span class="game-date">${dateStr}</span>
                <span class="game-result ${win ? 'win' : 'loss'}">${win ? 'W' : 'L'} ${myScore}-${oppScore}</span>
                <span class="opponent">${isHome ? 'vs' : 'at'} ${opponent.abbreviation}</span>
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

