const { scoreDocuments, generateAnswer } = require('./simpleRetrieval');

// In-memory storage for demo purposes
const documents = [];

function createRagServiceImplementation() {
  return {
    IndexDocument: (call, callback) => {
      const { document_id, title, content } = call.request;

      if (!document_id || !title || !content) {
        return callback(new Error('document_id, title, and content are required'));
      }

      const existingIndex = documents.findIndex((d) => d.document_id === document_id);
      if (existingIndex >= 0) {
        documents[existingIndex] = { document_id, title, content };
      } else {
        documents.push({ document_id, title, content });
      }

      console.log(`Indexed document ${document_id} - "${title}"`);
      callback(null, { ok: true });
    },

    Chat: (call) => {
      const { question, max_context_docs } = call.request;
      const maxDocs = max_context_docs || 3;

      if (!question) {
        call.write({ token: 'Question is required.', is_final: true });
        return call.end();
      }

      if (documents.length === 0) {
        const msg = 'No documents indexed yet. Please index a document before asking questions.';
        call.write({ token: msg, is_final: true });
        return call.end();
      }

      const scored = scoreDocuments(question, documents);
      const topDocs = scored.slice(0, maxDocs).map((s) => s.document);

      const answer = generateAnswer(question, topDocs);

      const tokens = answer.split(/(\s+)/); 
      tokens.forEach((token, idx) => {
        if (token.length === 0) return;
        const isFinal = idx === tokens.length - 1;
        call.write({ token, is_final: isFinal });
      });

      call.end();
    }
  };
}

module.exports = { createRagServiceImplementation, documents };
