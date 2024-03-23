const dotenv = require('dotenv');
const { ChatOllama } = require('@langchain/community/chat_models/ollama');
const { PromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence, RunnablePassthrough } = require('@langchain/core/runnables');
const { formatDocumentsAsString } = require('langchain/util/document');
const { StringOutputParser } = require('@langchain/core/output_parsers');

const fs = require('fs');
const path = require('path');

const englishTemplate = fs.readFileSync(path.join(__dirname, 'prompt-template.txt')).toString();
const spanishTemplate = fs.readFileSync(path.join(__dirname, 'prompt-template-spanish.txt')).toString();

dotenv.config();

const englishPromptTemplate = PromptTemplate.fromTemplate(englishTemplate);
const spanishPromptTemplate = PromptTemplate.fromTemplate(spanishTemplate);

let model = null;

/**
 * Returns a ChatOllama preconfigured to call the tokenHandlerCallback callback.
 * @param {function} tokenHandlerCallback is a callback that is passed the tokens received from the LLM
 */
const setupNewModel = () => {
  if (!model) {
    model = new ChatOllama({
      baseUrl: 'http://localhost:11434', // Default value
      model: 'llama2', // Default value
      debug: true,
    });
  }
};

const setupNewChain = async ({ promptTemplate, pgVectorStore }) => {
  setupNewModel();
  const retriever = pgVectorStore.asRetriever();

  if (model && promptTemplate && pgVectorStore && retriever) {
    try {
      return RunnableSequence.from([
        {
          context: retriever.pipe(formatDocumentsAsString),
          question: new RunnablePassthrough(),
        },
        promptTemplate,
        model,
        new StringOutputParser(),
      ]);
    } catch (err) {
      console.warn(`setupNewChain error: `, err?.message);
      return null;
    }
  }
  return null;
};

module.exports = {
  englishPromptTemplate,
  spanishPromptTemplate,
  setupNewChain,
};
