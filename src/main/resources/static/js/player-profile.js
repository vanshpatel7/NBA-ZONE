// NBA-ZONE Player Profile Module - Using API for accurate stats

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

    // Get player name and optional ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const playerName = urlParams.get('name');
    const playerId = urlParams.get('id');

    if (playerName || playerId) {
        loadPlayerData(playerName, playerId);
    } else {
        showError();
    }
});

// Load player data - fetch from API by name
async function loadPlayerData(playerName, playerId) {
    const loadingState = document.getElementById('loadingState');
    const playerContent = document.getElementById('playerContent');

    try {
        // Fetch all players from API
        const apiResponse = await fetch('/api/v1/player');
        if (!apiResponse.ok) throw new Error('Failed to fetch player data from API');

        const apiPlayers = await apiResponse.json();

        // Find the player by name (primary) or from static JSON if we have an ID
        let player = null;

        if (playerName) {
            // Search by name in API data
            const searchName = decodeURIComponent(playerName).toLowerCase();
            player = apiPlayers.find(p => {
                const apiName = (p.name || '').toLowerCase();
                return apiName === searchName;
            });

            // If exact match fails, try partial match
            if (!player) {
                const nameParts = searchName.split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts[nameParts.length - 1];

                player = apiPlayers.find(p => {
                    const apiName = (p.name || '').toLowerCase();
                    return apiName.includes(lastName) && apiName.includes(firstName);
                });
            }
        }

        // If still not found and we have an ID, try static JSON
        if (!player && playerId) {
            try {
                const jsonResponse = await fetch('/data/player_stats.json');
                if (jsonResponse.ok) {
                    const jsonData = await jsonResponse.json();
                    const jsonPlayer = jsonData.players.find(p => p.id == playerId);
                    if (jsonPlayer) {
                        // Try to find in API by this name
                        const searchName = jsonPlayer.name.toLowerCase();
                        player = apiPlayers.find(p => {
                            const apiName = (p.name || '').toLowerCase();
                            return apiName.includes(searchName.split(' ').pop());
                        });

                        // If found in API, merge data; otherwise use static JSON
                        if (player) {
                            player = { ...player, id: jsonPlayer.id };
                        } else {
                            player = jsonPlayer;
                        }
                    }
                }
            } catch (e) {
                console.warn('Could not fetch from static JSON:', e);
            }
        }

        if (!player) {
            showError();
            return;
        }

        // Normalize player data
        const normalizedPlayer = normalizePlayerData(player, playerId);
        await enrichPlayerHeadshot(normalizedPlayer);

        renderPlayer(normalizedPlayer, true);
        loadingState.style.display = 'none';
        playerContent.style.display = 'block';

    } catch (error) {
        console.error('Failed to load player:', error);
        showError();
    }
}

// Normalize player data from API format
function normalizePlayerData(player, fallbackId) {
    return {
        id: player.id || fallbackId,
        name: player.name,
        team: player.team,
        pos: player.pos,
        headshotUrl: player.headshotUrl || player.headshot_url,
        pts: player.pts,
        ast: player.ast,
        trb: player.trb,
        stl: player.stl,
        blk: player.blk,
        tov: player.tov,
        g: player.g,
        gs: player.gs,
        mp: player.mp,
        age: player.age,
        fgPct: player.fgPct != null ? player.fgPct * 100 : null,
        fg3Pct: player.threePPct != null ? player.threePPct * 100 : null,
        ftPct: player.ftPct != null ? player.ftPct * 100 : null,
        efgPct: player.efgPct != null ? player.efgPct * 100 : null,
        fg: player.fg,
        fga: player.fga,
        ft: player.ft,
        fta: player.fta
    };
}

async function enrichPlayerHeadshot(player) {
    if (player.headshotUrl || player.id || !player.name) {
        return;
    }

    try {
        const response = await fetch(`/api/players/lookup?name=${encodeURIComponent(player.name)}`);
        if (!response.ok) {
            return;
        }
        const data = await response.json();
        player.headshotUrl = data.headshotUrl || data.headshot_url || player.headshotUrl;
        player.id = data.nbaPlayerId || data.nba_player_id || player.id;
    } catch (error) {
        console.warn('Failed to lookup player headshot:', error);
    }
}

