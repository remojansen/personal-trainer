// File System Access API types
// These types extend the Window interface for the File System Access API
// which is supported in Chromium-based browsers (Chrome, Edge, etc.)

interface FileSystemPermissionDescriptor {
	mode?: 'read' | 'readwrite';
}

interface FileSystemHandlePermissionDescriptor {
	mode?: 'read' | 'readwrite';
}

interface FileSystemDirectoryHandle {
	readonly kind: 'directory';
	readonly name: string;
	getFileHandle(
		name: string,
		options?: { create?: boolean },
	): Promise<FileSystemFileHandle>;
	getDirectoryHandle(
		name: string,
		options?: { create?: boolean },
	): Promise<FileSystemDirectoryHandle>;
	removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
	resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
	keys(): AsyncIterableIterator<string>;
	values(): AsyncIterableIterator<
		FileSystemFileHandle | FileSystemDirectoryHandle
	>;
	entries(): AsyncIterableIterator<
		[string, FileSystemFileHandle | FileSystemDirectoryHandle]
	>;
	queryPermission(
		descriptor?: FileSystemHandlePermissionDescriptor,
	): Promise<PermissionState>;
	requestPermission(
		descriptor?: FileSystemHandlePermissionDescriptor,
	): Promise<PermissionState>;
}

interface FileSystemFileHandle {
	readonly kind: 'file';
	readonly name: string;
	getFile(): Promise<File>;
	createWritable(
		options?: FileSystemCreateWritableOptions,
	): Promise<FileSystemWritableFileStream>;
	queryPermission(
		descriptor?: FileSystemHandlePermissionDescriptor,
	): Promise<PermissionState>;
	requestPermission(
		descriptor?: FileSystemHandlePermissionDescriptor,
	): Promise<PermissionState>;
}

interface FileSystemCreateWritableOptions {
	keepExistingData?: boolean;
}

interface FileSystemWritableFileStream extends WritableStream {
	write(data: FileSystemWriteChunkType): Promise<void>;
	seek(position: number): Promise<void>;
	truncate(size: number): Promise<void>;
}

type FileSystemWriteChunkType =
	| BufferSource
	| Blob
	| string
	| {
			type: 'write' | 'seek' | 'truncate';
			data?: BufferSource | Blob | string;
			position?: number;
			size?: number;
	  };

type FileSystemHandle = FileSystemFileHandle | FileSystemDirectoryHandle;

interface ShowDirectoryPickerOptions {
	id?: string;
	mode?: 'read' | 'readwrite';
	startIn?:
		| 'desktop'
		| 'documents'
		| 'downloads'
		| 'music'
		| 'pictures'
		| 'videos'
		| FileSystemHandle;
}

interface Window {
	showDirectoryPicker(
		options?: ShowDirectoryPickerOptions,
	): Promise<FileSystemDirectoryHandle>;
	showOpenFilePicker(
		options?: OpenFilePickerOptions,
	): Promise<FileSystemFileHandle[]>;
	showSaveFilePicker(
		options?: SaveFilePickerOptions,
	): Promise<FileSystemFileHandle>;
}

interface OpenFilePickerOptions {
	multiple?: boolean;
	excludeAcceptAllOption?: boolean;
	types?: FilePickerAcceptType[];
}

interface SaveFilePickerOptions {
	excludeAcceptAllOption?: boolean;
	suggestedName?: string;
	types?: FilePickerAcceptType[];
}

interface FilePickerAcceptType {
	description?: string;
	accept: Record<string, string[]>;
}
