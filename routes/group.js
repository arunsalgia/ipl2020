const { GroupMemberCount, } = require('./cricspecial'); 
var router = express.Router();
var GroupRes;
/* GET users listing. */

const fetchBalance = async (groupid) => {
  let gmRec = await GroupMember.find({ gid: groupid });
  gmRec = _.sortBy(gmRec, 'uid');

  var auctionList = await Auction.find({ gid: groupid });
  var balanceDetails = [];

  gmRec.forEach(gm => {
    myAuction = _.filter(auctionList, x => x.uid == gm.uid);
    var myPlayerCount = myAuction.length;
    var mybal = 1000 - _.sumBy(myAuction, 'bidAmount');
    balanceDetails.push({
      uid: gm.uid,
      userName: gm.userName,
      gid: gm.gid,
      playerCount: myPlayerCount,
      balance: mybal
    });
  });
  return _.sortBy(balanceDetails, 'userName');
}

router.use('/', function (req, res, next) {
  GroupRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; };

  if (req.url == '/')
    publish_groups({});
  else
    next('route');
});

router.get('/info/:groupid', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid } = req.params;

  gdoc = await IPLGroup.findOne({ gid: groupid, enable: true });
  if (!gdoc) {senderr(DBFETCHERR, "Could not fetch Group record"); return; }

  if (gdoc) { 
	let count = await GroupMemberCount(groupid);
	let tRec = await Tournament.findOne({name: gdoc.tournament});
    sendok({info: gdoc, currentCount: count, tournamentStarted: tRec.started});
  } else {
    senderr(601,`Invalid Group`);
  }
});


router.get('/close/:groupid/:ownerid', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid, ownerid } = req.params;
  // groupAction = groupAction.toLowerCase();
  // if (groupid != "1") { senderr(621, "Invalid Group"); return; }
  // if (ownerid != "9") { senderr(624, `User ${ownerid} is not owner of Group 1`); return; }

  gdoc = await IPLGroup.findOne({ gid: groupid });
  if (!gdoc) {senderr(DBFETCHERR, "Could not fetch Group record"); return; }

  if (gdoc.owner == ownerid) { 
    // console.log(gdoc);
    gdoc.tournamentOver = true;
    gdoc.save();
    sendok(true);
  } else {
    
  }
});

router.get('/gettournamentmax/:groupid', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid } = req.params;
  // groupAction = groupAction.toLowerCase();
  var groupRec = await IPLGroup.findOne({ gid: groupid });
  if (!groupRec) { senderr(621, "Invalid Group"); return; }

  var maxRec = {maxRunPid: 0, maxRunPlayer: "", maxRunValue: 0,
                maxWicketPid: 0, maxWicketPlayer: "", maxWicketValue: 0};
  var tournamentStat = mongoose.model(groupRec.tournament, StatSchema);
  var allRecs = await tournamentStat.find({});
  if (allRecs.length > 0) {
    var myPlayers = _.map(allRecs, 'pid');
    var myPlayers = _.uniq(myPlayers);
    var allPlayerInfo = await Player.find({pid: {$in: myPlayers}});
    console.log(allPlayerInfo);
    var myData = [];
    myPlayers.forEach(myPid => {
      var tmp = _.filter(allRecs, x => x.pid === myPid);
      var pRec = _.filter(allPlayerInfo, x => x.pid === myPid);   //   await Player.findOne({pid: myPid});
      myData.push({pid: myPid, playerName: pRec[0].name, 
          totalRun: _.sumBy(tmp, 'run'), 
          totalWicket: _.sumBy(tmp, 'wicket')})
    })
    myData = _.sortBy(myData, x => x.totalRun).reverse();
    maxRec.maxRunPid = myData[0].pid;
    maxRec.maxRunPlayer = myData[0].playerName;
    maxRec.maxRunValue = myData[0].totalRun;

    myData = _.sortBy(myData, x => x.totalWicket).reverse();
    maxRec.maxWicketPid = myData[0].pid;
    maxRec.maxWicketPlayer = myData[0].playerName;
    maxRec.maxWicketValue = myData[0].totalWicket;
  }
  sendok(maxRec);
});


function sendDataToClient(groupid, player, balance) {
  let myList = _.filter(connectionArray, x => x.gid == groupid && x.page === "AUCT");
  //console.log(myList);
  myList.forEach(x => {
    io.to(x.socketId).emit('playerChange', player, balance);
  });
}

