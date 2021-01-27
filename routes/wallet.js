const { GroupMemberCount, } = require('./cricspecial'); 
//var express = require('express');
var router = express.Router();
let WalletRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  WalletRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }
  next('route');
});


router.get('/details/:userid', async function (req, res, next) {
  WalletRes = res;
  setHeader();
    let { userid } = req.params;
    
    let userTrans=[];
    let myTrans = await Wallet.find({uid: userid})
    myTrans.forEach(tRec => {
      if (tRec.amount != 0) {
        let tDate = new Date(tRec.transNumber);
        userTrans.push({
          date: cricDate(tDate), 
          amount: tRec.amount,
          type: tRec.transType,
        });
      }
    });
  
  // console.log(tmp);  
  sendok(userTrans);
}); 



router.get('/accountopen/:userid', async function (req, res, next) {
  WalletRes = res;
  setHeader();

  var { userid } = req.params;

  let userRec = await User.findOne({uid: userid});
  if (!userRec) { senderr(613, `Invalid user ${userid}`); return; }
  await WalletAccountOpen(userid, 0)
  sendok("ok");
}); 

router.get('/offer/:userid/:myAmount', async function (req, res, next) {
  WalletRes = res;
  setHeader();

  var { userid,  myAmount} = req.params;

  let userRec = await User.findOne({uid: userid});
  if (!userRec) { senderr(613, `Invalid user ${userid}`); return; }
  await WalletAccountOffer(userid, myAmount)
  sendok("ok");
}); 

router.get('/membercount/:groupid', async function (req, res, next) {
  WalletRes = res;
  setHeader();

  var { groupid } = req.params;
  var tmp = await GroupMemberCount(groupid);
  // console.log(tmp);  
  sendok({memberCount: tmp});
}); 

router.get('/balance/:userid', async function (req, res, next) {
  WalletRes = res;
  setHeader();

  var { userid } = req.params;
  var tmp = await WalletBalance(userid);
  // console.log(tmp);  
  sendok({balance: tmp});
}); 

router.get('/allopen', async function (req, res, next) {
  WalletRes = res;
  setHeader();

  // var { userid } = req.params;
  let alluserRec = await User.find({});
  for(i=0; i<alluserRec.length; ++i) {
    await WalletAccountOpen(alluserRec[i].uid, 0);
  };
  sendok("ok");
}); 

router.get('/alloffer', async function (req, res, next) {
  WalletRes = res;
  setHeader();

  // var { userid } = req.params;
  let alluserRec = await User.find({});
  for(i=0; i<alluserRec.length; ++i) {
    await WalletAccountOffer(alluserRec[i].uid, joinOffer);
  };
  sendok("ok");
}); 



function sendok(usrmsg) { WalletRes.send(usrmsg); }
function senderr(errcode, errmsg) { WalletRes.status(errcode).send(errmsg); }
function setHeader() {
  WalletRes.header("Access-Control-Allow-Origin", "*");
  WalletRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}

module.exports = router;
