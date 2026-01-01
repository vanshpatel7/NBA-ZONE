// Player Stats Finder JavaScript - Using static JSON from nba_api

document.addEventListener('DOMContentLoaded', function () {
    const playersTableBody = document.getElementById('playersTableBody');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const playersTitle = document.getElementById('playersTitle');

    let allPlayers = []; // Store all players for client-side filtering/sorting
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
            if (limit === 25) playersTitle.innerText = 'Top 25 Players';
            else if (limit === 100) playersTitle.innerText = 'Top 100 Players';
            else playersTitle.innerText = 'All Players';

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
            const response = await fetch('/data/player_stats.json');
            if (!response.ok) throw new Error('Failed to fetch players');

            const data = await response.json();
            allPlayers = data.players || [];
            displayPlayers();
        } catch (error) {
            console.error('Error fetching players:', error);
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

            // Add click handler to navigate to player profile
            row.addEventListener('click', () => {
                if (player.id) {
                    window.location.href = `player-profile.html?id=${player.id}`;
                }
            });

            row.innerHTML = `
                <td class="rank-col">#${index + 1}</td>
                <td>
                    <div class="player-info">
                        <span class="player-name">${player.name}</span>
                    </div>
                </td>
                <td><span class="team-badge">${player.team}</span></td>
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
