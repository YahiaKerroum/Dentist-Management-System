export type RoomType = 'CHAIR' | 'XRAY' | 'SURGERY';

export interface Room {
    id: string;
    name: string;
    type: RoomType;
    order: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}
