export interface PodioEstudiante {
    posicion: number;
    nombre: string;
    grado: string;
    paralelo: string;
    promedio: number;
    docente: string;
}

export interface PodioGroup {
    posicion: number;
    estudiantes: PodioEstudiante[];
}

export interface MejorPorGrado {
    grado: string;
    nombre: string;
    paralelo: string;
    promedio: number;
}

export interface HonorResponse {
    anioLectivo: string;
    quimestre: string;
    podio: PodioGroup[];
    mejorPorGrado: MejorPorGrado[];
}