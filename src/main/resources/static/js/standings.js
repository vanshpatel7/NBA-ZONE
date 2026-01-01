// NBA-ZONE Standings Module

// All 30 NBA teams with standings data (mock data for 2024-25 season)
// Mock data removed - fetching from API


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

    // Conference tab handlers
    document.querySelectorAll('.conf-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.conf-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            showConference(tab.dataset.conf);
        });
    });

    // Load standings
    loadStandings();
});

// Load standings data
function loadStandings() {
    const loadingState = document.getElementById('loadingState');
    const standingsContent = document.getElementById('standingsContent');
    const emptyState = document.getElementById('emptyState');

    fetch('/data/standings.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load standings');
            return response.json();
        })
        .then(data => {
            if (data.east && data.west) {
                renderStandings('east', data.east);
                renderStandings('west', data.west);
                loadingState.style.display = 'none';
                standingsContent.style.display = 'block';
            } else {
                throw new Error('Invalid data format');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loadingState.style.display = 'none';
            emptyState.style.display = 'block';
        });
}

// Render standings table for a conference
function renderStandings(conference, teams) {
    const tbody = document.getElementById(`${conference}TableBody`);

    // Sort by wins (descending), then by losses (ascending)
    const sortedTeams = [...teams].sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.losses - b.losses;
    });

    // Calculate games behind leader
    const leaderWins = sortedTeams[0].wins;
    const leaderLosses = sortedTeams[0].losses;

    tbody.innerHTML = sortedTeams.map((team, index) => {
        const pct = (team.wins / (team.wins + team.losses)).toFixed(3).replace('0.', '.');
        const gb = calculateGB(leaderWins, leaderLosses, team.wins, team.losses);
        const isPlayoffSpot = index < 10; // Top 10 make play-in
        const isPlayIn = index >= 6 && index < 10;

        return `
            <tr class="${isPlayoffSpot ? 'playoff-spot' : ''} ${isPlayIn ? 'play-in' : ''}" 
                onclick="navigateToTeam(${team.id})" style="cursor: pointer;">
                <td class="rank-col">${index + 1}</td>
                <td class="team-col">
                    <span class="team-logo-small">${team.abbreviation}</span>
                    <span class="team-name">${team.fullName}</span>
                </td>
                <td>${team.wins}</td>
                <td>${team.losses}</td>
                <td>${pct}</td>
                <td>${gb}</td>
                <td>${team.last10}</td>
                <td class="${team.streak.startsWith('W') ? 'streak-win' : 'streak-loss'}">${team.streak}</td>
            </tr>
        `;
    }).join('');
}

// Calculate games behind
function calculateGB(leaderW, leaderL, teamW, teamL) {
    const gb = ((leaderW - teamW) + (teamL - leaderL)) / 2;
    return gb === 0 ? '-' : gb.toFixed(1);
}

// Show conference section
function showConference(conference) {
    const eastSection = document.getElementById('eastStandings');
    const westSection = document.getElementById('westStandings');

    if (conference === 'east') {
        eastSection.style.display = 'block';
        westSection.style.display = 'none';
    } else {
        eastSection.style.display = 'none';
        westSection.style.display = 'block';
    }
}

// Navigate to team page
function navigateToTeam(teamId) {
    window.location.href = `team-page.html?id=${teamId}`;
}
