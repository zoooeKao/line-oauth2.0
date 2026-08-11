package com.poc.lineauth.messaging.push;

import org.springframework.stereotype.Component;

import com.poc.lineauth.config.LineProperties;
import com.poc.lineauth.messaging.LineApiException;
import com.poc.lineauth.messaging.LineMessagingHttpSupport;

import java.util.List;
import java.util.Map;

/**
 * 對 LINE Messaging Push API 的最小封裝。
 * 對應官方 API：{@code POST https://api.line.me/v2/bot/message/push}。
 */
@Component
public class PushClient {

    private final LineMessagingHttpSupport http;
    private final LineProperties props;

    public PushClient(LineMessagingHttpSupport http, LineProperties props) {
        this.http = http;
        this.props = props;
    }

    /**
     * 對指定 LINE 使用者送出一則 text 訊息。
     *
     * @param toLineUserId 收件人 LINE userId（{@code U} + 32 hex）
     * @param text         訊息內容，長度不超過 5000
     * @return LINE 回應的 {@code X-Line-Request-Id} header 值，可能為 {@code null}
     * @throws LineApiException 上游回非 2xx 時拋出，攜帶原始狀態碼與 body
     */
    public String pushText(String toLineUserId, String text) {
        Map<String, Object> body = Map.of(
                "to", toLineUserId,
                "messages", List.of(Map.of("type", "text", "text", text))
        );
        return http.postAndGetRequestId(props.pushEndpoint(), body);
    }
}
