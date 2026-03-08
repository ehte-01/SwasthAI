package com.swasthai.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/api/predict")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class PredictionController {

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // ── Diabetes ──────────────────────────────────────────────────────────────
    @PostMapping("/diabetes")
    public ResponseEntity<?> predictDiabetes(@RequestBody Map<String, Object> request) {
        return forwardToML("/predict/diabetes", request);
    }

    // ── Heart Disease ─────────────────────────────────────────────────────────
    @PostMapping("/heart")
    public ResponseEntity<?> predictHeart(@RequestBody Map<String, Object> request) {
        return forwardToML("/predict/heart", request);
    }

    // ── Parkinsons ────────────────────────────────────────────────────────────
    @PostMapping("/parkinsons")
    public ResponseEntity<?> predictParkinsons(@RequestBody Map<String, Object> request) {
        return forwardToML("/predict/parkinsons", request);
    }

    // ── Health check ──────────────────────────────────────────────────────────
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return forwardToML("/health", null);
    }

    // ── Helper: forward request to FastAPI ML service ─────────────────────────
    private ResponseEntity<?> forwardToML(String endpoint, Map<String, Object> body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String url = mlServiceUrl + endpoint;

            if (body == null) {
                // GET request
                ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
                return ResponseEntity.ok(response.getBody());
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "ML service error: " + e.getMessage()));
        }
    }
}
