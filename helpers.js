//#2 Function to check email exist
const getUserByEmail = function(emailToCheck,database) {
  for (let user in database) {
    if (emailToCheck === database[user]["email"]) {
      return database[user];
    }
  }
  return false;
};
//#4 function to return URLs for particular user/unique id
const urlsForUser = function(CookieId,urlDatabase) {
  let UrlObj = {};
  for (let element in urlDatabase) {
    if (urlDatabase[element].userID === CookieId) {
      UrlObj[element] = urlDatabase[element];
    }
  }
  return UrlObj;
};

module.exports = {getUserByEmail,urlsForUser }