express = require('express');
path = require('path');
cookieParser = require('cookie-parser');
logger = require('morgan');
mongoose = require("mongoose");
cors = require('cors');
fetch = require('node-fetch');
_ = require("lodash");
cron = require('node-cron');
nodemailer = require('nodemailer');
app = express();

PORT = process.env.PORT || 4000;
http = require('http');
httpServer = http.createServer(app);
io = require('socket.io')(httpServer, {
  handlePreflightRequest: (req, res) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
      "Access-Control-Allow-Credentials": true
    };
    res.writeHead(200, headers);
    res.end();
  }

});

// Routers
router = express.Router();
indexRouter = require('./routes/index');
usersRouter = require('./routes/user');
auctionRouter = require('./routes/auction');
playersRouter = require('./routes/player');
groupRouter = require('./routes/group');
teamRouter = require('./routes/team');
statRouter = require('./routes/playerstat');
matchRouter = require('./routes/match');
tournamentRouter = require('./routes/tournament');
walletRouter = require('./routes/wallet');
prizeRouter = require('./routes/prize');

// maintaing list of all active client connection
connectionArray  = [];
masterConnectionArray  = [];
clientData = [];
CLIENTUPDATEINTERVAL=10;
clientUpdateCount=0;
CRICUPDATEINTERVAL = 15;    // in seconds. Interval after seconds fetch cricket match data from cricapi
cricTimer = 0;
// maintain list of runnning matches
runningMatchArray = [];
clentData = [];
auctioData = [];

io.on('connect', socket => {
  app.set("socket",socket);
  socket.on("page", (pageMessage) => {
    console.log("page message from "+socket.id);
    console.log(pageMessage);
    var myClient = _.find(masterConnectionArray, x => x.socketId === socket.id);
    if (pageMessage.page.toUpperCase().includes("DASH")) {
      myClient.page = "DASH";
      myClient.gid = parseInt(pageMessage.gid);
      myClient.uid = parseInt(pageMessage.uid);
      myClient.firstTime = true;
      clientUpdateCount = CLIENTUPDATEINTERVAL+1;
    } else if (pageMessage.page.toUpperCase().includes("STAT")) {
      myClient.page = "STAT";
      myClient.gid = parseInt(pageMessage.gid);
      myClient.uid = parseInt(pageMessage.uid);
      myClient.firstTime = true;
      clientUpdateCount = CLIENTUPDATEINTERVAL+1;
    } else if (pageMessage.page.toUpperCase().includes("AUCT")) {
      myClient.page = "AUCT";
      myClient.gid = parseInt(pageMessage.gid);
      myClient.uid = parseInt(pageMessage.uid);
      myClient.firstTime = true;
      clientUpdateCount = CLIENTUPDATEINTERVAL+1;
    }
  });
});

io.sockets.on('connection', function(socket){
  // console.log("Connected Socket = " + socket.id)
  masterConnectionArray.push({socketId: socket.id, page: "", gid: 0, uid: 0});
  socket.on('disconnect', function(){
    _.remove(masterConnectionArray, {socketId: socket.id});
    
  });
});

app.set('view engine', 'html');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'material-dashboard-react-master/build/')));
app.use(express.json());


app.use((req, res, next) => {
  if (req.url.includes("admin")||req.url.includes("signIn")||req.url.includes("Logout")) {
    req.url = "/";
    res.redirect('/');
  }
  else {
    next();
  }

});

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/player', playersRouter);
app.use('/auction', auctionRouter);
app.use('/group', groupRouter);
app.use('/team', teamRouter);
app.use('/stat', statRouter);
app.use('/match', matchRouter);
app.use('/tournament', tournamentRouter);
app.use('/wallet', walletRouter);
app.use('/prize', prizeRouter);

// ---- start of globals
// connection string for database
mongoose_conn_string = "mongodb+srv://akshama:akshama@cluster0-urc6p.mongodb.net/IPL2020";

//Schema
MasterSettingsSchema = mongoose.Schema ({
  msid: Number,
  trialExpiry: String,
})

UserSchema = mongoose.Schema({
  uid: Number,
  userName: String,
  displayName: String,
  password: String,
  status: Boolean,
  defaultGroup: Number,
  email: String,
  userPlan: Number
});

