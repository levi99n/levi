/**
 * auth_state.js
 * Module dùng chung: kiểm tra trạng thái đăng nhập, render nút user/logout
 * trên mọi trang (index, search, direct).
 */
import { app } from "./databaseconfig.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const auth = getAuth(app);

/**
 * Cập nhật floating-nav icon #user:
 *  - Chưa đăng nhập → link đến login.html
 *  - Đã đăng nhập   → hiện avatar/initial + dropdown logout
 */
export function initAuthUI() {
  onAuthStateChanged(auth, (user) => {
    // Tìm wrapper chứa icon #user trong floating nav
    const userLink = document.querySelector(".content-left a[href*='login']");
    if (!userLink) return;

    if (user) {
      // --- Đã đăng nhập ---
      // Thay thẻ <a> thành div có dropdown
      const initial = (user.displayName || user.email || "U")[0].toUpperCase();
      const photoURL = user.photoURL;

      userLink.removeAttribute("href");
      userLink.style.cursor = "pointer";
      userLink.style.position = "relative";

      const userEl = userLink.querySelector("#user");
      if (userEl) {
        userEl.style.background = "var(--accent, #e8360a)";
        userEl.style.color = "white";
        userEl.style.border = "2px solid var(--accent, #e8360a)";
        userEl.style.fontSize = "14px";
        userEl.style.fontWeight = "700";
        userEl.innerHTML = photoURL
          ? `<img src="${photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
          : initial;
      }

      // Tạo dropdown
      const dropdown = document.createElement("div");
      dropdown.id = "auth-dropdown";
      dropdown.innerHTML = `
        <div style="
          position:absolute;
          right:0; bottom:54px;
          background:#fff;
          border:1px solid #e8e6e0;
          border-radius:10px;
          box-shadow:0 8px 24px rgba(0,0,0,0.12);
          min-width:200px;
          padding:8px 0;
          z-index:999;
          display:none;
          font-family:inherit;
        " id="auth-dropdown-menu">
          <div style="padding:12px 16px;border-bottom:1px solid #f0f0f0;">
            <div style="font-size:13px;font-weight:700;color:#111;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              ${user.displayName || "Người dùng"}
            </div>
            <div style="font-size:11px;color:#888;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              ${user.email || ""}
            </div>
          </div>
          <button id="btnLogout" style="
            display:flex;align-items:center;gap:8px;
            width:100%;text-align:left;
            padding:10px 16px;
            background:none;border:none;
            font-size:13px;font-weight:600;color:#e8360a;
            cursor:pointer;transition:background 0.15s;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Đăng xuất
          </button>
        </div>
      `;
      userLink.appendChild(dropdown);

      // Toggle dropdown
      userLink.addEventListener("click", (e) => {
        e.stopPropagation();
        const menu = document.getElementById("auth-dropdown-menu");
        if (menu) menu.style.display = menu.style.display === "block" ? "none" : "block";
      });

      document.addEventListener("click", () => {
        const menu = document.getElementById("auth-dropdown-menu");
        if (menu) menu.style.display = "none";
      });

      // Nút đăng xuất
      setTimeout(() => {
        const btnLogout = document.getElementById("btnLogout");
        if (btnLogout) {
          btnLogout.addEventListener("mouseover", () => { btnLogout.style.background = "#fff1ee"; });
          btnLogout.addEventListener("mouseout",  () => { btnLogout.style.background = "none"; });
          btnLogout.addEventListener("click", async (e) => {
            e.stopPropagation();
            try {
              await signOut(auth);
              showToastGlobal("Đã đăng xuất thành công", "success");
              setTimeout(() => window.location.reload(), 800);
            } catch (err) {
              console.error("Logout error:", err);
            }
          });
        }
      }, 100);

    } else {
      // --- Chưa đăng nhập --- giữ nguyên link login
      userLink.href = "../pages/login.html";
    }
  });
}

/** Toast nhỏ dùng chung (tạo tạm nếu trang không có #toast) */
function showToastGlobal(msg, type = "success") {
  let toast = document.getElementById("toast-global");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-global";
    toast.style.cssText = `
      position:fixed;bottom:32px;left:50%;transform:translateX(-50%);
      background:${type === "success" ? "#1a7a4a" : "#c0392b"};
      color:#fff;padding:10px 20px;border-radius:8px;
      font-size:13px;font-weight:600;z-index:9999;
      opacity:0;transition:opacity 0.3s;pointer-events:none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  setTimeout(() => { toast.style.opacity = "0"; }, 2500);
}
