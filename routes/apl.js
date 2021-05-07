const { encrypt, decrypt, dbencrypt, dbdecrypt, dbToSvrText, svrToDbText, sendCricMail, } = require('./cricspecial'); 

var router = express.Router();
// let AplRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  // AplRes = res;
  setHeader(res);
  if (!db_connection) { senderr(res, DBERROR, ERR_NODB); return; }
  next('route');
});

router.get('/latestversion', async function (req, res, next) {
  // AplRes = res;
  setHeader(res);
  let tmp = await MasterData.findOne({msKey: "LATESTVERSION"});
  //console.log(tmp);
  let lVer = (tmp) ? tmp.msValue : "0.0";
  //console.log(lVer);
  sendok(res, lVer);
});


router.get('/feedback/:userid/:message', async function (req, res, next) {
  // AplRes = res;
  setHeader(res);
  
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
    sendok(res, aplRec._id);
  } else {
    console.log(resp.error);
    senderr(res, 603, resp.error);
  }
}); 

router.get('/master/list', async function (req, res, next) {
  // AplRes = res;
  setHeader(res);

  let myData = await MasterData.find({});
  sendok(res, myData);
});

router.get('/getfile/:myFileName', async function (req, res, next) {
  // AplRes = res;
  setHeader(res);
  let { myFileName } = req.params;
  console.log(myFileName);
  myFileName = decrypt(myFileName);
  console.log(myFileName);
  sendok(res, myFileName);
});


router.get('/master/add/:myKey/:myValue', async function (req, res, next) {
  // AplRes = res;
  setHeader(res);
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
  sendok(res, myData);
});

router.get('/master/delete/:myKey', async function (req, res, next) {
  // AplRes = res;
  setHeader(res);
  let { myKey } = req.params;
  
  try {
    await MasterData.deleteOne({msKey: myKey.toUpperCase()});
    sendok(res, `Key ${myKey} successfully delete from Master Settings`);
  } catch (e) {
    senderr(res, 601, `Key ${myKey} not found in Master Settings`);
  }
});


router.get('/addguide/:gNum/:gTitle/:gText', async function (req, res, next) {
  setHeader(res);

  var {gNum, gTitle, gText} = req.params;
  
  let myGuide = await Guide.findOne({guideNumber: gNum});
  if (!myGuide) {
	myGuide = new Guide();
	myGuide.guideNumber = gNum;
  }

  myGuide.guideTitle = gTitle;
  myGuide.guideText = gText;
  myGuide.save();
  
  sendok(res, myGuide);
}); 

router.get('/getmaxguide', async function (req, res, next) {
  // AplRes = res;
  setHeader(res);
  
  let tmp = await Guide.find({}).limit(1).sort({ "guideNumber": -1 });
  console.log(tmp);
  sendok(res, tmp[0].guideNumber.toString());
});

router.get('/getguide/:guideNum', async function (req, res, next) {
  // AplRes = res;
  setHeader(res);
  var { guideNum } = req.params;

  let guideRec = await Guide.findOne({guideNumber: guideNum});
 
  if (guideRec) sendok(res, guideRec);
  else          senderr(res, 601, "No guides available");
});


router.get('/resetguide/:userId', async function (req, res, next) {
  // AplRes = res;
  setHeader(res);
  var { userId } = req.params;

  let guideRec;
  let userRec = await User.findOne({uid: userId});
  userRec.currentGuide = 0;
  userRec.showGuide = true;
  userRec.save();
  sendok(res, "Done");
});

router.get('/enableguide/:userId', async function (req, res, next) {
  // AplRes = res;
  setHeader(res);
  var { userId } = req.params;

  let guideRec;
  let userRec = await User.findOne({uid: userId});
  userRec.currentGuide = 0;
  userRec.showGuide = true;
  userRec.save();
  sendok(res, "Done");
});

router.get('/disableguide/:userId', async function (req, res, next) {
  // AplRes = res;
  setHeader(res);
  var { userId } = req.params;

  let guideRec;
  let userRec = await User.findOne({uid: userId});
  userRec.currentGuide = 0;
  userRec.showGuide = false;
  userRec.save();
  sendok(res, "Done");
});

router.get('/getnextguide/:userId', async function (req, res, next) {
  // AplRes = res;
  setHeader(res);
  var { userId, guideNum } = req.params;

  let guideRec;
  let userRec = await User.findOne({uid: userId});
  if (userRec.showGuide) {
	guideRec = await Guide.findOne({guideNumber: (userRec.currentGuide+1)});
  }
  if (guideRec) {
	  ++userRec.currentGuide;
	  userRec.save();
	  sendok(res, guideRec);
  } else
	  senderr(res, 601, "No guides available");
});

router.get('/getprevguide/:userId', async function (req, res, next) {
  setHeader(res);
  var { userId, guideNum } = req.params;

  let guideRec;
  let userRec = await User.findOne({uid: userId});
  if ((userRec.showGuide) && (userRec.currentGuide > 1)) {
	guideRec = await Guide.findOne({guideNumber: (userRec.currentGuide-1)});
  }
  if (guideRec) {
	  --userRec.currentGuide;
	  userRec.save();
	  sendok(res, guideRec);
  } else
	  senderr(res, 601, "No guides available");
});


router.get('/support1', async function (req, res, next) {
  // AplRes = res;
  setHeader(res);

  let allUsers = await User.find({});
  for(let u=0; u<allUsers.length; ++u) {
	allUsers[u].showGuide = true;
	allUsers[u].currentGuide = 0;
	allUsers[u].save();
  }
  sendok(res, 'Done');
}); 


function sendok(res, usrmsg) { res.send(usrmsg); }
function senderr(res, errcode, errmsg) { res.status(errcode).send(errmsg); }
function setHeader(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}

module.exports = router;
