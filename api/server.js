const express = require('express');
const cors = require('cors');

const { graphqlHTTP } = require('express-graphql');
require("dotenv").config();

const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');  

const db = require('./connectionDb');
const schema = require('./schema');
const {root} = require('./resolve');

async function deleteTableCommitsList(){
    db.run("DROP TABLE commits_list");
}

async function deleteTableUser(){
    db.run("DROP TABLE users");
}

const createTableCommitsList = () => {
    const  query  =  `
        CREATE TABLE IF NOT EXISTS commits_list (
        id integer PRIMARY KEY,
        sha varchar(50) NOT NULL,
        html_url text,
        message text,
        commiter_name text,
        commiter_email text,
        date DATETIME )`;

    return  db.run(query);
}

const createUserTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id integer PRIMARY KEY,
            name text,
            password text,
            email text,
            token text)`;

    return db.run(query);
}

async function addCommitsInDataBase(){
    const respons = await fetch(`https://api.github.com/repos/facebook/react/commits`);
    const responceBody = await respons.json();

    const sql = `INSERT INTO commits_list (sha, html_url, message, commiter_name, commiter_email, date)
                VALUES(?,?,?,?,?,?)`;

    responceBody.forEach(element => {
        db.run(sql,[element.sha, element.url, element.commit.message, element.commit.committer.name, element.commit.committer.email, element.commit.committer.date],
            (err) => {
                if(err) return console.error(err.message);
            }); 
    });
}

const loggingMiddleware = async (req) => {
    
    const token = req.headers.authorization;
    if(token){
        try{
            req.user = await jwt.verify(token, "asdfasdfasdf");
        } catch(err){
            req.user = false;
        }
    }
    else{
        req.user = false;
    }
    req.next();
  }

async function main(){

    const server = express();

    server.use(cors());
   
    deleteTableCommitsList();
    // deleteTableUser();

    createUserTable();
    createTableCommitsList();
    
    addCommitsInDataBase();

    server.use(loggingMiddleware);
    server.use('/graphql', graphqlHTTP(req => ({
        schema: schema,
        rootValue: root,
        context: req.user,
        graphiql: true,
        })
    ));
    

    server.listen(process.env.PORT, () => {
        console.log("Running a REST API server at http://localhost", process.env.PORT);
    });
}

main();