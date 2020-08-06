const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', "ejs");

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
const getUserbyEmail = function (email) {
  let result = '';
  let arr = Object.keys(users);
  for (let user of arr) {
    if (users[user].email === email) {
      result = user;
      break;
    }
  }
  return result;
}

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
  let templateVars = { urls: urlDatabase, user_id: users[req.cookies['user_id']] };
  res.render('urls_register', templateVars);
})

app.get('/login', (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: users[req.cookies['user_id']] };
  res.render('urls_login', templateVars);
})




app.post('/register', (req, res) => {
  const randomId = generateRandomString();
  const user = req.body;
  const arr = Object.keys(users);

  if (!user.email || !user.password) {
    res.send(`Error code 400 : please fill in both Email and password`);
  }
  else if (getUserbyEmail(user.email)) {
    res.send(`Error code 400 : this email is already registered`);

  } else {
    users[randomId] = {};
    users[randomId]['id'] = randomId;
    users[randomId]['email'] = user.email;
    users[randomId]['password'] = user.password;
    console.log(users);
    res.cookie('user_id', randomId);
    res.redirect('/urls');
  }

})







app.get("/urls", (req, res) => {
  let filterURL ={};
  for(let url in urlDatabase){
    console.log(req.cookies['user_id'], urlDatabase[url].userID);
    if(urlDatabase[url].userID === req.cookies['user_id'] ){
      filterURL[url] = urlDatabase[url];
    }
  }
  console.log(filterURL);
  let templateVars = { urls: filterURL, user_id: users[req.cookies['user_id']]};
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: req.cookies['user_id'] };
  if(!templateVars["user_id"]){
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
})

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const user_id = req.cookies['user_id'];
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
  urlDatabase[randomString] = {longURL: req.body.longURL, userID: req.cookies['user_id']};
  res.redirect(`/urls/${randomString}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

app.get('/urls/:shortURL/edit', (req, res) => {
  console.log(req.params);
  res.redirect(`/urls/${req.params.shortURL}`);
})


app.post('/urls/:shortURL/edit', (req, res) => {

  // console.log(' iam  printing shorturl',req.params.shortURL)
  // console.log('longURL ===?',req.body["longURL"]);
  // console.log(req.params.shortURL);
  urlDatabase[req.params.shortURL]["longURL"] = req.body['longURL'];
  res.redirect("/urls");
})



//below are cookie cases:
app.post('/login', (req, res) => {
  const user = req.body;
  if (!getUserbyEmail(user.email)) {
    res.send('Error 403: the e-mail cannot be found!')
  } else if(!getUserBypassword(user.email, user.password)) {
    res.send('Error 403: the password is not correct')

  }else{
    // getUserBypassword(user.email, user.password)
    res.cookie('user_id', getUserBypassword(user.email, user.password));
    res.redirect("/urls");
  }
})


//res.redirect("/urls");
app.get('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
})





// app starts operation:
app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`);
});




// const getUserBypassword = function(email,password){
//   let arr =Object.keys(users);
//   let result;
//   for(let user of arr){
//     if(arr[user].email === email){
//       if(arr[user].password === password){
//          result = true;
//       }
//     }
//   }
//   return result;
// }





// const getUserbyEmail = function (email) {
//   let result = '';
//   let arr = Object.keys(users);
//   for (let user of arr) {
//     if (users[user].email === email) {
//       result = user;
//       break;
//     }
//   }
//   return result;
// }