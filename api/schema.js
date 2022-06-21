const { buildSchema } = require('graphql');

const schema = buildSchema(`
    
    scalar DateTime

    type Commits_list {
        id: Int
        sha: String
        html_url: String
        message: String
        commiter_name: String
        commiter_email: String
        data: DateTime
    }

    type CommitsLength {
        count: Int
    }

    type User{
        id: Int
        name: String!
        password: String!
        email: String!
        token: String
    }

    type ReturnUserRegistr{
        id: Int
        name: String!
        email: String!
    }
    
    type Query {
        getHelloWorld: String
        getAllCommits: [Commits_list]
        getCommitsBySha(sha: String!) : Commits_list
        getPaginationOnCommits(perpage: Int!, currentpage: Int!) : [Commits_list]
        getCollectionCommitsLength: Int

    }
    type Mutation {
        registr(name: String, email: String, password: String): ReturnUserRegistr
        login(email: String, password: String): String
        logout(email: String): String
    }
`)

module.exports = schema;