function sendStatusToClient(groupid, newStatus) {
  let myList = _.filter(connectionArray, x => x.gid == groupid && x.page === "AUCT");
  //console.log(myList);
  myList.forEach(x => {
    io.to(x.socketId).emit('auctionStatus', newStatus);
  });
}


router.get('/getauctionstatus/:groupid', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid } = req.params;
  
  var gdoc = await IPLGroup.findOne({ gid: groupid});  
  if (!gdoc) {senderr(DBFETCHERR, "Could not fetch Group record"); return; }
  // let memberCount = GroupMemberCount(groupid);
  // if (memberCount !== gdoc.memberCount) {senderr(DBFETCHERR, "Could not fetch Group record"); return; }
  // // // if ((gdoc.auctionStatus === "RUNNING")) {
  //   const playerList = await Player.find({pid: gdoc.auctionPlayer});
  //   const balanceDetails = await fetchBalance(groupid);
  //   // console.log(`In Get Status: length is ${playerList.length}`);
  //   sendDataToClient(groupid, playerList[0], balanceDetails);
    sendok(gdoc.auctionStatus);
});



router.get('/setauctionstatus/:groupid/:newstate', async function (req, res, next) {
  GroupRes = res;
  setHeader();
  var { groupid, newstate } = req.params;
  var stateReq = newstate.toUpperCase().substring(0,3);

  var gdoc = await IPLGroup.findOne({ gid: groupid, enable: true});
  if (!gdoc) { 
    senderr(621, `Invalid group ${groupid}`); 
    return 
  }

  let memberCount = await GroupMemberCount(groupid);
  if (memberCount !== gdoc.memberCount) {
    senderr(622, "Insufficient member count"); 
    return; 
  }

  // console.log(gdoc);
  var aplayer = gdoc.auctionPlayer;
  switch (gdoc.auctionStatus) {
    case "PENDING":
      if (stateReq != "RUN") {
        senderr(625, `Invalid auction state ${newstate}`);
        return;
      }
      newstate = "RUNNING";
      sendStatusToClient(gdoc.gid, newstate);
      const playerList = await Player.find({tournament: gdoc.tournament});
      const balanceDetails = await fetchBalance(groupid);
      // const socket = app.get("socket");
      // console.log(playerList[0]);
      // socket.emit("playerChange",   playerList[0], balanceDetails )
      // socket.broadcast.emit('playerChange', playerList[0], balanceDetails );
      // var aucDataRec = _.find(auctioData, x => x.gid == groupid);
      // if (!aucDataRec) {
      //   aucDataRec = {gid: groupid, player: playerList[0], balance: balanceDetails };
      sendDataToClient(groupid, playerList[0], balanceDetails);
      //   auctioData.push(aucDataRec);
      // } else {
      //   aucDataRec.player = playerList[0];
      //   aucDataRec.balance = balanceDetails;
      // }
      // clientUpdateCount = CLIENTUPDATEINTERVAL+1;
      aplayer = playerList[0].pid;
      break;
    case "RUNNING":
      if (stateReq != "OVE") {
        senderr(625, `Invalid auction state ${newstate}`);
        return;
      }
      newstate = "OVER";
      sendStatusToClient(gdoc.gid, newstate);
      break;
    case "OVER":
      if (stateReq != "OVE") {
        senderr(625, `Invalid auction state ${newstate}`);
        return;
      }
      newstate = "OVER";
      break;
  }
  gdoc.auctionStatus = newstate;
  gdoc.auctionPlayer = aplayer;
  gdoc.currentBidUid = 0;
  gdoc.currentBidUser = "";
  gdoc.save();
  sendok(aplayer.toString());
});


router.get('/getfirstmatch/:groupid', async function (req, res, next) {
  GroupRes = res;
  setHeader();
  console.log("Hello");
  var { groupid } = req.params;
  if (isNaN(groupid))  { senderr(621, "Invalid Group"); return; }
  var igroup = parseInt(groupid);
  var mygroup = await IPLGroup.findOne({ gid: igroup });
  if (!mygroup) { senderr(621, "Invalid Group"); return; }
  var mymatch = await CricapiMatch.find({tournament: mygroup.tournament}).limit(1).sort({ "matchStartTime": 1 });
  console.log(mymatch);
  sendok(mymatch);
});

