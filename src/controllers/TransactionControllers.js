const {db}=require('../conections')
const {uploader}=require('./../helpers/uploader')
const {transporter}=require('./../helpers/mailers')
const fs=require('fs')
const handlebars=require('handlebars')

const QueryProm=(sql)=>{
    return new Promise((resolve,reject)=>{
        db.query(sql,(err,results)=>{
            if (err){
                reject(err)
            }else{
                resolve(results)
            } 
        })
    })
}
module.exports={
    Addtocart:(req,res)=>{
        const {userid,productid,qty}=req.body
        let sql=`select * from transaction where status='oncart' and user_id=${db.escape(userid)}`
        db.query(sql,(err,results)=>{
            if (err){            
                return res.status(500).send(err)
            }
            //untuk mencek user sudah ada transaksi atau belum
            if(results.length){
                sql=`select * from product_transaction where product_id=${db.escape(productid)} and transaction_id=${db.escape(results[0].id)} and isdeleted=0`
                db.query(sql,(err,results1)=>{
                    if (err){  
                        return res.status(500).send(err) 
                    }
                    if(results1.length){ //kalo results1.length true maka kita hanya perlu update qty
                        let dataupdate={
                            qty:parseInt(results1[0].qty)+parseInt(qty)
                        }
                        sql=`update product_transaction set ? where product_id=${db.escape(results1[0].product_id)} and transaction_id=${db.escape(results1[0].transaction_id)}`
                        db.query(sql,dataupdate,(err)=>{
                            if (err){  
                                return res.status(500).send(err) 
                            }
                            sql=`select pt.qty,p.namaprod,p.banner,p.harga,p.id as idprod,t.id as idtrans 
                                    from product_transaction pt 
                                    join transaction t on pt.transaction_id=t.id
                                    join product p on pt.product_id=p.id
                                    where t.status='onCart' and t.user_id=? and pt.isdeleted=0;`
                            db.query(sql,[userid],(err,datacart)=>{
                                if (err){
                                    console.log(err)
                                    return res.status(500).send(err)
                                }
                                return res.send(datacart)
                            })
                        })
                    }else{
                        // klo product di cart belum ada
                        let datainsert={
                            product_id:productid,
                            transaction_id:results[0].id,
                            qty:qty
                        }
                        sql=`insert into product_transaction set ?`
                        db.query(sql,datainsert,(err)=>{
                            if (err){  
                                return res.status(500).send(err) 
                            }
                            sql=`select pt.qty,p.namaprod,p.banner,p.harga,p.id as idprod,t.id as idtrans 
                                    from product_transaction pt 
                                    join transaction t on pt.transaction_id=t.id
                                    join product p on pt.product_id=p.id
                                    where t.status='onCart' and t.user_id=? and pt.isdeleted=0;`
                            db.query(sql,[userid],(err,datacart)=>{
                                if (err){
                                    console.log(err)
                                    return res.status(500).send(err)
                                }
                                return res.send(datacart)
                            })
                        })
                    }
                })
            }else{
                //kalo cart bener-bener kosong
                let data={
                    tanggal:new Date(),
                    status:"oncart",
                    user_id:userid
                }
                db.beginTransaction((err)=>{
                    if (err) { 
                       return res.status(500).send(err) 
                    }
                    sql=`insert into transaction set ?`
                    db.query(sql,data,(err,result1)=>{
                        if (err){
                            console.log(err)
                            return db.rollback(()=>{
                                res.status(500).send(err)
                            }) 
                        }
                        data={
                            product_id:productid,
                            transaction_id:result1.insertId,
                            qty:qty
                        }
                        sql=`insert into product_transaction set ?`
                        db.query(sql,data,(err)=>{
                            if (err){
                                return db.rollback(()=>{
                                    res.status(500).send(err)
                                }) 
                            }
                            db.commit((err)=>{
                                if (err){
                                    return db.rollback(()=>{
                                        res.status(500).send(err)
                                    }) 
                                }
                                sql=`select pt.qty,p.namaprod,p.banner,p.harga,p.id as idprod,t.id as idtrans 
                                        from product_transaction pt 
                                        join transaction t on pt.transaction_id=t.id
                                        join product p on pt.product_id=p.id
                                        where t.status='onCart' and t.user_id=? and pt.isdeleted=0;`
                                    db.query(sql,[userid],(err,datacart)=>{
                                    if (err){
                                        return res.status(500).send(err)
                                    }
                                    return res.send(datacart)
                                })
                            })
                        })
                    })
                })
            }
        })
    },
    getCart:(req,res)=>{
        const {userid}=req.query
        sql=`select pt.qty,p.namaprod,p.banner,p.harga,p.id as idprod,t.id as idtrans 
            from product_transaction pt 
            join transaction t on pt.transaction_id=t.id
            join product p on pt.product_id=p.id
            where t.status='onCart' and t.user_id=? and pt.isdeleted=0;`
        db.query(sql,[userid],(err,datacart)=>{
            if (err){
                console.log(err)
                return res.status(500).send(err)
            }
            return res.send(datacart)
        })
    },    
    onbayarCC:(req,res)=>{
        const {idtrans,nomercc,datacart}=req.body
        let sql=`update transaction set ? where id=${db.escape(idtrans)}` 
        let dataupdate={
            tanggal:new Date(),
        status:'completed',
        metode:'cc',
        buktipembayaran:nomercc
    }
    db.query(sql,dataupdate,(err)=>{
        if (err){
            console.log(err)
            return res.status(500).send(err)
        }
        let arr=[]
        datacart.forEach((val)=>{
            arr.push(QueryProm(`update product_transacsion set hargabeli=${val.harga} where transaction_id=${val.idtrans} and product_id=${val.idprod}`))
        })
        Promise.all(arr).then(()=>{
            return res.send('berhasil')
        }).catch((err)=>{
            console.log(err)
            return res.status(500).send(err)
        })
        
    })
    },
    uploadPembayaran:(req,res)=>{    
    const path='/foto'
    const upload=uploader(path,'Bukti').fields([{ name: 'bukti'}])
    upload(req,res,(err)=>{
        if(err){
            return res.status(500).json({ message: 'Upload picture failed !', error: err.message });
        }
        const {bukti} = req.files;
        const imagePath = bukti ? path + '/' + bukti[0].filename : null;
        const data = JSON.parse(req.body.data); 
        let sql=`update transaction set ? where id=${db.escape(data.idtrans)}` 
        let dataupdate={
            tanggal:new Date(),
            status:'OnwaitingApprove',
            metode:'bukti' ,
            buktipembayaran:imagePath
        }
        db.query(sql,dataupdate,(err)=>{
            if (err){
                if(imagePath){
                    fs.unlinkSync('./public'+imagePath)
                }
                return res.status(500).send(err)
            }
            return res.send('berhasil')
        })
    })
    },
    // getAdminwaittingApprove:(req,res)=>{
    // let sql=`select * from transaction where status='onwaitingapprove'`
    // db.query(sql,(err,waitingapprove)=>{
    //     if (err){
    //         console.log(err)
    //         return res.status(500).send(err)
    //     }
    //     return res.send(waitingapprove)
    // })
    // },
    // AdminApprove:(req,res)=>{
    // const {id}=req.params
    // let sql=`update transaction set ? where id=${db.escape(id)}`
    // let dataupdate={
    //     status:'completed'
    // }
    // db.query(sql,dataupdate,(err)=>{
    //     if (err){
    //         console.log(err)
    //         return res.status(500).send(err)
    //     }
    //     sql=`select * from transaction where id=${db.escape(id)}`
    //     db.query(sql,(err,datatrans)=>{
    //         if (err){
    //             console.log(err)
    //             return res.status(500).send(err)
    //         }
            
    //         sql=`select * from user where id=${db.escape(datatrans[0].users_id)}`
    //         db.query(sql,(err,datausers)=>{
    //             if (err){
    //                 console.log(err)
    //                 return res.status(500).send(err)
    //             }
    //             const htmlrender=fs.readFileSync('./template/notif.html','utf8')
    //             const template=handlebars.compile(htmlrender) 
    //             const htmlemail=template({message:'Transaksi Berhasil'})
    //             transporter.sendMail({
    //                 from:"Apotik CAHRO<purbasiahaan@gmail.com>",
    //                 to:datausers[0].email,
    //                 subject:'Payment',
    //                 html:htmlemail
    //             },(err)=>{
    //                 if (err){
    //                     console.log(err)
    //                     return res.status(500).send(err)
    //                 }
    //                 this.getAdminwaittingApprove(req,res)
    //             })
    //         })
    //     })
        
    // })
    // },
    // Adminreject:(req,res)=>{
    // const {id}=req.params
    // let sql=`update transaction set ? where id=${db.escape(id)}`
    // let dataupdate={
    //     status:'rejected'
    // }
    // db.query(sql,dataupdate,(err)=>{
    //     if (err){
    //         console.log(err)
    //         return res.status(500).send(err)
    //     }
    //     this.getAdminwaittingApprove(req,res)
        
    // })
    // }
}