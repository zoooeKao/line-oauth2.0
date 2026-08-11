package com.poc.lineauth.messaging.multicast;

/**
 * {@code POST /api/messages/multicast} 的成功回應。
 * <p>
 * {@code sentTo} 只表示送出的 recipient 數量，並不代表每個人都真的收到 ——
 * 未追蹤官方帳號的人會被 LINE 端靜默略過，我們這裡不會知道。
 */
public record MulticastResponse(String status, String requestId, int sentTo) {
    public static MulticastResponse sent(String requestId, int sentTo) {
        return new MulticastResponse("sent", requestId, sentTo);
    }
}
