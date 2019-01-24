/*
 * Wazuh app - Management configuration controller
 * Copyright (C) 2015-2019 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import { ConfigurationHandler } from '../../utils/config-handler';

export class ConfigurationController {
  /**
   * Constructor
   * @param {*} $scope
   * @param {*} $location
   * @param {*} errorHandler
   * @param {*} apiReq
   * @param {*} appState
   * @param {*} wazuhConfig
   */
  constructor($scope, $location, errorHandler, apiReq, appState, wazuhConfig) {
    this.$scope = $scope;
    this.errorHandler = errorHandler;
    this.apiReq = apiReq;
    this.appState = appState;
    this.wazuhConfig = wazuhConfig;
    this.$location = $location;
    this.$scope.load = false;
    this.$scope.isArray = Array.isArray;
    this.configurationHandler = new ConfigurationHandler(apiReq, errorHandler);
    this.$scope.currentConfig = null;
    this.$scope.configurationTab = '';
    this.$scope.configurationSubTab = '';
    this.$scope.integrations = {};
    this.$scope.selectedItem = 0;
    this.$scope.selectedNode = false;
    this.$scope.nodes = [];
    this.$scope.editingFile = false;
    this.$scope.fetchedXML = false;
  }

  /**
   * When controller loads
   */
  $onInit() {

    this.init();
    const configuration = this.wazuhConfig.getConfig();
    this.$scope.adminMode = !!(configuration || {}).admin;
    this.$scope.getXML = () => this.configurationHandler.getXML(this.$scope);
    this.$scope.getJSON = () => this.configurationHandler.getJSON(this.$scope);
    this.$scope.isString = item => typeof item === 'string';
    this.$scope.hasSize = obj =>
      obj && typeof obj === 'object' && Object.keys(obj).length;
    this.$scope.switchConfigTab = (
      configurationTab,
      sections,
      navigate = true
    ) => {
      this.$scope.navigate = navigate;
      try {
        this.$scope.configSubTab = JSON.stringify({
          configurationTab: configurationTab,
          sections: sections
        });
        if (!this.$location.search().configSubTab) {
          this.appState.setSessionStorageItem(
            'configSubTab',
            this.$scope.configSubTab
          );
          this.$location.search('configSubTab', true);
        }
      } catch (error) {
        this.errorHandler.handle(error, 'Set configuration path');
      }
      this.configurationHandler.switchConfigTab(
        configurationTab,
        sections,
        this.$scope
      );
    };


   /**
   * Edit node configuration
   */
    const fetchFile = async () => {
      try {
        const data = await this.apiReq.request(
          'GET',
          `/cluster/${this.$scope.selectedNode}/configuration`,
          {}
        );
        const json = ((data || {}).data || {}).data || false;
        if (!json) {
          throw new Error('Could not fetch configuration file');
        }
        const xml = this.configurationHandler.json2xml(json);
        return xml;
      } catch (error) {
        return Promise.reject(error);
      }
    };

    this.$scope.closeEditingFile = () => {
      this.$scope.editingFile = false;
    }

    this.$scope.editConf = async () => {
      this.$scope.editingFile = true;
      try {
        this.$scope.fetchedXML = await fetchFile();
        this.$scope.$broadcast('fetchedFile', { data: this.$scope.fetchedXML });
      } catch (error) {
        this.$scope.fetchedXML = null;
        this.errorHandler.handle(error, 'Fetch file error');
      }
      if (!this.$scope.$$phase) this.$scope.$digest();
    };

    this.$scope.saveConfiguration = async () => {
      try{
        this.$scope.editingFile = false;
        this.$scope.$broadcast('saveXmlFile', { node: this.$scope.selectedNode});
      }catch( error ) {
        this.$scope.fetchedXML = null;
        this.errorHandler.handle(error, 'Save file error');
      }
        
    }

    this.$scope.xmlIsValid = valid => {
      this.$scope.xmlHasErrors = valid;
      if (!this.$scope.$$phase) this.$scope.$digest();
    };

    /**
     * Navigate to woodle
     */
    this.$scope.switchWodle = (wodleName, navigate = true) => {
      this.$scope.navigate = navigate;
      this.$scope.configWodle = wodleName;
      if (!this.$location.search().configWodle) {
        this.$location.search('configWodle', this.$scope.configWodle);
      }
      this.configurationHandler.switchWodle(wodleName, this.$scope);
    };

    /**
     * Navigate to configuration
     */
    this.$scope.switchConfigurationTab = (configurationTab, navigate) => {
      this.$scope.navigate = navigate;
      this.configurationHandler.switchConfigurationTab(
        configurationTab,
        this.$scope
      );
      if (!this.$scope.navigate) {
        let configSubTab = this.$location.search().configSubTab;
        if (configSubTab) {
          try {
            const config = this.appState.getSessionStorageItem('configSubTab');
            const configSubTabObj = JSON.parse(config);
            this.$scope.switchConfigTab(
              configSubTabObj.configurationTab,
              configSubTabObj.sections,
              false
            );
          } catch (error) {
            this.errorHandler.handle(error, 'Get configuration path');
          }
        } else {
          let configWodle = this.$location.search().configWodle;
          if (configWodle) {
            this.$scope.switchWodle(configWodle, false);
          }
        }
      } else {
        this.$location.search('configSubTab', null);
        this.appState.removeSessionStorageItem('configSubTab');
        this.$location.search('configWodle', null);
      }
    };

    /**
     * Navigate to configuration sub tab
     */
    this.$scope.switchConfigurationSubTab = configurationSubTab =>
      this.configurationHandler.switchConfigurationSubTab(
        configurationSubTab,
        this.$scope
      );
    this.$scope.updateSelectedItem = i => (this.$scope.selectedItem = i);
    this.$scope.getIntegration = list =>
      this.configurationHandler.getIntegration(list, this.$scope);

    this.$scope.$on('$routeChangeStart', () =>
      this.appState.removeSessionStorageItem('configSubTab')
    );

  }

  async init() {
    try {
      this.$scope.clusterStatus = await this.apiReq.request('GET', '/cluster/status', {});
      if (
        this.$scope.clusterStatus &&
        this.$scope.clusterStatus.data.data.enabled === 'yes' &&
        this.$scope.clusterStatus.data.data.running === 'yes'
      ) {
        const nodes = await this.apiReq.request('GET', '/cluster/nodes', {});
        this.$scope.nodes = nodes.data.data.items.reverse();
        const masterNode = nodes.data.data.items.filter(
          item => item.type === 'master'
        )[0];
        this.$scope.selectedNode = masterNode.name;
      }
    } catch (error) {
      this.errorHandler.handle(error, 'Error getting cluster status');
    }
    if (!this.$scope.$$phase) this.$scope.$digest();
  }
}
