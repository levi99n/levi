/**
 * direct.js — Hiển thị bài báo theo danh mục (category)
 * Dùng chung template/style với search.js & trang chủ.
 */
const API_KEY = "d3a2fdab6ce449139c9ec1cd4ca07516";

// ─── Lấy category từ URL ────────────────────────────────────────
function getCategoryFromURL() {
  return new URLSearchParams(window.location.search).get("category");
}

// ─── Gọi NewsAPI theo danh mục ──────────────────────────────────
async function getNewsByCategory(category) {
  try {
    const res  = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(category)}&pageSize=20&sortBy=publishedAt&apiKey=${API_KEY}`
    );
    const data = await res.json();
    return data.articles || [];
  } catch (err) {
    console.error("direct.js API error:", err);
    return [];
  }
}

// ─── Template — đồng nhất với style.css trang chủ ───────────────
function templateCon4(article) {
  const img   = article.urlToImage || "https://placehold.co/180x120/f0ede8/9a9690?text=No+Image";
  const title = article.title       || "Không có tiêu đề";
  const desc  = article.description || "";
  const url   = article.url         || "#";
  return `
    <div class="con4-left-item">
      <a href="${url}" target="_blank" rel="noopener noreferrer">
        <img src="${img}" alt="${title.substring(0, 60)}" loading="lazy"
             onerror="this.src='https://placehold.co/180x120/f0ede8/9a9690?text=No+Image'">
        <div class="mini-con4">
          <h3>${title}</h3>
          <p>${desc}</p>
        </div>
      </a>
    </div>
  `;
}

// ─── Skeleton ────────────────────────────────────────────────────
function showSkeleton(count = 6) {
  const c = document.getElementById("con4-list");
  if (!c) return;
  c.innerHTML = Array(count).fill(`
    <div class="skeleton-item">
      <div class="skeleton-img"></div>
      <div class="skeleton-text">
        <div class="skeleton-line wide"></div>
        <div class="skeleton-line med"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `).join("");
}

// ─── Render ──────────────────────────────────────────────────────
function renderSection(items) {
  const container = document.getElementById("con4-list");
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = "<p>Không có bài báo nào trong danh mục này.</p>";
    return;
  }
  container.innerHTML = items.slice(0, 15).map(templateCon4).join("");
}

// ─── Main ────────────────────────────────────────────────────────
async function renderData() {
  const category = getCategoryFromURL();
  if (!category) {
    const c = document.getElementById("con4-list");
    if (c) c.innerHTML = "<p>Không tìm thấy danh mục.</p>";
    return;
  }
  showSkeleton();
  const news = await getNewsByCategory(category);
  renderSection(news);
}

renderData();
