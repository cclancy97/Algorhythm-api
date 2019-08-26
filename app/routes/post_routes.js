const express = require('express')
const passport = require('passport')

const Post = require('../models/post')
const Comment = require('../models/comment.js')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

// Posts

router.get('/posts', (req, res, next) => {
  Post.find()
    .populate('owner')
    .populate({
      path: 'comment',
      model: 'Comment',
      populate: {
        path: 'owner',
        model: 'User'
      }
    })
    .then(posts => {
      return posts.map(post => post.toObject())
    })
    .then(posts => {
      res.json({ posts })
    })
    .catch(next)
})

// SHOW //// GET /posts/5a7db6c74d55bc51bdf39793
router.get('/posts/:id', (req, res, next) => {
  const id = req.params.id
  // keep track of doc
  let post
  Post.findById(id)
    .then(handle404)
    .then(foundPost => {
      // store doc
      post = foundPost.toObject()
      // find all comments of doc w/ specific id
      return Comment.find({ post: id })
    })
    .then(comments => {
      // add comments to doc object for serializing
      post.comments = comments
      res.json({ post })
    })
    .catch(next)
})

// CREATE //// POST /posts
router.post('/posts', requireToken, (req, res, next) => {
  req.body.post.owner = req.user.id
  Post.create(req.body.post)
    .then(post => {
      res.status(201).json({ post: post.toObject() })
    })
    .catch(next)
})

// UPDATE //// PATCH /posts/id
router.patch('/posts/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.post.owner
  Post.findById(req.params.id)
    .then(handle404)
    .then(post => {
      requireOwnership(req, post)
      return post.update(req.body.post)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// DESTROY //// DELETE /posts/id
router.delete('/posts/:id', requireToken, (req, res, next) => {
  Post.findById(req.params.id)
    .then(handle404)
    .then(post => {
      requireOwnership(req, post)
      post.remove()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
