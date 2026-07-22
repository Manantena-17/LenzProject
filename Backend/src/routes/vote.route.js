const express = require('express');
const router = express.Router();
const voteController = require('../controllers/vote.controller');
const authMiddleware = require('../middlewares/auth.middleware'); 

router.post(
  '/images/:imageId/vote',
  authMiddleware, 
  voteController.submitVote
);

module.exports = router;