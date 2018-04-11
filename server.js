const express = require('express');
const app = express();
const path = require('path');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', function(req,res) {
  let articles = [
    {
      id:1,
      title: 'Article One',
      author: 'Joseph Woodside',
      body: 'This is article one'
    },
    {
      id:2,
      title: 'Article Two',
      author: 'Joey Rocket',
      body: 'This is article two'
    },
    {
      id:3,
      title: 'Article Three',
      author: 'JSide',
      body: 'This is article three'
    },
  ];
  res.render('index', {
    title:'Articles',
    articles: articles
  });
});

app.get('/articles/add', function(req,res) {
  res.render('add_article', {
    title:'Add Article'
  });
});

app.listen(3000, function() {
  console.log("Server started on 3000");
});
