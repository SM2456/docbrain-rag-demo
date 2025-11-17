const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { createRagServiceImplementation } = require('./ragServer');

const PROTO_PATH = path.join(__dirname, '..', '..', '..', 'proto', 'rag.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const ragProto = grpc.loadPackageDefinition(packageDefinition).rag;

const server = new grpc.Server();

server.addService(ragProto.RagService.service, createRagServiceImplementation());

const PORT = process.env.PORT || '50051';

server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to start RAG gRPC server:', err);
    process.exit(1);
  }
  console.log(`DocBrain RAG gRPC service running on port ${port}`);
  server.start();
});
