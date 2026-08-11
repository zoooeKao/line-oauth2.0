package com.poc.lineauth.messaging;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.poc.lineauth.config.LineProperties;

import java.util.Map;

/**
 * LINE Messaging API 共用的 HTTP 呼叫支援：
 * <ul>
 *   <li>統一使用 channel access token 做 Bearer 認證。</li>
 *   <li>統一在非 2xx 時拋 {@link LineApiException}，body 帶原始錯誤內容。</li>
 *   <li>統一回傳 {@code X-Line-Request-Id} header 供上層記 log / 對帳。</li>
 * </ul>
 * push 與 multicast 兩個 client 只負責組 payload、指定 endpoint，
 * 送出 / 錯誤處理 / 取 requestId 都委派給這裡。
 */
@Component
public class LineMessagingHttpSupport {

    private final LineProperties props;
    private final RestClient http = RestClient.create();

    public LineMessagingHttpSupport(LineProperties props) {
        this.props = props;
    }

    /**
     * 對 LINE Messaging API 送出 JSON body，成功回傳 {@code X-Line-Request-Id}。
     *
     * @param endpoint LINE 端 URL（來自 {@link LineProperties}）
     * @param body     JSON payload
     * @return LINE 回應的 {@code X-Line-Request-Id}，可能為 {@code null}
     * @throws LineApiException 上游回非 2xx 時拋出
     */
    public String postAndGetRequestId(String endpoint, Map<String, Object> body) {
        return http.post()
                .uri(endpoint)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + props.channelAccessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (req, resp) -> {
                    String errBody = new String(resp.getBody().readAllBytes());
                    throw new LineApiException(resp.getStatusCode(), errBody);
                })
                .toBodilessEntity()
                .getHeaders()
                .getFirst("X-Line-Request-Id");
    }
}
