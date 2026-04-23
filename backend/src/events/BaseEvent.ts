export interface BaseEvent<T = any> {
  type: string;
  payload: T;
  timestamp: Date;
}