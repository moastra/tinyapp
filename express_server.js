const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { users, validateRegistration, getUserByEmail, urlsForUser, getUserById } = require('./helpers');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
app.set('view engine', 'ejs');
const salt = bcrypt.genSaltSync(10);
const methodOverride = require('method-override');


app.use(methodOverride('_method'));

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_KEY1, process.env.SESSION_KEY2]
}));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
    visitCount: 0,
    uniqueVisits: new Set(),
    visitHistory: []
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    visitCount: 0,
    uniqueVisits: new Set(),
    visitHistory: []
  },
};


function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) =>{
  if (!req.session.visitor_id) {
    req.session.visitor_id = generateRandomString();
  }
  next();
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(401).send('You need to be logged in to shorten URLs.');
  }
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;


  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userID,
    visitCount: 0,
    uniqueVisits: new Set(),
    visitHistory: []
   };

  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('Wrong email or password used.');
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const validation = validateRegistration(email, password);
  if (validation.error) {
    return res.status(validation.status).send(validation.error);
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();
  users[userId] = { id: userId, email, password: hashedPassword };


  req.session.user_id = userId;

  console.log('Updated users object: ', users);
  console.log("Registered user: ", users[userId]);
  console.log("Session after registration: ", req.session);
  res.redirect('/urls');
});

app.delete('/urls/:id', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send('Please log in to delete this URL.');
  }

  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send('URL not found.');
  }

  if (url.userID !== user.id) {
    return res.status(403).send('You do not have access to delete this URL.');
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.put('/urls/:id', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send('Please log in to update this URL.');
  }

  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send('URL not found.');
  }

  if (url.userID !== user.id) {
    return res.status(403).send('You do not have access to update this URL.');
  }

  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.get('/', (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send('Please log in or register first.');
  }
  const userURLs = urlsForUser(user.id, urlDatabase);
  const templateVars = { urls: userURLs, user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = getUserById(req.session.user_id);

  console.log("Session user ID while accessing /urls/new: ", req.session.user_id);
  console.log("User found from session: ", user);

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

  const visitHistory = url.visitHistory || [];
  
  const templateVars = {
    id: req.params.id,
    longURL: url.longURL,
    user,
    visitCount: url.visitCount,
    uniqueVisits: url.uniqueVisits ? url.uniqueVisits.size: 0,
    visitHistory
  };

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

  urlData.visitCount++;
  urlData.uniqueVisits.add(req.session.visitor_id);
  urlData.visitHistory.push({ timestamp: new Date(), visitor_id: req.session.visitor_id});

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