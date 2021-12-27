import { useState, useEffect } from "react";
import { IconButton, Button } from "@chakra-ui/button";
import { Flex, Text } from "@chakra-ui/layout";
import { FiEdit } from "react-icons/fi";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/modal";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";

export default function EditQuestionModal({ currentQuestion }) {
  const [state, setState] = useState(currentQuestion);
  const { isOpen, onOpen, onClose } = useDisclosure();

  function handleInputChange(e) {
    const { name, value } = e.target;
    setState((pre) => ({ ...pre, [name]: value }));
  }

  function onCloseModal() {
    setState(currentQuestion);
    onClose();
  }

  return (
    <Flex display="inline-block">
      <IconButton icon={<FiEdit />} onClick={onOpen} colorScheme="blue" />
      <Modal isOpen={isOpen} onClose={onCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Question</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex
              p={5}
              direction="column"
              mb={5}
              rounded={3}
              border="1px solid"
              borderColor="gray.100"
            >
              <Text mb={3} color="GrayText">
                Question
              </Text>
              <Input
                placeholder="Edit question"
                value={state.question}
                onChange={handleInputChange}
                name="question"
              />
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onCloseModal}>
              Close
            </Button>
            <Button colorScheme="blue">Save Changes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
