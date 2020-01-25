const bcrypt = require("bcrypt"); // Encrypting Password
// #1 Function to generate Random string
const generateRandomString = function() {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
//#2 Function to check email exist
const getUserByEmail = function(emailToCheck, database) {
  for (let user in database) {
    if (emailToCheck === database[user]["email"]) {
      return database[user];
    }
  }
  return false;
};
//#3 function to check passwords match
const passwordChecker = function(user, passwordToCheck) {
  return bcrypt.compareSync(passwordToCheck, user.password);
};

//#4 function to return URLs for particular user/unique id
const urlsForUser = function(CookieId, urlDatabase) {
  let UrlObj = {};
  for (let element in urlDatabase) {
    if (urlDatabase[element].userID === CookieId) {
      UrlObj[element] = urlDatabase[element];
    }
  }
  return UrlObj;
};

module.exports = {
  getUserByEmail,
  urlsForUser,
  passwordChecker,
  generateRandomString
};
