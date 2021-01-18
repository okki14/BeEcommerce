module.exports={
    Checkuser: (req,res,next)=>{
        if(req.user.id == req.query.userid){
            next()
        }else{
           
                return res.status(401).json({message:"User not authorized",error:'User not authorized'})
            
        }
    }
}