// const { multiply } = require("lodash");
var router = express.Router();
const { 
  akshuGetGroup, akshuUpdGroup, akshuGetGroupMembers,
  akshuGetAuction, akshuGetTournament,
  getTournamentType,
} = require('./cricspecial'); 

// let AuctionRes;

router.use('/', function(req, res, next) {
  // AuctionRes = res;
  setHeader(res);
  if (!db_connection) { senderr(res, DBERROR, ERR_NODB); return; }
  next('route');
});

const SAMEPLAYER=true;
const NOTSAMEPLAYER=false;
var auctionUser = {};
var auctionGroup = {};
var auctionGroupMembers = {};
var auctionAllPlayers = {};
var auctionSoldPlayers = {};
var auctionNewPlayer = {};
var skippedPlayerList = {};



function calculateBalance(arpanaGID) {
  // calculate fresh balance for all users to be submitted to caller
  let myList = _.sortBy(auctionGroupMembers[arpanaGID], 'uid');
  var balanceDetails = [];
  myList.forEach(gm => {
    var myAuction = _.filter(auctionSoldPlayers[arpanaGID], x => x.uid == gm.uid);
    var myPlayerCount = myAuction.length;
    var mybal = auctionGroup[arpanaGID].maxBidAmount - _.sumBy(myAuction, 'bidAmount');
    balanceDetails.push({
      uid: gm.uid,
      userName: gm.displayName,
      gid: gm.gid,
      playerCount: myPlayerCount,
      balance: mybal
    });
  });
  return balanceDetails;
}

function sendNoPlayerToClient(myGid) {
  let myList = _.filter(connectionArray, x => x.gid == myGid && x.page === "AUCT");
  myList.forEach(x => {
    io.to(x.socketId).emit('noPlayer', "No Player Available");
  });
}

async function processNextPlayer(res, isItSamePlayer, howToSend, kratiGID, kratiUID) {

  if (isItSamePlayer === NOTSAMEPLAYER) {
    // console.log(skippedPlayerList);
    // identify players who are still not sold and thus are available for purchase
    var soldPlayerId = _.map(auctionSoldPlayers[kratiGID], 'pid');
    var allUnsoldPlayerList = _.filter(auctionAllPlayers[kratiGID], x => !soldPlayerId.includes(x.pid) );
    // now remove the skipped players
    var skipPlayerId = _.map(skippedPlayerList[kratiGID], 'pid');
    //console.log(skipPlayerId);
    var allPlayers = _.filter(allUnsoldPlayerList, x => !skipPlayerId.includes(x.pid) );
    // cehck if no player available. 
    // We will now use skipped players
    if (allPlayers.length === 0) {
      console.log("Will be using skipped players")
      // removed all players from skipped player table
      await SkippedPlayer.deleteMany({gid: kratiGID})
      // use unsold player list (not to removed skipped players now.)
      allPlayers = [].concat(allUnsoldPlayerList);
    }
    // console.log(`Balance players ${allPlayers.length} Sold Players ${soldPlayerId.length} Skipped players ${skipPlayerId.length}`);

	// finally check if any player available 
	if (allPlayers.length === 0) {
		auctionGroup[kratiGID].auctionPlayer = 0;
		auctionGroup[kratiGID].auctionBid = 0;
		auctionGroup[kratiGID].currentBidUid = 0;
		auctionGroup[kratiGID].currentBidUser = '';
		auctionGroup[kratiGID].auctionStatus = "OVER";
		// console.log(auctionGroup);
		auctionGroup[kratiGID].save();
		akshuUpdGroup(auctionGroup[kratiGID]);
		
		if (howToSend === SENDSOCKET) {
			sendNoPlayerToClient(kratiGID);  //, auctionNewPlayer[kratiGID], newBalance);
		}
		sendok(res, "OVER");
	}
	
    // select new player  
    var myIndex;
    myIndex = Math.floor( Math.random() * allPlayers.length );
    auctionGroup[kratiGID].auctionPlayer = allPlayers[myIndex].pid;
    auctionGroup[kratiGID].auctionBid = 0;
    auctionGroup[kratiGID].currentBidUid = 0;
    auctionGroup[kratiGID].currentBidUser = '';
    // console.log(auctionGroup);
    auctionGroup[kratiGID].save();
    akshuUpdGroup(auctionGroup[kratiGID]);

    sendNewBidToClient(auctionGroup[kratiGID]);
    auctionNewPlayer[kratiGID] = allPlayers[myIndex]; 
  }
  
  let newBalance = calculateBalance(kratiGID);
  if (howToSend === SENDSOCKET) {
    sendPlayerChangeToClient(kratiGID, auctionNewPlayer[kratiGID], newBalance);
    // console.log(newBalance);
    sendok(res, auctionNewPlayer[kratiGID]);
  } else {
      sendok(res, {a: auctionNewPlayer[kratiGID], b: newBalance});
  }
  return;
}


