const bcrypt = require('bcryptjs');

const makeId = (prefix) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const clone = (value) => JSON.parse(JSON.stringify(value));

const seed = (() => {
  const adminPassword = bcrypt.hashSync('admin123', 10);
  const studentPassword = bcrypt.hashSync('student123', 10);

  return {
    admins: [
      { id: 'admin_1', username: 'admin', password: adminPassword, role: 'placement-officer', createdAt: new Date().toISOString() }
    ],
    students: [
      {
        id: 'student_1',
        name: 'Alice Student',
        email: 'alice@example.com',
        password: studentPassword,
        phone: '9876543210',
        branch: 'Computer Science',
        cgpa: 8.7,
        skills: ['JavaScript', 'Node.js', 'React'],
        resumeUrl: '',
        profileImage: '',
        createdAt: new Date().toISOString()
      }
    ],
    companies: [
      { id: 'company_1', companyName: 'Acme Corp', description: 'Engineering and manufacturing', website: 'https://acme.example.com', logo: '', createdAt: new Date().toISOString() },
      { id: 'company_2', companyName: 'TechSoft', description: 'Enterprise SaaS products', website: 'https://techsoft.example.com', logo: '', createdAt: new Date().toISOString() }
    ],
    jobs: [
      {
        id: 'job_1',
        companyId: 'company_1',
        title: 'Junior Backend Engineer',
        description: 'Build and maintain REST APIs.',
        salary: '4 LPA',
        location: 'Remote',
        eligibility: 'CS, IT',
        deadline: '2026-07-31T00:00:00.000Z',
        createdAt: new Date().toISOString()
      },
      {
        id: 'job_2',
        companyId: 'company_2',
        title: 'Frontend Engineer',
        description: 'Build responsive UI experiences.',
        salary: '5 LPA',
        location: 'Onsite',
        eligibility: 'All branches',
        deadline: '2026-08-15T00:00:00.000Z',
        createdAt: new Date().toISOString()
      }
    ],
    applications: [
      { id: 'app_1', studentId: 'student_1', jobId: 'job_1', status: 'applied', notes: '', appliedAt: new Date().toISOString() }
    ]
  };
})();

const db = clone(seed);

const stripPassword = (student) => {
  if (!student) return student;
  const { password, ...rest } = student;
  return rest;
};

const getAdminByUsername = (username) => db.admins.find((admin) => admin.username === username) || null;
const getStudentByEmail = (email) => db.students.find((student) => student.email === email) || null;
const getStudentById = (id) => db.students.find((student) => student.id === id) || null;
const getCompanyById = (id) => db.companies.find((company) => company.id === id) || null;
const getJobById = (id) => db.jobs.find((job) => job.id === id) || null;

module.exports = {
  db,
  makeId,
  stripPassword,
  getAdminByUsername,
  getStudentByEmail,
  getStudentById,
  getCompanyById,
  getJobById,
  listStudents: () => db.students.map(stripPassword),
  listCompanies: () => clone(db.companies),
  listJobs: () => clone(db.jobs),
  listApplications: () => clone(db.applications),
  createStudent: (payload) => {
    const student = { id: makeId('student'), createdAt: new Date().toISOString(), skills: [], resumeUrl: '', profileImage: '', ...payload };
    db.students.push(student);
    return stripPassword(student);
  },
  updateStudent: (id, updates) => {
    const student = getStudentById(id);
    if (!student) return null;
    Object.assign(student, updates);
    return stripPassword(student);
  },
  deleteStudent: (id) => {
    const index = db.students.findIndex((student) => student.id === id);
    if (index === -1) return false;
    db.students.splice(index, 1);
    return true;
  },
  createCompany: (payload) => {
    const company = { id: makeId('company'), createdAt: new Date().toISOString(), logo: '', ...payload };
    db.companies.push(company);
    return clone(company);
  },
  updateCompany: (id, updates) => {
    const company = getCompanyById(id);
    if (!company) return null;
    Object.assign(company, updates);
    return clone(company);
  },
  deleteCompany: (id) => {
    const index = db.companies.findIndex((company) => company.id === id);
    if (index === -1) return false;
    db.companies.splice(index, 1);
    return true;
  },
  createJob: (payload) => {
    const company = getCompanyById(payload.companyId);
    const job = { id: makeId('job'), createdAt: new Date().toISOString(), ...payload, companyId: company ? company.id : payload.companyId };
    db.jobs.push(job);
    return clone(job);
  },
  updateJob: (id, updates) => {
    const job = getJobById(id);
    if (!job) return null;
    Object.assign(job, updates);
    return clone(job);
  },
  deleteJob: (id) => {
    const index = db.jobs.findIndex((job) => job.id === id);
    if (index === -1) return false;
    db.jobs.splice(index, 1);
    return true;
  },
  createApplication: (payload) => {
    const application = { id: makeId('app'), status: 'applied', notes: '', appliedAt: new Date().toISOString(), ...payload };
    db.applications.push(application);
    return clone(application);
  },
  findApplication: (studentId, jobId) => db.applications.find((application) => application.studentId === studentId && application.jobId === jobId) || null,
  updateApplicationStatus: (id, status) => {
    const application = db.applications.find((item) => item.id === id);
    if (!application) return null;
    application.status = status;
    return clone(application);
  },
  findApplicationsByStudent: (studentId) => db.applications.filter((application) => application.studentId === studentId).map(clone)
};
