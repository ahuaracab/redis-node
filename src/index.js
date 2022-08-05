const express = require('express');
const axios = require('axios');
const responseTime = require('response-time');
const redis = require('redis');
const {
    promisify
} = require('util');
const {
    request
} = require('https');

const client = redis.createClient({
    host: '127.0.0.1',
    port: 6379,
})

const GET_ASYNC = promisify(client.get).bind(client);
const SET_ASYNC = promisify(client.set).bind(client);

const app = express();

app.use(responseTime());

app.get('/character', async (req, res) => {
    try {
        //Response from cache
        const reply = await GET_ASYNC('characters')

        if (reply) {
            return res.json(JSON.parse(reply))
        }

        const response = await axios.get('https://rickandmortyapi.com/api/character');

        await SET_ASYNC('characters', JSON.stringify(response.data));
        res.json(response.data);

    } catch (error) {
        console.log(error);
    }

});

app.get('/character/:id', async (req, res) => {
    try {
        //Response from cache

        const reply = await GET_ASYNC(req.params.id)

        if (reply) {
            return res.json(JSON.parse(reply))
        }

        const response = await axios.get('https://rickandmortyapi.com/api/character/' + req.params.id);

        await SET_ASYNC(req.params.id, JSON.stringify(response.data));
        res.json(response.data);

    } catch (error) {
        console.log(error)
        return res.status(error.response.status).json({
            message: error.message
        });
    }

});

app.listen(3000);
console.log('Server on port 3000');