router.get('/add/:igroup/:iuser/:iplayer/:ibid', async function(req, res, next) {
  // AuctionRes = res;
  setHeader(res);
  var {igroup,iuser,iplayer,ibid}=req.params;

  if (isNaN(ibid)) { senderr(res, 705, "Invalid bid amount"); return;} 

  // validate user
  let tmp = await User.findOne({uid: iuser});
  if (!tmp) { senderr(res, 701, `Invalid user ${iuser}`); return; }
  let arunUID = tmp.uid;
  auctionUser[arunUID] = tmp;

  // validate group and user
  tmp = await IPLGroup.findOne({gid: igroup});
  if (!tmp) {senderr(res, 702, "Invalid Group"); return;}
  let arunGID = tmp.gid;
  auctionGroup[arunGID] = tmp;

  var PallPlayers = Player.find({tournament: auctionGroup[arunGID].tournament});
  var PauctionList = Auction.find({gid: arunGID});

  auctionGroupMembers[arunGID] = await GroupMember.find({gid: arunGID});
  tmp = _.filter(auctionGroupMembers[arunGID], x => x.uid === arunUID);
  if (tmp.length === 0) {
    senderr(res, 706, `User ${iuser} does not belong to Group 1`);
    return;
  }
  
  // Step 3: Player is part if the tournament configured in group.
  auctionAllPlayers[arunGID] = await PallPlayers;
  var myplayer = _.find(auctionAllPlayers[arunGID], x => x.pid == iplayer);
  // console.log(myplayer);
  if (!myplayer) {
    senderr(res, 704, `Player ${iplayer} does not belong to touranament ${auctionGroup[arunGID].tournament}`);
    return;
  }

  // Step 4: Player is available for purchase
  auctionSoldPlayers[arunGID] = await PauctionList;
  tmp = _.find(auctionSoldPlayers[arunGID], x => x.pid == iplayer);
  if (tmp) {
    senderr(res, 707, `Player ${iplayer} already purchased`);
    return;
  }
  
  // Step 5: User has not purchased maximum allowed player in auction
  let myAuctionList = _.filter(auctionSoldPlayers[arunGID], x => x.uid == iuser);
  // if (myAuctionList.length === defaultMaxPlayerCount) {
  //   senderr(res, 709, `Max player purchase count reached. Cannot buy additional player.`);
  //   return;
  // }

  // Step 6: User has sufficient balance to purhcase the player at given bid amount
  var balance = auctionGroup[arunGID].maxBidAmount - _.sumBy(myAuctionList, x => x.bidAmount);
  if (balance < ibid ) {
    senderr(res, 708, `Insufficient balance. Bid balance available is ${balance}`);
    return;
  }
  
  // All validation done. Now add player in user's kitty
  var bidrec = new Auction({ 
    uid: arunUID,
    pid: iplayer,
    playerName: myplayer.name,
    team: myplayer.Team,
    gid: arunGID,
    bidAmount: ibid 
  });
  bidrec.save();
  auctionSoldPlayers[arunGID].push(bidrec);        // now this player is also sold

  // send player added  user's auction kitty
  sendBidOverToClient({gid: arunGID, uid: arunUID, bidAmount: ibid, 
    userName: auctionUser[arunUID].displayName, 
    playerName: myplayer.name});
  
  skippedPlayerList[arunGID] = await SkippedPlayer.find({gid: arunGID});
  await processNextPlayer(res, NOTSAMEPLAYER, SENDSOCKET, arunGID, arunUID);
  return;
  // now find all unsold players 
  // remember that iplayer just got sold, thus will not be part of unsold player list
  var soldPlayerId = _.map(auctionSoldPlayers, 'pid');
  soldPlayerId.push(auctionCurrentPlayerId);
  sendok(res, soldPlayerId);
  return; 

  // identify players who are still not sold and thus are available for purchase
  allPlayers = _.filter(allPlayers, x => 
    x.tournament == gRec.tournament &&
    !soldPlayerId.includes(x.pid)
    );

  var myindex = _.findIndex(allPlayers, (x) => { return x.pid == iplayer});
  ++myindex;
  if (myindex === allPlayers.length) myindex = 0;

  // update new player in Group auction player and reset bid details
  gRec.auctionPlayer = allPlayers[myindex].pid;
  gRec.auctionBid = 0;
  gRec.currentBidUid = 0;
  gRec.currentBidUser = '';
  gRec.save();
  
  // calculate fresh balance for all users to be submitted to caller
  var gmembers = _.sortBy(gmembers, 'uid');
  var balanceDetails = [];
  gmembers.forEach(gm => {
    myAuction = _.filter(auctionList, x => x.uid == gm.uid);
    var myPlayerCount = myAuction.length;
    var mybal = gRec.maxBidAmount - _.sumBy(myAuction, 'bidAmount');
    if (gm.uid === iuser) {
      // this user has purchased just now new player with amount "ibit"
      // take care of if
      ++myPlayerCount;
      mybal = mybal - ibid;
    }
    balanceDetails.push({
      uid: gm.uid,
      userName: gm.displayName,
      gid: gm.gid,
      playerCount: myPlayerCount,
      balance: mybal
    });
  });

  // const socket = app.get("socket");
  // socket.emit("playerChange", allPlayers[myindex], balanceDetails)
  // socket.broadcast.emit('playerChange', allPlayers[myindex], balanceDetails);
  sendPlayerChangeToClient(igroup, allPlayers[myindex], balanceDetails);
  sendNewBidToClient(gRec);
  sendok(res, allPlayers[myindex]);
});

