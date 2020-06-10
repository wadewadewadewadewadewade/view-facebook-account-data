import React from 'react';
import './Listing.sass';

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
export interface ArchiveItems {
  [filenameAndPath: string]: ArchiveItem
}

interface File {
  name: string;
  fullName: string;
}

class Directory {
  name: string
  files: Array<File> | undefined
  directory: Array<Directory> | undefined
  constructor(name: string) {
    this.name = name
  }
  set(resource: Directory | File) {
    if (resource instanceof Directory) {
      if (this.directory === undefined) {
        this.directory = [resource]
      } else {
        this.directory.push(resource)
      }
    } else {
      if (this.files === undefined) {
        this.files = [resource]
      } else {
        this.files.push(resource)
      }
    }
  }
  get(name: string, isFile?: Boolean): Directory | File | undefined {
    if (isFile && this.files) {
      return this.files.find(file => file.name === name)
    } else if (!isFile && this.directory) {
      return this.directory.find(file => file.name === name)
    }
  }
  render() {
    let html = '';
    if (this.directory) {
      for(let i=0;i<this.directory.length;i++) {
        const id = this.directory[i].name;
        html += '<li><input type="checkbox" id="' + id + '"/><label for="' + id + '">' + this.directory[i].name + '</label><ul>' + this.directory[i].render() + '</ul></li>'
      }
    }
    if (this.files) {
      for(let i=0;i<this.files.length;i++) {
        html += '<li data-resource="' + this.files[i].fullName + '">' + this.files[i].name + '</li>'
      }
    }
    return html
  }
}

interface HttpResponse<T> extends Response {
  parsedBody?: T;
}
export async function http<T>(
  request: RequestInfo
): Promise<HttpResponse<T>> {
  const response: HttpResponse<T> = await fetch(
    request
  );
  response.parsedBody = await response.json();
  return response;
}

export function getListing() {
  /*return http<ArchiveItems>('/api/archive')
    .then(res => res.json())*/
  return new Promise<ArchiveItems>(resolve => {
    fetch('/api/archive')
    .then(res => resolve(res.json()))
  })
}

export function Listing(resource: any) {
  if (resource) {
    const listing = resource
    let structure = new Directory('/')
    if (listing) {
      Object.keys(listing).forEach((filename) => {
        const path = filename.split('/'),
          isDirectory = listing[filename].isDirectory
        if (!isDirectory) {
          let level = 0,
            directory = path[level],
            limit = /\..+/.test(path[path.length - 1]) ? 3 : 2,
            current = (structure.get(directory) as Directory | undefined)
          // make sure the pointer isn't null
          if (!current) {
            structure.set(new Directory(directory));
            current = (structure.get(directory) as Directory | undefined)
          }
          while (current && level < limit) {
            if (current.get(path[level + 1]) === undefined) {
              current.set(new Directory(path[level + 1]));
            }
            current = current.get(path[level + 1]) as Directory
          }
          if (current && limit === 3) {
            const file: File = { name: path[path.length - 1], fullName: filename }
            current.set(file)
          }
        }
      })
    }
    return <ul>{structure.render()}</ul>
  } else {
    return null
  }
}