router.get('/getauctionplayer/:groupid',  async function (req, res, next) {
  GroupRes = res;
  setHeader();
  var { groupid } = req.params;

  var gdoc = await IPLGroup.findOne({ gid: groupid });
  if (!gdoc) { senderr(621, `Invalid Group ${groupid}`); return; }

  if (gdoc.auctionStatus === "RUNNING") {
    const playerDetails = await Player.find({pid:gdoc.auctionPlayer});
    const socket = app.get("socket");
    const balanceDetails = await fetchBalance(groupid);

    // console.log(balanceDetails);
    socket.emit("playerChange", playerDetails[0], balanceDetails )
    socket.broadcast.emit('playerChange', playerDetails[0], balanceDetails );
  }
  sendok(gdoc.auctionPlayer.toString());
});


router.get('/setauctionplayer/:groupid/:playerId', function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid, playerId } = req.params;
  // groupAction = groupAction.toLowerCase();
  if (groupid != "1") { senderr(621, "Invalid Group"); return; }
  if (isNaN(playerId)) { senderr(626, `Invalid Player ${playerId}`); return; }
  iplayer = parseInt(playerId);

  IPLGroup.findOne({ gid: 1 }, async (err, gdoc) => {
    if (gdoc === undefined) senderr(DBFETCHERR, "Could not fetch Group record");
    else {
      if (gdoc.auctionStatus != "RUNNING") {
        senderr(626, "Cannot update auction Player. Auction is not running");
      } else {
        gdoc.auctionPlayer = iplayer;
        gdoc.save();
        sendok(gdoc.auctionPlayer.toString());
      }
    }
  });
});

router.get('/add/:groupid/:ownerid/:userid', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid, ownerid, userid } = req.params;
  // igroup = parseInt(groupid);
  // if (isNaN(igroup)) { senderr(621, "Invalid group"); return; }
  // iowner = parseInt(ownerid);
  // if (isNaN(iowner)) { senderr(622, "Invalid owner"); return; }
  // iuser = parseInt(userid);
  // if (isNaN(iuser)) { senderr(623, "Invalid user"); return; }

  var gdoc = await IPLGroup.findOne({gid: groupid});
  if (!gdoc)  { senderr(621, "Invalid group"); return; }
  if (gdoc.owner != ownerid) { senderr(624, `User ${ownerid} is not owner of Group ${groupid}`); return; }

  var udoc = await User.findOne({ uid: userid });
  if (!udoc) { senderr(623, "Invalid user"); return; };

  var gmdoc = await GroupMember.findOne({ gid: gdoc.gid, uid: udoc.uid });
  if (gmdoc) {senderr(624, `User already member to group ${groupid}`); return; }

  //console.log("Valid USer;");              
  //  confirmed that Group  exists
  //  confirmed that owner of the group is correct
  //  confirmed that new user is correct                        
  //var myamount = 1000;
  // gid: Number,
  // uid: Number,
  // userName: String,
  // balanceAmount: Number,        // balance available to be used for bid
  // displayName: String,
  // enable: Boolean

  var gmrec = new GroupMember({
    gid: gdoc.gid,
    uid: udoc.uid,
    userName: udoc.displayName,
    balanceAmount: GROUP1_MAXBALANCE,
    displayName: udoc.displayName,      // franchise name as per user
    enable: true
  });
  gmrec.save();
  sendok(`Added user ${userid}; to Group ${groupid}`);
}); // end of get

router.get('/delete/:groupid/:ownerid/:userid', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid, ownerid, userid } = req.params;

  var gdoc = await IPLGroup.findOne({gid: groupid});
  if (!gdoc)  { senderr(621, "Invalid group"); return; }
  if (gdoc.owner != ownerid) { senderr(624, `User ${ownerid} is not owner of Group ${groupid}`); return; }
  // var udoc = await User.findOne({ uid: userid });
  // if (!uoc) { senderr(623, "Invalid user"); return; };

  var gmdoc = await GroupMember.findOne({ gid: gdoc.gid, uid: userid });
  if (!gmdoc) {senderr(624, `User not a member to group ${groupid}`); return; }
  // User.deleteOne({ age: { $gte: 10 } }).then(function(){
  await gmdoc.deleteOne({ gid: gdoc.gid, uid: userid })

  sendok(`Delete user ${userid} from Group ${groupid}`);
}); // end of get

