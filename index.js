// Bron skeletcode: https://morioh.com/p/8d907b1b9ee0
// Uitleg over Node & Express: https://youtu.be/SccSCuHhOw0

// normale code gaat verder hier

let express = require('express');
let cookieParser = require("cookie-parser");
let session = require('express-session');
let bodyParser = require('body-parser');
let path = require('path');
let ejs = require('ejs');
const bcrypt = require("bcrypt")

let aantalMogelijkheden = 2;
let amountOfTimesDisabled = 0;
let mysql = require('mysql-await');

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

app.get('/homeSide', function(req, res) {
  res.render('homeSide');
});

app.get('/account', function(req, res) {
  res.render('account');
});

app.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
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

      if (results.length > 0 ){

      let myHash = results[0].password;
      bcrypt.compare(password, myHash, function(err, result) {
        if (result) {
          
          req.session.loggedin = true;
          req.session.username = username;
          req.session.email = results[0].email;
          res.redirect('/home');
  
          pool.query('UPDATE users SET online = true WHERE username = ?', [username, password], function(error, results, field) { if (error) throw error; 
          });

        } else {

          if(aantalMogelijkheden == 0) {
            amountOfTimesDisabled++;
            res.render('login', { countDown: 
              '', disabledValue: 'disabled', amountOfTimesDisabled: amountOfTimesDisabled });
              aantalMogelijkheden = aantalMogelijkheden + 2;

          } else {

      res.render('login', { error: 'Wrong username or password, you have ' + aantalMogelijkheden + ' attempts left!' }); 
      aantalMogelijkheden--;  
          }
        }
      })

    } else if(aantalMogelijkheden == 0) {
      amountOfTimesDisabled++;
      res.render('login', { countDown: 
        '', disabledValue: 'disabled', amountOfTimesDisabled: amountOfTimesDisabled });
        aantalMogelijkheden = aantalMogelijkheden + 2;

    } else {
      res.render('login', { error: 'Wrong username or password, you have ' + aantalMogelijkheden + ' attempts left!' }); 
      aantalMogelijkheden--;  
    }
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
        res.render('login', {error: 'Username is already in use, please choose another one.'})
      }
        
    })
  }

})

async function getMailz(req, res) {
  let query = 'SELECT * FROM mailz WHERE ontvanger = ?'
  let mailz = await pool.awaitQuery(query, [req.session.email], function(error, results, fields) {
    if (error)
      throw error;
    else {
    }
  })
  mailz = JSON.stringify(mailz)
  return mailz
}

app.get('/home', async function(req, res, next) {
  if (!req.session.loggedin) {
    res.send(`Log eerst in om deze pagina te zien`);
    return;
  }
  let mailz = "";
  mailz = await getMailz(req, res)
  

  return res.render('home', { gebruikersnaam: req.session.username, mailz: mailz });

});

app.listen(3000);