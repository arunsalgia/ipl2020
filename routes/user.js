router = express.Router();
const { encrypt, decrypt, dbencrypt, dbdecrypt, dbToSvrText, 
  akshuGetGroup, akshuUpdGroup, akshuGetGroupMembers,
  akshuGetAuction, akshuGetTournament,
  getTournamentType,
  svrToDbText, getLoginName, getDisplayName, sendCricMail, 
  akshuGetUser, akshuUpdUser,
  getMaster, setMaster,
} = require('./cricspecial'); 

// const allUSER = 99999999;
const is_Captain = true;
const is_ViceCaptain = false;
const WITH_CVC  = 1;
const WITHOUT_CVC = 2;
// let CricRes;
var _group;
// var _tournament;
 

/* GET all users listing. */
router.get('/', function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  if (!db_connection) { senderr(res, DBERROR, ERR_NODB); return; }
  if (req.url == "/")
    publish_users(res, {});
  else
    next('route');
});

router.get('/xxxxalluser', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);

  let allUserRecs = await User.find({});
  allUserRecs.forEach( uRec => {
    uRec.email = dbencrypt(uRec.email);
    uRec.password = dbencrypt(uRec.password);
    uRec.save();
    akshuUpdUser(uRec);
  })
  sendok(res, "Done");
});

router.get('/suencrypt/:text', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var { text } = req.params;

  sendok(res, encrypt(text));
});



// get users belonging to group "mygroup"
router.get('/group/:mygroup', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);

  var { mygroup } = req.params;
  if (isNaN(mygroup)) { senderr(res, 601, `Invalid group number ${mygroup}`); return; }
  showGroupMembers(res, parseInt(mygroup));
});

router.get('/encrypt/:text', function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  let { text } = req.params;
  const hash = encrypt(text);
  console.log(hash);
  sendok(res, hash);

});

router.get('/decrypt/:text', function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  let { text } = req.params;
  const hash = decrypt(text);
  console.log(hash);
  sendok(res, hash);

});

router.get('/dbencrypt/:text', function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  let { text } = req.params;
  const hash = dbencrypt(text);
  console.log(hash);
  sendok(res, hash);

});

router.get('/dbdecrypt/:text', function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  let { text } = req.params;
  const hash = dbdecrypt(text);
  console.log(hash);
  sendok(res, hash);

});

//=============== SIGNUP

router.get('/signup/:uName/:uPassword/:uEmail', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {uName, uPassword, uEmail } = req.params;
  var isValid = false;
  // if user name already used up
  var lname = getLoginName(uName);
  var dname = getDisplayName(uName);
  uEmail = dbencrypt(uEmail.toLowerCase());

  let uuu = await User.findOne({userName: lname });
  if (uuu) {senderr(res, 602, "User name already used."); return; }
  uuu = await User.findOne({ email: uEmail });
  if (uuu) {senderr(res, 603, "Email already used."); return; }
  
  // uid: Number,
  // userName: String,
  // displayName: String,
  // password: String,
  // status: Boolean,
  // defaultGroup: Number,
  // email: String,
  // userPlan: Number  
  uRec = await User.find().limit(1).sort({ "uid": -1 });
  var user1 = new User({
      uid: uRec[0].uid + 1,
      userName: lname,
      displayName: dname,
      password: dbencrypt(uPassword),
      status: true,
      defaultGroup: 0,
      email: uEmail,
      userPlan: USERTYPE.TRIAL,
    });
  user1.save();
  akshuUpdUser(user1);
  console.log(`user record for ${lname}`);
  // open user wallet with 0 balance
  let tmp = getMaster("JOINOFFER");
  let amount = (tmp !== "") ? parseInt(tmp) : 0;
  await WalletAccountOpen(user1.uid, amount);

  // console.log(user1);
  sendok(res, "OK"); 
})


router.get('/cricsignup/:uName/:uPassword/:uEmail/:mobileNumber/:referalCode', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {uName, uPassword, uEmail, mobileNumber, referalCode } = req.params;
  var isValid = false;
  // if user name already used up
  var lname = getLoginName(uName);
  var dname = getDisplayName(uName);
  uEmail = svrToDbText(uEmail);
  uPassword = svrToDbText(uPassword);
  
  let uuu = await User.findOne({userName: lname });
  if (uuu) {senderr(res, 602, "User name already used."); return; }
  uuu = await User.findOne({ email: uEmail });
  if (uuu) {senderr(res, 603, "Email already used."); return; }
  
  let refRec;
  if (referalCode !== "NA") {
	  // validate referalCode
	refRec = await User.findOne({_id: referalCode });
	if (!refRec) return senderr(res, 604, "Invalid refereal Code.");
  }
  
  uRec = await User.find().limit(1).sort({ "uid": -1 });
  var user1 = new User({
      uid: uRec[0].uid + 1,
      userName: lname,
      displayName: dname,
      password: uPassword,
      status: true,
      defaultGroup: 0,
      email: uEmail,
      userPlan: USERTYPE.TRIAL,
	  mobile: mobileNumber
    });
  user1.save();
  akshuUpdUser(user1);
  // add entry for referral code here
  if (refRec) {
    let schemaRec = new Schema();
    schemaRec.date = new Date();
    schemaRec.uid = refRec.uid;
    schemaRec.uid2 = user1.uid;
    schemaRec.scheme = "NEWUSER";
    schemaRec.pending = true;
    schemaRec.offer = 100;
    schemaRec.maxOffer = 100;
  }
  console.log(`user record for ${lname}`);
  // open user wallet with 0 balance
  let tmp = getMaster("JOINOFFER");
  let amount = (tmp !== "") ? parseInt(tmp) : 0;
  await WalletAccountOpen(user1.uid, amount);

  // console.log(user1);
  sendok(res, "OK"); 
})


