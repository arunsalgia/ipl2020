const { 
  getMaster, setMaster,
} = require('./cricspecial'); 
//var express = require('express');
var router = express.Router();
// let PrizeRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  // PrizeRes = res;
  setHeader(res);
  if (!db_connection) { senderr(res, DBERROR, ERR_NODB); return; }
  next('route');
});
 
 
router.get('/data', async function (req, res, next) {
  // PrizeRes = res;
  setHeader(res);
	let myPrize = await Prize.find({})
	sendok(res, myPrize);
}); 

router.get('/getmaster/:key', async function (req, res, next) {
  setHeader(res); 
  
  var {key} = req.params;
  let  myValue = await getMaster(key.toUpperCase());
  sendok(res, myValue);
}); 

router.get('/setmaster/:key/:value', async function (req, res, next) {
  setHeader(res);
  
  var {key, value} = req.params;
  await setMaster(key.toUpperCase(), value);
  sendok(res, "Done");
}); 

router.get('/getprizeportion', async function (req, res, next) {
  setHeader(res);
  let myPortion = await getMaster("PRIZEPORTION");
  console.log(myPortion);
  let amt = (myPortion !== "") ? parseInt(myPortion) : 100;
  sendok(res, {prizePortion: amt});
}); 

router.get('/setprizeportion/:percentage', async function (req, res, next) {
  setHeader(res);
  var {percentage} = req.params;

  await setMaster("PRIZEPORTION", percentage);
  sendok(res, "OK");
}); 

router.get('/prizecount/:num', async function (req, res, next) {
  // PrizeRes = res;
  setHeader(res);
  var {num} = req.params;

	let myPrize = await Prize.findOne({prizeCount: num})
	sendok(res, myPrize);
}); 


router.get('/all/:amount', async function (req, res, next) {
  // PrizeRes = res;
  setHeader(res);

  var { amount } = req.params;
 
  let allPrize=[];
  for(i=1; i<=5; ++i) {
    let mytab = await getPrizeTable(i, amount);
    allPrize.push(mytab);
  }
  sendok(res, allPrize);
}); 



router.get('/addprize', async function (req, res, next) {
  // PrizeRes = res;
  setHeader(res);

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

  sendok(res, "ok");
}); 


function sendok(res, usrmsg) { res.send(usrmsg); }
function senderr(res, errcode, errmsg) { res.status(errcode).send(errmsg); }
function setHeader(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}
module.exports = router;
