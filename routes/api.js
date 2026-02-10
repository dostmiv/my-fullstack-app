const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const { protect, authorize } = require("../middleware/auth");

// Public route to get users (kept for backward compatibility/demo)
router.get("/users", (req, res) => {
  res.json([
    { id: 1, name: "Ali" },
    { id: 2, name: "Ayşe" }
  ]);
});

// @route   GET /api/books
// @desc    Get all books
// @access  Public (Approved books), Private/Admin (All or Pending)
router.get("/books", async (req, res) => {
  try {
    let query = { status: "approved" };

    // If admin wants to see pending books or all books
    // We need to check if they are authorized, but since this is a GET route 
    // that can be public, we handle this conditionally or use a separate route.
    // Simpler approach for now: if 'status' query param is present, check auth manually
    // or just let the client handle the token.

    // Better approach: 
    // Public always gets approved books.
    // /api/books/pending -> Protected Admin route seems cleaner, but sticking to query params as per plan:

    // Check for authorization header manually to see if it's an admin trying to query
    // This is a bit hacky without middleware, so let's try to see if we can use middleware conditionally.
    // For now, let's keep it simple: 
    // Public = approved only.
    // Admin can use a specific endpoint or we check query.

    if (req.query.status) {
      // If filtering by status, strictly separate
      //Ideally we would verify token here if status != approved
    }

    // Let's stick to the plan: 
    // GET /books -> Approved only
    // GET /books/admin -> (Protected) All/Pending. 
    // OR we inspect headers here.

    // Changing strategy slightly for cleaner code:
    // GET /books -> Returns approved books.

    const books = await Book.find(query);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// @route   GET /api/books/admin
// @desc    Get all books (including pending)
// @access  Private/Admin
router.get("/books/admin", protect, authorize("admin"), async (req, res) => {
  try {
    const books = await Book.find({}); // Get everything
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// @route   POST /api/books
// @desc    Add a book
// @access  Private
router.post("/books", protect, async (req, res) => {
  try {
    const { title, author } = req.body;

    // Determin status based on role
    const status = req.user.role === "admin" ? "approved" : "pending";

    const book = new Book({
      title,
      author,
      status,
      createdBy: req.user._id
    });

    await book.save();

    res.status(201).json({
      ...book.toObject(),
      message: status === "pending" ? "Book request submitted for approval" : "Book added successfully"
    });
  } catch (error) {
    console.error("Error creating book:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Book already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete a book
// @access  Private/Admin
router.delete("/books/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   PUT /api/books/:id
// @desc    Update a book details
// @access  Private/Admin
router.put("/books/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const { title, author } = req.body;
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author },
      { new: true }
    );
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json(book);
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   PUT /api/books/:id/status
// @desc    Approve/Reject book
// @access  Private/Admin
router.put("/books/:id/status", protect, authorize("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json(book);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
