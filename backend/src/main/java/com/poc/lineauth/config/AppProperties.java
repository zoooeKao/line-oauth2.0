package com.poc.lineauth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(String frontendUrl, Jwt jwt) {
    public record Jwt(String secret, long expiryMinutes) {}
}
