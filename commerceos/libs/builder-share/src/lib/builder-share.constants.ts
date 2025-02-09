export interface PeBuilderShareCustomAccess {
  id: string;
  theme: string;
  application: string;
  access: PeBuilderShareAccess;
}

export enum PeBuilderShareAccess {
  Editor= 'Editor',
  Viewer = 'Viewer',
}
