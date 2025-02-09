import { DockerItemInterface } from '../docker.interface';

export enum DockerActions {
  SetDockerItems = '[@pe/docker] SetDockerItems',
  ResetDockerItems = '[@pe/docker] ResetDockerItems',

}

export class SetDockerItems {
  static readonly type = DockerActions.SetDockerItems;

  constructor(public payload: DockerItemInterface[]) {}
}

export class ResetDockerItems {
  static readonly type = DockerActions.ResetDockerItems;
}
