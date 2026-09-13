const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const FLOW_IMG = path.join(ROOT, "line-oauth-flow@3x.png");
const DEMO_VIDEO = path.join(__dirname, "demo.mov");
const DEMO_POSTER = "image/png;base64," + fs.readFileSync(path.join(__dirname, "demo-poster.png")).toString("base64");
const DEMO2_VIDEO = path.join(__dirname, "demo2.mov");
const DEMO2_POSTER = "image/png;base64," + fs.readFileSync(path.join(__dirname, "demo2-poster.png")).toString("base64");

// ---- Palette: Midnight + LINE green accent ----
const NAVY = "12183A";      // dominant dark
const NAVY2 = "1E2761";     // panel navy
const ICE = "CADCFC";       // light text on dark
const GREEN = "06C755";     // LINE green accent
const AMBER = "F5A623";     // warning accent
const INK = "1A1F36";       // dark text on light
const SLATE = "5B6478";     // muted text
const CARD = "F4F6FB";      // light card
const WHITE = "FFFFFF";

const HFONT = "PingFang TC";
const BFONT = "PingFang TC";

const pres = new pptxgen();
pres.defineLayout({ name: "W", width: 13.333, height: 7.5 });
pres.layout = "W";
pres.author = "LINE OAuth POC";
pres.title = "LINE Login OAuth 2.0 POC — SA 報告";

const W = 13.333, H = 7.5;
const shadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 3, angle: 135, opacity: 0.18 });

// Reusable: section header band on light slides
function lightHeader(slide, kicker, title) {
  slide.background = { color: WHITE };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 1.35, fill: { color: NAVY } });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.35, w: W, h: 0.06, fill: { color: GREEN } });
  slide.addText(kicker.toUpperCase(), { x: 0.7, y: 0.28, w: 11, h: 0.3, fontFace: HFONT, fontSize: 11, color: GREEN, bold: true, charSpacing: 3, margin: 0 });
  slide.addText(title, { x: 0.7, y: 0.55, w: 12, h: 0.7, fontFace: HFONT, fontSize: 27, color: WHITE, bold: true, margin: 0 });
}

function footer(slide, n) {
  slide.addText("LINE Login OAuth 2.0 POC · 系統分析報告", { x: 0.7, y: 7.08, w: 9, h: 0.3, fontFace: BFONT, fontSize: 9, color: SLATE, margin: 0 });
  slide.addText(String(n), { x: 12.4, y: 7.08, w: 0.5, h: 0.3, fontFace: BFONT, fontSize: 9, color: SLATE, align: "right", margin: 0 });
}

// =========================================================
// Slide 1 — Title
// =========================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  // accent shapes
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.25, h: H, fill: { color: GREEN } });
  s.addShape(pres.shapes.OVAL, { x: 10.3, y: -1.6, w: 4.5, h: 4.5, fill: { color: NAVY2 } });
  s.addShape(pres.shapes.OVAL, { x: 11.6, y: 4.7, w: 3.2, h: 3.2, fill: { color: NAVY2 } });

  s.addText("概念驗證 · SYSTEM ANALYSIS", { x: 0.9, y: 1.5, w: 10, h: 0.4, fontFace: HFONT, fontSize: 13, color: GREEN, bold: true, charSpacing: 4, margin: 0 });
  s.addText("LINE Login OAuth 2.0", { x: 0.85, y: 2.05, w: 11.5, h: 1.0, fontFace: HFONT, fontSize: 48, color: WHITE, bold: true, margin: 0 });
  s.addText("第三方登入身分驗證　POC 技術報告", { x: 0.9, y: 3.05, w: 11.5, h: 0.6, fontFace: HFONT, fontSize: 24, color: ICE, margin: 0 });

  s.addShape(pres.shapes.LINE, { x: 0.9, y: 3.95, w: 4.2, h: 0, line: { color: GREEN, width: 2 } });
  s.addText([
    { text: "驗證範圍　", options: { color: ICE, bold: true } },
    { text: "LINE 登入 → 後端簽發自家 JWT → 前端存取受保護資源", options: { color: ICE } },
  ], { x: 0.9, y: 4.2, w: 11, h: 0.4, fontFace: BFONT, fontSize: 15, margin: 0 });

  // meta chips
  const chips = ["React + Vite", "Spring Boot 3 / Java 21", "PostgreSQL 16", "Docker Compose"];
  let cx = 0.9;
  chips.forEach((c) => {
    const cw = 0.42 + c.length * 0.135;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y: 5.15, w: cw, h: 0.5, fill: { color: NAVY2 }, line: { color: GREEN, width: 1 }, rectRadius: 0.1 });
    s.addText(c, { x: cx, y: 5.15, w: cw, h: 0.5, fontFace: BFONT, fontSize: 12, color: ICE, align: "center", valign: "middle", margin: 0 });
    cx += cw + 0.25;
  });

  s.addText("文件版本 v0.1　·　2026-06-29", { x: 0.9, y: 6.5, w: 8, h: 0.35, fontFace: BFONT, fontSize: 12, color: SLATE, margin: 0 });
})();

