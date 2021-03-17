const { encrypt, decrypt, dbencrypt, dbdecrypt, dbToSvrText, svrToDbText, sendCricMail, } = require('./cricspecial'); 

var router = express.Router();
let AplRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  AplRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }
  next('route');
});

router.get('/latestversion', async function (req, res, next) {
  AplRes = res;
  setHeader();
  let tmp = await MasterData.findOne({msKey: "LATESTVERSION"});
  //console.log(tmp);
  let lVer = (tmp) ? tmp.msValue : "0.0";
  //console.log(lVer);
  sendok(lVer);
});


router.get('/feedback/:userid/:message', async function (req, res, next) {
  AplRes = res;
  setHeader();
  
    let { userid, message } = req.params;
    let tDate = new Date();
    let userRec = await User.findOne({uid: userid})
	let aplRec = new Apl();
	aplRec.aplCode = tDate.getTime();
	aplRec.date = cricDate(tDate)
	aplRec.uid = userid;
	aplRec.message = `feedback from ${userRec.displayName} (${userRec.uid}) on ${tDate}` ;
	aplRec.email = userRec.email;
	aplRec.status = "PENDING";
	aplRec.save();
	//console.log(aplRec);
	
	// now send the mail 
  let resp = await sendCricMail(APLEMAILID, aplRec.message, decrypt(message));
  if (resp.status) {
    sendok(aplRec._id);
  } else {
    console.log(resp.error);
    senderr(603, resp.error);
  }
}); 

router.get('/master/list', async function (req, res, next) {
  AplRes = res;
  setHeader();

  let myData = await MasterData.find({});
  sendok(myData);
});

router.get('/master/add/:myKey/:myValue', async function (req, res, next) {
  AplRes = res;
  setHeader();
  let { myKey, myValue } = req.params;
  
  let myData = await MasterData.findOne({msKey: myKey.toUpperCase()});
  if (!myData) {
    myData = new MasterData();
    let tmp = await MasterData.find().limit(1).sort({ msId: -1 });
    myData.msId = (tmp.length > 0) ? tmp[0].msId + 1 : 1;
    myData.msKey = myKey.toUpperCase();
  }
  myData.msValue = myValue;
  myData.save();
  sendok(myData);
});

router.get('/master/delete/:myKey', async function (req, res, next) {
  AplRes = res;
  setHeader();
  let { myKey } = req.params;
  
  try {
    await MasterData.deleteOne({msKey: myKey.toUpperCase()});
    sendok(`Key ${myKey} successfully delete from Master Settings`);
  } catch (e) {
    senderr(601, `Key ${myKey} not found in Master Settings`);
  }
});

router.get('/support1', async function (req, res, next) {
  AplRes = res;
  setHeader();

  let matchId = 1243388;
  let myTournament = 'indengt20-2021';
  let BriefStat = mongoose.model(myTournament+BRIEFSUFFIX, BriefStatSchema);
  var briefList = await BriefStat.find({ sid: 0 });
  briefList.forEach(x => {
    x.sid = matchId;
    //x.score = x.score/2; 
    x.save();
  });
  sendok('Done');
}); 


function sendok(usrmsg) { AplRes.send(usrmsg); }
function senderr(errcode, errmsg) { AplRes.status(errcode).send(errmsg); }
function setHeader() {
  AplRes.header("Access-Control-Allow-Origin", "*");
  AplRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}

module.exports = router;
