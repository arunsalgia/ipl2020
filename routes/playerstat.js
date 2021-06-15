router = express.Router();
const { 
  akshuGetGroup, akshuUpdGroup, akshuGetGroupMembers,
  akshuGetAuction, akshuGetTournament,
  akshuGetGroupUsers,
  getTournamentType,
} = require('./cricspecial'); 
// var PlayerStatRes;
// var _group = 1;
// var _tournament = "IPL2020";
const doMaxRun = 1;
const doMaxWicket = 2;

// user these keys in rotation for fetch data from cricapi
// const keylist = [
// "O9vYC5AxilYm7V0EkYkvRP5jF9B2","RTf9weNrX8Xn2ts1ksdzAXcuxnE3","H2ObZFee6BVMN5kCjLxYCMwcEp52",
// "kAWvFxmpeJZmbtyNeDLXtxUPrAH3","EstH4EqbfEXMKXcS9M83k7cqUs13","ApVnpFFO6kgxTYXVwWQTEeiFVCO2",
// "72QuFkQezxf5IdqxV1CtGJrAtcn1","mggoPlJzYFdVbnF9FYio5GTLVD13","AdHGF0Yf9GTVJcofkoRTt2YHK3k1",
// "4mtu16sveyTPWgz5ID7ru9liwE12","iEsdTQufBnToUI1xVxWMQF6wauX2","bbdCNNOKBtPnL54mvGSgpToFUlA2",
// "AM690XluFdZJ85PYvOP7IxgcxUI2","85L3mbm1GiXSfYmQWZJSeayoG2s1","LrNnasvQp0e2p5JfpAI5Q642o512",
// "UsE0jiSe6ZbLSQlO6k9W8ePWT043","ySAewUr5vLamX7LLdfzYD7jTWiJ2","ilzY7ckWVyQfjtULC8uiU2ciSW93",
// "fvxbB9BLVNfxatmOaiseF7Jzz6B2","Klr0NkJuG3YpZ1KburbMBNpfO1q1"
// ]; 

// use for testing

// const keylist = [
// "O9vYC5AxilYm7V0EkYkvRP5jF9B2","mggoPlJzYFdVbnF9FYio5GTLVD13","AdHGF0Yf9GTVJcofkoRTt2YHK3k1",
// "4mtu16sveyTPWgz5ID7ru9liwE12","iEsdTQufBnToUI1xVxWMQF6wauX2","bbdCNNOKBtPnL54mvGSgpToFUlA2",
// "AM690XluFdZJ85PYvOP7IxgcxUI2","85L3mbm1GiXSfYmQWZJSeayoG2s1","LrNnasvQp0e2p5JfpAI5Q642o512",
// "UsE0jiSe6ZbLSQlO6k9W8ePWT043","apuLbsy7PVddDnb4vAe72X3K10Z2","ZfX9ln4lqYaEEtxJprOTceDW9rx2",
// "93WLPVtYJIOLRKXzb3LJYfrd2Z72","iiyI0vNqKaS4Srie6thRQZe5hIi1","r4ZAGKxe9pdy9AuYzViW486eGI83",
// "ySAewUr5vLamX7LLdfzYD7jTWiJ2","ilzY7ckWVyQfjtULC8uiU2ciSW93","fvxbB9BLVNfxatmOaiseF7Jzz6B2"
// ]

// salgia.ankit key purchased on 7th April 2021
let keylist = ["LrNnasvQp0e2p5JfpAI5Q642o512"]; 

/***
if (PRODUCTION) {
// list provided by ANKIT
keylist = [
  "AE75dwPUs5RAw6ZVHvGfveFj0n63","zB5FK5Ww8UPau4KVTAHSD3qcZNz1","UN4rwRREijNQKKcy8DPYRYRdLA42",
  "fmGPySXZIPbtA1Y5Rcj08XhtjFF3","GhRdKp2UaiPFHOHPHWSvODKfpJR2","cSL8p8DghkRHx2rMHtvAOCN4J2w1",
  "z3Pw3sUAgcZtPLlsP7Mtmcpxdcw1","E4OCcOrhlaPr0tJHHJfcBocJC0f2","z1hiMw3yqEUsKPY7O7yKx4op6iI2",
  "qegGL046YXT4GYH65MlaJb9KCSi2","HQdd1WU2jocSF8enWZR0gHsLMtG2","CkC4tzLl0aM9D5Bm9DDNpmejGVJ3",
  "8LweszMN9vMnjb4W9UjjeQzTgEx1",
	"0400tFCqT1fdlNI5TVZqsnFawRZ2",
	"bbdCNNOKBtPnL54mvGSgpToFUlA2",
	"r4ZAGKxe9pdy9AuYzViW486eGI83",
	"ifc1xBF9BfQIYoCCEJatVUxqoVP2",
	"iiyI0vNqKaS4Srie6thRQZe5hIi1",
	"LrNnasvQp0e2p5JfpAI5Q642o512",
	"AM690XluFdZJ85PYvOP7IxgcxUI2",
	"85L3mbm1GiXSfYmQWZJSeayoG2s1",
	"WwmbdT7rHzMUIpodbcSvZWubrPw2"
];
} else {
keylist= [ 
  "0400tFCqT1fdlNI5TVZqsnFawRZ2","bbdCNNOKBtPnL54mvGSgpToFUlA2",
  "r4ZAGKxe9pdy9AuYzViW486eGI83", "ifc1xBF9BfQIYoCCEJatVUxqoVP2",
  "iiyI0vNqKaS4Srie6thRQZe5hIi1", "Z7Vl1j4P7igV5oq2fWobEgjYNY42"];
}
***/

// console.log(keylist);

// to get Matches
const cricapiMatchInfo_prekey = "https://cricapi.com/api/matches?apikey=";
const cricapiMatchInfo_postkey = "";
// to get match statistics
const cricapi_MatchDetails_prekey = "https://cricapi.com/api/fantasySummary?apikey=";
const cricapi_MatchDetails_postkey = "&unique_id=";
// to get match score
const cricapi_ScoreDetails_prekey = "https://cricapi.com/api/cricketScore?apikey=";
const cricapi_ScoreDetails_postkey = "&unique_id=";

//  https://cricapi.com/api/playerStats?apikey=0400tFCqT1fdlNI5TVZqsnFawRZ2&pid=35320
const cricapi_PlayerInfo_prekey = "https://cricapi.com/api/playerStats?apikey=";
const cricapi_PlayerInfo_postkey = "&pid="; 


const score ={};

var g_groupRec;
var g_captainlist;
var g_gmembers;
var g_allusers;
var g_auctionList;
var g_statList;
var g_tournamentStat;

/* GET all users listing. */
router.use('/', async function(req, res, next) {
  // PlayerStatRes = res;
  setHeader(res);
  if (!db_connection) { senderr(res, DBERROR, ERR_NODB); return; }
  next('route');
});

router.get('/playerinfo/:playerId', async function(req, res) {  
  setHeader(res);
  var {playerId} = req.params;
  
  console.log("in info");
  
 var playerInfoFromCricapi = await fetchPlayerInfoFromCricapi(playerId);
 console.log(playerInfoFromCricapi);

 if (!playerInfoFromCricapi.error)
	sendok(res, playerInfoFromCricapi);
 else
	senderr(res, 601, {});
	 

});


router.get('/updatebrieftable/:tournamnet', async function(req, res) {
  // PlayerStatRes = res;  
  setHeader(res);
  var {tournamnet} = req.params;

  await check_all_tournaments();
  sendok(res, "OK");

});

router.get('/recalc/:tournamnet', async function(req, res) {
  // PlayerStatRes = res;  
  setHeader(res);
  var {tournamnet} = req.params;

  let myTournament = await Tournament.findOne({name: tournamnet});
  if (!myTournament) {senderr(res, 601, "Not found"); return; }
  let matchStat= mongoose.model(myTournament.name, StatSchema);
  let briefStat =  mongoose.model(myTournament.name+BRIEFSUFFIX, BriefStatSchema);

  let match1 = await matchStat.find({mid: 1251572});
  let match2 = await matchStat.find({mid: 1251573});
  console.log(match1.length, match2.length);
  let allMatch = match1.concat(match2);
  let pidList = _.map(allMatch, 'pid');
  pidList = _.uniqBy(pidList);
  console.log(pidList);
  let allBrief = [];
  pidList.forEach(myPid => {
    let myData = _.filter(allMatch, x => x.pid === myPid);
    if (myData.length !== 0) {
      var mybrief = getBlankBriefRecord(briefStat);
      mybrief.sid = 0;
      mybrief.pid = myPid;
      mybrief.playerName = myData[0].playerName;
      mybrief.score = _.sumBy(myData, x => x.score);
      mybrief.inning = _.sumBy(myData, x => x.inning);
      // batting details
      mybrief.run = _.sumBy(myData, x => x.run);
      mybrief.four = _.sumBy(myData, x => x.four);
      mybrief.six = _.sumBy(myData, x => x.six);
      mybrief.fifty = _.sumBy(myData, x => x.fifty);
      mybrief.hundred =  _.sumBy(myData, x => x.hundred);
      mybrief.ballsPlayed = _.sumBy(myData, x => x.ballsPlayed);
      // bowling details
      mybrief.wicket = _.sumBy(myData, x => x.wicket);
      mybrief.wicket3 = _.sumBy(myData, x => x.wicket3);
      mybrief.wicket5 = _.sumBy(myData, x => x.wicket5);
      mybrief.hattrick = _.sumBy(myData, x => x.hattrick);
      mybrief.maiden = _.sumBy(myData, x => x.maiden);
      mybrief.oversBowled = _.sumBy(myData, x => x.oversBowled);
      // fielding detail
      mybrief.runout = _.sumBy(myData, x => x.runout);
      mybrief.stumped = _.sumBy(myData, x => x.stumped);
      mybrief.bowled = _.sumBy(myData, x => x.bowled);
      mybrief.lbw = _.sumBy(myData, x => x.lbw);
      mybrief.catch = _.sumBy(myData, x => x.catch);
      mybrief.duck = _.sumBy(myData, x => x.duck);
      mybrief.economy = _.sumBy(myData, x => x.economy);
      // overall performance
      mybrief.manOfTheMatch = 0;
      mybrief.maxTouramentRun = 0;
      mybrief.maxTouramentWicket = _.filter(myData, x => x.manOfTheMatch === true).length;
      allBrief.push(mybrief);
    }
  })
  await briefStat.deleteMany({sid: 0});
  allBrief.forEach(x => { x.save(); });
  sendok(res, allBrief);
});


router.use('/xxxxxxswap/:gid1/:gid2', async function(req, res, next) {
  // PlayerStatRes = res;  
  setHeader(res);
  var {gid1, gid2} = req.params;
  if (isNaN(gid1)) { senderr(res, 400, "Invalid GID1"); return}
  if (isNaN(gid2)) { senderr(res, 400, "Invalid GID2"); return}
  var igid1 = parseInt(gid1);
  var igid2 = parseInt(gid2);

  var tmp = await IPLGroup.findOne({gid: igid1});
  if (!tmp) { senderr(res, 400, "Invalid GID1"); return}
  tmp = await IPLGroup.findOne({gid: igid2});
  if (!tmp) { senderr(res, 400, "Invalid GID2"); return}

  // swap GROUP 
  var allRecs = await IPLGroup.find({gid: {$in: [igid1, igid2]} })
  //console.log(allRecs);
  allRecs.forEach( x => {
    if      (x.gid == igid1)  x.gid = igid2;
    else if (x.gid == igid2)  x.gid = igid1;
    x.save();   
  })
  // swap GROUP Members
  var allRecs = await GroupMember.find({gid: {$in: [igid1, igid2]} })
  //console.log(allRecs);
  allRecs.forEach( x => {
    if      (x.gid == igid1)  x.gid = igid2;
    else if (x.gid == igid2)  x.gid = igid1;
    x.save();   
  })
  // swap Auction
  var allRecs = await Auction.find({gid: {$in: [igid1, igid2]} })
  allRecs.forEach( x => {
    if      (x.gid == igid1)  x.gid = igid2;
    else if (x.gid == igid2)  x.gid = igid1;
    x.save();   
  })
  // swap Captain
  var allRecs = await Captain.find({gid: {$in: [igid1, igid2]} })

  allRecs.forEach( x => {
    if      (x.gid == igid1)  x.gid = igid2;
    else if (x.gid == igid2)  x.gid = igid1;
    x.save();   
  })
  sendok(res, "OK");
});

