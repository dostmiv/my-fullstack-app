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

async function debugDelete() {
    console.log("--- Debugging Delete Functionality ---");

    // 1. Get a book to delete
    console.log("Fetching books...");
    try {
        const res = await makeRequest('/api/books');
        if (res.status === 200 && Array.isArray(res.body) && res.body.length > 0) {
            const bookToDelete = res.body[0];
            console.log(`Found book to delete: ${bookToDelete.title} (ID: ${bookToDelete._id})`);

            // 2. Try DELETE request
            console.log(`Attempting DELETE /api/books/${bookToDelete._id}...`);
            const delRes = await makeRequest(`/api/books/${bookToDelete._id}`, 'DELETE');
            console.log("DELETE Response Status:", delRes.status);
            console.log("DELETE Response Body:", delRes.body);

            if (delRes.status === 200) {
                console.log("PASS: Delete request succeeded.");
            } else {
                console.log("FAIL: Delete request failed.");
            }

        } else {
            console.log("FAIL: No books found to test delete.");
        }
    } catch (e) {
        console.error("Error during debug:", e.message);
    }
}

debugDelete();
