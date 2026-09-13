package com.poc.lineauth.auth;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.poc.lineauth.config.LineProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class LineOAuthClient {

    private final LineProperties props;
    private final RestClient http = RestClient.create();
    private final SecretKey idTokenKey;

    public LineOAuthClient(LineProperties props) {
        this.props = props;
        // LINE id_token 以 channel_secret 為 HS256 HMAC 金鑰簽章
        this.idTokenKey = Keys.hmacShaKeyFor(props.channelSecret().getBytes(StandardCharsets.UTF_8));
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

    /**
     * 驗證並解析 LINE OIDC id_token，取出 sub / name / picture 映射為 {@link LineProfile}。
     * scope 含 openid 時，token endpoint 會一併回 id_token；因此可省略 /v2/profile 呼叫。
     */
    public LineProfile parseIdToken(String idToken) {
        Claims claims = Jwts.parser()
                .verifyWith(idTokenKey)
                .requireIssuer("https://access.line.me")
                .requireAudience(props.channelId())
                .build()
                .parseSignedClaims(idToken)
                .getPayload();
        return new LineProfile(
                claims.getSubject(),
                claims.get("name", String.class),
                claims.get("picture", String.class),
                null
        );
    }

    /**
     * 查詢使用者目前是否為已連結官方帳號的好友。
     * friendFlag=true 代表已加入官方帳號。
     */
    public boolean isFriend(String accessToken) {
        FriendshipStatus status = http.get()
                .uri(props.friendshipEndpoint())
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(FriendshipStatus.class);
        return status != null && status.friendFlag();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record FriendshipStatus(@JsonProperty("friendFlag") boolean friendFlag) {}
}
