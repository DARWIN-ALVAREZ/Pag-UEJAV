export interface GuardianiaData {
    weekStart: string;
    grade: string;
}

export interface GuardianiaResponse {
    current: GuardianiaData | null;
    next: GuardianiaData | null;
}