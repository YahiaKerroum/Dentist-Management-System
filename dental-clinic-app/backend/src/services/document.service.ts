import { NotFoundError, ForbiddenError, ValidationError } from "../errors/app.errors";
import prisma from "../config/prisma";
import { deleteFromDrive } from "../utils/drive.utils";
import { userHasPermission } from "../utils/permission.utils";
import { Permission } from "../types/permission.types";

export class DocumentService {
  static async createDocument(data: {
    patientId: string;
    name: string;
    type: string;
    filePath: string;
    uploadedById: string;
  }) {
    // Validate required fields
    if (!data.patientId || !data.name || !data.type || !data.filePath || !data.uploadedById) {
      throw new ValidationError("Missing required fields: patientId, name, type, filePath, uploadedById");
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
    });

    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    // TODO: check user permission at service layer 

    // Create document in the database
    const document = await prisma.document.create({
      data: {
        patientId: data.patientId,
        name: data.name,
        type: data.type,
        filePath: data.filePath,
        uploadedById: data.uploadedById,
      },
      include: {
        uploadedBy: {
          select: {
            firstName: true,
            lastName: true,
            id: true,
          },
        },
      },
    });

    return document;
  }

  static async getDocumentsByPatientId(patientId: string) 
  {
    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    const documents = await prisma.document.findMany({
      where: { patientId },
      include: {
        uploadedBy: {
          select: {
            firstName: true,
            lastName: true,
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return documents;
  }

  static async getDocumentById(documentId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        uploadedBy: {
          select: {
            firstName: true,
            lastName: true,
            id: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            primaryDentistId: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    return document;
  }

  static async updateDocument(
    documentId: string,
    data: {
      name?: string;
      type?: string;
    },
    userId: string
  ) {
    // Get the document first 
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    // permission checks are handled later in the service layer (here)

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
      },
      include: {
        uploadedBy: {
          select: {
            firstName: true,
            lastName: true,
            id: true,
          },
        },
      },
    });

    return updatedDocument;
  }

  static async deleteDocument(documentId: string, userId: string) {
    // Get the document first 
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    // permission checks are handled later in the service layer (here)

    // Best-effort: also remove the file from Google Drive
    // Try to extract the Drive fileId from stored webViewLink/filePath
    const extractDriveFileId = (link: string | null | undefined): string | null => {
      if (!link) return null;
      // Patterns we may encounter:
      // 1) https://drive.google.com/file/d/<FILE_ID>/view?...
      // 2) https://drive.google.com/open?id=<FILE_ID>
      // 3) https://drive.google.com/uc?id=<FILE_ID>&export=...
      // 4) Direct id (unlikely, but handle gracefully)
      const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/, // file/d/<id>/
        /[?&]id=([a-zA-Z0-9_-]+)/,    // ?id=<id>
      ];
      for (const re of patterns) {
        const m = link.match(re);
        if (m && m[1]) return m[1];
      }
      // If link looks like a bare id (no slashes, reasonable length), return it
      if (/^[a-zA-Z0-9_-]{20,}$/.test(link)) return link;
      return null;
    };

    const fileId = extractDriveFileId(document.filePath);
    if (fileId) {
      try {
        await deleteFromDrive(fileId);
      } catch (err: any) {
        // If the file is already gone or not accessible, proceed with DB delete
        const msg = String(err?.message || "");
        const notFound = msg.includes("File not found") || msg.includes("not found");
        if (!notFound) {
          // For other errors (auth/config), still proceed but you could log this
          // Optionally: throw new Error("Failed to delete file from Drive");
        }
      }
    }

    await prisma.document.delete({
      where: { id: documentId },
    });

    return { success: true, message: "Document deleted successfully" };
  }

  static async getAllDocuments(filters?: { patientId?: string; type?: string }) {
    const where: any = {};

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            firstName: true,
            lastName: true,
            id: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return documents;
  }
}
