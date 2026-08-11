package com.poc.lineauth.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * 收 {@link LineApiException}（呼叫 LINE Messaging API 上游失敗）的統一錯誤處理。
 * <p>
 * push 與 multicast 都會呼叫 LINE 上游，共用同一份錯誤映射：
 * <ul>
 *   <li>400 → 400（payload 或 userId 不合法）</li>
 *   <li>401 → 502（我方 channel access token 設錯，不外洩成 401 讓前端誤判 JWT 過期）</li>
 *   <li>403 → 409（對方未加入好友 / 已封鎖 / 方案不允許）</li>
 *   <li>429 → 429（配額或速率上限）</li>
 *   <li>5xx / 其他 → 502</li>
 * </ul>
 * <p>
 * 用 {@code basePackages} 限定只套用在 messaging 家族的 controller，
 * 不影響 auth / user 那邊各自的錯誤處理。
 */
@RestControllerAdvice(basePackages = "com.poc.lineauth.messaging")
public class LineErrorExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(LineErrorExceptionHandler.class);

    @ExceptionHandler(LineApiException.class)
    public ResponseEntity<Map<String, Object>> handleLineError(LineApiException ex) {
        log.warn("LINE Messaging API returned {}: {}", ex.getStatus(), ex.getBody());
        int upstream = ex.getStatus().value();
        HttpStatus mapped = switch (upstream) {
            case 400 -> HttpStatus.BAD_REQUEST;
            case 401 -> HttpStatus.BAD_GATEWAY;
            case 403 -> HttpStatus.CONFLICT;
            case 429 -> HttpStatus.TOO_MANY_REQUESTS;
            default -> HttpStatus.BAD_GATEWAY;
        };
        return ResponseEntity.status(mapped).body(Map.of(
                "error", "line_api_error",
                "upstreamStatus", upstream,
                "upstreamBody", ex.getBody()
        ));
    }
}
