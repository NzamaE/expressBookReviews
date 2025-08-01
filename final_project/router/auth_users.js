const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid


}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.

let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
});
// Return true if any valid user is found, otherwise false
if (validusers.length > 0) {
    return true;
} else {
    return false;
}

}

/// Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).json({ message: "Username or password missing" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token with username (not password)
        let accessToken = jwt.sign({ username }, 'access', { expiresIn: 60});

        // Store token and username in session
        req.session.authorization = { accessToken, username };

        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(401).json({ message: "Invalid login. Check username and password" });
    }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                const username = user.username; // Get the username from JWT
                const isbn = req.params.isbn;
                const review = req.body.review;

                const book = books[isbn];

                if (!book) {
                    return res.status(404).json({ message: "Book not found" });
                }

                if (!review) {
                    return res.status(400).json({ message: "Review text missing" });
                }

                // Initialize reviews object if missing
                if (!book.reviews) {
                    book.reviews = {};
                }

                // Add or update the review for this user
                book.reviews[username] = review;

                return res.send("Review added/updated successfully.");
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    if (req.session.authorization) {
        const token = req.session.authorization['accessToken'];

        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                const username = user.username;
                const isbn = req.params.isbn;

                const book = books[isbn];
                if (!book) {
                    return res.status(404).json({ message: "Book not found" });
                }

                if (!book.reviews || !book.reviews[username]) {
                    return res.status(404).json({ message: "No review by this user to delete" });
                }

                // Delete the user's review
                delete book.reviews[username];

                return res.status(200).json({ message: "Review deleted successfully" });
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
