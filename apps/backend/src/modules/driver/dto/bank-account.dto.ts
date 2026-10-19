import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

const IBAN = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/;
const BIC = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

export class AddDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  accountHolderName!: string;

  @IsString()
  @Matches(IBAN, { message: "iban must be a valid IBAN" })
  @MaxLength(34)
  iban!: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== "")
  @IsString()
  @Matches(BIC, { message: "bic must be a valid BIC/SWIFT code" })
  @MaxLength(11)
  bic?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== "")
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  bankName?: string | null;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  accountHolderName?: string;

  @IsOptional()
  @IsString()
  @Matches(IBAN, { message: "iban must be a valid IBAN" })
  @MaxLength(34)
  iban?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== "")
  @IsString()
  @Matches(BIC, { message: "bic must be a valid BIC/SWIFT code" })
  @MaxLength(11)
  bic?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== "")
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  bankName?: string | null;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