router.get('/test/:myGroup', async function(req, res, next) {
  // PlayerStatRes = res;  
  setHeader(res);
  var {myGroup} = req.params;
  var myDate1, myDate2;
  var duration;

  var myDate1 = new Date();
  var groupRec = await IPLGroup.findOne({gid: myGroup});
  var tournamentStat = mongoose.model(groupRec.tournament, StatSchema);
  // var auctionList = await Auction.find({gid: myGroup}).select(['uid', 'pid']);
  // // console.log(auctionList[0]);
  // var pidList = _.map(auctionList, 'pid');
  // // console.log(pidList);
  // var uidList = _.map(auctionList, 'uid');
  // uidList = _.uniq(uidList)
  // // console.log(uidList);
  // myfilter = {pid: {$in: pidList} };

  var matchList = await CricapiMatch.find({tournament: groupRec.tournament, matchEnded: true }).select(['mid']);
  var midList = _.map(matchList, 'mid');
  console.log(`Match count ${midList.length}`);

  var BriefStat = mongoose.model(groupRec.tournament+BRIEFSUFFIX, BriefStatSchema);
  var briefList = await BriefStat.find({});

  myfilter = {mid: {$in: midList} };
  var statList = await tournamentStat.find(myfilter);
  console.log(`Rec count: ${statList.length}`)

  var pidList = _.map(statList, 'pid');
  pidList = _.uniq(pidList);

  pidList.forEach( myPid => {
    var playerList = _.filter(statList, x => x.pid === myPid);
    if (playerList.length === 0) return;
    console.log(`Player: ${playerList[0].playerName}. Matches played ${playerList.length}`)
  /*
{"_id":"5f6611380529c6001772ce89","mid":1216492,"pid":447261,"score":50,
"inning":0,"playerName":"DL Chahar",
"run":0,"four":0,"six":0,"fifty":0,
"hundred":0,"ballsPlayed":0,"wicket":2,"wicket3":0,"wicket5":0,
"hattrick":0,"maiden":0,"oversBowled":4,
"maxTouramentRun":0,"maxTouramentWicket":0,
"manOfTheMatch":false,"__v":0}
  */
    var briefRec = _.find(briefList, x => x.pid === myPid);
    if (!briefRec) {
      var briefRec = new BriefStat();
      briefRec.sid = PROCESSOVER;
      briefRec.pid = myPid;
      briefRec.playerName = playerList[0].playerName;
    }
    briefRec.inning = _.sumBy(playerList, x => x.inning);
    briefRec.score = _.sumBy(playerList, x => x.score);
    // batting details
    briefRec.run = _.sumBy(playerList, x => x.run);
    briefRec.four = _.sumBy(playerList, x => x.four);
    briefRec.six = _.sumBy(playerList, x => x.six);
    briefRec.fifty = _.sumBy(playerList, x => x.fifty);
    briefRec.hundred = _.sumBy(playerList, x => x.hundred);
    briefRec.ballsPlayed = _.sumBy(playerList, x => x.ballsPlayed);
    // bowling details
    briefRec.wicket = _.sumBy(playerList, x => x.wicket);
    briefRec.wicket3 = _.sumBy(playerList, x => x.wicket3);
    briefRec.wicket5 = _.sumBy(playerList, x => x.wicket5);
    briefRec.hattrick = _.sumBy(playerList, x => x.hattrick);
    briefRec.maiden = _.sumBy(playerList, x => x.maiden);
    briefRec.oversBowled = _.sumBy(playerList, x => x.oversBowled);
    // overall performance
    briefRec.maxTouramentRun = 0;
    briefRec.maxTouramentWicket = 0;
    briefRec.manOfTheMatch = _.filter(playerList, x => x.manOfTheMatch === true).length;
    briefRec.save();
  })

  var myDate2 = new Date();
  var duration = myDate2.getTime() - myDate1.getTime();
  console.log(`Time for read ${duration}`);
  sendok(res, "OK")
});


router.use('/hello', async function(req, res, next) {
  // PlayerStatRes = res;  
  setHeader(res);
  console.log("in hello");
  sendok(res, "hello");
});

router.use('/reread/:matchid', async function(req, res, next) {
  // PlayerStatRes = res;  
  setHeader(res);
  console.log("in reread");
  var {matchid} = req.params;
  if (isNaN(matchid)) { sendok(res, "Invalid Match Id"); return}
  var mymid = parseInt(matchid)
  var mmm = await CricapiMatch.findOne({mid: mymid});
  if (mmm == null) { sendok(res, "Invalid Match Id"); return}
  
  const cricData = await fetchMatchStatsFromCricapi(mmm.mid);
  console.log(cricData.data);
  if (cricData == null)
    sendok(res, "cricData is NULL");
  else if (cricData.data == null)
    sendok(res, cricData);
  else {
    var newstats = updateMatchStats_r1(mmm, cricData.data);
    // console.log(`Match Id: ${mmm.mid}  Start: ${mmm.matchStartTime}  End: ${mmm.matchEndTime}`);
    if (mmm.matchEndTime < new Date()) {
      mmm.matchEnded = true;
      mmm.save();
    }
    sendok(res, "OK");
  }     
});

router.use('/sendmystat/:myGroup', async function(req, res, next) {
  // PlayerStatRes = res;  
  setHeader(res);
 var {myGroup} = req.params;

  var groupRec = await IPLGroup.findOne({gid: myGroup});
  if (groupRec) {
    var tmp = _.filter(myStatGroup, x => x === groupRec.gid);
    if (tmp.length === 0)
      myStatGroup.push(groupRec.gid);
    sendMyStat = true;
    sendok(res, "OK");
  } else {
    senderr(res, 722, `Invalid group ${myGroup}`);
  }
});

router.use('/sendmydashboard/:myGroup', async function(req, res, next) {
  // PlayerStatRes = res;  
  setHeader(res);
  var {myGroup} = req.params;
  sendok(res, "OK");
  return;
  var groupRec = await IPLGroup.findOne({gid: myGroup});
  // console.log(groupRec);
  if (groupRec) {
    var tmp = _.filter(myDashboardGroup, x => x === groupRec.gid) 
    if (tmp.length === 0)
      myDashboardGroup.push(groupRec.gid);
    // console.log(myDashboardGroup);
    sendDashboard = true;
    sendok(res, "OK");
  } else {
    senderr(res, 722, `Invalid group ${myGroup}`);
  }
});

router.use('/test', async function(req, res, next) {
  // PlayerStatRes = res;  
  setHeader(res);

  await update_cricapi_data_r1(true);
  sendok(res, "OK");
});

// provide scrore of users beloging to the group
// currently only group 1 supported

router.use('/junked/internal/score', async function(req, res, next) {
  // PlayerStatRes = res;
  setHeader(res);

  // get list of users in group
  var igroup = _group;
  var myGroup = await IPLGroup.findOne({gid: igroup})
  var gmembers = await GroupMember.find({gid: igroup});
  var auctionList = await Auction.find({gid: igroup});
  var captainlist = await Captain.find({gid: igroup});

  // Set collection name 
  var tournamentStat = mongoose.model(myGroup.tournament, StatSchema);
  var statList = await tournamentStat.find({});
  
  var userScoreList = [];    
  // now calculate score for each user
  gmembers.forEach( u  => {
    var userPid = u.uid;
    //console.log(`User: ${userPid}`);
    //var myUserScore = [];

    // find out captain and vice captain selected by user
    var capinfo = _.find(captainlist, x => x.gid == igroup && x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: igroup, uid: userPid, captain: 0, viceCaptain: 0});

    // find out players of this user
    var myplayers = _.filter(auctionList, a => a.gid === igroup && a.uid === userPid); 
    //console.log(myplayers);
    //console.log("Just shown my players")
    //var playerScoreList = [];
    myplayers.forEach( p => {
      var MF = 1;
      if (p.pid === capinfo.viceCaptain)
        MF = ViceCaptain_MultiplyingFactor;
      else if (p.pid === capinfo.captain)
        MF = Captain_MultiplyingFactor;
      //console.log(`Mul factor: ${MF}`);

      // now get the statistics of this player in various maches
      var myplayerstats = _.filter(statList, x => x.pid === p.pid);
      //console.log(myplayerstats)

      // update score of each match played by user
      // myplayerstats.forEach(s => {
      //   s.score = calculateScore(s)*MF;
      // })
      //var myScore = _.sumBy(myplayerstats, x => x.score);
      var myScore = _.sumBy(myplayerstats, x => x.score)*MF;
      var tmp = { uid: userPid, pid: p.pid, playerScrore: myScore, stat: myplayerstats};
      //console.log(tmp);
      userScoreList.push(tmp);
    });
  })
  //console.log(userScoreList);
  sendok(res, userScoreList);
});


router.use('/maxrun/:myGroup/:myuser', async function(req, res, next) {
  // PlayerStatRes = res;
  setHeader(res);

  var {myGroup , myuser} = req.params;

  var groupRec = await IPLGroup.findOne({gid: myGroup});
  if (!groupRec) { senderr(res, 722, `Invalid group ${myGroup}`); return;  }

  var iuser;
  if (myuser.toUpperCase() === "ALL")
    iuser = 0;
  else {
    if (isNaN(myuser)) {
      senderr(res, 721, `Invalid user id ${myuser}`);
      return;      
    }
    iuser = parseInt(myuser);
  }
  var myData = await statMax(groupRec.gid, iuser, doMaxRun, SENDRES);
  sendok(res, myData);
});

router.use('/maxwicket/:myGroup/:myuser', async function(req, res, next) {
  // PlayerStatRes = res;
  setHeader(res);

  var {myGroup, myuser} = req.params;

  var groupRec = await IPLGroup.findOne({gid: myGroup});
  if (!groupRec) { senderr(res, 722, `Invalid group ${myGroup}`); return;  }

  var iuser;
  if (myuser.toUpperCase() === "ALL")
    iuser = 0;
  else {
    if (isNaN(myuser)) {
      senderr(res, 721, `Invalid user id ${myuser}`);
      return;      
    }
    iuser = parseInt(myuser);
  }
  var myData = await statMax(groupRec.gid, iuser, doMaxWicket, SENDRES);
  sendMatchInfoToClient(myData);
});


router.use('/brief/:myGroup/:myuser', async function(req, res, next) {
  // PlayerStatRes = res;
  setHeader(res);

  var {myGroup, myuser} = req.params;
  var iuser;

  groupRec = await IPLGroup.findOne({gid: myGroup});
  if (!groupRec) { senderr(res, 722, `Invalid user id ${myGroup}`); return;  }

  if (myuser.toUpperCase() === "ALL")
    iuser = 0;
  else {
    if (isNaN(myuser)) {
      senderr(res, 721, `Invalid user id ${myuser}`);
      return;      
    }
    iuser = parseInt(myuser);
  }
  var myData = await statBrief(groupRec.gid, iuser, SENDRES);
  sendok(res, myData);

});


router.use('/score/:myuser', function(req, res, next) {
  // PlayerStatRes = res;
  setHeader(res);
  var {myuser} = req.params;
  var iuser;
  if (myuser.toUpperCase() === "ALL")
    iuser = 0;
  else {
    if (isNaN(myuser)) {
      senderr(res, 721, `Invalid user id ${myuser}`);
      return;      
    }
    iuser = parseInt(myuser);
  }
  statScore(iuser);
});

router.use('/rank/:myGroup/:myuser', async function(req, res, next) {
  // PlayerStatRes = res;
  setHeader(res);
  var {myGroup,myuser} = req.params;
  var iuser;

  var groupRec = await IPLGroup.findOne({gid: myGroup});
  if (!groupRec) { senderr(res, 722, `Invalid group ${myGroup}`); return; }

  if (myuser.toUpperCase() === "ALL")
    iuser = 0;
  else {
    if (isNaN(myuser)) {
      senderr(res, 721, `Invalid user id ${myuser}`);
      return;      
    }
    iuser = parseInt(myuser);
  }
  var myData = 
  sendok(res, statRank(groupRec.gid, iuser, SENDRES));
});

