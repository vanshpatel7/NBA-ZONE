// NBA-ZONE Dashboard Module

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!window.AuthModule.TokenManager.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    initializeDashboard();
});

// Initialize Dashboard
function initializeDashboard() {
    // Set user name
    const userInfo = window.AuthModule.TokenManager.getUserInfo();
    if (userInfo) {
        document.getElementById('userName').textContent = userInfo.username;
    }

    // Logout handler
    document.getElementById('logoutBtn').addEventListener('click', () => {
        window.AuthModule.logout();
    });

    // Date filter handlers
    const dateButtons = document.querySelectorAll('.date-btn');
    dateButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            dateButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            loadGames(filter);
        });
    });

    // Initialize Player of the Week
    initializePlayerOfTheWeek();

    // Load initial games
    loadGames('today');
}

// Player of the Week Data
function getPlayerOfTheWeek() {
    // Mock data - in production this would come from an API
    return {
        name: 'Jalen Brunson',
        firstName: 'Jalen',
        lastName: 'Brunson',
        team: 'New York Knicks',
        teamAbbr: 'NYK',
        playerId: 1628973, // NBA API player ID for headshot
        weeklyStats: {
            ppg: 32.4,
            rpg: 4.8,
            apg: 8.2
        },
        period: 'Dec 30 - Jan 5, 2026'
    };
}

// Initialize Player of the Week popup
function initializePlayerOfTheWeek() {
    const potw = getPlayerOfTheWeek();

    // Update player info
    document.getElementById('potwName').textContent = potw.name;
    document.getElementById('potwTeam').textContent = potw.team;
    document.getElementById('potwInitials').textContent =
        `${potw.firstName.charAt(0)}${potw.lastName.charAt(0)}`;

    // Update weekly stats
    document.getElementById('potwPpg').textContent = potw.weeklyStats.ppg.toFixed(1);
    document.getElementById('potwRpg').textContent = potw.weeklyStats.rpg.toFixed(1);
    document.getElementById('potwApg').textContent = potw.weeklyStats.apg.toFixed(1);

    // Update period
    document.getElementById('potwPeriod').textContent = potw.period;

    // Try to load player headshot from NBA CDN
    const headshotUrl = `https://cdn.nba.com/headshots/nba/latest/260x190/${potw.playerId}.png`;
    const img = document.getElementById('potwImg');
    const initials = document.getElementById('potwInitials');

    img.onload = function () {
        img.style.display = 'block';
        initials.style.display = 'none';
    };

    img.onerror = function () {
        img.style.display = 'none';
        initials.style.display = 'flex';
    };

    img.src = headshotUrl;
}

