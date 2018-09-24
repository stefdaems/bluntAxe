import React from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import ReactTable from "react-table";
import matchSorter from "match-sorter";
import {Tabs, TabList, Tab, PanelList, Panel, ExtraButton} from 'react-tabtab';

// CSS
import "react-table/react-table.css";

const RangePicker = DatePicker.RangePicker;

export class errorCodes extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.createErrorDetailTable = this.createErrorDetailTable.bind(this);
        this.state = {
            errors: [],
            startTime: null,
            stopTime: null,
            tabs: [],
            activeIndex: 0
        }
    }

    handleTabChange(index) {
        this.setState({activeIndex: index});
    }

    handleEdit({type, index}) {
        let {tabs, activeIndex} = this.state;
        if (type === 'delete') {
            tabs.splice(index, 1);
        }
        if (index - 1 >= 0) {
            activeIndex = index - 1;
        } else {
            activeIndex = 0;
        }
        this.setState({tabs, activeIndex});
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

    retrieveErrors() {
        fetch(`/elastic/errorcodeoverview/${this.state.startTime}/${this.state.stopTime}`)
            .then(res => res.json())
            .then(results => {
                console.log(results);
                this.setState({
                    errors: results
                }, this.createErrorOverviewTable)
            })
    }

    createErrorOverviewTable() {
        let existingTabs = this.state.tabs || [];
        let results;
        if (this.state.errors.length > 1) {
            results = <ReactTable
                data= {this.state.errors}
                filterable
                defaultFilterMethod={(filter, row) =>
                    String(row[filter.id]) === filter.value}
                columns={[
                    {
                        Header: "ErrorCode",
                        columns: [
                            {
                                accessor: "key",
                                filterMethod: (filter, rows) =>
                                    matchSorter(rows, filter.value, { keys: ["key"] }),
                                filterAll: true
                            }
                        ],

                    },
                    {
                        Header: "Amount",
                        columns: [
                            {
                                accessor: "doc_count"
                            }
                        ]
                    }]}
                defaultPageSize={10}
                className="-striped -highlight"
                getTdProps={(state, rowInfo, column, instance) => {
                    return {
                        onClick: (e, handleOriginal) => {
                            console.log("A Td Element was clicked!");
                            console.log("it produced this event:", e);
                            console.log("It was in this column:", column);
                            console.log("It was in this row:", rowInfo);
                            console.log("It was in this table instance:", instance);
                            console.log("it was this key", rowInfo.original.key);
                            this.createErrorDetailTable(rowInfo.original.key);

                            // IMPORTANT! React-Table uses onClick internally to trigger
                            // events like expanding SubComponents and pivots.
                            // By default a custom 'onClick' handler will override this functionality.
                            // If you want to fire the original onClick handler, call the
                            // 'handleOriginal' function.
                            if (handleOriginal) {
                                handleOriginal();
                            }
                        }
                    };
                }}
            />;
            existingTabs.push({name: `Error codes from ${this.state.readableStart} till ${this.state.readableStop}` , content:results});
            this.setState({
                tabs: existingTabs
            })
        }
    }

    createErrorDetailTable(errorNr) {
        let existingTabs = this.state.tabs || [];
        console.log("Error", errorNr);
        let details;
        fetch(`/elastic/errordetailoverview/${errorNr}/${this.state.startTime}/${this.state.stopTime}`)
            .then(res => res.json())
            .then(result => {
                console.log(result);
                details = <ReactTable
                    data={result}
                    filterable
                    defaultFilterMethod={(filter, row) =>
                        String(row[filter.id]) === filter.value}
                    columns={[
                        {
                            Header: "cpeId",
                            columns: [
                                {
                                    accessor: "key",
                                    filterMethod: (filter, rows) =>
                                        matchSorter(rows, filter.value, { keys: ["key"] }),
                                    filterAll: true
                                }
                            ],

                        },
                        {
                            Header: "Amount",
                            columns: [
                                {
                                    accessor: "doc_count"
                                }
                            ]
                        }]}
                    defaultPageSize={10}
                    className="-striped -highlight"
                    getTdProps={(state, rowInfo, column, instance) => {
                        return {
                            onClick: (e, handleOriginal) => {
                                console.log("A Td Element was clicked!");
                                console.log("it produced this event:", e);
                                console.log("It was in this column:", column);
                                console.log("It was in this row:", rowInfo);
                                console.log("It was in this table instance:", instance);
                                console.log("it was this key", rowInfo.original.key);

                                // IMPORTANT! React-Table uses onClick internally to trigger
                                // events like expanding SubComponents and pivots.
                                // By default a custom 'onClick' handler will override this functionality.
                                // If you want to fire the original onClick handler, call the
                                // 'handleOriginal' function.
                                if (handleOriginal) {
                                    handleOriginal();
                                }
                            }
                        };
                    }}
                />
                existingTabs.push({name: `${errorNr}` , content:details});
                this.setState({
                    tabs: existingTabs
                })
            })
    }

    render() {
        const {tabs, activeIndex} = this.state;
        const tabTemplate = [];
        const panelTemplate = [];
        let button;
        let tabPages;

        tabs.forEach((tab, i) => {
            const closable = tabs.length > 1;
            tabTemplate.push(<Tab key={i} closable={closable}>{tab.name}</Tab>);
            panelTemplate.push(<Panel key={i}>{tab.content}</Panel>);
        })

        if (this.state.startTime && this.state.stopTime) {
            button = <button onClick={this.retrieveErrors.bind(this)}>Retrieve errorcode</button>
        }

        if (this.state.tabs && this.state.tabs.length > 0) {
            tabPages = <Tabs onTabEdit={this.handleEdit}
                             onTabChange={this.handleTabChange}
                             activeIndex={activeIndex}
                             customStyle={this.props.customStyle}
                             >
                <TabList>
                    {tabTemplate}
                </TabList>
                <PanelList>
                    {panelTemplate}
                </PanelList>
            </Tabs>
        }

        return (
            <div className="two">
                <h1>ERROR CODES</h1>
                <RangePicker
                    ranges={{ Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] }}
                    showTime
                    format="YYYY/MM/DD HH:mm"
                    onChange={this.onChange}
                />
                {button}
                {tabPages}
            </div>
        )
    }

}

export default errorCodes;