router.use('/updatemax/:tournamentName', async function(req, res, next) {
  // PlayerStatRes = res;
  setHeader(res);
  var {tournamentName} = req.params;
  // first check if tournament is over (END has been signalled)
  var myTournament = await Tournament.findOne({name: tournamentName});
  if (!myTournament) { senderr(res, 723,"Invalid tournament"); return;}
  if (!myTournament.over) {
    senderr(res, 723, "Tournament not yet over. Cannot assign Bonus point for Tournament Max Run and Wicket");
    return;
  }

  var tournamentStat = mongoose.model(tournamentName, StatSchema);
  let BriefStat = mongoose.model(tournamentName+BRIEFSUFFIX, BriefStatSchema);

  var tdata = await tournamentStat.find({});
  var tmp = _.filter(tdata, x => x.mid == MaxRunMid);
  if (tmp.length > 0) {
    senderr(res, 724, "Bonus point for Maximum run already assigned");
    return;
  }
  var tmp = _.filter(tdata, x => x.mid == MaxWicketMid);
  if (tmp.length > 0) {
    senderr(res, 724, "Bonus point for Maximum wicket already assigned");
    return;
  }

  pidList = _.map(tdata, 'pid');
  pidList = _.uniqBy(pidList);

  // calculate total runs and total wockets of each player (played in tournament matches)
  var sumList = [];
  pidList.forEach( mypid => {
    tmp = _.filter(tdata, x => x.pid === mypid);
    if (tmp.length > 0) {
      var iRun = _.sumBy(tmp, 'run');
      var iWicket = _.sumBy(tmp, 'wicket');
      sumList.push({pid: mypid, playerName: tmp[0].playerName, totalRun: iRun, totalWicket: iWicket});
    }
  });

  // now get list of players who have score max runs (note there can be more than 1)
  var tmp = _.maxBy(sumList, x => x.totalRun);
  //console.log(tmp);
  var maxList = _.filter(sumList, x => x.totalRun == tmp.totalRun);
  var bonusAmount  = BonusMaxRun[myTournament,type] / maxList.length;
  maxList.forEach( mmm => {
    var myrec = getBlankStatRecord(tournamentStat);
    myrec.mid = MaxRunMid;
    myrec.pid = mmm.pid;
    myrec.playerName = mmm.playerName;
    myrec.score = bonusAmount;
    myrec.maxTouramentRun = mmm.totalRun;  
    myrec.save(); 

    var mybrief = getBlankBriefRecord(BriefStat);
    mybrief.sid = MaxRunMid;
    mybrief.pid = mmm.pid;
    mybrief.playerName = mmm.playerName;
    mybrief.score = bonusAmount;
    mybrief.maxTouramentRun = mmm.totalRun;  
    mybrief.save(); 

  });

  // getBlankBriefRecord
  // now get list of players who have taken max wickets (note there can be more than 1)
  var tmp = _.maxBy(sumList, x => x.totalWicket);
  //console.log(tmp);
  var maxList = _.filter(sumList, x => x.totalWicket == tmp.totalWicket);
  bonusAmount  = BonusMaxWicket[myTournament,type] / maxList.length;
  maxList.forEach( mmm => {
    var myrec = getBlankStatRecord(tournamentStat);
    myrec.mid = MaxWicketMid;
    myrec.pid = mmm.pid;
    myrec.playerName = mmm.playerName;
    myrec.score = bonusAmount;
    myrec.maxTouramentWicket = mmm.totalWicket;
    myrec.save(); 

    var mybrief = getBlankBriefRecord(BriefStat);
    mybrief.sid = MaxWicketMid;
    mybrief.pid = mmm.pid;
    mybrief.playerName = mmm.playerName;
    mybrief.score = bonusAmount;
    mybrief.maxTouramentWicket = mmm.totalWicket;  
    mybrief.save(); 

  });
  
  sendok(res, "OK");
  // allocate bonus points to player with maximum run and maximum wicket
});

async function getTournameDetails(igroup) {
  var retVal = "";
  try {
    // g_groupRec = await IPLGroup.findOne({gid: igroup});
    g_groupRec = await akshuGetGroup(igroup);
    g_tournamentStat = mongoose.model(g_groupRec.tournament+BRIEFSUFFIX, BriefStatSchema);
    retVal = g_groupRec.tournament
  } catch (err) {
    g_tournamentStat = null;
    console.log(err);
  }
  return(retVal);
}

async function readDatabase(igroup) {
  // console.log("read started");
  let dataFound = false;
  try {
	  var PstatList = g_tournamentStat.find({});
	  dataFound = true;
  } catch (err) {
    // console.log("Stat read error");
    //return(false);
	  dataFound = false;
  }
  
  // var PauctionList = Auction.find({gid: igroup});
  // var Pgmembers = GroupMember.find({gid: igroup});
  // var Pallusers = User.find({});
  var Pcaptainlist = Captain.find({gid: igroup});

  g_captainlist = await Pcaptainlist;
  g_gmembers = await akshuGetGroupMembers(igroup);    //   Pgmembers;
  g_allusers = await akshuGetGroupUsers(igroup);      // Pallusers;
  g_statList = (dataFound) ? await PstatList : [];
  g_auctionList = await akshuGetAuction(igroup);  // PauctionList;         //await akshuGetAuction(igrou

  return  ( (g_captainlist) &&
           (g_gmembers) &&
           (g_allusers) && 
           (g_auctionList)) ? true : false;
           //(g_statList.length > 0))  ? true : false;
}

async function statBrief(igroup, iwhichuser, doWhatSend)
{
  // Set collection name 
  // var tournamentStat = mongoose.model(_tournament, StatSchema);
  // var igroup = _group;
  
  // get list of users in group
  /*
  var PgroupRec = IPLGroup.findOne({gid: igroup});
  var PauctionList = Auction.find({gid: igroup});
  var Pallusers = User.find({});
  var Pgmembers = GroupMember.find({gid: igroup});
  var Pcaptainlist = Captain.find({gid: igroup});

  // first read group record and start data fetch for tournament stats
  var groupRec = await PgroupRec;
  var tournamentStat = mongoose.model(groupRec.tournament, StatSchema);
  var PstatList = tournamentStat.find({});

  var captainlist = await Pcaptainlist;
  var gmembers = await Pgmembers;
  var allusers = await Pallusers;
  var auctionList = await PauctionList;
  var statList = await PstatList;
*/

  // var groupRec = g_groupRec
  // var captainlist = g_captainlist;
  // var gmembers = g_gmembers;
  // var allusers = g_allusers;
  // var auctionList = g_auctionList;
  // var statList = g_statList;
  let tType = await getTournamentType(igroup);
  //console.log(tType);

  var userScoreList = [];    
  // now calculate score for each user
  g_gmembers.forEach( gm  => {
    var userPid = gm.uid;
    var urec = _.find(g_allusers, x => x.uid == userPid);
    // find out captain and vice captain selected by user
    var capinfo = _.find(g_captainlist, x => x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: igroup, uid: userPid, captain: 0, viceCaptain: 0});

    // find out players of this user
    var myplayers = _.filter(g_auctionList, a => a.uid === userPid); 
    var playerScoreList = [];
    myplayers.forEach( p => {
      var MF = 1;
      var nameSufffix = "";
      if (p.pid === capinfo.viceCaptain) {
        MF = ViceCaptain_MultiplyingFactor;
        nameSufffix = " (VC)";
      } else if (p.pid === capinfo.captain) {
        MF = Captain_MultiplyingFactor;
        nameSufffix = " (C)";
      }

      // now get the statistics of this player in various maches
      var myplayerstats = _.filter(g_statList, x => x.pid === p.pid);
      //console.log(myplayerstats);
      // var myScore = _.sumBy(myplayerstats, x => x.score)*MF;
      var myScore1 = _.sumBy(myplayerstats, x => x.score);
      var myScore2 = _.sumBy(myplayerstats, x => x.run)*BonusRun[tType]*(MF-1);
      var myScore3 = _.sumBy(myplayerstats, x => x.wicket)*BonusWkt[tType]*(MF-1);
      var myScore = myScore1 + myScore2 + myScore3;
      // var myplayerstats = _.map(myplayerstats, o => _.pick(o, ['mid', 'pid', 'score']));
      var myplayerstats = _.map(myplayerstats, o => _.pick(o, ['pid', 'score']));
      var tmp = { 
        // uid: userPid, 
        // userName: urec.userName,
        // displayName: urec.displayName,
        pid: p.pid, 
        playerName: p.playerName + nameSufffix,
        playerScore: myScore
        //matchStat: myplayerstats
      };
      playerScoreList.push(tmp);
      // playerScoreList.push(_.sortBy(tmp, x => x.playerScore).reverse());
    });
    playerScoreList = _.sortBy(playerScoreList, x => x.playerScore).reverse();
    var userScoreValue = _.sumBy(playerScoreList, x => x.playerScore);
    userScoreList.push({uid: userPid, 
      gid: igroup,
      userName: urec.userName, 
      displayName: gm.displayName,    //  urec.displayName, 
      userScore: userScoreValue,
      playerStat: playerScoreList});
  })
  if (iwhichuser != 0) {
    userScoreList = _.filter(userScoreList, x => x.uid == iwhichuser);
  }
  userScoreList = _.sortBy(userScoreList, x => x.userScore).reverse();
  //console.log(userScoreList);
  //console.log(userScoreList);
  // if (doWhatSend === SENDRES) {
  //   sendok(res, userScoreList); 
  // } else {
  //   const socket = app.get("socket");
  //   socket.emit("brief", userScoreList)
  //   socket.broadcast.emit('brief', userScoreList);    
  // //   console.log(userScoreList);
  // }
  return(userScoreList);
}


async function statScore(iwhichUser) {
  // get list of users in group
  var tournamentStat = mongoose.model(_tournament, StatSchema);
  var igroup = _group;

  var PstatList =  tournamentStat.find({});
  // var PauctionList =  Auction.find({gid: igroup});
  var Pallusers =  User.find({});
  // var Pgmembers =  GroupMember.find({gid: igroup});
  var Pcaptainlist =  Captain.find({gid: igroup});

  // wait for data fetch to be over
  captainlist = await Pcaptainlist;
  gmembers = await akshuGetGroupMembers(igroup);  //  Pgmembers;   //await akshuGetGroupMembers(igroup);      //   ;
  allusers = await Pallusers;
  auctionList = await akshuGetAuction(igroup);    //  PauctionList;
  statList = await PstatList;

  // now calculate score for each user
  var userScoreList = [];    
  gmembers.forEach( u  => {
    var userPid = u.uid;
    var urec = _.find(allusers, u => u.uid === userPid);
    var curruserName = urec.userName;
    var currdisplayName = urec.displayName;

    // find out captain and vice captain selected by user
    var capinfo = _.find(captainlist, x => x.gid == igroup && x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: igroup, uid: userPid, captain: 0, viceCaptain: 0});

    // find out players of this user
    var myplayers = _.filter(auctionList, a => a.gid === igroup && a.uid === userPid); 
    //console.log(myplayers);
    //console.log("Just shown my players")
    //var playerScoreList = [];
    myplayers.forEach( p => {
      var MF = 1;
      var nameSufffix = "";
      if (p.pid === capinfo.viceCaptain) {
        MF = ViceCaptain_MultiplyingFactor;
        nameSufffix = " (VC)"
      } else if (p.pid === capinfo.captain) {
        MF = Captain_MultiplyingFactor;
        nameSufffix = " (C)"
      }
      //console.log(`Mul factor: ${MF}`);

      // now get the statistics of this player in various maches
      var myplayerstats = _.filter(statList, x => x.pid === p.pid);
      //console.log(myplayerstats)

      // var myScore = _.sumBy(myplayerstats, x => x.score)*MF;
      // Only RUN & WICKET will be 2 times for caption and 1.5 time for Vice Captai
      var myScore1 = _.sumBy(myplayerstats, x => x.score);
      var myScore2 = _.sumBy(myplayerstats, x => x.run)*BonusRun*(MF-1);
      var myScore3 = _.sumBy(myplayerstats, x => x.wicket)*BonusWkt*(MF-1);
      var myScore = myScore1 + myScore2 + myScore3;
      var tmp = { 
        uid: userPid, 
        userName: curruserName,
        displayName: currdisplayName,
        pid: p.pid, 
        playerName: p.playerName + nameSufffix, 
        playerScore: myScore, 
        stat: myplayerstats};
      //console.log(tmp);
      userScoreList.push(tmp);
    });
  })
  if (iwhichUser != 0)
    userScoreList = _.filter(userScoreList, x => x.uid === iwhichUser);
  sendok(res, userScoreList);
}



async function statRank (igroup, iwhichUser, doSendWhat) {
  // find out users belnging to Group 1 (this is default). and set in igroup
  // Set collection name 
  // var igroup = _group;
  // make async mongose calls
  //const PgroupRec = IPLGroup.findOne({gid: igroup});
  const PauctionList = Auction.find({gid: igroup });
  const Pallusers = User.find({});
  const Pgmembers = GroupMember.find({gid: igroup});
  const Pcaptainlist = Captain.find({gid: igroup});

  groupRec = await akshuGetGroup(igroup);       //   PgroupRec;
  let myType = await getTournamentType(igroup);
  var tournamentStat = mongoose.model(groupRec.tournament, StatSchema);
  const PstatList = tournamentStat.find({});

  captainlist = await Pcaptainlist;
  gmembers = await Pgmembers;   //akshuGetGroupMembers(igroup);      //   Pgmembers;
  allusers = await Pallusers
  auctionList = await PauctionList;   //akshuGetAuction(igroup);      //  PauctionList
  statList = await PstatList;

  // now calculate score for each user
  var userRank = [];
  gmembers.forEach( gm => {
    userPid = gm.uid; 
    var urec = _.filter(allusers, u => u.uid === userPid);
    var curruserName = (urec) ? urec[0].userName : "";
    var currdisplayName = (urec) ? urec[0].displayName : "";
    // find out captain and vice captain selected by user
    var capinfo = _.find(captainlist, x => x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: igroup, uid: userPid, captain: 0, viceCaptain: 0});
    //console.log(capinfo);
    // find out players of this user
    var myplayers = _.filter(auctionList, a => a.uid === userPid); 
    //console.log(myplayers);
    //console.log("Just shown my players")
    //var playerScoreList = [];
    var userScoreList = [];    
    myplayers.forEach( p => {
      var MF = 1;
      //console.log(capinfo);
      if (p.pid === capinfo.viceCaptain) {
        //console.log(`Vice Captain is ${capinfo.viceCaptain}`)
        MF = ViceCaptain_MultiplyingFactor;
      } else if (p.pid === capinfo.captain) {
        //console.log(`Captain is ${capinfo.captain}`)
        MF = Captain_MultiplyingFactor;
      } else {
        //console.log(`None of the above: ${p.pid}`);
      }
      //console.log(`Mul factor: ${MF}`);

      // now get the statistics of this player in various maches
      var myplayerstats = _.filter(statList, x => x.pid === p.pid);
      // var myScore = _.sumBy(myplayerstats, x => x.score)*MF;
      var myScore1 = _.sumBy(myplayerstats, x => x.score);
      var myScore2 = _.sumBy(myplayerstats, x => x.run)*BonusRun[myType]*(MF-1);
      var myScore3 = _.sumBy(myplayerstats, x => x.wicket)*BonusWkt[myType]*(MF-1);
      var myScore = myScore1 + myScore2 + myScore3;
      //console.log(`Player: ${p.pid}   Score: ${myScore}  MF used: ${MF}`);
      userScoreList.push({ uid: userPid, pid: p.pid, playerName: p.name, playerScore: myScore});
    });
    var totscore = _.sumBy(userScoreList, x => x.playerScore);
	console.log(`Grand Score: ${totscore}`);
    //if (userPid === 9) totscore = 873;  // for testing
    // do not assign rank. Just now. Will be assigned when info of all user grad score is available
    userRank.push({ 
      uid: userPid, 
      gid: igroup,
      userName: curruserName, 
      displayName: currdisplayName,
      grandScore: totscore, 
	  prize: gm.prize,
      rank: 0});
  })
  userRank = _.sortBy(userRank, 'grandScore').reverse();

  // assign ranking
  var nextRank = 0;
  var lastScore = 99999999999999999999999999999;  // OMG such a big number!!!! Can any player score this many points
  userRank.forEach( x => {
    if (x.grandScore < lastScore)
      ++nextRank;
    x.rank = nextRank;
    lastScore = x.grandScore;
  });

  if (iwhichUser != 0)
    userRank = _.filter(userRank, x => x.uid == iwhichUser);

  // console.log(userRank);
  // if (doSendWhat === SENDRES) {
  //   sendok(res, userRank);
  // } else {
  //   const socket = app.get("socket");
  //   socket.emit("rank", userRank)
  //   socket.broadcast.emit('rank', userRank);
  //   // console.log(userRank);
  // }
  //console.log(userRank);
  return(userRank);
}