// Mock NBA Games Data (replace with actual API call later)
function getMockGames() {
    const today = new Date();

    return [
        {
            id: 1,
            homeTeam: {
                name: 'Lakers',
                abbreviation: 'LAL',
                logo: 'LAL',
                score: 102,
                record: '18-14'
            },
            awayTeam: {
                name: 'Warriors',
                abbreviation: 'GSW',
                logo: 'GSW',
                score: 98,
                record: '17-16'
            },
            status: 'live',
            quarter: '3rd',
            time: '7:42',
            stats: {
                viewers: '12.4k',
                spread: 'LAL -2.5'
            }
        },
        {
            id: 2,
            homeTeam: {
                name: 'Celtics',
                abbreviation: 'BOS',
                logo: 'BOS',
                score: 87,
                record: '26-8'
            },
            awayTeam: {
                name: 'Heat',
                abbreviation: 'MIA',
                logo: 'MIA',
                score: 84,
                record: '15-14'
            },
            status: 'live',
            quarter: '4th',
            time: '2:15',
            stats: {
                viewers: '8.2k',
                spread: 'BOS -5.5'
            }
        },
        {
            id: 3,
            homeTeam: {
                name: 'Bucks',
                abbreviation: 'MIL',
                logo: 'MIL',
                score: 0,
                record: '19-16'
            },
            awayTeam: {
                name: 'Nets',
                abbreviation: 'BKN',
                logo: 'BKN',
                score: 0,
                record: '12-20'
            },
            status: 'scheduled',
            time: '7:00 PM',
            stats: {
                spread: 'MIL -8.5'
            }
        },
        {
            id: 4,
            homeTeam: {
                name: 'Sixers',
                abbreviation: 'PHI',
                logo: 'PHI',
                score: 0,
                record: '14-18'
            },
            awayTeam: {
                name: 'Raptors',
                abbreviation: 'TOR',
                logo: 'TOR',
                score: 0,
                record: '8-26'
            },
            status: 'scheduled',
            time: '7:00 PM',
            stats: {
                spread: 'PHI -6.5'
            }
        },
        {
            id: 5,
            homeTeam: {
                name: 'Cavaliers',
                abbreviation: 'CLE',
                logo: 'CLE',
                score: 0,
                record: '30-4'
            },
            awayTeam: {
                name: 'Pistons',
                abbreviation: 'DET',
                logo: 'DET',
                score: 0,
                record: '11-21'
            },
            status: 'scheduled',
            time: '7:30 PM',
            stats: {
                spread: 'CLE -12.5'
            }
        },
        {
            id: 6,
            homeTeam: {
                name: 'Hawks',
                abbreviation: 'ATL',
                logo: 'ATL',
                score: 0,
                record: '16-16'
            },
            awayTeam: {
                name: 'Hornets',
                abbreviation: 'CHA',
                logo: 'CHA',
                score: 0,
                record: '7-24'
            },
            status: 'scheduled',
            time: '7:30 PM',
            stats: {
                spread: 'ATL -9.5'
            }
        },
        {
            id: 7,
            homeTeam: {
                name: 'Bulls',
                abbreviation: 'CHI',
                logo: 'CHI',
                score: 0,
                record: '13-19'
            },
            awayTeam: {
                name: 'Wizards',
                abbreviation: 'WAS',
                logo: 'WAS',
                score: 0,
                record: '4-26'
            },
            status: 'scheduled',
            time: '8:00 PM',
            stats: {
                spread: 'CHI -7.5'
            }
        },
        {
            id: 8,
            homeTeam: {
                name: 'Pacers',
                abbreviation: 'IND',
                logo: 'IND',
                score: 0,
                record: '16-18'
            },
            awayTeam: {
                name: 'Magic',
                abbreviation: 'ORL',
                logo: 'ORL',
                score: 0,
                record: '19-16'
            },
            status: 'scheduled',
            time: '8:00 PM',
            stats: {
                spread: 'ORL -2.5'
            }
        },
        {
            id: 9,
            homeTeam: {
                name: 'Knicks',
                abbreviation: 'NYK',
                logo: 'NYK',
                score: 0,
                record: '20-15'
            },
            awayTeam: {
                name: 'Pelicans',
                abbreviation: 'NOP',
                logo: 'NOP',
                score: 0,
                record: '5-29'
            },
            status: 'scheduled',
            time: '8:30 PM',
            stats: {
                spread: 'NYK -11.5'
            }
        },
        {
            id: 10,
            homeTeam: {
                name: 'Mavericks',
                abbreviation: 'DAL',
                logo: 'DAL',
                score: 0,
                record: '20-15'
            },
            awayTeam: {
                name: 'Clippers',
                abbreviation: 'LAC',
                logo: 'LAC',
                score: 0,
                record: '17-15'
            },
            status: 'scheduled',
            time: '8:30 PM',
            stats: {
                spread: 'DAL -3.5'
            }
        },
        {
            id: 11,
            homeTeam: {
                name: 'Rockets',
                abbreviation: 'HOU',
                logo: 'HOU',
                score: 0,
                record: '20-11'
            },
            awayTeam: {
                name: 'Spurs',
                abbreviation: 'SAS',
                logo: 'SAS',
                score: 0,
                record: '15-16'
            },
            status: 'scheduled',
            time: '9:00 PM',
            stats: {
                spread: 'HOU -5.5'
            }
        },
        {
            id: 12,
            homeTeam: {
                name: 'Grizzlies',
                abbreviation: 'MEM',
                logo: 'MEM',
                score: 0,
                record: '22-11'
            },
            awayTeam: {
                name: 'Timberwolves',
                abbreviation: 'MIN',
                logo: 'MIN',
                score: 0,
                record: '15-16'
            },
            status: 'scheduled',
            time: '9:00 PM',
            stats: {
                spread: 'MEM -6.5'
            }
        },
        {
            id: 13,
            homeTeam: {
                name: 'Thunder',
                abbreviation: 'OKC',
                logo: 'OKC',
                score: 0,
                record: '28-5'
            },
            awayTeam: {
                name: 'Suns',
                abbreviation: 'PHX',
                logo: 'PHX',
                score: 0,
                record: '16-16'
            },
            status: 'scheduled',
            time: '9:30 PM',
            stats: {
                spread: 'OKC -9.5'
            }
        },
        {
            id: 14,
            homeTeam: {
                name: 'Jazz',
                abbreviation: 'UTA',
                logo: 'UTA',
                score: 0,
                record: '7-24'
            },
            awayTeam: {
                name: 'Nuggets',
                abbreviation: 'DEN',
                logo: 'DEN',
                score: 0,
                record: '17-13'
            },
            status: 'scheduled',
            time: '10:00 PM',
            stats: {
                spread: 'DEN -8.5'
            }
        },
        {
            id: 15,
            homeTeam: {
                name: 'Blazers',
                abbreviation: 'POR',
                logo: 'POR',
                score: 0,
                record: '10-22'
            },
            awayTeam: {
                name: 'Kings',
                abbreviation: 'SAC',
                logo: 'SAC',
                score: 0,
                record: '14-19'
            },
            status: 'scheduled',
            time: '10:00 PM',
            stats: {
                spread: 'SAC -4.5'
            }
        },
        {
            id: 16,
            homeTeam: {
                name: 'Lakers',
                abbreviation: 'LAL',
                logo: 'LAL',
                score: 115,
                record: '18-14'
            },
            awayTeam: {
                name: 'Celtics',
                abbreviation: 'BOS',
                logo: 'BOS',
                score: 118,
                record: '26-8'
            },
            status: 'final',
            quarter: 'Final',
            stats: {
                viewers: '15.2k',
                spread: '1.2k'
            }
        },
        {
            id: 17,
            homeTeam: {
                name: 'Warriors',
                abbreviation: 'GSW',
                logo: 'GSW',
                score: 0,
                record: '17-16'
            },
            awayTeam: {
                name: 'Bucks',
                abbreviation: 'MIL',
                logo: 'MIL',
                score: 0,
                record: '19-16'
            },
            status: 'scheduled',
            time: '10:30 PM',
            stats: {
                spread: 'GSW -3.5'
            }
        },
        {
            id: 18,
            homeTeam: {
                name: 'Heat',
                abbreviation: 'MIA',
                logo: 'MIA',
                score: 0,
                record: '15-14'
            },
            awayTeam: {
                name: 'Nets',
                abbreviation: 'BKN',
                logo: 'BKN',
                score: 0,
                record: '12-20'
            },
            status: 'scheduled',
            time: '7:30 PM',
            stats: {
                spread: 'MIA -5.5'
            }
        },
        {
            id: 19,
            homeTeam: {
                name: 'Sixers',
                abbreviation: 'PHI',
                logo: 'PHI',
                score: 0,
                record: '14-18'
            },
            awayTeam: {
                name: 'Cavaliers',
                abbreviation: 'CLE',
                logo: 'CLE',
                score: 0,
                record: '30-4'
            },
            status: 'scheduled',
            time: '7:00 PM',
            stats: {
                spread: 'CLE -10.5'
            }
        },
        {
            id: 20,
            homeTeam: {
                name: 'Raptors',
                abbreviation: 'TOR',
                logo: 'TOR',
                score: 0,
                record: '8-26'
            },
            awayTeam: {
                name: 'Hawks',
                abbreviation: 'ATL',
                logo: 'ATL',
                score: 0,
                record: '16-16'
            },
            status: 'scheduled',
            time: '7:30 PM',
            stats: {
                spread: 'ATL -6.5'
            }
        },
        {
            id: 21,
            homeTeam: {
                name: 'Pistons',
                abbreviation: 'DET',
                logo: 'DET',
                score: 0,
                record: '11-21'
            },
            awayTeam: {
                name: 'Hornets',
                abbreviation: 'CHA',
                logo: 'CHA',
                score: 0,
                record: '7-24'
            },
            status: 'scheduled',
            time: '7:00 PM',
            stats: {
                spread: 'DET -4.5'
            }
        },
        {
            id: 22,
            homeTeam: {
                name: 'Bulls',
                abbreviation: 'CHI',
                logo: 'CHI',
                score: 0,
                record: '13-19'
            },
            awayTeam: {
                name: 'Pacers',
                abbreviation: 'IND',
                logo: 'IND',
                score: 0,
                record: '16-18'
            },
            status: 'scheduled',
            time: '8:00 PM',
            stats: {
                spread: 'IND -3.5'
            }
        },
        {
            id: 23,
            homeTeam: {
                name: 'Wizards',
                abbreviation: 'WAS',
                logo: 'WAS',
                score: 0,
                record: '4-26'
            },
            awayTeam: {
                name: 'Magic',
                abbreviation: 'ORL',
                logo: 'ORL',
                score: 0,
                record: '19-16'
            },
            status: 'scheduled',
            time: '7:00 PM',
            stats: {
                spread: 'ORL -12.5'
            }
        },
        {
            id: 24,
            homeTeam: {
                name: 'Knicks',
                abbreviation: 'NYK',
                logo: 'NYK',
                score: 0,
                record: '20-15'
            },
            awayTeam: {
                name: 'Mavericks',
                abbreviation: 'DAL',
                logo: 'DAL',
                score: 0,
                record: '20-15'
            },
            status: 'scheduled',
            time: '7:30 PM',
            stats: {
                spread: 'NYK -2.5'
            }
        },
        {
            id: 25,
            homeTeam: {
                name: 'Pelicans',
                abbreviation: 'NOP',
                logo: 'NOP',
                score: 0,
                record: '5-29'
            },
            awayTeam: {
                name: 'Clippers',
                abbreviation: 'LAC',
                logo: 'LAC',
                score: 0,
                record: '17-15'
            },
            status: 'scheduled',
            time: '8:00 PM',
            stats: {
                spread: 'LAC -9.5'
            }
        },
        {
            id: 26,
            homeTeam: {
                name: 'Rockets',
                abbreviation: 'HOU',
                logo: 'HOU',
                score: 0,
                record: '20-11'
            },
            awayTeam: {
                name: 'Grizzlies',
                abbreviation: 'MEM',
                logo: 'MEM',
                score: 0,
                record: '22-11'
            },
            status: 'scheduled',
            time: '8:00 PM',
            stats: {
                spread: 'MEM -3.5'
            }
        },
        {
            id: 27,
            homeTeam: {
                name: 'Spurs',
                abbreviation: 'SAS',
                logo: 'SAS',
                score: 0,
                record: '15-16'
            },
            awayTeam: {
                name: 'Timberwolves',
                abbreviation: 'MIN',
                logo: 'MIN',
                score: 0,
                record: '15-16'
            },
            status: 'scheduled',
            time: '8:30 PM',
            stats: {
                spread: 'SAS -1.5'
            }
        },
        {
            id: 28,
            homeTeam: {
                name: 'Thunder',
                abbreviation: 'OKC',
                logo: 'OKC',
                score: 0,
                record: '28-5'
            },
            awayTeam: {
                name: 'Jazz',
                abbreviation: 'UTA',
                logo: 'UTA',
                score: 0,
                record: '7-24'
            },
            status: 'scheduled',
            time: '8:00 PM',
            stats: {
                spread: 'OKC -15.5'
            }
        },
        {
            id: 29,
            homeTeam: {
                name: 'Suns',
                abbreviation: 'PHX',
                logo: 'PHX',
                score: 0,
                record: '16-16'
            },
            awayTeam: {
                name: 'Nuggets',
                abbreviation: 'DEN',
                logo: 'DEN',
                score: 0,
                record: '17-13'
            },
            status: 'scheduled',
            time: '9:00 PM',
            stats: {
                spread: 'DEN -4.5'
            }
        },
        {
            id: 30,
            homeTeam: {
                name: 'Blazers',
                abbreviation: 'POR',
                logo: 'POR',
                score: 0,
                record: '10-22'
            },
            awayTeam: {
                name: 'Lakers',
                abbreviation: 'LAL',
                logo: 'LAL',
                score: 0,
                record: '18-14'
            },
            status: 'scheduled',
            time: '10:00 PM',
            stats: {
                spread: 'LAL -6.5'
            }
        },
        {
            id: 31,
            homeTeam: {
                name: 'Kings',
                abbreviation: 'SAC',
                logo: 'SAC',
                score: 0,
                record: '14-19'
            },
            awayTeam: {
                name: 'Warriors',
                abbreviation: 'GSW',
                logo: 'GSW',
                score: 0,
                record: '17-16'
            },
            status: 'scheduled',
            time: '10:00 PM',
            stats: {
                spread: 'GSW -3.5'
            }
        },
        {
            id: 32,
            homeTeam: {
                name: 'Celtics',
                abbreviation: 'BOS',
                logo: 'BOS',
                score: 0,
                record: '26-8'
            },
            awayTeam: {
                name: 'Heat',
                abbreviation: 'MIA',
                logo: 'MIA',
                score: 0,
                record: '15-14'
            },
            status: 'scheduled',
            time: '7:30 PM',
            stats: {
                spread: 'BOS -8.5'
            }
        },
        {
            id: 33,
            homeTeam: {
                name: 'Bucks',
                abbreviation: 'MIL',
                logo: 'MIL',
                score: 0,
                record: '19-16'
            },
            awayTeam: {
                name: 'Sixers',
                abbreviation: 'PHI',
                logo: 'PHI',
                score: 0,
                record: '14-18'
            },
            status: 'scheduled',
            time: '8:00 PM',
            stats: {
                spread: 'MIL -7.5'
            }
        },
        {
            id: 34,
            homeTeam: {
                name: 'Nets',
                abbreviation: 'BKN',
                logo: 'BKN',
                score: 0,
                record: '12-20'
            },
            awayTeam: {
                name: 'Cavaliers',
                abbreviation: 'CLE',
                logo: 'CLE',
                score: 0,
                record: '30-4'
            },
            status: 'scheduled',
            time: '7:30 PM',
            stats: {
                spread: 'CLE -11.5'
            }
        },
        {
            id: 35,
            homeTeam: {
                name: 'Raptors',
                abbreviation: 'TOR',
                logo: 'TOR',
                score: 0,
                record: '8-26'
            },
            awayTeam: {
                name: 'Pistons',
                abbreviation: 'DET',
                logo: 'DET',
                score: 0,
                record: '11-21'
            },
            status: 'scheduled',
            time: '7:00 PM',
            stats: {
                spread: 'DET -3.5'
            }
        },
        {
            id: 36,
            homeTeam: {
                name: 'Hawks',
                abbreviation: 'ATL',
                logo: 'ATL',
                score: 0,
                record: '16-16'
            },
            awayTeam: {
                name: 'Bulls',
                abbreviation: 'CHI',
                logo: 'CHI',
                score: 0,
                record: '13-19'
            },
            status: 'scheduled',
            time: '7:30 PM',
            stats: {
                spread: 'ATL -4.5'
            }
        }
    ];
}

