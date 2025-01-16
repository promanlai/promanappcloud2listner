//npm install express mongoose bcryptjs cors body-parser
//npm install dotenv
//npm install moment-timezone
//npm install dayjs

require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
//const moment = require('moment-timezone');
var dayjs = require('dayjs')

const app = express();
const PORT = process.env.PORT;
const COLLECTION_USRLOGIN = process.env.MONGODB_USRLOGIN_COLLECTION;
const COLLECTION_OFFICELOCATION = process.env.MONGODB_OFFICELOCATION_COLLECTION;
const COLLECTION_DEPARTMENT = process.env.MONGODB_DEPARTMENT_COLLECTION;
const COLLECTION_JOBTITLE = process.env.MONGODB_JOBTITLE_COLLECTION;
const COLLECTION_SYSROLE = process.env.MONGODB_SYSROLE_COLLECTION;
//console.log(COLLECTION_USRLOGIN);
//console.log(COLLECTION_OFFICELOCATION);

// 中介軟體
app.use(cors());
app.use(bodyParser.json());

// 連接MongoDB
    //const MONGOURL = "mongodb+srv://Admin:123321@cluster0.hft7m.mongodb.net/PromanDB?retryWrites=true&w=majority&appName=Cluster0"
    const vservice_startupdate = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss').toString();
    console.log(vservice_startupdate);
    const MONGOURL = process.env.MONGODB_URI;
    mongoose.connect(MONGOURL)
    .then(() => console.log('MongoDB已連接'))
    .catch(err => console.error(err));

// 創建用戶模型
const userSchema = new mongoose.Schema({
    userid: { type: String, required: true, unique: true},
    username: { type: String, required: true},
    password: { type: String, required: true },
    sex: { type: String, required: true},
    dept: { type: String, required: true},
    post_title: { type: String, required: true},
    email: { type: String, required: false},
    officephone: { type: String, required: false},
    mobile: { type: String, required: false},
    role: { type: String, required: true},
    officesite: { type: String, required: true},
    address: { type: String, required: false},
    birth: { type: String, required: false },
    acstatus: Boolean,
    app_createdate: { type: String, required: false},
    app_updatedate: { type: String, required: false},
//    cloud_createdate: { type: Date, required: false},
//    cloud_updatedate: { type: Date, required: false},    

}) ;

const User = mongoose.model('User', userSchema, COLLECTION_USRLOGIN );

// 創建地點模型
const OfficelocationSchema = new mongoose.Schema({
  locationname: { type: String, required: true, unique: true },
});

const Officelocation = mongoose.model('Officelocation', OfficelocationSchema, COLLECTION_OFFICELOCATION);

// 創建部門模型
const DepartmentSchema = new mongoose.Schema({
  departmentname: { type: String, required: true, unique: true },
});

const Department = mongoose.model('Department', DepartmentSchema, COLLECTION_DEPARTMENT);

// 創建職級模型
const JobtitleSchema = new mongoose.Schema({
  jtitle: { type: String, required: true, unique: true },
});

const Jobtitle = mongoose.model('Jobtitle', JobtitleSchema, COLLECTION_JOBTITLE);

// 創建角色權限模型
const SysroleSchema = new mongoose.Schema({
  rolename: { type: String, required: true, unique: true },
});

const Sysrole = mongoose.model('Sysrole', SysroleSchema, COLLECTION_SYSROLE);


// 以下所有段落是CRUD路由編程
/*******************************************************
 *  "usersacct" table CRUD路由名編程                      *
 *                                                     *
 *******************************************************/
// 登入 API
app.post('/login', async (req, res) => {
    const { userid, password } = req.body;
    try {
      const user = await User.findOne({ userid });
      if (!user) {
        return res.status(400).send({ success: false, message: '用戶不存在' });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).send({ success: false, message: '密碼錯誤' });
      }
  
      res.send({ success: true, message: '登入成功' });
    } catch (err) {
      console.error(err);
      res.status(500).send({ success: false, message: '伺服器錯誤' });
    }
  });


// 創建用戶
app.post('/usersacct', async (req, res) => {    
    //const user = new User(req.body);
    const { userid, username, password, sex, dept, post_title, email, officephone, mobile, role, officesite, address, birth, acstatus } = req.body;

    try {
        let vapp_writedate = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss').toString();
        //const vcloud_writedate = moment.tz('Asia/Hong_Kong').toDate();  
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ userid, username, password: hashedPassword , sex, dept, post_title, email, officephone, mobile, 
                                   role, officesite, address, birth, acstatus, app_createdate: vapp_writedate, app_updatedate: vapp_writedate}); 
                                   //cloud_createdate: vcloud_writedate, cloud_updatedate: vcloud_writedate });        
        //await user.save();
        await newUser.save();        
        //res.status(201).send(newUser); This line will crash program but only work with 'await user.save()'
        res.send({ message: '用戶創建成功' });
    } catch (err) {    
        res.status(500).send({ message: '伺服器錯誤' });
    }
});

// 獲取用戶列表
app.get('/users', async (req, res) => {
    const users = await User.find();
    res.send(users);
});

// 搜尋用戶
app.get('/users/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    res.send(user);
});

// 更新用戶
app.put('/users/:id', async (req, res) => {
    const { userid, username, password, sex, dept, post_title, email, officephone, mobile, role, officesite, address, birth, acstatus } = req.body;
    try {
       let vapp_updatedate = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss').toString();
       //const vcloud_updatedate = moment.tz('Asia/Hong_Kong').toDate();      
       const hashedPassword = await bcrypt.hash(password, 10);
       await User.findByIdAndUpdate(req.params.id, { userid, username, password: hashedPassword, sex, dept, post_title, email, 
                                                     officephone, mobile, role, officesite, address, birth, acstatus,
                                                     app_updatedate: vapp_updatedate
                                                     //,cloud_updatedate: vcloud_updatedate
                                                     });       
       res.send({ message: '用戶更新成功' });
       //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
       //res.send(user);
    } catch (err) {
       res.status(500).send({ message: '伺服器錯誤' });
    }    
    
});

//刪除用戶
app.delete('/users/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
});

/*******************************************************
 *  "officelocation" table CRUD路由名編程               *
 *                                                     *
 *******************************************************/
// 獲取辦公室地點列表

app.get('/officelocations', async (req, res) => {
  try {
     const officelocations = await Officelocation.find();
     res.send(officelocations);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*******************************************************
 *  "department" table CRUD路由名編程               *
 *                                                     *
 *******************************************************/
// 獲取部門列表

app.get('/departments', async (req, res) => {
  try {
     const departments = await Department.find();
     res.send(departments);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*******************************************************
 *  "jobtitle" table CRUD路由名編程               *
 *                                                     *
 *******************************************************/
// 獲取職級列表

app.get('/jobtitles', async (req, res) => {    //這行 jobtitles 是路由名
  try {
     const jobtitles = await Jobtitle.find();  //這行 jobtitles 是變數 , 而Jobtitle是上面定義的model名
     res.send(jobtitles);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*******************************************************
 *  "sysrole" table CRUD路由名編程               *
 *                                                     *
 *******************************************************/
// 獲取角色權限列表

app.get('/sysroles', async (req, res) => {    //這行 sysroles 是路由名
  try {
     const sysroles = await Sysrole.find();  //這行 sysroles 是變數 , 而Sysrole是上面定義的model名
     res.send(sysroles);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 啟動服務器
app.listen(PORT, () => {
    console.log(`服務器運行在 http://localhost:${PORT}`);
});