const express = require('express');
const router = express.Router();
const Auth = require('../controllers/authControllers');
const BoletosControllers = require('../controllers/boletosControllers');
const multer = require('multer');
const multerConfig = multer();
router.get('/', (req,res) => {
    res.status(200).send({
        msg: 'Teste para a Green Acesso',
        developer: 'Ruan Pedro Mendes'
 })
})
//USERS
// router.post('/login', UsersControllers.login);
// router.get('/clients', Auth.optional, clientsControllers.getClients);
router.get('/import', multerConfig.single("file"), BoletosControllers.importData);
router.get('/pdf', multerConfig.single("file"), BoletosControllers.generatePdf);


module.exports = router;