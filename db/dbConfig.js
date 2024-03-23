const dotenv = require('dotenv');
dotenv.config();

const { OllamaEmbeddings } = require('@langchain/community/embeddings/ollama');
const { PGVectorStore } = require('@langchain/community/vectorstores/pgvector');

const { PG_HOST, PG_PORT, PG_USER, PG_PWD, PG_DATABASE, MODEL_NAME, MODEL_URL } = process.env;

const getPgVectorStore = async (tableName = 'vectordocs') => {
  // TODO: Check if a table with tableName does not exist in postgres DB.
  // If it does not exist, then create it before initializing the VectorStore.

  const config = {
    postgresConnectionOptions: {
      type: 'postgres',
      host: PG_HOST,
      port: PG_PORT ? Number(PG_PORT) : 5432,
      user: PG_USER,
      password: PG_PWD,
      database: PG_DATABASE,
    },
    tableName,
    columns: {
      idColumnName: 'id',
      vectorColumnName: 'vector',
      contentColumnName: 'content',
      metadataColumnName: 'metadata',
    },
  };

  const embeddings = new OllamaEmbeddings({
    model: MODEL_NAME,
    baseUrl: MODEL_URL,
    requestOptions: {
      useMMap: true,
      numThread: 6,
      numGpu: 1,
    },
  });

  const pgVectorStore = await PGVectorStore.initialize(embeddings, config);
  return pgVectorStore;
};

/**
 * Determines wether or not the initial store is valid and works as expected.
 * @param {*} pgVectorStore
 * @returns boolean
 */
const isInitialStoreValid = async pgVectorStore => {
  try {
    let results = await pgVectorStore.similaritySearch('water', 1);

    if (!results) {
      await pgVectorStore.addDocuments([
        { pageContent: "what's this", metadata: { a: 2 } },
        { pageContent: 'Cat drinks milk', metadata: { a: 1 } },
      ]);
      results = await pgVectorStore.similaritySearch('water', 1);
    }
    return !!results;
  } catch (err) {
    return false;
  }
};

module.exports = { getPgVectorStore, isInitialStoreValid };
