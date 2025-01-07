import React from 'react';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import AppNavigator from './navigation/AppNavigator';
import store from './redux/store';
import theme from './styles/theme';

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <AppNavigator />
      </PaperProvider>
    </Provider>
  );
}
