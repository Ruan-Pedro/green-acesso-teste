const { Sequelize, Connection } = require("../database/connection");

const Boletos = Connection.define(
  "boletos",
  {
    nome_sacado: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    id_lote: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "lotes",
        key: "id",
      },
    },
    valor: {
      type: Sequelize.DECIMAL(10,2),
      allowNull: true,
    },
    linha_digitavel: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    ativo: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    criado_em: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: false, // Desativa os campos createdAt e updatedAt
  }
);
Boletos.sync({ force: false }).then(() => {});
module.exports = Boletos;
