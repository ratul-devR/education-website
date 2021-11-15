import { Flex, Box } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
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
import { useState } from "react";
import useToast from "../../../hooks/useToast";
import config from "../../../config";

const AddQuestionCsvModal = ({ category, setQuestions }) => {
  const [file, setFile] = useState();
  const [processing, setProcessing] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  async function addQuestionsUsingCSV() {
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category._id);
      const res = await fetch(`${config.serverURL}/get_admin/add_questions_from_csv`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const body = await res.json();

      if (res.ok) {
        setQuestions((pre) => [...pre, ...body.questions]);
        toast({ status: "success", description: body.msg });
        setProcessing(false);
        onClose();
      } else {
        toast({ status: "error", description: body.msg });
        setProcessing(false);
      }
    } catch (err) {
      setProcessing(false);
      toast({ status: "error", description: err.message });
    }
  }

  return (
    <Flex direction="column" display="inline-block" mb={10}>
      <Button onClick={onOpen} colorScheme="secondary" color="black">
        Upload Questions Using CSV File
      </Button>

      {/* the modal */}
      <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Question's to "{category.name}"</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w="full" p={5} border="1px solid" borderColor="gray.100" rounded={5}>
              <Text mb={3}>Upload CSV File</Text>
              <input onChange={(e) => setFile(e.target.files[0])} type="file" /* accept=".csv" */ />
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={addQuestionsUsingCSV}
              disabled={!file || processing}
              colorScheme="secondary"
              color="black"
            >
              {processing ? "Processing..." : "Upload"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default AddQuestionCsvModal;
