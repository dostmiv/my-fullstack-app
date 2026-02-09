const express = require("express");
const router = express.Router();
const Book = require("../models/Book");

router.get("/users", (req, res) => {
  res.json([
    { id: 1, name: "Ali" },
    { id: 2, name: "Ayşe" }
  ]);
});

router.get("/books", async (req, res) => {
  const books = await Book.find();
  res.json(books);
});
router.post("/books", async (req, res) => {
  try {
    const { title, author } = req.body;
    const book = new Book({
      title,
      author,
    });
    await book.save();
    res.json(book);
  } catch (error) {
    console.error("Error creating book:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Book already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/books/:id", async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/books/:id", async (req, res) => {
  try {
    const { title, author } = req.body;
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author },
      { new: true }
    );
    res.json(book);
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
