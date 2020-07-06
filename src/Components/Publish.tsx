import * as React from 'react';
import { render } from 'react-dom';

import { css } from 'emotion';
import relativeDate from "relative-date";

import {
  Button,
  Icon,
  Dropdown,
  DropdownList,
  DropdownListItem,
  TextLink,
  Paragraph
} from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { SidebarExtensionSDK } from 'contentful-ui-extensions-sdk';

import StatusBadge from './StatusBadge';

export class Publish extends React.Component<{sdk: SidebarExtensionSDK}> {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      entrySys: this.props.sdk.entry.getSys(),
      approvalStatus: this.props.sdk.entry.fields.approvalStatus.getValue() || '',
    }
  }

  const root = document.getElementById('root');

  const styles = {
    actionRestrictionNote: css({
      color: tokens.colorTextLight,
      marginTop: tokens.spacingXs,
    }),
    statusMore: css({
      color: tokens.colorTextLight,
      marginTop: tokens.spacingS
    }),
    wrapper: css({
      fontFamily: tokens.fontStackPrimary,
      fontSize: tokens.fontSizeM,
    }),
    scheduleListItem: css({
      lineHeight: tokens.spacingM,
      display: 'flex',
      alignItems: 'center',
      marginBotton: `-${tokens.spacingS}`,
      '> button': {
        height: '2.5rem'
      }
    }),
    scheduleListItemInnerWrapper: css({
      lineHeight: tokens.spacingM,
      display: 'flex',
      alignItems: 'center'
    }),
    scheduledIcon: css({
      marginRight: tokens.spacing2Xs
    })
  };

  detachSysChangeHandler: Function | null = null;
  detachApprovalChangeHandler: Function | null = null;

  getStatus = () => {
    if (!this.state.entrySys.publishedVersion) {
      return 'draft';
    }
    else if (!!this.state.entrySys.publishedVersion && this.state.entrySys.version >= this.state.entrySys.publishedVersion + 2) {
      return 'changes';
    }
    else if (!!this.state.entrySys.publishedVersion && this.state.entrySys.version == this.state.entrySys.publishedVersion + 1) {
      return 'published';
    }
    else if (!!this.state.entrySys.archivedVersion) {
      return 'archived';
    }
  }

  getActions = () => {
    actions = [
      'publish' => {},
      'unpublish' => {},
      'archive' => {},
      'unarchive' => {},
      'schedule' => {}
    ]
  }

  onPublish = () => {
    console.log('Publish')
  }

  onArchive = () => {
    console.log('Archive')
  }

  onSchedule =() => {
    console.log('Schedule')
  }

  onExternalSysChange = (value: object) => {
    this.setState({entrySys: value})
  }

  onExternalApprovalChange = (value: string) => {
    this.setState({approvalStatus: value})
  }
  componentDidMount = () => {
    this.props.sdk.window.startAutoResizer();

    this.detachSysChangeHandler = this.props.sdk.entry.onSysChanged(this.onExternalSysChange);
    this.detachApprovalChangeHandler = this.props.sdk.entry.fields.approvalStatus.onValueChanged(this.onExternalApprovalChange);
  }

  componentDidUpdate = () => {
    if (this.state.isOpen) {
      let dropdownStyles = window.getComputedStyle(document.querySelector('.approval-dropdown'), null)
      let dropdownOffset = parseInt(dropdownStyles.height) + parseInt(dropdownStyles.top)
      if (dropdownOffset > this.root.clientHeight) {
        this.root.style.height = `${dropdownOffset}px`;
      }
    }
    else {
      this.root.removeAttribute("style")
    }
  }

  componentWillUnmount = () => {
    if (this.detachSysChangeHandler) {
      this.detachSysChangeHandler();
    }
    if (this.detachApprovalChangeHandler) {
      this.detachApprovalChangeHandler();
    }
  }

  render = () => {
    const status = this.getStatus()
    const ago = relativeDate(
      new Date(this.state.entrySys.updatedAt)
    )
    return (
      <div className={this.styles.wrapper}>
        <StatusBadge status={status} />
        <div id="approval-workflow-wrapper">
          <div className="publish-buttons-row">
            <Button
              isFullWidth
              buttonType="positive"
              testId="change-state-published"
              onClick={this.onPublish}
              className="primary-publish-button"
              disabled={!(this.state.approvalStatus === "Ready for Publication")}
            >
              Publish
            </Button>
            <Dropdown
              className="secondary-publish-button-wrapper"
              position="bottom-right"
              isAutoalignmentEnabled={false}
              isOpen={this.state.isOpen}
              onClose={() => this.setState({isOpen:false})}
              toggleElement={
                <Button
                  className="secondary-publish-button"
                  isFullWidth
                  testId="change-state-menu-trigger"
                  buttonType="positive"
                  indicateDropdown
                  onClick={() => this.setState({isOpen:!this.state.isOpen})}
                />
              }
              dropdownContainerClassName='approval-dropdown'
            >
              <DropdownList testId="change-state-menu">
                <DropdownListItem isTitle>Change status to</DropdownListItem>
                <DropdownListItem onClick={this.onArchive}>
                  Archive
                </DropdownListItem>
                <DropdownListItem
                  className={this.styles.scheduleListItem}
                  onClick={this.onSchedule}
                >
                  <div className={this.styles.scheduleListItemInnerWrapper}>
                    <Icon
                      icon="Clock"
                      size="small"
                      color="muted"
                      className={this.styles.scheduledIcon}
                    />
                    Set Schedule
                  </div>
                </DropdownListItem>
              </DropdownList>
            </Dropdown>
          </div>
          <Paragraph className={this.styles.actionRestrictionNote}>
            <Icon
              icon="Lock"
              size="small"
              color="muted"
              className="action-restricted__icon"
            />
            You do not have permission to publish
          </Paragraph>
        </div>
        <div className={`${this.styles.statusMore} entity-sidebar__status-more`}>
          <div className="entity-sidebar__save-status">
            <i className="entity-sidebar__saving-spinner" />
            <span className="entity-sidebar__last-saved" data-test-id="last-saved">
              Last saved {ago}
            </span>
          </div>
        </div>
      </div>
    );
  }
}
