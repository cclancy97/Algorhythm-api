const express = require('express')
const passport = require('passport')
const Comment = require('../models/comment')
const Post = require('../models/post')
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// GET ALL POSTS WHILE NOT LOGGED IN
router.get('/comments', (req, res, next) => {
  Comment.find()
    .populate('owner')
    .populate('post')
    .then(comments => {
      return comments.map(comment => comment.toObject())
    })
    .then(comments => res.status(200).json({ comments: comments }))
    .catch(next)
})

// CREATE
// POST /comments
router.post('/comments', requireToken, (req, res, next) => {
  // set owner of new comment to be current user
  req.body.comment.owner = req.user.id

  Comment.create(req.body.comment)
    .then(comment => {
      // Find the post with matching post id on comment
      Post.findById(comment.post)
        .then(handle404)
        .then(post => {
          // Push new comment to array on posts
          post.comments.push(comment._id)
          // Update the post so the new comment stays in the array
          return post.update(post)
        })
        // respond to succesful `create` with status 201 and JSON of new "comment"
        .then(() => {
          res.status(201).json({ comment: comment.toObject() })
        })
        .catch(next)
    })
})
// SHOW
// GET /comments/5a7db6c74d55bc51bdf39793
router.get('/comments/:id', (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Comment.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "comment" JSON
    .then(comment => res.status(200).json({ comment: comment.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// UPDATE USERS SPECIFIC POSTS WHILE LOGGED IN
// PATCH /comments/5a7db6c74d55bc51bdf39793
router.patch('/comments/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.comment.owner

  Comment.findById(req.params.id)
    .then(handle404)
    .then(comment => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, comment)

      // pass the result of Mongoose's `.update` to the next `.then`
      return comment.update(req.body.comment)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY POSTS WHILE LOGGED IN BELONGING TO SPECIFIC USER
// DELETE /comments/5a7db6c74d55bc51bdf39793
router.delete('/comments/:id', requireToken, (req, res, next) => {
  Comment.findById(req.params.id)
    .then(handle404)
    .then(comment => {
      // throw an error if current user doesn't own `comment`
      requireOwnership(req, comment)
      // delete the comment ONLY IF the above didn't throw
      comment.remove()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