//=============== RESET
router.get('/reset/:userId/:oldPwd/:newPwd', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {userId, oldPwd, newPwd } = req.params;

  var uDoc = await User.findOne({uid: userId});
  if (uDoc) { 
    if (uDoc.password === dbencrypt(oldPwd)) {
      uDoc.password = dbencrypt(newPwd);
      uDoc.save();
      akshuUpdUser(uDoc);
      sendok(res, "OK");
      return;
    }
  }
  senderr(res, 602, "Invalid user Name or Password"); 
});

router.get('/// CricReset/:userId/:oldPwd/:newPwd', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {userId, oldPwd, newPwd } = req.params;

  var uDoc = await User.findOne({uid: userId});
  if (uDoc) { 
	oldPwd = decrypt(oldPwd);
    if (uDoc.password === dbencrypt(oldPwd)) {
	  newPwd = decrypt(newPwd)
      uDoc.password = dbencrypt(newPwd);
      uDoc.save();
      akshuUpdUser(uDoc);
      sendok(res, "OK");
      return;
    }
  }
  senderr(res, 602, "Invalid user Name or Password"); 
});


//=============== LOGIN
router.get('/login/:uName/:uPassword', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {uName, uPassword } = req.params;
  var isValid = false;
  //let lName = dbencrypt(getLoginName(uName));
  let uRec = await User.findOne({ userName:  getLoginName(uName)});
  console.log(uRec)
  // let tmp = dbencrypt(uPassword);
  // console.log(tmp);
  if (await userAlive(uRec)) 
    isValid = (dbencrypt(uPassword) === uRec.password);

  if (isValid) sendok(res, uRec.uid.toString());
  else         senderr(res, 602, "Invalid User name or password");
});

router.get('/criclogin/:uName/:uPassword', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {uName, uPassword } = req.params;
  var isValid = false;
  let uRec = await User.findOne({ userName:  getLoginName(uName)});
  console.log(uRec)
  uPassword = decrypt(uPassword);
  //console.log(uPassword);
  uPassword = dbencrypt(uPassword);
  //console.log(uPassword);
  isValid = (uPassword === uRec.password);
  //console.log(isValid);
  
  if (isValid) sendok(res, uRec);
  else         senderr(res, 602, "Invalid User name or password");
});


router.get('/cricreset/:userId/:oldPwd/:newPwd', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  console.log("in crioc reset");
  
  var {userId, oldPwd, newPwd } = req.params;
  var isValid = false;
  let uRec = await User.findOne({ uid:  userId });
  if (!uRec) return senderr(res, 601, "Invalid User name or password");
  // console.log(uRec)
  
  oldPwd = decrypt(oldPwd);
  // console.log("Old", oldPwd);
  oldPwd = dbencrypt(oldPwd);
  if (oldPwd !== uRec.password) return senderr(res, 601, "Invalid User name or password");
  
  newPwd = decrypt(newPwd);
  // console.log("new", newPwd);
  newPwd = dbencrypt(newPwd);
  uRec.password = newPwd;
  uRec.save();
  
  sendok(res, uRec);
});


router.get('/profile/:userId', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var { userId } = req.params;

  let userRec = await User.findOne({uid: userId});
  if (userRec) {
    let groupRec = await IPLGroup.findOne({gid: userRec.defaultGroup})
    let myGroup = (groupRec) ? groupRec.name : "";
    sendok(res, {
      loginName: userRec.userName,
      userName: userRec.displayName,
      email: dbdecrypt(userRec.email),
      password: dbdecrypt(userRec.password),
      defaultGroup: myGroup,
    });
  } else
    senderr(res, 601, `Invalid user id ${userId}`);
});

router.get('/cricprofile/:userId', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var { userId } = req.params;

  let userRec = await User.findOne({uid: userId});
  // console.log(userRec);
  if (userRec) {
    let groupRec = await IPLGroup.findOne({gid: userRec.defaultGroup})
    let myGroup = (groupRec) ? groupRec.name : "";
    sendok(res, {
	  userCode: userRec._id,
      loginName: userRec.userName,
      userName: userRec.displayName,
      email: encrypt(dbdecrypt(userRec.email)),
      password: encrypt(dbdecrypt(userRec.password)),
      defaultGroup: myGroup,
    });
  } else
    senderr(res, 601, `Invalid user id ${userId}`);
});

