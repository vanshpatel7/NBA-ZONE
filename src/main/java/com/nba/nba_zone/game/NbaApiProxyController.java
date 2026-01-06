package com.nba.nba_zone.game;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

/**
 * Controller to proxy NBA API requests to the Python service.
 * Handles usage rates and other player analytics endpoints.
 */
@RestController
@RequestMapping("/api/nba")
@CrossOrigin(origins = "*")
public class NbaApiProxyController {

    @Value("${python.service.url:http://localhost:5001}")
    private String pythonServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Get usage rates (USG%, AST%, REB%, TOV%) for a player.
     * Proxies to Python service which calculates using NBA-standard formulas.
     */
    @GetMapping("/players/{playerId}/usage-rates")
    public ResponseEntity<String> getPlayerUsageRates(
            @PathVariable Long playerId,
            @RequestParam(required = false) String season) {
        try {
            String url = pythonServiceUrl + "/players/" + playerId + "/usage-rates";
            if (season != null && !season.isEmpty()) {
                url += "?season=" + season;
            }

            String response = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("{\"error\": \"Failed to fetch usage rates: " + e.getMessage() + "\"}");
        }
    }
}
