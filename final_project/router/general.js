const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
async function getBooksAsync() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(books), 1000);
  });
}

function getBookDetails(isbn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const bookDetails = books[isbn];
      if (bookDetails) {
        resolve(bookDetails);
      } else {
        reject(new Error("Book not found"));
      }
    }, 1000);
  });
}
function getAuthorBooks(author) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const matchingBooks = [];
      Object.keys(books).forEach((isbn) => {
        if (books[isbn].author === author) {
          matchingBooks.push({ isbn, details: books[isbn] });
        }
      });
      if (matchingBooks.length > 0) resolve(matchingBooks);
      else reject(new Error("books for the author not found"));
    }, 1000);
  });
}
function getBooksByTitle(title) {
  return new Promise((resolve) => {
    const matchingBooks = [];

    Object.keys(books).forEach((isbn) => {
      if (books[isbn].title === title) {
        matchingBooks.push({ isbn, details: books[isbn] });
      }
    });

    resolve(matchingBooks);
  });
}
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  if (users[username]) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Register the user
  users[username] = { username, password };
  return res
    .status(201)
    .json({ message: "Customer Successfully Registered, now you can login" });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const books = await getBooksAsync();
    return res.status(200).json({ books });
  } catch (err) {
    return res.status(404).send(`books not found`);
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  const { isbn } = req.params;

  try {
    const bookDetails = await getBookDetails(isbn);
    return res.status(200).json(bookDetails);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});



// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  const { author } = req.params;
  try {
    const matchingBooks = await getAuthorBooks(author);
    return res.status(200).json({ booksbyauthor: matchingBooks });
  } catch (error) {
    return res
      .status(404)
      .json({ message: "Books by the specified author not found" });
  }
});

// Get all books based on title

public_users.get("/title/:title", async function (req, res) {
  const { title } = req.params;

  try {
    const matchingBooks = await getBooksByTitle(title);

    if (matchingBooks.length > 0) {
      return res.status(200).json({ booksbytitle: matchingBooks });
    } else {
      return res
        .status(404)
        .json({ message: "Books by the specified title not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});


//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const { isbn } = req.params;

  if (books[isbn]) {
    const bookReview = books[isbn].reviews || {};
    return res.status(200).json(bookReview);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
