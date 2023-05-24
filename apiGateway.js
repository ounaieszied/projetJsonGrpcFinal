const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const bookProtoPath = "book.proto";
const auteurProtoPath = "auteur.proto";
const tvShowProtoPath = "tvShow.proto";

const resolvers = require("./resolvers");
const typeDefs = require("./schema");

const app = express();
app.use(bodyParser.json());

const bookProtoDefinition = protoLoader.loadSync(bookProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const auteurProtoDefinition = protoLoader.loadSync(auteurProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const tvShowProtoDefinition = protoLoader.loadSync(tvShowProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const bookProto = grpc.loadPackageDefinition(bookProtoDefinition).book;
const tvShowProto = grpc.loadPackageDefinition(tvShowProtoDefinition).tvShow;
const auteurProto = grpc.loadPackageDefinition(auteurProtoDefinition).auteur;

const clientBooks = new bookProto.BookService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);
const clientTVShows = new tvShowProto.TVShowService(
  "localhost:50052",
  grpc.credentials.createInsecure()
);
const clientAuteurs = new auteurProto.AuteurService(
  "localhost:50053",
  grpc.credentials.createInsecure()
);

const server = new ApolloServer({ typeDefs, resolvers });

server.start().then(() => {
  app.use(cors(), bodyParser.json(), expressMiddleware(server));
});

app.get("/books", (req, res) => {
  clientBooks.searchBooks({}, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.books);
    }
  });
});

app.post("/book", (req, res) => {
  const { id, title, description } = req.body;
  clientBooks.createBook(
    { book_id: id, title: title, description: description },
    (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response.book);
      }
    }
  );
});

app.put("/books/:id", (req, res) => {
  const id = req.params.id;
  const { title, description } = req.body;
  clientBooks.updateBook(
    { book_id: id, title: title, description: description },
    (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response.book);
      }
    }
  );
});

app.delete("/books/:id", (req, res) => {
  const id = req.params.id;
  clientBooks.deleteBook({ book_id: id }, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.book);
    }
  });
});

app.get("/books/:id", (req, res) => {
  const id = req.params.id;
  clientBooks.getBook({ book_id: id }, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.book);
    }
  });
});

app.get("/auteurs", (req, res) => {
  clientAuteurs.searchAuteurs({}, (err, response) => {
    console.log(response);
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.auteurs);
    }
  });
});

app.delete("/auteurs/:id", (req, res) => {
  const id = req.params.id;
  clientAuteurs.deleteAuteur({ auteur_id: id }, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.auteur);
    }
  });
});

app.post("/auteur", (req, res) => {
  const { id, name, book_id } = req.body;
  clientAuteurs.createAuteur(
    { auteur_id: id, name: name, book_id: book_id },
    (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response.book);
      }
    }
  );
});

app.get("/tvshows", (req, res) => {
  clientTVShows.searchTvshows({}, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.tv_shows);
    }
  });
});

app.get("/tvshows/:id", (req, res) => {
  const id = req.params.id;
  clientTVShows.getTvshow({ tvShowId: id }, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.tv_show);
    }
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
module.exports.clientBooks = clientBooks;
