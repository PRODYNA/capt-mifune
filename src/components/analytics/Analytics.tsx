import React, {useState} from "react";
import {Fab, makeStyles} from "@material-ui/core";
import {MifuneBarChart} from "./MifuneBarChart";
import {MifuneSankey} from "./MifuneSankey";
import {MifiuneHeatMap} from "./MifuneHeatMap";
import FireplaceIcon from '@material-ui/icons/Fireplace';
import BarChartIcon from '@material-ui/icons/BarChart';
import ShuffleIcon from '@material-ui/icons/Shuffle';
import {Query, QueryBuilder, QueryNode, QueryRelation} from "./QueryBuilder";


export const Analytics = () => {

    const [chart, setChart] = useState<string>('BarChart');
    const [query, setQuery] = useState<Query>({nodes: [], relations: []});
    const useStyle = makeStyles({

        box: {
            padding: 5,
            marginLeft: 10,
            marginRight: 10,
        },
        button: {
            margin: 5
        }
    });
    const classes = useStyle();

    function getChart() {
        if (chart === 'BarChart') {
            return <MifuneBarChart query={query}/>
            } else if (chart === 'Sankey') {
                return <MifuneSankey query={query} />
            } else if (chart === 'HeatMap') {
                return <MifiuneHeatMap query={query} />
        } else {
            return <></>
        }
    }


    function select(onSelect = (value: string) => {
    }) {
        return <div className={classes.box}>
            <Fab className={classes.button} title={'BarChart'} onClick={() => setChart('BarChart')}>
                <BarChartIcon/>
            </Fab>
            <Fab className={classes.button} title={'HeatMap'} onClick={() => setChart('HeatMap')}>
                <FireplaceIcon/>
            </Fab>
            <Fab className={classes.button} title={'Sankey'} onClick={() => setChart('Sankey')}>
                <ShuffleIcon/>
            </Fab>
        </div>
    }


    return (

        <div className={classes.box}>
            <h1>Analytics</h1>
            <QueryBuilder onChange={q => setQuery(q)}/>
            <div>
                {select(l => {
                    setChart(l)
                })}
                {getChart()}
            </div>

        </div>
    )

};