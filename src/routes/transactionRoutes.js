const Router=require('express').Router()
const {auth}=require('./../helpers/Auth')
const {TransactionController}=require('../controllers')

Router.post('/cart',auth,TransactionController.Addtocart)
Router.get('/getcart',auth,TransactionController.getCart)










module.exports=Router