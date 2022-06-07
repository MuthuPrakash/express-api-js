import request from 'supertest';
import app from '../app'

describe('GET /ping', () => {
    test("It should respond pong", async() => {
        const response = await request(app).get('/ping');
        expect((response.body).toEqual("pong"));
        expect((response.statusCode).toEqual(200));
    });
});