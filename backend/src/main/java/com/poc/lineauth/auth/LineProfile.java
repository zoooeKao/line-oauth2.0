package com.poc.lineauth.auth;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record LineProfile(String userId, String displayName, String pictureUrl, String statusMessage) {}
