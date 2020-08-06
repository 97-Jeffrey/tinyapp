const getUserbyEmail = function (email, database) {
  let result = '';
  let arr = Object.keys(database);
  for (let user of arr) {
    if (database[user].email === email) {
      result = user;
      break;
    }
  }
  return result;
}


module.exports = { getUserbyEmail };