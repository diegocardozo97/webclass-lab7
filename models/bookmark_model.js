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

const bookmarksCollection = mongoose.model('students', bookmarksSchema);

const Bookmarks = {
};

module.exports = Bookmarks;
