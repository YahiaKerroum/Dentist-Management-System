import { Room } from "../types/room";
import { apiClient } from "../lib/apiClient";

export async function getAllRooms(): Promise<Room[]> {
    const { data } = await apiClient.get("/rooms");
    return data.data;
}
