var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcryptjs");

var employerSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    firstName: {
      type: String
      // required: true
    },
    lastName: {
      type: String
      // required: true
    },
    dob: {
      type: String
      // required:true
    },
    gender: {
      type: String
      // required: true
    },
    contactNumber: {
      type: Number,
      required: false
    },
    profileImage: {
      type: String
    },
    portfolio: {
      type: Schema.Types.ObjectId,
      ref: "EmployerPortfolio"
    }
  },
  { timestamps: true }
);

employerSchema.pre("save", function(next) {
  if (this.password && this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, 10);
    next();
  }
});

employerSchema.methods.verifyPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("Employer", employerSchema);