const algorithm = 'aes-256-ctr';
const akshusecretKey = 'TihomHahs@UhskaHahs#1994$1995Bon';
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
    GroupMemberCount,
};
