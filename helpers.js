const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();


const getUserByEmail = (email, users) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return undefined;
};

const validateRegistration = (email, password) => {
  if (!email || !password) {
    return { error: 'Email and/or password cannot be empty', status: 400 };
  }
  if (getUserByEmail(email, users)) {
    return { error: 'Email already registered', status: 400 };
  }

  return { error: null, status: 200 };
};

const urlsForUser = (id, urlDatabase) => {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }

  return userURLs;
};

module.exports = {
  validateRegistration,
  getUserByEmail,
  urlsForUser
};