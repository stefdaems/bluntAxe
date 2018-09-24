let scroll = require('../handlers/scroll.js');
let search = require('../handlers/search.js');

module.exports = function dataRetrieve() {

    function dataRetrieveScroll(query) {
        console.log('scrolling');
        return scroll.scroll(query.index, query.query);
    }

    function dataRetrieveSearch(query) {
        console.log('Query: %j', query);
        return search.search(query.index, query.query);
    }

    return {
        dataRetrieveScroll,
        dataRetrieveSearch
    }
}
