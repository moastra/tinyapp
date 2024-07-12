const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "pokemon@go.com",
    password: "catchem"
  }
};

const getUserByEmail = (email) =>{
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

const validateRegistration = (email, password) => {
  if (!email || !password) {
    return { error: 'Email and/or password cannot be empty', status: 400 };
  }
  if (getUserByEmail(email)) {
      return { error: 'Email already registered', status: 400 };
  }

  return { error: null, status: 200 };
};

const urlsForUser = (id) => {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID ===id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }

  return userURLs;
}

module.exports = {
  validateRegistration,
  getUserByEmail,
  urlsForUser
};