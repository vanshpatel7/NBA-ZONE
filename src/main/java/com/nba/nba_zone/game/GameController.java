package com.nba.nba_zone.game;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "*")
public class GameController {

    @Autowired
    private GameService gameService;

    @GetMapping
    public ResponseEntity<?> getGames(
            @RequestParam(required = false) String date,
            @RequestParam(required = false, defaultValue = "today") String filter,
            @RequestParam(required = false) String start_date,
            @RequestParam(required = false) String end_date) {

        try {
            List<Game> games;

            if (date != null && !date.isEmpty()) {
                // Specific date requested
                LocalDate requestedDate = LocalDate.parse(date, DateTimeFormatter.ISO_LOCAL_DATE);
                games = gameService.getGamesForDate(requestedDate);
            } else if (start_date != null && end_date != null) {
                // Date range requested (for "all" filter)
                LocalDate startDate = LocalDate.parse(start_date, DateTimeFormatter.ISO_LOCAL_DATE);
                LocalDate endDate = LocalDate.parse(end_date, DateTimeFormatter.ISO_LOCAL_DATE);
                games = gameService.getGamesForDateRange(startDate, endDate);
            } else if ("week".equalsIgnoreCase(filter)) {
                // Get games for the week
                games = gameService.getGamesForWeek();
            } else {
                // Default: today's games
                games = gameService.getTodaysGames();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("games", games);
            response.put("count", games.size());
            response.put("date", date != null ? date : LocalDate.now().toString());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch games: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/today")
    public ResponseEntity<?> getTodaysGames() {
        try {
            List<Game> games = gameService.getTodaysGames();

            Map<String, Object> response = new HashMap<>();
            response.put("games", games);
            response.put("count", games.size());
            response.put("date", LocalDate.now().toString());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch today's games: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<?> getGameById(@PathVariable Long gameId) {
        try {
            Game game = gameService.getGameById(gameId);

            if (game == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Game not found");
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(game);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch game: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
