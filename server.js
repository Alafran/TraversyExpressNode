const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

//connect to DB
mongoose.connect('mongodb://localhost/nodekb');
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

//Renders the add_article template when visit this URL
app.get('/articles/add', function(req,res) {
  res.render('add_article', {
    title:'Add Article'
  });
});

//Get single articles
app.get('/article/:id',function(req,res) {
  Article.findById(req.params.id, function(err, article) {
    res.render('article', {
      article:article
    });
  });
});

//Posts the article to the DB from the /articles/add route
app.post('/articles/add', function(req,res) {
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  //Get Errors, if exists
  let errors = req.validationErrors();
  if(errors) {
    res.render('add_article', {
      title:'Add Article',
      errors:errors
    });
  } else {

    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save(function(err){
      if(err) {
        console.log(err);
        return;
      }
      req.flash('success','Article Added');
      res.redirect('/');
    });
  }
});

//Update submission
app.post('/articles/edit/:id', function(req,res) {
  let article = {}
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id};

  Article.update(query, article, function(err){
    if(err) {
      console.log(err);
      return;
    }
    req.flash('success', 'Article updated');
    res.redirect('/');
  });
});

app.delete('/article/:id', function(req,res) {
  let query = {_id:req.params.id}

  Article.remove(query, function(err) {
    if(err) {
      console.log(err);
    }

    res.send('Success');
  });
});

//Load edit form
app.get('/article/edit/:id',function(req,res) {
  Article.findById(req.params.id, function(err, article) {
    res.render('edit_article', {
      title:"Edit Article",
      article:article
    });
  });
});

app.listen(3000, function() {
  console.log("Server started on 3000");
});
