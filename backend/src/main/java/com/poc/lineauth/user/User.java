package com.poc.lineauth.user;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "line_id", nullable = false, unique = true)
    private String lineId;

    @Column(name = "line_display_name", nullable = false)
    private String lineDisplayName;

    @Column(name = "line_picture_url")
    private String linePictureUrl;

    @Column(name = "oa_friend_flag", nullable = false)
    @ColumnDefault("false")
    private boolean oaFriendFlag = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getLineId() { return lineId; }
    public void setLineId(String v) { this.lineId = v; }
    public String getLineDisplayName() { return lineDisplayName; }
    public void setLineDisplayName(String v) { this.lineDisplayName = v; }
    public String getLinePictureUrl() { return linePictureUrl; }
    public void setLinePictureUrl(String v) { this.linePictureUrl = v; }
    public boolean isOaFriendFlag() { return oaFriendFlag; }
    public void setOaFriendFlag(boolean v) { this.oaFriendFlag = v; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
