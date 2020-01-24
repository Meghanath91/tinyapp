//#2 Function to check email exist
const getUserByEmail = function(emailToCheck,database) {
  for (let user in database) {
    if (emailToCheck === database[user]["email"]) {
      return database[user];
    }
  }
  return false;
};
module.exports = { getUserByEmail }