
var express = require("express"),
  app = express(),
  _ = require('underscore'),
  async = require('async');

var jade = require('jade');

var article = require('./article');


app.get('/', function(req, res) {
  article.getArticles(function(err, articles) {
    if (err) {
      res.send(404);
      return;
    }

    async.map(articles, function(art, callback) {
      art.getMetadata(function(m) {
        callback(null, m);
      });
    }, function(err, results) {
      res.send(jade.renderFile('templates/list.jade', {articles: results}));
    });
  });
});

app.get('/:article', function(req, res){
  article.getArticle(req.params.article, function(err, article) {
    if (err) {
      res.send(404);
      return;
    }
    
    var data = article.getData(function(err, data) {
      res.send(jade.renderFile('templates/article.jade', data));
    });
  });
});

app.listen(process.env.PORT || 3000);
console.log("Running on port", process.env.PORT || 3000);