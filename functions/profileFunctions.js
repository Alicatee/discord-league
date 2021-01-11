const {requesterror} = require('./functions.js')
const urlgetprofile = "https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/"
const urlgetrankedprofile = "https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/"
const {api_key} = require('../config.json')
const request = require('node-fetch');

getProfile = async function(summoner,cb){
    let statusCode;
      const body = await request(`${urlgetprofile}${summoner}?api_key=${api_key}`).then(response => {
          statusCode = response.status
          return response.json()
      });
      requesterror(urlgetprofile,statusCode,function(err){
        if(err){
         return cb(err)
        }
        cb(false,body)
      })
   }
  
   getRankedProfile = async function(id,cb){
    let statusCode;
      const body = await request(`${urlgetrankedprofile}${id}?api_key=${api_key}`).then(response => {
          statusCode = response.status
          return response.json()
      });
      requesterror(urlgetrankedprofile,statusCode,function(err){
        if(err){
         return cb(err)
        }
        cb(false,body)
      })
   }
   matchmessage =  function(message,profileObject){
    message.channel.send({
        "embed": {
          "title": `Profile Info For ${profileObject.name}`,
          "color": 12717994,
          "author": {
            "name": profileObject.name,
            "icon_url": `http://ddragon.leagueoflegends.com/cdn/11.1.1/img/profileicon/${profileObject.profileId}.png`
          },
          "fields": [
            {
              "name": "Name",
              "value": profileObject.name,
              "inline": true
            },
            {
              "name": "Level",
              "value": profileObject.level,
              "inline": true
            },
            {
                "name": "Rank",
                "value": `${profileObject.tier} ${profileObject.rank} (${profileObject.pdl}PDL)`,
                "inline": true
            },
            {
                "name": "wins",
                "value": profileObject.wins,
                "inline": true
            },
            {
                "name": "losses",
                "value": profileObject.losses,
                "inline": true
            },
            {
                "name": "Win Rate",
                "value": `${profileObject.wr}%`,
                "inline": true
            }
          ]
        }
      })
   }
   module.exports = {
       getProfile,
       getRankedProfile,
       matchmessage
   }