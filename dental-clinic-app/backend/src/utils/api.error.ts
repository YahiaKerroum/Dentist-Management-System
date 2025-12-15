// src/utils/api.error.ts
export class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);          // sets the error message
        this.statusCode = statusCode; // sets the HTTP status code
        this.name = "ApiError";  // optional: sets error name
        Object.setPrototypeOf(this, ApiError.prototype); // ensures instanceof works
    }
}