package com.nba.nba_zone.game;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "*")
public class TeamController {

    private static final String API_BASE_URL = "http://localhost:5001";
    // private String apiKey;

    private final RestTemplate restTemplate;

    public TeamController() {
        this.restTemplate = new RestTemplate();
    }

    // Get all NBA teams
    @GetMapping
    public ResponseEntity<?> getAllTeams() {
        String url = API_BASE_URL + "/teams";

        HttpHeaders headers = new HttpHeaders();
        // headers.set("Authorization", apiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Object.class);

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch teams: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // Get team by ID
    @GetMapping("/{teamId}")
    public ResponseEntity<?> getTeamById(@PathVariable Long teamId) {
        String url = API_BASE_URL + "/teams/" + teamId;

        HttpHeaders headers = new HttpHeaders();
        // headers.set("Authorization", apiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Object.class);

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch team: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // Get players for a team (current season)
    @GetMapping("/{teamId}/players")
    public ResponseEntity<?> getTeamPlayers(@PathVariable Long teamId,
            @RequestParam(required = false, defaultValue = "2024") Integer season) {
        // Fetch players with team filter
        String url = API_BASE_URL + "/players?team_ids[]=" + teamId + "&per_page=25";

        HttpHeaders headers = new HttpHeaders();
        // headers.set("Authorization", apiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Object.class);

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch team players: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // Get recent games for a team
    @GetMapping("/{teamId}/games")
    public ResponseEntity<?> getTeamRecentGames(@PathVariable Long teamId,
            @RequestParam(required = false, defaultValue = "5") Integer limit) {
        // Call the Python service's team games endpoint
        String url = API_BASE_URL + "/teams/" + teamId + "/games?limit=" + limit;

        HttpHeaders headers = new HttpHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Object.class);

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch team games: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // Get season averages for a specific player
    @GetMapping("/players/{playerId}/stats")
    public ResponseEntity<?> getPlayerSeasonAverages(@PathVariable Long playerId,
            @RequestParam(required = false, defaultValue = "2024") Integer season) {
        String url = API_BASE_URL + "/season_averages?season=" + season + "&player_ids[]=" + playerId;

        HttpHeaders headers = new HttpHeaders();
        // headers.set("Authorization", apiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Object.class);

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch player stats: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
