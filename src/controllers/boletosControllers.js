const Boletos = require("../models/Boletos");
const ReadLine = require("readline");
const { Op } = require("sequelize");
const { Readable } = require("stream");
const Lotes = require("../models/Lotes");
var pdf = require("pdf-creator-node");
var fs = require("fs");
const path = require('path');
const optionsPDF = require('../utils/pdfOptions');

const importData = async (req, res) => {
  let i = 0;
  const file = req.file.buffer;
  const readableFile = new Readable();
  readableFile.push(file);
  readableFile.push(null);

  const lines = ReadLine.createInterface({
    input: readableFile,
  });

  for await (let line of lines) {
    if (line.split(";")[0] == "nome") {
      continue;
    } else {
      let [nome, unidade, valor, linha_digitavel] = line.split(";");
      let lote = await Lotes.findOne({
        where: { nome: { [Op.like]: `%${unidade}%` } },
      });

      await Boletos.create({
        nome_sacado: nome || "",
        id_lote: lote.dataValues.id,
        valor: Number(valor) || "",
        linha_digitavel: linha_digitavel || "",
        ativo: true,
      });
    }
  }

  return res.status(200).json({ msg: "dados cadastrados com sucesso" });
};

const generatePdf = async (req, res) => {
  // let html = fs.readFileSync("../../src/temp/template.html");
  const templatePath = path.resolve(__dirname, '../public/template.html');
  let html = fs.readFileSync(templatePath, 'utf8')
  let boletos = await Boletos.findAll({ raw: true });
  let document = {
    html,
    data: {
      users:boletos
    },
    path: path.resolve(__dirname, '../temp'),
    type: ""
  };

  pdf.create(document, optionsPDF).then((result) => {
    console.log(result)
    res.send(result)
  }).catch((err) => {
    console.error(err)
  })
}

module.exports = {
  importData,
  generatePdf
};