router.get('/updateprofile/:userId/:displayName/:emailId', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var { userId, displayName, emailId} = req.params;

  // first get the user record using uid
  let userRec = await User.findOne({uid: userId});
  if (!userRec) {senderr(res, 601, `Invalid user id ${userId}`); return; }

  // now check if email id is unique
  emailId = dbencrypt(emailId.toLowerCase());
  if (userRec.email !== emailId) {
    let tmp = await User.findOne({email: emailId});
    if (tmp) {senderr(res, 602, `Email id already in use.`); return; }
  }

  // update display name and email id
  userRec.email = emailId;
  userRec.displayName = displayName;
  userRec.save();
  akshuUpdUser(userRec);
  sendok(res, `Update profile of user ${userRec.uid}`);    
});


router.get('/cricupdateprofile/:userId/:displayName/:emailId', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var { userId, displayName, emailId} = req.params;

  // first get the user record using uid
  let userRec = await User.findOne({uid: userId});
  if (!userRec) {senderr(res, 601, `Invalid user id ${userId}`); return; }
  
  // now check if email id is unique
  emailId = dbencrypt(decrypt(emailId));
  if (userRec.email !== emailId) {
    let tmp = await User.findOne({email: emailId});
    if (tmp) {senderr(res, 602, `Email id already in use.`); return; }
  }

  // update display name and email id
  userRec.email = emailId;
  userRec.displayName = displayName;
  userRec.save();
  akshuUpdUser(userRec);
  sendok(res, `Update profile of user ${userRec.uid}`);    
});



//=============== forgot passord. email pwd to user
router.get('/xxxxxemailpassword/:mailid', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {mailid} = req.params;
  var isValid = false;
  let uRec = await User.findOne({ email: mailid });
  if (!uRec) {senderr(res, 602, "Invalid email id"); return  }
  

  // mailOptions.to = uRec.email;
  let mySubject = 'User info from Auction Premier League';
  let myText = `Dear User,
  
    Greeting from Auction Permier League.

    As request by you here is your password.

    Login Name: ${uRec.userName} 
    User Name : ${uRec.displayName}
    Password  : ${uRec.password}

    Regards,
    for Auction Permier League.`

    if (sendEmailToUser(urec.email, mySubject, myText))
      sendok(res, "OK")
    else
      senderr(res, 603, EMAILERROR);
}); 


router.get('/emailpassword/:mailid', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {mailid} = req.params;
  var isValid = false;
  let uRec = await User.findOne({ email: dbencrypt(mailid.toLowerCase()) });
  if (!uRec) {senderr(res, 602, "Invalid email id"); return  }
  

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: APLEMAILID,
      pass: 'Anob@1989#93'
    }
  });

  var mailOptions = {
    from: APLEMAILID,
    to: 'arunsalgia@gmail.com',
    subject: 'User info from Auction Permier League',
    text: 'That was easy!'
  };

  
  mailOptions.to = mailid;
  mailOptions.text = `Dear User,
  
    Greeting from Auction Permier League.

    As request by you here is your password.

    Login Name: ${uRec.userName} 
    User Name : ${uRec.displayName}
    Password  : ${dbdecrypt(uRec.password)}

    Regards,
    for Auction Permier League`


  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      senderr(res, 603, error);
    } else {
      console.log('Email sent: ' + info.response);
      sendok(res, 'Email sent: ' + info.response);
    }
  });
}); 


router.get('/cricemailpassword/:mailid', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {mailid} = req.params;
  // var isValid = false;
  //mailid = mailid.toLowerCase();
  let uRec = await User.findOne({ email: svrToDbText(mailid) });
  if (!uRec) {senderr(res, 602, "Invalid email id"); return  }
  
  let text = `Dear User,
  
    Greetings from Auction Permier League.

    As requested by you, here are your login details.

    Login Name: ${uRec.userName} 
    User Name : ${uRec.displayName}
    Password  : ${dbdecrypt(uRec.password)}

	You can use Login/User name in Sigin page.
	
    Best Regards,
    for Auction Permier League`

   let xxx = decrypt(mailid);
   console.log(`Send message to ${xxx}`);
  let resp = await sendCricMail(xxx, 'User info from Auction Premier League', text);
  if (resp.status) {
    console.log('Email sent: ' + resp.error);
    sendok(res, `Email sent to ${resp.error}`);
  } else {
    console.log(`errror sending email to ${xxx}`);
    console.log(resp.error);
    senderr(res, 603, resp.error);
  }
}); 

