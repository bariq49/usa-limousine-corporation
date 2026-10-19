import { IsOptional, IsString, IsUrl, MinLength, ValidateIf } from "class-validator";

export class AddPaymentMethodDto {
  @IsOptional()
  @IsUrl({ require_tld: false })
  successUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  cancelUrl?: string;
}

export class ConfirmPaymentMethodDto {
  @ValidateIf((body: ConfirmPaymentMethodDto) => !body.setupIntentId)
  @IsString()
  @MinLength(1)
  sessionId?: string;

  @ValidateIf((body: ConfirmPaymentMethodDto) => !body.sessionId)
  @IsString()
  @MinLength(1)
  setupIntentId?: string;
}
