import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ChakraProvider, /* extendTheme */ CSSReset } from "@chakra-ui/react";

// const theme = extendTheme({
//   useSystemColorMode: false,
//   initialColorMode: "light",
//   colors: {
//     primary: "#FF218D",
//     secondary: {
//       500: "#FFD800",
//     },
//   },
// });

ReactDOM.render(
  <ChakraProvider /* theme={theme} */>
    <CSSReset />
    <Provider store={store}>
      <App />
    </Provider>
  </ChakraProvider>,
  document.getElementById("root")
);