// Load and display games from live API
let refreshInterval = null;
let currentFilter = 'today';

async function loadGames(filter = 'today') {
    currentFilter = filter;
    const loadingState = document.getElementById('loadingState');
    const gamesGrid = document.getElementById('gamesGrid');
    const emptyState = document.getElementById('emptyState');

    // Show loading
    loadingState.style.display = 'flex';
    gamesGrid.style.display = 'none';
    emptyState.style.display = 'none';

    try {
        // Build API URL based on filter
        let url = '/api/games';
        if (filter === 'today') {
            url += '?filter=today';
        } else if (filter === 'week') {
            url += '?filter=week';
        } else if (filter === 'all') {
            // Get all upcoming games (excludes completed games)
            url += '?filter=all';
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch games');
        }

        const games = data.games || [];

        if (games.length === 0) {
            loadingState.style.display = 'none';
            if (filter === 'today') {
                emptyState.innerHTML = '<p>No games scheduled for today</p>';
            } else if (filter === 'week') {
                emptyState.innerHTML = '<p>No games scheduled this week</p>';
            } else {
                emptyState.innerHTML = '<p>No games found</p>';
            }
            emptyState.style.display = 'block';
            return;
        }

        // Transform API response to match our card format
        const transformedGames = games.map(game => transformGameData(game));

        // Render games - grouped by date for week/all view
        if (filter === 'week' || filter === 'all') {
            gamesGrid.innerHTML = renderGamesByDate(transformedGames);
        } else {
            gamesGrid.innerHTML = transformedGames.map(game => createGameCard(game)).join('');
        }

        loadingState.style.display = 'none';
        gamesGrid.style.display = filter === 'week' || filter === 'all' ? 'block' : 'grid';

        // Set up auto-refresh for live games
        setupAutoRefresh(filter);

    } catch (error) {
        console.error('Error loading games:', error);
        loadingState.style.display = 'none';
        emptyState.innerHTML = '<p>Error loading games. Please try again.</p>';
        emptyState.style.display = 'block';
    }
}

