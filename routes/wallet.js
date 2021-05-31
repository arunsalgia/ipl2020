const Instamojo = require("instamojo-payment-nodejs");
const { akshuGetUser, GroupMemberCount, dbdecrypt, } = require('./cricspecial'); 
var router = express.Router();

const API_KEY = "test_122c89dd87b24c3977474e3e82f";
const AUTH_KEY = "test_4c814766fd46608724119f04929";

let paymentRequestArray = [];

var instaOptions = {
  purpose: "APL Wallet", // REQUIRED
  amount: '', // REQUIRED and must be > ₹3 (3 INR)
  currency: "INR",
  buyer_name: '',
  email: '',
  phone: 1234567890,
  //expires_at: cTime,
  send_email: false,
  send_sms: false,
  allow_repeated_payments: false,
  webhook: "",
  redirect_url: "",
};


/* GET users listing. */
router.use('/', function(req, res, next) {
  // WalletRes = res;
  setHeader(res);
  if (!db_connection) { senderr(res, DBERROR, ERR_NODB); return; }
  next('route');
});

router.post('/webhook/:data1/:data2', async function (req, res) {
  setHeader(res);
  var {data1, data2} = req.params;
  console.log(data1, data2);

  return sendok(res, "done");
});	
	

router.get('/generatepaymentrequest/:userid/:amount', async function (req, res, next) {
  setHeader(res);
    let { userid, amount } = req.params;
    let PAYMENT_REQUEST_ID = '';
	
	let userRec = await akshuGetUser(userid);
	instaOptions.amount = amount;
	instaOptions.buyer_name = userRec.displayName;
	instaOptions.email = dbdecrypt(userRec.email);

	Instamojo.setKeys(API_KEY, AUTH_KEY);	
	Instamojo.isSandboxMode(true); // For testing
	const paymentData = Instamojo.PaymentData(instaOptions);
	console.log(paymentData);
	try {
		const response = await Instamojo.createNewPaymentRequest(paymentData);
		console.log(response);
		PAYMENT_REQUEST_ID = response.payment_request.id;
		paymentRequestArray.push({
			uid: userRec.uid,
			amount: parseInt(amount),
			requestId: PAYMENT_REQUEST_ID
		});
	} catch (e) {
		console.log(e);
	}
	console.log(PAYMENT_REQUEST_ID);
	sendok(res, PAYMENT_REQUEST_ID);
}); 

router.get('/getpaymentdetails/:requestId', async function (req, res, next) {
  setHeader(res);
    let { requestId } = req.params;
	console.log(paymentRequestArray);
	
	let myRequest = paymentRequestArray.find(x => x.requestId === requestId);
	if (!myRequest) return senderr(res, 601, 'Invalid request id ' + requestId);
	console.log("All okay");
	Instamojo.setKeys(API_KEY, AUTH_KEY);	
	Instamojo.isSandboxMode(true); // For testing
	

	try {
		const payStatus = await Instamojo.getPaymentRequestStatus(requestId);
		let status = payStatus.payment_request.status.toUpperCase();
		let details = payStatus.payment_request.payments;
		sendok(res, {status: status, details: details});
	} catch (e) {
		console.log("error found");
		senderr(res, 601, 'Invalid request id ' + requestId);
	}
}); 



function getDate(x) {
	let y = ("0" + x.getDate()).slice(-2) + "/" +
		("0" + (x.getMonth()+1)).slice(-2) + "/" +
		x.getFullYear();
	return y;
}

router.get('/details/:userid', async function (req, res, next) {
  // WalletRes = res;
  setHeader(res);
    let { userid } = req.params;
    
    let userTrans=[];
    let myTrans = await Wallet.find({uid: userid}).sort({ "transNumber": -1 });
    myTrans.forEach(tRec => {
      if (tRec.amount != 0) {
        let tDate = new Date(tRec.transNumber);
        userTrans.push({
          date: getDate(tDate),			//cricDate(tDate), 
          amount: tRec.amount,
          type: tRec.transType,
        });
      }
    });
  
  // console.log(tmp);  
  sendok(res, userTrans);
}); 



router.get('/accountopen/:userid', async function (req, res, next) {
  // WalletRes = res;
  setHeader(res);

  var { userid } = req.params;

  let userRec = await User.findOne({uid: userid});
  if (!userRec) { senderr(res, 613, `Invalid user ${userid}`); return; }
  await WalletAccountOpen(userid, 0)
  sendok(res, "ok");
}); 

router.get('/offer/:userid/:myAmount', async function (req, res, next) {
  // WalletRes = res;
  setHeader(res);

  var { userid,  myAmount} = req.params;

  let userRec = await User.findOne({uid: userid});
  if (!userRec) { senderr(res, 613, `Invalid user ${userid}`); return; }
  await WalletAccountOffer(userid, myAmount)
  sendok(res, "ok");
}); 

router.get('/membercount/:groupid', async function (req, res, next) {
  // WalletRes = res;
  setHeader(res); 

  var { groupid } = req.params;
  var tmp = await GroupMemberCount(groupid);
  // console.log(tmp);  
  sendok(res, {memberCount: tmp});
}); 
 
router.get('/balance/:userid', async function (req, res, next) {
  // WalletRes = res;
  setHeader(res);

  var { userid } = req.params;
  var tmp = await WalletBalance(userid);
  // console.log(tmp);  
  sendok(res, {balance: tmp});
}); 

router.get('/allopen', async function (req, res, next) {
  // WalletRes = res;
  setHeader(res);

  // var { userid } = req.params;
  let alluserRec = await User.find({});
  for(i=0; i<alluserRec.length; ++i) {
    await WalletAccountOpen(alluserRec[i].uid, 0);
  };
  sendok(res, "ok");
}); 

router.get('/alloffer', async function (req, res, next) {
  // WalletRes = res;
  setHeader(res);

  // var { userid } = req.params;
  let alluserRec = await User.find({});
  for(i=0; i<alluserRec.length; ++i) {
    await WalletAccountOffer(alluserRec[i].uid, joinOffer);
  };
  sendok(res, "ok");
}); 

router.get('/refill/:userId/:amount/:paymentId', async function (req, res, next) {
  setHeader(res);
  var {userId, amount, paymentId} = req.params;
	
  let myTrans = createWalletTransaction();
  myTrans.transType = WalletTransType.refill;
  myTrans.uid = userId;
  myTrans.transSubType = paymentId;
  myTrans.amount = amount;
  myTrans.save();
  // console.log(myTrans);

  sendok(res, myTrans);
}); 


function sendok(res, usrmsg) { res.send(usrmsg); }
function senderr(res, errcode, errmsg) { res.status(errcode).send(errmsg); }
function setHeader(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}

module.exports = router;
