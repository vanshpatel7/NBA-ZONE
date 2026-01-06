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

// Render Usage Rates - fetches from API with fallback to local calculation
async function renderUsageRates(player) {
    const FTA_FACTOR = 0.44;

    // Bar scale caps for better visual readability
    const SCALE_CAPS = {
        usg: 40,
        ast: 50,
        reb: 30,
        tov: 30
    };

    // Tooltip definitions
    const TOOLTIPS = {
        usg: { label: 'Usage Rate', desc: '% of team possessions used by player while on floor' },
        ast: { label: 'Assist Rate', desc: '% of teammate FGs assisted by player while on floor' },
        reb: { label: 'Rebound Rate', desc: '% of available rebounds grabbed while on floor' },
        tov: { label: 'Turnover Rate', desc: '% of player possessions ending in turnover' }
    };

    let usageData = null;
    let isEstimated = true;

    // Try to fetch from API if we have a player ID
    if (player.id) {
        try {
            const response = await fetch(`/api/nba/players/${player.id}/usage-rates`);
            if (response.ok) {
                usageData = await response.json();
                isEstimated = usageData.estimated || false;
            }
        } catch (error) {
            console.warn('Failed to fetch usage rates from API, using local calculation:', error);
        }
    }

    // Fallback to local calculation if API fails
    if (!usageData || usageData.usg_pct === null) {
        const pts = player.pts || 0;
        const ast = player.ast || 0;
        const trb = player.trb || 0;
        const tov = player.tov || 0;
        const mp = player.mp || 30;
        const fga = player.fga || 0;
        const fta = player.fta || 0;
        const fg = player.fg || 0;

        // Calculate USG% locally (simplified - uses player stats only)
        let usgPct = null;
        const playerPoss = fga + FTA_FACTOR * fta + tov;
        if (playerPoss > 0 && mp > 0) {
            // Simplified USG% estimate without team totals
            usgPct = Math.min(45, Math.max(5, (playerPoss / mp) * 36 * 0.8));
        } else if (pts > 0) {
            usgPct = Math.min(45, Math.max(10, (pts / 35) * 40));
        }

        // Calculate AST% locally (simplified)
        const astPct = mp > 0 ? Math.min(50, Math.max(5, (ast / mp) * 36 * 2.5)) : null;

        // Calculate REB% locally (simplified)
        const rebPct = mp > 0 ? Math.min(30, Math.max(3, (trb / mp) * 36 * 1.2)) : null;

        // Calculate TOV% locally (this one is accurate without team stats)
        let tovPct = null;
        if (playerPoss > 0) {
            tovPct = (tov / playerPoss) * 100;
        }

        usageData = {
            usg_pct: usgPct ? parseFloat(usgPct.toFixed(1)) : null,
            ast_pct: astPct ? parseFloat(astPct.toFixed(1)) : null,
            reb_pct: rebPct ? parseFloat(rebPct.toFixed(1)) : null,
            tov_pct: tovPct ? parseFloat(tovPct.toFixed(1)) : null
        };
        isEstimated = true;
    }

    // Helper function to format value
    const formatValue = (val) => val !== null && val !== undefined ? `${val.toFixed(1)}%` : '—';

    // Helper function to calculate bar width percentage based on scale cap
    const getBarWidth = (val, cap) => {
        if (val === null || val === undefined) return 0;
        return Math.min((val / cap) * 100, 100);
    };

    // Update the UI elements
    const usgVal = usageData.usg_pct;
    const astVal = usageData.ast_pct;
    const rebVal = usageData.reb_pct;
    const tovVal = usageData.tov_pct;

    document.getElementById('usgPct').textContent = formatValue(usgVal);
    document.getElementById('astRate').textContent = formatValue(astVal);
    document.getElementById('rebRate').textContent = formatValue(rebVal);
    document.getElementById('tovRate').textContent = formatValue(tovVal);

    document.getElementById('usgBar').style.width = `${getBarWidth(usgVal, SCALE_CAPS.usg)}%`;
    document.getElementById('astRateBar').style.width = `${getBarWidth(astVal, SCALE_CAPS.ast)}%`;
    document.getElementById('rebRateBar').style.width = `${getBarWidth(rebVal, SCALE_CAPS.reb)}%`;
    document.getElementById('tovRateBar').style.width = `${getBarWidth(tovVal, SCALE_CAPS.tov)}%`;

    // Add estimated indicator if using fallback data
    const usageCard = document.querySelector('.usage-grid')?.closest('.profile-card');
    if (usageCard) {
        // Remove existing indicator if any
        const existingIndicator = usageCard.querySelector('.estimated-indicator');
        if (existingIndicator) existingIndicator.remove();

        if (isEstimated) {
            const indicator = document.createElement('div');
            indicator.className = 'estimated-indicator';
            indicator.textContent = '* Estimated (no on-court splits available)';
            indicator.title = 'Team totals estimated using full-game data';
            usageCard.appendChild(indicator);
        }
    }

    // Add tooltips to usage items
    const usageItems = document.querySelectorAll('.usage-item');
    const tooltipData = [
        TOOLTIPS.usg,
        TOOLTIPS.ast,
        TOOLTIPS.reb,
        TOOLTIPS.tov
    ];

    usageItems.forEach((item, idx) => {
        if (tooltipData[idx]) {
            item.setAttribute('data-tooltip', `${tooltipData[idx].label}: ${tooltipData[idx].desc}`);
            item.classList.add('has-tooltip');
        }
    });
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
