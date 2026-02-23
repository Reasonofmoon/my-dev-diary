
import { LinkItem } from '../types';

/**
 * Service to handle data persistence to Google Sheets
 * Requires a Google Apps Script Web App URL
 */
export const syncToSheets = async (url: string, links: LinkItem[]): Promise<boolean> => {
  if (!url) return false;
  
  try {
    // We utilize 'text/plain' to avoid CORS preflight checks (OPTIONS request) issues with GAS web apps.
    // This allows us to actually read the response instead of using 'no-cors'.
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain', 
      },
      body: JSON.stringify({
        action: 'push',
        data: links
      }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    return text === "Success";
  } catch (error) {
    console.error('Cloud Sync Error:', error);
    return false;
  }
};

export const fetchFromSheets = async (url: string): Promise<LinkItem[] | null> => {
  if (!url) return null;
  
  try {
    const response = await fetch(`${url}?action=pull`);
    const result = await response.json();
    return result.data as LinkItem[];
  } catch (error) {
    console.error('Cloud Fetch Error:', error);
    return null;
  }
};

export const APPS_SCRIPT_TEMPLATE = `function doGet(e) {
  var action = e.parameter.action;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  
  if (action === 'pull') {
    var range = sheet.getDataRange();
    var values = range.getValues();
    if (values.length <= 1 || (values.length === 1 && values[0][0] === "")) {
      return ContentService.createTextOutput(JSON.stringify({ data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var headers = values[0];
    var data = [];
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      var item = {};
      for (var j = 0; j < headers.length; j++) {
        item[headers[j]] = row[j];
      }
      data.push(item);
    }
    return ContentService.createTextOutput(JSON.stringify({ data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    // When sent as text/plain, the data is in e.postData.contents
    var content = e.postData.contents;
    var params = JSON.parse(content);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];
    
    if (params.action === 'push') {
      sheet.clear();
      var data = params.data;
      if (data && data.length > 0) {
        var headers = Object.keys(data[0]);
        sheet.appendRow(headers);
        var rows = data.map(function(item) {
          return headers.map(function(h) { return item[h]; });
        });
        sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      }
      return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
    }
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}`;
