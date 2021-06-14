const {  akshuGetUser, GroupMemberCount,  
  encrypt, decrypt, dbencrypt, dbToSvrText, svrToDbText, dbdecrypt,
} = require('./cricspecial'); 
var router = express.Router();
const KYCSTATUS = {
  pending: "Pending",
  docPending: "Document Pending",
  submitted: "Submitted",
  approved: "Approved",
  invalid: "Invalid",
}
const NODATA = "--";

function getBlankKyc(userId) {
  let tmp = new UserKyc({
    uid: parseInt(userId),
    // ID details;
    idDetails: dbencrypt(NODATA),
    // bank details
    bankDetails: dbencrypt(NODATA),
    // UPI details
    upiDetails: dbencrypt(NODATA),
    // use bank details
    useUpi: false,    
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

  let tmp1 = dbdecrypt(myKyc.idDetails)
  let tmp2 = dbdecrypt(myKyc.bankDetails);
  let tmp3 = dbdecrypt(myKyc.upiDetails);

  if (tmp1 === NODATA) tmp1 = "";
  if (tmp2 === NODATA) tmp2 = "";
  if (tmp3 === NODATA) tmp3 = "";

  sendok(res, {idata: encrypt(tmp1), bdata: encrypt(tmp2), udata: encrypt(tmp3), use: myKyc.useUpi});
});	


router.get('/idata/:userid/:details', async function (req, res) {
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
	
router.get('/bdata/:userid/:details', async function (req, res) {
  setHeader(res);
  let { userid, details } = req.params;

  let myKyc = await UserKyc.findOne({uid: userid});

  // if first time
  if (!myKyc) 
    myKyc = getBlankKyc(userid);

  myKyc.bankDetails = svrToDbText(details);
  myKyc.useUpi = false;
// update status for Bank

  await myKyc.save();
  
  sendok(res, "OK");
});	
	
router.get('/udata/:userid/:details', async function (req, res) {
  setHeader(res);
  let { userid, details } = req.params;

  let myKyc = await UserKyc.findOne({uid: userid});

  // if first time
  if (!myKyc) 
    myKyc = getBlankKyc(userid);

  // update data for upi
  myKyc.upiDetails = svrToDbText(details);
  myKyc.useUpi = true;

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
