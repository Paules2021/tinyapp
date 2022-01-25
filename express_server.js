const express = require("express");
const app = express();
const PORT = 8081; // default port 8081

const cookieParser = require("cookie-parser")
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

// route to display a table of the URL Database (long and short URLS)
app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});


// route to present the form to the user
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],     username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

// route to handle shortURL requests, clicking on the shortURL will lead to the longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


function generateRandomString() {
  return (Math.random() + 1).toString(36).substring(6);
} 

// route to receive the form submission
app.post("/urls", (req, res) => {
  const newShortUrl = generateRandomString(); // generate a new short URL
  urlDatabase[newShortUrl] = req.body.longURL // add the key value pair to the URL Database
  res.redirect(`/urls/${newShortUrl}`); // redirect to the new URL page
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})


// route to update a URL and redirect to the /urls page
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL; // update the longURL of the shortURL in the database
  res.redirect("/urls");
}) 

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');

})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});