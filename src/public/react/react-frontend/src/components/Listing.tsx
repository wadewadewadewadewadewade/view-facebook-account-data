import React, { useState } from 'react';
import './Listing.sass';

import { WrappedPromise, wrapPromise } from './WrapPromise'
import { dummyImageFile, dummyArchiveItems } from './DummyData'

interface ArchiveItem {
  verMade: number
  version: number
  flags: number
  method: number
  time: number // ticks
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
	comment: string | null
	display?: Boolean
}
export interface ArchiveItems {
  [filenameAndPath: string]: ArchiveItem
}

interface FileArgs {
	file: File,
	items: WrappedPromise<ArchiveItems>,
	update: React.Dispatch<React.SetStateAction<WrappedPromise<ArchiveItems>>>
}

class File {
  name: string;
	fullName: string;
	portal: HTMLSpanElement
	data: HTMLImageElement | undefined
	display: Boolean
	setDisplay: Function
	constructor(fullName: string) {
		const path = fullName.split('/')
		this.fullName = fullName
		this.name = path[path.length - 1]
		this.portal = document.createElement('span');
		[this.display, this.setDisplay] = useState(false)
	}
	fetch(): Promise<string> {
		if (this.data) {
			return new Promise<string>(r => r(this.data?.src))
		} else {
			return new Promise<string>(ro => {
				new Promise<string>(r => r(dummyImageFile)).then((base64: string) => {
					this.data = document.createElement('img')
					this.data.src = base64
					ro(this.data.src)
				})
			})
		}
	}
	click(event: React.MouseEvent<HTMLLIElement, MouseEvent>) {
		if (!this.display) {
			if (this.data) {
				this.portal.appendChild(this.data)
				this.setDisplay((currentState: Boolean) => { return !currentState })
			} else {
				this.fetch().then(() => {
					this.portal.appendChild(this.data as Node)
					this.setDisplay((currentState: Boolean) => { return !currentState })
				})
			}
		} else {
			this.portal.children[0].remove()
			this.setDisplay((currentState: Boolean) => { return !currentState })
		}
	}
	render(): JSX.Element {
		return <li key={this.fullName} onClick={(e) => this.click(e)}><span>{this.name}</span>{this.data}</li>
	}
}

class Directory {
  name: string
  files: Array<File> | undefined
	directory: Array<Directory> | undefined
	parent: Directory | undefined
  constructor(name: string, parent: Directory | undefined) {
		this.name = name
		this.parent = parent
  }
  set(resource: Directory | File): Directory | undefined {
    if (resource instanceof Directory) {
      if (this.directory === undefined) {
        this.directory = [resource]
      } else {
        this.directory.push(resource)
			}
			return resource
    } else {
      if (this.files === undefined) {
        this.files = [resource]
      } else {
        this.files.push(resource)
			}
			return undefined
    }
  }
  get(name: string, isFile?: Boolean): Directory | File | undefined {
    if (isFile && this.files) {
      return this.files.find(file => file.name === name)
    } else if (!isFile && this.directory) {
      return this.directory.find(file => file.name === name)
    }
	}
	find(path: Array<string> | undefined): Directory | undefined { // just to get directory, not file, for use only after structure is constructed
		if (path === undefined) {
			return undefined
		}
		//let current = (listing?.read().structure.get('') as Directory | undefined),
		let current = (this.get('') as Directory | undefined),
			level = 0
		while (current !== undefined && current.name !== path[path.length - 1]) {
			level++
			current = (current.get(path[level]) as Directory | undefined)
		}
		return current
	}
	getPath(): string {
		let name = this.name,
			current = this.parent
		while (current) {
			name = current.name + '/' + name
			current = current.parent
		}
		return name
	}
  render(): Array<JSX.Element> {
		let html: Array<JSX.Element> = [];
    if (this.directory) {
      for(let i=0;i<this.directory.length;i++) {
        const id = this.directory[i].getPath();
        html.push(<li key={id}><input type="checkbox" id={id}/><label htmlFor={id}>{this.directory[i].name}</label><ul>{this.directory[i].render()}</ul></li>)
      }
		}
    if (this.files) {
      for(let i=0;i<this.files.length;i++) {
        html.push(this.files[i].render())
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

/*function getFile(filename: string) {
	return new Promise<ArchiveItems>(resolve => {
    fetch('/api/archive/' + encodeURIComponent(filename))
    .then(res => resolve(res.json()))
  })
}

export function getListing() {
  //return http<ArchiveItems>('/api/archive')
  //  .then(res => res.json())
  return new Promise<ArchiveItems>(resolve => {
    fetch('/api/archive')
    .then(res => resolve(res.json()))
  })
}*/

export class Listing {
	structure: Directory = new Directory('', undefined)
	constructor(listing: ArchiveItems) {
		Object.keys(listing).forEach((fullName) => {
			const path = fullName.split('/'),
				isDirectory = listing[fullName].isDirectory
			if (!isDirectory) { // path never ends with a slash in this case
				let level = 0,
					current = this.structure
				path.pop() // We just want path[] to have the directories in it, not the filename as well
				while (level < path.length) {
					const directory = path[level]
					const temp = (current.get(directory) as Directory | undefined)
					if (temp === undefined) { 
						current = (current.set(new Directory(directory, current)) as Directory) // we're assuming response is never null or type=File here, and it shouldn't be
					} else {
						current = temp
					}
					level++
				}
				current.set(new File(fullName))
			}
		})
	}
	render() {
		return <ul key="/" className="listing">{this.structure.render()}</ul>
	}
}

export default function ListingComponent() {
	const [archiveitems] = useState(wrapPromise(new Promise<ArchiveItems>(r => { setTimeout(()=> r(dummyArchiveItems), 1000)})))
	function ListingComponentRenderer(ai: WrappedPromise<ArchiveItems>) {
		const listing = new Listing(ai.read())
		return listing.render()
	}
	return <ListingComponentRenderer {...archiveitems} />
}