const jwt=require('jsonwebtoken')

module.exports={
    auth : (req, res, next) => {
        // console.log(req.method)
        if (req.method !== "OPTIONS") {
            // let success = true;
            console.log(req.token)
            jwt.verify(req.token, "puripuri", (error, decoded) => {
                if (error) {
                    // success = false;
                    return res.status(401).json({ message: "User not authorized.", error: "User not authorized." });
                }
                console.log(decoded,'inidecode')
                req.user = decoded;
                next();
            });
        } else {
            next();
        }
    }
}