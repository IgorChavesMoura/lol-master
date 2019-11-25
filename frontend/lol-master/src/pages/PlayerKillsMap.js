import React from 'react';

import {
    withRouter,
    Link
} from 'react-router-dom'


import * as d3 from 'd3';

import queryString from 'query-string';


import config from '../services/config';
import api from '../services/api';


import './playerKillsMap.css';

import score from '../assets/score.png';
import gold from '../assets/gold.png';
import minion from '../assets/minion.png';
import spells from '../assets/spells.png';
import ward from '../assets/Totem_Ward_icon.png';

class PlayerKillsMap extends React.Component {

    constructor() {
        super();

        this.state = { summoner: '', matchId: '', matchData: undefined };

    }

    componentWillMount() {

        let queryParams = queryString.parse(this.props.location.search);

        api.get(`/matchTimeline?matchId=${queryParams.matchId}&summoner=${queryParams.summoner}`)
            .then(
                data => {

                    this.setState({ matchId: queryParams.matchId, summoner: queryParams.summoner, matchData: data.data });

                }
            )





    }

    componentDidUpdate() {

        if (!!this.state.matchData) {

            console.log(this.state.matchData);

            buildChart(this.state.matchData.participantDeaths);

        }

    }

    render() {

        return (
            <div id="container">
                <header>
                    <ul>
                        <li><Link style={{ textDecoration: 'none', color: 'inherit' }} to={`/home?summoner=${this.state.summoner}`} >Início</Link></li>
                        <li><Link style={{ textDecoration: 'none', color: 'inherit' }} to={`/compKillsMap?summoner=${this.state.summoner}`} >Mapa de Mortes Competitivo</Link></li>
                        <li>{this.state.summoner}</li>
                        <li><img id="summonerIcon" src={`http://avatar.leagueoflegends.com/br1/${this.state.summoner.replace(" ", "%20")}.png`} /></li>
                    </ul>
                </header>
                {

                    !!this.state.matchData ? (
                        <div id="player-info">
                            <img title={this.state.matchData.participantData.champ.name} src={this.state.matchData.participantData.champ.imgUrl} />
                            <div className="stats">
                                <div className="kda">
                                    <div><img src={score} /></div>
                                    <div><label>{this.state.matchData.participantData.performance.kills}/{this.state.matchData.participantData.performance.deaths}/{this.state.matchData.participantData.performance.assists}</label></div>
                                </div>
                                <div className="gold">
                                    <div><img src={gold} /></div>
                                    <div><label>{this.state.matchData.participantData.performance.gold}</label></div>
                                </div>
                                <div className="creep">
                                    <div><img src={minion} /></div>
                                    <div><label>{this.state.matchData.participantData.performance.farm}</label></div>
                                </div>
                                <div className="damage">
                                    <div><img src={spells} /></div>
                                    <div><label>{this.state.matchData.participantData.performance.damageDealt}</label></div>
                                </div>
                                <div className="wards">
                                    <div><img src={ward} /></div>
                                    <div><label>{this.state.matchData.participantData.performance.wards}</label></div>
                                </div>
                                <div className="time">
                                    <div><label>{Math.floor(this.state.matchData.participantData.gameDuration / 60)}:{this.state.matchData.participantData.gameDuration % 60}</label></div>
                                </div>
                            </div>

                            <div className="itens">
                                <ul>
                                    {
                                        this.state.matchData.participantData.items.map(item => (

                                            <li key={this.state.matchData.participantData.items.indexOf(item)} >
                                                <img title={item.name} src={item.imgUrl} />
                                            </li>

                                        ))
                                    }
                                </ul>
                            </div>
                            <div className="summonerSpells">
                                <ul>
                                    <li><img title={this.state.matchData.participantData.spells[0].name} src={this.state.matchData.participantData.spells[0].imgUrl} /></li>
                                    <li><img title={this.state.matchData.participantData.spells[1].name} src={this.state.matchData.participantData.spells[1].imgUrl} /></li>
                                </ul>
                            </div>
                        </div>
                    ) : ''

                }
                <h1>Mapa de Mortes</h1>
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

        left: 165,
        top: 60,
        right: 230,
        bottom: 165

    };

    var width = 1211 - margin.left - margin.right;
    var height = 1080 - margin.top - margin.bottom;

    var xScale = d3.scaleLinear()
        .domain(d3.extent(data.map(d => d.position.x)))
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain(d3.extent(data.map(d => d.position.y)))
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


        var html = `<h6>Abatido por:</h6> <br/>
                    <h5>${d.killerName}</h5>
                    <img src=${d.killerChamp.imgUrl} />`;

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

    var dots = svg.append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle");


    dots.transition()
        .delay(function (d, i) { return (i * 3) })
        .duration(2000)
        .attr("cx", d => xScale(d.position.x))
        .attr("cy", d => yScale(d.position.y))
        .attr("r", 10)
        .style("stroke", d => {

            return "rgba(231,76,60,1.0)";

        })
        .style("fill", d => {

            return "rgba(231,76,60,0.3)";

        })

    dots.on("mouseover", tipMouseover)
        .on("mouseout", tipMouseout);

}




export default withRouter(PlayerKillsMap);