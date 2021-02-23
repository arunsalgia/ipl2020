//var express = require('express');
var router = express.Router();
let PrizeRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  PrizeRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }
  next('route');
});
 
 
router.get('/data', async function (req, res, next) {
  PrizeRes = res;
  setHeader();

	let myPrize = await Prize.find({})
	sendok(myPrize);
}); 


router.get('/all/:amount', async function (req, res, next) {
  PrizeRes = res;
  setHeader();

  var { amount } = req.params;
 
  let allPrize=[];
  for(i=1; i<=5; ++i) {
    let mytab = await getPrizeTable(i, amount);
    allPrize.push(mytab);
  }
  sendok(allPrize);
}); 



router.get('/addprize', async function (req, res, next) {
  PrizeRes = res;
  setHeader();

  let myPrize = new Prize({
    prizeCount: 1,
    prize1: 100,
    prize2: 0,
    prize3: 0,
    prize4: 0,
    prize5: 0,
    prize6: 0,
    prize7: 0,
    prize8: 0,
    prize9: 0,
    prize10: 0,
  })
  myPrize.save();

  myPrize = new Prize({
    prizeCount: 2,
    prize1: 60,
    prize2: 40,
    prize3: 0,
    prize4: 0,
    prize5: 0,
    prize6: 0,
    prize7: 0,
    prize8: 0,
    prize9: 0,
    prize10: 0,
  })
  myPrize.save();

  myPrize = new Prize({
    prizeCount: 3,
    prize1: 50,
    prize2: 30,
    prize3: 20,
    prize4: 0,
    prize5: 0,
    prize6: 0,
    prize7: 0,	
    prize8: 0,
    prize9: 0,
    prize10: 0,
  })
  myPrize.save();

  myPrize = new Prize({
    prizeCount: 4,
    prize1: 40,
    prize2: 30,
    prize3: 20,
    prize4: 10,
    prize5: 0,
    prize6: 0,
    prize7: 0,
    prize8: 0,
    prize9: 0,
    prize10: 0,
  })
  myPrize.save();

  myPrize = new Prize({
    prizeCount: 5,
    prize1: 35,
    prize2: 25,
    prize3: 20,
    prize4: 13,
    prize5: 7,
    prize6: 0,
    prize7: 0,
    prize8: 0,
    prize9: 0,
    prize10: 0,
  })
  myPrize.save();

  sendok("ok");
}); 


function sendok(usrmsg) { PrizeRes.send(usrmsg); }
function senderr(errcode, errmsg) { PrizeRes.status(errcode).send(errmsg); }
function setHeader() {
  PrizeRes.header("Access-Control-Allow-Origin", "*");
  PrizeRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}
module.exports = router;