router.get('/emailwelcome/:mailid', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {mailid} = req.params;
  var isValid = false;
  //mailid = mailid.toLowerCase();

  let uRec = await User.findOne({ email: dbencrypt(mailid.toLowerCase()) });
  console.log(uRec)
  if (!uRec) {senderr(res, 602, "Invalid email id"); return  }

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: APLEMAILID,
      pass: 'Anob@1989#93'
    }
  });

  var mailOptions = {
    from: APLEMAILID,
    to: 'arunsalgia@gmail.com',
    subject: 'Welcome to Auction Permier League',
    text: 'That was easy!'
  };

  mailOptions.to = mailid;
  mailOptions.text = `Dear ${uRec.displayName},
  
    Welcome to the family of Auction Permier League (APL),

    Thanking you registering in Auction Permier League.

    You can now create Group, with family and friends and select the tournament,
    Auction players among group members
    and let APL provide you the players details during the tournament.

    Your login details are:
    
    Login Name: ${uRec.userName} 
    User Name : ${uRec.displayName}
    Password  : ${dbdecrypt(uRec.password)}

    Regards,
    for Auction Permier League.`

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      senderr(res, 603, error);
    } else {
      console.log('Email sent: ' + info.response);
      sendok(res, 'Email sent: ' + info.response);
    }
  });
}); 

router.get('/cricemailwelcome/:mailid', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {mailid} = req.params;
  var isValid = false;
  //mailid = mailid.toLowerCase();

  let uRec = await User.findOne({ email: svrToDbText(mailid) });
  //console.log(uRec)
  if (!uRec) {senderr(res, 602, "Invalid email id"); return  }

  let text = `Dear ${uRec.displayName},
  
    Welcome to the family of Auction Permier League.

    Thanking you registering in Auction Permier League (APL).

    You can now create Group, with family and friends and select the tournament,
    Auction players among group members
    and let APL provide you the players details during the tournament.

    Your login details are:
    
    Login Name: ${uRec.userName} 
    User Name : ${uRec.displayName}
    Password  : ${dbdecrypt(uRec.password)}

    Regards,
    for Auction Permier League.`

  let resp = await sendCricMail(dbdecrypt(uRec.email), 'Welcome to Auction Permier League', text);
  console.log(resp);
  if (resp.status) {
	console.log('Email sent: ' + resp.error);
	sendok(res, `Email sent to ${resp.error}`);
  } else {
	console.log(resp.error);
	senderr(res, 603, resp.error);
  }
}); 


//==================== internally called for signup, login and reset
// router.get('/internal/:userAction/:userName/:userParam', function (req, res, next) {
//   // CricRes = res;
//   setHeader(res);

//   var { userAction, userName, userParam } = req.params;
//   userAction = userAction.toLowerCase();
//   userName = userName.toLowerCase().replace(/\s/g, "");
//   //if (!db_connection) return;

//   User.findOne({ userName }, function (err, urec) {
//     if (err)
//       senderr(res, DBFETCHERR, err);
//     else {
//       switch (userAction) {
//         case "login":
//           if ((urec) && (urec.password == userParam)) {
//             sendok(res, urec.uid.toString());
//             sendDashboard = true;         // send dashboard data so that it gets displayed to user
//           }
//           else
//             senderr(res, 602, "Invalid User name or password");
//           break;
//         case "reset":
//           if (urec) {
//             urec.password = userParam;
//             urec.save(function (err) {
//               //console.log(err);
//               if (err) senderr(res, DBFETCHERR, "Could not reset password");
//               else sendok(res, urec.uid.toString());
//             });
//           } else
//             senderr(res, 602, "Invalid User name or password");
//           break;
//         case "setdisplay":
//           if (urec) {
//             console.log(urec);
//             urec.displayName = userParam;
//             urec.save(function (err) {
//               //console.log(err);
//               if (err) senderr(res, DBFETCHERR, "Could not update display name");
//               else sendok(res, urec.uid.toString());
//             });
//           } else
//             senderr(res, 602, "Invalid User name or password");
//           break;
//         case "signup":
//           if (!urec) {
//             User.find().limit(1).sort({ "uid": -1 }).exec(function (err, doc) {
//               if (err) senderr(res, DBFETCHERR, err);
//               else {
//                 var user1 = new User({
//                   uid: doc[0].uid + 1,
//                   userName: userName,
//                   displayName: userName,
//                   password: userParam,
//                   status: true
//                 });
//                 user1.save(function (err) {
//                   if (err)
//                     senderr(res, DBFETCHERR, "Unable to add new User record");
//                   else
//                     sendok(res, user1.uid.toString());
//                 });
//               }
//             });
//           } else
//             senderr(res, 603, "User already configured in CricDream");
//           break;
//       } // end of switch
//     }
//   });
// });

// select caption for the user (currently only group 1 supported by default)
router.get('/captain/:myGroup/:myUser/:myPlayer', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var {myGroup,  myUser, myPlayer } = req.params;
  // igroup = _group;

  var myMsg = await ipl_started(myGroup);
  if (myMsg != "") {
    senderr(res, 604, myMsg);
    return;
  }

  var tmp = await Auction.findOne({ gid: myGroup, uid: myUser, pid: myPlayer });  //.countDocuments(function (err, count) {
  if (!tmp)
    senderr(res, 607, `Player ${myPlayer} not purchased by user ${myUser}`);
  else {
      updateCaptainOrVicecaptain(res, myGroup, myUser, myPlayer, is_Captain);
  }
});

