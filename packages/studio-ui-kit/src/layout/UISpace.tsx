/**
 * UISpace component - Spacing container
 *
 * Wraps Ant Design Space for consistent spacing between elements.
 */

import * as React from 'react';
import { Space as AntSpace, type SpaceProps as AntSpaceProps } from 'antd';

export interface UISpaceProps extends AntSpaceProps {}

export function UISpace(props: UISpaceProps) {
  return <AntSpace {...props} />;
}

UISpace.Compact = AntSpace.Compact;
