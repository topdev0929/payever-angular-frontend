/**
 * Custom elements inputs/outputs react on changes only when input/output value changed.
 * We use this event to trigger callbacks for void/null/boolean inputs/outputs
 */
export class TimestampEvent {

  _timestamp: number;

  constructor (
    public paymentLinkId: string = null
  ) {
    this._timestamp = +new Date();
  }
}
