export { TEST_CARDS, THREE_DS_TEST_CODE, type Scenario } from "./sandbox";

// как часто экран результата спрашивает статус платежа
export const STATUS_POLL_INTERVAL_MS = 1500;
// сколько ждём финального статуса, прежде чем показать "уточняем статус"
export const STATUS_POLL_TIMEOUT_MS = 60_000;
