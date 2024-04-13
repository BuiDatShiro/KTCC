
var express = require('express');
var router = express.Router();
var authorModel = require('../schemas/author')



/*
Viết mã nguồn để thực hiện chuôi query với yêu cầu như sau
ngoại trừ các thuộc tính như sort,page,limit 
thì các trường còn lại sẽ check contain
*/
router.get('/', async function (req, res, next) {
    var authors = await authorModel.find(
        {}).populate('published')
        .exec();
    res.status(200).send(authors);
});

router.get('/:id', async function (req, res, next) {
    try {
        let book = await bookModel.find({ _id: req.params.id }).exec();
        res.status(200).send(book);
    } catch (error) {
        res.status(404).send(error);
    }
});

router.post('/', async function (req, res, next) {
    var newBook = new bookModel({
        name: req.body.name,
        year: req.body.year,
        author: req.body.author
    })
    await newBook.save();
    res.status(200).send(newBook);
});

router.put('/:id', async function (req, res, next) {
    try {
        var book = await bookModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });
        res.status(200).send(book);
    } catch (error) {
        res.status(404).send(error);
    }

});

router.delete('/:id', async function (req, res, next) {
    try {
        var book = await bookModel.findByIdAndUpdate(req.params.id,
            { isDeleted: true }, {
            new: true
        });
        res.status(200).send(book);
    } catch (error) {
        res.status(404).send(error);
    }
});




module.exports = router;