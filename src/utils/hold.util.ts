import { HOLD_STAGES } from "../constants/tableTypes";

/**
 * Check if a Hold is closed (e.g., converted to SO or superseded).
 */
export const isHoldClosed = (hold: any): boolean => {
  if (!hold) return false;
  return hold.stage === HOLD_STAGES.SO_CREATED || hold.stage === HOLD_STAGES.SUPERSEDED;
};

/**
 * Check if a Hold is open (e.g., initiated).
 */
export const isHoldOpen = (hold: any): boolean => {
  if (!hold) return false;
  return hold.stage === HOLD_STAGES.INITIATED;
};
