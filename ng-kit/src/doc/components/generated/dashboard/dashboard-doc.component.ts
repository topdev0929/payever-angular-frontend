import { Component } from '@angular/core';
import { App, StoreItem, Notification, DashboardSettings } from './dashboard-doc.interface';

@Component({
  selector: 'doc-dashboard',
  templateUrl: 'dashboard-doc.component.html'
})

export class DashboardDocComponent {

  appsList: App[] = [];
  storesList: StoreItem[] = [];
  notificationsList: Notification[] = [];
  settings: DashboardSettings;
  settingsList: App[];

  constructor() {

    this.settings = {
      dashboardType: 'business',
      backgroundImage: 'assets/img/background-mini.png',
      isDockerInitialized: true,

      // main chapters
      titleTodos: 'ToDos',
      titleStores: 'Store',
      titleShop: 'Shop',
      titleApps: 'Apps',
      titleTalk: 'Talk',
      titleSettings: 'Settings',
      titleHelp: 'Need some help?',
      privateAccountLink: '/link/to/account',
      businessAccountLink: '/link/to/account',
      businessCommunicationLink: '/link/to/app',
      helpLink: '/link/to/help',
      titleNoOffers: 'No offers',
      titleNoNotifications: 'No notifications',

      // category
      titleCategoryAll: 'All',
      titleCategoryRun: 'Run',
      titleCategoryStart: 'Start',
      titleCategoryGrow: 'Grow'
    };

    this.settingsList = [
      {
        name:'Business Details',
        label:'settings-account'
      },
      {
        name:'Dashboard image',
        label:'settings-dashboard-skin'
      },
      {
        name:'Passcode',
        label:'settings-passcode'
      },
      {
        name:'Staff & Accesses',
        label:'settings-staff'
      },
      {
        name:'Translations',
        label:'settings-translations'
      },
      {
        name:'Affiliates',
        label:'settings-affiliates'
      },
      {
        name:'Built-in Apps',
        label:'settings-builtin-applications'
      },
      {
        name:'Notifications',
        label:'settings-notifications'
      }
    ];

    this.appsList = [
     {
       'id':31,
       'name':'Payments',
       'image':'https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/payment_options.png?v7.3.0',
       "image_mobile":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/payment_options_mobile.png?v7.3.0",
       "image_tablet":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/payment_options_mobile.png?v7.3.0",
       "image_mac":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/payment_options_mac.png?v7.3.0",
       "url":"\/business\/xxxlutz\/payment-options\/start",
       "location":"top",
       "position":60,
       "priority":0,
       "internal":false,
       "label":"payment_options",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":32,
       "name":"My Stores",
       "image":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/my_stores.png?v7.3.0",
       "image_mobile":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/my_stores_mobile.png?v7.3.0",
       "image_tablet":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/my_stores_mobile.png?v7.3.0",
       "image_mac":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/my_stores_mac.png?v7.3.0",
       "url":"\/business\/xxxlutz\/my_stores",
       "location":"bottom",
       "position":5,
       "priority":0,
       "internal":false,
       "label":"my_stores",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":33,
       "name":"Orders",
       "image":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/transactions.png?v7.3.0",
       "image_mobile":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/transactions_mobile.png?v7.3.0",
       "image_tablet":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/transactions_mobile.png?v7.3.0",
       "image_mac":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/transactions_mac.png?v7.3.0",
       "url":"\/business\/xxxlutz\/orders",
       "location":"bottom",
       "position":1,
       "priority":0,
       "internal":false,
       "label":"transactions",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":34,
       "name":"Communication",
       "image":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/communication.png?v7.3.0",
       "image_mobile":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/communication_mobile.png?v7.3.0",
       "image_tablet":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/communication_mobile.png?v7.3.0",
       "image_mac":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/communication_mac.png?v7.3.0",
       "url":"\/business\/xxxlutz\/conversation",
       "location":"bottom",
       "position":4,
       "priority":0,
       "internal":false,
       "label":"communication",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":false,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":35,
       "name":"Products",
       "image":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/products_app.png?v7.3.0",
       "image_mobile":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/products_app_mobile.png?v7.3.0",
       "image_tablet":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/products_app_mobile.png?v7.3.0",
       "image_mac":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/products_app_mac.png?v7.3.0",
       "url":"\/business\/xxxlutz\/items","location":"bottom","position":2,"priority":0,
       "internal":false,
       "label":"products_app",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":38,
       "name":"Statistics",
       "image":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/statistics.png?v7.3.0",
       "image_mobile":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/statistics_mobile.png?v7.3.0",
       "image_tablet":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/statistics_mobile.png?v7.3.0",
       "image_mac":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/statistics_mac.png?v7.3.0",
       "url":"\/business\/xxxlutz\/statistics-app",
       "location":"top",
       "position":70,
       "priority":0,
       "internal":false,
       "label":"statistics",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":39,
       "name":"App Market",
       "image":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/add_channel.png?v7.3.0",
       "image_mobile":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/add_channel_mobile.png?v7.3.0",
       "image_tablet":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/add_channel_mobile.png?v7.3.0",
       "image_mac":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/add_channel_mac.png?v7.3.0",
       "url":"\/business\/xxxlutz\/channels\/market\/gateway",
       "location":"top",
       "position":20,
       "priority":0,
       "internal":false,
       "label":"add_channel",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":40,
       "name":"Customers",
       "image":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/contacts_app.png?v7.3.0",
       "image_mobile":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/contacts_app_mobile.png?v7.3.0",
       "image_tablet":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/contacts_app_mobile.png?v7.3.0",
       "image_mac":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/contacts_app_mac.png?v7.3.0",
       "url":"\/business\/xxxlutz\/contacts-app",
       "location":"top",
       "position":120,
       "priority":0,
       "internal":false,
       "label":"contacts_app",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":41,
       "name":"Settings",
       "image":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/settings.png?v7.3.0",
       "image_mobile":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/settings_mobile.png?v7.3.0",
       "image_tablet":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/settings_mobile.png?v7.3.0",
       "image_mac":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/settings_mac.png?v7.3.0",
       "url":"\/business\/xxxlutz\/settings",
       "location":"top",
       "position":90,
       "priority":0,
       "internal":false,
       "label":"settings",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":44,
       "name":"POS",
       "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/pos.png",
       "image_mobile":null,
       "image_tablet":null,
       "image_mac":"https:\/\/showroom6.payever.de\/media\/cache\/resolve\/channels.list\/41763456e0792a9596d9e22707bbd2e2.png",
       "url":"\/business\/xxxlutz\/channel-sets\/pos",
       "location":"top",
       "position":50,
       "priority":0,
       "internal":true,
       "label":"pos",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":45,
       "name":"Marketing",
       "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/marketing.png",
       "image_mobile":null,
       "image_tablet":null,
       "image_mac":"https:\/\/showroom6.payever.de\/media\/cache\/resolve\/channels.list\/0a33f963fed03ae159a245e9d88665dc.png",
       "url":"\/business\/xxxlutz\/channel-sets\/marketing",
       "location":"top",
       "position":80,
       "priority":0,
       "internal":false,
       "label":"marketing",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":23673,
       "name":"Overlay",
       "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/overlay.png",
       "image_mobile":null,
       "image_tablet":null,
       "image_mac":null,
       "url":"\/business\/xxxlutz\/channel-sets\/overlay",
       "location":"top",
       "position":30,
       "priority":0,
       "internal":false,
       "label":"overlay",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":27281,
       "name":"Apps",
       "image":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/dashboard.png?v7.3.0",
       "image_mobile":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/dashboard_mobile.png?v7.3.0",
       "image_tablet":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/dashboard_mobile.png?v7.3.0",
       "image_mac":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/dashboard_mac.png?v7.3.0",
       "url":"\/business\/xxxlutz\/dashboard",
       "location":"bottom",
       "position":3,
       "priority":0,
       "internal":false,
       "label":"dashboard",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":31547,
       "name":"e-conomic",
       "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/e-conomic.png",
       "image_mobile":"https:\/\/showroom6.payever.de\/media\/cache\/resolve\/channels.list\/675e8d229d928764f407b64106df23c1.png",
       "image_tablet":null,
       "image_mac":"https:\/\/showroom6.payever.de\/media\/cache\/resolve\/channels.list\/cca20da061359058a2cea497ebd823cd.png",
       "url":"\/business\/xxxlutz\/channel-sets\/e-conomic",
       "location":"top",
       "position":100,
       "priority":0,
       "internal":false,
       "label":"e-conomic",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":33647,
       "name":"Live Support",
       "image":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/live_support.png?v7.3.0",
       "image_mobile":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/live_support_mobile.png?v7.3.0",
       "image_tablet":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/live_support_mobile.png?v7.3.0",
       "image_mac":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/live_support_mac.png?v7.3.0",
       "url":"\/business\/xxxlutz\/live-support\/gateway",
       "location":"top",
       "position":10,
       "priority":0,
       "internal":false,
       "label":"live_support",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":311056,
       "name":"Debitoor",
       "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/debitoor.png",
       "image_mobile":null,
       "image_tablet":null,
       "image_mac":"https:\/\/showroom6.payever.de\/media\/cache\/resolve\/channels.list\/1d999623895e0d4083ea7b78584f34b6.png",
       "url":"\/business\/xxxlutz\/channel-sets\/debitoor",
       "location":"top",
       "position":40,
       "priority":0,
       "internal":false,
       "label":"debitoor",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":320340,
       "name":"Finance Express",
       "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/finance_express.png",
       "image_mobile":null,
       "image_tablet":null,
       "image_mac":null,
       "url":"\/business\/xxxlutz\/channel-sets\/finance_express",
       "location":"top",
       "position":110,
       "priority":0,
       "internal":false,
       "label":"finance_express",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":4580250,
       "name":"Trust",
       "image":"https:\/\/showroom6.payever.de\/micro-vhost\/trust\/frontend\/logo.png",
       "image_mobile":"https:\/\/showroom6.payever.de\/micro-vhost\/trust\/frontend\/logo.png",
       "image_tablet":"https:\/\/showroom6.payever.de\/micro-vhost\/trust\/frontend\/logo.png",
       "image_mac":"https:\/\/showroom6.payever.de\/micro-vhost\/trust\/frontend\/logo.png",
       "url":"\/business\/xxxlutz\/trust",
       "location":"top",
       "position":140,
       "priority":0,
       "internal":false,
       "label":"trust",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     },
     {
       "id":8212878,
       "name":"Shipping",
       "image":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/shipping.png?v7.3.0",
       "image_mobile":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/shipping_mobile.png?v7.3.0",
       "image_tablet":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/shipping_mobile.png?v7.3.0",
       "image_mac":"https:\/\/showroom6.payever.de\/images\/dashboard\/V2\/shipping_mac.png?v7.3.0",
       "url":"\/business\/xxxlutz\/shipping",
       "location":"top",
       "position":130,
       "priority":0,
       "internal":false,
       "label":"shipping",
       "is_configured":null,
       "intro_shown":null,
       "hasUnreadMessages":null,
       "last_opened":null,
       "description":null,
       "image_description":null,
       "integration_header":null,
       "integration_description":null
     }
    ];

     this.storesList = [
        {
            "id":42,
            "name":"Store",
            "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/store.png",
            "image_mobile":null,
            "image_tablet":null,
            "image_mac":null,
            "url":"\/business\/xxxlutz\/channel-sets\/store",
            "location":"top",
            "position":14,
            "priority":0,
            "internal":true,
            "label":"store",
            "is_configured":true,
            "intro_shown":true,
            "hasUnreadMessages":null,
            "last_opened":null,
            "description":"\u003Cp\u003ECreate your personal store in minutes and start selling directly on your website or via shared link.\u003C\/p\u003E",
            "image_description":null,
            "integration_header":"Store",
            "integration_description":"Store"
        },
       {
         "id":21614,
         "name":"Magento",
         "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/magento.png",
         "image_mobile":null,
         "image_tablet":null,
         "image_mac":null,
         "url":"\/business\/xxxlutz\/channel-sets\/magento",
         "location":"top",
         "position":33,
         "priority":2,
         "internal":false,
         "label":"magento",
         "is_configured":true,
         "intro_shown":true,
         "hasUnreadMessages":null,
         "last_opened":null,
         "description":"\u003Cp\u003EInstall our Magento plugin and accept all payment options in your&nbsp;online store.\u003C\/p\u003E\r\n\r\n\u003Cp\u003EAdd more payment options to your store in minutes:\u003C\/p\u003E\r\n\r\n\u003Cp\u003E1. Add the payment options you need\u003C\/p\u003E\r\n\r\n\u003Cp\u003E2. Configure instructions of the payment options to include on your webpage (optional)\u003C\/p\u003E\r\n\r\n\u003Cp\u003E3. Add&nbsp;more apps,&nbsp;for example, to keep track of your accounting (optional)\u003C\/p\u003E\r\n\r\n\u003Cp\u003E4. Download the plugin and the instructions\u003C\/p\u003E",
         "image_description":"https:\/\/showroom6.payever.de\/media\/cache\/resolve\/channels.description\/2062d62ed61937ba93ea0129efc103ea.jpg",
         "integration_header":"Magento Plugin",
         "integration_description":"Download our Magento plugin here. You can start accepting all payment methods provided by payever in a minute."
       },
       {
         "id":21619,
         "name":"OXID",
         "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/oxid.png",
         "image_mobile":null,
         "image_tablet":null,
         "image_mac":null,
         "url":"\/business\/xxxlutz\/channel-sets\/oxid",
         "location":"top",
         "position":38,
         "priority":6,
         "internal":false,
         "label":"oxid",
         "is_configured":true,
         "intro_shown":true,
         "hasUnreadMessages":null,
         "last_opened":null,
         "description":"\u003Cp\u003EActivate OXID and set up the channel to accept all payment methods in your online shop.\u003C\/p\u003E",
         "image_description":"https:\/\/showroom6.payever.de\/media\/cache\/resolve\/channels.description\/d0efc225d8d032b850a0806bf6869329.jpg",
         "integration_header":"OXID Plugin",
         "integration_description":"Download our OXID plugin here. You can start accepting all payment methods provided by payever in a minute."
       },
       {
         "id":21620,
         "name":"xt:Commerce",
         "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/xt_commerce.png",
         "image_mobile":null,
         "image_tablet":null,
         "image_mac":null,
         "url":"\/business\/xxxlutz\/channel-sets\/xt_commerce",
         "location":"top",
         "position":39,
         "priority":7,
         "internal":false,
         "label":"xt_commerce",
         "is_configured":false,
         "intro_shown":true,
         "hasUnreadMessages":null,
         "last_opened":null,
         "description":"\u003Cp\u003EActivate xt:Commerce&nbsp;and set up the channel to accept all payment methods in your online shop.\u003C\/p\u003E",
         "image_description":"https:\/\/showroom6.payever.de\/media\/cache\/resolve\/channels.description\/96c23e4fb3fe3c2066b6120f779d02b6.jpg",
         "integration_header":"xt:Commerce Plugin",
         "integration_description":"Download our xt:Commerce plugin here. You can start accepting all payment methods provided by payever in a minute."
       },
       {
         "id":22729,
         "name":"Facebook",
         "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/facebook.png",
         "image_mobile":null,
         "image_tablet":null,
         "image_mac":null,
         "url":"\/business\/xxxlutz\/channel-sets\/facebook",
         "location":"top",
         "position":45,
         "priority":0,
         "internal":true,
         "label":"facebook",
         "is_configured":true,
         "intro_shown":true,
         "hasUnreadMessages":null,
         "last_opened":null,
         "description":"\u003Cp\u003ESearching for a new selling channel? How about 1 billion potential customers? Start selling on facebook in minutes.\u003C\/p\u003E",
         "image_description":null,
         "integration_header":"Facebook",
         "integration_description":"Integration with Facebook"
       },
       {
         "id":23077,
         "name":"PrestaShop",
         "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/presta.png",
         "image_mobile":null,
         "image_tablet":null,
         "image_mac":null,
         "url":"\/business\/xxxlutz\/channel-sets\/presta",
         "location":"top",
         "position":89,
         "priority":4,
         "internal":false,
         "label":"presta",
         "is_configured":true,
         "intro_shown":true,
         "hasUnreadMessages":null,
         "last_opened":null,
         "description":"\u003Cp\u003EActivate PrestaShop and set up the channel to accept all payment methods in your online shop.\u003C\/p\u003E",
         "image_description":"https:\/\/showroom6.payever.de\/media\/cache\/resolve\/channels.description\/ac5287bf92463d274aa61aee7291881d.jpg",
         "integration_header":"PrestaShop Plugin",
         "integration_description":"Download our PrestaShop plugin here. You can start accepting all payment methods provided by payever in a minute."
       },
       {
         "id":23078,
         "name":"WooCommerce",
         "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/wooCommerce.png",
         "image_mobile":null,
         "image_tablet":null,
         "image_mac":null,
         "url":"\/business\/xxxlutz\/channel-sets\/wooCommerce",
         "location":"top",
         "position":95,
         "priority":3,
         "internal":false,
         "label":"wooCommerce",
         "is_configured":true,
         "intro_shown":true,
         "hasUnreadMessages":null,
         "last_opened":null,
         "description":"\u003Cp\u003EActivate WooCommerce and set up the channel to accept all payment methods in your online shop.\u003C\/p\u003E\n\n\u003Cp\u003E&nbsp;\u003C\/p\u003E",
         "image_description":"https:\/\/showroom6.payever.de\/media\/cache\/resolve\/channels.description\/2b84c3f56e245cb75cc910ee7efe2347.jpg",
         "integration_header":"WooCommerce Plugin",
         "integration_description":"Download our WooCommerce plugin here. You can start accepting all payment methods provided by payever in a minute."
       },
       {
         "id":23148,
         "name":"JTL",
         "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/jtl.png",
         "image_mobile":null,
         "image_tablet":null,
         "image_mac":null,
         "url":"\/business\/xxxlutz\/channel-sets\/jtl",
         "location":"top",
         "position":96,
         "priority":5,
         "internal":false,
         "label":"jtl",
         "is_configured":true,
         "intro_shown":true,
         "hasUnreadMessages":null,
         "last_opened":null,
         "description":"\u003Cp\u003EActivate (shop system) and set up the channel to accept all payment methods in your online shop.\u003C\/p\u003E",
         "image_description":"https:\/\/showroom6.payever.de\/media\/cache\/resolve\/channels.description\/96c80f4f40114b4f2db214bcc65c04d6.jpg",
         "integration_header":"JTL Plugin",
         "integration_description":"Download our JTL plugin here. You can start accepting all payment methods provided by payever in a minute."
       },
       {
         "id":23149,
         "name":"Other Shop System",
         "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/other_shopsystem.png",
         "image_mobile":null,
         "image_tablet":null,
         "image_mac":null,
         "url":"\/business\/xxxlutz\/channel-sets\/other_shopsystem",
         "location":"top",
         "position":97,
         "priority":0,
         "internal":true,
         "label":"other_shopsystem",
         "is_configured":true,
         "intro_shown":true,
         "hasUnreadMessages":null,
         "last_opened":null,
         "description":"\u003Cp\u003EAre you using any shop system that is different from Magento, Shopware, Oxid, or Gambio? No problem! We give you a powerful API, simple widgets and buttons to integrate payever into your existing shop system.\u003C\/p\u003E",
         "image_description":null,
         "integration_header":"Other shop systems",
         "integration_description":"Other shop system"
       },
       {
         "id":23197,
         "name":"Shopware",
         "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/shopware.png",
         "image_mobile":null,
         "image_tablet":null,
         "image_mac":null,
         "url":"\/business\/xxxlutz\/channel-sets\/shopware",
         "location":"top",
         "position":99,
         "priority":1,
         "internal":false,
         "label":"shopware",
         "is_configured":true,
         "intro_shown":true,
         "hasUnreadMessages":null,
         "last_opened":null,
         "description":"\u003Cp\u003EInstall our Shopware plugin and accept all payment options in your&nbsp;online store.\u003C\/p\u003E\r\n\r\n\u003Cp\u003EMore than 200 Shopware stores are using our solution. Add more payment options to your store in minutes:\u003C\/p\u003E\r\n\r\n\u003Cp\u003E1. Add the payment options you need\u003C\/p\u003E\r\n\r\n\u003Cp\u003E2. Configure instructions of the payment options to include on your webpage (optional)\u003C\/p\u003E\r\n\r\n\u003Cp\u003E3. Add&nbsp;more apps,&nbsp;for example, to keep track of your accounting (optional)\u003C\/p\u003E\r\n\r\n\u003Cp\u003E4. Activate Finance Express&nbsp;(optional)\u003C\/p\u003E\r\n\r\n\u003Cp\u003E5. Download the plugin and the instructions either here or directly at the Shopware Store\u003C\/p\u003E",
         "image_description":"https:\/\/showroom6.payever.de\/media\/cache\/resolve\/channels.description\/492dccb4420d8ec1c607cbce4b04d754.jpg",
         "integration_header":"Shopware plugin",
         "integration_description":"Download our Shopware plugin here. You can start accepting all payment methods provided by payever in a minute."
       },
       {
         "id":23198,
         "name":"Shopify",
         "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/shopify.png",
         "image_mobile":null,
         "image_tablet":null,
         "image_mac":null,
         "url":"\/business\/xxxlutz\/channel-sets\/shopify",
         "location":"top",
         "position":100,
         "priority":8,
         "internal":false,
         "label":"shopify",
         "is_configured":true,
         "intro_shown":true,
         "hasUnreadMessages":null,
         "last_opened":null,
         "description":"Integrate payever in minutes and accept all payments in your Shopify store.",
         "image_description":"https:\/\/showroom6.payever.de\/media\/cache\/resolve\/channels.description\/2b842e6432b8f79ec3159ea1838a25c2.jpg",
         "integration_header":"Shopify",
         "integration_description":"Accept all payment options in your Shopify store. Create a link, generate API keys and specify them in the newly activated gateway options."
       },
       {
         "id":23375,
         "name":"Weebly",
         "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/weebly.png",
         "image_mobile":null,
         "image_tablet":null,
         "image_mac":null,
         "url":"\/business\/xxxlutz\/channel-sets\/weebly",
         "location":"top",
         "position":101,
         "priority":0,
         "internal":true,
         "label":"weebly",
         "is_configured":true,
         "intro_shown":true,
         "hasUnreadMessages":null,
         "last_opened":null,
         "description":"\u003Cp\u003EActivate Weebly and set up the channel to accept all payment methods in your online shop.\u003C\/p\u003E",
         "image_description":null,
         "integration_header":"Weebly",
         "integration_description":"Weebly"
       },
       {
         "id":27276,
         "name":"DanDomain",
         "image":"https:\/\/showroom6.payever.de\/media\/cache\/channels.list\/3794bbdc296906ed5e159cc5ea4c29ec.png",
         "image_mobile":null,
         "image_tablet":null,
         "image_mac":null,
         "url":"\/business\/xxxlutz\/channel-sets\/dandomain",
         "location":"top",
         "position":103,
         "priority":9,
         "internal":false,
         "label":"dandomain",
         "is_configured":true,
         "intro_shown":true,
         "hasUnreadMessages":null,
         "last_opened":null,
         "description":"\u003Cp\u003EIntegrate payever in minutes and accept all payment methods in your online shop.\u003C\/p\u003E",
         "image_description":"https:\/\/showroom6.payever.de\/media\/cache\/resolve\/channels.description\/336b61e72fc2fd6f30cf71092f165d75.jpg",
         "integration_header":"Dandomain",
         "integration_description":"Accept all payment methods in your DanDomain shop in a minute"
       }
       ];

     this.notificationsList = [
           {
             "uuid":"3fbf2b97-adcb-11e7-b08a-525400082e06",
             "created_at":"2017-10-10T12:18:58+00:00",
             "logo":"https:\/\/showroom6.payever.de\/notifications\/upload\/app_icons\/orders.png",
             "headline":"dfgdfgdfg",
             "subline":"dfgdfgdfgdf",
             "settings":false,
             "actions":[
                 {
                   "name":"skip",
                   "type":"skip"
                 }
                 ]
           },
           {
             "uuid":"3fbf1a09-adcb-11e7-b08a-525400082e06",
             "created_at":"2017-10-10T12:17:53+00:00",
             "logo":"https:\/\/showroom6.payever.de\/notifications\/upload\/app_icons\/orders.png",
             "headline":"qweqweqw33",
             "subline":"weqweqwe",
             "settings":false,
             "actions":[
                 {
                   "name":"skip",
                   "type":"skip"
                 }
                 ]
           },
           {
             "uuid":"b76d4edf-ada0-11e7-b08a-525400082e06",
             "created_at":"2017-10-09T15:54:25+00:00",
             "logo":"https:\/\/showroom6.payever.de\/notifications\/upload\/app_icons\/orders.png",
             "headline":"adjlskjfladsk fjdkslfj dlkfj",
             "subline":"sub",
             "settings":true,
             "actions":[
                 {
                   "name":"app",
                   "type":"app",
                   "url":"https:\/\/app.com\/where\/to\/go"
                 },
                 {
                   "name":"skip",
                   "type":"skip"
                 }
                 ]
            },
           {
             "uuid":"b76d4edf-ada0-11e7-b08a-525400082e06",
             "created_at":"2017-10-09T15:54:25+00:00",
             "logo":"https:\/\/showroom6.payever.de\/notifications\/upload\/app_icons\/orders.png",
             "headline":"adjlskjfladsk fjdkslfj dlkfj",
             "subline":"sub",
             "settings":true,
             "actions":[
               {
                 "name":"app",
                 "type":"app",
                 "url":"https:\/\/app.com\/where\/to\/go"
               },
               {
                 "name":"skip",
                 "type":"skip"
               }
             ]
           }
          ];
   }

