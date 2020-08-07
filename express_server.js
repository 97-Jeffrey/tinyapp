const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const { getUserByEmail, getUserByEmail2 } = require('./helpers');
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



// helper function: (not in use after bcript is used)
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
// basic cases: if logged in, go to main(url) pages , if not, go to login page :

app.get('/',(req, res)=>{
  if(req.session.user_id){
    res.redirect('/urls');
  }else{
    res.redirect('/login');
  }
})


//user authentication:

app.get('/register', (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: users[req.session['user_id']] };
  res.render('urls_register', templateVars);
})

app.get('/login', (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: users[req.session['user_id']] };
  res.render('urls_login', templateVars);
})

// only new people with both email and password can register successively
app.post('/register', (req, res) => {
  const randomId = generateRandomString();
  const user = req.body;
  const password = user.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!user.email || !user.password) {
    res.send(`Error code 400 : please fill in both Email and password`);
  }
  else if (getUserByEmail(user.email, users)) {                           
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


//User cannot go to urls if they are not logged in, when they do, they only see urls with they created;
app.get("/urls", (req, res) => {
  if(!req.session.user_id){
    res.redirect('/login');
  }
  let filterURL ={};
  for(let url in urlDatabase){
    if(urlDatabase[url].userID === req.session['user_id'] ){
      filterURL[url] = urlDatabase[url];
    }
  }
  let templateVars = { urls: filterURL, user_id: users[req.session['user_id']]};
  res.render('urls_index', templateVars);
});

// users can not create new url if they are not logged in:
app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: users[req.session['user_id']]};
  if(!templateVars["user_id"]){
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
})

//direct to edit page:
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
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
})

// direct to urls add the input url into urlDatabase, new string generated for given address:
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = {longURL: req.body.longURL, userID: req.session['user_id']};
  res.redirect('/urls');
});

// delete the url : only by user who created them (cannot delete through terminal)
app.post("/urls/:shortURL/delete", (req, res) => {
  if(urlDatabase[req.params.shortURL].userID === req.session['user_id']){
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }else{
    res.send('error 404: cannot delete');
  }
})

// get directed to the edit page when 'edit' is clicked:
app.get('/urls/:shortURL/edit', (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
})

// can reassign url to generated shortURL and return to /urls page
app.post('/urls/:shortURL/edit', (req, res) => {
  if(urlDatabase[req.params.shortURL]["userID"] === req.session['user_id']){
    urlDatabase[req.params.shortURL]["longURL"] = req.body['longURL'];
    res.redirect("/urls");
  }
})



//login information checking: the email and password should absolutely match to login
app.post('/login', (req, res) => {
  const user = req.body;
  console.log('this is user',user);
  const password = user.password;
  const email = user.email;
  const dbHash = getUserByEmail2(email,users);
  const correct = bcrypt.compareSync(password, dbHash);
  const otherUser = getUserByEmail(email, users);                
  if (!getUserByEmail(user.email, users)) {                      
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
  req.session.user_id = null;
  res.redirect('/login');
})


// app starts listening at designated port:
app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`);
});
















