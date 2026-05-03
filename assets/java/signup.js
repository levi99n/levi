import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import { app } from "./databaseconfig.js";

const auth = getAuth(app);

// ─── DOM Elements ─────────────────────────────────────────────────
const emailInput    = document.getElementById("email");
const passInput     = document.getElementById("password");
const cfPassInput   = document.getElementById("cf-password");
const emailError    = document.getElementById("email-error");
const passError     = document.getElementById("pass-error");
const cfPassError   = document.getElementById("cf-pass-error");
const registerBtn   = document.getElementById("register-btn");
const togglePassBtn = document.getElementById("toggle-pass");
const toggleCfBtn   = document.getElementById("toggle-cf-pass");
const eyeIcon       = document.getElementById("eye-icon");
const eyeIconCf     = document.getElementById("eye-icon-cf");

// ─── Toggle show/hide password ────────────────────────────────────
function createToggleHandler(inputEl, svgEl) {
  return () => {
    const isPass = inputEl.type === "password";
    inputEl.type = isPass ? "text" : "password";
    svgEl.innerHTML = isPass
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
         <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
         <line x1="1" y1="1" x2="23" y2="23"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
         <circle cx="12" cy="12" r="3"/>`;
  };
}

togglePassBtn.addEventListener("click", createToggleHandler(passInput, eyeIcon));
toggleCfBtn.addEventListener("click",   createToggleHandler(cfPassInput, eyeIconCf));

// ─── Password strength ───────────────────────────────────────────
function checkPasswordStrength(password) {
  const segs  = [document.getElementById("seg1"), document.getElementById("seg2"), document.getElementById("seg3")];
  const label = document.getElementById("strength-label");
  segs.forEach(s => { s.className = "strength-seg"; });
  label.textContent = "";
  if (!password.length) return;
  let score = 0;
  if (password.length >= 6)  score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  const levels = [
    { cls: "weak",   text: "Yếu",      color: "#ff4757" },
    { cls: "medium", text: "Trung bình", color: "#ffb347" },
    { cls: "strong", text: "Mạnh",     color: "#2ed573" },
  ];
  const lvl = levels[score - 1] || levels[0];
  for (let i = 0; i < score; i++) segs[i].classList.add(lvl.cls);
  label.textContent = lvl.text;
  label.style.color = lvl.color;
}

passInput.addEventListener("input", () => {
  checkPasswordStrength(passInput.value);
  setFieldError("field-password", passError, "");
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
  registerBtn.disabled = isLoading;
  registerBtn.classList.toggle("loading", isLoading);
}

function getFirebaseErrorMessage(code) {
  const messages = {
    "auth/email-already-in-use":   "Email này đã được đăng ký.",
    "auth/invalid-email":          "Định dạng email không hợp lệ.",
    "auth/weak-password":          "Mật khẩu quá yếu, cần ít nhất 6 ký tự.",
    "auth/network-request-failed": "Lỗi kết nối mạng.",
    "auth/operation-not-allowed":  "Chức năng đăng ký chưa được bật.",
    "auth/popup-closed-by-user":   "Bạn đã đóng cửa sổ đăng nhập.",
    "auth/account-exists-with-different-credential":
      "Email này đã được dùng với phương thức đăng nhập khác.",
  };
  return messages[code] || "Đã xảy ra lỗi. Vui lòng thử lại.";
}

// ─── Sau khi đăng nhập/ký thành công ────────────────────────────
function onSuccess(user) {
  showToast("Thành công! Đang chuyển trang...", "success");
  setTimeout(() => { window.location.href = "login.html"; }, 1200);
}

// ─── Validate ────────────────────────────────────────────────────
function validate(email, password, cfPassword) {
  let isValid = true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  setFieldError("field-email",      emailError,  "");
  setFieldError("field-password",   passError,   "");
  setFieldError("field-cfpassword", cfPassError, "");
  if (!emailRegex.test(email)) {
    setFieldError("field-email", emailError, "Email không đúng định dạng");
    isValid = false;
  }
  if (password.length < 6) {
    setFieldError("field-password", passError, "Mật khẩu tối thiểu 6 ký tự");
    isValid = false;
  }
  if (!cfPassword) {
    setFieldError("field-cfpassword", cfPassError, "Vui lòng nhập lại mật khẩu");
    isValid = false;
  } else if (password !== cfPassword) {
    setFieldError("field-cfpassword", cfPassError, "Mật khẩu không khớp");
    isValid = false;
  }
  return isValid;
}

// ─── Email/Password register ─────────────────────────────────────
async function handleRegister() {
  const email  = emailInput.value.trim();
  const pass   = passInput.value.trim();
  const cfPass = cfPassInput.value.trim();
  if (!validate(email, pass, cfPass)) return;
  setLoading(true);
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    onSuccess(cred.user);
  } catch (error) {
    const msg = getFirebaseErrorMessage(error.code);
    showToast(msg, "error");
    if (error.code === "auth/email-already-in-use") {
      setFieldError("field-email", emailError, msg);
    }
  } finally {
    setLoading(false);
  }
}

// ─── Social login (popup) ────────────────────────────────────────
async function handleSocialLogin(providerName) {
  let provider;
  if (providerName === "google")   provider = new GoogleAuthProvider();
  if (providerName === "facebook") provider = new FacebookAuthProvider();
  if (providerName === "twitter")  provider = new TwitterAuthProvider();
  if (!provider) return;
  try {
    const cred = await signInWithPopup(auth, provider);
    showToast("Đăng nhập thành công! Đang chuyển trang...", "success");
    setTimeout(() => { window.location.href = "index.html"; }, 1000);
  } catch (error) {
    showToast(getFirebaseErrorMessage(error.code), "error");
  }
}

// ─── Event Listeners ─────────────────────────────────────────────
registerBtn.addEventListener("click", handleRegister);

[emailInput, passInput, cfPassInput].forEach(input => {
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") handleRegister(); });
});

emailInput.addEventListener("input",  () => setFieldError("field-email",      emailError,  ""));
cfPassInput.addEventListener("input", () => setFieldError("field-cfpassword", cfPassError, ""));

document.querySelectorAll(".btn-social").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const provider = btn.dataset.provider;
    if (provider) handleSocialLogin(provider);
  });
});
