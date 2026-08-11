package com.poc.lineauth.messaging.multicast;

import org.springframework.stereotype.Component;

import com.poc.lineauth.config.LineProperties;
import com.poc.lineauth.messaging.LineApiException;
import com.poc.lineauth.messaging.LineMessagingHttpSupport;

import java.util.List;
import java.util.Map;

/**
 * 對 LINE Messaging Multicast API 的最小封裝。
 * 對應官方 API：{@code POST https://api.line.me/v2/bot/message/multicast}。
 */
@Component
public class MulticastClient {

    private final LineMessagingHttpSupport http;
    private final LineProperties props;

    public MulticastClient(LineMessagingHttpSupport http, LineProperties props) {
        this.http = http;
        this.props = props;
    }

    /**
     * 對多位 LINE 使用者同時送出一則 text 訊息（multicast）。
     * 未追蹤官方帳號的收件人會被 LINE 靜默略過，API 仍會回 200。
     *
     * @param toLineUserIds 收件人 LINE userId 陣列，1..500 且不可重複
     * @param text          訊息內容，長度不超過 5000
     * @return LINE 回應的 {@code X-Line-Request-Id} header 值，可能為 {@code null}
     * @throws LineApiException 上游回非 2xx 時拋出，攜帶原始狀態碼與 body
     */
    public String multicastText(List<String> toLineUserIds, String text) {
        Map<String, Object> body = Map.of(
                "to", toLineUserIds,
                "messages", List.of(Map.of("type", "text", "text", text))
        );
        return http.postAndGetRequestId(props.multicastEndpoint(), body);
    }
}
