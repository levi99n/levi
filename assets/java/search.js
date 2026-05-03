/**
 * search.js — Tìm kiếm bài báo theo từ khoá
 * Hoạt động trên: index.html, search.html, direct.html
 */
const API_KEY   = "d3a2fdab6ce449139c9ec1cd4ca07516";
const PAGE_SIZE = 20;

const searchInput = document.getElementById("search-input");
const searchBtn   = document.getElementById("search-btn");

// ─── Lấy keyword từ URL ─────────────────────────────────────────
function getKeywordFromURL() {
  return new URLSearchParams(window.location.search).get("keyword");
}

// ─── Gọi API ────────────────────────────────────────────────────
async function getNewsByKeyword(keyword) {
  if (!keyword) return [];
  try {
    const res  = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&pageSize=${PAGE_SIZE}&apiKey=${API_KEY}`
    );
    const data = await res.json();
    return data.articles || [];
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return [];
  }
}

// ─── Template bài báo — dùng class của style.css trang chủ ─────
function newsItemTemplate(article) {
  const img   = article.urlToImage || "https://placehold.co/180x120/f0ede8/9a9690?text=No+Image";
  const title = article.title       || "Không có tiêu đề";
  const desc  = article.description || "Không có mô tả.";
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

// ─── Skeleton loader ────────────────────────────────────────────
function showSkeleton(containerId, count = 5) {
  const c = document.getElementById(containerId);
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

// ─── Render danh sách ───────────────────────────────────────────
function renderNews(containerId, articles) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!articles || articles.length === 0) {
    container.innerHTML = "<p>Không tìm thấy bài báo phù hợp.</p>";
    return;
  }
  container.innerHTML = articles.map(newsItemTemplate).join("");
}

// ─── Load kết quả tìm kiếm ──────────────────────────────────────
async function loadSearchResult() {
  const keyword = getKeywordFromURL();
  if (!keyword) return;
  if (searchInput) searchInput.value = keyword;

  showSkeleton("con4-list");
  const articles = await getNewsByKeyword(keyword);
  renderNews("con4-list", articles);
}

// ─── Xử lý click search ─────────────────────────────────────────
function initSearchHandler() {
  if (!searchInput || !searchBtn) return;

  const handleSearch = () => {
    const keyword = searchInput.value.trim();
    if (!keyword) {
      searchInput.focus();
      searchInput.style.borderColor = "var(--accent)";
      setTimeout(() => { searchInput.style.borderColor = ""; }, 1500);
      return;
    }
    window.location.href =
      `../pages/search.html?keyword=${encodeURIComponent(keyword)}`;
  };

  searchBtn.addEventListener("click", handleSearch);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
  });
}

initSearchHandler();
loadSearchResult();
