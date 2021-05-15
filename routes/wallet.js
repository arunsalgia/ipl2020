const { GroupMemberCount, } = require('./cricspecial'); 
//var express = require('express');
var router = express.Router();
// let WalletRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  // WalletRes = res;
  setHeader(res);
  if (!db_connection) { senderr(res, DBERROR, ERR_NODB); return; }
  next('route');
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



function sendok(res, usrmsg) { res.send(usrmsg); }
function senderr(res, errcode, errmsg) { res.status(errcode).send(errmsg); }
function setHeader(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}

module.exports = router;
