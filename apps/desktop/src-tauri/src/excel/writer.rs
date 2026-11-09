use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::{BufReader, BufWriter, Read, Write};
use std::path::Path;
use zip::write::SimpleFileOptions;
use zip::{ZipArchive, ZipWriter};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppendRowResultDto {
    pub success: bool,
    pub file_path: String,
    pub sheet_name: String,
    pub row_number: usize,
    pub backup_path: String,
    pub message: String,
}

pub struct ExcelWriter;

impl ExcelWriter {
    pub fn append_row(
        file_path_str: &str,
        sheet_name: &str,
        column_values: &HashMap<usize, String>,
        backup_dir: &Path,
    ) -> Result<AppendRowResultDto, String> {
        let path = Path::new(file_path_str);
        if !path.exists() {
            return Err(format!("Excel file does not exist: {}", file_path_str));
        }

        // 1. Pre-flight check: Can we open the file for writing?
        match File::options().read(true).write(true).open(path) {
            Ok(_) => (),
            Err(e) => {
                return Err(format!(
                    "The Excel file is currently locked or in use. Please save and close the file in Microsoft Excel or other editors, then retry. Details: {}",
                    e
                ));
            }
        }

        // 2. Automated Backup before write
        let now = chrono::Utc::now().format("%Y%m%d_%H%M%S");
        let file_stem = path.file_stem().and_then(|s| s.to_str()).unwrap_or("workbook");
        let backup_filename = format!("{}_{}.bak.xlsx", file_stem, now);
        let backup_path = backup_dir.join(backup_filename);

        fs::create_dir_all(backup_dir).map_err(|e| format!("Failed to create backup directory: {}", e))?;
        fs::copy(path, &backup_path).map_err(|e| format!("Failed to create backup copy of Excel file: {}", e))?;

        // 3. Open ZIP Archive
        let file = File::open(path).map_err(|e| format!("Failed to open file: {}", e))?;
        let mut archive = ZipArchive::new(BufReader::new(file)).map_err(|e| format!("Invalid XLSX file (corrupt zip): {}", e))?;

        // 4. Resolve target worksheet path (e.g., xl/worksheets/sheet1.xml)
        let target_sheet_file = Self::find_sheet_xml_path(&mut archive, sheet_name)?;

        // 5. Read all files and process the target sheet
        let temp_path = path.with_extension("xlsx.tmp");
        let temp_file = File::create(&temp_path).map_err(|e| format!("Failed to create temporary output file: {}", e))?;
        let mut zip_writer = ZipWriter::new(BufWriter::new(temp_file));

        let mut appended_row_number = 1;

        let num_files = archive.len();
        for i in 0..num_files {
            let mut zip_file = archive.by_index(i).map_err(|e| format!("Failed to read archive entry: {}", e))?;
            let name = zip_file.name().map_err(|e| format!("Failed to read entry name: {}", e))?.to_string();

            let options = SimpleFileOptions::default()
                .compression_method(zip_file.compression())
                .unix_permissions(zip_file.unix_mode().unwrap_or(0o644));

            zip_writer.start_file(&name, options).map_err(|e| format!("Failed to start zip file entry: {}", e))?;

            if name == target_sheet_file {
                let mut content = String::new();
                zip_file.read_to_string(&mut content).map_err(|e| format!("Failed to read sheet content: {}", e))?;

                let (modified_xml, row_num) = Self::append_row_to_sheet_xml(&content, column_values)?;
                appended_row_number = row_num;
                zip_writer.write_all(modified_xml.as_bytes()).map_err(|e| format!("Failed to write sheet content: {}", e))?;
            } else {
                let mut buffer = Vec::new();
                zip_file.read_to_end(&mut buffer).map_err(|e| format!("Failed to read entry {}: {}", name, e))?;
                zip_writer.write_all(&buffer).map_err(|e| format!("Failed to write entry {}: {}", name, e))?;
            }
        }

        zip_writer.finish().map_err(|e| format!("Failed to finalize updated XLSX file: {}", e))?;

        // 6. Atomically replace original file with temp file
        if let Err(e) = fs::rename(&temp_path, path) {
            // Attempt fallback copy if rename across mount fails
            if fs::copy(&temp_path, path).is_ok() {
                let _ = fs::remove_file(&temp_path);
            } else {
                return Err(format!("Failed to atomically replace original Excel file: {}", e));
            }
        }

        Ok(AppendRowResultDto {
            success: true,
            file_path: file_path_str.to_string(),
            sheet_name: sheet_name.to_string(),
            row_number: appended_row_number,
            backup_path: backup_path.to_string_lossy().to_string(),
            message: format!("Successfully appended row {} to sheet '{}'.", appended_row_number, sheet_name),
        })
    }

