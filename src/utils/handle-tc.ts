async function handleAsync<T, E = Error>(
    promise: Promise<T>
  ): Promise<[T | null, E | null]> {
    try {
      const result = await promise;
      return [result, null];
    } catch (error) {
      return [null, error as E];
    }
  }
  
  function handleSync<T, E = Error>(fn: () => T): [T | null, E | null] {
    try {
      const result = fn();
      return [result, null];
    } catch (error) {
      return [null, error as E];
    }
  }
  
  const handleTC = {
    handleAsync,
    handleSync,
  };
  
  export default handleTC;
  