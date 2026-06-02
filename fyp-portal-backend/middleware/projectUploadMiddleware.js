const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create upload directories if they don't exist
const reportDir = "uploads/reports";
const videoDir = "uploads/videos";
const projectDir = "uploads/projects";

if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}
if (!fs.existsSync(projectDir)) {
  fs.mkdirSync(projectDir, { recursive: true });
}

// Storage for report files (PDF, DOC, DOCX)
const reportStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, reportDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `report-${timestamp}-${random}${ext}`);
  }
});

// Storage for video files (MP4, MOV, AVI, MKV, WEBM)
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `video-${timestamp}-${random}${ext}`);
  }
});

// Storage for project files (ZIP, etc.) - keep original for backward compatibility
const projectStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, projectDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${originalName}`);
  }
});

// File filters
const reportFileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedExts = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, and DOCX files are allowed for reports"), false);
  }
};

const videoFileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'];
  const allowedExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only MP4, MOV, AVI, MKV, WEBM files are allowed for videos"), false);
  }
};

// Multer instances for single file uploads (backward compatibility)
const uploadReport = multer({
  storage: reportStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit for reports
  fileFilter: reportFileFilter
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
  fileFilter: videoFileFilter
});

// Combined upload for multiple files (used by the new project submission)
const uploadProjectFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'reportFile') {
        cb(null, reportDir);
      } else if (file.fieldname === 'demoVideo') {
        cb(null, videoDir);
      } else {
        cb(null, projectDir);
      }
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      let prefix = 'file-';
      if (file.fieldname === 'reportFile') prefix = 'report-';
      if (file.fieldname === 'demoVideo') prefix = 'video-';
      cb(null, `${prefix}${timestamp}-${random}${ext}`);
    }
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB total limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'reportFile') {
      const allowedExts = ['.pdf', '.doc', '.docx'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExts.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error("Only PDF, DOC, DOCX files allowed for reports"), false);
      }
    } else if (file.fieldname === 'demoVideo') {
      const allowedExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExts.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error("Only MP4, MOV, AVI, MKV, WEBM files allowed for videos"), false);
      }
    } else {
      cb(null, true);
    }
  }
}).fields([
  { name: 'reportFile', maxCount: 1 },
  { name: 'demoVideoFile', maxCount: 1 } 
]);

// Keep original uploadProject for backward compatibility
const uploadProject = multer({
  storage: projectStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/zip', 'application/x-zip-compressed'];
    const allowedExts = ['.pdf', '.zip', '.rar', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, ZIP, DOC, DOCX files are allowed"), false);
    }
  }
});

module.exports = {
  uploadReport,
  uploadVideo,
  uploadProjectFiles,
  uploadProject  // Keep for backward compatibility
};