IPLGroupSchema = mongoose.Schema({
  gid: Number,
  name: String,
  owner: Number,
  maxBidAmount: Number,
  tournament: String,
  auctionStatus: String,
  auctionPlayer: Number,
  auctionBid: Number,
  currentBidUid: Number,
  currentBidUser: String,
  memberCount: Number,
  memberFee: Number,
  prizeCount: Number,
  enable: Boolean
});

PlayerSchema = mongoose.Schema({
  pid: Number,
  name: String,
  fullName: String,
  Team: String,
  role: String,
  bowlingStyle: String,
  battingStyle: String,
  tournament: String
});

SkippedPlayerSchema = mongoose.Schema({
  gid: Number,
  pid: Number,
  playerName: String,
  tournament: String
});

AuctionSchema = mongoose.Schema({
  gid: Number,
  uid: Number,
  pid: Number,
  team: String,
  playerName: String,
  bidAmount: Number
});
GroupMemberSchema = mongoose.Schema({
  gid: Number,
  uid: Number,
  userName: String,
  balanceAmount: Number,        // balance available to be used for bid
  displayName: String,
  score: Number,
  rank: Number,
  prize: Number,
  enable: Boolean
});

CaptainSchema = mongoose.Schema({
  gid: Number,
  uid: Number,
  captain: Number,     // captain's player id 
  captainName: String,
  viceCaptain: Number,  // viceCaptain's players id
  viceCaptainName: String
});
TeamSchema = mongoose.Schema({
  name: String,
  fullname: String,
  tournament: String
})

TournamentSchema = mongoose.Schema({
  name: String,
  desc: String,
  type: String,
  started: Boolean,
  over: Boolean,
  enabled: Boolean
})

WalletSchema = mongoose.Schema({
  transNumber: Number,
  transDate: String,
  transType: String,
  transSubType: String,
  uid: Number,
  gid: Number,
  rank: Number,
  transLink: Number,
  amount: Number,
  transStatus: Boolean,
})

PrizeSchema = mongoose.Schema({
  prizeCount: Number,
  prize1: Number,
  prize2: Number,
  prize3: Number,
  prize4: Number,
  prize5: Number,
  prize6: Number,
  prize7: Number,
  prize8: Number,
  prize9: Number,
  prize10: Number,
});
// USE CRICMATCHSCHEMA since match details will be imported from CRICAPI 
// Avoid createing match database
// MatchSchema = mongoose.Schema({
//   mid: Number,
//   description: String,
//   team1: String,
//   team2: String,
//   team1Desciption: String,
//   team2Desciption: String,
//   matchTime: Date,
//   weekDay: String
// });
StatSchema = mongoose.Schema({
  mid: Number,
  pid: Number,
  inning: Number,
  score: Number,
  playerName: String,
  // batting details
  run: Number,
  four: Number,
  six: Number,
  fifty: Number,
  hundred: Number,
  ballsPlayed: Number,
  // bowling details
  wicket: Number,
  wicket3: Number,
  wicket5: Number,
  hattrick: Number,
  maiden: Number,
  oversBowled: Number,
  maxTouramentRun: Number,
  maxTouramentWicket: Number,
  // fielding details
  runout: Number,
  stumped: Number,
  bowled: Number,
  lbw: Number,
  catch: Number,

  // overall performance
  manOfTheMatch: Boolean
});
//--- data available from CRICAPI
CricapiMatchSchema = mongoose.Schema({
  mid: Number,
  tournament: String,
  team1: String,
  team2: String,
  // team1Description:String,
  // team2Description:String,
  weekDay: String,
  type: String,
  matchStarted: Boolean,
  matchEnded: Boolean,
  matchStartTime: Date,
  matchEndTime: Date,
  squad: Boolean
})

