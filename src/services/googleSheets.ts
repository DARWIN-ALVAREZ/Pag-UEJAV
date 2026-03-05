import { google } from 'googleapis';
import type { GuardianiaData, GuardianiaResponse } from '../types/guardian';
import type { PodioEstudiante, PodioGroup, MejorPorGrado, HonorResponse } from '../types/honor';

// ==================== AUTH ====================

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

async function getSheetData(sheetName: string, range: string): Promise<string[][]> {
    const sheets = getSheets();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: import.meta.env.GOOGLE_SHEETS_ID,
        range: `${sheetName}!${range}`,
    });
    return response.data.values || [];
}

// ==================== CONFIG ====================

export async function getConfig(): Promise<Record<string, string>> {
    try {
        const rows = await getSheetData('Configuracion', 'A:B');
        const config: Record<string, string> = {};
        rows.slice(1).forEach((row) => {
            if (row[0] && row[1]) {
                config[row[0]] = row[1];
            }
        });
        return config;
    } catch (error) {
        console.error('Error fetching config:', error);
        return {};
    }
}

// ==================== GUARDIANÍA ====================

export async function getGuardiania(): Promise<GuardianiaResponse> {
    try {
        const rows = await getSheetData('Guardiania', 'A:B');

        if (rows.length < 2) {
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

// ==================== PODIO ====================

export async function getPodio(): Promise<PodioGroup[]> {
    try {
        const rows = await getSheetData('Podio', 'A:F');

        if (rows.length < 2) return [];

        const groups: Map<number, PodioGroup> = new Map();

        rows.slice(1).forEach((row) => {
            const posicion = parseInt(row[0]);
            const estudiante: PodioEstudiante = {
                posicion,
                nombre: row[1],
                grado: row[2],
                paralelo: row[3],
                promedio: parseFloat(row[4]),
                docente: row[5],
            };

            if (groups.has(posicion)) {
                groups.get(posicion)!.estudiantes.push(estudiante);
            } else {
                groups.set(posicion, { posicion, estudiantes: [estudiante] });
            }
        });

        return Array.from(groups.values()).sort((a, b) => a.posicion - b.posicion);
    } catch (error) {
        console.error('Error fetching podio:', error);
        return [];
    }
}

// ==================== MEJOR POR GRADO ====================

export async function getMejorPorGrado(): Promise<MejorPorGrado[]> {
    try {
        const rows = await getSheetData('Mejores_Estudiantes', 'A:D');

        if (rows.length < 2) return [];

        return rows.slice(1).map((row) => ({
            grado: row[0],
            nombre: row[1],
            paralelo: row[2],
            promedio: parseFloat(row[3]),
        }));
    } catch (error) {
        console.error('Error fetching mejor por grado:', error);
        return [];
    }
}

// ==================== CUADRO DE HONOR COMPLETO ====================

export async function getHonorData(): Promise<HonorResponse> {
    const [config, podio, mejorPorGrado] = await Promise.all([
        getConfig(),
        getPodio(),
        getMejorPorGrado(),
    ]);

    return {
        anioLectivo: config['anio_lectivo'] || '',
        quimestre: config['quimestre'] || '',
        podio,
        mejorPorGrado,
    };
}