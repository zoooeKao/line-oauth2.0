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
