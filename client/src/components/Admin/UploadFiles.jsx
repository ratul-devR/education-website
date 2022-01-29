import { Flex, Heading } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Table, Thead, Tbody, Tr, Th, Td, Tfoot } from "@chakra-ui/table";
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
import { Button, IconButton } from "@chakra-ui/button";
import { Spinner } from "@chakra-ui/spinner";
import useToast from "../../hooks/useToast";
import config from "../../config";
import { AiOutlineDelete } from "react-icons/ai";
import { MdContentCopy } from "react-icons/md";
import { BiExpandAlt } from "react-icons/bi";
import CopyToClipboard from "react-copy-to-clipboard";
import NoMessage from "../global/NoMessage";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

export default function UploadFiles() {
  const [files, setFiles] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(30);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const indexOfLastFile = currentPage * questionsPerPage;
  const indexOfFirstFile = indexOfLastFile - questionsPerPage;
  const currentFiles = uploadedFiles.slice(indexOfFirstFile, indexOfLastFile);
  const totalPages = Math.ceil(uploadedFiles.length / questionsPerPage);

  const paginate = (number) => number >= 1 && number <= totalPages && setCurrentPage(number);

  async function uploadFiles() {
    setProcessing(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        formData.append("files", file);
      }
      const res = await fetch(`${config.serverURL}/get_admin/uploadFiles`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const body = await res.json();
      if (res.ok) {
        setUploadedFiles((pre) => [...body.files, ...pre]);
        toast({ status: "success", description: body.msg });
        setProcessing(false);
        closeModal();
      } else {
        toast({ status: "error", description: body.msg || "Unexpected Server side error" });
        setProcessing(false);
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
      setProcessing(false);
    }
  }

  function closeModal() {
    setFiles(null);
    setProcessing(false);
    onClose();
  }

  async function fetchFiles(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/get_admin/getFiles`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        credentials: "include",
      });
      const body = await res.json();
      if (res.ok) {
        setUploadedFiles(body.files);
        setLoading(false);
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  async function deleteFile(fileId) {
    const confirmed = window.confirm("Are you sure you want to delete that file?");
    if (confirmed) {
      try {
        const res = await fetch(`${config.serverURL}/get_admin/deleteFile/${fileId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const body = await res.json();
        if (res.ok) {
          toast({ status: "success", description: body.msg });
          setUploadedFiles(
            uploadedFiles.filter((uploadedFile) => uploadedFile._id !== body.file._id)
          );
        } else {
          toast({ status: "error", description: body.msg });
        }
      } catch (err) {
        toast({ status: "error", description: err.message });
      }
    }
  }

  useEffect(() => {
    const abortController = new AbortController();
    fetchFiles(abortController);
    return () => abortController.abort();
  }, []);

  if (loading) {
    return (
      <Flex w="full" h="full" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Flex direction="column">
      <Flex direction="column" mb={10}>
        <Heading color="primary" fontWeight="normal" fontSize="2xl" mb={3}>
          Upload audio files
        </Heading>
        <Text mb={3} color="GrayText">
          You can upload files here and copy the link to share or use
        </Text>
        <Button w="200px" onClick={onOpen} colorScheme="secondary" color="black">
          Upload Files
        </Button>
      </Flex>

      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Upload Files</ModalHeader>
          <ModalBody>
            <Flex p={5} border="1px solid" direction="column" borderColor="gray.100" rounded={5}>
              <Text color="GrayText" mb={3}>
                Select Files
              </Text>
              <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={closeModal}>
              Close
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={!files || (files && files.length === 0) || processing}
              colorScheme="blue"
            >
              {processing ? "Processing..." : "Upload"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {uploadedFiles.length > 0 ? (
        <Table>
          <Thead>
            <Th>File name</Th>
            <Th>Actions</Th>
          </Thead>
          <Tbody>
            {currentFiles &&
              currentFiles.map((uploadedFile, index) => {
                return (
                  <Tr key={index}>
                    <Td>{uploadedFile.name}</Td>
                    <Td>
                      <Flex gridGap={3}>
                        <IconButton
                          as="a"
                          href={uploadedFile.url}
                          target="_blank"
                          colorScheme="secondary"
                          color="black"
                          icon={<BiExpandAlt />}
                        />
                        <CopyToClipboard text={uploadedFile.url}>
                          <IconButton colorScheme="blue" icon={<MdContentCopy />} />
                        </CopyToClipboard>
                        <IconButton
                          onClick={() => deleteFile(uploadedFile._id)}
                          colorScheme="red"
                          icon={<AiOutlineDelete />}
                        />
                      </Flex>
                    </Td>
                  </Tr>
                );
              })}
          </Tbody>
          <Tfoot>
            <Tr>
              <Td>
                <Text color="GrayText">
                  ({currentPage} / {totalPages}) Pages
                </Text>
              </Td>
              <Td display="flex">
                <IconButton
                  onClick={() => paginate(currentPage - 1)}
                  colorScheme="blue"
                  mr={3}
                  icon={<AiOutlineLeft />}
                />
                <IconButton
                  onClick={() => paginate(currentPage + 1)}
                  colorScheme="blue"
                  icon={<AiOutlineRight />}
                />
              </Td>
            </Tr>
          </Tfoot>
        </Table>
      ) : (
        <NoMessage message="No files found" />
      )}
    </Flex>
  );
}
