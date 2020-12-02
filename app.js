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
// set match type as T20 (used in playerstat)
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
fetchMasterSettings = async function () {
  if (masterRec === null) {
    let tmp = await MasterData.find();
    masterRec = tmp[0];  
  }  
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
  // 
  return sts;
}

// set tournament Started
updateTournamentStarted = async function (tournamentName) {
  let tRec = await Tournament.findOne({name: tournamentName, started: false});
  if (tRec) {
    tRec.started = true;
    tRec.save();
  }
};


// set tournament Over
updateTournamentOver = async function (tournamentName) {
  let tRec = await Tournament.findOne({name: tournamentName, over: false});
  if (tRec) {
    tRec.over = true;
    tRec.save();
  }
};

// check if all matches complete. If yes then set tournament over
checkTournamentOver = async function (tournamentName) {
  // check if any uncomplete match
  let matchesNotOver = await CricapiMatch.find({tournament: tournamentName, matchEnded: false});
  // if no uncomplete match then declare tournament as over
  if (matchesNotOver.length === 0) {
    await updateTournamentOver(tournamentName);
  }
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
  
// module.exports = app;

