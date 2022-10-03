// Bron skeletcode: https://morioh.com/p/8d907b1b9ee0
// Uitleg over Node & Express: https://youtu.be/SccSCuHhOw0

// normale code gaat verder hier

let express = require('express');
let cookieParser = require("cookie-parser");
let session = require('express-session');
let bodyParser = require('body-parser');
let path = require('path');
let ejs = require('ejs');
const bcrypt = require("bcrypt");
var $ = require('jquery');
const webpush = require('web-push');

//const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
//const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

//const publicVapidKey = BKBPAeTn7FNt5hvlxv0QirPCV6kHfqjg5usB5zZaqUoa0LDDDZpkR9fZxuMEsqV9feyWKxRVRv4jdHHJX7wSUf0;
//const privateVapidKey = g-HD2VeV17HYfhs_vK7NNah6m3pqiTIh81DQnfIZ5u0;

//webpush.setVapidDetails('mailto:jemoeder@jemoeder.com', publicVapidKey, privateVapidKey);
/*
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  res.status(201).json({});
  const payload = JSON.stringify({ title: 'test' });

  console.log(subscription);

  webpush.sendNotification(subscription, payload).catch(error => {
    console.error(error.stack);
  });
});
*/

let aantalMogelijkheden = 2;
let amountOfTimesDisabled = 0;
let mysql = require('mysql-await');
let mailSend = '';
let username = '';
let onlineUsers;


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
  pool.query('UPDATE users SET online = false WHERE username = ?', [username], function(error, results, field) { if (error) throw error; 
  });
  req.session.destroy();
  res.redirect('/');
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
})


app.post('/auth', function(req, res) {
  let username = req.body.username;
  let password = req.body.password;

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
            aantalMogelijkheden++;
            res.render('login', { countDown: 
              '', disabledValue: 'disabled', amountOfTimesDisabled: amountOfTimesDisabled });
        
          } else {

      res.render('login', { error: 'Wrong username or password, you have ' + aantalMogelijkheden + ' attempts left!' }); 
      aantalMogelijkheden--;  
          }
        }
      })

    } else if(aantalMogelijkheden == 0) {
      amountOfTimesDisabled++;
      aantalMogelijkheden++;
      res.render('login', { countDown: 
        '', disabledValue: 'disabled', amountOfTimesDisabled: amountOfTimesDisabled });
        
    } else {
      res.render('login', { error: 'Wrong username or password, you have ' + aantalMogelijkheden + ' attempts left!' }); 
      aantalMogelijkheden--;
    }
    })

  } else {
    res.render('login', {error: 'Empty fields' })
  }

})

/*
pool.query('UPDATE")
*/
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
        res.render('login', {errorOnRegisterForm: 'Username is already in use, please choose another one.'})
      }
        
    })
  }

})

async function getOnlineUsers(req, res) {
  let query = 'SELECT username FROM users WHERE online = 1'
  onlineUsers = await pool.awaitQuery(query, [], function(error, results, fields) {
    if (error)
      throw error;
    else {
    }
  })
  onlineUsers = JSON.stringify(onlineUsers)
  return onlineUsers
}

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

async function getSendMailz(req, res) {
  let query = 'SELECT * FROM mailz WHERE afzender = ?'
  let sendMailz = await pool.awaitQuery(query, [req.session.email], function(error, results, fields) {
    if (error)
      throw error;
    else {
    }
  })
  sendMailz = JSON.stringify(sendMailz)
  return sendMailz
}

async function getBlockedEmails(req, res) {
  let query = 'SELECT * FROM `users` WHERE username = ?'
  let blockedEmails = await pool.awaitQuery(query, [req.session.username], function(error, results, fields) {
    if (error)
      throw error;
    else {
    }
  })
  blockedEmails = JSON.stringify(blockedEmails[0].blocked)
  return blockedEmails
}

app.get('/home', async function(req, res, next) {
  if (!req.session.loggedin) {
    res.send(`You aren't logged in, please log in.`);
    return;
  }
  let mailz = "";
  let sendMailz = "";
  mailz = await getMailz(req, res)
  sendMailz = await getSendMailz(req, res)
  onlineUsers = await getOnlineUsers(req, res)
  let mailzSyntaxx = '';
  username = req.session.username;
  blockedEmails = await getBlockedEmails(req, res);
 
  
  if (mailSend == 'true'){
    mailzSyntaxx = 'Email has been send!';
  } else if (mailSend == 'false') {
    mailzSyntaxx = 'Bad attempt, email has not been send!';
  }
  mailSend = '';
  return res.render('home', { gebruikersnaam: req.session.username, mailz: mailz, sendMailz: sendMailz, mailzSyntax: mailzSyntaxx, newBlocked: blockedEmails, onlineUsers: onlineUsers });

});

app.post('/sendMail', function(req, res) {
  let receiver = req.body.receiver;
  let subject = req.body.subject;
  let message = req.body.message;
  let date = new Date().toISOString();
  
   let dingetje = receiver.split(',');
   console.log(dingetje)

  for (i = 0; i < dingetje.every(); i++) {
      let afzender = dingetje.username[i];
      console.log(afzender);
    let infoniffo = {
      "afzender": afzender,
      "ontvanger": receiver,
      "onderwerp": subject,
      "bericht": message,
      "tijd":  date
    }
  
    pool.query('INSERT INTO mailz SET ?', infoniffo, function(error, results) {
      if (error) { 
        mailSend = 'false';
        res.redirect('/home');
        throw error;
      }
     
    })
    mailSend = 'true';
    res.redirect('/home');
    return;

  }
  
})

app.post("/api/loadDeleted", (req, res) => {
  let IDmail = req.body;
  pool.query('UPDATE mailz SET verwijderd = true WHERE IDmail = ?', [IDmail.id], function(error, results, field) { if (error) throw error; 
    res.redirect('/home');
  });
})

app.post("/api/unLoadDeleted", (req, res) => {
  let IDmail = req.body;
  pool.query('UPDATE mailz SET verwijderd = false WHERE IDmail = ?', [IDmail.id], function(error, results, field) { if (error) throw error; 
    res.redirect('/home');
  });
})

app.post("/api/reportSpam", (req, res) => {
  let emailSender = req.body;
  pool.query('SELECT * FROM users WHERE username = ?', [req.session.username], function(error, results) { if (error) throw error;
  let newBlocked = (results[0].blocked + emailSender.email + ',');

    pool.query('UPDATE users SET blocked = ? WHERE username = ?', [newBlocked, req.session.username], function(error, results) { if (error) throw error;
      return res.render('home', { newBlocked: newBlocked});
    })  
  
  })

});

app.post("/api/onlineuserss", (req, res) => {
  console.log(1);
  pool.query('SELECT username FROM users WHERE online = 1', [], function(error, results) { if (error) throw error;
  let newStuff = JSON.stringify(results);
  newStuff = JSON.parse(newStuff);
  console.log(2);
  console.log(newStuff)
  res.render('home', { newStuff: newStuff});
  return;

  
  })

});

app.listen(3000);