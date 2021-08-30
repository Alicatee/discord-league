const urlsummonerid = "https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/";
const urllivematch = "https://br1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/";
const urlgetchamp = "http://ddragon.leagueoflegends.com/cdn/11.1.1/data/en_US/champion.json";
const urlgetrank = "https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/"

const request = require('node-fetch');
const {api_key} = require('../config.json')
const {requesterror} = require('./functions.js')

const queuearray = {
  '0': 'Custom',
  '8': 'Normal 3v3',
  '2': 'Normal 5v5 Blind Pick',
  '14': 'Normal 5v5 Draft Pick',
  '4': 'Ranked Solo 5v5',
  '6': 'Ranked Premade 5v5',
  '41': 'Ranked 3v3',
  '42': 'Ranked Team 5v5',
  '16': 'Dominion 5v5 Blind Pick',
  '17': 'Dominion 5v5 Draft Pick',
  '25': 'Dominion Coop vs Al',
  '31': 'Coop vs Al Into Bot',
  '32': 'Coop vs Al Beginner Bot',
  '61': 'Teambuilder',
  '65': 'ARAM',
  '70': 'One for All',
  '76': 'URF',
  '318': 'All Random URF',
  '325': 'All Random Games',
  '400': 'Normal 5v5 Draft Pick',
  '410': 'Ranked 5v5 Draft Pick',
  '420': 'Ranked Solo',
  '430': 'Normal Blind Pick',
  '440': 'Ranked Flex',
  '600': 'Blood Hunt Assassin',
  '610': 'Dark Star'
};

const mapname = {
  '1': `Summoner's Rift`,
  '2': `Summoner's Rift Autumn`,
  '3': 'Proving Grounds',
  '4': 'Twisted Treeline',
  '8': 'The Crystal Scar',
  '10': 'Twisted Treeline',
  '11': `Summoner's Rift`,
  '12': 'Howling Abyss',
  '14': `Butcher's Bridge`,
  '16': 'Cosmic Ruins'
};




