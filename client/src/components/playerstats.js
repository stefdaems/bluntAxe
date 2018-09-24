import React from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import ReactTable from "react-table";
import groupBy from 'lodash.groupby';
import filter from 'lodash.filter';


const RangePicker = DatePicker.RangePicker;

export class playerstats extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.getPlayerStats = this.getPlayerStats.bind(this);
        this.getPlayoutErrors = this.getPlayoutErrors.bind(this);
        this.playoutErrorBuilder = this.playoutErrorBuilder.bind(this);
        this.state = {
            startTime: null,
            stopTime: null,
            tabs: [],
            activeIndex: 0,
            errorOverview: [],
            errorLevelDetailOverview: [],
            done: false
        }
    }

    getPlayerStats() {
        this.setState({
            errorLevelDetailOverview: []
        });
        fetch(`/elastic/playerstats/${this.state.startTime}/${this.state.stopTime}`)
            .then(res => res.json())
            .then(results => {
                this.setState({
                    playerStats: results
                }, this.getPlayoutErrors)
            })
    }

    onChange(dates, dateStrings) {
        let startTime = new Date(dateStrings[0]).getTime();
        let stopTime = new Date(dateStrings[1]).getTime();
        let readableStart = dateStrings[0];
        let readableStop = dateStrings[1];
        this.setState({
            startTime,
            stopTime,
            readableStart,
            readableStop
        });
    }

    getPlayoutErrors() {
        this.setState({
            errorLevelDetailOverview : []
        });
        let arrFetches = [];
        if(this.state.playerStats) {
            this.state.playerStats.forEach(stat => {
                arrFetches.push(this.playoutErrorBuilder({key:stat.key,url:`/elastic/playouterrors/${this.state.startTime}/${this.state.stopTime}/${stat.key}`}))
            })
        }
        Promise.all(arrFetches)
            .then( results => {
                this.setState({
                    errorLevelDetailOverview: results
                })
            })
    }

    playoutErrorBuilder(request) {
        let theObject = {};
        let errDetail = {};
        return fetch(request.url)
            .then(res => res.json())
            .then(results => {
                theObject['key'] = request.key;
                theObject['results'] = results;
                theObject['details'] =  [];
                theObject['errorList'] = [];
                theObject['tableUsage'] = [];
                results.hits.hits.forEach(result => {
                    theObject['details'].push({
                        key: request.key,
                        code: result._source.ErrorReport.code,
                        errmsg: result._source.ErrorReport.errmsg,
                        level: result._source.ErrorReport.level,
                        source: result._source.ErrorReport.source,
                        backtrace: result._source.ErrorReport.backtrace,
                        timestamp: result._source['@timestamp'],
                        viewerId: result._source.header.viewerID
                    })
                });
                theObject['sorted'] = groupBy(theObject.details, (x) => x.code);
                theObject['errorList'].push(errDetail);
                Object.keys(theObject['sorted']).forEach(function(key) {
                    theObject['tableUsage'].push({
                        key: key,
                        detail: theObject,
                        amount: theObject['sorted'][key].length,
                        msg: theObject['sorted'][key][0].errmsg
                    })
                });
                return theObject;
            })
    }

    render() {
        let playerstatistics;
        let errorstatistics = [];
        let columns = [];
        let button;
        let errorStats = this.state.errorLevelDetailOverview;

        if (this.state.playerStats) {
            this.state.playerStats.forEach(stat => {
                columns.push({
                    accessor: stat.key,
                    Header: stat.key,
                    Cell: props => <span>{stat.doc_count}</span>
                })
            });

            playerstatistics = <ReactTable
                data={this.state.playerStats}
                showPagination={false}
                columns={[
                    {
                        Header: "Event Type",
                        columns: columns,

                    }]}
                defaultPageSize={1}
                className="-striped -highlight"
            />
        }

        if (this.state.startTime && this.state.stopTime) {
            button = <button onClick={this.getPlayerStats.bind(this)}>Retrieve player stats</button>
        }

        if (errorStats.length > 0) {

            errorstatistics =
                errorStats.map( error =>
                    <div>
                        <h3>{error.key}</h3>
                        <br />
                        <ReactTable data={error.tableUsage}
                        showPagination={false}
                         columns={[
                                    {
                                        Header: "Name",
                                        columns: [
                                            {
                                                accessor: "key"
                                            }
                                        ]
                                    },
                                    {
                                        Header: "Info",
                                        columns: [
                                            {
                                                accessor: "msg"
                                            }
                                        ]
                                    },
                                    {
                                        Header: 'Amount',
                                        columns: [
                                            {
                                                accessor: "amount"
                                            }
                                        ]
                                    }
                                ]}
                        defaultPageSize={error.tableUsage.length}
                        className="-striped -highlight"
                                    SubComponent={row => {
                                        let detailedData = filter(row.original.detail.details, (x) => {
                                            return x.code === row.original.key
                                        });
                                        let groupedDetailedData = groupBy(row.original.detail.sorted[row.original.key], (x) => x.viewerId);
                                        let resultedArray = [];
                                        Object.keys(groupedDetailedData).forEach(function(key) {

                                            resultedArray.push({
                                                "viewerId": key,
                                                "amount": groupedDetailedData[key].length,
                                                "fullDetail": groupedDetailedData[key]
                                            })

                                        });
                                        return (
                                            <div style={{ padding: "20px" }}>
                                                <em>
                                                    Occurances listed pro cpe
                                                </em>
                                                <br />
                                                <ReactTable
                                                    data={resultedArray}
                                                    columns={[
                                                        {
                                                            Header: "CPEID",
                                                            columns: [
                                                                {
                                                                    accessor: "viewerId"
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            Header: "Amount",
                                                            columns: [
                                                                {
                                                                    accessor: "amount"
                                                                }
                                                            ]
                                                        }
                                                    ]}
                                                    defaultPageSize={resultedArray.length}
                                                    showPagination={false}
                                                    sortable={true}
                                                    SubComponent={row => {
                                                        return (
                                                            <div style={{ padding: "20px" }}>
                                                                <em>
                                                                    Timestamp of the error occurance
                                                                </em>
                                                                <br />
                                                                <ReactTable
                                                                    data={row.original.fullDetail}
                                                                    columns={[
                                                                        {
                                                                            Header: "timestamp",
                                                                            columns: [
                                                                                {
                                                                                    accessor: "timestamp"
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]}
                                                                    defaultPageSize={row.original.fullDetail.length}
                                                                    showPagination={false}
                                                                    sortable={true}
                                                                    />
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            </div>
                                        );
                                    }}
                        />
                        <br />
                    </div>
                    )
        }


        return (
            <div>
                <h1>Playerstats</h1>
                <RangePicker
                    ranges={{ Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] }}
                    showTime
                    format="YYYY/MM/DD HH:mm"
                    onChange={this.onChange}
                />
                {button}
                {playerstatistics}
                {errorstatistics}
            </div>
        )
    }
}

export default playerstats;
