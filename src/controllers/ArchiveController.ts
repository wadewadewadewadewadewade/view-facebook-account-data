import { OK, BAD_REQUEST } from 'http-status-codes';
import { Controller, Middleware, Get, Post, Put, Delete } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Logger } from '@overnightjs/logger';
import * as fs from 'fs';
import * as path from 'path';

interface ArchiveItem {
    verMade: number
    version: number
    flags: number
    method: number
    time: Date
    crc: number
    compressedSize: number
    size: number
    fnameLen: number
    extraLen: number
    comLen: number
    diskStart: number
    inattr: number
    attr: number
    offset: number
    headerOffset: number
    name: string
    isDirectory: Boolean
    comment: SVGFESpecularLightingElement
}
interface ArchiveItems {
    [filenameAndPath: string]: ArchiveItem
}

@Controller('api/archive')
export class ArchiveController {
    
    SUCCESS_MSG: string = 'messages/filtered_threads/theonion_fsvsaimtxw/message_1.json';

    private isArchive(val: ArchiveItems | any): val is ArchiveItems {
        return (val as ArchiveItems).entries !== undefined;
    }

    private formatArchiveFile(filename: string, contents: Buffer) {
        if (/\.json$/i.test(filename)) {
            return JSON.parse(contents.toString('utf8'));
        } else if (/\.jpe?g$/i.test(filename)) {
            return '<img src="data:image/jpeg;charset=utf8;base64,' + contents.toString('base64') + '"/>';
        } else if (/\.png$/i.test(filename)) {
            return '<img src="data:image/png;charset=utf8;base64,' + contents.toString('base64') + '"/>';
        } else {
            return contents.toString('utf8');
        }
    }

    private getArchiveRaw(callback: Function) {
        fs.readdir('.', function(err, items) {
            if (err) {
                Logger.Err(err);
                callback(err);
            } else {
                const filename = items.find(item => item.match(/^facebook-[^\.]+\.zip/));
                const StreamZip = require('node-stream-zip');
                const zip = new StreamZip({
                    file: filename,
                    storeEntries: true
                });
                // Handle errors
                zip.on('error', (err:any) => { Logger.Err(err); zip.close(); callback(err); });
                // Handle Success
                zip.on('ready', () => { Logger.Info('reading ' + filename); callback(zip); });
            }
        });
    }

    private getArchive(filename?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (filename !== undefined) {
                // fetch file
                this.getArchiveRaw((res: any) => {
                    if (this.isArchive(res)) {
                        // valid archive
                        const zip: any = res;
                        const chunks: Array<any> = [];
                        zip.stream(filename, (err: string, stream: any) => {
                            stream.on('data', (chunk: any) => chunks.push(chunk));
                            stream.on('error', reject);
                            stream.on('end', () => { zip.close(); resolve(this.formatArchiveFile(filename, Buffer.concat(chunks) )) });
                        });
                    } else {
                        // error
                        reject(res);
                    }
                })
            } else {
                // list contents
                this.getArchiveRaw((zip: any) => {
                    if (this.isArchive(zip)) {
                        const items: ArchiveItems = (zip as any).entries();
                        (zip as any).close();
                        resolve(items);
                    } else {
                        reject(zip);
                    }
                })
            }
        })
    }
 
    // http://localhost:8081/api/archive/messages%2Ffiltered_threads%2Ftheonion_fsvsaimtxw%2Fmessage_1.json
    @Get(':id')
    private async get(req: Request, res: Response) {
        Logger.Info('fetching file ' + req.params.id);
        const response: any = await this.getArchive(req.params.id);
        if (this.isArchive(response)) {
            return res.status(OK).json({
                message: response as ArchiveItems
            });
        } else {
            return res.status(BAD_REQUEST).json({
                message: response
            })
        }
    }
 
    @Get('')
    private async getAll(req: Request, res: Response) {
        Logger.Info('fetching listing');
        try {
            const response: any = await this.getArchive();
            if (this.isArchive(response)) {
                return res.status(OK).json({
                    message: response as ArchiveItems
                });
            } else {
                return res.status(BAD_REQUEST).json({
                    message: response
                })
            }
        } catch (err) {
            return res.status(BAD_REQUEST).json({
                message: err
            })
        }
    }

    /*
    @Post()
    private add(req: Request, res: Response) {
        Logger.Info(req.body, true);
        return res.status(OK).json({
            message: 'add_called',
        });
    }
 
    @Put('update-user')
    private update(req: Request, res: Response) {
        Logger.Info(req.body);
        return res.status(OK).json({
            message: 'update_called',
        });
    }
 
    @Delete('delete/:id')
    private delete(req: Request, res: Response) {
        Logger.Info(req.params, true);
        return res.status(OK).json({
            message: 'delete_called',
        });
    }
 
    @Get(/ane/) // Rexes supported. Matches /lane, /cane, etc.
    public getAne(req: Request, res: Response): any {
        return res.status(OK).json({
            message: '/ane/',
        });
    }
    */
}