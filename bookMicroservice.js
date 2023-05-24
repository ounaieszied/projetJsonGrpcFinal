const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const bookProtoPath = "book.proto";
const bookProtoDefinition = protoLoader.loadSync(bookProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const bookProto = grpc.loadPackageDefinition(bookProtoDefinition).book;

const books = [
  {
    id: "1",
    title: "Example Book 1",
    description: "This is the first example book.",
  },
  {
    id: "2",
    title: "Example Book 2",
    description: "This is the second example book.",
  },
];

let global_id = books.length;

const bookService = {
  getBook: (call, callback) => {
    const update_id = books.indexOf(
      books.find((element) => element.id == call.request.book_id)
    );
    const book = {
      id: call.request.book_id,
      title: books[update_id].title,
      description: books[update_id].description,
    };
    callback(null, { book });
  },

  searchBooks: (call, callback) => {
    const { query } = call.request;
    callback(null, { books });
  },

  createBook: (call, callback) => {
    const { query } = call.request;
    const book = {
      id: ++global_id,
      title: call.request.title,
      description: call.request.description,
    };
    books.push(book);
    callback(null, { book });
  },

  updateBook: (call, callback) => {
    const book = {
      id: call.request.book_id,
      title: call.request.title,
      description: call.request.description,
    };
    const update_id = books.indexOf(
      books.find((element) => element.id == book.id)
    );
    books[update_id] = book;
    callback(null, { book });
  },

  deleteBook: (call, callback) => {
    const { query } = call.request;
    const book = {
      id: call.request.book_id,
    };
    const delete_id = books.indexOf(
      books.find((element) => element.id == book.id)
    );
    books.splice(delete_id, 1);
    callback(null, { book });
  },
};

const server = new grpc.Server();
server.addService(bookProto.BookService.service, bookService);
const port = 50051;
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
console.log(`Book microservice running on port ${port}`);
