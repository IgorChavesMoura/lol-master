var SummonerSpellUtils = { };

SummonerSpellUtils.getSummonerSpellInfo = async (spellId,version,lang,kayn) => {

    let summonerSpellInfo = undefined;

    const { data:summonerSpells } = await kayn.DDragon.SummonerSpell.list();


    Object.keys(summonerSpells).forEach(
        spellName => {

            let summonerSpell = summonerSpells[spellName];


            if (summonerSpell.key == spellId) {


                let name = summonerSpell.name;
                let imgUrl = `http://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${summonerSpell.id}.png `;

                summonerSpellInfo = { name,imgUrl };

            }


        }
    );

    return summonerSpellInfo;

};

export default SummonerSpellUtils;