// Render player data to the page
function renderPlayer(player, isFromApi) {
    // Parse name for initials
    const nameParts = player.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const initials = `${firstName[0] || ''}${lastName[0] || ''}`;

    // Update page title
    document.title = `${player.name} | NBA-ZONE`;

    // Load player headshot from NBA CDN (if we have an ID)
    loadPlayerHeadshot(player.id, initials, player.headshotUrl);
    renderNickname(player.name);

    // Player Header
    document.getElementById('playerName').textContent = player.name;
    document.getElementById('playerInitials').textContent = initials;
    document.getElementById('playerTeam').textContent = player.team || 'N/A';
    document.getElementById('playerPosition').textContent = player.pos || 'N/A';
    document.getElementById('playerNumber').textContent = '';
    document.getElementById('playerGames').textContent = player.g ? Math.round(player.g) : '-';
    document.getElementById('playerMPG').textContent = player.mp?.toFixed(1) || '-';

    // Age and Games Started
    document.getElementById('playerAge').textContent = player.age ? Math.round(player.age) : '-';
    document.getElementById('playerGS').textContent = player.gs ? Math.round(player.gs) : '-';

    // Season Averages
    document.getElementById('avgPts').textContent = player.pts?.toFixed(1) || '-';
    document.getElementById('avgReb').textContent = player.trb?.toFixed(1) || '-';
    document.getElementById('avgAst').textContent = player.ast?.toFixed(1) || '-';
    document.getElementById('avgStl').textContent = player.stl?.toFixed(1) || '-';
    document.getElementById('avgBlk').textContent = player.blk?.toFixed(1) || '-';
    document.getElementById('avgTov').textContent = player.tov?.toFixed(1) || '-';

    // Shooting Stats
    document.getElementById('fgPct').textContent = player.fgPct ? `${player.fgPct.toFixed(1)}%` : '-';
    document.getElementById('fg3Pct').textContent = player.fg3Pct ? `${player.fg3Pct.toFixed(1)}%` : '-';
    document.getElementById('ftPct').textContent = player.ftPct ? `${player.ftPct.toFixed(1)}%` : '-';
    document.getElementById('efgPct').textContent = player.efgPct ? `${player.efgPct.toFixed(1)}%` : '-';

    // Calculate TS%
    if (player.pts && player.fga && player.fta) {
        const tsPct = (player.pts / (2 * (player.fga + 0.44 * player.fta))) * 100;
        document.getElementById('tsPct').textContent = `${tsPct.toFixed(1)}%`;
    } else {
        document.getElementById('tsPct').textContent = '-';
    }

    // Last 5 Games
    loadLast5Games(player);

    // Usage Rates
    renderUsageRates(player);

    // Update season label
    const seasonLabel = document.querySelector('.season-label');
    if (seasonLabel) {
        seasonLabel.textContent = '2025-26';
    }
}

function renderNickname(playerName) {
    let nicknameEl = document.getElementById('playerNickname');
    if (!nicknameEl) {
        const headerCard = document.querySelector('.player-header-card');
        const backButton = headerCard?.querySelector('.btn-back');
        if (headerCard && backButton) {
            nicknameEl = document.createElement('div');
            nicknameEl.id = 'playerNickname';
            nicknameEl.className = 'player-nickname';
            headerCard.insertBefore(nicknameEl, backButton);
        }
    }
    if (!nicknameEl || !playerName) {
        return;
    }

    const nickname = getPlayerNickname(playerName);
    if (!nickname) {
        nicknameEl.style.display = 'none';
        return;
    }

    nicknameEl.textContent = `"${nickname}"`;
    nicknameEl.style.display = 'block';
}

