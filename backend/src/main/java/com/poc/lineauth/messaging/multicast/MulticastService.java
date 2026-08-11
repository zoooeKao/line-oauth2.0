package com.poc.lineauth.messaging.multicast;

import org.springframework.stereotype.Service;

/**
 * Multicast 的協調層。
 * <p>
 * 依照設計決策：這裡不預先過濾未追蹤者，直接把整個名單交給 LINE。
 * 未追蹤者會被 LINE 靜默略過；若要即時同步追蹤狀態，得再接 follow/unfollow webhook。
 * <p>
 * 因此這條線刻意保持極薄，跟 {@code PushService} 不共用 base class。
 */
@Service
public class MulticastService {

    private final MulticastClient client;

    public MulticastService(MulticastClient client) {
        this.client = client;
    }

    public MulticastResponse multicast(MulticastRequest req) {
        String requestId = client.multicastText(req.lineUserIds(), req.text());
        return MulticastResponse.sent(requestId, req.lineUserIds().size());
    }
}
