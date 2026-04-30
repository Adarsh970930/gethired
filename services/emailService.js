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
}

module.exports = EmailService;
