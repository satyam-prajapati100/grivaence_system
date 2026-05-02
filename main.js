console.log("NEW JS LOADED ✅");
let map = null;
/* ================= LOGIN ================= */
async function loginUser() {
  let username = document.getElementById("username")?.value.trim();
  let password = document.getElementById("password")?.value.trim();

  try {
    let res = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    let data = await res.json();
    console.log("Login response:", data);

    if (data.status !== "success") {
      alert("Invalid login ❌");
      return;
    }

    let role = (data.role || "").toLowerCase();

    // ✅ SAVE DATA
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);

    console.log("SAVED:", username, role);

    // ✅ REDIRECT
    if (role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "index.html";
    }

  } catch (err) {
    console.error(err);
    alert("Server error ❌");
  }
}


/* ================= SIGNUP ================= */
async function signupUser() {
  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value.trim();
  let role = document.getElementById("role").value;

  try {
    let res = await fetch("http://127.0.0.1:8000/signup", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username, password, role })
    });

    let data = await res.json();

    if (data.status === "success") {
      alert("Signup success ✅");
      window.location.href = "login.html";
    } else {
      alert(data.msg || "Signup failed ❌");
    }

  } catch (err) {
    console.error(err);
    alert("Server error ❌");
  }
}


/* ================= PROFILE ================= */
function loadProfile() {
  let name = localStorage.getItem("username");
  let role = localStorage.getItem("role");

  console.log("LOADED:", name, role);

  if (document.getElementById("profileName")) {
    document.getElementById("profileName").innerText = name || "Guest";
  }

  if (document.getElementById("profileRole")) {
    document.getElementById("profileRole").innerText = role || "Guest";
  }
}


/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}


/* ================= PROFILE TOGGLE ================= */
function toggleProfile() {
  let box = document.getElementById("profileBox");
  if (!box) return;
  box.classList.toggle("hidden");
}




/* ================= AUTH CHECK ================= */
function checkAuth() {
  let user = localStorage.getItem("username");

  if (!user) {
    alert("Please login first ❌");
    window.location.href = "login.html";
  }
}


/* ================= NAVIGATION ================= */
function openSignup() {
  window.location.href = "signup.html";
}


/* ================= ADMIN SECTION ================= */
function showSection(id) {

  // remove active from all
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
  });

  // add active to selected
  let active = document.getElementById(id);
  active.classList.add("active");

  // highlight sidebar button
  document.querySelectorAll(".sidebar button").forEach(btn => {
    btn.classList.remove("active-btn");
  });

  event.target.classList.add("active-btn");

  // map fix
  if (id === "mapSection") {
    setTimeout(() => {
      loadMap();
      if (map) map.invalidateSize();
    }, 300);
  }
}


/* ================= LOAD COMPLAINTS ================= */
async function loadComplaints() {
  try {
    let res = await fetch("http://127.0.0.1:8000/complaints");
    let data = await res.json();

    let table = document.getElementById("tableBody");
    if (!table) return;

    table.innerHTML = "";

    data.forEach(c => {
      table.innerHTML += `
        <tr>
          <td>${c[0]}</td>
          <td>${c[1]}</td>
          <td>${c[2]}</td>
          <td>${c[3]}</td>
          <td>${c[4]}</td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Load error:", err);
  }
}


/* ================= SINGLE WINDOW ONLOAD ================= */
window.onload = function () {

  let role = localStorage.getItem("role");
  let path = window.location.pathname;

  console.log("Page:", path, "| Role:", role);

  // ✅ Load profile everywhere
  loadProfile();

  // ✅ Hide admin link
  let adminLink = document.getElementById("adminLink");
  if (adminLink && role !== "admin") {
    adminLink.style.display = "none";
  }

  // ✅ Protect admin page ONLY
  if (path.includes("admin.html")) {

    if (!role) {
      alert("Login first ❌");
      window.location.href = "login.html";
      return;
    }

    if (role !== "admin") {
      alert("Access denied ❌");
      window.location.href = "index.html";
      return;
    }

    showSection("dashboard");
  }

  // ✅ Load complaints if table exists
  if (document.getElementById("tableBody")) {
    loadComplaints();
  }
  // Load saved theme
let savedTheme = localStorage.getItem("theme") || "dark";
document.body.classList.add(savedTheme);
};

// dark and light mode /////////////
// function toggleTheme() {
//   let current = document.body.classList.contains("dark") ? "dark" : "light";

//   if (current === "dark") {
//     document.body.classList.remove("dark");
//     document.body.classList.add("light");
//     localStorage.setItem("theme", "light");
//   } else {
//     document.body.classList.remove("light");
//     document.body.classList.add("dark");
//     localStorage.setItem("theme", "dark");
//   }
// }


function toggleTheme() {
  let btn = document.querySelector(".theme-btn");

  if (document.body.classList.contains("dark")) {
    document.body.classList.remove("dark");
    document.body.classList.add("light");
    btn.innerText = "🌙";
    localStorage.setItem("theme", "light");
  } else {
    document.body.classList.remove("light");
    document.body.classList.add("dark");
    btn.innerText = "☀️";
    localStorage.setItem("theme", "dark");
  }
}

function openMap() {
  window.location.href = "map.html";
}






  



  // Prevent reloading map multiple times


function loadMap() {

  if (map) return;

  map = L.map('map').setView([23.2599, 77.4126], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  fetch("http://127.0.0.1:8000/complaints")
    .then(res => res.json())
    .then(data => {

      data.forEach(c => {

        let text = c[1];
        let category = c[2];
        let priority = c[3];

        let lat = 23.25 + Math.random() * 0.1;
        let lng = 77.41 + Math.random() * 0.1;

        L.marker([lat, lng]).addTo(map)
          .bindPopup(`
            <b>${text}</b><br>
            ${category} | ${priority}
          `);
      });

    });
}


function showSection(id) {

  // hide all sections
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
  });

  // show selected section
  document.getElementById(id).classList.add("active");

  // load map when opened
  if (id === "mapSection") {
    setTimeout(() => {
      loadMap();
      if (map) map.invalidateSize();
    }, 200);
  }
}

document.addEventListener("DOMContentLoaded", function () {

  let btn = document.getElementById("profileBtn");
  let box = document.getElementById("profileBox");

  if (btn && box) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      box.classList.toggle("show");
    });

    document.addEventListener("click", function () {
      box.classList.remove("show");
    });
  }
});

