const fetch = require('node-fetch');
const {api_key} = require('../config.json')
const {getProfile,getRankedProfile,matchmessage} = require('../functions/profileFunctions.js')
module.exports = {
	name: 'profile',
	async execute(message, arg) {
		getProfile(arg,function(err,profile){
			if(err){
				return  message.channel.send(err)
			}
			const encSuID = profile.id
			const name = profile.name 
			const level = profile.summonerLevel 
			const profileId = profile.profileIconId
			getRankedProfile(encSuID,function(err,rankedProfiles){
				if(err){
					return  message.channel.send(err)
				}
				
				let profileRanked;
				if(rankedProfiles[1] && rankedProfiles[1].queueType == 'RANKED_SOLO_5x5'){
					profileRanked = rankedProfiles[1]
				}else{
					profileRanked = rankedProfiles[0]
				}
				const tier = profileRanked ? profileRanked.tier : 'UNRANKED'
				const rank = profileRanked ? profileRanked.rank : ''
				const pdl = profileRanked ? profileRanked.leaguePoints : '0'
				const wins = profileRanked ? profileRanked.wins : '0'
				const losses = profileRanked ? profileRanked.losses : '0'
				const wr = profileRanked ? Math.round( wins  / (wins + losses) * 100) : '0'

				const profileObject = {
					"name": name,
					"level": level,
					"tier": tier,
					"rank": rank,
					"pdl": pdl,
					"wins": wins,
					"losses": losses,
					"wr": wr,
					"profileId": profileId
				}
				matchmessage(message,profileObject)
			})
		})
},
};