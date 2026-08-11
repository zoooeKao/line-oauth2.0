package com.poc.lineauth.messaging.push;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.poc.lineauth.config.LineProperties;
import com.poc.lineauth.user.User;
import com.poc.lineauth.user.UserRepository;

/**
 * Push message 的協調層：
 * <ol>
 *   <li>依 {@code lineUserId} 找出 User（找不到 → 404）。</li>
 *   <li>檢查是否追蹤官方帳號（未追蹤 → 409，由 controller 附上邀請連結）。</li>
 *   <li>委派給 {@link PushClient} 呼叫 LINE Messaging API。</li>
 * </ol>
 * <p>
 * multicast 因為刻意不做本地檢查，所以另立一條線；這裡不共用 base class。
 */
@Service
public class PushService {

    private final UserRepository userRepository;
    private final PushClient client;
    private final LineProperties lineProps;

    public PushService(UserRepository userRepository,
                       PushClient client,
                       LineProperties lineProps) {
        this.userRepository = userRepository;
        this.client = client;
        this.lineProps = lineProps;
    }

    public PushResponse push(PushRequest req) {
        User user = userRepository.findByLineUserId(req.lineUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found for lineUserId"));

        if (!user.isOfficialAccountFollowed()) {
            // 本地快取的追蹤狀態只在登入時更新；若使用者事後解除追蹤，
            // 這裡會過關，之後 LINE 端會回 403，由 LineErrorExceptionHandler 轉為 409。
            throw new UserNotFollowingException(lineProps.oaAddFriendUrl());
        }

        String requestId = client.pushText(user.getLineUserId(), req.text());
        return PushResponse.sent(requestId);
    }
}
