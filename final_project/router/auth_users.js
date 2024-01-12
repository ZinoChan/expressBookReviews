const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return username.trim().length > 0;
};

const authenticatedUser = (username, password) => {
  const user = users[username] && users[username].username === username && users[username].password === password;
  console.log(user, users)
  return !!user;
};

// only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username is valid
  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username format" });
  }

  // Check if the user is authenticated
  if (authenticatedUser(username, password)) {
    // Generate JWT token
    const accessToken = jwt.sign({ username }, 'fingerprint_customer');

    // Save the user credentials for the session
    req.session.accessToken = accessToken;
    req.session.user = { username };

    return res.status(200).json({ message: "Customer Successfully logged in", accessToken });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;


  // Check if the book with the specified ISBN exists
   if (books[isbn]) {
    // Check if the user has already posted a review for the same ISBN
    if (books[isbn].reviews && books[isbn].reviews[req.session.user.username]) {
      // Modify the existing review
      books[isbn].reviews[req.session.user.username] = review;
      return res.status(200).json({ message: `The review for the book with ISBN ${isbn} has been added/updated.` });
    } else {
      // Add a new review
      books[isbn].reviews = books[isbn].reviews || {};
      books[isbn].reviews[req.session.user.username] = review;
      return res.status(200).json({ message: `The review for the book with ISBN ${isbn} has been added/updated.` });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  if (books[isbn]) {
    const username = req.session.user.username;
    // Check if the user has posted a review for the same ISBN
    if (books[isbn].reviews && books[isbn].reviews[username]) {
      // Delete the user's review
      delete books[isbn].reviews[username];
      res.status(200).json({ message: `The review for the ISBN ${isbn} posted by the user ${username} deleted.` });
    } else {
      res.status(404).json({ message: "Review not found for the specified ISBN" });
    }
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
