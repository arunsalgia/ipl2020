const { encrypt, decrypt, dbencrypt, dbdecrypt, dbToSvrText, svrToDbText, getLoginName, getDisplayName, sendCricMail, } = require('./cricspecial'); 
router = express.Router();
let TeamRes;


/* GET all users listing. */
router.get('/', function (req, res, next) {
  TeamRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }
  next('route');
}); 

/* GET all users listing. */
router.get('/list', async function (req, res, next) {
  TeamRes = res;
  setHeader();  
  console.log("list");
  await publishTeam({}, false);
});

router.get('/tournament/:tournamentName', async function (req, res, next) {
  TeamRes = res;
  setHeader();  
  console.log("list");
  var {tournamentName} = req.params;
  tournamentName = tournamentName.toUpperCase();	
  await publishTeam({tournament: tournamentName}, false);
});

router.get('/tournamentdelete/:tournamentName', async function (req, res, next) {
  TeamRes = res;
  setHeader();  
  console.log(`delete tournament ${tournamentName}`);
  var {tournamentName} = req.params;
  await Team.deleteMany({tournament: tournamentName.toUpperCase()});  
  sendok(`delete tournament ${tournamentName}`)
});

router.get('/uniquelist', async function (req, res, next) {
  TeamRes = res;
  setHeader();  
  console.log("uniquelist");
  await publishTeam({}, true);
});

/* GET all users listing. */
router.get('/add/:tournamentName/:teamName', async function (req, res, next) {
  TeamRes = res;
  setHeader();  
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
  sendok("Done");
});

async function publishTeam(filter_teams, setUnique) {
  var ulist = await Team.find(filter_teams);
  //ulist = _.map(ulist, o => _.pick(o, ['name']));
  if (setUnique)
	ulist = _.uniqBy(ulist, x => x.name);
  ulist = _.sortBy(ulist, 'name');
  sendok(ulist);
}


function sendok(usrmgs) { TeamRes.send(usrmgs); }
function senderr(errcode, errmsg) { TeamRes.status(errcode).send({error: errmsg}); }
function setHeader() {
  TeamRes.header("Access-Control-Allow-Origin", "*");
  TeamRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  _group = defaultGroup;
  _tournament = defaultTournament;
}
module.exports = router;

