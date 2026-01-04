const chai = require('chai'); // assertion lib
const expect = chai.expect;
const request = require('supertest'); // sim HTTP req
const mongoose = require('mongoose');
const app = require('../app');
const Message = require('../models/message');

describe('Message', function () {
    
    before(async function () {
        await mongoose.connect('mongdb uri', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

    beforeEach(async function () {
        await Message.deleteMany({});
    });

    after(async function () {
        await mongoose.disconnect();
    });

    it('create new message', async function () {
        const res = await request(app)
            .post('/messages')
            .send({ text: 'test 1' });

        expect(res.status).to.equal(200);
        expect(res.body.text).to.equal('test 1');
        expect(res.body.read).to.be.false;
    });

    it('html injection', async function () {
        const res = await request(app)
            .post('/messages')
            .send({ text: '<script>alert(1)</script>test' });

        expect(res.status).to.equal(200);
        expect(res.body.text).to.equal('test');
    });

    it('invalid input', async function () {
        const res = await request(app)
            .post('/messages')
            .send({ mesage: 'test invalid input' });

        expect(res.status).to.equal(400);
    });

    it('multiple messages', async function () {
        await Message.create({ text: 'one' });
        await Message.create({ text: 'two' });

        const res = await request(app).get('/messages');

        expect(res.status).to.equal(200);
        expect(res.body.length).to.equal(2);
    });

    it('mongodb injection', async function () {
        const res = await request(app)
        .post('/messages')
        .send({ text: { "$regex": ".*" } });

        expect(res.status).to.equal(400);
    });
    
    it('save/patch/getById', async function () {
        const res = await request(app)
            .post('/messages')
            .send({ text: 'check if read test' });

        const id = res.body._id;

        const patch_result = await request(app)
            .patch(`/messages/${id}`)
            .send({ read: true });

        const get_result = await request(app)
            .get(`/messages/${id}`);

        expect(patch_result.status).to.equal(200);
        expect(patch_result.body.read).to.be.true;

        expect(get_result.status).to.equal(200);
        expect(get_result.body._id).to.equal(id);
        expect(get_result.body.read).to.be.true;
        expect(get_result.body.text).to.equal('check if read test');
    });
    
    it('post/delete', async function () {
        const res = await request(app)
            .post('/messages')
            .send({ text: 'check if deleted test' });

        const id = res.body._id;

        const delete_res = await request(app)
            .delete(`/messages/${id}`)

        const delete_same = await request(app)
            .delete(`/messages/${id}`)

        const get_result = await request(app)
            .get(`/messages/${id}`);

        const patch_deleted = await request(app)
            .patch(`/messages/${id}`)
            .send({ read: true });

        expect(delete_res.status).to.equal(200);
        expect(get_result.status).to.equal(404);
        expect(patch_deleted.status).to.equal(404);
        expect(delete_same.status).to.equal(404);

    });

    it('massive method test', async function () {
        const res = await request(app)
            .post('/messages')
            .send({ text: 'test method error handling' });
        
        const wrong_method = await request(app)
            .patch('/messages')
            .send({ text: 'test method error handling' });

        const wrong_method2 = await request(app)
            .post('/messages/1')
            .send({ text: 'test method error handling' });

        const wrong_method3 = await request(app)
            .post('/messages/688f75a60055886a09e83f62')
            .send({ text: 'test method error handling' });

        expect(res.status).to.equal(200);
        expect(wrong_method.status).to.equal(405);
        expect(wrong_method2.status).to.equal(405);
        expect(wrong_method3.status).to.equal(405);
    });

    it('edgecases', async function () {
        const res = await request(app)
            .post('/messages')

        const wrong_link = await request(app)
            .post('/wrong')
            .send({ text: 'test' });

        const invalid_id = await request(app).get('/messages/1');
        const invalid_id2 = await request(app).patch('/messages/1').send({ read: true });
        const invalid_id3 = await request(app).delete('/messages/1');

        const id = res.body._id;
        const not_bool = await request(app).patch(`/messages/${id}`).send({ read: 'string' });

        const get_cast_error = await request(app).get('/messages/123');

        expect(res.status).to.equal(500);
        expect(wrong_link.status).to.equal(404);
        expect(invalid_id.status).to.equal(400);
        expect(not_bool.status).to.equal(400);
        expect(get_cast_error.status).to.equal(400);

    });

    //it('CORS', async function () {
    //    const res = await request(app)
    //        .post('./messages')
    //        .set('Origin', 'http://127.0.0.1:5500')
    //        .send({ text: 'CORS test' });

    //    expect(res.status).to.equal(200);
    //    expect(res.headers['access-controll-allow-origin']).to.equal('http://127.0.0.1:5500');
    //});

    //it('CORS reject', async function () {
    //    const res = await request(app)
    //        .post('./messages')
    //        .set('Origin', 'http://something_else.com')
    //        .send({ text: 'CORS fail test' });

    //    expect(res.status).to.equal(500);
    //    expect(res.headers['access-controll-allow-origin']).to.not.equal('http://127.0.0.1:5500');
    //});

    it('disconnect db error 500', async function () {
        await mongoose.disconnect();

        const res = await request(app)
            .post('/messages')
            .send({ text: 'test while DB down' });

        const getall_res = await request(app)
            .get('/messages')

        const patch_res = await request(app)
            .patch('/messages/688f75a60055886a09e83f62')
            .send({ read: true });

        const get_res= await request(app)
            .get('/messages/688f75a60055886a09e83f62')

        const delete_res = await request(app)
            .delete('/messages/688f75a60055886a09e83f62')
        
        expect(res.status).to.equal(500);
        expect(getall_res.status).to.equal(500);
        expect(patch_res.status).to.equal(500);
        expect(delete_res.status).to.equal(500);
        expect(get_res.status).to.equal(500);

    });





});
