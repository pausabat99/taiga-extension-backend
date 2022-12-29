require('dotenv').config();

const cron = require('node-cron');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require("passport");
const bodyParser = require('body-parser');
const http = require('http');
require('./auth');

const app = express();

app.use(session({
    name : 'session',
    secret : process.env.SECRET,
    saveUninitialized : false,
    resave : true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

//VARIABLES
var metrics = { '11a': [], '11b': [], '11c': [] };
const groups = ['11a', '11b', '11c'];
const groupNames = { '11a': "PES - Energía y eficiencia", '11b': "CANVIAR NOM", '11c': "CANVIAR NOM"  };

function getMetrics(groupcode) {

  var result = '';

  console.log("CALLING LEARNING DAHSBOARD API");

  http.request('http://gessi-dashboard.essi.upc.edu:8888/api/metrics/current?prj=s'+groupcode, (res) => {

    let data = ''
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    // Ending the response 
    res.on('end', () => {
      result = JSON.parse(data);
        metrics[groupcode] = JSON.parse(data);
    });
       
  }).on("error", (err) => {
    console.log("Error: ", err)
  }).end();

  return result;
}


//EVERY NIGHT AT 02:00AM
cron.schedule("0 2 * * *", function () {
  for (let index = 0; index < groups.length; ++index) {
    let groupcode = groups[index];
    setTimeout(() => {
      getMetrics(groupcode);
    }, 3000);
  }
});


function isLoggedIn(req, res, next) {
  req.user ? next() : res.status(401).send();
}

//GET base
app.get('/', function(req, res) {
  res.render('index.html');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

app.get('/google/callback',
  passport.authenticate('google', {
    successRedirect: '/authenticated',
    failureRedirect: '/auth/failure'
  })
);

app.get('auth/failure', (req, res) => {
  res.send('something went wrong with the authentication...');
})

app.get('/authenticated', isLoggedIn, (req, res) => {
  res.send(`<h2>User ${req.user.displayName} authenticated</h2> <p>You can now close this window<p/>`);
});

app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy();
    res.send("Goodbye!");
  });
});


//GET metrics
app.get('/metrics', isLoggedIn, (req, res) => {
  let groupcode = req.query.groupcode;
  console.log(groupcode);
  if (groupcode in metrics) {
    res.send({
      metrics: metrics[groupcode],
      groupname: groupNames[groupcode] 
    });
  }
  else res.status(400).send();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
 console.log("El servidor está inicializado en el puerto", PORT);
});