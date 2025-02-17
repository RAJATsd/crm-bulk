// api/src/utils/csvParser.js
const { parse } = require("csv-parse");
const { Readable } = require("stream");

async function parseCsv(buffer) {
  const records = [];

  const parser = parse({
    delimiter: ",",
    skip_empty_lines: true,
  });

  return new Promise((resolve, reject) => {
    const rows = [];

    Readable.from(buffer)
      .pipe(parser)
      .on("data", (row) => rows.push(row))
      .on("end", () => {
        for (const row of rows) {
          const [entity, action, phoneNumber, ...fieldPairs] = row;

          if (!entity || !action || !phoneNumber) {
            continue;
          }

          const fields = {};
          for (let i = 0; i < fieldPairs.length; i += 2) {
            if (fieldPairs[i] && fieldPairs[i + 1]) {
              fields[fieldPairs[i].trim()] = fieldPairs[i + 1].trim();
            }
          }

          records.push({
            entity: entity.toLowerCase().trim(),
            action: action.toLowerCase().trim(),
            phoneNumber: phoneNumber.trim(),
            fields,
          });
        }
        resolve(records);
      })
      .on("error", reject);
  });
}

module.exports = { parseCsv };
