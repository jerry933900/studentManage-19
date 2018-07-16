// 导入模块
let express = require("express");

//let-Captcha验证码
let svgCatcha = require("svg-captcha");

//path模块
let path = require("path");

//创建app
let app = express();

//设置托管静态资源
app.use(express.static("static"));

//路由1 get方法 访问登录页 读取登录信息 并返回

app.get('/login',(req,res)=>{
    //直接读取文件 
    res.sendFile(path.join(__dirname,'static/views/login.html'));
})

//路由2 生成图片的功能 

app.get('/login/captchaImg',(req,res)=>{
    var captcha = svgCatcha.create();
    //打印验证码
    console.log(captcha.text);
    res.type('svg');
    res.status(200).send(captcha.data);    
})
// 开启监听
app.listen(8848,'127.0.0.1',()=>{
    console.log('success');
    
})