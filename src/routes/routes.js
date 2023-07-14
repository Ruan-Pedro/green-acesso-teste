const express = require('express');
const router = express.Router();
const BoletosControllers = require('../controllers/boletosControllers');
const multer = require('multer');
const multerConfig = multer();
router.get('/', (req,res) => {
    res.status(200).send({
        msg: 'Teste para a Green Acesso',
        developer: 'Ruan Pedro Mendes'
 })
})
//TESTE
router.get('/ping', (req, res) => res.send('pong'));

//GETS (ATIVIDADE 4)
router.get('/boletos', BoletosControllers.getBoletos);

//ARQUIVOS (ATIVIDADES 1,2,3)
router.get('/import', multerConfig.single("file"), BoletosControllers.importData);
router.get('/pdf', BoletosControllers.generatePdfSindico);
router.get('/pdfread', BoletosControllers.readPDF);


module.exports = router;