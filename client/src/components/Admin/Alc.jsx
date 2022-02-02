import { Button } from "@chakra-ui/button";
import { Text, Spinner, Divider, Link } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/hooks";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/modal";
import { Flex } from "@chakra-ui/layout";
import { Input } from "@chakra-ui/input";
import { IconButton } from "@chakra-ui/button";
import { MdDeleteOutline } from "react-icons/md";
import { useEffect, useState } from "react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/table";

import NoMessage from "../global/NoMessage";

import useToast from "../../hooks/useToast";
import config from "../../config";

// active learning concert and passive learning concert
const Alc = () => {
  const [{ background_music, passive_background_sound, passive_image, name }, setState] = useState({
    name: "",
    background_music: null,
    passive_image: null,
    passive_background_sound: null,
  });

  const [processing, setProcessing] = useState(false);

  const [items, setItems] = useState();
  const [loading, setLoading] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  function handleInputChange(event) {
    const { name, files, value } = event.target;
    if (name === "name") {
      setState((pre) => ({ ...pre, [name]: value }));
    } else {
      setState((pre) => ({ ...pre, [name]: files[0] }));
    }
  }

  async function uploadItem() {
    setProcessing(true);
    const formData = new FormData();

    formData.append("name", name);
    formData.append("background_music", background_music);
    formData.append("passive_background_sound", passive_background_sound);
    formData.append("passive_image", passive_image);

    try {
      const res = await fetch(`${config.serverURL}/active_learning_concert`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const body = await res.json();

      if (res.ok) {
        toast({ status: "success", description: body.msg });
        setItems((pre) => [...pre, body.item]);
        setProcessing(false);
        onClose();
      } else if (res.status === 400) {
        toast({ status: "warning", description: body.msg });
        setProcessing(false);
      } else {
        toast({ status: "error", description: body.msg });
        setProcessing(false);
      }
    } catch (err) {
      toast({ status: "error", description: err.message || "Error!" });
      setProcessing(false);
    }
  }

  async function fetchItems(abortController) {
    const res = await fetch(`${config.serverURL}/active_learning_concert`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: abortController.signal,
    });
    const body = await res.json();

    if (res.ok) {
      setItems(body.items);
    } else {
      toast({ status: "error", description: body.msg });
    }
  }

  async function deleteItem(itemId) {
    const confirmed = window.confirm(
      "Are you sure? You want to delete this item? It will be deleted permanently!"
    );

    if (confirmed) {
      try {
        const res = await fetch(`${config.serverURL}/active_learning_concert/${itemId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const body = await res.json();

        if (res.ok) {
          setItems(items.filter((item) => item._id !== body.item._id));
          toast({ status: "success", description: body.msg });
        } else if (res.status === 400) {
          toast({ status: "warning", description: body.msg });
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
    fetchItems(abortController);
    return () => abortController.abort();
  }, []);

  useEffect(() => {
    if (items) {
      setLoading(false);
    }
  }, [items]);

  if (loading) {
    return (
      <Flex w="full" h="full" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  }

  return (
    <div>
      <Button mb={10} colorScheme="secondary" onClick={onOpen} color="black">
        Add New Item
      </Button>

      {/* the modal to add a set of files */}
      <Modal onClose={onClose} isOpen={isOpen} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add new item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter the name of this item"
              onChange={handleInputChange}
              name="name"
              value={name}
              mb={5}
            />
            <Flex
              border="1px solid"
              p={3}
              borderRadius={5}
              borderColor="gray.100"
              direction="column"
              mb={5}
            >
              <Text mb={2}>Background Sound (Active Learning)</Text>
              <input
                name="background_music"
                onChange={handleInputChange}
                accept="audio/mpeg"
                type="file"
              />
            </Flex>

            <Divider my={10} />

            <Flex
              border="1px solid"
              p={3}
              borderRadius={5}
              borderColor="gray.100"
              direction="column"
              mb={5}
            >
              <Text mb={2}>Passive Learning Image</Text>
              <input
                name="passive_image"
                onChange={handleInputChange}
                accept="image/*"
                type="file"
              />
            </Flex>
            <Flex
              mb={3}
              border="1px solid"
              p={3}
              borderRadius={5}
              borderColor="gray.100"
              direction="column"
            >
              <Text mb={2}>Passive Learning Background-sound</Text>
              <input
                name="passive_background_sound"
                onChange={handleInputChange}
                accept="audio/mpeg"
                type="file"
              />
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} colorScheme="blue" mr={3}>
              Close
            </Button>
            <Button
              disabled={
                processing ||
                !passive_image ||
                !background_music ||
                !passive_background_sound ||
                !name
              }
              onClick={uploadItem}
              colorScheme="secondary"
              color="black"
            >
              {processing ? "Processing..." : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {items && items.length > 0 ? (
        <Table minW="700px" size="sm">
          <Thead>
            <Th>Name</Th>
            <Th>Active learning music</Th>
            <Th>Passive learning music</Th>
            <Th>Passive learning image</Th>
            <Th>Action</Th>
          </Thead>
          <Tbody>
            {items.map((item) => {
              return (
                <Tr key={item._id}>
                  <Td minW="200px">{item.name}</Td>
                  <Td>
                    <Link as="a" target="_blank" href={item.background_sound.url}>
                      {item.background_sound.name}
                    </Link>
                  </Td>
                  <Td>
                    <Link as="a" target="_blank" href={item.passive_background_sound.url}>
                      {item.passive_background_sound.name}
                    </Link>
                  </Td>
                  <Td>
                    <Link as="a" target="_blank" href={item.passive_image.url}>
                      {item.passive_image.name}
                    </Link>
                  </Td>
                  <Td>
                    <IconButton
                      onClick={() => deleteItem(item._id)}
                      icon={<MdDeleteOutline />}
                      colorScheme="red"
                    />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      ) : (
        <NoMessage message="No Items Found" />
      )}
    </div>
  );
};

export default Alc;
