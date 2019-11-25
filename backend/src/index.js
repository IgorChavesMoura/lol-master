import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import axios from 'axios';

import { Kayn,REGIONS,METHOD_NAMES,RedisCache } from 'kayn';

import routes from './routes';


const app = express();

const apiKey = process.env.RIOT_LOL_API_KEY;

//console.log('Riot API Key: ' + apiKey);

const redisCache = new RedisCache({
    host: 'localhost',
    port: 6379,
    keyPrefix: 'kayn',
    //password: 'hello-world',
    // etc...
})

const kayn = Kayn(apiKey)({
    region: REGIONS.BRAZIL,
    apiURLPrefix: 'https://%s.api.riotgames.com',
    locale: 'pt_BR',
    debugOptions: {
        isEnabled: true,
        showKey: false,
    },
    requestOptions: {
        shouldRetry: true,
        numberOfRetriesBeforeAbort: 3,
        delayBeforeRetry: 1000,
        burst: false,
        shouldExitOn403: false,
    },
    cacheOptions: {
        cache: redisCache,
        timeToLives: {
            useDefault: true,
            byGroup: {
                DDRAGON: 1000 * 60 * 60 * 24 * 30, // cache for a month
                MATCH: 1000 * 60 * 60 * 24,
                SUMMONER: 1000 * 60 * 60 * 24
                
            },
            // byMethod: {
            //     [METHOD_NAMES.SUMMONER.GET_BY_SUMMONER_NAME]: 1000, // ms
            //     [METHOD_NAMES.MATCH.GET_MATCHLIST]: 1000 * 60 * 10,
                
            // },
        },
    },
});


app.use(cors());

app.use(express.json());

app.use((req,res,next) => {

    req.ddVersion = '9.22.1';
    req.apiLang = 'pt_BR';
    req.apiKey = apiKey;
    req.kayn = kayn;

    return next();

}); 

app.use(routes);

app.listen(process.env.PORT,() => {
    console.log(`Server running on port ${process.env.PORT}`);
});