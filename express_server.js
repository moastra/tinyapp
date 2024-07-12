const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { validateRegistration, getUserByEmail, urlsForUser } = require('./helperFunctions');
const app = express();
const PORT = 8080; // default port 8080

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "pokemon@go.com",
    password: bcrypt.hashSync("catchem", 10)
  }
};

app.set('view engine', 'ejs');

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};


const getUserById = (userId) => {
  return users[userId];
}

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

app.use(express.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send('You need to be logged in to shorten URLs.');
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: user.id };
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('Wrong email or password used.')
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const validation = validateRegistration(email, password);
  if (validation.error) {
    return res.status(validation.status).send(validation.error);
  }

    const hashedPassword = bcrypt.hashSync(password,10);
    const userId = generateRandomString();
    users[userId] = { id: userId, email, password: hashedPassword }
    console.log(users);
    req.session.user_id = userId;
    res.redirect('/urls');
  });

app.post('/urls/:id/delete', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send('Please log in to delete this URL.');
  }

  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status (404).send('URL not found.');
  }

  if (url.userID !== user.id) {
    return res.status(403).send('You do not have access to delete this URL.')
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send('Please log in to update this URL.');
  }

  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status (404).send('URL not found.');
  }

  if (url.userID !== user.id) {
    return res.status(403).send('You do not have access to update this URL.')
  }

  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send('Please log in or register first.');
  }
  const userURLs = urlsForUser(user.id);
  const templateVars = { urls: userURLs, user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = getUserById(req.session.user_id);
  if (!user) {
    return res.redirect('/login');
  }
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send('Please log in to view.');
  }
  const url = urlDatabase[req.params.id];

  if (!url) {
    return res.status(404).send('URL not found.');
  }

  if (url.userID !== user.id) {
    return res.status(403).send('You do not have permission to view this URL.');
  }
  const templateVars = { id: req.params.id, longURL: url.longURL, user };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const urlData = urlDatabase[shortURL];
  const longURL = urlData.longURL;

  if (urlData) {
    res.redirect(urlData.longURL);
  } else {
    res.status(404).send('<h1>404 - Not Found</h1><p>The short URL you are trying to access does not exist.</p>');
  }

  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    return res.redirect('/urls');
  }
  const templateVars = { user };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    return res.redirect('/urls');
  }
  const templateVars = { user };
  res.render('login', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});