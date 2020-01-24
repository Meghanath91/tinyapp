const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcrypt');

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "a@a.com",
    password: "123"
  }
};
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

app.use(cookieSession({
  name: 'session',
  keys: ['key1','keys2'],
}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const id = req.session["user_id"];
  const user = users[id];

  if (user) {
    let templateVars = {
      urls: urlsForUser(id),
      email:users[req.session["user_id"]].email
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user_id: req.session["user_id"],
    email : users[req.session["user_id"]].email
  };
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL",(req,res) => {
  let templateVars = {
    shortURL : req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.session["user_id"],
    email: users[req.session["user_id"]].email
  };
  res.render("urls_show",templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body['longURL'];
  urlDatabase[shortURL] = { longURL: longURL, userID: req.session["user_id" ]};
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.post("/urls/:shortURL/delete",(req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL",(req,res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

app.get("/login",(req,res)=>{
  res.render("urls_login");
});

app.post("/login",(req,res)=>{
  let user = emailLookUp(req.body.email);
  if (req.body.email.length === 0 || req.body.password === 0) {
    res.send("empty email/password values, Error 400");

  } else if (user) {
    if (passwordChecker(user,req.body.password)) {
      req.session.user_id = user.id;
      res.redirect('/urls');
    } else {
      res.send("invalid password");
    }
  } else {
    res.send("Please Register");
  }
});

app.post("/logout",(req,res)=>{
  req.session = null;
  res.redirect('/urls');
});

app.get("/register",(req,res)=>{
  res.render("urls_register");
});

app.post("/register",(req,res) => {

  let randomID = generateRandomString();
  if (req.body.email.length === 0 || req.body.password === 0) {
    res.send("empty email/password values, Error 400");
  } else if (emailLookUp(req.body.email)) {
    res.send("user already exists, Error 400");
  } else {
    users[randomID] = {
      id:randomID,
      email:req.body.email,
      password:bcrypt.hashSync(req.body.password,10)
    };
    req.session.user_id = randomID;
    res.redirect('/urls');
    console.log("this is user",users);
  }
});

const generateRandomString = function() {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const emailLookUp = function(emailToCheck) {
  for (let element in users) {
    if (emailToCheck === users[element]["email"]) {
      return users[element];
    }
  }
  return false;
};

const passwordChecker = function(user,passwordToCheck) {
  return bcrypt.compareSync(passwordToCheck,user.password);
};

const urlsForUser = function(CookieId) {
  let UrlObj = {};
  for (let element in urlDatabase) {
    if (urlDatabase[element].userID === CookieId) {
      UrlObj[element] = urlDatabase[element];
    }
  }
  return UrlObj;
};