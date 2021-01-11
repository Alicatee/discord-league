const {getsummonerid,getLiveMatch,matchInfo,matchmessage} = require('../functions/matchFunctions.js')

module.exports = {
	name: 'match',
	execute(message, arg) {
  
       getsummonerid(arg,function(err,summonerObject){
           if(err){
              return  message.channel.send(err)
           }
        getLiveMatch(summonerObject,function(err,liveMatchObject){
          if(err){
            return message.channel.send(err)
          }
          matchInfo(liveMatchObject,summonerObject,function(err,matchObject,summonerObject){
            if(err){
              return message.channel.send(err)
            }
          matchmessage(message, matchObject, summonerObject);
          })
        })
       })
	},
};