BriefStatSchema = mongoose.Schema({
  sid: Number,    // 0 => data, 1 => maxRUn, 2 => maxWick
  pid: Number,
  playerName: String,
  inning: Number,
  score: Number,
  // batting details
  run: Number,
  four: Number,
  six: Number,
  fifty: Number,
  hundred: Number,
  ballsPlayed: Number,
  // bowling details
  wicket: Number,
  wicket3: Number,
  wicket5: Number,
  hattrick: Number,
  maiden: Number,
  oversBowled: Number,
  // fielding details
  runout: Number,
  stumped: Number,
  bowled: Number,
  lbw: Number,
  catch: Number,
  // overall performance
  maxTouramentRun: Number,
  maxTouramentWicket: Number,
  manOfTheMatch: Number
});  
// table name will be <tournament Name>_brief r.g. IPL2020_brief
BRIEFSUFFIX = "_brief";
RUNNINGMATCH=1;
PROCESSOVER=0;
AUCT_RUNNING="RUNNING";
AUCT_PENING="PENDING";
AUCT_OEVR="OVER";

// models
User = mongoose.model("users", UserSchema);
Player = mongoose.model("iplplayers", PlayerSchema);
Auction = mongoose.model("iplauction", AuctionSchema);
IPLGroup = mongoose.model("iplgroups", IPLGroupSchema);
GroupMember = mongoose.model("groupmembers", GroupMemberSchema);
Captain = mongoose.model("iplcaptains", CaptainSchema);
Team = mongoose.model("iplteams", TeamSchema);
// Match = mongoose.model("iplmatches", MatchSchema);
Stat = mongoose.model("iplplayerstats", StatSchema);
Tournament = mongoose.model("tournaments", TournamentSchema);
MasterData = mongoose.model("MasterSettings", MasterSettingsSchema)
SkippedPlayer = mongoose.model("skippedplayers", SkippedPlayerSchema)
CricapiMatch = mongoose.model("cricApiMatch", CricapiMatchSchema)
Wallet = mongoose.model('wallet', WalletSchema);
Prize = mongoose.model('prize', PrizeSchema);

nextMatchFetchTime = new Date();
router = express.Router();

db_connection = false;      // status of mongoose connection
connectRequest = true;
// constant used by routers
minutesIST = 330;    // IST time zone in minutes 330 i.e. GMT+5:30
minutesDay = 1440;   // minutes in a day 24*60 = 1440
MONTHNAME = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
weekDays = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
weekShortDays = new Array("Sun", "Mon", "Tue", "Wedn", "Thu", "Fri", "Sat");
// IPL_Start_Date = new Date("2020-09-19");   // IPL Starts on this date

// if match type not provided by cric api and
// team1/team2 both contains any of these string then
// set match type as T20  (used in playerstat)
IPLSPECIAL = ["MUMBAI", "HYDERABAD", "CHENNAI", "RAJASTHAN",
 "KOLKATA", "BANGALORE", "DELHI", "PUNJAB",
 "VELOCITY", "SUPERNOVAS", "TRAILBLAZERS"
];

SENDRES = 1;        // send OK response
SENDSOCKET = 2;     // send data on socket

// Error messages
DBERROR = 990;
DBFETCHERR = 991;
CRICFETCHERR = 992;
ERR_NODB = "No connection to CricDream database";

// Bid amount given to user when he/she joins group 1
GROUP1_MAXBALANCE = 1000;
allUSER = 99999999;

// Number of hours after which match details to be read frpom cricapi.
MATCHREADINTERVAL = 3;

// Wallet 
// WalletStatus = {success: "success", failed: "success"};
WalletTransType = {
  accountOpen: "accountOpen",
  refill: "refill",
  withdrawl: "withdrawl",
  offer: "offer",
  bonus: "bonus",
  prize: "prize",
  groupJoin: "groupJoin",
  groupCancel: "groupCancel"
};

// match id for record which has bonus score for  Maximum Run and Maximum Wicket
// Note that it has be be set -ve
MaxRunMid = -1;
MaxWicketMid = -2;

defaultGroup = 1;
defaultTournament = "IPL2020";
forceGroupInfo = false;
defaultMaxPlayerCount = 15;

// Point scroring
ViceCaptain_MultiplyingFactor = 1.5;
Captain_MultiplyingFactor = 2;
BonusRun = 1;
Bonus4 = 1;
Bonus6 = 2;
Bonus50 = 20;
Bonus100 = 50;

BonusWkt = 25;
BonusWkt3 = 20;
BonusWkt5 = 50;
BonusMaiden = 20;

BonusDuck = -5;
BonusNoWkt = 0;
BonusMOM = 20;

BonusMaxRun = 100;
BonusMaxWicket = 100;

