const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const { processJob, getJobStatus } = require("./jobs/jobHandler");

const app = express();
app.use(express.json());

// Load store master data
const storeMaster = JSON.parse(fs.readFileSync("storeMaster.json", "utf-8"));

// In-memory storage for jobs
const jobs = {};

// POST /api/submit/ - Submit a new job
app.post("/api/submit/", async (req, res) => {
    const { count, visits } = req.body;

    // Validate input
    if (!count || !visits || count !== visits.length) {
        return res.status(400).json({ error: "Invalid input data" });
    }

    // Create a job ID
    const jobId = `job_${Date.now()}`;
    jobs[jobId] = { status: "ongoing", errors: [], results: [] };

    // Start job processing asynchronously
    processJob(visits, storeMaster, jobId, jobs);

    return res.status(201).json({ job_id: jobId });
});

// GET /api/status - Get job status
app.get("/api/status", (req, res) => {
    const { jobid } = req.query;

    if (!jobid || !jobs[jobid]) {
        return res.status(400).json({});
    }

    const job = jobs[jobid];
    const response = {
        status: job.status,
        job_id: jobid,
        ...(job.status === "failed" && { error: job.errors })
    };

    return res.status(200).json(response);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
