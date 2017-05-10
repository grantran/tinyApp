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

let urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
    res.end('Hello!'); 
}); 

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        username: req.cookies["username"]};
    res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]};
  res.render('urls_new', templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { 
      shortURL: req.params.id,
      urls: urlDatabase,
      username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let randomS = makeid();
  urlDatabase[randomS] = req.body.longURL; 
  //console.log(urlDatabase);
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/update", (req, res) => {
    //console.log(req.params.shortURL);
    //console.log(req.body.newURL);
    urlDatabase[req.params.shortURL] = req.body.newURL;
    console.log(urlDatabase);    
    res.redirect('/urls');
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]; 
  //console.log(urlDatabase);
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
    console.log(req);
    let cookieValue = req.body.username;
    res.cookie('username', req.body.username);
    res.redirect('/urls');
});

app.post("/logout", (req, res) => {
    res.clearCookie("username"); 
    res.redirect("/urls"); 
});

app.listen(PORT, () => {
    console.log(`Example app listening on port $(PORT)!`); 
}); 