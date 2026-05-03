import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import { app } from "./databaseconfig.js";

const auth = getAuth(app);

// ─── DOM Elements ────────────────────────────────────────────────
const emailInput    = document.getElementById("email");
const passInput     = document.getElementById("password");
const emailError    = document.getElementById("email-error");
const passError     = document.getElementById("password-error");
const loginBtn      = document.getElementById("login-btn");
const togglePassBtn = document.getElementById("toggle-pass");
const eyeIcon       = document.getElementById("eye-icon");

// ─── Toggle show/hide password ───────────────────────────────────
togglePassBtn.addEventListener("click", () => {
  const isPassword = passInput.type === "password";
  passInput.type = isPassword ? "text" : "password";
  eyeIcon.innerHTML = isPassword
    ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
       <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
       <line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
       <circle cx="12" cy="12" r="3"/>`;
});

// ─── Helpers ─────────────────────────────────────────────────────
function setFieldError(fieldId, errorEl, message) {
  const field = document.getElementById(fieldId);
  errorEl.textContent = message;
  field.classList.toggle("has-error", !!message);
}

function showToast(message, type = "error") {
  const toast    = document.getElementById("toast");
  const toastMsg = document.getElementById("toast-msg");
  toast.className = `toast ${type}`;
  toastMsg.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  loginBtn.classList.toggle("loading", isLoading);
}

function getFirebaseErrorMessage(code) {
  const messages = {
    "auth/user-not-found":          "Email chưa được đăng ký.",
    "auth/wrong-password":          "Mật khẩu không đúng.",
    "auth/invalid-email":           "Định dạng email không hợp lệ.",
    "auth/user-disabled":           "Tài khoản đã bị vô hiệu hóa.",
    "auth/too-many-requests":       "Quá nhiều lần thử. Vui lòng thử lại sau.",
    "auth/network-request-failed":  "Lỗi kết nối mạng.",
    "auth/invalid-credential":      "Email hoặc mật khẩu không đúng.",
    "auth/popup-closed-by-user":    "Bạn đã đóng cửa sổ đăng nhập.",
    "auth/cancelled-popup-request": "Yêu cầu đăng nhập bị huỷ.",
    "auth/account-exists-with-different-credential":
      "Email này đã được dùng với phương thức đăng nhập khác.",
  };
  return messages[code] || "Đã xảy ra lỗi. Vui lòng thử lại.";
}

// ─── Sau khi đăng nhập thành công ───────────────────────────────
function onLoginSuccess(user) {
  console.log("Đăng nhập thành công:", user.email || user.displayName);
  showToast("Đăng nhập thành công! Đang chuyển trang...", "success");
  setTimeout(() => { window.location.href = "index.html"; }, 1000);
}

// ─── Validate form ───────────────────────────────────────────────
function validate(email, password) {
  let isValid = true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  setFieldError("field-email",    emailError, "");
  setFieldError("field-password", passError,  "");
  if (!emailRegex.test(email)) {
    setFieldError("field-email", emailError, "Email không đúng định dạng");
    isValid = false;
  }
  if (password.length < 6) {
    setFieldError("field-password", passError, "Mật khẩu tối thiểu 6 ký tự");
    isValid = false;
  }
  return isValid;
}

// ─── Email/Password login ────────────────────────────────────────
async function handleLogin() {
  const email    = emailInput.value.trim();
  const password = passInput.value.trim();
  if (!validate(email, password)) return;
  setLoading(true);
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    onLoginSuccess(cred.user);
  } catch (error) {
    const msg = getFirebaseErrorMessage(error.code);
    showToast(msg, "error");
    setFieldError("field-password", passError, msg);
  } finally {
    setLoading(false);
  }
}

// ─── Social login (popup) ────────────────────────────────────────
async function handleSocialLogin(providerName) {
  let provider;
  if (providerName === "google")   provider = new GoogleAuthProvider();
  if (providerName === "facebook") {
    provider = new FacebookAuthProvider();
    // ⚠️ Cần bật Facebook provider trong Firebase Console
    // và điền Facebook App ID tại: https://console.firebase.google.com
  }
  if (providerName === "twitter") {
    provider = new TwitterAuthProvider();
    // ⚠️ Cần bật Twitter provider trong Firebase Console
  }
  if (!provider) return;

  try {
    const cred = await signInWithPopup(auth, provider);
    onLoginSuccess(cred.user);
  } catch (error) {
    console.error("Social login error:", error.code, error.message);
    const msg = getFirebaseErrorMessage(error.code);
    showToast(msg, "error");
  }
}

// ─── Event Listeners ─────────────────────────────────────────────
loginBtn.addEventListener("click", handleLogin);

[emailInput, passInput].forEach(input => {
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") handleLogin(); });
});

emailInput.addEventListener("input", () => setFieldError("field-email",    emailError, ""));
passInput.addEventListener("input",  () => setFieldError("field-password", passError,  ""));

// Gắn sự kiện cho 3 nút social
document.querySelectorAll(".btn-social").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const provider = btn.dataset.provider;
    if (provider) handleSocialLogin(provider);
  });
});
