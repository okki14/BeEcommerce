const {db}=require ('../conections')
const {uploader}=require('./../helpers/uploader')
const fs=require('fs')


module.exports={
    AddKimia:(req,res)=>{
        const data=req.body        
        var sql=`insert into kimia set ?`
        db.query(sql,data,(err)=>{
            if(err){
                return res.status(500).send(err)
            }
           db.query(`select * from kimia`,(err,results)=>{
               if(err){
                   return res.status(500).send(err)
               }
               res.status(200).send(results)
           })
        })
    },
    GetKimia:(req,res)=>{
        let sql=`select * from kimia `
        db.query(sql,(err,dataproduct)=>{
            if (err) return res.status(500).send(err)
            return res.status(200).send(dataproduct)
        })
    },
    AddProduct:(req,res)=>{
        try {
            const path='/product'
            const upload=uploader(path,'PROD').fields([{ name: 'image'}])
            upload(req,res,(err)=>{
                if(err){
                    return res.status(500).json({ message: 'Upload picture failed !', error: err.message });
                }
                console.log('berhasil upload')
                const {image} = req.files;                
                const imagePath = image ? path + '/' + image[0].filename : null;
                console.log(req.body.data);
                const data = JSON.parse(req.body.data);
                const {resep}=data
                console.log('dawdadw');
                let datainsert={
                    namaprod:data.namaprod,
                    banner:imagePath,
                    harga:data.harga
                   
                }
                var dataA=[]
                var sql=`insert into product set ?`               
                db.query(sql,datainsert,(err,product)=>{
                    if (err){
                        if(imagePath){
                            console.log(imagePath);
                            fs.unlinkSync('./public'+imagePath)
                        }
                        return res.status(500).send(err)
                    }
                    resep.forEach(element => {
                        dataA.push([product.insertId,element.kimia_id,element.dosis]) 
                    });
                    var sqlA="insert into productkimia (product_id, kimia_id, dosis) VALUES ?"
                    db.query(sqlA,[dataA],(err)=>{
                        
                        if(err){
                            return res.status(500).send(err)
                        } 
                        db.query(`select * from product`,(err,results)=>{
                            if(err){
                                return res.status(500).send(err)
                            }
                            res.status(200).send(results)
                        })                         
                    })             
                })
            })            
        } catch (error) {
            return res.status(500).send(error)
        }
        
    },
    GetProduct:(req,res)=>{
        let sql=`select * from product `
        db.query(sql,(err,dataproduct)=>{
            if (err) return res.status(500).send(err)
            return res.status(200).send(dataproduct)
        })
    },
    getProductsdetails:(req,res)=>{
        const {id}=req.params
        let sql=`select * from product where id=?`
        db.query(sql,id,(err,dataprod)=>{
            if (err){
                return res.status(500).send(err.message)
            }
            sql=`select * from  productfoto where product_id=?`
            db.query(sql,id,(err,datafoto)=>{
                if (err){
                    return res.status(500).send(err.message)
                }
                return res.status(200).send({dataprod:dataprod[0],datafoto})
            })
        })
    },
    Addinventory:(req, res)=>{
        const {tgl, stok, satuan,kimia_id}=req.body
        let data={
            tgl,
            stok,
            satuan,
            kimia_id
        }        
        let sql=`select * from kimia where id= ? `
        db.query(sql,[kimia_id],(err,datauser)=>{
            if(err)return res.status(500).send(err)
            if(datauser.length){
                // data={
                    //     ...data,
                    //     kimia_id:datauser[0].id
                    // }
                    db.query(`insert into inventory set ?`, data,(err)=>{
                        if(err){
                            return res.send(err)
                        }
                        res.send(data)
                    })
                }
                    
              
            })       
        },
        GetInventory:(req,res)=>{
            let sql=`select * from inventory `
            db.query(sql,(err,dataproduct)=>{
                if (err) return res.status(500).send(err)
                return res.status(200).send(dataproduct)
            })
        },
        GetInventoryTotal:(req,res)=>{
            let sql=`select kimia_id,komponen, sum(stok) as totalstok, tgl
                    from inventory 
                    join kimia on  inventory.kimia_id =kimia.id
                    group by kimia_id;                    `
            db.query(sql,(err,dataproduct)=>{
                if (err) return res.status(500).send(err)
                return res.status(200).send(dataproduct)
            })
        },
        getproductkimia:(req,res)=>{
            let sql=`select * from ecommerce.productkimia `
            db.query(sql,(err,dataproduct)=>{
                if (err) return res.status(500).send(err)
                return res.status(200).send(dataproduct)
            })
        },






















        
        // EditInventory:(req,res)=>{
        //     console.log('sdadw');        
        //     var data=req.body
        //     console.log(data);
        //     var sql=`update inventory set? where id= ${db.escape(req.params.id)}`
        //     console.log(sql);
        //     db.query(sql,data,(err)=>{
        //         if(err){
        //             return res.status(500).send(err)
        //         }
        //        db.query(`select * from inventory`,(err,results)=>{
        //            if(err){
        //                return res.status(500).send(err)
        //            }
        //            return res.status(200).send(results)
        //        })
        //     })
        // }
        
    }
    
    
    
    
    // const {namaprod, banner, harga,resep}=req.body
    // var data={
    //         namaprod,
    //         banner,
    //         harga            
    //     }
    //     var dataA=[]        
    //     // resep :[{kimiaid:,dosis:20},{}]
    //     // [[1,1,20],[1,2,10]]
    //     var sql=`insert into product set ?`        
    //     db.query(sql,data,(err,product)=>{
    //             if(err){
    //                     return res.status(500).send(err)
    //                 }
    //                 resep.forEach(element => {
    //                        dataA.push([product.insertId,element.kimia_id,element.dosis]) 
    //                     });
    //                     var sqlA="insert into productkimia (product_id, kimia_id, dosis) VALUES ?"
    //                     db.query(sqlA,[dataA],(err)=>{
    //                             if(err){
    //                                     return res.status(500).send(err)
    //                                 } 
    //                                 db.query(`select * from product`,(err,results)=>{
    //                                        if(err){
    //                                                return res.status(500).send(err)
    //                                             }
    //                                             res.status(200).send(results)
    //                                         })                         
    //                                     })
    //                                 })



// EditKimia:(req,res)=>{
// var data=req.body        
// var sql=`update kimia set? where id= ${db.escape(req.params.id)}`//db.escape untuk menhindari mysql injaction
// db.query(sql,data,(err)=>{
// if(err){
// return res.status(500).send(err)
// }
// db.query(`select * from kimia`,(err,results)=>{
// if(err){
// return res.status(500).send(err)
// }
// return res.status(200).send(results)
// })
// })
// },