const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return  res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  

  return res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const rawAuthor = req.params.author;
    console.log("Received:", rawAuthor);
    
    // Replace hyphens with spaces (works better for multi-word names)
    const finalAuthor = rawAuthor.split("-").join(" ");
    console.log("Final Author String:", finalAuthor);
    
    // Find books that match this author
    const matchingBooks = [];
    for (let key in books) {
      if (books[key].author === finalAuthor) {
        matchingBooks.push(books[key]);
      }
    }
  
    if (matchingBooks.length > 0) {
      res.send(matchingBooks);
    } else {
      res.status(404).send({ message: "Author not found" });
    }
  });
  

  public_users.get('/title/:title', function (req, res) {
    const rawTitle = req.params.title;
    const finalTitle = rawTitle.split("-").join(" "); // e.g. 'The-Divine-Comedy' => 'The Divine Comedy'
  
    const matchingBooks = [];
  
    for (let key in books) {

      if (books[key].title === finalTitle) {
        matchingBooks.push(books[key]);



      }
    }
  
    if (matchingBooks.length > 0) {

      return res.json(matchingBooks);

    } else {

      return res.status(404).json({ message: "Title not found" });
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
