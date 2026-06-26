package com.poc.lineauth.user;

import com.poc.lineauth.auth.LineProfile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User upsertFromLineProfile(LineProfile profile) {
        return userRepository.findByLineUserId(profile.userId())
            .map(existing -> {
                existing.setDisplayName(profile.displayName());
                existing.setPictureUrl(profile.pictureUrl());
                return existing;
            })
            .orElseGet(() -> {
                User u = new User();
                u.setLineUserId(profile.userId());
                u.setDisplayName(profile.displayName());
                u.setPictureUrl(profile.pictureUrl());
                return userRepository.save(u);
            });
    }
}
