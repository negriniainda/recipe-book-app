// Exportar todos os tipos principais
export * from './recipe';
export * from './user';
export * from './planning';
export * from './community';
export * from './kitchen';
export * from './lists';
export * from './enums';
export * from './api';
export * from './store';

import * as React from 'react';

// Tipos utilitários globais
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimestampedEntity {
  createdAt: Date;
  updatedAt: Date;
}

export interface UserOwnedEntity extends BaseEntity {
  userId: string;
}

// Tipos para estados de loading
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface AsyncState<T> extends LoadingState {
  data?: T;
}

// Tipos para formulários
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
  required?: boolean;
}

export interface FormState<T extends Record<string, any>> {
  fields: {
    [K in keyof T]: FormField<T[K]>;
  };
  isValid: boolean;
  isSubmitting: boolean;
  submitError?: string;
}

// Tipos para navegação
export interface NavigationParams {
  [key: string]: any;
}

export interface ScreenProps<T extends NavigationParams = {}> {
  navigation: any; // será tipado com React Navigation
  route: {
    params?: T;
  };
}

// Tipos para componentes
export interface ComponentProps {
  testID?: string;
  style?: any;
  children?: React.ReactNode;
}

// Tipos para temas e estilos
export interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  placeholder: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeFonts {
  regular: {
    fontFamily: string;
    fontWeight: string;
  };
  medium: {
    fontFamily: string;
    fontWeight: string;
  };
  bold: {
    fontFamily: string;
    fontWeight: string;
  };
}

// Tipos para configurações de dispositivo
export interface DeviceInfo {
  platform: 'ios' | 'android';
  version: string;
  model: string;
  screenWidth: number;
  screenHeight: number;
  hasNotch: boolean;
  hasDynamicIsland: boolean;
}

// Tipos para permissões
export type Permission =
  | 'camera'
  | 'microphone'
  | 'photos'
  | 'notifications'
  | 'location'
  | 'contacts';

export interface PermissionStatus {
  permission: Permission;
  status: 'granted' | 'denied' | 'blocked' | 'unavailable';
}
