package com.nba.nba_zone.game;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class GameService {

    // NBA CDN API for live scoreboard
    private static final String NBA_SCOREBOARD_URL = "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

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

    public List<Game> getGamesForDate(LocalDate date) {
        // For now, we only support today's games from the live API
        // If the requested date is today, return today's games
        if (date.equals(LocalDate.now())) {
            return getTodaysGames();
        }
        // For other dates, return empty (could be extended to use schedule API)
        return Collections.emptyList();
    }

    public List<Game> getGamesForWeek() {
        // For now, just return today's games
        // The NBA live API only provides today's scoreboard
        return getTodaysGames();
    }

    public List<Game> getGamesForDateRange(LocalDate startDate, LocalDate endDate) {
        // For now, just return today's games if today falls within the range
        LocalDate today = LocalDate.now();
        if (!today.isBefore(startDate) && !today.isAfter(endDate)) {
            return getTodaysGames();
        }
        return Collections.emptyList();
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
