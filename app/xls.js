import xlsx from "xlsx";

// Sheet tab name
const SHEET = 'Sheet1';
// The sheet data and table information
const WORKSHEET_DATA = [
  { Name: "Hello", Age: 25 },
  { Name: "world", Age: 30 },
];

// Setup new workbook
const workbook = xlsx.utils.book_new();
// Convert to the sheet data json to sheet information
const worksheet = xlsx.utils.json_to_sheet(WORKSHEET_DATA);

// Setup the  workbeek and sheet information on a specific tab
// TODO: This can be a class but we hardcode this to overwrite the last one on the same tab
xlsx.utils.book_append_sheet(workbook, worksheet, SHEET);

// file buffer that we will make the actual file
const xlsFileBuffer = xlsx.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
});

// FUNCTIONS

async function parseSheet(url) {
    const response = await fetch(fileURL);
    const fileBuffer = await response.buffer();
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    return parsedData = xlsx.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]]
    );
}

export {
    // static generate xls sheet buffer
    xlsFileBuffer,
    // constants
    WORKSHEET_DATA,
    // functions
    parseSheet
}