// variables rreuiqred by timer
sendDashboard = false;
sendMyStat = false;
myStatGroup = [];
myDashboardGroup = [];
serverTimer = 0;

// time interval for scheduler
serverUpdateInterval = 10; // in seconds. INterval after which data to be updated to server

// ----------------  end of globals

// make mogoose connection

// Create the database connection 
//mongoose.connect(mongoose_conn_string);
mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true });

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + mongoose_conn_string);
  db_connection = true;
  connectRequest = true;
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
  console.log('Mongoose default connection error');
  console.log(err);
  db_connection = false;
  connectRequest = false;   // connect request refused
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
  db_connection = false;
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function () {
  // close mongoose connection
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
  });
  process.exit(0);
});

// schedule task
cron.schedule('*/15 * * * * *', () => {
  // console.log('running every 15 second');
  // console.log(`db_connection: ${db_connection}    connectREquest: ${connectRequest}`);
  if (!connectRequest)
    mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true });
});



// start app to listen on specified port
httpServer.listen(PORT, () => {
  console.log("Server is running on Port: " + PORT);
});


// global functions

const AMPM = [
  "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM",
  "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM"
];
  /**
 * @param {Date} d The date
 */
const TZ_IST={hours: 5, minutes: 30};
cricDate = function (d)  {
  var xxx = new Date(d.getTime());
  xxx.setHours(xxx.getHours()+TZ_IST.hours);
  xxx.setMinutes(xxx.getMinutes()+TZ_IST.minutes);
  var myHour = xxx.getHours();
  var myampm = AMPM[myHour];
  if (myHour > 12) myHour -= 12;
  var tmp = `${MONTHNAME[xxx.getMonth()]} ${("0" + xxx.getDate()).slice(-2)} ${("0" + myHour).slice(-2)}:${("0" +  xxx.getMinutes()).slice(-2)}${myampm}`
  return tmp;
}

const notToConvert = ['XI', 'ARUN']
/**
 * @param {string} t The date
 */

cricTeamName = function (t)  {
  var tmp = t.split(' ');
  for(i=0; i < tmp.length; ++i)  {
    var x = tmp[i].trim().toUpperCase();
    if (notToConvert.includes(x))
      tmp[i] = x;
    else
      tmp[i] = x.substr(0, 1) + x.substr(1, x.length - 1).toLowerCase();
  }
  return tmp.join(' ');
}

getLoginName = function (name) {
  return name.toLowerCase().replace(/\s/g, "");
}

getDisplayName = function (name) {
  var xxx = name.split(" ");
  xxx.forEach( x => { 
    x = x.trim()
    x = x.substr(0,1).toUpperCase() +
      (x.length > 1) ? x.substr(1, x.length-1).toLowerCase() : "";
  });
  return xxx.join(" ");
}

masterRec = null;
joinOffer=500;

fetchMasterSettings = async function () {
  // if (masterRec === null) {
    let tmp = await MasterData.find();
    masterRec = tmp[0];  
  // }  
}

USERTYPE = { TRIAL: 0, SUPERUSER: 1, PAID: 2}

userAlive = async function (uRec) {
  let sts = false;
  if (uRec) {
    switch (uRec.userPlan) {
      case USERTYPE.SUPERUSER:
        sts = true;
        break;
      case  USERTYPE.PAID:
        sts = true;
        break;
      case  USERTYPE.TRIAL:
        let cTime = new Date();
        await fetchMasterSettings(); 
        // console.log(masterRec);
        let tTime = new Date(masterRec.trialExpiry);
        // console.log(cTime);
        // console.log(tTime);
        sts =  (tTime.getTime() > cTime.getTime());
        break;
    }
  }
  return sts;
}

refundGroupFee = async function(groupid, amount) {
  let allMembers = await GroupMember.find({gid: groupid});
  for(gm of allMembers) {
    await WalletAccountGroupCancel(gm.gid, gm.uid, amount)
  };
}

doDisableAndRefund = async function(g) {
  // console.log(`Disable group ${g.gid}`)
  let memberCount = await GroupMemberCount(g.gid);
  // let groupRec = await IPLGroup.findOne({gid: g.gid});
  if (memberCount !== g.memberCount) {
    g.enable = false;
    g.save();
    // refund wallet amount since group is disabled.
    await refundGroupFee(g.gid, g.memberFee);
    console.log(`Refund compeletd fpr group ${g.gid}`)
  }
}

