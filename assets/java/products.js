import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

import { app } from "./databaseconfig.js";

// BUG FIX 1: fetchData thiếu `return` → data luôn là undefined → không render được gì
export async function fetchData() {
  try {
    const db = getFirestore(app);
    const querySnapshot = await getDocs(collection(db, "sport"));

    let data = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    return data; // ← FIX: thêm return
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu từ Firebase:", error);
    return [];
  }
}

function templateCon4(p) {
  return `
        <div class="con4-left-item">
            <a href="${p.url}">
                <img src="../assets/image/${p.image}" style="width: 200px" alt="">
                <div class="mini-con4">
                    <h3>${p.title}</h3>
                    <p>${p.desc}</p>
                </div>
            </a>
        </div>
    `;
}

function templateBodyLeft(p) {
  return `
        <div class="body-left-item">
            <a href="#"><img src="../assets/image/${p.image}" alt="news-image" style="width: 110px"></a>
            <a href="${p.url}">
                <p style="font-size: 12px">${p.title}</p>
            </a>
        </div>
    `;
}

function templateBodyCenter(p) {
  return `<div class="body-center-item">
                    <a href="#"><img src="../assets/image/${p.image}"
                            alt="news-image"></a>
                    <a href="${p.url}">
                        <h1>${p.title}</h1>
                    </a>
                    <p>${p.desc}</p>
                </div>
   `;
}

function templateBodyRight(p) {
  return `<div class="body-right-item">
                    <a href="${p.url}"><img
                            src="../assets/image/${p.image}"
                            alt="news-image"></a>
                    <a href="${p.url}">
                        <p>${p.title}</p>
                    </a>
                </div>`;
}

function templateContainer2(p) {
  return `
         <div class="highlight-item">
            <a href="${p.url}">
               <img src="../assets/image/${p.image}" alt="">
               <p>${p.title}</p>
            </a>
         </div>`;
}

function templateContainer3left(p) {
  return `
         <div class="con3-content-left">
            <a href="${p.url}">
               <img src="../assets/image/${p.image}" alt="thumb1">
               <h3>${p.title}</h3>
               <p>${p.desc}</p>
            </a>
         </div>`;
}

function templateContainer3rightleftside(p) {
  return `
         <div class="left-side">
            <div class="left-side-item">
               <a href="${p.url}">
                  <img src="../assets/image/${p.image}" alt="">
                  <p>${p.title}</p>
               </a>
            </div>
         </div>`;
}

function templateContainer3rightrightside(p) {
  return `
         <div class="right-side">
            <div class="right-side-item">
               <a href="${p.url}">
                  <img src="../assets/image/${p.image}" alt="">
                  <p>${p.title}</p>
               </a>
            </div>
         </div>`;
}

function renderSection({ containerId, items, limit, template }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const sliced = items.slice(0, limit);
  container.innerHTML = sliced.map(template).join("");
}

export async function renderData() {
  const data = await fetchData();
  console.log("Dữ liệu Firebase:", data);

  if (!data || data.length === 0) {
    console.warn("Không có dữ liệu từ Firebase hoặc collection rỗng.");
    return;
  }

  renderSection({
    containerId: "product-list",
    items: data,
    limit: 15,
    template: templateCon4,
  });

  renderSection({
    containerId: "body-left",
    items: data.slice(0, 5),
    limit: 5,
    template: templateBodyLeft,
  });

  renderSection({
    containerId: "body-center",
    items: data.slice(5, 6),
    limit: 1,
    template: templateBodyCenter,
  });

  renderSection({
    containerId: "body-right",
    items: data.slice(6, 8),
    limit: 2,
    template: templateBodyRight,
  });

  renderSection({
    containerId: "container2",
    items: data.slice(8, 12),
    limit: 4,
    template: templateContainer2,
  });

  renderSection({
    containerId: "con3-content-left",
    items: data.slice(12, 13),
    limit: 1,
    template: templateContainer3left,
  });

  renderSection({
    containerId: "left-side",
    items: data.slice(13, 15),
    limit: 2,
    template: templateContainer3rightleftside,
  });

  renderSection({
    containerId: "right-side",
    items: data.slice(15, 17),
    limit: 2,
    template: templateContainer3rightrightside,
  });
}

// BUG FIX 2: tolowerCase() → toLowerCase()
// BUG FIX 3: collection "sports" → "sport" (nhất quán với fetchData)
export async function searchProducts(searchText) {
  if (!searchText || searchText.trim() === "") return [];

  const keyword = searchText.trim().toLowerCase(); // ← FIX: tolowerCase → toLowerCase

  try {
    const db = getFirestore(app);
    const q = query(
      collection(db, "sport"), // ← FIX: "sports" → "sport"
      where("title", ">=", keyword),
      where("title", "<=", keyword + "\uf8ff")
    );

    const querySnapshot = await getDocs(q);
    let products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });

    console.log("Kết quả tìm kiếm:", products);
    return products;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm:", error);
    return [];
  }
}
