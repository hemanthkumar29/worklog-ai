use app_lib::excel::{ExcelInspector, ExcelWriter};
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::Write;
use zip::write::SimpleFileOptions;
use zip::ZipWriter;

fn create_test_xlsx(path: &std::path::Path) {
    let file = File::create(path).unwrap();
    let mut zip = ZipWriter::new(file);

    let options = SimpleFileOptions::default();

    // 1. [Content_Types].xml
    zip.start_file("[Content_Types].xml", options).unwrap();
    zip.write_all(br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
    <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>"#).unwrap();

    // 2. _rels/.rels
    zip.start_file("_rels/.rels", options).unwrap();
    zip.write_all(br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>"#).unwrap();

    // 3. xl/workbook.xml
    zip.start_file("xl/workbook.xml", options).unwrap();
    zip.write_all(br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <sheets>
        <sheet name="Timesheet" sheetId="1" r:id="rId1"/>
    </sheets>
</workbook>"#).unwrap();

    // 4. xl/_rels/workbook.xml.rels
    zip.start_file("xl/_rels/workbook.xml.rels", options).unwrap();
    zip.write_all(br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>"#).unwrap();

    // 5. xl/worksheets/sheet1.xml with header row
    zip.start_file("xl/worksheets/sheet1.xml", options).unwrap();
    zip.write_all(br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
    <dimension ref="A1:D1"/>
    <sheetData>
        <row r="1">
            <c r="A1" t="inlineStr"><is><t>Work Date</t></is></c>
            <c r="B1" t="inlineStr"><is><t>Project Name</t></is></c>
            <c r="C1" t="inlineStr"><is><t>Activity Title</t></is></c>
            <c r="D1" t="inlineStr"><is><t>Work Details</t></is></c>
        </row>
    </sheetData>
</worksheet>"#).unwrap();

    zip.finish().unwrap();
}

#[test]
fn test_safe_excel_append_and_backup() {
    let test_dir = std::env::temp_dir().join(format!("worklog_test_{}", uuid::Uuid::new_v4()));
    fs::create_dir_all(&test_dir).unwrap();
    let xlsx_path = test_dir.join("Company_WorkLog.xlsx");
    let backup_dir = test_dir.join("backups");

    // 1. Create initial workbook
    create_test_xlsx(&xlsx_path);

    // 2. Inspect initial workbook
    let initial_inspection = ExcelInspector::inspect(xlsx_path.to_str().unwrap()).unwrap();
    assert_eq!(initial_inspection.sheets.len(), 1);
    assert_eq!(initial_inspection.sheets[0].name, "Timesheet");
    assert_eq!(initial_inspection.sheets[0].headers, vec!["Work Date", "Project Name", "Activity Title", "Work Details"]);

    // 3. Append Row 1
    let mut row1 = HashMap::new();
    row1.insert(0, "2026-11-09".to_string());
    row1.insert(1, "Salesforce Integration".to_string());
    row1.insert(2, "Duplicate Rules Investigation".to_string());
    row1.insert(3, "Researched and tested account duplicate prevention.".to_string());

    let result1 = ExcelWriter::append_row(
        xlsx_path.to_str().unwrap(),
        "Timesheet",
        &row1,
        &backup_dir,
    ).expect("Append row 1 should succeed");

    assert!(result1.success);
    assert_eq!(result1.row_number, 2);
    assert!(std::path::Path::new(&result1.backup_path).exists(), "Backup file must exist");

    // 4. Append Row 2
    let mut row2 = HashMap::new();
    row2.insert(0, "2026-11-10".to_string());
    row2.insert(1, "Salesforce Integration".to_string());
    row2.insert(2, "Flow Trigger Bug Fix".to_string());
    row2.insert(3, "Patched record-triggered flow detecting duplicate accounts.".to_string());

    let result2 = ExcelWriter::append_row(
        xlsx_path.to_str().unwrap(),
        "Timesheet",
        &row2,
        &backup_dir,
    ).expect("Append row 2 should succeed");

    assert!(result2.success);
    assert_eq!(result2.row_number, 3);

    // 5. Inspect modified file using ExcelInspector
    let updated_inspection = ExcelInspector::inspect(xlsx_path.to_str().unwrap()).unwrap();
    assert_eq!(updated_inspection.sheets[0].row_count, 3); // 1 header + 2 appended rows

    // Clean up
    let _ = fs::remove_dir_all(&test_dir);
}