disableIncompleteGroup = async function(tournamentName) {
  // this will disable all groups in which reqiured numbers of members
  // have not joined. Remember to refund the member fee amount to their wallet
  allGroups = await IPLGroup.find({tournament: tournamentName, enable: true});
  // console.log("----in Disable");
  // console.log(allGroups);
  for(const g of allGroups ) {
    console.log(`Group is ${g.gid} to be DISABLED-------------------------`)
    await doDisableAndRefund(g);
  };
}



// set tournament Started
updateTournamentStarted = async function (tournamentName) {
  // console.log("in update tournament started")
  let tRec = await Tournament.findOne({name: tournamentName, started: false});
  if (tRec) {
    // disable group for which required number of members have not been formed.
    tRec.started = true;
    tRec.save();
    await disableIncompleteGroup(tournamentName);
  }
};


// set tournament Over
updateTournamentOver = async function (tournamentName) {
  let tRec = await Tournament.findOne({name: tournamentName});
  if (!tRec.over) {
    tRec.over = true;
    tRec.save();
  } 
};

// check if all matches complete. If yes then set tournament over
checkTournamentOver = async function (tournamentName) {
  // await update brief of this tournament
  await updatePendingBrief(tournamentName);
  // check if any uncomplete match  
  //console.log(tournamentName);
  let matchesNotOver = await CricapiMatch.find({tournament: tournamentName, matchEnded: false});
  //console.log(matchesNotOver);
  // if no uncomplete match then declare tournament as over
  if (matchesNotOver.length === 0) {
    // set tournamet as over
    await updateTournamentOver(tournamentName);
    // add min and max run of the tournamenet and assign points to user
    await updateTournamentMaxRunWicket(tournamentName);
    // update group with rank / score. Also allocate prize money
    await awardRankPrize(tournamentName);
  }
}



getBlankStatRecord = function(tournamentStat) {
  return new tournamentStat( {
    mid: 0,
    pid: 0,
    score: 0,
    inning: 0,
    playerName: "",
  // batting details
    run: 0,
    four: 0,
    six: 0,
    fifty: 0,
    hundred:  0,
    ballsPlayed: 0,
    // bowling details
    wicket: 0,
    wicket3: 0,
    wicket5: 0,
    hattrick: 0,
    maiden: 0,
    oversBowled: 0,
    maxTouramentRun: 0,
    maxTouramentWicket: 0,
    // fielding details
    runout: 0,
    stumped: 0,
    bowled: 0,
    lbw: 0,
    catch: 0,
    // overall performance
    manOfTheMatch: false
  });
}

getBlankBriefRecord = function(tournamentStat) {
  let tmp = new tournamentStat( {
    sid: RUNNINGMATCH,
    pid: 0,
    playerName: "",
    score: 0,
    inning: 0,
  // batting details
    run: 0,
    four: 0,
    six: 0,
    fifty: 0,
    hundred:  0,
    ballsPlayed: 0,
    // bowling details
    wicket: 0,
    wicket3: 0,
    wicket5: 0,
    hattrick: 0,
    maiden: 0,
    oversBowled: 0,
    // fielding details
    runout: 0,
    stumped: 0,
    bowled: 0,
    lbw: 0,
    catch: 0,
    // overall performance
    manOfTheMatch: 0,
    maxTouramentRun: 0,
    maxTouramentWicket: 0,
  });
  // console.log(tmp);
  return(tmp);
}

awardRankPrize = async function(tournamentName) {
  let allGroups = await IPLGroup.find({tournament: tournamentName, enable: true});
  // allGroups.forEach(g => {
  for(const g of allGroups) {
    // arun
    // memberCount: Number,
    // memberFee: Number,
    // prizeCount: Number,
    let prizeTable = await getPrizeTable(g.prizeCount, g.memberCount*memberFee);
    let allgmRec = await GroupMember.find({gid: g.gid});
    // allgmRec.forEach(gmRec => {
    for (const gmRec of allgmRec) {
      // arun
      if (gmRec.rank <= g.prizeCount) {
        gmRec.prize = prizeTable[gmRec.rank-1].prizeAmount;
        await WalletArun(gmRec.gid, gmRec.uid, prizeTable[gmRec.rank-1].prizeAmount)
      } else {
        gmRec.prize = 0;
      }
      gmRec.save();
    }
  }
}


