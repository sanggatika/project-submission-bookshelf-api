const { nanoid } = require('nanoid');
// array untuk menampung objek catatan pada berkas books
const books = require('./books');

const addBookHandler = (request, h) => {
    //Body Request
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;    
    
    // ID Nilai Unik Dengan Menggunakan nanoid
    const id = nanoid(16);
    // menjelaskan apakah buku telah selesai dibaca atau belum, finished didapatkan dari observasi pageCount === readPage
    const finished = pageCount === readPage;
    // merupakan properti yang menampung tanggal dimasukkannya buku. menggunakan new Date().toISOString()
    const insertedAt = new Date().toISOString();
    // Ketika buku baru dimasukkan, berikan nilai properti ini sama dengan insertedAt
    const updatedAt = insertedAt;

    // Client tidak melampirkan properti namepada request body
    if (!name) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku'
        });
        response.code(400);
        return response;
    }

    // Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount
    // Harus Ditampung Terlebih Dahulu untuk memasitkan data type int
    const tmp_pageCount = parseInt(pageCount);
    const tmp_readPage = parseInt(readPage);

    if (tmp_readPage > tmp_pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
        });
        response.code(400);
        return response;
    }    

    const newBooks = {
        id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt
    };

    // masukan nilai-nilai tersebut ke dalam array books menggunakan method push()
    books.push(newBooks);

    const isSuccess = books.filter((book) => book.id === id).length > 0;

    if (isSuccess) {
        // Jika buku berhasil diambahkan
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id,
            },
          });
        response.code(201);
        return response;
    }

    // Server gagal memasukkan buku karena alasan umum (generic error)
    const response = h.response({
        status: 'fail',
        message: 'Buku gagal ditambahkan',
    });
    response.code(500);
    return response;
};

const getAllBooksHandler = (request, h) => {
    //mengecek data pada books.js
    const tmp_length = books.length;

    if(tmp_length > 0)
    {
        //fitur query parameters pada route GET /books (Mendapatkan seluruh buku)
        const { name, reading, finished } = request.query;

        //menampung filter
        let filterBooks = books;

        if (name)
        {
            filterBooks = filterBooks.filter((book) => book
            .name.toLowerCase().includes(name.toLowerCase()));
        }

        if(reading)
        {
            filterBooks = filterBooks.filter((book) => book.reading === !!Number(reading));
        }

        if(finished)
        {
            filterBooks = filterBooks.filter((book) => book.finished === !!Number(finished));
        }

        //Jika Kondisi Books.js Terdapat Data
        const response = h.response({
            status: 'success',
            data: {
                books: filterBooks.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        });
        response.code(200);
        return response;
        
    }else{
        //Jika Kondisi Books.js Tidak Terdapat Data
        const response = h.response({
            status: 'success',
            data: {
                books
            },
        });
        response.code(200);
        return response;
    }
};

const getBookByIdHandler = (request, h) => {
    //menampung id data
    const { id } = request.params;

    //mencari data
    const book = books.filter((b) => b.id === id)[0];

    //Jika Book Ditemukan Tidak Null
    if (book !== undefined) {
        const response = h.response({
            status: 'success',
            data: {
                book
            },
        });
        response.code(200);
        return response;
    }

    //Kondisi Jika Buka Tidak Ditemukan
    const response = h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
 
};

const editBookByIdHandler = (request, h) => {
    //menampung id data
    const { id } = request.params;

    //mencari data
    const book = books.filter((b) => b.id === id)[0];

    //Jika Book ID Ditemukan
    if (book !== undefined)
    {
        //Body Request
        const {
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
        } = request.payload;

        // Client tidak melampirkan properti namepada request body
        if (!name) {
            const response = h.response({
                status: 'fail',
                message: 'Gagal menambahkan buku. Mohon isi nama buku'
            });
            response.code(400);
            return response;
        }

        const updatedAt = new Date().toISOString();

        // Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount
        // Harus Ditampung Terlebih Dahulu untuk memasitkan data type int
        const tmp_pageCount = parseInt(pageCount);
        const tmp_readPage = parseInt(readPage);

        if (tmp_readPage > tmp_pageCount) {
            const response = h.response({
                status: 'fail',
                message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
            });
            response.code(400);
            return response;
        }

        const index = books.findIndex((book) => book.id === id);

        if (index !== -1)
        {
            books[index] = {
                ...books[index],
                name,
                year,
                author,
                summary,
                publisher,
                pageCount,
                readPage,
                reading,
                updatedAt,
            }

            const response = h.response({
                status: 'success',
                message: 'Buku berhasil diperbarui',
            });
            response.code(200);
            return response;
        }
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Id tidak ditemukan',
        });
        response.code(404);
        return response;
    }

    //Kondisi Jika Buka Tidak Ditemukan
    const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
    return response;
};

const deleteBookByIdHandler = (request, h) => {
    //menampung id data
    const { id } = request.params;

    const index = books.findIndex((book) => book.id === id);

    if (index !== -1) {
        books.splice(index, 1);
        const response = h.response({
          status: 'success',
          message: 'Buku berhasil dihapus',
        });
        response.code(200);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
    });
    response.code(404);
    return response;
};

module.exports = { addBookHandler, getAllBooksHandler, getBookByIdHandler, editBookByIdHandler, deleteBookByIdHandler};