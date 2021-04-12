const algorithm = 'aes-256-ctr';
const akshusecretKey = 'TihomHahs@UhskaHahs#19941995Bona';
const ankitsecretKey = 'Tikna@Itark#1989#1993Bonaventure';

const iv = '05bd9fbf50b124cd2bad8f31ca1e9ca4';           //crypto.randomBytes(16);
//zTvzr3p67VC61jmV54rIYu1545x4TlY

var arun_user={};
var arun_group={};
var arun_groupMember={};
var arun_auction={};
var arun_tournament={};


const encrypt = (text) => {

    //console.log(`Text is ${text}`);
    const cipher = crypto.createCipheriv(algorithm, akshusecretKey, Buffer.from(iv, 'hex'));	
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    //myIv = iv.toString('hex');

    return encrypted.toString('hex');
};

const decrypt = (hash) => {

    const decipher = crypto.createDecipheriv(algorithm, akshusecretKey, Buffer.from(iv, 'hex'));
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);
    return decrpyted.toString();
};

const dbencrypt = (text) => {

    //console.log(`Text is ${text}`);
    const cipher = crypto.createCipheriv(algorithm, ankitsecretKey, Buffer.from(iv, 'hex'));
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    //myIv = iv.toString('hex');

    return encrypted.toString('hex');
};

const dbdecrypt = (hash) => {

    const decipher = crypto.createDecipheriv(algorithm, ankitsecretKey, Buffer.from(iv, 'hex'));
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);
    return decrpyted.toString();
};

const getLoginName = (name) => {
    return name.toLowerCase().replace(/\s/g, "");
  }
  
const getDisplayName = (name) => {
    var xxx = name.split(" ");
    xxx.forEach( x => { 
      x = x.trim()
      x = x.substr(0,1).toUpperCase() +
        (x.length > 1) ? x.substr(1, x.length-1).toLowerCase() : "";
    });
    return xxx.join(" ");
  }

const svrToDbText = (text) => {
	// first decrypt text sent by server
    let xxx = decrypt(text);
	// now encrypt this for database
	xxx = dbencrypt(xxx);
    return xxx;
  }

const dbToSvrText = (text) => {
	// first decrypt text of database
    let xxx = dbdecryptdecrypt(text);
	// now encrypt this for server
	xxx = encrypt(xxx);
    return xxx;
  }

async function sendCricMail (dest, mailSubject, mailText) {

  //console.log(`Destination is ${dest}`);
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: APLEMAILID,
      pass: 'Anob@1989#93'
    }
  });

  var mailOptions = {
    from: APLEMAILID,
    to: '',
    subject: '',
    text: ''
  };

  console.log("About to start");
  mailOptions.to = dest;
  mailOptions.subject = mailSubject;
  mailOptions.text = mailText;

  console.log(mailOptions.to);
  console.log(mailOptions.subject);
  console.log(mailOptions.text.length);
  console.log(`About to send email`);
  try {
    let response = await transporter.sendMail(mailOptions);
    //console.log(response);
    return ({status: true, error: 'Email Successfully sent'});
  } catch (e) {
    console.log("error sending email");
    console.log(e);
    return ({status: false, error: 'error sending Email'});
  }
  // how to handle error. don't know may be use try/catch 
  /***
  transporter.sendMail(mailOptions, function(error, info){
	console.log('insertBefore');
    if (error) {
      console.log(error);
	  return ({status: false, error: error});
      //senderr(603, error);
    } else {
      console.log('Email sent: ' + info.response);
	  return ({status: true, error: info.response});
      //sendok('Email sent: ' + info.response);
    }
  });
  console.log('udi baba');
  ***/
} 

  
async function GroupMemberCount(groupid) {
  let memberCount = 0;
  let xxx = await GroupMember.aggregate([
    {$match: {gid: parseInt(groupid)}},
    {$group : {_id : "$gid", num_members : {$sum : 1}}}
  ]);
  if (xxx.length === 1) memberCount = xxx[0].num_members;
  return(memberCount);
}


async function akshuGetUser(uid) {
  // let suid = uid.toString();
  let retUser = arun_user[uid];
  if (retUser) return retUser;

  // console.log("from database");
  retUser = await User.findOne({uid: uid});
  if (retUser)
    arun_user[uid] = retUser;  // buffer this data
  return(retUser);
} 

async function akshuGetGroup(gid) {
  let retGroup = arun_group[gid];
  if (retGroup) return retGroup;

  console.log("from database");
  retGroup = await IPLGroup.findOne({gid: gid});
  if (retGroup)
    arun_group[gid] = retGroup;
  return(retGroup);
} 


async function akshuGetGroupMembers(gid) {
  // let x = Object.keys(arun_groupMember);
  // console.log(x);

  let retGroupMember = arun_groupMember[gid];
  if (retGroupMember) {
    return retGroupMember;
  } 

  // console.log("from database");
  let myGroup = await akshuGetGroup(gid);
  if (!myGroup) return [];

  retGroupMember = await GroupMember.find({gid: gid});
  if (retGroupMember.length === myGroup.memberCount) {
    // all memebers joined. Now buffer this for future reference
    // console.log("buffering");
    arun_groupMember[gid] = retGroupMember;
  }
  return(retGroupMember);
} 


function akshuUpdGroup(groupRec) {
  arun_group[groupRec.gid] = groupRec;
} 

function akshuUpdGroupMember(gmRec) {
  let x = arun_groupMember[gmRec.gid];
  if (x) {
    let tmp = _.filter(x, u => u.uid !== gmRec.uid);
    tmp.push(gmRec);
    arun_groupMember[gmRec.gid] = tmp;
    // console.log(arun_groupMember);
  } 
}

async function akshuGetAuction(gid) {
  // let x = Object.keys(arun_auction);
  // console.log(x);

  let retVal = arun_auction[gid];
  if (retVal) return retVal;

  // not in buffer 
  // console.log("Auctioj not i buffer");
  let myGroup = await akshuGetGroup(gid);
  if (!myGroup) return [];
  
  retVal = await Auction.find({gid: gid});
  if (myGroup.auctionStatus === "OVER")  {
    // console.log("buffering");
    arun_auction[gid] = retVal;
  } 
  return(retVal);
} 


async function akshuGetTournament(gid) {
  let retVal = arun_tournament[gid];
  if (retVal) return retVal;
  
  // console.log("from database");
  let myGroup = await akshuGetGroup(gid);
  if (!myGroup)  return;

  retVal = await Tournament.findOne({name: myGroup.tournament})
  if (retVal)
    arun_tournament[gid] = retVal;
  return(retVal);
} 

async function getTournamentType(myGid) {
  // let xxx = await IPLGroup.findOne({gid: myGid});
	// let tRec = await Tournament.findOne({name: xxx.tournament});
	// let tmp = tRec.type;
	// return(tmp);
  let tType = "";
  let myTournament = await akshuGetTournament(myGid);
  if (myTournament) tType = myTournament.type;
  return tType;
}

module.exports = {
    getLoginName, getDisplayName,
    encrypt, decrypt, dbencrypt, dbdecrypt,
  	dbToSvrText, svrToDbText,
    GroupMemberCount,
	  sendCricMail,
    // get
    akshuGetUser,
    akshuGetGroup,
    akshuGetGroupMembers,
    akshuGetAuction,
    akshuGetTournament,
    getTournamentType,
    // update
    akshuUpdGroup,
    akshuUpdGroupMember,

  }; 
