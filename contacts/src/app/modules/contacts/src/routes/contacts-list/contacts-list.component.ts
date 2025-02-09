import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, forkJoin, merge, Observable, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  debounceTime,
  filter,
  finalize,
  map,
  pluck,
  startWith,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatIconRegistry } from '@angular/material/icon';
import { Store } from '@ngxs/store';
import { MatDialog } from '@angular/material/dialog';

import {
  MenuSidebarFooterData,
  MessageBus,
  PeDataGridAdditionalFilter,
  PeDataGridAdditionalFilterItem,
  PeDataGridButtonItem,
  PeDataGridFilterType,
  PeDataGridItem,
  PeDataGridLayoutType,
  PeDataGridListOptions,
  PeDataGridMultipleSelectedAction,
  PeDataGridTheme,
  PE_ENV,
  SaveContacts,
  TreeFilterNode,
} from '@pe/common';
import { EnvironmentConfigInterface } from '@pe/common/environment-config/interfaces/environment-config.interface';
import { DataGridContextMenuEnum, PeDataGridSidebarService } from '@pe/data-grid';

import { ContactMainInfo, ContactResponse, ContactTypesEnum, Field, Group } from '../../interfaces';
import { getContactDisplayFields } from '../../utils/contacts';
import { closeIcon, editIcon, groupIcon, leadIcon, newStatusIcon, searchIcon } from '../../components/icons/icons';
import { ContactsGQLService, ContactsService, ContactsStoreService, FieldsGQLService } from '../../services';
import { GroupsGQLService } from '../../services/groups-gql.service';
import { AbstractComponent } from '../../misc/abstract.component';
import { membersCountFilter, nameFilter } from './filters';
import { DialogsService } from '../../services/dialogs.service';
import { ContactsListService } from '../../services/contacts-list.service';
import { EmployeesCellComponent } from '../../components/employees-cell/employees-cell.component';
import { OVERLAY_POSITIONS } from '../../constants';
import { CloseWindowsConfirmationComponent } from '../../components/close-window-confirm/close-window-confirm.component';

import { countries, Country } from 'countries-list';

@Component({
  selector: 'contacts-contacts-list',
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.scss'],
  providers: [ContactsListService]
})
export class PeContactsListComponent extends AbstractComponent implements OnInit {
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  @Input() preSelectedItems: any[];
  @Output() selectedItemChanged = new EventEmitter<any>();

  isLoading: boolean = false;
  totalCount: number = 0;
  gridItems$: BehaviorSubject<PeDataGridItem[]> = new BehaviorSubject([]);
  fileControl = new FormControl(null);
  viewMode: PeDataGridLayoutType;
  gridMode = PeDataGridLayoutType.Grid;
  selectedItems: string[] = [];

  categories: any = [
    {
      title: 'My contacts',
      editMode: false,
      expanded: true,
      active: false,
      multi: false,
      tree: [],
      folders: [],
      contacts: [],
    },
  ];

  sidebarFooterData: MenuSidebarFooterData;

  typesFilterTree: TreeFilterNode[] = [
    {
      id: 'business',
      name: ContactTypesEnum.Company,
      children: null,
      noToggleButton: true,
      image: `${this.envConfig.custom.cdn}/icons/apps-icon.svg`,
    },
    {
      id: 'partner',
      name: ContactTypesEnum.Partner,
      children: null,
      noToggleButton: true,
      image: `${this.envConfig.custom.cdn}/icons/calendar-icon.svg`,
    },
    {
      id: 'private_customer',
      name: ContactTypesEnum.Person,
      children: null,
      noToggleButton: true,
      image: `${this.envConfig.custom.cdn}/icons/ambassador-icon.svg`,
    },
  ];

  groupsAdditionalFilter: PeDataGridAdditionalFilter = {
    label: 'Groups',
    labelActive: false,
    expandable: true,
    expanded: false,
    filters: [],
    labelCallback: () => this.switchItems(!this.groupsAdditionalFilter.labelActive),
    labelIcon: 'group_filter',
  };

  addItem: { image: string; buttonTitle: string; } = {
    image: '',
    buttonTitle: 'Add Contact'
  };

  initialDataGridFilters: PeDataGridFilterType[] = [
    nameFilter,
    this.groupsAdditionalFilter,
  ];

  dataGridListOptions: PeDataGridListOptions = {
    nameTitle: 'Name',
    descriptionTitle: '',
    customFieldsTitles: [
      'Status',
      'Country',
      'GMV',
      'Total spent',
      'Employees',
    ],
  };

  navbarLeftPaneButtons: PeDataGridButtonItem[] = [
    {
      title: 'Import',
      onClick: () => {
        this.menuTrigger.openMenu();
      },
      children: null,
    },
  ];

