package com.poc.lineauth.messaging;

import org.springframework.http.HttpStatusCode;

/**
 * 呼叫 LINE Messaging API 時上游回非 2xx 的例外。
 * 保留原始狀態碼與 body 供 controller 記 log 並映射成合適的對外狀態碼。
 */
public class LineApiException extends RuntimeException {
    private final HttpStatusCode status;
    private final String body;

    public LineApiException(HttpStatusCode status, String body) {
        super("LINE Messaging API error: " + status.value() + " " + body);
        this.status = status;
        this.body = body;
    }

    public HttpStatusCode getStatus() {
        return status;
    }

    public String getBody() {
        return body;
    }
}