// Group games by date and render with date headers
function renderGamesByDate(games) {
    // Group games by date
    const gamesByDate = {};

    games.forEach(game => {
        const dateKey = game.dateStr || 'Unknown';
        if (!gamesByDate[dateKey]) {
            gamesByDate[dateKey] = [];
        }
        gamesByDate[dateKey].push(game);
    });

    // Sort dates
    const sortedDates = Object.keys(gamesByDate).sort((a, b) => {
        return new Date(a) - new Date(b);
    });

    // Render each date section
    let html = '';
    sortedDates.forEach(dateStr => {
        const dateGames = gamesByDate[dateStr];
        const formattedDate = formatDateHeader(dateStr);

        html += `
            <div class="date-section">
                <div class="date-header">
                    <span class="date-day">${formattedDate.day}</span>
                    <span class="date-full">${formattedDate.full}</span>
                </div>
                <div class="date-games-grid">
                    ${dateGames.map(game => createGameCard(game)).join('')}
                </div>
            </div>
        `;
    });

    return html;
}

// Format date for header display
function formatDateHeader(dateStr) {
    const date = new Date(dateStr + 'T12:00:00'); // Add time to avoid timezone issues
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let dayName = days[date.getDay()];

    // Check if today or tomorrow
    if (date.toDateString() === today.toDateString()) {
        dayName = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        dayName = 'Tomorrow';
    }

    return {
        day: dayName,
        full: `${months[date.getMonth()]} ${date.getDate()}`
    };
}

