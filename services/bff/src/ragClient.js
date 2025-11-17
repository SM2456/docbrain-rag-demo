const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = path.join(__dirname, '..', '..', '..', 'proto', 'rag.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const ragProto = grpc.loadPackageDefinition(packageDefinition).rag;

const RAG_HOST = process.env.RAG_HOST || 'localhost';
const RAG_PORT = process.env.RAG_PORT || '50051';
const RAG_ADDRESS = `${RAG_HOST}:${RAG_PORT}`;

const ragClient = new ragProto.RagService(
  RAG_ADDRESS,
  grpc.credentials.createInsecure()
);

module.exports = { ragClient };
