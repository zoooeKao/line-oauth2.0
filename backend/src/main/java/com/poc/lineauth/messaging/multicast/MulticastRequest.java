package com.poc.lineauth.messaging.multicast;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * 對 {@code POST /api/messages/multicast} 的請求主體。
 *
 * <ul>
 *   <li>{@code lineUserIds}：收件人 LINE userId 陣列，1..500（LINE Multicast API 上限）。</li>
 *   <li>{@code text}：要送出的訊息內容，長度 1..5000。</li>
 * </ul>
 */
public record MulticastRequest(
        @NotEmpty(message = "lineUserIds must contain at least 1 recipient")
        @Size(max = 500, message = "lineUserIds must not exceed 500 recipients")
        List<@Pattern(regexp = "^U[0-9a-f]{32}$",
                message = "each lineUserId must match LINE user id format") String> lineUserIds,

        @NotBlank
        @Size(max = 5000, message = "text must be 1..5000 characters")
        String text
) {}