function sendPlayerChangeToClient(groupId, pData, bData) {
  var myList = _.filter(connectionArray, x => x.gid == groupId && x.page === "AUCT");
  // console.log(myList);
  myList.forEach(x => {
    io.to(x.socketId).emit('playerChange', pData, bData);
  });

}
function sendBidOverToClient(bidData) {
  var myList = _.filter(connectionArray, x => x.gid == bidData.gid && x.page === "AUCT");
  // console.log(myList);
  myList.forEach(x => {
    io.to(x.socketId).emit('bidOver', bidData);
  });
}

function sendNewBidToClient(groupRec) {
  var myList = _.filter(connectionArray, x => x.gid == groupRec.gid && x.page === "AUCT");
  // console.log(myList);
  myList.forEach(x => {
    io.to(x.socketId).emit('newBid', groupRec);
  });
}

function sendCountDownToClient(groupRec, count) {
  //console.log(connectionArray);
  //console.log(groupRec);
  var myList = _.filter(connectionArray, x => x.gid == groupRec.gid && x.page === "AUCT");
  // console.log(myList);
  myList.forEach(x => {
	console.log("Sending message to", x.gid, x.uid);
    io.to(x.socketId).emit('countDown', {countDown: count});
  });
}

router.get('/countdown/:groupId/:count', async function (req, res, next) {
  setHeader(res);
  var {groupId, count }=req.params;
  groupId = Number(groupId);
  count = Number(count);

  //console.log("Countdown ", groupId, count);
  let myGroup = await akshuGetGroup(groupId);
  sendCountDownToClient(myGroup, count);
  sendok(res, "Done");
});

