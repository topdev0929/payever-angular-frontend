export interface App {
    id?: number;
    name: string;
    image?: string;
    image_mobile?: string;
    image_tablet?: string;
    image_mac?: string;
    url?: string;
    location?: string;
    position?: number;
    priority?: number;
    internal?: boolean;
    label: string;
    is_configured?: any;
    intro_shown?: any;
    hasUnreadMessages?: any;
    last_opened?: Date;
    description?: any;
    image_description?: any;
    integration_header?: any;
    integration_description?: any;
}

export interface StoreItem {
    id: number;
    name: string;
    image: string;
    image_mobile?: any;
    image_tablet?: any;
    image_mac?: any;
    url?: string;
    location: string;
    position: number;
    priority: number;
    internal: boolean;
    label: string;
    is_configured: boolean;
    intro_shown: boolean;
    hasUnreadMessages?: any;
    last_opened?: any;
    description: string;
    image_description?: any;
    integration_header: string;
    integration_description: string;
}

export interface Action {
    name: string;
    type: string;
    url?: string;
}

export interface Notification {
    uuid: string;
    created_at: any;
    logo: string;
    headline: string;
    subline: string;
    settings: boolean;
    actions: Action[];
}

export interface DashboardSettings {
    dashboardType?: string,
    backgroundImage?: string,
    isDockerInitialized?: boolean,
    titleTodos?: string,
    titleStores?: string,
    titleShop?: string,
    titleApps?: string,
    titleTalk?: string,
    titleSettings?: string,
    titleHelp?: string,
    privateAccountLink?: string,
    businessAccountLink?: string,
    businessCommunicationLink?: string,
    helpLink?: string,
    titleNoOffers?: string,
    titleNoNotifications?: string,
    titleCategoryAll?: string,
    titleCategoryRun?: string,
    titleCategoryStart?: string,
    titleCategoryGrow?: string
};

