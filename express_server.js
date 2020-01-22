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
}


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
  let templateVars = { urls: urlDatabase,username: req.cookies["username"] };
 // console.log(urlDatabase)
 // console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL",(req,res) => {
  let templateVars = {shortURL : req.params.shortURL,longURL: urlDatabase[req.params.shortURL],username: req.cookies["username"] };
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

  res.redirect(`/urls`)
})

app.post("/urls/:shortURL",(req,res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;

  res.redirect(`/urls`)
})

app.post("/login",(req,res)=>{
  res.cookie("username",req.body.username);
  res.redirect('/urls')
})

app.post("/logout",(req,res)=>{
  res.clearCookie("username")
  res.redirect('/urls')
})

app.get("/register",(req,res)=>{
  res.render("urls_register")

})

app.post("/register",(req,res) => {

  let randomID = generateRandomString();
  console.log("this is req.body",req.body)
  res.cookie("user_id",randomID);
  users[randomID] = {id:randomID,email:req.body.email,password:req.body.password}
  res.redirect('/urls')
})


const generateRandomString = function() {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
