// Bron skeletcode: https://morioh.com/p/8d907b1b9ee0
// Uitleg over Node & Express: https://youtu.be/SccSCuHhOw0

// normale code gaat verder hier

let express = require('express');
let cookieParser = require("cookie-parser");
let session = require('express-session');
let bodyParser = require('body-parser');
let mysql = require('mysql');
let path = require('path');
let ejs = require('ejs');
const bcrypt = require("bcrypt")

let aantalMogelijkheden = 3;
let amountOfTimesDisabled = 0;

const pool = mysql.createPool({
  connectionLimit: 100,
  host: 'sql147.main-hosting.eu',
  user: 'u378807222_login',
  password: 'Login2022?!',
  database: 'u378807222_login'
});

let app = express();
const port = 5001;

app.set("view engine", "ejs")

app.use(cookieParser());

app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.render('login')
});

app.get('/register', function(req, res) {
  res.render('register');
});

app.get('/about-us', function(req, res) {
  res.render('about-us');
});

app.get('/account', function(req, res) {
  res.render('account');
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
})

app.post('/auth', function(req, res) {
  let username = req.body.username;
  let password = req.body.password;

   async function disabled(seconden) {
    setTimeout( function() {
      res.render('login', { countDown: 
        '', disabledValue: ''});
    }, seconden * 1000); 

  }

  if (username && password) {


    pool.query('SELECT * FROM users WHERE username = ?', [username],     

    async function(error, results, fields) {

      

      let myHash = results[0].password;
      bcrypt.compare(password, myHash, function(err, result) {
        if (result) {

          req.session.loggedin = true;
          req.session.username = username;
          res.redirect('/home');
  
          pool.query('UPDATE users SET online = true WHERE username = ?', [username, password],           function(error, results, field) { if (error) throw error; 
          });

        } else {

          if(aantalMogelijkheden == 0) {
            amountOfTimesDisabled++;
            res.render('login', { countDown: 
              '', disabledValue: 'disabled', amountOfTimesDisabled: amountOfTimesDisabled });
             
              aantalMogelijkheden = aantalMogelijkheden + 3;
              console.log(aantalMogelijkheden);
      

          } else {

      res.render('login', { error: 'Wrong username or password, you have ' + aantalMogelijkheden + ' attempts left!' }); 
      aantalMogelijkheden--;  
      console.log(aantalMogelijkheden);
          }
        }
      })
    
    })
   
   
  } else {
    res.render('login', {error: 'Empty fields' })
  }

})


/* hierzo onder een for loop voor het updaten van de timer op de site */

app.post('/registerForm', function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  let email = req.body.email;
 
  /* if (username) {
     connection.query('SELECT * FROM users WHERE username = ?', [username], function(error, results, fields) {
      )
   } else {*/

   if (username) {
   
    pool.query('SELECT * FROM users WHERE username = ?', [username], function(error, results, fields) {
      if (error) {
        throw error;
      }
      if (results.length < 1) {

        bcrypt.genSalt(10, (err, salt) => {

          bcrypt.hash(password, salt, function(err, hash) {

            let informatie = {
              "username": username,
              "password": hash,
              "email": email,
              "online": false,
              "salt": salt
            }
          
              pool.query('INSERT INTO users SET ?', informatie, function(error, results, fields) {
                if (error) throw error;
              })
          })
        })

        
  
          res.render('login', {error: 'Succesful register! Please login.'})

      } else {
        res.send(`Username is already in use, please choose another one`);
      }
        
    })
  } else {
    res.send(`Enter your username and password`);
  }


})


app.get('/home', function(req, res) {
  if (req.session.loggedin) {
    res.render('home', { gebruikersnaam: req.session.username })
  } else {
    res.send(`Log eerst in om deze pagina te zien`);
  }
  res.end();
});

app.listen(3000);