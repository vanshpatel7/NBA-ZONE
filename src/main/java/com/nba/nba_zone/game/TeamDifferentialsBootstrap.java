package com.nba.nba_zone.game;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.web.client.RestTemplate;

@Component
public class TeamDifferentialsBootstrap {
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${python.service.url:http://localhost:5001}")
    private String pythonServiceUrl;

    @EventListener(ApplicationReadyEvent.class)
    public void generateTeamDifferentials() {
        String url = pythonServiceUrl + "/team-differentials/refresh";
        HttpEntity<String> entity = new HttpEntity<>(new HttpHeaders());

        for (int attempt = 1; attempt <= 5; attempt++) {
            try {
                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
                if (response.getStatusCode().is2xxSuccessful()) {
                    System.out.println("Team differentials generated on startup.");
                    return;
                }
            } catch (Exception e) {
                System.err.println("Team differentials refresh attempt " + attempt + " failed: " + e.getMessage());
            }

            try {
                Thread.sleep(1500L * attempt);
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
                return;
            }
        }
    }
}
