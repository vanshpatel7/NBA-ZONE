// NBA-ZONE Team Page Module

// Team data copied from my-team.js for consistency
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

// Mock standings for record display
const STANDINGS_DATA = {
    1: { wins: 17, losses: 16, standing: '8th in East' },
    2: { wins: 23, losses: 9, standing: '2nd in East' },
    3: { wins: 13, losses: 19, standing: '11th in East' },
    4: { wins: 7, losses: 24, standing: '14th in East' },
    5: { wins: 15, losses: 18, standing: '10th in East' },
    6: { wins: 27, losses: 4, standing: '1st in East' },
    7: { wins: 16, losses: 16, standing: '9th in East' },
    8: { wins: 17, losses: 16, standing: '6th in East' },
    9: { wins: 17, losses: 14, standing: '7th in East' },
    10: { wins: 18, losses: 13, standing: '5th in East' },
    11: { wins: 22, losses: 10, standing: '3rd in East' },
    12: { wins: 20, losses: 13, standing: '4th in East' },
    13: { wins: 13, losses: 18, standing: '12th in East' },
    14: { wins: 8, losses: 24, standing: '13th in East' },
    15: { wins: 6, losses: 25, standing: '15th in East' },
    16: { wins: 19, losses: 13, standing: '6th in West' },
    17: { wins: 18, losses: 13, standing: '5th in West' },
    18: { wins: 15, losses: 16, standing: '11th in West' },
    19: { wins: 21, losses: 11, standing: '3rd in West' },
    20: { wins: 18, losses: 14, standing: '7th in West' },
    21: { wins: 18, losses: 13, standing: '4th in West' },
    22: { wins: 23, losses: 10, standing: '2nd in West' },
    23: { wins: 17, losses: 14, standing: '8th in West' },
    24: { wins: 8, losses: 25, standing: '15th in West' },
    25: { wins: 26, losses: 5, standing: '1st in West' },
    26: { wins: 15, losses: 16, standing: '12th in West' },
    27: { wins: 11, losses: 20, standing: '13th in West' },
    28: { wins: 16, losses: 17, standing: '10th in West' },
    29: { wins: 17, losses: 15, standing: '9th in West' },
    30: { wins: 8, losses: 23, standing: '14th in West' }
};

let currentTeam = null;

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

    // Set My Team button handler
    document.getElementById('setMyTeamBtn')?.addEventListener('click', setAsMyTeam);

    // Get team ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('id');

    if (teamId) {
        loadTeamData(parseInt(teamId));
    } else {
        showError();
    }
});

// Load team data
async function loadTeamData(teamId) {
    const loadingState = document.getElementById('loadingState');
    const teamContent = document.getElementById('teamContent');

    // Find team in local data
    const team = NBA_TEAMS.find(t => t.id === teamId);
    if (!team) {
        showError();
        return;
    }

    currentTeam = team;
    const standings = STANDINGS_DATA[teamId] || { wins: 0, losses: 0, standing: 'N/A' };

    // Render team header
    document.getElementById('teamLogo').textContent = team.abbreviation;
    document.getElementById('teamName').textContent = team.fullName;
    document.getElementById('teamConference').textContent = `${team.conference}ern Conference`;
    document.getElementById('teamDivision').textContent = `${team.division} Division`;
    document.getElementById('teamRecord').textContent = `${standings.wins}-${standings.losses}`;
    document.getElementById('teamStanding').textContent = standings.standing;
    document.title = `${team.fullName} | NBA-ZONE`;

    // Check if this is already the user's team
    const savedTeam = localStorage.getItem('nbazone_my_team');
    if (savedTeam) {
        const myTeam = JSON.parse(savedTeam);
        if (myTeam.id === team.id) {
            document.getElementById('setMyTeamBtn').textContent = '✓ My Team';
            document.getElementById('setMyTeamBtn').disabled = true;
        }
    }

    // Try to fetch roster from API
    try {
        const response = await fetch(`/api/teams/${teamId}/players`);
        if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                renderRoster(data.data);
            } else {
                renderMockRoster(team.abbreviation);
            }
        } else {
            renderMockRoster(team.abbreviation);
        }
    } catch (error) {
        console.warn('Could not fetch roster:', error);
        renderMockRoster(team.abbreviation);
    }

    // Try to fetch recent games
    try {
        const gamesResponse = await fetch(`/api/teams/${teamId}/games?limit=5`);
        if (gamesResponse.ok) {
            const gamesData = await gamesResponse.json();
            if (gamesData.data && gamesData.data.length > 0) {
                renderRecentGames(gamesData.data, team);
            } else {
                renderMockGames();
            }
        } else {
            renderMockGames();
        }
    } catch (error) {
        console.warn('Could not fetch games:', error);
        renderMockGames();
    }

    // Calculate mock team stats
    const ppg = 105 + Math.random() * 20;
    const oppPpg = 100 + Math.random() * 15;
    const diff = ppg - oppPpg;
    document.getElementById('statPpg').textContent = ppg.toFixed(1);
    document.getElementById('statOppPpg').textContent = oppPpg.toFixed(1);
    document.getElementById('statDiff').textContent = (diff >= 0 ? '+' : '') + diff.toFixed(1);
    document.getElementById('statDiff').className = `stat-value ${diff >= 0 ? 'positive' : 'negative'}`;

    loadingState.style.display = 'none';
    teamContent.style.display = 'block';
}

