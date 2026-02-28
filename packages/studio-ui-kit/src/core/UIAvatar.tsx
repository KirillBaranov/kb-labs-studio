/**
 * UIAvatar component - User avatar
 *
 * Wraps Ant Design Avatar.
 */

import * as React from 'react';
import { Avatar as AntAvatar, type AvatarProps as AntAvatarProps } from 'antd';

export interface UIAvatarProps extends AntAvatarProps {}

export function UIAvatar(props: UIAvatarProps) {
  return <AntAvatar {...props} />;
}

UIAvatar.Group = AntAvatar.Group;
