var mongoose = require('mongoose');
var crypto = require('crypto');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

UserSchema.methods.encryptPassword = function(password){
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
  // return crypto.pbkdf2Sync(password, this.salt, 10000, 512);
};

UserSchema.virtual('password')
  .set(function(password){
    this._plainPassword = password;
    this.salt = crypto.randomBytes(32).toString('base64');
    // this.salt = crypto.randomBytes(128).toString('base64');
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function(){
    return this._plainPassword;
  });

UserSchema.methods.checkPassword = function(password){
  return this.encryptPassword(password) == this.hashedPassword;
}

module.exports = mongoose.model('User', UserSchema);