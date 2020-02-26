const mongoose=require('./db');
var GoodsSchema=mongoose.Schema({
    productId:String,
    productName:String,
    salePrice:Number,
    productImage:String,
    productUrl:String
})
var Goods=mongoose.model('Goods',GoodsSchema,'goods');
module.exports=Goods;