router.get('/nextbid/:groupId/:userId/:playerId/:bidAmount', async function(req, res, next) {
  // AuctionRes = res;
  setHeader(res);
  var {groupId, userId, playerId, bidAmount}=req.params;
  
  if (isNaN(bidAmount)) { senderr(res, 713, `Incorrect Bid amount ${bidAmount}`); return; }   
  let iamount = parseInt(bidAmount);
  
  var groupRec = await IPLGroup.findOne({gid: groupId});
  if (!groupRec) { senderr(res, 711, `Invalid Group ${groupId}`); return; }  

  if (groupRec.auctionStatus !== AUCT_RUNNING) { senderr(res, 714, `Auction not running`); return; }  
  if (groupRec.currentBidUid == userId) { senderr(res, 711, `User bid already registred`); return; }  
  if (groupRec.auctionPlayer != playerId) { senderr(res, 712, `Bid for incorrect player`); return; }  
  if ((iamount > groupRec.maxBidAmount) || (iamount <= groupRec.auctionBid )) { senderr(res, 713, `Incorrect Bid Amount`); return; }  
  
  var tmp = await GroupMember.findOne({gid: groupId, uid: userId});
  if (!tmp) { senderr(res, 711, `Invalid Group ${groupId}`); return; }   
  var userRec = await User.findOne({uid: userId})
  /*
   auctionStatus: String,
  auctionPlayer: Number,
  auctionBid: Number,
  currentBidUid: Number,
  currentBidUser: String,
  */
//  console.log(iamount);
//  console.log(groupRec);
  if ((groupRec.auctionStatus === AUCT_RUNNING) && (iamount > groupRec.auctionBid) &&
      (groupRec.maxBidAmount >= iamount)) {
        groupRec.auctionBid = iamount;
        groupRec.currentBidUid = userRec.uid;
        groupRec.currentBidUser = userRec.displayName;
        groupRec.save();
        akshuUpdGroup(groupRec);
        sendNewBidToClient(groupRec);
        sendok(res, "OK");
  } else {
    senderr(res, 712,"Invalid bid amount")
  }
});


router.get('/getbid/:groupId', async function(req, res, next) {
  // AuctionRes = res;
  setHeader(res);
  var {groupId}=req.params;
  var groupRec = await IPLGroup.findOne({gid: groupId});
  if (!groupRec) { senderr(res, 702, `Invalid Group ${groupId}`); return; }   
  if ((groupRec.auctionStatus === AUCT_RUNNING)) {
        // sendNewBidToClient(groupRec);
        sendok(res, groupRec);
  } else {
    senderr(res, 702,"Invalid bid amount")
  }
});



