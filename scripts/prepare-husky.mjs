if (process.env.HUSKY !== '0') {
  let installer;
  try {
    installer = import.meta.resolve('husky');
  } catch (error) {
    if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
  }

  if (installer) {
    const { default: install } = await import(installer);
    const message = install();
    if (message) console.log(message);
  }
}
