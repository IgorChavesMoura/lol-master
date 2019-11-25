import React from 'react';

import {
    withRouter,
    Link
} from 'react-router-dom'



import queryString from 'query-string';

import * as d3 from 'd3';
import crossfilter from 'crossfilter2';
import dc from 'dc';

import api from '../services/api';

import './home.css'

import score from '../assets/score.png';
import gold from '../assets/gold.png';
import minion from '../assets/minion.png';
import spells from '../assets/spells.png';
import ward from '../assets/Totem_Ward_icon.png';



class Home extends React.Component {

    constructor() {

        super();

        this.state = { summoner: '', pickCount: [], damageRank: [], kdaRank: [], matchHistory: [], bestChamp: undefined };

    }

    componentWillMount() {

        let queryParams = queryString.parse(this.props.location.search);

        this.setState({ summoner: queryParams.summoner });

        api.get(`/matchHistory?s=${queryParams.summoner}&q=10&apiLang=br1&ddVersion=9.22.1`)
            .then(
                data => {

                    this.setState({
                        matchHistory: data.data.map(d => {

                            d.gameCreation = new Date(d.gameCreation);
                            

                            return d;

                        })
                    });

                }
            );

        api.get(`/bestChamp?s=${queryParams.summoner}&q=50&apiLang=br1&ddVersion=9.22.1`)
            .then(
                data => {

                    this.setState({ bestChamp: data.data });

                }
            )

        api.get(`/pickCount?s=${queryParams.summoner}`)
            .then(
                data => {

                    this.setState({ pickCount: data.data });

                }
            )

        api.get(`/kdaRank?s=${queryParams.summoner}&q=100&apiLang=br1&ddVersion=9.22.1`)
            .then(
                data => {

                    this.setState({ kdaRank: data.data.reverse() });

                }
            )

        api.get(`/damageRank?s=${queryParams.summoner}&q=50&apiLang=br1&ddVersion=9.22.1`)
            .then(
                data => {

                    this.setState({ damageRank: data.data });

                }
            )



    }

    componentDidMount() {

        //this.drawCharts();

    }

    componentDidUpdate() {

        if (this.state.pickCount.length > 0 && this.state.kdaRank.length > 0 && this.state.damageRank.length > 0) {

            this.drawCharts();

        }

    }

    drawCharts() {


        d3.selectAll('svg').remove();

        let margin = { top: 20, right: 20, bottom: 20, left: 20 },
            width = 380 - margin.left - margin.right,
            height = 320 - margin.top - margin.bottom;


        let marginPick = { top: 20, right: 20, bottom: 20, left: 20 },
            fWidth = 900 - marginPick.left - marginPick.right,
            fHeight = 320 - marginPick.top - marginPick.bottom;

        // var svgPick = d3.select("#pickCount").append("svg")
        //     .attr("width", fWidth + marginPick.left + marginPick.right)
        //     .attr("height", fHeight + marginPick.top + marginPick.bottom)
        //     .append("g")
        //     .attr("transform",
        //         `translate(${marginPick.left},${marginPick.top})`);

        var svgKda = d3.select("#kdaRank").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                `translate(${margin.left},${margin.top})`);

