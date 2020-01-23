const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  
  let templateVars = { urls: urlDatabase,user_id: req.cookies["user_id"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"]
  };
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL",(req,res) => {
  let templateVars = {shortURL : req.params.shortURL,longURL: urlDatabase[req.params.shortURL],user_id: req.cookies["user_id"]};
  //console.log(templateVars)
  res.render("urls_show",templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body['longURL'];
  urlDatabase[shortURL] = longURL;
  
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.post("/urls/:shortURL/delete",(req,res) => {
  delete urlDatabase[req.params.shortURL];

  res.redirect(`/urls`);
});

app.post("/urls/:shortURL",(req,res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;

  res.redirect(`/urls`);
});

app.get("/login",(req,res)=>{
  let templateVars = {users};
  res.render("urls_login");
});

app.post("/login",(req,res)=>{
  let user = emailLookUp(req.body.email)
  if (req.body.email.length === 0 || req.body.password === 0) {
    res.send("empty email/password values, Error 400");

  } else if (user) {
    if(passwordChecker(user,req.body.password)){
      res.cookie("user_id",users["user_id"]);
      res.redirect('/urls');
    } else {
      res.send("invalid password");
    }
  } else {
    res.redirect('/register');
  }
});

app.post("/logout",(req,res)=>{
  res.clearCookie("user_id");
  res.redirect('/urls');
});

app.get("/register",(req,res)=>{
  res.render("urls_register");

});

app.post("/register",(req,res) => {

  let randomID = generateRandomString();
  console.log("this is user",users);
  if (req.body.email.length === 0 || req.body.password === 0) {
    res.send("empty email/password values, Error 400");
  } else if (emailLookUp(req.body.email)) {
    res.send("user already exists, Error 400");
  } else {
    users[randomID] = {id:randomID,email:req.body.email,password:req.body.password};
    res.cookie("user_id",randomID);
    res.redirect('/urls');
    console.log(users);
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
  if (passwordToCheck === user.password){
    return true;
    }
    return false;
  }