// Transform API game data to match our card format
function transformGameData(apiGame) {
    const status = apiGame.status?.toLowerCase() || 'scheduled';
    const isLive = status.includes('q') || status.includes('1st') || status.includes('2nd') ||
        status.includes('3rd') || status.includes('4th') || status.includes('ot') ||
        status.includes('half');
    const isFinal = status === 'final';

    const liveStatus = parseLiveStatus(apiGame.status || '', apiGame.time || '');

    // Parse time from datetime
    let displayTime = apiGame.time || '';
    if (apiGame.datetime && !isLive && !isFinal) {
        const gameDate = new Date(apiGame.datetime);
        displayTime = gameDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    return {
        id: apiGame.id,
        dateStr: apiGame.date || '',
        homeTeam: {
            name: apiGame.home_team?.name || apiGame.homeTeam?.name || 'TBD',
            abbreviation: apiGame.home_team?.abbreviation || apiGame.homeTeam?.abbreviation || '???',
            logo: apiGame.home_team?.abbreviation || apiGame.homeTeam?.abbreviation || '???',
            score: apiGame.home_team_score || apiGame.homeTeamScore || 0,
            record: ''
        },
        awayTeam: {
            name: apiGame.visitor_team?.name || apiGame.visitorTeam?.name || 'TBD',
            abbreviation: apiGame.visitor_team?.abbreviation || apiGame.visitorTeam?.abbreviation || '???',
            logo: apiGame.visitor_team?.abbreviation || apiGame.visitorTeam?.abbreviation || '???',
            score: apiGame.visitor_team_score || apiGame.visitorTeamScore || 0,
            record: ''
        },
        status: isLive ? 'live' : (isFinal ? 'final' : 'scheduled'),
        quarter: isLive ? liveStatus.quarter : (isFinal ? 'Final' : ''),
        time: isLive ? liveStatus.clock : displayTime,
        postseason: apiGame.postseason || false,
        stats: null
    };
}

function parseLiveStatus(statusText, timeText) {
    const combined = `${statusText} ${timeText}`.trim();
    const fullMatch = combined.match(/\b(Q\d|OT\d?|OT)\b\s+(\d{1,2}:\d{2})/i);
    if (fullMatch) {
        return { quarter: fullMatch[1].toUpperCase(), clock: fullMatch[2] };
    }

    if (/half/i.test(combined)) {
        return { quarter: 'Halftime', clock: '' };
    }

    const quarterMatch = combined.match(/\b(Q\d|OT\d?|OT)\b/i);
    const clockMatch = combined.match(/\b\d{1,2}:\d{2}\b/);

    const quarter = quarterMatch ? quarterMatch[0].toUpperCase() : (statusText || 'Live');
    const clock = clockMatch ? clockMatch[0] : '';
    return { quarter, clock };
}

// Setup auto-refresh for live updates
function setupAutoRefresh(filter) {
    // Clear existing interval
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }

    // Refresh every 30 seconds
    refreshInterval = setInterval(() => {
        console.log('Auto-refreshing games...');
        loadGames(filter);
    }, 30000);
}

