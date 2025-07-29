const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



// Function to check if a username already exists
const doesExist = (username) => {
    return users.some(user => user.username === username);
};


// Register new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password || username.trim() === "" || password.trim() === "") {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if user already exists
    if (doesExist(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }

    // Add new user
    users.push({ username, password }); // In production, password should be hashed

    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

/// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
      // Mimic an async operation, even if books is locally available
      const getBooks = async () => books;
  
      const allBooks = await getBooks();
  
      return res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (error) {
      console.error("Error fetching books:", error);
      return res.status(500).json({ message: "Failed to fetch book list." });
    }
  });
  
  const books = require('./booksdb.js');

  // Get book details based on ISBN
  public_users.get('/isbn/:isbn', async function (req, res) {
    try {
      const isbn = req.params.isbn;
  
      // Simulate async fetch
      const getBookByISBN = async (isbn) => {
        return books[isbn];
      };
  
      const book = await getBookByISBN(isbn);
  
      if (book) {
        return res.status(200).send(book);
      } else {
        return res.status(404).json({ message: "Book not found for given ISBN" });
      }
    } catch (error) {
      console.error("Error fetching book by ISBN:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
      const rawAuthor = req.params.author;
      console.log("Received:", rawAuthor);
  
      // Convert hyphens to spaces to handle names like Jane-Austen
      const finalAuthor = rawAuthor.split("-").join(" ");
      console.log("Final Author String:", finalAuthor);
  
      // Async simulation of fetching books by author
      const findBooksByAuthor = async (author) => {
        return Object.values(books).filter(book => book.author === author);
      };
  
      const matchingBooks = await findBooksByAuthor(finalAuthor);
  
      if (matchingBooks.length > 0) {
        res.status(200).json(matchingBooks);
      } else {
        res.status(404).json({ message: "Author not found" });
      }
    } catch (error) {
      console.error("Error fetching books by author:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

// Get book details based on title
public_users.get('/title/:title', async function (req, res) {
    try {
      const rawTitle = req.params.title;
      const finalTitle = rawTitle.split("-").join(" "); // e.g. 'The-Divine-Comedy' => 'The Divine Comedy'
  
      // Simulate async search
      const findBooksByTitle = async (title) => {
        return Object.values(books).filter(book => book.title === title);
      };
  
      const matchingBooks = await findBooksByTitle(finalTitle);
  
      if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
      } else {
        return res.status(404).json({ message: "Title not found" });
      }
    } catch (error) {
      console.error("Error fetching books by title:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn];
  
  if (book) {

    return res.json(book.reviews);

  } else {

    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
