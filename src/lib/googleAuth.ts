import { google } from 'googleapis';

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/calendar.readonly',
];

function getAuth() {
    return new google.auth.GoogleAuth({
        credentials: {
            client_email: import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: import.meta.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: SCOPES,
    });
}

export function getSheets() {
    return google.sheets({ version: 'v4', auth: getAuth() });
}

export function getDrive() {
    return google.drive({ version: 'v3', auth: getAuth() });
}

export function getCalendar() {
    return google.calendar({ version: 'v3', auth: getAuth() });
}