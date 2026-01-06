package com.nba.nba_zone.playerdirectory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameUpdateLogRepository extends JpaRepository<GameUpdateLog, Long> {
    boolean existsByGameId(Long gameId);
}
