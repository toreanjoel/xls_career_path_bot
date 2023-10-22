import xlsx from "xlsx";
import fetch from "node-fetch";
// Sheet tab name
const SHEET = "Sheet1";

// FUNCTIONS
function createSheetDownloadable(data) {
  // Setup new workbook
  const workbook = xlsx.utils.book_new();

	if (Array.isArray(data)) {
		const worksheet = xlsx.utils.json_to_sheet(data);
	
		// Setup the  workbeek and sheet information on a specific tab
		xlsx.utils.book_append_sheet(workbook, worksheet, SHEET);
	
		// file buffer that we will make the actual file
		const xlsFileBuffer = xlsx.write(workbook, {
			type: "buffer",
			bookType: "xlsx",
		});
	
		return xlsFileBuffer;
	}

	return false
}

// Parse the data of a file uplaoded to get the json definition
async function parseSheet(url) {
  const response = await fetch(url);
  const fileBuffer = await response.arrayBuffer();
  const workbook = xlsx.read(fileBuffer, { type: "buffer" });
  return xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
}

export {
  // functions
  parseSheet,
  createSheetDownloadable,
};
