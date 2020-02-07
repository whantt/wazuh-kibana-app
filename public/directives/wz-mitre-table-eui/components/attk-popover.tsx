import React, { Component } from 'react';
import {
  EuiFacetButton,
  EuiFlexItem,
  EuiButtonEmpty,
  EuiToolTip
} from '@elastic/eui';
import { EuiPopover } from '@elastic/eui';

export class AttkPopover extends Component {
  state: {
    isOpen: boolean
  }
  props!: {
    name: string
    attacksCount: number
    showEmp: boolean
    style: object
  }
  
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    }
  }

  render() {
    const { name, attacksCount, showEmp, style} = this.props;
    const { isOpen } = this.state;
    return (
      (true) &&
      <EuiFlexItem  > 
        <EuiPopover
          button={
            <EuiToolTip position="top" content={name}>
            <div>
              {( showEmp || attacksCount > 0 ) && (<EuiFacetButton
                style={{maxWidth: "150px", width: "144px", flexWrap: "wrap", marginLeft: "4px", ...style, border: "1px solid rgba(213, 222, 252, 0.26)"}}
                onClick={() => this.setState({isOpen: !isOpen})}
                quantity={attacksCount}>
                  {name}
              </EuiFacetButton>)}
            </div></EuiToolTip>
          }
          isOpen={isOpen}
          closePopover={() => this.setState({isOpen: !isOpen})}
          >
            <EuiButtonEmpty 
              iconType='plusInCircle'
              onClick={() => alert(`This set a filter by ${name}`)} >
                Filter by this
              </EuiButtonEmpty><br />
            <EuiButtonEmpty 
              iconType='minusInCircle'
              onClick={() => alert(`This set a negative filter by ${name}`)} >
                Exclude result
              </EuiButtonEmpty><br />
            <EuiButtonEmpty 
              iconType='iInCircle'
              onClick={() => alert(`This Show the info of the ${name}`)} >
                Info
              </EuiButtonEmpty><br />
        </EuiPopover>
      </EuiFlexItem>
    )
  }

}