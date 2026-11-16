import { HttpError } from "../lib/http";
import { GATEWAY_SECRET_KEY } from "./config";

// "Создать транзакцию" и "вернуть деньги" может только сервер кабинета
// со своим секретным ключом. Из браузера — нельзя: иначе любой мог бы
// создать счёт на 1 тиын или вернуть себе деньги.
export function requireSecretKey(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${GATEWAY_SECRET_KEY}`) {
    throw new HttpError(401, "unauthorized", "Неверный секретный ключ");
  }
}
