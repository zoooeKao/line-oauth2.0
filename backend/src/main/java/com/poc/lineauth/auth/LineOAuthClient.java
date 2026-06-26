package com.poc.lineauth.auth;

import com.poc.lineauth.config.LineProperties;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Component
public class LineOAuthClient {

    private final LineProperties props;
    private final RestClient http = RestClient.create();

    public LineOAuthClient(LineProperties props) {
        this.props = props;
    }

    public LineTokenResponse exchangeCodeForToken(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("code", code);
        form.add("redirect_uri", props.redirectUri());
        form.add("client_id", props.channelId());
        form.add("client_secret", props.channelSecret());

        return http.post()
                .uri(props.tokenEndpoint())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(LineTokenResponse.class);
    }

    public LineProfile fetchProfile(String accessToken) {
        return http.get()
                .uri(props.profileEndpoint())
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(LineProfile.class);
    }
}
