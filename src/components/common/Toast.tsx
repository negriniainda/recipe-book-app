import React, {useEffect} from 'react';
import {Snackbar, IconButton} from 'react-native-paper';
import {useAppSelector, useAppDispatch} from '@/store';
import {hideToast} from '@/store/slices/uiSlice';
import {theme} from '@/utils/theme';

const Toast: React.FC = () => {
  const dispatch = useAppDispatch();
  const {visible, message, type, duration} = useAppSelector(
    state => state.ui.toast,
  );

  const getToastColor = () => {
    switch (type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      default:
        return theme.colors.primary;
    }
  };

  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert';
      default:
        return 'information';
    }
  };

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, dispatch]);

  return (
    <Snackbar
      visible={visible}
      onDismiss={() => dispatch(hideToast())}
      duration={duration}
      style={{
        backgroundColor: getToastColor(),
      }}
      action={{
        label: '',
        onPress: () => dispatch(hideToast()),
        icon: () => (
          <IconButton
            icon="close"
            size={20}
            iconColor="#ffffff"
            onPress={() => dispatch(hideToast())}
          />
        ),
      }}>
      {message}
    </Snackbar>
  );
};

export default Toast;
