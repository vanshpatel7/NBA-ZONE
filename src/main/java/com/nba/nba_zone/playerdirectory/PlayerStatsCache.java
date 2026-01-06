package com.nba.nba_zone.playerdirectory;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "player_stats_cache",
        uniqueConstraints = @UniqueConstraint(columnNames = {"nba_player_id", "game_id"})
)
public class PlayerStatsCache {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nba_player_id", nullable = false)
    private Long nbaPlayerId;

    @Column(name = "player_name")
    private String playerName;

    @Column(name = "game_id", nullable = false)
    private Long gameId;

    @Column(name = "game_date")
    private LocalDate gameDate;

    @Column(name = "team_id")
    private Long teamId;

    @Column(name = "team_abbr")
    private String teamAbbr;

    @Column(name = "opponent_abbr")
    private String opponentAbbr;

    @Column(name = "team_score")
    private Double teamScore;

    @Column(name = "opponent_score")
    private Double opponentScore;

    @Column(name = "result_wl")
    private String resultWl;

    private Double min;
    private Double pts;
    private Double reb;
    private Double ast;
    private Double stl;
    private Double blk;
    private Double tov;
    private Double fgm;
    private Double fga;

    @Column(name = "fg_pct")
    private Double fgPct;

    @Column(name = "fg3m")
    private Double fg3m;

    @Column(name = "fg3a")
    private Double fg3a;

    @Column(name = "fg3_pct")
    private Double fg3Pct;

    private Double ftm;
    private Double fta;

    @Column(name = "ft_pct")
    private Double ftPct;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getNbaPlayerId() {
        return nbaPlayerId;
    }

    public void setNbaPlayerId(Long nbaPlayerId) {
        this.nbaPlayerId = nbaPlayerId;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
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

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public String getTeamAbbr() {
        return teamAbbr;
    }

    public void setTeamAbbr(String teamAbbr) {
        this.teamAbbr = teamAbbr;
    }

    public String getOpponentAbbr() {
        return opponentAbbr;
    }

    public void setOpponentAbbr(String opponentAbbr) {
        this.opponentAbbr = opponentAbbr;
    }

    public Double getTeamScore() {
        return teamScore;
    }

    public void setTeamScore(Double teamScore) {
        this.teamScore = teamScore;
    }

    public Double getOpponentScore() {
        return opponentScore;
    }

    public void setOpponentScore(Double opponentScore) {
        this.opponentScore = opponentScore;
    }

    public String getResultWl() {
        return resultWl;
    }

    public void setResultWl(String resultWl) {
        this.resultWl = resultWl;
    }

    public Double getMin() {
        return min;
    }

    public void setMin(Double min) {
        this.min = min;
    }

    public Double getPts() {
        return pts;
    }

    public void setPts(Double pts) {
        this.pts = pts;
    }

    public Double getReb() {
        return reb;
    }

    public void setReb(Double reb) {
        this.reb = reb;
    }

    public Double getAst() {
        return ast;
    }

    public void setAst(Double ast) {
        this.ast = ast;
    }

    public Double getStl() {
        return stl;
    }

    public void setStl(Double stl) {
        this.stl = stl;
    }

    public Double getBlk() {
        return blk;
    }

    public void setBlk(Double blk) {
        this.blk = blk;
    }

    public Double getTov() {
        return tov;
    }

    public void setTov(Double tov) {
        this.tov = tov;
    }

    public Double getFgm() {
        return fgm;
    }

    public void setFgm(Double fgm) {
        this.fgm = fgm;
    }

    public Double getFga() {
        return fga;
    }

    public void setFga(Double fga) {
        this.fga = fga;
    }

    public Double getFgPct() {
        return fgPct;
    }

    public void setFgPct(Double fgPct) {
        this.fgPct = fgPct;
    }

    public Double getFg3m() {
        return fg3m;
    }

    public void setFg3m(Double fg3m) {
        this.fg3m = fg3m;
    }

    public Double getFg3a() {
        return fg3a;
    }

    public void setFg3a(Double fg3a) {
        this.fg3a = fg3a;
    }

    public Double getFg3Pct() {
        return fg3Pct;
    }

    public void setFg3Pct(Double fg3Pct) {
        this.fg3Pct = fg3Pct;
    }

    public Double getFtm() {
        return ftm;
    }

    public void setFtm(Double ftm) {
        this.ftm = ftm;
    }

    public Double getFta() {
        return fta;
    }

    public void setFta(Double fta) {
        this.fta = fta;
    }

    public Double getFtPct() {
        return ftPct;
    }

    public void setFtPct(Double ftPct) {
        this.ftPct = ftPct;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