// select vice caption for the user (currently only group 1 supported by default)
router.get('/vicecaptain/:myGroup/:myUser/:myPlayer', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var { myGroup, myUser, myPlayer } = req.params;
  // igroup = _group;

  // check tournament has started
  var myMsg = await ipl_started(myGroup);
  if (myMsg != "") {
    senderr(res, 604, myMsg);
    return;
  }

  var tmp = await Auction.findOne({ gid: myGroup, uid: myUser, pid: myPlayer });  //.countDocuments(function (err, count) {
  if (!tmp)
    senderr(res, 607, `Player ${myPlayer}  not purchased by user ${myUser}`);
  else {
    // user has purchased this player. User is eligible to set this player as vice captain
    updateCaptainOrVicecaptain(res, myGroup, myUser, myPlayer, is_ViceCaptain);
  }
});


router.get('/captainvicecaptain/:myGroup/:myUser/:myCap/:myVice', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var { myGroup, myUser, myCap,  myVice} = req.params;
  // igroup = _group;

  // check tournament has started
  var myMsg = await ipl_started(myGroup);
  if (myMsg != "") {
    senderr(res, 604, myMsg);
    return;
  }

  var myplayer1;
  if (myCap > 0) {
	myplayer1 = await Auction.findOne({ gid: myGroup, uid: myUser, pid: myCap });  //.countDocuments(function (err, count) {
	if (!myplayer1) return senderr(res, 607, `Player ${myCap}  not purchased by user ${myUser}`);
  } else {
	  myplayer1 = {pid: 0, playerName: ""};
  }
  
  var myplayer2;
  if (myVice > 0) {
	myplayer2 = await Auction.findOne({ gid: myGroup, uid: myUser, pid: myVice });  //.countDocuments(function (err, count) {
	if (!myplayer2) return senderr(res, 607, `Player ${myVice}  not purchased by user ${myUser}`);
  } else {
	  myplayer2 = {pid: 0, playerName: ""};
  }

  caprec = await Captain.findOne({ gid: myGroup, uid: myUser });
  if (!caprec)
    caprec = new Captain({
      gid: myGroup,
      uid: myUser,
      captain: 0,
      captainName: "",
      viceCaptain: 0,
      viceCaptainName: ""
    });

    caprec.captain = myplayer1.pid;
    caprec.captainName = myplayer1.playerName;
    caprec.viceCaptain = myplayer2.pid;
    caprec.viceCaptainName = myplayer2.playerName;
    caprec.save();
    sendok(res, `Captain and Vice captain updated for user ${myUser}`);
});

router.get('/getcaptain/:mygroup/:myuser', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);

  var { mygroup, myuser } = req.params;
  var igroup =  parseInt(mygroup);    // defaultGroup;

  var myfilter;
  if (myuser.toUpperCase() === "ALL")
    myfilter = { gid: mygroup };
  else {
    if (isNaN(myuser)) { senderr(res, 605, "Invalid user"); return; }
    // var iuser = parseInt(myuser);
    var myMembership = await GroupMember.findOne({gid: mygroup, uid: myuser});
    if (!myMembership) { senderr(res, 605, "Invalid user"); return; }
    myfilter = { gid: mygroup, uid: myuser };
  }
  publishCaptain(res, myfilter);
});

// get users balance
// only group 1 supported which is default group
router.get('/balance/:mygroup/:myuser', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var { mygroup, myuser } = req.params;
  var userFilter = (myuser.toUpperCase() !== "ALL") ? { gid: mygroup, uid: myuser }  : { gid: mygroup }

  // console.log(`hello ${myuser}`);
  gmRec = await GroupMember.find(userFilter);
  // gmRec = _.sortBy(gmRec, 'uid');

  var auctionList = await Auction.find({ gid: mygroup });
  var balanceDetails = [];
  gmRec.forEach(gm => {
    //console.log(gm);
    myAuction = _.filter(auctionList, x => x.uid === gm.uid);
    //console.log(myAuction);
    var myPlayerCount = myAuction.length;
    var mybal = 1000 - _.sumBy(myAuction, 'bidAmount');
    balanceDetails.push({
      uid: gm.uid,
      userName: gm.displayName,
      gid: gm.gid,
      playerCount: myPlayerCount,
      balance: mybal
    })
  })
  // console.log(balanceDetails);
  sendok(res, balanceDetails);
})


// get users balance
// only group 1 supported which is default group
// router.get('/balance/:myuser', async function (req, res, next) {
//   // CricRes = res;
//   setHeader(res);