async function statMax(igroup, iwhichuser, doWhat, sendToWhom)
{
  // var igroup = _group;
  // get list of users in group
  //var PgroupRec = IPLGroup.findOne({gid: igroup});
  var PauctionList = Auction.find({gid: igroup});
  var Pallusers = User.find({});
  var Pgmembers = GroupMember.find({gid: igroup}); 
  var Pcaptainlist = Captain.find({gid: igroup});
  
  groupRec = await akshuGetGroup(igroup);     //  PgroupRec;
  console.log(groupRec);
  var tournamentStat = await mongoose.model(groupRec.tournament, StatSchema);
  var PstatList = tournamentStat.find({});
 
  var captainlist = await Pcaptainlist;
  var gmembers = await akshuGetGroupMembers(igroup);  //akshuGetGroupMembers(igroup);    //  Pgmembers;
  var allusers= await Pallusers;
  var auctionList = await akshuGetAuction(igroup);   //akshuGetAuction(igroup);      // PauctionList;
  var statList = await PstatList;

  // get all players auctioned by this group 
  //var allplayerList = _.map(auctionList, 'pid');
  // now calculate score for each user
  var userScoreList = [];    
  gmembers.forEach( gm  => {
    userPid = gm.uid;

    // find out captain and vice captain selected by user
    var capinfo = _.find(captainlist, x => x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: igroup, uid: userPid, captain: 0, viceCaptain: 0});
  
    var urec = _.find(allusers, x => x.uid == userPid);
    // find out players of this user
    var myplayers = _.filter(auctionList, a => a.uid == userPid); 
    myplayers.forEach( p => {
      var MF = 1;
      if (p.pid === capinfo.viceCaptain)
        MF = ViceCaptain_MultiplyingFactor;
      else if (p.pid === capinfo.captain)
        MF = Captain_MultiplyingFactor;

      // now get the statistics of this player in various maches
      var myplayerstats = _.filter(statList, x => x.pid === p.pid);
      var myScore = _.sumBy(myplayerstats, x => x.score)*MF;
      var totRun = _.sumBy(myplayerstats, x => x.run);
      var totWicket = _.sumBy(myplayerstats, x => x.wicket);
      var tmp = { 
        uid: userPid, 
        gid: igroup,
        userName: urec.userName,
        displayName: urec.displayName,
        pid: p.pid, 
        playerName: p.playerName,
        playerScrore: myScore, 
        totalRun: totRun,
        totalWicket: totWicket
      };
      //console.log(tmp);
      userScoreList.push(tmp);
    });
  })

  if (iwhichuser != 0)
    userScoreList = _.filter(userScoreList, x => x.uid == iwhichuser);

  var maxarray = [];
  gmembers.forEach( gm => {
    var tmp = _.filter(userScoreList, x => x.uid == gm.uid);
    //if (tmp.length == 0) return

    var tmpRun = _.maxBy(tmp, x => x.totalRun);
    var tmpWicket = _.maxBy(tmp, x => x.totalWicket);
    //console.log(tmpRun);
    if ((doWhat === doMaxRun)) { // && (tmpRun.totalRun > 0)) {
      //console.log("In total run");
      if (tmpRun.totalRun === 0) {
        maxarray.push({ uid: gm.uid, gid: igroup, userName: "", displayName: "",
        maxRunPlayerId: 0,  maxRunPlayerName: "", maxRun: 0});
      } else {
        var maxRun = _.filter(tmp, x => x.totalRun == tmpRun.totalRun );
        maxRun.forEach( runrec => {
          maxarray.push({ 
            uid: gm.uid, 
            gid: igroup,
            userName: runrec.userName,
            displayName: runrec.displayName,
            maxRunPlayerId: runrec.pid,
            maxRunPlayerName: runrec.playerName,
            maxRun: runrec.totalRun,
          });
        });
      }
    } else if ((doWhat === doMaxWicket)) {  //&& (tmpWicket.totalWicket > 0)) {
      //console.log(`in else  ${tmpWicket.totalWicket}`);
      if (tmpWicket.totalWicket === 0) {
        maxarray.push({ uid: gm.uid, gid: igroup, userName: "", displayName: "", maxWicketPlayerId: 0,
        maxWicketPlayerName: "", maxWicket: 0});
      } else {
        var maxWicket = _.filter(tmp, x => x.totalWicket === tmpWicket.totalWicket );
        maxWicket.forEach( wktrec => {
          maxarray.push({ 
            uid: gm.uid, 
            gid: igroup,
            userName: wktrec.userName,
            displayName: wktrec.displayName,
            maxWicketPlayerId: wktrec.pid,
            maxWicketPlayerName: wktrec.playerName,
            maxWicket: wktrec.totalWicket
          });
        });
      }
    }
  });
  //console.log(maxarray);
  // if (sendToWhom === SENDRES)  {
  //   sendok(res, maxarray);
  // } else {
  //   const socket = app.get("socket");
  //   if (doWhat === doMaxRun) {
  //     socket.emit("maxRun", maxarray)
  //     socket.broadcast.emit('maxRun', maxarray);
  //   } else {
  //     socket.emit("maxWicket", maxarray)
  //     socket.broadcast.emit('maxWicket', maxarray);
  //   }
  //   // console.log(maxarray);
  // }
  return(maxarray)
}


async function statCalculation (igroup) {
  let myType = await getTournamentType(igroup);
  var calStart = new Date();
  //console.log(`in STAT------------------------------------------------`);
  /*
  const groupRec = await IPLGroup.findOne({gid: igroup});
  var tournamentStat = mongoose.model(groupRec.tournament, StatSchema);
  const PstatList = tournamentStat.find({});
  const Pgmembers = GroupMember.find({gid: igroup});
  const PauctionList = Auction.find({gid: igroup });
  const Pallusers = User.find({});
  const Pcaptainlist = Captain.find({gid: igroup});

  var beforeAwait = new Date();
  gmembers = await Pgmembers;
  allusers = await Pallusers
  auctionList = await PauctionList
  captainlist = await Pcaptainlist;
  var beforeStat = new Date();
  statList = await PstatList;
*/

  var dataRead = new Date();
  // now calculate score for each user
  var userRank = [];
	var userMaxRunList = [];
	var userMaxWicketList = [];

  //console.log("GM start");
  g_gmembers.forEach( gm => {
    userPid = gm.uid; 
	//console.log("prize: ", gm.prize);
    var urec = _.filter(g_allusers, u => u.uid === userPid);
	//console.log(`${urec[0].userName}`);
    var myplayers = _.filter(g_auctionList, a => a.uid === userPid); 
	// user name and dislay name from User record
    var curruserName = (urec.length > 0) ? urec[0].userName : "";
    // var currdisplayName = (urec) ? urec[0].displayName : "";

    // find out captain and vice captain selected by user
    var capinfo = _.find(g_captainlist, x => x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: igroup, uid: userPid, captain: 0, viceCaptain: 0});

    //console.log(capinfo);
    // find out players of this user
    //console.log(myplayers);
    //console.log("Just shown my players")
    //var playerScoreList = [];

    var userScoreList = []; 
	var userMaxList = [];
	
    myplayers.forEach( p => {
	  //console.log(`Now calculating for ${p.playerName}`);
      var MF = 1;
      //console.log(capinfo);
      if (p.pid === capinfo.viceCaptain) {
        //console.log(`Vice Captain is ${capinfo.viceCaptain}`)
        MF = ViceCaptain_MultiplyingFactor;
      } else if (p.pid === capinfo.captain) {
        //console.log(`Captain is ${capinfo.captain}`)
        MF = Captain_MultiplyingFactor;
      } else {
        //console.log(`None of the above: ${p.pid}`);
		    MF = 1;
      }
      //console.log(`Mul factor: ${MF}`);
	  //console.log("Player stat");
	  
      // now get the statistics of this player in various maches
      var myplayerstats = _.filter(g_statList, x => x.pid === p.pid);
      var myScore1 = _.sumBy(myplayerstats, x => x.score);
      var myRunsBonus = _.sumBy(myplayerstats, x => x.run)*BonusRun[myType]*(MF-1);
      var myWicketsBonus = _.sumBy(myplayerstats, x => x.wicket)*BonusWkt[myType]*(MF-1);
      var myScore = myScore1 + myRunsBonus + myWicketsBonus;
	  //console.log(`${myType} ${myScore1}  ${BonusRun[myType]} ${myWicketsBonus}`);
      userScoreList.push({ uid: userPid, pid: p.pid, playerName: p.name, playerScore: myScore});
	  
	  // now find out max of each player
	  var totRun = _.sumBy(myplayerstats, x => x.run);
      var totWicket = _.sumBy(myplayerstats, x => x.wicket);
      var tmp = { 
        gid: igroup,
        uid: userPid, 
        userName: urec[0].displayName,   //  urec.userName,
        displayName: gm.displayName,     //urec.displayName,
        pid: p.pid, 
        playerName: p.playerName,
        playerScrore: myScore, 
        totalRun: totRun,
        totalWicket: totWicket
      };
      userMaxList.push(tmp);
    });
    //console.log(`Max list ${userMaxList.length}`);

	// calculation of player belonging to user is done.
	// Now do total score, run and wicket
    var totscore = _.sumBy(userScoreList, x => x.playerScore);
    userRank.push({ 
      uid: userPid, 
      gid: igroup,
      userName: urec[0].displayName,   //  curruserName, `
      displayName: gm.displayName,    //  currdisplayName,
      grandScore: totscore, 
	  prize: gm.prize,
      rank: 0});

  var tmpRun = _.maxBy(userMaxList, x => x.totalRun);

  let dataAvailable = false;
  if (tmpRun)
  if (tmpRun.totalRun > 0)
      dataAvailable = true;

  if (!dataAvailable) {
		userMaxRunList.push({ uid: gm.uid, gid: igroup, userName: "", displayName: "",
		maxRunPlayerId: 0,  maxRunPlayerName: "", maxRun: 0});
  } else {
		var maxRun = _.filter(userMaxList, x => x.totalRun == tmpRun.totalRun );
		maxRun.forEach( runrec => {
		  userMaxRunList.push({ 
			uid: gm.uid, 
			gid: igroup,
			userName: runrec.userName,
			displayName: runrec.displayName,
			maxRunPlayerId: runrec.pid,
			maxRunPlayerName: runrec.playerName,
			maxRun: runrec.totalRun,
		  });
		});
  }

  var tmpWicket = _.maxBy(userMaxList, x => x.totalWicket);
  dataAvailable = false
  if (tmpWicket)
  if (tmpWicket.totalWicket > 0)
      dataAvailable = true;

  if (!dataAvailable) {
      userMaxWicketList.push({ uid: gm.uid, gid: igroup, userName: "", displayName: "", maxWicketPlayerId: 0,
      maxWicketPlayerName: "", maxWicket: 0});
  } else {
    var maxWicket = _.filter(userMaxList, x => x.totalWicket === tmpWicket.totalWicket );
    maxWicket.forEach( wktrec => {
      userMaxWicketList.push({ 
        uid: gm.uid, 
        gid: igroup,
        userName: wktrec.userName,
        displayName: wktrec.displayName,
        maxWicketPlayerId: wktrec.pid,
        maxWicketPlayerName: wktrec.playerName,
        maxWicket: wktrec.totalWicket
      });
    });
  }
});
  //console.log("GM end");

  // assign ranking. Sort by score. Highest first
  userRank = _.sortBy(userRank, 'grandScore').reverse();
  var nextRank = 0;
  var lastScore = 99999999999999999999999999999;  // OMG such a big number!!!! Can any player score this many points
  userRank.forEach( x => {
    if (x.grandScore < lastScore)
      ++nextRank;
    x.rank = nextRank;
    lastScore = x.grandScore;
  });

  calcEnd = new Date();

  //var totDur = calcEnd.getTime() - calStart.getTime();
  // var duration2 = beforeStat.getTime() - beforeAwait.getTime();
  // var duration3 = dataRead.getTime() - beforeStat.getTime();
  // var duration4 = calcEnd.getTime() - dataRead.getTime();w
  // var totDur = calcEnd.getTime() - calStart.getTime();

  // console.log(`Start calc: ${calStart}`);
  // console.log(`Beforeawai: ${beforeAwait} Duration: ${duration1}`);
  // console.log(`BeforeStat: ${beforeStat}  Duration: ${duration2}`);
  // console.log(`Read over : ${dataRead}  Duration: ${duration3}`);
  // console.log(`End   calc: ${calcEnd}  Duration: ${duration4}`);
  //console.log(`Total Time: ${totDur}`) 

  //console.log(userRank);
  return({rank: userRank, maxRun: userMaxRunList, maxWicket: userMaxWicketList});
}

