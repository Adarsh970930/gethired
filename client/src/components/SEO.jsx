import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Get Hired';
const DEFAULT_DESCRIPTION = "India's #1 Job Aggregator for Engineers & Students. Find jobs at FAANG, WITCH, Indian startups & global companies.";
const DEFAULT_KEYWORDS = 'jobs india, engineer jobs, fresher jobs, FAANG india, wipro jobs, infosys jobs, tcs jobs, remote jobs india, campus placement, software developer jobs';

export default function SEO({
    title,
    description = DEFAULT_DESCRIPTION,
    keywords = DEFAULT_KEYWORDS,
    ogType = 'website',
    noIndex = false,
}) {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Jobs for Indian Engineers & Students`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            {noIndex && <meta name="robots" content="noindex,nofollow" />}
        </Helmet>
    );
}
