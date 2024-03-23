const dotenv = require('dotenv');
const express = require('express');
const multer = require('multer');
const { ChatOllama } = require('@langchain/community/chat_models/ollama');
const { formatDocumentsAsString } = require('langchain/util/document');
const { RunnableSequence, RunnablePassthrough } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');

const { fileUploadHandler } = require('./handlers/fileUpload.js');
const { getPgVectorStore, isInitialStoreValid } = require('./db/dbConfig.js');
const { setupNewChain, englishPromptTemplate } = require('./model/modelConfig.js');
const { initializeChatSession, chatWithInitializedSession } = require('./handlers/chat.js');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './documents/raw'); // specify the destination folder where files will be saved
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // specify the file name
  },
});

const upload = multer({ storage: storage });

dotenv.config();

const { PORT } = process?.env;

const app = express();

app.use(express.json());

app.post('/api/upload', upload.single('file'), fileUploadHandler);
app.get('/api/chat-session', initializeChatSession);
app.post('/api/chat-session', chatWithInitializedSession);

app.listen(PORT, async () => {
  // initialize vector store and verify it is in working order
  const pgVectorStore = await getPgVectorStore();
  const isStoreValid = isInitialStoreValid(pgVectorStore);

  console.log(`> Server started on port ${PORT}`);
  if (isStoreValid) {
    console.log(`> PG Vector Store initialized successfully.`);
  } else {
    console.log(`> PG Vector Store NOT initialized!`);
  }

  // const chain = await setupNewChain({ promptTemplate: englishPromptTemplate, pgVectorStore });

  // const result = await chain.invoke('How to obtain a Social Security Number and Card');
  // console.log({ result });
});
