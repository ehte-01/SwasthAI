package com.swasthai.backend.controller;

import com.swasthai.backend.model.UserProfile;
import com.swasthai.backend.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    // ── Get profile ───────────────────────────────────────────────────────────
    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable String userId) {
        try {
            UserProfile profile = profileService.getProfile(userId);
            if (profile == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Save / update profile ─────────────────────────────────────────────────
    @PostMapping("/save")
    public ResponseEntity<?> saveProfile(@RequestBody UserProfile profile) {
        try {
            UserProfile saved = profileService.saveProfile(profile);
            return ResponseEntity.ok(Map.of(
                    "message", "Profile saved successfully",
                    "profile", saved
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Delete profile ────────────────────────────────────────────────────────
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteProfile(@PathVariable String userId) {
        try {
            profileService.deleteProfile(userId);
            return ResponseEntity.ok(Map.of("message", "Profile deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}