// =========================================================
// Slide 2 — 目的與範圍
// =========================================================
(() => {
  const s = pres.addSlide();
  lightHeader(s, "Objective & Scope", "目的與範圍");

  // Purpose band
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.75, w: 11.93, h: 1.0, fill: { color: CARD } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.75, w: 0.1, h: 1.0, fill: { color: GREEN } });
  s.addText("目的", { x: 0.95, y: 1.88, w: 2, h: 0.3, fontFace: HFONT, fontSize: 13, color: GREEN, bold: true, margin: 0 });
  s.addText("驗證以 LINE Login 作為第三方身分提供者，使用者免註冊即可登入；登入後由後端簽發自家 JWT，前端持 JWT 存取受保護 API。", { x: 0.95, y: 2.18, w: 11.4, h: 0.5, fontFace: BFONT, fontSize: 14, color: INK, margin: 0 });

  // Two columns: In scope / Out of scope
  const colY = 3.05, colH = 3.7, colW = 5.78;
  // In scope
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: colY, w: colW, h: 0.55, fill: { color: NAVY } });
  s.addText("範圍內 In Scope", { x: 0.9, y: colY, w: colW - 0.3, h: 0.55, fontFace: HFONT, fontSize: 15, color: WHITE, bold: true, valign: "middle", margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: colY + 0.55, w: colW, h: colH - 0.55, fill: { color: CARD } });
  s.addText([
    "Authorization Code 授權流程",
    "state + HttpOnly Cookie 防 CSRF",
    "以 Channel secret 換 access_token、取 profile",
    "依 lineId upsert 使用者",
    "簽發 / 驗證自家 JWT，保護 /api/me",
    "前端登入頁、回呼頁、401 自動登出",
  ].map((t, i, a) => ({ text: t, options: { bullet: { code: "2022", indent: 14 }, color: INK, breakLine: i !== a.length - 1, paraSpaceAfter: 8 } })),
    { x: 0.95, y: colY + 0.72, w: colW - 0.45, h: colH - 0.85, fontFace: BFONT, fontSize: 13, valign: "top", margin: 0 });

  // Out of scope
  const ox = 0.7 + colW + 0.37;
  s.addShape(pres.shapes.RECTANGLE, { x: ox, y: colY, w: colW, h: 0.55, fill: { color: SLATE } });
  s.addText("範圍外 Out of Scope（POC 限制）", { x: ox + 0.2, y: colY, w: colW - 0.3, h: 0.55, fontFace: HFONT, fontSize: 15, color: WHITE, bold: true, valign: "middle", margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: ox, y: colY + 0.55, w: colW, h: colH - 0.55, fill: { color: CARD } });
  s.addText([
    "Refresh token / token 續期",
    "id_token（OIDC）簽章驗證",
    "角色權限 RBAC、多租戶",
    "正式環境密鑰管理（KMS / Secret Manager）",
    "登出、帳號解綁、稽核日誌",
  ].map((t, i, a) => ({ text: t, options: { bullet: { code: "2022", indent: 14 }, color: SLATE, breakLine: i !== a.length - 1, paraSpaceAfter: 8 } })),
    { x: ox + 0.25, y: colY + 0.72, w: colW - 0.45, h: colH - 0.85, fontFace: BFONT, fontSize: 13, valign: "top", margin: 0 });

  footer(s, 2);
})();

