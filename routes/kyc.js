const {  akshuGetUser, GroupMemberCount,  
  decrypt, dbencrypt, dbToSvrText, svrToDbText,
} = require('./cricspecial'); 
var router = express.Router();
const KYCSTATUS = {
  pending: "Pending",
  docPending: "Document Pending",
  submitted: "Submitted",
  approved: "Approved",
  invalid: "Invalid",
}

function getBlankKyc(userId) {
  let tmp = new UserKyc({
    uid: parseInt(userId),
    // kyc compeletd or not
    idKycComplete: false,
    bankKycComplete: false,
    // kyc status  PENDING, SUBMITTED, APPROVED etc.
    idKycStatus: KYCSTATUS.pending,
    bankKycStatus: KYCSTATUS.pending,
    // id of documents uploaded
    idDocRef: "",
    bankDocRef: "",
    // ID details;
    idDetails: dbencrypt(""),
    // bank details
    bankDetails: dbencrypt("--"),
  })
  return tmp;
}

/* GET users listing. */
router.use('/', function(req, res, next) {
  // WalletRes = res;
  setHeader(res);
  if (!db_connection) { senderr(res, DBERROR, ERR_NODB); return; }
  next('route');
});

router.get('/details/:userid', async function (req, res) {
  setHeader(res);
  let { userid } = req.params;

  let myKyc = await UserKyc.findOne({uid: userid});
  if (!myKyc) 
    myKyc = getBlankKyc(userid);

  let tmp1 = dbToSvrText(myKyc.bankDetails)
  let tmp2 = dbToSvrText(myKyc.idDetails);

  sendok(res, {id: tmp2, bank: tmp1});
});	


router.get('/updateid/:userid/:details', async function (req, res) {
  setHeader(res);
  let { userid, details } = req.params;

  let myKyc = await UserKyc.findOne({uid: userid});

  // if first time
  if (!myKyc) 
    myKyc = getBlankKyc(userid);
  
  myKyc.idDetails = svrToDbText(details);
  // update status for ID

  await myKyc.save();
  
  sendok(res, myKyc);
});	
	
router.get('/updatebank/:userid/:details', async function (req, res) {
  setHeader(res);
  let { userid, details } = req.params;

  let myKyc = await UserKyc.findOne({uid: userid});

  // if first time
  if (!myKyc) 
    myKyc = getBlankKyc(userid);

  myKyc.bankDetails = svrToDbText(details);
// update status for Bank

  await myKyc.save();
  
  sendok(res, "OK");
});	
	

function getDate(x) {
	let y = ("0" + x.getDate()).slice(-2) + "/" +
		("0" + (x.getMonth()+1)).slice(-2) + "/" +
		x.getFullYear();
	return y;
}




function sendok(res, usrmsg) { res.send(usrmsg); }
function senderr(res, errcode, errmsg) { res.status(errcode).send(errmsg); }
function setHeader(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}

module.exports = router;
