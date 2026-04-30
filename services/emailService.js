const nodemailer = require('nodemailer');
const Settings = require('../models/Settings');
const logger = require('../utils/logger');

class EmailService {
    /**
     * Send an application acknowledgement email based on Admin settings
     * @param {Object} user - The user object applying (must have .name and .email)
     * @param {Object} job - The job object being applied to (must have .title and .company.name)
     */
    static async sendApplicationEmail(user, job) {
        try {
            const settings = await Settings.getSettings();

            // Check if email feature is enabled and credentials exist
            if (!settings.emailEnabled || !settings.smtpEmail || !settings.smtpPassword) {
                logger.info('Email service skipped: Disabled or credentials missing in settings.');
                return;
            }

            // Create Nodemailer Transporter dynamically
            const transporter = nodemailer.createTransport({
                service: 'gmail', // Assuming gmail. For broader use, host/port could be added to DB
                auth: {
                    user: settings.smtpEmail,
                    pass: settings.smtpPassword
                }
            });

            // Process Template Placeholders
            const replacePlaceholders = (str) => {
                if (!str) return '';
                return str
                    .replace(/{{userName}}/g, user.name || 'Applicant')
                    .replace(/{{jobTitle}}/g, job.title || 'the role')
                    .replace(/{{companyName}}/g, job.company?.name || 'our company');
            };

            const mailOptions = {
                from: `"Get Hired Admin" <${settings.smtpEmail}>`,
                to: user.email,
                subject: replacePlaceholders(settings.emailSubject),
                html: replacePlaceholders(settings.emailTemplate)
            };

            // Send Email
            const info = await transporter.sendMail(mailOptions);
            logger.info(`📧 Acknowledgement email sent successfully to ${user.email} (Message ID: ${info.messageId})`);
            
        } catch (error) {
            // We catch the error so the main application flow (saving the job application) doesn't break
            logger.error(`❌ Failed to send application email to ${user?.email}:`, error.message);
        }
    }

    /**
     * Send a mass email alert to all students when a new College Exclusive job is posted
     * @param {Object} job - The job object being posted
     */
    static async sendMassCollegeAlert(job) {
        try {
            const settings = await Settings.getSettings();

            if (!settings.massEmailEnabled || !settings.smtpEmail || !settings.smtpPassword) {
                logger.info('Mass email alert skipped: Disabled or credentials missing in settings.');
                return;
            }

            // Require User model here to avoid circular dependency
            const User = require('../models/User');
            const users = await User.find({ isActive: true }).lean();

            if (!users || users.length === 0) {
                logger.info('Mass email alert skipped: No active users found.');
                return;
            }

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: settings.smtpEmail,
                    pass: settings.smtpPassword
                }
            });

            logger.info(`🚀 Starting mass email blast for College Job: ${job.title} to ${users.length} users.`);

            // Batch processing to prevent SMTP rate limits
            const BATCH_SIZE = 50; 
            const DELAY_MS = 2000; // 2 seconds between batches
            
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            // Run asynchronously in the background so it doesn't block the job saving API request
            (async () => {
                let successCount = 0;
                let failCount = 0;

                for (let i = 0; i < users.length; i += BATCH_SIZE) {
                    const batch = users.slice(i, i + BATCH_SIZE);
                    
                    const promises = batch.map(user => {
                        const replacePlaceholders = (str) => {
                            if (!str) return '';
                            return str
                                .replace(/{{userName}}/g, user.name || 'Student')
                                .replace(/{{jobTitle}}/g, job.title || 'a new role')
                                .replace(/{{companyName}}/g, job.company?.name || 'an exclusive company');
                        };

                        const mailOptions = {
                            from: `"Get Hired Placement Cell" <${settings.smtpEmail}>`,
                            to: user.email,
                            subject: replacePlaceholders(settings.massEmailSubject),
                            html: replacePlaceholders(settings.massEmailTemplate)
                        };

                        return transporter.sendMail(mailOptions)
                            .then(() => successCount++)
                            .catch(err => {
                                failCount++;
                                logger.error(`❌ Failed to send mass email to ${user.email}:`, err.message);
                            });
                    });

                    await Promise.allSettled(promises);
                    
                    if (i + BATCH_SIZE < users.length) {
                        await delay(DELAY_MS);
                    }
                }
                
                logger.info(`✅ Mass email blast complete. Sent: ${successCount}, Failed: ${failCount}.`);
            })();

        } catch (error) {
            logger.error(`❌ Failed to initiate mass email alert:`, error.message);
        }
    }
}

module.exports = EmailService;
