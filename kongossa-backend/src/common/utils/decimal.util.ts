import { Decimal } from "@prisma/client/runtime/library";

export function toNumber(value?: Decimal | number | null): number {
  if (!value) return 0;
  return value instanceof Decimal ? value.toNumber() : value;
}
