//###Variable initialization#####
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");// Encrypting Cookies
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");// Encrypting Password
const {getUserByEmail, urlsForUser, passwordChecker, generateRandomString} = require("./helpers");
//Model of Database for Users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "a@a.com",
    password: "123"
  }
};
//Model of Database for URLs
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "keys2"]
  })
);
//sending message to console
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//Main content page
app.get("/urls", (req, res) => {
  const id = req.session["user_id"];
  const user = users[id];

  if (user) {
    let templateVars = {
      urls: urlsForUser(id,urlDatabase),
      email: users[req.session["user_id"]].email
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});
//to show the new urls page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user_id: req.session["user_id"],
    email: users[req.session["user_id"]].email
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.session["user_id"],
    email: users[req.session["user_id"]].email
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body["longURL"];
  urlDatabase[shortURL] = { longURL: longURL, userID: req.session["user_id"] };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});
//#LOGIN page
app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email,users);
  if (req.body.email.length === 0 || req.body.password === 0) {
    res.send("empty email/password values, Error 400");
  } else if (user) {
    if (passwordChecker(user, req.body.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.send("invalid password");
    }
  } else {
    res.send(`<font size="+3">Please Register</font>`);
  }
});
//#LOGOUT page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
//#REGISTER page
app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  let randomID = generateRandomString();
  if (req.body.email.length === 0 || req.body.password === 0) {
    res.send(`empty email/password values,Error 400`);
  } else if (getUserByEmail(req.body.email,users)) {
    res.send("user already exists, Error 400");
  } else {
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = randomID;
    res.redirect("/urls");
  }
});
