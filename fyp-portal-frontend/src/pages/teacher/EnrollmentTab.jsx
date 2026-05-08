import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, CheckCircle2, AlertCircle, FileSpreadsheet, Users, X, Eye } from "lucide-react";
import { toast } from "react-toastify";

const EnrollmentTab = ({ uploadedStudents, setUploadedStudents }) => {
  const [file, setFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showStudents, setShowStudents] = useState(true);
  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/teacher/upload-csv`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      if (data.students) {
        setUploadedStudents(data.students);
      }
      
      setUploadMsg({ text: data.message, type: "success" });
      toast.success(data.message);
      setFile(null);
      setShowStudents(true);
      
      const fileInput = document.getElementById("csv-input");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setUploadMsg({ text: err.message, type: "error" });
      toast.error(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Upload Form */}
      <div className="bg-white dark:bg-brand-muted rounded-3xl p-10 border dark:border-teal-900/30 shadow-xl max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet size={40} className="text-brand-teal" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight dark:text-white">
            Bulk Student Enrollment
          </h2>
          <p className="text-slate-400 mt-2 text-sm">
            Upload a CSV file with student details to pre-approve them for registration
          </p>
        </div>

        <form onSubmit={handleFileUpload} className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer text-center ${
              file
                ? "border-brand-teal bg-brand-teal/5"
                : "border-slate-200 dark:border-teal-900 hover:border-brand-teal"
            }`}
          >
            <input
              type="file"
              accept=".csv"
              className="hidden"
              id="csv-input"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="csv-input" className="cursor-pointer block">
              <Upload
                size={48}
                className={`mx-auto mb-4 ${
                  file ? "text-brand-teal" : "text-slate-300"
                }`}
              />
              <span className="text-sm font-bold uppercase tracking-widest dark:text-white">
                {file ? file.name : "Click to Choose CSV File"}
              </span>
              <p className="text-xs text-slate-400 mt-2">
                CSV must contain: name, registrationNo, cnic
              </p>
            </label>
          </div>

          {uploadMsg?.text && (
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                uploadMsg.type === "success"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {uploadMsg.type === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              {uploadMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || isUploading}
            className="w-full bg-brand-teal text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Processing..." : "Upload & Authorize Students"}
          </button>
        </form>
      </div>

      {/* Uploaded Students List */}
      {uploadedStudents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-brand-muted rounded-3xl border dark:border-teal-900/30 shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 dark:border-teal-900/30 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-brand-teal" />
              <div>
                <h3 className="text-xl font-black dark:text-white">
                  Uploaded Students ({uploadedStudents.length})
                </h3>
                <p className="text-xs text-slate-400">
                  These students can now register using their credentials
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowStudents(!showStudents)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-brand-dark text-slate-600 dark:text-white hover:bg-slate-200 transition-all"
            >
              {showStudents ? <X size={16} /> : <Eye size={16} />}
              {showStudents ? "Hide" : "Show"} List
            </button>
          </div>

          {showStudents && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-brand-dark/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Registration No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      CNIC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-teal-900/30">
                  {uploadedStudents.map((student, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50 dark:hover:bg-teal-900/10 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-teal/10 rounded-full flex items-center justify-center">
                            <span className="text-brand-teal font-bold text-sm">
                              {student.name?.charAt(0) || "S"}
                            </span>
                          </div>
                          <span className="font-medium dark:text-white">
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {student.registrationNo}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {student.cnic}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle2 size={12} />
                          Pre-approved
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* CSV Format Guide */}
      {uploadedStudents.length === 0 && (
        <div className="mt-6 p-4 bg-slate-50 dark:bg-brand-dark rounded-xl max-w-3xl mx-auto">
          <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">CSV Format Example:</h4>
          <code className="text-xs text-slate-500">
            name,registrationNo,cnic<br />
            John Doe,2021-CS-101,12345-6789012-3<br />
            Jane Smith,2021-CS-102,12345-6789012-4
          </code>
        </div>
      )}
    </motion.div>
  );
};

export default EnrollmentTab;