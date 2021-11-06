import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { LightMode } from "@chakra-ui/color-mode";

const theme = extendTheme({
  useSystemColorMode: false,
  initialColorMode: "light",
  colors: {
    primary: "#FF218D",
    secondary: {
      500: "#FFD800",
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <LightMode>
        <Provider store={store}>
          <App />
        </Provider>
      </LightMode>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
