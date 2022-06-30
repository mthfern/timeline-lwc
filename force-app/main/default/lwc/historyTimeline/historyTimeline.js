import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import getTimelineRecords from '@salesforce/apex/TimelineService.getTimelineRecords';
import getTimelineTypes from '@salesforce/apex/TimelineService.getTimelineTypes';

import LOCALE from '@salesforce/i18n/locale';

import LABEL_SEARCHPLACEHOLDER from '@salesforce/label/c.HistoryTimeline_SearchPlaceholder';
import LABEL_REFRESH from '@salesforce/label/c.HistoryTimeline_Refresh';
import LABEL_COLLAPSEALL from '@salesforce/label/c.HistoryTimeline_CollapseAll';
import LABEL_EXPANDALL from '@salesforce/label/c.HistoryTimeline_ExpandAll';
import LABEL_UPCOMING from '@salesforce/label/c.HistoryTimeline_Upcoming';
import LABEL_NOACTIVITIES from '@salesforce/label/c.HistoryTimeline_NoActivities';
import LABEL_NOPASTACTIVITY from '@salesforce/label/c.HistoryTimeline_NoPastActivity';
import LABEL_NOMOREPASTACTIVITIES from '@salesforce/label/c.HistoryTimeline_NoMorePastActivity';
import LABEL_CREATEDITEM from '@salesforce/label/c.HistoryTimeline_CreatedItem';

export default class HistoryTimeline extends NavigationMixin(LightningElement) {
  @api recordId;
  @api objectApiName;
  @api timelineParent;
  @api timelineView;
  @api earliestRange;
  @api latestRange;

  labels = {
    searchPlaceholder: LABEL_SEARCHPLACEHOLDER,
    refresh: LABEL_REFRESH,
    expandAll: LABEL_EXPANDALL,
    collapseAll: LABEL_COLLAPSEALL,
    noActivities: LABEL_NOACTIVITIES,
    noPastActivity: LABEL_NOPASTACTIVITY,
    noMoreActivities: LABEL_NOMOREPASTACTIVITIES,
    createdItem: LABEL_CREATEDITEM
  };

  @track activitySections = [{ name: LABEL_UPCOMING, items: [] }];
  @track activeSections = [LABEL_UPCOMING];
  renderStyles = false;
  renderExpandedSections = false;
  searchString = '';

  timelineTypes;
  timelineRecords;

  get noActivities() {
    return (
      this.activitySections.length === 1 &&
      this.activitySections[0].items.length === 0
    );
  }

  get noUpcomingActivities() {
    return this.activitySections[0].items.length === 0;
  }

  @wire(getTimelineTypes, {
    parentObjectId: '$recordId',
    parentFieldName: '$timelineParent',
    viewName: '$timelineView'
  })
  wiredGetTimelineTypes({ data, error }) {
    if (data) {
      this.timelineTypes = data;
      this.loadActivityData();
    }

    if (error) {
      this.timelineTypes = undefined;
      console.error(error);
    }
  }

  renderedCallback() {
    if (this.renderStyles) {
      this.setCustomStyle();
      this.renderStyles = false;
    }

    if (this.renderExpandedSections) {
      this.expandAllSections();
      this.renderExpandedSections = false;
    }
  }

  loadActivityData() {
    getTimelineRecords({
      parentObjectId: this.recordId,
      earliestRange: this.earliestRange,
      latestRange: this.latestRange,
      parentFieldName: this.timelineParent
    })
      .then(result => {
        this.timelineRecords = result;
        this.activitySections = this.getActivitySections();
        this.renderStyles = true;
        this.renderExpandedSections = true;
      })
      .catch(error => {
        this.timelineRecords = undefined;
        this.activitySections = undefined;
        console.error(error);
      });
  }

  getActivitySections() {
    const sections = [];
    const sectionsWrapper = {};
    sectionsWrapper[LABEL_UPCOMING] = [];

    for (const item of this.timelineRecords) {
      if (
        this.filterTypes(item.objectName) &&
        (this.filterSearch(item.activitySubjectField) ||
          this.filterSearch(item.objectName))
      ) {
        const activityDate = new Date(item.positionDateValue);
        const localeActivityDate = new Intl.DateTimeFormat(LOCALE, {
          month: 'long',
          year: 'numeric'
        }).format(activityDate);
        const sectionName = this.isPastDate(activityDate)
          ? `${localeActivityDate
              .split('')[0]
              .toUpperCase()}${localeActivityDate.slice(1)}`
          : LABEL_UPCOMING;

        const newItem = {
          ...item,
          createdByUserUrl: `/${item.createdById}`,
          objectUrl: `/${item.objectId}`,
          activityDate: activityDate.toISOString(),
          displayRecordForm: item.displayActivityRecordForm === 'true'
        };

        if (sectionsWrapper[sectionName]) {
          sectionsWrapper[sectionName].push(newItem);
        } else {
          sectionsWrapper[sectionName] = [newItem];
        }
      }
    }

    for (const name in sectionsWrapper) {
      if (Object.hasOwn(sectionsWrapper, name)) {
        sections.push({
          name: name,
          items: sectionsWrapper[name]
        });
      }
    }

    return sections;
  }

  filterTypes(value) {
    return Object.hasOwn(this.timelineTypes, value);
  }

  filterSearch(value) {
    if (this.searchString) {
      const searchTerms = this.searchString
        .toLowerCase()
        .split(' ')
        .filter(el => el.length > 2);
      return searchTerms.every(el => String(value).toLowerCase().includes(el));
    }
    return true;
  }

  isPastDate(date) {
    return date.setUTCHours(0, 0, 0, 0) <= new Date().setUTCHours(0, 0, 0, 0);
  }

  getAllSections() {
    const sections = [];
    for (const section of this.activitySections) {
      sections.push(section.name);
    }
    return sections;
  }

  setCustomStyle() {
    for (const section of this.activitySections) {
      for (const item of section.items) {
        const color = item.iconBackground;
        const element = this.template.querySelector(
          `div[data-item-id='${item.objectId}']`
        );

        element.style.setProperty('--custom-timelineItemBgColor', color);
      }
    }
  }

  handleSearch(event) {
    this.searchString = event.target.value;
    this.activitySections = this.getActivitySections();
    if (this.searchString) {
      this.renderExpandedSections = true;
    }
  }

  handleRefresh() {
    this.loadActivityData();
  }

  handleExpandAll() {
    this.expandAllSections();
  }

  expandAllSections() {
    this.activeSections = this.getAllSections();
  }

  handleCollapseAll() {
    this.activeSections = [];
  }

  handleSectionToggle(event) {
    this.activeSections = event.detail.openSections;
  }

  toggleItemDetails(event) {
    event.currentTarget
      .closest(`div[data-name="item-container"]`)
      .classList.toggle('slds-is-open');
  }

  handleMenuOption(event) {
    const action = event.detail.value;
    if (action === 'edit') {
      const recordId = event.currentTarget.closest('li').dataset.itemId;
      this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
          recordId,
          actionName: 'edit'
        }
      });
    }
  }
}
