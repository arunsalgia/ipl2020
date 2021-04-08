const { encrypt, decrypt, dbencrypt, dbdecrypt, dbToSvrText, svrToDbText, getLoginName, getDisplayName, sendCricMail, } = require('./cricspecial'); 
router = express.Router();
// let TeamRes;


/* GET all users listing. */
router.get('/', function (req, res, next) {
  // TeamRes = res;
  setHeader(res);
  if (!db_connection) { senderr(res, DBERROR, ERR_NODB); return; }
  next('route');
}); 

router.get('/detail/:myTeam', async function(req, res, next) {
  // TeamRes = res;
  setHeader(res);

  var {myTeam}=req.params;
  myTeam = myTeam.toUpperCase();
  console.log(myTeam);
  var myRec = await Team.findOne({name: myTeam});
  if (myRec) {
	  sendok(res, myRec)
  } else { 
	senderr(res, 601, `Invalid team ${myTeam}`); 
}
 
});
/* GET all users listing. */
router.get('/list', async function (req, res, next) {
  // TeamRes = res;
  setHeader(res);  
  console.log("list");
  await publishTeam(res, {}, false);
});

router.get('/tournament/:tournamentName', async function (req, res, next) {
  // TeamRes = res;
  setHeader(res);  
  console.log("list");
  var {tournamentName} = req.params;
  tournamentName = tournamentName.toUpperCase();	
  await publishTeam(res, {tournament: tournamentName}, false);
});

router.get('/tournamentdelete/:tournamentName', async function (req, res, next) {
  // TeamRes = res;
  setHeader(res);  
  console.log(`delete tournament ${tournamentName}`);
  var {tournamentName} = req.params;
  await Team.deleteMany({tournament: tournamentName.toUpperCase()});  
  sendok(res, `delete tournament ${tournamentName}`)
});

router.get('/uniquelist', async function (req, res, next) {
  // TeamRes = res;
  setHeader(res);  
  console.log("uniquelist");
  await publishTeam(res, {}, true);
});

/* GET all users listing. */
router.get('/add/:tournamentName/:teamName', async function (req, res, next) {
  // TeamRes = res;
  setHeader(res);  
  var {tournamentName, teamName} = req.params;
  
  tournamentName = tournamentName.toUpperCase();
  teamName = teamName.toUpperCase();
  let myTeam = await Team.findOne({name: teamName, tournament: tournamentName});
  if (!myTeam) {
	myrec = new Team();
	myrec.name = teamName;
    myrec.fullname = teamName;
    myrec.tournament = tournamentName;
	myrec.save();  
  };
  sendok(res, "Done");
});

async function publishTeam(res, filter_teams, setUnique) {
  var ulist = await Team.find(filter_teams);
  //ulist = _.map(ulist, o => _.pick(o, ['name']));
  if (setUnique)
	ulist = _.uniqBy(ulist, x => x.name);
  ulist = _.sortBy(ulist, 'name');
  sendok(res, ulist);
}


function sendok(res, usrmgs) { res.send(usrmgs); }
function senderr(res, errcode, errmsg) { res.status(errcode).send({error: errmsg}); }
function setHeader(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  _group = defaultGroup;
  _tournament = defaultTournament;
}
module.exports = router;

