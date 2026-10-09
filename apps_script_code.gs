// =========================================================================
// GOOGLE APPS SCRIPT - DATA SANTRI QIRAATI CABANG SURABAYA
// =========================================================================

// MENU OTOMATIS: Muncul langsung di menu atas Google Spreadsheet saat dibuka!
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu("⚙️ Sistem Qiraati")
      .addItem("🚀 Sinkronkan & Buat Semua Sheet Lengkap", "setupAwalSpreadsheet")
      .addToUi();
  } catch(e) {}
}

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = e.parameter.action;
  
  // Otomatis pastikan semua sheet siap saat web dibuka
  setupAwalSpreadsheet();
  
  // 1. ENDPOINT GET DATA (Untuk Statistik, Data Terdaftar, & Kenaikan)
  if (action === 'getData') {
    // A. Membaca Sheet Santri
    const sheetSantri = ss.getSheetByName("Santri");
    let santriList = [];
    if (sheetSantri && sheetSantri.getLastRow() > 1) {
      const vals = sheetSantri.getDataRange().getValues();
      const headers = vals[0];
      for (let i = 1; i < vals.length; i++) {
        let obj = {};
        for (let j = 0; j < headers.length; j++) {
          let h = headers[j];
          let val = vals[i][j];
          if (val instanceof Date) {
            val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
          }
          obj[h] = val;
        }
        santriList.push(obj);
      }
    }
    
    // B. Membaca Sheet Guru
    const sheetGuru = ss.getSheetByName("Guru");
    let guruList = [];
    if (sheetGuru && sheetGuru.getLastRow() > 1) {
      const vals = sheetGuru.getDataRange().getValues();
      const headers = vals[0];
      for (let i = 1; i < vals.length; i++) {
        let obj = {};
        for (let j = 0; j < headers.length; j++) {
          let h = headers[j];
          let val = vals[i][j];
          if (val instanceof Date) {
            val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
          }
          obj[h] = val;
        }
        guruList.push(obj);
      }
    }

    // C. Membaca Sheet Kenaikan
    const sheetKenaikan = ss.getSheetByName("Kenaikan");
    let kenaikanList = [];
    if (sheetKenaikan && sheetKenaikan.getLastRow() > 1) {
      const vals = sheetKenaikan.getDataRange().getValues();
      const headers = vals[0];
      for (let i = 1; i < vals.length; i++) {
        let obj = {};
        for (let j = 0; j < headers.length; j++) {
          let h = headers[j];
          let val = vals[i][j];
          if (val instanceof Date) {
            val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
          }
          obj[h] = val;
        }
        kenaikanList.push(obj);
      }
    }

    // D. Membaca Sheet DataSantri (Rekap Bulanan Lama / Kompatibilitas)
    const sheetData = ss.getSheetByName("DataSantri");
    let dataList = [];
    if (sheetData && sheetData.getLastRow() > 1) {
      const dataValues = sheetData.getDataRange().getValues();
      const headers = dataValues[0];
      for (let i = 1; i < dataValues.length; i++) {
        let obj = {};
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = dataValues[i][j];
        }
        dataList.push(obj);
      }
    }
    
    // E. Membaca Sheet Users (Daftar Akun Lembaga & Admin)
    const sheetUsers = ss.getSheetByName("Users");
    let usersList = [];
    if (sheetUsers && sheetUsers.getLastRow() > 1) {
      const userValues = sheetUsers.getDataRange().getValues();
      for (let i = 1; i < userValues.length; i++) {
        usersList.push({
          username: String(userValues[i][0]).toLowerCase().trim(),
          password: String(userValues[i][1]).trim(),
          nama: String(userValues[i][2]).trim(),
          kecamatan: String(userValues[i][3]).trim(),
          role: String(userValues[i][4] || 'Lembaga').trim()
        });
      }
    }
    
    // F. Membaca Sheet Korcam / Kecamatan (Opsional)
    const sheetKec = ss.getSheetByName("Kecamatan");
    let korcamMap = {};
    if (sheetKec && sheetKec.getLastRow() > 1) {
      const kecValues = sheetKec.getDataRange().getValues();
      for (let i = 1; i < kecValues.length; i++) {
        const namaKec = String(kecValues[i][0]).trim();
        korcamMap[namaKec] = {
          alamat: String(kecValues[i][1] || '').trim(),
          sekretaris: String(kecValues[i][2] || '').trim(),
          kontak: String(kecValues[i][3] || '').trim()
        };
      }
    }
    
    // Pemetaan TPQ resmi per Kecamatan
    let tpqByKec = {};
    usersList.forEach(u => {
      const roleLower = (u.role || '').toLowerCase();
      if (roleLower !== 'admin') {
        if (!tpqByKec[u.kecamatan]) tpqByKec[u.kecamatan] = [];
        if (!tpqByKec[u.kecamatan].includes(u.nama)) {
          tpqByKec[u.kecamatan].push(u.nama);
        }
      }
    });

    // G. Membaca Sheet Mutasi (Mutasi Santri & Ustadzah)
    const sheetMutasi = ss.getSheetByName("Mutasi");
    let mutasiList = [];
    if (sheetMutasi && sheetMutasi.getLastRow() > 1) {
      const vals = sheetMutasi.getDataRange().getValues();
      const headers = vals[0];
      for (let i = 1; i < vals.length; i++) {
        let obj = {};
        for (let j = 0; j < headers.length; j++) {
          let h = headers[j];
          let val = vals[i][j];
          if (val instanceof Date) {
            val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
          }
          obj[h] = val;
        }
        mutasiList.push(obj);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      santri: santriList,
      guru: guruList,
      kenaikan: kenaikanList,
      mutasi: mutasiList,
      data: dataList,
      users: usersList,
      tpqByKecamatan: tpqByKec,
      korcam: korcamMap
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // 2. ENDPOINT LOGIN
  if (action === 'login') {
    const sheetUsers = ss.getSheetByName("Users");
    const user = String(e.parameter.username || '').toLowerCase().trim();
    const pass = String(e.parameter.password || '').trim();
    
    if (sheetUsers && sheetUsers.getLastRow() > 1) {
      const data = sheetUsers.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        const uSheet = String(data[i][0]).toLowerCase().trim();
        const pSheet = String(data[i][1]).trim();
        if (uSheet === user && pSheet === pass) {
          return ContentService.createTextOutput(JSON.stringify({
            status: 'success', 
            user: {
              username: data[i][0],
              nama: data[i][2],
              kecamatan: data[i][3],
              role: data[i][4] || 'Lembaga'
            }
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error', 
      message: 'Username atau Password salah.'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 3. ENDPOINT POST SIMPAN DATA
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const rawData = e.postData.contents;
    const dataObj = JSON.parse(rawData);
    
    // A. INPUT DATA SANTRI BARU (SINGLE)
    if (dataObj.formType === 'santri') {
      let sheetSantri = ss.getSheetByName("Santri");
      if (!sheetSantri) {
        sheetSantri = ss.insertSheet("Santri");
        sheetSantri.appendRow(["ID", "Waktu Input", "Nama Santri", "L/P", "Tempat Lahir", "Tanggal Lahir", "NIS", "NISQ", "Jilid Sekarang", "Nama TPQ", "Kecamatan", "Status"]);
      }
      sheetSantri.appendRow([
        dataObj.id || ('S_' + Date.now()),
        new Date().toLocaleString('id-ID'),
        dataObj.nama,
        dataObj.gender,
        dataObj.tempatLahir || '',
        dataObj.tglLahir || '',
        dataObj.nis,
        dataObj.nisq || '',
        dataObj.jilidSekarang || dataObj.kelasAwal || 'Kls 1A',
        dataObj.namaTpq,
        dataObj.kecamatan,
        dataObj.status || 'Aktif'
      ]);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data santri baru berhasil disimpan'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // A2. EDIT DATA SANTRI
    if (dataObj.formType === 'editSantri') {
      let sheetSantri = ss.getSheetByName("Santri");
      if (sheetSantri && sheetSantri.getLastRow() > 1) {
        const vals = sheetSantri.getDataRange().getValues();
        for (let i = 1; i < vals.length; i++) {
          if ((dataObj.id && String(vals[i][0]) === String(dataObj.id)) || (dataObj.nis && String(vals[i][6]) === String(dataObj.nis))) {
            const rowIdx = i + 1;
            if (dataObj.nama !== undefined) sheetSantri.getRange(rowIdx, 3).setValue(dataObj.nama);
            if (dataObj.gender !== undefined) sheetSantri.getRange(rowIdx, 4).setValue(dataObj.gender);
            if (dataObj.tempatLahir !== undefined) sheetSantri.getRange(rowIdx, 5).setValue(dataObj.tempatLahir);
            if (dataObj.tglLahir !== undefined) sheetSantri.getRange(rowIdx, 6).setValue(dataObj.tglLahir);
            if (dataObj.nis !== undefined) sheetSantri.getRange(rowIdx, 7).setValue(dataObj.nis);
            if (dataObj.nisq !== undefined) sheetSantri.getRange(rowIdx, 8).setValue(dataObj.nisq);
            if (dataObj.jilidSekarang !== undefined) sheetSantri.getRange(rowIdx, 9).setValue(dataObj.jilidSekarang);
            if (dataObj.namaTpq !== undefined) sheetSantri.getRange(rowIdx, 10).setValue(dataObj.namaTpq);
            if (dataObj.kecamatan !== undefined) sheetSantri.getRange(rowIdx, 11).setValue(dataObj.kecamatan);
            if (dataObj.status !== undefined) sheetSantri.getRange(rowIdx, 12).setValue(dataObj.status);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data santri berhasil diperbarui'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // A3. TOGGLE STATUS SANTRI (AKTIF / NONAKTIF)
    if (dataObj.formType === 'statusSantri') {
      let sheetSantri = ss.getSheetByName("Santri");
      if (sheetSantri && sheetSantri.getLastRow() > 1) {
        const vals = sheetSantri.getDataRange().getValues();
        for (let i = 1; i < vals.length; i++) {
          if ((dataObj.id && String(vals[i][0]) === String(dataObj.id)) || (dataObj.nis && String(vals[i][6]) === String(dataObj.nis))) {
            sheetSantri.getRange(i + 1, 12).setValue(dataObj.status || 'Nonaktif');
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Status santri berhasil diubah'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // B. UPLOAD BATCH SANTRI BARU (EXCEL / CSV IMPORT)
    const santriBatchList = dataObj.santriList || dataObj.list || [];
    if (dataObj.formType === 'batchSantri' && Array.isArray(santriBatchList)) {
      let sheetSantri = ss.getSheetByName("Santri");
      if (!sheetSantri) {
        sheetSantri = ss.insertSheet("Santri");
        sheetSantri.appendRow(["ID", "Waktu Input", "Nama Santri", "L/P", "Tempat Lahir", "Tanggal Lahir", "NIS", "NISQ", "Jilid Sekarang", "Nama TPQ", "Kecamatan", "Status"]);
      }
      const nowStr = new Date().toLocaleString('id-ID');
      const rows = santriBatchList.map((item, idx) => [
        item.id || ('S_' + (Date.now() + idx)),
        nowStr,
        item.nama,
        item.gender || item['L/P'] || 'L',
        item.tempatLahir || item['Tempat Lahir'] || '',
        item.tglLahir || item['Tanggal Lahir'] || '',
        item.nis || item['NIS'] || '',
        item.nisq || item['NISQ'] || '',
        item.jilidSekarang || item['Jilid'] || item['Jilid / Kelas Awal'] || 'Kls 1A',
        dataObj.namaTpq || item.namaTpq || '',
        dataObj.kecamatan || item.kecamatan || '',
        item.status || 'Aktif'
      ]);
      if (rows.length > 0) {
        sheetSantri.getRange(sheetSantri.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: `${rows.length} Santri berhasil diimport`
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // C. INPUT DATA GURU (SINGLE)
    if (dataObj.formType === 'guru') {
      let sheetGuru = ss.getSheetByName("Guru");
      if (!sheetGuru) {
        sheetGuru = ss.insertSheet("Guru");
        sheetGuru.appendRow(["ID", "Waktu Input", "Nama Guru", "L/P", "Tempat Lahir", "Tanggal Lahir", "ID Guru Qiraati", "Mulai Mengajar", "Nama TPQ", "Kecamatan", "Status"]);
      }
      sheetGuru.appendRow([
        dataObj.id || ('G_' + Date.now()),
        new Date().toLocaleString('id-ID'),
        dataObj.nama,
        dataObj.gender,
        dataObj.tempatLahir || '',
        dataObj.tglLahir || '',
        dataObj.idGuru || '',
        dataObj.mulaiMengajar || '',
        dataObj.namaTpq,
        dataObj.kecamatan,
        dataObj.status || 'Aktif'
      ]);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data guru berhasil disimpan'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // C2. EDIT DATA GURU
    if (dataObj.formType === 'editGuru') {
      let sheetGuru = ss.getSheetByName("Guru");
      if (sheetGuru && sheetGuru.getLastRow() > 1) {
        const vals = sheetGuru.getDataRange().getValues();
        for (let i = 1; i < vals.length; i++) {
          if ((dataObj.id && String(vals[i][0]) === String(dataObj.id)) || (dataObj.idGuru && String(vals[i][6]) === String(dataObj.idGuru))) {
            const rowIdx = i + 1;
            if (dataObj.nama !== undefined) sheetGuru.getRange(rowIdx, 3).setValue(dataObj.nama);
            if (dataObj.gender !== undefined) sheetGuru.getRange(rowIdx, 4).setValue(dataObj.gender);
            if (dataObj.tempatLahir !== undefined) sheetGuru.getRange(rowIdx, 5).setValue(dataObj.tempatLahir);
            if (dataObj.tglLahir !== undefined) sheetGuru.getRange(rowIdx, 6).setValue(dataObj.tglLahir);
            if (dataObj.idGuru !== undefined) sheetGuru.getRange(rowIdx, 7).setValue(dataObj.idGuru);
            if (dataObj.mulaiMengajar !== undefined) sheetGuru.getRange(rowIdx, 8).setValue(dataObj.mulaiMengajar);
            if (dataObj.namaTpq !== undefined) sheetGuru.getRange(rowIdx, 9).setValue(dataObj.namaTpq);
            if (dataObj.kecamatan !== undefined) sheetGuru.getRange(rowIdx, 10).setValue(dataObj.kecamatan);
            if (dataObj.status !== undefined) sheetGuru.getRange(rowIdx, 11).setValue(dataObj.status);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data guru berhasil diperbarui'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // C3. TOGGLE STATUS GURU (AKTIF / NONAKTIF)
    if (dataObj.formType === 'statusGuru') {
      let sheetGuru = ss.getSheetByName("Guru");
      if (sheetGuru && sheetGuru.getLastRow() > 1) {
        const vals = sheetGuru.getDataRange().getValues();
        for (let i = 1; i < vals.length; i++) {
          if ((dataObj.id && String(vals[i][0]) === String(dataObj.id)) || (dataObj.idGuru && String(vals[i][6]) === String(dataObj.idGuru))) {
            sheetGuru.getRange(i + 1, 11).setValue(dataObj.status || 'Nonaktif');
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Status guru berhasil diubah'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // D. UPLOAD BATCH GURU (EXCEL / CSV IMPORT)
    const guruBatchList = dataObj.guruList || dataObj.list || [];
    if (dataObj.formType === 'batchGuru' && Array.isArray(guruBatchList)) {
      let sheetGuru = ss.getSheetByName("Guru");
      if (!sheetGuru) {
        sheetGuru = ss.insertSheet("Guru");
        sheetGuru.appendRow(["ID", "Waktu Input", "Nama Guru", "L/P", "Tempat Lahir", "Tanggal Lahir", "ID Guru Qiraati", "Mulai Mengajar", "Nama TPQ", "Kecamatan", "Status"]);
      }
      const nowStr = new Date().toLocaleString('id-ID');
      const rows = guruBatchList.map((item, idx) => [
        item.id || ('G_' + (Date.now() + idx)),
        nowStr,
        item.nama,
        item.gender || item['L/P'] || 'L',
        item.tempatLahir || item['Tempat Lahir'] || '',
        item.tglLahir || item['Tanggal Lahir'] || '',
        item.idGuru || item['ID Guru Qiraati'] || item['ID Guru'] || '',
        item.mulaiMengajar || item['Mulai Mengajar'] || '',
        dataObj.namaTpq || item.namaTpq || '',
        dataObj.kecamatan || item.kecamatan || '',
        item.status || 'Aktif'
      ]);
      if (rows.length > 0) {
        sheetGuru.getRange(sheetGuru.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: `${rows.length} Guru berhasil diimport`
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // E. INPUT KENAIKAN JILID SANTRI
    if (dataObj.formType === 'kenaikan') {
      let sheetKenaikan = ss.getSheetByName("Kenaikan");
      if (!sheetKenaikan) {
        sheetKenaikan = ss.insertSheet("Kenaikan");
        sheetKenaikan.appendRow(["ID", "Waktu Input", "NIS", "Nama Santri", "Jilid Lama", "Jilid Baru", "Tanggal Kenaikan", "Masa Tempuh (Hari)", "Nama TPQ", "Kecamatan", "Catatan"]);
      }
      sheetKenaikan.appendRow([
        dataObj.id || ('K_' + Date.now()),
        new Date().toLocaleString('id-ID'),
        dataObj.nis,
        dataObj.namaSantri,
        dataObj.jilidLama,
        dataObj.jilidBaru,
        dataObj.tanggal || dataObj.tglKenaikan,
        dataObj.masaTempuh || dataObj.masaTempuhHari || 0,
        dataObj.namaTpq,
        dataObj.kecamatan,
        dataObj.catatan || ''
      ]);

      // Update jilid sekarang di Sheet Santri jika ada
      let sheetSantri = ss.getSheetByName("Santri");
      if (sheetSantri && sheetSantri.getLastRow() > 1) {
        const vals = sheetSantri.getDataRange().getValues();
        for (let i = 1; i < vals.length; i++) {
          if (String(vals[i][6]).trim() === String(dataObj.nis).trim() || String(vals[i][2]).toLowerCase().trim() === String(dataObj.namaSantri).toLowerCase().trim()) {
            sheetSantri.getRange(i + 1, 9).setValue(dataObj.jilidBaru);
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Kenaikan jilid berhasil disimpan'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // E2. PENGAJUAN MUTASI SANTRI ATAU USTADZAH (DARI AKUN LEMBAGA)
    if (dataObj.formType === 'pengajuanMutasi') {
      let sheetMutasi = ss.getSheetByName("Mutasi");
      if (!sheetMutasi) {
        sheetMutasi = ss.insertSheet("Mutasi");
        sheetMutasi.appendRow(["ID Mutasi", "Waktu Pengajuan", "Kategori", "ID Anggota", "Nama", "L/P", "TPQ Asal", "Kecamatan Asal", "TPQ Tujuan", "Kecamatan Tujuan", "Tanggal Mutasi", "Alasan", "Status", "Tanggal Diproses", "Diproses Oleh", "Catatan"]);
      }
      sheetMutasi.appendRow([
        dataObj.id || ('MUT_' + Date.now()),
        new Date().toLocaleString('id-ID'),
        dataObj.kategori || 'Santri', // 'Santri' atau 'Ustadzah'
        dataObj.idAnggota || dataObj.nis || dataObj.idGuru || '',
        dataObj.nama,
        dataObj.gender || '',
        dataObj.tpqAsal,
        dataObj.kecamatanAsal,
        dataObj.tpqTujuan,
        dataObj.kecamatanTujuan,
        dataObj.tanggalMutasi || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
        dataObj.alasan || '',
        dataObj.status || 'Menunggu Persetujuan',
        '', // Tanggal Diproses
        '', // Diproses Oleh
        dataObj.catatan || ''
      ]);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Pengajuan mutasi berhasil dikirim'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // E3. PROSES PERSETUJUAN MUTASI (DISETUJUI / DITOLAK OLEH KORCAM / CABANG)
    if (dataObj.formType === 'prosesMutasi') {
      let sheetMutasi = ss.getSheetByName("Mutasi");
      if (sheetMutasi && sheetMutasi.getLastRow() > 1) {
        const vals = sheetMutasi.getDataRange().getValues();
        for (let i = 1; i < vals.length; i++) {
          if (String(vals[i][0]).trim() === String(dataObj.idMutasi).trim()) {
            const rowIdx = i + 1;
            const newStatus = dataObj.status; // 'Disetujui' atau 'Ditolak'
            const diprosesOleh = dataObj.diprosesOleh || 'Admin Cabang';
            const tglProses = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
            const catatan = dataObj.catatan || vals[i][15] || '';

            sheetMutasi.getRange(rowIdx, 13).setValue(newStatus);
            sheetMutasi.getRange(rowIdx, 14).setValue(tglProses);
            sheetMutasi.getRange(rowIdx, 15).setValue(diprosesOleh);
            if (dataObj.catatan) sheetMutasi.getRange(rowIdx, 16).setValue(catatan);

            // JIKA DISETUJUI, PINDAHKAN TPQ & KECAMATAN SANTRI / USTADZAH SECARA OTOMATIS!
            if (newStatus === 'Disetujui') {
              const kategori = String(vals[i][2]).trim(); // 'Santri' atau 'Ustadzah'
              const idAnggota = String(vals[i][3]).trim();
              const namaAnggota = String(vals[i][4]).trim().toLowerCase();
              const tpqTujuan = String(vals[i][8]).trim();
              const kecTujuan = String(vals[i][9]).trim();

              if (kategori.toLowerCase() === 'santri') {
                const sheetSantri = ss.getSheetByName("Santri");
                if (sheetSantri && sheetSantri.getLastRow() > 1) {
                  const sVals = sheetSantri.getDataRange().getValues();
                  for (let s = 1; s < sVals.length; s++) {
                    if ((idAnggota && (String(sVals[s][0]).trim() === idAnggota || String(sVals[s][6]).trim() === idAnggota)) ||
                        String(sVals[s][2]).trim().toLowerCase() === namaAnggota) {
                      sheetSantri.getRange(s + 1, 10).setValue(tpqTujuan);
                      sheetSantri.getRange(s + 1, 11).setValue(kecTujuan);
                      break;
                    }
                  }
                }
              } else if (kategori.toLowerCase() === 'ustadzah' || kategori.toLowerCase() === 'guru') {
                const sheetGuru = ss.getSheetByName("Guru");
                if (sheetGuru && sheetGuru.getLastRow() > 1) {
                  const gVals = sheetGuru.getDataRange().getValues();
                  for (let g = 1; g < gVals.length; g++) {
                    if ((idAnggota && (String(gVals[g][0]).trim() === idAnggota || String(gVals[g][6]).trim() === idAnggota)) ||
                        String(gVals[g][2]).trim().toLowerCase() === namaAnggota) {
                      sheetGuru.getRange(g + 1, 9).setValue(tpqTujuan);
                      sheetGuru.getRange(g + 1, 10).setValue(kecTujuan);
                      break;
                    }
                  }
                }
              }
            }
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Status mutasi berhasil diperbarui'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // F. DEFAULT / LAPORAN 24 KELAS
    let sheet = ss.getSheetByName("DataSantri");
    if (!sheet) {
      sheet = ss.insertSheet("DataSantri");
    }
    if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
      const headers = Object.keys(dataObj);
      sheet.appendRow(headers);
    }
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = headers.map(h => dataObj[h] !== undefined ? dataObj[h] : "");
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data berhasil disimpan'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error', 
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// =========================================================================
// FUNGSI SINKRONISASI & SETUP SPREADSHEET OTOMATIS
// =========================================================================
// Fungsi ini otomatis mengecek seluruh sheet yang ada di spreadsheet Anda,
// mempertahankan data yang sudah ada, dan secara otomatis membuatkan sheet/kolom
// yang belum lengkap tanpa menghapus data apa pun!
function setupAwalSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet "Users" (Manajemen Akun Login)
  let sheetUsers = ss.getSheetByName("Users");
  const headersUsers = ["Username", "Password", "Nama Lembaga", "Kecamatan", "Role"];
  if (!sheetUsers) {
    sheetUsers = ss.insertSheet("Users");
    sheetUsers.appendRow(headersUsers);
    sheetUsers.appendRow(["admin", "qiraati2026", "Pengurus Cabang Surabaya", "Semua", "Admin"]);
    sheetUsers.appendRow(["korcam_kenjeran", "qiraati123", "Koordinator Wilayah Kenjeran", "Kenjeran", "Korcam"]);
    sheetUsers.appendRow(["darulhaq", "qiraati123", "DARUL HAQ", "Kenjeran", "Lembaga"]);
    sheetUsers.appendRow(["alislami", "qiraati123", "AL ISLAMI", "Kenjeran", "Lembaga"]);
    sheetUsers.appendRow(["nabaussalam", "qiraati123", "NABAUSSALAM", "Kenjeran", "Lembaga"]);
  } else if (sheetUsers.getLastRow() === 0) {
    sheetUsers.appendRow(headersUsers);
    sheetUsers.appendRow(["admin", "qiraati2026", "Pengurus Cabang Surabaya", "Semua", "Admin"]);
    sheetUsers.appendRow(["korcam_kenjeran", "qiraati123", "Koordinator Wilayah Kenjeran", "Kenjeran", "Korcam"]);
  }
  formatHeaderSheet(sheetUsers, "#1e293b"); // Slate 900
  
  // 2. Sheet "Santri" (Buku Induk Data Santri Lengkap)
  let sheetSantri = ss.getSheetByName("Santri");
  const headersSantri = ["ID", "Waktu Input", "Nama Santri", "L/P", "Tempat Lahir", "Tanggal Lahir", "NIS", "NISQ", "Jilid Sekarang", "Nama TPQ", "Kecamatan", "Status"];
  if (!sheetSantri) {
    sheetSantri = ss.insertSheet("Santri");
    sheetSantri.appendRow(headersSantri);
  } else if (sheetSantri.getLastRow() === 0) {
    sheetSantri.appendRow(headersSantri);
  } else {
    // Pastikan kolom Status tersedia di baris 1
    if (sheetSantri.getLastColumn() < 12) {
      sheetSantri.getRange(1, 12).setValue("Status");
      const lastR = sheetSantri.getLastRow();
      for (let r = 2; r <= lastR; r++) {
        if (!sheetSantri.getRange(r, 12).getValue()) {
          sheetSantri.getRange(r, 12).setValue("Aktif");
        }
      }
    }
  }
  formatHeaderSheet(sheetSantri, "#d97706"); // Amber 600

  // 3. Sheet "Guru" (Buku Induk Data Pengajar)
  let sheetGuru = ss.getSheetByName("Guru");
  const headersGuru = ["ID", "Waktu Input", "Nama Guru", "L/P", "Tempat Lahir", "Tanggal Lahir", "ID Guru Qiraati", "Mulai Mengajar", "Nama TPQ", "Kecamatan", "Status"];
  if (!sheetGuru) {
    sheetGuru = ss.insertSheet("Guru");
    sheetGuru.appendRow(headersGuru);
  } else if (sheetGuru.getLastRow() === 0) {
    sheetGuru.appendRow(headersGuru);
  } else {
    // Pastikan kolom Status tersedia di baris 1
    if (sheetGuru.getLastColumn() < 11) {
      sheetGuru.getRange(1, 11).setValue("Status");
      const lastR = sheetGuru.getLastRow();
      for (let r = 2; r <= lastR; r++) {
        if (!sheetGuru.getRange(r, 11).getValue()) {
          sheetGuru.getRange(r, 11).setValue("Aktif");
        }
      }
    }
  }
  formatHeaderSheet(sheetGuru, "#4f46e5"); // Indigo 600

  // 4. Sheet "Kenaikan" (Riwayat Kenaikan Jilid Santri)
  let sheetKenaikan = ss.getSheetByName("Kenaikan");
  const headersKenaikan = ["ID", "Waktu Input", "NIS", "Nama Santri", "Jilid Lama", "Jilid Baru", "Tanggal Kenaikan", "Masa Tempuh (Hari)", "Nama TPQ", "Kecamatan", "Catatan"];
  if (!sheetKenaikan) {
    sheetKenaikan = ss.insertSheet("Kenaikan");
    sheetKenaikan.appendRow(headersKenaikan);
  } else if (sheetKenaikan.getLastRow() === 0) {
    sheetKenaikan.appendRow(headersKenaikan);
  }
  formatHeaderSheet(sheetKenaikan, "#059669"); // Emerald 600

  // 5. Sheet "DataSantri" (Rekap 24 Kelas Bulanan / Kompatibilitas)
  let sheetData = ss.getSheetByName("DataSantri");
  const headersData = [
    "id", "namaTpq", "kecamatan", "bulan", "jumlahGuru",
    "kelas1a", "kelas1b", "kelas1c", "kelas2a", "kelas2b",
    "kelas3a", "kelas3b", "kelas4a", "kelas4b", "kelas5a", "kelas5b",
    "persiapanImtas", "persiapanKhotaman",
    "praPtpt1", "praPtpt2", "praPtpt3", "praPtpt4", "praPtpt5",
    "ptpt1", "ptpt2", "ptpt3", "ptpt4", "ptpt5", "ptpt6", "total"
  ];
  if (!sheetData) {
    sheetData = ss.insertSheet("DataSantri");
    sheetData.appendRow(headersData);
  } else if (sheetData.getLastRow() === 0) {
    sheetData.appendRow(headersData);
  }
  formatHeaderSheet(sheetData, "#b45309"); // Amber 700
  
  // 6. Sheet "Mutasi" (Riwayat & Pengajuan Mutasi Santri / Ustadzah)
  let sheetMutasi = ss.getSheetByName("Mutasi");
  const headersMutasi = ["ID Mutasi", "Waktu Pengajuan", "Kategori", "ID Anggota", "Nama", "L/P", "TPQ Asal", "Kecamatan Asal", "TPQ Tujuan", "Kecamatan Tujuan", "Tanggal Mutasi", "Alasan", "Status", "Tanggal Diproses", "Diproses Oleh", "Catatan"];
  if (!sheetMutasi) {
    sheetMutasi = ss.insertSheet("Mutasi");
    sheetMutasi.appendRow(headersMutasi);
  } else if (sheetMutasi.getLastRow() === 0) {
    sheetMutasi.appendRow(headersMutasi);
  }
  formatHeaderSheet(sheetMutasi, "#0284c7"); // Sky 600
  
  Logger.log("✅ Berhasil! Semua sheet (Users, Santri, Guru, Kenaikan, Mutasi, DataSantri) telah disinkronkan dan siap digunakan.");
}

// Fungsi bantu untuk mempercantik dan membekukan baris judul sheet
function formatHeaderSheet(sheet, headerBgColor) {
  try {
    if (sheet && sheet.getLastColumn() > 0) {
      sheet.setFrozenRows(1);
      const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
      headerRange.setFontWeight("bold");
      headerRange.setBackground(headerBgColor);
      headerRange.setFontColor("#ffffff");
      headerRange.setHorizontalAlignment("center");
    }
  } catch(e) {
    Logger.log("Info format header: " + e.toString());
  }
}
