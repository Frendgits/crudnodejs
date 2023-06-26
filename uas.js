var cors = require('cors');


const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const PORT = process.env.PORT || 5000;

const multer = require('multer');
const path = require('path');

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
    origin: '*'
}));
// script upload

app.use(express.static("./public"))
 //! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/image/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});
 

 

// create data / insert data
app.post('/api/uas',upload.single('image'),(req, res) => {


    const data = { ...req.body };
    const nik = req.body.nik;
    const nama = req.body.nama;
    const kasus = req.body.kasus;
    const tanggal_lahir = req.body.tanggal_lahir;
    

    if (!req.file) {
        console.log("No file upload");
        const querySql = 'INSERT INTO uas (nik,nama,kasus,tanggal_lahir) values (?,?,?,?);';
         
        // jalankan query
        koneksi.query(querySql,[ nik,nama, kasus,tanggal_lahir], (err, rows, field) => {
            // error handling
            if (err) {
                return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }
       
            // jika request berhasil
            res.status(201).json({ success: true, message: 'Berhasil insert data!' });
        });
    } else {
        console.log(req.file.filename)
        var imgsrc = 'http://localhost:5000/image/' + req.file.filename;
        const foto =   imgsrc;
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySql = 'INSERT INTO uas (nik,nama,kasus,tanggal_lahir,foto) values (?,?,?,?,?);';
 
// jalankan query
koneksi.query(querySql,[ nik,nama, kasus,tanggal_lahir,foto], (err, rows, field) => {
    // error handling
    if (err) {
        return res.status(500).json({ message: 'Gagal insert data!', error: err });
    }

    // jika request berhasil
    res.status(201).json({ success: true, message: 'Berhasil insert data!' });
});
}
});




// read data / get data
app.get('/api/uas', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM uas';

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});


// update data
app.put('/api/uas/:nik', (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM uas WHERE nik = ?';
    const nik = req.body.nik;
    const nama = req.body.nama;
    const kasus = req.body.kasus;
    const tanggal_lahir = req.body.tanggal_lahir;
    

    const queryUpdate = 'UPDATE uas SET nama=?,kasus=?,tanggal_lahir=? WHERE nik = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.nik, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query update
            koneksi.query(queryUpdate, [nama,kasus,tanggal_lahir, req.params.nik], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// delete data
app.delete('/api/uas/:nik', (req, res) => {
    // buat query sql untuk mencari data dan hapus
    const querySearch = 'SELECT * FROM uas WHERE nik = ?';
    const queryDelete = 'DELETE FROM uas WHERE nik = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.nik, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            koneksi.query(queryDelete, req.params.nik, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika delete berhasil
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));

