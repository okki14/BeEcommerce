const jwt= require('jsonwebtoken')

module.exports={
    createJWToken(payload){
        return jwt.sign(payload,"key",{expiresIn:'12h'})
    }
}