// Keep Chat Sessions in Memory
const { v4 } = require('uuid');
const { setupNewChain, englishPromptTemplate, spanishPromptTemplate } = require('../model/modelConfig');
const { getPgVectorStore } = require('../db/dbConfig');

const sessions = {};

// Initialize a Chat Session { promptTemplate, pgVectorStore }
exports.initializeChatSession = async (req, res) => {
  try {
    const sessionObject = {};
    const newSessionId = v4();
    // If params lang is en then use english otherwise use spanish
    const promptTemplate = req.params.lang === 'es' ? spanishPromptTemplate : englishPromptTemplate;

    const tableName = req.params.tableName || 'vectordocs';
    const pgVectorStore = await getPgVectorStore(tableName);

    const runnableSequence = await setupNewChain({ promptTemplate, pgVectorStore });

    sessionObject.runnableSequence = runnableSequence;
    sessions[newSessionId] = sessionObject;
    res.json({ sessionId: newSessionId });
  } catch (err) {
    console.warn({ err });
    res.status(500).send('Failed to initialize new chat session.');
  }
};

// Ask Questions and Retrieve Answers...
exports.chatWithInitializedSession = async (req, res) => {
  try {
    const { prompt, sessionId } = req.body;
    const currentSession = sessions[sessionId];
    console.log({ currentSession, sessions, sessionId });
    if (currentSession) {
      const result = await currentSession.runnableSequence.invoke(prompt);
      if (result.length > 0) {
        res.json({ result, id: v4() });
      }
    } else {
      res.status(404).send('Chat session not found, please initialize a new chat session.');
    }
  } catch (err) {
    console.warn({ err });
  }
};