//   var { myuser } = req.params;
//   var userFilter = { gid: _group };
//   if (myuser.toUpperCase() != "ALL") {
//     if (isNaN(myuser)) { senderr(res, 605, "Invalid user " + myuser); return; }
//     userFilter = { gid: _group, uid: parseInt(myuser) };
//   }
//   //console.log(`hello ${iuser}`);
//   gmRec = await GroupMember.find(userFilter);
//   gmRec = _.sortBy(gmRec, 'uid');

//   var auctionList = await Auction.find({ gid: _group });
//   var balanceDetails = [];

//   gmRec.forEach(gm => {
//     //console.log(gm);
//     myAuction = _.filter(auctionList, x => x.uid == gm.uid);
//     //console.log(myAuction);
//     var myPlayerCount = myAuction.length;
//     var mybal = 1000 - _.sumBy(myAuction, 'bidAmount');
//     balanceDetails.push({
//       uid: gm.uid,
//       userName: gm.userName,
//       gid: gm.gid,
//       playerCount: myPlayerCount,
//       balance: mybal
//     })
//   })
//   sendok(res, balanceDetails);
// })


router.get('/myteam/:userGroup/:userid', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);

  var { userGroup, userid } = req.params;
  let igroup = parseInt(userGroup);   //_group;   // default group 1
  let iuser = allUSER;
  if (userid.toUpperCase() != "ALL") {
    if (isNaN(iuser)) { senderr(res, 605, `Invalid user ${userid}`); return; }
    iuser = parseInt(userid);
  }
  publish_auctionedplayers(res, igroup, iuser, WITH_CVC);

});

// get players purchased by me.
// currently only group 1 supported
router.get('/myteam/:userid', function (req, res, next) {
  // CricRes = res;
  setHeader(res);

  var { userid } = req.params;
  let igroup = _group;   // default group 1
  let iuser = allUSER;
  if (userid.toUpperCase() != "ALL") {
    if (isNaN(iuser)) { senderr(res, 605, `Invalid user ${userid}`); return; }
    iuser = parseInt(userid);
  }
  publish_auctionedplayers(res, igroup, iuser, WITH_CVC);

});

router.get('/myteamwos/:groupid/:userid', function (req, res, next) {
  // CricRes = res;
  setHeader(res);

  var { groupid, userid } = req.params;
  let igroup = parseInt(groupid);     //  _group;   // default group 1
  let iuser = allUSER;
  if (userid.toUpperCase() != "ALL") {
    if (isNaN(iuser)) { senderr(res, 605, `Invalid user ${userid}`); return; }
    iuser = parseInt(userid);
  }
  publish_auctionedplayers(res, igroup, iuser, WITHOUT_CVC);

});

router.get('/myteamwocvc/:userid', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);

  var { userid } = req.params;
  let igroup = 2;  //_group;   // default group 1
  if (userid.toUpperCase() === "ALL") userid = allUSER.toString();
  if (isNaN(userid)) { senderr(res, 605, `Invalid user ${userid}`); return; }
  //let iuser = parseInt(userid);
  var PauctionPlayers = Auction.find({gid: igroup});
  allCaptains = await Captain.find({gid: igroup});
  var mycvc = [];
  mycvc = mycvc.concat(_.map(allCaptains, 'captain'));
  mycvc = mycvc.concat(_.map(allCaptains, 'viceCaptain'));
  mycvc = _.uniqBy(mycvc);
  //console.log(mycvc);

  // my remove players who are captain and vice captain
  var auctionPlayers = await PauctionPlayers;
  auctionPlayers = _.filter(auctionPlayers, x => !mycvc.includes(x.pid))

  // if required only for single user then filter
  if (iuser != allUSER)
    auctionPlayers = _.filter(auctionPlayers, x => x.uid == userid);
  sendok(res, auctionPlayers);

});

// Which group I am the member
// each group will have have the tournament name
router.get('/mygroup/:userid', async function (req, res, next) {
  // CricRes = res;
  setHeader(res);
  var { userid } = req.params;

  var userFilter = {};
  if (userid.toUpperCase() != "ALL") {
    if (isNaN(userid)) { senderr(res, 605, `Invalid user ${userid}`); return; }
    userFilter = { uid: parseInt(userid) };
  }
  var userRec = await User.find(userFilter);
  if (userRec.length === 0) { senderr(res, 605, `Invalid user ${userid}`); return; }
  userRec = _.sortBy(userRec, 'uid');

  // now we have sorted User(s). Sorting is done on UID. get group member list of these users
  var userList = _.map(userRec, 'uid');
  var gmRec = await GroupMember.find({ uid: { $in: userList } });
  gmRec = _.sortBy(gmRec, 'gid');

  var result = [];
  if (gmRec.length > 0) {
    groupList = _.map(gmRec, 'gid');
    var groupRec = await IPLGroup.find({ gid: { $in: groupList } });
    //console.log(groupRec);
    userRec.forEach(u => {
      var memberof = _.filter(gmRec, x => x.uid == u.uid);
      memberof.forEach(gm => {
        //console.log(gm);
        var mygroup = _.filter(groupRec, x => x.gid == gm.gid);
        result.push({
          uid: u.uid,
          userName: u.userName, displayName: u.displayName,
          gid: mygroup[0].gid, groupName: mygroup[0].name,
          tournament: mygroup[0].tournament
        });
      })
    })
  }
  //console.log(result);
  sendok(res, result);
  // sendok(res, gmRec);
})

