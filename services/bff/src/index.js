const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { ragClient } = require('./ragClient');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'docbrain-bff' });
});

// Simple in-memory doc registry for demo (mirrors what we send to RAG)
const documents = {};

// Index a new document (text-based for simplicity)
app.post('/api/docs', async (req, res) => {
  try {
    const { documentId, title, content } = req.body;

    if (!documentId || !title || !content) {
      return res.status(400).json({ error: 'documentId, title, and content are required' });
    }

    documents[documentId] = { documentId, title, content };

    ragClient.IndexDocument({ document_id: documentId, title, content }, (err, response) => {
      if (err) {
        console.error('gRPC IndexDocument error:', err);
        return res.status(500).json({ error: 'Failed to index document', details: err.message });
      }
      return res.json({ ok: response.ok, documentId });
    });
  } catch (err) {
    console.error('POST /api/docs error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List indexed docs (from BFF memory only)
app.get('/api/docs', (req, res) => {
  res.json(Object.values(documents));
});

// Chat endpoint (non-streaming to the client; streaming stays internal BFF<->gRPC)
app.post('/api/chat/query', async (req, res) => {
  try {
    const { question, maxContextDocs } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'question is required' });
    }

    const maxDocs = typeof maxContextDocs === 'number' ? maxContextDocs : 3;

    const call = ragClient.Chat({ question, max_context_docs: maxDocs });

    let answerTokens = [];
    let lastToken = null;

    call.on('data', (tokenMsg) => {
      if (tokenMsg && tokenMsg.token) {
        answerTokens.push(tokenMsg.token);
        lastToken = tokenMsg;
      }
    });

    call.on('error', (err) => {
      console.error('gRPC Chat error:', err);
      res.status(500).json({ error: 'Chat failed', details: err.message });
    });

    call.on('end', () => {
      const answer = answerTokens.join('');
      res.json({
        answer,
        meta: {
          tokenCount: answerTokens.length,
          isFinal: lastToken ? lastToken.is_final : true
        }
      });
    });
  } catch (err) {
    console.error('POST /api/chat/query error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`DocBrain BFF listening on port ${PORT}`);
});