// update list of matches that are running currently
// func 1 ==> add match in the list when match running
// func 2 ==> del match from the list once match is over
// this list is used by schedule to do calc

async function addRunningMatch(mmm) {
  // console.log(`Adding match ${mmm.mid}`);
  let tmp = _.filter(runningMatchArray, x => x.mid === mmm.mid);
  if (tmp.length === 0) {
    runningMatchArray.push({tournament: mmm.tournament, mid: mmm.mid});
  }

  tmp = _.find(runningScoreArray, x => x.tournament === mmm.tournament);
  if (!tmp) {
    tmp = {
      tournament: mmm.tournament, mid: mmm.mid,
      team1: mmm.team1, team2: mmm.team2,
      bowl1: 0, bowl2: 0, bowl3: 0, bowl4: 0,
      title1: "", title2: "", title3: "", title4: ""
    };
    runningScoreArray.push(tmp)
  }
  tmp.mid = mmm.mid;
  tmp.team1 = mmm.team1;
  tmp.team2 = mmm.team2;
  tmp.bowl1 = 0;
  tmp.bowl2 = 0;
  tmp.bowl3 = 0;
  tmp.bowl4 = 0;
  tmp.title1 = "";
  tmp.title2 = "";
  tmp.title3 = "";
  tmp.title4 = "";
  // console.log(runningMatchArray);
  // console.log("Add over");
}

async function delRunningMatch(mmm) {
  _.remove(runningMatchArray, {mid: mmm.mid});
  _.remove(runningScoreArray, {tournament: mmm.tournament});
}

async function unoptimised_update_cricapi_data_r1(logToResponse)
{
    let myindex;

    // 1st if time is up then get match details from cricapi
    if (timeToFetchMatches()) {
      //console.log("time to fetch match details");
      var existingmatches = await CricapiMatch.find({});
        
      // now fetch fresh match details from cricapi
      var matchesFromCricapi = await fetchMatchesFromCricapi();
      if (matchesFromCricapi.matches == undefined) {
        //console.log(matchesFromCricapi);
        var errmsg = "Could not fetch Match details from CricAPI"
        if (logToResponse)  senderr(res, CRICFETCHERR, errmsg)
        else                console.log(errmsg);
        return; 
      }

      // get all tournamnet and their teams
      allTournament = await Tournament.find({over: false});
      var tournamentList = _.map(allTournament, 'name'); 
      var allTeams = await Team.find({tournament: {$in: tournamentList} });


      // process each match found in cricapy
      matchesFromCricapi.matches.forEach(x => {
        var myTeam1 = x['team-1'].toUpperCase();
        var myTeam2 = x['team-2'].toUpperCase();
        //console.log(`${myTeam1} ${myTeam2}`);
        if ((myTeam1 === "TBA") || (myTeam2 === "TBA")) return;

        var matchTournament = '';
        var mytype = x.type.toUpperCase();
		//if (x.unique_id == 1243388)	console.log(`${myTeam1}  ${myTeam2} ${mytype}`);
        // special case for IPL
        // if match type not specified, then
        if (mytype.length === 0) {
          let xxxtmp = _.find(IPLSPECIAL,  x => myTeam1.includes(x));
          if (xxxtmp) {
            xxxtmp = _.find(IPLSPECIAL,  x => myTeam2.includes(x));
            if (xxxtmp) { x.type = "T20";  mytype = "T20"; }
          }
        } else {
          if (mytype.includes("ODI")) {
            mytype = "ODI";
            x.type = mytype;
          } else if (mytype.includes("TEST")) {
            mytype = "TEST";
            x.type = mytype;
          } else if ((mytype.includes("20")) || (mytype.includes("TWENTY"))) {
            myType = "T20";
            x.type = mytype;
          } 
        }
        // console.log(`${myTeam1} ${myTeam2} Match type is ${mytype}`);
        // ipl special offer complete

        allTournament.forEach(t => {
          var typeHasMatched = false;
          switch (t.type) {
            case "TEST":
              if (mytype.includes("TEST"))
                typeHasMatched = true;
              break;
            case "ODI":
              if (mytype.includes("ODI"))
                typeHasMatched = true;
              break;
            case "T20":
              if (mytype.includes("20") || mytype.includes("TWENTY"))
                typeHasMatched = true;
              break;
          }
          if (!typeHasMatched) return;

          //console.log(`Two teams are ${myTeam1} and ${myTeam2}`);
          var myteams = _.filter(allTeams, tm => tm.tournament == t.name);
          //console.log(myteams);
          // find team 1  is part of this tournament
          var myindex = _.findIndex(myteams, (x) => { return x.name.toUpperCase() === myTeam1});
          //console.log(`My Index for team 1 is ${myindex}`)
          if (myindex < 0) return;

          // find team 2  is part of this tournament
          myindex = _.findIndex(myteams, (x) => { return x.name.toUpperCase() === myTeam2});
          //console.log(`My Index for team 2 is ${myindex}`)
          if (myindex < 0) return;

          // both the teams belong to this tournament. 
          //console.log(`Team: ${myTeam1} and ${myTeam2} are part of tournament ${t.name}`);
          matchTournament = t.name;
        });
        if (matchTournament.length === 0) return;
        // console.log(`Tournament: ${matchTournament} Match Team1: ${myTeam1}  Team2: ${myTeam2}`)

        var mymatch = _.find(existingmatches, m => m.mid == parseInt(x.unique_id));
        if (mymatch === undefined) mymatch = new CricapiMatch();
        // console.log(`dating match of ${x.unique_id}`)
        mymatch = getMatchDetails(x, mymatch, matchTournament, myType);
        // console.log(mymatch);
        mymatch.save();
      });
      // end of check if this match part of our tournament

      // set next fetch time
      updateMatchFetchTime(matchesFromCricapi.provider); 
    }
    else 
      console.log("Match details not to be fetched now");

    // match update job done. Now get all matches which have started before current time
    var currtime = new Date(); 
    let myfilter = { matchStartTime: {$lt: currtime }, matchEnded: false};
    //let myfilter = { matchEnded: false};
    var matchesFromDB = await CricapiMatch.find(myfilter);
    //console.log("My Matches");
    //console.log(matchesFromDB);
    // console.log(`Matches started count ${matchesFromDB.length}`)

    // get stas of all these matches
    // await matchesFromDB.forEach(async (mmm) => {
    let aidx
    for(aidx=0; aidx < matchesFromDB.length; ++aidx) {
      let mmm = matchesFromDB[aidx];
      addRunningMatch(mmm);
      await updateTournamentStarted(mmm.tournament);   
      const cricData = await fetchMatchStatsFromCricapi(mmm.mid);
      if (cricData != null)
      if (cricData.data != null) {
        var manofthematchPID = await updateMatchStats_r1(mmm, cricData.data);
        // match over if man of the match declared 
        // OR
        // current time > matchEndTime
        let thisMatchOver = false;
        if (manofthematchPID > 0) {
          thisMatchOver = true;
        } else if (mmm.matchEndTime < new Date()) {
          thisMatchOver = true;
        }
        // if pasrt end time. Then set matchended as true
        console.log(`Match Id: ${mmm.mid}  End: ${mmm.matchEndTime} Over sts: ${thisMatchOver} MOM: ${manofthematchPID}`);
        if (thisMatchOver) {
          mmm.matchEnded = true;
          mmm.save();
          delRunningMatch(mmm);
          let tOver = await checkTournamentOver(mmm.tournament);
          // update rank score in all group
          // await updateAllGroupRankScore(mmm.tournament);
        }     
      }
    }
    return;
}

function get_cricApiMatchType(myTeam1, myTeam2, circType) {
  let mytype = circType.toUpperCase();
  if (mytype.includes("TWENTY"))
    mytype = "T20";

  //if (x.unique_id == 1243388)	console.log(`${myTeam1}  ${myTeam2} ${mytype}`);
  // special case for IPL
  // if match type not specified, then
  if (mytype.length === 0) {
    let xxxtmp1 = _.find(IPLSPECIAL,  x => myTeam1.includes(x));
    let xxxtmp2 = _.find(IPLSPECIAL,  x => myTeam2.includes(x));
    if ((xxxtmp1) && (xxxtmp2))
      mytype = "T20";
    else 
      myType = "UNKNOWN";
  } else {
    if (mytype.includes("ODI")) {
      mytype = "ODI";
    } else if (mytype.includes("TEST")) {
      mytype = "TEST";
    } else if (mytype.includes("20")) {
      myType = "T20";
    } else {
      mytype = "UNKNOWN";
    }
  }
  // console.log(mytype);
  return mytype;
}

// modified on 7th April 2021
async function update_cricapi_data_r1(logToResponse)
{
    let myindex;

    // 1st if time is up then get match details from cricapi
    if (timeToFetchMatches()) {
      //console.log("time to fetch match details");
      // why required???????????????????????????????????????
      // var existingmatches = await CricapiMatch.find({});
        
      // now fetch fresh match details from cricapi
      var matchesFromCricapi = await fetchMatchesFromCricapi();
      if (matchesFromCricapi.matches === undefined) {
        var errmsg = "Could not fetch Match details from CricAPI"
        if (logToResponse)  senderr(res, CRICFETCHERR, errmsg)
        else                console.log(errmsg);
        return; 
      }
	  //console.log(matchesFromCricapi);

      // get all tournamnet and their teams
      var allTournament = await Tournament.find({enabled: true, over: false});
      var tournamentList = _.map(allTournament, 'name'); 
	  var allTeams = await Team.find({tournament: {$in: tournamentList} });
	  //console.log(allTeams);

      // process each match found in cricapy
      // matchesFromCricapi.matches.forEach(x => {
      let arunIdx = 0;
      for(arunIdx=0; arunIdx < matchesFromCricapi.matches.length; ++arunIdx) {
        let x = matchesFromCricapi.matches[arunIdx];
        let myTeam1 = x['team-1'].toUpperCase();
        let myTeam2 = x['team-2'].toUpperCase();
        x.type = get_cricApiMatchType(myTeam1, myTeam2, x.type);
        let mytype = x.type;
        //console.log(`${myTeam1} ${myTeam2}`);
		

        if (x.unique_id === '') continue;
        if ((myTeam1 === "TBA") || (myTeam2 === "TBA")) continue;
        if (x.type === "UNKNOWN") continue;

        let cricMatchId = parseInt(x.unique_id);
        //console.log(`Id: ${cricMatchId} ${myTeam1} ${myTeam2} Match type is ${mytype}`);

        //allTournament.forEach(t => {
        let ankitIdx = 0;
        let matchTournament = '';
		//console.log(allTeams.length);
        for(ankitIdx=0; ankitIdx < allTournament.length; ++ankitIdx) {
          t = allTournament[ankitIdx];
		  //console.log(t); 
          if (t.type !== mytype) continue;
          //console.log(`${t.name} Two teams are ${myTeam1} and ${myTeam2}`);

          var myteams = _.filter(allTeams, tm => tm.tournament === t.name); 
		  //if (myteams.length > 0) console.log("Team details", myteams);

          // find team 1  is part of this tournament
          myindex = _.findIndex(myteams, (x) => { return x.name === myTeam1});
          //console.log(`My Index for team 1 is ${myindex}`)
          if (myindex < 0) continue;

          // find team 2  is part of this tournament
          myindex = _.findIndex(myteams, (x) => { return x.name === myTeam2});
          //console.log(`My Index for team 2 is ${myindex}`)
          if (myindex < 0) continue;

          // both the teams belong to this tournament. 
          //console.log(`Team: ${myTeam1} and ${myTeam2} are part of tournament ${t.name}`);
          matchTournament = t.name;
		  break;
		  //console.log("here", matchTournament);
		  //break;
          // how to break. Not sure
        };    
		//if (matchTournament.length > 0) console.log(matchTournament);
        if (matchTournament === '') continue;
        //console.log(`Tournament: ${matchTournament} Match Team1: ${myTeam1}  Team2: ${myTeam2}`)

        // var m/ymatch = _.find(existingmatches, m => m.mid == );
        let mymatch = await CricapiMatch.findOne({mid: cricMatchId});
		//console.log(mymatch, cricMatchId);
        if (!mymatch) {
          mymatch = new CricapiMatch();
          // console.log(`dating match of ${x.unique_id}`)
          mymatch = getMatchDetails(x, mymatch, matchTournament, mytype);
        // console.log(mymatch);
          mymatch.save();
        }
      };
      // end of check if this match part of our tournament

      // set next fetch time
      updateMatchFetchTime(matchesFromCricapi.provider); 
    }
    // else 
    //   console.log("Match details not to be fetched now");

    // match update job done. Now get all matches which have started before current time
    var currtime = new Date(); 
    let myfilter = { matchStartTime: {$lt: currtime }, matchEnded: false};
    var matchesFromDB = await CricapiMatch.find(myfilter);

    // get stas of all these matches
    let aidx
    for(aidx=0; aidx < matchesFromDB.length; ++aidx) {
      let mmm = matchesFromDB[aidx];
    
      addRunningMatch(mmm);
      // const liveScore= await fetchMatchScoreFromCricapi(mmm.mid);
      // score[mmm.tournament]=liveScore.description;
      await updateTournamentStarted(mmm.tournament);   
      const cricData = await fetchMatchStatsFromCricapi(mmm.mid);
      if (cricData != null)
      if (cricData.data != null) {
        var manofthematchPID = await updateMatchStats_r1(mmm, cricData.data);
        // match over if man of the match declared 
        // OR
        // current time > matchEndTime
        let thisMatchOver = false;
        if (manofthematchPID > 0) {
          thisMatchOver = true;
        } else if (mmm.matchEndTime < new Date()) {
          thisMatchOver = true;
        }
        // if past end time. Then set matchended as true
        console.log(`Match Id: ${mmm.mid}  End: ${mmm.matchEndTime} Over sts: ${thisMatchOver} MOM: ${manofthematchPID}`);
        if (thisMatchOver) {
          mmm.matchEnded = true;
          await mmm.save();
          delRunningMatch(mmm);
          // if touramnet over
          // updare tournament
          // update scrore and rank for all groups
          // award prize as per rank for all group 
          await checkTournamentOver(mmm.tournament);
        }     
      }
    }
    return;
}

