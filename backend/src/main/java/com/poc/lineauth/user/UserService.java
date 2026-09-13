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
    public User upsertFromLineProfile(LineProfile profile, boolean oaFriendFlag) {
        return userRepository.findByLineId(profile.userId())
            .map(existing -> {
                existing.setLineDisplayName(profile.displayName());
                existing.setLinePictureUrl(profile.pictureUrl());
                existing.setOaFriendFlag(oaFriendFlag);
                return existing;
            })
            .orElseGet(() -> {
                User u = new User();
                u.setLineId(profile.userId());
                u.setLineDisplayName(profile.displayName());
                u.setLinePictureUrl(profile.pictureUrl());
                u.setOaFriendFlag(oaFriendFlag);
                return userRepository.save(u);
            });
    }
}
