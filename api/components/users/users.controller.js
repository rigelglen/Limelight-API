const express = require('express');
const router = express.Router();
const userService = require('./user.service');

// routes
router.post('/authenticate', validateAuth, authenticate);
router.post('/register', validateAuth, register);
router.get('/current', getCurrent);
router.put('/:id', update);
router.delete('/:id', _delete);

module.exports = router;

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Email or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    userService.create(req.body)
        .then((data) => res.json(data))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function validateAuth(req, res, next) {
    const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    if (!req.body.email || !req.body.password || req.body.email.length <= 0 || req.body.password.length <= 0) {
        throw 'Email and Password must be provided';
    } else if (req.body.password.length <= 5) {
        throw 'Password must be greater than 5 characters';
    } else if (reg.test(req.body.email) == false) {
        throw 'Email is not valid';
    }
    next()
}