  exampleJs: string = `

// Data
settingsList = [
  {
    dashboardType: 'private',
    backgroundImage: 'assets/img/background-mini.png',
    isDockerInitialized: true,

    // main chapters
    titleTodos: 'ToDos',
    titleStores: 'Store',
    titleShop: 'Shop',
    titleApps: 'Apps',
    titleTalk: 'Talk',
    titleSettings: 'Settings',
    titleHelp: 'Need some help?',
    privateAccountLink: '/link/to/account',
    businessAccountLink: '/link/to/account',
    businessCommunicationLink: '/link/to/app',
    helpLink: '/link/to/help',
    titleNoOffers: 'No offers',
    titleNoNotifications: 'No notifications',

    // category
    titleCategoryAll: 'All',
    titleCategoryRun: 'Run',
    titleCategoryStart: 'Start',
    titleCategoryGrow: 'Grow'
  }
];

appsList = [
  {
    'id': 31,
    'name': 'Payments',
    'image': 'icon',
    'image_mobile': '/icon/for/mobile',
    'image_tablet': '/icon/for/tablet',
    'image_mac': '/icon/for/mac',
    'url': '/link/to/app',
    'location': 'top',
    'position': 60,
    'priority': 0,
    'internal': false,
    'label': 'payment_options',
    'is_configured': null,
    'intro_shown': null,
    'hasUnreadMessages': null,
    'last_opened': null,
    'description': null,
    'image_description': null,
    'integration_header': null,
    'integration_description': null
  },
  ...
];

storesList = [
  {
    'id': 42,
    'name': 'Store',
    'image': '/path/to/icon',
    'image_mobile': null,
    'image_tablet': null,
    'image_mac': null,
    'url': '/link/to/store',
    'location': 'top',
    'position': 14,
    'priority': 0,
    'internal': true,
    'label': 'store',
    'is_configured': true,
    'intro_shown': true,
    'hasUnreadMessages': null,
    'last_opened': null,
    'description': 'Description',
    'image_description': null,
    'integration_header': 'Store',
    'integration_description': 'Store'
  },
  ...
];

notificationsList = [
  {
    'uuid': 'b76d4edf-ada0-11e7-b08a-525400082e06',
    'created_at': '2017-10-09T15:54:25+00:00',
    'logo': '/path/to/icon',
    'headline': 'Title',
    'subline': 'Description',
    'settings': true,
    'actions': [
      {
        'name': 'app',
        'type': 'app',
        'url': '/link/to/app'
      },
      {
        'name': 'skip',
        'type': 'skip'
      }
    ]
  },
  ...
];

this.settingsList = [
  {
    'name':'Business Details',
    'image_id':'#icon-settings-business',
    "url":"\/business\/xxxlutz\/payment-options\/start",
    'onSelect': function(item: SettingItem){
      alert('selected ' + item.name );
    }
  },
  ...
];
`;

   html1: string = `
<desktop-docker
  [settings] = "settings"
  [appsList] = "appsList"
  [storesList] = "storesList"
  [settingsList] = "settingsList"
  [notificationsList] = "notificationsList">
</desktop-docker>
<mobile-docker
  [settings] = "settings"
  [appsList] = "appsList"
  [storesList] = "storesList"
  [settingsList] = "settingsList"
  [notificationsList] = "notificationsList"
></mobile-docker>
   `;
}
