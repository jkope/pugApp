const request = require('request');
const server = require('../thing');

const base_url = 'http://localhost:3000/';


describe('server', () => {
    afterAll(() =>{
        server.close();
    });

    describe('GET /', () => {
        it('returns status code 200', done => {
            request.get(base_url, (error, response, body) => {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
    });

    describe('POST /create', () => {
        let data = {};
        beforeAll(done => {
            request.post({
                url: `${base_url}create`,
                form: {
                    userID: 'created',
                    firstName: 'testing',
                    lastName: 'tester',
                    email: 'test@test',
                    age: 33
                }
            },
            (error,response,body) => {
                data.statusCode = response.statusCode;
                done();
            });
        });
        it('returns status code 302', () => {
            expect(data.statusCode).toBe(302);
        });
    });

    describe('GET /edit/id', () => {
        let data ={};
        const uid = 812;
        beforeAll(done => {
            request.get(`${base_url}edit/${uid}`, (error,response,body)=>{
                data.statusCode = response.statusCode;
                data.body = body;
                done();
            });
        });
        it('should edit the correct user', () => {
            expect(data.statusCode).toBe(200);
            expect(data.body).toContain(`<input name="userId" type="text" id="userId" value="kopers"/>`)
    
        })
    })

    describe('POST /update/id', () => {
        let data= {};
        beforeAll(done => {
            request.post({
                url: `${base_url}update/793`,
                form: {
                    uid: 793,
                    userId: 'Edited',
                    firstName: 'testing',
                    lastName: 'tester',
                    email: 'test@test',
                    age: 33
                }
            },
            (error, request, body) => {
                data.statusCode = request.statusCode;
                data.body = body;
                done();
            });
        });
        it('edited the correct user', done => {
            request.get(`${base_url}`, (error, response, body)=> {
                expect(response.statusCode).toBe(200);
                expect(body).toContain(`<td>Edited</td>`);
                done();
            });
        });
    });

    describe('GET /delete/id', () => {
        let data = {};
        const uid = 812;
        beforeAll(done => {
            request.get(`${base_url}delete/${uid}`, (error, response, body) => {
                data.statusCode = response.statusCode;
                data.body = body;
                done();
            });
        });
        it('should edit the correct user', () => {
            expect(data.statusCode).toBe(200);
            expect(data.body).not.toContain(`<input name="userId" type="text" id="userId" value="delete"/>`)

        })
    })



});