// Create game card HTML
function createGameCard(game) {
    const isLive = game.status === 'live';
    const isFinal = game.status === 'final';
    const isScheduled = game.status === 'scheduled';

    const awayWinner = isFinal && game.awayTeam.score > game.homeTeam.score;
    const homeWinner = isFinal && game.homeTeam.score > game.awayTeam.score;

    // Get team logo URLs from NBA CDN
    const awayLogoUrl = getTeamLogoUrl(game.awayTeam.abbreviation);
    const homeLogoUrl = getTeamLogoUrl(game.homeTeam.abbreviation);
    const liveStatusText = formatLiveStatus(game.quarter, game.time);

    return `
        <div class="game-card" data-game-id="${game.id}">
            <div class="game-status">
                ${isLive ? `
                    <span class="game-live">● LIVE</span>
                    <span class="game-quarter">${liveStatusText}</span>
                ` : isFinal ? `
                    <span class="game-final">${game.quarter}</span>
                ` : `
                    <span class="game-time">${game.time}</span>
                `}
            </div>
            
            <div class="game-teams">
                <div class="team ${awayWinner ? 'winner' : ''}">
                    <div class="team-info">
                        <img class="team-logo-img" src="${awayLogoUrl}" alt="${game.awayTeam.abbreviation}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="team-logo-fallback" style="display:none;">${game.awayTeam.abbreviation}</div>
                        <div class="team-name">${game.awayTeam.name}</div>
                    </div>
                    <div class="team-right">
                        ${!isScheduled ? `<div class="team-score">${game.awayTeam.score}</div>` : ''}
                        <div class="team-record">${game.awayTeam.record || ''}</div>
                    </div>
                </div>
                
                <div class="team ${homeWinner ? 'winner' : ''}">
                    <div class="team-info">
                        <img class="team-logo-img" src="${homeLogoUrl}" alt="${game.homeTeam.abbreviation}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="team-logo-fallback" style="display:none;">${game.homeTeam.abbreviation}</div>
                        <div class="team-name">${game.homeTeam.name}</div>
                    </div>
                    <div class="team-right">
                        ${!isScheduled ? `<div class="team-score">${game.homeTeam.score}</div>` : ''}
                        <div class="team-record">${game.homeTeam.record || ''}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function formatLiveStatus(quarter, time) {
    const q = (quarter || '').trim();
    const t = (time || '').trim();

    if (/half/i.test(q) || /half/i.test(t)) {
        return 'Halftime';
    }
    if (!t) {
        return q;
    }
    if (!q) {
        return t;
    }
    if (t.includes(q)) {
        return t;
    }
    if (q.includes(t)) {
        return q;
    }
    return `${q} ${t}`.trim();
}

// NBA Team ID mapping for logo URLs
const teamIdMap = {
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
    const teamId = teamIdMap[abbreviation];
    if (teamId) {
        return `https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`;
    }
    return '';
}

// Add click handlers to game cards
document.addEventListener('click', (e) => {
    const gameCard = e.target.closest('.game-card');
    if (gameCard) {
        const gameId = gameCard.dataset.gameId;
        console.log('Game clicked:', gameId);
        // Navigate to game details page
        window.location.href = `/game-details.html?id=${gameId}`;
    }
});
