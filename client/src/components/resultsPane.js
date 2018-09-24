import React from 'react';
import CpeHistory from '../components/cpeHistory.js'
import ErrorCodes from '../components/errorCodes.js';
import PlayerStats from '../components/playerstats.js';

export class resultsPane extends React.Component {
    constructor(props) {
        super(props);
        this.retrieveDataTuneIn = this.retrieveDataTuneIn.bind(this);
        this.retrieveDataGroupByTuneInChannelId = this.retrieveDataGroupByTuneInChannelId.bind(this);
        this.retrieveCpeHistory = this.retrieveCpeHistory.bind(this);
        this.drawView = this.drawView.bind(this);
        this.state = {
            component:null
        }
    }

    componentDidMount() {
        console.log('Did Mount');
        this.drawView();
    }

    componentDidUpdate(prevProps) {
        if ( prevProps.target !== this.props.target ) {
            this.drawView()
        }
    }

    drawView() {
        console.log('Props %s', this.props.target);
        let component = null;
        switch (this.props.target) {
            case "cpeHistory":
                component = <CpeHistory/>;
                break;
            case 'errorCodes':
                component = <ErrorCodes/>;
                break;
            case "Playerstats":
                component = <PlayerStats/>;
                break;
            default:
                component = null
        }
        this.setState({
            component
        })
    }

    retrieveDataTuneIn() {
        fetch('/elastic/tuneintimerange/1533726000000/1533727800000')
            .then(res => res.json())
            .then(results => {
                this.setState({
                    type: "tuneintimerange",
                    results: results })
            })
            .catch(err => console.log(err.message));
    }

    retrieveDataGroupByTuneInChannelId() {
        fetch('/elastic/groupbytuneinchannelid')
            .then(res => res.json())
            .then(results => {
                this.setState({
                    type: "groupbytuneinchannelid",
                    results:results })
            })
    }

    retrieveCpeHistory() {
        fetch('/elastic/cpehistory/3C36E4-EOSSTB-003469729101/1534331403000/1534417803000')
            .then(res => res.json())
            .then(results => {
                console.log(results);
                this.setState({
                    cpehistory: results
                })
            })
    }

    render() {
        return(
            <div>
                {this.state.component}
            </div>
        )
    }
}

export default resultsPane;
