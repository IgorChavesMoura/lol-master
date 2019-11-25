import React from 'react';

import {
    withRouter,
    Link
} from 'react-router-dom'


import * as d3 from 'd3';

import queryString from 'query-string';


import config from '../services/config';
import api from '../services/api';


import './compKillsMap.css';

class CompKillsMap extends React.Component {

    constructor() {
        super();

        this.state = { summoner: '' };

    }

    componentWillMount() {

        let queryParams = queryString.parse(this.props.location.search);

        this.setState({ summoner: queryParams.summoner });

    }

    componentDidMount() {

        d3.csv(`${config.apiUrl}/killsDataset`)
            .then(
                data => {

                    data = filterDirtyValues(data);

                    data = smartFilter(data);

                    buildChart(data);


                }
            ).catch(
                error => console.log(error)
            )


    }

    render() {

        return (
            <div id="container">
                <header>
                    <ul>
                        <li><Link style={{ textDecoration: 'none', color: 'inherit' }} to={`/home?summoner=${this.state.summoner}`} >Início</Link></li>
                        <li className="active" ><Link style={{ textDecoration: 'none', color: 'inherit' }} to={`/compKillsMap?summoner=${this.state.summoner}`} >Mapa de Mortes Competitivo</Link></li>
                        <li>{this.state.summoner}</li>
                        <li><img id="summonerIcon" src={`http://avatar.leagueoflegends.com/br1/${this.state.summoner.replace(" ", "%20")}.png`} /></li>
                    </ul>
                </header>
                <div id="plot_container">
                    <div id="plot"></div>
                </div>
            </div>
        );

    }

}

function update(data) {

    console.log('Will update');

    d3.select("svg").remove();

    buildChart(data);

}

function buildChart(data) {

    var margin = {

        left: 125,
        top: 40,
        right: 110,
        bottom: 65

    };

    var width = 1211 - margin.left - margin.right;
    var height = 1080 - margin.top - margin.bottom;

    var xScale = d3.scaleLinear()
        .domain(d3.extent(data.map(d => d.x_pos)))
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain(d3.extent(data.map(d => d.y_pos)))
        .range([height, 0]);

    var svg = d3.select("#plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var tooltip = d3.select("#plot").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // tooltip mouseover event handler
    let tipMouseover = function (d) {


        var html = `<h6>Vítima: </h6> <br/>
                    <h5>${d.Victim}</h5> <br/>   
                    <h6>Abatido por:</h6> <br/>
                    <h5>${d.Killer}</h5> <br/>
                    <h6>Tempo de jogo:</h6><br/>
                    <h5>${Math.round(d.Time)} minutos</h5>`;

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .transition()
            .duration(200) // ms
            .style("opacity", .9) // started as 0!

    };
    // tooltip mouseout event handler
    let tipMouseout = function (d) {


        tooltip.transition()
            .duration(300) // ms
            .style("opacity", 0); // don't care about position!
    };

    var dot = svg.append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .on("mouseover", tipMouseover)
        .on("mouseout", tipMouseout)
        .transition()
        .delay(function (d, i) { return (i * 3) })
        .duration(500)
        .attr("cx", d => xScale(d.x_pos))
        .attr("cy", d => yScale(d.y_pos))
        .attr("r", 10)
        .style("stroke", d => {

            if (d.Team == 'bKills') {

                return "rgba(52,152,219,1.0)";

            }

            return "rgba(231,76,60,1.0)";

        })
        .style("fill", d => {

            if (d.Team == 'bKills') {

                return "rgba(52,152,219,0.3)";

            }

            return "rgba(231,76,60,0.3)";

        });

}

function filterCheckbox(original_data) {

    let result = [].concat(original_data);

    let redCheckbox = document.getElementById("redKills");
    let blueCheckbox = document.getElementById("blueKills");

    if (redCheckbox.checked) {

        original_data = original_data.filter(d => d.Team == 'rKills');

    }

    if (blueCheckbox.checked) {

        original_data = original_data.filter(d => d.Team == 'bKills');

    }

    update(result);

}

function filterDirtyValues(data) {

    let result;

    result = data.filter(d => !!d.x_pos && !isNaN(d.x_pos));
    result = result.filter(d => !!d.y_pos && !isNaN(d.y_pos));

    result = result.map(d => {

        d.x_pos = parseInt(d.x_pos);
        d.y_pos = parseInt(d.y_pos);

        return d;

    });

    return result;

}

function smartFilter(data) {

    let shuffleData = shuffleArray(data);


    let calculateRedKills = kills => {

        let rKills = 0;

        kills.forEach(d => {

            if (d.Team == 'rKills') {

                rKills++;

            }

        });

        return rKills;

    };

    let calculateBlueKills = kills => {

        let bKills = 0;

        kills.forEach(d => {

            if (d.Team == 'bKills') {

                bKills++;

            }

        });

        return bKills;

    };

    let rKills = calculateRedKills(data);
    let bKills = calculateBlueKills(data);

    let newRKills = Math.ceil(rKills / 100);
    let newBKills = Math.ceil(bKills / 100);

    let currentRKills = 0;
    let currentBkills = 0;

    let filteredData = [];

    // let blueKillsData = shuffleData.filter(d => d.Team == 'bKills');
    // let redKillsData = shuffleData.filter(d => d.Team == 'rKills');

    shuffleData.forEach(
        d => {

            if (d.Team == 'rKills') {

                if (currentRKills < newRKills) {

                    filteredData.push(d);
                    currentRKills++;

                }

            }

            if (d.Team == 'bKills') {

                if (currentBkills < newBKills) {

                    filteredData.push(d);
                    currentBkills++;

                }

            }

        }
    );

    // console.log(blueKillsData);
    // console.log(redKillsData);

    // console.log(currentRKills);
    // console.log(newRKills);
    // console.log(newBKills);
    // console.log(shuffleData);
    return filteredData;

}

function shuffleArray(data) {

    let array = [].concat(data);

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

export default withRouter(CompKillsMap);