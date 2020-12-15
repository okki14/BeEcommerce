const Crypto=require('crypto')

module.exports=(password)=>{
    console.log(password);
    var katakunci='key'
    return Crypto.createHmac('sha256',katakunci).update(password).digest('hex')
}