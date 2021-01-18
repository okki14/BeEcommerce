
const nodemailer=require('nodemailer')
let transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'purbasiahaan@gmail.com',
        pass:'cpuedzwucfbpdasy'
    },
    tls:{
        rejectUnauthorized:false
    }
})

module.exports=transporter