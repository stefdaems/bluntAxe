exports.tune_in_timerange = (starttime,endtime) => {
    return {
        "index": process.env.STB,
        "query": {
            "query": {
                "bool": {
                    "must": [
                        {
                            "exists": {
                                "field": "AMSLiveViewingReport.channel_id"
                            }
                        },
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": `${starttime}`,
                                    "lte": `${endtime}`
                                }
                            }
                        }
                    ]
                }
            }
        }
    }
};

exports.tune_in_timerange_cpeid = (cpeid, starttime, endtime) => {
    return {
        "index": process.env.STB,
        "query": {
            "query": {
                "bool": {
                    "must": [
                        {
                            "exists": {
                                "field": "AMSLiveViewingReport.channel_id"
                            }
                        },
                        {
                            "match": {
                                "header.viewerId": `${cpeid}`
                            }
                        },
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": `${starttime}`,
                                    "lte": `${endtime}`
                                }
                            }
                        }
                    ]
                }
            }
        }
    }
};

exports.group_by_tune_in_channel_id = () => {
    return {
        "index": process.env.STB,
        "query": {
            "size": 50,
            "aggs": {
                "group_by_state": {
                    "terms": {
                        "field": "AMSLiveViewingReport.channel_id"
                    }
                }
            }
        }
    }
};

exports.tune_type_info_per_cpeid = (cpeId) => {
    return {
        "index": process.env.STB,
        "query": {
            "query": {
                "bool": {
                    "must": [
                        {
                            "exists": {
                                "field": "AMSLiveViewingReport.event_type"
                            }
                        },
                        {
                            "match": {
                                "header.viewerID": `${cpeId}`
                            }
                        }
                    ]
                }
            }
        }
    }
};

exports.cpehistory = (cpeid, start, stop) => {
    return {
        "index": process.env.STB,
        "query": {
            "query": {
                "bool": {
                    "must": [
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": `${start}`,
                                    "lte": `${stop}`
                                }
                            }
                        },
                        {
                            "match": {
                                "header.viewerID": `${cpeid}`
                            }
                        }

                    ]
                }
            }
        }
    }
};

exports.httpPlayerStartEventHistory = (start, stop) => {
    return {
        "index": process.env.STB,
        "query": {
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "HttpPlayerStartEvent.type": "HttpPlayerStartEvent"
                            }
                        },
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": `${start}`,
                                    "lte": `${stop}`
                                }
                            }
                        }
                    ]
                }
            },
            "aggs": {
                "asset-types": {
                    "terms" : {
                        "field": "HttpPlayerStartEvent.assetType",
                        "size": 100
                    }
                }
            }
        }
    }
};

exports.getcpeids = () => {
    return {
        "index": process.env.STB,
        "query": {
            "size": 0,
            "query": {
                "bool": {
                    "must": {
                        "range": {
                            "@timestamp": {
                                "gte": "now-5h",
                                "lte": "now"
                            }
                        }
                    }
                }
            },
            "aggs": {
                "cpes": {
                    "terms": {
                        "field": "header.viewerID",
                        "size": 1000000
                    }
                }
            }
        }
    }
};

exports.errorcodeoverview = (startTime, stopTime) => {
    return {
        "index": process.env.STB,
        "query": {
            "size": 0,
            "query": {
                "bool": {
                    "must": [
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": `now-7d`,
                                    "lte": `now`
                                }
                            }
                        },
                        {
                            "exists": {
                                "field": "ErrorReport.code"
                            }
                        }
                    ]
                }
            },
            "aggs": {
                "errorcodes": {
                    "terms": {
                        "field": "ErrorReport.code",
                        "size": 150
                    }
                }
            }
        }
    }
};

exports.errorcodedetailedoverview = (errorcode, startTime, stopTime) => {
    return {
        "index": process.env.STB,
        "query": {
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "ErrorReport.code": `${errorcode}`
                            }
                        },
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": `${startTime}`,
                                    "lte": `${stopTime}`
                                }
                            }
                        }
                    ]
                }
            },
            "aggs": {
                "cpeids": {
                    "terms": {
                        "field": "header.viewerID",
                        "size": 200
                    }
                }
            }
        }
    }
};

exports.playerstats = (startTime, stopTime) => {
    return {
        "index": process.env.STB,
        "query": {
            "query": {
                "bool": {
                    "must": [
                        {
                            "exists": {
                                "field": "HttpPlayerBufferingEvent.assetType"
                            }
                        },
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": `${startTime}`,
                                    "lte": `${stopTime}`
                                }
                            }
                        }
                    ]
                }
            },
            "aggs": {
                "events": {
                    "terms": {
                        "field": "HttpPlayerBufferingEvent.assetType",
                        "size": 200
                    }
                }
            }
        }
    }
};

exports.cpeplayerstats = (startTime, stopTime, type) => {
    return {
        "index": process.env.STB,
        "query":
        {
            "query": {
            "bool": {
                "must": [
                    {
                        "match": {
                            "HttpPlayerStartEvent.assetType": `${type}`
                        }
                    },
                    {
                        "range": {
                            "@timestamp": {
                                "gte": `${startTime}`,
                                "lte": `${stopTime}`
                            }
                        }
                    }
                ]
            }
        },
            "aggs": {
            "cpes": {
                "terms": {
                    "field": "header.viewerID",
                        "size": 100
                }
            }
        }
        }
    }
};

exports.errorcodesplayout = (startTime, stopTime, errorPrefix) => {
    console.log(`${errorPrefix}*`);
    return {
        "index": process.env.STB,
        "query": {
            "query": {
                "bool": {
                    "must": [
                        {
                            "wildcard": {
                                "ErrorReport.code": "20*"
                            }
                        },
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": "now-7d",
                                    "lte": "now"
                                }
                            }
                        }
                    ]
                }
            },
            "aggs": {
                "cpeid": {
                    "terms": {
                        "field": "ErrorReport.code",
                        "size": 200
                    }
                }
            }
        }
    }
};

exports.cpehistory = (startTime, stopTime, cpeid) => {
    return {
        "index": process.env.STB,
        "query": {
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "header.viewerID": `${cpeid}`
                            }
                        },
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": `${startTime}`,
                                    "lte": `${stopTime}`
                                }
                            }
                        }
                    ]
                }
            }
        }
    }
}
