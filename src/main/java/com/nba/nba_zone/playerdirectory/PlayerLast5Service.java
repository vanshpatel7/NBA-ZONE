package com.nba.nba_zone.playerdirectory;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;

@Service
public class PlayerLast5Service {
    private static final DateTimeFormatter LOG_DATE_FORMAT = DateTimeFormatter.ofPattern("MMM d, yyyy");

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final PlayerStatsCacheRepository playerStatsCacheRepository;

    @Value("${python.service.url:http://localhost:5001}")
    private String pythonServiceUrl;

    @Value("${stats.last5.ttl-hours:6}")
    private long last5TtlHours;

    public PlayerLast5Service(PlayerStatsCacheRepository playerStatsCacheRepository) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.playerStatsCacheRepository = playerStatsCacheRepository;
    }

    public List<PlayerStatsCache> getLast5(Long playerId) {
        List<PlayerStatsCache> cached = playerStatsCacheRepository.findTop5ByNbaPlayerIdOrderByGameDateDesc(playerId);
        if (needsRefresh(cached)) {
            refreshFromPython(playerId);
            cached = playerStatsCacheRepository.findTop5ByNbaPlayerIdOrderByGameDateDesc(playerId);
        }
        return cached;
    }

    private boolean needsRefresh(List<PlayerStatsCache> cached) {
        if (cached.size() < 5) {
            return true;
        }
        LocalDateTime newestUpdate = cached.stream()
                .map(PlayerStatsCache::getUpdatedAt)
                .filter(value -> value != null)
                .max(LocalDateTime::compareTo)
                .orElse(null);
        if (newestUpdate == null) {
            return true;
        }
        return newestUpdate.isBefore(LocalDateTime.now().minusHours(last5TtlHours));
    }

    private void refreshFromPython(Long playerId) {
        try {
            String url = pythonServiceUrl + "/players/" + playerId + "/gamelog?limit=5";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (response.getBody() == null || response.getBody().isEmpty()) {
                return;
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode games = root.path("games");
            if (!games.isArray()) {
                return;
            }

            for (JsonNode gameNode : games) {
                Long gameId = parseLong(gameNode.path("game_id").asText());
                if (gameId == null) {
                    continue;
                }

                Optional<PlayerStatsCache> existing = playerStatsCacheRepository
                        .findByNbaPlayerIdAndGameId(playerId, gameId);
                PlayerStatsCache cache = existing.orElseGet(PlayerStatsCache::new);

                cache.setNbaPlayerId(playerId);
                cache.setGameId(gameId);
                cache.setPlayerName(gameNode.path("player_name").asText(null));

                String gameDateText = gameNode.path("game_date").asText(null);
                cache.setGameDate(parseGameDate(gameDateText));

                String matchup = gameNode.path("matchup").asText("");
                cache.setOpponentAbbr(parseOpponent(matchup));
                cache.setTeamAbbr(parseTeam(matchup));

                String wl = gameNode.path("wl").asText(null);
                cache.setResultWl(wl != null ? wl.toUpperCase() : null);

                cache.setMin(parseDouble(gameNode.path("min").asText()));
                cache.setPts(parseDouble(gameNode.path("pts").asText()));
                cache.setReb(parseDouble(gameNode.path("reb").asText()));
                cache.setAst(parseDouble(gameNode.path("ast").asText()));
                cache.setStl(parseDouble(gameNode.path("stl").asText()));
                cache.setBlk(parseDouble(gameNode.path("blk").asText()));
                cache.setFgm(parseDouble(gameNode.path("fgm").asText()));
                cache.setFga(parseDouble(gameNode.path("fga").asText()));
                cache.setFgPct(parseDouble(gameNode.path("fg_pct").asText()));

                playerStatsCacheRepository.save(cache);
            }
        } catch (Exception e) {
            System.err.println("Failed to refresh last 5 for player " + playerId + ": " + e.getMessage());
        }
    }

    private LocalDate parseGameDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value, LOG_DATE_FORMAT);
        } catch (DateTimeParseException e) {
            try {
                return LocalDate.parse(value);
            } catch (DateTimeParseException ignored) {
                return null;
            }
        }
    }

    private String parseOpponent(String matchup) {
        if (matchup == null || matchup.isBlank()) {
            return null;
        }
        String[] parts = matchup.trim().split("\\s+");
        return parts.length > 0 ? parts[parts.length - 1] : null;
    }

    private String parseTeam(String matchup) {
        if (matchup == null || matchup.isBlank()) {
            return null;
        }
        String[] parts = matchup.trim().split("\\s+");
        return parts.length > 0 ? parts[0] : null;
    }

    private Long parseLong(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Double parseDouble(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
