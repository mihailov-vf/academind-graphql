const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema,
    rootValue: resolvers,
    graphiql: true
}));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true
}).then().catch(err => {
    console.log(err);
});

app.listen(3000);