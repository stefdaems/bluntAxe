var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: process.env.ELK,
    log: 'error'
});

function search(index, query) {
    console.log(query);
    return client.search({ index: index, body: query})
}

module.exports.search = search;
