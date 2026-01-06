package com.nba.nba_zone.playerdirectory;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class PlayerStatsRefreshService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final GameUpdateLogRepository gameUpdateLogRepository;
    private final PlayerStatsCacheRepository playerStatsCacheRepository;

    @Value("${python.service.url:http://localhost:5001}")
    private String pythonServiceUrl;

    public PlayerStatsRefreshService(GameUpdateLogRepository gameUpdateLogRepository,
                                     PlayerStatsCacheRepository playerStatsCacheRepository) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.gameUpdateLogRepository = gameUpdateLogRepository;
        this.playerStatsCacheRepository = playerStatsCacheRepository;
    }

    @Scheduled(fixedDelayString = "${stats.refresh.interval-ms:3600000}")
    public void refreshFinalGameStats() {
        try {
            String url = pythonServiceUrl + "/games/finals";
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
                String dateText = gameNode.path("game_date").asText();
                LocalDate gameDate = dateText == null || dateText.isBlank()
                        ? null
                        : LocalDate.parse(dateText, DATE_FORMATTER);

                if (gameId == null || gameUpdateLogRepository.existsByGameId(gameId)) {
                    continue;
                }

                processGameStats(gameId, gameDate);
            }
        } catch (Exception e) {
            System.err.println("Stats refresh failed: " + e.getMessage());
        }
    }

    private void processGameStats(Long gameId, LocalDate gameDate) {
        try {
            String url = pythonServiceUrl + "/games/" + gameId + "/boxscore";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (response.getBody() == null || response.getBody().isEmpty()) {
                return;
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode players = root.path("players");
            JsonNode teams = root.path("teams");
            if (!players.isArray()) {
                return;
            }

            Map<Long, TeamScoreInfo> teamScores = new HashMap<>();
            if (teams.isArray()) {
                for (JsonNode teamNode : teams) {
                    Long teamId = parseLong(teamNode.path("team_id").asText());
                    String teamAbbr = teamNode.path("team_abbr").asText(null);
                    Double pts = teamNode.path("pts").isMissingNode() ? null : teamNode.path("pts").asDouble();
                    if (teamId != null) {
                        teamScores.put(teamId, new TeamScoreInfo(teamId, teamAbbr, pts));
                    }
                }
            }

            for (JsonNode playerNode : players) {
                Long playerId = parseLong(playerNode.path("player_id").asText());
                if (playerId == null || playerStatsCacheRepository.existsByNbaPlayerIdAndGameId(playerId, gameId)) {
                    continue;
                }

                PlayerStatsCache cache = new PlayerStatsCache();
                cache.setNbaPlayerId(playerId);
                cache.setPlayerName(playerNode.path("player_name").asText(null));
                cache.setGameId(gameId);
                cache.setGameDate(gameDate);
                Long teamId = parseLong(playerNode.path("team_id").asText());
                cache.setTeamId(teamId);
                cache.setTeamAbbr(playerNode.path("team_abbr").asText(null));

                if (teamId != null && teamScores.size() == 2) {
                    TeamScoreInfo teamInfo = teamScores.get(teamId);
                    TeamScoreInfo opponentInfo = teamScores.values().stream()
                            .filter(info -> !info.teamId.equals(teamId))
                            .findFirst()
                            .orElse(null);
                    if (teamInfo != null) {
                        cache.setTeamScore(teamInfo.points);
                        cache.setTeamAbbr(teamInfo.teamAbbr);
                    }
                    if (opponentInfo != null) {
                        cache.setOpponentScore(opponentInfo.points);
                        cache.setOpponentAbbr(opponentInfo.teamAbbr);
                    }
                }

                cache.setMin(playerNode.path("min").isMissingNode() ? null : playerNode.path("min").asDouble());
                cache.setPts(playerNode.path("pts").isMissingNode() ? null : playerNode.path("pts").asDouble());
                cache.setReb(playerNode.path("reb").isMissingNode() ? null : playerNode.path("reb").asDouble());
                cache.setAst(playerNode.path("ast").isMissingNode() ? null : playerNode.path("ast").asDouble());
                cache.setStl(playerNode.path("stl").isMissingNode() ? null : playerNode.path("stl").asDouble());
                cache.setBlk(playerNode.path("blk").isMissingNode() ? null : playerNode.path("blk").asDouble());
                cache.setTov(playerNode.path("tov").isMissingNode() ? null : playerNode.path("tov").asDouble());
                cache.setFgm(playerNode.path("fgm").isMissingNode() ? null : playerNode.path("fgm").asDouble());
                cache.setFga(playerNode.path("fga").isMissingNode() ? null : playerNode.path("fga").asDouble());
                cache.setFgPct(playerNode.path("fg_pct").isMissingNode() ? null : playerNode.path("fg_pct").asDouble());
                cache.setFg3m(playerNode.path("fg3m").isMissingNode() ? null : playerNode.path("fg3m").asDouble());
                cache.setFg3a(playerNode.path("fg3a").isMissingNode() ? null : playerNode.path("fg3a").asDouble());
                cache.setFg3Pct(playerNode.path("fg3_pct").isMissingNode() ? null : playerNode.path("fg3_pct").asDouble());
                cache.setFtm(playerNode.path("ftm").isMissingNode() ? null : playerNode.path("ftm").asDouble());
                cache.setFta(playerNode.path("fta").isMissingNode() ? null : playerNode.path("fta").asDouble());
                cache.setFtPct(playerNode.path("ft_pct").isMissingNode() ? null : playerNode.path("ft_pct").asDouble());

                playerStatsCacheRepository.save(cache);
            }

            gameUpdateLogRepository.save(new GameUpdateLog(gameId, gameDate));
        } catch (Exception e) {
            System.err.println("Failed to process game " + gameId + ": " + e.getMessage());
        }
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

    private static class TeamScoreInfo {
        private final Long teamId;
        private final String teamAbbr;
        private final Double points;

        private TeamScoreInfo(Long teamId, String teamAbbr, Double points) {
            this.teamId = teamId;
            this.teamAbbr = teamAbbr;
            this.points = points;
        }
    }
}
