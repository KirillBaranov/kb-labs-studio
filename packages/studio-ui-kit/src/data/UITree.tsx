/**
 * UITree component - Tree view
 *
 * Wraps Ant Design Tree for hierarchical data display.
 */

import * as React from 'react';
import { Tree as AntTree, type TreeProps as AntTreeProps } from 'antd';

export interface UITreeProps extends AntTreeProps {}

export function UITree(props: UITreeProps) {
  return <AntTree {...props} />;
}

UITree.DirectoryTree = AntTree.DirectoryTree;
UITree.TreeNode = AntTree.TreeNode;
