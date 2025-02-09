import { Direction } from '../../shared/enums/direction.enum';
import { PesProgramDto } from './dto/program.dto';

export enum PeProgramsSortEvent {
  Title,
  SortBySubscribersAsc,
  SortBySubscribersDesc,
}

export interface PeProgramsSortOption<T> {
  field: keyof T;
  sort: Direction;
}

export interface PesSortOptions extends Record<PeProgramsSortEvent, PeProgramsSortOption<PesProgramDto>> {}

export const programsSortOptions: PesSortOptions = {
  [PeProgramsSortEvent.Title]: { field: 'title', sort: Direction.ASC },
  [PeProgramsSortEvent.SortBySubscribersAsc]: { field: 'subscriptions', sort: Direction.ASC },
  [PeProgramsSortEvent.SortBySubscribersDesc]: { field: 'subscriptions', sort: Direction.DESC },
};
