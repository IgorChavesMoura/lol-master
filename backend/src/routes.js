import express from 'express';
import axios from 'axios';

import { REGIONS } from 'kayn';

import MatchUtils from './util/MatchUtils';
import ChampUtils from './util/ChampUtils';

const routes = express.Router();

routes.get('/', async (req, res) => {

    let summoner = req.query.s;
    let region = req.query.r;
    let apiKey = req.apiKey;

    //https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/RiotSchmick?api_key=<key>

    const response = await axios.get(`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summoner}?api_key=${apiKey}`);

    return res.json(response.data);


});

routes.get('/killsDataset', async (req, res) => {

    const file = `${__dirname}/lol-dataset/kills.csv`;
    res.download(file);

});

routes.get('/pickCount', async (req, res) => {

    const kayn = req.kayn;

    let summoner = req.query.s;
    let apiLang = req.apiLang;
    let version = req.ddVersion;



    try {




        const { id, accountId } = await kayn.Summoner.by.name(summoner);


        const { matches } = await kayn.Matchlist.by
            .accountID(accountId)
            .query({ queue: 420 });


        const gameIds = matches.map(({ gameId }) => gameId);
        const requests = gameIds.map(kayn.Match.get);
        const matchs = await Promise.all(requests);

        let mappedMatchs = await Promise.all(matchs.map(m => {

            let participantId = MatchUtils.getSummonerParticipantId(m, summoner);

            let playerChamp = MatchUtils.getPlayerChamp(m, participantId);

            return { champ: playerChamp };

        }));

        mappedMatchs = await Promise.all(mappedMatchs.map(async m => {

            let champInfo = await ChampUtils.getChampInfoById(m.champ, version, apiLang, kayn);

            return { champ:champInfo.name };

        }))

        // const pickCount = {};

        // mappedMatchs.forEach(m => {

        //     if (!!pickCount[m.champ]) {

        //         pickCount[m.champ].count++;

        //     } else {

        //         pickCount[m.champ] = { count: 1 };

        //     }

        // });

        // const pickCountList = await Promise.all(Object.keys(pickCount).map(async champId => {

        //     let champInfo = await ChampUtils.getChampInfoById(champId, version, apiLang, kayn);

        //     return { champ: champInfo, count: pickCount[champId].count };

        // }));



        return res.json(mappedMatchs);

    } catch (error) {

        return res.json(error);

    }




});

routes.get('/kdaRank', async (req, res) => {

    const kayn = req.kayn;

    let summoner = req.query.s;
    let quantity = req.query.q;
    let apiLang = req.apiLang;
    let version = req.ddVersion;

    const { id, accountId } = await kayn.Summoner.by.name(summoner);

    const championIdMap = await kayn.DDragon.Champion.listDataByIdWithParentAsId();

    const { matches } = await kayn.Matchlist.by
        .accountID(accountId)
        .query({ queue: 420 });

    const gameIds = matches.slice(0, quantity).map(({ gameId }) => gameId);
    const requests = gameIds.map(kayn.Match.get);
    const matchs = await Promise.all(requests);



    const matchsMapped = await Promise.all(matchs.map(async match => {

        let participantId = MatchUtils.getSummonerParticipantId(match, summoner);

        let performance = MatchUtils.getPlayerPerformance(match, participantId);

        let playerChamp = MatchUtils.getPlayerChamp(match, participantId);

        let champInfo = await ChampUtils.getChampInfoById(playerChamp, version, apiLang, kayn);

        function calculateKda(k, a, d) {

            let deaths = d > 0 ? d : 1;

            return (k + a) / deaths;

        };

        return { kda: calculateKda(performance.kills, performance.assists, performance.deaths), kills: performance.kills, assists: performance.assists, deaths: performance.deaths, champ: champInfo.name };

    }));

    let kdaRank = matchsMapped.slice().sort((a, b) => b.kda - a.kda);

    let listContainsChamp = (list, champ) => {

        let res = false;

        list.forEach(e => {

            if (e.champ == champ) {

                res = true;

            }

        });

        return res;

    };

    let finalRank = [];

    for (let i = 0; i < kdaRank.length; i++) {

        if (!listContainsChamp(finalRank, kdaRank[i].champ)) {

            finalRank.push(kdaRank[i]);

        }

        if (finalRank.length == 5) {

            break;

        }

    }

    return res.json(finalRank);

});

