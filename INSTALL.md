## Deployment

Ensure you have docker, node, and npm installed.

To deploy the following project follow the given steps:

### Client
1. run ``npm install`` to download all needed dependencies to run the project
2. fill in the provided .env file in the client directory with the need information
3. run ``npm start`` if testing locally, or ``npm run build`` if deploying for production

### Server
1. run ``npm install`` to download all needed dependencies to run the project
2. fill in the provided .env file in the client directory with the need information

Once the above steps have been completed we can deploy the project using docker using the following steps:

1. Run ``cd /src/deployment``
2. Add the following environment variables to your terminal "MONGO_ROOT_USER" and "MONGO_ROOT_PASS", make sure the values of these variables are the same as what you stated in the server environment variables files
3. Update the Caddy file to point to the correct domain name and change "ports" for in the docker compose file to "expose" for all services except Caddy if you are deploying to a public server.
3. Run ``docker compose up -d`` to deploy

MongoDB can be access on port 27017
Mongo Express can be accessed on port 8081