// check if all matches complete. If yes then set tournament over
checkTournamentOver = async function (tournamentName) {
  // await update brief of this tournament
  await updatePendingBrief(tournamentName);

  let tRec = await Tournament.findOne({name: tournamentName});
  if (tRec.over) return true;
   
  console.log("To be updated");
  let matchesNotOver = await CricapiMatch.find({tournament: tournamentName, matchEnded: false});
  
    // if no uncomplete match then declare tournament as over
  if (matchesNotOver.length === 0) {    
    // declare tournament as over
    // await updateTournamentOver(tournamentName);
    // add min and max run of the tournamenet and assign points to user
    await updateTournamentMaxRunWicket(tournamentName);
    // update group with rank / score. Also allocate prize money
    await updateAllGroupRankScore(tournamentName);
    await awardRankPrize(tournamentName);

    tRec.over = true;
    await tRec.save();
  }
  return tRec.over;
}

async function updateGroupRankScore(groupRec) {
  await getTournameDetails(groupRec.gid);
  let sts = await readDatabase(groupRec.gid );
  let myDB_Data = await statCalculation(groupRec.gid );
  // let mySTAT_Data = await statBrief(connectionArray[i].gid , 0 , SENDSOCKET);

  // uid: userPid, 
  // gid: igroup,
  // userName: urec[0].displayName,   //  curruserName, 
  // displayName: gm.displayName,    //  currdisplayName,
  // grandScore: totscore, 
  // rank: 0});
  // myDB_Data.rank.forEach(rec => {
  for (const rec of myDB_Data.rank) {
    let gmRec = await GroupMember.findOne({gid: rec.gid, uid: rec.uid});
    gmRec.rank = rec.rank;
    gmRec.score = rec.grandScore;
    await gmRec.save();
  };
}


async function updateAllGroupRankScore(tournamentName)  {
  let allGroups = await IPLGroup.find({tournament: tournamentName, enable: true});
  // allGroups.forEach(g => {
  for (const g of allGroups) {
    await updateGroupRankScore(g);
  };
}

function orgaddBowling(prevOver, currOver) {
  let xxx = currOver.split(".");
  let currFullOver = parseInt(xxx[0]);
  let currPartOver = (xxx.length > 1) ? parseInt(xxx[1]) : 0;
  let prevFullOver = Math.trunc(prevOver / 10);
  let prevPartOver = prevOver % 10;
  let newFullover = currFullOver + prevFullOver;
  let newPartover = currPartOver + prevPartOver;
  newFullover += Math.trunc(newPartover / 6)
  newPartover = newPartover % 6;
  let tmp = newFullover*10 + newPartover
  //console.log(prevOver, currOver, newFullover, newPartover)
  return tmp;
}

function addBowling(prevOver, currOver) {
  let xxx = currOver.split(".");
  let currFullOver = parseInt(xxx[0]);
  let currPartOver = (xxx.length > 1) ? parseInt(xxx[1]) : 0;
  prevOver.overs += currFullOver;
  prevOver.balls += currPartOver;
  if (prevOver.balls >= 6) {
    ++prevOver.overs;
    prevOver.balls -= 6;
  }
  return prevOver;
}

function getTitle(mmm, cricTitle) {
  // console.log(cricTitle, mmm.team1, mmm.team2);
  let newTitle = "";
  cricTitle = cricTitle.toUpperCase();
  if (cricTitle.includes(mmm.team1))
    newTitle = mmm.team1;
  else if (cricTitle.includes(mmm.team2))
    newTitle = mmm.team2;

  // console.log(newTitle);
  return newTitle;
}

