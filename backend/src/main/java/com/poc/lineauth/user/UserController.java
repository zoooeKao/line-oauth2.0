package com.poc.lineauth.user;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 使用者列表相關 endpoint。
 * <p>
 * 目前只提供收件人清單，供前端做 multicast 下拉選單。
 * 依設計決策：即使 {@code officialAccountFollowed=false} 也一併回傳，
 * 讓前端可以顯示追蹤狀態、由使用者自行決定是否包含在名單內。
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/recipients")
    public List<RecipientView> recipients() {
        return userRepository.findAll().stream()
                .map(RecipientView::from)
                .toList();
    }

    public record RecipientView(
            String lineUserId,
            String displayName,
            String pictureUrl,
            boolean officialAccountFollowed
    ) {
        static RecipientView from(User u) {
            return new RecipientView(
                    u.getLineUserId(),
                    u.getDisplayName(),
                    u.getPictureUrl() == null ? "" : u.getPictureUrl(),
                    u.isOfficialAccountFollowed()
            );
        }
    }
}
