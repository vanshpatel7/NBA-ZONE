package com.nba.nba_zone.player;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "api/v1/player")
public class PlayerController {
    private final PlayerService playerService;

    @Autowired
    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public List<Player> getPlayers(
            @RequestParam(required = false) String team,
            @RequestParam(required = false) String age,
            @RequestParam(required = false) String player) {

        if (team != null) {
            return playerService.getPlayersFromTeam(team);
        } else if (age != null) {
            try {
                Double ageValue = Double.parseDouble(age);
                return playerService.getPlayersByAge(ageValue);
            } catch (NumberFormatException e) {
                return List.of(); // Return empty list if age is not a valid number
            }
        } else {
            return playerService.getPlayers();
        }
    }

    @GetMapping("/top")
    public List<Player> getTopPlayers(
            @RequestParam(defaultValue = "pts") String category,
            @RequestParam(required = false) Integer limit) {
        return playerService.getTopPlayers(category, limit);
    }

    @PostMapping
    public ResponseEntity<Player> addPlayer(@RequestBody Player player) {
        Player createdPlayer = playerService.addPlayer(player);
        return new ResponseEntity<>(createdPlayer, HttpStatus.CREATED); // 201 created if created
    }

    @PutMapping
    public ResponseEntity<Player> updatePlayer(@RequestBody Player player) {
        Player resultPlayer = playerService.updatePlayer(player);
        if (resultPlayer != null) {
            return new ResponseEntity<>(resultPlayer, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{playerName}")
    public ResponseEntity<String> deletePlayer(@PathVariable String playerName) {
        playerService.deletePlayer(playerName);
        return new ResponseEntity<>("Player deleted successfully", HttpStatus.OK);
    }
}
