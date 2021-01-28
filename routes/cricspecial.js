const algorithm = 'aes-256-ctr';
const akshusecretKey = 'TihomHahs@UhskaHahs#19941995Bona';
const ankitsecretKey = 'Tikna@Itark#1989#1993Bonaventure';

const iv = '05bd9fbf50b124cd2bad8f31ca1e9ca4';           //crypto.randomBytes(16);
//zTvzr3p67VC61jmV54rIYu1545x4TlY

const encrypt = (text) => {

    console.log(`Text is ${text}`);
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

    console.log(`Text is ${text}`);
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
      user: CRICDREAMEMAILID,
      pass: 'Anob@1989#93'
    }
  });

  var mailOptions = {
    from: CRICDREAMEMAILID,
    to: '',
    subject: '',
    text: ''
  };

  mailOptions.to = dest;
  mailOptions.subject = mailSubject;
  mailOptions.text = mailText;

  //console.log(mailOptions.to);
  //console.log(mailOptions.subject);
  //console.log(`About to send email`);
  let response = await transporter.sendMail(mailOptions);
  console.log(response);
  // how to handle error. don't know may be use try/catch 
  return ({status: true, error: 'Email Successfully sent'});
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
  
  
module.exports = {
    getLoginName, getDisplayName,
    encrypt, decrypt, dbencrypt, dbdecrypt,
	dbToSvrText, svrToDbText,
    GroupMemberCount,
	sendCricMail,
};
