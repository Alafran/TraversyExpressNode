const express = require('express');
const router = express.Router();

//Bring in models
let Article = require('../models/article');

//Renders the add_article template when visit this URL
router.get('/add', function(req,res) {
  res.render('add_article', {
    title:'Add Article'
  });
});

//Get single articles
router.get('/:id',function(req,res) {
  Article.findById(req.params.id, function(err, article) {
    res.render('article', {
      article:article
    });
  });
});

//Posts the article to the DB from the /articles/add route
router.post('/add', function(req,res) {
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

router.delete('/:id', function(req,res) {
  let query = {_id:req.params.id}

  Article.remove(query, function(err) {
    if(err) {
      console.log(err);
    }

    res.send('Success');
  });
});

//Load edit form
router.get('/edit/:id',function(req,res) {
  Article.findById(req.params.id, function(err, article) {
    res.render('edit_article', {
      title:"Edit Article",
      article:article
    });
  });
});

module.exports = router;
