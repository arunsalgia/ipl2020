router = express.Router();
// var PlayerRes;

/* GET users listing. */
router.use('/', async function(req, res, next) {
  // PlayerRes = res;
  setHeader(res);
  if (!db_connection) { senderr(res, DBERROR, ERR_NODB); return};
  next('route');
});

router.get('/list', async function(req, res, next) {
  // PlayerRes = res;
  setHeader(res);
  await publish_players(res, {}); 
});
const oldName = ["CSK", "KKR", "RCB", "SRH", "MI", "RR", "DC", "KXIP"]
const NewName = ["CHENNAI SUPER KINGS", "KOLKATA KNIGHT RIDERS", 
				"ROYAL CHALLENGERS BANGALORE", "SUNRISERS HYDERABAD", 
				"MUMBAI INDIANS", "RAJASTHAN ROYALS", 
				"DELHI CAPITALS", "KINGS XI PUNJAB"]
//const oldName = ["KXIP"]
let numList = [0, 0, 0, 0, 0, 0, 0, 0];
router.get('/namechange', async function(req, res, next) {
  // PlayerRes = res;
  setHeader(res);
  let num = 0;
  let tot = 0;
  console.log(numList.length);
  for(var i=0; i<8; ++i) {
	  numList[i] = 0;
  }
  let plist = await Player.find({});
  plist.forEach(p => {
	 let idx = oldName.indexOf(p.Team);
	 if (idx >= 0) {
		 ++numList[idx]
		 ++tot;
		 p.Team = NewName[idx];
		 p.save();
	 } else {
		if (p.tournament === "IPL2020") {
			console.log(p);
		}
	}
  });
  console.log(tot);
  sendok(res, numList);
});

router.get('/detail/:myPid', async function(req, res, next) {
  // PlayerRes = res;
  setHeader(res);
  var {myPid}=req.params;
  console.log(myPid);
  var myRec = await Player.findOne({pid: myPid});
  if (myRec) {
	  sendok(res, myRec)
  } else { 
	senderr(res, 601, `Invalid Player id ${myPid}`); 
}
 
});

// get list of all players as per group
router.get('/group/:groupid', async function(req, res, next) {
  // PlayerRes = res;
  setHeader(res);
  var {groupid}=req.params;
  console.log(groupid);
  var myGroup = await IPLGroup.findOne({gid: groupid});
  if (myGroup) {
	  await publish_players(res, { tournament: myGroup.tournament } );
  } else { 
	senderr(res, 682, `Invalid Group ${groupid}`); 
}
 
});

router.get('/tournament/:tournamentName', async function(req, res, next) {
  // PlayerRes = res;
  setHeader(res);
  var {tournamentName}=req.params;
  await publish_players(res, { tournament: tournamentName } );
});

router.get('/tteam/:tournamentName/:teamName', async function(req, res, next) {
  // PlayerRes = res;
  setHeader(res);
  var {tournamentName, teamName}=req.params;
  await publish_players(res, { tournament: tournamentName, Team: teamName } );
});

router.get('/teamfilter/:tournamentName/:teamName/:partPlayerName', async function(req, res, next) {
  // PlayerRes = res;
  setHeader(res);
  let {tournamentName, teamName, partPlayerName}=req.params;
  partPlayerName = partPlayerName.toUpperCase();
  let plist = await Player.find({ tournament: tournamentName, Team: teamName } );
  //console.log(plist);
  plist = plist.filter(x => x.name.toUpperCase().includes(partPlayerName));
  plist = _.sortBy(plist, 'name');
  //console.log(plist);
  sendok(res, plist)
});

router.get('/allfilter/:partPlayerName', async function(req, res, next) {
  // PlayerRes = res;
  setHeader(res);
  let {partPlayerName}=req.params;
  partPlayerName = partPlayerName.toUpperCase();
  let plist = await Player.find({} );
  //console.log(plist);
  plist = plist.filter(x => x.name.toUpperCase().includes(partPlayerName));
  plist = _.uniqBy(plist, 'pid');
  plist = _.sortBy(plist, 'name');
  //console.log(plist);
  sendok(res, plist)
});
 