updateTournamentMaxRunWicket = async function(tournamentName) {
//--- start
  // ------------ Assuming tournament as over
  // let myTournament = await Tournament.findOne({name: tournamentName});
  // if (!myTournament) return false;
  // if (!myTournament.over) return false;

  let tournamentStat = mongoose.model(tournamentName, StatSchema);
  let BriefStat = mongoose.model(tournamentName+BRIEFSUFFIX, BriefStatSchema);

  let tdata = await BriefStat.find({});
  let tmp = _.filter(tdata, x => x.sid === MaxRunMid);
  if (tmp.length > 0) return true;    // max run already assigned. Assuming same done for max wicket

  tmp = _.filter(tdata, x => x.sid == MaxWicketMid);
  if (tmp.length > 0) return true;

  let pidList = _.map(tdata, 'pid');
  pidList = _.uniqBy(pidList);

  // calculate total runs and total wickets of each player (played in tournament matches)
  let sumList = [];
  pidList.forEach( mypid => {
    tmp = _.filter(tdata, x => x.pid === mypid);
    if (tmp.length > 0) {
      var iRun = _.sumBy(tmp, 'run');
      var iWicket = _.sumBy(tmp, 'wicket');
      sumList.push({pid: mypid, playerName: tmp[0].playerName, totalRun: iRun, totalWicket: iWicket});
    }
  });

  // now get list of players who have score max runs (note there can be more than 1)
  tmp = _.maxBy(sumList, x => x.totalRun);
  //console.log(tmp);
  let maxList = _.filter(sumList, x => x.totalRun == tmp.totalRun);
  let bonusAmount  = BonusMaxRun / maxList.length;
  maxList.forEach( mmm => {
    let myrec = getBlankStatRecord(tournamentStat);
    myrec.mid = MaxRunMid;
    myrec.pid = mmm.pid;
    myrec.playerName = mmm.playerName;
    myrec.score = bonusAmount;
    myrec.maxTouramentRun = mmm.totalRun;  
    myrec.save(); 

    let mybrief = getBlankBriefRecord(BriefStat);
    mybrief.sid = MaxRunMid;
    mybrief.pid = mmm.pid;
    mybrief.playerName = mmm.playerName;
    mybrief.score = bonusAmount;
    mybrief.maxTouramentRun = mmm.totalRun;  
    mybrief.save(); 
  });

  // now get list of players who have taken max wickets (note there can be more than 1)
  tmp = _.maxBy(sumList, x => x.totalWicket);
  //console.log(tmp);
  maxList = _.filter(sumList, x => x.totalWicket == tmp.totalWicket);
  bonusAmount  = BonusMaxWicket / maxList.length;
  maxList.forEach( mmm => {
    let myrec = getBlankStatRecord(tournamentStat);
    myrec.mid = MaxWicketMid;
    myrec.pid = mmm.pid;
    myrec.playerName = mmm.playerName;
    myrec.score = bonusAmount;
    myrec.maxTouramentWicket = mmm.totalWicket;
    myrec.save(); 

    let mybrief = getBlankBriefRecord(BriefStat);
    mybrief.sid = MaxWicketMid;
    mybrief.pid = mmm.pid;
    mybrief.playerName = mmm.playerName;
    mybrief.score = bonusAmount;
    mybrief.maxTouramentRun = mmm.totalWicket;  
    mybrief.save(); 
  });

  // all done
  return true;
}



