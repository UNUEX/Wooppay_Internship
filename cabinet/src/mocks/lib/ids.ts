import { randomBytes } from "node:crypto";

// txn_3f9a1c..., tok_..., evt_... — по префиксу видно, что это за объект
export function newId(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}
