const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');

router.post('/', eventController.createEvent);              
router.post('/:id/images', eventController.addImage);       
router.get('/', eventController.getAllEvents);             
router.get('/:id', eventController.getEventById);          
router.post('/:id/images/:imageId/vote', eventController.voteImage);
router.get('/:id/winner', eventController.getWinner);
module.exports = router;