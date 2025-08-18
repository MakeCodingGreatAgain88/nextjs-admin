import React from 'react';
import { Button, ButtonProps } from 'antd';

interface PermissionButtonProps extends ButtonProps {
  permissionCode: string;
  userPermissions?: any[];
  children: React.ReactNode;
}

/**
 * 权限按钮组件
 * 根据用户权限控制按钮是否显示
 */
export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permissionCode,
  userPermissions = [],
  children,
  ...buttonProps
}) => {
  // 检查用户是否有该权限
  const hasPermission = userPermissions.some((permission: any) => 
    permission.code === permissionCode || permission.action === permissionCode
  );

  // 如果没有权限，不渲染按钮
  if (!hasPermission) {
    return null;
  }

  return (
    <Button {...buttonProps}>
      {children}
    </Button>
  );
};

/**
 * 权限控制HOC
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permissionCode: string
) {
  return function PermissionWrapper(props: P & { userPermissions?: any[] }) {
    const { userPermissions = [], ...restProps } = props;
    
    const hasPermission = userPermissions.some((permission: any) => 
      permission.code === permissionCode || permission.action === permissionCode
    );

    if (!hasPermission) {
      return null;
    }

    return <WrappedComponent {...(restProps as P)} />;
  };
}
