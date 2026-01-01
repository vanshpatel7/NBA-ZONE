package com.nba.nba_zone.game;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;

@Service
public class GameService {

    private static final String API_BASE_URL = "http://localhost:5001";

    // API Key no longer needed for local python service wrapper
    // private String apiKey;

    private final RestTemplate restTemplate;

    public GameService() {
        this.restTemplate = new RestTemplate();
    }

    public List<Game> getGamesForDate(LocalDate date) {
        String dateStr = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
        String url = API_BASE_URL + "/games?dates[]=" + dateStr;

        HttpHeaders headers = new HttpHeaders();
        // headers.set("Authorization", apiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<GamesResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    GamesResponse.class);

            if (response.getBody() != null && response.getBody().getData() != null) {
                return response.getBody().getData();
            }
        } catch (Exception e) {
            System.err.println("Error fetching games: " + e.getMessage());
        }

        return Collections.emptyList();
    }

    public List<Game> getTodaysGames() {
        return getGamesForDate(LocalDate.now());
    }

    public List<Game> getGamesForWeek() {
        // Get games for the next 7 days
        LocalDate today = LocalDate.now();
        StringBuilder urlBuilder = new StringBuilder(API_BASE_URL + "/games?");

        for (int i = 0; i < 7; i++) {
            LocalDate date = today.plusDays(i);
            urlBuilder.append("dates[]=").append(date.format(DateTimeFormatter.ISO_LOCAL_DATE));
            if (i < 6)
                urlBuilder.append("&");
        }

        HttpHeaders headers = new HttpHeaders();
        // headers.set("Authorization", apiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<GamesResponse> response = restTemplate.exchange(
                    urlBuilder.toString(),
                    HttpMethod.GET,
                    entity,
                    GamesResponse.class);

            if (response.getBody() != null && response.getBody().getData() != null) {
                return response.getBody().getData();
            }
        } catch (Exception e) {
            System.err.println("Error fetching weekly games: " + e.getMessage());
        }

        return Collections.emptyList();
    }

    public List<Game> getGamesForDateRange(LocalDate startDate, LocalDate endDate) {
        // Build URL with all dates in range
        StringBuilder urlBuilder = new StringBuilder(API_BASE_URL + "/games?");

        LocalDate current = startDate;
        boolean first = true;
        while (!current.isAfter(endDate)) {
            if (!first)
                urlBuilder.append("&");
            urlBuilder.append("dates[]=").append(current.format(DateTimeFormatter.ISO_LOCAL_DATE));
            current = current.plusDays(1);
            first = false;
        }

        HttpHeaders headers = new HttpHeaders();
        // headers.set("Authorization", apiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<GamesResponse> response = restTemplate.exchange(
                    urlBuilder.toString(),
                    HttpMethod.GET,
                    entity,
                    GamesResponse.class);

            if (response.getBody() != null && response.getBody().getData() != null) {
                return response.getBody().getData();
            }
        } catch (Exception e) {
            System.err.println("Error fetching games for date range: " + e.getMessage());
        }

        return Collections.emptyList();
    }

    public Game getGameById(Long gameId) {
        String url = API_BASE_URL + "/games/" + gameId;

        HttpHeaders headers = new HttpHeaders();
        // headers.set("Authorization", apiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Game> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Game.class);

            return response.getBody();
        } catch (Exception e) {
            System.err.println("Error fetching game by ID: " + e.getMessage());
        }

        return null;
    }
}