// =========================================================
// Slide 3 — 系統架構 + 技術棧
// =========================================================
(() => {
  const s = pres.addSlide();
  lightHeader(s, "Architecture", "系統架構與技術棧");

  // Architecture row of nodes
  const ny = 2.15, nh = 1.5, nw = 2.35, gap = 0.45;
  const nodes = [
    { t: "使用者瀏覽器", sub: "Browser", c: NAVY2 },
    { t: "前端", sub: "React / Vite :5173", c: NAVY2 },
    { t: "後端", sub: "Spring Boot :8080", c: GREEN, dark: true },
    { t: "資料庫", sub: "PostgreSQL :5432", c: NAVY2 },
  ];
  let nx = 0.7;
  nodes.forEach((n, i) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: nx, y: ny, w: nw, h: nh, fill: { color: n.c }, rectRadius: 0.08, shadow: shadow() });
    s.addText(n.t, { x: nx, y: ny + 0.4, w: nw, h: 0.4, fontFace: HFONT, fontSize: 16, color: WHITE, bold: true, align: "center", margin: 0 });
    s.addText(n.sub, { x: nx, y: ny + 0.85, w: nw, h: 0.3, fontFace: BFONT, fontSize: 11, color: n.dark ? "0B3B1E" : ICE, align: "center", margin: 0 });
    if (i < nodes.length - 1) {
      s.addShape(pres.shapes.LINE, { x: nx + nw + 0.02, y: ny + nh / 2, w: gap - 0.04, h: 0, line: { color: SLATE, width: 1.5, endArrowType: "triangle" } });
    }
    nx += nw + gap;
  });
  // LINE platform node (callout above backend)
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.85, y: 3.95, w: 2.35, h: 0.85, fill: { color: NAVY }, line: { color: GREEN, width: 1.5 }, rectRadius: 0.08 });
  s.addText("LINE 平台", { x: 5.85, y: 4.06, w: 2.35, h: 0.3, fontFace: HFONT, fontSize: 14, color: WHITE, bold: true, align: "center", margin: 0 });
  s.addText("token / profile API", { x: 5.85, y: 4.36, w: 2.35, h: 0.3, fontFace: BFONT, fontSize: 10, color: ICE, align: "center", margin: 0 });
  s.addShape(pres.shapes.LINE, { x: 7.02, y: 3.65, w: 0, h: 0.3, line: { color: GREEN, width: 1.5, endArrowType: "triangle", beginArrowType: "triangle" } });
  s.addText("OAuth redirect + 後端 API 呼叫", { x: 5.0, y: 4.85, w: 4, h: 0.3, fontFace: BFONT, fontSize: 10, color: SLATE, align: "center", italic: true, margin: 0 });

  // Tech stack strip
  const ty = 5.55;
  s.addText("技術棧", { x: 0.7, y: ty - 0.05, w: 3, h: 0.3, fontFace: HFONT, fontSize: 13, color: NAVY, bold: true, margin: 0 });
  const stack = [
    ["前端", "React 18 · TS · Vite · Tailwind · TanStack Query"],
    ["後端", "Java 21 · Spring Boot 3 · Spring Security 6 · JPA"],
    ["資料 / 部署", "PostgreSQL 16 · Docker Compose"],
  ];
  let sx = 0.7; const sw = 3.92;
  stack.forEach((p) => {
    s.addShape(pres.shapes.RECTANGLE, { x: sx, y: ty + 0.32, w: sw, h: 0.95, fill: { color: CARD } });
    s.addShape(pres.shapes.RECTANGLE, { x: sx, y: ty + 0.32, w: 0.08, h: 0.95, fill: { color: GREEN } });
    s.addText(p[0], { x: sx + 0.22, y: ty + 0.42, w: sw - 0.35, h: 0.3, fontFace: HFONT, fontSize: 13, color: GREEN, bold: true, margin: 0 });
    s.addText(p[1], { x: sx + 0.22, y: ty + 0.72, w: sw - 0.35, h: 0.5, fontFace: BFONT, fontSize: 12, color: INK, margin: 0 });
    sx += sw + 0.18;
  });

  footer(s, 3);
})();

