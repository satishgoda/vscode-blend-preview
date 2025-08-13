export interface BlendFile {
    filepath: string;
    version: string;
    scenes: Scene[];
}

export interface Scene {
    name: string;
    objects: Object3D[];
}

export interface Object3D {
    name: string;
    type: string;
    properties: Record<string, any>;
}

export interface ParsedData {
    blendFile: BlendFile;
    metadata: Metadata;
}

export interface Metadata {
    author: string;
    createdDate: Date;
    modifiedDate: Date;
}