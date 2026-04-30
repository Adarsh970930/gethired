const mongoose = require('mongoose');
const Settings = require('./models/Settings');
mongoose.connect('mongodb://localhost:27017/job-portal')
  .then(()=> Settings.findOne().lean())
  .then(s => console.log(s))
  .catch(console.error)
  .finally(()=>process.exit(0));