// =========================================================
// Slide 4 — OAuth 四階段流程 (with embedded diagram)
// =========================================================
(() => {
  const s = pres.addSlide();
  lightHeader(s, "Flow", "OAuth 流程：四階段");

  // Left: 4 phase cards
  const phases = [
    { n: "1", t: "發起登入", d: "前端要求授權，後端產生隨機 state、寫 HttpOnly Cookie，302 轉址 LINE" },
    { n: "2", t: "LINE 端授權", d: "帶 client_id / redirect_uri / state / scope，使用者登入並同意，回呼帶 code" },
    { n: "3", t: "換 token 與簽 JWT", d: "後端比對 state → 以 code+secret 換 token → 取 profile → upsert User → 簽自家 JWT" },
    { n: "4", t: "保存與存取資源", d: "前端存 JWT 於 localStorage，帶 Bearer 呼叫 /api/me，JwtAuthFilter 驗章回資料" },
  ];
  let py = 1.75; const ph = 1.2, pw = 7.6;
  phases.forEach((p) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: py, w: pw, h: ph, fill: { color: CARD } });
    s.addShape(pres.shapes.OVAL, { x: 0.92, y: py + 0.33, w: 0.55, h: 0.55, fill: { color: NAVY } });
    s.addText(p.n, { x: 0.92, y: py + 0.33, w: 0.55, h: 0.55, fontFace: HFONT, fontSize: 20, color: GREEN, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addText("階段 " + p.n + "　" + p.t, { x: 1.7, y: py + 0.15, w: pw - 1.1, h: 0.35, fontFace: HFONT, fontSize: 15, color: NAVY, bold: true, margin: 0 });
    s.addText(p.d, { x: 1.7, y: py + 0.5, w: pw - 1.2, h: 0.6, fontFace: BFONT, fontSize: 12, color: INK, margin: 0 });
    py += ph + 0.12;
  });

  // Right: embedded sequence diagram
  const imgRatio = 4128 / 5391;
  const ih = 4.95, iw = ih * imgRatio;
  const ix = 8.6 + (4.0 - iw) / 2;
  s.addShape(pres.shapes.RECTANGLE, { x: 8.5, y: 1.7, w: 4.1, h: 5.3, fill: { color: WHITE }, line: { color: "D9DEEA", width: 1 }, shadow: shadow() });
  s.addImage({ path: FLOW_IMG, x: ix, y: 1.85, w: iw, h: ih });
  s.addText("完整時序圖（line-oauth-flow）", { x: 8.5, y: 6.62, w: 4.1, h: 0.3, fontFace: BFONT, fontSize: 10, color: SLATE, align: "center", italic: true, margin: 0 });

  footer(s, 4);
})();

