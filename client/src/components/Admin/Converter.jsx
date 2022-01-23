import { useState, useEffect } from "react";
import { Flex, Heading } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { Text } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/hooks";
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
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/table";
import { AiOutlineDelete } from "react-icons/ai";
import { MdFileDownload } from "react-icons/md";
import useToast from "../../hooks/useToast";
import config from "../../config";
import NoMessage from "../global/NoMessage";

export default function Converter() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  function closeModal() {
    setFile(null);
    onClose();
  }

  async function fetchFiles(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/get_admin/getConvertedFiles`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortController.signal,
      });
      const body = await res.json();
      if (res.ok) {
        setFiles(body.files);
        setLoading(false);
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  useEffect(() => {
    const abortController = new AbortController();
    fetchFiles(abortController);
    return () => abortController.abort();
  }, []);

  if (loading) {
    return (
      <Flex w="full" h="full" direction="column" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Flex display="block">
      <Heading mb={3} fontWeight="normal" fontSize="2xl" color="primary">
        Converter
      </Heading>
      <Text mb={5} color="GrayText">
        Convert your CSV files into valid format
      </Text>

      <Button colorScheme="secondary" color="black" onClick={onOpen}>
        Convert File
      </Button>
      {/* the modal */}
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Convert file
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <Flex direction="column" p={5} rounded={5} border="1px solid" borderColor="gray.100">
              <Text color="GrayText" mb={3}>
                Select file
              </Text>
              <input type="file" accept="text/csv" onChange={(e) => setFile(e.target.files[0])} />
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeModal} mr={3}>
              cancel
            </Button>
            <Button disabled={!file} colorScheme="secondary" color="black">
              Convert
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {files && files.length ? (
        <Table colorScheme="gray" minW="750px">
          <Thead>
            <Th>File name</Th>
            <Th>Actions</Th>
          </Thead>
          <Tbody>
            {files.map((file) => {
              return (
                <Tr key={file._id}>
                  <Td>{file.name}</Td>
                  <Td>
                    <IconButton
                      as={a}
                      target="_blank"
                      href={file.url}
                      icon={<MdFileDownload />}
                      colorScheme="blue"
                    />
                    <IconButton icon={<AiOutlineDelete />} colorScheme="red" />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      ) : (
        <NoMessage message="No files found" />
      )}
    </Flex>
  );
}
