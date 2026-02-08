let booksData = [];

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
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, 3000);
};

const deleteBook = (id) => {
  fetch(`/api/books/${id}`, { method: "DELETE" })
    .then((res) => {
      if (res.ok) {
        showToast("Book deleted successfully", "success");
        loadBooks();
      } else {
        showToast("Failed to delete book", "error");
      }
    })
    .catch((err) => console.error(err));
};

const saveEdit = (id) => {
  const title = document.getElementById(`edit-title-${id}`).value;
  const author = document.getElementById(`edit-author-${id}`).value;

  fetch(`/api/books/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, author }),
  })
    .then((res) => res.json())
    .then(() => {
      showToast("Book updated successfully", "success");
      loadBooks();
    })
    .catch((err) => {
      console.error(err);
      showToast("Failed to update book", "error");
    });
};

const cancelEdit = () => {
  renderBooks(booksData);
};

const editBook = (id) => {
  const book = booksData.find((b) => b._id === id);
  if (!book) return;

  // Find the card element to replace content
  // Actually simplest way is to re-render ALL books but mark this one as 'editing'
  renderBooks(booksData, id);
};

function renderBooks(books, editingId = null) {
  const list = document.getElementById("bookList");
  list.innerHTML = ""; // Clear list

  books.forEach((book) => {
    const card = document.createElement("div");
    card.className = "book-card";

    if (editingId === book._id) {
      card.innerHTML = `
            <input type="text" value="${book.title}" id="edit-title-${book._id}" style="margin-bottom: 0.5rem; width: 100%;">
            <input type="text" value="${book.author}" id="edit-author-${book._id}" style="margin-bottom: 0.5rem; width: 100%;">
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="saveEdit('${book._id}')" style="flex: 1; background: #10b981;">Save</button>
                <button onclick="cancelEdit()" style="flex: 1; background: #6b7280;">Cancel</button>
            </div>
        `;
    } else {
      const title = document.createElement("div");
      title.className = "book-title";
      title.textContent = book.title;

      const author = document.createElement("div");
      author.className = "book-author";
      author.textContent = book.author;

      const actionsObj = document.createElement("div");
      actionsObj.style.display = "flex";
      actionsObj.style.gap = "0.5rem";
      actionsObj.style.marginTop = "1rem";

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.style.flex = "1";
      editBtn.style.padding = "0.5rem";
      editBtn.style.fontSize = "0.8rem";
      editBtn.onclick = () => editBook(book._id);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn-delete";
      deleteBtn.textContent = "Delete";
      deleteBtn.style.marginTop = "0"; // Override margin
      deleteBtn.style.flex = "1";
      deleteBtn.onclick = () => deleteBook(book._id);

      actionsObj.appendChild(editBtn);
      actionsObj.appendChild(deleteBtn);

      card.appendChild(title);
      card.appendChild(author);
      card.appendChild(actionsObj);
    }
    list.appendChild(card);
  });
}

function loadBooks() {
  fetch("/api/books")
    .then((res) => res.json())
    .then((books) => {
      booksData = books;
      renderBooks(booksData);
    });
}

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
    },
    body: JSON.stringify({ title, author }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((err) => {
          throw new Error(err.error || "Failed to add book");
        });
      }
      return res.json();
    })
    .then((data) => {
      showToast("Book added successfully!", "success");
      document.getElementById("bookTitle").value = "";
      document.getElementById("bookAuthor").value = "";
      loadBooks(); // Reload the list
    })
    .catch((err) => {
      showToast(err.message, "error");
    });
});
