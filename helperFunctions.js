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
};

const validateRegistration = (email, password) => {
  if (!email || !password) {
    return { error: 'Email and/or password cannot be empty', status: 400 };
  }
  for (let userId in users) {
    if (users[userId].email === email) {
      return { error: 'Email already registered', status: 400 };
    }
  }

  return { error: null, status: 200 };
};

module.exports = {validateRegistration};