const {db}=require('../conections')
const {encrypt,transporter}=require('./../helpers')
const {createJWToken}=require('./../helpers/jwt')
const fs=require('fs')
const handlebars=require('handlebars')


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
            if (err) return res.status(500).send({message:"server down"})
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

                        const token=createJWToken({id:userslogin[0].id,username:userslogin[0].username})
                        const link=`http://localhost:3000/verified?token=${token}`
                        const htmlrender=fs.readFileSync('./template/email.html','utf8')
                        const template=handlebars.compile(htmlrender) 
                        const htmlemail=template({name:userslogin[0].username,link:link})

                        transporter.sendMail({
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
    }

}