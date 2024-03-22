# Bain Technical Assessment Backend

## To Run locally

.env file
```
USERNAME=****
PASSWORD=****
```

## To run with Docker

In your terminal, run the following command to build the container.
```
docker build -t bain-backend:latest .
```
then, to run the container:
```
docker run -it -p 3000:3000 --env-file .env bain-backend:latest
```