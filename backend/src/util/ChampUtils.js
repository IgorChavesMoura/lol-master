var ChampUtils = {};

ChampUtils.getChampInfoById = async (champId, version, lang, kayn) => {

    const championIdMap = await kayn.DDragon.Champion.listDataByIdWithParentAsId().version(version).locale(lang);

    const champion = championIdMap.data[champId];

    let description = champion.blurb;
    let name = champion.key;
    let id = champion.id;
    let imgUrl = `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${name}.png`;

    let champInfo = { id, name, description, imgUrl };

    return champInfo;

}

ChampUtils.getChampPerformance = async (summonerName, champId, kayn) => {

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

    const championIdMap = await kayn.DDragon.Champion.listDataByIdWithParentAsId();

    const champName = championIdMap.data[champId].name;
    const { id, accountId } = await kayn.Summoner.by.name(summonerName)

    try {

        const { matches } = await kayn.Matchlist.by
            .accountID(accountId)
            .query({ queue: 420, champion: champId });


        const gameIds = matches.slice(0, 10).map(({ gameId }) => gameId)
        const matchDtos = await Promise.all(gameIds.map(kayn.Match.get))
        // `processor` is a helper function to make the subsequent `map` cleaner.
        const processor = match => processMatch(championIdMap, id, match)
        const results = await Promise.all(matchDtos.map(processor));

        let champMastery = undefined;

        try {

            champMastery = await kayn.ChampionMasteryV4.get(id)(champId);

        } catch (error) {

            champMastery = { championLevel: 0, championPoints: 0 };

        }

        let championPerf = {

            winRate: 0,
            gamesWon: 0,
            gamesLost: 0,
            summonerName: summonerName,
            championId: champId,
            championName: champName,
            championMastery: champMastery.championLevel,
            championMasteryPoints: champMastery.championPoints

        };


        results.forEach(
            match => {

                if (!!match.didWin) {

                    championPerf.gamesWon++;

                } else {

                    championPerf.gamesLost++;

                }
            }

        );

        if (championPerf.gamesWon > 0) {

            championPerf.winRate = championPerf.gamesWon / results.length;

        }

        return championPerf;

    } catch (error) {

        return {

            winRate: 0,
            gamesWon: 0,
            gamesLost: 0,
            summonerName: summonerName,
            championId: champId,
            championName: champName,
            championMastery: 0,
            championMasteryPoints: 0

        };


    }



}

export default ChampUtils;