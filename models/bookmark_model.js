const mongoose = require('mongoose');

const bookmarksSchema = mongoose.Schema({
  title: {
    type : String,
    required : true,
  },
  description: {
      type : String,
      required : true,
  },
  url: {
    type : String,
    required : true,
  },
  rating: {
    type : Number,
    required : true,
  },
});

const bookmarksCollection = mongoose.model('bookmarks', bookmarksSchema);

const Bookmarks = {
  getAll: () => {
    return bookmarksCollection
      .find()
      .then(all => all)
      .catch(err => {
        throw new Error(err);
      });
  },
  getBookmarksByTitle: (title) => {
    return bookmarksCollection
      .find({title})
      .then(all => all)
      .catch(err => {
        throw new Error(err);
      });
  },
  createBookmark: (newBookmark) => {
    return bookmarksCollection
      .create(newBookmark)
      .then(createdBookmark => createdBookmark)
      .catch(err => {
        throw new Error(err);
      });
  },
  deleteBookmark: (_id) => {
    return bookmarksCollection
      .remove({_id})
      .then(result => result)
      .catch(err => {
        throw new Error(err);
      });
  },
  updateBookmark: (_id, updatedBookmark) => {
    return bookmarksCollection
      .update({_id}, {$set: updatedBookmark})
      .then(result => result)
      .catch(err => {
        throw new Error(err);
      });
  },
  getBookmarkById: (_id) => {
    return bookmarksCollection
      .find({_id})
      .then(result => result)
      .catch(err => {
        throw new Error(err);
      });
  },
  insertMany: (newBookmarks) => {
    return bookmarksCollection
      .insertMany(newBookmarks)
      .then(result => result)
      .catch(err => {
        throw new Error(err);
      });
  },
};

module.exports = Bookmarks;
