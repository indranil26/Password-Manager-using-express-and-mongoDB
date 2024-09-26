const dotenv=require('dotenv')
const crypto=require('crypto')

dotenv.config()

const KEY=process.env.ENCRYPTION_KEY
const IV=process.env.IV

const encrypt=(text)=>{
 let cipher=crypto.createCipheriv('aes-256-cbc', Buffer.from(KEY, 'hex'), Buffer.from(IV,'hex'))
 let encrypted=cipher.update(text,'utf8','hex')
 encrypted+=cipher.final('hex')
 return encrypted
}

const decrypt=(encryptedText)=>{
    let decipher=crypto.createDecipheriv('aes-256-cbc', Buffer.from(KEY, 'hex'), Buffer.from(IV,'hex'))
    let decrypted=decipher.update(encryptedText,'hex','utf8')
    decrypted+=decipher.final('utf8')
    return decrypted
}

module.exports={encrypt,decrypt}
