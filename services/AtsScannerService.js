const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const Settings = require('../models/Settings');
const logger = require('../utils/logger');

class AtsScannerService {
    
    /**
     * Common instruction prompt for ATS parsing
     */
    static getAtsPrompt(resumeText, jobDescription) {
        return `
You are a strict, highly accurate ATS (Applicant Tracking System) algorithm.
Your task is to analyze the candidate's resume against the Job Description.

RESUME TEXT:
"""
${resumeText}
"""

JOB DESCRIPTION:
"""
${jobDescription}
"""

Evaluate the resume and return a strict JSON object (NO markdown, NO extra text) with EXACTLY this structure:
{
  "atsScore": 65, // Integer from 0 to 100 representing the match strength
  "matchedSkills": ["JavaScript", "React"], // Array of strings found in both
  "missingSkills": ["Docker", "GraphQL"], // Array of skills from JD missing in resume
  "recommendations": [
    "Add more details about your backend experience.",
    "Mention building REST APIs."
  ]
}`;
    }

    /**
     * Run Scan using Google Gemini API
     */
    static async scanWithGemini(resumeText, jobDescription, apiKey) {
        if (!apiKey) throw new Error("Gemini API key is missing in platform settings.");
        
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            // using gemini-1.5-flash as it is fast and ideal for structured data tasks
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            const prompt = this.getAtsPrompt(resumeText, jobDescription);
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            return this.parseJSONSafe(responseText);
        } catch (error) {
            logger.error(`[AtsScanner GEMINI Error] ${error.message}`);
            throw new Error(`Gemini LLM Failed: ${error.message}`);
        }
    }

    /**
     * Run Scan using Groq API (LLaMA-3)
     */
    static async scanWithGroq(resumeText, jobDescription, apiKey) {
        if (!apiKey) throw new Error("Groq API key is missing in platform settings.");

        const prompt = this.getAtsPrompt(resumeText, jobDescription);

        try {
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'llama3-70b-8192',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.1,
                    response_format: { type: 'json_object' }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const responseText = response.data.choices[0].message.content;
            return this.parseJSONSafe(responseText);
        } catch (error) {
            logger.error(`[AtsScanner GROQ Error] ${error.message}`);
            throw new Error(`Groq LLM Failed: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * 100% Free / Standalone Heuristic Fallback Matcher
     */
    static scanWithHeuristic(resumeText, jobDescription) {
        const resumeStr = resumeText.toLowerCase();
        const jdStr = jobDescription.toLowerCase();

        // Extract basic keywords (word sequences > length 3)
        const jdWords = jdStr.match(/\b([a-z0-9\-+]{2,})\b/g) || [];
        // Filter out common stop words and keep unique
        const stopWords = ['this','that','with','from','have','your','will','what','about','which','when','there','their','these'];
        const uniqueJdWords = [...new Set(jdWords.filter(w => w.length > 3 && !stopWords.includes(w)))];
        
        const matchedSkills = [];
        const missingSkills = [];

        for (const word of uniqueJdWords) {
            if (resumeStr.includes(word)) {
                matchedSkills.push(word);
            } else {
                if (missingSkills.length < 15) missingSkills.push(word);
            }
        }

        const matchPercent = Math.round((matchedSkills.length / uniqueJdWords.length) * 100) || 0;
        
        return {
            atsScore: Math.min(matchPercent + 15, 100), // bump locally for formatting
            matchedSkills: matchedSkills.slice(0, 10),
            missingSkills: missingSkills.slice(0, 5),
            recommendations: [
                "Consider adding missing keywords directly to your skills section.",
                "Ensure your action verbs match the job description.",
                "(Notice: Evaluated using Local Engine fallback due to API configuration)"
            ]
        };
    }

    /**
     * Main orchestration function
     */
    static async performScan(resumeText, jobDescription) {
        const settings = await Settings.getSettings();
        
        let result;
        
        try {
            if (settings.aiProvider === 'gemini') {
                if (!settings.geminiApiKey) throw new Error("Gemini Key not configured. Falling back to local mode.");
                result = await this.scanWithGemini(resumeText, jobDescription, settings.geminiApiKey);
            } else if (settings.aiProvider === 'groq') {
                if (!settings.groqApiKey) throw new Error("Groq Key not configured. Falling back to local mode.");
                result = await this.scanWithGroq(resumeText, jobDescription, settings.groqApiKey);
            } else {
                result = this.scanWithHeuristic(resumeText, jobDescription);
            }
        } catch (error) {
            logger.warn(`ATS API Scan failed/bypassed: ${error.message}. Executing fallback heuristics.`);
            result = this.scanWithHeuristic(resumeText, jobDescription);
        }

        return result;
    }

    /**
     * Utility to safely extract JSON from LLM output
     */
    static parseJSONSafe(raw) {
        try {
            // Trim markdown backticks if returned
            const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned);
        } catch (e) {
            logger.error(`[AtsScanner] Failed to parse JSON from LLM: ${raw}`);
            return {
                atsScore: 0,
                matchedSkills: [],
                missingSkills: [],
                recommendations: ["Error parsing response from API."]
            };
        }
    }

    /**
     * CAREER COACH: Common instruction prompt for Resume Profiling
     */
    static getCareerCoachPrompt(resumeText) {
        return `
You are an expert Executive Tech Recruiter and AI Career Coach.
Analyze this candidate's resume and determine their exact career profile.

RESUME TEXT:
"""
${resumeText}
"""

Evaluate the resume and return a strict JSON object (NO markdown, NO extra text) with EXACTLY this structure:
{
  "currentLevel": "Junior / Mid / Senior",
  "strongMatches": ["Role 1", "Role 2", "Role 3"], // 3 best exact job titles they fit right now
  "futureRoles": [
    { "title": "Next Level Role A", "skillsToLearn": ["Skill A", "Skill B"] },
    { "title": "Next Level Role B", "skillsToLearn": ["Skill C", "Skill D"] }
  ],
  "resumeRating": 85 // Integer 0-100 on the quality of their resume formatting/content
}`;
    }

    static async performCareerCoaching(resumeText) {
        const settings = await Settings.getSettings();
        const prompt = this.getCareerCoachPrompt(resumeText);
        
        try {
            if (settings.aiProvider === 'gemini' && settings.geminiApiKey) {
                const genAI = new GoogleGenerativeAI(settings.geminiApiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(prompt);
                return this.parseJSONSafe(result.response.text());
            } 
            else if (settings.aiProvider === 'groq' && settings.groqApiKey) {
                const response = await axios.post(
                    'https://api.groq.com/openai/v1/chat/completions',
                    {
                        model: 'llama3-70b-8192',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.1,
                        response_format: { type: 'json_object' }
                    },
                    { headers: { 'Authorization': `Bearer ${settings.groqApiKey}`, 'Content-Type': 'application/json' } }
                );
                return this.parseJSONSafe(response.data.choices[0].message.content);
            } 
            else {
                return this.heuristicCareerCoach(resumeText);
            }
        } catch (error) {
            logger.warn(`Career Coach API failed: ${error.message}. Using heuristic fallback.`);
            return this.heuristicCareerCoach(resumeText);
        }
    }

    static heuristicCareerCoach(resumeText) {
        const txt = resumeText.toLowerCase();
        let level = "Junior";
        if (txt.includes('senior') || txt.includes('lead') || txt.includes('manager')) level = "Senior";
        else if (txt.includes('5 years') || txt.includes('4 years') || txt.includes('3 years')) level = "Mid";
        
        let path = "Software Engineer";
        if (txt.includes('react') || txt.includes('frontend') || txt.includes('ui')) path = "Frontend Developer";
        if (txt.includes('node') || txt.includes('backend') || txt.includes('api')) path = "Backend Developer";
        if (txt.includes('aws') || txt.includes('docker') || txt.includes('kubernetes')) path = "DevOps Engineer";
        
        return {
            currentLevel: level,
            strongMatches: [path, `${level} ${path}`, "Software Developer"],
            futureRoles: [
                { title: "Engineering Manager", skillsToLearn: ["Leadership", "System Architecture"] },
                { title: "Senior Solutions Architect", "skillsToLearn": ["Cloud Computing", "Scalability Engineering"] }
            ],
            resumeRating: 75
        };
    }
}

module.exports = AtsScannerService;
