const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

//connect to DB
mongoose.connect(config.database);
let db = mongoose.connection;

// Check for db errors
db.on('error', function(err) {
  console.log(err);
});

// Check connection
db.once('open',function() {
  console.log('Connected to MongoDB');
});

//Bring in models
let Article = require('./models/article');

//Body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Set public folder
app.use(express.static(path.join(__dirname,'public')));

//express-session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

//express-message middleware
app.use(require('connect-flash')());
app.use(function(req,res,next) {
  res.locals.messages = require('express-messages')(req,res);
  next();
});

//express-validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'),
    root = namespace.shift(),
    formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// Passport config
require('./config/passport')(passport);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//sets a global object of user if there is a user logged in
//if no user is logged in the global user object will be null
app.get('*', function(req,res,next) {
  res.locals.user = req.user || null;
  next();
});

//Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//home route
//renders the index template as homepage
app.get('/', function(req,res) {
  Article.find({},function(err, articles) {
    if(err) {
      console.log(err);
    } else {
      res.render('index', {
        title:'Articles',
        articles: articles
      });
    }
  });
});

//Route files
let articles = require('./routes/articles');
let users = require('./routes/users');
//Any route for '/articles' will go to the /routes/articles folder
app.use('/articles',articles);

//Any route for '/users' will go to the /routes/users folder
app.use('/users', users);

app.listen(3000, function() {
  console.log("Server started on 3000");
});
