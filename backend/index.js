const connectToMongo = require('./db.js')
connectToMongo();
const express = require('express')
var cors = require('cors')

const app = express()
const port = 5001
// Path to the target folder
// const imagesPath = path.join('C:\\', 'Western Digital', 'Full Stack', 'React JS', 'ticket', 'src', 'images');

app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(express.json())

// Set up storage configuration for multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//       cb(null, imagesPath); // Directory to save uploaded files
//   },
//   filename: (req, file, cb) => {
//       cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique file name
//   }
// });

//Available Routes

app.use('/api/auth', require('./routes/auth'))
app.use('/api/booking', require('./routes/booking'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/organizers', require('./routes/organizers'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})