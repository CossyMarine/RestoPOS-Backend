const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const exportRewardCodesToExcel = async (rewardCodes) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reward Codes');

  worksheet.columns = [
    { header: 'Code', key: 'code', width: 25 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Created At', key: 'createdAt', width: 20 },
    { header: 'Redeemed', key: 'redeemed', width: 10 },
    { header: 'Redeemed By', key: 'redeemedBy', width: 30 },
    { header: 'Redeemed At', key: 'redeemedAt', width: 20 },
  ];

  rewardCodes.forEach(code => {
    worksheet.addRow({
      code: code.code,
      amount: code.amount,
      createdAt: code.createdAt,
      redeemed: code.redeemed ? 'Yes' : 'No',
      redeemedBy: code.redeemedBy || '',
      redeemedAt: code.redeemedAt || '',
    });
  });

  // Ensure exports folder exists
  const exportDir = path.join(__dirname);
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }

  const exportPath = path.join(exportDir, 'reward_codes.xlsx');
  await workbook.xlsx.writeFile(exportPath);

  return exportPath;
};

module.exports = exportRewardCodesToExcel;