export const globalOptions = {
  timeout: 5000,
  logLevel: 1,
  queue: false,
};

export const setGlobalOptions = options => {
  Object.assign(globalOptions, options);
};
