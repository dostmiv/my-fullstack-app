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
    console.log('Starting verification...');

    // 1. Verify seed data
    console.log('\n--- Verifying Seed Data ---');
    try {
        const res = await makeRequest('/api/books');
        if (res.status === 200 && Array.isArray(res.body)) {
            console.log(`PASS: Retrieved ${res.body.length} books.`);
            const titles = res.body.map(b => b.title);
            if (titles.includes('1984') && titles.includes('The Hobbit')) {
                console.log('PASS: Expected books found.');
            } else {
                console.log('FAIL: Expected books not found.');
            }
        } else {
            console.log('FAIL: GET /api/books failed.', res);
        }
    } catch (e) {
        console.log('FAIL: Could not connect to API.', e.message);
    }

    // 2. Add new book
    console.log('\n--- Verifying Add Book ---');
    const newBook = { title: "Test Book " + Date.now(), author: "Test Author" };
    try {
        const res = await makeRequest('/api/books', 'POST', newBook);
        if (res.status === 200 && res.body.title === newBook.title) {
            console.log('PASS: Book added successfully.');
        } else {
            console.log('FAIL: Failed to add book.', res);
        }
    } catch (e) {
        console.log('FAIL: Error adding book.', e.message);
    }

    // 3. Verify uniqueness
    console.log('\n--- Verifying Uniqueness ---');
    try {
        const res = await makeRequest('/api/books', 'POST', newBook);
        if (res.status === 400 && res.body.error === "Book already exists") {
            console.log('PASS: Duplicate book rejected.');
        } else {
            console.log('FAIL: Duplicate book not handled correctly.', res);
        }
    } catch (e) {
        console.log('FAIL: Error checking uniqueness.', e.message);
    }
}

// Wait a bit for server to potentialy restart if user ran it, 
// but here we assume the server might NOT be running or we need to rely on the user running it?
// Actually, I don't have control over the main server process if I didn't start it.
// I will try to run the tests assuming the user or previous `nodemon` is running.
// If connection fails, I might need to start it.
// Checking `index.js`, it runs on port 3000.

runTests();
