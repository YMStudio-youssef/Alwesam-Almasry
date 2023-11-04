const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const multer = require('multer')
// const cheerio = require('cheerio');
const sanitizeHtml = require('sanitize-html');
const nodemailer = require('nodemailer')
const { exec } = require('child_process');
const fs = require('fs')
const session = require('express-session');
const flash = require('connect-flash');
const http = require('http')
const port = 5000
const app = express()

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
mongoose.set('strictQuery', true);
app.use(session({
  secret: 'Session_Secret_Key1000',
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());

// mongoose.connect('mongodb+srv://youssefmohammed2342:xebnWBjezofCCZrZ@wesam-algazera.z1c7t0p.mongodb.net/?retryWrites=true&w=majority', {
mongoose.connect('mongodb+srv://admin:mada203040@wesam-algazera.z1c7t0p.mongodb.net/', {useNewUrlParser: true,useUnifiedTopology: true,}).then(() => {console.log('connected')}).catch((err) => {console.log('error: ' + err)})

// Set up the storage configuration for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Specify the directory to store the uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});
const upload = multer({ storage });

const Schema = mongoose.Schema;

const Project = new Schema({
    title: String,
    description: String,
    image: String,
    projectDesc: String,
    Features: String,
    projectFeatures: String,
    financialIndicators: String,
    studyContent: String,
    Country: String,
    createdAt: { type: Date, default: Date.now }
})

const Message = new Schema({
  firstName: String,
  lastName: String,
  Email: String,
  Subject: String,
  Message: String
})

const CreationRoad = new Schema({
  title: String,
  desc: String,
  image: String,
  roadDesc: String,
  roadProducts: String,
  roadSpec: String,
  roadComp: String,
})

const projectModel = mongoose.model('project', Project);
const messageModel = mongoose.model('message', Message);
const creationModel = mongoose.model('road', CreationRoad)

app.get('/', async (req, res) => {
  try {
    const projects = await projectModel.find()
      .sort({ createdAt: -1 })
      .limit(3);

    res.render('index', { projects });
  } catch (err) {
    console.error(err);
    // Handle the error appropriately
  }
});

app.get('/about-us', (req, res) => {
    res.render('about')
})

app.get('/feasibility-studies', (req, res) => {
  projectModel.find()
    .then((projects) => {
      res.render('all-projects', { projects });
    })
    .catch((err) => {
      console.log('Error fetching projects from MongoDB: ' + err);
      res.render('all-projects', { projects: [] });
    });
});

app.get('/creationRoads', (req, res) => {
  creationModel.find()
    .then((roads) => {
      res.render('all-roads', {roads})
    })
    .catch((err) => {
      console.log(err)
      res.render('all-roads', {roads: []})
    })
  // res.render('all-roads')
})

app.get('/admin/road/create', (req, res) => {
  res.render('admin/adminCreateCheck')
})

app.post('/admin/createcheck', (req, res) => {
  const AdminName = req.body.adminName;
  const AdminPass = req.body.adminPass;
  if(AdminName === adminName && AdminPass === adminPass){
    // res.render('admin/createprojects.ejs')
    res.render('admin/createroads')
  }else{
    res.redirect('/admin/road/create')
  }
})

app.get('/roads/:id', (req, res) => {
  const projectId = req.params.id;
  
  creationModel.findById(projectId)
  .then((project) => {
    const sanitizedCountry = sanitizeHtml(project.Country);
      if (!project) {
        // If project with the given ID is not found
        return res.status(404).send('Project not found');
      }
      // console.log('Country: ' + project.Country)
      // res.render('oneRoad', { project , country : sanitizedCountry});
      res.render('oneRoad', { project });
      // res.render('one-project', { project: { ...project, Country: sanitizedCountry } });
    })
    .catch((err) => {
      console.log('Error retrieving project details: ' + err);
      res.status(500).send('Internal Server Error');
    });
});

app.post('/road/create', upload.single('image'), (req, res) => {
  const data = fs.readFileSync(req.file.path);
  const imageBuffer = Buffer.from(data);

  const title = req.body.title
  const sanitizedDesc = sanitizeHtml(req.body.desc);
  const sanitizedRoadDesc = sanitizeHtml(req.body.projectDesc);
  const sanitizedRoadProducts = sanitizeHtml(req.body.feat);
  const sanitizedRoadSpec = sanitizeHtml(req.body.projectFeat);
  const sanitizedRoadComp = sanitizeHtml(req.body.finaIndic);

  const road = new creationModel({
    title: title,
    desc: sanitizedDesc,
    image: imageBuffer.toString('base64'),
    roadDesc: sanitizedRoadDesc,
    roadProducts: sanitizedRoadProducts,
    roadSpec: sanitizedRoadSpec,
    roadComp: sanitizedRoadComp,
  })

  road.save()
    .then(() => {
      console.log('Project saved successfully.');
      res.redirect('/creationRoads');
    })
    .catch((err) => {
      console.log('Error saving project: ' + err);
      res.redirect('/creationRoads');
    });
})

app.get('/admin/road/delete', (req, res) => {
  res.render('admin/adminDeleteCheck')
})

app.post('/admin/deletecheck', (req, res) => {
  const AdminName = req.body.adminName;
  const AdminPass = req.body.adminPass;
  if(AdminName === adminName && AdminPass === adminPass){
    // res.render('admin/createprojects.ejs')
    creationModel.find()
    .then((roads) => {
      // res.render('admin/roadDelete', {roads})
      res.render('admin/roadDelete', {roads})
    })
    .catch((err) => {
      console.log(err)
      res.render('admin/roadDelete', {roads: []})
    })
  }else{
    res.redirect('/admin/road/delete')
  }
})

app.post('/road/delete', (req, res) => {
  const projectTitle = req.body.projectTitle;
  console.log(projectTitle);

  creationModel.findOneAndDelete({ title: projectTitle })
  .then((deletedProject) => {
    if (deletedProject) {
      // console.log('Project deleted:', deletedProject);
      res.redirect('/creationRoads');
      // res.send('Project deleted successfully');
    } else {
      console.log('Project not found');
      res.send('Project not found');
    }
  })
  .catch((error) => {
    console.error('Error deleting project:', error);
    res.status(500).send('Error deleting project');
  });
});

app.get('/project/:id', (req, res) => {
  const projectId = req.params.id;
  
  projectModel.findById(projectId)
  .then((project) => {
    const sanitizedCountry = sanitizeHtml(project.Country);
      if (!project) {
        // If project with the given ID is not found
        return res.status(404).send('Project not found');
      }
      // console.log('Country: ' + project.Country)
      res.render('one-project', { project , country : sanitizedCountry});
      // res.render('one-project', { project: { ...project, Country: sanitizedCountry } });
    })
    .catch((err) => {
      console.log('Error retrieving project details: ' + err);
      res.status(500).send('Internal Server Error');
    });
});

app.get('/admin/road/update', (req, res) => {
  res.render('admin/adminUpdateCheck')
})

app.post('/admin/updatecheck', (req, res) => {
  const AdminName = req.body.adminName;
  const AdminPass = req.body.adminPass;
  if(AdminName === adminName && AdminPass === adminPass){
    // res.render('admin/createprojects.ejs')
    creationModel.find()
    .then((roads) => {
      res.render('admin/updateRoad', { roads });
    })
    .catch((err) => {
      console.log('Error fetching projects from MongoDB: ' + err);
      res.render('admin/updateRoad', { roads: [] });
    });
  }else{
    res.redirect('/admin/road/update')
  }
})

app.post('/road/projectUpdate', (req, res) => {
  console.log(req.body.projectTitle)
  creationModel.findOne({title: req.body.projectTitle})
  .then((road) => {
    console.log(road)
    res.render('admin/updateFormRoad', { road })
  })
  .catch((err) => {
    console.error(err)
  })
})

app.post('/road/update', upload.single('image'), (req, res) => {
  console.log(req.body.projectTitle)
  var imageBuffer = null;
  if(req.file){
    const data = fs.readFileSync(req.file.path);
    imageBuffer = Buffer.from(data);
  }
  const title = req.body.title
  const sanitizedDesc = sanitizeHtml(req.body.desc);
  const sanitizedRoadDesc = sanitizeHtml(req.body.projectDesc);
  const sanitizedRoadProducts = sanitizeHtml(req.body.feat);
  const sanitizedRoadSpec = sanitizeHtml(req.body.projectFeat);
  const sanitizedRoadComp = sanitizeHtml(req.body.finaIndic);

  creationModel.findOne({ title: req.body.projectTitle })
  .then((project) => {
    if (project) {
      // ...

      if (req.file) {
        const data = fs.readFileSync(req.file.path);
        imageBuffer = Buffer.from(data);
        project.image = imageBuffer.toString('base64');
      }

      project.title = req.body.title;
      project.desc = sanitizedDesc !== "" ? sanitizedDesc : null;
      project.roadDesc = sanitizedRoadDesc !== "" ? sanitizedRoadDesc : null;
      project.roadProducts = sanitizedRoadProducts !== "" ? sanitizedRoadProducts : null;
      project.roadSpec = sanitizedRoadSpec !== "" ? sanitizedRoadSpec : null;
      project.roadComp = sanitizedRoadComp !== "" ? sanitizedRoadComp : null;

      return project.save();
    } else {
      console.log('Project not found');
      res.send('Project not found');
    }
  })
  .then((updatedProject) => {
    if (updatedProject) {
      // console.log('Project updated:', updatedProject);
      // res.send('Project updated successfully');
      res.redirect('/creationRoads')
    }
  })
  .catch((error) => {
    console.error('Error updating project:', error);
    res.status(500).send('Error updating project');
  });
})

app.post('/projectUpdate', (req, res) => {
  console.log(req.body.projectTitle)
  projectModel.findOne({title: req.body.projectTitle})
  .then((result) => {
    console.log(result)
    res.render('admin/updateform', {project : result})
  })
  .catch((err) => {
    console.error(err)
  })
})

app.post('/update', upload.single('image'), (req, res) => {
  console.log(req.body.projectTitle)
  var imageBuffer = null;
  if(req.file){
    const data = fs.readFileSync(req.file.path);
    imageBuffer = Buffer.from(data);
  }
  const sanitizedDesc = sanitizeHtml(req.body.desc);
  const sanitizedProjectDesc = sanitizeHtml(req.body.projectDesc);
  const sanitizedFeat = sanitizeHtml(req.body.feat);
  const sanitizedProjectFeat = sanitizeHtml(req.body.projectFeat);
  const sanitizedFinaIndic = sanitizeHtml(req.body.finaIndic);
  const sanitizedStudy = sanitizeHtml(req.body.study);
  const sanitizedCountry = sanitizeHtml(req.body.country);

  projectModel.findOne({ title: req.body.projectTitle })
  .then((project) => {
    if (project) {
      // ...

      if (req.file) {
        const data = fs.readFileSync(req.file.path);
        imageBuffer = Buffer.from(data);
        project.image = imageBuffer.toString('base64');
      }

      project.title = req.body.title;
      project.description = sanitizedDesc !== "" ? sanitizedDesc : null;
      project.projectDesc = sanitizedProjectDesc !== "" ? sanitizedProjectDesc : null;
      project.Features = sanitizedFeat !== "" ? sanitizedFeat : null;
      project.sanitizedProjectFeat = sanitizedProjectFeat !== "" ? sanitizedProjectFeat : null;
      project.sanitizedFinaIndic = sanitizedFinaIndic !== "" ? sanitizedFinaIndic : null;
      project.sanitizedStudy = sanitizedStudy !== "" ? sanitizedStudy : null;
      project.sanitizedCountry = sanitizedCountry !== "" ? sanitizedCountry : null;

      return project.save();
    } else {
      console.log('Project not found');
      res.send('Project not found');
    }
  })
  .then((updatedProject) => {
    if (updatedProject) {
      console.log('Project updated:', updatedProject);
      // res.send('Project updated successfully');
      res.redirect('/feasibility-studies')
    }
  })
  .catch((error) => {
    console.error('Error updating project:', error);
    res.status(500).send('Error updating project');
  });
});

app.post('/create', upload.single('image'), (req, res) => {
  
  const data = fs.readFileSync(req.file.path);
  const imageBuffer = Buffer.from(data);

  const sanitizedDesc = sanitizeHtml(req.body.desc);
  const sanitizedProjectDesc = sanitizeHtml(req.body.projectDesc);
  const sanitizedFeat = sanitizeHtml(req.body.feat);
  const sanitizedProjectFeat = sanitizeHtml(req.body.projectFeat);
  const sanitizedFinaIndic = sanitizeHtml(req.body.finaIndic);
  const sanitizedStudy = sanitizeHtml(req.body.study);
  const sanitizedCountry = sanitizeHtml(req.body.country);

  const project = new projectModel({
    title: req.body.title,
    description: sanitizedDesc,
    image: imageBuffer.toString('base64'),
    projectDesc: sanitizedProjectDesc,
    Features: sanitizedFeat,
    projectFeatures: sanitizedProjectFeat,
    financialIndicators: sanitizedFinaIndic,
    studyContent: sanitizedStudy,
    Country: sanitizedCountry,
  });

  project.save()
    .then(() => {
      console.log('Project saved successfully.');
      res.redirect('/feasibility-studies');
    })
    .catch((err) => {
      console.log('Error saving project: ' + err);
      res.redirect('/feasibility-studies');
    });
});

app.post('/delete', (req, res) => {
  const projectTitle = req.body.projectTitle;
  console.log(projectTitle);

  projectModel.findOneAndDelete({ title: projectTitle })
  .then((deletedProject) => {
    if (deletedProject) {
      // console.log('Project deleted:', deletedProject);
      res.redirect('/feasibility-studies');
      // res.send('Project deleted successfully');
    } else {
      console.log('Project not found');
      res.send('Project not found');
    }
  })
  .catch((error) => {
    console.error('Error deleting project:', error);
    res.status(500).send('Error deleting project');
  });
});

const adminName = "mahamad"
const adminPass = "2342"
app.get('/admin/create', (req, res) => {
  res.render('admin/createcheck')
})
app.get('/admin/update', (req, res) => {
  res.render('admin/updatecheck')
})
app.get('/admin/delete', (req, res) => {
  res.render('admin/deletecheck')
})

app.post('/createcheck', (req, res) => {
  const AdminName = req.body.adminName;
  const AdminPass = req.body.adminPass;
  if(AdminName === adminName && AdminPass === adminPass){
    res.render('admin/createprojects.ejs')
  }else{
    res.redirect('/createcheck')
  }
})
app.post('/updatecheck', (req, res) => {
  const AdminName = req.body.adminName;
  const AdminPass = req.body.adminPass;
  if(AdminName === adminName && AdminPass === adminPass){
    projectModel.find()
    .then((projects) => {
      res.render('admin/updateprojects.ejs', { projects });
    })
    .catch((err) => {
      console.log('Error fetching projects from MongoDB: ' + err);
      res.render('admin/updateprojects.ejs', { projects: [] });
    });
    // res.render('admin/updateprojects.ejs')
  }else{
    res.redirect('/updatecheck')
  }
})
app.post('/deletecheck', (req, res) => {
  const AdminName = req.body.adminName;
  const AdminPass = req.body.adminPass;
  if(AdminName === adminName && AdminPass === adminPass){
    projectModel.find()
    .then((projects) => {
      res.render('admin/deleteprojects.ejs', { projects });
    })
    .catch((err) => {
      console.log('Error fetching projects from MongoDB: ' + err);
      res.render('admin/deleteprojects.ejs', { projects: [] });
    });
    // res.render('admin/deleteprojects.ejs')
  }else{
    res.redirect('/deletecheck')
  }
})

app.get('/engineering-consultancy', (req, res) => {
    res.render('engineering-consultancy')
})

app.get('/marketing-consultancy', (req, res) => {
    res.render('marketing-consultancy')
})

app.get('/tenders', (req, res) => {
    res.render('tenders')
})

app.get('/contact', (req, res) => {
  const successMessage = req.flash('success');
  const errorMessage = req.flash('error');
  
  // Render your contact page template and pass the messages as variables
  res.render('contact', { successMessage, errorMessage });
})

app.get('/admin/messages', (req, res) => {
  messageModel.find()
  .then((result) => {
    res.render('admin/messages', {messages : result})
  })
  .catch((err) => {
    console.error(err)
  })
})

app.post('/send', (req, res) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "mahamadgomah2011@gmail.com",
        pass: "caue myyg tqqu llaq"
    }
  })

  var fname = req.body.firstName;
  var lname = req.body.lastName;
  var from = req.body.from;
  var to = req.body.to;
  var subject = req.body.subject;
  var message = req.body.message;

  const mailOptions = {
    from: from, // Set your own email address here
    to: to,
    subject: req.body.subject,
    text: `Name: ${fname} ${lname}\nSubject: ${subject}\nFrom: ${from}\nMessage: ${req.body.message}`
  };
  
  transporter.sendMail(mailOptions)
  .then(() => {
    console.log('Email sent successfully!');
    req.flash('success', 'تم استلام رسالتك وسيتم الرد عليك في أقرب وقت');
    res.redirect('/contact');
    // Show success message as a popup
    // res.send('<script>alert("Message sent successfully!");</script>');
  })
  .catch((err) => {
    console.log('Error occurred:', err.message);
    req.flash('error', 'حدث خطأ عند إرسال الرسالة، الرجاء المحاولة لاحقًا');
    res.redirect('/contact');
    // Show error message as a popup
    // res.send('<script>alert("An error occurred while sending the message. Please try again later.");</script>');
  });
  // Redirect to a success page or appropriate URL after sending the email
});

app.listen(port, () => {
    console.log('server is running in port 3000');
})