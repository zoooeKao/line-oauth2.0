package com.poc.lineauth.messaging.push;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 對外的 push message 端點。認證交由 SecurityConfig 的 anyRequest().authenticated()
 * 搭配 JwtAuthFilter 處理，故本 controller 只需處理業務錯誤。
 * <p>
 * LINE 上游錯誤 {@code LineApiException} 由 {@code LineErrorExceptionHandler}
 * (@RestControllerAdvice) 統一收，這裡只留 push 專屬的 {@link UserNotFollowingException}。
 */
@RestController
@RequestMapping("/api/messages/push")
public class PushController {

    private final PushService service;

    public PushController(PushService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<PushResponse> push(@Valid @RequestBody PushRequest req) {
        return ResponseEntity.ok(service.push(req));
    }

    @ExceptionHandler(UserNotFollowingException.class)
    public ResponseEntity<Map<String, Object>> handleNotFollowing(UserNotFollowingException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error", "oa_not_followed",
                "message", "User must add the official account as a friend first",
                "oaAddFriendUrl", ex.getOaAddFriendUrl()
        ));
    }
}
