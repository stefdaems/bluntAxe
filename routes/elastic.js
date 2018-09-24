let express = require('express');
let router = express.Router();
let queries = require('../server/data/queries.js');
let { dataRetrieveScroll, dataRetrieveSearch} = require('../server/helpers/dataRetrieve.js')();

router.get('/', (req,res) => {
    console.log(req);
    res.send([{
        status: 'Up and running',
        version: process.env.VERSION
    }]);
})

router.get('/tuneintimerange/:start/:stop', (req, res) => {
    //console.log(req);
    dataRetrieveScroll(queries.tune_in_timerange(req.params.start, req.params.stop))
        .then(result => res.json(result))
});

router.get('/groupbytuneinchannelid', (req, res) => {
    //console.log(req);
    dataRetrieveSearch(queries.group_by_tune_in_channel_id())
        .then(result => res.json(result.aggregations.group_by_state.buckets))
});

router.get('/tunerinfo/:cpeid', (req, res) => {
    //console.log(req);
    dataRetrieveScroll(queries.tune_type_info_per_cpeid(req.params.cpeid))
        .then(result => res.json(result))
});

router.get('/cpehistory/:cpeid/:start/:stop', (req, res) => {
    //console.log(req);
    dataRetrieveScroll(queries.cpehistory(req.params.cpeid,req.params.start, req.params.stop))
        .then(result => res.json(result))
});

router.get('/getcpeids', (req, res) => {
    //console.log(req);
    dataRetrieveSearch(queries.getcpeids())
        .then(result => res.json(result.aggregations.cpes.buckets))
});

router.get('/errorcodeoverview/:start/:stop', (req, res) => {
    console.log('errorcodeoverview');
    dataRetrieveSearch(queries.errorcodeoverview(req.params.start, req.params.stop))
        .then(result => res.json(result.aggregations.errorcodes.buckets))
});

router.get('/errordetailoverview/:errorId/:start/:stop', (req, res) => {
    console.log(req);
    dataRetrieveSearch(queries.errorcodedetailedoverview(req.params.errorId, req.params.start, req.params.stop))
        .then(result => res.json(result.aggregations.cpeids.buckets))
});

router.get('/playerstats/:start/:stop', (req, res) => {
    console.log('playerstats');
    dataRetrieveSearch(queries.playerstats(req.params.start, req.params.stop))
        .then(result => res.json(result.aggregations.events.buckets))
});

router.get('/playouterrors/:start/:stop/:type', (req, res) => {
    console.log(req.params.type.toUpperCase());
    let errorPrefix = JSON.parse(process.env.PLAYOUT_ERROR_CODE_PREFIX)[req.params.type.toUpperCase()];
    dataRetrieveSearch(queries.errorcodesplayout(req.params.start, req.params.stop, errorPrefix))
        .then(result => res.json(result))
});

router.get('/cpehistory/:start/:stop/:cpeid', (req, res) => {
    console.log('cpehistory');
    dataRetrieveScroll(queries.cpehistory(req.params.start, req.params.stop, req.params.cpeid))
        .then(result => res.json(result))
})

module.exports = router;