async function updateCaptainOrVicecaptain(res, igroup, iuser, iplayer, mytype) {
  var myplayer = await Player.findOne({ pid: iplayer });
  var caporvice = (mytype == is_Captain) ? "Captain" : "ViceCaptain";
  Captain.findOne({ gid: igroup, uid: iuser }, function (err, caprec) {
    if (err)
      senderr(res, DBFETCHERR, err);
    else {
      // if record found then check if captain already selected once (i.e. captain != 0)
      // if record not found create brand new cpatain record since user has made selection 1st time
      if (!caprec)
        caprec = new Captain({
          gid: igroup,
          uid: iuser,
          captain: 0,
          captainName: "",
          viceCaptain: 0,
          viceCaptainName: ""
        });

      alreadySet = (mytype == is_Captain) ? (caprec.viceCaptain == iplayer)
        : (caprec.captain == iplayer);
      if (alreadySet) {
        senderr(res, 609, `Same player cannot be Captain as well as Vice Captain.`);
        return;
      }

      // Update captain and write it back to database
      //console.log(myplayer);
      //console.log(myplayer.name)
      if (mytype == is_Captain) {
        caprec.captain = iplayer;
        caprec.captainName = myplayer.name;
      } else {
        caprec.viceCaptain = iplayer;
        caprec.viceCaptainName = myplayer.name;
      }
      //console.log(caprec);
      caprec.save();
      //   if (err) senderr(res, DBFETCHERR, `Could not update ${caporvice}`);
      //   else sendok(res, `${caporvice} updated for user ${iuser}`);
      // });
      sendok(res, `${caporvice} updated for user ${iuser}`);
    }
  });
}

async function unopt_publish_auctionedplayers(res, groupid, userid, withOrWithout)
{
  var myfilter;
  var userFilter;

  var myGroup = await IPLGroup({gid: groupid});
  if (!myGroup) { senderr(res, 601, `Invalid group number ${groupid}`); return; }
  if (isNaN(userid)) { senderr(res, 605, "Invalid user"); return; }
  if (userid === allUSER) { 
    myfilter = {gid: groupid};
    userFilter = {};
  }else {
    myfilter = {gid: groupid, uid: userid};
    userFilter = {uid: userid}
  }
  var PallCaptains = Captain.find(myfilter); 
  var Pgmembers = GroupMember.find({gid: groupid});
  var PallUsers = User.find(userFilter);
  var Pdatalist = Auction.find(myfilter);
  
  var allCaptains = await PallCaptains;
  var allUsers = await PallUsers;
  var datalist = await Pdatalist;
  var gmembers = await Pgmembers; 
  //console.log(datalist);

  datalist = _.map(datalist, d => _.pick(d, ['uid', 'pid', 'playerName', 'team', 'bidAmount']));
  var userlist = _.map(gmembers, d => _.pick(d, ['uid']));
  if (userid != allUSER)
    userlist = _.filter(userlist, x => x.uid == userid);

  var grupdatalist = [];
  userlist.forEach( myuser => {
    var userRec = _.filter(allUsers, x => x.uid == myuser.uid);
    //console.log(`${userRec}`);
    var myplrs = _.filter(datalist, x => x.uid === myuser.uid);
    myplrs = _.sortBy(myplrs, x => x.playerName);
    // set captain and vice captain
    var caprec = _.find(allCaptains, x => x.uid == myuser.uid);
    if (withOrWithout === WITH_CVC) {
      if (caprec) {
        var myidx = _.findIndex(myplrs, (x) => {return x.pid == caprec.captain;}, 0);
        if (myidx >= 0) myplrs[myidx].playerName = myplrs[myidx].playerName + " (C)"
        myidx = _.findIndex(myplrs, (x) => {return x.pid == caprec.viceCaptain;}, 0);
        if (myidx >= 0) myplrs[myidx].playerName = myplrs[myidx].playerName + " (VC)"  
      } 
    }

    var tmp = {uid: myuser.uid, 
      userName: userRec[0].userName, displayName: userRec[0].displayName, 
      players: myplrs};
    grupdatalist.push(tmp);
  })
  grupdatalist = _.sortBy(grupdatalist, 'bidAmount').reverse();
  // console.log(grupdatalist.length);
  sendok(res, grupdatalist);
}

