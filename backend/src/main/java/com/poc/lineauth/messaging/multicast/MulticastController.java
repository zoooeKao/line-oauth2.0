package com.poc.lineauth.messaging.multicast;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 對外的 multicast 端點。認證交由 SecurityConfig 的 anyRequest().authenticated()
 * 搭配 JwtAuthFilter 處理。
 * <p>
 * LINE 上游錯誤 {@code LineApiException} 由 {@code LineErrorExceptionHandler}
 * (@RestControllerAdvice) 統一收，本 controller 沒有 multicast 專屬的業務錯誤。
 */
@RestController
@RequestMapping("/api/messages/multicast")
public class MulticastController {

    private final MulticastService service;

    public MulticastController(MulticastService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<MulticastResponse> multicast(@Valid @RequestBody MulticastRequest req) {
        return ResponseEntity.ok(service.multicast(req));
    }
}
