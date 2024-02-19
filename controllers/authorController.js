const Author = require('../models/author');
const Book = require('../models/book');
const asyncHandler = require('express-async-handler');

// Display list of all authors
exports.author_list = asyncHandler(async (req, res, next) => {
  const authorList = await Author.find().sort({ family_name: 1}).exec();
  res.render('author_list', {
    title: 'Author List',
    author_list: authorList,
  });
});

// Display detail pasge for a specific author
exports.author_detail = asyncHandler(async (req, res, next) => {
  const [author, booksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, 'title summary').exec()
  ]);

  if (!author) {
    const err = new Error('Author not found');
    err.status = 404;
    return next(err);
  }

  res.render('author_detail', {
    title: 'Author Detail',
    author: author,
    author_books: booksByAuthor,
  });
});

// Display Author create form on get 
exports.author_create_get = asyncHandler(async (req, res, next) => {
  console.log('i do indeed get here')
  res.send('not implemented yet!!!');
});

// Handle author create on post
exports.author_create_post = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: Author create post`);
});

// Display author delete form on get
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, 'title summary').exec()
  ]);

  if (!author) {
    res.redirect('/catalog/authors');
  }

  res.render('author_delete', {
    title: 'Delete author',
    author: author,
    author_books: allBooksByAuthor,
  });
});

// Handle author delete on post
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, 'title summary').exec()
  ]);

  if (allBooksByAuthor.length > 0) {
    res.render('author_delete', {
      title: 'Delete author',
      author: author,
      author_books: allBooksByAuthor,
    });
    return;
  } else {
    await Author.findByIdAndDelete(req.body.authorid);
    res.redirect('/catalog/authors');
  }
});

// Display author update form on get
exports.author_update_get = asyncHandler(async (req, res, next) => {
  const author = await Author.findById(req.params.id);

  if (!author) {
    const err = new Error('Author not found');
    err.status = 404;
    return next(err);
  }

  res.render('author_form', {
    title: 'Edit Author',
    author: author,
  });
});

exports.author_update_post = [
  asyncHandler(async (req, res, next) => {
    const errors = validationRes(req);

    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_birth,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'Update author',
        authors: author,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedAuthor = await Author.findByIdAndUpdate(req.params.id, author, {});
      res.redirect(updatedAuthor.url);
    }
  })
];