        var svgDamage = d3.select("#damageRank").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                `translate(${margin.left + 20},${margin.top})`);


        let xKdaScale = d3.scaleBand()
            .range([0, width])
            .domain(this.state.kdaRank.map(e => e.champ))
            .padding(0.2);

        let yKdaScale = d3.scaleLinear()
            .domain([0, 50])
            .range([height, 0]);



        let xKdaAxis = d3.axisBottom(xKdaScale);

        let yKdaAxis = d3.axisRight(yKdaScale);

        let xDamageScale = d3.scaleBand()
            .range([0, width])
            .domain(this.state.damageRank.map(e => e.champ))
            .padding(0.2);

        let yDamageScale = d3.scaleLinear()
            .domain([0, 120000])
            .range([height, 0]);

        let xDamageAxis = d3.axisBottom(xDamageScale);

        let yDamageAxis = d3.axisLeft(yDamageScale).tickFormat(d => {

            if ((d / 1000) >= 1) {
                d = d / 1000 + "K";
            }
            return d;

        });

        var tooltip = d3.select("#stats").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        let tipPickMouseover = function (d) {



            var html = `<h5>${d.champ.name}</h5><br/>
                        <h5>Partidas Jogadas: </h5>
                        <h5>${d.count}</h5>`;


            tooltip.html(html)
                .style("left", (d3.event.pageX - 50) + "px")
                .style("top", (d3.event.pageY - 128) + "px")
                .transition()
                .duration(200) // ms
                .style("opacity", .9) // started as 0!

        };

        let tipKdaMouseover = function (d) {


            var html = `<h5>${d.champ}</h5><br/>
                        <h5>KDA: ${d.kda}</h5><br/>
                        <h5>Abates: ${d.kills}</h5><br/>
                        <h5>Mortes: ${d.deaths}</h5><br/>
                        <h5>Assistências: ${d.assists}</h5>`;


            tooltip.html(html)
                .style("left", (d3.event.pageX - 50) + "px")
                .style("top", (d3.event.pageY - 208) + "px")
                .transition()
                .duration(200) // ms
                .style("opacity", .9) // started as 0!

        };

        let tipDamageMouseover = function (d) {


            var html = `<h5>${d.champ}</h5><br/>
                        <h5>Dano: ${d.damage}</h5>`;

            tooltip.html(html)
                .style("left", (d3.event.pageX - 50) + "px")
                .style("top", (d3.event.pageY - 108) + "px")
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

        let ndx = crossfilter(this.state.pickCount);

        let champDimension = ndx.dimension(d => d.champ);
        let champGroup = champDimension.group();

        let chart = dc.pieChart("#pickCount");

        chart
            .width(fWidth)
            .height(fHeight)
            .slicesCap(4)
            .innerRadius(50)
            .dimension(champDimension)
            .group(champGroup)
            .legend(dc.legend().y(10).legendText(d => {

                return d.name == 'Others' ? 'Outros' : d.name;

            }))
            // workaround for #703: not enough data is accessible through .label() to display percentages
            .on('pretransition', function (chart) {
                chart.selectAll('text.pie-slice').text(function (d) {


                    return d.data.key == 'Others' ? 'Outros' : d.data.key;
                })
            })
            .on('pretransition.add-tip', function (chart) {
                chart.selectAll('g.row')
                    .on('mouseover', tipPickMouseover)
                    .on('mouseout', tipMouseout);
            });


        chart.render();

        // svgPick.selectAll(".pickbar")
        //     .data(this.state.pickCount)
        //     .enter().append("rect")
        //     .attr("class", "pickbar")
        //     .attr("x", function (d) { return xPickScale(d.champ.name); })
        //     .attr("width", xPickScale.bandwidth())
        //     .attr("height", 0)
        //     .on("mouseover", tipPickMouseover)
        //     .on("mouseout", tipMouseout)
        //     .transition()
        //     .duration(200)
        //     .delay(function (d, i) {
        //         return i * 50;
        //     })
        //     .attr("y", function (d) { return yPickScale(d.count); })
        //     .attr("height", function (d) { return height - yPickScale(d.count); })
        //     .attr("fill", "rgba(52,152,219,1.0)");

        // // add the x Axis
        // svgPick.append("g")
        //     .attr("transform", `translate(0,${fHeight})`)
        //     .call(xPickAxis);

        // // add the y Axis
        // svgPick.append("g")
        //     // .attr("transform", `translate(${fWidth},0)`)
        //     .call(yPickAxis1);

        // svgPick.append("g")
        //     .attr("transform", `translate(${fWidth},0)`)
        //     .call(yPickAxis2);

        svgKda.selectAll(".kdabar")
            .data(this.state.kdaRank)
            .enter().append("rect")
            .attr("class", "kdabar")
            .attr("x", function (d) { return xKdaScale(d.champ); })
            .attr("width", xKdaScale.bandwidth())
            .attr("height", 0)
            .on("mouseover", tipKdaMouseover)
            .on("mouseout", tipMouseout)
            .transition()
            .duration(200)
            .delay(function (d, i) {
                return i * 50;
            })
            .attr("y", function (d) { return yKdaScale(d.kda); })
            .attr("height", function (d) { return height - yKdaScale(d.kda); })
            .attr("fill", "rgba(52,152,219,1.0)");

        // add the x Axis
        svgKda.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xKdaAxis);

        // add the y Axis
        svgKda.append("g")
            .attr("transform", `translate(${width},0)`)
            .call(yKdaAxis);



        svgDamage.selectAll(".damagebar")
            .data(this.state.damageRank)
            .enter().append("rect")
            .attr("class", "damagebar")
            .attr("x", function (d) { return xDamageScale(d.champ); })
            .attr("width", xDamageScale.bandwidth())
            .attr("height", 0)
            .on("mouseover", tipDamageMouseover)
            .on("mouseout", tipMouseout)
            .transition()
            .duration(200)
            .delay(function (d, i) {
                return i * 50;
            })
            .attr("y", function (d) { return yDamageScale(d.damage); })
            .attr("height", function (d) { return height - yDamageScale(d.damage); })
            .attr("fill", "rgba(231,76,60,1.0)");

        // add the x Axis
        svgDamage.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xDamageAxis);

        // add the y Axis
        svgDamage.append("g")
            .call(yDamageAxis);

    }

    goToMatchMap(match) {

        this.props.history.push(`/playerKillsMap?matchId=${match.gameId}&summoner=${this.state.summoner}`);

    }

    render() {

        return (

            <div>
                <header>
                    <ul>
                        <li className="active" ><Link style={{ textDecoration: 'none', color: 'inherit' }} to={`/home?summoner=${this.state.summoner}`} >Início</Link></li>
                        <li><Link style={{ textDecoration: 'none', color: 'inherit' }} to={`/compKillsMap?summoner=${this.state.summoner}`} >Mapa de Mortes Competitivo</Link></li>
                        <li>{this.state.summoner}</li>
                        <li><img id="summonerIcon" src={`http://avatar.leagueoflegends.com/br1/${this.state.summoner.replace(" ", "%20")}.png`} /></li>
                    </ul>
                </header>
                <section id="main">
                    <div id="stats">
                        <h1>Estatísticas</h1>
                        <center>

                            <div id="kdaRank" className="chart">
                                <h1>Top 5 Campeões por KDA</h1>
                            </div>

                            <div id="damageRank" className="chart">
                                <h1>Top 5 Campeões por Dano Causado</h1>
                            </div>
                        </center>
                        <center>
                            <div id="pickCount" className="fullChart">
                                <h1>Campeões por Partidas Jogadas</h1>
                            </div>
                        </center>
                    </div>
                    <div id="history">
                        <h1>Histórico de Partidas</h1>
                        <ul>
                            {
                                this.state.matchHistory.map(match => (
                                    <li onClick={() => { this.goToMatchMap(match) }} key={match.gameId} >
                                        <div className={match.win ? "victory" : "defeat"}>
                                            <img title={match.champ.name} src={match.champ.imgUrl} />
                                            <div className="stats">
                                                <div className="kda">
                                                    <div><img src={score} /></div>
                                                    <div><label>{match.performance.kills}/{match.performance.deaths}/{match.performance.assists}</label></div>
                                                </div>
                                                <div className="gold">
                                                    <div><img src={gold} /></div>
                                                    <div><label>{match.performance.gold}</label></div>
                                                </div>
                                                <div className="creep">
                                                    <div><img src={minion} /></div>
                                                    <div><label>{match.performance.farm}</label></div>
                                                </div>
                                                <div className="damage">
                                                    <div><img src={spells} /></div>
                                                    <div><label>{match.performance.damageDealt}</label></div>
                                                </div>
                                                <div className="wards">
                                                    <div><img className="ward-icon" src={ward} /></div>
                                                    <div><label>{match.performance.wards}</label></div>
                                                </div>
                                                <div className="time">
                                                    <div><label>{Math.floor(match.gameDuration / 60)}:{match.gameDuration % 60}</label></div>
                                                </div>
                                            </div>

                                            <div className="itens">
                                                <ul>
                                                    {
                                                        match.items.map(item => (

                                                            <li key={match.items.indexOf(item)} >
                                                                <img title={item.name} src={item.imgUrl} />
                                                            </li>

                                                        ))
                                                    }

                                                    {/* <li><img src="../3026.png" /></li>
                                                    <li><img src="../3072.png" /></li>
                                                    <li><img src="../3085.png" /></li>
                                                    <li><img src="../3087.png" /></li>
                                                    <li><img src="../3363.png" /></li> */}
                                                </ul>
                                            </div>
                                            <div className="summonerSpells">
                                                <ul>
                                                    <li><img title={match.spells[0].name} src={match.spells[0].imgUrl} /></li>
                                                    <li><img title={match.spells[1].name} src={match.spells[1].imgUrl} /></li>
                                                </ul>
                                            </div>
                                            <div className="victoryOrDefeat">
                                                <p>{match.win ? "VITÓRIA" : "DERROTA"}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                </section>
                <section id="bestChampion">
                    <h1>Melhor Campeão</h1>
                    <img src={!!this.state.bestChamp ? this.state.bestChamp.imgUrl : ''} />
                    <h2>{!!this.state.bestChamp ? this.state.bestChamp.info.name : ''}</h2>
                    <p>Características</p>
                    <p>(Jogos Recentes)</p>
                    <ul>
                        <li>{!!this.state.bestChamp ? this.state.bestChamp.perf.gamesWon + this.state.bestChamp.perf.gamesLost : ''} jogos</li>
                        <li>{!!this.state.bestChamp ? this.state.bestChamp.perf.gamesWon : ''} vitórias</li>
                        <li>WinRatio: {!!this.state.bestChamp ? this.state.bestChamp.perf.winRate * 100 : ''}%</li>

                    </ul>

                </section>

            </div>

        );

    }

}

export default withRouter(Home);

