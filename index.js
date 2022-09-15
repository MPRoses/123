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

let aantalMogelijkheden = 3;

let connection = mysql.createConnection({
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

app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
})

app.post('/auth', function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  if (username && password) {
    connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password],     function(error, results, fields) {
      if (results.length > 0) {
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('/home');

        connection.query('UPDATE users SET online = true WHERE username = ?', [username, password],           function(error, results, field) { if (error) throw error; console.log(results); });

      } else {
            if(aantalMogelijkheden == 1) {
              disabled(5)
              res.render('login', { error: 
              `Te veel foute inlpogpogingen! kom terug over 300 seconden.`, disabledValue: 'disabled'})
          
         
                

              /*hierboven de 5 veranderen naar het aantal minuten*/
         /* setTimeout(res.render('login', { error: 'appelsaus', disabledValue: 'enabled'}), 5000);*/
           
            } else {
              aantalMogelijkheden--;  
        res.render('login', { error: 'Foute inlogpoging nog ' + aantalMogelijkheden + ' pogingen over!' }); 
            }
        
      }
    });
  } else {
    res.send(`Vul je gebruikersnaam en wachtwoord in`);
  }
});

/* hierzo onder een for loop voor het updaten van de timer op de site */
async function disabled(minuten) {
  
    setTimeout(function() {
    res.render('login', { error: 'appelsaus', disabledValue: ''})
    }, minuten * 60000); 
    aantalMogelijkheden == 3;
  
}




app.post('/registerForm', function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  let email = req.body.email;
  let informatie = {
    "username": username,
    "password": password,
    "email": email,
    "online": false
  }

  /* if (username) {
     connection.query('SELECT * FROM users WHERE username = ?', [username], function(error, results, fields) {
      )
   } else {*/

   if (username) {
   
    connection.query('SELECT * FROM users WHERE username = ?', [username], function(error, results, fields) {
      if (error) {
        throw error;
      }
      console.log(results)
      if (results.length < 1) {

              bcrypt.hash(password, 10)
              .then(hash => {
                connection.query('INSERT INTO users SET ?', informatie, function(error, results, fields) {  
                               
                })              })
              .catch(err => {
                  console.log(err)
              })
        
             
              res.render('login', {error: 'perfect!'})

      } else {
         
       }
        
    })
  } else {
    res.send(`Vul je gebruikersnaam en wachtwoord in`);
  }


})

function hashPassword(plaintextPassword) {
 
}

app.get('/home', function(req, res) {
  if (req.session.loggedin) {
    res.render('home', { gebruikersnaam: req.session.username })
  } else {
    res.send(`Log eerst in om deze pagina te zien`);
  }
  res.end();
});

app.listen(3000);