// to provide next player available for auction
router.get('/skip/:groupId/:playerId', async function(req, res, next) {
  // AuctionRes = res;
  setHeader(res);
  var {groupId,playerId}=req.params;

  // validate group and user
  
  let akshuUID = 0;       // not provided by user

  let tmp = await IPLGroup.findOne({gid: groupId});
  if (!tmp) {senderr(res, 702, "Invalid Group"); return;}
  let akshuGID = tmp.gid;
  auctionGroup[akshuGID] = tmp;

  var PallPlayers = Player.find({tournament: auctionGroup[akshuGID].tournament});
  var PauctionList = Auction.find({gid: akshuGID});

  auctionGroupMembers[akshuGID] = await GroupMember.find({gid: akshuGID});
  auctionAllPlayers[akshuGID] = await PallPlayers;
  var myplayer = _.find(auctionAllPlayers[akshuGID], x => x.pid == playerId);
  // console.log(myplayer);
  if (!myplayer) {
    senderr(res, 704, `Player ${playerId} does not belong to touranament ${auctionGroup[akshuGID].tournament}`);
    return;
  }

  // remove this player if player is skipped
  // console.log(auctionAllPlayers.length);
  // auctionAllPlayers = _.remove(auctionAllPlayers, x => x.pid !== myplayer.pid);
  // console.log(auctionAllPlayers.length);

  // add this player in skipped list (Resolved bug:  IMP IMP -- if not already there)
  skippedPlayerList[akshuGID] = await SkippedPlayer.find({gid: akshuGID});
  let skpRec = _.find(skippedPlayerList[akshuGID], x => x.pid === myplayer.pid);
  if (!skpRec) {
    skpRec = new SkippedPlayer({
      gid: akshuGID,
      pid: myplayer.pid,
      playerName: myplayer.name,
      tournament: myplayer.tournament
    });
    skpRec.save();
    skippedPlayerList[akshuGID].push(skpRec);
  }  
  // console.log("Total skipped players");
  // console.log(skippedPlayerList.length);

  auctionSoldPlayers[akshuGID] = await PauctionList;
  await processNextPlayer(res, NOTSAMEPLAYER, SENDSOCKET, akshuGID, akshuUID);
  return;
  // now find all unsold players 

  return

  if (isNaN(groupId)) { senderr(res, 702, `Invalid Group ${groupId}`); return; }
  var igroup = parseInt(groupId);
  
  var PallPlayers = Player.find({});
  var PmyGroup = IPLGroup.find({gid: igroup});
  var PauctionList = Auction.find({gid: igroup});
  var Pgmembers = GroupMember.find({gid: igroup});

  if (isNaN(playerId)) { senderr(res, 704, "Invalid Player"); return;}
  var iplayer = parseInt(playerId);
 
  // validate group number
  var myGroup = await PmyGroup;
  if (myGroup.length != 1) { senderr(res, 702, `Invalid Group ${groupId}`); return; }

  // make sold player list pid
  var auctionList = await PauctionList;
  var soldPlayerId = _.map(auctionList, 'pid');

  var allPlayers = await PallPlayers;
  var allPlayers = _.filter(allPlayers, x => x.tournament == myGroup[0].tournament);
  var myplayer = _.find(allPlayers, {tournament: myGroup[0].tournament, pid: iplayer});
  if (!myplayer) {
    senderr(res, 704, `Invalid player ${iplayer}`);
    return
  }

  // identify players who are still not sold
  allPlayers = _.filter(allPlayers, x => x.tournament == myGroup[0].tournament);
  var myindex = _.findIndex(allPlayers, (x) => { return x.pid == iplayer});
  ++myindex;
  if (myindex === allPlayers.length) myindex = 0;
  while (true) {
    if (!soldPlayerId.includes(allPlayers[myindex].pid)) break;
    ++myindex;
  }

  // update new player in Group auction player field and save
  myGroup[0].auctionPlayer = allPlayers[myindex].pid;
  myGroup[0].save();

  // calculate fresh balance for all users
  var gmembers = await Pgmembers;
  gmembers = _.sortBy(gmembers, 'uid');
  var balanceDetails = [];
  gmembers.forEach(gm => {
    myAuction = _.filter(auctionList, x => x.uid == gm.uid);
    var myPlayerCount = myAuction.length;
    var mybal = myGroup[0].maxBidAmount - _.sumBy(myAuction, 'bidAmount');
    balanceDetails.push({
      uid: gm.uid,
      userName: gm.displayName,
      gid: gm.gid,
      playerCount: myPlayerCount,
      balance: mybal
    });
  });

  const socket = app.get("socket");
  socket.emit("playerChange", allPlayers[myindex], balanceDetails)
  socket.broadcast.emit('playerChange', allPlayers[myindex], balanceDetails);
  sendok(res, allPlayers[myindex]);
});


router.get('/arun/:groupId', async function(req, res, next) {
  // AuctionRes = res;
  setHeader(res);
  var {groupId}=req.params;
  groupId = Number(groupId);

  let myData = await akshuGetAuction(groupId);
  sendok(res, myData);
});

