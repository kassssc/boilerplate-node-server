# boilerplate node server
Project runs on 2 docker containers: GraphQL node server and MongoDB

Requirements to run the project:

- Docker installed
- Docker Compose installed
- Yarn installed

Steps to run:

- After cloning the project, run "yarn" to install dependencies
- Run "yarn docker-up:build" this will spin up the server and database containers with the environment variables
- Docker will prompt you to enter your device password, after that the containers should run smoothly
- The app will create a default user in the database with name, email, and password specified in environment variables
- Server will be served on http://localhost:11168/api/graphql

Default Ports (could be overwritten by .env file):

- Mongodb: 27018
- GraphQL: 11168

Environment Variables: 
LOG_DIR: directory to store logs on docker container
HOST_LOG_DIR: directory to store logs on HOST machine (automatically created by app if doesn't exist)
HOST_DB_DIR: directory to store the DB data
DB_ROOT_USER: Database root username
DB_ROOT_PASS: Database root password
DB_PORT: Port to expost MongoDB on
DB_NAME: Name of database
DB_USER: Username for API database user
DB_PASS: Password for API database user
PORT: Port to expost graphQL API on
GRAPHQL_ENDPOINT: Customize endpoint for graphql server
JWT_SECRET: Random bytes as jwt secret (Must be kept secret)
ADMIN_USER_EMAIL: Email of the default user created
ADMIN_USER_NAME: Name of default user created
ADMIN_USER_PASS: Password for default user

Notes:

- Postman file included for easy api testing
- In real situations, do not store environment variables on the repository