router.get('/owner', function (req, res, next) {
  GroupRes = res;
  setHeader();

  owneradmin();
});

router.get('/owner', function (req, res, next) {
  GroupRes = res;
  setHeader();

  owneradmin();
});


router.get('/setprize/:groupid/:prizecount', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid, prizecount} = req.params;

  let gRec = await IPLGroup.findOne({gid: groupid});
  if (!gRec) {senderr(601, "invalid parameter"); return;}

  // let icount = parseInt(membercount);
  // if (isNaN(icount)) {senderr(601, "invalid parameter"); return;}
  // let ifee = parseInt(memberfee);
  // if (isNaN(ifee)) {senderr(601, "invalid parameter"); return;}
  
  // verify prize is not greater than member count
  let iprize = parseInt(prizecount);
  if (isNaN(iprize)) {senderr(601, "invalid parameter"); return;}
  if (iprize > gRec.memberCount) {senderr(601, "invalid parameter"); return;}
  gRec.prizeCount = iprize;
  gRec.save();
  sendok(gRec);
});


router.get('/create/:groupName/:ownerid/:maxbid/:mytournament/:membercount/:memberfee', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupName, ownerid, maxbid, mytournament, membercount, memberfee} = req.params;
  var tmp = await IPLGroup.find({});
  var tmp = _.filter(tmp, x => x.name.toUpperCase() === groupName.toUpperCase());
  if (tmp.length > 0) { senderr(601, `Duplicate Group name ${groupName}`); return; }

  //if (isNaN(maxbid)) { senderr(602, `Invalid max bid amount ${maxbid}`); return; }
  let imaxbid = parseInt(maxbid);

  var ownerRec = await User.findOne({uid: ownerid});
  if (!ownerRec) { senderr(603, `Invalid owner ${ownerid}`); return; }

  mytournament = mytournament.toUpperCase()
  var tournamentRec = await Tournament.findOne({ name: mytournament })
  if (!tournamentRec) { senderr(604, `Invalid tournament ${mytournament}`); return; }

  let myBal = await WalletBalance(ownerid);
  if (myBal < memberfee) { senderr(605, `Insufficient Balance`); return; }

  // ALl seems to be create. Assign gid for this group
  //Goods.find({}).sort({ price: 1 }).limit(1).then(goods => goods[0].price);
  var maxGid = await IPLGroup.find({}).sort({ gid: -1 }).limit(1);

  // gid: Number,
  // name: String,
  // owner: Number,
  // maxBidAmount: Number,
  // tournament: String,
  // auctionStatus: String,
  // auctionPlayer: Number,
  // auctionBid: Number,
  // currentBidUid: Number,
  // currentBidUser: String,
  // memberCount: Number,
  // memberFee: Number,
  // prizeCount: Number,
  // enable: Boolean

  var myRec = new IPLGroup();
  myRec.gid = maxGid[0].gid + 1;
  myRec.name = groupName;
  myRec.owner = ownerRec.uid;
  myRec.maxBidAmount = imaxbid;
  myRec.tournament = tournamentRec.name;
  myRec.auctionStatus = "PENDING";
  myRec.auctionPlayer = 0;
  myRec.auctionBid = 0;
  myRec.currentBidUid = 0;
  myRec.currentBidUser = "";
  myRec.enable = true;
  // new fields set default prize count as 1
  myRec.memberCount = membercount;
  myRec.memberFee = memberfee;
  myRec.prizeCount = 1;
  myRec.save();
  // console.log(myRec._id);

  await WalletAccountGroupJoin(myRec.gid, myRec.owner, memberfee);
  
  // Also add owner as group member
  // gid: Number,
  // uid: Number,
  // userName: String,
  // balanceAmount: Number,        // balance available to be used for bid
  // displayName: String,
  // score: Number,
  // rank: Number,
  // prize: Number,
  // enable: Boolean

  myGroupMemberRec = new GroupMember();
  myGroupMemberRec.gid = myRec.gid;
  myGroupMemberRec.uid = myRec.owner
  myGroupMemberRec.userName = ownerRec.displayName;
  myGroupMemberRec.balanceAmount = imaxbid;
  myGroupMemberRec.displayName = ownerRec.displayName;
  myGroupMemberRec.enable = true;
  // new fields
  myGroupMemberRec.score = 0;
  myGroupMemberRec.rank = 0;
  myGroupMemberRec.prize = 0;
  myGroupMemberRec.save();

  // now save and say okay to user
  sendok(myRec);

}); // end of get


