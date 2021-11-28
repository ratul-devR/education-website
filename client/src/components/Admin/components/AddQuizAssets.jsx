import { Flex, Heading } from "@chakra-ui/layout";
import { Button, IconButton } from "@chakra-ui/button";
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
import { Text, Link } from "@chakra-ui/react";
import { useState } from "react";
import useToast from "../../../hooks/useToast";
import config from "../../../config";
import { Spinner } from "@chakra-ui/spinner";
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/table";
import { MdDeleteOutline } from "react-icons/md";

export default function AddQuizAssets({ quizAsset, loading, setQuizAsset }) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [{ background_sound, positive_sound, negative_sound }, setFiles] = useState({
    background_sound: "",
    positive_sound: "",
    negative_sound: "",
  });
  const [processing, setProcessing] = useState(false);
  const toast = useToast();
  // handle input change
  function handleInputChange(event) {
    const { name, files } = event.target;
    setFiles((pre) => ({ ...pre, [name]: files[0] }));
  }
  // for uploading and saving them
  async function uploadAndSaveAssets() {
    setProcessing(true);
    const formData = new FormData();
    formData.append("background_sound", background_sound);
    formData.append("positive_sound", positive_sound);
    formData.append("negative_sound", negative_sound);
    try {
      const res = await fetch(`${config.serverURL}/get_admin/upload_assets`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const body = await res.json();
      if (res.ok) {
        toast({ status: "success", description: body.msg });
        setProcessing(false);
        setQuizAsset(body.asset);
        onClose();
      } else {
        toast({ status: "error", description: body.msg });
        setProcessing(false);
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
      setProcessing(false);
    }
  }
  // for deleting an asset
  async function deleteAsset() {
    const confirmed = window.confirm("Are you sure? You want to delete this?");
    if (confirmed) {
      try {
        const res = await fetch(`${config.serverURL}/get_admin/delete_quiz_assets`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const body = await res.json();
        if (res.ok) {
          setQuizAsset();
          toast({ status: "success", description: body.msg });
        } else {
          toast({ status: "error", description: body.msg });
        }
      } catch (err) {
        toast({ status: "error", description: err.message });
      }
    }
  }
  if (loading) {
    return (
      <Flex w="full" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  }
  return (
    <Flex direction="column" mb={5} w="full" overflow="auto">
      <Heading color="primary" fontSize="2xl" fontWeight="normal" mb={3}>
        Quiz Assets
      </Heading>
      {quizAsset ? (
        <Table>
          <Thead>
            <Th>Background-Audio</Th>
            <Th>Positive Sound</Th>
            <Th>Negative Sound</Th>
            <Th>Action</Th>
          </Thead>
          <Tbody>
            <Tr>
              <Td>
                <Link as="a" target="_blank" href={quizAsset.background_sound.url}>
                  {quizAsset.background_sound.name}
                </Link>
              </Td>
              <Td>
                <Link as="a" target="_blank" href={quizAsset.positive_sound.url}>
                  {quizAsset.positive_sound.name}
                </Link>
              </Td>
              <Td>
                <Link as="a" target="_blank" href={quizAsset.negative_sound.url}>
                  {quizAsset.negative_sound.name}
                </Link>
              </Td>
              <Td>
                <IconButton onClick={deleteAsset} icon={<MdDeleteOutline />} colorScheme="red" />
              </Td>
            </Tr>
          </Tbody>
        </Table>
      ) : (
        <>
          <Button
            w="165px"
            onClick={onOpen}
            colorScheme="secondary"
            display="inline-block"
            color="black"
          >
            Add Quiz Assets
          </Button>
          <Modal scrollBehavior="inside" isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add Quiz Asset</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Flex
                  w="full"
                  p={5}
                  direction="column"
                  rounded={5}
                  mb={3}
                  border="1px solid"
                  borderColor="gray.100"
                >
                  <Text mb={3}>Quiz Background sound</Text>
                  <input onChange={handleInputChange} name="background_sound" type="file" />
                </Flex>
                <Flex
                  w="full"
                  p={5}
                  direction="column"
                  rounded={5}
                  mb={3}
                  border="1px solid"
                  borderColor="gray.100"
                >
                  <Text mb={3}>Quiz Positive sound</Text>
                  <input onChange={handleInputChange} name="positive_sound" type="file" />
                </Flex>
                <Flex
                  w="full"
                  p={5}
                  direction="column"
                  rounded={5}
                  border="1px solid"
                  borderColor="gray.100"
                >
                  <Text mb={3}>Quiz Negative sound</Text>
                  <input onChange={handleInputChange} name="negative_sound" type="file" />
                </Flex>
              </ModalBody>
              <ModalFooter>
                <Button onClick={onClose} colorScheme="blue" mr={3}>
                  Close
                </Button>
                <Button
                  disabled={!background_sound || !positive_sound || !negative_sound || processing}
                  colorScheme="secondary"
                  color="black"
                  onClick={uploadAndSaveAssets}
                >
                  {processing ? "Processing..." : "Upload and Save"}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </Flex>
  );
}
