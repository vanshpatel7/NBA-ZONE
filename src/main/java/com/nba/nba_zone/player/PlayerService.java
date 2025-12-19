package com.nba.nba_zone.player;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Component
public class PlayerService {
    private final PlayerRepository playerRepository;

    @Autowired
    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    public List<Player> getPlayers() {
        try {
            return playerRepository.findValidPlayers();
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    public List<Player> getPlayersFromTeam(String team) {
        return playerRepository.findValidPlayers().stream()
                .filter(player -> team.equals(player.getTeam()))
                .collect(Collectors.toList());
    }

    public List<Player> getPlayersByName(String searchText) {
        return playerRepository.findValidPlayers().stream()
                .filter(p -> p.getName().toLowerCase().contains(searchText.toLowerCase()))
                .collect(Collectors.toList());
    }

    public List<Player> getPlayersByAge(Double age) {
        return playerRepository.findValidPlayers().stream()
                .filter(p -> p.getAge() != null && p.getAge().equals(age))
                .collect(Collectors.toList());
    }

    public List<Player> getTopPlayers(String category, Integer limit) {
        List<Player> players = playerRepository.findValidPlayers();

        // Sort based on category
        players.sort((p1, p2) -> {
            Double v1 = getStatValue(p1, category);
            Double v2 = getStatValue(p2, category);

            if (v1 == null && v2 == null)
                return 0;
            if (v1 == null)
                return 1;
            if (v2 == null)
                return -1;

            return v2.compareTo(v1); // Descending order
        });

        if (limit == null || limit <= 0 || limit >= players.size()) {
            return players;
        }
        return players.subList(0, limit);
    }

    public Player addPlayer(Player player) {
        playerRepository.save(player);
        return player;
    }

    public Player updatePlayer(Player updatedPlayer) {
        Optional<Player> existingPlayer = playerRepository.findByName(updatedPlayer.getName());

        if (existingPlayer.isPresent()) {
            Player playerToUpdate = existingPlayer.get();
            playerToUpdate.setName(updatedPlayer.getName());
            playerToUpdate.setTeam(updatedPlayer.getTeam());
            playerToUpdate.setAge(updatedPlayer.getAge());

            playerRepository.save(playerToUpdate);
            return playerToUpdate;
        }
        return null; // if nothing was found
    }

    @Transactional
    public void deletePlayer(String player) {
        playerRepository.deleteByName(player);
    }

    private Double getStatValue(Player p, String category) {
        if ("ast".equalsIgnoreCase(category))
            return p.getAst();
        if ("trb".equalsIgnoreCase(category))
            return p.getTrb();
        return p.getPts();
    }
}
