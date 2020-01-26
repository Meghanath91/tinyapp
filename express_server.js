//#########################Variable initialization#########################
const express = require("express");
const app = express(); //initialize express to varaiable app
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session"); // Encrypting Cookies
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt"); // Encrypting Password
const {
  getUserByEmail,
  urlsForUser,
  passwordChecker,
  generateRandomString
} = require("./helpers"); //import functions as objects from helpers.js
//===========================DataBases==========================================
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
// EJS setup for template views
app.set("view engine", "ejs");
//body parsing purpose
app.use(bodyParser.urlencoded({ extended: true }));
//for cookie sessions
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
//===========================GET REQUESTS==========================================
// http://localhost:8080/
app.get("/", (req, res) => {
  res.redirect("/login"); //redirect user to login page
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//Main content page
app.get("/urls", (req, res) => {
  const id = req.session["user_id"];
  const user = users[id];
  //user can only access to their urls if they are loggedin
  if (user) {
    let templateVars = {
      urls: urlsForUser(id, urlDatabase),
      email: users[req.session["user_id"]].email
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login"); //redirect user to login page
  }
});
//to show the new urls page
app.get("/urls/new", (req, res) => {
  //if user loggedin
  if (users[req.session["user_id"]]) {
    let templateVars = {
      user_id: req.session["user_id"],
      email: users[req.session["user_id"]].email
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login"); //if user not loggedin redirect to login page
  }
});
//page that shows generated shortURL
app.get("/urls/:shortURL", (req, res) => {
  //user loggedin
  if (users[req.session["user_id"]]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user_id: req.session["user_id"],
      email: users[req.session["user_id"]].email
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login"); //if user not loggedin redirect to login page
  }
});
//redirect to the original website using shortURL
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

//LOGIN page
app.get("/login", (req, res) => {
  res.render("urls_login");
});
//register page
app.get("/register", (req, res) => {
  res.render("urls_register");
});

//===========================GET REQUESTS==========================================
//creating a new short url for a given longURL
app.post("/urls", (req, res) => {
  if (req.body["longURL"].length) {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body["longURL"],
      userID: req.session["user_id"]
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send("please enter a valid URL");
  }
});
//if user loggedin then user can delete urls
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});
//if user loggedin then user can edit long url
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});
//login operation
app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email, users);
  //if input is empty return error message
  if (req.body.email.length === 0 || req.body.password === 0) {
    res.send("empty email/password values, Error 400");
  } else if (user) {
    //if user already exists then it will check for password validation
    if (passwordChecker(user, req.body.password)) {
      //if password is right allow user to acces urls
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      //if it's invalid password send error message
      res.send("invalid password");
    }
  } else {
    //if user doesn't exist send message
    res.send(`<font size="+3">Please Register</font>`);
  }
});
//#LOGOUT page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
//#REGISTER page
app.post("/register", (req, res) => {
  let randomID = generateRandomString();
  //if user submit without entering email & password
  if (req.body.email.length === 0 || req.body.password === 0) {
    res.send(`empty email/password values,Error 400`);
  } else if (getUserByEmail(req.body.email, users)) {
    res.send("user already exists, Error 400"); // if user already registerd then return a error message
  } else {
    //if it's a new user then allow user to register
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = randomID;
    res.redirect("/urls");
  }
});
