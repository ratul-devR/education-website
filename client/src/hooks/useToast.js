import { useToast as useChakraToast } from "@chakra-ui/react";

const useToast = () => {
  const toast = useChakraToast({
    variant: "solid",
    position: "top-right",
    isClosable: true,
    duration: 1000,
  });
  return toast;
};

export default useToast;
