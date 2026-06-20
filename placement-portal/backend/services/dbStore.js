const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Admin = require('../models/Admin');
const s3Service = require('./s3Service');

const mapId = (doc) => {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  if (obj._id) {
    obj.id = obj._id.toString();
  }
  return obj;
};

const mapStudentS3 = async (student) => {
  if (!student) return student;
  const obj = mapId(student);
  if (obj.resumeUrl) {
    obj.resumeUrl = await s3Service.getDownloadUrl(obj.resumeUrl);
  }
  if (obj.profileImage) {
    obj.profileImage = await s3Service.getDownloadUrl(obj.profileImage);
  }
  return obj;
};

const stripPassword = async (student) => {
  if (!student) return student;
  const obj = await mapStudentS3(student);
  delete obj.password;
  return obj;
};

const mapCompanyS3 = async (company) => {
  if (!company) return company;
  const obj = mapId(company);
  if (obj.logo) {
    obj.logo = await s3Service.getDownloadUrl(obj.logo);
  }
  return obj;
};

module.exports = {
  stripPassword,
  mapId,
  mapStudentS3,
  mapCompanyS3,

  getAdminByUsername: async (username) => {
    const admin = await Admin.findOne({ username }).select('+password');
    return mapId(admin);
  },

  getStudentByEmail: async (email) => {
    const student = await Student.findOne({ email }).select('+password');
    return mapStudentS3(student);
  },

  getStudentById: async (id) => {
    const student = await Student.findById(id);
    return mapStudentS3(student);
  },

  getCompanyById: async (id) => {
    const company = await Company.findById(id);
    return mapCompanyS3(company);
  },

  getJobById: async (id) => {
    const job = await Job.findById(id);
    return mapId(job);
  },

  listStudents: async () => {
    const students = await Student.find();
    return Promise.all(students.map(stripPassword));
  },

  listCompanies: async () => {
    const companies = await Company.find();
    return Promise.all(companies.map(mapCompanyS3));
  },

  listJobs: async () => {
    const jobs = await Job.find();
    return jobs.map(mapId);
  },

  listApplications: async () => {
    const apps = await Application.find();
    return apps.map(mapId);
  },

  createStudent: async (payload) => {
    const student = new Student(payload);
    await student.save();
    return stripPassword(student);
  },

  updateStudent: async (id, updates) => {
    const student = await Student.findByIdAndUpdate(id, { $set: updates }, { returnDocument: 'after' });
    return stripPassword(student);
  },

  createCompany: async (payload) => {
    const company = new Company(payload);
    await company.save();
    return mapCompanyS3(company);
  },

  updateCompany: async (id, updates) => {
    const company = await Company.findByIdAndUpdate(id, { $set: updates }, { returnDocument: 'after' });
    return mapCompanyS3(company);
  },

  deleteCompany: async (id) => {
    const res = await Company.findByIdAndDelete(id);
    return !!res;
  },

  createJob: async (payload) => {
    const job = new Job(payload);
    await job.save();
    return mapId(job);
  },

  updateJob: async (id, updates) => {
    const job = await Job.findByIdAndUpdate(id, { $set: updates }, { returnDocument: 'after' });
    return mapId(job);
  },

  deleteJob: async (id) => {
    const res = await Job.findByIdAndDelete(id);
    return !!res;
  },

  createApplication: async (payload) => {
    const application = new Application(payload);
    await application.save();
    return mapId(application);
  },

  findApplication: async (studentId, jobId) => {
    const app = await Application.findOne({ studentId, jobId });
    return mapId(app);
  },

  updateApplicationStatus: async (id, status) => {
    const app = await Application.findByIdAndUpdate(id, { $set: { status } }, { returnDocument: 'after' });
    return mapId(app);
  },

  findApplicationsByStudent: async (studentId) => {
    const apps = await Application.find({ studentId });
    return apps.map(mapId);
  }
};
