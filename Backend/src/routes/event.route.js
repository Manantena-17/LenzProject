const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');

router.post('/', eventController.createEvent);              
router.post('/:id/images', eventController.addImage);       
router.get('/', eventController.getAllEvents);             
router.get('/:id', eventController.getEventById);          
// voter pour une image (ex: /api/events/images/5/vote)
router.post('/images/:imageId/vote', eventController.voteImage);

// Voir le gagnant à la fin du vote (ex: /api/events/1/winner)
router.get('/:id/winner', eventController.getWinner);
module.exports = router;