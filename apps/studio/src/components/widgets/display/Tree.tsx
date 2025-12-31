/**
 * @module @kb-labs/studio-app/components/widgets/Tree
 * Tree widget - hierarchical structures
 */

import * as React from 'react';
import { Tree as AntTree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { Skeleton, EmptyState, ErrorState } from '../shared/index';
import type { BaseWidgetProps } from '../types';
import type { TreeNode, TreeData } from '@kb-labs/studio-contracts';

export interface TreeOptions {
  expanded?: string[];
  showIcons?: boolean;
  expandable?: boolean;
}

export interface TreeProps extends BaseWidgetProps<TreeData, TreeOptions> {
  onNodeClick?: (node: TreeNode) => void;
}

function convertToAntTreeData(node: TreeNode, showIcons?: boolean): DataNode {
  return {
    title: (
      <span>
        {showIcons && node.icon && <span style={{ marginRight: '0.5rem' }}>{node.icon}</span>}
        {node.label}
      </span>
    ),
    key: node.id,
    children: node.children?.map((child: TreeNode) => convertToAntTreeData(child, showIcons)),
  };
}

export function Tree({ data, loading, error, options, onNodeClick }: TreeProps) {
  const [expandedKeys, setExpandedKeys] = React.useState<React.Key[]>(
    options?.expanded || data?.expandedIds || []
  );

  if (loading) {
    return <Skeleton variant="text" rows={5} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!data || !data.nodes || data.nodes.length === 0) {
    return <EmptyState title="No data" description="No tree data available" />;
  }

  const showIcons = options?.showIcons !== false;
  const expandable = options?.expandable !== false;

  // Convert all root nodes to Ant Design format
  const treeData = data.nodes.map((node: TreeNode) => convertToAntTreeData(node, showIcons));

  const handleSelect = (selectedKeys: React.Key[], info: any) => {
    if (onNodeClick && info.node) {
      // Find node by key in all root nodes
      const findNode = (node: TreeNode, key: string): TreeNode | null => {
        if (node.id === key) {return node;}
        if (node.children) {
          for (const child of node.children) {
            const found = findNode(child, key);
            if (found) {return found;}
          }
        }
        return null;
      };

      let foundNode: TreeNode | null = null;
      for (const rootNode of data.nodes) {
        foundNode = findNode(rootNode, String(selectedKeys[0]));
        if (foundNode) break;
      }

      if (foundNode) {
        onNodeClick(foundNode);
      }
    }
  };

  return (
    <AntTree
      treeData={treeData}
      defaultExpandedKeys={expandedKeys}
      onExpand={setExpandedKeys}
      onSelect={handleSelect}
      selectable={!!onNodeClick}
      showIcon={showIcons}
      blockNode
    />
  );
}

