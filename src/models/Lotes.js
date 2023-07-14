const { Sequelize, Connection } = require("../database/connection");

const Lotes = Connection.define(
  "lotes",
  {
    nome: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    ativo: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    criado_em: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    timestamps: false, // Desativa os campos createdAt e updatedAt
  }
);

Lotes.sync({ force: false }).then(() => {});
module.exports = Lotes;
