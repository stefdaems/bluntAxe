var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: process.env.ELK,
    log: 'error'
});

function scroll(index, query) {
    return new Promise(function(resolve,reject) {
        var retrievedData = [];
        console.log(query);
        console.log(index);
        return client.search({
            index: index,
            size: 1000,
            scroll: '30s',
            body: query
        }, function getMoreUntilDone(error, response) {
            if (error) {
                console.log('Error %s', error);
                return reject('Failure in retrieval data' + error.message);
            }
            response.hits.hits.forEach(function (hit) {
                retrievedData.push(hit._source);
            });

            if (response.hits.total > retrievedData.length) {
                console.log('Retrieving more data %s - %s', response.hits.total, retrievedData.length);
                client.scroll({
                    scrollId: response._scroll_id,
                    scroll: '1s'
                }, getMoreUntilDone);
            } else {
                console.log(retrievedData);
                return resolve(retrievedData)
            }
        });
    })
}

module.exports.scroll = scroll;
