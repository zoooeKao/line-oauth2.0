package com.poc.lineauth.messaging.push;

/**
 * {@code POST /api/messages/push} 的成功回應。
 * {@code requestId} 對應 LINE 回傳的 {@code X-Line-Request-Id} header，
 * 供後續追蹤或支援單據對照使用。
 */
public record PushResponse(String status, String requestId) {
    public static PushResponse sent(String requestId) {
        return new PushResponse("sent", requestId);
    }
}
