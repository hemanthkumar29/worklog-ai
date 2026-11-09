use calamine::{open_workbook_auto, Data, Reader};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::File;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SheetInfoDto {
    pub name: String,
    pub row_count: usize,
    pub column_count: usize,
    pub headers: Vec<String>,
    pub header_row_index: usize, // 1-based index
    pub sample_rows: Vec<HashMap<String, String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkbookInspectionDto {
    pub file_path: String,
    pub file_name: String,
    pub sheets: Vec<SheetInfoDto>,
    pub default_sheet: Option<String>,
    pub is_locked: bool,
    pub file_size_bytes: u64,
    pub last_modified: String,
}

pub struct ExcelInspector;

impl ExcelInspector {
    pub fn inspect(path_str: &str) -> Result<WorkbookInspectionDto, String> {
        let path = Path::new(path_str);
        if !path.exists() {
            return Err(format!("File does not exist at: {}", path_str));
        }

        let metadata = std::fs::metadata(path).map_err(|e| format!("Failed to read file metadata: {}", e))?;
        let file_size_bytes = metadata.len();
        let last_modified = metadata
            .modified()
            .map(|t| chrono::DateTime::<chrono::Utc>::from(t).to_rfc3339())
            .unwrap_or_else(|_| chrono::Utc::now().to_rfc3339());

        let file_name = path
            .file_name()
            .map(|f| f.to_string_lossy().to_string())
            .unwrap_or_else(|| "workbook.xlsx".to_string());

        // Check file lock / accessibility
        let is_locked = match File::options().read(true).write(true).open(path) {
            Ok(_) => false,
            Err(_) => true,
        };

        let mut workbook = open_workbook_auto(path).map_err(|e| format!("Failed to open Excel workbook: {}", e))?;
        let sheet_names = workbook.sheet_names().to_vec();

        let mut sheets = Vec::new();
        for name in &sheet_names {
            if let Ok(range) = workbook.worksheet_range(name) {
                let row_count = range.height();
                let column_count = range.width();

                // Find header row (first non-empty row)
                let mut header_row_index = 1;
                let mut headers = Vec::new();

                for r in 0..row_count {
                    let non_empty_count = (0..column_count)
                        .filter(|&c| !matches!(range.get((r, c)), Some(Data::Empty) | None))
                        .count();

                    if non_empty_count > 0 {
                        header_row_index = r + 1; // 1-based
                        for c in 0..column_count {
                            let cell_val = range.get((r, c)).map(|d| d.to_string()).unwrap_or_default();
                            headers.push(cell_val.trim().to_string());
                        }
                        break;
                    }
                }

                // Sample up to 3 data rows
                let mut sample_rows = Vec::new();
                let start_data_row = header_row_index; // 0-based index of next row
                for r in start_data_row..std::cmp::min(start_data_row + 3, row_count) {
                    let mut row_map = HashMap::new();
                    for (c_idx, h) in headers.iter().enumerate() {
                        if !h.is_empty() {
                            let val = range.get((r, c_idx)).map(|d| d.to_string()).unwrap_or_default();
                            row_map.insert(h.clone(), val);
                        }
                    }
                    if !row_map.is_empty() {
                        sample_rows.push(row_map);
                    }
                }

                sheets.push(SheetInfoDto {
                    name: name.clone(),
                    row_count,
                    column_count,
                    headers,
                    header_row_index,
                    sample_rows,
                });
            }
        }

        let default_sheet = sheets.first().map(|s| s.name.clone());

        Ok(WorkbookInspectionDto {
            file_path: path_str.to_string(),
            file_name,
            sheets,
            default_sheet,
            is_locked,
            file_size_bytes,
            last_modified,
        })
    }
}