async function updateMatchStats_r1(mmm, cricdata)
{
  let briefIndex = -1;
  var currMatch = mmm.mid;
  let myType = mmm.type.toUpperCase();
  if (myType.includes("ODI")) 
    myType = "ODI";
  else if (myType.includes("TEST"))
    myType = "TEST";
  else 
  myType = "T20";

  var manOfTheMatchPid = 0;  
  console.log(`Match: ${currMatch} data update. Tournamen; ${mmm.tournament}`)  
  // from tournament name identify the name
  var tournamentStat = mongoose.model(mmm.tournament, StatSchema);
  var briefStat = mongoose.model(mmm.tournament+BRIEFSUFFIX, BriefStatSchema);
  
  var bowlingArray;
  if (!(cricdata.bowling === undefined))
    bowlingArray = cricdata.bowling;
  else
    bowlingArray = [];

  var battingArray;
  if (!(cricdata.batting === undefined))
    battingArray = cricdata.batting;
  else
    battingArray = [];
  // console.log(battingArray);

  var fieldingArray;
  if (!(cricdata.fielding === undefined))
    fieldingArray = cricdata.fielding;
  else
    fieldingArray = [];

  if (cricdata["man-of-the-match"] != undefined) 
  if (cricdata["man-of-the-match"].pid != undefined)
  if (cricdata["man-of-the-match"].pid.length > 0)
    manOfTheMatchPid = parseInt(cricdata["man-of-the-match"].pid);
  // console.log(`Man of the match is ${manOfTheMatchPid} as per cric api ${cricdata["man-of-the-match"]}`)
  // console.log(cricdata["man-of-the-match"].pid)

  var allplayerstats = await tournamentStat.find({mid: mmm.mid});
  var allbriefstats = await briefStat.find({sid: mmm.mid});
  let myInning = 1;
  // console.log(allplayerstats);
  // console.log(allbriefstats.length);
  // update bowling details
  //console.log("Bowlong Started");
  // console.log(bowlingArray); 

  let allInningsBowling = [];
  let allInningsTitle = [];
  // let totalOvers = 0;
  let totalOvers;

  bowlingArray.forEach( x => {
    myInning = 1;
    if (myType === "TEST") {
      if (!x.title.toUpperCase().includes("1ST"))
        myInning  = 2;
    }

    totalOvers = {overs: 0, balls: 0};    // 6.4 overs will be stored as {overs: 6, balls: 4}
    x.scores.forEach (bowler => {
      // ***********************  IMP IMP IMP ***********************
      // some garbage records are sent by cricapi. Have found that in all these case Overs ("O") 
      // was set as "Allrounder", "bowler" "batsman".
      // ideally it should have #overs bowled i.e. numeric
      if (isNaN(bowler.O)) {
        //console.log(`Invalid Over ${bowler.O}. Skipping this recird`);
        return;
      }
      //console.log(`Bowling of ${bowler.pid}, ${myInning}`)
      myindex = _.findIndex(allplayerstats, {mid: currMatch, 
        pid: parseInt(bowler.pid), 
        inning: myInning});
      //console.log(myindex);
      if (myindex < 0) {
        var tmp = getBlankStatRecord(tournamentStat);
        tmp.mid = currMatch;
        tmp.pid = bowler.pid;
        tmp.playerName = bowler.bowler;
        tmp.inning = myInning;
        allplayerstats.push(tmp);
        myindex = allplayerstats.length - 1;
      }
      briefIndex = _.findIndex(allbriefstats, {sid: currMatch, 
        pid: parseInt(bowler.pid),
        inning: myInning});
      if (briefIndex < 0) {
        var tmp = getBlankBriefRecord(briefStat);
        // console.log(tmp);
        tmp.sid = currMatch;
        tmp.pid = bowler.pid;
        tmp.playerName = bowler.bowler;
        tmp.inning = myInning;
        // console.log(`length is ${allbriefstats.length}`);
        allbriefstats.push(tmp);
        briefIndex = allbriefstats.length - 1;
      }

      // if minimum overs bowled then
      // check for good or bad economy
      let myEconomy = 0;
      if ((bowler.Econ !== undefined) && (bowler.O !== undefined)) {
        totalOvers = addBowling(totalOvers, bowler.O)
        let myOvers = parseFloat(bowler.O);
        //console.log(`Overs bowled ${myOvers}  ${MinOvers[myType]}`);
        if (myOvers >= MinOvers[myType]) {
          let xecon = parseFloat(bowler.Econ);
          //console.log(`Econmoy bowled ${xecon}`);
          if (xecon <= EconomyGood[myType]) {
            myEconomy = 1;
          } 
          if (xecon >= EconomyBad[myType]) {
            myEconomy = -1;
          }
        }
      }
      //console.log(`Economyu valye ${myEconomy}`);

      allplayerstats[myindex].wicket = (bowler.W === undefined) ? 0 : bowler.W;
      allplayerstats[myindex].wicket5 = (bowler.W >= Wicket5[mmm.type]) ? 1 : 0;
      allplayerstats[myindex].wicket3 = ((bowler.W >= Wicket3[mmm.type]) && 
      (bowler.W < Wicket5[mmm.type])) ? 1 : 0;
      allplayerstats[myindex].hattrick = 0;
      allplayerstats[myindex].maiden = (bowler.M === undefined) ? 0 : bowler.M
      allplayerstats[myindex].maxTouramentRun = 0;
      allplayerstats[myindex].maxTouramentWicket = 0;
      allplayerstats[myindex].economy = myEconomy;

      allbriefstats[briefIndex].wicket = (bowler.W === undefined) ? 0 : bowler.W;
      allbriefstats[briefIndex].wicket5 = (bowler.W >= 5) ? 1 : 0;
      allbriefstats[briefIndex].wicket3 = ((bowler.W >= 3) && (bowler.W < 5)) ? 1 : 0;
      allbriefstats[briefIndex].hattrick = 0;
      allbriefstats[briefIndex].maiden = (bowler.M === undefined) ? 0 : bowler.M
      allbriefstats[briefIndex].maxTouramentRun = 0;
      allbriefstats[briefIndex].maxTouramentWicket = 0;
      allbriefstats[briefIndex].economy = myEconomy;

      // console.log(`Wicket by ${allplayerstats[myindex].pid} : ${allplayerstats[myindex].wicket}`)
      if (!(bowler.O === undefined)) {
        var i = parseInt(bowler.O);
        if (isNaN(i))
          allplayerstats[myindex].oversBowled = 0;
        else
          allplayerstats[myindex].oversBowled = bowler.O;
      }
      allbriefstats[briefIndex].oversBowled = allplayerstats[myindex].oversBowled

      if (allplayerstats[myindex].pid === manOfTheMatchPid) {
        allplayerstats[myindex].manOfTheMatch = true;
        allbriefstats[briefIndex].manOfTheMatch = 1;
      }

      var myscore = calculateScore(allplayerstats[myindex], myType);
      allplayerstats[myindex].score = myscore;
      allbriefstats[briefIndex].score = myscore;
    });
    allInningsBowling.push(totalOvers.overs + totalOvers.balls/10);
    allInningsTitle.push(getTitle(mmm, x.title));
  });

  // update batting details
  // console.log("Batting started");
  // console.log(battingArray);
  battingArray.forEach( x => {
    myInning = 1;
    if (myType === "TEST") {
      if (!x.title.toUpperCase().includes("1ST"))
        myInning  = 2;
    }
    x.scores.forEach(batsman => {
      // console.log(`batting of ${batsman.pid}`)
      myindex = _.findIndex(allplayerstats, {mid: currMatch, 
        pid: parseInt(batsman.pid),
        inning: myInning});
      //console.log(`Batting index ${myindex}`);
      if (myindex < 0) {
        var tmp = getBlankStatRecord(tournamentStat);
        tmp.mid = currMatch;
        tmp.pid = batsman.pid;
        tmp.playerName = batsman.batsman;
        tmp.inning = myInning;
        allplayerstats.push(tmp);
        myindex = allplayerstats.length - 1;
      }
      briefIndex = _.findIndex(allbriefstats, {sid: currMatch, 
        pid: parseInt(batsman.pid),
        inning: myInning
      });
      if (briefIndex < 0) {
        var tmp = getBlankBriefRecord(briefStat);
        tmp.sid = currMatch;
        tmp.pid = batsman.pid;
        tmp.playerName = batsman.batsman;
        tmp.inning = myInning;
        allbriefstats.push(tmp);
        briefIndex = allbriefstats.length - 1;
      }

      // check if out on 0. i.e Duck (i.e. played at least 1 ball)
      // Note player can be run out with out playing a single ball.
      // This is not to be considered as DUCK
      let isDuck = false;
      if ((batsman.R !== undefined) && 
      (batsman.B !== undefined) && 
      (batsman.dismissal !== undefined)) {
        if ((parseInt(batsman.R) === 0) && 
        (parseInt(batsman.B) > 0) &&
        (batsman.dismissal.replace(" ", "").toUpperCase() !== "NOTOUT")) {
            isDuck = true;    // player is out on 0
        }
      }

      allplayerstats[myindex].run = (batsman.R === undefined) ? 0 : batsman.R;
      allplayerstats[myindex].fifty = ((batsman.R >= 50) && (batsman.R < 100)) ? 1 : 0;
      allplayerstats[myindex].hundred = (batsman.R >= 100) ? 1 : 0;
      allplayerstats[myindex].four = (batsman["4s"] === undefined) ? 0 : batsman["4s"];
      allplayerstats[myindex].six = (batsman["6s"] === undefined) ? 0 : batsman["6s"];
      allplayerstats[myindex].maxTouramentRun = 0;
      allplayerstats[myindex].maxTouramentWicket = 0;
      allplayerstats[myindex].duck = (isDuck) ? 1 : 0;

      allbriefstats[briefIndex].run = (batsman.R === undefined) ? 0 : batsman.R;
      allbriefstats[briefIndex].fifty = ((batsman.R >= 50) && (batsman.R < 100)) ? 1 : 0;
      allbriefstats[briefIndex].hundred = (batsman.R >= 100) ? 1 : 0;
      allbriefstats[briefIndex].four = (batsman["4s"] === undefined) ? 0 : batsman["4s"];
      allbriefstats[briefIndex].six = (batsman["6s"] === undefined) ? 0 : batsman["6s"];
      allbriefstats[briefIndex].maxTouramentRun = 0;
      allbriefstats[briefIndex].maxTouramentWicket = 0;
      allbriefstats[briefIndex].duck = (isDuck) ? 1 : 0;
      // console.log(`Runs by ${allplayerstats[myindex].pid} : ${allplayerstats[myindex].run}`)

      if (!(batsman.B === undefined)) {
        var i = parseInt(batsman.B);
        if (isNaN(i))
          allplayerstats[myindex].ballsPlayed = 0;
        else
        allplayerstats[myindex].ballsPlayed = i;
      }
      allbriefstats[briefIndex].ballsPlayed = allplayerstats[myindex].ballsPlayed;

      if (allplayerstats[myindex].pid === manOfTheMatchPid) {
        allplayerstats[myindex].manOfTheMatch = true;
        allbriefstats[briefIndex].manOfTheMatch = 1;
        //console.log(`Man of the match is ${allplayerstats[myindex].pid}`);
      }

      var myscore = calculateScore(allplayerstats[myindex], myType);
      //console.log(`Arun score is ${myscore}`);
      allplayerstats[myindex].score = myscore;
      allbriefstats[briefIndex].score = myscore;
      //console.log(`Score; ${myscore} `);
    });
  });

  fieldingArray.forEach( x => {
    myInning = 1;
    if (myType === "TEST") {
      if (!x.title.toUpperCase().includes("1ST"))
        myInning  = 2;
    }
    x.scores.forEach(fielder => {
      // console.log(`Fielding of ${fielder.pid}`)
      myindex = _.findIndex(allplayerstats, {mid: currMatch, 
        pid: parseInt(fielder.pid),
        inning: myInning
      });
      if (myindex < 0) {
        var tmp = getBlankStatRecord(tournamentStat);
        tmp.mid = currMatch;
        tmp.pid = fielder.pid;
        tmp.playerName = fielder.name;
        tmp.inning = myInning;
        allplayerstats.push(tmp);
        myindex = allplayerstats.length - 1;
      }
      briefIndex = _.findIndex(allbriefstats, {sid: currMatch, 
        pid: parseInt(fielder.pid),
        inning: myInning
      });
      if (briefIndex < 0) {
        var tmp = getBlankBriefRecord(briefStat);
        tmp.sid = currMatch;
        tmp.pid = fielder.pid;
        tmp.playerName = fielder.name;
        tmp.inning = myInning;
        // console.log(`length is ${allbriefstats.length}`);
        allbriefstats.push(tmp);
        briefIndex = allbriefstats.length - 1;
      }

      allplayerstats[myindex].runout = (fielder.runout === undefined) ? 0 : fielder.runout;
      allplayerstats[myindex].stumped = (fielder.stumped === undefined) ? 0 : fielder.stumped;
      allplayerstats[myindex].bowled = (fielder.bowled === undefined) ? 0 : fielder.bowled;
      allplayerstats[myindex].lbw = (fielder.lbw === undefined) ? 0 : fielder.lbw;
      allplayerstats[myindex].catch = (fielder.catch === undefined) ? 0 : fielder.catch;

      allbriefstats[briefIndex].runout = (fielder.runout === undefined) ? 0 : fielder.runout;
      allbriefstats[briefIndex].stumped = (fielder.stumped === undefined) ? 0 : fielder.stumped;
      allbriefstats[briefIndex].bowled = (fielder.bowled === undefined) ? 0 : fielder.bowled;
      allbriefstats[briefIndex].lbw = (fielder.lbw === undefined) ? 0 : fielder.lbw;
      allbriefstats[briefIndex].catch = (fielder.catch === undefined) ? 0 : fielder.catch;

      var myscore = calculateScore(allplayerstats[myindex], myType);
      allplayerstats[myindex].score = myscore;
      allbriefstats[briefIndex].score = myscore;
    });
  });

  let myBowlingRec = _.find(runningScoreArray, x => x.tournament === mmm.tournament);
  if (!myBowlingRec) {
    let myBowlingRec = {
      tournament: mmm.tournament, mid: mmm.mid,
      team1: mmm.team1, team2: mmm.team2,
      bowl1: 0, bowl2: 0, bowl3, bowl4: 0,
      title1: "", title2: "", title3: "", title4: ""
    }
    runningScoreArray.push(myBowlingRec);
  }
  myBowlingRec.mid = mmm.mid;
  myBowlingRec.team1 = mmm.team1;
  myBowlingRec.team2 = mmm.team2;
  myBowlingRec.bowl1 = (allInningsBowling.length >= 1) ? allInningsBowling[0] : 0;
  myBowlingRec.bowl2 = (allInningsBowling.length >= 2) ? allInningsBowling[1] : 0;
  myBowlingRec.bowl3 = (allInningsBowling.length >= 3) ? allInningsBowling[2] : 0;
  myBowlingRec.bowl4 = (allInningsBowling.length >= 4) ? allInningsBowling[3] : 0;
  myBowlingRec.title1 = (allInningsTitle.length >= 1) ? allInningsTitle[0] : "";
  myBowlingRec.title2 = (allInningsTitle.length >= 2) ? allInningsTitle[1] : "";
  myBowlingRec.title3 = (allInningsTitle.length >= 3) ? allInningsTitle[2] : "";
  myBowlingRec.title4 = (allInningsTitle.length >= 4) ? allInningsTitle[3] : "";
  // update statistics in mongoose
  //console.log(allplayerstats.length);
  //console.log("Saveing statsu");
  allplayerstats.forEach(ps => {
    ps.save();
  })
  allbriefstats.forEach(ps => {
    // if (ps.pid === 288284) 
    // console.log(ps);
    ps.save();
  })

  return (manOfTheMatchPid);
}


function getMatchDetails(cricapiRec, mymatch, tournamentName, myMatchType) {
  var stime = getMatchStartTime(cricapiRec);
  var etime = getMatchEndTime(cricapiRec);
  var myweekday = weekDays[stime.getDay()];
  
  //var tmp = new CricapiMatch({
    mymatch.mid = cricapiRec.unique_id;
    mymatch.tournament = tournamentName;
    mymatch.team1 = cricapiRec['team-1'].toUpperCase();
    mymatch.team2 = cricapiRec['team-2'].toUpperCase();
    // mymatch.team1Description = cricapiRec['team-1'];
    // mymatch.team2Description = cricapiRec['team-2'];
    mymatch.matchStartTime = stime;
    mymatch.weekDay = myweekday;
    mymatch.type = myMatchType;
    // if (cricapiRec.type.toUpperCase().includes("TEST"))
    //   mymatch.type = "TEST";
    // else if (cricapiRec.type.toUpperCase().includes("ODI"))
    //   mymatch.type = "ODI";
    // else
    // mymatch.type = "T20";
    mymatch.squad = cricapiRec.squad;
    mymatch.matchStarted = cricapiRec.matchStarted;
    mymatch.matchEndTime = etime;
    var currtime = new Date();
    if (etime < currtime)
      mymatch.matchEnded = true;
    else
      mymatch.matchEnded = false;
    //if (mymatch.mid === 1198246) mymatch.matchEnded = false;
    //console.log(`Match-ID: ${mymatch.mid}  Started: ${mymatch.matchStarted}  Ended: ${mymatch.matchEnded}`)
    return mymatch;
}



function calculateScore(mystatrec, type) {
  //console.log(mystatrec);
  var mysum = 0;
  mysum += 
    (mystatrec.run * BonusRun[type]) +
    (mystatrec.four * Bonus4[type]) +
    (mystatrec.six * Bonus6[type]) +
    (mystatrec.fifty * Bonus50[type]) +
    (mystatrec.hundred * Bonus100[type]) +
    (mystatrec.wicket * BonusWkt[type]) +
    (mystatrec.wicket3 * BonusWkt3[type]) +
    (mystatrec.wicket5 * BonusWkt5[type]) +
    (mystatrec.maiden * BonusMaiden[type]) +
    //((mystatrec.wicket == 0) ? BonusDuck : 0) +
    ((mystatrec.manOfTheMatch) ? BonusMOM[type] : 0) + 
    ((mystatrec.maxTouramentRun > 0) ? BonusMaxRun[type] : 0) +
    ((mystatrec.maxTouramentWicket > 0) ?  BonusMaxWicket[type] : 0);

  mysum += 
    (mystatrec.catch * BonusCatch[type]) + 
    (mystatrec.runout * BonusRunOut[type]) + 
    (mystatrec.stumped * BonusStumped[type]);

  // now add penalty for duck
  mysum += (mystatrec.duck * BonusDuck[type]);

  // now add for economy
  mysum += (mystatrec.economy * BonusEconomy[type]);

  return  mysum
}


// get details of match (batting and bowling)
async function fetchMatchScoreFromCricapi(matchId) { // (1)
  let cricres = await fetch(get_cricapi_ScoreDetails_URL(matchId)); 

  if (cricres.status == 200) {
    let json = await cricres.json(); // (3)
    return json;
  }
  // console
  throw new Error(cricres.status);
}
// get match score
async function fetchMatchStatsFromCricapi(matchId) { // (1)
  let cricres = await fetch(get_cricapi_MatchDetails_URL(matchId)); 

  if (cricres.status == 200) {
    let json = await cricres.json(); // (3)
    return json;
  }
  // console
  throw new Error(cricres.status);
}

// get match details from cricapi
async function fetchMatchesFromCricapi() {
  let matchres = await fetch(  get_cricapiMatchInfo_URL() );
  
  if (matchres.status == 200) { 
    let json = await matchres.json(); // (3)
    return json;
  }
  throw new Error(matchres.status); 
}


// get Player information
async function fetchPlayerInfoFromCricapi(playerId) { // (1)
  let cricres = await fetch(get_cricapi_PlayerInfo_URL(playerId)); 

  if (cricres.status == 200) {
    let json = await cricres.json(); // (3)
    return json;
  }
  // console
  throw new Error(cricres.status);
}