// =========================================================
// Slide 5 — API 規格 + 資料模型
// =========================================================
(() => {
  const s = pres.addSlide();
  lightHeader(s, "API & Data", "API 規格與資料模型");

  s.addText("API 端點", { x: 0.7, y: 1.6, w: 6, h: 0.35, fontFace: HFONT, fontSize: 15, color: NAVY, bold: true, margin: 0 });
  const head = (t) => ({ text: t, options: { fill: { color: NAVY }, color: WHITE, bold: true, fontFace: HFONT, fontSize: 12, valign: "middle" } });
  const rows = [
    [head("Method · Path"), head("認證"), head("說明")],
    ["GET /api/auth/line/authorize", "—", "產生 state、302 轉址 LINE"],
    ["GET /api/auth/line/callback", "—", "驗 state、換 token、簽 JWT，302 回前端"],
    ["GET /api/me", "Bearer JWT", "取登入者資料；失敗回 401"],
    ["GET /actuator/health", "—", "健康檢查"],
  ];
  const body = rows.map((r, ri) => ri === 0 ? r : r.map((c, ci) => ({
    text: c,
    options: { fontFace: ci === 0 ? "Consolas" : BFONT, fontSize: 11.5, color: INK, fill: { color: ri % 2 ? WHITE : CARD }, valign: "middle", align: ci === 1 ? "center" : "left" },
  })));
  s.addTable(body, { x: 0.7, y: 1.98, w: 8.0, colW: [3.5, 1.35, 3.15], rowH: [0.45, 0.6, 0.6, 0.55, 0.5], border: { pt: 0.5, color: "E2E6F0" }, margin: [4, 6, 4, 6] });

  // Data model panel (right)
  const dx = 9.0;
  s.addText("資料模型 · users", { x: dx, y: 1.6, w: 3.6, h: 0.35, fontFace: HFONT, fontSize: 15, color: NAVY, bold: true, margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: dx, y: 1.98, w: 3.63, h: 3.55, fill: { color: NAVY }, shadow: shadow() });
  const cols = [
    ["id", "BIGINT · PK"],
    ["line_id", "UNIQUE · upsert 鍵"],
    ["line_display_name", "NOT NULL"],
    ["line_picture_url", "nullable"],
    ["created_at", "不可更新"],
    ["updated_at", "每次更新"],
  ];
  let fy = 2.18;
  cols.forEach((c) => {
    s.addText(c[0], { x: dx + 0.25, y: fy, w: 1.7, h: 0.4, fontFace: "Consolas", fontSize: 12.5, color: GREEN, bold: true, valign: "middle", margin: 0 });
    s.addText(c[1], { x: dx + 1.85, y: fy, w: 1.7, h: 0.4, fontFace: BFONT, fontSize: 11, color: ICE, valign: "middle", align: "right", margin: 0 });
    fy += 0.43;
    s.addShape(pres.shapes.LINE, { x: dx + 0.25, y: fy - 0.04, w: 3.13, h: 0, line: { color: NAVY2, width: 0.75 } });
  });
  s.addText("JPA ddl-auto: update 自動建表（POC）", { x: dx, y: 5.6, w: 3.63, h: 0.3, fontFace: BFONT, fontSize: 10, color: SLATE, italic: true, margin: 0 });

  // failure note bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 5.95, w: 8.0, h: 0.95, fill: { color: "FBEEDB" } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 5.95, w: 0.1, h: 0.95, fill: { color: AMBER } });
  s.addText("失敗情境", { x: 0.95, y: 6.06, w: 2, h: 0.3, fontFace: HFONT, fontSize: 12, color: "9A6206", bold: true, margin: 0 });
  s.addText("JWT 無效或過期 → 後端回 401（HttpStatusEntryPoint）→ 前端攔截器清除 token 並導回 /login。", { x: 0.95, y: 6.36, w: 7.6, h: 0.45, fontFace: BFONT, fontSize: 12, color: INK, margin: 0 });

  footer(s, 5);
})();

// =========================================================
// Slide 6 — 安全設計
// =========================================================
(() => {
  const s = pres.addSlide();
  lightHeader(s, "Security", "安全設計");

  const items = [
    ["state 防護", "隨機 state 存 HttpOnly Cookie，callback 比對", "對抗授權碼注入 / CSRF"],
    ["secret 不外洩", "換 token 全在後端，前端與網址不出現 secret", "防憑證外洩"],
    ["無狀態認證", "SessionCreationPolicy.STATELESS + JWT", "防 Session 固定"],
    ["401 而非 403", "HttpStatusEntryPoint(UNAUTHORIZED)", "配合前端自動登出"],
    ["CORS 白名單", "僅允許 FRONTEND_URL，allowCredentials", "防跨站濫用"],
    ["JWT 簽章", "HS256，密鑰來自 JWT_SECRET", "防偽造 token"],
  ];
  const cw = 3.85, ch = 1.95, gx = 0.21, gy = 0.25;
  let i = 0;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const x = 0.7 + c * (cw + gx);
      const y = 1.75 + r * (ch + gy);
      const it = items[i++];
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw, h: ch, fill: { color: CARD }, shadow: shadow() });
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw, h: 0.08, fill: { color: GREEN } });
      s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: y + 0.3, w: 0.42, h: 0.42, fill: { color: NAVY } });
      s.addShape(pres.shapes.OVAL, { x: x + 0.35, y: y + 0.4, w: 0.22, h: 0.22, fill: { color: GREEN } });
      s.addText(it[0], { x: x + 0.85, y: y + 0.28, w: cw - 1.0, h: 0.45, fontFace: HFONT, fontSize: 15, color: NAVY, bold: true, valign: "middle", margin: 0 });
      s.addText(it[1], { x: x + 0.28, y: y + 0.85, w: cw - 0.55, h: 0.6, fontFace: BFONT, fontSize: 12, color: INK, margin: 0 });
      s.addText(it[2], { x: x + 0.28, y: y + 1.48, w: cw - 0.55, h: 0.35, fontFace: BFONT, fontSize: 11, color: GREEN, bold: true, margin: 0 });
    }
  }

  footer(s, 6);
})();

