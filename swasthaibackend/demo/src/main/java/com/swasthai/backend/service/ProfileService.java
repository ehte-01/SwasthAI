package com.swasthai.backend.service;

import com.swasthai.backend.model.UserProfile;
import com.swasthai.backend.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    @Autowired
    private UserProfileRepository profileRepository;

    public UserProfile getProfile(String userId) {
        return profileRepository.findByUserId(userId).orElse(null);
    }

    @Transactional
    public UserProfile saveProfile(UserProfile profile) {
        profileRepository.findByUserId(profile.getUserId())
                .ifPresent(existing -> profile.setId(existing.getId()));
        return profileRepository.save(profile);
    }

    @Transactional
    public void deleteProfile(String userId) {
        profileRepository.deleteByUserId(userId);
    }
}