function getPlayerNickname(playerName) {
    const normalize = (value) => value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');

    const nicknameMap = {
        'shai gilgeous alexander': 'Free-throw Merchant',
        'luka doncic': 'The Don',
        'lebron james': 'King James',
        'stephen curry': 'Chef Curry',
        'kevin durant': 'Slim Reaper',
        'giannis antetokounmpo': 'Greek Freak',
        'jayson tatum': 'The Franchise',
        'joel embiid': 'The Process',
        'nikola jokic': 'The Joker',
        'jimmy butler': 'Playoff Jimmy',
        'anthony edwards': 'Ant-Man'
    };

    const normalizedName = normalize(playerName);
    if (nicknameMap[normalizedName]) {
        return nicknameMap[normalizedName];
    }
    if (normalizedName.includes('shai') && normalizedName.includes('gilgeous')) {
        return 'Free-throw Merchant';
    }
    return '';
}

// Render Last 5 Games with mock data
async function loadLast5Games(player) {
    const tbody = document.getElementById('last5GamesBody');
    if (!tbody) {
        return;
    }

    if (!player.id) {
        renderLast5GamesMock(player);
        return;
    }

    try {
        const response = await fetch(`/api/players/${player.id}/last5`);
        if (!response.ok) {
            renderLast5GamesMock(player);
            return;
        }
        const games = await response.json();
        if (!Array.isArray(games) || games.length === 0) {
            renderLast5GamesMock(player);
            return;
        }
        renderLast5GamesFromApi(games);
    } catch (error) {
        console.warn('Failed to load last 5 games:', error);
        renderLast5GamesMock(player);
    }
}

function renderLast5GamesFromApi(games) {
    const tbody = document.getElementById('last5GamesBody');
    if (!tbody) {
        return;
    }

    tbody.innerHTML = games.map(game => {
        const gameDate = game.gameDate ? new Date(game.gameDate) : null;
        const dateStr = gameDate ? gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-';
        const opponent = game.opponentAbbr || '-';
        const teamScore = game.teamScore != null ? Math.round(game.teamScore) : null;
        const oppScore = game.opponentScore != null ? Math.round(game.opponentScore) : null;
        let result = '-';
        if (teamScore != null && oppScore != null) {
            result = `${teamScore > oppScore ? 'W' : 'L'} ${teamScore}-${oppScore}`;
        } else if (game.resultWl) {
            result = game.resultWl.toUpperCase();
        }

        const min = game.min != null ? Math.round(game.min) : '-';
        const pts = game.pts != null ? Math.round(game.pts) : '-';
        const reb = game.reb != null ? Math.round(game.reb) : '-';
        const ast = game.ast != null ? Math.round(game.ast) : '-';
        const fgPct = game.fgPct != null ? `${(game.fgPct * 100).toFixed(1)}%` : '-';

        return `
            <tr>
                <td>${dateStr}</td>
                <td>${opponent}</td>
                <td class="${result.startsWith('W') ? 'result-win' : 'result-loss'}">${result}</td>
                <td>${min}</td>
                <td>${pts}</td>
                <td>${reb}</td>
                <td>${ast}</td>
                <td>${fgPct}</td>
            </tr>
        `;
    }).join('');
}

function renderLast5GamesMock(player) {
    const tbody = document.getElementById('last5GamesBody');
    const mockGames = generateMockGames(player);

    tbody.innerHTML = mockGames.map(game => `
        <tr>
            <td>${game.date}</td>
            <td>${game.opponent}</td>
            <td class="${game.result.startsWith('W') ? 'result-win' : 'result-loss'}">${game.result}</td>
            <td>${game.min}</td>
            <td>${game.pts}</td>
            <td>${game.reb}</td>
            <td>${game.ast}</td>
            <td>${game.fgPct}%</td>
        </tr>
    `).join('');
}

