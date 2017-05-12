const express = require('express'); 
const app = express();
const PORT = process.env.PORT || 3000; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser"); 

app.set("view engine", "ejs");

//Middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

let users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }, 
  "test": {
      id: "testID", 
      email: "asdf@asdf", 
      password: "asdf"
  }
}

let urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        username: req.cookies["user_id"],
        user: users};
    //console.log(templateVars.user);
    //console.log(req);
    res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["user_id"],
    user: users};
  res.render('urls_new', templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { 
      shortURL: req.params.id,
      urls: urlDatabase,
      username: req.cookies["user_id"],
      user: users};
  res.render("urls_show", templateVars);
});

app.get("/user/register", (req, res) => {
    let templateVars = { 
        shortURL: req.params.id,
        urls: urlDatabase,
        username: req.cookies["user_id"],
        user: users };
    res.render('register', templateVars);
});

app.post("/urls", (req, res) => {
  let randomS = makeid();
  urlDatabase[randomS] = req.body.longURL; 
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
    let templateVars = { 
        shortURL: req.params.id,
        urls: urlDatabase,
        username: req.cookies["user_id"],
        user: users };
    res.render('login', templateVars)
});

app.post("/urls/:shortURL/update", (req, res) => {
    urlDatabase[req.params.shortURL] = req.body.newURL;
    console.log(urlDatabase);    
    res.redirect('/urls');
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]; 
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
    console.log('this is req', req.body);
    for (const keys in users) {
        if (req.body.email === users[keys].email &&
            req.body.password === users[keys].password) {
            res.cookie('user_id', users[keys].id);
            res.redirect('/urls');
        } else {
            console.log('no'); 
        }
    }
    res.send('no'); 
});

app.post("/logout", (req, res) => {
    res.clearCookie("user_id"); 
    res.redirect("/urls"); 
});

app.post("/user/register", (req, res) => {
    if (!req.body.email || !req.body.password) {
        console.log('empty string');
        res.status(400);
        res.send('empty');  
    }

    let newEmail = true; 
    for (const keys in users) {
        if (req.body.email === users[keys].email) {
            console.log('same email'); 
            res.status(400); 
            res.send('same email');
            newEmail = false;  
        }  
    }
    if (newEmail === true) {
            let randomUserId = makeid(); 
            users[randomUserId] = req.body;
            users[randomUserId].id = randomUserId; 
            res.cookie('user_id', randomUserId);
            res.redirect('/urls');
            }
    });     

app.listen(PORT, () => {
    console.log(`Example app listening on port $(PORT)!`); 
}); 