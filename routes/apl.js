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
  sendok("1.0");
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



function sendok(usrmsg) { AplRes.send(usrmsg); }
function senderr(errcode, errmsg) { AplRes.status(errcode).send(errmsg); }
function setHeader() {
  AplRes.header("Access-Control-Allow-Origin", "*");
  AplRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}

module.exports = router;
