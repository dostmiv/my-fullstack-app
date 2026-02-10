const API_URL = 'http://localhost:3000';

async function request(url, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(API_URL + url, options);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

async function runTests() {
    console.log('Starting integration tests (using fetch)...');

    // Data
    const adminUser = { username: 'admin_' + Date.now(), password: 'password123', role: 'admin' };
    const normalUser = { username: 'user_' + Date.now(), password: 'password123', role: 'user' };
    const testBook = { title: 'Test Book ' + Date.now(), author: 'Test Author' };

    let adminToken = '';
    let userToken = '';
    let bookId = '';

    try {
        // 1. Register Admin
        console.log('\n--- 1. Register Admin ---');
        const res1 = await request('/auth/register', 'POST', adminUser);
        if (res1.status === 201) {
            console.log('PASS: Admin registered', res1.data.username);
        } else {
            console.log('FAIL: Admin registration', res1.data);
        }

        // 2. Register User
        console.log('\n--- 2. Register User ---');
        const res2 = await request('/auth/register', 'POST', normalUser);
        if (res2.status === 201) {
            console.log('PASS: User registered', res2.data.username);
        } else {
            console.log('FAIL: User registration', res2.data);
        }

        // 3. Login Admin
        console.log('\n--- 3. Login Admin ---');
        const res3 = await request('/auth/login', 'POST', { username: adminUser.username, password: adminUser.password });
        if (res3.status === 200) {
            adminToken = res3.data.token;
            console.log('PASS: Admin logged in');
        } else {
            console.log('FAIL: Admin login', res3.data);
        }

        // 4. Login User
        console.log('\n--- 4. Login User ---');
        const res4 = await request('/auth/login', 'POST', { username: normalUser.username, password: normalUser.password });
        if (res4.status === 200) {
            userToken = res4.data.token;
            console.log('PASS: User logged in');
        } else {
            console.log('FAIL: User login', res4.data);
        }

        // 5. User Adds Book (Pending)
        console.log('\n--- 5. User Adds Book (Expect Pending) ---');
        const res5 = await request('/api/books', 'POST', testBook, userToken);
        if (res5.status === 201 && res5.data.status === 'pending') {
            console.log('PASS: Book added as pending');
            bookId = res5.data._id;
        } else {
            console.log('FAIL: Book status is not pending', res5.data);
        }

        // 6. Public GET (Should not see book)
        console.log('\n--- 6. Public GET (Expect Exclude Pending) ---');
        const res6 = await request('/api/books', 'GET');
        const found6 = res6.data.find(b => b._id === bookId);
        if (!found6) {
            console.log('PASS: Pending book not visible to public');
        } else {
            console.log('FAIL: Pending book IS visible to public');
        }

        // 7. Admin GET (Should see book)
        console.log('\n--- 7. Admin GET (Expect Include Pending) ---');
        const res7 = await request('/api/books/admin', 'GET', null, adminToken);
        if (Array.isArray(res7.data)) {
            const found7 = res7.data.find(b => b._id === bookId);
            if (found7) {
                console.log('PASS: Admin can see pending book');
            } else {
                console.log('FAIL: Admin cannot see pending book');
            }
        } else {
            console.log('FAIL: Admin GET failed', res7);
        }

        // 8. Admin Approve Book
        console.log('\n--- 8. Admin Approve Book ---');
        const res8 = await request(`/api/books/${bookId}/status`, 'PUT', { status: 'approved' }, adminToken);
        if (res8.status === 200 && res8.data.status === 'approved') {
            console.log('PASS: Book approved');
        } else {
            console.log('FAIL: Book not approved', res8.data);
        }

        // 9. Public GET (Should see book now)
        console.log('\n--- 9. Public GET (Expect Include Approved) ---');
        const res9 = await request('/api/books', 'GET');
        const found9 = res9.data.find(b => b._id === bookId);
        if (found9) {
            console.log('PASS: Approved book visible to public');
        } else {
            console.log('FAIL: Approved book NOT visible to public');
        }

        // 10. Admin Delete Book
        console.log('\n--- 10. Admin Delete Book ---');
        const res10 = await request(`/api/books/${bookId}`, 'DELETE', null, adminToken);
        if (res10.status === 200) {
            console.log('PASS: Book deleted');
        } else {
            console.log('FAIL: Admin delete', res10.data);
        }

    } catch (e) {
        console.error("Critical Test Error", e);
    }
}

runTests();
