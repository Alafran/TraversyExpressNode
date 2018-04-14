const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

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
  let article = new Article();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  article.save(function(err){
    if(err) {
      console.log(err);
      return;
    }
    res.redirect('/');
  });
});

app.listen(3000, function() {
  console.log("Server started on 3000");
});
