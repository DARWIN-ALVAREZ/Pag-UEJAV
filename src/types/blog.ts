export interface Noticia {
    slug: string;
    titulo: string;
    fecha: string;
    categoria: string;
    imagen: string | null;
    resumen: string;
    contenido: string;
    autor: string;
}

export interface NoticiasResponse {
    noticias: Noticia[];
    total: number;
}