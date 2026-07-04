import prisma from "../config/prisma";

export class RoomService {
    static async getAllRooms() {
        return prisma.room.findMany({
            where: { active: true },
            orderBy: { order: "asc" },
        });
    }
}
