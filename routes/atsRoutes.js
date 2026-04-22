const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { authRequired } = require('../middleware/auth');
const AtsScannerService = require('../services/AtsScannerService');
const logger = require('../utils/logger');

// Accept PDFs in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF format is supported for ATS scanning.'));
        }
    }
});

/**
 * POST /api/resume/ats-check
 * @desc Parse PDF and run ATS analysis against a provided Job Description
 * @access Private (Registered users)
 */
router.post('/ats-check', authRequired, upload.single('resume'), async (req, res) => {
    try {
        const { jobDescription } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a PDF resume.' });
        }
        
        if (!jobDescription || jobDescription.trim().length < 50) {
            return res.status(400).json({ success: false, error: 'Please provide a valid Job Description of at least 50 characters.' });
        }

        // 1. Extract Text from PDF
        const pdfData = await pdfParse(req.file.buffer);
        const resumeText = pdfData.text.trim();

        if (!resumeText || resumeText.length < 50) {
            return res.status(400).json({ success: false, error: 'Could not extract enough text from the PDF. Is it an image-based PDF?' });
        }

        // 2. Scan ATS
        const result = await AtsScannerService.performScan(resumeText, jobDescription);

        // Optional: Save to Database History here if needed
        // await AtsHistory.create({ userId: req.user._id, score: result.atsScore ... })

        return res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        logger.error(`[ATS Endpoint Error] ${error.message}`);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Internal Server Error during ATS Scan' 
        });
    }
});

module.exports = router;
