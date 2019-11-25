import ChampUtils from './ChampUtils';
import SummonerSpellUtils from './SummonerSpellUtils';
import ItemUtils from './ItemUtils';

var MatchUtils = { };

function getSummonerParticipantId(match,summoner){

    let participantId = undefined;

    match.participantIdentities.forEach(
        participant => {

            if(participant.player.summonerName == summoner){

                participantId = participant.participantId;

            }

        }
    );

    return participantId;

}

function getParticipantSummonerName(match,participantId){

    let summoner = undefined;

    match.participantIdentities.forEach(
        participant => {

            if(participant.participantId == participantId){

                summoner = participant.player.summonerName;

            }

        }
    );

    return summoner;

}

MatchUtils.getSummonerParticipantId = getSummonerParticipantId; 

MatchUtils.getParticipantSummonerName = getParticipantSummonerName;

function getParticipantTeam(match,participantId){

    let participantTeam = undefined;

    match.participants.forEach(
        participant => {
            if(participant.participantId == participantId){

                participantTeam = participant.teamId;

            }
        }
    );

    return participantTeam;

}

function getPlayerWin(match,participantId){

    let playerWin = false;
    


    match.participants.forEach(
        participant => {
            if(participant.participantId == participantId){

                playerWin = participant.stats.win;


            }
        }
    );

    return playerWin;

}

function getPlayerChamp(match,participantId){

    let playerChamp = undefined;

    match.participants.forEach(
        participant => {
            if(participant.participantId == participantId){

                playerChamp = participant.championId;

            }
        }
    );

    return playerChamp;


}

MatchUtils.getPlayerChamp = getPlayerChamp;

function getPlayerChampLevel(match,participantId){

    let playerChampLevel = undefined;

    participant => {
        if(participant.participantId == participantId){

            playerChampLevel = participant.stats.champLevel;

        }
    }

    return playerChampLevel;

}

function getPlayerPerformance(match,participantId){

    let performance = undefined;

    match.participants.forEach(
        participant => {
            if(participant.participantId == participantId){

                performance = { kills:participant.stats.kills, 
                                deaths:participant.stats.deaths, 
                                assists:participant.stats.assists,
                                farm:participant.stats.totalMinionsKilled,
                                gold:participant.stats.goldEarned,
                                wards:participant.stats.wardsPlaced,
                                damageDealt:participant.stats.totalDamageDealtToChampions };

            }
        }
    );

    return performance;

}

MatchUtils.getPlayerPerformance = getPlayerPerformance;

async function getPlayerSummonerSpells(match,participantId,version,lang,kayn){

    let playerSpells = undefined;

    for await (let participant of match.participants){

        if(participant.participantId == participantId){

            let spell1 = await SummonerSpellUtils.getSummonerSpellInfo(participant.spell1Id,version,lang,kayn);
            let spell2 = await SummonerSpellUtils.getSummonerSpellInfo(participant.spell2Id,version,lang,kayn);

            playerSpells = [ spell1,spell2 ];


        }

    }

    return playerSpells;

}

async function getPlayerItems(match,participantId,version,lang,kayn){

    let playerItems = undefined;

    for await (let participant of match.participants){

        if(participant.participantId == participantId){


            let item0 = ItemUtils.getItemInfo(participant.stats.item0,version,lang,kayn);
            let item1 = ItemUtils.getItemInfo(participant.stats.item1,version,lang,kayn);
            let item2 = ItemUtils.getItemInfo(participant.stats.item2,version,lang,kayn);
            let item3 = ItemUtils.getItemInfo(participant.stats.item3,version,lang,kayn);
            let item4 = ItemUtils.getItemInfo(participant.stats.item4,version,lang,kayn);
            let item5 = ItemUtils.getItemInfo(participant.stats.item5,version,lang,kayn);
            let item6 = ItemUtils.getItemInfo(participant.stats.item6,version,lang,kayn);




            playerItems = await Promise.all([ item0,item1,item2,item3,item4,item5,item6 ]);


            break;

        }

    }

    return playerItems;


}

MatchUtils.extractPlayerData = async (match,summoner,version,lang,kayn) => {

    let participantId = getSummonerParticipantId(match,summoner);

    let playerTeam = getParticipantTeam(match,participantId);

    let playerWin = getPlayerWin(match,participantId);

    let playerChamp = getPlayerChamp(match,participantId);

    let playerChampLevel = getPlayerChampLevel(match,participantId);

    let champInfo = await ChampUtils.getChampInfoById(playerChamp,version,lang,kayn);

    let performance = getPlayerPerformance(match,participantId);

    let summonerSpells = await getPlayerSummonerSpells(match,participantId,version,lang,kayn);

    let playerItems = await getPlayerItems(match,participantId,version,lang,kayn);

    let player = { gameId:match.gameId, gameDuration:match.gameDuration, gameCreation:match.gameCreation, participantId:participantId, win:playerWin, performance, champ:champInfo, level:playerChampLevel, spells:summonerSpells, items:playerItems };
    
    return player

};

export default MatchUtils;