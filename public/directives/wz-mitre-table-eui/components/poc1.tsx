/*
 * Wazuh app - React component for alerts stats.
 *
 * Copyright (C) 2015-2019 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Component } from 'react';
import {
  EuiPanel,
  EuiSwitch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiButtonEmpty
} from '@elastic/eui';
import { AttkPopover } from './attk-popover';

export class Poc1 extends Component {
  state: {
    showEmp: boolean
    showAtt: boolean
  }
  props!: {
    mitreobject: object
  }
  constructor(props) {
    super(props);
    this.state = {
      showAtt: false,
      showEmp: false,
    };
  }

  createTecnique(name, attacks_count, style) {
    const { showEmp } = this.state;
    return (
      <AttkPopover
        name={name}
        attacksCount={attacks_count}
        showEmp={showEmp}
        style={style} />
    )
  }

  render() {
    const { mitreobject } = this.props;
    const { showAtt, showEmp } = this.state;
    const tecniques = Object.keys(mitreobject)
    .map(tecn => this.createTecnique(tecn, mitreobject[tecn].attacks_count, { alignItems: 'center', background:'#006BB4'}));
    const tactics = Object.keys(mitreobject)
    .map(tecn => (
        <div>
          {mitreobject[tecn].techniques
          .map(tact =>
            this.createTecnique(tact.name, tact.attacks_count, { alignItems: 'center'})
          )}
        </div>
      )
    )
    return (
      <EuiPanel>
        <EuiSwitch 
          onChange={event => {this.setState(s => {return {showEmp: !s.showEmp}})}}
          checked={showEmp}
          label='Show tactics without alerts'
          />
        <EuiSpacer size="m" />
        <EuiFlexGroup style={{fontSize:12}} gutterSize='xs'>
          {tecniques}
        </EuiFlexGroup>
        {
          showAtt &&
          <EuiFlexGroup style={{fontSize:12}} gutterSize='xs'>
          {tactics}
          </EuiFlexGroup>
        }
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiButtonEmpty
              onClick={event => {this.setState(s => {return {showAtt: !s.showAtt}})}}
              iconType="arrowDown" >
              View attack list
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    )
  }

}