// Render roster from API
function renderRoster(players) {
    const tbody = document.getElementById('rosterTableBody');
    tbody.innerHTML = players.slice(0, 10).map(player => `
        <tr onclick="navigateToPlayer(${player.id})" style="cursor: pointer;">
            <td>${player.first_name} ${player.last_name}</td>
            <td>${player.position || 'N/A'}</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
        </tr>
    `).join('');
}

// Render mock roster
function renderMockRoster(abbreviation) {
    const mockRosters = {
        'BOS': [
            { name: 'Jayson Tatum', pos: 'SF', ppg: 26.9, rpg: 8.1, apg: 4.9 },
            { name: 'Jaylen Brown', pos: 'SG', ppg: 23.8, rpg: 5.5, apg: 3.6 },
            { name: 'Derrick White', pos: 'PG', ppg: 15.2, rpg: 4.2, apg: 5.0 },
            { name: 'Kristaps Porzingis', pos: 'C', ppg: 18.5, rpg: 7.2, apg: 1.8 },
            { name: 'Jrue Holiday', pos: 'PG', ppg: 12.1, rpg: 5.0, apg: 4.5 }
        ],
        'LAL': [
            { name: 'Anthony Davis', pos: 'PF', ppg: 25.6, rpg: 11.8, apg: 3.4 },
            { name: 'LeBron James', pos: 'SF', ppg: 17.6, rpg: 5.7, apg: 7.2 },
            { name: 'Austin Reaves', pos: 'SG', ppg: 16.4, rpg: 4.0, apg: 4.8 },
            { name: "D'Angelo Russell", pos: 'PG', ppg: 12.8, rpg: 2.6, apg: 5.2 },
            { name: 'Rui Hachimura', pos: 'PF', ppg: 10.8, rpg: 4.2, apg: 1.0 }
        ]
    };

    const roster = mockRosters[abbreviation] || [
        { name: 'Player 1', pos: 'PG', ppg: 15.0, rpg: 3.5, apg: 5.5 },
        { name: 'Player 2', pos: 'SG', ppg: 14.0, rpg: 3.0, apg: 3.0 },
        { name: 'Player 3', pos: 'SF', ppg: 12.0, rpg: 5.0, apg: 2.5 },
        { name: 'Player 4', pos: 'PF', ppg: 10.0, rpg: 7.0, apg: 1.5 },
        { name: 'Player 5', pos: 'C', ppg: 9.0, rpg: 8.0, apg: 1.0 }
    ];

    const tbody = document.getElementById('rosterTableBody');
    tbody.innerHTML = roster.map(player => `
        <tr>
            <td>${player.name}</td>
            <td>${player.pos}</td>
            <td>${player.ppg}</td>
            <td>${player.rpg}</td>
            <td>${player.apg}</td>
        </tr>
    `).join('');
}

// Render recent games from API
function renderRecentGames(games, team) {
    const gamesList = document.getElementById('recentGamesList');
    const sortedGames = games.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    gamesList.innerHTML = sortedGames.map(game => {
        const isHome = game.home_team.id === team.id;
        const myScore = isHome ? game.home_team_score : game.visitor_team_score;
        const oppScore = isHome ? game.visitor_team_score : game.home_team_score;
        const opponent = isHome ? game.visitor_team : game.home_team;
        const win = myScore > oppScore;
        const gameDate = new Date(game.date);
        const dateStr = gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return `
            <div class="game-item">
                <span class="game-date">${dateStr}</span>
                <span class="game-result ${win ? 'win' : 'loss'}">${win ? 'W' : 'L'} ${myScore}-${oppScore}</span>
                <span class="game-opp">${isHome ? 'vs' : 'at'} ${opponent.abbreviation}</span>
            </div>
        `;
    }).join('');
}

// Render mock recent games
function renderMockGames() {
    const gamesList = document.getElementById('recentGamesList');
    gamesList.innerHTML = `
        <div class="game-item">
            <span class="game-date">Dec 28</span>
            <span class="game-result win">W 115-108</span>
            <span class="game-opp">vs OPP</span>
        </div>
        <div class="game-item">
            <span class="game-date">Dec 26</span>
            <span class="game-result loss">L 102-110</span>
            <span class="game-opp">at OPP</span>
        </div>
        <div class="game-item">
            <span class="game-date">Dec 24</span>
            <span class="game-result win">W 121-114</span>
            <span class="game-opp">vs OPP</span>
        </div>
        <div class="game-item">
            <span class="game-date">Dec 22</span>
            <span class="game-result win">W 108-99</span>
            <span class="game-opp">at OPP</span>
        </div>
        <div class="game-item">
            <span class="game-date">Dec 20</span>
            <span class="game-result loss">L 95-103</span>
            <span class="game-opp">vs OPP</span>
        </div>
    `;
}

// Set as My Team
function setAsMyTeam() {
    if (!currentTeam) return;

    localStorage.setItem('nbazone_my_team', JSON.stringify(currentTeam));

    document.getElementById('setMyTeamBtn').textContent = '✓ My Team';
    document.getElementById('setMyTeamBtn').disabled = true;
}

// Navigate to player profile
function navigateToPlayer(playerId) {
    window.location.href = `player-profile.html?id=${playerId}`;
}

// Show error state
function showError() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
}
