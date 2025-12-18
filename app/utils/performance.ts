import { InteractionManager } from 'react-native';

export const runAfterInteractions = (callback: () => void) => {
  InteractionManager.runAfterInteractions(callback);
};

export const createOptimizedComponent = <T extends object>(
  Component: React.ComponentType<T>
) => {
  return React.memo(Component);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};