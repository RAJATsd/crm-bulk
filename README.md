# Highlevel assessment

A crm that can be scalable to handle millions of records

## Table of contents

- [Installations](#installation)
- [Link to Loom Video](#link-to-loom-video)
- [Link to excalidraw](#excalidraw-link)
- [Files Included](#files-included)
- [Structure of project](#structure-of-project)
- [Tech Stack](#tech-stack)
- [List of Endpoints](#list-of-endpoints)
- [List of things not implemented](#list-of-things-not-implmented)

## Installation

In the terminal of the project run

```bash
 docker-compose up --build
```

Docker will handle all the installations. The Main server will be exposed on `localhost:3000`

## Link to Loom Video

`https://www.loom.com/share/0f4fd44c90b541e3bda875fdc0460763`

## Excalidraw link

`https://excalidraw.com/#json=SkUF4PFjhTdXoto43topa,N66JJLSQmVmpQ4QoS84HhA`

## Files Included

1. Highlevel CRM.postman_collection.json : The postman collection you can import
2. contacts.csv : Csv file with just 4 rows
3. generated_contacts.csv : Csv file with 1000+ rows.

## Structure of project

There are 2 servers running here, one is the main node js server with the entry point as index.js in the root directory. This main server handles

1.  All the user exposed endpoints
2.  Uploading of csv file and generating the bulk action object in MONGO
3.  Passing on the data to Bull queue

The other one is worker, situated in worker folder of the repo. It handles

1.  Communicating with Bull queue and processing data if available
2.  Updating the data in MONGO

## Tech Stack

1.  Node.js
2.  Express.js
3.  Mongo DB
4.  Redis
5.  Bull

## List of endpoints

1. GET '/' : This is just a testing endpoint and returns "Hello World"
2. POST "/bulk-actions/upload" : Expects a file and accountId. Returns the metadata of the records if successfull, with the bulk action id in \_id field
3. GET "/bulk-actions/:id" : Returns the updated metadata of the bulk action whose Id you have provided.
4. GET "/bulk-actions-by-account/:accountId" : Returns the bulk actions of a specific account id
5. GET "/bulk-actions" : Returns all the bulk action's metadata

## List of things not implmented

There were some implementation and aspects that could not be implmented, majorly due to lack of time and resources, these are the following.

1. Proper validations and error handeling
2. Batch processing
3. Horizontal scaling : Due to lack of resources, although I will be providing the diagram for the same, so that we can achieve scale.
