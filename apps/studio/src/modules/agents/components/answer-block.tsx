/**
 * @module AnswerBlock
 * Final synthesized answer from orchestrator
 */

import React from 'react';
import { Typography, theme } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { MarkdownViewer } from '@/components/markdown';

const { Text } = Typography;

interface AnswerBlockProps {
  content: string;
}

export function AnswerBlock({ content }: AnswerBlockProps) {
  const { token } = theme.useToken();

  return (
    <div style={{ marginTop: 8 }}>
      {/* Divider line */}
      <div
        style={{
          height: 1,
          background: token.colorBorderSecondary,
          margin: '12px 0',
        }}
      />

      {/* Answer content */}
      <div>
        <MarkdownViewer className="chat-message-markdown">
          {content}
        </MarkdownViewer>
      </div>
    </div>
  );
}
