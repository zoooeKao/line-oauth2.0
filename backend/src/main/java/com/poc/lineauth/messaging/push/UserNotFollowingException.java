package com.poc.lineauth.messaging.push;

/**
 * 收件人尚未追蹤本專案綁定的官方帳號，無法收到 push message。
 * 由 {@link PushController} 轉換成 HTTP 409，並在回應中附上
 * {@code oaAddFriendUrl} 讓前端可以引導使用者加入好友。
 * <p>
 * multicast 端刻意不做這項本地檢查（未追蹤者由 LINE 靜默略過），
 * 因此這個例外只屬於 push 這條線。
 */
public class UserNotFollowingException extends RuntimeException {
    private final String oaAddFriendUrl;

    public UserNotFollowingException(String oaAddFriendUrl) {
        super("User is not following the official account");
        this.oaAddFriendUrl = oaAddFriendUrl;
    }

    public String getOaAddFriendUrl() {
        return oaAddFriendUrl;
    }
}
