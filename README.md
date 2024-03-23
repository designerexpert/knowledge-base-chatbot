# Knowledge Base Chatbot Using Ollama Models

## External Requirements & Dependencies

1. Running Version of Ollama, please see: [ollama.com](https://ollama.com/)
2. Node JS, please see: [NodeJS.org](https://nodejs.org)
3. Docker Desktop or a PostgresQL Database, please see [docker.com](https://www.docker.com/) or [postgresql.org](https://postgresql.org)

## Set-Up

- create a `.env`` file at the root of the project directory and add the following contents to it (Ensure to replace connection information to match your postgres server):

```env
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PWD=password
PG_DATABASE=ollamavector
MODEL_NAME=llama2
MODEL_URL="http://localhost:11434"
PORT=8080
```

- Ensure to start the database using docker

```bash
docker run -d --name pgvector -e POSTGRES_PASSWORD=password -v ${HOME}/pgvector/:/var/lib/postgresql/data -p 5432:5432 pgvector/pgvector:pg16
```

Now that we have started a database server on our computer with Docker, we can log into the running container to create a database that we can use to store our vectors.

```bash
docker exec -it pgvector psql -U postgres
create database ollamavector;
# DATABASE CREATED
CREATE EXTENSION IF NOT EXISTS vector;
# EXTENSION vector CREATED
\q
```
