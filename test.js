const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs=require('fs');
const app = express();
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
const authEndpoint = 'https://qa2.sunbasedata.com/sunbase/portal/api/assignment_auth.jsp';
const customerListEndpoint = 'https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp';


var update_id='';
var token='';
var customerList;
// Serve the HTML file for the login page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/templates/log_in.html');
});


app.post('/update',(req,res)=>{
  
  update_id=req.body.but;
  console.log(update_id+" "+req.body.but);
  const customerList={
    first_name:req.body.first_name,
    last_name:req.body.last_name,
    street:req.body.street,
    address:req.body.address,
    city:req.body.city,
    state:req.body.state,
    email:req.body.email,
    phone:req.body.phone
  }
  for(var i=0;i<customerList.length;i++){
    console.log(customerList[0]);
  }
  
  fs.readFile(__dirname+'/templates/update.html',function(err,data){
    if (err){
      console.log("error: "+err);
    }
    // var upd_fil=data.toString();
    // upd_fil.replace("<%= customer.first_name %>",customerList.first_name);
    // upd_fil.replace("<%= customer.last_name %>",customerList.last_name);
    // upd_fil.replace("<%= customer.street %>",customerList.street);
    // upd_fil.replace("<%= customer.address %>",customerList.address);
    // upd_fil.replace("<%= customer.city %>",customerList.city);
    // upd_fil.replace("<%= customer.state %>",customerList.state);
    // upd_fil.replace("<%= customer.email %>",customerList.email);
    // upd_fil.replace("<%= customer.phone %>",customerList.phone);
    // res.contentType('html');
    // res.end(upd_fil);
  });
  res.sendFile(__dirname+'/templates/update.html');
});

app.post('/update-details',(req,res)=>{

  const data={
    first_name:req.body.first_name,
    last_name:req.body.last_name,
    street:req.body.street,
    address:req.body.address,
    city:req.body.city,
    state:req.body.state,
    email:req.body.email,
    phone:req.body.phone
  }
  console.log(update_id);
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=update&uuid=${update_id}`,
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}`
    },
    data : data
  };
  
  axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
    res.end("Updated successfully");
  })
  .catch((error) => {
    console.log(error);
  });
});



app.get('/newone',(req,res)=>{
  res.sendFile(__dirname+'/templates/details.html');
});



app.post('/create-customer',(req,res)=>{
  const data={
    first_name:req.body.first_name,
    last_name:req.body.last_name,
    street:req.body.street,
    address:req.body.address,
    city:req.body.city,
    state:req.body.state,
    email:req.body.email,
    phone:req.body.phone
  }
  // console.log(data);

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=create',
    headers: {
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}`,
    },
    data : data
  };
  
  axios.request(config)
  .then((response) => {
    // res.end('/login');
    res.end();
  })
  .catch((error) => {
    console.log(error);
  });
  
  
});




app.post('/delete', async (req, res) => {
  const uuid = req.body.butt;
  console.log(uuid,token);
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=delete&uuid=${uuid}`,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };
  axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
    res.contentType('.html');
    res.end("<h1>Record deleted Successfully</h1>");
  })
  .catch((error) => {
    console.log(error);
  });
  
});




app.post('/Login', async (req, res) => {
  
  const email=req.body.email;
  const password=req.body.password;
  var m;
  try {
    const response = await axios.post(authEndpoint, {
      "login_id": email,
      "password": password
    });

    if (response.status === 200) {
      var token1 = response.data; 
      
      token=token1.access_token;
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=get_customer_list',
        headers: {
          'Authorization': `Bearer ${token}`,
          // 'Authorization': "Bearer dGVzdEBzdW5iYXNlZGF0YS5jb206VGVzdEAxMjM="
        },
      };
      
      axios.request(config)
      .then((response) => {
        customerList = response.data;
        res.render(__dirname + '/templates/Homepage.ejs', { customers: customerList });
        app.set('view engine', 'ejs');
      })
      .catch((error) => {
        console.log(error);
      });

    //   console.log()
    } else {
      res.status(400).send('Failed to authenticate.');
    }
  } catch (error) {
    res.status(500).send(`Error occurred: ${error.message}`);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
