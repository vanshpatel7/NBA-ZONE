package com.nba.nba_zone.playerdirectory;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_update_log")
public class GameUpdateLog {
    @Id
    @Column(name = "game_id")
    private Long gameId;

    @Column(name = "game_date")
    private LocalDate gameDate;

    @Column(name = "processed_at", nullable = false, updatable = false)
    private LocalDateTime processedAt;

    @PrePersist
    protected void onCreate() {
        processedAt = LocalDateTime.now();
    }

    public GameUpdateLog() {
    }

    public GameUpdateLog(Long gameId, LocalDate gameDate) {
        this.gameId = gameId;
        this.gameDate = gameDate;
    }

    public Long getGameId() {
        return gameId;
    }

    public void setGameId(Long gameId) {
        this.gameId = gameId;
    }

    public LocalDate getGameDate() {
        return gameDate;
    }

    public void setGameDate(LocalDate gameDate) {
        this.gameDate = gameDate;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }
}
