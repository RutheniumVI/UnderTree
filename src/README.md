# Project Name Source Code

The folders and files for this project are as follows:

...

# Deployment

docker, docker compose, nodejs, and jvm must be installed

The following environment variables must be added to the current terminal before deploying:

- MONGO_ROOT_USER
- MONGO_ROOT_PASS
- MONGO_HOST
- GITHUB_CI
- GITHUB_CS

Deploy mongodb and mongo-express:

```
cd deployment
docker compose up -d
```

MongoDB can be access on port 27017

Mongo Express can be accessed on port 8081

Deploy backend using gradle and frontend using node