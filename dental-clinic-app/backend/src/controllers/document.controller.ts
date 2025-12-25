import { Request, Response } from "express";
import { DocumentService } from "../services/document.service";
import { sendSuccess, sendError } from "../utils/response.utils";
import { asyncHandler } from "../utils/async.handler";
import { AuthenticatedRequest } from "../types/auth.types";
import { uploadToDrive } from "../utils/drive.utils";

export class DocumentController {
  static create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const document = await DocumentService.createDocument({
      ...req.body,
      uploadedById: req.user?.userId,
    });
    sendSuccess(res, document, "Document uploaded successfully", 201);
  });

  static getByPatientId = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const documents = await DocumentService.getDocumentsByPatientId(req.params.patientId);
    sendSuccess(res, documents);
  });

  static getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const document = await DocumentService.getDocumentById(req.params.id);
    sendSuccess(res, document);
  });

  static uploadWithFile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const file = (req as any).file as Express.Multer.File | undefined;
    const { patientId, name, type } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: "File is required" });
    }

    if (!patientId) {
      return res.status(400).json({ success: false, message: "patientId is required" });
    }

    const filename = name || file.originalname;
    const mimeType = file.mimetype || "application/octet-stream";

    const driveResult = await uploadToDrive({
      buffer: file.buffer,
      filename,
      mimeType,
    });

    const document = await DocumentService.createDocument({
      patientId,
      name: filename,
      type: type || "OTHER",
      filePath: driveResult.webViewLink,
      uploadedById: req.user?.userId!,
    });

    sendSuccess(res, document, "Document uploaded successfully", 201);
  });

  static getAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { patientId, type } = req.query;
    const documents = await DocumentService.getAllDocuments({
      patientId: patientId as string | undefined,
      type: type as string | undefined,
    });
    sendSuccess(res, documents);
  });

  static update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const document = await DocumentService.updateDocument(
      req.params.id,
      req.body,
      req.user?.userId || ""
    );
    sendSuccess(res, document, "Document updated successfully");
  });

  static delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await DocumentService.deleteDocument(req.params.id, req.user?.userId || "");
    sendSuccess(res, result);
  });
}