// =========================================================
// Slide 7 — 已知風險 / POC 取捨
// =========================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.25, h: H, fill: { color: AMBER } });
  s.addText("RISKS & TRADE-OFFS", { x: 0.7, y: 0.55, w: 11, h: 0.35, fontFace: HFONT, fontSize: 12, color: AMBER, bold: true, charSpacing: 3, margin: 0 });
  s.addText("已知風險與 POC 取捨", { x: 0.7, y: 0.9, w: 12, h: 0.65, fontFace: HFONT, fontSize: 27, color: WHITE, bold: true, margin: 0 });

  const risks = [
    ["JWT 經 URL query 傳遞", "可能殘留於瀏覽器歷史 / Referer / log", "改一次性 code 換 token，或後端 set HttpOnly Cookie"],
    ["JWT 存 localStorage", "易受 XSS 竊取", "評估 HttpOnly Cookie + CSRF token"],
    ["未驗 id_token 簽章", "目前信任 profile API 單點", "正式環境驗 OIDC id_token"],
    ["無 refresh / 撤銷機制", "JWT 到期前無法撤銷", "導入 refresh token 與撤銷清單"],
    ["密鑰以 .env 明文管理", "僅限 POC", "改用 Secret Manager / KMS"],
  ];
  let y = 1.95; const rh = 0.96;
  risks.forEach((r) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 11.93, h: rh, fill: { color: NAVY2 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 0.08, h: rh, fill: { color: AMBER } });
    s.addText(r[0], { x: 0.95, y: y + 0.12, w: 3.7, h: 0.7, fontFace: HFONT, fontSize: 14.5, color: WHITE, bold: true, valign: "middle", margin: 0 });
    s.addText(r[1], { x: 4.75, y: y + 0.12, w: 3.5, h: 0.7, fontFace: BFONT, fontSize: 12.5, color: ICE, valign: "middle", margin: 0 });
    s.addShape(pres.shapes.LINE, { x: 8.35, y: y + 0.2, w: 0, h: rh - 0.4, line: { color: SLATE, width: 0.75 } });
    s.addText([
      { text: "建議　", options: { color: GREEN, bold: true } },
      { text: r[2], options: { color: ICE } },
    ], { x: 8.55, y: y + 0.12, w: 3.9, h: 0.7, fontFace: BFONT, fontSize: 12, valign: "middle", margin: 0 });
    y += rh + 0.05;
  });
})();

// =========================================================
// Slide 8 — 後續方向 roadmap
// =========================================================
(() => {
  const s = pres.addSlide();
  lightHeader(s, "Next Steps", "後續方向（POC → 正式化）");

  const steps = [
    ["01", "OIDC id_token 驗章", "移除對 profile API 的單點信任"],
    ["02", "改善 JWT 傳遞與儲存", "一次性 code 或 HttpOnly Cookie"],
    ["03", "Refresh token 與登出", "加入 token 續期與撤銷"],
    ["04", "密鑰與 Schema 治理", "Secret Manager；Flyway 取代 ddl-auto"],
    ["05", "補單元 / 整合測試", "state 不符、token 失敗、JWT 過期"],
  ];
  let y = 1.85; const rh = 0.92;
  steps.forEach((st, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 11.93, h: rh, fill: { color: i % 2 ? WHITE : CARD } });
    s.addText(st[0], { x: 0.85, y: y, w: 1.0, h: rh, fontFace: HFONT, fontSize: 30, color: GREEN, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addShape(pres.shapes.LINE, { x: 1.95, y: y + 0.18, w: 0, h: rh - 0.36, line: { color: "D9DEEA", width: 1 } });
    s.addText(st[1], { x: 2.2, y: y + 0.13, w: 5.4, h: 0.7, fontFace: HFONT, fontSize: 16, color: NAVY, bold: true, valign: "middle", margin: 0 });
    s.addText(st[2], { x: 7.4, y: y + 0.13, w: 5.0, h: 0.7, fontFace: BFONT, fontSize: 13, color: INK, valign: "middle", margin: 0 });
    y += rh + 0.06;
  });

  footer(s, 8);
})();