async function publish_auctionedplayers(res, groupid, userid, withOrWithout)
{
  var myfilter;
  var userFilter;

  // var myGroup = await IPLGroup.findOne({gid: 1});
  var myGroup = await akshuGetGroup(groupid);
  if (!myGroup) { senderr(res, 601, `Invalid group number ${groupid}`); return; }
  // console.log(myGroup);

  // if (isNaN(userid)) { senderr(res, 605, "Invalid user"); return; }
  if (userid === allUSER) { 
    myfilter = {gid: groupid};
    userFilter = {};
  } else {
    myfilter = {gid: groupid, uid: userid};
    userFilter = {uid: userid}
  }

  var PallCaptains = Captain.find(myfilter); 
  // var Pgmembers = GroupMember.find({gid: groupid});
  // var PallUsers = User.find(userFilter);
  // var Pdatalist = Auction.find(myfilter);
  
  var allCaptains = await PallCaptains;
  // var allUsers = await PallUsers;

  let gmembers = await akshuGetGroupMembers(groupid);       //     Pgmembers; 
  let userlist = _.map(gmembers, d => _.pick(d, ['uid']));
  let datalist = await akshuGetAuction(groupid);
  datalist = _.map(datalist, d => _.pick(d, ['uid', 'pid', 'playerName', 'team', 'bidAmount']));

  if (userid !== allUSER) {
    userlist = _.filter(userlist, u => u.uid === userid);
    datalist = _.filter(datalist, d => d.uid === userid);
  }  
  
  var grupdatalist = [];
  // userlist.forEach( myuser => {
  for(idx=0; idx<userlist.length; ++idx) {
    let myuser = userlist[idx];
    let userRec = await akshuGetUser(myuser.uid);   //          _.filter(allUsers, x => x.uid == myuser.uid);
    //console.log(`${userRec}`);

    let myplrs = _.filter(datalist, p => p.uid === myuser.uid);
    myplrs = _.sortBy(myplrs, p => p.playerName);

    // set captain and vice captain
    if (withOrWithout === WITH_CVC) {
      let caprec = _.find(allCaptains, c => c.uid === myuser.uid);
      if (caprec) {
        var myidx = _.findIndex(myplrs, (x) => {return x.pid == caprec.captain;}, 0);
        if (myidx >= 0) myplrs[myidx].playerName = myplrs[myidx].playerName + " (C)"
        myidx = _.findIndex(myplrs, (x) => {return x.pid == caprec.viceCaptain;}, 0);
        if (myidx >= 0) myplrs[myidx].playerName = myplrs[myidx].playerName + " (VC)"  
      } 
    }

    let tmp = {uid: myuser.uid, 
      userName: userRec.userName, displayName: userRec.displayName, 
      players: myplrs};
    grupdatalist.push(tmp);
  };
  grupdatalist = _.sortBy(grupdatalist, 'bidAmount').reverse();
  // console.log(grupdatalist.length);
  sendok(res, grupdatalist);
}



async function publish_users(res, filter_users) {
  //console.log(filter_users);
  var ulist = await User.find(filter_users);
  // ulist = _.map(ulist, o => _.pick(o, ['uid', 'userName', 'displayName', 'defaultGroup']));
  ulist = _.sortBy(ulist, 'userName');
  sendok(res, ulist);
}

async function publishCaptain(res, filter_users) {
  // console.log(filter_users);
  var ulist = await Captain.find(filter_users);
  // ulist = _.map(ulist, o => _.pick(o, ['gid', 'uid',
  //   'captain', 'captainName',
  //   'viceCaptain', 'viceCaptainName']));
  // console.log(ulist);
  sendok(res, ulist);
}

// return true if IPL has started
async function ipl_started(mygroup) {
  var justnow = new Date();
  var groupRec = await IPLGroup.findOne({gid: mygroup})
  if (!groupRec) return("Invalid Group");
  var mymatch = await CricapiMatch.find({tournament: groupRec.tournament}).limit(1).sort({ "matchStartTime": 1 });

  // console.log(mymatch[0]);
  var difference = 1;   // make it positive if no match schedule
  if (mymatch.length > 0) {
    var firstMatchStart = mymatch[0].matchStartTime;  
    firstMatchStart.setHours(firstMatchStart.getHours() - 1)
    difference = firstMatchStart - justnow;
  }
  return (difference <= 0) ? `${groupRec.tournament} has started!!!! Cannot set Captain/Vice Captain` : "";
}

function sendok(res, usrmgs) { res.send(usrmgs); }
function senderr(res, errcode, errmsg) { res.status(errcode).send({error: errmsg}); }
function setHeader(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  _group = defaultGroup;
  _tournament = defaultTournament;
}
module.exports = router;

async function showGroupMembers(res, groupno) {
  //console.log(_ggroupnoroup);
  // gmlist = await GroupMember.find({ gid: groupno, enable: true });
  gmlist = await akshuGetGroupMembers(groupno);
  // ulist = _.map(ulist, o => _.pick(o, ['uid', 'userName', 'displayName', 'defaultGroup']));
  if (gmlist.length > 0)
    gmlist = _.map(gmlist, o => _.pick(o, ['gid', 'uid', 'userName', 'displayName']));
  // var userlist = _.map(gmlist, 'uid');
  // publish_users(res, { uid: { $in: userlist } });
  gmlist = _.sortBy(gmlist, 'userName')
  sendok(res, gmlist);
}