getsummonerid =  async function(summoner,cb){
    let statusCode;
    const body = await request(`${urlsummonerid}${summoner}?api_key=${api_key}`).then(response => {
        statusCode = response.status
        return response.json()
    });
    requesterror(urlsummonerid,statusCode,function(err){
        if(err){
            return cb(err)
        }
        const summonerid = body.id
        const accountlvl = body.summonerLevel
        const profileID = body.profileIconId
        const summonername = body.name
        const summonerObject = {
            "summonerid": summonerid,
            "accountlvl": accountlvl,
            "profileid": profileID,
            "name": summonername
        }
        cb(false,summonerObject)
    })
 }


  
  getLiveMatch = async function(summonerObject,cb){
    let statusCode;
    const body = await request(`${urllivematch}${summonerObject.summonerid}?api_key=${api_key}`).then(response => {
        statusCode = response.status
        return response.json()
    });
    if(statusCode == 404){
     return cb("Summoner Not In A Match")
    }
    requesterror(urllivematch,statusCode,function(err){
      if(err){
       return cb(err)
      }
      console.log('Found Match!')
      const gameid = body.gameId;
      const gamemode = body.gameMode;
      const mapid = body.mapId;
      const gameType = body.gameType;
      const gametime = body.gameStartTime;
      const participants = body.participants;
      const matchobject = {
        "gameid": gameid,
        "gamemode": gamemode,
        "mapid": mapid,
        "gametype": gameType,
        "gametime": gametime,
        "participants": participants,
        "queue": body.gameQueueConfigId,
        "gameLength": body.gameLength
      }
      cb(false,matchobject)
    })
  }

  matchInfo = function(liveMatchObject,summonerObject,cb){
    let placeholder = liveMatchObject.queue
    const gametype = queuearray[placeholder]
    placeholder = liveMatchObject.mapid
    const map = mapname[placeholder]
    const matchid = liveMatchObject.gameid
    let time = liveMatchObject.gametime;
    let elapsedTime;
    let second;
    let minute;
    let hour;
    if(time == 0){
      time = "Loading Into"
      elapsedTime = ""
    }else{
       time =  new Date(time).getTime()
       second = new Date(parseInt(time)).getSeconds()
       minute = new Date(parseInt(time)).getMinutes()
       hour =   new Date(parseInt(time)).getHours()
       const diff = new Date(new Date().getTime() - time)
       time = `Start Time: ${hour}:${minute}:${second}`;
       elapsedTime = `Elapsed Time: ${diff.getUTCHours()}:${Math.round(diff.getUTCMinutes())}:${Math.floor(diff.getSeconds())}`
    }
    const players = liveMatchObject.participants
    const blueplayers = []
    const redplayers = []
    let team;
    for(let i = 0; i < players.length; i++){
      let playerobject = {}
      if(players[i].teamId == 100){
        playerobject.summonername = players[i].summonerName;
        playerobject.championid = players[i].championId;
        playerobject.summonerid = players[i].summonerId;
        playerobject.perks = players[i].perks;
        playerobject.team = "BLUE";
        blueplayers.push(playerobject);

        if(summonerObject.summonerid == players[i].summonerId){
          team = "BLUE"
        }
      }else{
        playerobject.summonername = players[i].summonerName;
        playerobject.championid = players[i].championId;
        playerobject.summonerid = players[i].summonerId;
        playerobject.perks = players[i].perks;
        playerobject.team = "RED";
        redplayers.push(playerobject)
        if(summonerObject.summonerid == players[i].summonerId){
          team = "RED"
        }
      }
    }
   let matchObject = {
      'gametype': gametype,
      'map': map,
      'team': team,
      'time': time,
      'blueplayers': blueplayers,
      'redplayers': redplayers,
      'gameLength': elapsedTime
    }
    
    liveMatchAddChampion(matchObject,function(err){
      if(err){
       return cb(err)
      }
      liveMatchAddRank(matchObject,function(err){
        if(err){
          return cb(err)
        }
        cb(false,matchObject,summonerObject)
      })
    })
    
  }

  liveMatchAddChampion = async function(matchObject,cb){
    let statusCode;
    const body = await request(urlgetchamp).then(response => {
        statusCode = response.status
        return response.json()
    });
    requesterror(urlgetchamp,statusCode,function(err){
      if(err){
        return cb(err)
      }
      const bodyData = body.data 
      for(let i = 0; i < matchObject.blueplayers.length; i++){
        for(let key in bodyData){
          if(bodyData[key].key == matchObject.blueplayers[i].championid){
            matchObject.blueplayers[i].championName = bodyData[key].id
          }
        }
      }
     
      for(let i = 0; i < matchObject.redplayers.length; i++){
        for(let key in bodyData){
          if(bodyData[key].key == matchObject.redplayers[i].championid){
            matchObject.redplayers[i].championName = bodyData[key].id
          }
        }
      }
     cb(false)
    })
  }

  liveMatchAddRank =  async function(matchobject,cb){
    let teamarray;
    let otherarray;
    if(matchobject.team == "RED"){
      teamarray = "redplayers"
      otherarray = "blueplayers"
    }else{
      teamarray = "blueplayers"
      otherarray = "redplayers"
    }
    for(let i = 0; i < matchobject[teamarray].length; i++){
      let statusCode;
      const body = await request(`${urlgetrank}${matchobject[teamarray][i].summonerid}?api_key=${api_key}`).then(response => {
          statusCode = response.status
          return response.json()
      });
      requesterror(urlgetrank,statusCode,function(err){
        if(err){
          return cb(err)
        }
      
        for(let j = 0; j < body.length; j++){
          if(matchobject.gametype != "Ranked Flex" && body[j].queueType == "RANKED_SOLO_5x5"){
            matchobject[teamarray][i].tier = body[j].tier
            matchobject[teamarray][i].rank = body[j].rank
            matchobject[teamarray][i].wins = body[j].wins
            matchobject[teamarray][i].losses = body[j].losses
            matchobject[teamarray][i].hotStreak = body[j].hotStreak
            break
          }else if(matchobject.gametype == "Ranked Flex" && body[j].queueType == "RANKED_FLEX_SR"){
            matchobject[teamarray][i].tier = body[j].tier
            matchobject[teamarray][i].rank = body[j].rank
            matchobject[teamarray][i].wins = body[j].wins
            matchobject[teamarray][i].losses = body[j].losses
            matchobject[teamarray][i].hotStreak = body[j].hotStreak
            break
          }
        }
        if(body.length == 1 && matchobject.gametype != "Ranked Flex" && matchobject.gametype != "Ranked Solo"){
          matchobject[teamarray][i].tier = body[0].tier
          matchobject[teamarray][i].rank = body[0].rank
          matchobject[teamarray][i].wins = body[0].wins
          matchobject[teamarray][i].losses = body[0].losses
          matchobject[teamarray][i].hotStreak = body[0].hotStreak
        }
      if(matchobject[teamarray][i].tier == undefined){
        matchobject[teamarray][i].tier = "UNRANKED";
        matchobject[teamarray][i].rank = "";
        matchobject[teamarray][i].wins = 0;
        matchobject[teamarray][i].losses = 0;
        matchobject[teamarray][i].hotStreak = false;
      }
      })
    }
    for(let i = 0; i < matchobject[otherarray].length; i++){
      let statusCode;
      const body = await request(`${urlgetrank}${matchobject[otherarray][i].summonerid}?api_key=${api_key}`).then(response => {
          statusCode = response.status
          return response.json()
      });
      requesterror(urlgetrank,statusCode,function(err){
        if(err){
          return cb(err)
        }
        
        for(let j = 0; j < body.length; j++){
          if(matchobject.gametype != "Ranked Flex" && body[j].queueType == "RANKED_SOLO_5x5"){
            matchobject[otherarray][i].tier = body[j].tier
            matchobject[otherarray][i].rank = body[j].rank
            matchobject[otherarray][i].wins = body[j].wins
            matchobject[otherarray][i].losses = body[j].losses
            matchobject[otherarray][i].hotStreak = body[j].hotStreak
            break
          }else if(matchobject.gametype == "Ranked Flex" && body[j].queueType == "RANKED_FLEX_SR"){
            matchobject[otherarray][i].tier = body[j].tier
            matchobject[otherarray][i].rank = body[j].rank
            matchobject[otherarray][i].wins = body[j].wins
            matchobject[otherarray][i].losses = body[j].losses
            matchobject[otherarray][i].hotStreak = body[j].hotStreak
            break
          }
        }
        if(body.length == 1 && matchobject.gametype != "Ranked Flex" && matchobject.gametype != "Ranked Solo"){
          matchobject[otherarray][i].tier = body[0].tier
          matchobject[otherarray][i].rank = body[0].rank
          matchobject[otherarray][i].wins = body[0].wins
          matchobject[otherarray][i].losses = body[0].losses
          matchobject[otherarray][i].hotStreak = body[0].hotStreak
        }
        if(matchobject[otherarray][i].tier == undefined){
          matchobject[otherarray][i].tier = "UNRANKED";
          matchobject[otherarray][i].rank = "";
          matchobject[otherarray][i].wins = 0;
          matchobject[otherarray][i].losses = 0;
          matchobject[otherarray][i].hotStreak = false;
        }
      
      })
    }
    cb(false)
  }

  matchmessage = async function(message,matchObject,summonerObject){
    let teamarray;
    let yourarray;
  
    if(matchObject.team == "RED"){
      teamarray = "blueplayers"
      yourarray = "redplayers"
    }else{
      teamarray = "redplayers"
      yourarray = "blueplayers"
    }
    let enemyteam = "";
    let enemyteam2 = ""
    let participantsOnStreak = ""
    let yourteam = "";
    let yourteam2 = ""
    
    for(let i = 0; i < matchObject[teamarray].length; i++){
      const winrate = matchObject[teamarray][i].tier != "UNRANKED" ? Math.round( matchObject[teamarray][i].wins  / (matchObject[teamarray][i].wins + matchObject[teamarray][i].losses) * 100) : '0'
      enemyteam += `${matchObject[teamarray][i].summonername} - ${matchObject[teamarray][i].championName} \n`
      enemyteam2 += `Rank: ${matchObject[teamarray][i].tier} ${matchObject[teamarray][i].rank} - WR: ${winrate}% (${matchObject[teamarray][i].wins}W,${matchObject[teamarray][i].losses}L)\n`
      if(matchObject[teamarray][i].hotStreak){
        participantsOnStreak += `${matchObject[teamarray][i].summonername}(${matchObject[teamarray][i].championName})\n`
      }
    }
    for(let i = 0; i < matchObject[yourarray].length; i++){
      const winrate = matchObject[yourarray][i].tier != "UNRANKED" ? Math.round( matchObject[yourarray][i].wins  / (matchObject[yourarray][i].wins + matchObject[yourarray][i].losses) * 100) : '0'
      yourteam += `${matchObject[yourarray][i].summonername} - ${matchObject[yourarray][i].championName} \n`
      yourteam2 += `Rank: ${matchObject[yourarray][i].tier} ${matchObject[yourarray][i].rank} - WR: ${winrate}% (${matchObject[yourarray][i].wins}W,${matchObject[yourarray][i].losses}L)\n`
      if(matchObject[yourarray][i].hotStreak){
        participantsOnStreak += `${matchObject[yourarray][i].summonername}(${matchObject[yourarray][i].championName})\n`
      }
    }

    
    

    message.channel.send({
      "embed": {
        "title": `Live Match Info For ${summonerObject.name}`,
        "description": `${matchObject.gametype} on ${matchObject.map} \n ${matchObject.time} \n ${matchObject.gameLength}`,
        "color": 12717994,
        "author": {
          "name": summonerObject.name,
          "icon_url": `http://ddragon.leagueoflegends.com/cdn/11.1.1/img/profileicon/${summonerObject.profileid}.png`
        },
        "fields": [
          {
            "name": "Enemy Team",
            "value": enemyteam,
            "inline": true
          },
          {
            "name": "Ranks",
            "value": enemyteam2,
            "inline": true
          },
          {
            "name": '\u200B',
            "value": '\u200B',
          },
          {
            "name": `${summonerObject.name}´s Team`,
            "value": yourteam,
            "inline": true
          },
          {
            "name": "Ranks",
            "value": yourteam2,
            "inline": true
          },
          {
            "name": '\u200B',
            "value": '\u200B',
          },
          {
            "name": "Participants on a Hot Streak:",
            "value": participantsOnStreak != "" ? participantsOnStreak : "None",
            "inline": false
          }
        ]
      }
    })
    
  }


module.exports = {
   getsummonerid,
   requesterror,
   getLiveMatch,
   matchInfo,
   matchmessage
}
