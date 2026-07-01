const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  password: { type: String },
  token: { type: String }
});

schema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next(); // THIS MIGHT CRASH!
  }
  this.password = this.password + '_hashed';
});

const TestModel = mongoose.model('Test', schema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test');
  
  const doc = new TestModel({ password: 'abc' });
  await doc.save(); // Password is modified, next() is not called.
  console.log('Saved once.');
  
  doc.token = '123';
  await doc.save(); // Password is NOT modified, next() is called.
  console.log('Saved twice.');
  
  await mongoose.disconnect();
}

run().catch(console.error);
