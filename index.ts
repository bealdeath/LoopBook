// File: index.ts
import 'react-native-polyfill-globals/auto'; // Add this line at the top
import 'react-native-url-polyfill/auto';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
