package com.nba.nba_zone.game;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "*")
public class TeamController {

    @Value("${python.service.url:http://localhost:5001}")
    private String apiBaseUrl;

    private final RestTemplate restTemplate;

    public TeamController() {
        this.restTemplate = new RestTemplate();
    }

    // Get all NBA teams
    @GetMapping
    public ResponseEntity<?> getAllTeams() {
        String url = apiBaseUrl + "/teams";
        HttpHeaders headers = new HttpHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(url, HttpMethod.GET, entity, Object.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return handleError("Failed to fetch teams: " + e.getMessage());
        }
    }

    // Get team by ID
    @GetMapping("/{teamId}")
    public ResponseEntity<?> getTeamById(@PathVariable Long teamId) {
        String url = apiBaseUrl + "/teams/" + teamId;
        HttpHeaders headers = new HttpHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(url, HttpMethod.GET, entity, Object.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return handleError("Failed to fetch team: " + e.getMessage());
        }
    }

    // Get players for a team (current season)
    @GetMapping("/{teamId}/players")
    public ResponseEntity<?> getTeamPlayers(@PathVariable Long teamId,
            @RequestParam(required = false, defaultValue = "2024") Integer season) {
        String url = apiBaseUrl + "/players?team_ids[]=" + teamId + "&per_page=25";
        HttpHeaders headers = new HttpHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(url, HttpMethod.GET, entity, Object.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return handleError("Failed to fetch team players: " + e.getMessage());
        }
    }

    // Get recent games for a team
    @GetMapping("/{teamId}/games")
    public ResponseEntity<?> getTeamRecentGames(@PathVariable Long teamId,
            @RequestParam(required = false, defaultValue = "5") Integer limit) {
        String url = apiBaseUrl + "/teams/" + teamId + "/games?limit=" + limit;
        HttpHeaders headers = new HttpHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(url, HttpMethod.GET, entity, Object.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return handleError("Failed to fetch team games: " + e.getMessage());
        }
    }

    // Get team leaders
    @GetMapping("/{teamId}/leaders")
    public ResponseEntity<?> getTeamLeaders(@PathVariable Long teamId) {
        String url = apiBaseUrl + "/teams/" + teamId + "/leaders";
        HttpHeaders headers = new HttpHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(url, HttpMethod.GET, entity, Object.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return handleError("Failed to fetch team leaders: " + e.getMessage());
        }
    }

    // Get season averages for a specific player
    @GetMapping("/players/{playerId}/stats")
    public ResponseEntity<?> getPlayerSeasonAverages(@PathVariable Long playerId,
            @RequestParam(required = false, defaultValue = "2024") Integer season) {
        String url = apiBaseUrl + "/season_averages?season=" + season + "&player_ids[]=" + playerId;
        HttpHeaders headers = new HttpHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(url, HttpMethod.GET, entity, Object.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return handleError("Failed to fetch player stats: " + e.getMessage());
        }
    }

    private ResponseEntity<?> handleError(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.internalServerError().body(error);
    }
}
