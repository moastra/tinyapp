const express = require('express');
const cookieParser = require('cookie-parser');
const { validateRegistration, getUserByEmail } = require('./helperFunctions');
const app = express();
const PORT = 8080; // default port 8080

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

app.set('view engine', 'ejs');
app.use(cookieParser());

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
  const user = users[req.cookies.user_id];
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

  if (!user || user.password !== password) {
    return res.status(403).send('Wrong email or password used.')
  }

  res.cookie('user_id', user.id);
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
  const userId = generateRandomString();
  users[userId] = { id: userId, email, password }
  console.log(users);
  res.cookie('user_id', userId)
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id].longURL = longURL;
  res.redirect('/urls');
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = getUserById(req.cookies.user_id);
  if (!user) {
    return res.redirect('/login');
  }
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = getUserById(req.cookies.user_id);
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const urlData = urlDatabase[shortURL];

  if (urlData) {
    res.redirect(urlData.longURL);
  } else {
    res.status(404).send('<h1>404 - Not Found</h1><p>The short URL you are trying to access does not exist.</p>');
  }
});

app.get('/register', (req, res) => {
  const user = users[req.cookies.user_id];
  if (user) {
    return res.redirect('/urls');
  }
  const templateVars = { user };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const user = users[req.cookies.user_id];
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