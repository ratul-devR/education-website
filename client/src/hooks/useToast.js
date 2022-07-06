import { useToast as useChakraToast } from "@chakra-ui/react";

const useToast = (duration) => {
  const toast = useChakraToast({
    variant: "solid",
    position: "top-right",
    isClosable: true,
    duration: duration || 10000,
  });
  return toast;
};

export default useToast;
