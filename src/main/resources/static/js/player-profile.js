// NBA-ZONE Player Profile Module

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

    // Get player ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('id');

    if (playerId) {
        loadPlayerData(playerId);
    } else {
        showError();
    }
});

// Load player data
async function loadPlayerData(playerId) {
    const loadingState = document.getElementById('loadingState');
    const playerContent = document.getElementById('playerContent');
    const errorState = document.getElementById('errorState');

    try {
        // Fetch player info
        const playerResponse = await fetch(`/api/players/${playerId}`);
        if (!playerResponse.ok) throw new Error('Player not found');

        const playerData = await playerResponse.json();

        // Fetch season averages
        let seasonData = null;
        try {
            const seasonResponse = await fetch(`/api/teams/players/${playerId}/stats?season=2024`);
            if (seasonResponse.ok) {
                const seasonResult = await seasonResponse.json();
                seasonData = seasonResult.data?.[0] || null;
            }
        } catch (e) {
            console.warn('Could not fetch season averages:', e);
        }

        // Render player data
        renderPlayer(playerData, seasonData);

        loadingState.style.display = 'none';
        playerContent.style.display = 'block';

    } catch (error) {
        console.error('Failed to load player:', error);
        loadingState.style.display = 'none';

        // Try loading from local player data
        loadPlayerFromLocalData(playerId);
    }
}

// Load player from local database (player_stats table)
async function loadPlayerFromLocalData(playerId) {
    const loadingState = document.getElementById('loadingState');
    const playerContent = document.getElementById('playerContent');
    const errorState = document.getElementById('errorState');

    try {
        // Try fetching from local player stats
        const response = await fetch(`/api/player-stats`);
        if (!response.ok) throw new Error('Could not fetch players');

        const players = await response.json();
        const player = players.find(p => p.id == playerId);

        if (player) {
            renderLocalPlayer(player);
            loadingState.style.display = 'none';
            playerContent.style.display = 'block';
        } else {
            showError();
        }
    } catch (error) {
        console.error('Failed to load from local data:', error);
        showError();
    }
}

// Render player from API data
function renderPlayer(player, seasonData) {
    // Update basic info
    document.getElementById('playerName').textContent = `${player.first_name} ${player.last_name}`;
    document.getElementById('playerInitials').textContent = `${player.first_name[0]}${player.last_name[0]}`;
    document.getElementById('playerTeam').textContent = player.team?.full_name || 'Unknown Team';
    document.getElementById('playerPosition').textContent = player.position || 'N/A';
    document.getElementById('playerNumber').textContent = player.jersey_number ? `#${player.jersey_number}` : '';

    // Bio info
    document.getElementById('playerHeight').textContent = player.height || 'N/A';
    document.getElementById('playerWeight').textContent = player.weight ? `${player.weight} lbs` : 'N/A';
    document.getElementById('playerCountry').textContent = player.country || 'N/A';

    // Update page title
    document.title = `${player.first_name} ${player.last_name} | NBA-ZONE`;

    // Update season averages if available
    if (seasonData) {
        document.getElementById('avgPts').textContent = seasonData.pts?.toFixed(1) || '-';
        document.getElementById('avgReb').textContent = seasonData.reb?.toFixed(1) || '-';
        document.getElementById('avgAst').textContent = seasonData.ast?.toFixed(1) || '-';
        document.getElementById('avgStl').textContent = seasonData.stl?.toFixed(1) || '-';
        document.getElementById('avgBlk').textContent = seasonData.blk?.toFixed(1) || '-';
        document.getElementById('fgPct').textContent = seasonData.fg_pct ? `${(seasonData.fg_pct * 100).toFixed(1)}%` : '-';
        document.getElementById('fg3Pct').textContent = seasonData.fg3_pct ? `${(seasonData.fg3_pct * 100).toFixed(1)}%` : '-';
        document.getElementById('ftPct').textContent = seasonData.ft_pct ? `${(seasonData.ft_pct * 100).toFixed(1)}%` : '-';
        document.getElementById('avgMpg').textContent = seasonData.min || '-';
    } else {
        // Show placeholders
        ['avgPts', 'avgReb', 'avgAst', 'avgStl', 'avgBlk', 'fgPct', 'fg3Pct', 'ftPct', 'avgMpg'].forEach(id => {
            document.getElementById(id).textContent = '-';
        });
    }

    // Show message for recent games
    document.getElementById('recentGamesBody').innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; color: rgba(255,255,255,0.6);">
                Game log requires premium API access
            </td>
        </tr>
    `;
}

// Render player from local database
function renderLocalPlayer(player) {
    // Format name
    const fullName = player.player || 'Unknown Player';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const initials = `${firstName[0] || ''}${lastName[0] || ''}`;

    document.getElementById('playerName').textContent = fullName;
    document.getElementById('playerInitials').textContent = initials;
    document.getElementById('playerTeam').textContent = player.tm || 'Unknown Team';
    document.getElementById('playerPosition').textContent = player.pos || 'N/A';
    document.getElementById('playerNumber').textContent = '';

    document.getElementById('playerHeight').textContent = 'N/A';
    document.getElementById('playerWeight').textContent = 'N/A';
    document.getElementById('playerCountry').textContent = 'N/A';

    document.title = `${fullName} | NBA-ZONE`;

    // Update stats from local data
    document.getElementById('avgPts').textContent = player.pts?.toFixed(1) || '-';
    document.getElementById('avgReb').textContent = player.trb?.toFixed(1) || '-';
    document.getElementById('avgAst').textContent = player.ast?.toFixed(1) || '-';
    document.getElementById('avgStl').textContent = player.stl?.toFixed(1) || '-';
    document.getElementById('avgBlk').textContent = player.blk?.toFixed(1) || '-';
    document.getElementById('fgPct').textContent = player.fgPercent ? `${(player.fgPercent * 100).toFixed(1)}%` : '-';
    document.getElementById('fg3Pct').textContent = player.threePPercent ? `${(player.threePPercent * 100).toFixed(1)}%` : '-';
    document.getElementById('ftPct').textContent = player.ftPercent ? `${(player.ftPercent * 100).toFixed(1)}%` : '-';
    document.getElementById('avgMpg').textContent = player.mp?.toFixed(1) || '-';

    // No game log for local data
    document.getElementById('recentGamesBody').innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; color: rgba(255,255,255,0.6);">
                Game log not available
            </td>
        </tr>
    `;
}

// Show error state
function showError() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
}
