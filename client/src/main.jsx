import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  useSystemColorMode: false,
  initialColorMode: "dark",
  colors: {
    primary: "#FF218D",
    packageButton: {
      500: "#FF218D",
    },
    secondary: {
      500: "#FFD800",
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Provider store={store}>
        <App />
      </Provider>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
