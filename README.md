# LINE OAuth 2.0 POC

最小驗證：點 LINE 登入 → OAuth → 後端簽 JWT → 前端導向商品列表頁。

## 技術棧

- Frontend: React 18 + TypeScript + Vite + Tailwind + TanStack Query
- Backend: Java 21 + Spring Boot 3.x + Spring Security 6 + JPA
- DB: PostgreSQL 16
- 環境: Docker Compose

## 開啟前

1. LINE Developers Console 加入 Callback URL：
   `http://localhost:8080/api/auth/line/callback`
2. `.env` 已預填本次測試用 channel secret 與 JWT secret（POC 用，勿提交）

## 啟動

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Postgres: localhost:5432 (poc / poc / lineauth)

## 驗證流程

1. 開 http://localhost:5173 → 看到登入頁
2. 點「使用 LINE 登入」→ 跳轉 LINE → 同意
3. 自動導回 `/products`，顯示 LINE 名稱與頭像
4. DevTools → Application → Local Storage 看到 `token`
5. DevTools → Network 看 `/api/me` 帶 `Authorization: Bearer ...`
6. `docker compose exec postgres psql -U poc -d lineauth -c "select * from users;"` 看到 user

## 停止

```bash
docker compose down          # 保留資料
docker compose down -v       # 清掉 Postgres volume
```

## 資料庫

目前只有一張表 `users`,由 JPA 以 `ddl-auto: update` 自動建立(對應 `backend/src/main/java/com/poc/lineauth/user/User.java`)。

| 欄位 | 型別 | 約束 | 說明 |
|---|---|---|---|
| `id` | `BIGSERIAL` | PK, `IDENTITY` | 內部主鍵,簽 JWT 時放在 `sub` |
| `line_id` | `VARCHAR` | `NOT NULL`, `UNIQUE` | LINE id_token 的 `sub`,查詢與 push 目標 |
| `line_display_name` | `VARCHAR` | `NOT NULL` | LINE id_token 的 `name`,每次登入 upsert 覆寫 |
| `line_picture_url` | `VARCHAR` | 可 null | LINE id_token 的 `picture` |
| `oa_friend_flag` | `BOOLEAN` | `NOT NULL`, default `false` | 登入時透過 Friendship API 抓,決定能否 push |
| `created_at` | `TIMESTAMP` | `NOT NULL`, 不可 update | `@PrePersist` 寫入 |
| `updated_at` | `TIMESTAMP` | `NOT NULL` | `@PreUpdate` 更新 |

對應 DDL(Hibernate 依 `SpringPhysicalNamingStrategy` 產出的形式):

```sql
CREATE TABLE users (
    id                          BIGSERIAL PRIMARY KEY,
    line_id                     VARCHAR(255) NOT NULL UNIQUE,
    line_display_name           VARCHAR(255) NOT NULL,
    line_picture_url            VARCHAR(255),
    oa_friend_flag         BOOLEAN NOT NULL DEFAULT false,
    created_at                  TIMESTAMP NOT NULL,
    updated_at                  TIMESTAMP NOT NULL
);
```

其他資料(商品、JWT、訊息送出紀錄)目前都不入庫:商品是前端 `ProductsPage.tsx` 硬編、JWT 為無狀態、訊息 push 完只回 `requestId` 不留存。

## 前端 → 後端 API 一覽

前端所有 API 呼叫集中透過 `frontend/src/lib/api.ts` 的 axios instance,`baseURL = VITE_API_BASE`(預設 `http://localhost:8080`)。攔截器統一處理兩件事:

- **Request interceptor**:自動從 `localStorage.auth_token` 取 JWT 加上 `Authorization: Bearer <jwt>`
- **Response interceptor**:遇到 `401` 清掉 token 並導回 `/login`

授權入口 `/api/auth/line/authorize` 例外 — 用 `window.location.href` 整頁跳轉(因為後端會 302 帶去 LINE,axios 的 XHR 吃不到跨網域 redirect)。

| # | Method + 路徑 | 呼叫者 | Auth | 用途 |
|---|---|---|---|---|
| 1 | `GET /api/auth/line/authorize` | `LoginPage.tsx` (整頁 `window.location.href`) | 無 | 觸發後端種 `line_oauth_state` cookie 並 302 到 LINE authorize 頁 |
| 2 | `GET /api/auth/line/callback?code&state&friendship_status_changed` | **由 LINE 302 觸發**,非前端主動打 | 無(靠 cookie state 比對) | 後端換 token(access_token + id_token)、驗章解析 id_token 取 profile、查 friendship、upsert user、簽 JWT,再 302 到前端 `/auth/callback?token=JWT` |
| 3 | `GET /api/me` | `ProductsPage.tsx` (TanStack Query `['me']`) | Bearer JWT | 取當前使用者資料 + `oaAddFriendUrl`,決定是否顯示「加入官方帳號」提示 |
| 4 | `GET /api/users/recipients` | `ProductsPage.tsx` BroadcastSection (TanStack Query `['recipients']`) | Bearer JWT | 撈 multicast 下拉選單清單(含未追蹤者,由前端標示) |
| 5 | `POST /api/messages/multicast` | `ProductsPage.tsx` BroadcastSection (`useMutation`) | Bearer JWT | body: `{ lineIds: string[], text: string }`,批次送 LINE 訊息 |

