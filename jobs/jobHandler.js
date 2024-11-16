const axios = require("axios");
const fs = require("fs").promises;
const { imageSize } = require("image-size");

// Helper: Simulate GPU processing with random delay
const simulateProcessing = () => {
    const delay = Math.random() * (400 - 100) + 100;
    return new Promise((resolve) => setTimeout(resolve, delay));
};

// Helper: Download image and calculate perimeter
const processImage = async (imageUrl) => {
    try {
        // Fetch the image data
        const response = await axios({ url: imageUrl, responseType: "arraybuffer" });
        const buffer = Buffer.from(response.data, "binary");

        // Calculate actual image dimensions
        const dimensions = imageSize(buffer);
        if (!dimensions || !dimensions.width || !dimensions.height) {
            throw new Error("Unable to calculate image dimensions.");
        }

        const { width, height } = dimensions;
        const perimeter = 2 * (width + height);

        // Simulate processing delay
        await simulateProcessing();

        return { success: true, width, height, perimeter };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Main: Process a job
const processJob = async (visits, storeMaster, jobId, jobs) => {
    for (const visit of visits) {
        const { store_id, image_url, visit_time } = visit;

        // Validate store_id
        const store = storeMaster.find((s) => s.StoreID === store_id);
        if (!store) {
            jobs[jobId].status = "failed";
            jobs[jobId].errors.push({ store_id, error: "Invalid store_id" });
            return;
        }

        for (const url of image_url) {
            const result = await processImage(url);

            if (!result.success) {
                jobs[jobId].status = "failed";
                jobs[jobId].errors.push({ store_id, error: result.error });
                return;
            }

            jobs[jobId].results.push({
                store_id,
                store_name: store.StoreName,
                area_code: store.AreaCode,
                visit_time,
                image_url: url,
                perimeter: result.perimeter,
            });
        }
    }

    jobs[jobId].status = "completed";
};

// Get job status
const getJobStatus = (jobId, jobs) => jobs[jobId];

module.exports = { processJob, getJobStatus };