router.get('/updatewithoutfee/:groupId/:ownerId/:membercount', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  let { groupId, ownerId, membercount } = req.params;

  //console.log(memberCount);
  //if (memberCount <= 1) {senderr(603, `Member count invalid  ${groupId}`); return;}
  let groupRec = await IPLGroup.findOne({gid: groupId});
  if (!groupRec) { senderr(601, `Invalid Group  ${groupId}`); return; }  
  if (groupRec.owner != ownerId) { senderr(602, `Invalid owner of Group  ${groupId}`); return; }
  let currentCount = await GroupMemberCount(groupRec.gid);
  console.log(currentCount);
  if (membercount < currentCount) {senderr(603, `Member count invalid  ${groupId}`); return;}
  // if new fee is higher than check if balance with owner
  // use 604 for insufficient balance
  // under what criteria groupedit is permitted
  // 1) AUction should not have been started i.e. it is pending
  if (groupRec.auctionStatus !== "PENDING") { senderr(604, `Cannot update. Auction has already started`);  return;}
  
  //groupRec.maxBidAmount = maxbid;
  //groupRec.tournament = mytournament.toUpperCase();
  //myRec.auctionStatus = "PENDING";
  //myRec.auctionPlayer = 0;
  //myRec.auctionBid = 0;
  //myRec.currentBidUid = 0;
  //myRec.currentBidUser = "";
  //myRec.enable = true;
  // new fields set default prize count as 1
  groupRec.memberCount = membercount;
  //groupRec.memberFee = memberfee;
  // myRec.prizeCount = 1;
  groupRec.save();

  sendok(groupRec);

}); // end of get

router.get('/updateprizecount/:groupId/:ownerId/:prizeCount', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  let { groupId, ownerId, prizeCount } = req.params;

  let groupRec = await IPLGroup.findOne({gid: groupId});
  if (!groupRec) { senderr(601, `Invalid Group  ${groupId}`); return; }
  if (groupRec.owner != ownerId) { senderr(602, `Invalid owner of Group  ${groupId}`); return; }
  //let currentCount = await GroupMemberCount(groupRec.gid);
  //if (membercount < currentCount) {senderr(603, `Member count invalid  ${groupId}`); return;}
  // if new fee is higher than check if balance with owner
  // use 604 for insufficient balance
  // under what criteria groupedit is permitted
  // 1) AUction should not have been started i.e. it is pending
  if (groupRec.auctionStatus !== "PENDING") { senderr(604, `Cannot update. Auction has already started`);  return;}
  
  //groupRec.maxBidAmount = maxbid;
  //groupRec.tournament = mytournament.toUpperCase();
  //myRec.auctionStatus = "PENDING";
  //myRec.auctionPlayer = 0;
  //myRec.auctionBid = 0;
  //myRec.currentBidUid = 0;
  //myRec.currentBidUser = "";
  //myRec.enable = true;
  // new fields set default prize count as 1
  //groupRec.memberCount = membercount;
  //groupRec.memberFee = memberfee;
  groupRec.prizeCount = prizeCount;
  groupRec.save();

  sendok(groupRec);

}); // end of get


router.get('/updatewithfee/:groupId/:ownerId/:maxbid/:mytournament/:membercount/:memberfee', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  let { groupId, ownerId, maxbid, mytournament, membercount, memberfee} = req.params;

  let groupRec = await IPLGroup.find({gid: groupId});
  if (!groupRec) { senderr(601, `Invalid Group  ${groupId}`); return; }
  if (groupRec.owner != ownerId) { senderr(602, `Invalid owner of Group  ${groupId}`); return; }
  let currentCount = await GroupMemberCount(groupRec.gid);
  if (membercount < currentCount) {senderr(603, `Member count invalid  ${groupId}`); return;}

  // if (membercount < groupMemberRecs.length) {senderr(603, `Member count invalid  ${groupId}`); return;}
  // under what criteria groupedit is permitted
  // 1) AUction should not have been started i.e. it is pending
  if (groupRec.auctionStatus !== "PENDING") { senderr(605, `Cannot update. Auction has already started`);  return;}

  // if new fee is higher then check if balance available with owner
  let groupMemberRecs = await GroupMember.find({gid: groupId});
  let feeDiff = memberFee - groupRec.memberFee;
  for (i=0; i<groupMemberRecs.length; ++i) {
    let mybal = WalletBalance(groupMemberRecs[i].uid);
    if (mybal < feeDiff) {
      senderr(604, `Insufficient Balance for Member ${groupMemberRecs[i].uid}`); 
      return;
    }
  }

  groupRec.maxBidAmount = maxbid;
  groupRec.tournament = mytournament.toUpperCase();
  //myRec.auctionStatus = "PENDING";
  //myRec.auctionPlayer = 0;
  //myRec.auctionBid = 0;
  //myRec.currentBidUid = 0;
  //myRec.currentBidUser = "";
  //myRec.enable = true;
  // new fields set default prize count as 1
  groupRec.memberCount = membercount;
  groupRec.memberFee = memberfee;
  // myRec.prizeCount = 1;
  groupRec.save();

  for (i=0; i<groupMemberRecs.length; ++i) {
      await WalletFeeChange(groupMemberRecs[i].uid, groupId, feeDiff);
  }

  sendok(groupRec);

}); // end of get


