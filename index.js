const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

const Bookmarks = require('./models/bookmark_model');

const app = express();
const jsonBodyParser = bodyParser.json();

app.use(morgan('dev'));

const bookmarksToAddInStart = [
  {
    title: "google",
    description: "A recomended very good one.",
    url: "google.com",
    rating: 5,
  }, {
    title: "youtube",
    description: "A recomended good one.",
    url: "youtube.com",
    rating: 4,
  }, {
    title: "facebook",
    description: "A recomended one.",
    url: "fb.com",
    rating: 3,
  }, {
    title: "twitter",
    description: "An okay one.",
    url: "twitter.com",
    rating: 2,
  }
];

function validateAuthorization(req, res, next) {
  const KEY = "2abbf7c3-245b-404f-9473-ade729ed4653";

  if (!("authorization" in req.headers) && !("book-api-key" in req.headers) &&
    !("apiKey" in req.query)) {
    res.statusMessage = "Unauthorized request.";
    return res.status(401).end();
  }
  if ("authorization" in req.headers && req.headers.authorization !== `Bearer ${KEY}` ||
    "book-api-key" in req.headers && req.headers["book-api-key"] !== KEY ||
    "apiKey" in req.query && req.query.apiKey !== KEY) {
    res.statusMessage = "Unauthorized request.";
    return res.status(401).end();
  }

  next();
}

app.use(validateAuthorization);

app.get('/bookmarks', (req, res) => {
  console.log("Getting all bookmarks.");

  Bookmarks
    .getAll()
    .then(result => res.status(200).json(result))
    .catch(err => {
      res.statusMessage = "Something is wrong with the Database. Try again later.";
      return res.status(500).end();
    });
});

app.get('/bookmark', (req, res) => {
    console.log("Getting a bookmark by name using the query string.");

    console.log(req.query);
    
    const title = req.query.title; 
    if (!title) {
      // The title value is not set or empty.
      res.statusMessage = "Please send the 'title' as parameter.";
      return res.status(406).end();
    }

    Bookmarks
      .getBookmarksByTitle(title)
      .then(result => {
        if (result.length === 0) {
          res.statusMessage = `There are no bookmarks with the provided 'title=${title}'.`;
          return res.status(404).end();
        }
        res.status(200).json(result)
      })
      .catch(err => {
        res.statusMessage = "Something is wrong with the Database. Try again later.";
        return res.status(500).end();
      });
});

app.post('/bookmarks', jsonBodyParser, (req, res) => {
  console.log("Adding a new bookmark to the list.");
  console.log("Body ", req.body);

  const {title, description, url, rating} = req.body;
  if (!title || !description || !url || !rating) {
    res.statusMessage = "At least one parameter is missing in the request.";
    return res.status(406).end();
  }
  if (typeof(rating) !== 'number'){
      res.statusMessage = "The 'rating' MUST be a number.";
      return res.status(409).end();
  }

  Bookmarks
    .createBookmark({title, description, url, rating})
    .then(result => {
      res.status(201).json(result)
    })
    .catch(err => {
      res.statusMessage = "Something is wrong with the Database. Try again later.";
      return res.status(500).end();
    });
});

app.delete('/bookmark/:id', (req, res) => {
  console.log("Deleting a bookmark by id using the integrated param.");
  console.log(req.params);

  const id = req.params.id;

  Bookmarks
    .deleteBookmark(id)
    .then(result => {
      if (result.deletedCount === 0) {
        res.statusMessage = "That 'id' was not found in the list of bookmarks.";
        return res.status(404).end();
      }

      return res.status(200).end(); 
      // return res.status( 204 ).end();
    })
    .catch(err => {
      res.statusMessage = "Something is wrong with the Database. Try again later." + err;
      return res.status(500).end();
    });
});

app.patch('/bookmark/:id', jsonBodyParser, (req, res) => {
  console.log("Updating patch a bookmark.");
  console.log("Body ", req.body);

  if (!req.body.id) {
    res.statusMessage = "The id is not in the body.";
    return res.status(406).end();
  }
  if (req.body.id !== req.params.id) {
    res.statusMessage = "The id in path is not the same in the body.";
    return res.status(409).end();
  }

  const objectNewValues = {};
  if ("title" in req.body) {
    if (typeof(req.body.title) !== "string") {
      res.statusMessage = "That 'title' is not a string.";
      return res.status(409).end();
    }
    objectNewValues.title = req.body.title;
  }
  if ("description" in req.body) {
    if (typeof(req.body.description) !== "string") {
      res.statusMessage = "That 'description' is not a string.";
      return res.status(409).end();
    }
    objectNewValues.description = req.body.description;
  }
  if ("url" in req.body) {
    if (typeof(req.body.url) !== "string") {
      res.statusMessage = "That 'url' is not a string.";
      return res.status(409).end();
    }
    objectNewValues.url = req.body.url;
  }
  if ("rating" in req.body) {
    if (typeof(req.body.rating) !== "number") {
      res.statusMessage = "That 'rating' is not a number.";
      return res.status(409).end();
    }
    objectNewValues.rating = req.body.rating;
  }

  Bookmarks
    .updateBookmark(req.body.id, objectNewValues)
    .then(result => {
      if (result.nModified === 0) {
        res.statusMessage = "That 'id' was not found in the list of bookmarks.";
        return res.status(404).end();
      }

      Bookmarks
        .getBookmarkById(req.body.id)
        .then(result => res.status(202).json(result))
        .catch(err => {
          res.statusMessage = "Something is wrong with the Database. Try again later.";
          return res.status(500).end();
        });
    })
    .catch(err => {
      res.statusMessage = "Something is wrong with the Database. Try again later.";
      return res.status(500).end();
    });
});

app.listen(8080, () => {
  console.log("This server is running on port 8080, connection to the mongodb db...");

  // Start the connection at mongoose [global] object to the db.
  new Promise((resolve, reject) => {
    const settings = {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
    };
    mongoose.connect(
      'mongodb://localhost/bookmarksdb', 
      settings, 
      (err) => {
        if (err) {
          return reject(err);
        } else {
          console.log("Database connected successfully, adding initial data...");
          return resolve();
        }
      },
    );
  })
  .then(() => {
    Bookmarks
      .insertMany(bookmarksToAddInStart)
      .then(() => console.log("Initial data added."))
      .catch(err => console.log("Problem with initial data. " + err));
  })
  .catch((err) => {
    console.log(err);
  });
});
