import { getDrive } from '../lib/googleAuth';

export async function getImageFromDrive(fileId: string): Promise<{
    buffer: Buffer;
    mimeType: string;
} | null> {
    try {
        const drive = getDrive();

        // Primero obtenemos el mimeType
        const meta = await drive.files.get({
            fileId,
            fields: 'mimeType',
        });

        const mimeType = meta.data.mimeType || 'image/jpeg';

        // Descargamos el archivo
        const response = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );

        const buffer = Buffer.from(response.data as ArrayBuffer);

        return { buffer, mimeType };
    } catch (error) {
        console.error('Error fetching image from Drive:', error);
        return null;
    }
}