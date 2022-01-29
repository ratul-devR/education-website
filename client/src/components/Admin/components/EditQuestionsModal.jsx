import { useState } from "react";
import { IconButton, Button } from "@chakra-ui/button";
import { Flex, Text } from "@chakra-ui/layout";
import { AiOutlineClockCircle } from "react-icons/ai";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/modal";
import { Input } from "@chakra-ui/input";
import { useDisclosure } from "@chakra-ui/hooks";
import useToast from "../../../hooks/useToast";
import config from "../../../config";

export default function EditQuestionsModal({ currentCategory }) {
  const [state, setState] = useState({ timeLimit: "" });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  function handleInputChange(e) {
    const { name, value } = e.target;
    setState((pre) => ({ ...pre, [name]: value }));
  }

  async function saveChanges() {
    try {
      const res = await fetch(
        `${config.serverURL}/get_admin/updateQuestions/${currentCategory._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...state }),
        }
      );
      const body = await res.json();
      if (res.ok) {
        toast({ status: "success", description: body.msg });
        closeModal();
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  function closeModal() {
    setState({});
    onClose();
  }

  return (
    <Flex direction="column" display="inline-block">
      <IconButton onClick={onOpen} colorScheme="blue" icon={<AiOutlineClockCircle />} />
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Make Global Edits In "{currentCategory.name}"</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex p={5} direction="column" border="1px solid" borderColor="gray.100" rounded={3}>
              <Text mb={3} color="GrayText">
                Time Limit
              </Text>
              <Input
                type="number"
                placeholder="Edit Time Limit"
                onChange={handleInputChange}
                name="timeLimit"
                value={state.timeLimit}
              />
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={closeModal}>
              Close
            </Button>
            <Button onClick={saveChanges} colorScheme="secondary" color="black">
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
