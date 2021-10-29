import { useToast as useChakraToast } from "@chakra-ui/react";

const useToast = () => {
  const toast = useChakraToast({ variant: "solid", position: "top", isClosable: true });
  return toast;
};

export default useToast;