  multipleSelectedActions: PeDataGridMultipleSelectedAction[] = [
    {
      label: 'Select all',
      callback: () => {
        this.selectedItems = this.loadedContacts.map((contact: ContactResponse) => contact._id);
      }
    },
    {
      label: 'Deselect all',
      callback: () => {
        this.selectedItems = [];
      }
    },
    {
      label: 'Delete',
      callback: (ids?: string[]) => {
        this.isLoading = true;

        const requests$ = this.groupsAdditionalFilter.labelActive
          ? ids.map(id => this.groupsGQLService.deleteGroup(id))
          : ids.map(id => this.contactsGQLService.deleteContact(id));

        forkJoin(requests$).pipe(
          finalize(() => {
            this.reloadItems$.next();
            this.selectedItems = [];
            this.isLoading = false;
          }),
          takeUntil(this.destroyed$),
        ).subscribe();
      },
    },
  ];
  contextRef: OverlayRef;
  contextMenuClickedItem: any;

  contextActions = [];

  private filterGroups = {};
  private reloadItems$: BehaviorSubject<void> = new BehaviorSubject(null);

  private loadedContacts: ContactResponse[] = [];
  private groups: Group[];
  fieldsIdsDict: { [name: string]: string } = {};

  get theme(): PeDataGridTheme {
    return PeDataGridTheme.Dark;
  }

  get assetsPath(): string {
    return `${this.envConfig.custom.cdn}/placeholders`;
  }

  addNewItem: PeDataGridItem = {
    id: 'newItem',
    title: '',
    actions: [
      {
        label: 'New contact',
        callback: () => {
          console.log('add item');
          this.dialogsService.openContactDialog();
        },
      }
    ]
  };

