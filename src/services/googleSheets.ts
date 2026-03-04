import { google } from 'googleapis';
import type { GuardianiaData, GuardianiaResponse } from '../types/guardian';

function getAuth() {
    return new google.auth.GoogleAuth({
        credentials: {
            client_email: import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: import.meta.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
}

function getSheets() {
    const auth = getAuth();
    return google.sheets({ version: 'v4', auth });
}

export async function getGuardiania(): Promise<GuardianiaResponse> {
    try {
        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: import.meta.env.GOOGLE_SHEETS_GUARDIANIA_ID,
            range: 'A:B',
        });

        const rows = response.data.values;
        if (!rows || rows.length < 2) {
            return { current: null, next: null };
        }

        const data: GuardianiaData[] = rows.slice(1).map((row) => ({
            weekStart: row[0],
            grade: row[1],
        }));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let currentIndex = -1;

        for (let i = 0; i < data.length; i++) {
            const weekStart = new Date(data[i].weekStart + 'T00:00:00');
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            if (today >= weekStart && today <= weekEnd) {
                currentIndex = i;
                break;
            }
        }

        return {
            current: currentIndex >= 0 ? data[currentIndex] : null,
            next: currentIndex >= 0 && currentIndex + 1 < data.length
                ? data[currentIndex + 1]
                : null,
        };
    } catch (error) {
        console.error('Error fetching guardiania:', error);
        return { current: null, next: null };
    }
}