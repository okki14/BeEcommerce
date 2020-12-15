const Router=require('express').Router()
const {AuthControllers}=require('./../controllers')
const {AdminControllers}=require('../controllers')


Router.post('/register',AuthControllers.register)
Router.post('/login',AuthControllers.Login)
Router.get('/keeplogin/:id',AuthControllers.keeplogin)

Router.post('/kimia', AdminControllers.AddKimia)
Router.get('/getkimia', AdminControllers.GetKimia)

Router.post('/prod', AdminControllers.AddProduct)
Router.get('/getproduct', AdminControllers.GetProduct)
Router.get('/getproduct/:id',AdminControllers.getProductsdetails)

Router.post('/inventory', AdminControllers.Addinventory)
Router.get('/getinventory', AdminControllers.GetInventory)
Router.get('/getinventorytot', AdminControllers.GetInventoryTotal)

Router.get('/getproductkimia', AdminControllers.getproductkimia)


// Router.put('/editinventory/:id', AdminControllers.EditInventory)


module.exports=Router