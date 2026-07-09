const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validator.middleware'); // <-- Vérifiez bien le nom de ce fichier dans votre dossier !
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const authController = require('../controllers/auth.controller');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;