  constructor(
    public contactsListService: ContactsListService,
    private contactsService: ContactsService,
    private activatedRoute: ActivatedRoute,
    private contactsGQLService: ContactsGQLService,
    private contactsStoreService: ContactsStoreService,
    private dataGridSidebarService: PeDataGridSidebarService,
    private dialogsService: DialogsService,
    private fieldsGQLService: FieldsGQLService,
    private groupsGQLService: GroupsGQLService,
    private messageBus: MessageBus,
    private dialog: MatDialog,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    protected overlay: Overlay,
    protected viewContainerRef: ViewContainerRef,
    private iconRegistry: MatIconRegistry,
    private store: Store,
    @Inject(PE_ENV) private envConfig: EnvironmentConfigInterface,
  ) {
    super();
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(
      pluck('closeDialog'),
      filter(showDialog => !!showDialog),
      takeUntil(this.destroyed$),
    ).subscribe(() => {
      this.showConfimationDialog('');
    });
    this.iconRegistry.addSvgIconLiteral('close', this.sanitizer.bypassSecurityTrustHtml(closeIcon));
    this.iconRegistry.addSvgIconLiteral('search', this.sanitizer.bypassSecurityTrustHtml(searchIcon));
    this.iconRegistry.addSvgIconLiteral('edit', this.sanitizer.bypassSecurityTrustHtml(editIcon));
    this.iconRegistry.addSvgIconLiteral('group', this.sanitizer.bypassSecurityTrustHtml(groupIcon));
    this.iconRegistry.addSvgIconLiteral('lead', this.sanitizer.bypassSecurityTrustHtml(leadIcon));

    this.dialogsService.onSuccess$.subscribe(() => {
      this.initDataListener();
    });

    this.contactsService.openFolder$.pipe(takeUntil(this.destroyed$)).subscribe((folder: any) => {
      if (folder) {
        const folderData = this.contactsService.searchinarray(this.categories[0].tree, folder);
        this.openFolder(folder);
        this.sidebarFooterData = {
          headItem: {
            title: folderData?.name,
          },
          menuItems: [
            {
              title: 'New Album', onClick: () => {
                folderData.children = [...folderData.children, { name: 'New folder', editing: true, image: './assets/icons/folder.png' }];
                const a = this.categories[0].tree;
                this.categories[0].tree = undefined;
                this.categories[0].tree = [...a];
                this.cdr.detectChanges();
                this.cdr.markForCheck();

              },
            },

            {
              title: 'Delete Album',
              color: 'red',
              onClick: () => {

              },
            },
          ],
        };
        return;
      }

      this.sidebarFooterData = {
        headItem: {
          title: 'Category',
        },
        menuItems: [
          {
            title: 'New Album', onClick: () => {
              this.categories[0].tree = [...this.categories[0].tree, { name: 'New folder', editing: true, image: './assets/icons/folder.png' }];
              this.cdr.detectChanges();
              this.cdr.markForCheck();
            },
          },
        ],
      };
    });

    this.fillContextMenu();

    this.contactsGQLService.page = 0;
    this.contactsGQLService.hasNextPage = true;
    this.groupsAdditionalFilter.labelActive = this.contactsStoreService.grid === 'group';
    this.viewMode = PeDataGridLayoutType.Grid; // todo: save/retrieve from storage
    this.initDataListener();

    forkJoin([
      this.getGroups(),
      this.getContactFields(),
    ]).pipe(
      tap(() => {
        if (this.contactsStoreService.grid === 'group') {
          this.switchItems(true, false);
          this.contactsStoreService.grid = null;
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.gridItems$.pipe(
      takeUntil(this.destroyed$),
      tap(() => {
        this.addItem.buttonTitle = this.groupsAdditionalFilter.labelActive ? 'Add group' : 'Add contact';
      }),
    ).subscribe();

    try {
      this.messageBus.listen('contacts.toggle.sidebar').pipe(
        takeUntil(this.destroyed$), tap(() => {
          this.toggleSidebar();
        })
      ).subscribe();
    } catch (e) {
    }
  }

  showConfimationDialog(data): void {
    const dialogRef = this.dialog.open(CloseWindowsConfirmationComponent, {
      data,
      panelClass: ['contacts-dialog', this.theme],
      hasBackdrop: false,
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((result: any) => {
        if (result.exit) {
          this.dialogsService.dialogRef.close();
        }
        this.router.navigate(['.'], { relativeTo: this.activatedRoute });
      });
  }

  openFolder(folderId): void {
  }

  onCreateFolder(node: TreeFilterNode): void {
  }

  initDataListener(): void {
    const reloadOnChangeOf = [
      this.contactsListService.filterBy$,
      this.contactsListService.sortBy$,
      this.contactsListService.searchBy$,
      this.reloadItems$
    ];

    merge(...reloadOnChangeOf).pipe(
      startWith([]),
      debounceTime(1),
      switchMap(() => {
        this.isLoading = true;
        const { filters, order } = this.contactsListService.getContactsQuery();
        return this.contactsGQLService.getContacts(filters, order);
      }),
      map((data: any) => {
        this.totalCount = data.totalCount;
        return data.result;

      }),
      catchError((err: any) => {
        return throwError(err);
      }),
      takeUntil(this.destroyed$)
    ).subscribe((contacts: any) => {
      this.handleResponse(contacts);
      if (this.preSelectedItems) {
        this.selectedItems = this.preSelectedItems.map(item => item.id);
        this.cdr.detectChanges();
      }
      this.isLoading = false;
    });
  }

  private switchItems(active, expanded = true): void {
    this.selectedItems = [];
    this.groupsAdditionalFilter.expanded = expanded;
    this.groupsAdditionalFilter.labelActive = active;
    if (this.groupsAdditionalFilter.labelActive) {
      this.initialDataGridFilters = [
        nameFilter,
        membersCountFilter,
        this.groupsAdditionalFilter,
      ];
      this.getGroups().pipe(
        map((groups: any) => {
          const items = groups.map(group => this.groupGridItem(group));
          this.gridItems$.next(items);
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    } else {
      this.initialDataGridFilters = [
        nameFilter,
        this.groupsAdditionalFilter,
      ];
    }
  }

  private getGroups(): Observable<Group[]> {
    return this.groupsGQLService.getGroups(this.filterGroups).pipe(
      tap((data: any) => {
        this.groups = data.result;
        this.groupsAdditionalFilter.filters = this.groups.map((group: any) => {
          return {
            title: group.name,
            key: group.id,
          } as PeDataGridAdditionalFilterItem;
        });
      }),
      map(({ result }) => result),
      takeUntil(this.destroyed$),
    );
  }

  private getContactFields(): Observable<Field[]> {
    return this.fieldsGQLService.getAllFields().pipe(
      tap(fields => this.fieldsIdsDict = fields.reduce(
        (acc, field) => {
          acc[field.name] = field.id;
          return acc;
        },
        {},
      )),
      takeUntil(this.destroyed$),
    );
  }

  onSelectedItemsChanged(ids: string[]): void {
    this.selectedItems = ids;
    const contacts = [];
    this.selectedItems.forEach((itemId: any) => {
      contacts.push(this.loadedContacts.find(element => element._id === itemId));
    });
    if (contacts) {
      this.store.dispatch(new SaveContacts(contacts));
    }
  }

  private groupGridItem(group: Group): PeDataGridItem {
    return {
      id: group.id,
      title: group.name,
      description: 'Group description',
      actions: [{
        label: 'Open',
        callback: () => this.router.navigate(['groups', group.id], { relativeTo: this.activatedRoute }),
      }],
    } as PeDataGridItem;
  }

  scrollOnBottom(event: any): void {
    if (!this.groupsAdditionalFilter.labelActive && this.loadedContacts.length < this.totalCount) {
      const pos = (event.target.scrollTop as number) + (event.target.clientHeight as number);
      const max = event.target.scrollHeight;
      if (pos >= max) {
        this.contactsGQLService.page += 1;
        // this.getContacts().subscribe();
      }
    }
  }

  add(): void {
    if (this.groupsAdditionalFilter.labelActive) {
      this.addGroup();
    } else {
      this.addContact();
    }
  }

  addGroup(): void {
    this.router.navigate(['groups', 'new'], { relativeTo: this.activatedRoute.parent }).then();
  }

  addContact(): void {
    this.router.navigate(['add-contact'], { relativeTo: this.activatedRoute });
  }

  private handleResponse(contacts: any, append = false): void {
    this.loadedContacts = append ? [...this.loadedContacts, ...contacts] : contacts;

    const newNodes: PeDataGridItem[] = contacts.map((contact: any) => this.createDataGridItem(contact));

    const gridItemsValue: PeDataGridItem[] = append ? [...this.gridItems$.value, ...newNodes] : newNodes;
    this.gridItems$.next(gridItemsValue);
  }

  private createDataGridItem(contact: any): PeDataGridItem {
    const contactMainInfo: ContactMainInfo = getContactDisplayFields(contact);
    const country: Country = contactMainInfo.country ? Object.values(countries).find(c => c.name === contactMainInfo.country) : null;
    console.log(contact);
    return {
      id: contact._id,
      image: contactMainInfo.imageUrl || `${this.assetsPath}/contact-icon-onwhite.svg`,
      title: contactMainInfo.fullName,
      selected: false,
      actions: [
        {
          label: contactMainInfo.fullName,
          callback: (id: string) => this.dialogsService.openContactsWidgetDialog(id, contactMainInfo.fullName),
        }
      ],
      labels: contactMainInfo.status ? [contactMainInfo.status] : [],
      customFields: [
        { content: contactMainInfo.status ? contactMainInfo.status : ['New'] },
        { content: country?.name },
        { content: `€ ${contact.totalSpent}` },
        { content: `€ ${contact.totalSpent}` },
        { component: EmployeesCellComponent }
      ],
    };
  }

  onHeaderClick(i): void {
  }

  toggleSidebar(): void {
    this.dataGridSidebarService.toggleFilters$.next();
  }

  onChangeView($event: PeDataGridLayoutType): void {
    this.viewMode = $event;
  }

  onGridContentContextMenu(data): void {
    if (data.event === DataGridContextMenuEnum.Edit) {
      this.dialogsService.openContactDialog();
    }
  }

  openContextMenu(event: any, item, context): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();

      this.contextMenuClickedItem = item || null;
      this.contextRef = this.overlay.create({
        positionStrategy: this.overlay
          .position()
          .flexibleConnectedTo(event)
          .withFlexibleDimensions(false)
          .withViewportMargin(10)
          .withPositions(OVERLAY_POSITIONS),
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
        hasBackdrop: true,
        backdropClass: 'connect-context-menu-backdrop',
      });

      this.contextRef.backdropClick().pipe(
        tap(() => this.closeContextMenu()),
      ).subscribe();

      this.contextRef.attach(new TemplatePortal(context, this.viewContainerRef));
    }
  }

  onDeleteItem = () => {
    if (this.contextMenuClickedItem) {
      this.contextRef.dispose();
      this.cdr.detectChanges();
    }
  }

  onEditItem = () => {
    if (this.contextMenuClickedItem) {
      this.contextRef.dispose();
      this.cdr.detectChanges();
    }
  }

  onDuplicateItem = () => {
    if (this.contextMenuClickedItem) {
      this.contextRef.dispose();
      this.cdr.detectChanges();
    }
  }

  closeContextMenu(): void {
    if (this.contextRef) {
      this.contextRef.dispose();
    }
  }

  fillContextMenu(): void {
    this.contextActions = [
      {
        label: 'Edit',
        callback: this.onEditItem,
      },
      {
        label: 'Delete',
        callback: this.onDeleteItem,
      },
      {
        label: 'Duplicate',
        callback: this.onDuplicateItem,
      },
    ];
  }

  importFile(e: any): void {
  }

  downloadFile(event: Event, name: string): void {
    event.preventDefault();
  }

  onMenuClosed(): void {
  }
}