router.get('/join/:groupCode/:userid', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupCode, userid } = req.params;

  /*
  Validation list
  1) validate correct group id
  2) validate correct user id
  3) validate user has sufficeint balance
  4) validate current member count is less than configured by group owner
  5) validate tournament has not yet started
  6) validate user is not member of this group
  */
 let groupRec;
  try {
    let xxx = IPLGroup.findOne({_id: groupCode});
    groupRec = await xxx;
  } catch (err) {
    senderr(611, `Invalid Group code ${groupCode}`); return;
  }

  // this validation has to be streamline in more detail
  if (groupRec.auctionStatus !== "PENDING") { senderr(614, `Auction already started of Group code ${groupCode}`); return; }

  let userRec = await User.findOne({uid: userid});
  if (!userRec) { senderr(613, `Invalid user ${userid}`); return; }
  let userBalance = await WalletBalance(userRec.uid);
  if (userBalance < groupRec.memberFee) { senderr(615, `Insufficient User Balance`); return; }
  if (GroupMemberCount(groupRec.gid) >= groupRec.membercount) { senderr(616, `Member count exceed limit`); return; }

  let gmRec = await GroupMember.findOne({gid: groupRec.gid, uid: userRec.uid})
  if (gmRec) { senderr(612, `User already belongs to  Group with code ${groupCode}`); return; }

  // gid: Number,
  // uid: Number,
  // userName: String,
  // balanceAmount: Number,        // balance available to be used for bid
  // displayName: String,
  // score: Number,
  // rank: Number,
  // prize: Number,
  // enable: Boolean

  await WalletAccountGroupJoin(groupRec.gid, userRec.uid, groupRec.memberFee);

  let myGroupMemberRec = new GroupMember();
  myGroupMemberRec.gid = groupRec.gid;
  myGroupMemberRec.uid = userRec.uid;
  myGroupMemberRec.userName = userRec.displayName;
  myGroupMemberRec.balanceAmount = 1000;
  myGroupMemberRec.displayName = userRec.displayName;
  myGroupMemberRec.enable = true;
  myGroupMemberRec.score = 0;
  myGroupMemberRec.rank = 0;
  myGroupMemberRec.prize = 0;  
  myGroupMemberRec.save();
  
  userRec.defaultGroup = groupRec.gid;
  userRec.save();
  
  // now save okay to user
  sendok(groupRec);
}); 


// who is the owner of the group. Returns user record of the owner
function owneradmin() {
  let igroup = 1;   // currently only group 1 supported
  IPLGroup.findOne({ gid: 1 }, (err, grprec) => {
    if (!grprec) { senderr(621, "Invalid group"); return; }
    //console.log(grprec);
    User.findOne({ uid: grprec.owner }, (err, userrec) => {
      if (!userrec) { senderr(DBFETCHERR, `Could fetch record of user ${grprec.uid}`); return; }
      sendok(userrec);
    });
  });
};

router.get('/test', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  let ankit = await User.findOne({uid: 8});
  let ankit1 = await User.findOne({_id: ankit._id})
  console.log(ankit1);
  sendok(ankit1);
});

// requred duting sign in
// window.localStorage.setItem("uid", response.data)
// window.localStorage.setItem("gid", "1");
// window.localStorage.setItem("groupName", "Friends of Happy Home Society");
// window.localStorage.setItem("tournament", "IPL2020");