    fn find_sheet_xml_path<R: Read + std::io::Seek>(archive: &mut ZipArchive<R>, sheet_name: &str) -> Result<String, String> {
        // Read workbook.xml to match sheet name to rId or sheetId
        let mut workbook_xml = String::new();
        if let Ok(mut wb_file) = archive.by_name("xl/workbook.xml") {
            let _ = wb_file.read_to_string(&mut workbook_xml);
        }

        // Extract relation id or index for the sheet
        // <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
        let pattern = format!(r#"(?i)<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)""#);
        if let Ok(re) = Regex::new(&pattern) {
            let mut rel_id = String::new();
            for cap in re.captures_iter(&workbook_xml) {
                if cap[1].eq_ignore_ascii_case(sheet_name) {
                    rel_id = cap[2].to_string();
                    break;
                }
            }

            if !rel_id.is_empty() {
                // Look up in xl/_rels/workbook.xml.rels
                if let Ok(mut rels_file) = archive.by_name("xl/_rels/workbook.xml.rels") {
                    let mut rels_xml = String::new();
                    let _ = rels_file.read_to_string(&mut rels_xml);

                    let rel_pattern = format!(r#"(?i)<Relationship[^>]*Id="{}"[^>]*Target="([^"]+)""#, regex::escape(&rel_id));
                    if let Ok(rel_re) = Regex::new(&rel_pattern) {
                        if let Some(target_cap) = rel_re.captures(&rels_xml) {
                            let target = &target_cap[1];
                            let sheet_path = if target.starts_with('/') {
                                target.trim_start_matches('/').to_string()
                            } else if target.starts_with("worksheets/") {
                                format!("xl/{}", target)
                            } else {
                                target.to_string()
                            };
                            return Ok(sheet_path);
                        }
                    }
                }
            }
        }

        // Fallback: Check standard names
        let standard_candidates = [
            "xl/worksheets/sheet1.xml",
            "xl/worksheets/sheet2.xml",
            "xl/worksheets/sheet3.xml",
        ];

        for cand in standard_candidates {
            if archive.by_name(cand).is_ok() {
                return Ok(cand.to_string());
            }
        }

        Err(format!("Could not locate worksheet '{}' in the workbook.", sheet_name))
    }

    fn append_row_to_sheet_xml(sheet_xml: &str, values: &HashMap<usize, String>) -> Result<(String, usize), String> {
        let sheet_data_close = "</sheetData>";
        let close_pos = sheet_xml.find(sheet_data_close)
            .ok_or_else(|| "Invalid worksheet XML: missing </sheetData> tag.".to_string())?;

        // Find highest existing row number
        let row_re = Regex::new(r#"<row[^>]*\br="(\d+)""#).unwrap();
        let mut max_row: usize = 0;
        for cap in row_re.captures_iter(sheet_xml) {
            if let Ok(r) = cap[1].parse::<usize>() {
                if r > max_row {
                    max_row = r;
                }
            }
        }

        let next_row = if max_row == 0 { 1 } else { max_row + 1 };

        // Construct <row r="{next_row}">...cells...</row>
        let mut row_xml = format!("<row r=\"{}\">", next_row);

        // Sort column indices to write in ascending order
        let mut sorted_cols: Vec<usize> = values.keys().cloned().collect();
        sorted_cols.sort_unstable();

        for col_idx in sorted_cols {
            if let Some(val) = values.get(&col_idx) {
                let col_letters = Self::col_index_to_letters(col_idx);
                let cell_ref = format!("{}{}", col_letters, next_row);
                let escaped_val = Self::escape_xml(val);

                row_xml.push_str(&format!(
                    r#"<c r="{}" t="inlineStr"><is><t>{}</t></is></c>"#,
                    cell_ref, escaped_val
                ));
            }
        }
        row_xml.push_str("</row>");

        // Insert new row before </sheetData>
        let mut modified = String::with_capacity(sheet_xml.len() + row_xml.len() + 100);
        modified.push_str(&sheet_xml[..close_pos]);
        modified.push_str(&row_xml);
        modified.push_str(&sheet_xml[close_pos..]);

        // Expand dimension if present: <dimension ref="A1:Z50"/>
        let dim_re = Regex::new(r#"<dimension\s+ref="([A-Z]+)(\d+):([A-Z]+)(\d+)""#).unwrap();
        let final_xml = if let Some(dim_cap) = dim_re.captures(&modified) {
            let start_col = &dim_cap[1];
            let start_row = &dim_cap[2];
            let end_col = &dim_cap[3];
            let current_end_row: usize = dim_cap[4].parse().unwrap_or(0);

            if next_row > current_end_row {
                let new_dim = format!(r#"<dimension ref="{}{}:{}{}""#, start_col, start_row, end_col, next_row);
                dim_re.replace(&modified, new_dim.as_str()).to_string()
            } else {
                modified
            }
        } else {
            modified
        };

        Ok((final_xml, next_row))
    }

    fn col_index_to_letters(mut col: usize) -> String {
        let mut s = String::new();
        loop {
            let rem = col % 26;
            s.insert(0, (b'A' + rem as u8) as char);
            if col < 26 {
                break;
            }
            col = (col / 26) - 1;
        }
        s
    }

    fn escape_xml(input: &str) -> String {
        input
            .replace('&', "&amp;")
            .replace('<', "&lt;")
            .replace('>', "&gt;")
            .replace('"', "&quot;")
            .replace('\'', "&apos;")
    }
}
