
var fs = require('fs'),
    marked = require('marked'),
    _ = require("underscore"),
    glob = require('glob'),
    async = require('async'),
    pathmodule = require('path'),
    moment = require('moment');

var articleDir = './articles/';

function getArticle(id, cb) {
  var path = articleDir + pathmodule.basename(id) + ".md";

  readArticle(path, cb);
}

function readArticle(path, cb) {
  (new Article(path)).init(cb);
}

function getArticles(cb) {
  glob(articleDir + "*.md", {}, function(err, files) {
    if (err) {
      cb(err, null);
      return;
    }

    async.map(files, readArticle, function(err, results) {
      cb(null, results);
    });
  });
}

var Article = function(path) {
  this._path = path;
  this._id = pathmodule.basename(path, ".md");
  var art = this;

  this.init = function(cb) {
    fs.exists(path, function(exists) {
      if (exists) {
        fs.readFile(path, function(err, mddata) {
          if (err) {
            cb(err, null);
          }
          else {
            mddata = mddata.toString();
            var delimiter = mddata.indexOf("\n\n");
            var metadataLines = mddata.substr(0, delimiter).split("\n");
            var content = mddata.substr(delimiter + 2);

            var metadata = {id: art._id};
            _.each(metadataLines, function(mL) {
              var parts = mL.split(" ").reverse();
              metadata[parts.pop()] = parts.reverse().join(" ");
            });

            art._content = content;
            art._metadata = metadata;

            cb(null, art);
          }
        });
      }
      else {
        cb(new Error('not found'), null);
      }
    });
  };

  this.getData = function(cb) {
    var art = this;
    art.getMetadata(function(meta) {
      art.getHtml(function(err, html) {
        if (err) {
          cb(err, null);
          return;
        }

        cb(null, _.extend(meta, {'html': html}));
      });
    });
  };

  this.getHtml = function(cb) {
    marked(this._content, function(err, content) {
      if (err) {
        cb(err, null);
      }
      else {
        cb(null, content);
      }
    });
  };

  this.getMetadata = function(cb) {
    var metadataCopy = _.extend({}, this._metadata);
    if ('time' in metadataCopy) {
      metadataCopy.time = moment(metadataCopy.time).format('Do MMMM YYYY, HH:MM');
    }
    cb(metadataCopy);
  };

};

module.exports = {
  getArticle: getArticle,
  getArticles: getArticles
};