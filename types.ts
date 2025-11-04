
export interface Worker {
  id: string;
  name: string;
  dni: string;
  contractHours: number;
  signature?: string;
  standardEntry?: string;
  standardStop?: string;
  standardComeback?: string;
  standardExit?: string;
}

export interface LogEntry {
  day: number;
  entry: string;
  stop: string;
  comeback: string;
  exit: string;
  ordinaryHours: number;
  extraHours: number;
  signature: string;
  enabled: boolean;
  entryTick: boolean;
  stopTick: boolean;
  comebackTick: boolean;
  exitTick: boolean;
}