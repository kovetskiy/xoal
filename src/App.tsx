import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import moment from 'moment';
import React from 'react';
import { render } from 'react-dom';
import { Goals } from './Goals';
import { createGlobalStyle } from 'styled-components';

import ElectronStore from 'electron-store';
ElectronStore.initRenderer();

const App = () => {
  const customTheme = extendTheme({
    fonts: {
      body: 'Open Sans, serif',
      heading: 'Open Sans, serif',
    },
    config: {
      useSystemColorMode: false,
      initialColorMode: 'dark',
    },
  });

  const GlobalStyle = createGlobalStyle`
    ::-webkit-scrollbar {
        display: none;
    }`;

  console.log('aaa');

  const today = moment(new Date()).format('YYYY-MM-DD');
  return (
    <>
      <GlobalStyle />
      <ChakraProvider theme={customTheme}>
        <Goals today={today} />
      </ChakraProvider>
    </>
  );
};

const mainElement = document.createElement('div');
mainElement.setAttribute('id', 'root');
document.body.appendChild(mainElement);

render(<App />, mainElement);
