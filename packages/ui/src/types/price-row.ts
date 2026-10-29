export interface PriceRowProps {
  label: string;
  value: number;
  destructive?: boolean;
  format?: (value: number) => string;
}