router.get('/setdefaultgroup/:myUser/:myGroup', async function (req, res, next) {
  GroupRes = res;
  setHeader();
  var {myUser, myGroup}=req.params;

  var userRec = await User.findOne({uid: myUser});
  if (!userRec) { senderr(623, "Invalid user"); return; }

  // var gmRec = await IPLGroup.findOne({gid: 2, uid: 8});
  var gmRec = await GroupMember.findOne({gid: myGroup, uid: myUser});
  if (!gmRec) { senderr(624, "Invalid Group"); return; }

  userRec.defaultGroup = myGroup;
  userRec.save();
  sendok("OK");
});

router.get('/setfranchisename/:myUser/:myGroup/:myDisplayName', async function (req, res, next) {
  GroupRes = res;
  setHeader();
  var {myUser, myGroup, myDisplayName}=req.params;

  var gmRec = await GroupMember.findOne({gid: myGroup, uid: myUser});
  if (gmRec) {
    gmRec.displayName = myDisplayName
    //console.log(gmRec);
    gmRec.save();
    sendok("OK");
  } else { 
    senderr(624, "Invalid Group"); 
  }
});

router.get('/getfranchisename/:myUser/:myGroup', async function (req, res, next) {
  GroupRes = res;
  setHeader();
  var {myUser, myGroup}=req.params;

  var gmRec = await GroupMember.findOne({gid: myGroup, uid: myUser});
  if (gmRec) {
    // console.log(gmRec);
    sendok(gmRec.displayName);
  } else { 
    senderr(624, "Invalid Group"); 
  }
});

router.get('/default/:myUser', async function (req, res, next) {
  GroupRes = res;
  setHeader();
  var {myUser}=req.params;

  // get user rec
  var userRec = await User.findOne({uid: myUser});
  if (!userRec) { senderr(623, "Invalid user"); return; }

  var myGmRec;
  if (userRec.defaultGroup > 0)
    myGmRec = await GroupMember.find({uid: userRec.uid, gid: userRec.defaultGroup});
  else
    myGmRec = await GroupMember.find({uid: myUser}).limit(-1).sort({ "gid": -1 });
  var myData = {uid: myUser, gid: 0, displayName: "", groupName: "", tournament: "", admin: false};
  if (myGmRec.length > 0) {
    // console.log(myGmRec[0].gid);
    var myGroup = await IPLGroup.findOne({gid: myGmRec[0].gid});
    myData.gid = myGmRec[0].gid;
    myData.userName = userRec.displayName;
    myData.displayName = myGmRec[0].displayName;
    myData.groupName = myGroup.name;
    myData.tournament = myGroup.tournament;
    myData.admin = (myUser == myGroup.owner);
  } 
  // console.log(myData);
  sendok(myData);
});


// requred duting change of current group
// window.localStorage.setItem("uid", response.data)
// window.localStorage.setItem("gid", "1");
// window.localStorage.setItem("groupName", "Friends of Happy Home Society");
// window.localStorage.setItem("tournament", "IPL2020");
router.get('/current/:myGroup/:myUser', async function (req, res, next) {
  GroupRes = res;
  setHeader();
  var {myGroup, myUser}=req.params;

  // get user rec
  var userRec = await User.findOne({uid: myUser});
  if (!userRec) { senderr(623, "Invalid user"); return; }
  var groupRec = await IPLGroup.findOne({gid: myGroup})
  if (!groupRec) { senderr(621, `Invalid group ${myGroup}`); return; }

  var myData = {uid: myUser, gid: myGroup, displayName: "", groupName: "", tournament: "", ismember: false, admin: false};
  myData.groupName = groupRec.name;
  myData.tournament = groupRec.tournament;
  myData.admin = (myUser == groupRec.owner);

  var myGmRec = await GroupMember.findOne({gid: myGroup, uid: myUser});
  if (myGmRec) {
    myData.displayName = myGmRec.displayName;
    myData.ismember = true;
  } else {
      myData.displayName = myGroup.displayName;
      myData.ismember = false;    // owner but not member. Remember Apurva
  }
  sendok(myData);
});

router.get('/gamestarted/:mygroup', async function (req, res, next) {
  GroupRes = res;
  setHeader();
  var {mygroup}=req.params;
  if (isNaN(mygroup)) { return senderr(621, `Invalid group ${mygroup}`); return; }
  var igroup = parseInt(mygroup);
  var msg = await tournament_started(igroup);
  sendok(msg);
});

