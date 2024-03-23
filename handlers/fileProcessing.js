// import the pgVectorStore that is the default export from ../db/dbConfig.js
// read the contents of ../documents/raw
// asynchronously split each document using RecursiveCharacterTextSplitter from langchain
// using the following configurations chunkSize: 500, chunkOverlap: 100
// for each split document contents utilize the addDocuments method on the pgVectorStore
// once done processing the files move them to ../documents/processed
const { Document } = require('@langchain/core/documents');
const fsp = require('fs').promises;
const fs = require('fs');
const path = require('path');

const { getPgVectorStore } = require('../db/dbConfig.js');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');

exports.processFiles = async () => {
  let processed = false;
  // Read the contents of ../documents/raw
  const documentsPath = path.join(__dirname, '../documents/raw');
  const rawDocuments = await fs.readdirSync(documentsPath);

  // Asynchronously split each document using RecursiveCharacterTextSplitter from langchain
  const splitConfig = { chunkSize: 500, chunkOverlap: 100 };
  const splitter = new RecursiveCharacterTextSplitter(splitConfig);

  console.info('STEP 1: Splitter Created');
  console.info('Documents Path: ', documentsPath);
  console.info('Number of Documents: ', rawDocuments.length);

  console.info('/n/n');
  console.info('STEP 2: Reading Each Document');

  rawDocuments.map(async (doc, docIndex) => {
    const filePath = path.join(__dirname, `../documents/raw/${doc}`);
    const outputText = await fsp.readFile(filePath, 'utf8');

    console.info(`STEP 2.1.${docIndex}: Document Details:\n\tFile Path:\t\t${filePath}\n\tDocument Length:\t${outputText.length}`);

    const pgVectorStore = await getPgVectorStore();
    if (pgVectorStore) {
      console.info(`STEP 2.2.${docIndex}: PG Vector Store Initiated`);
      console.info(`STEP 2.3.${docIndex}: Starting to split document into chunks.`);

      const docOutput = await splitter.splitDocuments([new Document({ pageContent: outputText })]);

      console.info(`STEP 2.4.${docIndex}: Total Chunks Generated: ${docOutput.length}`);
      console.info(`STEP 2.5.${docIndex}: Starting to add documents into PG Vector Store.`);

      await pgVectorStore.addDocuments(docOutput);
      console.info(`STEP 2.6.${docIndex}: Documents successfully added into PG Vector Store.`);

      const newFilePath = path.join(__dirname, `../documents/processed/${doc}`);
      console.info(`STEP 2.7.${docIndex}: moving file`);
      console.info(`From:\t\t${filePath}`);
      console.info(`To:\t\t${newFilePath}`);

      await fs.rename(filePath, newFilePath, (err, result) => {
        if (!err) {
          processed = true;
          console.info(`STEP 2.8.${docIndex}: File processing complete.`);
        } else {
          return processed;
        }
      });
    } else {
      console.warn('No PG Vector Store Obtained');
    }
  });
};
