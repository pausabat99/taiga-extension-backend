const cron = require('node-cron');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require("passport");
const bodyParser = require('body-parser');
const http = require('http');
require('./auth');

const app = express();

//secret tambe hauria d'anar en una variable d'entorn per no posar-ho al github per exemple
app.use(session({ secret: 'cats' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//VARIABLE
var metrics = [];


function getMetrics() {

  return http.request('http://gessi-dashboard.essi.upc.edu:8888/api/metrics/current?prj=s11a', (res) => {
    let data = ''
     
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    // Ending the response 
    res.on('end', () => {
        console.log(JSON.parse(data));
    });
       
  }).on("error", (err) => {
    console.log("Error: ", err)
  }).end();
}


  //s'executa cada dia a mitjanit
  cron.schedule("0 0 0 * * *", function () {
    console.log("---------------------");
    console.log("running a task every day at midnight");
    var json = getMetrics();
    //si la crida falla fer un altre cron al cap de 6 hores per exemple
    metrics = json;
    console.log("---------------------");
  });


function isLoggedIn(req, res, next) {
  res.send("Hola perra");
  //req.user ? next() : res.sendStatus(401);
}

//GET base
app.get('/', function(req, res) {
 res.send('<a href="/auth/google">Authenticate with Google</a><br><a href="/logout">Log Out</a>');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

app.get('/google/callback',
  passport.authenticate('google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/failure'
  })
);

app.get('auth/failure', (req, res) => {
  res.send('something went wrong...');
})

app.get('/protected', isLoggedIn, (req, res) => {
  res.send(`Hello ${req.user.displayName}`);
});

app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy();
    res.send("Goodbye!");
    //res.redirect('/');
  });
});


//GET usuario
app.get('/metrics', isLoggedIn, (req, res) => {
  res.send("Hello");
   //res.send(metric);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
 console.log("El servidor está inicializado en el puerto", PORT);
});