package com.nba.nba_zone.playerdirectory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.text.Normalizer;
import java.util.Locale;

@RestController
@RequestMapping("/api/players")
@CrossOrigin(origins = "*")
public class PlayerDirectoryController {
    private final PlayerDirectoryRepository playerDirectoryRepository;
    private final PlayerStatsCacheRepository playerStatsCacheRepository;
    private final PlayerLast5Service playerLast5Service;

    @Autowired
    public PlayerDirectoryController(PlayerDirectoryRepository playerDirectoryRepository,
                                     PlayerStatsCacheRepository playerStatsCacheRepository,
                                     PlayerLast5Service playerLast5Service) {
        this.playerDirectoryRepository = playerDirectoryRepository;
        this.playerStatsCacheRepository = playerStatsCacheRepository;
        this.playerLast5Service = playerLast5Service;
    }

    @GetMapping
    public List<PlayerDirectory> getPlayers(
            @RequestParam(required = false, defaultValue = "true") boolean activeOnly) {
        if (activeOnly) {
            return playerDirectoryRepository.findByActiveTrueOrderByLastNameAsc();
        }
        return playerDirectoryRepository.findAll();
    }

    @GetMapping("/{playerId}")
    public ResponseEntity<PlayerDirectory> getPlayer(@PathVariable Long playerId) {
        return playerDirectoryRepository.findById(playerId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{playerId}/stats")
    public ResponseEntity<PlayerStatsCache> getLatestStats(@PathVariable Long playerId) {
        return playerStatsCacheRepository.findTopByNbaPlayerIdOrderByGameDateDesc(playerId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{playerId}/last5")
    public List<PlayerStatsCache> getLast5Games(@PathVariable Long playerId) {
        return playerLast5Service.getLast5(playerId);
    }

    @GetMapping("/lookup")
    public ResponseEntity<PlayerDirectory> lookupByName(@RequestParam String name) {
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Optional<PlayerDirectory> match = playerDirectoryRepository.findByFullNameIgnoreCase(trimmed);
        if (match.isPresent()) {
            return ResponseEntity.ok(match.get());
        }

        String normalized = normalizeName(trimmed);
        String[] parts = trimmed.split("\\s+");
        String lastName = parts.length > 1 ? parts[parts.length - 1] : trimmed;

        List<PlayerDirectory> candidates = playerDirectoryRepository.findByFullNameContainingIgnoreCase(lastName);
        for (PlayerDirectory candidate : candidates) {
            if (normalizeName(candidate.getFullName()).equals(normalized)) {
                return ResponseEntity.ok(candidate);
            }
        }

        return ResponseEntity.notFound().build();
    }

    private String normalizeName(String value) {
        if (value == null) {
            return "";
        }
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return normalized.toLowerCase(Locale.US);
    }
}
