const express = require('express');
const router = express.Router();

//Bring in models
let Article = require('../models/article');
let User = require('../models/user');

//Renders the add_article template when visit this URL
//@param ensureAuthenticated prevents users from visiting this URL without being logged in
router.get('/add', ensureAuthenticated, function(req,res) {
  res.render('add_article', {
    title:'Add Article'
  });
});

//Get single articles
router.get('/:id',function(req,res) {
  Article.findById(req.params.id, function(err, article) {
    User.findById(article.author, function(err, user) {
      res.render('article', {
        article:article,
        author: user.name
      });
    });
  });
});

//Posts the article to the DB from the /articles/add route
router.post('/add', function(req,res) {
  req.checkBody('title', 'Title is required').notEmpty();
  //req.checkBody('author', 'Author is required').notEmpty();
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
    article.author = req.user._id;
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
router.post('/edit/:id', function(req,res) {
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

//If not logged in at all, will send a 500 error
//If logged in as wrong user, will send a 500 error
router.delete('/:id', function(req,res) {
  if(!req.user._id) {
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id, function(err, article) {
    if(article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.remove(query, function(err) {
        if(err) {
          console.log(err);
        }

        res.send('Success');
      });
    }
  });


});

//Load edit form
router.get('/edit/:id',ensureAuthenticated, function(req,res) {
  Article.findById(req.params.id, function(err, article) {
    if(article.author != req.user._id) {
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    res.render('edit_article', {
      title:"Edit Article",
      article:article
    });
  });
});

//Access Control so users cant access /articles/add if not logged in
function ensureAuthenticated(req,res,next) {
  if(req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Please log in');
    res.redirect('/users/login');
  }
}

module.exports = router;
