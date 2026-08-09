package com.poc.lineauth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "line")
public record LineProperties(
        String channelId,
        String channelSecret,
        String redirectUri,
        String authorizeEndpoint,
        String tokenEndpoint,
        String profileEndpoint,
        String friendshipEndpoint,
        String botPrompt,
        String prompt,
        String oaAddFriendUrl
) {}