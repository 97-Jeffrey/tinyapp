const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const { getUserbyEmail } = require('./helpers');
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.set('view engine', "ejs");
app.use(cookieSession({
  name: 'week3day4',
  keys: ['my-secret-dont-tell']
}));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
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

function generateRandomString() {
  let alphaNum = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += alphaNum[Math.floor(Math.random() * alphaNum.length)];
  }
  return randomString;
}


// two helper functions:
// const getUserbyEmail = function (email, database) {
//   let result = '';
//   let arr = Object.keys(database);
//   for (let user of arr) {
//     if (database[user].email === email) {
//       result = user;
//       break;
//     }
//   }
//   return result;
// }

const getUserbyEmail2 = function(email){
  let result = '';
  let arr = Object.keys(users);
  for (let user of arr) {
    if (users[user].email === email) {
      result = users[user].password;
      break;
    }
  }
  return result;
}
// helper function
const getUserBypassword = function(email,password){
  let arr =Object.keys(users);
  let result;
  for(let user of arr){
    if(users[user].email === email){
      if(users[user].password === password){
        return user;
      }
    }
  }
  
}



//user authentication:

app.get('/register', (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: users[req.session['user_id']] };
  res.render('urls_register', templateVars);
})

app.get('/login', (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: users[req.session['user_id']] };
  res.render('urls_login', templateVars);
})




app.post('/register', (req, res) => {
  const randomId = generateRandomString();
  const user = req.body;
  // const arr = Object.keys(users);
  const password = user.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!user.email || !user.password) {
    res.send(`Error code 400 : please fill in both Email and password`);
  }
  else if (getUserbyEmail(user.email, users)) {                           // right here!!!!
    res.send(`Error code 400 : this email is already registered`);

  } else {
    users[randomId] = {};
    users[randomId]['id'] = randomId;
    users[randomId]['email'] = user.email;
    users[randomId]['password'] = hashedPassword;
    console.log(users);
    //res.cookie('user_id', randomId); // 
    req.session.user_id = randomId; 
    res.redirect('/urls');
  }

})







app.get("/urls", (req, res) => {
  let filterURL ={};
  for(let url in urlDatabase){
    // console.log(req.cookies['user_id'], urlDatabase[url].userID);
    if(urlDatabase[url].userID === req.session['user_id'] ){
      filterURL[url] = urlDatabase[url];
    }
  }
  // console.log(filterURL);
  let templateVars = { urls: filterURL, user_id: users[req.session['user_id']]};
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: users[req.session['user_id']]};
  if(!templateVars["user_id"]){
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
})

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const user_id = users[req.session['user_id']];
  let templateVars = { shortURL, longURL, user_id };
  res.render("urls_show", templateVars);
});


// link the generated url to the real url users submitted, and redirect user into their address:
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  //  console.log('longURL===', longURL);
  console.log(req.params);
  res.redirect(longURL);
})

// direct to urls add the input address into urlDatabase, new string generated for given address:
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = {longURL: req.body.longURL, userID: req.session['user_id']};
  res.redirect(`/urls/${randomString}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {

  if(urlDatabase[req.params.shortURL].userID === req.session['user_id']){
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }else{
    res.send('error 404: cannot delete');
  }
})

app.get('/urls/:shortURL/edit', (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
})


app.post('/urls/:shortURL/edit', (req, res) => {
  
  
  if(urlDatabase[req.params.shortURL]["userID"] === req.session['user_id']){
    urlDatabase[req.params.shortURL]["longURL"] = req.body['longURL'];
    res.redirect("/urls");
  }
 
})




app.post('/login', (req, res) => {
  const user = req.body;
  console.log('this is user',user);
  const password = user.password;
  const email = user.email;
  const dbHash = getUserbyEmail2(email);
  const correct = bcrypt.compareSync(password, dbHash);
  const otherUser = getUserbyEmail(email, users);                // here
  if (!getUserbyEmail(user.email, users)) {                      //here
    res.send('Error 403: the e-mail cannot be found!')
  } else if(!correct) {
    res.send('Error 403: the password is not correct')

  }else{
    
    req.session['user_id'] = otherUser;
    res.redirect("/urls");
  }
})


//res.redirect("/urls");
app.get('/logout', (req, res) => {
  // res.clearCookie('user_id');
  req.session.user_id = null;
  res.redirect('/login');
})


// app starts listening at designated port:
app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`);
});
















