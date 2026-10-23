/**
 * Food & Chill 3D – danh sách người tham gia chơi, lưu bằng Google Sheets.
 *
 * Cách dùng:
 * 1. Tạo một Google Sheet mới, đặt tên tuỳ ý (vd: "Food & Chill – Người chơi").
 * 2. Menu Tiện ích mở rộng → Apps Script, xoá code mẫu, dán toàn bộ file này vào, bấm Lưu.
 * 3. Bấm Triển khai → Tùy chọn triển khai mới → Loại: Ứng dụng web.
 *    - Thực thi với tư cách: Tôi
 *    - Người có quyền truy cập: Bất kỳ ai
 *    Bấm Triển khai, cấp quyền, rồi sao chép URL Ứng dụng web (đuôi /exec).
 * 4. Mở index.html, tìm dòng  const PLAYER_API='';  và dán URL vào giữa hai dấu nháy.
 * 5. Đẩy lại lên GitHub; Vercel tự cập nhật.
 *
 * Sheet sẽ tự tạo 2 trang tính:
 *  - "NguoiChoi": mỗi học sinh một dòng, luôn là tiến độ mới nhất
 *    (họ tên, lớp, số sao, nhiệm vụ đã xong, đánh bại Quang Bảnh, biết bí mật, xu, thú cưng,
 *    số quà gacha, số lần vào chơi, lần đầu và lần cuối).
 *  - "LuotVao": mỗi lần vào chơi ghi thêm một dòng (thời gian, họ tên, lớp).
 *
 * Sửa code sau khi đã triển khai: dán đè code mới, rồi Triển khai → Quản lý bản triển khai →
 * chọn bản đang dùng → Chỉnh sửa → Phiên bản: Mới → Triển khai (giữ nguyên URL).
 */
const SHEET = 'NguoiChoi';
const LOGS = 'LuotVao';
const HEAD = ['id', 'Họ tên', 'Lớp', 'Số sao (/4)', 'Nhiệm vụ đã xong', 'Đánh bại Quang Bảnh',
  'Biết bí mật', 'Xu Chill', 'Thú cưng', 'Số quà gacha', 'Số lần vào chơi', 'Lần đầu', 'Lần cuối'];

function sheet_(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, header.length).setFontWeight('bold');
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const values = sheet_(SHEET, HEAD).getDataRange().getValues();
  const rows = values.slice(1).filter(r => r[0]).map(r => ({
    name: r[1], cls: r[2], stars: r[3], boss: r[5] === 'Có', secret: r[6] === 'Có', coins: r[7]
  }));
  return json_({ rows: rows });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (!d.id || !d.name) return json_({ ok: false });
    const clean = (v, n) => String(v == null ? '' : v).slice(0, n || 60);
    const num = (v, max) => Math.max(0, Math.min(max, Number(v) || 0));
    const now = new Date();

    const sh = sheet_(SHEET, HEAD);
    const ids = sh.getRange(1, 1, Math.max(1, sh.getLastRow()), 1).getValues().map(r => String(r[0]));
    const at = ids.indexOf(clean(d.id));
    const old = at > 0 ? sh.getRange(at + 1, 1, 1, HEAD.length).getValues()[0] : null;

    if (d.type === 'login') {
      sheet_(LOGS, ['Thời gian', 'Họ tên', 'Lớp', 'id']).appendRow([now, clean(d.name), clean(d.cls), clean(d.id)]);
      if (old) {
        sh.getRange(at + 1, 2, 1, 2).setValues([[clean(d.name), clean(d.cls)]]);
        sh.getRange(at + 1, 11).setValue((Number(old[10]) || 0) + 1);
        sh.getRange(at + 1, 13).setValue(now);
      } else {
        sh.appendRow([clean(d.id), clean(d.name), clean(d.cls), 0, '', '', '', 0, '', 0, 1, now, now]);
      }
      return json_({ ok: true });
    }

    const row = [
      clean(d.id), clean(d.name), clean(d.cls),
      num(d.stars, 4), clean(d.missions, 200),
      d.boss ? 'Có' : '', d.secret ? 'Có' : '',
      num(d.coins, 100000), clean(d.pets, 200), num(d.prizes, 99),
      old ? (Number(old[10]) || 1) : 1, old ? old[11] : now, now
    ];
    if (old) sh.getRange(at + 1, 1, 1, HEAD.length).setValues([row]);
    else sh.appendRow(row);
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}
