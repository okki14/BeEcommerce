const Router=require('express').Router()
const {auth}=require('./../helpers/Auth')
const {TransactionController}=require('../controllers')
const {Checkuser}=require('./../helpers/checkiduser')


Router.post('/cart',TransactionController.Addtocart)
Router.get('/getcart',TransactionController.getCart)
Router.post('/bayarcc',auth,TransactionController.onbayarCC)
Router.post('/bayarbukti',auth,Checkuser,TransactionController.uploadPembayaran)

// Router.get('/adminwaiting',TransactionController.getAdminwaittingApprove)
// Router.put('/approve/:id',TransactionController.AdminApprove)
// Router.put('/reject/:id',TransactionController.Adminreject)











module.exports=Router