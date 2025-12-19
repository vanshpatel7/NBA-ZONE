package com.nba.nba_zone.player;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.List;

@Repository
public interface PlayerRepository extends JpaRepository<Player, PlayerId> {

    void deleteByName(String playerName);

    Optional<Player> findByName(String name);

    @Query("SELECT p FROM Player p WHERE p.rk IS NOT NULL AND p.team IS NOT NULL")
    List<Player> findValidPlayers();

}
