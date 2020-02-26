<template>
  <div class="home">
    <div class="nav">
      <img class="logo" src="../assets/logo.svg" alt=""/>
      <span class="successName">{{successName}}</span>
      <el-button class="login" @click="dialogFormVisible=true">登录</el-button>
      <el-button class="logout" @click="handleLogout">注销</el-button>
      <el-dialog title="登陆界面" :visible.sync="dialogFormVisible">
        <el-form :model="form" status-icon :rules="rules">
          <el-form-item label="用户名" prop="username" :label-width="formLabelWidth">
            <el-input v-model="form.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="pass" :label-width="formLabelWidth">
            <el-input type="password" v-model="form.pass"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="handleLogin">确 定</el-button>
        </div>
      </el-dialog>
      <img class="iconfont" @click="handleToggle" src="../assets/购物车满.png" alt=""/>
    </div>
    <div class="menu">
      <p>
        <span>首页</span>>商品详情
      </p>
    </div>
    <div class="sort">
      <p>
        排序
        <span class="default">默认</span>
        <span @click="handleSort">
          价格
          <i class="iconfont">{{sortFlag==1?'&#xe61a;':'&#xe61b;'}}</i>
          </span>
      </p>
    </div>
    <p v-show="!goodsList.length">没有更多数据</p>
    <div class="container">
      <div class="left">
        <el-button @click="handleDefault">按钮</el-button>
        <h3>P R I C E</h3>
        <div v-for="item of searchPrice" :key="item.id">
          <p @click="handlePrice(item.gt,item.lt)">{{item.gt}}--{{item.lt}}</p>
        </div>
      </div>
        <div class="content">
          <div v-for="item of goodsList" :key="item.productName">
            <img :src="item.productImage" alt="">
            <p class="name">{{item.productName}}</p>
            <p class="price">￥{{item.salePrice}}</p>
            <button class="join" @click="addCart(item.productId)">加入购物车</button>
          </div>
        </div>
        <el-pagination 
            @current-change="getPage"
            background
            layout="prev,pager,next"
            :total="total"
             class="page"></el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: 'home',
  data(){
    var validatePass=(rule,value,callback)=>{
      if(value==""){
        callback(new Error("请输入密码"));
      }
    }
    return{
      searchPrice:[
        {gt:0,lt:100,id:1001},
        {gt:100,lt:500,id:1002},
        {gt:500,lt:1000,id:1003},
        {gt:1000,lt:5000,id:1004},
      ],
      goodsList:[],
      start:0,
      limit:8,
      total:30,
      sortFlag:1,
      dialogFormVisible:false,
      successName:"",
      formLabelWidth:"120px",
      form: {
        username: "",
        pass: ""
      },
      rules: {
        pass: [{validator:validatePass, trigger: "blur" ,required:true}],
        username: [  { required: true, message: '请输入用户名', trigger: 'blur' }]
      },
    }
  },
  mounted(){
    this.initData();
    this.$http('/users/checkLogin').then(res=>{
      if(res.data.code==200){
        this.successName=res.data.result
      }else{
        this.$message({
          message:"未登录",
          duration:1000,
          type:"warning"
        })
      }
    })
  },
  methods:{
    handleToggle(){
      this.$router.push("/cart");
    },
    getPage(page){
      this.start=(page-1)*this.limit;
      this.initData()
    },
    initData(){
      this.$http.get("/goods/list",{
        params:{start:this.start,limit:this.limit}
      }).then(res=>{
        console.log(res.data);
        if(res.data.code==200){
          this.goodsList=res.data.result;
          this.total=Math.ceil(res.data.total / this.limit)*10
        }
      })
    },
    handleLogin(){
      if(this.form.username && this.form.pass){
        this.$http({
           url:"/users/login",
           method:"post",
           data:{
              userName:this.form.username,
              userPwd:this.form.pass
          }.then(res=>{
            if(res.data.code==200){
              this.$message({
                message:res.data.msg,
                duration:1000,
                type:"success"
              })
              this.successName=res.data.result
              this.dialogFormVisible=false;
            }else{
              this.$message({
                duration:1000,
                message:res.data.msg,
                type:"error"
              })
            }
          })
        })
      }else{
        this.$message({
          message:"用户名和密码不能为空",
          duration:1000,
          type:"error"
        })
      }
    },
    handleLogout(){
      this.$http.post('/users/logout').then(res=>{
        this.$message({
          message:res.data.msg,
          duration:1000,
        })
        this.successName=""
      })
    },
    compareUp(value){
      return(a,b)=>{
        return a[value]-b[value];
      }
    },
    compareDown(value){
      return(a,b)=>{
        return b[value]-a[value]
      }
    },
    handleSort(){
      this.sortFlag=this.sortFlag==1? -1:1;
      if(this.sortFlag==1){
        this.goodsList.sort(this.compareUp("salePrice"));
      }else{
        this.goodsList.sort(this.compareDown("salePrice"))
      }
    },
    handlePrice(gt,lt){
      this.$http({
        url:"/goods/price",
        method:"get",
        params:{
          gt,
          lt
        }
      }).then(res=>{
        if(res.data.code==200){
          this.goodsList=res.data.result;
          this.total=10;
        }else{
          this.goodsList=[];
          this.$message({
            duration:1000,
            type:"warning"
          })
        }
      })
    },
    handleDefault(){
      this.initData();
    },
    addCart(productId){
      console.log(productId);
      this.$http({
        url:"/users/addCart",
        method:"post",
        data:{
          productId
        }
      }).then(res=>{
        console.log(res.data.msg);
        this.$message({
          message:res.data.msg,
          duration:1000,
          type:"warning"
        })
      })
    }
  },
  beforeRouteLeave (to, from, next) {
    this.$http('/users/checkLogin').then(res=>{
      if(res.data.code==200){
        next()
      }else{
        this.$message({
          message:res.data.msg,
          duration:1000
        })
      }
    })
  }
}
</script>
<style scoped>
.home{
  width: 100%;
  height: 100%;
  margin-left: auto;
  margin-right: auto;
  background: #f5f7fc;
}
.nav{
  width: 100%;
  height: 34px;
  background: #fff;
}
.logo{
  width: 30px;
  height: 30px;
  margin-left: 100px;
  float: left;
}
.login{
  margin-left: 920px;
  margin-top: 10px;
  float: left;
}
.logout{
  margin-left: 10px;
}
.menu{
  width: 300px;
  height: 50px;
  margin-left: 100px;
}
.menu p{
  color: gray;
  font-size: 12px;
}
.menu p span{
  color: black;
  font-size: 14px;
  font-weight: bold;
}
.sort{
  cursor: pointer;
  width: 1140px;
  height: 50px;
  background: #fff;
  margin-left: auto;
  margin-right: auto;
}
.sort p{
  color:#333;
  margin-left: 925px;
  line-height: 50px;
}
.sort .default{
  color: #ee7a23;
  padding-right: 25px;
}
.iconfont{
  width: 25px;
  height: 25px;
  line-height: 30px;
}
.container{
  width: 1140px;
  height: 1456px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 20px;
  background: #f5f7fc;
}
.left{
  width: 200px;
  text-align: center;
  float: left;
}
.content{
  width: 940px;
  margin-left: 228px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}
.content div{
  width: 200px;
  height: 330px;
  margin-bottom: 20px;
  background: #fff;
  border: 1px solid #e9e9e9;
}
img{
  width: 180px;
  height: 180px;
  margin-top: 10px;
  margin-right: 10px;
}
.content .name{
  height: 20px;
  line-height: 20px;
  font-size: 14px;
  text-align: center;
}
.price{
  font-size: 15px;
  color: #d25458;
  margin-left: 10px;
  margin-top: 30px;
}
.join{
  width: 180px;
  height: 30px;
  margin-left: 10px;
  color: #d25458;
  background: #fff;
  border: 1px solid #d25458;
  outline: none;
  font-weight: bold;
}
.page{
  width: 200px;
  height: 50px;
  margin-left: auto;
  margin-right: auto;
}
</style>