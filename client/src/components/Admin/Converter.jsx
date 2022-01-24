import { useState, useEffect } from "react";
import { Flex, Heading } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { Text } from "@chakra-ui/react";
import { Input } from "@chakra-ui/input";
import { Select } from "@chakra-ui/select";
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
  const [processing, setProcessing] = useState(false);
  const [file, setFile] = useState(null);
  const [{ type, timeLimit }, setInput] = useState({ type: "", timeLimit: "" });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  function closeModal() {
    setFile(null);
    setInput({ type: "", timeLimit: "" });
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

  async function handleClick() {
    setProcessing(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("timeLimit", timeLimit);
    try {
      const res = await fetch(`${config.serverURL}/get_admin/convertFile`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const body = await res.json();
      if (res.ok) {
        setFiles((pre) => [body.file, ...pre]);
        toast({ status: "success", description: "File converted successfully" });
        setProcessing(false);
        closeModal();
      } else {
        toast({ status: "error", description: body.msg });
        setProcessing(false);
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
      setProcessing(false);
    }
  }

  async function deleteFile(fileId) {
    try {
      const res = await fetch(`${config.serverURL}/get_admin/deleteConvertedFile/${fileId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const body = await res.json();
      if (res.ok) {
        setFiles(files.filter((file) => file._id !== body.file._id));
        toast({ status: "success", description: body.msg });
      } else {
        toast({ status: "success", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setInput((pre) => ({ ...pre, [name]: value }));
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
      <Text mb={3} color="GrayText">
        Convert your CSV files into valid format
      </Text>

      <Button mb={5} colorScheme="secondary" color="black" onClick={onOpen}>
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
            <Flex
              direction="column"
              mb={3}
              p={5}
              rounded={5}
              border="1px solid"
              borderColor="gray.100"
            >
              <Text color="GrayText" mb={3}>
                Select file
              </Text>
              <input type="file" accept="text/csv" onChange={(e) => setFile(e.target.files[0])} />
            </Flex>
            <Select
              placeholder="Type of questions"
              onChange={handleInputChange}
              name="type"
              value={type}
              mb={3}
            >
              <option value="mcq">Mcq</option>
              <option value="text">Text</option>
            </Select>
            <Input
              placeholder="Time limit for all the question"
              onChange={handleInputChange}
              type="number"
              name="timeLimit"
              value={timeLimit}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeModal} mr={3}>
              cancel
            </Button>
            <Button
              onClick={handleClick}
              disabled={!file || !timeLimit || !type || processing}
              colorScheme="secondary"
              color="black"
            >
              {processing ? "Processing..." : "Convert"}
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
                      as="a"
                      href={file.url}
                      icon={<MdFileDownload />}
                      colorScheme="blue"
                      mr={3}
                    />
                    <IconButton
                      onClick={() =>
                        window.confirm("Are you sure? you want to delete that file?") &&
                        deleteFile(file._id)
                      }
                      icon={<AiOutlineDelete />}
                      colorScheme="red"
                    />
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
