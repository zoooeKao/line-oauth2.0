package com.poc.lineauth.messaging.push;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 對 {@code POST /api/messages/push} 的請求主體。
 *
 * <ul>
 *   <li>{@code lineId}：LINE 使用者 ID，格式為 {@code U} 加 32 個十六進位字元。</li>
 *   <li>{@code text}：要送出的訊息內容，長度 1..5000（LINE Messaging API 上限）。</li>
 * </ul>
 */
public record PushRequest(
        @NotBlank
        @Pattern(regexp = "^U[0-9a-f]{32}$", message = "lineId must match LINE user id format")
        String lineId,

        @NotBlank
        @Size(max = 5000, message = "text must be 1..5000 characters")
        String text
) {}
