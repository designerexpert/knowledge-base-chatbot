const { processFiles } = require('./fileProcessing.js');

exports.fileUploadHandler = async (req, res) => {
  const success = await processFiles();
  if (success) res.send(`File processed!`);
  else res.status(500).send(`File not processed!`);
};