updatePendingBrief = async function (mytournament) {
  // get match if the matches that are completed in this tournament
  let ttt = mytournament.toUpperCase();
  let completedMatchList = await CricapiMatch.find({tournament: ttt, matchEnded: true});
  // console.log(`${ttt} Completed match status ${completedMatchList.length}`)
  if (completedMatchList.length <= 0) return;
  let midList = _.map(completedMatchList, 'mid');

  // get gets record in brief table which are not yet merge
  let BriefStat = mongoose.model(mytournament+BRIEFSUFFIX, BriefStatSchema);
  var briefList = await BriefStat.find({ sid: { $in: midList } });
  if (briefList.length === 0) return;
  console.log("Pending procesing started");
  // some pending reocrd to be update
  sidList = _.map(briefList, 'sid');
  sidList = _.uniq(sidList);
  console.log(sidList);
  // console.log( `Completed match is ${PROCESSOVER}`)
  let masterList = await BriefStat.find({ sid: PROCESSOVER });
  console.log(`Compltetd: ${masterList.length}    Pedning: ${briefList.length}`);
  for(sidx=0; sidx < sidList.length; ++sidx) {
    let myList = _.filter(briefList, x => x.sid === sidList[sidx]);
    for(i=0; i<myList.length; ++i) {
      var myMasterRec = _.find(masterList, x => x.pid === myList[i].pid);
      if (!myMasterRec) {
        myMasterRec = new getBlankBriefRecord(BriefStat);
        myMasterRec.sid = PROCESSOVER;
        myMasterRec.pid = myList[i].pid;
        myMasterRec.playerName = myList[i].playerName;
        masterList.push(myMasterRec);
      }
      myMasterRec.score += myList[i].score;
      myMasterRec.inning += myList[i].inning;
      // batting details
      myMasterRec.run += myList[i].run;
      myMasterRec.four += myList[i].four;
      myMasterRec.six += myList[i].six;
      myMasterRec.fifty += myList[i].fifty;
      myMasterRec.hundred += myList[i].hundred;
      myMasterRec.ballsPlayed += myList[i].ballsPlayed;
      // bowling details
      myMasterRec.wicket += myList[i].wicket;
      myMasterRec.wicket3 += myList[i].wicket3;
      myMasterRec.wicket5 + myList[i].wicket5;
      myMasterRec.hattrick += myList[i].hattrick;
      myMasterRec.maiden += myList[i].maiden;
      // console.log(`${myMasterRec.pid} ${myMasterRec.playerName} ${myMasterRec.oversBowled}   ${myList[i].oversBowled}`);
      myMasterRec.oversBowled += myList[i].oversBowled
      // fielding details
      // runout: 0,
      // stumped: 0,
      // bowled: 0,
      // lbw: 0,
      // catch: 0,
      myMasterRec.runout += myList[i].runout;
      myMasterRec.stumped += myList[i].stumped;
      myMasterRec.bowled += myList[i].bowled;
      myMasterRec.lbw += myList[i].lbw;
      myMasterRec.catch += myList[i].catch;
      // overall performance
      myMasterRec.manOfTheMatch += myList[i].manOfTheMatch;
      myMasterRec.maxTouramentRun += myList[i].maxTouramentRun;
      myMasterRec.maxTouramentWicket += myList[i].maxTouramentWicket;
    }
    console.log(`Now deleting recrods with sid ${sidList[sidx]}`)
    await BriefStat.deleteMany({sid: sidList[sidx]})
  }
  masterList.forEach(x => {
    x.save();
  })
}


EMAILERROR="";
CRICDREAMEMAILID='cricketpwd@gmail.com';
sendEmailToUser = async function(userEmailId, userSubject, userText) {
  // USERSUBJECT='User info from CricDream';
  // USEREMAILID='salgia.ankit@gmail.com';
  // USERTEXT=`Dear User,
    
      // Greeting from CricDeam.
  
      // As requested by you here is login details.
  
      // Login Name: ${uRec.userName} 
      // User Name : ${uRec.displayName}
      // Password  : ${uRec.password}
  
      // Regards,
      // for Cricdream.`
    
  var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: CRICDREAMEMAILID,
    pass: 'Anob@1989#93'
  }
  });
  
  var mailOptions = {
  from: CRICDREAMEMAILID,
  to: userEmailId,
  subject: userSubject,
  text: userText
  };
  
  //mailOptions.to = uRec.email;
  //mailOptions.text = 
  
  var status = true;
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      EMAILERROR=error;
      //senderr(603, error);
      status=false;
    } else {
      //console.log('Email sent: ' + info.response);
      //sendok('Email sent: ' + info.response);
    }
    return(status);
  });
}

//------------- wallet function

