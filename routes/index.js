var express = require('express');
var router = express.Router();
const {Book} = require('../models');
const { Op } = require("sequelize");

// Handler function to wrap each route

function asyncHandler(cb){
  return async(req,res,next) => {
    try{
      await cb(req, res, next);
    }catch(error){
      res.status(500).send(error);
    }
  }
}


/* GET home page. */
router.get('/',asyncHandler(async(req, res, next) => {
  res.redirect('/books');
}));

//GET all the books
router.get('/books',asyncHandler(async(req, res, next) => {
  const books = await Book.findAll();
  const pages = Math.ceil(books.length / 10);
  if (books.length > 10) {
    books.length = 10;
  }
  res.render('/index',{books,title:"All books", pages});
}));

router.get('/books/page/:page', asyncHandler(async(req, res, next) => {
  const bookCount = await Book.count();
  const pages = Math.ceil(bookCount / 10);
  const limit = parseInt(req.params.page) * 10;
  const offset = limit - 10;
  const books = await Book.findAll({offset, limit});
  res.render('index', {books, title: "All books", pages});
}));

//Get the create new book form
router.get('/books/new',asyncHandler(async(req, res, next) => {
  const books = await Book.findAll();
  res.render('/new-book',{title:"New book"});
}));

//POST a new book to the database
router.post('/books/new', asyncHandler(async (req, res, next) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books/" + book.id);
  } catch (error) {
    if(error.name === "SequelizeValidationError") { // checking the error
      book = await Book.build(req.body);
      res.render("new-book", { title: "New book", errors})
    } else {
      throw error; // error caught in the asyncHandler's catch block
    }  
  }
}));

//Get a book's detail-update  form
router.get('/books/:id',asyncHandler(async(req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if (book){
  res.render('update-book',{book, title: book.title});
  }else{
    next();
  }
}));

//POST update a book
router.post('/books/:id',asyncHandler(async(req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if (book){
    try{
      await book.update(req.body);
      res.redirect('/books');
    }catch(error){
      if (error.name === 'SequelizeValidationError'){
        const errors = err.errors.map(error => error.message);
        res.render('update-book',{book, title: book.title, errors});
      }else{
        throw error;
      }
    }
  }else{
    next();
  }
}));


// GET book search
router.get('/books/search/:search', asyncHandler(async(req, res, next) => {
  const books = await Book.findAll({
    where: {
      [Op.or]: [
        {title: {
          [Op.substring]: req.params.search
        }},
        {author: {
          [Op.substring]: req.params.search
        }},
        {genre: {
          [Op.substring]: req.params.search
        }},
        {year: {
          [Op.substring]: req.params.search
        }}
      ]
    }
  });
  res.render('index', {books, title: "Searching books"});
}));

// POST book search
router.post('/books/search', asyncHandler(async(req, res, next) => {
  res.redirect('/books/search/' + req.body.search);
}));

//Delete book 
router.delete('books/:id/delete', asyncHandler(async (req ,res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy(req.body);
    res.redirect("/books");
  } else {
    next();
  }
}));

module.exports = router;
