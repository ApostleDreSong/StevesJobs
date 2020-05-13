const { check, validationResult } = require("express-validator");
var Job = require("../models/jobs");
var Employer = require("../models/employers");
var auth = require("../modules/auth");

module.exports = {
  signUp: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      var employer = await Employer.create(req.body);
      var token = await auth.generateJWT(employer);
      let {
        email,
        password,
        firstName,
        lastName,
        contactNumber,
        profileImage,
        dob,
        gender
      } = employer;
      res.json({
        success: true,
        employer: {
          email,
          firstName,
          lastName,
          contactNumber,
          profileImage,
          dob,
          gender
        },
        token
      });
    } catch (err) {
      console.log(err);
      res.json({ success: false, err });
    }
  },
  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      var employer = await Employer.findOne({ email: req.body.email }).lean({
        virtuals: true
      });
      if (!employer)
        return res.json({ success: false, msg: "incorrect credentials" });
      if (!employer.verifyPassword(req.body.password)) {
        return res.json({ success: false, msg: "incorrect password" });
      }
      var token = await auth.generateJWT(employer);
      delete employer["password"];
      res.json({ success: true, employer, token });
    } catch (err) {
      console.log(err);
      res.json({ success: false, err });
    }
  },
  getCurrentUser: async (req, res) => {
    try {
      var employer = await Employer.findById(req.user.userId)
        .populate("jobs")
        .select("-password");
      res.json({ success: true, employer });
    } catch (err) {
      console.log(err);
      res.json({ success: false, err });
    }
  },
  updateProfile: async (req, res) => {
    try {
      var employer = await Employer.findByIdAndUpdate(
        req.user.userId,
        { company: req.body },
        {
          new: true
        }
      ).select("-password");
      console.log(employer, "from update profile");
      res.json({ success: true, employer });
    } catch (err) {
      console.log(err);
      res.json({ success: false, err });
    }
  },
  postJob: async (req, res) => {
    try {
      console.log(req.body);
      req.body.employer = req.user.userId;
      var job = await Job.create(req.body);
      var employer = await Employer.findByIdAndUpdate(
        req.user.userId,
        {
          $addToSet: { jobs: job._id }
        },
        { new: true }
      )
        .populate("jobs")
        .select("-password");
      res.json({ success: true, employer });
    } catch (err) {
      console.log(err);
      res.json({ success: false, err });
    }
  },
  getJobs: async (req, res) => {
    try {
      var jobs = await Job.find({})
        .populate("employer")
        .populate("company");
      res.json({ success: true, jobs });
    } catch (err) {
      console.log(err);
      res.json({ success: false, err });
    }
  },
  getSingleJob: async (req, res) => {
    try {
      var job = await Job.findOne({slug:req.params.slug})
        .populate("employer")
        .populate("company");
      res.json({ success: true, job });
    } catch (err) {
      console.log(err);
      res.json({ success: false, err });
    }
  },

  deleteJob: async (req, res) => {
    try {
      var job = await Job.findByIdAndRemove(req.params.id);
      // var jobs = await Job.find({})
      //   .populate("employer")
      //   .populate("company");
      var employer = await Employer.findById(req.user.userId)
        .populate("jobs")
        .select("-password");
      res.json({ success: true, employer });
    } catch (err) {
      console.log(err);
      res.json({ success: false, err });
    }
  }
};
