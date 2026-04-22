const Job = require('../models/Job');
const logger = require('../utils/logger');
const { generateFingerprint } = require('../utils/helpers');

/**
 * DuplicateDetector Service
 * Handles finding and managing duplicate job listings
 */
class DuplicateDetector {
    /**
     * Check if a job already exists by fingerprint
     */
    static async isDuplicate(fingerprint) {
        const existing = await Job.findOne({ fingerprint }).select('_id').lean();
        return !!existing;
    }

    /**
     * Check multiple fingerprints at once (batch)
     */
    static async findDuplicates(fingerprints) {
        const existing = await Job.find({
            fingerprint: { $in: fingerprints },
        }).select('fingerprint').lean();

        return new Set(existing.map(j => j.fingerprint));
    }

    /**
     * Filter out duplicates from a batch of jobs
     * Returns { newJobs, duplicateCount }
     */
    static async filterDuplicates(jobs) {
        if (!jobs || jobs.length === 0) return { newJobs: [], duplicateCount: 0 };

        const fingerprints = jobs.map(j => j.fingerprint);
        const existingFingerprints = await this.findDuplicates(fingerprints);

        const newJobs = [];
        let duplicateCount = 0;

        // Also track fingerprints within this batch to avoid intra-batch duplicates
        const seenInBatch = new Set();

        for (const job of jobs) {
            if (existingFingerprints.has(job.fingerprint) || seenInBatch.has(job.fingerprint)) {
                duplicateCount++;
            } else {
                newJobs.push(job);
                seenInBatch.add(job.fingerprint);
            }
        }

        logger.info(`Duplicate check: ${jobs.length} total, ${newJobs.length} new, ${duplicateCount} duplicates`);

        return { newJobs, duplicateCount };
    }

    /**
     * Find similar jobs by title and company (fuzzy)
     */
    static async findSimilar(title, companyName, threshold = 0.8) {
        // Use text search for fuzzy matching
        const results = await Job.find({
            $text: { $search: `"${title}" "${companyName}"` },
            isActive: true,
        })
            .select('title company.name fingerprint')
            .limit(5)
            .lean();

        return results;
    }

    /**
     * Update existing job if found (upsert logic)
     */
    static async upsertJob(jobData) {
        try {
            const existing = await Job.findOne({ fingerprint: jobData.fingerprint });

            if (existing) {
                // Update only if the new data has more info
                const updates = {};
                if (!existing.salary?.min && jobData.salary?.min) updates.salary = jobData.salary;
                if (!existing.description && jobData.description) updates.description = jobData.description;
                if (!existing.applyUrl && jobData.applyUrl) updates.applyUrl = jobData.applyUrl;
                if (jobData.skills?.length > (existing.skills?.length || 0)) updates.skills = jobData.skills;

                if (Object.keys(updates).length > 0) {
                    await Job.findByIdAndUpdate(existing._id, { $set: updates });
                    return { status: 'updated', id: existing._id };
                }

                return { status: 'duplicate', id: existing._id };
            }

            const newJob = await Job.create(jobData);
            return { status: 'new', id: newJob._id };
        } catch (error) {
            // Handle duplicate key errors gracefully
            if (error.code === 11000) {
                return { status: 'duplicate', error: 'Duplicate fingerprint' };
            }
            throw error;
        }
    }
}

module.exports = DuplicateDetector;