async function sendMatchInfoToClient(igroup, doSendWhat) {
  // var igroup = _group;
  var currTime = new Date();
  currTime.setDate(currTime.getDate())
  var myGroup = await IPLGroup.find({"gid": igroup})
  var myMatches = await CricapiMatch.find({tournament: myGroup[0].tournament});

  var currMatches = _.filter(myMatches, x => _.gte (currTime, x.matchStartTime) && _.lte(currTime,x.matchEndTime));
  var upcomingMatch = _.find(myMatches, x => _.gte(x.matchStartTime, currTime));

  if (doSendWhat === SENDRES) {
    sendok(res, currMatches);
    console.log(upcomingMatch);
  } else {
    const socket = app.get("socket");
    socket.emit("currentMatch", currMatches)
    socket.broadcast.emit('curentMatch', currMatches);
    socket.emit("upcomingMatch", upcomingMatch)
    socket.broadcast.emit('upcomingMatch', upcomingMatch);
  }
}

async function processConnection(i) {
  // just simple connection then nothing to do
  // console.log("in process connection array");
  // console.log(connectionArray[i]);
  if ((connectionArray[i].gid  <= 0)  || 
      (connectionArray[i].uid  <= 0)  ||
      (connectionArray[i].page.length  <= 0)) return;
  
  //console.log(connectionArray[i]);
  var myDate1 = new Date();
  var myTournament = await getTournameDetails(connectionArray[i].gid);
  if (myTournament.length === 0) return;
  //console.log(`Tournament is ${myTournament}`);
  
  var myData = _.find(clientData, x => x.tournament === myTournament && x.gid === connectionArray[i].gid);
  let sts = false;
  //myData = null;	//-------------------------------> for testing purpose
  if (!myData) {
    // no data of this tournament with us. Read database and do calculation
	//memoryLeaked();
    sts = await readDatabase(connectionArray[i].gid );
	  // console.log(`read database status ${sts}`);
    if (sts) {
      // console.log(` stat and brief calculation for group ${connectionArray[i].gid}` );
      let myDB_Data = await statCalculation(connectionArray[i].gid );
      let mySTAT_Data = await statBrief(connectionArray[i].gid , 0 , SENDSOCKET);
      myData = {tournament: myTournament, gid: connectionArray[i].gid,
				dbData: myDB_Data, statData: mySTAT_Data}
      clientData.push(myData);
      var myDate2 = new Date();
      var duration = myDate2.getTime() - myDate1.getTime();
      console.log(`Total calculation Time: ${duration}`)
    }
	//memoryLeaked();
  }

  switch(connectionArray[i].page.substr(0, 4).toUpperCase()) {
    case "DASH":
      if (myData) { 
        io.to(connectionArray[i].socketId).emit('maxRun', myData.dbData.maxRun);
        io.to(connectionArray[i].socketId).emit('maxWicket', myData.dbData.maxWicket);
        io.to(connectionArray[i].socketId).emit('rank', myData.dbData.rank);
		//console.log(myData.dbData.rank);
        io.to(connectionArray[i].socketId).emit('score', score[myTournament]);
        let myOvers = _.find(runningScoreArray, x => x.tournament === myData.tournament)
        if (!myOvers) { myOvers = {tournament: ""}; }
        // console.log("Overs ", myOvers);
        io.to(connectionArray[i].socketId).emit('brief', myData.statData);
        io.to(connectionArray[i].socketId).emit('overs', myOvers);
        console.log("sent Dash data to " + connectionArray[i].socketId);
      }
      break;
    case "STAT":
      if (myData) {
        let myOvers = _.find(runningScoreArray, x => x.tournament === myData.tournament)
        if (!myOvers) { myOvers = {tournament: ""}; }
        // console.log("Overs ", myOvers);
        io.to(connectionArray[i].socketId).emit('brief', myData.statData);
        io.to(connectionArray[i].socketId).emit('overs', myOvers);
        console.log("Sent Stat data to " + connectionArray[i].socketId);
      }
      break
    // case "AUCT":
    //   console.log(auctioData);
    //   var myRec = _.filter(auctioData, x => x.gid == connectionArray[i].gid);
    //   console.log(myRec);
    //   if (myRec.length > 0) {
    //     io.to(connectionArray[i].socketId).emit('playerChange', 
    //         myRec[0].player, myRec[0].balance );
    //       console.log("Sent Auction data to " + connectionArray[i].socketId);          
    //   }
    //   break;
  }

  return;
}

function memoryLeaked() {
	const used = process.memoryUsage();
	for (let key in used) {
		console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
	}
}

async function sendDashboardData() {
  // clientData = [];
  // first cleanup data of tournament which has running matches
  // this will force fresh calculation which inlcudes curret matches
  // console.log(clientData);
  // connectionArray.forEach( ccc => {
  //   _.remove(clientData, x => x.tournament === ccc.tournament);
  // });
  //--------------CHECK
  let T1 = new Date();
  connectionArray = [].concat(masterConnectionArray)
  // if (connectionArray.length > 0)
  //   console.log(` ${connectionArray[0].gid}  ${connectionArray[0].uid}   ${connectionArray[0].page}`);
  // console.log(runningMatchArray);
  // console.log(`Before client Data list ${clientData.length}`);
  // clientData.forEach(ccc => {
  //   console.log(ccc.tournament);
  // })
  // console.log("Running match array");
  // console.log(runningMatchArray);
  // console.log(clientData);
  runningMatchArray.forEach( ccc => {
    _.remove(clientData, x => x.tournament === ccc.tournament);
  });
  //-----------
  //------ Start Remove calculated data for the group which has no connection
  let newClientdata = [];
  clientData.forEach(x => {
	  let tmp = _.filter(connectionArray, ca => ca.gid === x.gid);
	  if (tmp.length > 0) newClientdata.push(x);
  });
  clientData = [].concat(newClientdata);
  
  //-------End Removed unwanted data in memory
  // clientData=[];
  //console.log(`After client Data list ${clientData.length}`);
  // clientData.forEach(ccc => {
  //   console.log(ccc.tournament);
  // })

  // now process connection
  // console.log("send dash");
  // console.log(connectionArray);
  for(i=0; i<connectionArray.length; ++i)  {
    await processConnection(i);
  }
  let T2 = new Date();
  let diff = T2.getTime() - T1.getTime();
  // console.log(T1);
  // console.log(T2);
  console.log(`Processing all socket took time ${diff}`);
}

async function updateTournamentBrief() {
  var currDate = new Date();
  // console.log(`in update: ${currDate.getHours()}`)
  if (currDate.getHours() === 2) {
    console.log(currDate);
    await check_all_tournaments();
  }
}

async function checkallover() {
  var allTRec = await Tournament.find({started: true, over: false});
  for(i=0; i <allTRec.length; ++i) {
    await checkTournamentOver(allTRec[i].name);
  }
}

// schedule task 
let clientSemaphore = false;
cron.schedule('*/1 * * * * *', async () => {
  ++cricTimer;
  ++clientUpdateCount;
  if (!db_connection) {
    return;
  }

  if (clientSemaphore) return;       // previous execution in progress
  clientSemaphore = true;

  try {
    console.log("Start with running score --------------------")

    let T1 = new Date();

    if (PRODUCTION) {
      if (cricTimer >= CRICUPDATEINTERVAL) {
        cricTimer = 0;
        await update_cricapi_data_r1(false);
        await updateTournamentBrief();
        //console.log(runningScoreArray);
        //await checkallover();  ---- Confirm this is done when match ends
      }
    }

    if (clientUpdateCount >= CLIENTUPDATEINTERVAL) {
      clientUpdateCount = 0;
      await sendDashboardData(); 
    } 
  
    let T3 = new Date();
    let diff1 = T3.getTime() - T1.getTime();
    console.log("End --------------- time taken: ", diff1);
  } catch(e) {
    console.log("Error in schedule fuction");
    console.log(e);
  }
  clientSemaphore = false;  // job over
});

var keyIndex = 0;
function nextapikey() {
  if (++keyIndex >= keylist.length) 
    keyIndex = 0;
  console.log(`Key used is ${keylist[keyIndex]}`);
  return keylist[keyIndex];
}

// function to generate URL for data fetch from cric api
function get_cricapiMatchInfo_URL()
{ 
  return cricapiMatchInfo_prekey + nextapikey() + cricapiMatchInfo_postkey
}

function get_cricapi_MatchDetails_URL(matchid)
{
  return cricapi_MatchDetails_prekey + nextapikey() + cricapi_MatchDetails_postkey + matchid;
}
function get_cricapi_ScoreDetails_URL(matchid)
{
  return cricapi_ScoreDetails_prekey + nextapikey() + cricapi_ScoreDetails_postkey + matchid;
}

function get_cricapi_PlayerInfo_URL(playerid)
{
  return cricapi_PlayerInfo_prekey + nextapikey() + cricapi_PlayerInfo_postkey + playerid;
}

// time based functions:

function timeToFetchMatches() {
  var currtime = new Date();
  //console.log(`Next FetchTime: ${nextMatchFetchTime}`);
  if (currtime >= nextMatchFetchTime)
    return true;
  else
    return false;
}

// not used now. obsolete
function tomorrowFetchTime() {
  const tomorrowAtHours = 7;
  var newdt = new Date();
  newdt.setDate(newdt.getDate() + 1);
  newdt.setHours(tomorrowAtHours);
  newdt.setMinutes(0);
  newdt.setSeconds(0);
  return newdt;
}


function updateMatchFetchTime(provider) {
  var newdt;
  /**
  //console.log(`Published date is ${provider.pubDate}`);
  if (isItToday(provider.pubDate)) {
    // if match data received today then set it for tomorrow at 7
    newdt = tomorrowFetchTime();
  } else {
    // advance match fetch time by 3 hours
    // if end of day then set it to tomorrow at 7
    var newhr = nextMatchFetchTime.getHours() + 3;
    if (newhr > 23) {
      newdt = tomorrowFetchTime();
    } else {
      newdt = new Date();     //(nextMatchFetchTime.getTime());
      newdt.setHours(newhr);
      newdt.setMinutes(0);
      newdt.setSeconds(0);
    }
  }
  */
  //nextMatchFetchTime = newdt;

  nextMatchFetchTime.setHours(nextMatchFetchTime.getHours() + MATCHREADINTERVAL);
  console.log(`New match fetch fime is ${nextMatchFetchTime}`);
}


// if the date is today. Ignore 
function isItToday(mytimestr) {
  //console.log(`String: ${mytimestr}`);

  var currtime = new Date();
  var mytime = new Date(mytimestr);
  console.log(`=============> Time String: ${mytimestr}  Date: ${mytime}`);
  var sts = (
    (currtime.getFullYear() === mytime.getFullYear()) && 
    (currtime.getMonth() === mytime.getMonth()) && 
    (currtime.getDate() === mytime.getDate()))
  //console.log(`${mytime} is today: ${sts}`);
  return sts;
}

function getMatchStartTime(cricapiRec) {
  var mytime = new Date(cricapiRec.dateTimeGMT);        // clone start date
  //mytime.setMinutes(mytime.getMinutes() + minutesIST);
  return mytime;
}

const OdiMinutes = 600;   // 10 hours i.e. 600 minutes
const testMinutes = 600;    
const t20Minutes = 330;    //  5 hours 30 minutes is 330 minutes

function getMatchEndTime(cricapiRec) {
  var tmp = getMatchStartTime(cricapiRec);       // clone start date
  var etime = new Date(tmp.getTime());
  var matchMinutes;

  var typeUpper = cricapiRec.type.toUpperCase();
  // if test match advance date by 4 days (to make it 5th day)
  if (typeUpper.includes("TEST")) {
    etime.setDate(etime.getDate()+4);     // test match is for 5 days. set date to 5th day
    matchMinutes = testMinutes;
  } else if (typeUpper.includes("ODI")) {
    matchMinutes = OdiMinutes;
  } else if (typeUpper.includes("20")) {
    matchMinutes = t20Minutes;
  } else
    matchMinutes = OdiMinutes;

  // addd match time to end date
  etime.setMinutes(etime.getMinutes() + matchMinutes);

  return etime;
}

async function publish_stats(res)
{
  // Set collection name 
  var tournamentStat = mongoose.model(_tournament, StatSchema);
  var statList = await tournamentStat.find({});
  sendok(res, statList);
  // //console.log(filter_stats);
  // Stat.find(filter_stats,(err,slist) =>{
  //   if(slist) sendok(res, slist);
  //   else      senderr(res, DBFETCHERR, "Unable to fetch statistics from database");
  // });
}

async function tournamentOver(groupno) {
  var myrec = await IPLGroup.findOne({gid: groupno});
  var tournamentName = myrec.tournament;
  var tRec = await Tournament.findOne({name: tournamentName});
  if (myrec)
    return (myrec.enabled == false);
  return;
}

async function get_userDisplayName(userId) {
  var myuser = "";
  var myrec = await User.findOne({uid: userId});
  if (myrec) 
    myuser = myrec.displayName;
  return myuser;
}

async function check_all_tournaments() {
  let tmp = await Tournament.find({over: false});
  let allTournaments = _.map(tmp, 'name');
  //console.log(allTournaments);
  for(i=0; i < allTournaments.length; ++i) {
    await updatePendingBrief(allTournaments[i]);
  }
}


function sendok(res, usrmsg) { res.send(usrmsg); }
function senderr(res, errcode, errmsg) { res.status(errcode).send(errmsg); }
function setHeader(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // _group = 1;
  // _tournament = "IPL2020";

}
module.exports = router;
