package com.poc.lineauth.auth;

import com.poc.lineauth.config.AppProperties;
import com.poc.lineauth.config.LineProperties;
import com.poc.lineauth.user.User;
import com.poc.lineauth.user.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    private static final String STATE_COOKIE = "line_oauth_state";
    private static final SecureRandom RNG = new SecureRandom();

    private final LineProperties lineProps;
    private final AppProperties appProps;
    private final LineOAuthClient lineClient;
    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(LineProperties lineProps, AppProperties appProps,
                        LineOAuthClient lineClient, UserService userService, JwtService jwtService) {
        this.lineProps = lineProps;
        this.appProps = appProps;
        this.lineClient = lineClient;
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @GetMapping("/auth/line/authorize")
    public RedirectView authorize(HttpServletResponse response) {
        String state = randomToken();
        Cookie cookie = new Cookie(STATE_COOKIE, state);
        cookie.setHttpOnly(true);
        cookie.setPath("/api/auth/line");
        cookie.setMaxAge(600);
        // SameSite=Lax 對於跨網域 OAuth redirect 是必要的，因為 LINE 會 302 帶 query 回來（top-level navigation）
        response.addCookie(cookie);

        String url = UriComponentsBuilder.fromHttpUrl(lineProps.authorizeEndpoint())
                .queryParam("response_type", "code")
                .queryParam("client_id", lineProps.channelId())
                .queryParam("redirect_uri", lineProps.redirectUri())
                .queryParam("state", state)
                .queryParam("scope", "profile openid")
                // bot_prompt 讓授權畫面出現「加入官方帳號」選項（需在 Console 綁定 Linked OA）
                .queryParam("bot_prompt", lineProps.botPrompt())
                // prompt=consent 強制重新顯示同意授權畫面，避免已授權者被跳過而看不到加好友 toggle
                .queryParam("prompt", lineProps.prompt())
                .encode()
                .build()
                .toUriString();
        return new RedirectView(url);
    }

    @GetMapping("/auth/line/callback")
    public RedirectView callback(@RequestParam(required = false) String code,
                                @RequestParam(required = false) String state,
                                @RequestParam(required = false) String error,
                                @RequestParam(name = "error_description", required = false) String errorDescription,
                                @RequestParam(name = "friendship_status_changed", required = false) String friendshipStatusChanged,
                                HttpServletRequest request,
                                HttpServletResponse response) {
        if (error != null) {
            return redirectToFrontendError("line_" + error, errorDescription);
        }
        if (code == null || state == null) {
            return redirectToFrontendError("missing_params", null);
        }

        String cookieState = extractStateCookie(request);
        clearStateCookie(response);
        if (cookieState == null || !cookieState.equals(state)) {
            return redirectToFrontendError("invalid_state", null);
        }

        try {
            LineTokenResponse token = lineClient.exchangeCodeForToken(code);
            // scope=openid 時 token endpoint 已回 id_token，其中 sub/name/picture 即 profile，省一次 /v2/profile
            LineProfile profile = lineClient.parseIdToken(token.idToken());
            // friendship_status_changed 只代表本次是否有變動；當下好友狀態以 Friendship API 為準
            boolean isFriend = lineClient.isFriend(token.accessToken());
            User user = userService.upsertFromLineProfile(profile, isFriend);
            String jwt = jwtService.issue(user);

            String redirect = UriComponentsBuilder.fromHttpUrl(appProps.frontendUrl() + "/auth/callback")
                    .queryParam("token", jwt)
                    .build()
                    .toUriString();
            return new RedirectView(redirect);
        } catch (Exception e) {
            return redirectToFrontendError("exchange_failed", e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "lineId", user.getLineId(),
                "lineDisplayName", user.getLineDisplayName(),
                "linePictureUrl", user.getLinePictureUrl() == null ? "" : user.getLinePictureUrl(),
                "oaFriendFlag", user.isOaFriendFlag(),
                "oaAddFriendUrl", lineProps.oaAddFriendUrl()
        ));
    }

    private RedirectView redirectToFrontendError(String code, String description) {
        var builder = UriComponentsBuilder.fromHttpUrl(appProps.frontendUrl() + "/auth/callback")
                .queryParam("error", code);
        if (description != null) {
            builder.queryParam("error_description", URLEncoder.encode(description, StandardCharsets.UTF_8));
        }
        return new RedirectView(builder.build().toUriString());
    }

    private String extractStateCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie c : request.getCookies()) {
            if (STATE_COOKIE.equals(c.getName())) return c.getValue();
        }
        return null;
    }

    private void clearStateCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(STATE_COOKIE, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/api/auth/line");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private static String randomToken() {
        byte[] buf = new byte[32];
        RNG.nextBytes(buf);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
    }
}