router.get('/current/:groupId', async function(req, res, next) {
  // AuctionRes = res;
  setHeader(res);
  var {groupId}=req.params;
  
  let ankitUID = 0;       // not provided by user

  let tmp = await IPLGroup.findOne({gid: groupId});
  if (!tmp) { senderr(res, 702, `Invalid Group ${groupId}`); return; }
  let ankitGID = tmp.gid;
  auctionGroup[ankitGID] = tmp;

  // var PallPlayers = Player.find({tournament: auctionGroup.tournament});
  var PauctionList = Auction.find({gid: ankitGID});
  auctionGroupMembers[ankitGID] = await GroupMember.find({gid: ankitGID});
  auctionNewPlayer[ankitGID] = await Player.findOne(
    {tournament: auctionGroup[ankitGID].tournament, 
    pid: auctionGroup[ankitGID].auctionPlayer});

  auctionSoldPlayers[ankitGID] = await PauctionList;
  await processNextPlayer(res, SAMEPLAYER, SENDRES, ankitGID, ankitUID);
  return;
  // var igroup = myGroup.gid;
  // var playerId = myGroup.auctionPlayer;
  if (myGroup.auctionPlayer === 0) { senderr(res, 704, "Invalid Player"); return;}
  console.log(`I am ${playerId}`);



  // make sold player list pid
  var auctionList = await PauctionList;
  // var soldPlayerId = _.map(auctionList, 'pid');

  var myplayer = await Player.findOne({tournament: myGroup.tournament, pid: playerId});
  if (!myplayer) {
    senderr(res, 704, `Invalid player ${iplayer}`);
    return
  }
  // console.log(myplayer);
  // calculate fresh balance for all users
  var gmembers = await Pgmembers;
  gmembers = _.sortBy(gmembers, 'uid');
  var balanceDetails = [];
  gmembers.forEach(gm => {
    myAuction = _.filter(auctionList, x => x.uid == gm.uid);
    var myPlayerCount = myAuction.length;
    var mybal = myGroup.maxBidAmount - _.sumBy(myAuction, 'bidAmount');
    balanceDetails.push({
      uid: gm.uid,
      userName: gm.displayName,
      gid: gm.gid,
      playerCount: myPlayerCount,
      balance: mybal
    });
  });
  
  /*
  cannot send data over socket since when called. Auction view
  has not made the socket connection with server
  */
  // console.log(balanceDetails);
  // const socket = app.get("socket");
  // console.log(connectionArray);
  // socket.emit("playerChange", myplayer, balanceDetails)
  // socket.broadcast.emit('playerChange', myplayer, balanceDetails);
  // sendok(res, myplayer);
  // console.log("Current Sent");
  sendok(res, {a: myplayer, b: balanceDetails});
});

// async function publish_auctions(auction_filter)
// {
//   auctionList = await Auction.find(auction_filter); 
//   //console.log(auctionList)
//   //const myOrderedArray = _.sortBy(myArray, o => o.name)
//   auctionList = _.sortBy(auctionList, a => a.uid);
//   sendok(res, auctionList);
// }

// function fetchBalance(gmembers, auctionList, maxBidAmount, iuser, ibid) {
//   gmembers = _.sortBy(gmembers, 'uid');
//   var balanceDetails = [];
//   gmembers.forEach(gm => {
//     myAuction = _.filter(auctionList, x => x.uid == gm.uid);
//     var myPlayerCount = myAuction.length;
//     var mybal = maxBidAmount - _.sumBy(myAuction, 'bidAmount');
//     if (gm.uid === iuser) {
//       // this user has purchased just now new player with amount "ibit"
//       // take care of if
//       ++myPlayerCount;
//       mybal = mybal - ibid;
//     }
//     balanceDetails.push({
//       uid: gm.uid,
//       userName: gm.userName,
//       gid: gm.gid,
//       playerCount: myPlayerCount,
//       balance: mybal
//     });
//   });

//   return balanceDetails;
// }

function senderr(res, errcode, msg)  { res.status(errcode).send(msg); }
function sendok(res, msg)   { res.send(msg); }
function setHeader(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}
module.exports = router;