// =========================================================
// Slide 9 — Closing
// =========================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: -1.8, y: 4.4, w: 5, h: 5, fill: { color: NAVY2 } });
  s.addShape(pres.shapes.OVAL, { x: 11.2, y: -1.6, w: 4, h: 4, fill: { color: NAVY2 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.18, fill: { color: GREEN } });

  s.addText("POC 結論", { x: 0.9, y: 2.4, w: 11, h: 0.4, fontFace: HFONT, fontSize: 14, color: GREEN, bold: true, charSpacing: 3, margin: 0 });
  s.addText("流程已打通，可作為正式登入機制的基礎", { x: 0.85, y: 2.85, w: 11.5, h: 1.0, fontFace: HFONT, fontSize: 33, color: WHITE, bold: true, margin: 0 });
  s.addText("LINE 登入 → 後端換 token → 簽 JWT → 前端存取受保護資源全程驗證成功；正式化前優先處理 JWT 傳遞方式、id_token 驗章與密鑰治理。", { x: 0.9, y: 4.1, w: 10.8, h: 0.8, fontFace: BFONT, fontSize: 15, color: ICE, margin: 0 });

  s.addShape(pres.shapes.LINE, { x: 0.9, y: 5.3, w: 3.5, h: 0, line: { color: GREEN, width: 2 } });
  s.addText("詳見　docs/SA-line-oauth-poc.md", { x: 0.9, y: 5.5, w: 8, h: 0.4, fontFace: "Consolas", fontSize: 14, color: ICE, margin: 0 });
  s.addText("LINE Login OAuth 2.0 POC · 系統分析報告 · v0.1 · 2026-06-29", { x: 0.9, y: 6.6, w: 11, h: 0.3, fontFace: BFONT, fontSize: 11, color: SLATE, margin: 0 });
})();

// =========================================================
// Slides 10–11 — 實機 Demo 錄影
// =========================================================
function demoSlide(kicker, title, video, poster, caption) {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.25, h: H, fill: { color: GREEN } });
  s.addText(kicker, { x: 0.7, y: 0.5, w: 11, h: 0.35, fontFace: HFONT, fontSize: 12, color: GREEN, bold: true, charSpacing: 3, margin: 0 });
  s.addText(title, { x: 0.7, y: 0.85, w: 12, h: 0.65, fontFace: HFONT, fontSize: 27, color: WHITE, bold: true, margin: 0 });

  const vRatio = 1600 / 1044;
  const vh = 4.85, vw = vh * vRatio;
  const vx = (W - vw) / 2, vy = 1.75;
  s.addShape(pres.shapes.RECTANGLE, { x: vx - 0.08, y: vy - 0.08, w: vw + 0.16, h: vh + 0.16, fill: { color: NAVY2 }, line: { color: GREEN, width: 1.5 }, shadow: shadow() });
  s.addMedia({ type: "video", path: video, cover: poster, x: vx, y: vy, w: vw, h: vh });

  s.addText(caption, { x: 0.7, y: vy + vh + 0.18, w: 11.93, h: 0.35, fontFace: BFONT, fontSize: 12, color: ICE, align: "center", italic: true, margin: 0 });
}

demoSlide("LIVE DEMO · 1", "實機 Demo：全流程登入",
  DEMO_VIDEO, DEMO_POSTER,
  "從瀏覽器進入 → 點「使用 LINE 登入」→ 同意授權 → 自動導回商品頁");

demoSlide("LIVE DEMO · 2", "實機 Demo：LINE 端授權畫面",
  DEMO2_VIDEO, DEMO2_POSTER,
  "階段二 LINE 平台登入者身分認證（access.line.me）— 輸入認證碼完成授權");

pres.writeFile({ fileName: path.join(ROOT, "docs", "LINE-OAuth-POC-SA.pptx") }).then((f) => console.log("WROTE", f));
