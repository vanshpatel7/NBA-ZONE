// Player Stats Finder JavaScript - Using API for 2025-26 season stats

document.addEventListener('DOMContentLoaded', function () {
    const playersTableBody = document.getElementById('playersTableBody');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const playersTitle = document.getElementById('playersTitle');

    let allPlayers = []; // Store all players for client-side filtering/sorting
    let playerIdMap = {}; // Map player names to IDs from static JSON
    let currentStat = 'pts';
    let currentLimit = 25;

    // Initial fetch
    fetchAllPlayers();

    // Filter button handlers (Limits)
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const limit = parseInt(btn.getAttribute('data-limit'));
            if (limit === currentLimit) return;

            // Update UI
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update Title
            if (limit === 25) playersTitle.innerText = 'Top 25 Players (2025-26)';
            else if (limit === 100) playersTitle.innerText = 'Top 100 Players (2025-26)';
            else playersTitle.innerText = 'All Players (2025-26)';

            currentLimit = limit;
            displayPlayers();
        });
    });

    // Column sort handlers
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const stat = th.getAttribute('data-stat');
            if (stat === currentStat) return;

            // Update UI
            document.querySelectorAll('.sortable').forEach(s => s.classList.remove('active'));
            th.classList.add('active');

            currentStat = stat;
            displayPlayers();
        });
    });

    async function fetchAllPlayers() {
        showLoading();
        try {
            // First, get player ID mappings from static JSON (for profile linking)
            try {
                const jsonResponse = await fetch('/data/player_stats.json');
                if (jsonResponse.ok) {
                    const jsonData = await jsonResponse.json();
                    // Create a name -> id map for profile links
                    (jsonData.players || []).forEach(p => {
                        if (p.name && p.id) {
                            playerIdMap[p.name.toLowerCase()] = p.id;
                        }
                    });
                }
            } catch (e) {
                console.warn('Could not load player ID mappings:', e);
            }

            // Fetch current 2025-26 stats from API
            const response = await fetch('/api/v1/player');
            if (!response.ok) throw new Error('Failed to fetch players from API');

            const apiPlayers = await response.json();

            // Transform API data to match our format
            allPlayers = apiPlayers.map(player => ({
                // Try to find ID from static JSON, use name hash as fallback
                id: findPlayerId(player.name),
                name: player.name,
                team: player.team,
                pos: player.pos,
                pts: player.pts,
                ast: player.ast,
                trb: player.trb,
                mp: player.mp,
                g: player.g,
                stl: player.stl,
                blk: player.blk
            })).filter(p => p.name && p.pts != null); // Filter out invalid entries

            displayPlayers();
        } catch (error) {
            console.error('Error fetching players:', error);
            // Fallback to static JSON if API fails
            fallbackToStaticJson();
        }
    }

    // Find player ID by matching name
    function findPlayerId(name) {
        if (!name) return null;

        const nameLower = name.toLowerCase();

        // Exact match
        if (playerIdMap[nameLower]) {
            return playerIdMap[nameLower];
        }

        // Partial match (last name)
        const lastName = nameLower.split(' ').pop();
        for (const [key, id] of Object.entries(playerIdMap)) {
            if (key.includes(lastName) && key.includes(nameLower.split(' ')[0])) {
                return id;
            }
        }

        return null;
    }

    // Fallback to static JSON if API is unavailable
    async function fallbackToStaticJson() {
        try {
            const response = await fetch('/data/player_stats.json');
            if (!response.ok) throw new Error('Failed to fetch players');

            const data = await response.json();
            allPlayers = data.players || [];
            displayPlayers();
        } catch (error) {
            console.error('Error fetching players from fallback:', error);
            showEmpty();
        }
    }

    function displayPlayers() {
        // Sort players by current stat
        const sortedPlayers = [...allPlayers].sort((a, b) => {
            const valA = a[currentStat] || 0;
            const valB = b[currentStat] || 0;
            return valB - valA; // Descending order
        });

        // Apply limit
        const limit = currentLimit > 0 ? currentLimit : sortedPlayers.length;
        const displayedPlayers = sortedPlayers.slice(0, limit);

        renderPlayers(displayedPlayers, currentStat);
    }

    function renderPlayers(players, activeStat) {
        playersTableBody.innerHTML = '';

        if (!players || players.length === 0) {
            showEmpty();
            return;
        }

        hideLoading();
        hideEmpty();

        players.forEach((player, index) => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';

            // Add click handler to navigate to player profile using name
            row.addEventListener('click', () => {
                // Use URL-safe player name, pass ID if available
                const nameParam = encodeURIComponent(player.name);
                const idParam = player.id ? `&id=${player.id}` : '';
                window.location.href = `player-profile.html?name=${nameParam}${idParam}`;
            });

            row.innerHTML = `
                <td class="rank-col">#${index + 1}</td>
                <td>
                    <div class="player-info">
                        <span class="player-name">${player.name}</span>
                    </div>
                </td>
                <td><span class="team-badge">${player.team || '-'}</span></td>
                <td>${player.pos || '-'}</td>
                <td class="${activeStat === 'pts' ? 'stat-highlight' : ''}">${player.pts?.toFixed(1) || '0.0'}</td>
                <td class="${activeStat === 'ast' ? 'stat-highlight' : ''}">${player.ast?.toFixed(1) || '0.0'}</td>
                <td class="${activeStat === 'trb' ? 'stat-highlight' : ''}">${player.trb?.toFixed(1) || '0.0'}</td>
                <td>${player.mp?.toFixed(1) || '0.0'}</td>
            `;

            playersTableBody.appendChild(row);
        });
    }

    function showLoading() {
        loadingState.style.display = 'flex';
        playersTableBody.parentElement.parentElement.style.display = 'none';
        emptyState.style.display = 'none';
    }

    function hideLoading() {
        loadingState.style.display = 'none';
        playersTableBody.parentElement.parentElement.style.display = 'block';
    }

    function showEmpty() {
        loadingState.style.display = 'none';
        playersTableBody.parentElement.parentElement.style.display = 'none';
        emptyState.style.display = 'block';
    }

    function hideEmpty() {
        emptyState.style.display = 'none';
    }
});
