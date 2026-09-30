export interface SessionResponse {
    id: string;
    userId: number;
    createdAt: string;
    expiresAt: string;
    revokedAt: string | null;
    active: boolean;
}