// delete all the players of the team (of given tournamenet)
router.get('/add/:pid/:name/:tournamentName/:teamName/:role/:batStyle/:bowlStyle', async function(req, res, next) {
  // PlayerRes = res;
  setHeader(res);
  var {pid, name, tournamentName, teamName, 
      role, batStyle, bowlStyle
    }=req.params;
  console.log(name);
  console.log(tournamentName);
  console.log(teamName);
  console.log(role);
  console.log(batStyle);
  console.log(bowlStyle);
  tournamentName = tournamentName.toUpperCase();
  teamName = teamName.toUpperCase();
  let pRec = await Player.findOne({pid: pid, tournament: tournamentName, Team: teamName});
  if (!pRec) {
    console.log("New Player");
    pRec = new Player();
    pRec.pid = pid;
    pRec.tournament = tournamentName;
    pRec.Team = teamName;
  }
  console.log(pRec);
  pRec.name = name;
  pRec.fullName = name;
  pRec.role = role;
  pRec.battingStyle = batStyle;
  pRec.bowlingStyle = bowlStyle;
  pRec.save();
  sendok(res, "OK");
});

// delete all the players of the team (of given tournamenet)
router.get('/teamdelete/:tournamentName/:teamName', async function(req, res, next) {
  // PlayerRes = res;
  setHeader(res);
  var {tournamentName, teamName}=req.params;
  tournamentName = tournamentName.toUpperCase();
  teamName = teamName.toUpperCase();
  
  await Player.deleteMany({tournament: tournamentName, Team: teamName});
  //let plist = await Player.find({tournament: tournamentName, Team: teamName} );
  //console.log(plist);
  sendok(res, "delete players done");
});


// get list of purchased		 players
router.get('/sold', async function(req, res, next) {
  // PlayerRes = res;
  setHeader(res);
  //var {groupid}=req.params;
  var groupid = "1";
  if (isNaN(groupid)) { senderr(res, 682, `Invalid Group ${groupid}`); return; }
  var igroup = parseInt(groupid);
  var myGroup = await IPLGroup.findOne({gid: igroup});
  if (!myGroup) { senderr(res, 682, `Invalid Group ${groupid}`); return; }

  var alist = await Auction.find({gid: igroup});
  var mypid = _.map(alist, 'pid');
  publish_players(res, { tournament: myGroup.tournament, pid: { $in: mypid } } );
});

// get list of players not purchased (only 1 group)
router.get('/unsold', async function(req, res, next) {
  // PlayerRes = res;
  setHeader(res);
  //var {groupid}=req.params;
  var groupid = "1";
  if (isNaN(groupid)) { senderr(res, 682, `Invalid Group ${groupid}`); return; }
  var igroup = parseInt(groupid);
  var myGroup = await IPLGroup.findOne({gid: igroup});
  if (!myGroup) { senderr(res, 682, `Invalid Group ${groupid}`); return; }

  var soldplayers = await Auction.find({gid: igroup});
  var soldpid = _.map(soldplayers, 'pid');

  publish_players(res, {tournament: myGroup.tournament,  pid: { $nin: soldpid } } );
});


router.get('/updateauction', async function(req, res, next) {
  // PlayerRes = res;
  setHeader(res);
  //var {groupid}=req.params;
  var auctionList = await Auction.find({gid: 1});
  var playerList = await Player.find({tournament: "IPL2020"});
  auctionList.forEach( a => {
    playerRec = _.find(playerList, x => x.pid === a.pid);
    a.team = playerRec.Team;
    a.save();
  });
  sendok(res, "OK");
});




router.get('/available/:playerid', async function(req, res, next) {
  // PlayerRes = res;
  setHeader(res);

  var {playerid}=req.params;
  var groupid = "1";
  if (isNan(groupid)) { senderr(res, 682, `Invalid Group ${groupid}`); return; }
  if (isNaN(playerid)) { senderr(res, 681, `Invalid player id ${playerid}`); return; }
  var igroup = parseInt(groupid);
  var iplayer = parseInt(playerid);
  
  //  first confirm player id is correct
  var playerRec = await Auction.findOne({gid: igroup, pid: iplayer});
  sendok(res, playerRec === null);
});



async function publish_players(res, filter_players)
{
	//console.log("About to publish");
  //console.log(filter_players);
  var plist = await Player.find(filter_players);
  //console.log(plist.length);
  plist = _.sortBy(plist, 'name');
  sendok(res, plist);
}

function sendok(res, usrmsg) { res.send(usrmsg); }
function senderr(res, errocode, errmsg) { res.status(errocode).send(errmsg); }
function setHeader(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}
module.exports = router;