// Generate mock game data
function generateMockGames(player) {
    const opponents = ['LAL', 'GSW', 'MIA', 'PHX', 'BKN', 'CHI', 'DEN', 'MEM'];
    const basePts = player.pts || 20;
    const baseReb = player.trb || 5;
    const baseAst = player.ast || 4;
    const baseMp = player.mp || 32;

    const games = [];
    const today = new Date();

    for (let i = 0; i < 5; i++) {
        const gameDate = new Date(today);
        gameDate.setDate(today.getDate() - (i * 2 + 1));

        const ptsVar = Math.floor(Math.random() * 16) - 8;
        const rebVar = Math.floor(Math.random() * 6) - 3;
        const astVar = Math.floor(Math.random() * 4) - 2;
        const minVar = Math.floor(Math.random() * 10) - 5;

        const isWin = Math.random() > 0.4;
        const teamScore = 100 + Math.floor(Math.random() * 25);
        const oppScore = isWin ? teamScore - Math.floor(Math.random() * 15) - 1 : teamScore + Math.floor(Math.random() * 15) + 1;

        games.push({
            date: formatDate(gameDate),
            opponent: opponents[Math.floor(Math.random() * opponents.length)],
            result: isWin ? `W ${teamScore}-${oppScore}` : `L ${teamScore}-${oppScore}`,
            min: Math.max(20, Math.round(baseMp + minVar)),
            pts: Math.max(0, Math.round(basePts + ptsVar)),
            reb: Math.max(0, Math.round(baseReb + rebVar)),
            ast: Math.max(0, Math.round(baseAst + astVar)),
            fgPct: (40 + Math.random() * 20).toFixed(1)
        });
    }

    return games;
}

function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

// Render Usage Rates
function renderUsageRates(player) {
    const pts = player.pts || 0;
    const ast = player.ast || 0;
    const trb = player.trb || 0;
    const tov = player.tov || 0;
    const mp = player.mp || 30;

    let usgPct;
    if (player.fga && player.fta) {
        usgPct = Math.min(45, ((player.fga + 0.44 * player.fta + tov) / mp * 5)).toFixed(1);
    } else {
        usgPct = Math.min(45, Math.max(10, (pts / 35) * 40)).toFixed(1);
    }

    const astRate = Math.min(50, Math.max(5, (ast / mp) * 36 * 2.5)).toFixed(1);
    const rebRate = Math.min(30, Math.max(3, (trb / mp) * 36 * 1.2)).toFixed(1);
    const tovRate = tov > 0 ? Math.min(25, Math.max(5, (tov / (player.fga || 10 + 0.44 * (player.fta || 0) + tov)) * 100)).toFixed(1) : '-';

    document.getElementById('usgPct').textContent = `${usgPct}%`;
    document.getElementById('astRate').textContent = `${astRate}%`;
    document.getElementById('rebRate').textContent = `${rebRate}%`;
    document.getElementById('tovRate').textContent = tovRate !== '-' ? `${tovRate}%` : '-';

    document.getElementById('usgBar').style.width = `${(parseFloat(usgPct) / 45) * 100}%`;
    document.getElementById('astRateBar').style.width = `${(parseFloat(astRate) / 50) * 100}%`;
    document.getElementById('rebRateBar').style.width = `${(parseFloat(rebRate) / 30) * 100}%`;
    document.getElementById('tovRateBar').style.width = tovRate !== '-' ? `${(parseFloat(tovRate) / 25) * 100}%` : '0%';
}

// Show error state
function showError() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
}

// Load player headshot from NBA CDN
function loadPlayerHeadshot(playerId, initials, headshotUrlOverride) {
    const headshotImg = document.getElementById('playerHeadshotImg');
    const fallback = document.getElementById('playerHeadshotFallback');

    if ((!playerId && !headshotUrlOverride) || !headshotImg) {
        if (fallback) fallback.style.display = 'flex';
        return;
    }

    const headshotUrl = headshotUrlOverride || `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`;

    headshotImg.onerror = () => {
        headshotImg.style.display = 'none';
        if (fallback) fallback.style.display = 'flex';
    };

    headshotImg.onload = () => {
        headshotImg.style.display = 'block';
        if (fallback) fallback.style.display = 'none';
    };

    headshotImg.src = headshotUrl;
}
