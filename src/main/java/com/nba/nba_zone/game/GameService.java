package com.nba.nba_zone.game;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GameService {

    // NBA CDN API for live scoreboard
    private static final String NBA_SCOREBOARD_URL = "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json";
    // NBA Schedule API for full season schedule
    private static final String NBA_SCHEDULE_URL = "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // Cache for schedule data (refreshed periodically)
    private List<Game> cachedSchedule = null;
    private LocalDateTime scheduleCacheTime = null;
    private static final int SCHEDULE_CACHE_MINUTES = 30;

    public GameService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public List<Game> getTodaysGames() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0");
            headers.set("Accept", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    NBA_SCOREBOARD_URL,
                    HttpMethod.GET,
                    entity,
                    String.class);

            if (response.getBody() != null) {
                return parseScoreboardResponse(response.getBody());
            }
        } catch (Exception e) {
            System.err.println("Error fetching today's games from NBA API: " + e.getMessage());
            e.printStackTrace();
        }

        return Collections.emptyList();
    }

    private List<Game> parseScoreboardResponse(String jsonResponse) {
        List<Game> games = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode scoreboard = root.path("scoreboard");
            String gameDate = scoreboard.path("gameDate").asText();
            JsonNode gamesNode = scoreboard.path("games");

            if (gamesNode.isArray()) {
                for (JsonNode gameNode : gamesNode) {
                    Game game = new Game();

                    // Parse game ID (as long from the string)
                    String gameIdStr = gameNode.path("gameId").asText();
                    try {
                        game.setId(Long.parseLong(gameIdStr));
                    } catch (NumberFormatException e) {
                        game.setId(gameIdStr.hashCode());
                    }

                    game.setDate(gameDate);
                    game.setSeason(2024);
                    game.setStatus(gameNode.path("gameStatusText").asText());
                    game.setPeriod(gameNode.path("period").asInt());
                    game.setTime(gameNode.path("gameStatusText").asText());
                    game.setPostseason(false);

                    // Home team
                    JsonNode homeTeamNode = gameNode.path("homeTeam");
                    Team homeTeam = new Team();
                    homeTeam.setId(homeTeamNode.path("teamId").asLong());
                    homeTeam.setName(homeTeamNode.path("teamName").asText());
                    homeTeam.setAbbreviation(homeTeamNode.path("teamTricode").asText());
                    homeTeam.setCity(homeTeamNode.path("teamCity").asText());
                    homeTeam.setFullName(
                            homeTeamNode.path("teamCity").asText() + " " + homeTeamNode.path("teamName").asText());
                    // Set win-loss record
                    int homeWins = homeTeamNode.path("wins").asInt();
                    int homeLosses = homeTeamNode.path("losses").asInt();
                    homeTeam.setRecord(homeWins + "-" + homeLosses);
                    game.setHomeTeam(homeTeam);
                    game.setHomeTeamScore(homeTeamNode.path("score").asInt());

                    // Away/Visitor team
                    JsonNode awayTeamNode = gameNode.path("awayTeam");
                    Team visitorTeam = new Team();
                    visitorTeam.setId(awayTeamNode.path("teamId").asLong());
                    visitorTeam.setName(awayTeamNode.path("teamName").asText());
                    visitorTeam.setAbbreviation(awayTeamNode.path("teamTricode").asText());
                    visitorTeam.setCity(awayTeamNode.path("teamCity").asText());
                    visitorTeam.setFullName(
                            awayTeamNode.path("teamCity").asText() + " " + awayTeamNode.path("teamName").asText());
                    // Set win-loss record
                    int awayWins = awayTeamNode.path("wins").asInt();
                    int awayLosses = awayTeamNode.path("losses").asInt();
                    visitorTeam.setRecord(awayWins + "-" + awayLosses);
                    game.setVisitorTeam(visitorTeam);
                    game.setVisitorTeamScore(awayTeamNode.path("score").asInt());

                    // Set datetime
                    game.setDatetime(gameNode.path("gameTimeUTC").asText());

                    games.add(game);
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing scoreboard response: " + e.getMessage());
            e.printStackTrace();
        }

        return games;
    }

    /**
     * Fetch and cache the full NBA schedule
     */
    private List<Game> getFullSchedule() {
        // Check cache
        if (cachedSchedule != null && scheduleCacheTime != null
                && LocalDateTime.now().isBefore(scheduleCacheTime.plusMinutes(SCHEDULE_CACHE_MINUTES))) {
            return cachedSchedule;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0");
            headers.set("Accept", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    NBA_SCHEDULE_URL,
                    HttpMethod.GET,
                    entity,
                    String.class);

            if (response.getBody() != null) {
                cachedSchedule = parseScheduleResponse(response.getBody());
                scheduleCacheTime = LocalDateTime.now();
                return cachedSchedule;
            }
        } catch (Exception e) {
            System.err.println("Error fetching NBA schedule: " + e.getMessage());
            e.printStackTrace();
        }

        return Collections.emptyList();
    }

    private List<Game> parseScheduleResponse(String jsonResponse) {
        List<Game> games = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode leagueSchedule = root.path("leagueSchedule");
            JsonNode gameDates = leagueSchedule.path("gameDates");

            if (gameDates.isArray()) {
                for (JsonNode dateNode : gameDates) {
                    String gameDateStr = dateNode.path("gameDate").asText();
                    // Parse date from format like "01/06/2026 12:00:00 AM"
                    LocalDate gameDate = parseScheduleDate(gameDateStr);

                    JsonNode gamesNode = dateNode.path("games");
                    if (gamesNode.isArray()) {
                        for (JsonNode gameNode : gamesNode) {
                            Game game = parseScheduleGame(gameNode, gameDate);
                            if (game != null) {
                                games.add(game);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing schedule response: " + e.getMessage());
            e.printStackTrace();
        }

        return games;
    }

    private LocalDate parseScheduleDate(String dateStr) {
        try {
            // Format: "01/06/2026 12:00:00 AM"
            String datePart = dateStr.split(" ")[0];
            String[] parts = datePart.split("/");
            return LocalDate.of(
                    Integer.parseInt(parts[2]),
                    Integer.parseInt(parts[0]),
                    Integer.parseInt(parts[1]));
        } catch (Exception e) {
            return LocalDate.now();
        }
    }

    private Game parseScheduleGame(JsonNode gameNode, LocalDate gameDate) {
        try {
            Game game = new Game();

            String gameIdStr = gameNode.path("gameId").asText();
            try {
                game.setId(Long.parseLong(gameIdStr));
            } catch (NumberFormatException e) {
                game.setId(gameIdStr.hashCode());
            }

            game.setDate(gameDate.toString());
            game.setSeason(2024);

            // Game status
            int gameStatus = gameNode.path("gameStatus").asInt();
            String gameStatusText = gameNode.path("gameStatusText").asText();
            if (gameStatus == 1) {
                game.setStatus("scheduled");
            } else if (gameStatus == 2) {
                game.setStatus(gameStatusText); // In progress
            } else if (gameStatus == 3) {
                game.setStatus("Final");
            } else {
                game.setStatus(gameStatusText);
            }

            game.setPeriod(gameNode.path("period").asInt());
            game.setPostseason(false);

            // Parse game time
            String gameDateTimeUTC = gameNode.path("gameDateTimeUTC").asText();
            game.setDatetime(gameDateTimeUTC);

            // Format time for display
            if (!gameDateTimeUTC.isEmpty() && gameStatus == 1) {
                try {
                    ZonedDateTime utcTime = ZonedDateTime.parse(gameDateTimeUTC);
                    // Convert to local time and format
                    game.setTime(utcTime.format(DateTimeFormatter.ofPattern("h:mm a")));
                } catch (Exception e) {
                    game.setTime(gameStatusText);
                }
            } else {
                game.setTime(gameStatusText);
            }

            // Home team
            JsonNode homeTeamNode = gameNode.path("homeTeam");
            Team homeTeam = new Team();
            homeTeam.setId(homeTeamNode.path("teamId").asLong());
            homeTeam.setName(homeTeamNode.path("teamName").asText());
            homeTeam.setAbbreviation(homeTeamNode.path("teamTricode").asText());
            homeTeam.setCity(homeTeamNode.path("teamCity").asText());
            homeTeam.setFullName(homeTeamNode.path("teamCity").asText() + " " + homeTeamNode.path("teamName").asText());
            homeTeam.setRecord(homeTeamNode.path("wins").asInt() + "-" + homeTeamNode.path("losses").asInt());
            game.setHomeTeam(homeTeam);
            game.setHomeTeamScore(homeTeamNode.path("score").asInt());

            // Away team
            JsonNode awayTeamNode = gameNode.path("awayTeam");
            Team awayTeam = new Team();
            awayTeam.setId(awayTeamNode.path("teamId").asLong());
            awayTeam.setName(awayTeamNode.path("teamName").asText());
            awayTeam.setAbbreviation(awayTeamNode.path("teamTricode").asText());
            awayTeam.setCity(awayTeamNode.path("teamCity").asText());
            awayTeam.setFullName(awayTeamNode.path("teamCity").asText() + " " + awayTeamNode.path("teamName").asText());
            awayTeam.setRecord(awayTeamNode.path("wins").asInt() + "-" + awayTeamNode.path("losses").asInt());
            game.setVisitorTeam(awayTeam);
            game.setVisitorTeamScore(awayTeamNode.path("score").asInt());

            return game;
        } catch (Exception e) {
            System.err.println("Error parsing schedule game: " + e.getMessage());
            return null;
        }
    }

    public List<Game> getGamesForDate(LocalDate date) {
        // If today, use live scoreboard for real-time updates
        if (date.equals(LocalDate.now())) {
            return getTodaysGames();
        }

        // Otherwise, use schedule API
        List<Game> allGames = getFullSchedule();
        return allGames.stream()
                .filter(g -> {
                    try {
                        LocalDate gameDate = LocalDate.parse(g.getDate());
                        return gameDate.equals(date);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .collect(Collectors.toList());
    }

    public List<Game> getGamesForWeek() {
        LocalDate today = LocalDate.now();

        // Get the start of the current week (Sunday) - NBA weeks typically run Sun-Sat
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
        LocalDate weekEnd = weekStart.plusDays(6); // Saturday

        return getGamesForDateRange(weekStart, weekEnd);
    }

    public List<Game> getGamesForDateRange(LocalDate startDate, LocalDate endDate) {
        List<Game> result = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Get schedule data for the date range
        List<Game> allGames = getFullSchedule();

        for (Game game : allGames) {
            try {
                LocalDate gameDate = LocalDate.parse(game.getDate());

                // Check if game is within the date range
                if (!gameDate.isBefore(startDate) && !gameDate.isAfter(endDate)) {
                    // If it's today, supplement with live data for real-time scores
                    if (gameDate.equals(today)) {
                        // Find matching game in today's live data
                        List<Game> liveGames = getTodaysGames();
                        Game liveGame = liveGames.stream()
                                .filter(lg -> lg.getId() == game.getId())
                                .findFirst()
                                .orElse(null);

                        if (liveGame != null) {
                            result.add(liveGame);
                        } else {
                            result.add(game);
                        }
                    } else {
                        result.add(game);
                    }
                }
            } catch (Exception e) {
                // Skip games with invalid dates
            }
        }

        // Sort by date
        result.sort((a, b) -> {
            try {
                LocalDate dateA = LocalDate.parse(a.getDate());
                LocalDate dateB = LocalDate.parse(b.getDate());
                return dateA.compareTo(dateB);
            } catch (Exception e) {
                return 0;
            }
        });

        return result;
    }

    /**
     * Get all upcoming games (excluding completed games)
     */
    public List<Game> getUpcomingGames() {
        LocalDate today = LocalDate.now();
        LocalDate futureEnd = today.plusDays(14); // Next 2 weeks

        List<Game> allGames = getGamesForDateRange(today, futureEnd);

        // Filter out completed games
        return allGames.stream()
                .filter(game -> {
                    String status = game.getStatus();
                    if (status == null)
                        return true;
                    String statusLower = status.toLowerCase();
                    // Exclude games that are final/completed
                    return !statusLower.contains("final") && !statusLower.equals("3");
                })
                .collect(Collectors.toList());
    }

    public Game getGameById(Long gameId) {
        // Search through today's games for the matching ID
        List<Game> todaysGames = getTodaysGames();
        for (Game game : todaysGames) {
            if (game.getId() == gameId) {
                return game;
            }
        }
        return null;
    }
}