createWalletTransaction = function () {
  myTrans = new Wallet();
  currTime = new Date();
  // Tue Dec 08 2020 14:22:21 GMT+0530 (India Standard Time)"
  myTrans.transNumber = currTime.getTime();
  let tmp = currTime.toString();
  let xxx = tmp.split(' ');
  myTrans.transDate = `${xxx[2]}-${xxx[1]}-${xxx[3]} ${xxx[4]}`;  
  myTrans.transType = "";
  myTrans.transSubType = "";
  myTrans.uid = 0;
  myTrans.gid = 0;
  myTrans.rank = 0;
  myTrans.transLink = 0;
  myTrans.amount = 0;
  myTrans.transStatus = true;
  return (myTrans);
}

WalletAccountOpen = async function (userid, openamount) {
  // console.log(`Account open for user ${userid} for amount ${openamount}`)
  let myTrans = createWalletTransaction();
  myTrans.transType = WalletTransType.accountOpen;
  myTrans.uid = userid;
  myTrans.amount = openamount;
  await myTrans.save();
  // console.log(myTrans);
  return myTrans;
}


WalletAccountOffer = async function (userid, offeramount) {
  let myTrans = createWalletTransaction();
  myTrans.transType = WalletTransType.offer;
  myTrans.uid = userid;
  myTrans.amount = offeramount;
  await myTrans.save();
  return myTrans;
}

//  = async function (userid, openamount) {
//   let myTrans = createWalletTransaction();
//   myTrans.transType = WalletTransType.offer;
//   myTrans.uid = userid;
//   myTrans.amount = openamount;
//   await myTrans.save();
//   return myTransWalletAccountOpen;
// }

WalletAccountGroupJoin = async function (groupid, userid, groupfee) {
  let myTrans = createWalletTransaction();
  myTrans.transType = WalletTransType.groupJoin;
  myTrans.gid = groupid;
  myTrans.uid = userid;
  myTrans.amount = -groupfee;
  await myTrans.save();
  return myTrans;
}

WalletAccountGroupCancel = async function (groupid, userid, groupfee) {
  let myTrans = createWalletTransaction();
  myTrans.transType = WalletTransType.groupCancel;
  myTrans.uid = userid;
  myTrans.gid = groupid;
  myTrans.amount = groupfee;
  await myTrans.save();
  return myTrans;
}

WalletBalance = async function (userid) {
  let tmp = 0;
  // let allRec = await Wallet.find({uid: userid});
  // if (allRec.length > 0)
  //   tmp = _.sumBy(allRec, x => x.amount);
  // db.articles.aggregate( [
  //   { $match: { $or: [ { score: { $gt: 70, $lt: 90 } }, { views: { $gte: 1000 } } ] } },
  //   { $group: { _id: null, count: { $sum: 1 } } }
  // ] );
  // iuserid = ;
  let xxx = await Wallet.aggregate([
    {$match: {uid: parseInt(userid)}},
    {$group : {_id : "$uid", balance : {$sum : "$amount"}}}
  ]);
  if (xxx.length === 1) tmp = xxx[0].balance;
  return tmp;
}


getPrizeTable = async function (count, amount) {
  let myPrize = await Prize.findOne({prizeCount: count})
  // we will keep 5% of amount
  // rest (i.e. 95%) will be distributed among users
  let totPrize = Math.floor(amount*0.95)
  let allotPrize = 0;
  let prizeTable=[]
  for(i=1; i<count; ++i) {
    let thisPrize = Math.floor(totPrize*myPrize["prize"+i.toString()]/100);
    prizeTable.push({rank: i, prize: thisPrize})
    allotPrize += thisPrize;
  }
  prizeTable.push({rank: count, prize: totPrize-allotPrize});
  return prizeTable;
}

GroupMemberCount = async function (groupid) {
  // let allRec = await GroupMember.find({gid: groupid});
  // return allRec.length;
//   > db.mycol.aggregate([{$group : {_id : "$by_user", num_tutorial : {$sum : 1}}}])
// { "_id" : "tutorials point", "num_tutorial" : 2 }
// { "_id" : "Neo4j", "num_tutorial" : 1 }
  let memberCount = 0;
  let xxx = await GroupMember.aggregate([
    {$match: {gid: parseInt(groupid)}},
    {$group : {_id : "$gid", num_members : {$sum : 1}}}
  ]);
  if (xxx.length === 1) memberCount = xxx[0].num_members;
  return(memberCount);
}
// module.exports = app;

