export interface WrappedPromise<T> {
  read(): T
}

export function wrapPromise<T>(promise: Promise<T>): WrappedPromise<T> {
  let status = "pending";
  let result: T;
  let suspender = promise.then(
    r => {
      status = "success";
			result = r;
    },
    e => {
      status = "error";
      result = e;
    }
  );
  return {
    read<T>() {
      if (status === "pending") {
        throw suspender;
      } else if (status === "error") {
        throw result;
      } else if (status === "success") {
        return result;
      } else {
				throw suspender;
			}
    }
  };
}