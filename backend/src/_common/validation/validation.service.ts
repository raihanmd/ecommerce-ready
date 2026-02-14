import { ForbiddenException, Injectable } from "@nestjs/common";
import { z, ZodType } from "zod";

export const FileValidationSchemas = {
  IMAGE: z.object({
    filename: z.string().min(1, "Filename is required"),
    mimetype: z.enum(
      ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"],
      {
        error: "Invalid image file type. Allowed: PNG, JPEG, SVG, WebP",
      },
    ),
    size: z.number().max(5 * 1024 * 1024, "Image size must be less than 5MB"),
  }),

  ANY: z.object({
    filename: z.string().min(1, "Filename is required"),
    mimetype: z.string().min(1, "File type is required"),
    size: z
      .number()
      .max(100 * 1024 * 1024, "File size must be less than 100MB"),
  }),
} as const;

export type FileValidationType = keyof typeof FileValidationSchemas;
export type FileUploadData<T extends FileValidationType> = z.infer<
  (typeof FileValidationSchemas)[T]
>;

@Injectable()
export class ValidationService {
  validate<T>(schema: ZodType<T>, data: unknown): T {
    if (!data) {
      throw new ForbiddenException("No data provided");
    }

    try {
      return schema.parse(data);
    } catch (error) {
      throw error;
    }
  }

  validateFileWithSchema<T>(
    file: Express.Multer.File | null | undefined,
    schema: ZodType<T>,
  ): Express.Multer.File | null {
    if (!file) return null;

    const fileData = {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      // destination: file?.destination,
      // path: file?.path,
      // buffer: file?.buffer,
    };

    this.validate(schema, fileData);
    return file;
  }

  validateFile<T extends FileValidationType>(
    file: Express.Multer.File | null | undefined,
    validationType: T,
  ): Express.Multer.File | null {
    if (!file) return null; // ⬅️ cukup return null, no exception

    const schema = FileValidationSchemas[validationType];
    const fileData = {
      filename: file.originalname,
      mimetype: file.mimetype as unknown as FileUploadData<T>["mimetype"],
      size: file.size,
    };

    this.validate(schema, fileData);
    return file;
  }

  validateMultipleFileTypes(
    fileValidations:
      | Array<{
          file: Express.Multer.File | null | undefined;
          validationType: FileValidationType;
        }>
      | null
      | undefined,
  ): (Express.Multer.File | null)[] | null {
    if (!fileValidations || fileValidations.length === 0) return null;

    return fileValidations.map(({ file, validationType }) =>
      this.validateFile(file, validationType),
    );
  }
}
