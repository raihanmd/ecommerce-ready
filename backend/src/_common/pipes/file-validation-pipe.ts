import {
  BadRequestException,
  Injectable,
  PipeTransform,
  Type,
  mixin,
} from '@nestjs/common';
import {
  FileValidationType,
  ValidationService,
} from '../validation/validation.service';

interface FileValidationPipeOptions {
  required?: boolean;
}

export function FileValidationPipeFactory(
  validationType: FileValidationType,
  options: FileValidationPipeOptions = { required: true },
): Type<PipeTransform> {
  @Injectable()
  class MixinFileValidationPipe implements PipeTransform {
    constructor(private readonly validationService: ValidationService) {}

    transform(file: Express.Multer.File) {
      if (!file) {
        if (options.required) {
          throw new BadRequestException('No file uploaded');
        }
        return null;
      }

      return this.validationService.validateFile(file, validationType);
    }
  }

  return mixin(MixinFileValidationPipe);
}
