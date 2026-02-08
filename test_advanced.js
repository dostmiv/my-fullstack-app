const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: body });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log('--- Verifying Advanced Features ---');

    // 1. Get a book to edit
    console.log('Fetching books...');
    let bookToEdit;
    try {
        const res = await makeRequest('/api/books');
        if (res.status === 200 && res.body.length > 0) {
            bookToEdit = res.body[0];
            console.log(`Found book to edit: ${bookToEdit.title}`);
        } else {
            console.log('FAIL: No books found.');
            return;
        }
    } catch (e) {
        console.log('FAIL: Connection error.');
        return;
    }

    // 2. Edit the book (PUT)
    console.log(`\n--- Testing PUT /api/books/${bookToEdit._id} ---`);
    const updatedData = { title: bookToEdit.title + " (Updated)", author: bookToEdit.author };
    try {
        const res = await makeRequest(`/api/books/${bookToEdit._id}`, 'PUT', updatedData);
        if (res.status === 200 && res.body.title === updatedData.title) {
            console.log('PASS: Book updated successfully.');
            console.log(`New Title: ${res.body.title}`);
        } else {
            console.log('FAIL: Update failed.', res);
        }
    } catch (e) {
        console.log('FAIL: PUT request error.', e.message);
    }

    // Revert change (optional, but good for cleanliness)
    // ... let's leave it as is to show the user the change? No, better to revert or just acknowledge.
}

runTests();
