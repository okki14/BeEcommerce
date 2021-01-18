const {db}=require('../conections')
const {encrypt}=require('./../helpers')
const nodemailer=require('nodemailer')
const {createJWToken}=require('./../helpers/jwt')
const fs=require('fs')
const handlebars=require('handlebars')

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

const DbPROMselect=(sql)=>{
    return new Promise((resolve,rejects)=>{
        db.query(sql,(err,results)=>{
            if(err){
                rejects(err)
            }else{
                resolve(results)
            }
        })
    })
}



module.exports={
    
    register:(req,res)=>{
        const {username,email,password}=req.body
        let sql=`select * from user where username = ?`        
        db.query(sql,[username],(err,results)=>{
            if (err) return res.status(500).send({message:"server sedang down"})
            if(results.length){
                return res.status(500).send({message:"username sudah terdaftar"})
            }else{
                let hashpassword=encrypt(password)
                var data={
                    username:username,
                    email,
                    password:hashpassword
                }
                sql=`insert into user set ?`
                db.query(sql,data,(err,results)=>{                
                    if (err) return res.status(500).send({message:err.message})                    

                    sql=`select * from user where id = ?`
                   
                    db.query(sql,[results.insertId],(err,userslogin)=>{
                        if (err) return res.status(500).send({message:"server down"})
                        
                        const htmlrender=fs.readFileSync('./template/email.html','utf8')
                        const token=createJWToken({id:userslogin[0].id,username:userslogin[0].username})
                        const template=handlebars.compile(htmlrender) 
                        const link=`http://localhost:3000/verified?token=${token}`
                        const htmlemail=template({name:userslogin[0].username,link:link})

                        //untuk kirim email cuy   
                        console.log('dwdwqd');

                        transporter.sendMail ({
                            from:"Toko Engkong<purbasiahaan@gmail.com>",
                            to:email,
                            subject:'Tekan Tombol Confirm ',
                            html:htmlemail
                        }).then(()=>{
                            userslogin[0].token=token
                            return res.send(userslogin[0])
                        }).catch((err)=>{
                            return res.status(500).send({message:err.message})
                        })
                    })
                })
            }
        })
    },
    Login:(req,res)=>{
        const {username,password}=req.body
        let hashpassword=encrypt(password)
        let sql=`select * from user where username = ? and password = ?`
        db.query(sql,[username,hashpassword],(err,datausers)=>{
            if (err) return res.status(500).send({message:err.message})
            if (!datausers.length){
                return res.status(500).send({message:'user tidak terdaftar'})
            }
            sql=`select pt.qty,p.namaprod,p.banner,p.harga,p.id as idprod,t.id as idtrans 
                    from product_transaction pt 
                    join transaction t on pt.transaction_id=t.id
                    join product p on pt.product_id=p.id
                    where t.status='onCart' and t.user_id=? and pt.isdeleted=0;`
                    console.log('wdadadw');
            db.query(sql,[datausers[0].id],(err,cart)=>{
                if (err) return res.status(500).send({message:err.message})
                const token=createJWToken({id:datausers[0].id,username:datausers[0].username})
                datausers[0].token=token
                return res.send({datauser:datausers[0],cart:cart})
            })
        })
    },
    keeplogin:async (req,res)=>{//cara 
        const{id}=req.params
        let sql=`select * from user where id=${db.escape(id)}`
        try {
            const results=await DbPROMselect(sql)
            sql=`select pt.qty,p.namaprod,p.banner,p.harga,p.id as idprod,t.id as idtrans 
                    from product_transaction pt 
                    join transaction t on pt.transaction_id=t.id
                    join product p on pt.product_id=p.id
                    where t.status='onCart' and t.user_id= ${db.escape(results[0].id)} and pt.isdeleted=0;`
             const cart=await DbPROMselect(sql)
             const token=createJWToken({id:results[0].id,username:results.username})
             results[0].token=token
             res.send({datauser:results[0],cart:cart})       
             
            
        } catch (error) {
            return res.status(500).send({message:error.message})
        }
    },
    verified:(req,res)=>{
        const{id}=req.user
        var dataedit={
            verified:true
        }
        console.log(req.token);
        console.log(id);
        let sql=`update user set ? where id = ${db.escape(id)}`
        db.query(sql,dataedit,(err)=>{
            if(err) return res.status(500).send({message:err.message})
        sql=`select * from user  where id = ${db.escape(id)}`
        console.log('absd');
        db.query(sql,(err,results)=>{
            if(err) return res.status(500).send({message:err.message})
            results[0].token=req.token
            res.send(results[0])
        })
    })
    },
    sendverified:(req,res)=>{
        const{username,email,userid}=req.body
        const htmlrender=fs.readFileSync('index.html','utf8')
        const token=createJWToken({id:userid,username:username})//dgn token
        const template=handlebars.compile(htmlrender)
        const link=`http://localhost:3000/verified?token=${token}`//dgn token
        const htmlemail=template({name:username,link:link})

        transporter.sendMail({
            from:'drag store <purbasiahaan@gmail.com',
            to:email,
            subject:'Waktunya Verified',
            html:htmlemail
        },(err)=>{
            if(err) return res.status(500).send({message:err.message})
            return res.send(true)
        })
    },

}