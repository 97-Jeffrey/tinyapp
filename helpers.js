const getUserByEmail = function(email, database) {
  let result;
  let arr = Object.keys(database);
  for (let user of arr) {
    if (database[user].email === email) {
      result = user;
      break;
    }
  }
  return result;
};

const getUserByEmail2 = function(email,users) {
  let result;
  let arr = Object.keys(users);
  for (let user of arr) {
    if (users[user].email === email) {
      result = users[user].password;
      break;
    }
  }
  return result;
};

module.exports = { getUserByEmail, getUserByEmail2 };