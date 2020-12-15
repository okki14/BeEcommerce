const express=require('express')
const app=express()
const bodyParser=require('body-parser')
const cors=require('cors')
const bearerToken=require('express-bearer-token')

require('dotenv').config()

const PORT = process.env.PORT || 8000


app.use(cors())
app.use(bearerToken())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));//buat user kirim data ke server
app.use(express.static('public'))//buat image


app.get('/',(req,res)=>{
    res.send('<h1>Welcome to Jungle</h1>')
})

const {
    AuthRoutes,
    TransactionRoutes
    
}=require('./src/routes')

app.use('/auth',AuthRoutes)
app.use('/trans',TransactionRoutes)


app.listen(PORT,()=>{
    console.log('Api Aktif di Port '+PORT)
})