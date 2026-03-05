export const prerender = false;

import type { APIRoute } from 'astro';
import { getImageFromDrive } from '../../../services/googleDrive';

export const GET: APIRoute = async ({ params }) => {
    const { id } = params;

    if (!id) {
        return new Response('ID requerido', { status: 400 });
    }

    const image = await getImageFromDrive(id);

    if (!image) {
        return new Response('Imagen no encontrada', { status: 404 });
    }

    return new Response(new Uint8Array(image.buffer), {
        headers: {
            'Content-Type': image.mimeType,
            'Cache-Control': 'public, max-age=86400',
        },
    });
};