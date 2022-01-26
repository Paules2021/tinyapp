const express = require("express");
const app = express();
const PORT = 8081; // default port 8081

const cookieParser = require("cookie-parser")
app.use(cookieParser());

const bodyParser = require("body-parser");
const e = require("express");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

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

const createUser = function(id, email, password) {
  const user = {
    id,
    email,
    password
  };
  return user;
};


function generateRandomString() {
  return (Math.random() + 1).toString(36).substring(6);
} 


// Check if the email or the passwords are empty strings.
const ifEmptyString = function(email, password) {
  if (email === "" || password === "") {
    return true;
  }
  return false;
}

// check to see if an email is exist
const findUserByEmail = function(email) {
  for (const id in users) {
    if (users[id].email === email) {
      return id;
    }
  }
  return false;
}

// check to see if the password given matches the password (same email) in the db
const checkPassword = function(email, password) {
  for (const id in users) {
    if (users[id].email === email && users[id].password === password) {
      return true;
    }
  }
  return false;
}




app.get("/", (req, res) => {
  res.send("Welcome to tinyapp!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><h1>Hello <b>World</b></h1><p>Welcome to home page!</p></html>\n");
});

//(GET-REGISTER)User Registeration from
app.get("/register", (req, res) => {
  const templateVars = {
  user: users[req.cookies["user_id"]]
  };
  res.render("register_index", templateVars);
});

//show the login page
app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.cookies["user_id"]]};
  res.render("urls_login", templateVars);
});


// (POST-REGISTER)
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  // if email or password is empty, send an error 
  if (ifEmptyString(email, password)) {
    return res.status(400).send("Email or Password cannot be empty");
  };
  // if someone registers with existing email, send an error message
  if (findUserByEmail(email)) {
    return res.status(400).send("Email already exists");
  }
  // use the helper function create a user object
  const user = createUser(id, email, password);
  // add the new user object to the users database
  users[id] = user;
  // set user_id cookie contraining the user's newly generated ID
  res.cookie("user_id", id);
  res.redirect("/urls");

});



app.post("/logout", (req, res) => {
  res.cookie("user_id", "");
  res.redirect('/urls');
});

// route to display a table of the URL Database (long and short URLS)
app.get("/urls", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_index", templateVars);
});


// route to present the form to the user
app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
  user: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});

// route to handle shortURL requests, clicking on the shortURL will lead to the longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});




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
  const email = req.body.email;
  const password = req.body.password;
  // if email is not in the db, return 403 
  if(!findUserByEmail(email)) {
    return res.status(403).send("Email does not exist");
  }
  // if password isnt correct, return 403
  if(!checkPassword(email, password)) {
    return res.status(403).send("Wrong password!");
  }
  // find the ID using the findUserByEmail function
  const id = findUserByEmail(email);
  res.cookie("user_id", id);
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});