routes.get('/damageRank', async (req, res) => {

    const kayn = req.kayn;

    let summoner = req.query.s;
    let quantity = req.query.q;
    let apiLang = req.apiLang;
    let version = req.ddVersion;

    const { id, accountId } = await kayn.Summoner.by.name(summoner);

    const championIdMap = await kayn.DDragon.Champion.listDataByIdWithParentAsId();

    const { matches } = await kayn.Matchlist.by
        .accountID(accountId)
        .query({ queue: 420 });

    const gameIds = matches.slice(0, quantity).map(({ gameId }) => gameId);
    const requests = gameIds.map(kayn.Match.get);
    const matchs = await Promise.all(requests);

    const matchsMapped = await Promise.all(matchs.map(async match => {

        let participantId = MatchUtils.getSummonerParticipantId(match, summoner);

        let performance = MatchUtils.getPlayerPerformance(match, participantId);

        let playerChamp = MatchUtils.getPlayerChamp(match, participantId);

        let champInfo = await ChampUtils.getChampInfoById(playerChamp, version, apiLang, kayn);

        return { damage: performance.damageDealt, champ: champInfo.name };

    }));

    let damageRank = matchsMapped.slice().sort((a, b) => b.damage - a.damage);


    let listContainsChamp = (list, champ) => {

        let res = false;

        list.forEach(e => {

            if (e.champ == champ) {

                res = true;

            }

        });

        return res;

    };

    let finalRank = [];

    for (let i = 0; i < damageRank.length; i++) {

        if (!listContainsChamp(finalRank, damageRank[i].champ)) {

            finalRank.push(damageRank[i]);

        }

        if (finalRank.length == 5) {

            break;

        }

    }

    return res.json(finalRank);


});

routes.get('/matchTimeline', async (req, res) => {

    const kayn = req.kayn;

    let matchId = req.query.matchId;
    let summoner = req.query.summoner;
    let apiLang = req.apiLang;
    let version = req.ddVersion;

    try {

        const match = await kayn.Match.get(matchId);

        const data = await kayn.Match.timeline(matchId);

        const matchPlayerData = await MatchUtils.extractPlayerData(match, summoner, version, apiLang, kayn);

        const participantId = matchPlayerData.participantId;

        const participantPos = data.frames.map(f => {

            return f.participantFrames[participantId];

        });

        let participantDeaths = data.frames.filter(f => {

            let hasAPlayerDeath = (events, participantId) => {

                let result = false;

                events.forEach(e => {

                    if (e.type == "CHAMPION_KILL" && e.victimId == participantId) {

                        result = true;

                    }

                });

                return result;

            };

            return f.events.length > 0 && hasAPlayerDeath(f.events, participantId);

        });

        participantDeaths = await Promise.all(participantDeaths.map(async f => {

            let result = undefined;

            f.events.forEach(e => {

                if (e.type == "CHAMPION_KILL" && e.victimId == participantId) {

                    result = e;

                }

            });

            result.timestamp = f.timestamp;


            result.killerName = MatchUtils.getParticipantSummonerName(match, result.killerId);

            let killerChampId = MatchUtils.getPlayerChamp(match, result.killerId);


            let killerChamp = await ChampUtils.getChampInfoById(killerChampId, version, apiLang, kayn);

            result.assistingParticipantNames = result.assistingParticipantIds.map(pid => MatchUtils.getParticipantSummonerName(match, pid));

            result.killerChamp = killerChamp;

            return result;

        }));

        return res.json({ participantData: matchPlayerData, participantDeaths: participantDeaths });

    } catch (error) {

        return res.json(error);

    }



});

routes.get('/bestChamp', async (req, res) => {

    const kayn = req.kayn;

    let summoner = req.query.s;
    //let region = req.query.r;
    let quantity = req.query.q;
    let apiLang = req.apiLang;
    let version = req.ddVersion;

    try {

        const { accountId, id } = await kayn.Summoner.by.name(summoner);

        const championMasteries = await kayn.ChampionMastery.list(id);

        const bestChampId = championMasteries[0].championId;

        const champInfo = await ChampUtils.getChampInfoById(bestChampId, version, apiLang, kayn);

        const champPerformance = await ChampUtils.getChampPerformance(summoner, bestChampId, kayn);




        return res.json({ imgUrl: `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champInfo.name}_0.jpg`, info: champInfo, perf: champPerformance });



    } catch (error) {

        return res.json(error);

    }

});

