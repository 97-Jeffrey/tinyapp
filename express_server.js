const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


function generateRandomString() {
  let alphaNum = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += alphaNum[Math.floor(Math.random() * alphaNum.length)];
  }
  return randomString;
}





// app.get("/", (req, res) => {
//   res.send("Hello");
// });


// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n")
// });


//user authentication:
app.get('/urls/register', (req, res)=>{
  
  res.render('urls_register');
})





app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username:req.cookies['username'] };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
   let templateVars = { urls: urlDatabase, username:req.cookies['username'] };
  res.render("urls_new", templateVars);
})

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const username = req.cookies['username'];
  let templateVars = { shortURL, longURL, username};
  res.render("urls_show", templateVars);
});


// link the generated url to the real url users submitted, and redirect user into their address:
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log('longURL===',longURL);
  console.log(req.params.shortURL);
  res.redirect(longURL);
})

// direct to urls add the input address into urlDatabase, new string generated for given address:
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body["longURL"];
  res.redirect(`/urls/${randomString}`);
});

app.post("/urls/:shortURL/delete", (req, res)=>{
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

app.get('/urls/:shortURL/edit',(req, res)=>{
  console.log(req.params);
  res.redirect(`/urls/${req.params.shortURL}`);
})


app.post('/urls/:shortURL/edit',(req, res)=>{
  // console.log(urlDatabase[req.params.shortURL]);
  // console.log(req.body["longURL"]);
  // console.log(req.params.shortURL);
  urlDatabase[req.params.shortURL] = req.body['longURL'];
  res.redirect("/urls");
})



//below are cookie cases:
app.post('/login',(req, res)=>{
  res.cookie('username', req.body.username);
  res.redirect("/urls");
})

app.post('/logout', (req, res)=>{
  res.clearCookie('username');
  res.redirect('/urls');
})





// app starts operation:
app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`);
});