⚠️ 後端 `POST /api/messages/push` 目前**前端沒使用**,是預留給未來一對一個人化通知(訂單、驗證碼等)的接口 — 相較 multicast,它會先擋未追蹤者並回 `409 oa_not_followed` + `oaAddFriendUrl` 引導加好友。

> `/auth/callback` 是**前端 React Router 路由**(`AuthCallback.tsx`),不是後端 API — 它只負責把 URL query 裡的 `token` 塞進 `localStorage` 後導到 `/products`。

## LINE API 一覽

專案共呼叫 LINE 的 **5 個 endpoint**,分成三組。所有 URL 集中設定在 `backend/src/main/resources/application.yml` 的 `line.*`,程式端不硬編。使用者 profile 改由 token endpoint 回傳的 `id_token` 直接解析,不再打 `/v2/profile`。

### 一、OAuth 登入 (User Access Token 流程)

| # | Endpoint | 呼叫者 | 認證方式 | 用途 |
|---|---|---|---|---|
| 1 | `GET https://access.line.me/oauth2/v2.1/authorize` | `AuthController.authorize` (瀏覽器 302 導向) | 無 (query 帶 `client_id` / `state` / `scope=profile openid` / `bot_prompt` / `prompt`) | 帶使用者到 LINE 授權畫面,包含「加入官方帳號」選項 |
| 2 | `POST https://api.line.me/oauth2/v2.1/token` | `LineOAuthClient.exchangeCodeForToken` | Form body: `client_id` + `client_secret` + `code` | 用 authorization code 換 user access token 與 id_token(scope 含 openid 才有) |

拿到 id_token 後,`LineOAuthClient.parseIdToken` 以 `channel_secret` 為金鑰驗 HS256 簽章,並檢查 `iss=https://access.line.me` / `aud=channel_id`,取出 `sub` / `name` / `picture` 對應到 `users.line_id` / `line_display_name` / `line_picture_url`。省去一次跨機房呼叫、消除 profile API 的單點信任。

### 二、好友狀態 (Bearer User Access Token)

用上一步的 access token 打,一次登入用一次即丟。

| # | Endpoint | 呼叫者 | 認證方式 | 用途 |
|---|---|---|---|---|
| 3 | `GET https://api.line.me/friendship/v1/status` | `LineOAuthClient.isFriend` | `Authorization: Bearer <user access token>` | 讀 `friendFlag` 判斷是否已追蹤官方帳號,寫入 `users.oa_friend_flag` |

### 三、Messaging API 推播 (Bearer Channel Access Token)

用「頻道」的 channel access token(存在 `.env` 的 `LINE_CHANNEL_ACCESS_TOKEN`),不是使用者的 token。

| # | Endpoint | 呼叫者 | 認證方式 | 用途 |
|---|---|---|---|---|
| 4 | `POST https://api.line.me/v2/bot/message/push` | `LineMessagingClient.pushText` | `Authorization: Bearer <channel access token>` | 對**單一** userId 推播;`MessagingService` 會先檢查 `oaFriendFlag`,未追蹤直接回 409 + 加好友連結,不打 LINE |
| 5 | `POST https://api.line.me/v2/bot/message/multicast` | `LineMessagingClient.multicastText` | `Authorization: Bearer <channel access token>` | 對 **1..500 位** userId 批次推播同一則訊息;不做本地追蹤檢查,未追蹤者由 LINE 靜默略過 |

### Push vs Multicast

兩個 endpoint 都留著,分工如下:

| 面向 | `push` | `multicast` |
|---|---|---|
| 收件人數 | 1 | 1..500 |
| 收件人型別 | user / group / room | **僅 user** |
| 訊息內容 | 每次呼叫可不同 | 同批同一則 |
| 錯誤定位 | 一對一,能知道單筆成敗 | 整批一個 `x-line-request-id`,個別失敗查不到 |
| 追蹤檢查 | 後端先查 `oaFriendFlag`,未追蹤回 409 | 不檢查,交由 LINE 靜默略過 |
| 計費 | 都算「已推播訊息數 = 收件人數」,成本相同 | 同左 |

Multicast 技術上可以放 1 個 userId,但一對一個人化通知(訂單、驗證碼、客服回覆)仍建議走 push,才能拿到未追蹤的 409 提示 + 明確的成敗回應。

### 錯誤映射

LINE Messaging API 的上游狀態碼在 `MessagingController.handleLineError` 統一轉換,避免直接把 LINE 的 401 / 403 傳給前端造成 JWT 誤判:

| LINE 回 | 對外回 | 原因 |
|---|---|---|
| 400 | 400 | payload 或 userId 不合法 |
| 401 | **502** | 我方 channel access token 設錯,不能讓前端誤以為是 JWT 過期 |
| 403 | **409** | 對方未加好友 / 已封鎖 / 方案不允許 |
| 429 | 429 | 配額或速率上限 |
| 5xx / 其他 | 502 | 上游異常 |
