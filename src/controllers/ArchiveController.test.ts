
import * as supertest from 'supertest';
import {} from 'jasmine';
import { OK, BAD_REQUEST } from 'http-status-codes';
import { SuperTest, Test } from 'supertest';
import { Logger } from '@overnightjs/logger';
import TestServer from '../SampleServer.test';
import { ArchiveController } from './ArchiveController';

describe('ArchiveController', () => {

    const archiveController = new ArchiveController();
    let agent: SuperTest<Test>;

    beforeAll(done => {
        const server = new TestServer();
        server.setController(archiveController);
        agent = supertest.agent(server.getExpressInstance());
        done();
    });

    describe('API: "/api/archive/:id"', () => {

        const SUCCESS_MSG = ArchiveController;
        const name = 'messages/filtered_threads/theonion_fsvsaimtxw/message_1.json';
        const message = SUCCESS_MSG + name;

        it(`should return a JSON object with the message "${message}" and a status code
            of "${OK}" if message was successful`, done => {

            agent.get('/api/archive/' + name)
                .end((err, res) => {
                    if (err) {
                        Logger.Err(err, true);
                    }
                    expect(res.status).toBe(OK);
                    expect(res.body.message).toBe(message);
                    done();
                });
        });

        it(`should return a JSON object with the "error" param and a status code of "${BAD_REQUEST}"
            if message was unsuccessful`, done => {

            agent.get('/api/archive/make_it_fail')
                .end((err, res) => {
                    if (err) {
                        Logger.Err(err, true);
                    }
                    expect(res.status).toBe(BAD_REQUEST);
                    expect(res.body.error).toBeTruthy();
                    done();
                });
        });
    });
});