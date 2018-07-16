// 导入模块.......................
let express = require("express");

//let-Captcha验证码
let svgCatcha = require("svg-captcha");

//path模块
let path = require("path");

//导入 session模块
let session = require("express-session");

//导入body-parser 格式化表单的数据
let bodyParser = require("body-parser");

//导入mongodb

const MongoClient = require("mongodb").MongoClient;

//mongo需要用到的配置
// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'SZHM19';



//创建app.................
let app = express();

//设置托管静态资源
app.use(express.static("static"));

app.use(session({
    secret: 'keyboard cat love west blue flower hahahaha'
}))

// 使用 bodyParser 中间件
app.use(bodyParser.urlencoded({
    extended: false
}))



//路由1 get方法 访问登录页 读取登录信息 并返回

app.get('/login', (req, res) => {
    //直接读取文件 
    res.sendFile(path.join(__dirname, 'static/views/login.html'));
})


// 路由2 使用post 提交数据过来 验证用户登录
app.post('/login', (req, res) => {
    //获取form表单提交的数据
    //接受数据
    //比较数据
    let userName = req.body.userName;
    let useerPass = req.body.useerPass;
    //验证码 
    let code = req.body.code;
    //跟 session 中验证码进行比较
    if (code == req.session.captcha) {
        //设置session
        req.session.userInfo = {
            userName,
            useerPass
        }
        //去首页
        res.redirect("/index");
    } else {
        // console.log('失败');
        //打回去
        // res.redirect('/login');
        res.setHeader('content-type', 'text/html');
        res.send('<script>alert("验证码失败");window.location.href="/login"</script>');

    }

    //res.send('login');
})

//路由3 生成图片的功能 

app.get('/login/captchaImg', (req, res) => {
    var captcha = svgCatcha.create();
    //打印验证码
    console.log(captcha.text);

    //获取session的值
    // console.log(req.session.info);
    //保存验证码的值 到session 方便后续的使用
    //为了比较简单 直接转为小写
    req.session.captcha = captcha.text.toLocaleLowerCase();

    res.type('svg');
    res.status(200).send(captcha.data);
})

//路由4
//访问首页index 

app.get('/index', (req, res) => {
    //有session 欢迎
    if (req.session.userInfo) {
        //登录了
        res.sendFile(path.join(__dirname, 'static/views/index.html'));
    } else {
        //没有session 去登录页
        res.setHeader('content-type', 'text/html');
        res.send('<script>alert("请登录");window.location.href="/login"</script>')
    }
})

//路由5
//登出操作 
//删除session 的值即可
app.get('/logout', (req, res) => {
    //删除session中的userInfo
    delete req.session.userInfo;

    //去登录页即可
    res.redirect('/login');
})

//路由6
// 展示注册页面
app.get('/register', (req, res) => {
    //直接读取并返回注册页
    res.sendFile(path.join(__dirname, 'static/views/register.html'));
})

// 路由 7 
app.post('/register', (req, res) => {
    // 获取用户数据
    let userName = req.body.userName;
    let userPass = req.body.userPass;
    console.log(userName);
    console.log(userPass);

    MongoClient.connect(url, (err, client) => {
        //连上mongo之后 选择使用的库
        const db = client.db(dbName);
        //选择使用的集合
        let collection = db.collection('userList');

        //查询数据
        collection.find({
            userName
        }).toArray((err, doc) => {
            console.log(doc);;
            if (doc.length == 0) {
                //没有人
                //新增数据
                collection.insertOne({
                    userName,
                    userPass
                }, (err, result) => {
                    console.log(err);
                    // 注册成功了
                    res.setHeader('content-type', 'text/html');
                    res.send("<script>alert('欢迎入坑');window.location='/login'</script>")
                    // 关闭数据库连接即可
                    client.close();

                })
            }
        })
    })





})
// 开启监听
app.listen(8848, '127.0.0.1', () => {
    console.log('success');

})