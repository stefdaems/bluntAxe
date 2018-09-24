import React from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import ReactTable from "react-table";
import matchSorter from "match-sorter";

const RangePicker = DatePicker.RangePicker;

export class cpeHistory extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.retrieveCPEHistory = this.retrieveCPEHistory.bind(this);
        this.parseResults = this.parseResults.bind(this);
        this.state={
            startTime: null,
            stopTime: null,
            cpeId: "Enter CPEID",
            history:[]
        }
    }

    onChange(dates, dateStrings) {
        console.log('From: ', dates[0], ', to: ', dates[1]);
        console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
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

    retrieveCPEHistory() {
        fetch(`/elastic/cpehistory/${this.state.startTime}/${this.state.stopTime}/${this.state.cpeId}`)
            .then(res => res.json())
            .then(results => {
                this.parseResults(results);
            })
    }

    parseResults(results) {
        let parsedResults = [];
        results.forEach( result  => {
            if("TunerReport" in result) {
                parsedResults.push({
                    type: "tunerReport",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: `Frequency:${result.TunerReport.frequency} \n Index:${result.TunerReport.index} \n Locked:${result.TunerReport.locked} \n SignalLevel:${result.TunerReport.signalLevel} \n ErrorEds:${result.TunerReport.erroreds}`
                });
                return;
            };

            if("EthernetStats" in result) {
                parsedResults.push({
                    type: "ethernetStats",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: `Interface:${result.EthernetStats.iface} \n\n txKbps:${result.EthernetStats.txKbps}`
                });
                return;
            };

            if("VMStat" in result) {
                parsedResults.push({
                    type: "vmStat",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: `Uptime:${result.VMStat.uptime}`
                });
                return;
            };

            if("GraphicsMemoryUsage" in result) {
                parsedResults.push({
                    type: "graphicsMemoryUsage",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: `FreeKb:${result.GraphicsMemoryUsage.freeKb} \n Mapping:${result.GraphicsMemoryUsage.mapping}`
                });
                return;
            };

            if("TemperatureReport" in result) {
                parsedResults.push({
                    type: "temperatureReport",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: `${result.TemperatureReport.name} - ${result.TemperatureReport.value}`
                });
                return;
            };

            if("UsageCollectorReport" in result) {
                parsedResults.push({
                    type: "usageCollectorReport",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: `Type:${result.UsageCollectorReport.event_type} \n Retries:${result.UsageCollectorReport.event_type}`
                });
                return;
            }

            if("MemoryUsage" in result) {
                parsedResults.push({
                    type: "memoryUsage",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: `Cached:${result.MemoryUsage.cachedKb} \n Free:${result.MemoryUsage.freeKb} \n Total:${result.MemoryUsage.totalKb}`
                });
                return;
            }

            if("WiFiStats" in result) {
                parsedResults.push({
                    type: "wifiStats",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: `Interface:${result.WiFiStats.iface} \n\n txKbps:${result.WiFiStats.txKbps}`

                });
                return;
            }

            if("UbiFlashHealthReport" in result) {
                parsedResults.push({
                    type: "ubiFlashHealthReport",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: ""
                });
                return;
            }

            if("NetConfiguration" in result) {
                parsedResults.push({
                    type: "netConfiguration",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: ""
                });
                return;
            }

            if("ErrorReport" in result) {
                parsedResults.push({
                    type: "errorReport",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: `Level:${result.ErrorReport.level} \n Code:${result.ErrorReport.code} \n Message:${result.ErrorReport.errmsg} \n`
                });
                return;
            }

            if("TopProcesses" in result) {
                parsedResults.push({
                    type: "topProcesses",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: ""
                });
                return;
            }

            if("HeartBeat" in result) {
                parsedResults.push({
                    type: "heartBeat",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: ""
                });
                return;
            }

            if("FSReport" in result) {
                parsedResults.push({
                    type: "fsReport",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: ""
                });
                return;
            }

            if("NagraReport" in result) {
                console.log(result);
                parsedResults.push({
                    type: "nagraReport",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: ""
                });
                return;
            }

            if("SdCardHealthReport" in result) {
                parsedResults.push({
                    type: "sdCardHealthReport",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: ""
                });
                return;
            }

            if("BCMReport" in result) {
                parsedResults.push({
                    type: "bcmReport",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: ""
                });
                return;
            }

            if("ConfigReport" in result) {
                parsedResults.push({
                    type: "configReport",
                    timestamp: result['@timestamp'],
                    detail: result,
                    message: ""
                });
                return;
            }

            parsedResults.push({
                type: "unknown",
                timestamp: result['@timestamp'],
                detail: result,
                message: ""
            })
        });
        this.setState({
            history: parsedResults
        })
    }

    handleInputChange(event) {
        this.setState({cpeId: event.target.value})
    }

    render() {
        let button;
        let cpeHistoryTable;

        if(this.state.startTime && this.state.stopTime && this.state.cpeId && this.state.cpeId != "Enter CPEID") {
            button = <button onClick={this.retrieveCPEHistory}>Retrieve CPE History</button>
        }

        if(this.state.history.length > 0) {
            cpeHistoryTable = <ReactTable
                data={this.state.history}
                columns={[
                            {
                                Header: "Time",
                                accessor: "timestamp"
                            },
                            {
                                Header: "Type",
                                accessor: "type"
                            },
                            {
                                Header: "Message",
                                accessor: "message"
                            }
                ]}
                defaultPageSize={10}
                className="-striped -highlight"
            />
        }

        return (
            <div>
                <h1>CPE HISTORY</h1>
                <RangePicker
                    ranges={{ Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] }}
                    showTime
                    format="YYYY/MM/DD HH:mm"
                    onChange={this.onChange}
                />
                <input type="text" name="CPEID" value={this.state.cpeId} onChange={this.handleInputChange}/>
                {button}
                {cpeHistoryTable}
            </div>
        )
    }

}

export default cpeHistory;
