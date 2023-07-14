const Boletos = require("../models/Boletos");
const ReadLine = require("readline");
const { Op } = require("sequelize");
const { Readable } = require("stream");
const Lotes = require("../models/Lotes");
const pdf = require("pdf-creator-node");
const fs = require("fs");
const path = require("path");
const optionsPDF = require("../utils/pdfOptions");
const pdfjs = require("pdfjs-dist");

const getBoletos = async (req, res) => {
  try {
    const { nome, valor_inicial, valor_final, id_lote } = req.query;

    const filters = {};
    if (id_lote) filters.id_lote = id_lote;

    if (nome) {
      filters.nome_sacado = {
        [Op.like]: `%${nome}%`,
      };
    };

    if (valor_inicial && valor_final) {
      filters.valor = {
        [Op.between]: [parseFloat(valor_inicial), parseFloat(valor_final)],
      };
    } else if (valor_inicial) {
      filters.valor = {
        [Op.gte]: parseFloat(valor_inicial),
      };
    } else if (valor_final) {
      filters.valor = {
        [Op.lte]: parseFloat(valor_final),
      };
    }
    
    const boletos = await Boletos.findAll({ where: filters, raw: true });
    res.status(200).json({ data:boletos });
  } catch (error) {
    console.error("Erro ao buscar os boletos:", err);
    res.status(500).json({ error: err });
  }
};

const importData = async (req, res) => {
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

const generatePdfSindico = async (req, res) => {
  // let html = fs.readFileSync("../../src/temp/template.html");
  const templatePath = path.resolve(
    __dirname,
    "../public/template_sindico.html"
  );
  let html = fs.readFileSync(templatePath, "utf8");
  // let boletos = await Boletos.findAll({ raw: true });
  let document = {
    html,
    data: {
      boletos: [
        //ou boletos para ler todos os boletos
        {
          nome: "MARCIA CARVALHO",
          id_lote: 7,
          valor: 128.0,
          linha_digitavel: "123456123456123456",
        },
        {
          nome: "JOSE DA SILVA",
          id_lote: 3,
          valor: 182.54,
          linha_digitavel: "123456123456123456",
        },
        {
          nome: "MARCOS ROBERTO",
          id_lote: 6,
          valor: 178.2,
          linha_digitavel: "123456123456123456",
        },
      ],
    },
    path: path.resolve(__dirname, `../public/boletos_!ordenados.pdf`),
    type: "",
  };

  pdf
    .create(document, optionsPDF)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
};

const readPDF = async (req, res) => {
  try {
    const pdfToReadPath = path.resolve(
      __dirname,
      `../public/boletos_!ordenados.pdf`
    );
    const templatePath = path.resolve(__dirname, "../public/template.html");
    const html = fs.readFileSync(templatePath, "utf8");
    const data = new Uint8Array(fs.readFileSync(pdfToReadPath));
    const loadingTask = pdfjs.getDocument(data);
    const pdfToCreate = await loadingTask.promise;
    const numPages = pdfToCreate.numPages;

    let boletosBanco = await Boletos.findAll({ raw: true });
    let PDFDados = new Array();
    let resultadoFinal = new Array();
    for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
      const page = await pdfToCreate.getPage(pageNumber);
      const textContent = await page.getTextContent();

      let pageText = textContent.items
        .filter((item) => item.str.includes(":"))
        .map((item) => {
          const [key, value] = item.str.split(":");
          return { [key.trim()]: value.trim() };
        });

      let dadosFormatados = {};
      for (let i = 0; i < pageText.length; i++) {
        const key = Object.keys(pageText[i])[0];
        const value = pageText[i][key];

        dadosFormatados[key] = value;
      }
      PDFDados.push(dadosFormatados);
    }

    for (let i = 0; i < PDFDados.length; i++) {
      const pdfData = PDFDados[i];
      for await (const element of boletosBanco) {
        if (pdfData.Name == element.nome_sacado) {
          let document = {
            html,
            data: {
              boletos: [element],
            },
            path: path.resolve(__dirname, `../temp/${element.id}.pdf`),
            type: "",
          };
          const result = await pdf.create(document, optionsPDF);
          resultadoFinal.push(...Object.values(result));
        }
      }
    }
    res.status(200).json({
      msg: `arquivos criados:${resultadoFinal}`,
    });
  } catch (err) {
    console.error("Erro ao ler o PDF:", err);
    res.status(500).json({ error: err });
  }
};

module.exports = {
  importData,
  generatePdfSindico,
  readPDF,
  getBoletos,
};