// list of group of which user is the member
router.get('/memberof/:userid', async function(req, res, next) {
  GroupRes = res;
  setHeader();
  var {userid}=req.params;

  // check if valid user
  var myUser = await User.findOne({uid: userid})
  if (!myUser) { senderr(623, `Invalid user id ${userid}`); return;}
  // console.log(`${userid} is valid`)

  var myGmRec = await GroupMember.find ({uid: userid});
  // console.log(myGmRec);
  var allGroups = await IPLGroup.find({enable: true});
  // console.log(allGroups);
  // console.log(allGroups);
  var gData = [];
  allGroups.forEach(ggg => {
    var tmp = myGmRec.find(x => x.gid === ggg.gid);
    // console.log(ggg.gid);
    // console.log(tmp);
    if (tmp) {
      var isDefault = tmp.gid === myUser.defaultGroup;
      var adminSts = (tmp.uid === ggg.owner) //? "Admin" : "";
      var xxx =  { gid: tmp.gid, displayName: tmp.displayName, 
        groupName: ggg.name, tournament: ggg.tournament, 
        admin: adminSts, defaultGroup: isDefault};
        gData.push(xxx)
    }
  });
  gData = _.sortBy(gData, x => x.gid).reverse();
  // console.log(gData);
  var groupData = [];
  groupData.push({ uid: myUser.uid, userName: myUser.userName, displayName: myUser.displayName, groups: gData});
  // console.log("about to send ok")
  sendok(groupData);
});

async function update_tournament_max(groupno) {
  // first find maximum of run scored by batsman and wickets taken by bowler 
  // get list of players beloging to group
  //var auctionList = await Auction.find({gid: groupno});
  //var allplayers = _.map(auctionList, 'pid');
  var playersList = await Player.find({});
  var allplayers = _.map(playersList, 'pid');
  //ar maxRuns, maxWickets, maxRunsPlayer, maxWicketsPlayer;
  var statList = await Stat.find({ pid: { $in: allplayers } });
  var maxStat = [];
  allplayers.forEach(mypid => {
    var playerStat = _.filter(statList, x => x.pid == mypid);
    if (playerStat.length === 0) return;
    var myruns = _.sumBy(playerStat, 'run');
    var mywkt = _.sumBy(playerStat, 'wicket');
    if ((myruns + mywkt) === 0) return;
    maxStat.push({ pid: mypid, run: myruns, wicket: mywkt });
  });
  // console.log(maxStat);
  // we now have players total of run an wickets.  Get max run and wicket
  var maxRunRec = _.maxBy(maxStat, o => o.run);
  var maxWicketRec = _.maxBy(maxStat, o => o.wicket);
  // get all records with max runs and max wickets
  var allMaxRunRec = _.filter(maxStat, x => x.run == maxRunRec.run);
  var allMaxWicketRec = _.filter(maxStat, x => x.wicket == maxWicketRec.wicket);
  sendok(allMaxWicketRec);
}

function publish_groups(filter_groups) {
  IPLGroup.find(filter_groups, (err, glist) => {
    if (glist)
      sendok(glist);
    else
      senderr(DBFETCHERR, "Unable to fetch Groups from database");
  });
}

// return true if IPL has started
async function tournament_started(mygroup) {
  var justnow = new Date();
  var groupRec = await IPLGroup.findOne({gid: mygroup})
  if (!groupRec) return("Invalid Group");
  var mymatch = await CricapiMatch.find({tournament: groupRec.tournament}).limit(1).sort({ "matchStartTime": 1 });
  // console.log(mymatch.length);
  var difference = 1;   // make it positive if no match schedule
  if (mymatch.length > 0) {
    var firstMatchStart = mymatch[0].matchStartTime;  
    firstMatchStart.setHours(firstMatchStart.getHours() - 1)
    difference = firstMatchStart - justnow;
  }
  // console.log(difference);
  return (difference <= 0) ? `${groupRec.tournament} has started!!!! Cannot set Captain/Vice Captain` : "";
}

function senderr(errcode, msg) { GroupRes.status(errcode).send(msg); }
function sendok(msg) { GroupRes.send(msg); GroupRes.end(); }
function setHeader() {
  GroupRes.header("Access-Control-Allow-Origin", "*");
  GroupRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

}
module.exports = router;