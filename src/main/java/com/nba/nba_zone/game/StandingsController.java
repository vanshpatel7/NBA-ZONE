package com.nba.nba_zone.game;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/standings")
@CrossOrigin(origins = "*")
public class StandingsController {

    // Python service running on port 5001
    private static final String PYTHON_SERVICE_URL = "http://localhost:5001";
    private final RestTemplate restTemplate;

    public StandingsController() {
        this.restTemplate = new RestTemplate();
    }

    @GetMapping
    public ResponseEntity<?> getStandings() {
        String url = PYTHON_SERVICE_URL + "/standings";
        HttpEntity<String> entity = new HttpEntity<String>(null);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Object.class);

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch standings: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
