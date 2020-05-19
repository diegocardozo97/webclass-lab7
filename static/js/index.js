// const {API_TOKEN} = require('../../config');
const API_TOKEN = "2abbf7c3-245b-404f-9473-ade729ed4653";

function $(query) {
  return document.querySelector(query);
}

function listenerAddBookmark(event) {
  event.preventDefault();

  const title = $("#add-title").value;
  const description = $("#add-descr").value;
  const urlBookmark = $("#add-url").value;
  const rating = parseInt($("#add-rating").value);
  if (title.length === 0 || description.length === 0 ||
    urlBookmark.length === 0 || isNaN(rating)) {
    return true;
  }
  const data = {title,description, url: urlBookmark, rating};


  $("#add-error").innerHTML = "Making the request...";

  const url = '/bookmarks';
  const settings = {
    method : 'POST',
    headers : {
      Authorization : `Bearer ${API_TOKEN}`,
      'Content-Type' : 'application/json',
    },
    body : JSON.stringify(data)
  };
  fetch( url, settings )
    .then(response => {
      if(response.ok){
        return response.json();
      }
      throw new Error( response.statusText );
    })
    .then(responseJSON => {
      $("#add-error").innerHTML = "Success!";
      updateAllBookmarks();
    })
    .catch(err => {
      $("#add-error").innerHTML = `<div> ${err.message} </div>`;
    });

  return true;
}

function listenerDeleteBookmark(event) {
  event.preventDefault();

  const id = $("#delete-id").value;
  if (id.length === 0) {
    return true;
  }


  $("#delete-error").innerHTML = "Making the request...";

  let url = `/bookmark/${id}`;
  let settings = {
    method : 'DELETE',
    headers : {
      Authorization : `Bearer ${API_TOKEN}`,
    },
  };
  fetch( url, settings )
    .then(response => {
      if (response.ok) {
        $("#delete-error").innerHTML = "Success!";
        updateAllBookmarks();
        return;
      }
      throw new Error( response.statusText );
    })
    .catch(err => {
      $("#delete-error").innerHTML = `<div> ${err.message} </div>`;
    });

  return true;
}

function listenerUpdateBookmark(event) {
  event.preventDefault();

  const id = $("#update-id").value;
  const title = $("#update-title").value;
  const description = $("#update-descr").value;
  const urlBookmark = $("#update-url").value;
  const rating = parseInt($("#update-rating").value);
  if (id.length === 0 || (title.length === 0 && description.length === 0 &&
    urlBookmark.length === 0 && isNaN(rating))) {
    return true;
  }
  const data = {id};
  if (title) data.title = title;
  if (description) data.description = description;
  if (urlBookmark) data.url = urlBookmark;
  if (!isNaN(rating)) data.rating = rating;


  $("#update-error").innerHTML = "Making the request...";

  let url = `/bookmark/${id}`;
  let settings = {
    method : 'PATCH',
    headers : {
      Authorization : `Bearer ${API_TOKEN}`,
      'Content-Type' : 'application/json',
    },
    body : JSON.stringify(data),
  };
  fetch( url, settings )
    .then(response => {
      if(response.ok){
        return response.json();
      }
      throw new Error( response.statusText );
    })
    .then(responseJSON => {
      $("#update-error").innerHTML = "Success!";
      updateAllBookmarks();
    })
    .catch(err => {
      $("#update-error").innerHTML = `<div> ${err.message} </div>`;
    });

  return true;
}

function listenerByTitleBookmark(event) {
  event.preventDefault();

  const title = $("#by-title-title").value;
  if (title.length === 0) {
    return true;
  }


  $("#by-title-bookmarks").innerHTML = "";
  $("#by-title-error").innerHTML = "Getting bookmarks...";

  const url = `/bookmark?title=${title}`;
  let settings = {
    method : 'GET',
    headers : {
        Authorization : `Bearer ${API_TOKEN}`,
    },
  };
  fetch( url, settings )
    .then(response => {
      if(response.ok){
        return response.json();
      }
      throw new Error( response.statusText );
    })
    .then(responseJSON => {
      $("#by-title-error").innerHTML = "Sucess!";
      $("#by-title-bookmarks").innerHTML = createNiceBookmarksContainer(responseJSON);
    })
    .catch( err => {
      $("#by-title-error").innerHTML = `<div> ${err.message} </div>`;
      $("#by-title-bookmarks").innerHTML = "";
    });

  return true;
}

function updateAllBookmarks() {
  $("#all-bookmarks").innerHTML = "";
  $("#all-bookmarks-error").innerHTML = "Getting bookmarks...";

  const url = '/bookmarks';
  const settings = {
    method : 'GET',
    headers : {
        Authorization : `Bearer ${API_TOKEN}`,
    },
  };
  fetch( url, settings )
    .then(response => {
      if(response.ok){
        return response.json();
      }
      throw new Error( response.statusText );
    })
    .then(responseJSON => {
      $("#all-bookmarks-error").innerHTML = "Success!";
      $("#all-bookmarks").innerHTML = createNiceBookmarksContainer(responseJSON);
    })
    .catch( err => {
      $("#all-bookmarks-error").innerHTML = `<div> ${err.message} </div>`;
      $("#all-bookmarks").innerHTML = "";
    });
}

function createNiceBookmarksContainer(bookmarks) {
  if (bookmarks.length === 0) {
    return "<div>Bookmarks Empty</div>";
  }

  let divContent = "";
  for (const bookmark of bookmarks) {
    divContent += `<div>_ID: ${bookmark._id} <br> Title: ${bookmark.title} <br> Description: ${bookmark.description} <br> URL: ${bookmark.url} <br> Rating: ${bookmark.rating} </div>`;
  }

  return `<div>${divContent}</div>`;
}

(function init() {
  $("#add-button").addEventListener('click', listenerAddBookmark);
  $("#delete-button").addEventListener('click', listenerDeleteBookmark);
  $("#update-button").addEventListener('click', listenerUpdateBookmark);
  $("#by-title-button").addEventListener('click', listenerByTitleBookmark);

  updateAllBookmarks();
})();
