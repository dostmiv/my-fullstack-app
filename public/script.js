// State
let booksData = [];
let currentUser = JSON.parse(localStorage.getItem("user")) || null;
let token = localStorage.getItem("token") || null;

// DOM Elements
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const userInfo = document.getElementById("userInfo");
const usernameDisplay = document.getElementById("usernameDisplay");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const adminControls = document.getElementById("adminControls");

// --- Initialization ---
const init = () => {
  if (token && currentUser) {
    showApp();
  } else {
    showAuth();
  }
};

const showAuth = () => {
  authSection.style.display = "block";
  appSection.style.display = "none";
  userInfo.style.display = "none";
};

const showApp = () => {
  authSection.style.display = "none";
  appSection.style.display = "block";
  userInfo.style.display = "flex";
  usernameDisplay.textContent = `Hello, ${currentUser.username} (${currentUser.role})`;

  if (currentUser.role === 'admin') {
    adminControls.style.display = "block";
  } else {
    adminControls.style.display = "none";
  }

  loadBooks();
};

// --- Auth Actions ---
document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (res.ok) {
      loginSuccess(data);
    } else {
      showToast(data.error || "Login failed", "error");
    }
  } catch (err) {
    showToast("Server error", "error");
  }
});

document.getElementById("registerBtn").addEventListener("click", async () => {
  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;

  try {
    const res = await fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (res.ok) {
      loginSuccess(data);
    } else {
      showToast(data.error || "Registration failed", "error");
    }
  } catch (err) {
    showToast("Server error", "error");
  }
});

const loginSuccess = (data) => {
  token = data.token;
  currentUser = {
    _id: data._id,
    username: data.username,
    role: data.role
  };

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(currentUser));

  showToast("Welcome back!", "success");
  showApp();
};

document.getElementById("logoutBtn").addEventListener("click", () => {
  token = null;
  currentUser = null;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showAuth();
});

// Toggle Auth Forms
document.getElementById("showRegisterLink").addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.style.display = "none";
  registerForm.style.display = "block";
});

document.getElementById("showLoginLink").addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.style.display = "none";
  loginForm.style.display = "block";
});

// --- Book Actions ---

const loadBooks = () => {
  const endpoint = currentUser.role === 'admin' ? "/api/books/admin" : "/api/books";

  fetch(endpoint, {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then((res) => res.json())
    .then((books) => {
      if (Array.isArray(books)) {
        booksData = books;
        renderBooks(booksData);
      } else {
        // Handle 401/403 potentially if token expired
        if (books.error === "Not authorized, token failed") {
          document.getElementById("logoutBtn").click();
        }
      }
    })
    .catch(err => console.error(err));
};

document.getElementById("addBookBtn").addEventListener("click", () => {
  const title = document.getElementById("bookTitle").value;
  const author = document.getElementById("bookAuthor").value;

  if (!title || !author) {
    showToast("Please enter both title and author", "error");
    return;
  }

  fetch("/api/books", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ title, author }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) throw new Error(data.error);

      showToast(data.message || "Book added", "success");
      document.getElementById("bookTitle").value = "";
      document.getElementById("bookAuthor").value = "";
      loadBooks();
    })
    .catch((err) => {
      showToast(err.message, "error");
    });
});

const deleteBook = (id) => {
  if (!confirm("Are you sure?")) return;

  fetch(`/api/books/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then((res) => {
      if (res.ok) {
        showToast("Book deleted", "success");
        loadBooks();
      } else {
        showToast("Failed to delete", "error");
      }
    });
};

const updateStatus = (id, status) => {
  fetch(`/api/books/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) throw new Error(data.error);
      showToast(`Book ${status}`, "success");
      loadBooks();
    })
    .catch(err => showToast(err.message, "error"));
};

// --- Rendering ---
function renderBooks(books) {
  const list = document.getElementById("bookList");
  list.innerHTML = "";

  books.forEach((book) => {
    const card = document.createElement("div");
    card.className = "book-card";

    // Status Badge (for admin or if pending)
    let badge = "";
    if (book.status === 'pending') {
      badge = `<span class="badge badge-pending">Pending Approval</span>`;
    } else if (book.status === 'approved' && currentUser.role === 'admin') {
      badge = `<span class="badge badge-approved">Approved</span>`;
    }

    // Admin Actions
    let adminActions = "";
    if (currentUser.role === 'admin') {
      if (book.status === 'pending') {
        adminActions = `
                    <div class="admin-actions">
                        <button class="btn-approve" onclick="updateStatus('${book._id}', 'approved')">Approve</button>
                    </div>
                `; // Reject effectively just leaves it pending or we could add a reject status. 
        // For now, let's just say Approve or Delete. 
        // Or purely Reject button?
        // Plan said Approve/Reject. Let's add Reject button that maybe sets status to rejected? 
        // Backend enforces 'pending'/'approved'. 
        // So 'Reject' might just mean 'Delete' in this simple app context, 
        // or we need to update enum. 
        // Simple app: Reject = Delete.

        adminActions = `
                    <div class="admin-actions">
                        <button class="btn-approve" onclick="updateStatus('${book._id}', 'approved')">Approve</button>
                        <button class="btn-delete" style="margin:0; font-size: 0.7rem; padding: 0.25rem 0.5rem;" onclick="deleteBook('${book._id}')">Reject</button>
                    </div>
                `;
      } else {
        adminActions = `
                    <button class="btn-delete" onclick="deleteBook('${book._id}')">Delete</button>
                `;
      }
    }

    card.innerHTML = `
            ${badge}
            <div class="book-title">${book.title}</div>
            <div class="book-author">${book.author}</div>
            ${adminActions}
        `;

    list.appendChild(card);
  });
}

// Toast Notification
const showToast = (message, type = "success") => {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-in forwards";
    toast.addEventListener("animationend", () => toast.remove());
  }, 3000);
};

// Search
document.getElementById("searchInput").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = booksData.filter(
    (book) =>
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term)
  );
  renderBooks(filtered);
});

document.getElementById("loadBooksBtn").addEventListener("click", loadBooks);

// Init
init();
