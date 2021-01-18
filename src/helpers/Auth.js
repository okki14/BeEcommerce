const jwt=require('jsonwebtoken')

module.exports={
    auth: (req,res,next)=>{
        if(req.method !== "OPTIONS"){
            console.log(req.token)
            jwt.verify(req.token,"key",(error,decoded)=>{
                if (error){
                    return res.status(401).json({message:"User not authorized",error:'User not authorized'})
                }
                req.user=decoded
                console.log(decoded);
                next()
            });
        }else{
            next()
        }
    }
}