routes.get('/matchHistory', async (req, res) => {

    const kayn = req.kayn;

    let summoner = req.query.s;
    //let region = req.query.r;
    let quantity = req.query.q;
    let apiLang = req.apiLang;
    let version = req.ddVersion;


    try {


        const { accountId, id } = await kayn.Summoner.by.name(summoner);

        const { matches } = await kayn.Matchlist.by
            .accountID(accountId)
            .query({ queue: 420 });

        const gameIds = matches.slice(0, quantity).map(({ gameId }) => gameId);
        const requests = gameIds.map(kayn.Match.get);
        const results = await Promise.all(requests);

        let matchesMapped = await Promise.all(results.map(async match => {

            let playerInfo = await MatchUtils.extractPlayerData(match, summoner, version, apiLang, kayn);

            return playerInfo;

        }));

        matchesMapped = matchesMapped.sort((a,b) => a.gameCreation - b.gameCreation);

        //console.log(id);

        return res.json(matchesMapped);

    } catch (error) {

        return res.json(error);

    }




});

routes.get('/kaynTest', async (req, res) => {

    const kayn = req.kayn;


    // Note that the grabbing of a matchlist is currently limited by pagination.
    // This API request only returns the first list. An enhanced version of this method
    // will probably be included in the enhancer (which will be part of this library) called Rhaast.

    try {


        const featuredMatches = await kayn.FeaturedGamesV4.list();

        const match = featuredMatches.gameList[1];

        res.json(match);

    } catch (error) {

        return res.json(error);

    }


});

routes.get('/kaynTest2', async (req, res) => {

    const kayn = req.kayn;


    const processMatch = (championIdMap, summonerId, match) => {
        const { participantId } = match.participantIdentities.find(
            pi => pi.player.summonerId === summonerId,
        )
        const participant = match.participants.find(
            p => p.participantId === participantId,
        )
        const champion = championIdMap.data[participant.championId]
        return {
            gameCreation: match.gameCreation,
            seasonId: match.seasonId,
            didWin:
                participant.teamId ===
                match.teams.find(({ win }) => win === 'Win').teamId,
            championId: participant.championId,
            championName: champion.name,
        }
    }

    const championIdMap = await kayn.DDragon.Champion.listDataByIdWithParentAsId()
    const { id, accountId } = await kayn.Summoner.by.name('TMP Maker')
    const { matches } = await kayn.Matchlist.by
        .accountID(accountId)
        .query({ queue: 420, champion: 98 })
    const gameIds = matches.slice(0, 100).map(({ gameId }) => gameId)
    const matchDtos = await Promise.all(gameIds.map(kayn.Match.get))
    // `processor` is a helper function to make the subsequent `map` cleaner.
    const processor = match => processMatch(championIdMap, id, match)
    const results = await Promise.all(matchDtos.map(processor));

    const champMastery = await kayn.ChampionMasteryV4.get(id)(98);

    let championPerf = {};




    results.forEach(
        match => {

            if (!championPerf[match.championId]) {

                championPerf[match.championId] = {
                    winRate: 0,
                    championId: match.championId,
                    championName: match.championName,
                    championMastery: champMastery.championLevel,
                    championMasteryPoints: champMastery.championPoints
                };

            }

            if (!!match.didWin) {

                championPerf[match.championId].winRate++;

            }


        }

    );

    championPerf[98].winRate /= results.length;

    return res.json(championPerf);

});

routes.get('/kaynTest3', async (req, res) => {

    const kayn = req.kayn;


    // Note that the grabbing of a matchlist is currently limited by pagination.
    // This API request only returns the first list. An enhanced version of this method
    // will probably be included in the enhancer (which will be part of this library) called Rhaast.

    try {


        const featuredMatches = await kayn.FeaturedGamesV4.list();

        const match = featuredMatches.gameList[0];

        //console.log(match);

        const matchPlayersPerf = await Promise.all(match.participants.map(
            async (participant) => {

                try {

                    let playerPerf = await ChampUtils.getChampPerformance(participant.summonerName, participant.championId, kayn);

                    console.log(playerPerf);

                    return playerPerf;


                } catch (error) {

                    console.log(error);

                    return null;
                }
            }
        ));

        console.log(matchPlayersPerf);

        return res.json(matchPlayersPerf);

    } catch (error) {

        return res.json(error);

    }


});


export default routes;
