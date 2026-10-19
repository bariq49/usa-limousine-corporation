import { IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from "class-validator";

export class DocumentsDto {
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  chauffeurFront!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  chauffeurBack!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  licenseFront!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  licenseBack!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  nationalIdFront!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  nationalIdBack!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  kiwaPermit!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  vehicleInsurance!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  airportStaPass?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  kvkNo!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "licenseExpiry must be YYYY-MM-DD" })
  licenseExpiry!: string;
}

export class UpdateDocumentsDto {
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  chauffeurFront?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  chauffeurBack?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  licenseFront?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  licenseBack?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  nationalIdFront?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  nationalIdBack?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  kiwaPermit?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  vehicleInsurance?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  airportStaPass?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  kvkNo?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "licenseExpiry must be YYYY-MM-DD" })
  licenseExpiry?: string;
}
