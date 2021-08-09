/** @param {*} onCompletPayloadInstance */
const checkDelayAndResetPreservedDataBufferIfneeded = (
    onCompletPayloadInstance
  ) => {
    const { maxDelayBetweenBytesMs, lastByteFetchTime } =
      onCompletPayloadInstance;

    if (maxDelayBetweenBytesMs > 0) {
      const now = Date.now();
      const delayBetweenLastByte = now - lastByteFetchTime;
      if (delayBetweenLastByte > maxDelayBetweenBytesMs) {
        onCompletPayloadInstance.preservedDataBuffer =
          new Uint32Array(0);
      }
      onCompletPayloadInstance.lastByteFetchTime = now;
    }
  };

  /**
   *
   * @param {Uint32Array} payload
   * @returns {[ nativMessage: string, preservedDataBuffer: Uint32Array]}
   */
  const getCompletPayloadAndPreservedDataBuffer = (
    payload
  ) => {
    const moreThen4bytes = payload.length > 1;

    if (!moreThen4bytes) {
      return ['', payload];
    }
    // Read the first 4 bytes as Integer
    const dataLength = parseInt(`${payload[0]}`);
    if (isNaN(dataLength)) {
      return ['', new Uint32Array(0)];
    }

    const endOfMessage = 1 + dataLength;
    const isComplet = payload.length >= endOfMessage;
    const preservedDataBuffer = isComplet
      ? payload.slice(endOfMessage, payload.length)
      : payload;

    const nativMessagePayload = isComplet
      ? payload.slice(1, dataLength).join('')
      : '';

    return [nativMessagePayload, preservedDataBuffer];
  };

  /** @typedef { Buffer | Uint32Array } BufferOrUnit32 */

  /**
   * @callback OnPayloadCompletTransformFn
   * @param { BufferOrUnit32 } buffer
   * @param {*} destination
   */

  /**
   * This parser makes sure that only valid NativMessages/Payloads
   * get emitted it drops false messages as per NativMessage Specs
   * @function [OnPayloadComplet]
   * @param {number} maxDelayBetweenBytesMs
   * @returns {onCompletPayloadInstance}
   */
  export const OnPayloadComplet = (
    maxDelayBetweenBytesMs = 50
  ) => {
    const onCompletPayloadInstance = {
      maxDelayBetweenBytesMs,
      /** @type {OnPayloadCompletTransformFn} */
      _transform: (buffer, destination) => {
        destination(buffer);
      },
      preservedDataBuffer: new Uint32Array(0),
      lastByteFetchTime: 0,
    };

    /** @type {OnPayloadCompletTransformFn} */
    onCompletPayloadInstance._transform = (
      buffer,
      destination
    ) => {
      checkDelayAndResetPreservedDataBufferIfneeded(
        onCompletPayloadInstance
      );
      // Run
      const [nativMessagePayload, preservedDataBuffer] =
        getCompletPayloadAndPreservedDataBuffer(
          Uint32Array.from([
            ...onCompletPayloadInstance.preservedDataBuffer,
            ...buffer,
          ])
        );
      // Update State
      onCompletPayloadInstance.preservedDataBuffer =
        preservedDataBuffer;
      // return
      if (!nativMessagePayload.length) {
        return;
      }
      // or emit
      destination(nativMessagePayload);

      // In general this should not happen outside of Dev
      const shouldReadNextPayload =
        preservedDataBuffer.length > 1;

      // repeat
      if (shouldReadNextPayload) {
        onCompletPayloadInstance._transform(
          new Uint32Array(0),
          destination
        );
      }
    };

    // Instance of onCompletPayloadInstance
    return onCompletPayloadInstance;
  };
