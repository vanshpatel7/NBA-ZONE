package com.nba.nba_zone.playerdirectory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface PlayerStatsCacheRepository extends JpaRepository<PlayerStatsCache, Long> {
    Optional<PlayerStatsCache> findTopByNbaPlayerIdOrderByGameDateDesc(Long nbaPlayerId);
    List<PlayerStatsCache> findTop5ByNbaPlayerIdOrderByGameDateDesc(Long nbaPlayerId);
    Optional<PlayerStatsCache> findByNbaPlayerIdAndGameId(Long nbaPlayerId, Long gameId);
    List<PlayerStatsCache> findByGameId(Long gameId);
    boolean existsByNbaPlayerIdAndGameId(Long nbaPlayerId, Long gameId);
}
