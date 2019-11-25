import fs from 'fs';
import path from 'path';

import { REGIONS } from 'kayn';

const itemsFolder = 'items';

var ItemUtils = {};

ItemUtils.getItemInfo = async (itemId, version, lang, kayn) => {

    const realm = await kayn.DDragon.Realm.list(REGIONS.BRAZIL);

    const itemsVersion = realm.n.item;

    const itemsJsonPath = path.resolve(__dirname, 'items', `${itemsVersion}.json`);

    if (!fs.existsSync(itemsJsonPath)) {

        try {

            let { data: items } = await kayn.DDragon.Item.list();


            fs.writeFileSync(itemsJsonPath, JSON.stringify(items), 'utf-8');

        } catch (error) {

            console.log(error);

        }


    }


    try {

        let items = JSON.parse(fs.readFileSync(itemsJsonPath, 'utf-8'));


        const item = items[itemId];

        let itemInfo = itemId > 0 ? {
            name: item.name,
            imgUrl: `http://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`
        } : { name: '', imgUrl: '' };

        return itemInfo;

    } catch (e) {

        console.log(e);

        return undefined;
    }


};

export default ItemUtils;