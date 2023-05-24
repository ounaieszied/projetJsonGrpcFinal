const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const clientbooks = require("./apiGateway.js").clientBooks;
const auteurProtoPath = "auteur.proto";
const auteurProtoDefinition = protoLoader.loadSync(auteurProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const auteurProto = grpc.loadPackageDefinition(auteurProtoDefinition).auteur;
const auteurs = [
  {
    id: "1",
    name: "Example Auteur 1",
    book: {
      id: "1",
      title: "Example book 2",
      description: "This is the second example book.",
    },
  },
  {
    id: "2",
    name: "Example Auteur 2",
    book: {
      id: "2",
      title: "Example book 2",
      description: "This is the second example book.",
    },
  },
];
let global_id = auteurs.length;

const auteurService = {
  getAuteur: (call, callback) => {
    const auteur = {
      id: call.request.auteur_id,
      name: auteurs[call.request.auteur_id].name,
      book: auteurs[call.request.auteur_id].description,
    };
    callback(null, { auteur });
  },
  searchAuteurs: (call, callback) => {
    const { query } = call.request;

    callback(null, { auteurs });
  },

  createAuteur: (call, callback) => {
    const { query } = call.request;
    const auteur = {
      id: ++global_id,
      name: call.request.name,
      book: {},
    };
    clientbooks.getBook({ book_id: call.request.book_id }, (err, response) => {
      if (!err) {
        auteur.book = response.book;
        auteurs.push(auteur);
        callback(null, { auteur });
      } else {
        callback(null, { auteur });
      }
    });
  },
  deleteAuteur: (call, callback) => {
    const { query } = call.request;
    const auteur = {
      id: call.request.auteur_id,
    };
    const delete_id = auteurs.indexOf(
      auteurs.find((element) => element.id == auteur.id)
    );
    auteurs.splice(delete_id, 1);
    callback(null, { auteur });
  },
  /*
  updateAuteur: (call, callback) => {
    console.log(call.request.auteur_id);

    const auteur = {
      id: call.request.auteur_id,
      title: call.request.title,
      description: call.request.description
  
    };
    console.log(auteur);
    auteurs[call.request.auteur_id] = auteur;
    callback(null, {auteur});
  },

  deleteAuteur: (call, callback) => {
    const { query } = call.request;
    const auteur = {
      id: call.request.auteur_id,

    };
    console.log(auteur);
    auteurs.pop(auteur);
    callback(null, {auteur});
  }
*/
};

const server = new grpc.Server();
server.addService(auteurProto.AuteurService.service, auteurService);
const port = 50053;
server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error("Failed to bind server:", err);
      return;
    }

    console.log(`Server is running on port ${port}`);
    server.start();
  }
);
console.log(`Auteur microservice running on port ${port}`);
